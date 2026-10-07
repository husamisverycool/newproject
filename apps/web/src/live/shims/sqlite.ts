/**
 * `node:sqlite` for the in-Claude build: the subset of DatabaseSync the server uses (exec, prepare →
 * all/get/run), backed by sql.js (SQLite compiled to WebAssembly, or to asm.js where WebAssembly is
 * not allowed). The page creates the sql.js database before it imports the server (live/engine.ts)
 * and hands it over through `attachSqlJs`.
 *
 * Every write that changes shared state is also recorded (see live/oplog.ts): the server's own
 * statements, with their parameters, are what friends' pages replay.
 */
import type { Database as SqlJsDatabase, SqlValue, Statement } from 'sql.js';

export type SQLInputValue = null | number | bigint | string | Uint8Array;

interface Recorder {
  /** Statements applied locally that are not yet part of the shared log. */
  onWrite(sql: string, params: SqlValue[]): void;
  /** Transactions: record from `begin()`, drop back to that mark on `rollback()`. */
  begin(): void;
  commit(): void;
  rollback(): void;
}

let current: SqlJsDatabase | null = null;
let recorder: Recorder | null = null;
let recording = true;
const cache = new Map<string, Statement>();

export function attachSqlJs(db: SqlJsDatabase) {
  dropCache();
  current = db;
  current.exec('PRAGMA foreign_keys = ON;');
}

export function sqlJs() {
  if (!current) throw new Error('sql.js database not attached');
  return current;
}

export function setRecorder(r: Recorder | null) {
  recorder = r;
}

/** Run `fn` without recording (replaying friends' statements, building checkpoints). */
export function unrecorded<T>(fn: () => T): T {
  const was = recording;
  recording = false;
  try {
    return fn();
  } finally {
    recording = was;
  }
}

/** sql.js frees every prepared statement when a database is exported or closed. */
export function dropCache() {
  for (const s of cache.values()) {
    try {
      s.free();
    } catch {
      /* already freed */
    }
  }
  cache.clear();
}

const WRITE = /^\s*(INSERT|UPDATE|DELETE|REPLACE)\b/i;

function bindable(params: unknown[]): SqlValue[] {
  return params.map((p) => {
    if (p === undefined || p === null) return null;
    if (typeof p === 'boolean') return p ? 1 : 0;
    if (typeof p === 'bigint') return Number(p);
    if (p instanceof Uint8Array) return p;
    if (typeof p === 'number' || typeof p === 'string') return p;
    return String(p);
  });
}

function prepared(sql: string) {
  let s = cache.get(sql);
  if (!s) {
    s = sqlJs().prepare(sql);
    cache.set(sql, s);
  }
  return s;
}

class StatementSync {
  constructor(private sql: string) {}

  all(...params: unknown[]) {
    const s = prepared(this.sql);
    const rows: Record<string, SqlValue>[] = [];
    try {
      s.bind(bindable(params));
      while (s.step()) rows.push(s.getAsObject());
    } finally {
      s.reset();
    }
    return rows;
  }

  get(...params: unknown[]) {
    const s = prepared(this.sql);
    try {
      s.bind(bindable(params));
      return s.step() ? s.getAsObject() : undefined;
    } finally {
      s.reset();
    }
  }

  run(...params: unknown[]) {
    const s = prepared(this.sql);
    const values = bindable(params);
    try {
      s.bind(values);
      s.step();
    } finally {
      s.reset();
    }
    const changes = sqlJs().getRowsModified();
    // A statement that changed nothing (INSERT OR IGNORE of an existing row) has nothing to share.
    if (changes > 0 && recording && recorder && WRITE.test(this.sql)) recorder.onWrite(this.sql, values);
    return { changes, lastInsertRowid: 0 };
  }
}

export class DatabaseSync {
  constructor(_path?: string) {}

  exec(sql: string) {
    const head = sql.trim().toUpperCase();
    if (head.startsWith('PRAGMA JOURNAL_MODE')) return; // in-memory database
    sqlJs().exec(sql);
    if (!recording || !recorder) return;
    if (head.startsWith('BEGIN')) recorder.begin();
    else if (head.startsWith('COMMIT')) recorder.commit();
    else if (head.startsWith('ROLLBACK')) recorder.rollback();
  }

  prepare(sql: string) {
    return new StatementSync(sql);
  }

  close() {}
}
