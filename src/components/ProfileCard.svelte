<script lang="ts">
  import { regionLabel } from '@/lib/profile'
  import type { PublicUser, Servant } from '@/lib/types'
  import Icon from './Icon.svelte'

  /**
   * The profile "trading card": banner on top, avatar overlapping it, name / call sign / region,
   * bio and a row of favourite servants. Used on the account page, public profiles and the forum.
   */
  let {
    user,
    favorites = [],
    compact = false,
    rank = '',
  }: { user: PublicUser; favorites?: Servant[]; compact?: boolean; rank?: string } = $props()

  const initials = $derived(
    user.name
      .split(/\s+/)
      .map((w) => w[0] ?? '')
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?',
  )
  const joined = $derived(new Date(user.joined).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }))
</script>

<article class="pcard" class:is-compact={compact}>
  <div class="pcard-banner">
    {#if user.banner}
      <img alt="" decoding="async" loading="lazy" src={user.banner} />
    {/if}
    <span aria-hidden="true" class="pcard-grid"></span>
    {#if user.isAdmin}<span class="pcard-badge"><Icon name="shield" size={13} /> Admin</span>{/if}
  </div>
  <div class="pcard-body">
    <div class="pcard-avatar">
      {#if user.avatar}
        <img alt="{user.name} avatar" decoding="async" src={user.avatar} />
      {:else}
        <span>{initials}</span>
      {/if}
    </div>
    <div class="pcard-id">
      {#if rank}<small>{rank}</small>{/if}
      <h2>{user.name}</h2>
      <p>
        {user.callSign ? `Call sign ${user.callSign}` : 'No call sign'} · {regionLabel(user.region)} · since {joined}
      </p>
    </div>
    {#if user.bio && !compact}<p class="pcard-bio">{user.bio}</p>{/if}
    {#if !compact}
      <div class="pcard-favs">
        <h3>Favourite servants</h3>
        {#if favorites.length === 0}
          <p class="pcard-none">No favourites yet.</p>
        {:else}
          <ul>
            {#each favorites.slice(0, 8) as s (s.id)}
              <li title="{s.name} · {s.class}">
                <span class="pcard-fav-img">
                  {#if s.image}<img alt={s.name} decoding="async" loading="lazy" src={s.image} />{:else}<b>{s.name[0]}</b>{/if}
                </span>
                <em>{s.name}</em>
                <small>{s.class}</small>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {/if}
  </div>
</article>
