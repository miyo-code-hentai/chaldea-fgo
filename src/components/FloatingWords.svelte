<script lang="ts">
  import { onMount } from 'svelte'

  const WORDS = ['stars', 'cosmos', 'gods', 'animus', 'antrum', 'unbirth', 'anima', 'animusphere']
  type Item = { word: string; left: number; size: number; dur: number; delay: number; drift: number; alpha: number }
  let items = $state<Item[]>([])

  onMount(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rnd = (a: number, b: number) => a + Math.random() * (b - a)
    items = Array.from({ length: 32 }, (_, i) => ({
      word: WORDS[i % WORDS.length],
      left: rnd(0, 100),
      size: rnd(12, 32),
      dur: rnd(28, 60),
      delay: -rnd(0, 60), // negative delay: they are already mid-flight when the page opens
      drift: rnd(-70, 70),
      alpha: rnd(0.12, 0.3),
    }))
  })
</script>

<div aria-hidden="true" class="floating-words">
  {#each items as it, i (i)}
    <span
      style="left:{it.left}%; font-size:{it.size}px; animation-duration:{it.dur}s; animation-delay:{it.delay}s; --drift:{it.drift}px; --alpha:{it.alpha}"
      >{it.word}</span
    >
  {/each}
</div>

<style>
  .floating-words {
    position: fixed;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    overflow: hidden;
  }

  .floating-words span {
    position: absolute;
    bottom: -10vh;
    white-space: nowrap;
    font-family: 'Cormorant Garamond', serif;
    font-style: italic;
    letter-spacing: 0.12em;
    color: #18c6de;
    opacity: 0;
    animation-name: float-word;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }

  @keyframes float-word {
    0% { transform: translate3d(0, 0, 0); opacity: 0; }
    12% { opacity: var(--alpha); }
    88% { opacity: var(--alpha); }
    100% { transform: translate3d(var(--drift), -115vh, 0); opacity: 0; }
  }
</style>
