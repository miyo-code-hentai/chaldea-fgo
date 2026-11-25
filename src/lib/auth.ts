/**
 * Built-in accounts (SQLite). Passwords are hashed with scrypt, the session cookie holds a random
 * token and only its SHA-256 is stored. The old Payload-based version is kept for reference in
 * `auth.payload.reference.ts.txt`.
 */
import type { AstroCookies } from 'astro'
import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { db, lastId, now } from './server/db'

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>

export const APP_SESSION_COOKIE = 'app-session'

export type ObservationRegion =
  | 'antarctica'
  | 'asia-pacific'
  | 'europe'
  | 'north-america'
  | 'south-america'
  | 'other'

export type AppUser = {
  id: number | string
  collection: 'users'
  email: string
  name: string
  callSign?: string | null
  region?: string | null
  createdAt?: string
  bio: string
  avatar: string
  banner: string
  isAdmin: boolean
}

export type AuthActionState = {
  ok: boolean
  message: string
  fieldErrors?: Partial<Record<'callSign' | 'email' | 'name' | 'password' | 'region', string>>
}

const allowedRegions = new Set<string>([
  'antarctica',
  'asia-pacific',
  'europe',
  'north-america',
  'south-america',
  'other',
])

function text(formData: FormData, field: string) {
  const value = formData.get(field)
  return typeof value === 'string' ? value.trim() : ''
}

export function validateCredentials(formData: FormData) {
  const email = text(formData, 'email').toLowerCase()
  const password = text(formData, 'password')
  const fieldErrors: NonNullable<AuthActionState['fieldErrors']> = {}

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 180) {
    fieldErrors.email = 'Enter a valid email address.'
  }
  if (password.length < 8 || password.length > 128) {
    fieldErrors.password = 'Password must be between 8 and 128 characters.'
  }
  return { email, password, fieldErrors }
}

export function validateSignup(formData: FormData) {
  const { email, password, fieldErrors } = validateCredentials(formData)
  const name = text(formData, 'name')
  const callSign = text(formData, 'callSign')
  const region = text(formData, 'region')

  if (name.length < 2 || name.length > 80) fieldErrors.name = 'Name must be between 2 and 80 characters.'
  if (callSign.length > 40) fieldErrors.callSign = 'Call sign cannot exceed 40 characters.'
  if (!allowedRegions.has(region)) fieldErrors.region = 'Choose a valid observation zone.'

  return { email, password, name, callSign, region: region as ObservationRegion, fieldErrors }
}

const SESSION_DAYS = 30
const adminEmails = () =>
  (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

const sha = (value: string) => createHash('sha256').update(value).digest('hex')

async function hashPassword(password: string) {
  const salt = randomBytes(16)
  const hash = await scrypt(password, salt, 64)
  return `${salt.toString('hex')}:${hash.toString('hex')}`
}

async function verifyPassword(password: string, stored: string) {
  const [saltHex, hashHex] = stored.split(':')
  if (!saltHex || !hashHex) return false
  const expected = Buffer.from(hashHex, 'hex')
  const actual = await scrypt(password, Buffer.from(saltHex, 'hex'), expected.length)
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

type UserRow = {
  id: number
  email: string
  name: string
  call_sign: string
  region: string
  bio: string
  avatar: string
  banner: string
  is_admin: number
  created_at: number
}

export function toAppUser(row: UserRow): AppUser {
  return {
    id: row.id,
    collection: 'users',
    email: row.email,
    name: row.name,
    callSign: row.call_sign,
    region: row.region,
    createdAt: new Date(row.created_at).toISOString(),
    bio: row.bio,
    avatar: row.avatar,
    banner: row.banner,
    isAdmin: row.is_admin === 1 || adminEmails().includes(row.email),
  }
}

function startSession(cookies: AstroCookies, userId: number) {
  const token = randomBytes(32).toString('base64url')
  const expires = now() + SESSION_DAYS * 86_400_000
  const d = db()
  d.prepare('DELETE FROM sessions WHERE expires_at < ?').run(now())
  d.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(sha(token), userId, expires)
  cookies.set(APP_SESSION_COOKIE, token, {
    expires: new Date(expires),
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}

const USER_COLUMNS = 'id, email, name, call_sign, region, bio, avatar, banner, is_admin, created_at'
const DUMMY_HASH = `${'00'.repeat(16)}:${'00'.repeat(64)}`

export async function login(cookies: AstroCookies, email: string, password: string): Promise<AppUser> {
  const row = db()
    .prepare(`SELECT ${USER_COLUMNS}, pass_hash FROM users WHERE email = ?`)
    .get(email) as (UserRow & { pass_hash: string }) | undefined
  const ok = await verifyPassword(password, row?.pass_hash ?? DUMMY_HASH) // same work whether or not the user exists
  if (!row || !ok) throw new Error('Login failed')
  startSession(cookies, row.id)
  return toAppUser(row)
}

export async function signUp(
  cookies: AstroCookies,
  data: { email: string; password: string; name: string; callSign?: string; region: ObservationRegion },
) {
  const pass = await hashPassword(data.password)
  let id: number
  try {
    id = lastId(
      db()
        .prepare('INSERT INTO users (email, name, call_sign, region, pass_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)')
        .run(data.email, data.name, data.callSign ?? '', data.region, pass, now()),
    )
  } catch {
    throw new Error('Signup failed') // most likely: the email is already registered
  }
  startSession(cookies, id)
  const row = db().prepare(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`).get(id) as UserRow
  return toAppUser(row)
}

export function logout(cookies: AstroCookies) {
  const token = cookies.get(APP_SESSION_COOKIE)?.value
  if (token) db().prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha(token))
  cookies.delete(APP_SESSION_COOKIE, { path: '/' })
}

export async function getCurrentUser(cookies: AstroCookies): Promise<AppUser | null> {
  const token = cookies.get(APP_SESSION_COOKIE)?.value
  if (!token) return null
  const row = db()
    .prepare(
      `SELECT ${USER_COLUMNS.split(', ').map((c) => 'u.' + c).join(', ')}
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > ?`,
    )
    .get(sha(token), now()) as UserRow | undefined
  return row ? toAppUser(row) : null
}
