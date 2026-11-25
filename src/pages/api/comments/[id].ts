import { handle, idParam, requireUser } from '@/lib/server/http'
import { deleteComment } from '@/lib/server/comments'

export const prerender = false

export const DELETE = handle(async (ctx) => {
  deleteComment(await requireUser(ctx), idParam(ctx))
  return { ok: true }
})
