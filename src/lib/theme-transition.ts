/**
 * Switch the light/dark theme with the parallelogram transition (styles/theme-skew.css).
 * `apply` should change the theme (classList on <html> and localStorage). Falls back to an
 * instant switch when View Transitions are missing or the visitor prefers reduced motion.
 */
type VT = Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } }

export function animateTheme(apply: () => void) {
  const doc = document as VT
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!doc.startViewTransition || reduce) {
    apply()
    return
  }
  const root = document.documentElement
  root.classList.add('theme-transitioning')
  const transition = doc.startViewTransition(() => apply())
  transition.finished.finally(() => root.classList.remove('theme-transitioning'))
}
