import { db, lastId, now } from './db'
import { HttpError, rateLimit, str } from './http'
import { toPublic, USER_FIELDS } from './users'
import raw from '../lore.json'
import type { AppUser } from '../auth'
import type { ApiList, Comment } from '../types'

// Every record that can be commented on: "<chapter>/<record>" taken from the lore data.
const RECORD_KEYS = new Set(
  (raw.chapters as { id: string; records: { id: string }[] }[]).flatMap((c) => c.records.map((r) => `${c.id}/${r.id}`)),
)
export const isRecordKey = (key: string) => RECORD_KEYS.has(key)

type Row = Parameters<typeof toPublic>[0] & { cid: number; record_key: string; body: string; c_created: number }

export function listComments(recordKey: string, page: number, pageSize: number): ApiList<Comment> {
  if (!isRecordKey(recordKey)) throw new HttpError(404, 'Unknown record.')
  const total = (db().prepare('SELECT COUNT(*) AS n FROM comments WHERE record_key = ?').get(recordKey) as { n: number }).n
  const rows = db()
    .prepare(
      `SELECT ${USER_FIELDS}, c.id AS cid, c.record_key, c.body, c.created_at AS c_created
       FROM comments c JOIN users u ON u.id = c.user_id
       WHERE c.record_key = ? ORDER BY c.created_at DESC, c.id DESC LIMIT ? OFFSET ?`,
    )
    .all(recordKey, pageSize, (page - 1) * pageSize) as Row[]
  return {
    items: rows.map((r) => ({ id: r.cid, recordKey: r.record_key, body: r.body, createdAt: r.c_created, author: toPublic(r) })),
    total,
    page,
    pageSize,
  }
}

export function addComment(user: AppUser, recordKey: string, body: unknown): Comment {
  if (!isRecordKey(recordKey)) throw new HttpError(404, 'Unknown record.')
  const text = str(body, 'Comment', 1, 1000, { multiline: true })
  rateLimit(`comment:${user.id}`, 6, 60_000)
  const t = now()
  const id = lastId(db().prepare('INSERT INTO comments (record_key, user_id, body, created_at) VALUES (?, ?, ?, ?)').run(recordKey, Number(user.id), text, t))
  const row = db()
    .prepare(`SELECT ${USER_FIELDS} FROM users u WHERE u.id = ?`)
    .get(Number(user.id)) as Parameters<typeof toPublic>[0]
  return { id, recordKey, body: text, createdAt: t, author: toPublic(row) }
}

export function deleteComment(user: AppUser, id: number) {
  const row = db().prepare('SELECT user_id FROM comments WHERE id = ?').get(id) as { user_id: number } | undefined
  if (!row) throw new HttpError(404, 'Comment not found.')
  if (row.user_id !== Number(user.id) && !user.isAdmin) throw new HttpError(403, 'Not your comment.')
  db().prepare('DELETE FROM comments WHERE id = ?').run(id)
}
