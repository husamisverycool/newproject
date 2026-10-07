import type { IncomingMessage, Server } from 'node:http';
import { WebSocketServer, type WebSocket } from 'ws';
import { userFromCookieHeader } from './auth.ts';
import { groupsForUser } from './repo.ts';

/**
 * One WebSocket per open client. Events fan out to every member of a group (new posts, chat, the
 * ritual Live Activity counter, game updates) or to one user (reactions — visible to the poster only).
 */

interface Conn {
  ws: WebSocket;
  userId: string;
  groups: Set<string>;
}

const conns = new Set<Conn>();

export type RealtimeEvent =
  | { type: 'post'; groupId: string; postId: string; userId: string }
  | { type: 'post_deleted'; groupId: string; postId: string }
  | { type: 'reaction'; postId: string; emoji: string | null; stickerId: string | null; fromName: string }
  | { type: 'message'; groupId: string; messageId: string }
  | { type: 'ritual'; groupId: string; posted: number; of: number }
  | { type: 'game'; groupId: string; gameId: string }
  | { type: 'wall'; groupId: string; weekKey: string; version: number }
  | { type: 'developed'; groupId: string; weekKey: string }
  | { type: 'notification'; id: string; title: string; body: string; kind: string; groupId: string | null }
  | { type: 'party'; groupId: string; state: unknown }
  | { type: 'trade'; tradeId: string }
  | { type: 'group'; groupId: string }
  | { type: 'typing'; groupId: string; userId: string };

export function attachRealtime(server: Server) {
  const wss = new WebSocketServer({ noServer: true });
  server.on('upgrade', (req: IncomingMessage, socket, head) => {
    if (!req.url?.startsWith('/ws')) return;
    const user = userFromCookieHeader(req.headers.cookie);
    if (!user) {
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) => {
      const conn: Conn = { ws, userId: user.id, groups: new Set(groupsForUser(user.id).map((g) => g.id)) };
      conns.add(conn);
      ws.on('close', () => conns.delete(conn));
      ws.on('message', (raw) => {
        try {
          const msg = JSON.parse(String(raw)) as { type: string; groupId?: string };
          if (msg.type === 'typing' && msg.groupId && conn.groups.has(msg.groupId)) {
            toGroup(msg.groupId, { type: 'typing', groupId: msg.groupId, userId: conn.userId }, conn.userId);
          }
        } catch {
          /* ignore malformed frames */
        }
      });
      ws.send(JSON.stringify({ type: 'hello' }));
    });
  });
}

/** Re-read group membership for a user's open sockets (after join/leave). */
export function refreshMembership(userId: string) {
  const ids = new Set(groupsForUser(userId).map((g) => g.id));
  for (const c of conns) if (c.userId === userId) c.groups = ids;
}

export function toGroup(groupId: string, event: RealtimeEvent, exceptUserId?: string) {
  const payload = JSON.stringify(event);
  for (const c of conns) {
    if (c.groups.has(groupId) && c.userId !== exceptUserId && c.ws.readyState === c.ws.OPEN) c.ws.send(payload);
  }
}

export function toUser(userId: string, event: RealtimeEvent) {
  const payload = JSON.stringify(event);
  for (const c of conns) if (c.userId === userId && c.ws.readyState === c.ws.OPEN) c.ws.send(payload);
}

export function onlineUserIds() {
  return new Set([...conns].map((c) => c.userId));
}
