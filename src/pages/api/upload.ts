import { HttpError, handle, rateLimit, requireUser } from '@/lib/server/http'
import { saveImage } from '@/lib/server/uploads'

export const prerender = false

export const POST = handle(async (ctx) => {
  const user = await requireUser(ctx)
  let form: FormData
  try {
    form = await ctx.request.formData()
  } catch {
    throw new HttpError(400, 'Send the image as form data.')
  }
  const kind = String(form.get('kind') ?? '')
  const file = form.get('file')
  if (!(file instanceof File)) throw new HttpError(400, 'No file received.')
  if (kind === 'servant' && !user.isAdmin) throw new HttpError(403, 'Admins only.')
  rateLimit(`upload:${user.id}`, 12, 10 * 60_000)
  return { url: await saveImage(kind, file) }
})
