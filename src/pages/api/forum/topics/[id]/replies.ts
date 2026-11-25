import { HttpError, handle, idParam, json, readJson, requireUser } from '@/lib/server/http'
import { addReply } from '@/lib/server/forum'

export const prerender = false

export const POST = handle(async (ctx) => {
  const user = await requireUser(ctx)
  const input = await readJson(ctx.request)
  const parent = input.parentId ?? null
  if (parent !== null && (!Number.isInteger(parent) || (parent as number) < 1)) throw new HttpError(400, 'Bad parent.')
  return json({ reply: addReply(user, idParam(ctx), parent as number | null, input.body) }, 201)
})
