import { getCurrentUser } from '@/lib/auth'
import { handle, json, readJson, requireUser } from '@/lib/server/http'
import { getPublicUser, updateProfile } from '@/lib/server/users'

export const prerender = false

export const GET = handle(async ({ cookies }) => {
  const user = await getCurrentUser(cookies)
  if (!user) return json({ user: null })
  const pub = getPublicUser(Number(user.id))
  return json({ user: pub ? { ...pub, email: user.email, isAdmin: user.isAdmin } : null })
})

export const PATCH = handle(async (ctx) => {
  const user = await requireUser(ctx)
  const pub = updateProfile(user, await readJson(ctx.request))
  return { user: { ...pub, email: user.email, isAdmin: user.isAdmin } }
})
