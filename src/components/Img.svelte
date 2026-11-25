<script lang="ts">
  import Icon from './Icon.svelte'

  /**
   * Image slot. Renders the real <img> straight away (no fade gate), so a file that exists always shows.
   * Only when the file is missing (load error) does it fall back to a quiet placeholder with the path.
   */
  let {
    src,
    alt = '',
    class: klass = '',
    hint = '',
    fit = 'cover',
  }: { src: string; alt?: string; class?: string; hint?: string; fit?: 'cover' | 'contain' } = $props()

  let failed = $state(false)

  // A new src gets a fresh chance to load.
  $effect(() => {
    src
    failed = false
  })
</script>

<div class="img-slot {klass}" class:is-missing={failed}>
  {#if !failed && src}
    <img {alt} decoding="async" loading="lazy" onerror={() => (failed = true)} style:object-fit={fit} {src} />
  {:else}
    <div aria-hidden="true" class="img-placeholder">
      <Icon name="image" size={22} />
      {#if hint || src.startsWith('/assets/')}<code>{hint || src.replace('/assets/', '')}</code>{/if}
    </div>
  {/if}
</div>

<style>
  /* :where() keeps this at zero specificity, so a caller's class (e.g. .ed-hero-bg, .go-col-img,
     .cv-banner) can set position: absolute and size the slot. Without it the slot stayed
     position: relative with zero height and the image never showed. */
  :where(.img-slot) {
    position: relative;
    overflow: hidden;
    background: color-mix(in srgb, var(--accent-bright, #18c6de) 7%, transparent);
  }
  img {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
  }
  .img-placeholder {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    color: color-mix(in srgb, currentColor 45%, transparent);
    background:
      repeating-linear-gradient(135deg, transparent 0 14px, color-mix(in srgb, currentColor 5%, transparent) 14px 15px),
      radial-gradient(circle at 50% 40%, color-mix(in srgb, var(--accent-bright, #18c6de) 12%, transparent), transparent 70%);
    pointer-events: none;
  }
  .img-placeholder code {
    max-width: 100%;
    overflow-wrap: anywhere;
    text-align: center;
    font: 9px/1.4 'IBM Plex Mono', monospace;
    letter-spacing: 0.04em;
  }
</style>
