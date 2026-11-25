/**
 * Reading progress is the only thing still kept on the device: which Grand Order records this browser
 * has opened. Accounts, avatars, banners and favourites live on the server (see src/lib/server/*).
 */
const VISITED_KEY = 'chaldea-visited'

export function loadVisited(): string[] {
  try {
    const value = JSON.parse(window.localStorage.getItem(VISITED_KEY) || '[]')
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : []
  } catch {
    return []
  }
}

export function markVisited(chapter: string, record: string) {
  try {
    const set = new Set(loadVisited())
    set.add(`${chapter}/${record}`)
    window.localStorage.setItem(VISITED_KEY, JSON.stringify([...set]))
  } catch {}
}

export const REGIONS: [string, string][] = [
  ['antarctica', 'Antarctica Command'],
  ['asia-pacific', 'Asia-Pacific'],
  ['europe', 'Europe'],
  ['north-america', 'North America'],
  ['south-america', 'South America'],
  ['other', 'Other Observation Zone'],
]
export const regionLabel = (id: string) => REGIONS.find(([k]) => k === id)?.[1] ?? id
