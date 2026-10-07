import type { NotificationKind } from './types.ts';

/**
 * Push policy (spec §O).
 *
 * Hard rule: every push points to real, unseen content. A "check your friends' post" push with
 * nothing new behind it (the 2025 Yope review complaint) is impossible by construction —
 * `decidePush` refuses any candidate whose refIds are empty or already seen.
 *
 * Cadence sources:
 *  - one weekly ritual push + one game push (BeReal's daily push, adapted to weekly)
 *  - reaction pushes (Locket)
 *  - group streak warning, once (Snapchat hourglass / Duolingo, adapted to groups only)
 *  - lock-screen surprises are rate limited (Yope)
 */

export interface PushCandidate {
  userId: string;
  groupId: string | null;
  kind: NotificationKind;
  refIds: string[];
  now: number;
}

export interface PushHistoryEntry {
  kind: NotificationKind;
  groupId: string | null;
  createdAt: number;
}

export interface PushContext {
  /** Content ids the user has already seen. */
  seen: Set<string>;
  /** The user's recent pushes (any group), newest first. */
  history: PushHistoryEntry[];
  /** Quiet hours in the user's local time: no non-urgent pushes. */
  localHour: number;
  /** Start of the current ritual week (ms). */
  weekStart: number;
}

export type PushDecision = { send: true } | { send: false; reason: string };

const MIN = 60_000;
const HOUR = 60 * MIN;

/** Per-kind limits within a group. */
export const PUSH_LIMITS: Record<NotificationKind, { perWeek?: number; minGap?: number; quietHoursExempt?: boolean }> = {
  ritual_open: { perWeek: 1, quietHoursExempt: false },
  ritual_closing: { perWeek: 1 },
  roll_developed: { perWeek: 1 },
  game_open: { perWeek: 1 },
  reaction: { minGap: 10 * MIN },
  new_posts: { minGap: 45 * MIN },
  streak_warning: { perWeek: 1 },
  trade_offer: { minGap: 30 * MIN },
  wonder_pick: { minGap: 6 * HOUR },
  plan: { minGap: 30 * MIN },
  likeness_used: { minGap: 0, quietHoursExempt: true },
  waitlist: { minGap: 0 },
};

export const QUIET_HOURS = { start: 22, end: 8 } as const;

export function inQuietHours(localHour: number) {
  return localHour >= QUIET_HOURS.start || localHour < QUIET_HOURS.end;
}

export function decidePush(c: PushCandidate, ctx: PushContext): PushDecision {
  const fresh = c.refIds.filter((id) => !ctx.seen.has(id));
  if (fresh.length === 0) return { send: false, reason: 'no_new_content' };

  const limit = PUSH_LIMITS[c.kind];
  if (!limit.quietHoursExempt && inQuietHours(ctx.localHour)) return { send: false, reason: 'quiet_hours' };

  const sameKind = ctx.history.filter((h) => h.kind === c.kind && h.groupId === c.groupId);
  if (limit.perWeek !== undefined) {
    const thisWeek = sameKind.filter((h) => h.createdAt >= ctx.weekStart).length;
    if (thisWeek >= limit.perWeek) return { send: false, reason: 'weekly_limit' };
  }
  if (limit.minGap) {
    const last = sameKind[0];
    if (last && c.now - last.createdAt < limit.minGap) return { send: false, reason: 'too_soon' };
  }
  return { send: true };
}

/** Batch copy for new-post pushes ("Maya, Theo + 2 posted"). Names only, never counts of reactions. */
export function newPostsCopy(names: string[]) {
  const unique = [...new Set(names)];
  if (unique.length === 1) return `${unique[0]} posted`;
  if (unique.length === 2) return `${unique[0]} and ${unique[1]} posted`;
  return `${unique[0]}, ${unique[1]} + ${unique.length - 2} posted`;
}
