import { HttpError, handle, intQuery, json, readJson, requireUser } from '@/lib/server/http'
import { addComment, listComments } from '@/lib/server/comments'

export const prerender = false

export const GET = handle(async ({ url }) => {
  const record = url.searchParams.get('record') ?? ''
  return json(listComments(record, intQuery(url, 'page', 1, 1, 1000), intQuery(url, 'pageSize', 30, 1, 50)))
})

export const POST = handle(async (ctx) => {
  const user = await requireUser(ctx)
  const body = await readJson(ctx.request)
  if (typeof body.record !== 'string') throw new HttpError(400, 'Missing record.')
  return json({ comment: addComment(user, body.record, body.body) }, 201)
})
