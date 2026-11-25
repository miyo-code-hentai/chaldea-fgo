import { db, now, tx } from './db'
import { HttpError, imageUrl, str } from './http'
import { unlinkUpload } from './uploads'
import type { AppUser } from '../auth'
import type { PublicUser } from '../types'

const REGIONS = new Set(['antarctica', 'asia-pacific', 'europe', 'north-america', 'south-america', 'other'])

type Row = {
  id: number
  name: string
  email?: string
  call_sign: string
  region: string
  bio: string
  avatar: string
  banner: string
  is_admin: number
  created_at: number
}

const adminEmails = () =>
  (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

export const USER_FIELDS = 'u.id, u.name, u.email, u.call_sign, u.region, u.bio, u.avatar, u.banner, u.is_admin, u.created_at'

/** What other people may see. Email is never included. */
export function toPublic(row: Row): PublicUser {
  return {
    id: row.id,
    name: row.name,
    callSign: row.call_sign,
    region: row.region,
    bio: row.bio,
    avatar: row.avatar,
    banner: row.banner,
    joined: row.created_at,
    isAdmin: row.is_admin === 1 || (!!row.email && adminEmails().includes(row.email)),
  }
}

export function getPublicUser(id: number): PublicUser | null {
  const row = db().prepare(`SELECT ${USER_FIELDS} FROM users u WHERE u.id = ?`).get(id) as Row | undefined
  return row ? toPublic(row) : null
}

export function updateProfile(user: AppUser, input: Record<string, unknown>): PublicUser {
  const id = Number(user.id)
  const current = db().prepare('SELECT name, call_sign, region, bio, avatar, banner FROM users WHERE id = ?').get(id) as
    | Pick<Row, 'name' | 'call_sign' | 'region' | 'bio' | 'avatar' | 'banner'>
    | undefined
  if (!current) throw new HttpError(404, 'User not found.')

  const name = 'name' in input ? str(input.name, 'Name', 2, 80) : current.name
  const callSign = 'callSign' in input ? str(input.callSign, 'Call sign', 0, 40) : current.call_sign
  const bio = 'bio' in input ? str(input.bio, 'Bio', 0, 400, { multiline: true }) : current.bio
  const region = 'region' in input ? str(input.region, 'Region', 1, 40) : current.region
  if (!REGIONS.has(region)) throw new HttpError(400, 'Choose a valid region.')
  const avatar = 'avatar' in input ? imageUrl(input.avatar, 'Avatar') : current.avatar
  const banner = 'banner' in input ? imageUrl(input.banner, 'Banner') : current.banner

  db()
    .prepare('UPDATE users SET name = ?, call_sign = ?, bio = ?, region = ?, avatar = ?, banner = ? WHERE id = ?')
    .run(name, callSign, bio, region, avatar, banner, id)
  for (const old of [current.avatar !== avatar ? current.avatar : '', current.banner !== banner ? current.banner : '']) {
    if (old) unlinkUpload(old)
  }
  return getPublicUser(id)!
}

// ---- admin -----------------------------------------------------------------------------------------
export function listUsers(q: string, page: number, pageSize: number) {
  const like = `%${q.replace(/[%_\\]/g, '\\$&')}%`
  const where = q ? "WHERE u.name LIKE ? ESCAPE '\\' OR u.email LIKE ? ESCAPE '\\' OR u.call_sign LIKE ? ESCAPE '\\'" : ''
  const args = q ? [like, like, like] : []
  const total = (db().prepare(`SELECT COUNT(*) AS n FROM users u ${where}`).get(...args) as { n: number }).n
  const rows = db()
    .prepare(`SELECT ${USER_FIELDS} FROM users u ${where} ORDER BY u.created_at DESC LIMIT ? OFFSET ?`)
    .all(...args, pageSize, (page - 1) * pageSize) as Row[]
  return {
    items: rows.map((r) => ({ ...toPublic(r), email: r.email ?? '', envAdmin: !!r.email && adminEmails().includes(r.email) })),
    total,
    page,
    pageSize,
  }
}

export function setAdmin(actor: AppUser, targetId: number, isAdmin: boolean) {
  if (Number(actor.id) === targetId && !isAdmin) throw new HttpError(400, 'You cannot remove your own admin role.')
  const r = db().prepare('UPDATE users SET is_admin = ? WHERE id = ?').run(isAdmin ? 1 : 0, targetId)
  if (!r.changes) throw new HttpError(404, 'User not found.')
}

export function deleteUser(actor: AppUser, targetId: number) {
  if (Number(actor.id) === targetId) throw new HttpError(400, 'You cannot delete your own account here.')
  const row = db().prepare('SELECT avatar, banner FROM users WHERE id = ?').get(targetId) as Pick<Row, 'avatar' | 'banner'> | undefined
  if (!row) throw new HttpError(404, 'User not found.')
  tx(() => {
    // votes have no foreign key to their targets: remove this user's votes explicitly
    db().prepare('DELETE FROM votes WHERE user_id = ?').run(targetId)
    db().prepare('DELETE FROM users WHERE id = ?').run(targetId)
  })
  for (const url of [row.avatar, row.banner]) if (url) unlinkUpload(url)
}

export const touchNow = now
