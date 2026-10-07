import {
  AWARDS,
  BRAND,
  computeAwards,
  computeGroupAwards,
  assignRoles,
  characterai,
  emptyStats,
  jackbox,
  kahoot,
  localParts,
  MASCOT_XP,
  SPARKS_EARN,
  ritualWindow,
  seeded,
  wordle,
  wrapped,
  type Group,
  type MemberStats,
} from '@app/shared';
import { all, get, json, now, run } from '../db.ts';
import { addCurrency, getGroup, getPost, id, insertMessage, members, postsForGroup, publicUser, updateMascot, getUser } from '../repo.ts';
import { toGroup } from '../realtime.ts';
import { readMedia, writeMedia } from '../media.ts';
import * as gm from '../ai/gm.ts';
import * as img from '../ai/image.ts';
import { push } from './notify.ts';
import { GameError } from './cards.ts';
import { addMemory, toDTO, visiblePosts } from './posts.ts';

/**
 * Weekly games run by the game master (spec §K). One game per ritual week, rotating:
 *   superlatives: named polls played like tbh / Gas (four friends, shuffle, skip), research/16 §5, 24 §1
 *   telephone:    photo → "Write a sentence" → AI "Draw" → "Describe" chains, albums revealed at the
 *                 end (Gartic Phone, research/16 §6)
 *   challenge:    one prompt everyone answers with a photo (Instagram "Add Yours", research/24 §7)
 *   guess_whose:  guess who took each photo (Wrapped Top Song Quiz, with Kahoot!'s four answer tiles,
 *                 reveal rule, top-5 leaderboard and podium, research/24 §2)
 * Lobby: Jackbox's VIP host, "Everybody's in", Room Code and Audience (research/16 §8).
 * Results: Spotify Wrapped Party awards (research/04 §1.6, research/15 §1e). Share: Wordle grid.
 * Every title comes from a deck; nothing here is user-visible prose of our own.
 */

export interface SuperlativesState {
  questions: { text: string; votes: Record<string, string> }[];
}
export interface TelephoneStep {
  kind: 'photo' | 'caption' | 'render' | 'guess';
  userId: string | null;
  postId?: string;
  media?: string;
  text?: string;
  at: number;
}
export interface TelephoneState {
  chains: { id: string; steps: TelephoneStep[] }[];
}
export interface ChallengeState {
  /** The "Add Yours" prompt: written by the AI game master, or typed by the first member to open it. */
  challenge: string | null;
  by?: string | null;
  entries: { userId: string; postId: string; at: number }[];
}
export interface GuessState {
  /** Frozen when the game closes; until then the quiz covers every photo of the week. */
  postIds: string[];
  guesses: Record<string, Record<string, string>>;
  podium?: { userId: string; score: number }[];
}

/** A Wrapped Party-style award. `emoji` and `line` stay empty (no sourced copy); kept for older readers. */
export interface GameResult {
  kind: 'poll' | 'award' | 'group';
  title: string;
  emoji: string;
  line: string;
  winners: string[];
  votes?: number;
}

export type GameState = (SuperlativesState | TelephoneState | ChallengeState | GuessState) & { intro: string; results?: GameResult[]; forgotten?: number[] };

type GameRow = { id: string; group_id: string; week_key: string; kind: gm.GameKind; state: string; created_at: number; closed_at: number | null };

/** Award ids from packages/shared/src/awards.ts → Wrapped Party names (deck). Unmapped awards are not shown. */
const AWARD_TITLES: Record<string, string> = {
  early_bird: wrapped.awards.earlyBird,
  first_to_post: wrapped.awards.firstToPost,
  most_sunsets: wrapped.awards.mostSunsets,
  crate_digger: wrapped.awards.crateDigger,
  onion_chopper: wrapped.awards.onionChopper,
  dinner_table: wrapped.awards.dinnerTable,
  documentarian: wrapped.awards.mostPhotos,
};
const GROUP_AWARD_TITLES: Record<string, string> = {
  copy_paste: wrapped.awards.copyAndPaste,
  chaos_crew: wrapped.awards.chaosCrew,
};

/* ───────────────────────── Memory (Character.ai: Story Memory / Facts / Memory Usage) ───────────────────────── */

export function memoryItems(groupId: string) {
  return all<{ id: string; text: string; source_post_id: string | null; added_by: string; created_at: number }>(
    'SELECT * FROM memory WHERE group_id = ? ORDER BY created_at DESC', groupId,
  ).map((m) => ({ id: m.id, text: m.text, sourcePostId: m.source_post_id, addedBy: m.added_by, createdAt: m.created_at }));
}

function lastClosedGame(groupId: string) {
  return get<GameRow>('SELECT * FROM games WHERE group_id = ? AND closed_at IS NOT NULL ORDER BY created_at DESC LIMIT 1', groupId);
}

/**
 * Facts: what the game master recorded on its own, i.e. the last game's results (spec §K "past
 * winners"). Members can delete a fact (spec §K); deleted indexes are kept in that game's state.
 */
export function memoryFacts(group: Group) {
  const last = lastClosedGame(group.id);
  if (!last) return [];
  const state = json.parse<{ results?: GameResult[]; forgotten?: number[] }>(last.state, {});
  const names = new Map(members(group.id).map((m) => [m.userId, m.user.name.split(' ')[0]]));
  return (state.results ?? [])
    .map((r, i) => ({ id: `${last.id}:${i}`, title: r.title, winners: r.winners, names: r.winners.map((w) => names.get(w)).filter(Boolean) as string[], i }))
    .filter((f) => !(state.forgotten ?? []).includes(f.i) && f.names.length)
    .slice(0, characterai.maxPins);
}

/** The exact wording the game master sees for a fact; "Pin" locks this wording into Story Memory. */
export const factWording = (f: { title: string; names: string[] }) => `${f.title}: ${f.names.join(', ')}`;

export function forgetFact(group: Group, factId: string) {
  const [gameId, idx] = factId.split(':');
  const row = get<GameRow>('SELECT * FROM games WHERE id = ? AND group_id = ?', gameId, group.id);
  if (!row) throw new GameError('not_found');
  const state = json.parse<GameState>(row.state, { intro: '' } as GameState);
  state.forgotten = [...new Set([...(state.forgotten ?? []), Number(idx)])];
  run('UPDATE games SET state = ? WHERE id = ?', json.str(state), row.id);
}

/** Pin a fact: its wording goes into Story Memory, where it stays after the next game (Character.ai "Pin"). */
export function pinFact(group: Group, factId: string, userId: string) {
  const f = memoryFacts(group).find((x) => x.id === factId);
  if (!f) throw new GameError('not_found');
  return addMemory(group.id, factWording(f), null, userId);
}

/** What fills the game master's memory: Story Memory (newest first, up to the pin limit) and Facts. */
export function memoryView(group: Group) {
  const ms = new Map(members(group.id).map((m) => [m.userId, publicUser(m.user)]));
  const items = memoryItems(group.id);
  return {
    mascot: group.mascot.name,
    cap: characterai.maxPins,
    story: items.map((m, i) => ({ ...m, addedBy: ms.get(m.addedBy) ?? null, inUse: i < characterai.maxPins })),
    facts: memoryFacts(group).map((f) => ({ id: f.id, title: f.title, winners: f.winners.map((w) => ms.get(w)).filter(Boolean) })),
  };
}

export function gmContext(group: Group): gm.GmContext {
  const wk = ritualWindow(now(), group).weekKey;
  return {
    groupName: group.name,
    mascotName: group.mascot.name,
    members: members(group.id).map((m) => m.user.name),
    story: memoryItems(group.id).slice(0, characterai.maxPins).map((m) => m.text),
    facts: memoryFacts(group).map(factWording),
    weekKey: wk,
    postsThisWeek: get<{ n: number }>('SELECT COUNT(*) AS n FROM posts WHERE group_id = ? AND week_key = ?', group.id, wk)?.n ?? 0,
  };
}

/* ───────────────────────── Lifecycle ───────────────────────── */

export function currentGame(group: Group) {
  const wk = ritualWindow(now(), group).weekKey;
  const row = get<GameRow>('SELECT * FROM games WHERE group_id = ? AND week_key = ? ORDER BY created_at DESC LIMIT 1', group.id, wk);
  return row ? { ...row, state: json.parse<GameState & Record<string, unknown>>(row.state, { intro: '' } as GameState & Record<string, unknown>) } : null;
}

export async function startWeeklyGame(group: Group, opts: { kind?: gm.GameKind; silent?: boolean } = {}) {
  const wk = ritualWindow(now(), group).weekKey;
  const existing = currentGame(group);
  if (existing) return existing;
  const kind = opts.kind ?? gm.gameKindFor(wk);
  const g = await gm.weeklyGame(gmContext(group), kind);
  let state: GameState;
  switch (kind) {
    case 'superlatives':
      state = { intro: g.intro, questions: g.questions.map((text) => ({ text, votes: {} })) };
      break;
    case 'telephone':
      state = { intro: g.intro, chains: [] };
      break;
    case 'challenge':
      state = { intro: g.intro, challenge: g.challenge, by: null, entries: [] };
      break;
    case 'guess_whose':
      state = { intro: g.intro, postIds: [], guesses: {} };
      break;
  }
  const gid = id('g');
  run('INSERT INTO games (id, group_id, week_key, kind, state, created_at) VALUES (?, ?, ?, ?, ?, ?)', gid, group.id, wk, kind, json.str(state), now());
  insertMessage({ groupId: group.id, userId: null, kind: 'gm', body: g.intro, refId: gid, meta: { gameKind: kind, challenge: g.challenge } });
  toGroup(group.id, { type: 'game', groupId: group.id, gameId: gid });
  if (!opts.silent) {
    for (const m of members(group.id)) {
      push({ userId: m.userId, groupId: group.id, kind: 'game_open', title: `${group.emoji} ${group.name}`, body: g.intro, refIds: [gid], url: `/g/${group.id}/game` });
    }
  }
  return currentGame(group)!;
}

function saveState(gameId: string, state: unknown) {
  run('UPDATE games SET state = ? WHERE id = ?', json.str(state), gameId);
}

function rewardPlay(group: Group, userId: string) {
  addCurrency(userId, { sparks: SPARKS_EARN.playGame });
  updateMascot(group.id, (m) => ({ ...m, xp: m.xp + MASCOT_XP.game }));
}

function openGame(group: Group, gameId: string, kind: gm.GameKind) {
  const g = currentGame(group);
  if (!g || g.id !== gameId || g.kind !== kind || g.closed_at) throw new GameError('not_open');
  return g;
}

/* ───────────────────────── tbh / Gas poll ───────────────────────── */

export function vote(group: Group, userId: string, gameId: string, question: number, choiceUserId: string) {
  const g = openGame(group, gameId, 'superlatives');
  const s = g.state as unknown as SuperlativesState & { intro: string };
  if (!s.questions[question]) throw new GameError('bad_question');
  if (choiceUserId === userId) throw new GameError('not_yourself');
  if (!members(group.id).some((m) => m.userId === choiceUserId)) throw new GameError('not_member');
  const first = !s.questions.some((q) => userId in q.votes);
  s.questions[question].votes[userId] = choiceUserId;
  saveState(gameId, s);
  if (first) rewardPlay(group, userId);
  toGroup(group.id, { type: 'game', groupId: group.id, gameId });
  return s;
}

/* ───────────────────────── Gartic Phone telephone ───────────────────────── */

/**
 * Gartic Phone: "Write a sentence" → "Draw" → "Describe" → "Draw" → … Here a chain starts from a photo;
 * every text step (the first sentence, then each description) is drawn by the AI, and each member plays a
 * chain once, so a chain ends when it has passed through the whole group.
 */
export async function telephone(group: Group, userId: string, gameId: string, input: { chainId?: string; kind: 'photo' | 'caption' | 'guess'; postId?: string; text?: string }) {
  const g = openGame(group, gameId, 'telephone');
  const s = g.state as unknown as TelephoneState & { intro: string };
  let chain = input.chainId ? s.chains.find((c) => c.id === input.chainId) : undefined;
  if (input.kind === 'photo') {
    const post = input.postId ? getPost(input.postId) : null;
    if (!post || post.groupId !== group.id) throw new GameError('bad_post');
    chain = { id: id('ch'), steps: [{ kind: 'photo', userId, postId: post.id, media: post.media.thumb ?? post.media.main, at: now() }] };
    s.chains.push(chain);
  } else {
    if (!chain) throw new GameError('no_chain');
    const last = chain.steps[chain.steps.length - 1];
    if (chain.steps.some((st) => st.userId === userId)) throw new GameError('already_played');
    const want = last.kind === 'photo' ? 'caption' : last.kind === 'render' ? 'guess' : null;
    if (input.kind !== want) throw new GameError('wrong_turn');
    const text = (input.text ?? '').trim().slice(0, 120);
    if (!text) throw new GameError('empty');
    chain.steps.push({ kind: input.kind, userId, text, at: now() });
    const seedStep = chain.steps.find((st) => st.kind === 'photo');
    const seed = seedStep?.postId ? getPost(seedStep.postId) : null;
    const res = await img.telephoneRender(text, seed ? readMedia(seed.media.main) : null);
    img.recordUsage(userId, res.costUsd);
    chain.steps.push({ kind: 'render', userId: null, media: writeMedia(res.image, 'jpg').url, text: res.generator, at: now() });
  }
  saveState(gameId, s);
  rewardPlay(group, userId);
  toGroup(group.id, { type: 'game', groupId: group.id, gameId });
  return chain;
}

/* ───────────────────────── Instagram "Add Yours" ───────────────────────── */

export function setChallengePrompt(group: Group, userId: string, gameId: string, prompt: string) {
  const g = openGame(group, gameId, 'challenge');
  const s = g.state as unknown as ChallengeState & { intro: string };
  if (s.challenge) throw new GameError('already_set');
  const text = prompt.trim().slice(0, 140);
  if (!text) throw new GameError('empty');
  s.challenge = text;
  s.by = userId;
  saveState(gameId, s);
  toGroup(group.id, { type: 'game', groupId: group.id, gameId });
  return s;
}

export function enterChallenge(group: Group, userId: string, gameId: string, postId: string) {
  const g = openGame(group, gameId, 'challenge');
  const s = g.state as unknown as ChallengeState & { intro: string };
  if (!s.challenge) throw new GameError('no_prompt');
  const post = getPost(postId);
  if (!post || post.userId !== userId || post.groupId !== group.id) throw new GameError('bad_post');
  s.entries = s.entries.filter((e) => e.userId !== userId).concat({ userId, postId, at: now() });
  saveState(gameId, s);
  rewardPlay(group, userId);
  toGroup(group.id, { type: 'game', groupId: group.id, gameId });
  return s;
}

/* ───────────────────────── Guess whose (Top Song Quiz × Kahoot!) ───────────────────────── */

function quizPostIds(group: Group, g: { id: string; week_key: string; closed_at: number | null; state: unknown }) {
  const s = g.state as GuessState;
  if (g.closed_at && s.postIds.length) return s.postIds;
  const rng = seeded(g.id);
  return postsForGroup(group.id, { weekKey: g.week_key })
    .map((p) => p.id)
    .sort()
    .map((pid) => [pid, rng()] as const)
    .sort((a, b) => a[1] - b[1])
    .map(([pid]) => pid);
}

/** Kahoot! offers four answers: the author and three other members, in a seeded order. */
function quizOptions(gameId: string, postId: string, authorId: string, memberIds: string[]) {
  const rng = seeded(`${gameId}:${postId}`);
  const others = memberIds.filter((m) => m !== authorId).map((m) => [m, rng()] as const).sort((a, b) => a[1] - b[1]).map(([m]) => m);
  return [authorId, ...others.slice(0, kahoot.tiles.length - 1)].map((m) => [m, rng()] as const).sort((a, b) => a[1] - b[1]).map(([m]) => m);
}

/** Kahoot!: "When time is up or all players have answered, the correct answer is shown" [V]. */
function revealedAuthors(postIds: string[], authors: Map<string, string | undefined>, guesses: GuessState['guesses'], memberIds: string[], closed: boolean) {
  const out: Record<string, string> = {};
  for (const pid of postIds) {
    const author = authors.get(pid);
    if (!author) continue;
    const players = memberIds.filter((m) => m !== author);
    if (closed || players.every((m) => guesses[m]?.[pid])) out[pid] = author;
  }
  return out;
}

function quizScores(revealed: Record<string, string>, guesses: GuessState['guesses']) {
  return Object.entries(guesses)
    .map(([userId, gs]) => ({ userId, score: Object.entries(gs).filter(([pid, guess]) => revealed[pid] && revealed[pid] === guess).length }))
    .sort((a, b) => b.score - a.score);
}

export function guessWhose(group: Group, userId: string, gameId: string, postId: string, guessUserId: string) {
  const g = openGame(group, gameId, 'guess_whose');
  const s = g.state as unknown as GuessState & { intro: string };
  if (!quizPostIds(group, g).includes(postId)) throw new GameError('bad_post');
  const post = getPost(postId);
  if (!post || post.userId === userId) throw new GameError('own_post');
  if (s.guesses[userId]?.[postId]) throw new GameError('already_answered');
  if (!quizOptions(g.id, postId, post.userId, members(group.id).map((m) => m.userId)).includes(guessUserId)) throw new GameError('bad_option');
  const first = !s.guesses[userId];
  s.guesses[userId] = { ...(s.guesses[userId] ?? {}), [postId]: guessUserId };
  saveState(gameId, s);
  if (first) rewardPlay(group, userId);
  toGroup(group.id, { type: 'game', groupId: group.id, gameId });
  return s;
}

/* ───────────────────────── Jackbox lobby ───────────────────────── */

function playedIds(kind: gm.GameKind, state: Record<string, unknown>) {
  const ids = new Set<string>();
  if (kind === 'superlatives') for (const q of (state as unknown as SuperlativesState).questions ?? []) Object.keys(q.votes).forEach((u) => ids.add(u));
  if (kind === 'telephone') for (const c of (state as unknown as TelephoneState).chains ?? []) c.steps.forEach((st) => st.userId && ids.add(st.userId));
  if (kind === 'challenge') {
    const s = state as unknown as ChallengeState;
    (s.entries ?? []).forEach((e) => ids.add(e.userId));
    if (s.by) ids.add(s.by);
  }
  if (kind === 'guess_whose') Object.keys((state as unknown as GuessState).guesses ?? {}).forEach((u) => ids.add(u));
  return ids;
}

/** The VIP (Jackbox's host role; spec §K "keep the group admin as host") taps "Everybody's in" to end the round now. */
export function vipClose(group: Group, userId: string, gameId: string) {
  const g = currentGame(group);
  if (!g || g.id !== gameId || g.closed_at) throw new GameError('not_open');
  const m = members(group.id).find((x) => x.userId === userId);
  if (m?.role !== 'admin') throw new GameError('vip_only');
  const res = closeGame(group, gameId);
  toGroup(group.id, { type: 'game', groupId: group.id, gameId });
  return res;
}

/* ───────────────────────── View ───────────────────────── */

/** Public view of the current game for a member. Hidden until the reveal: poll tallies, telephone albums, quiz authors. */
export function gameView(group: Group, viewerId: string) {
  const g = currentGame(group);
  if (!g) return null;
  const ms = members(group.id);
  const memberIds = ms.map((m) => m.userId);
  const users = ms.map((m) => publicUser(m.user));
  const closed = Boolean(g.closed_at);
  const vip = ms.filter((m) => m.role === 'admin').map((m) => m.userId);
  const seats = [...ms].sort((a, b) => Number(b.role === 'admin') - Number(a.role === 'admin') || a.joinedAt - b.joinedAt).map((m) => m.userId);
  const lobby = {
    roomCode: group.inviteCode,
    vip,
    players: seats.slice(0, jackbox.maxPlayers),
    audience: seats.slice(jackbox.maxPlayers),
    played: [...playedIds(g.kind, g.state)],
  };
  const results = (g.state.results as GameResult[] | undefined) ?? null;
  const base = { id: g.id, kind: g.kind, weekKey: g.week_key, closed, intro: g.state.intro, users, lobby, results, share: closed && (g.kind === 'superlatives' || g.kind === 'guess_whose') };

  if (g.kind === 'guess_whose') {
    const s = g.state as unknown as GuessState;
    const postIds = quizPostIds(group, g);
    const authors = new Map(postIds.map((pid) => [pid, getPost(pid)?.userId]));
    const revealed = revealedAuthors(postIds, authors, s.guesses ?? {}, memberIds, closed);
    const dtos = toDTO(visiblePosts(group, viewerId).filter((p) => postIds.includes(p.id)), viewerId)
      .sort((a, b) => postIds.indexOf(a.id) - postIds.indexOf(b.id))
      .map((p) => ({
        ...(revealed[p.id] || p.user.id === viewerId ? p : { ...p, user: { id: '', name: '', avatar: null, color: '#8E8E93', plus: false } }),
        options: quizOptions(g.id, p.id, authors.get(p.id) ?? p.user.id, memberIds),
        answer: revealed[p.id] ?? null,
      }));
    // Kahoot!: the leaderboard comes after a question's answer is shown, so nothing is ranked before the first reveal.
    const scores = Object.keys(revealed).length ? quizScores(revealed, s.guesses ?? {}) : [];
    return {
      ...base,
      posts: dtos,
      myGuesses: s.guesses?.[viewerId] ?? {},
      leaderboard: scores.slice(0, kahoot.leaderboard),
      me: scores.findIndex((x) => x.userId === viewerId) >= 0 ? { place: scores.findIndex((x) => x.userId === viewerId) + 1, score: scores.find((x) => x.userId === viewerId)!.score } : null,
      podium: s.podium ?? null,
    };
  }
  if (g.kind === 'challenge') {
    const s = g.state as unknown as ChallengeState;
    const posts = new Map(toDTO(visiblePosts(group, viewerId).filter((p) => s.entries.some((e) => e.postId === p.id)), viewerId).map((p) => [p.id, p]));
    return {
      ...base,
      challenge: s.challenge ?? null,
      by: s.by ?? null,
      // Add Yours: responses run "from the first person who answered to the most recent".
      entries: [...s.entries].sort((a, b) => a.at - b.at).map((e) => ({ ...e, post: posts.get(e.postId) ?? null })),
    };
  }
  if (g.kind === 'telephone') {
    const s = g.state as unknown as TelephoneState;
    // Gartic Phone: a player only sees the step handed to them; whole albums are revealed at the end.
    const tasks = s.chains
      .filter((c) => !c.steps.some((st) => st.userId === viewerId))
      .map((c) => ({ chain: c, last: c.steps[c.steps.length - 1] }))
      .filter(({ last }) => last.kind === 'photo' || last.kind === 'render')
      .map(({ chain, last }) => ({ chainId: chain.id, step: last.kind === 'photo' ? ('caption' as const) : ('guess' as const), media: last.media ?? null }));
    return { ...base, tasks, chainCount: s.chains.length, chains: closed ? s.chains : null };
  }
  const s = g.state as unknown as SuperlativesState;
  return {
    ...base,
    questions: s.questions.map((q) => ({ text: q.text, myVote: q.votes[viewerId] ?? null, voters: Object.keys(q.votes).length, tally: closed ? tally(q.votes) : null })),
  };
}

function tally(votes: Record<string, string>) {
  const t: Record<string, number> = {};
  for (const v of Object.values(votes)) t[v] = (t[v] ?? 0) + 1;
  return t;
}

/* ───────────────────────── Closing: Wrapped Party awards ───────────────────────── */

export function statsFor(group: Group, weekKey?: string, sinceMs?: number): { stats: MemberStats[]; sameDayShare: number; spreadDays: number } {
  const ms = members(group.id);
  const posts = postsForGroup(group.id, weekKey ? { weekKey } : sinceMs ? { since: sinceMs } : {});
  const stats = new Map(ms.map((m) => [m.userId, emptyStats(m.userId)]));
  const days = new Map<string, Set<string>>();
  const byWeek = new Map<string, typeof posts>();
  for (const p of posts) byWeek.set(p.weekKey, [...(byWeek.get(p.weekKey) ?? []), p]);
  for (const list of byWeek.values()) {
    const first = [...list].sort((a, b) => a.createdAt - b.createdAt)[0];
    if (first) stats.get(first.userId) && stats.get(first.userId)!.firstPosts++;
  }
  for (const p of posts) {
    const s = stats.get(p.userId);
    if (!s) continue;
    const lp = localParts(p.createdAt, group.timeZone);
    s.posts++;
    if (p.ritual) s.ritualPosts++;
    if (lp.hour >= 5 && lp.hour < 8) s.sunrisePosts++;
    if (lp.hour >= 0 && lp.hour < 4) s.latePosts++;
    if ((p.media as { golden?: boolean }).golden) s.goldenHourPosts++;
    if (p.kind === 'rewind') s.rewindPosts++;
    if (p.kind === 'dual') s.dualPosts++;
    if (p.media.live) s.livePosts++;
    if (p.media.voice) s.voicePosts++;
    if (p.caption) {
      s.captions++;
      s.captionWords += p.caption.split(/\s+/).length;
    }
    const dk = `${lp.year}-${lp.month}-${lp.day}`;
    days.set(dk, (days.get(dk) ?? new Set()).add(p.userId));
  }
  for (const r of all<{ user_id: string; n: number }>(
    `SELECT r.user_id, COUNT(*) AS n FROM reactions r JOIN posts p ON p.id = r.post_id WHERE p.group_id = ? ${weekKey ? 'AND p.week_key = ?' : ''} GROUP BY r.user_id`,
    ...(weekKey ? [group.id, weekKey] : [group.id]),
  )) {
    const s = stats.get(r.user_id);
    if (s) s.reactionsGiven = r.n;
  }
  for (const c of all<{ owner_id: string; n: number }>('SELECT owner_id, COUNT(*) AS n FROM cards WHERE group_id = ? GROUP BY owner_id', group.id)) {
    const s = stats.get(c.owner_id);
    if (s) s.cards = c.n;
  }
  for (const i of all<{ invited_by: string; n: number }>('SELECT invited_by, COUNT(*) AS n FROM memberships WHERE group_id = ? AND invited_by IS NOT NULL GROUP BY invited_by', group.id)) {
    const s = stats.get(i.invited_by);
    if (s) s.invites = i.n;
  }
  const maxDay = Math.max(0, ...[...days.values()].map((d) => d.size));
  const posters = new Set(posts.map((p) => p.userId)).size;
  const weekdays = new Set(posts.map((p) => localParts(p.createdAt, group.timeZone).weekday));
  return { stats: [...stats.values()], sameDayShare: posters ? maxDay / posters : 0, spreadDays: weekdays.size };
}

/**
 * Results (Wrapped Party): each poll question's winner, then the week's stat awards and group awards,
 * all titled from the wrapped deck. "Awards update dynamically … no two sessions are ever the same":
 * the selection is seeded per game. Guess whose also ends on Kahoot!'s podium.
 */
export function closeGame(group: Group, gameId: string) {
  const row = get<GameRow>('SELECT * FROM games WHERE id = ?', gameId);
  if (!row || row.closed_at) return null;
  const state = json.parse<Record<string, unknown>>(row.state, {});
  const ms = members(group.id);
  const { stats, sameDayShare, spreadDays } = statsFor(group, row.week_key);
  const results: GameResult[] = [];
  if (row.kind === 'superlatives') {
    for (const q of (state as unknown as SuperlativesState).questions) {
      const t = tally(q.votes);
      const top = Math.max(0, ...Object.values(t));
      if (top > 0) results.push({ kind: 'poll', title: q.text, emoji: '', line: '', winners: Object.keys(t).filter((k) => t[k] === top), votes: top });
    }
  }
  for (const a of computeAwards(stats, `${gameId}:${row.week_key}`, AWARDS.length)) {
    if (AWARD_TITLES[a.id]) results.push({ kind: 'award', title: AWARD_TITLES[a.id], emoji: '', line: '', winners: a.winners });
  }
  for (const a of computeGroupAwards(stats, { sameDayShare, spreadDays })) {
    if (GROUP_AWARD_TITLES[a.id]) results.push({ kind: 'group', title: GROUP_AWARD_TITLES[a.id], emoji: '', line: '', winners: ms.map((m) => m.userId) });
  }
  if (row.kind === 'guess_whose') {
    const s = state as unknown as GuessState;
    const g = { id: row.id, week_key: row.week_key, closed_at: null, state };
    s.postIds = quizPostIds(group, g);
    const authors = new Map(s.postIds.map((pid) => [pid, getPost(pid)?.userId]));
    const revealed = revealedAuthors(s.postIds, authors, s.guesses ?? {}, ms.map((m) => m.userId), true);
    s.podium = quizScores(revealed, s.guesses ?? {}).filter((x) => x.score > 0).slice(0, kahoot.podium);
  }
  state.results = results;
  run('UPDATE games SET state = ?, closed_at = ? WHERE id = ?', json.str(state), now(), gameId);
  return { results };
}

/* ───────────────────────── Wordle share grid ───────────────────────── */

/**
 * Wordle's spoiler-free share text: "roll. N a/b", a blank line, rows of 5 squares; then the spec's
 * watermark link (spec §K). 🟩 right · 🟨 present elsewhere · ⬛/⬜ absent (dark/light theme).
 * Poll: 🟩 your pick won the question, 🟨 your pick got other votes, absent otherwise.
 * Quiz: 🟩 right author, absent wrong. Telephone and Add Yours have no right answers, so no grid.
 */
export function shareGrid(group: Group, gameId: string, userId: string, dark = true) {
  const row = get<GameRow>('SELECT * FROM games WHERE id = ? AND group_id = ?', gameId, group.id);
  if (!row) throw new GameError('not_found');
  if (!row.closed_at) return null;
  const state = json.parse<Record<string, unknown>>(row.state, {});
  const num = all<{ id: string }>('SELECT id FROM games WHERE group_id = ? ORDER BY created_at', group.id).findIndex((g) => g.id === gameId) + 1;
  const absent = dark ? wordle.dark : wordle.light;
  let tiles: string[] = [];
  let total = 0;
  if (row.kind === 'guess_whose') {
    const s = state as unknown as GuessState;
    const mine = s.guesses?.[userId] ?? {};
    const answered = s.postIds.filter((pid) => mine[pid]);
    tiles = answered.map((pid) => (getPost(pid)?.userId === mine[pid] ? wordle.green : absent));
    total = s.postIds.filter((pid) => getPost(pid)?.userId !== userId).length;
  } else if (row.kind === 'superlatives') {
    const qs = (state as unknown as SuperlativesState).questions;
    total = qs.length;
    tiles = qs
      .filter((q) => q.votes[userId])
      .map((q) => {
        const t = tally(q.votes);
        const top = Math.max(0, ...Object.values(t));
        const pick = q.votes[userId];
        return t[pick] === top ? wordle.green : t[pick] > 1 ? wordle.yellow : absent;
      });
  } else return null;
  const rows: string[] = [];
  for (let i = 0; i < tiles.length; i += wordle.rowLength) rows.push(tiles.slice(i, i + wordle.rowLength).join(''));
  const score = wordle.score(tiles.filter((t) => t === wordle.green).length, total);
  return [wordle.header(BRAND.name, num, score), '', ...rows, '', `${BRAND.domain}/j/${group.inviteCode}`].join('\n');
}

/* ───────────────────────── Chat with the game master ───────────────────────── */

export async function maybeGmReply(groupId: string, fromUserId: string, text: string) {
  const group = getGroup(groupId);
  if (!group) return;
  const mention = new RegExp(`@?${group.mascot.name}\\b`, 'i');
  if (!mention.test(text)) return;
  const from = getUser(fromUserId);
  const reply = await gm.reply(gmContext(group), from?.name ?? '', text);
  const msg = insertMessage({ groupId, userId: null, kind: 'gm', body: reply });
  toGroup(groupId, { type: 'message', groupId, messageId: msg.id });
}

/** Wrapped Clubs roles, named and described by the wrapped deck (newsroom wording, nouns substituted). */
export function weeklyRoles(group: Group, weekKey?: string) {
  const { stats } = statsFor(group, weekKey);
  const roles = assignRoles(stats);
  return Object.fromEntries(
    Object.entries(roles).map(([u, r]) => {
      const deck = wrapped.roles.find((x) => x.id === r.id);
      return [u, { id: r.id, title: deck?.name ?? r.id, line: deck?.line ?? '' }];
    }),
  );
}
