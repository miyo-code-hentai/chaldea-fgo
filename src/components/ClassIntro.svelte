<script lang="ts">
  import { onMount } from 'svelte'
  import type { ClassTemplate } from '@/lib/chaldea'

  let { cls, onClose }: { cls: ClassTemplate; onClose: () => void } = $props()

  // Template: put the video at public/assets/videos/classes/<id>.mp4 and it plays here.
  // Until a file exists the screen shows the placeholder. The viewer can always skip.
  const src = $derived(`/assets/videos/classes/${cls.id}.mp4`)
  let missing = $state(false)

  onMount(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  })
</script>

<div class="ci-overlay" role="dialog" aria-modal="true" aria-label="{cls.name} intro">
  {#if !missing}
    <video autoplay class="ci-video" onended={onClose} onerror={() => (missing = true)} playsinline {src}></video>
  {:else}
    <div class="ci-placeholder">
      <small>{cls.group}</small>
      <h2>{cls.name}</h2>
      <p>Class intro video goes here.</p>
    </div>
  {/if}
  <div class="ci-bar">
    <span>{cls.group} / {cls.name}</span>
    <button onclick={onClose} type="button">Skip</button>
  </div>
</div>

<style>
  .ci-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #f4f1ea;
  }

  .ci-video {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: #000;
  }

  .ci-placeholder {
    text-align: center;
    padding: 2rem;
  }

  .ci-placeholder small {
    letter-spacing: 0.16em;
    font-size: 0.72rem;
    opacity: 0.7;
  }

  .ci-placeholder h2 {
    font: 400 clamp(52px, 8vw, 118px) / 0.92 'Cormorant Garamond', serif;
    margin: 0.4rem 0 0.8rem;
  }

  .ci-placeholder p {
    opacity: 0.7;
  }

  .ci-bar {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.7), transparent);
    font-size: 0.75rem;
    letter-spacing: 0.14em;
  }

  .ci-bar button {
    background: transparent;
    color: #f4f1ea;
    border: 1px solid rgba(255, 255, 255, 0.6);
    border-radius: 999px;
    padding: 0.45rem 1.1rem;
    cursor: pointer;
    font: inherit;
    letter-spacing: 0.14em;
  }
</style>
