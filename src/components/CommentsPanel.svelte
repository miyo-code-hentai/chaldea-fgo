<script lang="ts">
  import { onMount } from 'svelte'
  import { api, timeAgo } from '@/lib/api'
  import { session } from '@/lib/session.svelte'
  import type { ApiList, Comment } from '@/lib/types'
  import Icon from './Icon.svelte'

  /** Comment thread for one Grand Order record. `recordKey` is "<chapter>/<record>". */
  let { recordKey }: { recordKey: string } = $props()

  const PAGE = 20
  let items = $state<Comment[]>([])
  let total = $state(0)
  let page = $state(1)
  let loading = $state(true)
  let error = $state('')
  let body = $state('')
  let sending = $state(false)
  let token = 0

  const me = $derived(session.me)
  const hasMore = $derived(items.length < total)

  async function load(reset: boolean) {
    const t = ++token
    loading = true
    error = ''
    try {
      const nextPage = reset ? 1 : page + 1
      const r = await api<ApiList<Comment>>(`/api/comments?record=${encodeURIComponent(recordKey)}&page=${nextPage}&pageSize=${PAGE}`)
      if (t !== token) return
      items = reset ? r.items : [...items, ...r.items.filter((c) => !items.some((x) => x.id === c.id))]
      total = r.total
      page = nextPage
    } catch (e) {
      if (t === token) error = e instanceof Error ? e.message : 'Could not load comments.'
    } finally {
      if (t === token) loading = false
    }
  }

  onMount(() => {
    void session.load()
  })

  // The panel is re-mounted per record, but stay correct if the key ever changes in place.
  $effect(() => {
    void recordKey
    items = []
    total = 0
    page = 1
    void load(true)
  })

  async function send(event: SubmitEvent) {
    event.preventDefault()
    const text = body.trim()
    if (!text || sending) return
    sending = true
    error = ''
    try {
      const r = await api<{ comment: Comment }>('/api/comments', { body: { record: recordKey, body: text } })
      items = [r.comment, ...items]
      total += 1
      body = ''
    } catch (e) {
      error = e instanceof Error ? e.message : 'Could not post.'
    } finally {
      sending = false
    }
  }

  async function remove(c: Comment) {
    if (!window.confirm('Delete this comment?')) return
    try {
      await api(`/api/comments/${c.id}`, { method: 'DELETE' })
      items = items.filter((x) => x.id !== c.id)
      total = Math.max(0, total - 1)
    } catch (e) {
      error = e instanceof Error ? e.message : 'Could not delete.'
    }
  }

  const initials = (name: string) => name.split(/\s+/).map((w) => w[0] ?? '').slice(0, 2).join('').toUpperCase() || '?'
</script>

<section aria-label="Comments" class="cm">
  <h4 class="cm-title">{total} {total === 1 ? 'comment' : 'comments'}</h4>

  {#if me}
    <form class="cm-form" onsubmit={send}>
      <span class="cm-avatar">{#if me.avatar}<img alt="" src={me.avatar} />{:else}{initials(me.name)}{/if}</span>
      <div>
        <textarea aria-label="Write a comment" bind:value={body} maxlength="1000" placeholder="Share your thoughts on this chapter. Mark spoilers for later chapters." rows="3"></textarea>
        <div class="cm-form-foot">
          <small>{body.length} / 1000</small>
          <button class="cm-send" disabled={sending || !body.trim()} type="submit">{sending ? 'Posting…' : 'Post'} <Icon name="arrow-right" size={14} /></button>
        </div>
      </div>
    </form>
  {:else if session.loaded}
    <p class="cm-signin"><Icon name="lock" size={15} /> <a href="/login?next=/%23/lostbelts">Sign in</a> or <a href="/signup">create an account</a> to comment.</p>
  {/if}

  {#if error}<p class="cm-error" role="alert">{error}</p>{/if}

  <ul class="cm-list">
    {#each items as c (c.id)}
      <li>
        <a class="cm-avatar" href="/u/{c.author.id}" aria-label="{c.author.name}'s profile">
          {#if c.author.avatar}<img alt="" loading="lazy" src={c.author.avatar} />{:else}{initials(c.author.name)}{/if}
        </a>
        <div class="cm-main">
          <header>
            <a href="/u/{c.author.id}"><b>{c.author.name}</b></a>
            {#if c.author.isAdmin}<em class="cm-tag">admin</em>{/if}
            <time datetime={new Date(c.createdAt).toISOString()}>{timeAgo(c.createdAt)}</time>
            {#if me && (me.id === c.author.id || me.isAdmin)}
              <button aria-label="Delete comment" class="cm-del" onclick={() => remove(c)} type="button"><Icon name="close" size={13} /></button>
            {/if}
          </header>
          <p>{c.body}</p>
        </div>
      </li>
    {/each}
  </ul>

  {#if loading}
    <p class="cm-muted">Loading…</p>
  {:else if items.length === 0 && !error}
    <p class="cm-muted">No comments yet. Be the first.</p>
  {:else if hasMore}
    <button class="cm-more" onclick={() => load(false)} type="button">Load older comments</button>
  {/if}
</section>
