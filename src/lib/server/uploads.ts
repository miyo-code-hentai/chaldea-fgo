import { randomBytes } from 'node:crypto'
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { UPLOAD_DIR, db } from './db'
import { HttpError } from './http'

export const UPLOAD_NAME = /^[a-f0-9]{32}\.(png|jpg|webp|gif|mp4|webm)$/

// "attach" is the forum: images, GIFs and short videos.
const LIMITS: Record<string, number> = {
  avatar: 2 * 1024 * 1024,
  banner: 4 * 1024 * 1024,
  servant: 4 * 1024 * 1024,
  attach: 25 * 1024 * 1024,
}
export const MIME: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  mp4: 'video/mp4',
  webm: 'video/webm',
}

type Ext = 'png' | 'jpg' | 'webp' | 'gif' | 'mp4' | 'webm'

/** Identify the file by its first bytes, never by the name or type the browser claims. */
function sniff(bytes: Uint8Array): Ext | null {
  const at = (i: number) => bytes[i]
  if (bytes.length < 12) return null
  if (at(0) === 0x89 && at(1) === 0x50 && at(2) === 0x4e && at(3) === 0x47) return 'png'
  if (at(0) === 0xff && at(1) === 0xd8 && at(2) === 0xff) return 'jpg'
  if (at(0) === 0x47 && at(1) === 0x49 && at(2) === 0x46 && at(3) === 0x38) return 'gif'
  const riff = String.fromCharCode(at(0), at(1), at(2), at(3))
  const webp = String.fromCharCode(at(8), at(9), at(10), at(11))
  if (riff === 'RIFF' && webp === 'WEBP') return 'webp'
  // MP4 / MOV: the "ftyp" box sits at offset 4
  if (at(4) === 0x66 && at(5) === 0x74 && at(6) === 0x79 && at(7) === 0x70) return 'mp4'
  // WebM / Matroska: EBML header
  if (at(0) === 0x1a && at(1) === 0x45 && at(2) === 0xdf && at(3) === 0xa3) return 'webm'
  return null
}

export async function saveImage(kind: string, file: File): Promise<string> {
  const limit = LIMITS[kind]
  if (!limit) throw new HttpError(400, 'Unknown upload kind.')
  if (file.size === 0) throw new HttpError(400, 'The file is empty.')
  if (file.size > limit) throw new HttpError(413, `File too large (max ${Math.round(limit / 1024 / 1024)} MB).`)
  const bytes = new Uint8Array(await file.arrayBuffer())
  const ext = sniff(bytes)
  if (!ext) throw new HttpError(400, 'Use a PNG, JPG, WebP, GIF, MP4 or WebM file.')
  const name = `${randomBytes(16).toString('hex')}.${ext}`
  writeFileSync(resolve(UPLOAD_DIR, name), bytes)
  return `/uploads/${name}`
}

export function readUpload(name: string): Buffer | null {
  if (!UPLOAD_NAME.test(name)) return null
  const path = resolve(UPLOAD_DIR, name)
  return existsSync(path) ? readFileSync(path) : null
}

/** Remove an upload once nothing refers to it any more. Best effort. */
export function unlinkUpload(url: string) {
  if (!url.startsWith('/uploads/')) return
  const name = basename(url)
  if (!UPLOAD_NAME.test(name)) return
  const d = db()
  const used =
    d.prepare('SELECT 1 FROM users WHERE avatar = ? OR banner = ? LIMIT 1').get(url, url) ||
    d.prepare('SELECT 1 FROM servants WHERE image = ? LIMIT 1').get(url) ||
    d.prepare('SELECT 1 FROM topics WHERE instr(media, ?) > 0 LIMIT 1').get(url)
  if (used) return
  try {
    unlinkSync(resolve(UPLOAD_DIR, name))
  } catch {}
}
