<script lang="ts">
  import { onMount } from 'svelte'
  import { api, timeAgo } from '@/lib/api'
  import { categoryLabel } from '@/lib/forum'
  import { session } from '@/lib/session.svelte'
  import type { Reply, Topic } from '@/lib/types'
  import Icon from './Icon.svelte'
  import VoteBox from './VoteBox.svelte'

  let { id, onBack, onDeleted }: { id: number; onBack: () => void; onDeleted: () => void } = $props()

  let topic = $state<Topic | null>(null)
  let replies = $state<Reply[]>([])
  let loading = $state(true)
  let error = $state('')
  let body = $state('')
  let sending = $state(false)
  let replyTo = $state<number | null>(null)
  let replyBody = $state('')
  let collapsed = $state<Set<number>>(new Set())

  const me = $derived(session.me)
  const MAX_DEPTH = 6

  // Replies are ordered best-first using the scores as they were when the page loaded, so a thread does not
  // reshuffle under the reader's cursor while they vote. Oldest first among equals.
  let initialScore = new Map<number, number>()

  const tree = $derived.by(() => {
    const map = new Map<number | null, Reply[]>()
    for (const r of replies) {
      const key = r.parentId
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(r)
    }
    const at = (r: Reply) => initialScore.get(r.id) ?? 0
    for (const list of map.values()) list.sort((a, b) => at(b) - at(a) || a.createdAt - b.createdAt)
    return map
  })

  async function load() {
    loading = true
    error = ''
    try {
      const r = await api<{ topic: Topic; replies: Reply[] }>(`/api/forum/topics/${id}`)
      topic = r.topic
      initialScore = new Map(r.replies.map((x) => [x.id, x.score]))
      replies = r.replies
    } catch (e) {
      error = e instanceof Error ? e.message : 'Could not load this topic.'
    } finally {
      loading = false
    }
  }

  onMount(() => {
    void session.load()
    void load()
  })

  async function post(parentId: number | null, text: string) {
    const r = await api<{ reply: Reply }>(`/api/forum/topics/${id}/replies`, { body: { body: text, parentId } })
    replies = [...replies, r.reply]
    if (topic) topic.replyCount += 1
  }

  async function sendTop(event: SubmitEvent) {
    event.preventDefault()
    if (!body.trim() || sending) return
    sending = true
    error = ''
    try {
      await post(null, body)
      body = ''
    } catch (e) {
      error = e instanceof Error ? e.message : 'Could not post.'
    } finally {
      sending = false
    }
  }

  async function sendNested(event: SubmitEvent) {
    event.preventDefault()
    if (!replyBody.trim() || sending || replyTo === null) return
    sending = true
    error = ''
    try {
      await post(replyTo, replyBody)
      replyTo = null
      replyBody = ''
    } catch (e) {
      error = e instanceof Error ? e.message : 'Could not post.'
    } finally {
      sending = false
    }
  }

  async function removeReply(r: Reply) {
    if (!window.confirm('Delete this reply and everything under it?')) return
    try {
      await api(`/api/forum/replies/${r.id}`, { method: 'DELETE' })
      // drop the reply and all its descendants
      const gone = new Set<number>([r.id])
      let grew = true
      while (grew) {
        grew = false
        for (const x of replies) if (x.parentId !== null && gone.has(x.parentId) && !gone.has(x.id)) (gone.add(x.id), (grew = true))
      }
      replies = replies.filter((x) => !gone.has(x.id))
      if (topic) topic.replyCount = replies.length
    } catch (e) {
      error = e instanceof Error ? e.message : 'Could not delete.'
    }
  }

  async function removeTopic() {
    if (!window.confirm('Delete this topic and all its replies?')) return
    try {
      await api(`/api/forum/topics/${id}`, { method: 'DELETE' })
      onDeleted()
    } catch (e) {
      error = e instanceof Error ? e.message : 'Could not delete.'
    }
  }

  function toggle(rid: number) {
    const next = new Set(collapsed)
    if (next.has(rid)) next.delete(rid)
    else next.add(rid)
    collapsed = next
  }

  const initials = (name: string) => name.split(/\s+/).map((w) => w[0] ?? '').slice(0, 2).join('').toUpperCase() || '?'
  const signInUrl = () => `/login?next=${encodeURIComponent(`/${window.location.hash}`)}`
  const countBelow = (rid: number): number => (tree.get(rid) ?? []).reduce((n, c) => n + 1 + countBelow(c.id), 0)
</script>

{#snippet node(r: Reply, depth: number)}
  {@const kids = tree.get(r.id) ?? []}
  <li class="fr-reply" class:is-collapsed={collapsed.has(r.id)}>
    <a class="fr-avatar" href="/u/{r.author.id}" aria-label="{r.author.name}'s profile">
      {#if r.author.avatar}<img alt="" loading="lazy" src={r.author.avatar} />{:else}{initials(r.author.name)}{/if}
    </a>
    <div class="fr-reply-main">
      <header>
        <a href="/u/{r.author.id}"><b>{r.author.name}</b></a>
        {#if r.author.isAdmin}<em class="cm-tag">admin</em>{/if}
        <time datetime={new Date(r.createdAt).toISOString()}>{timeAgo(r.createdAt)}</time>
        {#if kids.length}
          <button class="fr-fold" onclick={() => toggle(r.id)} type="button">{collapsed.has(r.id) ? `[+] ${countBelow(r.id)} hidden` : '[–]'}</button>
        {/if}
      </header>
      {#if !collapsed.has(r.id)}
        <p class="fr-text">{r.body}</p>
        <footer>
          <VoteBox horizontal id={r.id} kind="reply" myVote={r.myVote} onchange={(score, myVote) => ((r.score = score), (r.myVote = myVote))} score={r.score} />
          {#if me}
            <button onclick={() => ((replyTo = replyTo === r.id ? null : r.id), (replyBody = ''))} type="button">Reply</button>
          {/if}
          {#if me && (me.id === r.author.id || me.isAdmin)}
            <button class="is-danger" onclick={() => removeReply(r)} type="button">Delete</button>
          {/if}
        </footer>
        {#if replyTo === r.id}
          <form class="fr-nested-form" onsubmit={sendNested}>
            <textarea aria-label="Your reply" bind:value={replyBody} maxlength="4000" placeholder="Reply to {r.author.name}…" rows="3"></textarea>
            <div>
              <button class="cm-send" disabled={sending || !replyBody.trim()} type="submit">Reply <Icon name="arrow-right" size={14} /></button>
              <button class="pf-ghost" onclick={() => (replyTo = null)} type="button">Cancel</button>
            </div>
          </form>
        {/if}
        {#if kids.length}
          <ul class="fr-replies" class:is-flat={depth >= MAX_DEPTH}>
            {#each kids as k (k.id)}{@render node(k, depth + 1)}{/each}
          </ul>
        {/if}
      {/if}
    </div>
  </li>
{/snippet}

<div class="fr-topic">
  <button class="fr-back" onclick={onBack} type="button"><Icon name="arrow-left" size={16} /> All topics</button>

  {#if loading}
    <p class="cm-muted">Loading…</p>
  {:else if !topic}
    <p class="cm-error" role="alert">{error || 'Topic not found.'}</p>
  {:else}
    <article class="fr-post">
      <VoteBox bind:myVote={topic.myVote} bind:score={topic.score} {id} kind="topic" />
      <div class="fr-post-main">
        <p class="fr-meta">
          <span class="fr-cat">{categoryLabel(topic.category)}</span>
          <a class="fr-by" href="/u/{topic.author.id}">
            <span class="fr-avatar is-small">{#if topic.author.avatar}<img alt="" src={topic.author.avatar} />{:else}{initials(topic.author.name)}{/if}</span>
            {topic.author.name}
          </a>
          {#if topic.author.isAdmin}<em class="cm-tag">admin</em>{/if}
          <time datetime={new Date(topic.createdAt).toISOString()}>{timeAgo(topic.createdAt)}</time>
        </p>
        <h1>{topic.title}</h1>
        <p class="fr-text fr-body">{topic.body}</p>
        {#if topic.media?.length}
          <div class="fr-media">
            {#each topic.media as m (m)}
              {#if /\.(mp4|webm)$/.test(m)}
                <video controls playsinline preload="metadata" src={m}></video>
              {:else}
                <img alt="" loading="lazy" src={m} />
              {/if}
            {/each}
          </div>
        {/if}
        <footer class="fr-post-foot">
          <span><Icon name="mail" size={15} /> {topic.replyCount} {topic.replyCount === 1 ? 'reply' : 'replies'}</span>
          {#if me && (me.id === topic.author.id || me.isAdmin)}
            <button class="is-danger" onclick={removeTopic} type="button">Delete topic</button>
          {/if}
        </footer>
      </div>
    </article>

    {#if me}
      <form class="fr-compose is-reply" onsubmit={sendTop}>
        <textarea aria-label="Add a reply" bind:value={body} maxlength="4000" placeholder="Add to the discussion…" rows="4"></textarea>
        <div class="fr-compose-foot">
          <small>{body.length} / 4000</small>
          <button class="auth-submit fr-btn" disabled={sending || !body.trim()} type="submit">{sending ? 'Posting…' : 'Reply'} <Icon name="arrow-right" size={16} /></button>
        </div>
      </form>
    {:else if session.loaded}
      <p class="cm-signin"><Icon name="lock" size={15} /> <a href={signInUrl()}>Sign in</a> or <a href="/signup">create an account</a> to reply.</p>
    {/if}

    {#if error}<p class="cm-error" role="alert">{error}</p>{/if}

    <ul class="fr-replies is-root">
      {#each tree.get(null) ?? [] as r (r.id)}{@render node(r, 0)}{:else}<li class="cm-muted">No replies yet. Start the conversation.</li>{/each}
    </ul>
  {/if}
</div>
