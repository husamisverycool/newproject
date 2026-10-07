import {
  MASCOT_XP,
  SPARKS_EARN,
  type Group,
  type Post,
  groupStreak,
  newPostsCopy,
  postVisibleTo,
  reactionsVisibleTo,
  ritualWindow,
  sameWeekYearsAgo,
  wallUnlocked,
  weekBlurred,
  weekKey,
  weekKeyOffset,
  weekStartKey,
} from '@app/shared';
import { all, get, json, now, run } from '../db.ts';
import {
  type PostFull,
  addCurrency,
  getPost,
  id,
  insertPost,
  markSeen,
  members,
  membership,
  postsForGroup,
  publicUser,
  reactionsFor,
  updateMascot,
  usersByIds,
} from '../repo.ts';
import { toGroup, toUser } from '../realtime.ts';
import { push } from './notify.ts';

export type PublicUser = ReturnType<typeof publicUser>;

export interface PostDTO {
  id: string;
  groupId: string;
  user: PublicUser;
  kind: Post['kind'];
  media: Post['media'];
  caption: string | null;
  takenAt: number;
  createdAt: number;
  weekKey: string;
  ritual: boolean;
  fromRoll: boolean;
  frame: string | null;
  remember: boolean;
  maxTier: string;
  planId: string | null;
  mine: boolean;
  seen: boolean;
  /** Present only for the poster (spec §C: reactions visible only to the poster, counts hidden). */
  reactions?: { user: PublicUser | null; emoji: string | null; stickerUrl: string | null; createdAt: number; guest: boolean }[];
}

export function toDTO(posts: PostFull[], viewerId: string): PostDTO[] {
  const users = new Map(usersByIds([...new Set(posts.map((p) => p.userId))]).map((u) => [u.id, publicUser(u)]));
  const seen = new Set(
    posts.length
      ? all<{ ref_id: string }>(`SELECT ref_id FROM views WHERE user_id = ? AND ref_id IN (${posts.map(() => '?').join(',')})`, viewerId, ...posts.map((p) => p.id)).map((r) => r.ref_id)
      : [],
  );
  return posts.map((p) => {
    const dto: PostDTO = {
      id: p.id, groupId: p.groupId, user: users.get(p.userId)!, kind: p.kind, media: p.media, caption: p.caption, takenAt: p.takenAt,
      createdAt: p.createdAt, weekKey: p.weekKey, ritual: p.ritual, fromRoll: p.fromRoll, frame: p.frame, remember: p.remember,
      maxTier: p.maxTier, planId: p.planId, mine: p.userId === viewerId, seen: seen.has(p.id) || p.userId === viewerId,
    };
    if (reactionsVisibleTo(viewerId, p)) {
      const rs = reactionsFor(p.id);
      const ru = new Map(usersByIds([...new Set(rs.map((r) => r.userId).filter(Boolean))]).map((u) => [u.id, publicUser(u)]));
      const stickers = new Map(
        all<{ id: string; media: string }>(`SELECT id, media FROM objects WHERE id IN (${rs.map(() => '?').join(',') || "''"})`, ...rs.map((r) => r.stickerId ?? '')).map((o) => [o.id, o.media]),
      );
      dto.reactions = rs.map((r) => ({ user: r.userId ? ru.get(r.userId) ?? null : null, emoji: r.emoji, stickerUrl: r.stickerId ? stickers.get(r.stickerId) ?? null : null, createdAt: r.createdAt, guest: Boolean(r.guest) }));
    }
    return dto;
  });
}

export function visiblePosts(group: Group, viewerId: string, opts: { weekKey?: string; limit?: number } = {}) {
  const m = membership(group.id, viewerId);
  if (!m) return [];
  return postsForGroup(group.id, opts).filter((p) => postVisibleTo(p, m, group));
}

export function viewerPostedIn(groupId: string, userId: string, wk: string) {
  return Boolean(get('SELECT 1 FROM posts WHERE group_id = ? AND user_id = ? AND week_key = ? LIMIT 1', groupId, userId, wk));
}

/* ───────────────────────── Create ───────────────────────── */

export interface NewPostInput {
  userId: string;
  kind: Post['kind'];
  media: Post['media'];
  caption: string | null;
  takenAt: number;
  ritual: boolean;
  fromRoll: boolean;
  frame: string | null;
  remember: boolean;
  planId: string | null;
  bytes: number;
  createdAt?: number;
}

export function createPost(group: Group, input: NewPostInput, opts: { silent?: boolean } = {}) {
  const createdAt = input.createdAt ?? now();
  const window = ritualWindow(createdAt, group);
  // Ritual posts are camera-only (spec §D) and only count during the ritual window.
  const ritual = input.ritual && !input.fromRoll && input.kind !== 'rewind' && window.isOpen;
  const post = insertPost({ ...input, ritual, groupId: group.id, createdAt, id: undefined }, group);
  if (opts.silent) return post;

  addCurrency(input.userId, { sparks: ritual ? SPARKS_EARN.ritualPost : SPARKS_EARN.post });
  updateMascot(group.id, (m) => ({ ...m, xp: m.xp + (ritual ? MASCOT_XP.ritualPost : MASCOT_XP.post) }));
  if (input.remember && input.caption) addMemory(group.id, input.caption, post.id, input.userId);

  toGroup(group.id, { type: 'post', groupId: group.id, postId: post.id, userId: input.userId });
  const ms = members(group.id);
  if (window.isOpen) {
    const posted = all<{ n: number }>('SELECT COUNT(DISTINCT user_id) AS n FROM posts WHERE group_id = ? AND week_key = ? AND ritual = 1', group.id, window.weekKey)[0]?.n ?? 0;
    toGroup(group.id, { type: 'ritual', groupId: group.id, posted, of: ms.length });
  }
  const poster = ms.find((m) => m.userId === input.userId)?.user;
  for (const m of ms) {
    if (m.userId === input.userId) continue;
    push({ userId: m.userId, groupId: group.id, kind: 'new_posts', title: `${group.emoji} ${group.name}`, body: newPostsCopy([poster?.name ?? 'Someone']), refIds: [post.id], url: `/g/${group.id}` });
  }
  checkQuest(group);
  return post;
}

/**
 * Locket Rollcall [V]: "share your favorite 10 photos from the past week". The picks are the poster's own
 * in-app photos from this week (ritual posts stay camera-only, spec §D); they join the week's roll.
 */
export function shareRoll(group: Group, userId: string, postIds: string[]) {
  const w = ritualWindow(now(), group);
  if (!w.isOpen) return { ok: false as const };
  const ids = postIds.slice(0, 10);
  const own = all<{ id: string }>(
    `SELECT id FROM posts WHERE group_id = ? AND user_id = ? AND week_key = ? AND from_roll = 0 AND kind != 'rewind' AND id IN (${ids.map(() => '?').join(',') || "''"})`,
    group.id, userId, w.weekKey, ...ids,
  ).map((r) => r.id);
  const already = all<{ n: number }>('SELECT COUNT(*) AS n FROM posts WHERE group_id = ? AND user_id = ? AND week_key = ? AND ritual = 1', group.id, userId, w.weekKey)[0]?.n ?? 0;
  for (const id of own) run('UPDATE posts SET ritual = 1 WHERE id = ?', id);
  if (own.length && !already) {
    addCurrency(userId, { sparks: SPARKS_EARN.ritualPost });
    updateMascot(group.id, (m) => ({ ...m, xp: m.xp + MASCOT_XP.ritualPost }));
  }
  const ms = members(group.id);
  const posted = all<{ n: number }>('SELECT COUNT(DISTINCT user_id) AS n FROM posts WHERE group_id = ? AND week_key = ? AND ritual = 1', group.id, w.weekKey)[0]?.n ?? 0;
  toGroup(group.id, { type: 'ritual', groupId: group.id, posted, of: ms.length });
  return { ok: true as const, shared: own.length };
}

export function addMemory(groupId: string, text: string, sourcePostId: string | null, addedBy: string) {
  const mid = id('mem');
  run('INSERT INTO memory (id, group_id, text, source_post_id, added_by, created_at) VALUES (?, ?, ?, ?, ?, ?)', mid, groupId, text.slice(0, 200), sourcePostId, addedBy, now());
  return mid;
}

export function setRemember(post: PostFull, remember: boolean, userId: string) {
  run('UPDATE posts SET remember = ? WHERE id = ?', remember ? 1 : 0, post.id);
  if (remember && post.caption) addMemory(post.groupId, post.caption, post.id, userId);
  if (!remember) run('DELETE FROM memory WHERE source_post_id = ?', post.id);
}

/* ───────────────────────── Reactions ───────────────────────── */

export function react(post: PostFull, from: { id: string; name: string } | null, input: { emoji?: string | null; stickerId?: string | null; guest?: string | null }) {
  const rid = id('r');
  run(
    'INSERT INTO reactions (id, post_id, user_id, guest, emoji, sticker_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    rid, post.id, from?.id ?? null, input.guest ?? null, input.emoji ?? null, input.stickerId ?? null, now(),
  );
  if (from?.id !== post.userId) {
    toUser(post.userId, { type: 'reaction', postId: post.id, emoji: input.emoji ?? null, stickerId: input.stickerId ?? null, fromName: from?.name ?? 'A guest' });
    push({ userId: post.userId, groupId: post.groupId, kind: 'reaction', title: from?.name ?? 'Someone', body: `reacted ${input.emoji ?? 'with a sticker'} to your photo`, refIds: [rid], url: `/p/${post.id}` });
  }
  return rid;
}

/* ───────────────────────── Feed & journal ───────────────────────── */

export function feed(group: Group, viewerId: string, limit = 60) {
  const posts = visiblePosts(group, viewerId, { limit: limit * 2 }).slice(0, limit);
  const current = ritualWindow(now(), group).weekKey;
  const postedNow = viewerPostedIn(group.id, viewerId, current);
  return toDTO(posts, viewerId).map((p) => ({ ...p, blurred: weekBlurred({ weekKey: p.weekKey, currentWeekKey: current, viewerPostedThisWeek: postedNow }) && !p.mine }));
}

export interface JournalWeek {
  weekKey: string;
  startKey: string;
  current: boolean;
  developed: boolean;
  blurred: boolean;
  wall: { version: number; layout: unknown; style: string } | null;
  members: { user: PublicUser; posts: PostDTO[] }[];
  thisWeekIn: { yearsAgo: number; posts: PostDTO[] } | null;
}

export function journal(group: Group, viewerId: string, weeks = 8): { weeks: JournalWeek[]; unlocked: boolean; memberCount: number } {
  const t = now();
  const current = ritualWindow(t, group).weekKey;
  const ms = members(group.id);
  const m = ms.find((x) => x.userId === viewerId);
  if (!m) return { weeks: [], unlocked: false, memberCount: ms.length };
  const postedNow = viewerPostedIn(group.id, viewerId, current);
  const all_ = visiblePosts(group, viewerId);
  const byWeek = new Map<string, PostFull[]>();
  for (const p of all_) {
    const list = byWeek.get(p.weekKey) ?? [];
    list.push(p);
    byWeek.set(p.weekKey, list);
  }
  const firstKey = weekKey(Math.max(group.createdAt, group.archiveOpen ? 0 : m.joinedAt), group);
  const out: JournalWeek[] = [];
  let wk = current;
  for (let i = 0; i < weeks; i++) {
    const posts = (byWeek.get(wk) ?? []).sort((a, b) => a.createdAt - b.createdAt);
    const dtos = toDTO(posts, viewerId);
    const byMember = new Map<string, PostDTO[]>();
    for (const d of dtos) byMember.set(d.user.id, [...(byMember.get(d.user.id) ?? []), d]);
    const wall = get<{ version: number; layout: string; style: string }>('SELECT version, layout, style FROM walls WHERE group_id = ? AND week_key = ? ORDER BY version DESC LIMIT 1', group.id, wk);
    // Retro's "this week in" card: your own photos from the same week a year ago (from the group archive).
    const ago = sameWeekYearsAgo(Date.parse(`${wk}T12:00:00Z`), 1, group.timeZone);
    const old = all_.filter((p) => p.userId === viewerId && p.takenAt >= ago.start && p.takenAt < ago.end);
    out.push({
      weekKey: wk,
      startKey: weekStartKey(wk),
      current: wk === current,
      developed: wk !== current,
      blurred: weekBlurred({ weekKey: wk, currentWeekKey: current, viewerPostedThisWeek: postedNow }),
      wall: wall ? { version: wall.version, layout: json.parse(wall.layout, null), style: wall.style } : null,
      members: [...byMember.entries()].map(([uid, ps]) => ({ user: ps[0].user ?? publicUser(ms.find((x) => x.userId === uid)!.user), posts: ps })),
      thisWeekIn: old.length ? { yearsAgo: 1, posts: toDTO(old, viewerId) } : null,
    });
    if (wk <= firstKey) break;
    wk = weekKeyOffset(wk, -1);
  }
  return { weeks: out, unlocked: wallUnlocked(ms.length), memberCount: ms.length };
}

/** Yope split view: what each friend is up to right now (latest post per member, last 6 hours). */
export function liveStrip(group: Group, viewerId: string) {
  const since = now() - 6 * 3_600_000;
  const posts = visiblePosts(group, viewerId).filter((p) => p.createdAt >= since);
  const latest = new Map<string, PostFull>();
  for (const p of posts) if (!latest.has(p.userId) || latest.get(p.userId)!.createdAt < p.createdAt) latest.set(p.userId, p);
  return toDTO([...latest.values()].sort((a, b) => b.createdAt - a.createdAt), viewerId);
}

/** Timehop / Google Photos memories: group moments from this day in past years. */
export function onThisDay(group: Group, viewerId: string) {
  const t = now();
  const out: { yearsAgo: number; posts: PostDTO[] }[] = [];
  for (let y = 1; y <= 5; y++) {
    const w = sameWeekYearsAgo(t, y, group.timeZone);
    const posts = visiblePosts(group, viewerId).filter((p) => p.takenAt >= w.start && p.takenAt < w.end);
    if (posts.length) out.push({ yearsAgo: y, posts: toDTO(posts, viewerId) });
  }
  return out;
}

/**
 * Retro's Rewind [V]: "photos from this time last year and older", "a new batch of photos to explore"
 * each week. The group's own photos older than two weeks: this week in past years first, then the
 * rest newest first; the batch changes with the week.
 */
export function rewindBatch(group: Group, viewerId: string, limit = 80) {
  const t = now();
  const sameWeek: PostFull[] = [];
  for (let y = 1; y <= 10; y++) {
    const w = sameWeekYearsAgo(t, y, group.timeZone);
    sameWeek.push(...visiblePosts(group, viewerId).filter((p) => p.takenAt >= w.start && p.takenAt < w.end));
  }
  const seen = new Set(sameWeek.map((p) => p.id));
  const older = visiblePosts(group, viewerId)
    .filter((p) => !seen.has(p.id) && p.takenAt < t - 14 * 86_400_000)
    .sort((a, b) => b.takenAt - a.takenAt);
  return { onThisWeek: toDTO(sameWeek, viewerId), older: toDTO(older.slice(0, limit), viewerId) };
}

export function ritualState(group: Group, viewerId?: string) {
  const t = now();
  const w = ritualWindow(t, group);
  const ms = members(group.id);
  const posters = all<{ user_id: string }>('SELECT DISTINCT user_id FROM posts WHERE group_id = ? AND week_key = ? AND ritual = 1', group.id, w.weekKey).map((r) => r.user_id);
  const weekPosters = new Map<string, Set<string>>();
  for (const r of all<{ week_key: string; user_id: string }>('SELECT DISTINCT week_key, user_id FROM posts WHERE group_id = ?', group.id)) {
    weekPosters.set(r.week_key, (weekPosters.get(r.week_key) ?? new Set()).add(r.user_id));
  }
  const streak = groupStreak(weekPosters, ms.length, w.weekKey);
  return {
    ...w,
    now: t,
    posted: posters.length,
    of: ms.length,
    posters: ms.filter((m) => posters.includes(m.userId)).map((m) => publicUser(m.user)),
    waiting: ms.filter((m) => !posters.includes(m.userId)).map((m) => publicUser(m.user)),
    youPosted: viewerId ? posters.includes(viewerId) : false,
    streak,
  };
}

/* ───────────────────────── Quests (Duolingo Friends Quests) ───────────────────────── */

export const QUEST = { kind: 'everyone_3', perMember: 3, label: 'Everyone posts 3 times this week', reward: 'a bonus pack for everyone' };

export function questState(group: Group) {
  const wk = ritualWindow(now(), group).weekKey;
  const ms = members(group.id);
  const counts = new Map(all<{ user_id: string; n: number }>('SELECT user_id, COUNT(*) AS n FROM posts WHERE group_id = ? AND week_key = ? GROUP BY user_id', group.id, wk).map((r) => [r.user_id, r.n]));
  const progress = ms.reduce((s, m) => s + Math.min(QUEST.perMember, counts.get(m.userId) ?? 0), 0);
  const goal = ms.length * QUEST.perMember;
  const rewarded = Boolean(get('SELECT 1 FROM quests WHERE group_id = ? AND week_key = ? AND kind = ? AND rewarded = 1', group.id, wk, QUEST.kind));
  return {
    weekKey: wk, label: QUEST.label, reward: QUEST.reward, progress, goal, rewarded,
    members: ms.map((m) => ({ user: publicUser(m.user), count: Math.min(QUEST.perMember, counts.get(m.userId) ?? 0) })),
  };
}

function checkQuest(group: Group) {
  const q = questState(group);
  if (q.rewarded || q.goal === 0 || q.progress < q.goal) return;
  run('INSERT OR REPLACE INTO quests (group_id, week_key, kind, goal, rewarded) VALUES (?, ?, ?, ?, 1)', group.id, q.weekKey, QUEST.kind, q.goal);
  for (const m of members(group.id)) {
    run('INSERT INTO packs (id, user_id, group_id, week_key, source, created_at) VALUES (?, ?, ?, ?, ?, ?)', id('pk'), m.userId, group.id, q.weekKey, 'quest', now());
    addCurrency(m.userId, { sparks: SPARKS_EARN.questComplete });
  }
}

export function markPostsSeen(userId: string, postIds: string[]) {
  markSeen(userId, postIds);
}

export { getPost };
