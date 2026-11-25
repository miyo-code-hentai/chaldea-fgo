/** Forum categories (client + server). */
export const CATEGORIES = [
  { id: 'general', label: 'General', blurb: 'Anything about Chaldea and Grand Order.' },
  { id: 'story', label: 'Story & Lore', blurb: 'Chapters, Singularities, Lostbelts and Ordeal Call.' },
  { id: 'servants', label: 'Servants & Teams', blurb: 'Favourites, builds and team ideas.' },
  { id: 'theories', label: 'Theories', blurb: 'Predictions and deep dives. Mark spoilers.' },
  { id: 'creations', label: 'Fan Creations', blurb: 'Art, writing, music and projects.' },
  { id: 'help', label: 'Help & Feedback', blurb: 'Questions about this site.' },
] as const

export const CATEGORY_IDS: string[] = CATEGORIES.map((c) => c.id)
export const categoryLabel = (id: string) => CATEGORIES.find((c) => c.id === id)?.label ?? id
export type Sort = 'hot' | 'new' | 'top' | 'active'
