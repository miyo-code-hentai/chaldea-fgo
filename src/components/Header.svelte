<script lang="ts">
  import { onMount } from 'svelte'
  import type { Page } from '@/lib/data'
  import { session } from '@/lib/session.svelte'
  import AudioToggle from './AudioToggle.svelte'
  import Emblem from './Emblem.svelte'
  import Icon, { type IconName } from './Icon.svelte'
  import ThemeToggle from './ThemeToggle.svelte'

  let { active }: { active: Page } = $props()

  onMount(() => void session.load())

  const links: [string, Page, IconName][] = [
    ['About', 'observatory', 'observe'],
    ['Servants', 'servants', 'spark'],
    ['Grand Order', 'lostbelts', 'rayshift'],
    ['Forum', 'forum', 'users'],
    ['Contact', 'contact', 'signal'],
  ]
</script>

<header class="masthead">
  <a href="#/home" class="identity" aria-label="Chaldea home">
    <Emblem size={38} />
    <span class="chaldea-wordmark">
      <b>CHALDEA</b>
      <small>SECURITY ORGANIZATION</small>
    </span>
  </a>
  <nav class="primary-nav" aria-label="Primary navigation">
    {#each links as [label, page, icon] (page)}
      <a aria-current={active === page ? 'page' : undefined} class={active === page ? 'active' : ''} href="#/{page}" title={label}>
        <Icon name={icon} size={17} />
        <span class="nav-label">{label}</span>
      </a>
    {/each}
  </nav>
  <nav class="account-nav" aria-label="Account navigation">
    <AudioToggle />
    <ThemeToggle />
    <a class="settings-chip" href="/settings" aria-label="Display settings" title="Display settings">
      <Icon name="settings" size={17} />
    </a>
    <a class="profile-chip" href="/account" aria-label={session.me ? 'My Room' : 'Personnel profile'}>
      <Icon name="user" size={17} />
      <span>{session.me ? 'My Room' : 'Personnel'}</span>
    </a>
  </nav>
</header>
