<script lang="ts">
  import { onMount } from 'svelte'
  import { api, timeAgo, uploadImage } from '@/lib/api'
  import { CATEGORIES, categoryLabel, type Sort } from '@/lib/forum'
  import { session } from '@/lib/session.svelte'
  import type { ApiList, Topic } from '@/lib/types'
  import ForumTopic from './ForumTopic.svelte'
  import Icon from './Icon.svelte'
  import VoteBox from './VoteBox.svelte'

  const SORTS: { id: Sort; label: string }[] = [
    { id: 'hot', label: 'Hot' },
    { id: 'new', label: 'New' },
    { id: 'top', label: 'Top' },
    { id: 'active', label: 'Active' },
  ]

  // Routes live in the hash: #/forum and #/forum/t/<id>
  let topicId = $state<number | null>(null)
  const readRoute = () => {
    const m = /^#\/forum\/t\/(\d+)/.exec(window.location.hash)
    topicId = m ? Number(m[1]) : null
  }

  let category = $state('')
  let sort = $state<Sort>('hot')
  let query = $state('')
  let search = $state('')
  let items = $state<Topic[]>([])
  let total = $state(0)
  let page = $state(1)
  let loading = $state(true)
  let error = $state('')
  let token = 0

  // composer
  let composing = $state(false)
  let draft = $state({ category: 'general', title: '', body: '' })
  let posting = $state(false)
  let formError = $state('')

  // Images, GIFs and short videos attached to the new topic. Each one is uploaded as soon as it is picked.
  type Attachment = { name: string; url: string; kind: 'image' | 'video'; busy: boolean }
  const MAX_ATTACH = 4
  let attachments = $state<Attachment[]>([])
  const uploading = $derived(attachments.some((a) => a.busy))

  async function addFiles(event: Event) {
    const input = event.currentTarget as HTMLInputElement
    const picked = Array.from(input.files ?? []).slice(0, MAX_ATTACH - attachments.length)
    input.value = ''
    for (const file of picked) {
      const at = attachments.length
      attachments.push({ name: file.name, url: '', kind: file.type.startsWith('video/') ? 'video' : 'image', busy: true })
      try {
        const url = await uploadImage('attach', file)
        attachments[at].url = url
        attachments[at].busy = false
      } catch (e) {
        formError = e instanceof Error ? e.message : 'Could not upload that file.'
        attachments = attachments.filter((_, i) => i !== at)
      }
    }
  }

  function removeAttachment(index: number) {
    attachments = attachments.filter((_, i) => i !== index)
  }

  const me = $derived(session.me)
  const hasMore = $derived(items.length < total)

  async function load(reset: boolean) {
    const t = ++token
    loading = true
    error = ''
    try {
      const nextPage = reset ? 1 : page + 1
      const params = new URLSearchParams({ sort, page: String(nextPage), pageSize: '20' })
      if (category) params.set('category', category)
      if (query.trim()) params.set('q', query.trim())
      const r = await api<ApiList<Topic>>(`/api/forum/topics?${params}`)
      if (t !== token) return
      items = reset ? r.items : [...items, ...r.items.filter((x) => !items.some((y) => y.id === x.id))]
      total = r.total
      page = nextPage
    } catch (e) {
      if (t === token) error = e instanceof Error ? e.message : 'Could not load topics.'
    } finally {
      if (t === token) loading = false
    }
  }

  onMount(() => {
    void session.load()
    readRoute()
    const onHash = () => {
      const before = topicId
      readRoute()
      if (topicId !== before) window.scrollTo(0, 0)
      if (topicId === null && before !== null) void load(true) // coming back: refresh scores and counts
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  })

  // Reload the list whenever the filters change.
  $effect(() => {
    void category
    void sort
    void query
    void load(true)
  })

  // Debounce the search box.
  $effect(() => {
    const value = search
    const timer = window.setTimeout(() => (query = value), 300)
    return () => window.clearTimeout(timer)
  })

  async function create(event: SubmitEvent) {
    event.preventDefault()
    if (posting) return
    posting = true
    formError = ''
    try {
      const media = attachments.filter((a) => a.url).map((a) => a.url)
      const r = await api<{ topic: Topic }>('/api/forum/topics', { body: { ...draft, media } })
      draft = { category: draft.category, title: '', body: '' }
      attachments = []
      composing = false
      window.location.hash = `#/forum/t/${r.topic.id}`
    } catch (e) {
      formError = e instanceof Error ? e.message : 'Could not post.'
    } finally {
      posting = false
    }
  }

  const initials = (name: string) => name.split(/\s+/).map((w) => w[0] ?? '').slice(0, 2).join('').toUpperCase() || '?'
  const signInUrl = () => `/login?next=${encodeURIComponent('/#/forum')}`
</script>

<div class="fr">
  {#if topicId !== null}
    <section class="fr-wrap">
      {#key topicId}
        <ForumTopic id={topicId} onBack={() => (window.location.hash = '#/forum')} onDeleted={() => (window.location.hash = '#/forum')} />
      {/key}
    </section>
  {:else}
    <section class="fr-hero">
      <div class="ed-head">
        <div>
          <p class="ed-eyebrow"><i></i> COMMUNITY / FORUM</p>
          <h2>Gather, discuss, theorize.</h2>
        </div>
        <div class="ed-note">
          <b>01</b>
          <p>Start a topic, reply to others and vote. Mark spoilers for chapters other readers may not have reached.</p>
        </div>
      </div>
    </section>

    <section class="fr-wrap fr-grid">
      <div class="fr-feed">
        <div class="fr-bar">
          <div class="fr-sorts" role="tablist" aria-label="Sort topics">
            {#each SORTS as s (s.id)}
              <button aria-selected={sort === s.id} onclick={() => (sort = s.id)} role="tab" type="button">{s.label}</button>
            {/each}
          </div>
          <label class="pf-search fr-search">
            <Icon name="compass" size={16} />
            <input bind:value={search} placeholder="Search topics" type="search" />
          </label>
        </div>

        {#if composing && me}
          <form class="fr-compose" onsubmit={create}>
            <div class="fr-compose-top">
              <select aria-label="Category" bind:value={draft.category}>
                {#each CATEGORIES as c (c.id)}<option value={c.id}>{c.label}</option>{/each}
              </select>
              <input aria-label="Title" bind:value={draft.title} maxlength="140" placeholder="Title" required />
            </div>
            <textarea aria-label="Post" bind:value={draft.body} maxlength="8000" placeholder="What do you want to talk about?" required rows="7"></textarea>
            <div class="fr-attach-row">
              <label class="pf-ghost fr-attach-btn">
                <input accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm" multiple onchange={addFiles} type="file" />
                Attach image, GIF or video
              </label>
              <small>{attachments.length} / {MAX_ATTACH}</small>
            </div>
            {#if attachments.length}
              <ul class="fr-attach-list">
                {#each attachments as a, i (i)}
                  <li>
                    {#if a.busy}
                      <span>Uploading {a.name}…</span>
                    {:else if a.kind === 'video'}
                      <video muted src={a.url}></video>
                    {:else}
                      <img alt="" src={a.url} />
                    {/if}
                    <button class="pf-ghost" onclick={() => removeAttachment(i)} type="button">Remove</button>
                  </li>
                {/each}
              </ul>
            {/if}
            {#if formError}<p class="cm-error" role="alert">{formError}</p>{/if}
            <div class="fr-compose-foot">
              <small>{draft.body.length} / 8000</small>
              <span>
                <button class="pf-ghost" onclick={() => (composing = false)} type="button">Cancel</button>
                <button class="auth-submit fr-btn" disabled={posting || uploading} type="submit">{posting ? 'Posting…' : uploading ? 'Uploading…' : 'Post topic'} <Icon name="arrow-right" size={16} /></button>
              </span>
            </div>
          </form>
        {/if}

        {#if error}<p class="cm-error" role="alert">{error}</p>{/if}

        <ul class="fr-list" class:is-loading={loading && items.length > 0}>
          {#each items as t (t.id)}
            <li class="fr-row">
              <VoteBox bind:myVote={t.myVote} bind:score={t.score} id={t.id} kind="topic" />
              <div class="fr-row-main">
                <p class="fr-meta">
                  <button class="fr-cat" onclick={() => (category = category === t.category ? '' : t.category)} type="button">{categoryLabel(t.category)}</button>
                  <a class="fr-by" href="/u/{t.author.id}">
                    <span class="fr-avatar is-small">{#if t.author.avatar}<img alt="" loading="lazy" src={t.author.avatar} />{:else}{initials(t.author.name)}{/if}</span>
                    {t.author.name}
                  </a>
                  <time datetime={new Date(t.createdAt).toISOString()}>{timeAgo(t.createdAt)}</time>
                </p>
                <h3><a data-instant href="#/forum/t/{t.id}">{t.title}</a></h3>
                <p class="fr-row-foot">
                  <a data-instant href="#/forum/t/{t.id}"><Icon name="mail" size={14} /> {t.replyCount} {t.replyCount === 1 ? 'reply' : 'replies'}</a>
                  {#if t.lastActivity > t.createdAt}<span>active {timeAgo(t.lastActivity)}</span>{/if}
                </p>
              </div>
            </li>
          {/each}
        </ul>

        {#if loading && items.length === 0}
          <p class="cm-muted">Loading…</p>
        {:else if !loading && items.length === 0 && !error}
          <p class="cm-muted fr-none">{query || category ? 'No topic matches.' : 'No topics yet. Start the first one.'}</p>
        {:else if hasMore}
          <button class="cm-more" disabled={loading} onclick={() => load(false)} type="button">{loading ? 'Loading…' : 'Load more'}</button>
        {/if}
      </div>

      <aside class="fr-side">
        {#if me}
          <button class="auth-submit fr-btn fr-new" onclick={() => (composing = !composing)} type="button">New topic <Icon name="plus" size={16} /></button>
        {:else if session.loaded}
          <a class="auth-submit fr-btn fr-new" href={signInUrl()}>Sign in to post <Icon name="arrow-right" size={16} /></a>
        {/if}
        <nav aria-label="Categories" class="fr-cats">
          <h3>Categories</h3>
          <button aria-pressed={category === ''} onclick={() => (category = '')} type="button"><b>All topics</b></button>
          {#each CATEGORIES as c (c.id)}
            <button aria-pressed={category === c.id} onclick={() => (category = category === c.id ? '' : c.id)} type="button">
              <b>{c.label}</b><small>{c.blurb}</small>
            </button>
          {/each}
        </nav>
        <div class="fr-rules">
          <h3>House rules</h3>
          <ol>
            <li>Be kind. Argue with ideas, not people.</li>
            <li>Mark spoilers for later chapters.</li>
            <li>No harassment, hate or illegal content.</li>
            <li>Fan works are welcome; credit the original artists.</li>
          </ol>
        </div>
      </aside>
    </section>
  {/if}
</div>
