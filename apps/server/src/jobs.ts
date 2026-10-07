import { PLANS, bereal, duolingo, locket, ritualWindow, weekKeyOffset, type Group } from '@app/shared';
import { all, now } from './db.ts';
import { allGroups, insertMessage, jobDone, markJob, members, updateMascot } from './repo.ts';
import { toGroup } from './realtime.ts';
import { push } from './services/notify.ts';
import { ritualState } from './services/posts.ts';
import { generateRecap, generateWall, weekTitle } from './services/walls.ts';
import { closeGame, currentGame, startWeeklyGame } from './services/games.ts';
import { grantPack } from './services/cards.ts';
import { planTick } from './services/plans.ts';
import { platform } from './platform.ts';

/**
 * The weekly ritual clock (Locket Rollcall + Lapse/Dispo "develop"):
 *   ritual day 00:00  → Live Activity starts, one ritual push ("⚠️ Time to roll. ⚠️")
 *   developHour − 3h  → one group-streak warning, only if a streak is at risk
 *   developHour       → the week's roll develops: wall + AI recap, packs for everyone who posted,
 *                       the game closes with awards, a new week's game opens
 */

export async function tickGroup(group: Group) {
  const t = now();
  const w = ritualWindow(t, group);
  const ms = members(group.id);

  // Develop any week whose develop time has passed.
  const prevKey = weekKeyOffset(w.weekKey, -1);
  for (const wk of [prevKey]) {
    const key = `develop:${group.id}:${wk}`;
    if (jobDone(key) || Date.parse(`${wk}T00:00:00Z`) < group.createdAt - 8 * 86_400_000) continue;
    markJob(key);
    await developWeek(group, wk);
  }

  if (w.isOpen) {
    const key = `ritual_open:${group.id}:${w.weekKey}`;
    if (!jobDone(key)) {
      markJob(key);
      insertMessage({ groupId: group.id, userId: null, kind: 'system', body: bereal.ritualPush, meta: { ritual: w.weekKey } });
      toGroup(group.id, { type: 'ritual', groupId: group.id, posted: 0, of: ms.length });
      for (const m of ms) push({ userId: m.userId, groupId: group.id, kind: 'ritual_open', title: group.name, body: bereal.ritualPush, refIds: [`ritual:${w.weekKey}`], url: '/' });
    }
    const warnKey = `streak_warn:${group.id}:${w.weekKey}`;
    if (!jobDone(warnKey) && w.developsAt - t < 3 * 3_600_000) {
      markJob(warnKey);
      const s = ritualState(group);
      if (s.streak.atRisk) {
        for (const m of ms) {
          if (s.posters.some((p) => p.id === m.userId)) continue;
          push({ userId: m.userId, groupId: group.id, kind: 'streak_warning', title: group.name, body: duolingo.dontLetDown(group.mascot.name), refIds: [`streak:${w.weekKey}`], url: '/' });
        }
      }
    }
  }

  // Every week has a game.
  if (!currentGame(group)) await startWeeklyGame(group);
}

export async function developWeek(group: Group, weekKey: string, at = now()) {
  const ms = members(group.id);
  const wall = generateWall(group, weekKey, 'mosaic');
  if (wall) await generateRecap(group, weekKey, null).catch((e) => console.warn('[develop] recap failed', e));
  // One free pack per member who posted in the ritual; roll+ / Remix+ get one extra (spec §J).
  const ritualPosters = new Set(all<{ user_id: string }>('SELECT DISTINCT user_id FROM posts WHERE group_id = ? AND week_key = ? AND ritual = 1', group.id, weekKey).map((r) => r.user_id));
  const anyPosters = new Set(all<{ user_id: string }>('SELECT DISTINCT user_id FROM posts WHERE group_id = ? AND week_key = ?', group.id, weekKey).map((r) => r.user_id));
  for (const m of ms) {
    if (ritualPosters.has(m.userId)) grantPack(m.userId, group.id, weekKey, 'ritual');
    if (PLANS[m.user.plan].extraWeeklyPack && anyPosters.has(m.userId)) grantPack(m.userId, group.id, weekKey, 'plus');
  }
  const game = all<{ id: string }>('SELECT id FROM games WHERE group_id = ? AND week_key = ? AND closed_at IS NULL', group.id, weekKey)[0];
  if (game) {
    const res = closeGame(group, game.id);
    if (res?.results.length) insertMessage({ groupId: group.id, userId: null, kind: 'gm', body: locket.rollcallStep4, refId: game.id, meta: { results: true }, createdAt: at + 1000 });
  }
  updateMascot(group.id, (m) => ({ ...m, xp: m.xp + anyPosters.size * 3 }));
  if (wall) {
    insertMessage({ groupId: group.id, userId: null, kind: 'system', body: weekTitle(weekKey), refId: weekKey, meta: { developed: weekKey }, createdAt: at });
    toGroup(group.id, { type: 'developed', groupId: group.id, weekKey });
    for (const m of ms) push({ userId: m.userId, groupId: group.id, kind: 'roll_developed', title: group.name, body: locket.rollcallTagline, refIds: [`wall:${weekKey}`], url: `/g/${group.id}/week/${weekKey}` });
  }
}

let timer: ReturnType<typeof setInterval> | null = null;

/** One pass of every scheduled job. The in-Claude build calls this from the page that holds the jobs lease. */
export async function runJobsOnce() {
  platform.jobDepth++;
  try {
    for (const g of allGroups()) {
      try {
        await tickGroup(g);
      } catch (e) {
        console.warn('[jobs] group tick failed', g.id, e);
      }
    }
    try {
      planTick();
    } catch (e) {
      console.warn('[jobs] plan tick failed', e);
    }
  } finally {
    platform.jobDepth--;
  }
}

export function startJobs(intervalMs = 30_000) {
  void runJobsOnce();
  timer = setInterval(() => void runJobsOnce(), intervalMs);
  return () => timer && clearInterval(timer);
}
