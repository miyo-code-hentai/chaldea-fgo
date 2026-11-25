<script lang="ts">
  import { onMount } from 'svelte'
  import { img } from '@/lib/lore'
  import Emblem from './Emblem.svelte'
  import Img from './Img.svelte'

  /**
   * First-visit intro. The film plays with its sound off, then the screen goes white and the Chaldea
   * emblem appears with "tap anywhere". The tap unlocks the music, the screen goes white again, the
   * home hero image fills the screen, and then it fades into the home page.
   */
  let { onUnlock, onDone, skipFilm = false }: { onUnlock: () => void; onDone: () => void; skipFilm?: boolean } = $props()

  const FILM = '/assets/loading/intro.mp4'
  type Stage = 'film' | 'white' | 'logo' | 'flash' | 'home' | 'fade'
  let stage = $state<Stage>(skipFilm ? 'logo' : 'film')
  const timers: number[] = []
  const later = (ms: number, fn: () => void) => {
    timers.push(window.setTimeout(fn, ms))
  }

  function filmDone() {
    if (stage !== 'film') return
    stage = 'white'
    later(1400, () => (stage = 'logo'))
  }

  // The film plays at 1.5x speed.
  function fast(event: Event) {
    const video = event.currentTarget as HTMLVideoElement
    video.defaultPlaybackRate = 1.5
    video.playbackRate = 1.5
  }

  function enter() {
    if (stage !== 'logo') return
    onUnlock() // runs inside the tap / key press, so the browser allows audio
    stage = 'flash'
    later(900, () => (stage = 'home'))
    later(900 + 2600, () => (stage = 'fade'))
    later(900 + 2600 + 1300, () => onDone())
  }

  onMount(() => {
    // Safety net: if the film never starts or stalls, go on to the logo.
    later(16000, filmDone)
    const onKey = () => enter()
    window.addEventListener('keydown', onKey)
    return () => {
      timers.forEach((t) => window.clearTimeout(t))
      window.removeEventListener('keydown', onKey)
    }
  })
</script>

<div
  aria-label="Chaldea intro"
  class="intro"
  class:is-fading={stage === 'fade'}
  onclick={enter}
  role="presentation"
>
  {#if stage === 'film'}
    <video
      autoplay
      class="intro-film"
      muted
      onended={filmDone}
      onerror={filmDone}
      onloadedmetadata={fast}
      onplay={fast}
      playsinline
      preload="auto"
      src={FILM}
    ></video>
  {/if}

  <div class="intro-logo" class:is-on={stage === 'logo'}>
    <Emblem animated size={120} />
    <div class="intro-word">
      <b>CHALDEA</b>
      <small>SECURITY ORGANIZATION</small>
    </div>
    <p class="intro-hint">Tap anywhere to enter</p>
  </div>

  <div class="intro-home" class:is-on={stage === 'home' || stage === 'fade'}>
    <Img alt="" class="intro-home-bg ed-hero-bg" src={img.homeBg} />
  </div>
</div>

<style>
  .intro {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: #fff;
    color: #0b1830;
    overflow: hidden;
    cursor: pointer;
    transition: opacity 1.3s ease;
  }

  .intro.is-fading {
    opacity: 0;
    pointer-events: none;
  }

  .intro-film {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    background: #000;
  }

  .intro-logo {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    opacity: 0;
    transition: opacity 0.9s ease;
  }

  .intro-logo.is-on {
    opacity: 1;
  }

  .intro-word {
    text-align: center;
  }

  .intro-word b {
    display: block;
    font: 700 clamp(22px, 3vw, 30px) / 1 'Orbitron', sans-serif;
    letter-spacing: 0.2em;
  }

  .intro-word small {
    font: 10px 'IBM Plex Mono', monospace;
    letter-spacing: 0.22em;
    opacity: 0.7;
  }

  .intro-hint {
    margin: 30px 0 0;
    font: 12px 'IBM Plex Mono', monospace;
    letter-spacing: 0.2em;
    animation: intro-blink 1.6s ease-in-out infinite;
  }

  @keyframes intro-blink {
    0%, 100% { opacity: 0.35; }
    50% { opacity: 1; }
  }

  .intro-home {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.9s ease;
  }

  .intro-home.is-on {
    opacity: 1;
  }

  /* Starts fullscreen and eases down to the home hero framing, then the overlay fades away. */
  .intro-home :global(.intro-home-bg) {
    position: absolute;
    inset: 0;
    transform: scale(1.14);
    transition: transform 2.6s cubic-bezier(0.2, 0.7, 0.2, 1);
  }

  .intro-home.is-on :global(.intro-home-bg) {
    transform: scale(1);
  }

  .intro-home :global(.intro-home-bg img) {
    object-fit: cover;
  }
</style>
