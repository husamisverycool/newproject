import { wrapped } from './sources/index.ts';
/**
 * Group superlatives and roles, adapted from Spotify Wrapped Party awards and Wrapped Clubs roles
 * (research/04 §1.6–1.7). Awards are positive, named (never anonymous), never based on reaction
 * counts (counts stay hidden, spec §C), and "update dynamically every time you join … so no two
 * sessions are ever the same" — selection is seeded per session.
 */

export interface MemberStats {
  userId: string;
  posts: number;
  ritualPosts: number;
  firstPosts: number;
  sunrisePosts: number;
  latePosts: number;
  goldenHourPosts: number;
  rewindPosts: number;
  dualPosts: number;
  livePosts: number;
  voicePosts: number;
  captionWords: number;
  captions: number;
  reactionsGiven: number;
  cards: number;
  invites: number;
  streakWeeks: number;
  daysActive: number;
}

export interface AwardDef {
  id: string;
  /** The award's name from the Wrapped deck (sources/wrapped.ts). */
  title: string;
  score: (s: MemberStats) => number;
  /** Minimum score for the award to be eligible. */
  min: number;
}

/** Wrapped Party award names [V-weak] (sources/wrapped.ts); the spec's two examples [S]. No invented lines or emoji. */
export const AWARDS: AwardDef[] = [
  { id: 'early_bird', title: wrapped.awards.earlyBird, score: (s) => s.sunrisePosts, min: 1 },
  { id: 'first_to_post', title: wrapped.awards.firstToPost, score: (s) => s.firstPosts, min: 1 },
  { id: 'most_sunsets', title: wrapped.awards.mostSunsets, score: (s) => s.goldenHourPosts, min: 1 },
  { id: 'crate_digger', title: wrapped.awards.crateDigger, score: (s) => s.rewindPosts, min: 1 },
  { id: 'onion_chopper', title: wrapped.awards.onionChopper, score: (s) => s.voicePosts, min: 1 },
  { id: 'dinner_table', title: wrapped.awards.dinnerTable, score: (s) => s.captionWords, min: 12 },
  { id: 'documentarian', title: wrapped.awards.mostPhotos, score: (s) => s.posts, min: 3 },
];

export interface GroupAwardDef {
  id: string;
  title: string;
  test: (all: MemberStats[], meta: { sameDayShare: number; spreadDays: number }) => boolean;
}

/** Wrapped Party group awards [V-weak]: "Copy and Paste" (everyone shares the same…) and "Chaos Crew" (everyone completely different). */
export const GROUP_AWARDS: GroupAwardDef[] = [
  { id: 'copy_paste', title: wrapped.awards.copyAndPaste, test: (_a, m) => m.sameDayShare >= 0.75 },
  { id: 'chaos_crew', title: wrapped.awards.chaosCrew, test: (_a, m) => m.spreadDays >= 7 },
];

/** Deterministic PRNG so a session's awards are stable while different sessions differ. */
export function seeded(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

export interface AwardResult {
  id: string;
  title: string;
  winners: string[];
}

export function computeAwards(stats: MemberStats[], sessionSeed: string, count = 5): AwardResult[] {
  const rng = seeded(sessionSeed);
  const eligible: AwardResult[] = [];
  for (const def of AWARDS) {
    const scores = stats.map((s) => ({ id: s.userId, v: def.score(s) }));
    const top = Math.max(0, ...scores.map((x) => x.v));
    if (top < def.min) continue;
    eligible.push({ id: def.id, title: def.title, winners: scores.filter((x) => x.v === top).map((x) => x.id) });
  }
  // Shuffle (Fisher–Yates) with the session seed, then prefer spreading wins across people.
  for (let i = eligible.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [eligible[i], eligible[j]] = [eligible[j], eligible[i]];
  }
  const picked: AwardResult[] = [];
  const wins = new Map<string, number>();
  const byLoad = [...eligible].sort((a, b) => load(a) - load(b));
  function load(a: AwardResult) {
    return Math.min(...a.winners.map((w) => wins.get(w) ?? 0));
  }
  while (picked.length < count && byLoad.length) {
    byLoad.sort((a, b) => load(a) - load(b));
    const next = byLoad.shift()!;
    picked.push(next);
    for (const w of next.winners) wins.set(w, (wins.get(w) ?? 0) + 1);
  }
  return picked;
}

export function computeGroupAwards(stats: MemberStats[], meta: { sameDayShare: number; spreadDays: number }) {
  return GROUP_AWARDS.filter((g) => g.test(stats, meta)).map(({ id, title }) => ({ id, title }));
}

/* ───────────────────────── Roles (Wrapped Clubs roles) ───────────────────────── */

export interface RoleDef {
  id: string;
  /** Wrapped Clubs role name and line [V], nouns substituted (sources/wrapped.ts). */
  title: string;
  line: string;
  score: (s: MemberStats) => number;
}

const ROLE_SCORE: Record<string, (s: MemberStats) => number> = {
  leader: (s) => s.ritualPosts, // "strongly aligned with group values"
  scout: (s) => s.firstPosts, // "the freshest photos"
  archivist: (s) => s.rewindPosts, // "delves into past eras"
  curator: (s) => s.captions, // "combining the best of your group"
  collector: (s) => s.cards, // "building a large group collection"
  recruiter: (s) => s.invites, // "bringing in frequent new group members"
  loyalist: (s) => s.streakWeeks, // "rarely skip a week"
  supporter: (s) => s.reactionsGiven, // "ensuring they're heard around your group"
  broadcaster: (s) => s.voicePosts, // "voice notes more than others"
  specialist: (s) => s.dualPosts + s.livePosts, // "experimental styles"
};

export const ROLES: RoleDef[] = wrapped.roles.map((r) => ({ id: r.id, title: r.name, line: r.line, score: ROLE_SCORE[r.id] ?? ((s) => s.posts) }));

/**
 * Every member gets exactly one role, assigned greedily by how far each person stands out in a
 * role relative to the group ("determined by your standout … compared to the rest of your Club").
 */
export function assignRoles(stats: MemberStats[]): Record<string, RoleDef> {
  const out: Record<string, RoleDef> = {};
  const pairs: { userId: string; role: RoleDef; z: number }[] = [];
  for (const role of ROLES) {
    const vals = stats.map((s) => role.score(s));
    const mean = vals.reduce((a, b) => a + b, 0) / Math.max(1, vals.length);
    const sd = Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, vals.length)) || 1;
    stats.forEach((s, i) => pairs.push({ userId: s.userId, role, z: (vals[i] - mean) / sd + vals[i] * 1e-3 }));
  }
  pairs.sort((a, b) => b.z - a.z);
  const usedRoles = new Set<string>();
  for (const p of pairs) {
    if (out[p.userId] || usedRoles.has(p.role.id)) continue;
    out[p.userId] = p.role;
    usedRoles.add(p.role.id);
  }
  // Groups larger than the role list: remaining people get their best role (roles may repeat).
  for (const s of stats) {
    if (out[s.userId]) continue;
    const best = pairs.filter((p) => p.userId === s.userId).sort((a, b) => b.z - a.z)[0];
    out[s.userId] = best?.role ?? ROLES[0];
  }
  return out;
}

export function emptyStats(userId: string): MemberStats {
  return {
    userId, posts: 0, ritualPosts: 0, firstPosts: 0, sunrisePosts: 0, latePosts: 0, goldenHourPosts: 0,
    rewindPosts: 0, dualPosts: 0, livePosts: 0, voicePosts: 0, captionWords: 0, captions: 0,
    reactionsGiven: 0, cards: 0, invites: 0, streakWeeks: 0, daysActive: 0,
  };
}
