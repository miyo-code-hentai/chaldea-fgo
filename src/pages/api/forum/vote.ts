import { HttpError, handle, readJson, requireUser } from '@/lib/server/http'
import { vote } from '@/lib/server/forum'

export const prerender = false

// Body: { kind: 'topic' | 'reply', id: number, value: -1 | 0 | 1 }
export const POST = handle(async (ctx) => {
  const user = await requireUser(ctx)
  const input = await readJson(ctx.request)
  if (typeof input.kind !== 'string' || !Number.isInteger(input.id) || !Number.isInteger(input.value)) {
    throw new HttpError(400, 'Bad vote.')
  }
  return vote(user, input.kind, input.id as number, input.value as number)
})
