/**
 * Server-side storage: one SQLite file, no extra dependencies (node:sqlite ships with Node 22.13+).
 * Everything that needs a real account lives here: users, sessions, servants, favourites,
 * record comments and the forum.
 */
import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

export const DATA_DIR = resolve(process.env.DATA_DIR ?? 'data')
const DB_PATH = process.env.DB_PATH ? resolve(process.env.DB_PATH) : resolve(DATA_DIR, 'chaldea.db')
export const UPLOAD_DIR = resolve(DATA_DIR, 'uploads')

let instance: DatabaseSync | null = null

export function db(): DatabaseSync {
  if (instance) return instance
  mkdirSync(dirname(DB_PATH), { recursive: true })
  mkdirSync(UPLOAD_DIR, { recursive: true })
  const d = new DatabaseSync(DB_PATH)
  d.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;')
  d.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      call_sign TEXT NOT NULL DEFAULT '',
      region TEXT NOT NULL DEFAULT 'antarctica',
      pass_hash TEXT NOT NULL,
      bio TEXT NOT NULL DEFAULT '',
      avatar TEXT NOT NULL DEFAULT '',
      banner TEXT NOT NULL DEFAULT '',
      is_admin INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS servants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      class TEXT NOT NULL,
      subclass TEXT NOT NULL DEFAULT '',
      rarity INTEGER NOT NULL DEFAULT 3,
      true_name TEXT NOT NULL DEFAULT '',
      origin TEXT NOT NULL DEFAULT '',
      alignment TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS favorites (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      servant_id INTEGER NOT NULL REFERENCES servants(id) ON DELETE CASCADE,
      created_at INTEGER NOT NULL,
      PRIMARY KEY (user_id, servant_id)
    );
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      record_key TEXT NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      body TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS comments_record ON comments(record_key, created_at);
    CREATE TABLE IF NOT EXISTS topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      last_activity INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS replies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      parent_id INTEGER REFERENCES replies(id) ON DELETE CASCADE,
      body TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS replies_topic ON replies(topic_id, created_at);
    CREATE TABLE IF NOT EXISTS votes (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      kind TEXT NOT NULL CHECK (kind IN ('topic', 'reply')),
      target_id INTEGER NOT NULL,
      value INTEGER NOT NULL CHECK (value IN (-1, 1)),
      PRIMARY KEY (user_id, kind, target_id)
    );
  `)
  // Forum attachments: a JSON list of upload URLs. Older databases get the column on first open.
  const topicCols = d.prepare('PRAGMA table_info(topics)').all() as { name: string }[]
  if (!topicCols.some((c) => c.name === 'media')) d.exec("ALTER TABLE topics ADD COLUMN media TEXT NOT NULL DEFAULT '[]'")
  instance = d
  return d
}

export const now = () => Date.now()

/** Run several statements atomically. */
export function tx<T>(fn: () => T): T {
  const d = db()
  d.exec('BEGIN')
  try {
    const out = fn()
    d.exec('COMMIT')
    return out
  } catch (e) {
    d.exec('ROLLBACK')
    throw e
  }
}

export const lastId = (r: { lastInsertRowid: number | bigint }) => Number(r.lastInsertRowid)

/** Test helper: point the module at a fresh database. */
export function resetDbForTests() {
  instance?.close()
  instance = null
}
