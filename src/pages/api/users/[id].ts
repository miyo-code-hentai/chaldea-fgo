import { HttpError, handle, idParam } from '@/lib/server/http'
import { listFavorites } from '@/lib/server/servants'
import { getPublicUser } from '@/lib/server/users'

export const prerender = false

/** Public profile card data. No email. */
export const GET = handle(async (ctx) => {
  const id = idParam(ctx)
  const user = getPublicUser(id)
  if (!user) throw new HttpError(404, 'User not found.')
  return { user, favorites: listFavorites(id).map((s) => ({ ...s, favorited: undefined })) }
})
