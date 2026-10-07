import { customAlphabet, nanoid } from 'nanoid';
import {
  type Card,
  type Group,
  type LikenessObject,
  type Membership,
  type Message,
  type Post,
  type Rarity,
  type Reaction,
  type User,
  maxTier,
  signalsOf,
  weekKey,
} from '@app/shared';
import { all, get, json, now, run } from './db.ts';

export const id = (prefix: string) => `${prefix}_${nanoid(12)}`;
/** Invite codes: room-code style, unambiguous letters (Jackbox room codes). */
export const inviteCode = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);

/* ───────────────────────── Users ───────────────────────── */

type UserRow = {
  id: string; name: string; avatar: string | null; color: string; birth_year: number; is_adult: number; plan: string;
  likeness_scope: string; likeness_allow: string; auto_ai: number; sparks: number; shinedust: number; pack_points: number;
  trade_stamina: number; trade_stamina_at: number; wonder_stamina: number; wonder_stamina_at: number; settings: string;
  onboarded: number; created_at: number;
};

export interface UserFull extends User {
  packPoints: number;
  tradeStamina: { value: number; at: number };
  wonderStamina: { value: number; at: number };
  settings: UserSettings;
  onboarded: boolean;
}

export interface UserSettings {
  cadence?: 'daily' | 'weekly' | 'monthly';
  hideStreakOnWidget?: boolean;
  quietHours?: boolean;
  teenTimeLimitMin?: number;
  contactsShared?: boolean;
  appIcon?: string;
  watermarkStyle?: string;
  rewindDeleteSync?: boolean;
  timeZone?: string;
  frame?: string;
  pushEnabled?: boolean;
  liveActivities?: boolean;
}

export function toUser(r: UserRow): UserFull {
  return {
    id: r.id,
    name: r.name,
    avatar: r.avatar,
    color: r.color,
    birthYear: r.birth_year,
    isAdult: !!r.is_adult,
    plan: r.plan as User['plan'],
    likenessScope: r.likeness_scope as User['likenessScope'],
    likenessAllow: json.parse(r.likeness_allow, []),
    autoAiCreations: !!r.auto_ai,
    sparks: r.sparks,
    shinedust: r.shinedust,
    packPoints: r.pack_points,
    tradeStamina: { value: r.trade_stamina, at: r.trade_stamina_at },
    wonderStamina: { value: r.wonder_stamina, at: r.wonder_stamina_at },
    settings: json.parse(r.settings, {}),
    onboarded: !!r.onboarded,
    createdAt: r.created_at,
  };
}

export function getUser(userId: string) {
  const r = get<UserRow>('SELECT * FROM users WHERE id = ?', userId);
  return r ? toUser(r) : null;
}

export function usersByIds(ids: string[]) {
  if (!ids.length) return [];
  return all<UserRow>(`SELECT * FROM users WHERE id IN (${ids.map(() => '?').join(',')})`, ...ids).map(toUser);
}

/** Public projection of a user, safe to send to other members. */
export function publicUser(u: Pick<User, 'id' | 'name' | 'avatar' | 'color' | 'plan'>) {
  return { id: u.id, name: u.name, avatar: u.avatar, color: u.color, plus: u.plan !== 'free' };
}

export function createUser(input: { name: string; birthYear: number; color: string; avatar?: string | null; isAdult?: boolean; timeZone?: string }) {
  const uid = id('u');
  const t = now();
  run(
    `INSERT INTO users (id, name, avatar, color, birth_year, is_adult, created_at, trade_stamina_at, wonder_stamina_at, settings)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    uid, input.name, input.avatar ?? null, input.color, input.birthYear, input.isAdult ? 1 : 0, t, t, t,
    json.str({ cadence: 'weekly', timeZone: input.timeZone ?? 'America/New_York', pushEnabled: false, liveActivities: true }),
  );
  return getUser(uid)!;
}

export function updateUser(userId: string, patch: Partial<Record<'name' | 'avatar' | 'plan' | 'likeness_scope' | 'auto_ai' | 'is_adult' | 'onboarded' | 'birth_year', string | number | null>>) {
  const keys = Object.keys(patch);
  if (!keys.length) return;
  run(`UPDATE users SET ${keys.map((k) => `${k} = ?`).join(', ')} WHERE id = ?`, ...(keys.map((k) => (patch as Record<string, string | number | null>)[k])), userId);
}

export function updateSettings(userId: string, patch: Partial<UserSettings>) {
  const u = getUser(userId);
  if (!u) return;
  run('UPDATE users SET settings = ? WHERE id = ?', json.str({ ...u.settings, ...patch }), userId);
}

export function addCurrency(userId: string, delta: { sparks?: number; shinedust?: number; pack_points?: number }) {
  run(
    'UPDATE users SET sparks = sparks + ?, shinedust = shinedust + ?, pack_points = pack_points + ? WHERE id = ?',
    delta.sparks ?? 0, delta.shinedust ?? 0, delta.pack_points ?? 0, userId,
  );
}

/* ───────────────────────── Groups ───────────────────────── */

type GroupRow = {
  id: string; name: string; emoji: string; mascot: string; ritual_day: number; develop_hour: number; time_zone: string;
  invite_code: string; archive_open: number; created_by: string; created_at: number;
};

export function toGroup(r: GroupRow): Group {
  return {
    id: r.id,
    name: r.name,
    emoji: r.emoji,
    mascot: json.parse(r.mascot, { name: 'Blob', species: 'blob', xp: 0, outfit: [] }),
    ritualDay: r.ritual_day,
    developHour: r.develop_hour,
    timeZone: r.time_zone,
    inviteCode: r.invite_code,
    archiveOpen: !!r.archive_open,
    createdBy: r.created_by,
    createdAt: r.created_at,
  };
}

export function getGroup(groupId: string) {
  const r = get<GroupRow>('SELECT * FROM groups WHERE id = ?', groupId);
  return r ? toGroup(r) : null;
}

export function groupByCode(code: string) {
  const r = get<GroupRow>('SELECT * FROM groups WHERE invite_code = ?', code.toUpperCase());
  return r ? toGroup(r) : null;
}

export function groupsForUser(userId: string) {
  return all<GroupRow>(
    'SELECT g.* FROM groups g JOIN memberships m ON m.group_id = g.id WHERE m.user_id = ? ORDER BY m.joined_at',
    userId,
  ).map(toGroup);
}

export function allGroups() {
  return all<GroupRow>('SELECT * FROM groups').map(toGroup);
}

export function members(groupId: string): (Membership & { user: UserFull })[] {
  return all<UserRow & { role: string; joined_at: number; group_id: string }>(
    `SELECT u.*, m.role, m.joined_at, m.group_id FROM memberships m JOIN users u ON u.id = m.user_id
     WHERE m.group_id = ? ORDER BY m.joined_at`,
    groupId,
  ).map((r) => ({ groupId: r.group_id, userId: r.id, role: r.role as Membership['role'], joinedAt: r.joined_at, user: toUser(r) }));
}

export function membership(groupId: string, userId: string) {
  const r = get<{ group_id: string; user_id: string; role: string; joined_at: number }>(
    'SELECT * FROM memberships WHERE group_id = ? AND user_id = ?',
    groupId, userId,
  );
  return r ? { groupId: r.group_id, userId: r.user_id, role: r.role as Membership['role'], joinedAt: r.joined_at } : null;
}

export function updateMascot(groupId: string, fn: (m: Group['mascot']) => Group['mascot']) {
  const g = getGroup(groupId);
  if (!g) return;
  run('UPDATE groups SET mascot = ? WHERE id = ?', json.str(fn(g.mascot)), groupId);
}

/* ───────────────────────── Posts ───────────────────────── */

type PostRow = {
  id: string; group_id: string; user_id: string; kind: string; media: string; caption: string | null; taken_at: number;
  created_at: number; week_key: string; ritual: number; from_roll: number; frame: string | null; remember: number;
  plan_id: string | null; max_tier: string; bytes: number;
};

export interface PostFull extends Post {
  planId: string | null;
  maxTier: Rarity;
}

export function toPost(r: PostRow): PostFull {
  return {
    id: r.id,
    groupId: r.group_id,
    userId: r.user_id,
    kind: r.kind as Post['kind'],
    media: json.parse(r.media, { main: '', width: 1, height: 1 }),
    caption: r.caption,
    takenAt: r.taken_at,
    createdAt: r.created_at,
    weekKey: r.week_key,
    ritual: !!r.ritual,
    fromRoll: !!r.from_roll,
    frame: r.frame,
    remember: !!r.remember,
    planId: r.plan_id,
    maxTier: r.max_tier as Rarity,
  };
}

export function getPost(postId: string) {
  const r = get<PostRow>('SELECT * FROM posts WHERE id = ?', postId);
  return r ? toPost(r) : null;
}

export function postsForGroup(groupId: string, opts: { since?: number; weekKey?: string; limit?: number } = {}) {
  const where = ['group_id = ?'];
  const params: (string | number)[] = [groupId];
  if (opts.since !== undefined) {
    where.push('created_at >= ?');
    params.push(opts.since);
  }
  if (opts.weekKey) {
    where.push('week_key = ?');
    params.push(opts.weekKey);
  }
  return all<PostRow>(
    `SELECT * FROM posts WHERE ${where.join(' AND ')} ORDER BY created_at DESC ${opts.limit ? `LIMIT ${Number(opts.limit)}` : ''}`,
    ...params,
  ).map(toPost);
}

export function insertPost(p: Omit<PostFull, 'id' | 'weekKey' | 'maxTier'> & { id?: string; bytes?: number }, group: Group) {
  const pid = p.id ?? id('p');
  const wk = weekKey(p.createdAt, group);
  const full: PostFull = { ...p, id: pid, weekKey: wk, maxTier: 'common' };
  full.maxTier = maxTier(signalsOf(full, Boolean(p.planId)));
  run(
    `INSERT INTO posts (id, group_id, user_id, kind, media, caption, taken_at, created_at, week_key, ritual, from_roll, frame, remember, plan_id, max_tier, bytes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    pid, p.groupId, p.userId, p.kind, json.str(p.media), p.caption, p.takenAt, p.createdAt, wk, p.ritual ? 1 : 0,
    p.fromRoll ? 1 : 0, p.frame, p.remember ? 1 : 0, p.planId, full.maxTier, p.bytes ?? 0,
  );
  return full;
}

export function deletePost(postId: string) {
  run('DELETE FROM posts WHERE id = ?', postId);
}

/* ───────────────────────── Reactions ───────────────────────── */

export function reactionsFor(postId: string): (Reaction & { id: string; guest: string | null })[] {
  return all<{ id: string; post_id: string; user_id: string | null; guest: string | null; emoji: string | null; sticker_id: string | null; created_at: number }>(
    'SELECT * FROM reactions WHERE post_id = ? ORDER BY created_at',
    postId,
  ).map((r) => ({ id: r.id, postId: r.post_id, userId: r.user_id ?? '', guest: r.guest, emoji: r.emoji, stickerId: r.sticker_id, createdAt: r.created_at }));
}

/* ───────────────────────── Messages ───────────────────────── */

type MessageRow = { id: string; group_id: string; user_id: string | null; kind: string; body: string | null; media: string | null; ref_id: string | null; meta: string; created_at: number };

export function toMessage(r: MessageRow): Message & { meta: Record<string, unknown> } {
  return {
    id: r.id, groupId: r.group_id, userId: r.user_id, kind: r.kind as Message['kind'], body: r.body, media: r.media,
    refId: r.ref_id, createdAt: r.created_at, meta: json.parse(r.meta, {}),
  };
}

export function insertMessage(m: { groupId: string; userId: string | null; kind: Message['kind']; body?: string | null; media?: string | null; refId?: string | null; meta?: Record<string, unknown>; createdAt?: number }) {
  const mid = id('m');
  const t = m.createdAt ?? now();
  run(
    'INSERT INTO messages (id, group_id, user_id, kind, body, media, ref_id, meta, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    mid, m.groupId, m.userId, m.kind, m.body ?? null, m.media ?? null, m.refId ?? null, json.str(m.meta ?? {}), t,
  );
  return toMessage(get<MessageRow>('SELECT * FROM messages WHERE id = ?', mid)!);
}

export function messagesFor(groupId: string, before?: number, limit = 80) {
  return all<MessageRow>(
    `SELECT * FROM messages WHERE group_id = ? ${before ? 'AND created_at < ?' : ''} ORDER BY created_at DESC LIMIT ${limit}`,
    ...(before ? [groupId, before] : [groupId]),
  ).map(toMessage).reverse();
}

/* ───────────────────────── Cards ───────────────────────── */

type CardRow = { id: string; group_id: string; post_id: string; owner_id: string; rarity: string; serial: number | null; traits: string | null; flair: string | null; source: string; obtained_at: number };

export interface CardFull extends Card {
  traits: { backdrop: string; symbol: string } | null;
  flair: string | null;
}

export function toCard(r: CardRow): CardFull {
  return {
    id: r.id, groupId: r.group_id, postId: r.post_id, ownerId: r.owner_id, rarity: r.rarity as Rarity, serial: r.serial,
    traits: json.parse(r.traits, null), flair: r.flair, source: r.source as Card['source'], obtainedAt: r.obtained_at,
  };
}

export function cardsFor(ownerId: string, groupId: string) {
  return all<CardRow>('SELECT * FROM cards WHERE owner_id = ? AND group_id = ? ORDER BY obtained_at DESC', ownerId, groupId).map(toCard);
}

export function getCard(cardId: string) {
  const r = get<CardRow>('SELECT * FROM cards WHERE id = ?', cardId);
  return r ? toCard(r) : null;
}

export function insertCard(c: Omit<CardFull, 'id' | 'serial' | 'traits' | 'flair'>) {
  const cid = id('c');
  run(
    'INSERT INTO cards (id, group_id, post_id, owner_id, rarity, source, obtained_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    cid, c.groupId, c.postId, c.ownerId, c.rarity, c.source, c.obtainedAt,
  );
  return getCard(cid)!;
}

/* ───────────────────────── Objects ───────────────────────── */

type ObjectRow = { id: string; group_id: string | null; kind: string; created_by: string; subjects: string; media: string; style: string | null; provenance: string; meta: string; revoked: number; created_at: number };

export function toObject(r: ObjectRow): LikenessObject & { meta: Record<string, unknown> } {
  return {
    id: r.id, groupId: r.group_id, kind: r.kind as LikenessObject['kind'], createdBy: r.created_by, subjects: json.parse(r.subjects, []),
    media: r.media, style: r.style, provenance: json.parse(r.provenance, {} as LikenessObject['provenance']), createdAt: r.created_at,
    revoked: !!r.revoked, meta: json.parse(r.meta, {}),
  };
}

export function insertObject(o: Omit<LikenessObject, 'id' | 'revoked'> & { meta?: Record<string, unknown> }) {
  const oid = id('o');
  run(
    'INSERT INTO objects (id, group_id, kind, created_by, subjects, media, style, provenance, meta, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    oid, o.groupId, o.kind, o.createdBy, json.str(o.subjects), o.media, o.style, json.str(o.provenance), json.str(o.meta ?? {}), o.createdAt,
  );
  return toObject(get<ObjectRow>('SELECT * FROM objects WHERE id = ?', oid)!);
}

export function getObject(objectId: string) {
  const r = get<ObjectRow>('SELECT * FROM objects WHERE id = ?', objectId);
  return r ? toObject(r) : null;
}

export function objectsFor(opts: { groupId?: string; subject?: string; kind?: string; createdBy?: string }) {
  const where: string[] = [];
  const params: string[] = [];
  if (opts.groupId) {
    where.push('group_id = ?');
    params.push(opts.groupId);
  }
  if (opts.kind) {
    where.push('kind = ?');
    params.push(opts.kind);
  }
  if (opts.createdBy) {
    where.push('created_by = ?');
    params.push(opts.createdBy);
  }
  if (opts.subject) {
    where.push(`EXISTS (SELECT 1 FROM json_each(objects.subjects) WHERE value = ?)`);
    params.push(opts.subject);
  }
  return all<ObjectRow>(`SELECT * FROM objects ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY created_at DESC`, ...params).map(toObject);
}

/* ───────────────────────── Views (for the push rule) ───────────────────────── */

export function markSeen(userId: string, refIds: string[]) {
  const t = now();
  for (const r of refIds) run('INSERT OR IGNORE INTO views (user_id, ref_id, at) VALUES (?, ?, ?)', userId, r, t);
}

export function seenSet(userId: string, refIds: string[]) {
  if (!refIds.length) return new Set<string>();
  const rows = all<{ ref_id: string }>(
    `SELECT ref_id FROM views WHERE user_id = ? AND ref_id IN (${refIds.map(() => '?').join(',')})`,
    userId, ...refIds,
  );
  return new Set(rows.map((r) => r.ref_id));
}

export function jobDone(key: string) {
  return Boolean(get('SELECT 1 FROM jobs_done WHERE key = ?', key));
}

export function markJob(key: string) {
  run('INSERT OR IGNORE INTO jobs_done (key, at) VALUES (?, ?)', key, now());
}
