import type { APIRoute } from 'astro'
import { signUp, validateSignup, type AuthActionState } from '@/lib/auth'
import { HttpError, checkOrigin, clientIp, rateLimit } from '@/lib/server/http'

export const prerender = false

const json = (body: AuthActionState, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })

export const POST: APIRoute = async (ctx) => {
  try {
    checkOrigin(ctx.request)
    rateLimit(`signup-ip:${clientIp(ctx)}`, 8, 60 * 60_000)
    const formData = await ctx.request.formData()
    const { email, password, name, callSign, region, fieldErrors } = validateSignup(formData)
    if (Object.keys(fieldErrors).length) {
      return json({ ok: false, message: 'Check the highlighted fields.', fieldErrors }, 400)
    }
    try {
      await signUp(ctx.cookies, { email, password, name, callSign: callSign || undefined, region })
      return json({ ok: true, message: 'Personnel record created.' })
    } catch {
      return json({ ok: false, message: 'This account could not be created. The email may already be registered.' }, 400)
    }
  } catch (error) {
    if (error instanceof HttpError) return json({ ok: false, message: error.message }, error.status)
    console.error('[auth/signup]', error)
    return json({ ok: false, message: 'Something went wrong.' }, 500)
  }
}
