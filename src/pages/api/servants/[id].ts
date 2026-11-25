import { getCurrentUser } from '@/lib/auth'
import { HttpError, handle, idParam, readJson, requireAdmin } from '@/lib/server/http'
import { deleteServant, getServant, parseServant, updateServant } from '@/lib/server/servants'

export const prerender = false

export const GET = handle(async (ctx) => {
  const user = await getCurrentUser(ctx.cookies)
  const servant = getServant(idParam(ctx), user ? Number(user.id) : undefined)
  if (!servant) throw new HttpError(404, 'Servant not found.')
  return { servant }
})

export const PUT = handle(async (ctx) => {
  await requireAdmin(ctx)
  return { servant: updateServant(idParam(ctx), parseServant(await readJson(ctx.request))) }
})

export const DELETE = handle(async (ctx) => {
  await requireAdmin(ctx)
  deleteServant(idParam(ctx))
  return { ok: true }
})
