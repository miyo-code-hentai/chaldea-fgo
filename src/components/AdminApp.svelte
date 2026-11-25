<script lang="ts">
  import { onMount } from 'svelte'
  import { api, timeAgo, uploadImage } from '@/lib/api'
  import { ALL_CLASSES } from '@/lib/classes'
  import { session } from '@/lib/session.svelte'
  import type { ApiList, PublicUser, Servant } from '@/lib/types'
  import Emblem from './Emblem.svelte'
  import Icon from './Icon.svelte'
  import ThemeToggle from './ThemeToggle.svelte'

  type Tab = 'servants' | 'import' | 'users'
  type AdminUser = PublicUser & { email: string; envAdmin: boolean }
  type Draft = {
    id: number | null
    name: string
    class: string
    subclass: string
    rarity: number
    trueName: string
    origin: string
    alignment: string
    description: string
    image: string
  }

  let tab = $state<Tab>('servants')
  let notice = $state<{ ok: boolean; text: string } | null>(null)
  let noticeTimer = 0
  const say = (ok: boolean, text: string) => {
    notice = { ok, text }
    window.clearTimeout(noticeTimer)
    noticeTimer = window.setTimeout(() => (notice = null), 4000)
  }
  const fail = (e: unknown) => say(false, e instanceof Error ? e.message : 'Something went wrong.')

  // ---------- servants ----------
  let q = $state('')
  let cls = $state('')
  let page = $state(1)
  let list = $state<ApiList<Servant> | null>(null)
  let loading = $state(false)
  let token = 0
  const pages = $derived(list ? Math.max(1, Math.ceil(list.total / list.pageSize)) : 1)

  const blank = (): Draft => ({ id: null, name: '', class: 'Saber', subclass: '', rarity: 3, trueName: '', origin: '', alignment: '', description: '', image: '' })
  let draft = $state<Draft | null>(null)
  let saving = $state(false)

  async function loadList() {
    const t = ++token
    loading = true
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '20' })
      if (q.trim()) params.set('q', q.trim())
      if (cls) params.set('class', cls)
      const r = await api<ApiList<Servant>>(`/api/servants?${params}`)
      if (t === token) list = r
    } catch (e) {
      if (t === token) fail(e)
    } finally {
      if (t === token) loading = false
    }
  }

  $effect(() => {
    if (tab !== 'servants') return
    void q
    void cls
    void page
    const timer = window.setTimeout(() => void loadList(), q ? 250 : 0)
    return () => window.clearTimeout(timer)
  })

  function edit(s: Servant) {
    draft = { id: s.id, name: s.name, class: s.class, subclass: s.subclass, rarity: s.rarity, trueName: s.trueName, origin: s.origin, alignment: s.alignment, description: s.description, image: s.image }
  }

  async function save(event: SubmitEvent) {
    event.preventDefault()
    if (!draft || saving) return
    saving = true
    const { id, ...body } = $state.snapshot(draft)
    try {
      await api(id ? `/api/servants/${id}` : '/api/servants', { method: id ? 'PUT' : 'POST', body })
      say(true, id ? 'Servant updated.' : 'Servant added.')
      draft = null
      await loadList()
    } catch (e) {
      fail(e)
    } finally {
      saving = false
    }
  }

  async function remove(s: Servant) {
    if (!window.confirm(`Delete ${s.name}? It will also disappear from users' favourites.`)) return
    try {
      await api(`/api/servants/${s.id}`, { method: 'DELETE' })
      say(true, `${s.name} deleted.`)
      if (draft?.id === s.id) draft = null
      await loadList()
    } catch (e) {
      fail(e)
    }
  }

  async function pickImage(event: Event) {
    const input = event.currentTarget as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''
    if (!file || !draft) return
    try {
      const url = await uploadImage('servant', file)
      if (draft) draft.image = url
    } catch (e) {
      fail(e)
    }
  }

  // ---------- import ----------
  const sample = JSON.stringify(
    [
      { name: 'Artoria Pendragon', class: 'Saber', rarity: 5, trueName: 'Arthur Pendragon', origin: 'Arthurian Legend', alignment: 'Lawful Good', description: 'The King of Knights.', image: '' },
      { name: 'Emiya', class: 'Archer', rarity: 3, subclass: '', origin: 'Fate/stay night', alignment: 'Neutral Balanced' },
    ],
    null,
    2,
  )
  let importText = $state('')
  let importing = $state(false)

  async function runImport() {
    if (importing) return
    let parsed: unknown
    try {
      parsed = JSON.parse(importText)
    } catch {
      say(false, 'That is not valid JSON.')
      return
    }
    const servants = Array.isArray(parsed) ? parsed : (parsed as { servants?: unknown })?.servants
    importing = true
    try {
      const r = await api<{ created: number }>('/api/servants/import', { body: { servants } })
      say(true, `${r.created} servants imported.`)
      importText = ''
    } catch (e) {
      fail(e)
    } finally {
      importing = false
    }
  }

  async function readFile(event: Event) {
    const input = event.currentTarget as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''
    if (!file) return
    if (file.size > 512 * 1024) return say(false, 'That file is too large (max 512 KB).')
    importText = await file.text()
  }

  // ---------- users ----------
  let uq = $state('')
  let upage = $state(1)
  let users = $state<ApiList<AdminUser> | null>(null)
  let utoken = 0
  const upages = $derived(users ? Math.max(1, Math.ceil(users.total / users.pageSize)) : 1)

  async function loadUsers() {
    const t = ++utoken
    try {
      const params = new URLSearchParams({ page: String(upage), pageSize: '20' })
      if (uq.trim()) params.set('q', uq.trim())
      const r = await api<ApiList<AdminUser>>(`/api/admin/users?${params}`)
      if (t === utoken) users = r
    } catch (e) {
      if (t === utoken) fail(e)
    }
  }

  $effect(() => {
    if (tab !== 'users') return
    void uq
    void upage
    const timer = window.setTimeout(() => void loadUsers(), uq ? 250 : 0)
    return () => window.clearTimeout(timer)
  })

  async function toggleAdmin(u: AdminUser) {
    try {
      await api(`/api/admin/users/${u.id}`, { method: 'PATCH', body: { isAdmin: !u.isAdmin } })
      say(true, u.isAdmin ? `${u.name} is no longer an admin.` : `${u.name} is now an admin.`)
      await loadUsers()
    } catch (e) {
      fail(e)
    }
  }

  async function removeUser(u: AdminUser) {
    if (!window.confirm(`Delete the account of ${u.name} (${u.email})? Their comments and forum posts are removed too.`)) return
    try {
      await api(`/api/admin/users/${u.id}`, { method: 'DELETE' })
      say(true, 'Account deleted.')
      await loadUsers()
    } catch (e) {
      fail(e)
    }
  }

  onMount(() => void session.load())
</script>

<div class="ad">
  <header class="ad-bar">
    <a class="identity" href="/#/home" aria-label="Chaldea home">
      <Emblem size={34} />
      <span class="chaldea-wordmark"><b>CHALDEA</b><small>ADMINISTRATION</small></span>
    </a>
    <nav aria-label="Admin sections" class="ad-tabs">
      <button aria-current={tab === 'servants' ? 'page' : undefined} onclick={() => (tab = 'servants')} type="button"><Icon name="star" size={17} /> Servants</button>
      <button aria-current={tab === 'import' ? 'page' : undefined} onclick={() => (tab = 'import')} type="button"><Icon name="plus" size={17} /> Bulk import</button>
      <button aria-current={tab === 'users' ? 'page' : undefined} onclick={() => (tab = 'users')} type="button"><Icon name="users" size={17} /> Users</button>
    </nav>
    <div class="ad-right">
      <a class="text-link" href="/account">Back to profile ↗</a>
      <ThemeToggle />
    </div>
  </header>

  <main class="ad-main">
    {#if notice}<p class="auth-message {notice.ok ? 'is-ok' : 'is-error'} ad-toast" role="status"><Icon name={notice.ok ? 'check' : 'lock'} size={16} /> {notice.text}</p>{/if}

    {#if tab === 'servants'}
      <div class="ad-head">
        <div>
          <p class="ed-eyebrow"><i></i> SERVANT DATABASE</p>
          <h1>Servants.</h1>
          <p class="pf-muted">{list ? `${list.total} in the database.` : 'Loading…'} Users choose their favourites from this list.</p>
        </div>
        <button class="auth-submit" onclick={() => (draft = blank())} type="button">Add servant <Icon name="plus" size={16} /></button>
      </div>

      <div class="ad-split" class:has-form={!!draft}>
        <section class="pf-card">
          <div class="pf-filter">
            <label class="pf-search"><Icon name="compass" size={17} /><input bind:value={q} oninput={() => (page = 1)} placeholder="Search" type="search" /></label>
            <select aria-label="Class" bind:value={cls} onchange={() => (page = 1)}>
              <option value="">All classes</option>
              {#each ALL_CLASSES as c (c)}<option value={c}>{c}</option>{/each}
            </select>
          </div>
          <ul class="ad-rows" class:is-loading={loading}>
            {#each list?.items ?? [] as s (s.id)}
              <li class:is-editing={draft?.id === s.id}>
                <span class="ad-thumb">{#if s.image}<img alt="" loading="lazy" src={s.image} />{:else}<b>{s.name[0]}</b>{/if}</span>
                <span class="ad-name"><b>{s.name}</b><small>{s.class}{s.subclass ? ` · ${s.subclass}` : ''} · {'★'.repeat(s.rarity) || '—'}</small></span>
                <span class="ad-actions">
                  <button class="pf-ghost" onclick={() => edit(s)} type="button">Edit</button>
                  <button class="pf-ghost is-danger" onclick={() => remove(s)} type="button">Delete</button>
                </span>
              </li>
            {:else}
              <li class="ad-empty">{loading ? 'Loading…' : q || cls ? 'No servant matches.' : 'No servants yet. Add one, or use Bulk import.'}</li>
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

        {#if draft}
          <form class="pf-card ad-form" onsubmit={save}>
            <h2>{draft.id ? 'Edit servant' : 'New servant'}</h2>
            <div class="ad-image">
              <span class="ad-thumb is-big">{#if draft.image}<img alt="" src={draft.image} />{:else}<Icon name="image" size={26} />{/if}</span>
              <div class="pf-media-actions">
                <label class="pf-ghost"><Icon name="image" size={16} /> Upload image<input accept="image/png,image/jpeg,image/webp,image/gif" hidden onchange={pickImage} type="file" /></label>
                {#if draft.image}<button class="pf-ghost" onclick={() => draft && (draft.image = '')} type="button">Remove</button>{/if}
              </div>
            </div>
            <div class="pf-form">
              <label class="auth-field"><span>Name</span><input bind:value={draft.name} maxlength="80" required /></label>
              <label class="auth-field"><span>Class</span><select bind:value={draft.class}>{#each ALL_CLASSES as c (c)}<option value={c}>{c}</option>{/each}</select></label>
              <label class="auth-field"><span>Rarity (0–5 ★)</span><input bind:value={draft.rarity} max="5" min="0" type="number" /></label>
              <label class="auth-field"><span>Subclass</span><input bind:value={draft.subclass} maxlength="40" /></label>
              <label class="auth-field"><span>True name</span><input bind:value={draft.trueName} maxlength="80" /></label>
              <label class="auth-field"><span>Alignment</span><input bind:value={draft.alignment} maxlength="40" /></label>
              <label class="auth-field pf-wide"><span>Origin</span><input bind:value={draft.origin} maxlength="120" /></label>
              <label class="auth-field pf-wide"><span>Description</span><textarea bind:value={draft.description} maxlength="2000" rows="5"></textarea></label>
            </div>
            <div class="pf-actions">
              <button class="auth-submit" disabled={saving} type="submit">{saving ? 'Saving…' : 'Save servant'} <Icon name="check" size={16} /></button>
              <button class="pf-ghost" onclick={() => (draft = null)} type="button">Cancel</button>
            </div>
          </form>
        {/if}
      </div>
    {:else if tab === 'import'}
      <div class="ad-head">
        <div>
          <p class="ed-eyebrow"><i></i> BULK IMPORT</p>
          <h1>Import servants.</h1>
          <p class="pf-muted">Paste a JSON array (or upload a .json file). Up to 500 servants at once; if any row is invalid nothing is imported. Allowed classes: {ALL_CLASSES.join(', ')}. Image paths must start with <code>/assets/</code> or <code>/uploads/</code>.</p>
        </div>
      </div>
      <section class="pf-card">
        <textarea aria-label="Servants JSON" bind:value={importText} class="ad-json" placeholder={sample} rows="16" spellcheck="false"></textarea>
        <div class="pf-actions">
          <button class="auth-submit" disabled={importing || !importText.trim()} onclick={runImport} type="button">{importing ? 'Importing…' : 'Import'} <Icon name="arrow-right" size={16} /></button>
          <label class="pf-ghost">Load .json file<input accept="application/json,.json" hidden onchange={readFile} type="file" /></label>
          <button class="pf-ghost" onclick={() => (importText = sample)} type="button">Insert example</button>
        </div>
      </section>
    {:else}
      <div class="ad-head">
        <div>
          <p class="ed-eyebrow"><i></i> PERSONNEL</p>
          <h1>Users.</h1>
          <p class="pf-muted">{users ? `${users.total} accounts.` : 'Loading…'} Admins can manage the servant database and remove accounts. Accounts listed in the ADMIN_EMAILS setting are always admins.</p>
        </div>
      </div>
      <section class="pf-card">
        <label class="pf-search"><Icon name="compass" size={17} /><input bind:value={uq} oninput={() => (upage = 1)} placeholder="Search name, email or call sign" type="search" /></label>
        <ul class="ad-rows">
          {#each users?.items ?? [] as u (u.id)}
            <li>
              <span class="ad-thumb is-round">{#if u.avatar}<img alt="" loading="lazy" src={u.avatar} />{:else}<b>{u.name[0]}</b>{/if}</span>
              <span class="ad-name"><b>{u.name}{#if u.isAdmin} <em class="ad-tag">admin</em>{/if}</b><small>{u.email} · joined {timeAgo(u.joined)}</small></span>
              <span class="ad-actions">
                <a class="pf-ghost" href="/u/{u.id}">View</a>
                <button class="pf-ghost" disabled={u.envAdmin || u.id === session.me?.id} onclick={() => toggleAdmin(u)} type="button">{u.isAdmin ? 'Remove admin' : 'Make admin'}</button>
                <button class="pf-ghost is-danger" disabled={u.id === session.me?.id} onclick={() => removeUser(u)} type="button">Delete</button>
              </span>
            </li>
          {:else}
            <li class="ad-empty">No users.</li>
          {/each}
        </ul>
        {#if upages > 1}
          <nav aria-label="Pages" class="pager">
            <button disabled={upage <= 1} onclick={() => (upage -= 1)} type="button"><Icon name="chevron-left" size={16} /></button>
            <span>{upage} / {upages}</span>
            <button disabled={upage >= upages} onclick={() => (upage += 1)} type="button"><Icon name="chevron-right" size={16} /></button>
          </nav>
        {/if}
      </section>
    {/if}
  </main>
</div>
