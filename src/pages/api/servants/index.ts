import { getCurrentUser } from '@/lib/auth'
import { handle, intQuery, json, readJson, requireAdmin } from '@/lib/server/http'
import { createServant, listServants, parseServant } from '@/lib/server/servants'

export const prerender = false

export const GET = handle(async ({ url, cookies }) => {
  const user = await getCurrentUser(cookies)
  const rarity = url.searchParams.get('rarity')
  return json(
    listServants({
      q: (url.searchParams.get('q') ?? '').trim().slice(0, 80),
      classes: (url.searchParams.get('class') ?? '').split(',').map((c) => c.trim()).filter(Boolean),
      rarity: rarity !== null && rarity !== '' && Number.isInteger(Number(rarity)) ? Number(rarity) : undefined,
      page: intQuery(url, 'page', 1, 1, 10_000),
      pageSize: intQuery(url, 'pageSize', 24, 1, 100),
      userId: user ? Number(user.id) : undefined,
    }),
  )
})

export const POST = handle(async (ctx) => {
  await requireAdmin(ctx)
  return json({ servant: createServant(parseServant(await readJson(ctx.request))) }, 201)
})
