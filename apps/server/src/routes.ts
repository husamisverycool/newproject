import { Hono, type Context } from 'hono';
import {
  BRAND,
  GROUP_MAX,
  MASCOT_SPECIES,
  PLANS,
  WALL_UNLOCK_MEMBERS,
  canJoin,
  isMinor,
  mascotStage,
  ritualWindow,
  type Plan,
  type Rarity,
  type LikenessScope,
  partiful,
  FREE_GROUP_RECAPS_PER_WEEK,
  ios,
  locket,
  snapchat,
} from '@app/shared';
import { all, get, json, now, run, setClockOffset } from './db.ts';
import { env } from './env.ts';
import { platform } from './platform.ts';
import { clearSession, createSession, currentUser, guestId, setSessionCookie } from './auth.ts';
import {
  type UserFull,
  createUser,
  getGroup,
  getPost,
  getUser,
  groupByCode,
  groupsForUser,
  id,
  insertMessage,
  inviteCode,
  members,
  membership,
  messagesFor,
  publicUser,
  updateMascot,
  updateSettings,
  updateUser,
  usersByIds,
} from './repo.ts';
import { imageSize, isGoldenHour, storeBlob, storeImage, framesToLive, storePng, readMedia } from './media.ts';
import { refreshMembership, toGroup } from './realtime.ts';
import { markRead, notificationsFor, push, savePushSubscription, vapidPublicKey } from './services/notify.ts';
import * as posts from './services/posts.ts';
import * as walls from './services/walls.ts';
import * as cards from './services/cards.ts';
import * as games from './services/games.ts';
import * as objects from './services/objects.ts';
import * as plans from './services/plans.ts';
import * as wrappedSvc from './services/wrapped.ts';
import * as shopSvc from './services/shop.ts';
import { GameError } from './services/cards.ts';
import { developWeek, tickGroup } from './jobs.ts';
import { REMIX_STYLES } from './ai/local.ts';
import { usageReport } from './ai/image.ts';
import { extra } from './routes-extra.ts';

type Env = { Variables: { user: UserFull } };
export const api = new Hono<Env>();

/* ───────────────────────── helpers ───────────────────────── */

const fail = (c: Context, status: 400 | 401 | 403 | 404 | 409 | 429, code: string, message?: string) => c.json({ error: code, message: message ?? code }, status);

api.onError((err, c) => {
  if (err instanceof GameError) return c.json({ error: err.code, message: err.message }, 400);
  console.error(err);
  return c.json({ error: 'server_error', message: (err as Error).message }, 500);
});

const PUBLIC = [/^\/api\/auth\/start$/, /^\/api\/join\//, /^\/api\/demo\/users$/, /^\/api\/demo\/login$/, /^\/api\/health$/, /^\/api\/config$/];

api.use('*', async (c, next) => {
  if (PUBLIC.some((r) => r.test(c.req.path))) return next();
  const user = currentUser(c);
  if (!user) return fail(c, 401, 'unauthenticated');
  c.set('user', user);
  return next();
});

function memberGroup(c: Context<Env>) {
  const group = getGroup(c.req.param('groupId')!);
  if (!group || !membership(group.id, c.get('user').id)) throw new GameError('not_found');
  return group;
}

async function fileBuf(v: unknown): Promise<Buffer | null> {
  if (v && typeof v === 'object' && 'arrayBuffer' in v) return Buffer.from(await (v as File).arrayBuffer());
  return null;
}

async function filesBuf(v: unknown): Promise<Buffer[]> {
  const list = Array.isArray(v) ? v : v ? [v] : [];
  const out: Buffer[] = [];
  for (const f of list) {
    const b = await fileBuf(f);
    if (b) out.push(b);
  }
  return out;
}

function groupSummary(g: NonNullable<ReturnType<typeof getGroup>>, userId: string) {
  const ms = members(g.id);
  const r = posts.ritualState(g, userId);
  return {
    id: g.id, name: g.name, emoji: g.emoji, mascot: { ...g.mascot, stage: mascotStage(g.mascot.xp) }, memberCount: ms.length,
    members: ms.slice(0, 8).map((m) => publicUser(m.user)), unlocked: ms.length >= WALL_UNLOCK_MEMBERS,
    ritual: { isOpen: r.isOpen, opensAt: r.opensAt, developsAt: r.developsAt, posted: r.posted, of: r.of, youPosted: r.youPosted, weekKey: r.weekKey, streak: r.streak.weeks },
    packs: cards.unopenedPacks(userId, g.id).length,
    unread: get<{ n: number }>("SELECT COUNT(*) AS n FROM posts p WHERE p.group_id = ? AND p.user_id != ? AND NOT EXISTS (SELECT 1 FROM views v WHERE v.user_id = ? AND v.ref_id = p.id) AND p.created_at > ?", g.id, userId, userId, now() - 7 * 86_400_000)?.n ?? 0,
  };
}

/* ───────────────────────── config / auth / me ───────────────────────── */

api.get('/health', (c) => c.json({ ok: true }));

api.get('/config', (c) =>
  c.json({ brand: BRAND, plans: PLANS, demo: env.demo, ai: { image: env.geminiKey ? 'gemini' : 'local', text: env.anthropicKey ? 'claude' : 'scripted' }, vapidPublicKey: vapidPublicKey(), remixStyles: REMIX_STYLES, species: MASCOT_SPECIES }),
);

api.post('/auth/start', async (c) => {
  const body = await c.req.json<{ name: string; birthYear: number; timeZone?: string; color?: string }>();
  const name = String(body.name ?? '').trim().slice(0, 32);
  const birthYear = Number(body.birthYear);
  if (!name) return fail(c, 400, 'name_required');
  if (!(birthYear > 1900 && birthYear <= new Date().getFullYear() - 13)) return fail(c, 400, 'age', snapchat.whensYourBirthday);
  const palette = ['#FFC800', '#1CB0F6', '#CE82FF', '#58CC02', '#FF9600', '#FF4B4B', '#2B70C9'];
  const external = platform.userIdFor?.(c) ?? undefined;
  if (external && getUser(external)) return c.json({ user: getUser(external) });
  const user = createUser({ id: external, name, birthYear, color: body.color ?? palette[Math.floor(Math.random() * palette.length)], timeZone: body.timeZone });
  setSessionCookie(c, createSession(user.id));
  return c.json({ user });
});

api.post('/auth/logout', (c) => {
  clearSession(c);
  return c.json({ ok: true });
});

api.get('/me', (c) => {
  const u = c.get('user');
  const groups = groupsForUser(u.id).map((g) => groupSummary(g, u.id));
  return c.json({
    user: { ...u, minor: isMinor(u) },
    groups,
    ai: objects.aiStatus(u),
    unread: get<{ n: number }>('SELECT COUNT(*) AS n FROM notifications WHERE user_id = ? AND read_at IS NULL', u.id)?.n ?? 0,
    stickers: objects.stickersFor(u.id),
    likeness: objects.likenessOf(u.id),
    owned: [...shopSvc.owned(u.id)],
  });
});

api.patch('/me', async (c) => {
  const u = c.get('user');
  const b = await c.req.json<{ name?: string; likenessScope?: LikenessScope; likenessAllow?: string[]; autoAiCreations?: boolean; settings?: Record<string, unknown>; onboarded?: boolean; verifyAdult?: boolean }>();
  if (b.name) updateUser(u.id, { name: b.name.trim().slice(0, 32) });
  if (b.likenessScope && ['no_one', 'my_groups', 'specific_friends', 'everyone'].includes(b.likenessScope)) updateUser(u.id, { likeness_scope: b.likenessScope });
  if (b.likenessAllow) run('UPDATE users SET likeness_allow = ? WHERE id = ?', json.str(b.likenessAllow.slice(0, 50)), u.id);
  if (typeof b.autoAiCreations === 'boolean') updateUser(u.id, { auto_ai: b.autoAiCreations ? 1 : 0 });
  if (b.settings) updateSettings(u.id, b.settings);
  if (typeof b.onboarded === 'boolean') updateUser(u.id, { onboarded: b.onboarded ? 1 : 0 });
  // Demo age verification: a real build hands this to an age-assurance provider (spec §J: 18+ only).
  if (b.verifyAdult) updateUser(u.id, { is_adult: isMinor(u) ? 0 : 1 });
  return c.json({ user: getUser(u.id) });
});

api.post('/me/avatar', async (c) => {
  const body = await c.req.parseBody();
  const buf = await fileBuf(body.file);
  if (!buf) return fail(c, 400, 'file_required');
  const stored = await storeImage(buf, 'free');
  updateUser(c.get('user').id, { avatar: stored.thumb });
  return c.json({ avatar: stored.thumb });
});

api.post('/me/push', async (c) => {
  savePushSubscription(c.get('user').id, await c.req.json());
  updateSettings(c.get('user').id, { pushEnabled: true });
  return c.json({ ok: true });
});

/** BeReal's "My BeReals" calendar [I] (bereal-04): your own photos by day, newest first. Only you see it [V]. */
api.get('/me/memories', (c) => {
  const rows = all<{ id: string; media: string; created_at: number }>(
    'SELECT id, media, created_at FROM posts WHERE user_id = ? ORDER BY created_at DESC LIMIT 2000',
    c.get('user').id,
  );
  const days = new Map<string, { id: string; thumb: string; createdAt: number }>();
  for (const r of rows) {
    const day = new Date(r.created_at).toISOString().slice(0, 10);
    if (days.has(day)) continue;
    const m = json.parse<{ main?: string; thumb?: string }>(r.media, {});
    days.set(day, { id: r.id, thumb: m.thumb ?? m.main ?? '', createdAt: r.created_at });
  }
  return c.json({ days: [...days.values()] });
});
api.get('/me/likeness', (c) => c.json({ likeness: objects.likenessOf(c.get('user').id), log: objects.likenessLog(c.get('user').id), scope: c.get('user').likenessScope, allow: c.get('user').likenessAllow }));

api.post('/me/likeness', async (c) => {
  const body = await c.req.parseBody({ all: true });
  const selfies = await filesBuf(body.selfies);
  if (selfies.length < 3) return fail(c, 400, 'need_3_selfies', 'Take 3–5 selfies');
  const urls: string[] = [];
  for (const s of selfies.slice(0, 5)) urls.push((await storeImage(s, 'free')).url);
  const face = await fileBuf(body.face);
  const faceUrl = face ? (await storePng(face)).url : null;
  objects.enrollLikeness(c.get('user').id, urls, faceUrl, String(body.verified) === 'true');
  return c.json({ likeness: objects.likenessOf(c.get('user').id) });
});

api.delete('/me/likeness', (c) => {
  run('DELETE FROM likeness WHERE user_id = ?', c.get('user').id);
  updateUser(c.get('user').id, { likeness_scope: 'no_one' });
  return c.json({ ok: true });
});

api.post('/me/plan', async (c) => {
  const { plan } = await c.req.json<{ plan: Plan }>();
  if (!(plan in PLANS)) return fail(c, 400, 'bad_plan');
  shopSvc.setPlan(c.get('user').id, plan);
  return c.json({ user: getUser(c.get('user').id) });
});

/**
 * Delete Account (App Review Guideline 5.1.1(v)). Yope's terms [V]: a deleted photo leaves "our servers and
 * the Yope App accounts of whomever you sent it to", so the member's photos (and the cards, reactions and
 * memory pins made from them) go with the account. Sessions, memberships, posts and likeness cascade from
 * users. A group left without an admin passes it to its longest-standing member (WhatsApp [B-high]).
 */
api.delete('/me', (c) => {
  const u = c.get('user');
  const gids = groupsForUser(u.id).map((g) => g.id);
  for (const p of all<{ id: string }>('SELECT id FROM posts WHERE user_id = ?', u.id)) run('DELETE FROM memory WHERE source_post_id = ?', p.id);
  run('DELETE FROM trades WHERE from_user = ? OR to_user = ?', u.id, u.id);
  run('DELETE FROM wonder WHERE opener_id = ?', u.id);
  run('DELETE FROM cards WHERE owner_id = ?', u.id);
  run('DELETE FROM blocks WHERE user_id = ? OR blocked_id = ?', u.id, u.id);
  for (const t of ['packs', 'wishlist', 'views', 'reactions', 'wall_reactions', 'archive_votes', 'plan_rsvps', 'plan_votes', 'notifications', 'join_waitlist', 'push_subs']) run(`DELETE FROM ${t} WHERE user_id = ?`, u.id);
  run('DELETE FROM users WHERE id = ?', u.id);
  for (const gid of gids) {
    if (!get('SELECT 1 AS x FROM memberships WHERE group_id = ? AND role = ?', gid, 'admin')) {
      run("UPDATE memberships SET role = 'admin' WHERE group_id = ? AND user_id = (SELECT user_id FROM memberships WHERE group_id = ? ORDER BY joined_at LIMIT 1)", gid, gid);
    }
    toGroup(gid, { type: 'group', groupId: gid });
  }
  clearSession(c);
  return c.json({ ok: true });
});

api.get('/notifications', (c) => c.json({ notifications: notificationsFor(c.get('user').id) }));
api.post('/notifications/read', (c) => {
  markRead(c.get('user').id);
  return c.json({ ok: true });
});

/* ───────────────────────── groups ───────────────────────── */

api.post('/groups', async (c) => {
  const u = c.get('user');
  const b = await c.req.json<{ name: string; emoji?: string; species?: string; mascotName?: string; ritualDay?: number; developHour?: number; timeZone?: string }>();
  const name = String(b.name ?? '').trim().slice(0, 40);
  if (!name) return fail(c, 400, 'name_required');
  const gid = id('grp');
  const species = MASCOT_SPECIES.find((s) => s.id === b.species) ?? MASCOT_SPECIES[0];
  run(
    'INSERT INTO groups (id, name, emoji, mascot, ritual_day, develop_hour, time_zone, invite_code, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    gid, name, b.emoji ?? '📸', json.str({ name: (b.mascotName ?? species.name).slice(0, 20), species: species.id, xp: 0, outfit: [] }),
    Math.max(0, Math.min(6, b.ritualDay ?? 0)), Math.max(0, Math.min(23, b.developHour ?? 21)), b.timeZone ?? u.settings.timeZone ?? 'America/New_York',
    inviteCode(), u.id, now(),
  );
  run('INSERT INTO memberships (group_id, user_id, role, joined_at) VALUES (?, ?, ?, ?)', gid, u.id, 'admin', now());
  cards.grantPack(u.id, gid, ritualWindow(now(), getGroup(gid)!).weekKey, 'welcome');
  refreshMembership(u.id);
  await games.startWeeklyGame(getGroup(gid)!, { silent: true });
  return c.json({ group: groupSummary(getGroup(gid)!, u.id) });
});

api.get('/groups/:groupId', (c) => {
  const g = memberGroup(c);
  const u = c.get('user');
  const ms = members(g.id);
  const votes = all<{ user_id: string; vote: number }>('SELECT user_id, vote FROM archive_votes WHERE group_id = ?', g.id);
  return c.json({
    group: { ...g, mascot: { ...g.mascot, stage: mascotStage(g.mascot.xp) }, inviteUrl: platform.inPage ? env.publicUrl || g.inviteCode : `${env.publicUrl}/j/${g.inviteCode}` },
    me: membership(g.id, u.id),
    members: ms.map((m) => ({ user: publicUser(m.user), role: m.role, joinedAt: m.joinedAt, badge: ((m.user.settings as Record<string, unknown>).badges as Record<string, string> | undefined)?.[g.id] ?? null })),
    ritual: posts.ritualState(g, u.id),
    quest: posts.questState(g),
    unlocked: ms.length >= WALL_UNLOCK_MEMBERS,
    gate: { have: ms.length, need: WALL_UNLOCK_MEMBERS, max: GROUP_MAX },
    archive: { open: g.archiveOpen, yes: votes.filter((v) => v.vote === 1).length, no: votes.filter((v) => v.vote === 0).length, mine: votes.find((v) => v.user_id === u.id)?.vote ?? null, need: Math.ceil(ms.length / 2) },
    storage: shopSvc.storage(g),
    packs: cards.unopenedPacks(u.id, g.id),
    live: posts.liveStrip(g, u.id),
  });
});

api.patch('/groups/:groupId', async (c) => {
  const g = memberGroup(c);
  const m = membership(g.id, c.get('user').id)!;
  if (m.role !== 'admin') return fail(c, 403, 'admin_only');
  const b = await c.req.json<{ name?: string; emoji?: string; ritualDay?: number; developHour?: number; mascotName?: string; species?: string }>();
  if (b.name) run('UPDATE groups SET name = ? WHERE id = ?', b.name.slice(0, 40), g.id);
  if (b.emoji) run('UPDATE groups SET emoji = ? WHERE id = ?', b.emoji.slice(0, 8), g.id);
  if (b.ritualDay !== undefined) run('UPDATE groups SET ritual_day = ? WHERE id = ?', Math.max(0, Math.min(6, b.ritualDay)), g.id);
  if (b.developHour !== undefined) run('UPDATE groups SET develop_hour = ? WHERE id = ?', Math.max(0, Math.min(23, b.developHour)), g.id);
  if (b.mascotName || b.species) updateMascot(g.id, (ms) => ({ ...ms, name: b.mascotName?.slice(0, 20) ?? ms.name, species: (MASCOT_SPECIES.find((s) => s.id === b.species)?.id ?? ms.species) as typeof ms.species }));
  toGroup(g.id, { type: 'group', groupId: g.id });
  return c.json({ ok: true });
});

api.post('/groups/:groupId/archive-vote', async (c) => {
  const g = memberGroup(c);
  const { vote } = await c.req.json<{ vote: boolean }>();
  run('INSERT OR REPLACE INTO archive_votes (group_id, user_id, vote, created_at) VALUES (?, ?, ?, ?)', g.id, c.get('user').id, vote ? 1 : 0, now());
  const yes = get<{ n: number }>('SELECT COUNT(*) AS n FROM archive_votes WHERE group_id = ? AND vote = 1', g.id)!.n;
  const open = yes >= Math.ceil(members(g.id).length / 2);
  run('UPDATE groups SET archive_open = ? WHERE id = ?', open ? 1 : 0, g.id);
  toGroup(g.id, { type: 'group', groupId: g.id });
  return c.json({ open });
});

api.post('/groups/:groupId/leave', (c) => {
  const g = memberGroup(c);
  run('DELETE FROM memberships WHERE group_id = ? AND user_id = ?', g.id, c.get('user').id);
  refreshMembership(c.get('user').id);
  // Partiful: a spot opened, so the next waitlisted person is added automatically and notified.
  const next = get<{ user_id: string }>('SELECT user_id FROM join_waitlist WHERE group_id = ? ORDER BY created_at LIMIT 1', g.id);
  if (next && canJoin(members(g.id).length)) {
    run('DELETE FROM join_waitlist WHERE group_id = ? AND user_id = ?', g.id, next.user_id);
    run('INSERT OR IGNORE INTO memberships (group_id, user_id, role, joined_at, invited_by) VALUES (?, ?, ?, ?, ?)', g.id, next.user_id, 'member', now(), null);
    refreshMembership(next.user_id);
    void push({ userId: next.user_id, groupId: g.id, kind: 'waitlist', title: g.name, body: partiful.going, refIds: [g.id], url: '/' });
  }
  return c.json({ ok: true });
});

api.post('/groups/:groupId/mascot/outfit', async (c) => {
  const g = memberGroup(c);
  const { outfit } = await c.req.json<{ outfit: string[] }>();
  shopSvc.dressMascot(g, c.get('user').id, outfit);
  toGroup(g.id, { type: 'group', groupId: g.id });
  return c.json({ mascot: getGroup(g.id)!.mascot });
});

/* ───────────────────────── join by link (no account needed to view) ───────────────────────── */

api.get('/join/:code', (c) => {
  const g = groupByCode(c.req.param('code'));
  if (!g) return fail(c, 404, 'not_found');
  const ms = members(g.id);
  const developed = get<{ week_key: string }>('SELECT week_key FROM walls WHERE group_id = ? ORDER BY week_key DESC, version DESC LIMIT 1', g.id);
  const wall = developed ? walls.latestWall(g.id, developed.week_key) : null;
  const guest = guestId(c);
  const reactions = developed ? all<{ emoji: string; n: number }>('SELECT emoji, COUNT(*) AS n FROM wall_reactions WHERE group_id = ? AND week_key = ? GROUP BY emoji', g.id, developed.week_key) : [];
  const user = currentUser(c);
  return c.json({
    group: {
      name: g.name, emoji: g.emoji, mascot: { ...g.mascot, stage: mascotStage(g.mascot.xp) }, code: g.inviteCode, memberCount: ms.length,
      members: ms.slice(0, 6).map((m) => ({ name: m.user.name.split(' ')[0], color: m.user.color, avatar: m.user.avatar })), full: !canJoin(ms.length),
      // Partiful "Hosted by [name] & [name]" — the group's admins.
      hosts: ms.filter((m) => m.role === 'admin' || m.userId === g.createdBy).map((m) => m.user.name.split(' ')[0]),
    },
    latest: wall ? { weekKey: developed!.week_key, layout: wall.layout } : null,
    reactions,
    mine: developed ? all<{ emoji: string }>('SELECT emoji FROM wall_reactions WHERE group_id = ? AND week_key = ? AND (guest = ? OR user_id = ?)', g.id, developed.week_key, guest, user?.id ?? '').map((r) => r.emoji) : [],
    signedIn: Boolean(user),
    isMember: user ? Boolean(membership(g.id, user.id)) : false,
    waitlisted: user ? Boolean(get('SELECT 1 AS x FROM join_waitlist WHERE group_id = ? AND user_id = ?', g.id, user.id)) : false,
  });
});

/** Partiful waitlist [V]: "If a spot opens up, we'll automatically add the next waitlisted guest and notify them" — first in, first out. */
api.post('/join/:code/waitlist', (c) => {
  const user = currentUser(c);
  if (!user) return fail(c, 401, 'unauthenticated');
  const g = groupByCode(c.req.param('code'));
  if (!g) return fail(c, 404, 'not_found');
  run('INSERT OR IGNORE INTO join_waitlist (group_id, user_id, created_at) VALUES (?, ?, ?)', g.id, user.id, now());
  return c.json({ ok: true });
});

api.post('/join/:code/react', async (c) => {
  const g = groupByCode(c.req.param('code'));
  if (!g) return fail(c, 404, 'not_found');
  const { emoji, weekKey } = await c.req.json<{ emoji: string; weekKey: string }>();
  const user = currentUser(c);
  run('INSERT INTO wall_reactions (id, group_id, week_key, user_id, guest, emoji, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)', id('wr'), g.id, weekKey, user?.id ?? null, user ? null : guestId(c), String(emoji).slice(0, 8), now());
  return c.json({ ok: true });
});

api.post('/join/:code', (c) => {
  const user = currentUser(c);
  if (!user) return fail(c, 401, 'unauthenticated');
  const g = groupByCode(c.req.param('code'));
  if (!g) return fail(c, 404, 'not_found');
  const ms = members(g.id);
  if (!membership(g.id, user.id)) {
    if (!canJoin(ms.length)) return fail(c, 409, 'full', locket.friendsAllowed(GROUP_MAX, GROUP_MAX));
    const inviter = new URL(c.req.url).searchParams.get('from');
    run('INSERT INTO memberships (group_id, user_id, role, joined_at, invited_by) VALUES (?, ?, ?, ?, ?)', g.id, user.id, 'member', now(), inviter && membership(g.id, inviter) ? inviter : null);
    updateMascot(g.id, (m) => ({ ...m, xp: m.xp + 20 }));
    cards.grantPack(user.id, g.id, ritualWindow(now(), g).weekKey, 'welcome');
    const msg = insertMessage({ groupId: g.id, userId: null, kind: 'system', body: `${user.name} joined`, meta: { joined: user.id } });
    toGroup(g.id, { type: 'message', groupId: g.id, messageId: msg.id });
    toGroup(g.id, { type: 'group', groupId: g.id });
    // Spec §R: the inviter earns a month of roll+ when the group reaches 8 members.
    if (ms.length + 1 === 8) {
      const firstInviter = get<{ invited_by: string }>('SELECT invited_by FROM memberships WHERE group_id = ? AND invited_by IS NOT NULL GROUP BY invited_by ORDER BY COUNT(*) DESC LIMIT 1', g.id);
      if (firstInviter) shopSvc.gift('system', firstInviter.invited_by, 'plus_month', g.id);
    }
    refreshMembership(user.id);
  }
  return c.json({ groupId: g.id });
});

/* ───────────────────────── posts ───────────────────────── */

api.post('/posts', async (c) => {
  const u = c.get('user');
  const body = await c.req.parseBody({ all: true });
  const groupIds = String(body.groupIds ?? '').split(',').filter(Boolean);
  const targets = groupIds.map((gid) => getGroup(gid)).filter((g): g is NonNullable<typeof g> => Boolean(g && membership(g.id, u.id)));
  if (!targets.length) return fail(c, 400, 'no_groups');
  const main = await fileBuf(body.main);
  if (!main) return fail(c, 400, 'photo_required');
  const stored = await storeImage(main, u.plan);
  let bytes = stored.bytes;
  const inset = await fileBuf(body.inset);
  const insetStored = inset ? await storeImage(inset, u.plan) : null;
  if (insetStored) bytes += insetStored.bytes;
  const frames = await filesBuf(body.live);
  const live = frames.length >= 3 ? await framesToLive(frames.slice(0, 16)) : null;
  if (live) bytes += live.bytes;
  const voice = await fileBuf(body.voice);
  const voiceStored = voice ? await storeBlob(voice, String(body.voiceType ?? '').includes('mp4') ? 'm4a' : 'webm') : null;
  if (voiceStored) bytes += voiceStored.bytes;
  const golden = await isGoldenHour(main).catch(() => false);
  const kind = (['photo', 'dual', 'rewind'].includes(String(body.kind)) ? String(body.kind) : insetStored ? 'dual' : 'photo') as 'photo' | 'dual' | 'rewind';
  const takenAt = Number(body.takenAt) || now();
  const caption = String(body.caption ?? '').trim().slice(0, 140) || null;
  const created = targets.map((g) =>
    posts.createPost(g, {
      userId: u.id, kind, caption, takenAt, bytes,
      media: { main: stored.url, thumb: stored.thumb, original: stored.original, inset: insetStored?.url, live: live?.url, voice: voiceStored?.url, voiceDuration: Number(body.voiceDuration) || undefined, width: stored.width, height: stored.height, golden } as never,
      ritual: String(body.ritual) === 'true', fromRoll: String(body.fromRoll) === 'true', frame: body.frame ? String(body.frame) : null,
      remember: String(body.remember) === 'true', planId: body.planId ? String(body.planId) : null,
    }),
  );
  return c.json({ posts: created.map((p) => ({ id: p.id, groupId: p.groupId, ritual: p.ritual })) });
});

api.post('/groups/:groupId/roll', async (c) => {
  const { postIds } = await c.req.json<{ postIds: string[] }>();
  return c.json(posts.shareRoll(memberGroup(c), c.get('user').id, Array.isArray(postIds) ? postIds : []));
});
api.get('/groups/:groupId/feed', (c) => c.json({ posts: posts.feed(memberGroup(c), c.get('user').id) }));
api.get('/groups/:groupId/journal', (c) => c.json(posts.journal(memberGroup(c), c.get('user').id, Number(c.req.query('weeks') ?? 8))));
api.get('/groups/:groupId/live', (c) => c.json({ posts: posts.liveStrip(memberGroup(c), c.get('user').id) }));
api.get('/groups/:groupId/rewind', (c) => c.json(posts.rewindBatch(memberGroup(c), c.get('user').id)));
api.get('/groups/:groupId/onthisday', (c) => c.json({ memories: posts.onThisDay(memberGroup(c), c.get('user').id) }));
api.get('/groups/:groupId/ritual', (c) => c.json(posts.ritualState(memberGroup(c), c.get('user').id)));

api.get('/posts/:postId', (c) => {
  const p = getPost(c.req.param('postId'));
  if (!p) return fail(c, 404, 'not_found');
  const g = getGroup(p.groupId)!;
  const vis = posts.visiblePosts(g, c.get('user').id).find((x) => x.id === p.id);
  if (!vis) return fail(c, 404, 'not_found');
  return c.json({ post: posts.toDTO([vis], c.get('user').id)[0] });
});

api.delete('/posts/:postId', (c) => {
  const p = getPost(c.req.param('postId'));
  if (!p || p.userId !== c.get('user').id) return fail(c, 404, 'not_found');
  // Yope's terms: deleting removes it from the server and from everyone it was shared with.
  run('DELETE FROM posts WHERE id = ?', p.id);
  run('DELETE FROM memory WHERE source_post_id = ?', p.id);
  toGroup(p.groupId, { type: 'post_deleted', groupId: p.groupId, postId: p.id });
  return c.json({ ok: true });
});

api.post('/posts/:postId/react', async (c) => {
  const p = getPost(c.req.param('postId'));
  const u = c.get('user');
  if (!p || !membership(p.groupId, u.id)) return fail(c, 404, 'not_found');
  const b = await c.req.json<{ emoji?: string; stickerId?: string }>();
  const rid = posts.react(p, { id: u.id, name: u.name }, { emoji: b.emoji?.slice(0, 8) ?? null, stickerId: b.stickerId ?? null });
  return c.json({ id: rid });
});

api.post('/posts/seen', async (c) => {
  const { ids } = await c.req.json<{ ids: string[] }>();
  posts.markPostsSeen(c.get('user').id, ids.slice(0, 200));
  return c.json({ ok: true });
});

api.post('/posts/:postId/remember', async (c) => {
  const p = getPost(c.req.param('postId'));
  if (!p || p.userId !== c.get('user').id) return fail(c, 404, 'not_found');
  const { remember } = await c.req.json<{ remember: boolean }>();
  posts.setRemember(p, remember, c.get('user').id);
  return c.json({ ok: true });
});

/* ───────────────────────── walls & recaps ───────────────────────── */

api.get('/groups/:groupId/walls/:weekKey', (c) => {
  const g = memberGroup(c);
  const wk = c.req.param('weekKey');
  const recap = get<{ id: string }>(`SELECT id FROM objects WHERE group_id = ? AND kind = 'recap' AND json_extract(meta, '$.weekKey') = ? ORDER BY created_at DESC LIMIT 1`, g.id, wk);
  return c.json({ wall: walls.latestWall(g.id, wk), versions: walls.wallVersions(g.id, wk), styles: walls.WALL_STYLES, recap: recap ? objects.objectList(c.get('user').id, g.id, 'recap').find((o) => o.id === recap.id) : null, title: walls.weekTitle(wk) });
});

api.post('/groups/:groupId/walls/:weekKey', async (c) => {
  const g = memberGroup(c);
  const { layout, style } = await c.req.json<{ layout: walls.WallLayout; style?: string }>();
  const version = walls.saveWall(g, c.req.param('weekKey'), layout, style ?? 'edit', 'edit', c.get('user').id);
  return c.json({ version });
});

api.post('/groups/:groupId/walls/:weekKey/remix', async (c) => {
  const g = memberGroup(c);
  const { style } = await c.req.json<{ style?: string }>().catch(() => ({ style: undefined }));
  const res = walls.generateWall(g, c.req.param('weekKey'), walls.wallStyle(style), c.get('user').id);
  if (!res) return fail(c, 400, 'no_posts');
  return c.json(res);
});

api.get('/groups/:groupId/walls/:weekKey/export', async (c) => {
  const g = memberGroup(c);
  const v = c.req.query('version');
  const row = v
    ? get<{ layout: string }>('SELECT layout FROM walls WHERE group_id = ? AND week_key = ? AND version = ?', g.id, c.req.param('weekKey'), Number(v))
    : get<{ layout: string }>('SELECT layout FROM walls WHERE group_id = ? AND week_key = ? ORDER BY version DESC LIMIT 1', g.id, c.req.param('weekKey'));
  if (!row) return fail(c, 404, 'not_found');
  const buf = await walls.exportWall(g, json.parse<walls.WallLayout>(row.layout, null as never), c.get('user').id);
  return new Response(new Uint8Array(buf), { headers: { 'content-type': 'image/jpeg', 'content-disposition': `inline; filename="${g.name}-${c.req.param('weekKey')}.jpg"` } });
});

api.post('/groups/:groupId/recap/:weekKey', async (c) => {
  const g = memberGroup(c);
  const { style } = await c.req.json<{ style?: string }>().catch(() => ({ style: undefined }));
  const res = await walls.generateRecap(g, c.req.param('weekKey'), c.get('user').id, style ?? 'comic');
  if (!res.ok) return fail(c, 429, res.reason, res.reason === 'free_limit' ? ios.ofUsed(FREE_GROUP_RECAPS_PER_WEEK, FREE_GROUP_RECAPS_PER_WEEK) : '');
  return c.json({ recap: res.object });
});

/* ───────────────────────── objects (likeness) ───────────────────────── */

api.get('/objects', (c) => c.json({ objects: objects.objectList(c.get('user').id, c.req.query('groupId') ?? null, c.req.query('kind') ?? undefined) }));

api.post('/objects/sticker', async (c) => {
  const body = await c.req.parseBody();
  const cutout = await fileBuf(body.cutout);
  if (!cutout) return fail(c, 400, 'cutout_required');
  const o = await objects.makeSticker(c.get('user'), { cutout, original: await fileBuf(body.original), groupId: body.groupId ? String(body.groupId) : null, subjectId: String(body.subjectId ?? c.get('user').id), sourcePostId: body.postId ? String(body.postId) : null });
  return c.json({ object: o });
});

api.post('/objects/remix', async (c) => {
  const body = await c.req.parseBody();
  const o = await objects.makeRemix(c.get('user'), {
    postId: String(body.postId), style: String(body.style), groupId: String(body.groupId),
    subjects: String(body.subjects ?? '').split(',').filter(Boolean), cutout: await fileBuf(body.cutout),
  });
  return c.json({ object: o });
});

api.post('/objects/figurine', async (c) => {
  const body = await c.req.parseBody();
  const cutout = await fileBuf(body.cutout);
  const post = body.postId ? getPost(String(body.postId)) : null;
  const original = (await fileBuf(body.original)) ?? (post ? await readMedia(post.media.main) : null);
  if (!cutout || !original) return fail(c, 400, 'cutout_required');
  const o = await objects.makeFigurine(c.get('user'), { cutout, original, subjectId: String(body.subjectId ?? c.get('user').id), groupId: String(body.groupId) });
  return c.json({ object: o });
});

api.post('/objects/meme', async (c) => {
  const body = await c.req.parseBody();
  const face = await fileBuf(body.face);
  const tpost = body.templatePostId ? getPost(String(body.templatePostId)) : null;
  const template = (await fileBuf(body.template)) ?? (tpost ? await readMedia(tpost.media.main) : null);
  if (!face || !template) return fail(c, 400, 'inputs_required');
  const size = await imageSize(template);
  const box = json.parse(String(body.box ?? ''), { x: size.width * 0.35, y: size.height * 0.2, w: size.width * 0.3, h: size.width * 0.3 });
  const o = await objects.makeMeme(c.get('user'), { template, face, box, subjectId: String(body.subjectId ?? c.get('user').id), groupId: String(body.groupId), top: body.top ? String(body.top) : undefined, bottom: body.bottom ? String(body.bottom) : undefined, templatePostId: tpost?.id ?? null });
  return c.json({ object: o });
});

api.post('/groups/:groupId/zine', async (c) => {
  const g = memberGroup(c);
  const { weekKey, postIds } = await c.req.json<{ weekKey: string; postIds?: string[] }>();
  const ids = postIds?.length ? postIds : posts.visiblePosts(g, c.get('user').id, { weekKey }).map((p) => p.id);
  return c.json({ object: await objects.makeZine(c.get('user'), g, weekKey, ids) });
});

api.get('/objects/:objectId/export', async (c) => {
  const { buf, type } = await objects.exportObject(c.get('user'), c.req.param('objectId'));
  return new Response(new Uint8Array(buf), { headers: { 'content-type': type, 'content-disposition': `inline; filename="roll-${c.req.param('objectId')}.${type.split('/')[1]}"` } });
});

api.delete('/objects/:objectId', (c) => c.json(objects.revokeObject(c.get('user').id, c.req.param('objectId'))));

api.get('/stickers/pack', async (c) => {
  const zip = await objects.stickerPack(c.get('user'), c.req.query('groupId') ?? null);
  return new Response(new Uint8Array(zip), { headers: { 'content-type': 'application/zip', 'content-disposition': 'attachment; filename="roll-stickers.zip"' } });
});

/* ───────────────────────── cards ───────────────────────── */

api.get('/groups/:groupId/binder', (c) => c.json(cards.binder(memberGroup(c), c.get('user').id)));
api.post('/groups/:groupId/packs/:packId/open', (c) => c.json(cards.open(memberGroup(c), c.get('user').id, c.req.param('packId'))));
api.post('/groups/:groupId/packs/buy', async (c) => {
  const g = memberGroup(c);
  const { with: currency } = await c.req.json<{ with: 'sparks' | 'usd' }>();
  return c.json({ packId: currency === 'usd' ? cards.buyPaidPack(g, c.get('user').id) : cards.buyPackWithSparks(g, c.get('user').id) });
});
api.get('/groups/:groupId/wonder', (c) => {
  const g = memberGroup(c);
  return c.json({ offers: cards.wonderOffers(g, c.get('user').id), binder: cards.binder(g, c.get('user').id) });
});
api.post('/groups/:groupId/wonder/:wonderId', async (c) => {
  const { choice } = await c.req.json<{ choice: number }>();
  return c.json(cards.wonderPick(memberGroup(c), c.get('user').id, c.req.param('wonderId'), choice));
});
api.get('/groups/:groupId/trades', (c) => c.json(cards.tradeHub(memberGroup(c), c.get('user').id)));
api.post('/groups/:groupId/trades', async (c) => {
  const b = await c.req.json<{ toUserId: string; offerCardId: string; wantCardId?: string | null }>();
  return c.json({ id: cards.proposeTrade(memberGroup(c), c.get('user').id, b) });
});
api.post('/groups/:groupId/trades/:tradeId/:action', async (c) => {
  const action = c.req.param('action') as 'accept' | 'decline' | 'cancel' | 'finish';
  if (!['accept', 'decline', 'cancel', 'finish'].includes(action)) return fail(c, 400, 'bad_action');
  const b = await c.req.json<{ giveCardId?: string | null }>().catch(() => ({}) as { giveCardId?: string | null });
  return c.json(cards.respondTrade(memberGroup(c), c.get('user').id, c.req.param('tradeId'), action, b.giveCardId ?? null));
});
api.post('/groups/:groupId/wishlist', async (c) => {
  const b = await c.req.json<{ postId: string; rarity: Rarity; on: boolean; highlighted?: boolean }>();
  cards.setWishlist(memberGroup(c), c.get('user').id, b.postId, b.rarity, b.on, b.highlighted);
  return c.json({ ok: true });
});
api.post('/groups/:groupId/exchange', async (c) => {
  const b = await c.req.json<{ postId: string; rarity: Rarity }>();
  return c.json({ card: cards.exchange(memberGroup(c), c.get('user').id, b.postId, b.rarity) });
});
api.get('/groups/:groupId/missions', (c) => c.json(cards.missions(memberGroup(c), c.get('user').id)));
api.post('/groups/:groupId/missions/claim', (c) => c.json(cards.claimMissions(memberGroup(c), c.get('user').id)));
api.get('/groups/:groupId/cards/:cardId', (c) => c.json(cards.collectible(memberGroup(c), c.get('user').id, c.req.param('cardId'))));
api.post('/cards/:cardId/upgrade', (c) => {
  const g = cards.groupOfCard(c.req.param('cardId'));
  if (!g || !membership(g.id, c.get('user').id)) return fail(c, 404, 'not_found');
  cards.upgrade(c.get('user').id, c.req.param('cardId'));
  return c.json(cards.collectible(g, c.get('user').id, c.req.param('cardId')));
});
api.post('/cards/:cardId/flair', (c) => c.json(cards.applyFlair(c.get('user').id, c.req.param('cardId'))));
api.post('/groups/:groupId/badge', async (c) => {
  const g = memberGroup(c);
  const { cardId } = await c.req.json<{ cardId: string | null }>();
  const badges = cards.badge(c.get('user').id, g.id, cardId);
  toGroup(g.id, { type: 'group', groupId: g.id });
  return c.json({ badges });
});
api.get('/groups/:groupId/social', (c) => c.json(cards.social(memberGroup(c), c.get('user').id)));
api.post('/groups/:groupId/showcases', async (c) => {
  const b = await c.req.json<{ id?: string; kind: 'binder' | 'display'; cardIds: string[]; style?: string | null; visibility: 'private' | 'friends' }>();
  const u = c.get('user');
  return c.json({ id: cards.saveShowcase(memberGroup(c), u.id, b, shopSvc.usable(u.id)) });
});
api.delete('/groups/:groupId/showcases/:showcaseId', (c) => {
  cards.deleteShowcase(memberGroup(c), c.get('user').id, c.req.param('showcaseId'));
  return c.json({ ok: true });
});

/* ───────────────────────── games & memory ───────────────────────── */

api.get('/groups/:groupId/game', (c) => c.json({ game: games.gameView(memberGroup(c), c.get('user').id) }));
api.post('/groups/:groupId/game/:gameId/vote', async (c) => {
  const g = memberGroup(c);
  const b = await c.req.json<{ question: number; userId: string }>();
  games.vote(g, c.get('user').id, c.req.param('gameId'), b.question, b.userId);
  return c.json({ game: games.gameView(g, c.get('user').id) });
});
api.post('/groups/:groupId/game/:gameId/telephone', async (c) => {
  const g = memberGroup(c);
  await games.telephone(g, c.get('user').id, c.req.param('gameId'), await c.req.json());
  return c.json({ game: games.gameView(g, c.get('user').id) });
});
api.post('/groups/:groupId/game/:gameId/challenge', async (c) => {
  const g = memberGroup(c);
  // Instagram "Add Yours": { prompt } types the prompt (once); { postId } answers it with a photo.
  const b = await c.req.json<{ postId?: string; prompt?: string }>();
  if (b.prompt !== undefined) games.setChallengePrompt(g, c.get('user').id, c.req.param('gameId'), b.prompt);
  else games.enterChallenge(g, c.get('user').id, c.req.param('gameId'), b.postId ?? '');
  return c.json({ game: games.gameView(g, c.get('user').id) });
});
// Jackbox: the VIP's "Everybody's in" ends the round and reveals the results.
api.post('/groups/:groupId/game/:gameId/close', (c) => {
  const g = memberGroup(c);
  games.vipClose(g, c.get('user').id, c.req.param('gameId'));
  return c.json({ game: games.gameView(g, c.get('user').id) });
});
api.post('/groups/:groupId/game/:gameId/guess', async (c) => {
  const g = memberGroup(c);
  const b = await c.req.json<{ postId: string; userId: string }>();
  games.guessWhose(g, c.get('user').id, c.req.param('gameId'), b.postId, b.userId);
  return c.json({ game: games.gameView(g, c.get('user').id) });
});
api.get('/groups/:groupId/game/:gameId/share', (c) => c.json({ text: games.shareGrid(memberGroup(c), c.req.param('gameId'), c.get('user').id, c.req.query('theme') !== 'light') }));
api.get('/groups/:groupId/roles', (c) => c.json({ roles: games.weeklyRoles(memberGroup(c)) }));
api.get('/groups/:groupId/games', (c) => {
  const g = memberGroup(c);
  return c.json({ games: all<{ id: string; week_key: string; kind: string; state: string; closed_at: number | null }>('SELECT * FROM games WHERE group_id = ? ORDER BY created_at DESC LIMIT 12', g.id).map((x) => ({ id: x.id, weekKey: x.week_key, kind: x.kind, closed: Boolean(x.closed_at), results: json.parse<{ results?: unknown }>(x.state, {}).results ?? null })) });
});

// Character.ai memory (May 2026): Story Memory, Facts, Memory Usage; "Pin" locks a fact's wording into Story Memory.
api.get('/groups/:groupId/memory', (c) => c.json(games.memoryView(memberGroup(c))));
api.post('/groups/:groupId/memory/:memoryId/pin', (c) => c.json({ id: games.pinFact(memberGroup(c), c.req.param('memoryId'), c.get('user').id) }));
api.post('/groups/:groupId/memory', async (c) => {
  const g = memberGroup(c);
  const { text } = await c.req.json<{ text: string }>();
  if (!text?.trim()) return fail(c, 400, 'empty');
  return c.json({ id: posts.addMemory(g.id, text.trim(), null, c.get('user').id) });
});
api.delete('/groups/:groupId/memory/:memoryId', (c) => {
  const g = memberGroup(c);
  const mid = c.req.param('memoryId');
  if (mid.includes(':')) games.forgetFact(g, mid);
  else run('DELETE FROM memory WHERE id = ? AND group_id = ?', mid, g.id);
  return c.json({ ok: true });
});

/* ───────────────────────── chat ───────────────────────── */

api.get('/groups/:groupId/messages', (c) => {
  const g = memberGroup(c);
  const msgs = messagesFor(g.id, Number(c.req.query('before')) || undefined);
  const users = new Map(usersByIds([...new Set(msgs.map((m) => m.userId).filter(Boolean) as string[])]).map((u) => [u.id, publicUser(u)]));
  const planIds = msgs.filter((m) => m.kind === 'plan' && m.refId).map((m) => m.refId!);
  const planMap = new Map(planIds.map((pid) => [pid, plans.planView(pid, c.get('user').id)]));
  // Locket chat [I] (locket-04): a reply shows the photo it answers, with the poster chip and caption.
  const replyIds = new Set(msgs.filter((m) => m.kind === 'post_reply' && m.refId).map((m) => m.refId!));
  const refMap = new Map(replyIds.size ? posts.toDTO(posts.visiblePosts(g, c.get('user').id).filter((p) => replyIds.has(p.id)), c.get('user').id).map((p) => [p.id, p]) : []);
  return c.json({ messages: msgs.map((m) => ({ ...m, user: m.userId ? users.get(m.userId) ?? null : null, plan: m.kind === 'plan' && m.refId ? planMap.get(m.refId) ?? null : null, post: m.kind === 'post_reply' && m.refId ? refMap.get(m.refId) ?? null : null })), mascot: { ...g.mascot, stage: mascotStage(g.mascot.xp) } });
});

api.post('/groups/:groupId/messages', async (c) => {
  const g = memberGroup(c);
  const u = c.get('user');
  const ct = c.req.header('content-type') ?? '';
  let msg;
  if (ct.includes('multipart')) {
    const body = await c.req.parseBody();
    const file = await fileBuf(body.file);
    if (!file) return fail(c, 400, 'file_required');
    const kind = String(body.kind) === 'voice' ? 'voice' : 'photo';
    const media = kind === 'voice' ? (await storeBlob(file, String(body.type ?? '').includes('mp4') ? 'm4a' : 'webm')).url : (await storeImage(file, u.plan)).url;
    msg = insertMessage({ groupId: g.id, userId: u.id, kind, media, body: body.body ? String(body.body).slice(0, 500) : null, meta: { duration: Number(body.duration) || undefined } });
  } else {
    const b = await c.req.json<{ kind?: 'text' | 'sticker' | 'post_reply'; body?: string; stickerId?: string; refId?: string }>();
    if (b.kind === 'sticker') {
      const s = get<{ media: string }>('SELECT media FROM objects WHERE id = ? AND revoked = 0', b.stickerId ?? '');
      if (!s) return fail(c, 400, 'bad_sticker');
      msg = insertMessage({ groupId: g.id, userId: u.id, kind: 'sticker', media: s.media, refId: b.stickerId });
    } else {
      const text = String(b.body ?? '').trim().slice(0, 1000);
      if (!text) return fail(c, 400, 'empty');
      msg = insertMessage({ groupId: g.id, userId: u.id, kind: b.kind === 'post_reply' ? 'post_reply' : 'text', body: text, refId: b.refId ?? null });
      // "📌" pins a line into the game master's memory (opt-in, visible, deletable).
      if (text.startsWith('📌')) posts.addMemory(g.id, text.replace(/^📌\s*/, ''), null, u.id);
      void games.maybeGmReply(g.id, u.id, text);
    }
  }
  toGroup(g.id, { type: 'message', groupId: g.id, messageId: msg.id });
  return c.json({ message: { ...msg, user: publicUser(u) } });
});

/* ───────────────────────── plans ───────────────────────── */

api.get('/groups/:groupId/plans', (c) => c.json({ plans: plans.plansFor(memberGroup(c).id, c.get('user').id) }));
api.post('/groups/:groupId/plans', async (c) => c.json({ id: plans.createPlan(memberGroup(c), c.get('user').id, await c.req.json()) }));
api.get('/plans/:planId', (c) => {
  const p = plans.planView(c.req.param('planId'), c.get('user').id);
  return p ? c.json({ plan: p }) : fail(c, 404, 'not_found');
});
api.post('/plans/:planId/rsvp', async (c) => {
  const { status, plusOnes, note } = await c.req.json<{ status: plans.RsvpStatus; plusOnes?: number; note?: string | null }>();
  plans.rsvp(c.req.param('planId'), c.get('user').id, status, { plusOnes, note });
  return c.json({ plan: plans.planView(c.req.param('planId'), c.get('user').id) });
});
api.post('/plans/:planId/vote', async (c) => {
  const b = await c.req.json<{ option: number; vote: 'yes' | 'no' | 'maybe' }>();
  plans.votePlan(c.req.param('planId'), c.get('user').id, b.option, b.vote);
  return c.json({ plan: plans.planView(c.req.param('planId'), c.get('user').id) });
});
api.post('/plans/:planId/pick', async (c) => {
  const { option } = await c.req.json<{ option: number }>();
  plans.pickOption(c.req.param('planId'), c.get('user').id, option);
  return c.json({ plan: plans.planView(c.req.param('planId'), c.get('user').id) });
});
api.post('/plans/:planId/blast', async (c) => {
  const b = await c.req.json<{ text: string; audience?: plans.RsvpStatus[] }>();
  return c.json({ id: plans.blast(c.req.param('planId'), c.get('user').id, b.text, b.audience ?? 'all') });
});
api.post('/plans/:planId/keep', (c) => {
  plans.keepAlbum(c.req.param('planId'), c.get('user').id);
  return c.json({ ok: true });
});

/* ───────────────────────── wrapped & party ───────────────────────── */

api.get('/groups/:groupId/wrapped', (c) => c.json(wrappedSvc.wrapped(memberGroup(c), c.get('user').id, Number(c.req.query('year')) || new Date(now()).getUTCFullYear())));
api.get('/groups/:groupId/party', (c) => c.json({ party: wrappedSvc.partyState(memberGroup(c).id, new Date(now()).getUTCFullYear()) }));
api.post('/groups/:groupId/party', (c) => {
  const g = memberGroup(c);
  const p = wrappedSvc.startParty(g, c.get('user').id);
  return c.json({ party: wrappedSvc.joinParty(g.id, c.get('user').id, new Date(now()).getUTCFullYear()), code: p.code });
});
api.post('/groups/:groupId/party/join', (c) => c.json({ party: wrappedSvc.joinParty(memberGroup(c).id, c.get('user').id, new Date(now()).getUTCFullYear()) }));
api.post('/groups/:groupId/party/slide', async (c) => {
  const { slide } = await c.req.json<{ slide: number }>();
  return c.json({ party: wrappedSvc.advanceParty(memberGroup(c).id, c.get('user').id, slide, new Date(now()).getUTCFullYear()) });
});
api.post('/groups/:groupId/party/answer', async (c) => {
  const b = await c.req.json<{ question: number; answer: string }>();
  wrappedSvc.answerParty(memberGroup(c).id, c.get('user').id, b.question, b.answer, new Date(now()).getUTCFullYear());
  return c.json({ ok: true });
});
api.delete('/groups/:groupId/party', (c) => {
  wrappedSvc.endParty(memberGroup(c).id, c.get('user').id);
  return c.json({ ok: true });
});

/* ───────────────────────── shop, gifts, print, storage ───────────────────────── */

api.get('/shop', (c) => c.json(shopSvc.shop(c.get('user').id)));
api.post('/shop/buy', async (c) => {
  const b = await c.req.json<{ item: string; groupId?: string }>();
  return c.json(shopSvc.buy(c.get('user').id, b.item, b.groupId ?? null));
});
api.post('/shop/equip', async (c) => {
  const b = await c.req.json<{ kind: 'sleeve' | 'theme' | 'icon'; item: string | null }>();
  if (!['sleeve', 'theme', 'icon'].includes(b.kind)) return fail(c, 400, 'bad_kind');
  return c.json({ equipped: shopSvc.equip(c.get('user').id, b.kind, b.item ?? null) });
});
api.post('/gift', async (c) => {
  const b = await c.req.json<{ toUserId: string; kind: 'plus_month' | 'pack' | 'item'; groupId?: string; itemId?: string }>();
  if (!['plus_month', 'pack', 'item'].includes(b.kind)) return fail(c, 400, 'bad_kind');
  if (b.groupId && !membership(b.groupId, c.get('user').id)) return fail(c, 403, 'forbidden');
  shopSvc.gift(c.get('user').id, b.toUserId, b.kind, b.groupId ?? null, b.itemId);
  return c.json({ ok: true });
});
api.get('/groups/:groupId/orders', (c) => c.json({ orders: shopSvc.ordersFor(memberGroup(c).id), prices: shopSvc.PRINT }));
api.post('/groups/:groupId/orders', async (c) => {
  const b = await c.req.json<{ kind: keyof typeof shopSvc.PRINT; items: string[]; qty?: number; message?: string; address?: string[] }>();
  const oid = shopSvc.createOrder(memberGroup(c), c.get('user').id, b.kind, b.items, b.qty);
  // Retro postcard [I] (retro-03): "Add a message" and a "Mailing Address".
  if (b.message || b.address?.length) run('INSERT OR REPLACE INTO order_meta (order_id, meta) VALUES (?, ?)', oid, json.str({ message: String(b.message ?? '').slice(0, 300), address: (b.address ?? []).map((l) => String(l).slice(0, 120)).slice(0, 5) }));
  return c.json({ id: oid });
});
api.post('/orders/:orderId/chip', async (c) => {
  const { usd } = await c.req.json<{ usd: number }>();
  shopSvc.chipIn(c.req.param('orderId'), c.get('user').id, usd);
  return c.json({ ok: true });
});
api.get('/groups/:groupId/storage', (c) => c.json(shopSvc.storage(memberGroup(c))));
api.get('/groups/:groupId/export', async (c) => {
  const g = memberGroup(c);
  const zip = await shopSvc.exportArchive(g, c.get('user').id);
  return new Response(new Uint8Array(zip), { headers: { 'content-type': 'application/zip', 'content-disposition': `attachment; filename="${g.name}-archive.zip"` } });
});

/* ───────────────────────── safety ───────────────────────── */

api.post('/report', async (c) => {
  const b = await c.req.json<{ kind: string; id: string; reason: string }>();
  run('INSERT INTO reports (id, reporter, target_kind, target_id, reason, created_at) VALUES (?, ?, ?, ?, ?, ?)', id('rep'), c.get('user').id, b.kind, b.id, String(b.reason).slice(0, 500), now());
  return c.json({ ok: true });
});
api.post('/block', async (c) => {
  const { userId } = await c.req.json<{ userId: string }>();
  run('INSERT OR IGNORE INTO blocks (user_id, blocked_id, created_at) VALUES (?, ?, ?)', c.get('user').id, userId, now());
  return c.json({ ok: true });
});

/* ───────────────────────── widgets & live activity ───────────────────────── */

api.get('/widgets', (c) => {
  const u = c.get('user');
  const gs = groupsForUser(u.id);
  return c.json({
    groups: gs.map((g) => {
      const latest = posts.visiblePosts(g, u.id).find((p) => p.userId !== u.id) ?? posts.visiblePosts(g, u.id)[0];
      const r = posts.ritualState(g, u.id);
      const memories = posts.onThisDay(g, u.id);
      return {
        group: { id: g.id, name: g.name, emoji: g.emoji, mascot: { ...g.mascot, stage: mascotStage(g.mascot.xp) } },
        latest: latest ? posts.toDTO([latest], u.id)[0] : null,
        streak: r.streak.weeks,
        ritual: { isOpen: r.isOpen, developsAt: r.developsAt, opensAt: r.opensAt, posted: r.posted, of: r.of, posters: r.posters, youPosted: r.youPosted },
        memory: memories[0] ?? null,
        // Locket widget [I] (locket-02): the yellow count badge — photos from friends you haven't opened.
        unseen: posts.toDTO(posts.visiblePosts(g, u.id).filter((p) => p.userId !== u.id), u.id).filter((p) => !p.seen).length,
        members: members(g.id).map((m) => publicUser(m.user)).slice(0, 30),
      };
    }),
    hideStreak: Boolean(u.settings.hideStreakOnWidget),
  });
});

/* ───────────────────────── demo affordances ───────────────────────── */

api.get('/demo/users', (c) => {
  if (!env.demo) return fail(c, 404, 'not_found');
  return c.json({ users: all<{ id: string; name: string; color: string; avatar: string | null }>("SELECT id, name, color, avatar FROM users WHERE json_extract(settings, '$.demo') = 1 ORDER BY created_at") });
});

api.post('/demo/login', async (c) => {
  if (!env.demo) return fail(c, 404, 'not_found');
  const { userId } = await c.req.json<{ userId: string }>();
  const u = getUser(userId);
  if (!u || !(u.settings as Record<string, unknown>).demo) return fail(c, 404, 'not_found');
  setSessionCookie(c, createSession(u.id));
  return c.json({ user: u });
});

api.post('/demo/clock', async (c) => {
  if (!env.demo) return fail(c, 404, 'not_found');
  const b = await c.req.json<{ to: 'ritual' | 'develop' | 'reset'; groupId?: string }>();
  const u = c.get('user');
  const g = b.groupId ? getGroup(b.groupId) : groupsForUser(u.id)[0];
  if (b.to === 'reset' || !g) setClockOffset(0);
  else {
    const real = Date.now();
    const w = ritualWindow(real, g);
    const target = b.to === 'ritual' ? Math.max(w.opensAt + 9 * 3_600_000, real) : w.developsAt + 60_000;
    setClockOffset(Math.max(0, target - real));
  }
  if (g) await tickGroup(g);
  return c.json({ now: now() });
});

api.post('/demo/develop', async (c) => {
  if (!env.demo) return fail(c, 404, 'not_found');
  const { groupId } = await c.req.json<{ groupId: string }>();
  const g = getGroup(groupId);
  if (!g || !membership(g.id, c.get('user').id)) return fail(c, 404, 'not_found');
  await developWeek(g, ritualWindow(now(), g).weekKey);
  return c.json({ ok: true });
});

api.get('/admin/ai-usage', (c) => c.json({ usage: usageReport() }));

/* Plans edit/poster/comments, self-tags + search, bestie lane, Create tools, Wrapped Party extras: routes-extra.ts */
api.route('/', extra);
