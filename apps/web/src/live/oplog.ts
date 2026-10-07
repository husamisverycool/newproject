/**
 * Shared state for the in-Claude build.
 *
 * Every friend's page runs the whole server against its own in-memory SQLite database. What keeps
 * those databases identical is a shared, ordered log of the write statements the server executed,
 * kept in the artifact's `db` store:
 *
 *   ops/<key>       one batch of statements (gzip + base64), plus the realtime events it caused
 *   snap/current    the latest snapshot: the whole database at one key, so a page that opens later
 *                   loads it and replays only the ops after it
 *   snapdata/<id>   the snapshot's bytes, in parts (or one asset when the writer can upload assets)
 *   meta/leader     a short lease; the page holding it runs the scheduled jobs and the compaction
 *
 * Order: keys are hybrid-logical-clock strings (time · counter · client) that sort the same way on
 * every page. A page's database is always "snapshot + every known op in key order + its own
 * unsent writes". When an op arrives out of order the page rebuilds from a recent local checkpoint
 * (`stable`, which trails the newest ops by a few seconds) instead of from the snapshot.
 */
import { gunzipSync, gzipSync, strFromU8, strToU8 } from 'fflate';
import type { Database, SqlJsStatic, SqlValue } from 'sql.js';
import { attachSqlJs, setRecorder, unrecorded } from './shims/sqlite';
import type { Db, DocSnap, Room } from './claude';

type Param = SqlValue | { $b: string };
export type Stmt = [string, Param[]];
export interface EventRec {
  g?: string; // group id: every member
  u?: string; // user id
  x?: string; // except this user
  ev: unknown;
}
interface Op {
  k: string;
  u: string;
  s: Stmt[];
  e: EventRec[];
}
interface SnapInfo {
  k: string;
  id: string;
  parts: number;
  asset?: string | null;
  at: number;
  cut?: string;
}

const PART = 200_000; // characters of base64 per document, under the 256 KiB document cap
const STABLE_LAG_MS = () => (window as unknown as { __rollStableLag?: number }).__rollStableLag ?? 15_000;
// Tests lower this (window.__rollCompactAfter) to exercise compaction quickly.
const COMPACT_AFTER_OPS = () => (window as unknown as { __rollCompactAfter?: number }).__rollCompactAfter ?? 300;
const KEEP_OPS_MS = 60 * 60_000;

/* ───────────── keys ───────────── */

const pad = (n: number, w: number) => n.toString(36).padStart(w, '0');
const tsOf = (k: string) => parseInt(k.slice(0, 9), 36) || 0;
export const keyAt = (ms: number) => pad(ms, 9);

class Clock {
  private ts = 0;
  private seq = 0;
  constructor(private client: string) {}
  observe(k: string) {
    const t = tsOf(k);
    const q = parseInt(k.slice(10, 14), 36) || 0;
    if (t > this.ts) {
      this.ts = t;
      this.seq = q;
    } else if (t === this.ts && q > this.seq) this.seq = q;
  }
  next() {
    const now = Date.now();
    if (now > this.ts) {
      this.ts = now;
      this.seq = 0;
    } else this.seq++;
    return `${pad(this.ts, 9)}.${pad(this.seq, 4)}.${this.client}`;
  }
}

/* ───────────── encoding ───────────── */

function b64(bytes: Uint8Array) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
function unb64(s: string) {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
const encParams = (ps: SqlValue[]): Param[] => ps.map((p) => (p instanceof Uint8Array ? { $b: b64(p) } : p));
const decParams = (ps: Param[]): SqlValue[] => ps.map((p) => (p && typeof p === 'object' && '$b' in p ? unb64(p.$b) : (p as SqlValue)));

function packOp(s: Stmt[], e: EventRec[]) {
  return b64(gzipSync(strToU8(JSON.stringify({ s, e })), { level: 6 }));
}
function unpackOp(z: string): { s: Stmt[]; e: EventRec[] } {
  return JSON.parse(strFromU8(gunzipSync(unb64(z))));
}

const SAFE = /^\s*(INSERT|UPDATE|DELETE|REPLACE)\b/i;

function applyTo(db: Database, op: Op) {
  for (const [sql, params] of op.s) {
    if (!SAFE.test(sql)) continue; // only data statements travel through the log
    try {
      db.run(sql, decParams(params));
    } catch {
      // Every page meets the same failure at the same point of the same order, so skipping keeps
      // them identical (e.g. two friends creating the same row at once).
    }
  }
}

/* ───────────── the log ───────────── */

export interface SyncHooks {
  /** Realtime events from friends' ops, for this viewer to show. */
  onEvents(events: EventRec[]): void;
  /** The database changed under the app (friends' writes, a rebuild). */
  onChanged(): void;
  /** Writes are refused for this viewer (a view-only share). */
  onReadOnly(): void;
}

export class Sync {
  private clock: Clock;
  private ops = new Map<string, Op>();
  private keys: string[] = []; // sorted, every known op after the snapshot
  private appliedUpTo = '';
  private stable!: Database;
  private stableKey = '';
  private live!: Database;
  private base!: Uint8Array; // the snapshot (with this version's schema) that `baseKey` names
  private baseKey = '';
  private pending: Stmt[] = [];
  private pendingEvents: EventRec[] = [];
  private marks: number[] = [];
  private outbox: Op[] = [];
  private sending = false;
  private snap: SnapInfo | null = null;
  private lastCatchUp = 0;
  private rebuildTimer: ReturnType<typeof setTimeout> | null = null;
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private unsubs: (() => void)[] = [];
  readOnly = false;
  leader = false;

  constructor(
    private SQL: SqlJsStatic,
    private db: Db | null,
    private room: Room | null,
    private userId: () => string | null,
    readonly client: string,
    private hooks: SyncHooks,
  ) {
    this.clock = new Clock(client);
  }

  get connected() {
    return Boolean(this.db);
  }

  /** The live database the server runs against. */
  database() {
    return this.live;
  }

  /* ───── start-up ───── */

  /**
   * 1. Load the snapshot (or start empty). 2. Let `prepareSchema` run the server's CREATE TABLEs on
   * it. 3. Replay every op after the snapshot. Returns once the database is current.
   */
  async start(prepareSchema: () => Promise<void>) {
    let base: Uint8Array | null = null;
    if (this.db) {
      const s = await this.db.doc('snap/current').get().catch(() => null);
      const info = s?.exists ? (s.data() as unknown as SnapInfo) : null;
      if (info?.k) {
        base = await this.loadSnapshot(info).catch(() => null);
        if (base) this.snap = info;
      }
    }
    this.live = base ? new this.SQL.Database(base) : new this.SQL.Database();
    attachSqlJs(this.live);
    await prepareSchema();
    const withSchema = this.live.export();
    attachSqlJs(this.live); // export() reopens the handle; re-apply the pragma
    this.base = withSchema;
    this.baseKey = this.snap?.k ?? '';
    this.stable = new this.SQL.Database(withSchema);
    this.stable.exec('PRAGMA foreign_keys = ON;');
    this.stableKey = this.baseKey;
    this.appliedUpTo = this.stableKey;

    if (this.db) {
      const fresh = await this.fetchAfter(this.stableKey);
      for (const op of fresh) this.remember(op);
      const ready = this.keys.slice();
      for (const k of ready) {
        const op = this.ops.get(k)!;
        applyTo(this.stable, op);
        unrecorded(() => applyTo(this.live, op));
        this.clock.observe(k);
      }
      if (ready.length) {
        this.stableKey = ready[ready.length - 1];
        this.appliedUpTo = this.stableKey;
      }
      this.lastCatchUp = Date.now();
      this.subscribe();
    }
    setRecorder({
      onWrite: (sql, params) => {
        this.pending.push([sql, encParams(params)]);
        this.scheduleFlush();
      },
      begin: () => this.marks.push(this.pending.length),
      commit: () => void this.marks.pop(),
      rollback: () => {
        const m = this.marks.pop();
        if (m !== undefined) this.pending.length = m;
      },
    });
  }

  private async loadSnapshot(info: SnapInfo): Promise<Uint8Array> {
    let text = '';
    if (info.asset) {
      const r = await fetch(`/_blob/${info.asset}`);
      if (!r.ok) throw new Error('snapshot asset missing');
      text = await r.text();
    } else {
      const parts = await Promise.all(Array.from({ length: info.parts }, (_, i) => this.db!.doc(`snapdata/${info.id}-${i}`).get()));
      if (parts.some((p) => !p.exists)) throw new Error('snapshot part missing');
      text = parts.map((p) => String(p.data()!.z)).join('');
    }
    return gunzipSync(unb64(text));
  }

  private remember(op: Op) {
    if (this.ops.has(op.k)) return false;
    this.ops.set(op.k, op);
    // insert into the sorted key list (new keys are almost always last)
    let i = this.keys.length;
    while (i > 0 && this.keys[i - 1] > op.k) i--;
    this.keys.splice(i, 0, op.k);
    return true;
  }

  private decode(d: DocSnap): Op | null {
    const v = d.data() as { k?: string; u?: string; z?: string } | undefined;
    if (!v?.k || typeof v.z !== 'string') return null;
    try {
      const { s, e } = unpackOp(v.z);
      return { k: v.k, u: String(v.u ?? ''), s: Array.isArray(s) ? s : [], e: Array.isArray(e) ? e : [] };
    } catch {
      return null;
    }
  }

  private async fetchAfter(key: string): Promise<Op[]> {
    if (!this.db) return [];
    const out: Op[] = [];
    let cursor = key;
    for (;;) {
      const q = await this.db.collection('ops').where('k', '>', cursor).orderBy('k').limit(1000).get();
      for (const d of q.docs) {
        const op = this.decode(d);
        if (op) out.push(op);
      }
      if (q.size < 1000) break;
      cursor = String(q.docs[q.docs.length - 1].data()!.k);
    }
    return out;
  }

  private subscribe() {
    if (!this.db) return;
    this.unsubs.push(
      this.db
        .collection('ops')
        .orderBy('k', 'desc')
        .limit(60)
        .onSnapshot(
          (s) => {
            const fresh: Op[] = [];
            for (const d of s.docs) {
              const k = d.data()?.k;
              if (typeof k !== 'string' || this.ops.has(k) || k <= this.baseKey) continue; // known: skip the unzip
              const op = this.decode(d);
              if (op) fresh.push(op);
            }
            if (fresh.length) this.receive(fresh);
          },
          () => undefined,
        ),
    );
    this.unsubs.push(
      this.db.doc('snap/current').onSnapshot(
        (s) => {
          if (s.exists) this.snap = s.data() as unknown as SnapInfo;
        },
        () => undefined,
      ),
    );
    // A friend's page says it just wrote an op: fetch it now rather than at the next refresh.
    if (this.room) this.unsubs.push(this.room.on('op', (m) => !m.sameTab && void this.catchUp()));
    const vis = () => {
      if (document.visibilityState === 'visible') void this.catchUp();
    };
    document.addEventListener('visibilitychange', vis);
    this.unsubs.push(() => document.removeEventListener('visibilitychange', vis));
    const every = setInterval(() => void this.catchUp(true), 60_000);
    this.unsubs.push(() => clearInterval(every));
  }

  private catching = false;
  /** Fetch ops newer than what this page knows (`wide`: re-scan the last few minutes for late ops). */
  async catchUp(wide = false) {
    if (!this.db || this.catching) return;
    if (this.snap?.cut && this.lastCatchUp && Date.now() - this.lastCatchUp > KEEP_OPS_MS * 0.75) {
      // Away long enough that ops this page never saw may have been compacted away: start over from
      // the snapshot, once this page's own unsent changes are out.
      if (this.outbox.length || this.pending.length) {
        this.flush();
        void this.send();
        return;
      }
      location.reload();
      return;
    }
    this.catching = true;
    try {
      const newest = this.keys[this.keys.length - 1] ?? this.stableKey;
      // The wide re-scan reaches behind the checkpoint too, so a late op there still gets in (rebuildAll).
      const back = keyAt(Math.max(0, tsOf(newest) - 5 * 60_000));
      const from = wide ? [back < this.stableKey ? back : this.stableKey, this.baseKey].sort()[1] : newest;
      const got = await this.fetchAfter(from);
      const fresh = got.filter((o) => !this.ops.has(o.k));
      if (fresh.length) this.receive(fresh);
      this.lastCatchUp = Date.now();
    } catch {
      /* the next refresh retries */
    } finally {
      this.catching = false;
    }
  }

  /* ───── friends' ops ───── */

  private receive(fresh: Op[]) {
    fresh = fresh.filter((o) => !this.ops.has(o.k) && o.k > this.baseKey).sort((a, b) => (a.k < b.k ? -1 : 1));
    if (!fresh.length) return;
    // Our own unsent writes were computed before these ops arrived: slot them in just before.
    if (this.pending.length) this.flush(fresh[0].k);
    let inOrder = true;
    let behindCheckpoint = false;
    const added: Op[] = [];
    for (const op of fresh) {
      this.clock.observe(op.k);
      if (!this.remember(op)) continue;
      added.push(op);
      if (op.k <= this.stableKey) behindCheckpoint = true;
      if (inOrder && op.k > this.appliedUpTo) {
        unrecorded(() => applyTo(this.live, op));
        this.appliedUpTo = op.k;
      } else inOrder = false;
    }
    if (behindCheckpoint) this.rebuildAll();
    else if (!inOrder) this.scheduleRebuild();
    else this.hooks.onChanged();
    const events = added.flatMap((o) => o.e);
    if (events.length) this.hooks.onEvents(events);
    this.advanceStable();
  }

  private scheduleRebuild() {
    if (this.rebuildTimer) return;
    this.rebuildTimer = setTimeout(() => {
      this.rebuildTimer = null;
      this.rebuild();
    }, 30);
  }

  /** live = stable checkpoint + every known op after it, in key order. */
  private rebuild() {
    if (this.pending.length) this.flush();
    const next = new this.SQL.Database(this.stable.export());
    this.stable.exec('PRAGMA foreign_keys = ON;');
    next.exec('PRAGMA foreign_keys = ON;');
    for (const k of this.keys) if (k > this.stableKey) applyTo(next, this.ops.get(k)!);
    const old = this.live;
    this.live = next;
    attachSqlJs(next);
    old.close();
    this.appliedUpTo = this.keys[this.keys.length - 1] ?? this.stableKey;
    this.hooks.onChanged();
  }

  /** An op older than the checkpoint arrived (rare): rebuild the checkpoint from the snapshot too. */
  private rebuildAll() {
    if (this.rebuildTimer) {
      clearTimeout(this.rebuildTimer);
      this.rebuildTimer = null;
    }
    const stable = new this.SQL.Database(this.base);
    stable.exec('PRAGMA foreign_keys = ON;');
    for (const k of this.keys) {
      if (k > this.stableKey) break;
      applyTo(stable, this.ops.get(k)!);
    }
    this.stable.close();
    this.stable = stable;
    this.rebuild();
  }

  /** Move the checkpoint forward over ops older than a few seconds. */
  advanceStable() {
    const limit = Date.now() - STABLE_LAG_MS();
    for (const k of this.keys) {
      if (k <= this.stableKey) continue;
      if (k > this.appliedUpTo || tsOf(k) > limit) break;
      applyTo(this.stable, this.ops.get(k)!);
      this.stableKey = k;
    }
  }

  /* ───── our own writes ───── */

  /** Realtime events this page's server emitted, carried to friends inside the next op. */
  addEvent(rec: EventRec) {
    this.pendingEvents.push(rec);
    this.scheduleFlush();
  }

  private scheduleFlush() {
    if (this.flushTimer) return;
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      this.flush();
    }, 120);
  }

  /** Turn unsent writes into an op. `before`: a friend's key ours must sort before. */
  flush(before?: string) {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    if (!this.pending.length && !this.pendingEvents.length) return;
    if (this.marks.length) return; // never split an open transaction
    let k = this.clock.next();
    if (before && k >= before) {
      const slot = `${this.appliedUpTo || keyAt(0)}~${this.client}${pad(Date.now() % 1e6, 4)}`;
      if (slot > this.appliedUpTo && slot < before) k = slot;
      else this.scheduleRebuild();
    }
    if (this.snap && k <= this.snap.k) k = `${this.snap.k}~${this.client}${pad(Date.now() % 1e6, 4)}`;
    const op: Op = { k, u: this.userId() ?? '', s: this.pending, e: this.pendingEvents };
    this.pending = [];
    this.pendingEvents = [];
    if (k > this.appliedUpTo) this.appliedUpTo = k;
    else this.scheduleRebuild();
    this.remember(op);
    if (this.db && !this.readOnly) {
      this.outbox.push(op);
      void this.send();
    }
  }

  private async send() {
    if (this.sending || !this.db) return;
    this.sending = true;
    try {
      while (this.outbox.length) {
        const op = this.outbox[0];
        const z = packOp(op.s, op.e);
        try {
          if (z.length <= PART) await this.db.doc(`ops/${op.k}`).set({ k: op.k, u: op.u, z });
          else {
            // Too big for one document: split the statements across consecutive keys.
            const half = Math.max(1, Math.floor(op.s.length / 2));
            if (op.s.length < 2) throw Object.assign(new Error('op too large'), { code: 'too_large' });
            const a: Op = { ...op, k: `${op.k}~0`, s: op.s.slice(0, half) };
            const b: Op = { ...op, k: `${op.k}~1`, s: op.s.slice(half), e: [] };
            this.outbox.splice(0, 1, a, b);
            continue;
          }
          this.outbox.shift();
          void this.room?.emit('op', { k: op.k }).catch(() => undefined);
        } catch (e) {
          const code = (e as { code?: string }).code;
          if (code === 'invalid_argument' || code === 'not_granted') {
            this.readOnly = true;
            this.outbox = [];
            this.hooks.onReadOnly();
            return;
          }
          if (code === 'too_large' || code === 'quota_exceeded') {
            // Cannot ever be stored (the artifact's document cap is full): keep it on this page only.
            console.warn('[roll] op not shared:', code);
            this.outbox.shift();
            continue;
          }
          // Transient (`unavailable`) or a budget (`resource_exhausted`): wait and try again.
          await new Promise((r) => setTimeout(r, (code === 'resource_exhausted' ? 10_000 : 1500) + Math.random() * 1500));
        }
      }
    } finally {
      this.sending = false;
    }
  }

  /** True while writes are still on their way (used before closing or compacting). */
  get busy() {
    return this.outbox.length > 0 || this.pending.length > 0;
  }

  /* ───── leader: jobs and compaction ───── */

  async holdLeadership(): Promise<boolean> {
    if (!this.db || this.readOnly) return false;
    try {
      const r = await this.db.doc('meta/leader').acquire({ holder: this.client, ttlMs: 45_000 });
      this.leader = r.acquired;
    } catch {
      this.leader = false;
    }
    return this.leader;
  }

  /** Write a new snapshot at the checkpoint and drop ops older than the previous one. */
  async compact(store: { upload(text: string): Promise<string | null>; remove(id: string): Promise<void> } | null) {
    if (!this.db || !this.leader || this.readOnly || this.busy) return;
    this.advanceStable();
    const count = this.keys.filter((k) => k <= this.stableKey).length;
    if (count < COMPACT_AFTER_OPS()) return;
    const at = this.stableKey;
    const bytes = this.stable.export();
    this.stable.exec('PRAGMA foreign_keys = ON;');
    const text = b64(gzipSync(bytes, { level: 6 }));
    const id = `${pad(Date.now(), 9)}${Math.random().toString(36).slice(2, 8)}`;
    let asset: string | null = null;
    let parts = 0;
    if (store) asset = await store.upload(text).catch(() => null);
    if (!asset) {
      parts = Math.ceil(text.length / PART);
      for (let i = 0; i < parts; i++) await this.db.doc(`snapdata/${id}-${i}`).set({ z: text.slice(i * PART, (i + 1) * PART) });
    }
    const prev = this.snap;
    const cut = prev && prev.at < Date.now() - KEEP_OPS_MS ? prev.k : prev?.cut;
    const info: SnapInfo = { k: at, id, parts, asset, at: Date.now(), ...(cut ? { cut } : {}) };
    await this.db.doc('snap/current').set({ ...info });
    this.snap = info;
    // This page now rebuilds from the new snapshot; ops before it leave memory.
    this.base = bytes;
    this.baseKey = at;
    for (const k of this.keys) if (k <= at) this.ops.delete(k);
    this.keys = this.keys.filter((k) => k > at);
    // Ops before the previous snapshot are only needed by pages that have been away for an hour,
    // and those reload (catchUp). Delete them from the shared store.
    if (cut) {
      for (;;) {
        const q = await this.db.collection('ops').where('k', '<=', cut).limit(200).get().catch(() => null);
        if (!q?.size) break;
        for (const d of q.docs) await this.db.doc(`ops/${d.id}`).delete().catch(() => undefined);
        if (q.size < 200) break;
      }
    }
    // The snapshot before the previous one is unreachable now.
    const old = (await this.db.doc('meta/oldsnap').get().catch(() => null))?.data() as { id?: string; parts?: number; asset?: string | null } | undefined;
    if (old?.id) {
      for (let i = 0; i < (old.parts ?? 0); i++) await this.db.doc(`snapdata/${old.id}-${i}`).delete().catch(() => undefined);
      if (old.asset && store) await store.remove(old.asset).catch(() => undefined);
    }
    if (prev) await this.db.doc('meta/oldsnap').set({ id: prev.id, parts: prev.parts, asset: prev.asset ?? null });
  }

  /** A fingerprint of every table's rows, to compare pages in tests (scripts/test-sync.mjs). */
  digest() {
    const tables = this.live.exec("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")[0]?.values.map((v) => String(v[0])) ?? [];
    let h = 2166136261;
    const counts: Record<string, number> = {};
    for (const t of tables) {
      const rows = (this.live.exec(`SELECT * FROM "${t}"`)[0]?.values ?? []).map((r) => JSON.stringify(r)).sort();
      counts[t] = rows.length;
      for (const r of rows) for (let i = 0; i < r.length; i++) h = Math.imul(h ^ r.charCodeAt(i), 16777619) >>> 0;
    }
    return { hash: h.toString(16), counts, ops: this.keys.length, snap: this.snap?.k ?? null };
  }

  /** The artifact owner's user id, as the owner's page recorded it. */
  async ownerId(): Promise<string | null> {
    if (!this.db) return null;
    const d = await this.db.doc('meta/owner').get().catch(() => null);
    return (d?.data()?.id as string | undefined) ?? null;
  }

  stop() {
    for (const u of this.unsubs) u();
    this.unsubs = [];
  }
}
