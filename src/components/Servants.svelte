<script lang="ts">
  import { onMount } from 'svelte'
  import { classTemplates, type ClassTemplate } from '@/lib/chaldea'
  import { pages } from '@/lib/data'
  import { img } from '@/lib/lore'
  import ClassIntro from './ClassIntro.svelte'
  import ClassRoulette from './ClassRoulette.svelte'
  import Img from './Img.svelte'

  const page = pages.servants
  const total = classTemplates.length
  const steps = total - 1

  // The roulette shows the seven Knight/Cavalry classes plus two Extra cards (each rolls its whole group).
  const rouletteClasses: ClassTemplate[] = [
    ...classTemplates.slice(0, 7),
    { id: 'extra-1', name: 'Extra I', group: 'EXTRA I', copy: 'Ruler, Avenger and Moon Cancer servants.' },
    { id: 'extra-2', name: 'Extra II', group: 'EXTRA II', copy: 'Alter Ego, Foreigner, Pretender and Unbeast servants.' },
  ]

  // Per-class vertical nudge for the artwork, so the face sits inside the frame.
  const artShift: Record<string, string> = { lancer: '30vh', mooncancer: '30vh', unbeast: '30vh' }

  // The class whose intro film is open (fullscreen), or null. Opened from the roulette.
  let intro = $state<ClassTemplate | null>(null)

  let track = $state<HTMLElement | null>(null)
  // 0..1 across the tall scroll track: vertical scroll drives the horizontal rail.
  let progress = $state(0)
  const active = $derived(Math.min(total - 1, Math.round(progress * steps)))

  function measure() {
    if (!track) return
    const span = track.offsetHeight - window.innerHeight
    const scrolled = -track.getBoundingClientRect().top
    progress = span > 0 ? Math.min(1, Math.max(0, scrolled / span)) : 0
  }

  function jump(index: number) {
    if (!track) return
    const span = track.offsetHeight - window.innerHeight
    const top = track.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: top + (span * index) / steps, behavior: 'smooth' })
  }

  onMount(() => {
    measure()
    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
  })
</script>

<main class="sv-page">
  <header class="sv-intro sv-hero">
    <Img alt="" class="sv-hero-bg" src={img.servantsHero} />
    <div aria-hidden="true" class="sv-hero-veil"></div>
    <div class="sv-hero-copy">
      <div class="eyebrow"><i></i> {page.eyebrow}</div>
      <h1 class="sv-title">{page.title}</h1>
      <p>{page.copy}</p>
    </div>
  </header>

  <section class="sv-roll">
    <div class="eyebrow"><i></i> CLASS ROULETTE</div>
    <h2>Roll for a class.</h2>
    <ClassRoulette classes={rouletteClasses} onOpen={(cls) => (intro = cls)} />
  </section>

  <section class="sv-grand">
    <div class="eyebrow"><i></i> GRAND SERVANT</div>
    <h2>Beyond the classes.</h2>
    <div class="sv-grand-grid">
      <p>
        A Grand Servant is a Heroic Spirit whose power cannot be contained by a single class. Where an ordinary Servant
        is summoned into one of the fourteen classes, a Grand Servant carries the strength of several at once, and is
        the rare kind of hero that can change the outcome of an entire Singularity by itself.
      </p>
      <dl>
        <div><dt>Summoned by</dt><dd>Rare or unique Saint Quartz rolls and special events</dd></div>
        <div><dt>Class</dt><dd>Grand, a class of its own that carries stats from several classes</dd></div>
        <div><dt>Role</dt><dd>Decisive damage, wide support, or both at the same time</dd></div>
      </dl>
    </div>
  </section>
  <section class="sv-roll">
    <div class="eyebrow"><i></i> CLASS GALLERY</div>
    <h2>Fourteen classes.</h2>
  </section>

  <!-- Tall track: the sticky stage stays on screen while the page scrolls through it. -->
  <section class="sv-track" bind:this={track} style={`height: ${total * 100}vh`} aria-label="Servant classes">
    <div class="sv-stage">
      <div class="sv-rail" style={`transform: translate3d(${-progress * steps * 100}vw, 0, 0)`}>
        {#each classTemplates as cls, i (cls.id)}
          <article
            class="sv-panel"
            class:is-active={i === active}
            aria-hidden={i !== active}
            style={`--art-shift: -${artShift[cls.id] ?? '0px'}; --art-grow: ${artShift[cls.id] ?? '0px'}`}
          >
            <Img alt="" class="sv-bg" src={img.classArt(cls.id)} />
            <div class="sv-shade" aria-hidden="true"></div>
            <div class="sv-info">
              <small>{cls.group} / {String(i + 1).padStart(2, '0')} OF {String(total).padStart(2, '0')}</small>
              <h2>{cls.name}</h2>
              <p>{cls.copy}</p>
            </div>
          </article>
        {/each}
      </div>

      <nav class="sv-dots" aria-label="Jump to class">
        {#each classTemplates as cls, i (cls.id)}
          <button type="button" class:is-active={i === active} aria-label={cls.name} onclick={() => jump(i)}></button>
        {/each}
      </nav>
      <div class="sv-hint" aria-hidden="true">Scroll to browse</div>
    </div>
  </section>

  {#if intro}
    <ClassIntro cls={intro} onClose={() => (intro = null)} />
  {/if}

</main>

<style>
  .sv-page {
    position: relative;
    padding: 0 0 6rem;
  }

  /* Hero: the Grand Servant key art sits behind the title. */
  .sv-hero {
    position: relative;
    min-height: 88vh;
    max-width: none;
    margin: 0;
    padding: 0;
    overflow: hidden;
    display: flex;
    align-items: flex-end;
    color: #f4f1ea;
  }

  .sv-hero :global(.sv-hero-bg) {
    position: absolute;
    inset: 0;
  }

  .sv-hero :global(.sv-hero-bg img) {
    object-fit: cover;
    object-position: 50% 35%;
  }

  .sv-hero-veil {
    position: absolute;
    inset: 0;
    background: linear-gradient(0deg, rgba(4, 6, 10, 0.94) 0%, rgba(4, 6, 10, 0.35) 55%, rgba(4, 6, 10, 0.25) 100%);
  }

  .sv-hero-copy {
    position: relative;
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
    padding: 9rem 1rem 4rem;
    box-sizing: border-box;
  }

  .sv-hero .sv-title {
    color: #f4f1ea;
  }

  .sv-hero p {
    opacity: 0.85;
  }


  /* Same display font as the Grand Order page heading (.hx-title). */
  .sv-title {
    margin: 0 0 0.75rem;
    color: inherit;
    opacity: 1;
    font: 400 clamp(52px, 8vw, 118px) / 0.92 'Cormorant Garamond', serif;
  }

  .sv-intro p {
    max-width: 60ch;
    opacity: 0.8;
  }

  .sv-track {
    position: relative;
    margin-top: 2rem;
  }

  .sv-stage {
    position: sticky;
    top: 0;
    height: 100vh;
    overflow: hidden;
    background: #07090d;
    color: #f4f1ea;
  }

  .sv-rail {
    display: flex;
    height: 100%;
    width: max-content;
    will-change: transform;
  }

  .sv-panel {
    position: relative;
    flex: 0 0 100vw;
    height: 100%;
    overflow: hidden;
  }

  /* Img wraps the <img> in .img-slot, so the sizing and object-position go on the inner img. */
  .sv-panel :global(.sv-bg) {
    position: absolute;
    inset: 0;
    transform: scale(1.08);
    transition: transform 1.2s ease;
  }

  /* The image box grows by the same amount it is lifted, so no gap opens at the bottom. */
  .sv-panel :global(.sv-bg img) {
    object-fit: cover;
    object-position: 50% 0;
    height: calc(100% + var(--art-grow, 0px));
    transform: translateY(var(--art-shift, 0px));
  }

  .sv-panel.is-active :global(.sv-bg) {
    transform: scale(1);
  }

  .sv-shade {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(90deg, rgba(4, 6, 10, 0.92) 0%, rgba(4, 6, 10, 0.55) 45%, rgba(4, 6, 10, 0.1) 100%),
      linear-gradient(0deg, rgba(4, 6, 10, 0.85) 0%, transparent 45%);
  }

  .sv-info {
    position: absolute;
    left: 1rem;
    right: 1rem;
    bottom: 7rem;
    max-width: 520px;
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s;
  }

  .sv-panel.is-active .sv-info {
    opacity: 1;
    transform: none;
  }

  .sv-info small {
    letter-spacing: 0.16em;
    font-size: 0.72rem;
    opacity: 0.75;
  }

  .sv-info h2 {
    font: 400 clamp(44px, 9vw, 110px) / 0.92 'Cormorant Garamond', serif;
    margin: 0.4rem 0 0.8rem;
  }

  .sv-info p {
    opacity: 0.88;
    line-height: 1.6;
  }

  .sv-dots {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    z-index: 2;
  }

  .sv-dots button {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.6);
    background: transparent;
    padding: 0;
    cursor: pointer;
  }

  .sv-dots button.is-active {
    background: #f4f1ea;
  }

  .sv-hint {
    position: absolute;
    left: 1rem;
    bottom: 1.25rem;
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    opacity: 0.6;
    z-index: 2;
  }

  .sv-roll,
  .sv-grand {
    max-width: 1100px;
    margin: 0 auto;
    padding: 4rem 1rem 0;
  }

  .sv-roll + .sv-roll {
    padding-bottom: 2rem;
  }

  .sv-roll h2,
  .sv-grand h2 {
    font: 400 clamp(32px, 4.2vw, 58px) / 1.04 'Cormorant Garamond', serif;
    margin: 0 0 1.5rem;
  }

  .sv-grand-grid {
    display: grid;
    gap: 2rem;
    grid-template-columns: 1fr;
  }

  .sv-grand-grid p {
    line-height: 1.7;
    opacity: 0.88;
  }

  .sv-grand-grid dl {
    display: grid;
    gap: 0.75rem;
    margin: 0;
  }

  .sv-grand-grid dl div {
    border-top: 1px solid currentColor;
    padding-top: 0.5rem;
    opacity: 0.9;
  }

  .sv-grand-grid dt {
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    opacity: 0.65;
  }

  .sv-grand-grid dd {
    margin: 0.2rem 0 0;
  }

  @media (min-width: 900px) {
    .sv-info {
      bottom: 12vh;
      left: 4rem;
    }

    .sv-grand-grid {
      grid-template-columns: 1.2fr 1fr;
    }
  }

  @media (max-width: 640px) {
    .sv-dots {
      right: 0.5rem;
    }

    .sv-info {
      bottom: 6rem;
      right: 2.25rem;
    }
  }
</style>
