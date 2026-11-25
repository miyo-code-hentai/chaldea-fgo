import { bgmSrc } from './lore'

/**
 * Background-music manager. One looping track at a time with cross-fade.
 * Browsers block autoplay, so nothing starts until `unlock()` is called from a user gesture
 * (the loading screen "Enter" button, or the first click on the page).
 */
const DEFAULT_VOLUME = 0.45
export const VOLUME_KEY = 'chaldea-audio-volume'
const FADE_MS = 1400

class Bgm {
  enabled = $state(true)
  volume = $state(DEFAULT_VOLUME)
  current = $state<string | null>(null)
  missing = $state<Record<string, boolean>>({})
  unlocked = false
  private el: HTMLAudioElement | null = null
  private wanted: string[] | null = null

  private inited = false

  init() {
    if (this.inited) return
    this.inited = true
    try {
      this.enabled = window.localStorage.getItem('chaldea-audio') !== 'off'
      const saved = Number(window.localStorage.getItem(VOLUME_KEY))
      if (window.localStorage.getItem(VOLUME_KEY) !== null && Number.isFinite(saved)) {
        this.volume = Math.min(1, Math.max(0, saved))
      }
    } catch {}
    const unlockOnce = () => {
      this.unlock()
      window.removeEventListener('pointerdown', unlockOnce)
      window.removeEventListener('keydown', unlockOnce)
    }
    window.addEventListener('pointerdown', unlockOnce)
    window.addEventListener('keydown', unlockOnce)
    document.addEventListener('visibilitychange', () => {
      if (!this.el) return
      if (document.hidden) this.el.pause()
      else if (this.enabled && this.unlocked) void this.el.play().catch(() => {})
    })
  }

  unlock() {
    if (this.unlocked) return
    this.unlocked = true
    if (this.wanted) this.play(this.wanted)
  }

  /**
   * Ask for a track. Pass one key, or a list of candidates (most specific first): if a file is
   * missing the next candidate plays. Safe to call before unlock; it starts as soon as audio is allowed.
   */
  play(keys: string | string[]) {
    const chain = Array.isArray(keys) ? keys : [keys]
    this.wanted = chain
    if (!this.enabled || !this.unlocked || chain.length === 0) return
    const id = chain.join('>')
    if (this.current === id && this.el) return
    this.start(chain, id, 0)
  }

  private start(chain: string[], id: string, attempt: number) {
    const key = chain[attempt]
    const next = new Audio(bgmSrc(key))
    next.loop = true
    next.volume = 0
    let failed = false
    const fail = () => {
      if (failed) return
      failed = true
      next.pause()
      if (this.el !== next) return // a newer request already replaced this one
      if (attempt + 1 < chain.length) {
        this.missing[key] = true
        this.start(chain, id, attempt + 1)
      } else {
        this.missing[id] = true
      }
    }
    next.addEventListener('error', fail)
    const previous = this.el === next ? null : this.el
    this.el = next
    this.current = id
    void next
      .play()
      .then(() => {
        if (!failed && this.el === next) this.fade(next, this.volume)
      })
      .catch(fail)
    if (previous) this.fade(previous, 0, () => previous.pause())
  }

  /** Set the music volume (0–1). Applies to the track that is playing right now, and is remembered. */
  setVolume(value: number) {
    this.volume = Math.min(1, Math.max(0, value))
    try {
      window.localStorage.setItem(VOLUME_KEY, String(this.volume))
    } catch {}
    if (this.el && this.enabled) this.el.volume = this.volume
  }

  /** Turn music on or off explicitly (the Settings switch). */
  setEnabled(on: boolean) {
    if (on !== this.enabled) this.toggle()
  }

  toggle() {
    this.enabled = !this.enabled
    try {
      window.localStorage.setItem('chaldea-audio', this.enabled ? 'on' : 'off')
    } catch {}
    if (!this.enabled) {
      const el = this.el
      if (el) this.fade(el, 0, () => el.pause())
      this.el = null
      this.current = null
    } else {
      this.unlocked = true
      if (this.wanted) this.play(this.wanted)
    }
  }

  private fade(el: HTMLAudioElement, to: number, done?: () => void) {
    const from = el.volume
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / FADE_MS)
      el.volume = Math.max(0, Math.min(1, from + (to - from) * t))
      if (t < 1) requestAnimationFrame(step)
      else done?.()
    }
    requestAnimationFrame(step)
  }
}

export const bgm = new Bgm()
