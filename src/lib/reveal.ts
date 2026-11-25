import type { Action } from 'svelte/action'

/**
 * Svelte action replacing the original `.reveal-on-scroll` / `.footer-reveal`
 * IntersectionObserver effects: toggles `.is-visible` as the element enters/leaves view.
 */
export const reveal: Action<HTMLElement, number | undefined> = (node, threshold = 0.18) => {
  if (!('IntersectionObserver' in window)) {
    node.classList.add('is-visible')
    return
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) entry.target.classList.toggle('is-visible', entry.isIntersecting)
    },
    { threshold },
  )
  observer.observe(node)
  return { destroy: () => observer.disconnect() }
}
