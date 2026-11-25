import { db, lastId, now, tx } from './db'
import { unlinkUpload } from './uploads'
import { HttpError, rateLimit, str } from './http'
import { toPublic, USER_FIELDS } from './users'
import { CATEGORY_IDS, type Sort } from '../forum'
import type { AppUser } from '../auth'
import type { ApiList, Reply, Topic } from '../types'

type UserCols = Parameters<typeof toPublic>[0]
type TopicRow = UserCols & {
  tid: number
  category: string
  title: string
  body: string
  media: string
  t_created: number
  last_activity: number
  score: number
  reply_count: number
  my_vote: number
}

const TOPIC_SELECT = (withBody: boolean) => `
  SELECT ${USER_FIELDS}, t.id AS tid, t.category, t.title, ${withBody ? 't.body' : "'' AS body"},
         t.media, t.created_at AS t_created, t.last_activity,
         (SELECT COALESCE(SUM(value), 0) FROM votes WHERE kind = 'topic' AND target_id = t.id) AS score,
         (SELECT COUNT(*) FROM replies WHERE topic_id = t.id) AS reply_count,
         (SELECT value FROM votes WHERE kind = 'topic' AND target_id = t.id AND user_id = ?) AS my_vote
  FROM topics t JOIN users u ON u.id = t.user_id`

const toTopic = (r: TopicRow, withBody: boolean): Topic => ({
  id: r.tid,
  category: r.category,
  title: r.title,
  ...(withBody ? { body: r.body } : {}),
  createdAt: r.t_created,
  lastActivity: r.last_activity,
  author: toPublic(r),
  score: r.score,
  replyCount: r.reply_count,
  media: parseMedia(r.media),
  myVote: r.my_vote ?? 0,
})

const MEDIA_URL = /^\/uploads\/[a-f0-9]{32}\.(png|jpg|webp|gif|mp4|webm)$/

function parseMedia(raw: string | null | undefined): string[] {
  try {
    const v: unknown = JSON.parse(raw ?? '[]')
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

/** Keep only well-formed upload URLs, at most four per topic. */
function cleanMedia(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.filter((x): x is string => typeof x === 'string' && MEDIA_URL.test(x)).slice(0, 4)
}

const like = (q: string) => `%${q.replace(/[%_\\]/g, '\\$&')}%`

export function listTopics(opts: { category?: string; sort: Sort; q?: string; page: number; pageSize: number; userId?: number }): ApiList<Topic> {
  const where: string[] = []
  const args: (string | number)[] = []
  if (opts.category && CATEGORY_IDS.includes(opts.category)) {
    where.push('t.category = ?')
    args.push(opts.category)
  }
  if (opts.q) {
    where.push("(t.title LIKE ? ESCAPE '\\' OR t.body LIKE ? ESCAPE '\\')")
    args.push(like(opts.q), like(opts.q))
  }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const total = (db().prepare(`SELECT COUNT(*) AS n FROM topics t ${clause}`).get(...args) as { n: number }).n
  const uid = opts.userId ?? 0

  if (opts.sort === 'hot' || opts.sort === 'top') {
    // score-based orders are computed in JS over the most recent 400 matching topics
    const rows = db()
      .prepare(`${TOPIC_SELECT(false)} ${clause} ORDER BY t.created_at DESC LIMIT 400`)
      .all(uid, ...args) as TopicRow[]
    const t = now()
    const rank = (r: TopicRow) =>
      opts.sort === 'top' ? r.score : (r.score + r.reply_count * 0.5 + 1) / Math.pow((t - r.t_created) / 3_600_000 + 2, 1.5)
    rows.sort((a, b) => rank(b) - rank(a) || b.t_created - a.t_created)
    const start = (opts.page - 1) * opts.pageSize
    return { items: rows.slice(start, start + opts.pageSize).map((r) => toTopic(r, false)), total, page: opts.page, pageSize: opts.pageSize }
  }

  const order = opts.sort === 'new' ? 't.created_at DESC, t.id DESC' : 't.last_activity DESC, t.id DESC'
  const rows = db()
    .prepare(`${TOPIC_SELECT(false)} ${clause} ORDER BY ${order} LIMIT ? OFFSET ?`)
    .all(uid, ...args, opts.pageSize, (opts.page - 1) * opts.pageSize) as TopicRow[]
  return { items: rows.map((r) => toTopic(r, false)), total, page: opts.page, pageSize: opts.pageSize }
}

export function getTopic(id: number, userId?: number): Topic | null {
  const row = db().prepare(`${TOPIC_SELECT(true)} WHERE t.id = ?`).get(userId ?? 0, id) as TopicRow | undefined
  return row ? toTopic(row, true) : null
}

export function createTopic(user: AppUser, input: Record<string, unknown>): Topic {
  const category = str(input.category, 'Category', 1, 30)
  if (!CATEGORY_IDS.includes(category)) throw new HttpError(400, 'Choose a category.')
  const title = str(input.title, 'Title', 3, 140)
  const body = str(input.body, 'Post', 1, 8000, { multiline: true })
  const media = cleanMedia(input.media)
  rateLimit(`topic:${user.id}`, 5, 10 * 60_000)
  const t = now()
  const id = lastId(
    db()
      .prepare('INSERT INTO topics (user_id, category, title, body, created_at, last_activity, media) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(Number(user.id), category, title, body, t, t, JSON.stringify(media)),
  )
  return getTopic(id, Number(user.id))!
}

type ReplyRow = UserCols & {
  rid: number
  topic_id: number
  parent_id: number | null
  body: string
  r_created: number
  score: number
  my_vote: number
}

export function listReplies(topicId: number, userId?: number): Reply[] {
  const rows = db()
    .prepare(
      `SELECT ${USER_FIELDS}, r.id AS rid, r.topic_id, r.parent_id, r.body, r.created_at AS r_created,
              (SELECT COALESCE(SUM(value), 0) FROM votes WHERE kind = 'reply' AND target_id = r.id) AS score,
              (SELECT value FROM votes WHERE kind = 'reply' AND target_id = r.id AND user_id = ?) AS my_vote
       FROM replies r JOIN users u ON u.id = r.user_id
       WHERE r.topic_id = ? ORDER BY r.created_at ASC, r.id ASC LIMIT 1000`,
    )
    .all(userId ?? 0, topicId) as ReplyRow[]
  return rows.map(toReply)
}

const toReply = (r: ReplyRow): Reply => ({
  id: r.rid,
  topicId: r.topic_id,
  parentId: r.parent_id,
  body: r.body,
  createdAt: r.r_created,
  author: toPublic(r),
  score: r.score,
  myVote: r.my_vote ?? 0,
})

export function addReply(user: AppUser, topicId: number, parentId: number | null, body: unknown): Reply {
  const text = str(body, 'Reply', 1, 4000, { multiline: true })
  if (!db().prepare('SELECT 1 FROM topics WHERE id = ?').get(topicId)) throw new HttpError(404, 'Topic not found.')
  if (parentId !== null) {
    const parent = db().prepare('SELECT topic_id FROM replies WHERE id = ?').get(parentId) as { topic_id: number } | undefined
    if (!parent || parent.topic_id !== topicId) throw new HttpError(400, 'That reply is not in this topic.')
  }
  rateLimit(`reply:${user.id}`, 8, 60_000)
  const t = now()
  const id = tx(() => {
    const rid = lastId(
      db().prepare('INSERT INTO replies (topic_id, user_id, parent_id, body, created_at) VALUES (?, ?, ?, ?, ?)').run(topicId, Number(user.id), parentId, text, t),
    )
    db().prepare('UPDATE topics SET last_activity = ? WHERE id = ?').run(t, topicId)
    return rid
  })
  const row = db()
    .prepare(
      `SELECT ${USER_FIELDS}, r.id AS rid, r.topic_id, r.parent_id, r.body, r.created_at AS r_created, 0 AS score, 0 AS my_vote
       FROM replies r JOIN users u ON u.id = r.user_id WHERE r.id = ?`,
    )
    .get(id) as ReplyRow
  return toReply(row)
}

export function vote(user: AppUser, kind: string, targetId: number, value: number) {
  if (kind !== 'topic' && kind !== 'reply') throw new HttpError(400, 'Bad vote target.')
  if (![-1, 0, 1].includes(value)) throw new HttpError(400, 'Vote must be -1, 0 or 1.')
  const exists = db().prepare(`SELECT 1 FROM ${kind === 'topic' ? 'topics' : 'replies'} WHERE id = ?`).get(targetId)
  if (!exists) throw new HttpError(404, 'Not found.')
  rateLimit(`vote:${user.id}`, 60, 60_000)
  const uid = Number(user.id)
  if (value === 0) db().prepare('DELETE FROM votes WHERE user_id = ? AND kind = ? AND target_id = ?').run(uid, kind, targetId)
  else
    db()
      .prepare(
        `INSERT INTO votes (user_id, kind, target_id, value) VALUES (?, ?, ?, ?)
         ON CONFLICT(user_id, kind, target_id) DO UPDATE SET value = excluded.value`,
      )
      .run(uid, kind, targetId, value)
  const score = (db().prepare('SELECT COALESCE(SUM(value), 0) AS s FROM votes WHERE kind = ? AND target_id = ?').get(kind, targetId) as { s: number }).s
  return { score, myVote: value }
}

export function deleteTopic(user: AppUser, id: number) {
  const row = db().prepare('SELECT user_id, media FROM topics WHERE id = ?').get(id) as { user_id: number; media: string } | undefined
  if (!row) throw new HttpError(404, 'Topic not found.')
  if (row.user_id !== Number(user.id) && !user.isAdmin) throw new HttpError(403, 'Not your topic.')
  tx(() => {
    db().prepare("DELETE FROM votes WHERE kind = 'reply' AND target_id IN (SELECT id FROM replies WHERE topic_id = ?)").run(id)
    db().prepare("DELETE FROM votes WHERE kind = 'topic' AND target_id = ?").run(id)
    db().prepare('DELETE FROM topics WHERE id = ?').run(id) // replies cascade
  })
  for (const url of parseMedia(row.media)) unlinkUpload(url)
}

export function deleteReply(user: AppUser, id: number) {
  const row = db().prepare('SELECT user_id FROM replies WHERE id = ?').get(id) as { user_id: number } | undefined
  if (!row) throw new HttpError(404, 'Reply not found.')
  if (row.user_id !== Number(user.id) && !user.isAdmin) throw new HttpError(403, 'Not your reply.')
  tx(() => {
    // collect this reply and all its descendants so their votes go too
    const ids = (db()
      .prepare(
        `WITH RECURSIVE sub(id) AS (SELECT id FROM replies WHERE id = ? UNION ALL SELECT r.id FROM replies r JOIN sub ON r.parent_id = sub.id)
         SELECT id FROM sub`,
      )
      .all(id) as { id: number }[]).map((r) => r.id)
    for (const rid of ids) db().prepare("DELETE FROM votes WHERE kind = 'reply' AND target_id = ?").run(rid)
    db().prepare('DELETE FROM replies WHERE id = ?').run(id)
  })
}
