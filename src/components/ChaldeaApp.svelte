<script lang="ts">
  import { onMount } from 'svelte'
  import { bgm } from '@/lib/audio.svelte'
  import { display } from '@/lib/display.svelte'
  import { pages, type Page } from '@/lib/data'
  import About from './About.svelte'
  import Servants from './Servants.svelte'
  import Header from './Header.svelte'
  import Contact from './Contact.svelte'
  import Forum from './Forum.svelte'
  import GrandOrder from './GrandOrder.svelte'
  import Home from './Home.svelte'
  import SiteFooter from './SiteFooter.svelte'

  let { initialPage = 'home' }: { initialPage?: Page } = $props()

  // The page is chosen on the server from the route, then follows the #/hash on the client.
  // svelte-ignore state_referenced_locally
  let page = $state<Page>(initialPage)

  onMount(() => {
    bgm.init()
    display.init()
    bgm.play('main')

    // Hash routing with the leave/enter page transition
    const readPage = (): Page => {
      // plain in-page anchors (#staff, #home-telemetry) must not reset the page
      if (window.location.hash && !window.location.hash.startsWith('#/')) return page
      const value = window.location.hash.slice(2).split('/')[0] as Page // '#/forum/t/12' is still the forum page
      return value && (value === 'home' || value in pages) ? value : initialPage
    }
    const update = () => {
      page = readPage()
    }
    const navigate = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#/"]')
      // data-instant links (e.g. inside the forum) change the hash without the page leave/enter animation
      if (!link || link.hasAttribute('data-instant') || link.hash === window.location.hash) return

      event.preventDefault()
      const root = document.documentElement
      root.classList.add('is-leaving')
      window.setTimeout(() => {
        window.location.hash = link.hash
        window.scrollTo(0, 0)
        root.classList.remove('is-leaving')
        root.classList.add('is-entering')
        window.setTimeout(() => root.classList.remove('is-entering'), 600)
      }, 300)
    }
    window.addEventListener('hashchange', update)
    document.addEventListener('click', navigate)
    update()
    return () => {
      window.removeEventListener('hashchange', update)
      document.removeEventListener('click', navigate)
    }
  })
</script>

<div class="app-shell">
  <Header active={page} />
  {#key page}
    <div class="page-content">
      {#if page === 'home'}
        <Home />
      {:else if page === 'lostbelts'}
        <GrandOrder />
      {:else if page === 'observatory'}
        <About />
      {:else if page === 'servants'}
        <Servants />
      {:else if page === 'forum'}
        <Forum />
      {:else}
        <Contact />
      {/if}
    </div>
  {/key}
  <SiteFooter />
</div>
