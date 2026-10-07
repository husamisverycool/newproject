import fs from 'node:fs';
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { env, paths } from './env.ts';

fs.mkdirSync(env.dataDir, { recursive: true });

export const db = new DatabaseSync(process.env.DB_PATH ?? paths.db);
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 3000;');

const SCHEMA = /* sql */ `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatar TEXT,
  color TEXT NOT NULL,
  birth_year INTEGER NOT NULL,
  is_adult INTEGER NOT NULL DEFAULT 0,
  plan TEXT NOT NULL DEFAULT 'free',
  likeness_scope TEXT NOT NULL DEFAULT 'my_groups',
  likeness_allow TEXT NOT NULL DEFAULT '[]',
  auto_ai INTEGER NOT NULL DEFAULT 1,
  sparks INTEGER NOT NULL DEFAULT 0,
  shinedust INTEGER NOT NULL DEFAULT 0,
  pack_points INTEGER NOT NULL DEFAULT 0,
  trade_stamina INTEGER NOT NULL DEFAULT 5,
  trade_stamina_at INTEGER NOT NULL DEFAULT 0,
  wonder_stamina INTEGER NOT NULL DEFAULT 5,
  wonder_stamina_at INTEGER NOT NULL DEFAULT 0,
  settings TEXT NOT NULL DEFAULT '{}',
  onboarded INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  mascot TEXT NOT NULL,
  ritual_day INTEGER NOT NULL DEFAULT 0,
  develop_hour INTEGER NOT NULL DEFAULT 21,
  time_zone TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  archive_open INTEGER NOT NULL DEFAULT 0,
  created_by TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS memberships (
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at INTEGER NOT NULL,
  invited_by TEXT,
  PRIMARY KEY (group_id, user_id)
);
CREATE TABLE IF NOT EXISTS archive_votes (
  group_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  vote INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (group_id, user_id)
);
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  media TEXT NOT NULL,
  caption TEXT,
  taken_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  week_key TEXT NOT NULL,
  ritual INTEGER NOT NULL DEFAULT 0,
  from_roll INTEGER NOT NULL DEFAULT 0,
  frame TEXT,
  remember INTEGER NOT NULL DEFAULT 0,
  plan_id TEXT,
  max_tier TEXT NOT NULL DEFAULT 'common',
  bytes INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS posts_group_week ON posts(group_id, week_key);
CREATE TABLE IF NOT EXISTS views (
  user_id TEXT NOT NULL,
  ref_id TEXT NOT NULL,
  at INTEGER NOT NULL,
  PRIMARY KEY (user_id, ref_id)
);
CREATE TABLE IF NOT EXISTS reactions (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id TEXT,
  guest TEXT,
  emoji TEXT,
  sticker_id TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS reactions_post ON reactions(post_id);
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id TEXT,
  kind TEXT NOT NULL,
  body TEXT,
  media TEXT,
  ref_id TEXT,
  meta TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS messages_group ON messages(group_id, created_at);
CREATE TABLE IF NOT EXISTS walls (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  week_key TEXT NOT NULL,
  version INTEGER NOT NULL,
  layout TEXT NOT NULL,
  style TEXT NOT NULL,
  generator TEXT NOT NULL,
  created_by TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS walls_group_week ON walls(group_id, week_key, version);
CREATE TABLE IF NOT EXISTS likeness (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  selfies TEXT NOT NULL,
  face TEXT,
  verified INTEGER NOT NULL DEFAULT 0,
  enrolled_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS objects (
  id TEXT PRIMARY KEY,
  group_id TEXT,
  kind TEXT NOT NULL,
  created_by TEXT NOT NULL,
  subjects TEXT NOT NULL DEFAULT '[]',
  media TEXT NOT NULL,
  style TEXT,
  provenance TEXT NOT NULL,
  meta TEXT NOT NULL DEFAULT '{}',
  revoked INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  owner_id TEXT NOT NULL,
  rarity TEXT NOT NULL,
  serial INTEGER,
  traits TEXT,
  flair TEXT,
  source TEXT NOT NULL,
  obtained_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS cards_owner ON cards(owner_id, group_id);
CREATE TABLE IF NOT EXISTS packs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  group_id TEXT NOT NULL,
  week_key TEXT NOT NULL,
  source TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  opened_at INTEGER,
  result TEXT
);
CREATE TABLE IF NOT EXISTS wonder (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL,
  opener_id TEXT NOT NULL,
  pack_id TEXT NOT NULL,
  cards TEXT NOT NULL,
  picks TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS trades (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL,
  from_user TEXT NOT NULL,
  to_user TEXT NOT NULL,
  offer_card TEXT NOT NULL,
  want_card TEXT,
  want_post TEXT,
  rarity TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  closed_at INTEGER
);
CREATE TABLE IF NOT EXISTS wishlist (
  user_id TEXT NOT NULL,
  group_id TEXT NOT NULL,
  post_id TEXT NOT NULL,
  rarity TEXT NOT NULL,
  highlighted INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, post_id, rarity)
);
CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  week_key TEXT NOT NULL,
  kind TEXT NOT NULL,
  state TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  closed_at INTEGER
);
CREATE TABLE IF NOT EXISTS memory (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  source_post_id TEXT,
  added_by TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  group_id TEXT,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  ref_ids TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  read_at INTEGER
);
CREATE INDEX IF NOT EXISTS notifications_user ON notifications(user_id, created_at);
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  created_by TEXT NOT NULL,
  title TEXT NOT NULL,
  theme TEXT NOT NULL,
  effect TEXT NOT NULL,
  title_font TEXT NOT NULL,
  starts_at INTEGER,
  location TEXT,
  details TEXT,
  options TEXT NOT NULL DEFAULT '[]',
  album_expires_at INTEGER,
  album_kept INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS plan_rsvps (
  plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (plan_id, user_id)
);
CREATE TABLE IF NOT EXISTS plan_votes (
  plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  option INTEGER NOT NULL,
  vote TEXT NOT NULL,
  PRIMARY KEY (plan_id, user_id, option)
);
CREATE TABLE IF NOT EXISTS ai_usage (
  user_id TEXT NOT NULL,
  month TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  cost_usd REAL NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, month)
);
CREATE TABLE IF NOT EXISTS purchases (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  group_id TEXT,
  item TEXT NOT NULL,
  price_sparks INTEGER NOT NULL DEFAULT 0,
  price_usd REAL NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL,
  created_by TEXT NOT NULL,
  kind TEXT NOT NULL,
  items TEXT NOT NULL,
  total_usd REAL NOT NULL,
  chips TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS quests (
  group_id TEXT NOT NULL,
  week_key TEXT NOT NULL,
  kind TEXT NOT NULL,
  goal INTEGER NOT NULL,
  rewarded INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (group_id, week_key, kind)
);
CREATE TABLE IF NOT EXISTS jobs_done (
  key TEXT PRIMARY KEY,
  at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  reporter TEXT NOT NULL,
  target_kind TEXT NOT NULL,
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS blocks (
  user_id TEXT NOT NULL,
  blocked_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, blocked_id)
);
CREATE TABLE IF NOT EXISTS wall_reactions (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  week_key TEXT NOT NULL,
  user_id TEXT,
  guest TEXT,
  emoji TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS clock (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  offset_ms INTEGER NOT NULL DEFAULT 0
);
INSERT OR IGNORE INTO clock (id, offset_ms) VALUES (1, 0);
`;

db.exec(SCHEMA);

type Row = Record<string, unknown>;

export function all<T = Row>(sql: string, ...params: SQLInputValue[]): T[] {
  return db.prepare(sql).all(...params) as T[];
}

export function get<T = Row>(sql: string, ...params: SQLInputValue[]): T | undefined {
  return db.prepare(sql).get(...params) as T | undefined;
}

export function run(sql: string, ...params: SQLInputValue[]) {
  return db.prepare(sql).run(...params);
}

export function tx<T>(fn: () => T): T {
  db.exec('BEGIN');
  try {
    const out = fn();
    db.exec('COMMIT');
    return out;
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}

export const json = {
  parse<T>(s: unknown, fallback: T): T {
    if (typeof s !== 'string' || !s) return fallback;
    try {
      return JSON.parse(s) as T;
    } catch {
      return fallback;
    }
  },
  str(v: unknown) {
    return JSON.stringify(v ?? null);
  },
};

/**
 * Demo clock. The ritual is weekly, so local runs can fast-forward to ritual day; production
 * leaves the offset at zero.
 */
export function now() {
  const r = get<{ offset_ms: number }>('SELECT offset_ms FROM clock WHERE id = 1');
  return Date.now() + (r?.offset_ms ?? 0);
}

export function setClockOffset(ms: number) {
  run('UPDATE clock SET offset_ms = ? WHERE id = 1', ms);
}
