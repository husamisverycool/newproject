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
  title: string;
  /** One-line definition, Wrapped Party style. */
  line: string;
  emoji: string;
  score: (s: MemberStats) => number;
  /** Minimum score for the award to be eligible. */
  min: number;
}

export const AWARDS: AwardDef[] = [
  { id: 'early_bird', title: 'Early Bird', line: 'Posted the most during sunrise hours', emoji: '🌅', score: (s) => s.sunrisePosts, min: 1 },
  { id: 'night_owl', title: 'Night Owl', line: 'Still posting after midnight', emoji: '🦉', score: (s) => s.latePosts, min: 1 },
  { id: 'first_to_post', title: 'First to Post', line: 'Opened the roll before anyone else', emoji: '🥇', score: (s) => s.firstPosts, min: 1 },
  { id: 'most_sunsets', title: 'Most Sunsets', line: 'Caught golden hour the most', emoji: '🌇', score: (s) => s.goldenHourPosts, min: 1 },
  { id: 'crate_digger', title: 'The Crate Digger', line: 'Dug the deepest into the camera roll', emoji: '📦', score: (s) => s.rewindPosts, min: 1 },
  { id: 'onion_chopper', title: 'The Onion Chopper', line: 'Said it out loud — the most voice notes', emoji: '🧅', score: (s) => s.voicePosts, min: 1 },
  { id: 'dinner_table', title: 'Dinner Table Explainer', line: 'Wrote the longest captions', emoji: '🍽️', score: (s) => s.captionWords, min: 12 },
  { id: 'two_faced', title: 'Both Sides', line: 'Most front-and-back shots', emoji: '🔁', score: (s) => s.dualPosts, min: 1 },
  { id: 'live_wire', title: 'Live Wire', line: 'Most moments with the live clip on', emoji: '⚡', score: (s) => s.livePosts, min: 2 },
  { id: 'documentarian', title: 'The Documentarian', line: 'Posted the most, full stop', emoji: '🎞️', score: (s) => s.posts, min: 3 },
  { id: 'biggest_fan', title: 'Most Obsessed Fan', line: "Reacted to everyone's everything", emoji: '🫶', score: (s) => s.reactionsGiven, min: 3 },
];

export interface GroupAwardDef {
  id: string;
  title: string;
  line: string;
  emoji: string;
  test: (all: MemberStats[], meta: { sameDayShare: number; spreadDays: number }) => boolean;
}

/** Wrapped Party group awards: "Copy and Paste" (everyone shares the same…) and "Chaos Crew". */
export const GROUP_AWARDS: GroupAwardDef[] = [
  { id: 'copy_paste', title: 'Copy and Paste', line: 'Everyone posted on the same day', emoji: '📋', test: (_a, m) => m.sameDayShare >= 0.75 },
  { id: 'chaos_crew', title: 'Chaos Crew', line: 'Posts landed on every day of the week', emoji: '🌀', test: (_a, m) => m.spreadDays >= 7 },
  { id: 'full_house', title: 'Full House', line: 'Every single member posted', emoji: '🏠', test: (a) => a.length > 0 && a.every((s) => s.posts > 0) },
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
  line: string;
  emoji: string;
  winners: string[];
}

export function computeAwards(stats: MemberStats[], sessionSeed: string, count = 5): AwardResult[] {
  const rng = seeded(sessionSeed);
  const eligible: AwardResult[] = [];
  for (const def of AWARDS) {
    const scores = stats.map((s) => ({ id: s.userId, v: def.score(s) }));
    const top = Math.max(0, ...scores.map((x) => x.v));
    if (top < def.min) continue;
    eligible.push({ id: def.id, title: def.title, line: def.line, emoji: def.emoji, winners: scores.filter((x) => x.v === top).map((x) => x.id) });
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
  return GROUP_AWARDS.filter((g) => g.test(stats, meta)).map(({ id, title, line, emoji }) => ({ id, title, line, emoji }));
}

/* ───────────────────────── Roles (Wrapped Clubs roles) ───────────────────────── */

export interface RoleDef {
  id: string;
  title: string;
  line: string;
  score: (s: MemberStats) => number;
}

export const ROLES: RoleDef[] = [
  { id: 'leader', title: 'Leader', line: 'Shows up for the roll, every single week', score: (s) => s.ritualPosts },
  { id: 'scout', title: 'Scout', line: 'Always first to post something new', score: (s) => s.firstPosts },
  { id: 'archivist', title: 'Archivist', line: 'Keeps the record — the most moments saved', score: (s) => s.posts },
  { id: 'curator', title: 'Curator', line: 'Picks the words — the most captions', score: (s) => s.captions },
  { id: 'collector', title: 'Collector', line: 'The fullest binder in the group', score: (s) => s.cards },
  { id: 'recruiter', title: 'Recruiter', line: 'Brought the most people in', score: (s) => s.invites },
  { id: 'loyalist', title: 'Loyalist', line: 'The longest personal streak', score: (s) => s.streakWeeks },
  { id: 'supporter', title: 'Supporter', line: 'Reacts to everyone', score: (s) => s.reactionsGiven },
  { id: 'broadcaster', title: 'Broadcaster', line: 'The voice of the group', score: (s) => s.voicePosts },
  { id: 'specialist', title: 'Specialist', line: 'Front, back, live — every angle', score: (s) => s.dualPosts + s.livePosts },
];

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
