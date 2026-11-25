<script lang="ts">
  import { onMount } from 'svelte'
  import { api, ApiError, uploadImage } from '@/lib/api'
  import { bgm } from '@/lib/audio.svelte'
  import { ALL_CLASSES } from '@/lib/classes'
  import { recordChapters as chapters } from '@/lib/lore'
  import { loadVisited, REGIONS } from '@/lib/profile'
  import { session } from '@/lib/session.svelte'
  import type { ApiList, Me, Servant } from '@/lib/types'
  import AudioToggle from './AudioToggle.svelte'
  import Emblem from './Emblem.svelte'
  import Icon, { type IconName } from './Icon.svelte'
  import ProfileCard from './ProfileCard.svelte'
  import ThemeToggle from './ThemeToggle.svelte'

  type Tab = 'overview' | 'servants' | 'records' | 'settings'
  const tabs: { id: Tab; label: string; icon: IconName }[] = [
    { id: 'overview', label: 'Overview', icon: 'user' },
    { id: 'servants', label: 'Servants', icon: 'star' },
    { id: 'records', label: 'Records', icon: 'book' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ]

  const me = $derived(session.me)
  let tab = $state<Tab>('overview')
  let visited = $state<string[]>([])
  let favorites = $state<Servant[]>([])

  // servant browser
  let query = $state('')
  let cls = $state('')
  let page = $state(1)
  let list = $state<ApiList<Servant> | null>(null)
  let listError = $state('')
  let loadingList = $state(false)
  let listToken = 0

  // settings form
  let form = $state({ name: '', callSign: '', region: 'antarctica', bio: '' })
  let formReady = $state(false)
  let notice = $state<{ ok: boolean; text: string } | null>(null)
  let busy = $state(false)

  const totalRecords = chapters.reduce((n, c) => n + c.records.length, 0)
  const visitedCount = $derived(visited.length)
  const percent = $derived(Math.round((visitedCount / totalRecords) * 100))
  const rank = $derived(
    visitedCount === 0 ? 'Trainee Observer' : visitedCount < 6 ? 'Master Candidate' : visitedCount < 14 ? 'Chaldea Master' : visitedCount < 24 ? 'Veteran Master' : 'Grand Observer',
  )
  const circ = 2 * Math.PI * 46
  const pages = $derived(list ? Math.max(1, Math.ceil(list.total / list.pageSize)) : 1)

  onMount(() => {
    bgm.init()
    bgm.play(['profile', 'main'])
    visited = loadVisited()
    void session.load().then(() => {
      if (session.me) void loadFavorites()
    })
  })

  // Fill the settings form once, when the account arrives.
  $effect(() => {
    if (me && !formReady) {
      form = { name: me.name, callSign: me.callSign, region: me.region, bio: me.bio }
      formReady = true
    }
  })

  // Search the servant database (debounced) whenever the filters change.
  $effect(() => {
    if (tab !== 'servants' || !me) return
    const q = query
    const c = cls
    const p = page
    const timer = window.setTimeout(() => void loadList(q, c, p), q ? 250 : 0)
    return () => window.clearTimeout(timer)
  })

  async function loadFavorites() {
    try {
      favorites = (await api<{ items: Servant[] }>('/api/me/favorites')).items
    } catch {}
  }

  async function loadList(q: string, c: string, p: number) {
    const token = ++listToken
    loadingList = true
    listError = ''
    try {
      const params = new URLSearchParams({ page: String(p), pageSize: '24' })
      if (q.trim()) params.set('q', q.trim())
      if (c) params.set('class', c)
      const result = await api<ApiList<Servant>>(`/api/servants?${params}`)
      if (token === listToken) list = result
    } catch (e) {
      if (token === listToken) listError = e instanceof Error ? e.message : 'Could not load servants.'
    } finally {
      if (token === listToken) loadingList = false
    }
  }

  async function toggleFavorite(servant: Servant) {
    const next = !servant.favorited
    servant.favorited = next // optimistic
    try {
      await api(`/api/favorites/${servant.id}`, { method: next ? 'PUT' : 'DELETE', body: undefined })
      await loadFavorites()
    } catch (e) {
      servant.favorited = !next
      listError = e instanceof Error ? e.message : 'Could not update favourites.'
    }
  }

  function say(ok: boolean, text: string) {
    notice = { ok, text }
    window.setTimeout(() => (notice = null), 3200)
  }

  async function patch(body: Record<string, string>) {
    const result = await api<{ user: Me }>('/api/me', { method: 'PATCH', body })
    session.me = result.user
  }

  async function saveProfile(event: SubmitEvent) {
    event.preventDefault()
    if (busy) return
    busy = true
    try {
      await patch({ name: form.name, callSign: form.callSign, region: form.region, bio: form.bio })
      say(true, 'Profile saved.')
    } catch (e) {
      say(false, e instanceof ApiError ? e.message : 'Could not save.')
    } finally {
      busy = false
    }
  }

  async function pickImage(kind: 'avatar' | 'banner', event: Event) {
    const input = event.currentTarget as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''
    if (!file || busy) return
    busy = true
    try {
      const url = await uploadImage(kind, file)
      await patch({ [kind]: url })
      say(true, kind === 'avatar' ? 'Profile picture updated.' : 'Banner updated.')
    } catch (e) {
      say(false, e instanceof Error ? e.message : 'Upload failed.')
    } finally {
      busy = false
    }
  }

  async function removeImage(kind: 'avatar' | 'banner') {
    if (busy) return
    busy = true
    try {
      await patch({ [kind]: '' })
      say(true, 'Removed.')
    } catch (e) {
      say(false, e instanceof Error ? e.message : 'Could not remove.')
    } finally {
      busy = false
    }
  }

  async function signOut() {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' })
    } catch {}
    window.location.assign('/login')
  }
</script>

<div class="pf">
  {#if !session.loaded}
    <div class="pf-empty"><Emblem animated size={56} /></div>
  {:else if !me}
    <div class="pf-empty">
      <Emblem size={56} />
      <h1>No active personnel record</h1>
      <p>Sign in or create an account to open your profile, favourite servants and the forum.</p>
      <div class="pf-actions">
        <a class="auth-submit" href="/login">Sign in <Icon name="arrow-right" size={16} /></a>
        <a class="text-link" href="/signup">Create account ↗</a>
      </div>
    </div>
  {:else}
    <aside class="pf-side">
      <a class="identity" href="/#/home" aria-label="Chaldea home">
        <Emblem size={34} />
        <span class="chaldea-wordmark"><b>CHALDEA</b><small>PERSONNEL</small></span>
      </a>
      <nav aria-label="Profile sections">
        {#each tabs as t (t.id)}
          <button aria-current={tab === t.id ? 'page' : undefined} onclick={() => (tab = t.id)} type="button">
            <Icon name={t.icon} size={19} /><span>{t.label}</span>
          </button>
        {/each}
        {#if me.isAdmin}
          <a class="pf-admin-link" href="/admin"><Icon name="shield" size={19} /><span>Admin panel</span></a>
        {/if}
      </nav>
      <div class="pf-side-foot">
        <a href="/#/forum"><Icon name="users" size={17} /> <span>Forum</span></a>
        <a href="/#/lostbelts"><Icon name="rayshift" size={17} /> <span>Grand Order</span></a>
        <div class="pf-tools"><AudioToggle /><ThemeToggle /></div>
      </div>
    </aside>

    <main class="pf-main">
      {#key tab}
        <div class="pf-view">
          {#if tab === 'overview'}
            <ProfileCard {favorites} {rank} user={me} />
            <section class="pf-stats">
              <div><strong>{visitedCount}</strong><span>Records read</span></div>
              <div><strong>{favorites.length}</strong><span>Favourite servants</span></div>
              <div class="pf-ringcell">
                <div class="pf-ring" aria-label="{percent}% of records read">
                  <svg viewBox="0 0 110 110">
                    <circle class="pf-ring-bg" cx="55" cy="55" r="46" />
                    <circle class="pf-ring-fg" cx="55" cy="55" r="46" stroke-dasharray={circ} stroke-dashoffset={circ * (1 - percent / 100)} transform="rotate(-90 55 55)" />
                  </svg>
                  <b>{percent}%</b>
                  <small>archive read</small>
                </div>
              </div>
            </section>
            <div class="pf-actions">
              <button class="pf-ghost" onclick={() => (tab = 'settings')} type="button"><Icon name="image" size={17} /> Edit picture &amp; banner</button>
              <a class="pf-ghost" href="/u/{me.id}"><Icon name="arrow-up-right" size={17} /> View public card</a>
            </div>
          {:else if tab === 'servants'}
            <section class="pf-card">
              <h2>Servant collection</h2>
              <p class="pf-muted">Star the servants you want on your profile card. The list is kept by the Chaldea admins.</p>
              <div class="pf-filter">
                <label class="pf-search">
                  <Icon name="compass" size={17} />
                  <input bind:value={query} oninput={() => (page = 1)} placeholder="Search by name, true name or origin" type="search" />
                </label>
                <select aria-label="Class" bind:value={cls} onchange={() => (page = 1)}>
                  <option value="">All classes</option>
                  {#each ALL_CLASSES as c (c)}<option value={c}>{c}</option>{/each}
                </select>
              </div>
              {#if listError}<p class="auth-message is-error" role="alert">{listError}</p>{/if}
              {#if list && list.items.length === 0}
                <p class="pf-muted">{list.total === 0 && !query && !cls ? 'The admins have not added any servants yet.' : 'No servant matches.'}</p>
              {/if}
              <ul class="sv-grid" class:is-loading={loadingList}>
                {#each list?.items ?? [] as s (s.id)}
                  <li class="sv-card" class:is-fav={s.favorited}>
                    <span class="sv-img">
                      {#if s.image}<img alt={s.name} decoding="async" loading="lazy" src={s.image} />{:else}<b>{s.name[0]}</b>{/if}
                      <i class="sv-rarity">{'★'.repeat(s.rarity)}</i>
                    </span>
                    <span class="sv-meta"><b>{s.name}</b><small>{s.class}{s.subclass ? ` · ${s.subclass}` : ''}</small></span>
                    <button aria-label={s.favorited ? `Remove ${s.name} from favourites` : `Add ${s.name} to favourites`} aria-pressed={!!s.favorited} class="sv-star" onclick={() => toggleFavorite(s)} type="button">
                      <Icon name="star" size={18} />
                    </button>
                  </li>
                {/each}
              </ul>
              {#if pages > 1}
                <nav aria-label="Pages" class="pager">
                  <button disabled={page <= 1} onclick={() => (page -= 1)} type="button"><Icon name="chevron-left" size={16} /></button>
                  <span>{page} / {pages}</span>
                  <button disabled={page >= pages} onclick={() => (page += 1)} type="button"><Icon name="chevron-right" size={16} /></button>
                </nav>
              {/if}
            </section>
          {:else if tab === 'records'}
            {#each chapters as ch (ch.id)}
              {@const done = ch.records.filter((r) => visited.includes(`${ch.id}/${r.id}`)).length}
              <section class="pf-card pf-chapter" style="--card-accent:{ch.accent}">
                <header>
                  <Icon name={ch.icon} size={22} />
                  <div><h2>{ch.title}</h2><small>{done} / {ch.records.length} read</small></div>
                  <span class="pf-bar"><i style="width:{(done / ch.records.length) * 100}%"></i></span>
                </header>
                <ul>
                  {#each ch.records as r (r.id)}
                    {@const read = visited.includes(`${ch.id}/${r.id}`)}
                    <li class:is-read={read}><Icon name={read ? 'check' : 'chevron-right'} size={14} />{r.location}</li>
                  {/each}
                </ul>
              </section>
            {/each}
            <a class="auth-submit pf-cta" href="/#/lostbelts">Continue in Grand Order <Icon name="arrow-right" size={16} /></a>
          {:else}
            <section class="pf-card">
              <h2>Card</h2>
              <p class="pf-muted">PNG, JPG, WebP or GIF. The banner is shown wide at the top of your card; the picture sits on top of it.</p>
              <div class="pf-media">
                <div class="pf-media-row">
                  <span class="pf-media-thumb is-avatar">
                    {#if me.avatar}<img alt="" src={me.avatar} />{:else}<Icon name="user" size={22} />{/if}
                  </span>
                  <div>
                    <b>Profile picture</b>
                    <div class="pf-media-actions">
                      <label class="pf-ghost"><Icon name="image" size={16} /> Upload<input accept="image/png,image/jpeg,image/webp,image/gif" disabled={busy} hidden onchange={(e) => pickImage('avatar', e)} type="file" /></label>
                      {#if me.avatar}<button class="pf-ghost" disabled={busy} onclick={() => removeImage('avatar')} type="button">Remove</button>{/if}
                    </div>
                  </div>
                </div>
                <div class="pf-media-row">
                  <span class="pf-media-thumb is-banner">
                    {#if me.banner}<img alt="" src={me.banner} />{:else}<Icon name="image" size={22} />{/if}
                  </span>
                  <div>
                    <b>Banner</b>
                    <div class="pf-media-actions">
                      <label class="pf-ghost"><Icon name="image" size={16} /> Upload<input accept="image/png,image/jpeg,image/webp,image/gif" disabled={busy} hidden onchange={(e) => pickImage('banner', e)} type="file" /></label>
                      {#if me.banner}<button class="pf-ghost" disabled={busy} onclick={() => removeImage('banner')} type="button">Remove</button>{/if}
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <form class="pf-card" onsubmit={saveProfile}>
              <h2>Profile</h2>
              <div class="pf-form">
                <label class="auth-field"><span>Name</span><input bind:value={form.name} maxlength="80" minlength="2" required /></label>
                <label class="auth-field"><span>Call sign</span><input bind:value={form.callSign} maxlength="40" placeholder="MASTER-48" /></label>
                <label class="auth-field">
                  <span>Observation zone</span>
                  <select bind:value={form.region}>
                    {#each REGIONS as [id, label] (id)}<option value={id}>{label}</option>{/each}
                  </select>
                </label>
                <label class="auth-field"><span>Email</span><input disabled value={me.email} /></label>
                <label class="auth-field pf-wide"><span>Bio</span><textarea bind:value={form.bio} maxlength="400" placeholder="A line about your journey…" rows="3"></textarea></label>
              </div>
              <div class="pf-actions">
                <button class="auth-submit" disabled={busy} type="submit">Save profile <Icon name="check" size={16} /></button>
              </div>
            </form>
            <section class="pf-card">
              <h2>Display</h2>
              <p class="pf-muted">Navbar position, UI model, theme and music live on their own page now.</p>
              <div class="pf-actions">
                <a class="pf-ghost" href="/settings"><Icon name="settings" size={17} /> Open display settings</a>
              </div>
            </section>
            <section class="pf-card">
              <h2>Session</h2>
              <div class="pf-actions">
                <button class="pf-ghost" onclick={signOut} type="button"><Icon name="logout" size={17} /> Sign out</button>
              </div>
            </section>
          {/if}
          {#if notice}
            <p class="auth-message {notice.ok ? 'is-ok' : 'is-error'} pf-toast" role="status"><Icon name={notice.ok ? 'check' : 'lock'} size={16} /> {notice.text}</p>
          {/if}
        </div>
      {/key}
    </main>
  {/if}
</div>
