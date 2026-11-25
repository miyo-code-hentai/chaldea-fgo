<script lang="ts">
  import { bgm } from '@/lib/audio.svelte'
  import { chapters, img, sourceNote, type ChapterTheme } from '@/lib/lore'
  import ChapterViewer from './ChapterViewer.svelte'
  import Img from './Img.svelte'

  let active = $state<ChapterTheme | null>(null)
  let origin = $state({ x: 0, y: 0 })
  let opened = $state<string | null>(null)

  function openChapter(chapter: ChapterTheme, event: MouseEvent | KeyboardEvent) {
    const target = event.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    origin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    bgm.unlock()
    active = chapter
  }
</script>

<main class="go-page">
  <section class="go-hero ed-hero">
    <Img alt="" class="ed-hero-bg" src={img.grandOrderBg} />
    <div aria-hidden="true" class="ed-hero-veil"></div>
    <div class="ed-hero-copy">
      <div class="eyebrow"><i></i> CHALDEA ARCHIVE / OPERATIONAL RECORD</div>
      <h1>Grand Order</h1>
      <p>
        Chaldea’s highest-priority directive: observe the disappearance of humanity’s future, Rayshift into
        corrupted history, and prove that Proper Human History can continue. Three chapters. Each record
        opens with its own transition and music.
      </p>
    </div>
  </section>

  <section aria-label="Chapters" class="go-cols">
    {#each chapters as chapter, i (chapter.id)}
      <button
        aria-label="Open {chapter.label}: {chapter.title}"
        class="go-col go-col-{chapter.id}"
        class:is-light={chapter.light}
        class:is-open={opened === chapter.id}
        onblur={() => opened === chapter.id && (opened = null)}
        onclick={(e) => openChapter(chapter, e)}
        onfocus={() => (opened = chapter.id)}
        onmouseenter={() => (opened = chapter.id)}
        onmouseleave={() => (opened = null)}
        style="--col:{chapter.accent};--col-bg:{chapter.background};--font:{chapter.font}"
        type="button"
      >
        <Img alt="" class="go-col-img" src={img.chapterCover(chapter.id)} />
        <span aria-hidden="true" class="go-col-shade"></span>
        <span aria-hidden="true" class="go-col-num">{['1', '1.5', '2'][i] ?? String(i + 1)}</span>
        <span aria-hidden="true" class="go-col-vertical">{chapter.label}</span>
        <span class="go-col-body">
          <small>{chapter.label}</small>
          <strong>{chapter.title}</strong>
          <em>{chapter.tagline}</em>
          <span class="go-col-copy">{chapter.summary}</span>
          <span class="go-col-meta">
            <span>{chapter.records.length}{chapter.sub ? ` + ${chapter.sub.records.length}` : ''} records</span>
            <span class="go-col-cta">Open chapter →</span>
          </span>
        </span>
      </button>
    {/each}
  </section>

  <p class="go-note">{sourceNote}</p>
</main>

{#if active}
  <ChapterViewer chapter={active} {origin} onClose={() => (active = null)} />
{/if}
