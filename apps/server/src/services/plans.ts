import { MASCOT_XP, STORAGE, type Group } from '@app/shared';
import { all, get, json, now, run } from '../db.ts';
import { getUser, id, insertMessage, members, membership, postsForGroup, publicUser, updateMascot } from '../repo.ts';
import { toGroup } from '../realtime.ts';
import { push } from './notify.ts';
import { GameError } from './cards.ts';
import { toDTO } from './posts.ts';

/**
 * Plans (spec §P): Partiful's event card inside the group — themes/effects/title fonts, RSVP
 * Going / Maybe / Can't Go, a "Find a Time" poll (Yes / No / Maybe per option, "Pick this"),
 * Text Blasts (max 10), auto-reminders (1 week before for Invited/Maybe, 2 hours before for Going),
 * and a shared album that expires after 30 days unless kept (iOS 27 temporary albums, spec §T).
 */

/** Partiful's internal theme/effect/title-font ids observed in live create URLs (research/04 §3.1). */
export const PLAN_THEMES = ['cloudflow', 'rainbowGlitter', 'phantom'] as const;
export const PLAN_EFFECTS = ['none', 'sunbeams', 'fireworks'] as const;
export const PLAN_FONTS = ['manrope', 'display'] as const;
export const RSVP = ['going', 'maybe', 'cant_go'] as const;
export type RsvpStatus = (typeof RSVP)[number];
export const MAX_BLASTS = 10;

type PlanRow = {
  id: string; group_id: string; created_by: string; title: string; theme: string; effect: string; title_font: string; starts_at: number | null;
  location: string | null; details: string | null; options: string; album_expires_at: number | null; album_kept: number; created_at: number;
};

export function createPlan(group: Group, userId: string, input: { title: string; theme?: string; effect?: string; titleFont?: string; startsAt?: number | null; options?: number[]; location?: string; details?: string }) {
  const pid = id('pl');
  const theme = PLAN_THEMES.includes(input.theme as never) ? input.theme! : 'cloudflow';
  const effect = PLAN_EFFECTS.includes(input.effect as never) ? input.effect! : 'sunbeams';
  const font = PLAN_FONTS.includes(input.titleFont as never) ? input.titleFont! : 'manrope';
  const options = (input.options ?? []).slice(0, 6);
  run(
    'INSERT INTO plans (id, group_id, created_by, title, theme, effect, title_font, starts_at, location, details, options, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    pid, group.id, userId, input.title.slice(0, 80), theme, effect, font, input.startsAt ?? null, input.location ?? null, input.details ?? null, json.str(options), now(),
  );
  run('INSERT INTO plan_rsvps (plan_id, user_id, status, updated_at) VALUES (?, ?, ?, ?)', pid, userId, 'going', now());
  updateMascot(group.id, (m) => ({ ...m, xp: m.xp + MASCOT_XP.plan }));
  const msg = insertMessage({ groupId: group.id, userId, kind: 'plan', refId: pid, body: input.title });
  toGroup(group.id, { type: 'message', groupId: group.id, messageId: msg.id });
  const creator = getUser(userId)!;
  for (const m of members(group.id)) {
    if (m.userId === userId) continue;
    push({ userId: m.userId, groupId: group.id, kind: 'plan', title: `${creator.name} made a plan`, body: input.title, refIds: [pid], url: `/plan/${pid}` });
  }
  return pid;
}

export function planView(planId: string, viewerId: string) {
  const p = get<PlanRow>('SELECT * FROM plans WHERE id = ?', planId);
  if (!p) return null;
  const m = membership(p.group_id, viewerId);
  if (!m) return null;
  const rsvps = all<{ user_id: string; status: RsvpStatus }>('SELECT user_id, status FROM plan_rsvps WHERE plan_id = ?', planId);
  const votes = all<{ user_id: string; option: number; vote: string }>('SELECT user_id, option, vote FROM plan_votes WHERE plan_id = ?', planId);
  const ms = members(p.group_id);
  const users = new Map(ms.map((x) => [x.userId, publicUser(x.user)]));
  const album = toDTO(postsForGroup(p.group_id).filter((x) => x.planId === planId), viewerId);
  return {
    id: p.id, groupId: p.group_id, title: p.title, theme: p.theme, effect: p.effect, titleFont: p.title_font, startsAt: p.starts_at, location: p.location,
    details: p.details, createdAt: p.created_at, createdBy: users.get(p.created_by) ?? null,
    options: json.parse<number[]>(p.options, []).map((t, i) => ({ at: t, votes: votes.filter((v) => v.option === i).map((v) => ({ user: users.get(v.user_id) ?? null, vote: v.vote })) })),
    // Partiful: guests see Going and Maybe lists, never who can't go.
    going: rsvps.filter((r) => r.status === 'going').map((r) => users.get(r.user_id)).filter(Boolean),
    maybe: rsvps.filter((r) => r.status === 'maybe').map((r) => users.get(r.user_id)).filter(Boolean),
    cantGoCount: rsvps.filter((r) => r.status === 'cant_go').length,
    invited: ms.filter((x) => !rsvps.some((r) => r.user_id === x.userId)).map((x) => publicUser(x.user)),
    mine: rsvps.find((r) => r.user_id === viewerId)?.status ?? null,
    isHost: p.created_by === viewerId,
    album,
    albumExpiresAt: p.album_expires_at,
    albumKept: !!p.album_kept,
    blastsLeft: MAX_BLASTS - (get<{ n: number }>("SELECT COUNT(*) AS n FROM messages WHERE ref_id = ? AND json_extract(meta, '$.blast') = 1", planId)?.n ?? 0),
  };
}

export function plansFor(groupId: string, viewerId: string) {
  return all<{ id: string }>('SELECT id FROM plans WHERE group_id = ? ORDER BY COALESCE(starts_at, created_at) DESC', groupId).map((p) => planView(p.id, viewerId)).filter(Boolean);
}

function planRow(planId: string) {
  const p = get<PlanRow>('SELECT * FROM plans WHERE id = ?', planId);
  if (!p) throw new GameError('not_found');
  return p;
}

export function rsvp(planId: string, userId: string, status: RsvpStatus) {
  const p = planRow(planId);
  if (!membership(p.group_id, userId)) throw new GameError('forbidden');
  if (p.starts_at && p.starts_at + 6 * 3_600_000 < now()) throw new GameError('ended', "RSVPs can't change after the event has ended");
  run('INSERT OR REPLACE INTO plan_rsvps (plan_id, user_id, status, updated_at) VALUES (?, ?, ?, ?)', planId, userId, status, now());
  toGroup(p.group_id, { type: 'group', groupId: p.group_id });
}

export function votePlan(planId: string, userId: string, option: number, vote: 'yes' | 'no' | 'maybe') {
  const p = planRow(planId);
  if (!membership(p.group_id, userId)) throw new GameError('forbidden');
  run('INSERT OR REPLACE INTO plan_votes (plan_id, user_id, option, vote) VALUES (?, ?, ?, ?)', planId, userId, option, vote);
}

/** "Pick this": the host fixes the time and poll answers convert into RSVPs. */
export function pickOption(planId: string, userId: string, option: number) {
  const p = planRow(planId);
  if (p.created_by !== userId) throw new GameError('host_only');
  const at = json.parse<number[]>(p.options, [])[option];
  if (!at) throw new GameError('bad_option');
  run('UPDATE plans SET starts_at = ?, options = ? WHERE id = ?', at, '[]', planId);
  for (const v of all<{ user_id: string; vote: string }>('SELECT user_id, vote FROM plan_votes WHERE plan_id = ? AND option = ?', planId, option)) {
    const status: RsvpStatus = v.vote === 'yes' ? 'going' : v.vote === 'maybe' ? 'maybe' : 'cant_go';
    run('INSERT OR REPLACE INTO plan_rsvps (plan_id, user_id, status, updated_at) VALUES (?, ?, ?, ?)', planId, v.user_id, status, now());
  }
  run('DELETE FROM plan_votes WHERE plan_id = ?', planId);
}

export function blast(planId: string, userId: string, text: string, audience: RsvpStatus[] | 'all' = 'all') {
  const p = planRow(planId);
  if (p.created_by !== userId) throw new GameError('host_only');
  const sent = get<{ n: number }>("SELECT COUNT(*) AS n FROM messages WHERE ref_id = ? AND json_extract(meta, '$.blast') = 1", planId)?.n ?? 0;
  if (sent >= MAX_BLASTS) throw new GameError('blast_limit', `Hosts can send up to ${MAX_BLASTS} blasts per plan`);
  const msg = insertMessage({ groupId: p.group_id, userId, kind: 'text', body: text.slice(0, 500), refId: planId, meta: { blast: 1, planTitle: p.title } });
  toGroup(p.group_id, { type: 'message', groupId: p.group_id, messageId: msg.id });
  const rsvps = new Map(all<{ user_id: string; status: RsvpStatus }>('SELECT user_id, status FROM plan_rsvps WHERE plan_id = ?', planId).map((r) => [r.user_id, r.status]));
  for (const m of members(p.group_id)) {
    if (m.userId === userId) continue;
    if (audience !== 'all' && !audience.includes(rsvps.get(m.userId) ?? ('invited' as RsvpStatus))) continue;
    push({ userId: m.userId, groupId: p.group_id, kind: 'plan', title: p.title, body: text.slice(0, 140), refIds: [msg.id], url: `/plan/${planId}` });
  }
  return msg.id;
}

export function keepAlbum(planId: string, userId: string) {
  const p = planRow(planId);
  if (!membership(p.group_id, userId)) throw new GameError('forbidden');
  run('UPDATE plans SET album_kept = 1 WHERE id = ?', planId);
}

/** Jobs: reminders and album expiry. */
export function planTick() {
  const t = now();
  const plans = all<PlanRow>('SELECT * FROM plans WHERE starts_at IS NOT NULL');
  for (const p of plans) {
    if (!p.album_expires_at && p.starts_at! < t) run('UPDATE plans SET album_expires_at = ? WHERE id = ?', p.starts_at! + STORAGE.eventAlbumTtlDays * 86_400_000, p.id);
    if (p.album_expires_at && !p.album_kept && p.album_expires_at < t) {
      run('DELETE FROM posts WHERE plan_id = ?', p.id);
      run('UPDATE plans SET album_expires_at = NULL, album_kept = -1 WHERE id = ?', p.id);
    }
    const rsvps = new Map(all<{ user_id: string; status: RsvpStatus }>('SELECT user_id, status FROM plan_rsvps WHERE plan_id = ?', p.id).map((r) => [r.user_id, r.status]));
    const remind = (key: string, when: number, who: (s: RsvpStatus | undefined) => boolean, body: string) => {
      if (t < when || t > p.starts_at! || get('SELECT 1 FROM jobs_done WHERE key = ?', key)) return;
      run('INSERT OR IGNORE INTO jobs_done (key, at) VALUES (?, ?)', key, t);
      for (const m of members(p.group_id)) if (who(rsvps.get(m.userId))) push({ userId: m.userId, groupId: p.group_id, kind: 'plan', title: p.title, body, refIds: [`${key}:${m.userId}`], url: `/plan/${p.id}` });
    };
    remind(`plan_week:${p.id}`, p.starts_at! - 7 * 86_400_000, (s) => s === undefined || s === 'maybe', 'Happening in a week — are you in?');
    remind(`plan_2h:${p.id}`, p.starts_at! - 2 * 3_600_000, (s) => s === 'going', 'Starts in 2 hours');
  }
}
