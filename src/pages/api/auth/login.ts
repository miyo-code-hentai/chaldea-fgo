import type { APIRoute } from 'astro'
import { login, validateCredentials, type AuthActionState } from '@/lib/auth'
import { HttpError, checkOrigin, clientIp, rateLimit } from '@/lib/server/http'

export const prerender = false

const json = (body: AuthActionState, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })

export const POST: APIRoute = async (ctx) => {
  try {
    checkOrigin(ctx.request)
    rateLimit(`login-ip:${clientIp(ctx)}`, 40, 10 * 60_000)
    const formData = await ctx.request.formData()
    const { email, password, fieldErrors } = validateCredentials(formData)
    if (Object.keys(fieldErrors).length) {
      return json({ ok: false, message: 'Check the highlighted fields.', fieldErrors }, 400)
    }
    rateLimit(`login-email:${email}`, 8, 10 * 60_000)
    try {
      await login(ctx.cookies, email, password)
      return json({ ok: true, message: 'Personnel identity confirmed.' })
    } catch {
      return json({ ok: false, message: 'Email or password is incorrect.' }, 401)
    }
  } catch (error) {
    if (error instanceof HttpError) return json({ ok: false, message: error.message }, error.status)
    console.error('[auth/login]', error)
    return json({ ok: false, message: 'Something went wrong.' }, 500)
  }
}
