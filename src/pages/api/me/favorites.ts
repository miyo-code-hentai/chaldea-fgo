import { handle, requireUser } from '@/lib/server/http'
import { listFavorites } from '@/lib/server/servants'

export const prerender = false

export const GET = handle(async (ctx) => {
  const user = await requireUser(ctx)
  return { items: listFavorites(Number(user.id)) }
})
