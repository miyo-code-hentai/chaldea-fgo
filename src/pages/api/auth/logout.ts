import type { APIRoute } from 'astro'
import { logout } from '@/lib/auth'
import { checkOrigin } from '@/lib/server/http'

export const prerender = false

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    checkOrigin(request)
  } catch {
    return new Response(null, { status: 403 })
  }
  logout(cookies)
  return redirect('/login', 303)
}
