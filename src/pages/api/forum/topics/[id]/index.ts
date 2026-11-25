import { getCurrentUser } from '@/lib/auth'
import { HttpError, handle, idParam, requireUser } from '@/lib/server/http'
import { deleteTopic, getTopic, listReplies } from '@/lib/server/forum'

export const prerender = false

export const GET = handle(async (ctx) => {
  const id = idParam(ctx)
  const user = await getCurrentUser(ctx.cookies)
  const uid = user ? Number(user.id) : undefined
  const topic = getTopic(id, uid)
  if (!topic) throw new HttpError(404, 'Topic not found.')
  return { topic, replies: listReplies(id, uid) }
})

export const DELETE = handle(async (ctx) => {
  deleteTopic(await requireUser(ctx), idParam(ctx))
  return { ok: true }
})
