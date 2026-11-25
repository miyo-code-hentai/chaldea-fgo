<script lang="ts">
  import { api } from '@/lib/api'
  import { session } from '@/lib/session.svelte'

  /** Up / down vote control for a topic or a reply. Optimistic, rolls back if the server refuses. */
  let {
    kind,
    id,
    score = $bindable(0),
    myVote = $bindable(0),
    horizontal = false,
    onchange,
  }: {
    kind: 'topic' | 'reply'
    id: number
    score: number
    myVote: number
    horizontal?: boolean
    /** Called after every change (optimistic update, server result, rollback) so a parent that does not use bind: can keep its copy. */
    onchange?: (score: number, myVote: number) => void
  } = $props()

  let busy = false

  async function cast(value: 1 | -1) {
    if (!session.me) {
      window.location.assign(`/login?next=${encodeURIComponent(`/${window.location.hash}`)}`)
      return
    }
    if (busy) return
    busy = true
    const target = myVote === value ? 0 : value
    const before = { score, myVote }
    score += target - myVote
    myVote = target
    onchange?.(score, myVote)
    try {
      const r = await api<{ score: number; myVote: number }>('/api/forum/vote', { body: { kind, id, value: target } })
      score = r.score
      myVote = r.myVote
    } catch {
      score = before.score
      myVote = before.myVote
    } finally {
      onchange?.(score, myVote)
      busy = false
    }
  }
</script>

<div aria-label="Votes" class="vb" class:is-horizontal={horizontal} role="group">
  <button aria-label="Upvote" aria-pressed={myVote === 1} class="vb-up" onclick={() => cast(1)} type="button">
    <svg height="16" viewBox="0 0 16 16" width="16"><path d="M8 3 13.5 10H2.5Z" /></svg>
  </button>
  <b class:is-up={myVote === 1} class:is-down={myVote === -1}>{score}</b>
  <button aria-label="Downvote" aria-pressed={myVote === -1} class="vb-down" onclick={() => cast(-1)} type="button">
    <svg height="16" viewBox="0 0 16 16" width="16"><path d="M8 13 2.5 6h11Z" /></svg>
  </button>
</div>
