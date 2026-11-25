import type { APIContext, APIRoute } from 'astro'
import { getCurrentUser, type AppUser } from '../auth'

/** Thrown anywhere in a handler; `handle` turns it into a JSON error response. */
export class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })

const MAX_BODY = 64 * 1024

/** Parse a JSON object body (size limited). */
export async function readJson(request: Request): Promise<Record<string, unknown>> {
  const type = request.headers.get('content-type') ?? ''
  if (!type.includes('application/json')) throw new HttpError(415, 'Send JSON.')
  const text = await request.text()
  if (text.length > MAX_BODY) throw new HttpError(413, 'Request too large.')
  try {
    const value = JSON.parse(text)
    if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>
  } catch {}
  throw new HttpError(400, 'Invalid JSON.')
}

/** State-changing requests must come from this site (cookie auth is otherwise open to cross-site posts). */
export function checkOrigin(request: Request) {
  if (request.method === 'GET' || request.method === 'HEAD') return
  const origin = request.headers.get('origin')
  if (!origin) return // non-browser clients (curl, tests) send no Origin
  let host = ''
  try {
    host = new URL(origin).host
  } catch {}
  const own = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? new URL(request.url).host
  if (host !== own) throw new HttpError(403, 'Cross-site request blocked.')
}

/** Best-effort client address for rate limiting (behind a proxy this is the proxy unless the host forwards it). */
export function clientIp(ctx: APIContext): string {
  try {
    return ctx.clientAddress || 'unknown'
  } catch {
    return 'unknown'
  }
}

export async function requireUser(ctx: APIContext): Promise<AppUser> {
  const user = await getCurrentUser(ctx.cookies)
  if (!user) throw new HttpError(401, 'Sign in first.')
  return user
}

export async function requireAdmin(ctx: APIContext): Promise<AppUser> {
  const user = await requireUser(ctx)
  if (!user.isAdmin) throw new HttpError(403, 'Admins only.')
  return user
}

export function idParam(ctx: APIContext, name = 'id'): number {
  const n = Number(ctx.params[name])
  if (!Number.isInteger(n) || n < 1) throw new HttpError(404, 'Not found.')
  return n
}

export function intQuery(url: URL, name: string, fallback: number, min: number, max: number): number {
  const n = Number(url.searchParams.get(name))
  return Number.isFinite(n) && url.searchParams.has(name) ? Math.min(max, Math.max(min, Math.trunc(n))) : fallback
}

/** Wrap a handler: origin check + error mapping. Unexpected errors are logged, never shown. */
export function handle(fn: (ctx: APIContext) => Promise<Response | unknown>): APIRoute {
  return async (ctx) => {
    try {
      checkOrigin(ctx.request)
      const out = await fn(ctx)
      return out instanceof Response ? out : json(out ?? { ok: true })
    } catch (error) {
      if (error instanceof HttpError) return json({ error: error.message }, error.status)
      console.error('[api]', ctx.request.method, new URL(ctx.request.url).pathname, error)
      return json({ error: 'Something went wrong.' }, 500)
    }
  }
}

// ---- validation helpers -------------------------------------------------------------------------

/** A trimmed string with length limits. Control characters (except newline/tab) are rejected. */
export function str(value: unknown, field: string, min: number, max: number, opts: { multiline?: boolean } = {}): string {
  if (value === undefined || value === null) value = ''
  if (typeof value !== 'string') throw new HttpError(400, `${field} must be text.`)
  const text = value.replace(/\r\n/g, '\n').trim()
  // eslint-disable-next-line no-control-regex
  const bad = opts.multiline ? /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/ : /[\u0000-\u001F\u007F]/
  if (bad.test(text)) throw new HttpError(400, `${field} contains invalid characters.`)
  if (text.length < min) throw new HttpError(400, min === 1 ? `${field} is required.` : `${field} must be at least ${min} characters.`)
  if (text.length > max) throw new HttpError(400, `${field} must be at most ${max} characters.`)
  return text
}

const IMAGE_URL = /^(\/uploads\/[a-f0-9]{32}\.(png|jpe?g|webp|gif)|\/assets\/[A-Za-z0-9/_.-]{1,120}\.(png|jpe?g|webp|gif))$/

/** Images may only point at this site's own uploads or bundled assets. */
export function imageUrl(value: unknown, field: string): string {
  const text = str(value, field, 0, 160)
  if (text && (!IMAGE_URL.test(text) || text.includes('..'))) throw new HttpError(400, `${field} is not a valid image path.`)
  return text
}

// ---- tiny in-memory rate limiter ------------------------------------------------------------------
const hits = new Map<string, number[]>()

/** Allow `max` actions per `windowMs` for this key. */
export function rateLimit(key: string, max: number, windowMs: number) {
  const t = Date.now()
  const recent = (hits.get(key) ?? []).filter((x) => t - x < windowMs)
  if (recent.length >= max) {
    hits.set(key, recent)
    throw new HttpError(429, 'Slow down a little and try again.')
  }
  recent.push(t)
  hits.set(key, recent)
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((x) => t - x < windowMs)) hits.delete(k)
}
