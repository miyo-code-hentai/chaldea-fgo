import { getCurrentUser } from '@/lib/auth'
import { handle, intQuery, json, readJson, requireUser } from '@/lib/server/http'
import { createTopic, listTopics } from '@/lib/server/forum'
import type { Sort } from '@/lib/forum'

export const prerender = false

export const GET = handle(async ({ url, cookies }) => {
  const user = await getCurrentUser(cookies)
  const sort = url.searchParams.get('sort')
  return json(
    listTopics({
      category: url.searchParams.get('category') ?? undefined,
      sort: (['hot', 'new', 'top', 'active'].includes(sort ?? '') ? sort : 'hot') as Sort,
      q: (url.searchParams.get('q') ?? '').trim().slice(0, 80),
      page: intQuery(url, 'page', 1, 1, 10_000),
      pageSize: intQuery(url, 'pageSize', 20, 1, 50),
      userId: user ? Number(user.id) : undefined,
    }),
  )
})

export const POST = handle(async (ctx) => {
  const user = await requireUser(ctx)
  return json({ topic: createTopic(user, await readJson(ctx.request)) }, 201)
})
