/**
 * The in-Claude build's engine. Boots, in order:
 *   1. the Claude capabilities this page declares (db, user, assets, room, sample, downloads);
 *   2. SQLite (sql.js) with the shared snapshot and every op after it (oplog.ts);
 *   3. the whole server (apps/server/src/page.ts), with its hooks pointed at this page:
 *      the signed-in Claude viewer is the user, events reach this page and travel to friends inside
 *      the op log, the game master writes through the viewer's own Claude, media go to the
 *      artifact's assets or shared documents (media.ts);
 *   4. a leader lease: one open page at a time runs the scheduled jobs (the weekly ritual, the
 *      develop, games, plan reminders) and compacts the log.
 * The app then calls `engine.fetch(request)` where the Node build would call `fetch('/api/…')`.
 */
import { Buffer } from 'buffer';
import type { SqlJsStatic } from 'sql.js';
import { use, type Db, type Downloads, type Room, type Sample, type User } from './claude';
import { MediaStore } from './media';
import { Sync, type EventRec } from './oplog';
import { sqlJs } from './shims/sqlite';

(globalThis as unknown as { Buffer: typeof Buffer }).Buffer ??= Buffer;

type ServerModule = typeof import('../../../server/src/page.ts');

export interface Engine {
  fetch(req: Request): Promise<Response>;
  media: MediaStore;
  sync: Sync;
  userId: string | null;
  user: User | null;
  room: Room | null;
  sample: Sample | null;
  downloads: Downloads | null;
  /** The platform said this viewer cannot write (a view-only share). */
  readOnly: boolean;
  /** No shared store: signed out, or opened outside Claude. Changes stay on this device until reload. */
  offline: boolean;
  onEvent(fn: (e: unknown) => void): () => void;
  onChange(fn: () => void): () => void;
  onReadOnly(fn: () => void): () => void;
}

async function loadSqlJs(): Promise<SqlJsStatic> {
  // The asm.js build: plain JavaScript, so it runs whatever the page's WebAssembly policy is.
  const mod = (await import('sql.js/dist/sql-asm.js')) as unknown as { default: (o?: object) => Promise<SqlJsStatic> };
  return mod.default();
}

function localId() {
  try {
    let id = localStorage.getItem('roll-local-user');
    if (!id) {
      id = `local-${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem('roll-local-user', id);
    }
    return id;
  } catch {
    return `local-${Math.random().toString(36).slice(2, 12)}`;
  }
}

let booting: Promise<Engine> | null = null;
export function engine() {
  booting ??= boot();
  return booting;
}

async function boot(): Promise<Engine> {
  const [db, user, assets, room, sample, downloads] = await Promise.all([
    use('db'),
    use('user'),
    use('assets'),
    use('room'),
    use('sample'),
    use('downloads'),
  ]);
  const platformId = user ? await user.id().catch(() => null) : null;
  const canWrite = user ? await user.can('data.write').catch(() => null) : null;
  const shared: Db | null = platformId ? db : null;
  // Without a Claude identity (opened outside Claude) the app still runs, for this device only.
  const userId = platformId ?? localId();

  const eventFns = new Set<(e: unknown) => void>();
  const changeFns = new Set<() => void>();
  const readOnlyFns = new Set<() => void>();
  const SQL = await loadSqlJs();
  const media = new MediaStore(shared, assets);
  const client = Math.random().toString(36).slice(2, 10);

  const isMember = (groupId: string) => {
    if (!userId) return false;
    try {
      const r = sqlJs().exec('SELECT 1 FROM memberships WHERE group_id = ? AND user_id = ?', [groupId, userId]);
      return r.length > 0 && r[0].values.length > 0;
    } catch {
      return false;
    }
  };
  const forMe = (rec: EventRec) => {
    if (rec.x && rec.x === userId) return false;
    if (rec.u) return rec.u === userId;
    if (rec.g) return isMember(rec.g);
    return false;
  };
  const deliver = (ev: unknown) => {
    for (const fn of eventFns) fn(ev);
  };

  let changeTimer: ReturnType<typeof setTimeout> | null = null;
  const sync = new Sync(SQL, shared, room, () => userId, client, {
    onEvents: (events) => {
      for (const rec of events) if (forMe(rec)) deliver(rec.ev);
    },
    onChanged: () => {
      if (changeTimer) return;
      changeTimer = setTimeout(() => {
        changeTimer = null;
        for (const fn of changeFns) fn();
      }, 250);
    },
    onReadOnly: () => {
      for (const fn of readOnlyFns) fn();
    },
  });
  if (canWrite === false) sync.readOnly = true;

  let server!: ServerModule;
  await sync.start(async () => {
    server = await import('../../../server/src/page.ts');
  });

  const { platform, setMediaStore, app, runJobsOnce, env } = server;
  platform.inPage = true;
  // Invites point at the artifact itself (its link is baked in at build time, scripts/build-live.mjs).
  env.publicUrl = import.meta.env.VITE_LIVE_URL ?? '';
  env.demo = false;
  platform.userIdFor = () => userId;
  platform.emit = (target, event) => {
    const rec: EventRec = { ev: event, ...(target.groupId ? { g: target.groupId } : {}), ...(target.userId ? { u: target.userId } : {}), ...(target.exceptUserId ? { x: target.exceptUserId } : {}) };
    sync.addEvent(rec);
    if (forMe(rec)) queueMicrotask(() => deliver(event));
  };
  platform.askJson = sample ? (prompt) => sample.json(prompt, { cache: false }) : null;
  setMediaStore({ read: (url) => media.read(url), write: (buf, ext) => media.write(buf, ext) });

  // Friends typing (ephemeral; never stored).
  room?.on('typing', (m) => {
    const d = m.data as { groupId?: string } | undefined;
    if (!m.sameTab && m.by && d?.groupId && isMember(d.groupId)) deliver({ type: 'typing', groupId: d.groupId, userId: m.by });
  });

  // One page at a time runs the jobs and compacts the log.
  if (shared && !sync.readOnly) {
    const snapshotStore = assets
      ? {
          upload: async (text: string) => (await assets.upload(new Blob([text], { type: 'text/plain' }), { type: 'text/plain' })).id,
          remove: async (id: string) => void (await assets.delete(id)),
        }
      : null;
    let running = false;
    const tick = async () => {
      if (running || document.visibilityState === 'hidden') return;
      running = true;
      try {
        if (await sync.holdLeadership()) {
          await runJobsOnce();
          await sync.compact(snapshotStore);
        }
      } catch (e) {
        console.warn('[roll] leader tick', e);
      } finally {
        running = false;
      }
    };
    setTimeout(() => void tick(), 4000);
    setInterval(() => void tick(), 25_000);
  } else if (!shared) {
    // Opened outside Claude (or signed out): the jobs still run for this device's session.
    setInterval(() => void runJobsOnce(), 30_000);
  }
  setInterval(() => sync.advanceStable(), 5000);

  // The artifact's owner is who shared it; friends opening it are pointed at the owner's group.
  if (shared && user && (await user.isOwner().catch(() => false))) {
    const cur = await shared.doc('meta/owner').get().catch(() => null);
    if (cur && cur.data()?.id !== userId) await shared.doc('meta/owner').set({ id: userId }).catch(() => undefined);
  }

  const e: Engine = {
    async fetch(req: Request) {
      try {
        return await app.fetch(req);
      } finally {
        // Writes made by this request go out promptly.
        sync.flush();
      }
    },
    media,
    sync,
    userId,
    user,
    room,
    sample,
    downloads,
    get readOnly() {
      return sync.readOnly;
    },
    offline: !shared,
    onEvent(fn) {
      eventFns.add(fn);
      return () => void eventFns.delete(fn);
    },
    onChange(fn) {
      changeFns.add(fn);
      return () => void changeFns.delete(fn);
    },
    onReadOnly(fn) {
      readOnlyFns.add(fn);
      return () => void readOnlyFns.delete(fn);
    },
  };
  // Test hook (scripts/sweep-live.mjs): the engine is this viewer's own server, so exposing it to
  // the page that already runs it grants nothing new.
  Object.assign(window as unknown as Record<string, unknown>, { __rollEngine: e, __rollServer: server });
  return e;
}

/** The invite code a newcomer is offered: the newest group the artifact's owner is in, else the newest group. */
export async function suggestedJoinCode(): Promise<string | null> {
  const e = await engine();
  const owner = e.offline ? null : ((await e.sync.ownerId()) ?? null);
  const q = (sql: string, params: (string | number)[] = []) => {
    try {
      const r = sqlJs().exec(sql, params);
      return (r[0]?.values?.[0]?.[0] as string | undefined) ?? null;
    } catch {
      return null;
    }
  };
  if (e.userId && q('SELECT group_id FROM memberships WHERE user_id = ? LIMIT 1', [e.userId])) return null;
  return (
    (owner ? q('SELECT g.invite_code FROM groups g JOIN memberships m ON m.group_id = g.id WHERE m.user_id = ? ORDER BY g.created_at DESC LIMIT 1', [owner]) : null) ??
    q('SELECT invite_code FROM groups ORDER BY created_at DESC LIMIT 1')
  );
}
