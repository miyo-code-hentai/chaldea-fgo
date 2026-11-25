/** Tiny fetch wrapper for the JSON API. Throws ApiError with the server's message. */
export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function api<T = unknown>(path: string, init: { method?: string; body?: unknown; signal?: AbortSignal } = {}): Promise<T> {
  const response = await fetch(path, {
    method: init.method ?? (init.body === undefined ? 'GET' : 'POST'),
    headers: init.body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    signal: init.signal,
    credentials: 'same-origin',
  })
  let data: unknown = null
  try {
    data = await response.json()
  } catch {}
  if (!response.ok) {
    const message = (data as { error?: string } | null)?.error ?? `Request failed (${response.status})`
    throw new ApiError(message, response.status)
  }
  return data as T
}

/** Upload one image. kind decides where it may be used (avatar, banner or servant). */
export async function uploadImage(kind: 'avatar' | 'banner' | 'servant' | 'attach', file: File): Promise<string> {
  const form = new FormData()
  form.set('kind', kind)
  form.set('file', file)
  const response = await fetch('/api/upload', { method: 'POST', body: form, credentials: 'same-origin' })
  const data = (await response.json().catch(() => null)) as { url?: string; error?: string } | null
  if (!response.ok || !data?.url) throw new ApiError(data?.error ?? 'Upload failed', response.status)
  return data.url
}

export function timeAgo(ms: number): string {
  const s = Math.max(1, Math.round((Date.now() - ms) / 1000))
  if (s < 60) return 'just now'
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.round(h / 24)
  if (d < 30) return `${d}d ago`
  return new Date(ms).toLocaleDateString()
}
