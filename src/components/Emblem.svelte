<script lang="ts">
  /**
   * The Chaldea Security Organization mark (public/assets/logo/chaldea-emblem.png).
   * It is used as a mask, so it takes the current text colour and works on light and dark pages.
   */
  let { size = 40, animated = false }: { size?: number; animated?: boolean } = $props()
</script>

<span aria-hidden="true" class="emblem" class:is-animated={animated} style="--emblem-size:{size}px"></span>

<style>
  .emblem {
    flex: none;
    display: block;
    width: calc(var(--emblem-size) * 0.86);
    height: var(--emblem-size);
    background: currentColor;
    -webkit-mask: url('/assets/logo/chaldea-emblem.png') center / contain no-repeat;
    mask: url('/assets/logo/chaldea-emblem.png') center / contain no-repeat;
  }
  .is-animated {
    animation: emblem-breathe 4.2s ease-in-out infinite;
  }
  @keyframes emblem-breathe {
    50% {
      opacity: 0.78;
      transform: scale(1.04);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .is-animated {
      animation: none;
    }
  }
</style>
