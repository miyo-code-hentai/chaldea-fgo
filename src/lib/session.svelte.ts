import { api } from './api'
import type { Me } from './types'

/** The signed-in user, loaded once and shared by every component on the page. */
class Session {
  me = $state<Me | null>(null)
  loaded = $state(false)
  private pending: Promise<void> | null = null

  load(force = false) {
    if (this.pending && !force) return this.pending
    this.pending = api<{ user: Me | null }>('/api/me')
      .then((r) => {
        this.me = r.user
      })
      .catch(() => {
        this.me = null
      })
      .finally(() => {
        this.loaded = true
      })
    return this.pending
  }
}

export const session = new Session()
