<script lang="ts">
  import { onMount } from 'svelte'
  import { api } from '@/lib/api'
  import type { ClassTemplate } from '@/lib/chaldea'
  import { CLASS_GROUPS } from '@/lib/classes'
  import { img } from '@/lib/lore'
  import type { ApiList, Servant } from '@/lib/types'
  import Icon from './Icon.svelte'
  import Img from './Img.svelte'

  let { classes, onOpen }: { classes: ClassTemplate[]; onOpen?: (cls: ClassTemplate) => void } = $props()

  // Three copies of the list side by side: when the scroll position leaves the middle copy it is moved
  // back by exactly one copy, so the wheel never runs out.
  const COPIES = 3
  const items = $derived(
    Array.from({ length: COPIES }, (_, c) => classes.map((cls, i) => ({ cls, i, key: `${c}-${i}` }))).flat(),
  )

  let track = $state<HTMLDivElement | null>(null)
  let active = $state(0)
  let spinning = $state(false)
  let servants = $state<Servant[]>([])
  let loadingServants = $state(false)
  let step = 0
  let setWidth = 0
  let dragging = false
  let dragMoved = false
  let downCard: HTMLElement | null = null
  let lastX = 0
  let raf = 0
  // While a smooth scroll is running the wheel is not re-centred (setting scrollLeft would cancel the animation);
  // it is re-centred as soon as the scroll has finished.
  let animating = false
  let animTimer = 0

  const current = $derived(classes[active])

  function cards() {
    return track ? Array.from(track.querySelectorAll<HTMLElement>('.rl-card')) : []
  }

  function measure() {
    const list = cards()
    if (list.length < 2) return
    step = list[1].offsetLeft - list[0].offsetLeft
    setWidth = step * classes.length
  }

  function smoothFor(ms = 800) {
    animating = true
    window.clearTimeout(animTimer)
    animTimer = window.setTimeout(() => {
      animating = false
      layout()
    }, ms)
  }

  function layout() {
    if (!track || !step) return
    if (!animating) {
      if (track.scrollLeft < setWidth * 0.25) track.scrollLeft += setWidth
      else if (track.scrollLeft > setWidth * 1.75) track.scrollLeft -= setWidth
    }
    const mid = track.scrollLeft + track.clientWidth / 2
    let best = Infinity
    let bestIndex = active
    cards().forEach((card, n) => {
      const d = (card.offsetLeft + card.offsetWidth / 2 - mid) / step
      const a = Math.min(Math.abs(d), 3)
      card.style.setProperty('--s', String(1 - a * 0.1))
      card.style.setProperty('--r', `${Math.max(-3, Math.min(3, d)) * -16}deg`)
      card.style.setProperty('--o', String(1 - a * 0.2))
      if (a < best) {
        best = a
        bestIndex = n % classes.length
      }
    })
    if (bestIndex !== active) active = bestIndex
  }

  function onScroll() {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(layout)
  }

  function centerOn(n: number, smooth: boolean) {
    const card = cards()[n]
    if (!track || !card) return
    if (smooth) smoothFor()
    track.scrollTo({
      left: card.offsetLeft + card.offsetWidth / 2 - track.clientWidth / 2,
      behavior: smooth ? 'smooth' : 'instant',
    })
  }

  function nearestIndex() {
    if (!track) return 0
    const mid = track.scrollLeft + track.clientWidth / 2
    let best = 0
    let bestDist = Infinity
    cards().forEach((card, n) => {
      const dist = Math.abs(card.offsetLeft + card.offsetWidth / 2 - mid)
      if (dist < bestDist) {
        bestDist = dist
        best = n
      }
    })
    return best
  }

  function settle() {
    if (!track) return
    track.style.scrollSnapType = ''
    centerOn(nearestIndex(), true)
  }

  function pick(n: number) {
    if (dragMoved || spinning) return
    centerOn(n, true)
  }

  // A click on the card that is already centred opens its intro film; any other card is centred first.
  function cardClick(n: number, item: { cls: ClassTemplate; i: number }) {
    if (item.i === active && !dragMoved && !spinning) {
      onOpen?.(item.cls)
      return
    }
    pick(n)
  }

  function move(by: number) {
    if (spinning) return
    smoothFor()
    track?.scrollBy({ left: by * step, behavior: 'smooth' })
  }

  function spin() {
    if (!track || spinning) return
    spinning = true
    track.style.scrollSnapType = 'none'
    const distance = (classes.length * 2 + Math.floor(Math.random() * classes.length)) * step
    const duration = 3400
    const t0 = performance.now()
    let done = 0
    const frame = (now: number) => {
      const t = Math.min(1, (now - t0) / duration)
      const target = distance * (1 - Math.pow(1 - t, 4))
      track!.scrollLeft += target - done
      done = target
      if (t < 1) requestAnimationFrame(frame)
      else {
        spinning = false
        settle()
      }
    }
    requestAnimationFrame(frame)
  }

  function onPointerDown(event: PointerEvent) {
    if (event.pointerType !== 'mouse' || spinning || !track) return
    dragging = true
    dragMoved = false
    downCard = (event.target as HTMLElement).closest<HTMLElement>('.rl-card')
    lastX = event.clientX
    track.style.scrollSnapType = 'none'
    track.setPointerCapture(event.pointerId)
  }
  function onPointerMove(event: PointerEvent) {
    if (!dragging || !track) return
    const dx = event.clientX - lastX
    if (Math.abs(dx) > 0) dragMoved = dragMoved || Math.abs(dx) > 1
    track.scrollLeft -= dx
    lastX = event.clientX
  }
  function onPointerUp() {
    if (!dragging) return
    dragging = false
    if (!dragMoved && downCard) {
      // A plain press on a card: open it if it is centred, otherwise centre it.
      const n = cards().indexOf(downCard)
      if (n >= 0 && items[n]) cardClick(n, items[n])
    } else {
      settle()
    }
    downCard = null
    window.setTimeout(() => (dragMoved = false), 50)
  }

  function onKey(event: KeyboardEvent) {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      move(1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      move(-1)
    }
  }

  onMount(() => {
    measure()
    centerOn(classes.length, false) // first card of the middle copy
    layout()
    const observer = new ResizeObserver(() => {
      measure()
      layout()
    })
    if (track) observer.observe(track)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
      window.clearTimeout(animTimer)
    }
  })

  // The servants entered through the admin panel for the class in the middle of the wheel.
  $effect(() => {
    const id = current?.id
    if (!id) return
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      loadingServants = true
      try {
        const classNames = CLASS_GROUPS[id] ?? []
        const result = await api<ApiList<Servant>>(
          `/api/servants?class=${encodeURIComponent(classNames.join(','))}&pageSize=12`,
          { signal: controller.signal },
        )
        servants = result.items
      } catch {
        if (!controller.signal.aborted) servants = []
      } finally {
        if (!controller.signal.aborted) loadingServants = false
      }
    }, 260)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  })
</script>

<div aria-label="Servant classes" aria-roledescription="carousel" class="rl" role="region">
  <div class="rl-pointer" aria-hidden="true"></div>
  <div
    bind:this={track}
    class="rl-track"
    onkeydown={onKey}
    onpointercancel={onPointerUp}
    onpointerdown={onPointerDown}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onscroll={onScroll}
    role="group"
    tabindex="0"
  >
    {#each items as item, n (item.key)}
      <button
        aria-label="{item.cls.name} class"
        aria-current={item.i === active ? 'true' : undefined}
        class="rl-card"
        class:is-active={item.i === active}
        class:is-extra={item.cls.group === 'EXTRA CLASS'}
        onclick={() => cardClick(n, item)}
        tabindex="-1"
        type="button"
      >
        <Img alt="" class="rl-img" src={img.classEmblem(item.cls.id)} />
        <small>{item.cls.group}</small>
        <h5>{item.cls.name}</h5>
      </button>
    {/each}
  </div>

  <div class="rl-controls">
    <button aria-label="Previous class" disabled={spinning} onclick={() => move(-1)} type="button">
      <Icon name="chevron-left" size={18} />
    </button>
    <button aria-label="Next class" disabled={spinning} onclick={() => move(1)} type="button">
      <Icon name="chevron-right" size={18} />
    </button>
  </div>

  <div aria-live="polite" class="rl-detail">
    {#key current.id}
      <div class="rl-detail-copy">
        <small>{current.group}</small>
        <h4>{current.name}</h4>
        <p>{current.copy}</p>
      </div>
    {/key}
    <div class="rl-servants">
      {#if servants.length}
        <ul>
          {#each servants as s (s.id)}
            <li title="{s.name} ({s.class})">
              <Img alt={s.name} class="rl-servant-img" src={s.image} />
              <span>{s.name}</span>
            </li>
          {/each}
        </ul>
      {:else}
        <p>{loadingServants ? 'Searching the servant database…' : 'No servants entered for this class yet.'}</p>
      {/if}
    </div>
  </div>
</div>
