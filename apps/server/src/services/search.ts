import { ritualWindow, weekBlurred, type Group } from '@app/shared';
import { all, get, now, run } from '../db.ts';
import { getUser, members, type PostFull } from '../repo.ts';
import { toGroup } from '../realtime.ts';
import { GameError } from './cards.ts';
import { toDTO, viewerPostedIn, visiblePosts } from './posts.ts';

/**
 * Searching the archive (spec §L): Google Ask Photos is opt-in [V], adapted as "opt-in group search by
 * caption and self-tags only". Self-tagging (spec §S, a hard rule): a member can tag only themself in a
 * photo, never anyone else, and there is no face matching (Google and Apple People are omitted).
 * Like Ask Photos, the opt-in belongs to the person searching: only members who turned search on can
 * search, and they only ever find photos they can already see in the group (the soft-locked current
 * week stays out until they post).
 */

export const searchOn = (userId: string) => Boolean((getUser(userId)?.settings as Record<string, unknown> | undefined)?.searchOptIn);

export function setSelfTag(post: PostFull, userId: string, on: boolean) {
  if (on) run('INSERT OR IGNORE INTO post_tags (post_id, user_id, created_at) VALUES (?, ?, ?)', post.id, userId, now());
  else run('DELETE FROM post_tags WHERE post_id = ? AND user_id = ?', post.id, userId);
  toGroup(post.groupId, { type: 'post', groupId: post.groupId, postId: post.id, userId });
}

export function tagsFor(postIds: string[]) {
  const out = new Map<string, string[]>();
  if (!postIds.length) return out;
  for (const r of all<{ post_id: string; user_id: string }>(`SELECT post_id, user_id FROM post_tags WHERE post_id IN (${postIds.map(() => '?').join(',')}) ORDER BY created_at`, ...postIds)) {
    out.set(r.post_id, [...(out.get(r.post_id) ?? []), r.user_id]);
  }
  return out;
}

const norm = (s: string) => s.toLocaleLowerCase('en-US').normalize('NFKD').replace(/\p{M}/gu, '');

export function search(group: Group, viewerId: string, query: string, limit = 120) {
  if (!searchOn(viewerId)) throw new GameError('search_off');
  const terms = norm(query).split(/\s+/).filter(Boolean).slice(0, 6);
  if (!terms.length) return [];
  const ms = members(group.id);
  const names = new Map(ms.map((m) => [m.userId, norm(m.user.name)]));
  const current = ritualWindow(now(), group).weekKey;
  const postedNow = viewerPostedIn(group.id, viewerId, current);
  const posts = visiblePosts(group, viewerId).filter(
    (p) => p.userId === viewerId || !weekBlurred({ weekKey: p.weekKey, currentWeekKey: current, viewerPostedThisWeek: postedNow }),
  );
  const tags = tagsFor(posts.map((p) => p.id));
  const hits = posts.filter((p) => {
    const caption = p.caption ? norm(p.caption) : '';
    const tagged = (tags.get(p.id) ?? []).map((u) => names.get(u) ?? '');
    return terms.every((t) => caption.includes(t) || tagged.some((n) => n.split(/\s+/).some((w) => w.startsWith(t))));
  });
  return toDTO(hits.slice(0, limit), viewerId);
}

/** Members who tagged themselves in a post (for the post's byline). */
export function taggedUsers(postId: string) {
  return all<{ user_id: string }>('SELECT user_id FROM post_tags WHERE post_id = ? ORDER BY created_at', postId).map((r) => r.user_id);
}

export function isTagged(postId: string, userId: string) {
  return Boolean(get('SELECT 1 AS x FROM post_tags WHERE post_id = ? AND user_id = ?', postId, userId));
}
