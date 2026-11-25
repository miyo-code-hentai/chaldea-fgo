<script lang="ts">
  import { onMount, tick } from 'svelte'
  import { bgm } from '@/lib/audio.svelte'
  import { img, ordealGate, type ChapterTheme, type GrandRecord, type PanelFx } from '@/lib/lore'
  import { paletteFor } from '@/lib/palettes'
  /** Records whose banner.webp failed to load keep their palette colours instead of a broken image. */
  let bannerMissing = $state<Record<string, boolean>>({})
  import { markVisited } from '@/lib/profile'
  import Atmosphere from './Atmosphere.svelte'
  import AudioToggle from './AudioToggle.svelte'
  import CommentsPanel from './CommentsPanel.svelte'
  import Icon from './Icon.svelte'
  import Img from './Img.svelte'

  let {
    chapter,
    origin,
    onClose,
  }: { chapter: ChapterTheme; origin: { x: number; y: number }; onClose: () => void } = $props()

  type Tab = 'info' | 'roles' | 'map' | 'characters' | 'comments'
  const tabs: { id: Tab; label: string; icon: 'book' | 'shield' | 'map' | 'users' | 'mail' }[] = [
    { id: 'info', label: 'Information', icon: 'book' },
    { id: 'roles', label: 'Roles', icon: 'shield' },
    { id: 'map', label: 'Map', icon: 'map' },
    { id: 'characters', label: 'Characters', icon: 'users' },
    { id: 'comments', label: 'Comments', icon: 'mail' },
  ]

  // Chapter II has a sub-tab: after the last Lostbelt a doorway panel opens the Ordeal Call.
  let view = $state<'main' | 'sub'>('main')
  const theme = $derived<ChapterTheme>(view === 'sub' && chapter.sub ? chapter.sub : chapter)
  const records = $derived<GrandRecord[]>(
    view === 'sub' && chapter.sub ? chapter.sub.records : chapter.sub ? [...chapter.records, ordealGate] : chapter.records,
  )

  let index = $state(0)
  let open = $state<GrandRecord | null>(null)
  let tab = $state<Tab>('info')
  let closing = $state(false)
  let track = $state<HTMLDivElement | null>(null)
  let wheelLock = false

  // The wipe that plays over the panel each time the scroll lands on a new record.
  let wipe = $state<{ key: number; fx: PanelFx } | null>(null)
  let lastIndex = 0
  let wipeCount = 0
  let lastView: 'main' | 'sub' = 'main'

  onMount(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
      bgm.play('main')
    }
  })

  // Every record has its own transition (and its own music, if the file exists).
  $effect(() => {
    const rec = records[index]
    if (!rec) return
    if (index !== lastIndex || view !== lastView) {
      wipe = { key: ++wipeCount, fx: rec.fx }
      lastIndex = index
      lastView = view
    }
    const timer = window.setTimeout(() => bgm.play(rec.bgm), 450)
    return () => window.clearTimeout(timer)
  })

  function goTo(i: number) {
    const next = Math.max(0, Math.min(records.length - 1, i))
    track?.scrollTo({ left: next * track.clientWidth, behavior: 'smooth' })
  }

  function onScroll() {
    if (!track) return
    index = Math.round(track.scrollLeft / track.clientWidth)
  }

  function onWheel(event: WheelEvent) {
    if (open) return
    const delta = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX
    if (Math.abs(delta) < 14 || wheelLock) return
    event.preventDefault()
    wheelLock = true
    goTo(index + (delta > 0 ? 1 : -1))
    window.setTimeout(() => (wheelLock = false), 620)
  }

  async function switchView(next: 'main' | 'sub') {
    view = next
    index = next === 'sub' ? 0 : chapter.records.length // back lands on the doorway
    await tick()
    track?.scrollTo({ left: index * (track?.clientWidth ?? 0), behavior: 'instant' })
  }

  function openRecord(record: GrandRecord) {
    if (record.gate) {
      void switchView('sub')
      return
    }
    open = record
    tab = 'info'
    markVisited(theme.id, record.id)
  }

  function close() {
    if (closing) return
    closing = true
    window.setTimeout(onClose, 480)
  }

  function back() {
    if (view === 'sub') void switchView('main')
    else close()
  }

  function onKey(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      if (open) open = null
      else back()
    } else if (!open && event.key === 'ArrowRight') goTo(index + 1)
    else if (!open && event.key === 'ArrowLeft') goTo(index - 1)
    else if (!open && event.key === 'Enter') openRecord(records[index])
  }

  const grouped = $derived(
    open
      ? ['Chaldea', 'Master', 'Ally', 'Antagonist', 'Featured Servant']
          .map((role) => ({ role, list: open!.characters.filter((c) => c.role === role) }))
          .filter((g) => g.list.length)
      : [],
  )
  const curtainCount = $derived(chapter.transition === 'slice' ? 6 : chapter.transition === 'blinds' ? 12 : 1)
  const isSpecial = (fx: PanelFx) => fx === 'omega' || fx === 'zero'
</script>

<svelte:window onkeydown={onKey} />

<div
  aria-label="{theme.title} chapter"
  aria-modal="true"
  class="cv cv-{theme.id}{theme.light ? ' is-light' : ''}{closing ? ' is-closing' : ''}"
  onwheel={onWheel}
  role="dialog"
  style="--cv-accent:{theme.accent};--cv-font:{theme.font};--cv-bg:{theme.background};--ox:{origin.x}px;--oy:{origin.y}px"
>
  <div aria-hidden="true" class="cv-bg"></div>
  {#key theme.id}
    <Atmosphere color={theme.accent} kind={theme.atmosphere} />
  {/key}

  <header class="cv-bar">
    <button class="cv-back" onclick={back} type="button">
      <Icon name="arrow-left" size={16} /> {view === 'sub' ? 'Lostbelts' : 'Grand Order'}
    </button>
    <div class="cv-heading">
      <small>{theme.label}</small>
      <b>{theme.title}</b>
    </div>
    <div class="cv-tools">
      <span class="cv-counter">{String(index + 1).padStart(2, '0')} / {String(records.length).padStart(2, '0')}</span>
      <AudioToggle />
      <button aria-label="Close chapter" class="icon-button" onclick={close} type="button">
        <Icon name="close" size={18} />
      </button>
    </div>
  </header>

  <div bind:this={track} class="cv-track" onscroll={onScroll}>
    {#each records as record, i (`${theme.id}-${record.id}`)}
      <section aria-label={record.location} class="cv-panel fx-{record.fx}{i === index ? ' is-active' : ''}">
        <!-- each record's own colours; visible until (or instead of) its banner photo -->
        <div aria-hidden="true" class="cv-art" style="background:{paletteFor(record.id)}"></div>
        <div aria-hidden="true" class="cv-banner{bannerMissing[record.id] ? ' is-missing' : ''}">
          {#if !bannerMissing[record.id]}
            <img alt="" decoding="async" onerror={() => (bannerMissing[record.id] = true)} src={img.banner(record.dir)} />
          {/if}
        </div>
        <div aria-hidden="true" class="cv-shade"></div>
        {#if isSpecial(record.fx)}
          <div aria-hidden="true" class="cv-special sp-{record.fx}">
            <span class="sp-glyph">{record.fx === 'omega' ? 'Ω' : '0'}</span>
            <span class="sp-ring"></span>
            <span class="sp-ring sp-ring-2"></span>
          </div>
        {:else}
          <div aria-hidden="true" class="cv-watermark">{record.gate ? 'OC' : record.number}</div>
        {/if}
        <div class="cv-copy">
          <small>{record.era} / {record.tag}</small>
          {#if isSpecial(record.fx)}
            <h2 aria-label={record.location} class="cv-letters">
              {#each [...record.location] as letter, n (n)}
                <span aria-hidden="true" style="--i:{n}">{letter === ' ' ? ' ' : letter}</span>
              {/each}
            </h2>
          {:else}
            <h2>{record.location}</h2>
          {/if}
          <p class="cv-title">{record.title}</p>
          <p class="cv-summary">{record.summary}</p>
          <button class="cv-open" onclick={() => openRecord(record)} type="button">
            {record.gate ? 'Enter Ordeal Call' : 'Open record'}
            <Icon name="arrow-right" size={16} />
          </button>
        </div>
      </section>
    {/each}
  </div>

  <nav aria-label="Records" class="cv-timeline">
    <button aria-label="Previous" disabled={index === 0} onclick={() => goTo(index - 1)} type="button">
      <Icon name="chevron-left" size={18} />
    </button>
    <ol>
      {#each records as record, i (`${theme.id}-${record.id}`)}
        <li>
          <button
            aria-current={i === index ? 'true' : undefined}
            class:is-gate={record.gate}
            class:is-on={i === index}
            onclick={() => goTo(i)}
            type="button"
          >
            <i></i>
            <span>{record.location}</span>
          </button>
        </li>
      {/each}
    </ol>
    <button aria-label="Next" disabled={index === records.length - 1} onclick={() => goTo(index + 1)} type="button">
      <Icon name="chevron-right" size={18} />
    </button>
  </nav>

  {#if open}
    <button aria-label="Close record" class="cv-scrim" onclick={() => (open = null)} type="button"></button>
    <div aria-label="{open.location} record" class="cv-float" role="document">
      <button aria-label="Close record" class="icon-button cv-float-close" onclick={() => (open = null)} type="button">
        <Icon name="close" size={18} />
      </button>
      <div class="cv-float-inner">
        <small class="cv-float-eyebrow">{theme.label} / {open.tag}</small>
        <h3>{open.location}</h3>
        <p class="cv-float-title">{open.title}</p>
        <div class="cv-tabs" role="tablist">
          {#each tabs as t (t.id)}
            <button aria-selected={tab === t.id} onclick={() => (tab = t.id)} role="tab" type="button">
              <Icon name={t.icon} size={16} /> <span>{t.label}</span>
            </button>
          {/each}
        </div>
        {#key `${open.id}-${tab}`}
          <div class="cv-tabpanel">
            {#if tab === 'info'}
              <p class="cv-lead">{open.summary}</p>
              <dl class="cv-facts">
                <div><dt>Chapter</dt><dd>{theme.title}</dd></div>
                <div><dt>Record</dt><dd>{open.tag}</dd></div>
                <div><dt>Era / region</dt><dd>{open.era}</dd></div>
                <div><dt>Location</dt><dd>{open.location}</dd></div>
                <div><dt>Cast listed</dt><dd>{open.characters.length} characters</dd></div>
              </dl>
            {:else if tab === 'roles'}
              {#each grouped as group (group.role)}
                <h4 class="cv-group">{group.role}</h4>
                <ul class="cv-roles">
                  {#each group.list as c (c.slug)}
                    <li>
                      <b>{c.name}</b>
                      {#if c.class}<em>{c.class}</em>{/if}
                      {#if c.note}<span>{c.note}</span>{/if}
                    </li>
                  {/each}
                </ul>
              {/each}
            {:else if tab === 'map'}
              <figure class="cv-map">
                <Img alt="Map of {open.location}" class="cv-map-img" src={img.map(open.dir)} />
                <figcaption>{open.location} — {open.era}</figcaption>
              </figure>
            {:else if tab === 'comments'}
              <CommentsPanel recordKey="{theme.id}/{open.id}" />
            {:else}
              <ul class="cv-cast">
                {#each open.characters as c (c.slug)}
                  <li>
                    <Img alt={c.name} class="cv-portrait" src={img.character(c.slug)} />
                    <b>{c.name}</b>
                    <span>{c.class || c.role}</span>
                  </li>
                {/each}
              </ul>
            {/if}
          </div>
        {/key}
      </div>
    </div>
  {/if}

  {#if wipe}
    {#key wipe.key}
      {#if isSpecial(wipe.fx)}
        <div aria-hidden="true" class="cv-wipe w-{wipe.fx}">
          {#each Array(10) as _, n (n)}<span style="--n:{n}"></span>{/each}
        </div>
      {:else}
        <div aria-hidden="true" class="cv-sheen s-{wipe.fx}"></div>
      {/if}
    {/key}
  {/if}

  <div aria-hidden="true" class="cv-curtain t-{chapter.transition}">
    {#each Array(curtainCount) as _, n (n)}<span style="--n:{n};--count:{curtainCount}"></span>{/each}
  </div>
</div>
