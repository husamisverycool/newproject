import { useEffect } from 'react';
import { queryClient, invalidateGroup } from './queries';
import { useUi } from './store';
import { sfx, haptic } from './feedback';
import { LIVE, STATIC } from './static';

type Evt =
  | { type: 'hello' }
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

let socket: WebSocket | null = null;
const listeners = new Set<(e: Evt) => void>();

export function onRealtime(fn: (e: Evt) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function sendRealtime(msg: unknown) {
  if (LIVE) {
    // In Claude, typing travels through the artifact's room (live/engine.ts listens for it).
    const m = msg as { type?: string; groupId?: string };
    if (m.type === 'typing' && m.groupId)
      void import('../live/engine').then(({ engine }) => engine()).then((e) => e.room?.emit('typing', { groupId: m.groupId }).catch(() => undefined));
    return;
  }
  if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(msg));
}

function handle(e: Evt) {
  const ui = useUi.getState();
  switch (e.type) {
    case 'post':
    case 'post_deleted':
    case 'ritual':
    case 'wall':
    case 'group':
      invalidateGroup(e.groupId);
      break;
    case 'developed':
      invalidateGroup(e.groupId);
      sfx.develop();
      break;
    case 'message':
      void queryClient.invalidateQueries({ queryKey: ['messages', e.groupId] });
      break;
    case 'game':
      void queryClient.invalidateQueries({ queryKey: ['game', e.groupId] });
      void queryClient.invalidateQueries({ queryKey: ['messages', e.groupId] });
      break;
    case 'reaction':
      // Locket: the poster "sees emojis rain down on their photo".
      if (e.emoji) ui.setRain({ postId: e.postId, emoji: e.emoji, key: Date.now() });
      haptic('light');
      void queryClient.invalidateQueries({ queryKey: ['feed'] });
      break;
    case 'notification':
      ui.pushToast({ title: e.title, body: e.body, kind: e.kind, groupId: e.groupId });
      void queryClient.invalidateQueries({ queryKey: ['me'] });
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      break;
    case 'trade':
      void queryClient.invalidateQueries({ queryKey: ['trades'] });
      void queryClient.invalidateQueries({ queryKey: ['binder'] });
      break;
    case 'party':
      queryClient.setQueryData(['party', e.groupId], { party: e.state });
      break;
  }
  for (const l of listeners) l(e);
}

export function useRealtime(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    if (LIVE) {
      // Events come from this page's own server and from friends' ops; any change friends made
      // refreshes what is on screen.
      let off: (() => void)[] = [];
      let dead = false;
      void import('../live/engine').then(async ({ engine }) => {
        const e = await engine();
        if (dead) return;
        off = [
          e.onEvent((ev) => handle(ev as Evt)),
          e.onChange(() => void queryClient.invalidateQueries()),
        ];
      });
      return () => {
        dead = true;
        off.forEach((f) => f());
      };
    }
    let stop = false;
    let retry = 500;
    const connect = () => {
      const proto = location.protocol === 'https:' ? 'wss' : 'ws';
      if (STATIC) return;
      socket = new WebSocket(`${proto}://${location.host}/ws`);
      socket.onmessage = (m) => {
        try {
          handle(JSON.parse(m.data));
        } catch {
          /* ignore */
        }
      };
      socket.onopen = () => {
        retry = 500;
      };
      socket.onclose = () => {
        if (stop) return;
        setTimeout(connect, retry);
        retry = Math.min(10_000, retry * 2);
      };
    };
    connect();
    return () => {
      stop = true;
      socket?.close();
      socket = null;
    };
  }, [enabled]);
}
