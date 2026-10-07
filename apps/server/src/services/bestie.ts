import { locket } from '@app/shared';
import { all, now, run } from '../db.ts';
import { getGroup, getUser, groupsForUser, id, membership, publicUser, type UserFull } from '../repo.ts';
import { GameError } from './cards.ts';
import { push } from './notify.ts';
import { feed } from './posts.ts';

/**
 * The one-to-one "bestie" lane (spec §C), after Locket's "Best Friend or Crush widget" [V-weak]:
 * "A 'Crush' or 'Best Friend' widget shows photos from only that person, and you can send images to
 * just that person" [V] (research/10 §4). Adapted per person inside a group: you pick one friend you
 * share a group with; their photos (group posts you can see plus photos sent only to you) fill the
 * widget and the lane; a photo sent "to just that person" never reaches the group's wall, cards or games.
 */

export interface BestieSetting {
  groupId: string;
  userId: string;
}

/** The member's chosen friend, if both of them are still in that group. */
export function bestieOf(user: UserFull): BestieSetting | null {
  const b = (user.settings as Record<string, unknown>).bestie as BestieSetting | null | undefined;
  if (!b?.groupId || !b.userId || b.userId === user.id) return null;
  if (!membership(b.groupId, user.id) || !membership(b.groupId, b.userId)) return null;
  return { groupId: b.groupId, userId: b.userId };
}

export function assertPair(groupId: string, a: string, b: string) {
  if (a === b || !membership(groupId, a) || !membership(groupId, b)) throw new GameError('not_found');
}

type Direct = { id: string; group_id: string; from_user: string; to_user: string; media: string; caption: string | null; created_at: number };

function directDTO(d: Direct) {
  const from = getUser(d.from_user);
  const media = JSON.parse(d.media) as { main: string; thumb: string };
  return {
    id: d.id, groupId: d.group_id, direct: true as const, user: from ? publicUser(from) : null, to: d.to_user, media, caption: d.caption, createdAt: d.created_at,
  };
}

/** Everything in the lane between the viewer and one friend, newest first. */
export function lane(viewer: UserFull, otherId: string, limit = 60) {
  const other = getUser(otherId);
  if (!other) throw new GameError('not_found');
  const shared = groupsForUser(viewer.id).filter((g) => membership(g.id, otherId));
  if (!shared.length) throw new GameError('not_found');
  // The group feed's own rules apply: the current week stays blurred until the viewer posts (spec §E).
  const posts = shared.flatMap((g) => feed(g, viewer.id, 400).filter((p) => p.user.id === otherId));
  const directs = all<Direct>(
    'SELECT * FROM direct_photos WHERE (from_user = ? AND to_user = ?) OR (from_user = ? AND to_user = ?) ORDER BY created_at DESC LIMIT ?',
    otherId, viewer.id, viewer.id, otherId, limit,
  ).map(directDTO);
  const items = [...posts.map((p) => ({ kind: 'post' as const, at: p.createdAt, post: p })), ...directs.map((d) => ({ kind: 'direct' as const, at: d.createdAt, direct: d }))]
    .sort((a, b) => b.at - a.at)
    .slice(0, limit);
  // Photos sent from the lane go through the group the two share (the widget's group when it is this friend).
  const b = bestieOf(viewer);
  const groupId = b?.userId === otherId ? b.groupId : shared[0].id;
  return { user: publicUser(other), groupId, items };
}

/** "send images to just that person" [V]. */
export function sendDirect(from: UserFull, groupId: string, toUserId: string, media: { main: string; thumb: string }, caption: string | null) {
  assertPair(groupId, from.id, toUserId);
  const did = id('dp');
  run('INSERT INTO direct_photos (id, group_id, from_user, to_user, media, caption, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)', did, groupId, from.id, toUserId, JSON.stringify(media), caption, now());
  const g = getGroup(groupId)!;
  push({ userId: toUserId, groupId, kind: 'new_posts', title: g.name, body: locket.pushNew(from.name.split(' ')[0]), refIds: [did, from.id], url: `/bestie/${from.id}` });
  return did;
}

/** The widget: the friend's latest photo you can see — a group post or one sent only to you. */
export function widget(viewer: UserFull) {
  const b = bestieOf(viewer);
  if (!b) return null;
  const l = lane(viewer, b.userId, 12);
  const latest = l.items.find((i) => (i.kind === 'post' ? !i.post.blurred : i.direct.user?.id === b.userId)) ?? null;
  return {
    groupId: b.groupId,
    user: l.user,
    latest: latest ? (latest.kind === 'post' ? { media: latest.post.media, caption: latest.post.caption, createdAt: latest.post.createdAt } : { media: latest.direct.media, caption: latest.direct.caption, createdAt: latest.direct.createdAt }) : null,
  };
}
