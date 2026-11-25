import type { APIRoute } from 'astro'
import { MIME, UPLOAD_NAME, readUpload } from '@/lib/server/uploads'

export const prerender = false

/** Serves files saved by /api/upload. Only names the server generated are accepted. */
export const GET: APIRoute = ({ params }) => {
  const name = String(params.name ?? '')
  const bytes = UPLOAD_NAME.test(name) ? readUpload(name) : null
  if (!bytes) return new Response('Not found', { status: 404 })
  return new Response(new Uint8Array(bytes), {
    headers: {
      'Content-Type': MIME[name.split('.')[1]] ?? 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'",
    },
  })
}
