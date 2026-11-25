import { handle, idParam, requireUser } from '@/lib/server/http'
import { setFavorite } from '@/lib/server/servants'

export const prerender = false

export const PUT = handle(async (ctx) => {
  const user = await requireUser(ctx)
  setFavorite(Number(user.id), idParam(ctx), true)
  return { ok: true, favorited: true }
})

export const DELETE = handle(async (ctx) => {
  const user = await requireUser(ctx)
  setFavorite(Number(user.id), idParam(ctx), false)
  return { ok: true, favorited: false }
})
