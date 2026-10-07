import {
  computeAwards,
  computeGroupAwards,
  assignRoles,
  emptyStats,
  localParts,
  MASCOT_XP,
  SPARKS_EARN,
  ritualWindow,
  seeded,
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
import { toDTO, visiblePosts } from './posts.ts';

/**
 * Weekly games run by the game master (spec §K). One game per ritual week, rotating:
 *   superlatives — positive, named polls (tbh/Gas de-anonymised), Wrapped Party-style results
 *   telephone    — photo → caption → AI render → guess, with a replay (Gartic Phone)
 *   challenge    — one weekly photo challenge (BeReal challenges, weekly)
 *   guess_whose  — guess who took each photo (Wrapped Top Song Quiz)
 * Results share as a spoiler-free emoji grid (Wordle).
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
  challenge: string;
  entries: { userId: string; postId: string; at: number }[];
}
export interface GuessState {
  postIds: string[];
  guesses: Record<string, Record<string, string>>;
}

export type GameState = (SuperlativesState | TelephoneState | ChallengeState | GuessState) & { intro: string };

type GameRow = { id: string; group_id: string; week_key: string; kind: gm.GameKind; state: string; created_at: number; closed_at: number | null };

export function memoryItems(groupId: string) {
  return all<{ id: string; text: string; source_post_id: string | null; added_by: string; created_at: number }>(
    'SELECT * FROM memory WHERE group_id = ? ORDER BY created_at DESC', groupId,
  ).map((m) => ({ id: m.id, text: m.text, sourcePostId: m.source_post_id, addedBy: m.added_by, createdAt: m.created_at }));
}

export function gmContext(group: Group): gm.GmContext {
  const wk = ritualWindow(now(), group).weekKey;
  const last = get<{ state: string }>("SELECT state FROM games WHERE group_id = ? AND closed_at IS NOT NULL ORDER BY created_at DESC LIMIT 1", group.id);
  const lastState = json.parse<{ results?: { winners: string[]; title: string }[] }>(last?.state, {});
  const names = new Map(members(group.id).map((m) => [m.userId, m.user.name]));
  return {
    groupName: group.name,
    mascotName: group.mascot.name,
    members: [...names.values()],
    memory: memoryItems(group.id).slice(0, 20).map((m) => m.text),
    pastWinners: (lastState.results ?? []).slice(0, 3).map((r) => `${r.winners.map((w) => (names.get(w) ?? 'someone').split(' ')[0]).join(' & ')} took “${r.title.replace(/[?.!]$/, '')}”`),
    weekKey: wk,
    postsThisWeek: get<{ n: number }>('SELECT COUNT(*) AS n FROM posts WHERE group_id = ? AND week_key = ?', group.id, wk)?.n ?? 0,
  };
}

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
  const ctx = gmContext(group);
  const g = await gm.weeklyGame(ctx, kind);
  let state: GameState;
  switch (kind) {
    case 'superlatives':
      state = { intro: g.intro, questions: g.questions.map((text) => ({ text, votes: {} })) };
      break;
    case 'telephone':
      state = { intro: g.intro, chains: [] };
      break;
    case 'challenge':
      state = { intro: g.intro, challenge: g.challenge ?? gm.CHALLENGE_BANK[0], entries: [] };
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
      push({ userId: m.userId, groupId: group.id, kind: 'game_open', title: `${group.mascot.name} · ${group.name}`, body: g.intro, refIds: [gid], url: `/g/${group.id}/game` });
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

export function vote(group: Group, userId: string, gameId: string, question: number, choiceUserId: string) {
  const g = currentGame(group);
  if (!g || g.id !== gameId || g.kind !== 'superlatives' || g.closed_at) throw new GameError('not_open');
  const s = g.state as unknown as SuperlativesState & { intro: string };
  if (!s.questions[question]) throw new GameError('bad_question');
  if (!members(group.id).some((m) => m.userId === choiceUserId)) throw new GameError('not_member');
  const first = !Object.values(s.questions).some((q) => userId in q.votes);
  s.questions[question].votes[userId] = choiceUserId;
  saveState(gameId, s);
  if (first) rewardPlay(group, userId);
  toGroup(group.id, { type: 'game', groupId: group.id, gameId });
  return s;
}

export async function telephone(group: Group, userId: string, gameId: string, input: { chainId?: string; kind: 'photo' | 'caption' | 'guess'; postId?: string; text?: string }) {
  const g = currentGame(group);
  if (!g || g.id !== gameId || g.kind !== 'telephone' || g.closed_at) throw new GameError('not_open');
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
    if (chain.steps.some((st) => st.userId === userId)) throw new GameError('already_played', 'Someone else takes the next turn');
    if (input.kind === 'caption') {
      if (last.kind !== 'photo' && last.kind !== 'guess') throw new GameError('wrong_turn');
      const text = (input.text ?? '').trim().slice(0, 120);
      if (!text) throw new GameError('empty');
      chain.steps.push({ kind: 'caption', userId, text, at: now() });
      const seedPost = chain.steps.find((st) => st.kind === 'photo');
      const seed = seedPost?.postId ? getPost(seedPost.postId) : null;
      const res = await img.telephoneRender(text, seed ? readMedia(seed.media.main) : null);
      img.recordUsage(userId, res.costUsd);
      chain.steps.push({ kind: 'render', userId: null, media: writeMedia(res.image, 'jpg').url, text: res.generator, at: now() });
    } else if (input.kind === 'guess') {
      if (last.kind !== 'render') throw new GameError('wrong_turn');
      const text = (input.text ?? '').trim().slice(0, 120);
      if (!text) throw new GameError('empty');
      chain.steps.push({ kind: 'guess', userId, text, at: now() });
    }
  }
  saveState(gameId, s);
  rewardPlay(group, userId);
  toGroup(group.id, { type: 'game', groupId: group.id, gameId });
  return chain;
}

export function enterChallenge(group: Group, userId: string, gameId: string, postId: string) {
  const g = currentGame(group);
  if (!g || g.id !== gameId || g.kind !== 'challenge' || g.closed_at) throw new GameError('not_open');
  const post = getPost(postId);
  if (!post || post.userId !== userId || post.groupId !== group.id) throw new GameError('bad_post');
  const s = g.state as unknown as ChallengeState & { intro: string };
  s.entries = s.entries.filter((e) => e.userId !== userId).concat({ userId, postId, at: now() });
  saveState(gameId, s);
  rewardPlay(group, userId);
  toGroup(group.id, { type: 'game', groupId: group.id, gameId });
  return s;
}

export function guessWhose(group: Group, userId: string, gameId: string, postId: string, guessUserId: string) {
  const g = currentGame(group);
  if (!g || g.id !== gameId || g.kind !== 'guess_whose' || g.closed_at) throw new GameError('not_open');
  const s = g.state as unknown as GuessState & { intro: string };
  if (!s.postIds.length) {
    const rng = seeded(gameId);
    s.postIds = postsForGroup(group.id, { weekKey: g.week_key }).map((p) => p.id).sort(() => rng() - 0.5).slice(0, 8);
  }
  if (!s.postIds.includes(postId)) throw new GameError('bad_post');
  const first = !s.guesses[userId];
  s.guesses[userId] = { ...(s.guesses[userId] ?? {}), [postId]: guessUserId };
  saveState(gameId, s);
  if (first) rewardPlay(group, userId);
  return s;
}

/** Public view of the current game for a member (guess_whose hides authors until results). */
export function gameView(group: Group, viewerId: string) {
  const g = currentGame(group);
  if (!g) return null;
  const ms = members(group.id);
  const users = ms.map((m) => publicUser(m.user));
  const base = { id: g.id, kind: g.kind, weekKey: g.week_key, closed: Boolean(g.closed_at), intro: g.state.intro, users };
  if (g.kind === 'guess_whose') {
    const s = g.state as unknown as GuessState;
    let postIds = s.postIds;
    if (!postIds.length) {
      const rng = seeded(g.id);
      postIds = postsForGroup(group.id, { weekKey: g.week_key }).map((p) => p.id).sort(() => rng() - 0.5).slice(0, 8);
    }
    const dtos = toDTO(visiblePosts(group, viewerId).filter((p) => postIds.includes(p.id)), viewerId).map((p) => (g.closed_at ? p : { ...p, user: { id: '?', name: '?', avatar: null, color: '#3A3A3C', plus: false } }));
    return { ...base, posts: dtos, myGuesses: s.guesses[viewerId] ?? {}, results: (g.state as Record<string, unknown>).results ?? null };
  }
  if (g.kind === 'challenge') {
    const s = g.state as unknown as ChallengeState;
    const posts = new Map(toDTO(visiblePosts(group, viewerId).filter((p) => s.entries.some((e) => e.postId === p.id)), viewerId).map((p) => [p.id, p]));
    return { ...base, challenge: s.challenge, entries: s.entries.map((e) => ({ ...e, post: posts.get(e.postId) ?? null })) };
  }
  if (g.kind === 'telephone') {
    const s = g.state as unknown as TelephoneState;
    return { ...base, chains: s.chains };
  }
  const s = g.state as unknown as SuperlativesState & { results?: unknown };
  return { ...base, questions: s.questions.map((q) => ({ text: q.text, myVote: q.votes[viewerId] ?? null, voters: Object.keys(q.votes).length, tally: g.closed_at ? tally(q.votes) : null })), results: s.results ?? null };
}

function tally(votes: Record<string, string>) {
  const t: Record<string, number> = {};
  for (const v of Object.values(votes)) t[v] = (t[v] ?? 0) + 1;
  return t;
}

/* ───────────────────────── Closing: awards + share grid ───────────────────────── */

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

export function closeGame(group: Group, gameId: string) {
  const row = get<GameRow>('SELECT * FROM games WHERE id = ?', gameId);
  if (!row || row.closed_at) return null;
  const state = json.parse<Record<string, unknown>>(row.state, {});
  const { stats, sameDayShare, spreadDays } = statsFor(group, row.week_key);
  const awards = computeAwards(stats, `${gameId}:${row.week_key}`, 4);
  const groupAwards = computeGroupAwards(stats, { sameDayShare, spreadDays });
  const results: { title: string; emoji: string; line: string; winners: string[] }[] = awards.map((a) => ({ title: a.title, emoji: a.emoji, line: a.line, winners: a.winners }));
  if (row.kind === 'superlatives') {
    for (const q of (state as unknown as SuperlativesState).questions) {
      const t = tally(q.votes);
      const top = Math.max(0, ...Object.values(t));
      if (top > 0) results.unshift({ title: q.text, emoji: '🏆', line: `${top} vote${top === 1 ? '' : 's'}`, winners: Object.keys(t).filter((k) => t[k] === top) });
    }
  }
  if (row.kind === 'guess_whose') {
    const s = state as unknown as GuessState;
    const authors = new Map(s.postIds.map((pid) => [pid, getPost(pid)?.userId]));
    const scores = Object.entries(s.guesses).map(([u, gs]) => [u, Object.entries(gs).filter(([pid, guess]) => authors.get(pid) === guess).length] as const);
    const top = Math.max(0, ...scores.map(([, n]) => n));
    if (top > 0) results.unshift({ title: 'Best Guesser', emoji: '🔎', line: `${top}/${s.postIds.length} right`, winners: scores.filter(([, n]) => n === top).map(([u]) => u) });
    state.grids = Object.fromEntries(Object.entries(s.guesses).map(([u, gs]) => [u, s.postIds.map((pid) => (gs[pid] ? (authors.get(pid) === gs[pid] ? '🟩' : '⬛') : '⬜')).join('')]));
  }
  state.results = results;
  state.groupAwards = groupAwards;
  run('UPDATE games SET state = ?, closed_at = ? WHERE id = ?', json.str(state), now(), gameId);
  return { results, groupAwards };
}

/** Wordle-style spoiler-free grid for sharing a game result. */
export function shareGrid(group: Group, gameId: string, userId: string) {
  const row = get<GameRow>('SELECT * FROM games WHERE id = ?', gameId);
  if (!row) throw new GameError('not_found');
  const state = json.parse<Record<string, unknown>>(row.state, {});
  const num = all<{ id: string }>('SELECT id FROM games WHERE group_id = ? ORDER BY created_at', group.id).findIndex((g) => g.id === gameId) + 1;
  const label = { superlatives: 'Superlatives', telephone: 'Telephone', challenge: 'Challenge', guess_whose: 'Guess Whose' }[row.kind];
  let body = '';
  if (row.kind === 'guess_whose') {
    const grid = ((state.grids as Record<string, string>) ?? {})[userId] ?? '';
    body = `${grid.split('').filter((c) => c === '🟩').length}/${grid.length}\n${grid}`;
  } else if (row.kind === 'superlatives') {
    const qs = (state as unknown as SuperlativesState).questions;
    body = qs.map((q) => (q.votes[userId] ? '🟨' : '⬜')).join('') + `\n${Object.keys(qs[0]?.votes ?? {}).length} voted`;
  } else if (row.kind === 'telephone') {
    const chains = (state as unknown as TelephoneState).chains;
    body = chains.map((c) => c.steps.map((s) => ({ photo: '📷', caption: '✏️', render: '🎨', guess: '❓' })[s.kind]).join('')).join('\n');
  } else {
    body = `${((state as unknown as ChallengeState).entries ?? []).length} entries 📸`;
  }
  return `roll. ${label} #${num} · ${group.name}\n${body}\n${'roll.example'}/j/${group.inviteCode}`;
}

/* ───────────────────────── Chat with the game master ───────────────────────── */

export async function maybeGmReply(groupId: string, fromUserId: string, text: string) {
  const group = getGroup(groupId);
  if (!group) return;
  const mention = new RegExp(`@?${group.mascot.name}\\b`, 'i');
  if (!mention.test(text)) return;
  const from = getUser(fromUserId);
  const reply = await gm.reply(gmContext(group), from?.name ?? 'friend', text);
  const msg = insertMessage({ groupId, userId: null, kind: 'gm', body: reply });
  toGroup(groupId, { type: 'message', groupId, messageId: msg.id });
}

export function weeklyRoles(group: Group, weekKey?: string) {
  const { stats } = statsFor(group, weekKey);
  const roles = assignRoles(stats);
  return Object.fromEntries(Object.entries(roles).map(([u, r]) => [u, { id: r.id, title: r.title, line: r.line }]));
}
