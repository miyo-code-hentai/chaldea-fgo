import { db, lastId, now, tx } from './db'
import { HttpError, imageUrl, str } from './http'
import { unlinkUpload } from './uploads'
import { ALL_CLASSES } from '../classes'
import type { ApiList, Servant } from '../types'

type Row = {
  id: number
  name: string
  class: string
  subclass: string
  rarity: number
  true_name: string
  origin: string
  alignment: string
  description: string
  image: string
  fav?: number | null
}

const toServant = (r: Row, withFav: boolean): Servant => ({
  id: r.id,
  name: r.name,
  class: r.class,
  subclass: r.subclass,
  rarity: r.rarity,
  trueName: r.true_name,
  origin: r.origin,
  alignment: r.alignment,
  description: r.description,
  image: r.image,
  ...(withFav ? { favorited: !!r.fav } : {}),
})

export type ServantInput = Omit<Servant, 'id' | 'favorited'>

export function parseServant(raw: Record<string, unknown>): ServantInput {
  const cls = str(raw.class, 'Class', 1, 30)
  if (!ALL_CLASSES.includes(cls)) throw new HttpError(400, `Class must be one of: ${ALL_CLASSES.join(', ')}.`)
  const rarity = Number(raw.rarity ?? 3)
  if (!Number.isInteger(rarity) || rarity < 0 || rarity > 5) throw new HttpError(400, 'Rarity must be 0 to 5.')
  return {
    name: str(raw.name, 'Name', 1, 80),
    class: cls,
    subclass: str(raw.subclass, 'Subclass', 0, 40),
    rarity,
    trueName: str(raw.trueName, 'True name', 0, 80),
    origin: str(raw.origin, 'Origin', 0, 120),
    alignment: str(raw.alignment, 'Alignment', 0, 40),
    description: str(raw.description, 'Description', 0, 2000, { multiline: true }),
    image: imageUrl(raw.image, 'Image'),
  }
}

const like = (q: string) => `%${q.replace(/[%_\\]/g, '\\$&')}%`

export function listServants(opts: {
  q?: string
  classes?: string[]
  rarity?: number
  page: number
  pageSize: number
  userId?: number
}): ApiList<Servant> {
  const where: string[] = []
  const args: (string | number)[] = []
  if (opts.q) {
    where.push("(s.name LIKE ? ESCAPE '\\' OR s.true_name LIKE ? ESCAPE '\\' OR s.origin LIKE ? ESCAPE '\\')")
    args.push(like(opts.q), like(opts.q), like(opts.q))
  }
  const classes = (opts.classes ?? []).filter((c) => ALL_CLASSES.includes(c))
  if (classes.length) {
    where.push(`s.class IN (${classes.map(() => '?').join(',')})`)
    args.push(...classes)
  }
  if (opts.rarity !== undefined) {
    where.push('s.rarity = ?')
    args.push(opts.rarity)
  }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const total = (db().prepare(`SELECT COUNT(*) AS n FROM servants s ${clause}`).get(...args) as { n: number }).n
  const uid = opts.userId ?? 0
  const rows = db()
    .prepare(
      `SELECT s.*, (SELECT 1 FROM favorites f WHERE f.servant_id = s.id AND f.user_id = ?) AS fav
       FROM servants s ${clause} ORDER BY s.rarity DESC, s.name COLLATE NOCASE LIMIT ? OFFSET ?`,
    )
    .all(uid, ...args, opts.pageSize, (opts.page - 1) * opts.pageSize) as Row[]
  return { items: rows.map((r) => toServant(r, !!opts.userId)), total, page: opts.page, pageSize: opts.pageSize }
}

export function getServant(id: number, userId?: number): Servant | null {
  const row = db()
    .prepare('SELECT s.*, (SELECT 1 FROM favorites f WHERE f.servant_id = s.id AND f.user_id = ?) AS fav FROM servants s WHERE s.id = ?')
    .get(userId ?? 0, id) as Row | undefined
  return row ? toServant(row, !!userId) : null
}

const INSERT = `INSERT INTO servants (name, class, subclass, rarity, true_name, origin, alignment, description, image, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
const insertArgs = (s: ServantInput, t: number) => [s.name, s.class, s.subclass, s.rarity, s.trueName, s.origin, s.alignment, s.description, s.image, t, t] as const

export function createServant(input: ServantInput): Servant {
  const t = now()
  const id = lastId(db().prepare(INSERT).run(...insertArgs(input, t)))
  return getServant(id)!
}

export function updateServant(id: number, input: ServantInput): Servant {
  const old = db().prepare('SELECT image FROM servants WHERE id = ?').get(id) as { image: string } | undefined
  if (!old) throw new HttpError(404, 'Servant not found.')
  db()
    .prepare(
      `UPDATE servants SET name = ?, class = ?, subclass = ?, rarity = ?, true_name = ?, origin = ?, alignment = ?,
       description = ?, image = ?, updated_at = ? WHERE id = ?`,
    )
    .run(input.name, input.class, input.subclass, input.rarity, input.trueName, input.origin, input.alignment, input.description, input.image, now(), id)
  if (old.image && old.image !== input.image) unlinkUpload(old.image)
  return getServant(id)!
}

export function deleteServant(id: number) {
  const old = db().prepare('SELECT image FROM servants WHERE id = ?').get(id) as { image: string } | undefined
  if (!old) throw new HttpError(404, 'Servant not found.')
  db().prepare('DELETE FROM servants WHERE id = ?').run(id) // favourites cascade
  if (old.image) unlinkUpload(old.image)
}

/** Bulk add from a JSON array. All-or-nothing: one bad row rejects the whole import. */
export function importServants(rows: unknown): { created: number } {
  if (!Array.isArray(rows)) throw new HttpError(400, 'Expected a JSON array of servants.')
  if (rows.length === 0 || rows.length > 500) throw new HttpError(400, 'Import between 1 and 500 servants at a time.')
  const parsed = rows.map((row, i) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) throw new HttpError(400, `Row ${i + 1} is not an object.`)
    try {
      return parseServant(row as Record<string, unknown>)
    } catch (e) {
      throw new HttpError(400, `Row ${i + 1}: ${(e as Error).message}`)
    }
  })
  const t = now()
  tx(() => {
    const stmt = db().prepare(INSERT)
    for (const s of parsed) stmt.run(...insertArgs(s, t))
  })
  return { created: parsed.length }
}

// ---- favourites ---------------------------------------------------------------------------------
const MAX_FAVORITES = 200

export function setFavorite(userId: number, servantId: number, on: boolean) {
  if (!db().prepare('SELECT 1 FROM servants WHERE id = ?').get(servantId)) throw new HttpError(404, 'Servant not found.')
  if (!on) {
    db().prepare('DELETE FROM favorites WHERE user_id = ? AND servant_id = ?').run(userId, servantId)
    return
  }
  const count = (db().prepare('SELECT COUNT(*) AS n FROM favorites WHERE user_id = ?').get(userId) as { n: number }).n
  if (count >= MAX_FAVORITES) throw new HttpError(400, `You can keep up to ${MAX_FAVORITES} favourites.`)
  db().prepare('INSERT OR IGNORE INTO favorites (user_id, servant_id, created_at) VALUES (?, ?, ?)').run(userId, servantId, now())
}

export function listFavorites(userId: number): Servant[] {
  const rows = db()
    .prepare(
      `SELECT s.*, 1 AS fav FROM favorites f JOIN servants s ON s.id = f.servant_id
       WHERE f.user_id = ? ORDER BY f.created_at DESC`,
    )
    .all(userId) as Row[]
  return rows.map((r) => toServant(r, true))
}
