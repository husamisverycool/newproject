import { MASCOT_XP, STORAGE, ios, partiful, type Group } from '@app/shared';
import { all, get, json, now, run, tx } from '../db.ts';
import { getUser, id, insertMessage, members, membership, postsForGroup, publicUser, updateMascot } from '../repo.ts';
import { toGroup } from '../realtime.ts';
import { push } from './notify.ts';
import { GameError } from './cards.ts';
import { toDTO } from './posts.ts';

/**
 * Plans (spec §P): Partiful's event card inside the group — themes/effects/title fonts, RSVP
 * Going / Maybe / Can't Go, a "Find a Time" poll (Yes / No / Maybe per option, "Pick this"),
 * Text Blasts (max 10, "You can send a photo along with your message"), auto-reminders (1 week before
 * for Invited/Maybe, 2 hours before for Going), and a shared album that expires after 30 days unless
 * kept (iOS 27 temporary albums, spec §T). Added from the same sources (research/15 §2, research/21):
 * - the poster: "upload your own photo" [V] (Apple Invites "Add Background" → "Photos" / "Camera" [V]);
 * - "Edit" on the event page [V]; WhatsApp notifies Going / Going with guest / Maybe when the creator
 *   edits or cancels [V];
 * - +1s: Settings > RSVPs "number of +1s (default one +1 per guest)" [V]; the RSVP screen holds the
 *   attendee count (+1s) and an optional comment [V-weak]; Apple Invites' note "visible to the host and
 *   other guests" [V];
 * - Activity Feed comments with photos; "@" tags notify the tagged guest [V]; "hide Activity Feed
 *   timestamps" [V].
 */

/** Partiful's internal theme/effect/title-font ids observed in live create URLs (research/04 §3.1). */
export const PLAN_THEMES = ['cloudflow', 'rainbowGlitter', 'phantom'] as const;
export const PLAN_EFFECTS = ['none', 'sunbeams', 'fireworks'] as const;
export const PLAN_FONTS = ['manrope', 'display'] as const;
export const RSVP = ['going', 'maybe', 'cant_go'] as const;
export type RsvpStatus = (typeof RSVP)[number];
export const MAX_BLASTS = 10;
/** Partiful's largest +1 allowance is UNKNOWN; the host's stepper is bounded here (engineering limit, not a source value). */
export const MAX_PLUS_ONES = 5;

type PlanRow = {
  id: string; group_id: string; created_by: string; title: string; theme: string; effect: string; title_font: string; starts_at: number | null;
  location: string | null; details: string | null; options: string; album_expires_at: number | null; album_kept: number; created_at: number;
};

export interface PlanSettings { maybe: boolean; showGuestList: boolean; showGuestCount: boolean; plusOnes: number; hideTimestamps: boolean }
const DEFAULT_SETTINGS: PlanSettings = { maybe: true, showGuestList: true, showGuestCount: true, plusOnes: partiful.defaultPlusOnes, hideTimestamps: false };
const planSettings = (planId: string): PlanSettings => ({ ...DEFAULT_SETTINGS, ...json.parse<Partial<PlanSettings>>(get<{ settings: string }>('SELECT settings FROM plan_settings WHERE plan_id = ?', planId)?.settings ?? '{}', {}) });

function cleanSettings(input: Partial<PlanSettings> | undefined, base: PlanSettings): PlanSettings {
  const i = input ?? {};
  return {
    maybe: i.maybe === undefined ? base.maybe : i.maybe !== false,
    showGuestList: i.showGuestList === undefined ? base.showGuestList : i.showGuestList !== false,
    showGuestCount: i.showGuestCount === undefined ? base.showGuestCount : i.showGuestCount !== false,
    plusOnes: i.plusOnes === undefined ? base.plusOnes : Math.max(0, Math.min(MAX_PLUS_ONES, Math.round(Number(i.plusOnes) || 0))),
    hideTimestamps: i.hideTimestamps === undefined ? base.hideTimestamps : i.hideTimestamps === true,
  };
}

export interface PlanInput {
  title: string;
  theme?: string;
  effect?: string;
  titleFont?: string;
  startsAt?: number | null;
  options?: number[];
  location?: string | null;
  details?: string | null;
  settings?: Partial<PlanSettings>;
}

const pickTheme = (v: string | undefined, fallback: string) => (PLAN_THEMES.includes(v as never) ? v! : fallback);
const pickEffect = (v: string | undefined, fallback: string) => (PLAN_EFFECTS.includes(v as never) ? v! : fallback);
const pickFont = (v: string | undefined, fallback: string) => (PLAN_FONTS.includes(v as never) ? v! : fallback);
const cleanOptions = (v: unknown) => (Array.isArray(v) ? v.map(Number).filter((t) => Number.isFinite(t) && t > 0).slice(0, 6) : []);

export function createPlan(group: Group, userId: string, input: PlanInput) {
  const pid = id('pl');
  const title = String(input.title ?? '').trim().slice(0, 80);
  if (!title) throw new GameError('name_required');
  const options = cleanOptions(input.options);
  run(
    'INSERT INTO plans (id, group_id, created_by, title, theme, effect, title_font, starts_at, location, details, options, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    pid, group.id, userId, title, pickTheme(input.theme, 'cloudflow'), pickEffect(input.effect, 'sunbeams'), pickFont(input.titleFont, 'manrope'),
    input.startsAt ?? null, input.location?.slice(0, 120) || null, input.details?.slice(0, 2048) || null, json.str(options), now(),
  );
  run('INSERT INTO plan_rsvps (plan_id, user_id, status, updated_at) VALUES (?, ?, ?, ?)', pid, userId, 'going', now());
  if (input.settings) run('INSERT OR REPLACE INTO plan_settings (plan_id, settings) VALUES (?, ?)', pid, json.str(cleanSettings(input.settings, DEFAULT_SETTINGS)));
  updateMascot(group.id, (m) => ({ ...m, xp: m.xp + MASCOT_XP.plan }));
  const msg = insertMessage({ groupId: group.id, userId, kind: 'plan', refId: pid, body: title });
  toGroup(group.id, { type: 'message', groupId: group.id, messageId: msg.id });
  const creator = getUser(userId)!;
  for (const m of members(group.id)) {
    if (m.userId === userId) continue;
    push({ userId: m.userId, groupId: group.id, kind: 'plan', title, body: partiful.hostedBy(creator.name.split(' ')[0]), refIds: [pid], url: `/plan/${pid}` });
  }
  return pid;
}

/**
 * "Edit" [V]: the host changes any field. Changing the Find a Time options clears the votes (the answers
 * belonged to other times). WhatsApp: Going, Going with guest and Maybe responders are notified when the
 * creator edits [V]; the notice wording is UNKNOWN, so it carries the plan's title and time, like the
 * reminders.
 */
export function updatePlan(planId: string, userId: string, input: Partial<PlanInput>) {
  const p = planRow(planId);
  if (p.created_by !== userId) throw new GameError('host_only');
  const title = input.title === undefined ? p.title : String(input.title).trim().slice(0, 80) || p.title;
  const options = input.options === undefined ? json.parse<number[]>(p.options, []) : cleanOptions(input.options);
  const startsAt = input.startsAt === undefined ? p.starts_at : input.startsAt ? Number(input.startsAt) : null;
  const optionsChanged = json.str(options) !== json.str(json.parse<number[]>(p.options, []));
  const timeChanged = startsAt !== p.starts_at;
  tx(() => {
    run(
      'UPDATE plans SET title = ?, theme = ?, effect = ?, title_font = ?, starts_at = ?, location = ?, details = ?, options = ? WHERE id = ?',
      title, pickTheme(input.theme, p.theme), pickEffect(input.effect, p.effect), pickFont(input.titleFont, p.title_font), startsAt,
      input.location === undefined ? p.location : input.location?.slice(0, 120) || null,
      input.details === undefined ? p.details : input.details?.slice(0, 2048) || null,
      json.str(options), planId,
    );
    if (optionsChanged) run('DELETE FROM plan_votes WHERE plan_id = ?', planId);
    if (input.settings) run('INSERT OR REPLACE INTO plan_settings (plan_id, settings) VALUES (?, ?)', planId, json.str(cleanSettings(input.settings, planSettings(planId))));
    if (timeChanged) run('UPDATE plans SET album_expires_at = NULL WHERE id = ? AND album_kept = 0', planId);
    run("UPDATE messages SET body = ? WHERE kind = 'plan' AND ref_id = ?", title, planId);
  });
  if (timeChanged || optionsChanged || title !== p.title) {
    const rsvps = all<{ user_id: string; status: RsvpStatus; updated_at: number }>('SELECT user_id, status, updated_at FROM plan_rsvps WHERE plan_id = ?', planId);
    for (const r of rsvps) {
      if (r.user_id === userId || (r.status !== 'going' && r.status !== 'maybe')) continue;
      push({ userId: r.user_id, groupId: p.group_id, kind: 'plan', title, body: startsAt ? ios.dateTime(startsAt) : partiful.findATime, refIds: [planId, `plan_edit:${planId}:${now()}`], url: `/plan/${planId}` });
    }
  }
  toGroup(p.group_id, { type: 'message', groupId: p.group_id, messageId: planId });
}

/** Delete [HIG]: the plan, its RSVPs, votes, comments and poster go; the album's photos stay in the group. */
export function deletePlan(planId: string, userId: string) {
  const p = planRow(planId);
  if (p.created_by !== userId) throw new GameError('host_only');
  tx(() => {
    run("DELETE FROM messages WHERE kind = 'plan' AND ref_id = ?", planId);
    run('UPDATE posts SET plan_id = NULL WHERE plan_id = ?', planId);
    for (const t of ['plan_rsvps', 'plan_votes', 'plan_settings', 'plan_posters', 'plan_guests', 'plan_comments']) run(`DELETE FROM ${t} WHERE plan_id = ?`, planId);
    run('DELETE FROM plans WHERE id = ?', planId);
  });
  toGroup(p.group_id, { type: 'message', groupId: p.group_id, messageId: planId });
}

/** The poster [V]: a photo the host uploaded, or null for the typographic poster in the theme's colors. */
export function setPoster(planId: string, userId: string, media: string | null) {
  const p = planRow(planId);
  if (p.created_by !== userId) throw new GameError('host_only');
  if (media) run('INSERT OR REPLACE INTO plan_posters (plan_id, media, created_at) VALUES (?, ?, ?)', planId, media, now());
  else run('DELETE FROM plan_posters WHERE plan_id = ?', planId);
  toGroup(p.group_id, { type: 'message', groupId: p.group_id, messageId: planId });
}

type FeedItem =
  | { kind: 'comment'; id: string; user: ReturnType<typeof publicUser> | null; body: string | null; media: string | null; createdAt: number | null; canDelete: boolean }
  | { kind: 'blast'; id: string; user: ReturnType<typeof publicUser> | null; body: string | null; media: string | null; createdAt: number | null }
  | { kind: 'rsvp'; id: string; user: ReturnType<typeof publicUser> | null; status: RsvpStatus; plusOnes: number; note: string; createdAt: number | null };

export function planView(planId: string, viewerId: string) {
  const p = get<PlanRow>('SELECT * FROM plans WHERE id = ?', planId);
  if (!p) return null;
  const m = membership(p.group_id, viewerId);
  if (!m) return null;
  const rsvps = all<{ user_id: string; status: RsvpStatus; updated_at: number }>('SELECT user_id, status, updated_at FROM plan_rsvps WHERE plan_id = ?', planId);
  const extra = new Map(all<{ user_id: string; plus_ones: number; note: string | null; updated_at: number }>('SELECT user_id, plus_ones, note, updated_at FROM plan_guests WHERE plan_id = ?', planId).map((r) => [r.user_id, r]));
  const votes = all<{ user_id: string; option: number; vote: string }>('SELECT user_id, option, vote FROM plan_votes WHERE plan_id = ?', planId);
  const ms = members(p.group_id);
  const users = new Map(ms.map((x) => [x.userId, publicUser(x.user)]));
  const album = toDTO(postsForGroup(p.group_id).filter((x) => x.planId === planId), viewerId);
  const st = planSettings(planId);
  const host = p.created_by === viewerId;
  const stamp = (t: number) => (st.hideTimestamps && !host ? null : t);
  // Partiful: guests see the Going and Maybe lists, never who can't go; the host's Display + Privacy
  // settings can hide the list or the count from guests [V].
  const listVisible = st.showGuestList || host;
  const guestRow = (r: { user_id: string; status: RsvpStatus; updated_at: number }) => ({
    user: users.get(r.user_id) ?? null, status: r.status, plusOnes: r.status === 'cant_go' ? 0 : extra.get(r.user_id)?.plus_ones ?? 0, note: extra.get(r.user_id)?.note ?? null,
  });
  const guests = rsvps
    .filter((r) => users.has(r.user_id) && (r.user_id === viewerId || (listVisible && (r.status !== 'cant_go' || host))))
    .map(guestRow);
  const going = rsvps.filter((r) => r.status === 'going');
  const plusOf = (rs: typeof rsvps) => rs.reduce((n, r) => n + (extra.get(r.user_id)?.plus_ones ?? 0), 0);
  const blasts = all<{ id: string; user_id: string | null; body: string | null; media: string | null; created_at: number }>(
    "SELECT id, user_id, body, media, created_at FROM messages WHERE ref_id = ? AND json_extract(meta, '$.blast') = 1", planId,
  );
  const comments = all<{ id: string; user_id: string; body: string | null; media: string | null; created_at: number }>('SELECT * FROM plan_comments WHERE plan_id = ?', planId);
  const feed: (FeedItem & { at: number })[] = [
    ...comments.map((c) => ({ kind: 'comment' as const, id: c.id, user: users.get(c.user_id) ?? null, body: c.body, media: c.media, createdAt: stamp(c.created_at), at: c.created_at, canDelete: c.user_id === viewerId || host })),
    ...blasts.map((b) => ({ kind: 'blast' as const, id: b.id, user: b.user_id ? users.get(b.user_id) ?? null : null, body: b.body, media: b.media, createdAt: stamp(b.created_at), at: b.created_at })),
    ...rsvps
      .filter((r) => extra.get(r.user_id)?.note && (r.user_id === viewerId || (listVisible && (r.status !== 'cant_go' || host))))
      .map((r) => ({ kind: 'rsvp' as const, id: `rsvp:${r.user_id}`, user: users.get(r.user_id) ?? null, status: r.status, plusOnes: guestRow(r).plusOnes, note: extra.get(r.user_id)!.note!, createdAt: stamp(extra.get(r.user_id)!.updated_at), at: extra.get(r.user_id)!.updated_at })),
  ].sort((a, b) => b.at - a.at);
  const poster = get<{ media: string }>('SELECT media FROM plan_posters WHERE plan_id = ?', planId)?.media ?? null;
  const mine = rsvps.find((r) => r.user_id === viewerId);
  return {
    id: p.id, groupId: p.group_id, title: p.title, theme: p.theme, effect: p.effect, titleFont: p.title_font, startsAt: p.starts_at, location: p.location,
    details: p.details, createdAt: p.created_at, createdBy: users.get(p.created_by) ?? null, poster,
    options: json.parse<number[]>(p.options, []).map((t, i) => ({ at: t, votes: votes.filter((v) => v.option === i).map((v) => ({ user: users.get(v.user_id) ?? null, vote: v.vote })) })),
    settings: st,
    going: !listVisible ? [] : going.map((r) => users.get(r.user_id)).filter(Boolean),
    maybe: !listVisible ? [] : rsvps.filter((r) => r.status === 'maybe').map((r) => users.get(r.user_id)).filter(Boolean),
    guests,
    // "# Going" counts each guest's +1s too (the RSVP screen's attendee count, research/21 §1).
    goingCount: !st.showGuestCount && !host ? null : going.length + plusOf(going),
    cantGoCount: rsvps.filter((r) => r.status === 'cant_go').length,
    invited: ms.filter((x) => !rsvps.some((r) => r.user_id === x.userId)).map((x) => publicUser(x.user)),
    mine: mine?.status ?? null,
    myPlusOnes: mine && mine.status !== 'cant_go' ? extra.get(viewerId)?.plus_ones ?? 0 : 0,
    myNote: extra.get(viewerId)?.note ?? null,
    isHost: host,
    album,
    albumExpiresAt: p.album_expires_at,
    albumKept: p.album_kept === 1,
    blastsLeft: MAX_BLASTS - blasts.length,
    feed: feed.map(({ at: _at, ...item }) => item),
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

export function rsvp(planId: string, userId: string, status: RsvpStatus, extra: { plusOnes?: number; note?: string | null } = {}) {
  const p = planRow(planId);
  if (!membership(p.group_id, userId)) throw new GameError('forbidden');
  if (!RSVP.includes(status)) throw new GameError('bad_status');
  if (p.starts_at && p.starts_at + 6 * 3_600_000 < now()) throw new GameError('ended', '');
  const st = planSettings(planId);
  if (status === 'maybe' && !st.maybe) throw new GameError('no_maybe', '');
  run('INSERT OR REPLACE INTO plan_rsvps (plan_id, user_id, status, updated_at) VALUES (?, ?, ?, ?)', planId, userId, status, now());
  if (extra.plusOnes !== undefined || extra.note !== undefined) {
    const cur = get<{ plus_ones: number; note: string | null }>('SELECT plus_ones, note FROM plan_guests WHERE plan_id = ? AND user_id = ?', planId, userId);
    const plusOnes = status === 'cant_go' ? 0 : Math.max(0, Math.min(st.plusOnes, Math.round(Number(extra.plusOnes ?? cur?.plus_ones ?? 0) || 0)));
    const note = extra.note === undefined ? cur?.note ?? null : String(extra.note ?? '').trim().slice(0, 280) || null;
    run('INSERT OR REPLACE INTO plan_guests (plan_id, user_id, plus_ones, note, updated_at) VALUES (?, ?, ?, ?, ?)', planId, userId, plusOnes, note, now());
  } else if (status === 'cant_go') run('UPDATE plan_guests SET plus_ones = 0 WHERE plan_id = ? AND user_id = ?', planId, userId);
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

/** Text Blast [V]; "You can send a photo along with your message" [V]. */
export function blast(planId: string, userId: string, text: string, audience: RsvpStatus[] | 'all' = 'all', media: string | null = null) {
  const p = planRow(planId);
  if (p.created_by !== userId) throw new GameError('host_only');
  const body = String(text ?? '').trim().slice(0, 500);
  if (!body && !media) throw new GameError('empty');
  const sent = get<{ n: number }>("SELECT COUNT(*) AS n FROM messages WHERE ref_id = ? AND json_extract(meta, '$.blast') = 1", planId)?.n ?? 0;
  if (sent >= MAX_BLASTS) throw new GameError('blast_limit', ios.ofUsed(MAX_BLASTS, MAX_BLASTS));
  const msg = insertMessage({ groupId: p.group_id, userId, kind: media ? 'photo' : 'text', body: body || null, media, refId: planId, meta: { blast: 1, planTitle: p.title } });
  toGroup(p.group_id, { type: 'message', groupId: p.group_id, messageId: msg.id });
  const rsvps = new Map(all<{ user_id: string; status: RsvpStatus }>('SELECT user_id, status FROM plan_rsvps WHERE plan_id = ?', planId).map((r) => [r.user_id, r.status]));
  for (const m of members(p.group_id)) {
    if (m.userId === userId) continue;
    if (audience !== 'all' && !audience.includes(rsvps.get(m.userId) ?? ('invited' as RsvpStatus))) continue;
    push({ userId: m.userId, groupId: p.group_id, kind: 'plan', title: p.title, body: (body || p.title).slice(0, 140), refIds: [planId, msg.id], url: `/plan/${planId}` });
  }
  return msg.id;
}

/** Activity Feed comment [V] with an optional photo [V]; "@" tags notify the tagged guests [V]. */
export function addComment(planId: string, userId: string, input: { body?: string | null; media?: string | null; mentions?: string[] }) {
  const p = planRow(planId);
  if (!membership(p.group_id, userId)) throw new GameError('forbidden');
  const body = String(input.body ?? '').trim().slice(0, 1000) || null;
  if (!body && !input.media) throw new GameError('empty');
  const ms = members(p.group_id);
  const mentions = [...new Set((input.mentions ?? []).filter((u) => u !== userId && ms.some((m) => m.userId === u)))].slice(0, 30);
  const cid = id('pc');
  run('INSERT INTO plan_comments (id, plan_id, user_id, body, media, mentions, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)', cid, planId, userId, body, input.media ?? null, json.str(mentions), now());
  for (const u of mentions) push({ userId: u, groupId: p.group_id, kind: 'plan', title: p.title, body: (body ?? p.title).slice(0, 140), refIds: [planId, cid], url: `/plan/${planId}` });
  toGroup(p.group_id, { type: 'message', groupId: p.group_id, messageId: cid });
  return cid;
}

export function deleteComment(planId: string, commentId: string, userId: string) {
  const p = planRow(planId);
  const c = get<{ user_id: string }>('SELECT user_id FROM plan_comments WHERE id = ? AND plan_id = ?', commentId, planId);
  if (!c) throw new GameError('not_found');
  if (c.user_id !== userId && p.created_by !== userId) throw new GameError('forbidden');
  run('DELETE FROM plan_comments WHERE id = ?', commentId);
  toGroup(p.group_id, { type: 'message', groupId: p.group_id, messageId: commentId });
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
    // Partiful Auto-Reminders [V] schedule; their wording is UNKNOWN, so a reminder carries only the plan's title and time.
    const remind = (key: string, when: number, who: (s: RsvpStatus | undefined) => boolean) => {
      const body = ios.dateTime(p.starts_at!);
      if (t < when || t > p.starts_at! || get('SELECT 1 FROM jobs_done WHERE key = ?', key)) return;
      run('INSERT OR IGNORE INTO jobs_done (key, at) VALUES (?, ?)', key, t);
      for (const m of members(p.group_id)) if (who(rsvps.get(m.userId))) push({ userId: m.userId, groupId: p.group_id, kind: 'plan', title: p.title, body, refIds: [`${key}:${m.userId}`], url: `/plan/${p.id}` });
    };
    remind(`plan_week:${p.id}`, p.starts_at! - 7 * 86_400_000, (s) => s === undefined || s === 'maybe');
    remind(`plan_2h:${p.id}`, p.starts_at! - 2 * 3_600_000, (s) => s === 'going');
  }
}
