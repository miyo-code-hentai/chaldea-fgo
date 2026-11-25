<script lang="ts">
  import { onMount } from 'svelte'
  import { animateTheme } from '@/lib/theme-transition'
  import Icon from './Icon.svelte'

  let dark = $state(false)

  function apply(next: boolean) {
    document.documentElement.classList.toggle('dark', next)
    dark = next
    try {
      window.localStorage.setItem('chaldea-theme', next ? 'dark' : 'light')
    } catch {}
  }

  onMount(() => {
    dark = document.documentElement.classList.contains('dark')
    // Stay in sync if another toggle (or the system) changes the class.
    const mo = new MutationObserver(() => (dark = document.documentElement.classList.contains('dark')))
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => mo.disconnect()
  })

  // Parallelogram slide (styles/theme-skew.css), the same transition the Settings page uses.
  function toggle() {
    animateTheme(() => apply(!dark))
  }
</script>

<button
  aria-label="Switch to {dark ? 'light' : 'dark'} mode"
  aria-pressed={dark}
  class="icon-button theme-toggle"
  onclick={toggle}
  title={dark ? 'Light mode' : 'Dark mode'}
  type="button"
>
  <Icon name={dark ? 'sun' : 'moon'} size={18} />
</button>
