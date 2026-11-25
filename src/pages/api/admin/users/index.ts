import { handle, intQuery, json, requireAdmin } from '@/lib/server/http'
import { listUsers } from '@/lib/server/users'

export const prerender = false

export const GET = handle(async (ctx) => {
  await requireAdmin(ctx)
  const { url } = ctx
  return json(listUsers((url.searchParams.get('q') ?? '').trim().slice(0, 80), intQuery(url, 'page', 1, 1, 10_000), intQuery(url, 'pageSize', 25, 1, 100)))
})
