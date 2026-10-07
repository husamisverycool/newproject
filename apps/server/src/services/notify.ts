import fs from 'node:fs';
import path from 'node:path';
import webpush from 'web-push';
import { decidePush, localParts, ritualWindow, type NotificationKind } from '@app/shared';
import { all, json, now, run } from '../db.ts';
import { env } from '../env.ts';
import { getGroup, getUser, id, seenSet } from '../repo.ts';
import { toUser } from '../realtime.ts';

/**
 * The one door every push goes through. `decidePush` (packages/shared/src/notify.ts) enforces the
 * spec §O hard rule — no push without real, unseen content behind it — plus weekly and gap limits
 * and quiet hours. Delivery: in-app notification centre + realtime toast, and Web Push when the
 * member has installed the PWA and opted in.
 */

const vapidFile = path.join(env.dataDir, 'vapid.json');
function vapid() {
  if (!fs.existsSync(vapidFile)) fs.writeFileSync(vapidFile, JSON.stringify(webpush.generateVAPIDKeys()));
  return JSON.parse(fs.readFileSync(vapidFile, 'utf8')) as { publicKey: string; privateKey: string };
}
export const vapidPublicKey = () => vapid().publicKey;

run(`CREATE TABLE IF NOT EXISTS push_subs (user_id TEXT NOT NULL, endpoint TEXT PRIMARY KEY, sub TEXT NOT NULL, created_at INTEGER NOT NULL)`);

export function savePushSubscription(userId: string, sub: { endpoint: string }) {
  run('INSERT OR REPLACE INTO push_subs (user_id, endpoint, sub, created_at) VALUES (?, ?, ?, ?)', userId, sub.endpoint, json.str(sub), now());
}

async function webPush(userId: string, payload: { title: string; body: string; url: string; tag: string }) {
  const subs = all<{ endpoint: string; sub: string }>('SELECT endpoint, sub FROM push_subs WHERE user_id = ?', userId);
  if (!subs.length) return;
  const keys = vapid();
  webpush.setVapidDetails(`mailto:push@${'roll.example'}`, keys.publicKey, keys.privateKey);
  for (const s of subs) {
    try {
      await webpush.sendNotification(JSON.parse(s.sub), JSON.stringify(payload), { TTL: 60 * 60 * 12 });
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) run('DELETE FROM push_subs WHERE endpoint = ?', s.endpoint);
    }
  }
}

export interface PushRequest {
  userId: string;
  groupId: string | null;
  kind: NotificationKind;
  title: string;
  body: string;
  refIds: string[];
  url?: string;
}

export function push(req: PushRequest) {
  const user = getUser(req.userId);
  if (!user) return { sent: false, reason: 'no_user' };
  const t = now();
  const tz = user.settings.timeZone ?? 'America/New_York';
  const group = req.groupId ? getGroup(req.groupId) : null;
  const weekStart = group ? ritualWindow(t, group).developsAt - 7 * 86_400_000 : t - 7 * 86_400_000;
  const history = all<{ kind: NotificationKind; group_id: string | null; created_at: number }>(
    'SELECT kind, group_id, created_at FROM notifications WHERE user_id = ? AND created_at > ? ORDER BY created_at DESC',
    req.userId, t - 8 * 86_400_000,
  ).map((h) => ({ kind: h.kind, groupId: h.group_id, createdAt: h.created_at }));
  const decision = decidePush(
    { userId: req.userId, groupId: req.groupId, kind: req.kind, refIds: req.refIds, now: t },
    { seen: seenSet(req.userId, req.refIds), history, localHour: user.settings.quietHours === false ? 12 : localParts(t, tz).hour, weekStart },
  );
  if (!decision.send) return { sent: false, reason: decision.reason };
  const nid = id('n');
  run(
    'INSERT INTO notifications (id, user_id, group_id, kind, title, body, ref_ids, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    nid, req.userId, req.groupId, req.kind, req.title, req.body, json.str(req.refIds), t,
  );
  toUser(req.userId, { type: 'notification', id: nid, title: req.title, body: req.body, kind: req.kind, groupId: req.groupId });
  void webPush(req.userId, { title: req.title, body: req.body, url: req.url ?? '/', tag: `${req.kind}:${req.groupId ?? ''}` });
  return { sent: true, id: nid };
}

export function notificationsFor(userId: string, limit = 60) {
  return all<{ id: string; group_id: string | null; kind: string; title: string; body: string; ref_ids: string; created_at: number; read_at: number | null }>(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
    userId, limit,
  ).map((n) => ({ id: n.id, groupId: n.group_id, kind: n.kind, title: n.title, body: n.body, refIds: json.parse<string[]>(n.ref_ids, []), createdAt: n.created_at, readAt: n.read_at }));
}

export function markRead(userId: string) {
  run('UPDATE notifications SET read_at = ? WHERE user_id = ? AND read_at IS NULL', now(), userId);
}
