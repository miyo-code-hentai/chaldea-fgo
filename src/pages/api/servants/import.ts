import { handle, readJson, requireAdmin } from '@/lib/server/http'
import { importServants } from '@/lib/server/servants'

export const prerender = false

// Body: { "servants": [ { name, class, rarity, ... }, ... ] }
export const POST = handle(async (ctx) => {
  await requireAdmin(ctx)
  return importServants((await readJson(ctx.request)).servants)
})
