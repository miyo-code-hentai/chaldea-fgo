import { HttpError, handle, idParam, readJson, requireAdmin } from '@/lib/server/http'
import { deleteUser, setAdmin } from '@/lib/server/users'

export const prerender = false

export const PATCH = handle(async (ctx) => {
  const admin = await requireAdmin(ctx)
  const input = await readJson(ctx.request)
  if (typeof input.isAdmin !== 'boolean') throw new HttpError(400, 'isAdmin must be true or false.')
  setAdmin(admin, idParam(ctx), input.isAdmin)
  return { ok: true }
})

export const DELETE = handle(async (ctx) => {
  deleteUser(await requireAdmin(ctx), idParam(ctx))
  return { ok: true }
})
