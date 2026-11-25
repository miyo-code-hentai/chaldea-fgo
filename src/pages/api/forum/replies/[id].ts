import { handle, idParam, requireUser } from '@/lib/server/http'
import { deleteReply } from '@/lib/server/forum'

export const prerender = false

export const DELETE = handle(async (ctx) => {
  deleteReply(await requireUser(ctx), idParam(ctx))
  return { ok: true }
})
