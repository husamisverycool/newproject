import { assignRoles, computeAwards, computeGroupAwards, localParts, seeded, type Group } from '@app/shared';
import { all, get, json, now, run } from '../db.ts';
import { getGroup, id, members, objectsFor, postsForGroup, publicUser } from '../repo.ts';
import { toGroup } from '../realtime.ts';
import { GameError } from './cards.ts';
import { statsFor } from './games.ts';
import { toDTO, visiblePosts } from './posts.ts';
import { inviteCode } from '../repo.ts';

/**
 * Year-end Wrapped (spec §V), patterned on Spotify Wrapped 2025: story cards, five memorable days
 * (Listening Archive), a "guess whose photo" quiz before the reveal (Top Song Quiz), roles (Clubs),
 * awards that regenerate per party session (Wrapped Party), and "Roll Age" (Listening Age).
 */

export function wrapped(group: Group, viewerId: string, year: number) {
  const start = Date.UTC(year, 0, 1);
  const end = Date.UTC(year + 1, 0, 1);
  const posts = visiblePosts(group, viewerId).filter((p) => p.createdAt >= start && p.createdAt < end);
  const mine = posts.filter((p) => p.userId === viewerId);
  const ms = members(group.id);
  const users = new Map(ms.map((m) => [m.userId, publicUser(m.user)]));
  const { stats, sameDayShare, spreadDays } = statsFor(group, undefined, start);
  const roles = assignRoles(stats);

  // Five days that defined our year (Listening Archive: "up to five" memorable days).
  const byDay = new Map<string, typeof posts>();
  for (const p of posts) {
    const lp = localParts(p.createdAt, group.timeZone);
    const k = `${lp.year}-${String(lp.month).padStart(2, '0')}-${String(lp.day).padStart(2, '0')}`;
    byDay.set(k, [...(byDay.get(k) ?? []), p]);
  }
  const dayList = [...byDay.entries()];
  const days: { kind: string; title: string; date: string; posts: ReturnType<typeof toDTO> }[] = [];
  const used = new Set<string>();
  const addDay = (kind: string, title: string, score: (ps: typeof posts) => number) => {
    const best = dayList.filter(([d]) => !used.has(d)).sort((a, b) => score(b[1]) - score(a[1]))[0];
    if (!best || score(best[1]) <= 0) return;
    used.add(best[0]);
    days.push({ kind, title, date: best[0], posts: toDTO(best[1].slice(0, 6), viewerId) });
  };
  // `kind` lets the client label a day from the wrapped deck (Listening Archive day names).
  addDay('biggest', 'Your Biggest Day Together', (ps) => new Set(ps.map((p) => p.userId)).size * 10 + ps.length);
  addDay('nostalgic', 'Your Most Nostalgic Day', (ps) => ps.filter((p) => p.kind === 'rewind').length);
  addDay('golden', 'Your Golden Hour Day', (ps) => ps.filter((p) => (p.media as { golden?: boolean }).golden).length);
  addDay('loud', 'Your Loudest Day', (ps) => ps.filter((p) => p.media.voice).length);
  addDay('roll', 'Your Roll Day', (ps) => ps.filter((p) => p.ritual).length);

  // Roll Age (Listening Age): how old, on average, the photos you shared were.
  const ageDays = mine.length ? mine.reduce((s, p) => s + Math.max(0, p.createdAt - p.takenAt), 0) / mine.length / 86_400_000 : 0;

  const monthCounts = new Array(12).fill(0);
  for (const p of mine) monthCounts[new Date(p.createdAt).getUTCMonth()]++;
  const topMonth = monthCounts.indexOf(Math.max(...monthCounts));

  // Most collected moment: the post with the most card copies across everyone's binders.
  const collected = all<{ post_id: string; n: number }>(
    'SELECT post_id, COUNT(*) AS n FROM cards WHERE group_id = ? GROUP BY post_id ORDER BY n DESC LIMIT 1', group.id,
  )[0];

  const rng = seeded(`${group.id}:${year}:quiz:${viewerId}`);
  const quizPool = posts.filter((p) => p.userId !== viewerId).sort(() => rng() - 0.5).slice(0, 5);
  const quiz = toDTO(quizPool, viewerId).map((p) => {
    const others = ms.map((m) => m.userId).filter((u) => u !== p.user.id).sort(() => rng() - 0.5).slice(0, 3);
    const options = [p.user.id, ...others].sort(() => rng() - 0.5).map((u) => users.get(u)!);
    return { post: { ...p, user: undefined }, answer: p.user.id, options };
  });

  const figurines = objectsFor({ groupId: group.id, kind: 'figurine' }).filter((o) => !o.revoked && o.createdAt >= start && o.createdAt < end);

  return {
    year,
    group: { id: group.id, name: group.name, emoji: group.emoji, mascot: group.mascot },
    me: {
      moments: mine.length,
      ritualWeeks: new Set(mine.filter((p) => p.ritual).map((p) => p.weekKey)).size,
      rewinds: mine.filter((p) => p.kind === 'rewind').length,
      voiceNotes: mine.filter((p) => p.media.voice).length,
      topMonth,
      rollAgeDays: Math.round(ageDays),
      role: roles[viewerId] ? { id: roles[viewerId].id, title: roles[viewerId].title, line: roles[viewerId].line } : null,
      topMoments: toDTO(mine.slice(0, 5), viewerId),
    },
    groupStats: { moments: posts.length, members: ms.length, weeks: new Set(posts.map((p) => p.weekKey)).size },
    roles: Object.fromEntries(Object.entries(roles).map(([u, r]) => [u, { id: r.id, title: r.title, line: r.line, user: users.get(u) }])),
    days,
    quiz,
    groupAwards: computeGroupAwards(stats, { sameDayShare, spreadDays }),
    mostCollected: collected ? { count: collected.n, post: toDTO(postsForGroup(group.id).filter((p) => p.id === collected.post_id), viewerId)[0] ?? null } : null,
    figurines: figurines.map((o) => ({ id: o.id, media: o.media, subjects: o.subjects })),
  };
}

/* ───────────────────────── Party mode (Wrapped Party + Jackbox) ───────────────────────── */

/**
 * Wrapped Party [V-weak] (research/15 §1e): the host steps "Create the party" → "Make it your own"
 * ("update profile image and name, rename your party") → "Invite your friends" → "Start the party";
 * guests "Join Party", then "confirm name and photo", then wait in the "waiting room"; the host can
 * "hand off hosting duties". The party is kept in the database so every member's device sees the same
 * room. Names and photos changed here belong to the party only; the account keeps its own.
 */
interface PartyProfile {
  name?: string;
  avatar?: string | null;
}

interface Party {
  id: string;
  code: string;
  groupId: string;
  hostId: string;
  slide: number;
  players: string[];
  audience: string[];
  answers: Record<string, Record<number, string>>;
  createdAt: number;
  /** "rename your party" — null keeps the feature name. */
  name: string | null;
  /** "update profile image and name" / "confirm name and photo", per person, for this party. */
  profiles: Record<string, PartyProfile>;
}

/** Jackbox-style: the first 10 who join play; everyone after joins the audience. */
export const PARTY_PLAYERS = 10;

function loadParty(groupId: string): Party | null {
  const r = get<{ state: string }>('SELECT state FROM wrapped_parties WHERE group_id = ?', groupId);
  const p = r ? json.parse<Party | null>(r.state, null) : null;
  return p ? { ...p, name: p.name ?? null, profiles: p.profiles ?? {} } : null;
}

function saveParty(p: Party) {
  run('INSERT OR REPLACE INTO wrapped_parties (group_id, state, updated_at) VALUES (?, ?, ?)', p.groupId, json.str(p), now());
}

function partyView(p: Party, year: number) {
  const ms = members(p.groupId);
  const users = new Map(ms.map((m) => [m.userId, publicUser(m.user)]));
  const person = (u: string) => {
    const base = users.get(u);
    if (!base) return null;
    const o = p.profiles[u];
    return { ...base, name: o?.name || base.name, avatar: o?.avatar !== undefined ? o.avatar : base.avatar };
  };
  const { stats } = statsFor(getGroup(p.groupId)!, undefined, Date.UTC(year, 0, 1));
  const awards = computeAwards(stats.filter((s) => p.players.includes(s.userId) || p.audience.includes(s.userId)), `${p.id}`, 5);
  return {
    id: p.id, code: p.code, hostId: p.hostId, slide: p.slide, name: p.name,
    players: p.players.map(person).filter(Boolean),
    audience: p.audience.map(person).filter(Boolean),
    awards: awards.map((a) => ({ ...a, winners: a.winners.map(person).filter(Boolean) })),
    answers: p.answers,
  };
}

export function startParty(group: Group, hostId: string) {
  const existing = loadParty(group.id);
  if (existing) return existing;
  const p: Party = { id: id('party'), code: inviteCode().slice(0, 4), groupId: group.id, hostId, slide: 0, players: [hostId], audience: [], answers: {}, createdAt: now(), name: null, profiles: {} };
  saveParty(p);
  return p;
}

export function partyFor(groupId: string) {
  return loadParty(groupId);
}

function mustParty(groupId: string) {
  const p = loadParty(groupId);
  if (!p) throw new GameError('no_party');
  return p;
}

export function joinParty(groupId: string, userId: string, year: number) {
  const p = mustParty(groupId);
  if (!p.players.includes(userId) && !p.audience.includes(userId)) {
    if (p.players.length < PARTY_PLAYERS) p.players.push(userId);
    else p.audience.push(userId);
    saveParty(p);
  }
  broadcast(p, year);
  return partyView(p, year);
}

export function advanceParty(groupId: string, userId: string, slide: number, year: number) {
  const p = mustParty(groupId);
  if (p.hostId !== userId) throw new GameError('host_only');
  p.slide = Math.max(0, slide);
  saveParty(p);
  broadcast(p, year);
  return partyView(p, year);
}

export function answerParty(groupId: string, userId: string, question: number, answer: string, year: number) {
  const p = mustParty(groupId);
  p.answers[userId] = { ...(p.answers[userId] ?? {}), [question]: answer };
  saveParty(p);
  broadcast(p, year);
}

/** "Make it your own": the host renames the party (an empty name goes back to the feature name). */
export function renameParty(groupId: string, userId: string, name: string, year: number) {
  const p = mustParty(groupId);
  if (p.hostId !== userId) throw new GameError('host_only');
  p.name = String(name ?? '').trim().slice(0, 40) || null;
  saveParty(p);
  broadcast(p, year);
  return partyView(p, year);
}

/** "update profile image and name" (host) / "confirm name and photo" (guest), for this party only. */
export function setPartyProfile(groupId: string, userId: string, input: PartyProfile, year: number) {
  const p = mustParty(groupId);
  if (!p.players.includes(userId) && !p.audience.includes(userId)) throw new GameError('not_joined');
  const cur = p.profiles[userId] ?? {};
  p.profiles[userId] = {
    name: input.name === undefined ? cur.name : String(input.name).trim().slice(0, 32) || undefined,
    avatar: input.avatar === undefined ? cur.avatar : input.avatar,
  };
  saveParty(p);
  broadcast(p, year);
  return partyView(p, year);
}

/** The host can "hand off hosting duties" to anyone in the room; an audience member moves up to play. */
export function handOffParty(groupId: string, userId: string, toUserId: string, year: number) {
  const p = mustParty(groupId);
  if (p.hostId !== userId) throw new GameError('host_only');
  if (toUserId === userId) return partyView(p, year);
  if (!p.players.includes(toUserId) && !p.audience.includes(toUserId)) throw new GameError('not_joined');
  if (!p.players.includes(toUserId)) {
    p.audience = p.audience.filter((u) => u !== toUserId);
    p.players.push(toUserId);
  }
  p.hostId = toUserId;
  saveParty(p);
  broadcast(p, year);
  return partyView(p, year);
}

export function endParty(groupId: string, userId: string) {
  const p = loadParty(groupId);
  if (p && p.hostId === userId) run('DELETE FROM wrapped_parties WHERE group_id = ?', groupId);
  toGroup(groupId, { type: 'party', groupId, state: null });
}

export function partyState(groupId: string, year: number) {
  const p = loadParty(groupId);
  return p ? partyView(p, year) : null;
}

function broadcast(p: Party, year: number) {
  toGroup(p.groupId, { type: 'party', groupId: p.groupId, state: partyView(p, year) });
}
