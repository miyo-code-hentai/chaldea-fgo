/** Shapes returned by the JSON API (see src/lib/server/*). */
export type Servant = {
  id: number
  name: string
  class: string
  subclass: string
  rarity: number
  trueName: string
  origin: string
  alignment: string
  description: string
  image: string
  favorited?: boolean
}

/** What anyone may see about a user. */
export type PublicUser = {
  id: number
  name: string
  callSign: string
  region: string
  bio: string
  avatar: string
  banner: string
  joined: number
  isAdmin: boolean
}

export type Me = PublicUser & { email: string }

export type Comment = {
  id: number
  recordKey: string
  body: string
  createdAt: number
  author: PublicUser
}

export type Topic = {
  id: number
  category: string
  title: string
  body?: string
  createdAt: number
  lastActivity: number
  author: PublicUser
  score: number
  replyCount: number
  media: string[]
  myVote: number
}

export type Reply = {
  id: number
  topicId: number
  parentId: number | null
  body: string
  createdAt: number
  author: PublicUser
  score: number
  myVote: number
}

export type ApiList<T> = { items: T[]; total: number; page: number; pageSize: number }
