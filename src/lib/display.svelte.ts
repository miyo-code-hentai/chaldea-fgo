/**
 * Display preferences chosen in Settings: the floating navbar position and whether the intro film plays.
 * Stored per device (localStorage). The navbar position is mirrored onto <html data-nav-pos> so CSS
 * (styles/navigation.css) does the layout, and the pre-paint script in Layout.astro applies it before first paint.
 */
export type NavPos = 'top' | 'left' | 'right' | 'bottom'

export const NAV_POSITIONS: { id: NavPos; label: string }[] = [
  { id: 'top', label: 'Top' },
  { id: 'left', label: 'Left' },
  { id: 'right', label: 'Right' },
  { id: 'bottom', label: 'Bottom' },
]

export const NAV_KEY = 'chaldea-nav-pos'
// 'film' = play the intro film on the first visit, 'skip' = go straight to "Tap anywhere to enter".
export const INTRO_KEY = 'chaldea-intro'

const isNavPos = (v: unknown): v is NavPos => NAV_POSITIONS.some((p) => p.id === v)

class Display {
  navPos = $state<NavPos>('top')
  introFilm = $state(true)
  private inited = false

  init() {
    if (this.inited) return
    this.inited = true
    try {
      const nav = window.localStorage.getItem(NAV_KEY)
      if (isNavPos(nav)) this.navPos = nav
      this.introFilm = window.localStorage.getItem(INTRO_KEY) !== 'skip'
    } catch {}
    this.apply()
  }

  setNav(pos: NavPos) {
    this.navPos = pos
    this.save(NAV_KEY, pos)
    this.apply()
  }

  setIntroFilm(on: boolean) {
    this.introFilm = on
    this.save(INTRO_KEY, on ? 'film' : 'skip')
  }

  private save(key: string, value: string) {
    try {
      window.localStorage.setItem(key, value)
    } catch {}
  }

  private apply() {
    document.documentElement.dataset.navPos = this.navPos
  }
}

export const display = new Display()
