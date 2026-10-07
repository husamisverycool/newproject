import type { Group, LikenessScope, Membership, Plan, Post, User } from './types.ts';

/* ───────────────────────── Group size & gates (spec §A3, §C) ───────────────────────── */

/** Spec §C: hard cap of 30, with 5–15 recommended (Locket 20-friend cap, Wrapped Party's 10). */
export const GROUP_MAX = 30;
export const GROUP_RECOMMENDED = { min: 5, max: 15 } as const;
/** Spec §A3: the wall unlocks at 3 members (instead of Yope's "add 5 to continue" gate). */
export const WALL_UNLOCK_MEMBERS = 3;

export function wallUnlocked(memberCount: number) {
  return memberCount >= WALL_UNLOCK_MEMBERS;
}

export function canJoin(memberCount: number) {
  return memberCount < GROUP_MAX;
}

/**
 * Spec §E: "post to see" (Retro, BeReal) as a soft lock. Blurs the CURRENT week until the
 * viewer has posted in it — never past weeks.
 */
export function weekBlurred(opts: { weekKey: string; currentWeekKey: string; viewerPostedThisWeek: boolean }) {
  return opts.weekKey === opts.currentWeekKey && !opts.viewerPostedThisWeek;
}

/**
 * Spec §C archive access (Retro keys, adapted): new members see content from their join date
 * unless the group votes to open the archive.
 */
export function visibleFrom(membership: Pick<Membership, 'joinedAt'>, group: Pick<Group, 'archiveOpen'>) {
  return group.archiveOpen ? 0 : membership.joinedAt;
}

export function postVisibleTo(post: Pick<Post, 'createdAt'>, membership: Pick<Membership, 'joinedAt'>, group: Pick<Group, 'archiveOpen'>) {
  return post.createdAt >= visibleFrom(membership, group);
}

/** Spec §C/§P: reactions are visible only to the poster, counts hidden (Locket, Retro). */
export function reactionsVisibleTo(viewerId: string, post: Pick<Post, 'userId'>) {
  return viewerId === post.userId;
}

/* ───────────────────────── Likeness consent (spec §F, §S) ───────────────────────── */

export interface ConsentInput {
  owner: Pick<User, 'id' | 'likenessScope' | 'likenessAllow'>;
  actorId: string;
  /** Group the object is being made in. Both people must be members. */
  groupId: string | null;
  ownerGroupIds: string[];
  actorGroupIds: string[];
}

export type ConsentResult = { ok: true } | { ok: false; reason: 'scope_no_one' | 'not_in_group' | 'not_allowed' };

/**
 * Sora Cameos-style consent. A friend's likeness can only be used when their setting allows it.
 * Changing the setting blocks new generations immediately; existing objects are logged and can be
 * revoked individually.
 */
export function canUseLikeness(input: ConsentInput): ConsentResult {
  const { owner, actorId, groupId } = input;
  if (owner.id === actorId) return { ok: true };
  if (owner.likenessScope === 'no_one') return { ok: false, reason: 'scope_no_one' };
  const shared = groupId
    ? input.ownerGroupIds.includes(groupId) && input.actorGroupIds.includes(groupId)
    : input.ownerGroupIds.some((g) => input.actorGroupIds.includes(g));
  if (!shared) return { ok: false, reason: 'not_in_group' };
  if (owner.likenessScope === 'specific_friends' && !owner.likenessAllow.includes(actorId)) {
    return { ok: false, reason: 'not_allowed' };
  }
  return { ok: true };
}

/** Spec §G: automatic (unprompted) AI creations require the per-user toggle. */
export function autoCreationAllowed(user: Pick<User, 'autoAiCreations' | 'likenessScope'>) {
  return user.autoAiCreations && user.likenessScope !== 'no_one';
}

export const LIKENESS_SCOPE_LABEL: Record<LikenessScope, string> = {
  no_one: 'Only me',
  my_groups: 'My groups',
  specific_friends: 'Friends I choose',
};

/* ───────────────────────── Age (spec §J, §S, §U) ───────────────────────── */

export function ageFromBirthYear(birthYear: number, now = Date.now()) {
  return new Date(now).getUTCFullYear() - birthYear;
}

export function isMinor(user: Pick<User, 'birthYear'>, now = Date.now()) {
  return ageFromBirthYear(user.birthYear, now) < 18;
}

/** Paid random packs: age-verified adults only, odds shown, no cash-out. */
export function canBuyPaidPacks(user: Pick<User, 'isAdult' | 'birthYear'>, now = Date.now()) {
  return user.isAdult && !isMinor(user, now);
}

/* ───────────────────────── Plans, allowance & storage (spec §G, §T, §U) ───────────────────────── */

export interface PlanInfo {
  id: Plan;
  name: string;
  monthly: number;
  yearly: number | null;
  /**
   * AI generations per member per month, derived from the cost model: Nano Banana 2 at $0.067
   * per 1K image must stay well under each tier's price (Snapchat Lens+-style compute limits).
   * free 5 ≈ $0.34 · plus 25 ≈ $1.68 of $3.99 · ai 60 ≈ $4.02 of $5.99 (≈ $2.02 on NB2 Lite).
   */
  aiMonthly: number;
  /** Full-resolution archive kept (free stores compressed copies). */
  fullRes: boolean;
  extraWeeklyPack: boolean;
  watermarkStyles: boolean;
  appIcons: boolean;
  streakRestore: boolean;
  figurines: boolean;
}

export const PLANS: Record<Plan, PlanInfo> = {
  free: {
    id: 'free', name: 'Free', monthly: 0, yearly: null, aiMonthly: 5, fullRes: false,
    extraWeeklyPack: false, watermarkStyles: false, appIcons: false, streakRestore: false, figurines: false,
  },
  plus: {
    id: 'plus', name: 'roll+', monthly: 3.99, yearly: 36, aiMonthly: 25, fullRes: true,
    extraWeeklyPack: true, watermarkStyles: true, appIcons: true, streakRestore: true, figurines: false,
  },
  ai: {
    id: 'ai', name: 'Remix+', monthly: 5.99, yearly: null, aiMonthly: 60, fullRes: true,
    extraWeeklyPack: true, watermarkStyles: true, appIcons: true, streakRestore: true, figurines: true,
  },
};

/** Free groups are limited to one AI recap per week (spec §G cost model). */
export const FREE_GROUP_RECAPS_PER_WEEK = 1;

/** Spec §G: Nano Banana 2 API pricing used for the cost meter (USD per image). */
export const IMAGE_COST = { nb2_1k: 0.067, nb2_2k: 0.101, nb2_lite: 0.0336, nb_pro_1k: 0.134 } as const;
export const RECAP_PANELS = 6;

export function weeklyRecapCost(perImage: number = IMAGE_COST.nb2_1k, panels = RECAP_PANELS) {
  const week = perImage * panels;
  return { week, month: (week * 52) / 12 };
}

/** Spec §T: free tier stores compressed copies; paid keeps print-quality originals. */
export const STORAGE = {
  freeLongEdge: 1600,
  freeQuality: 78,
  paidLongEdge: 4096,
  paidQuality: 92,
  thumbLongEdge: 480,
  /** Per-group storage budget for the free tier, in bytes. */
  freeGroupBudget: 2 * 1024 ** 3,
  /** iOS 27 temporary albums: event albums expire unless kept. */
  eventAlbumTtlDays: 30,
} as const;

export function storageTierFor(plan: Plan) {
  return PLANS[plan].fullRes
    ? { longEdge: STORAGE.paidLongEdge, quality: STORAGE.paidQuality }
    : { longEdge: STORAGE.freeLongEdge, quality: STORAGE.freeQuality };
}

export function aiRemaining(plan: Plan, usedThisMonth: number) {
  return Math.max(0, PLANS[plan].aiMonthly - usedThisMonth);
}
