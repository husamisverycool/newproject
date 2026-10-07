import { weekKeyOffset } from './time.ts';

/**
 * Group streaks only (spec §O: "adapt to group streaks only, with one warning"). A week counts when
 * at least half the group (and never fewer than 2 people) posted in it. Duolingo Friend Streak
 * milestones (7/30/100/365) are expressed here in weeks.
 */

export const STREAK_MILESTONES = [4, 12, 26, 52] as const;

export function weekThreshold(memberCount: number) {
  return Math.max(2, Math.ceil(memberCount * 0.5));
}

/**
 * @param postersByWeek weekKey → set of user ids who posted that week
 * @param currentWeekKey the week currently in progress
 */
export function groupStreak(postersByWeek: Map<string, Set<string>>, memberCount: number, currentWeekKey: string) {
  const need = weekThreshold(memberCount);
  const counted = (key: string) => (postersByWeek.get(key)?.size ?? 0) >= need;
  const currentDone = counted(currentWeekKey);
  let streak = currentDone ? 1 : 0;
  let key = weekKeyOffset(currentWeekKey, -1);
  while (counted(key)) {
    streak++;
    key = weekKeyOffset(key, -1);
  }
  const current = postersByWeek.get(currentWeekKey)?.size ?? 0;
  return {
    weeks: streak,
    currentDone,
    current,
    need,
    /** True when a running streak would break if this week ends now — the single warning. */
    atRisk: !currentDone && streak > 0,
    nextMilestone: STREAK_MILESTONES.find((m) => m > streak) ?? null,
  };
}
