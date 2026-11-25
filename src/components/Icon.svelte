<script lang="ts" module>
  export type IconName =
    | 'chaldeas' | 'observe' | 'rayshift' | 'signal' | 'user' | 'sun' | 'moon' | 'sound-on' | 'sound-off'
    | 'arrow-right' | 'arrow-left' | 'arrow-up-right' | 'chevron-left' | 'chevron-right' | 'close'
    | 'map' | 'users' | 'shield' | 'book' | 'spark' | 'lock' | 'logout' | 'settings' | 'check' | 'plus'
    | 'flame' | 'shard' | 'planet' | 'balance' | 'image' | 'compass' | 'star' | 'mail' | 'key'
</script>

<script lang="ts">
  /**
   * Chaldea icon set: 24px grid, 1.25 hairline stroke, round joins, and one small cyan "observation
   * point" per icon. Minimal on purpose — they inherit `currentColor`.
   */
  let { name, size = 20, class: klass = '' }: { name: IconName; size?: number; class?: string } = $props()
</script>

<svg
  aria-hidden="true"
  class="icon {klass}"
  fill="none"
  height={size}
  viewBox="0 0 24 24"
  width={size}
>
  {#if name === 'chaldeas'}
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.6 2.4 3.8 5.2 3.8 8.5S14.6 18.1 12 20.5M12 3.5C9.4 5.9 8.2 8.7 8.2 12S9.4 18.1 12 20.5" />
    <circle class="dot" cx="18.2" cy="5.8" r="1.3" />
  {:else if name === 'observe'}
    <path d="M2.5 12s3.6-6 9.5-6 9.5 6 9.5 6-3.6 6-9.5 6-9.5-6-9.5-6Z" />
    <circle cx="12" cy="12" r="2.8" />
    <circle class="dot" cx="12" cy="12" r="0.9" />
  {:else if name === 'rayshift'}
    <ellipse cx="12" cy="12" rx="9.5" ry="4" transform="rotate(-28 12 12)" />
    <circle cx="12" cy="12" r="2.3" />
    <circle class="dot" cx="19.2" cy="8" r="1.3" />
  {:else if name === 'signal'}
    <rect height="13" rx="2" width="17" x="3.5" y="5.5" />
    <path d="m4.5 7.5 7.5 5.5 7.5-5.5" />
    <circle class="dot" cx="19.2" cy="5.5" r="1.3" />
  {:else if name === 'mail'}
    <rect height="13" rx="2" width="17" x="3.5" y="5.5" />
    <path d="m4.5 7.5 7.5 5.5 7.5-5.5" />
  {:else if name === 'user'}
    <circle cx="12" cy="8.5" r="3.5" />
    <path d="M5 19.5c1.2-3.6 4-5.2 7-5.2s5.8 1.6 7 5.2" />
  {:else if name === 'sun'}
    <circle cx="12" cy="12" r="3.6" />
    <path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M6 18l1.4-1.4M16.6 7.4 18 6" />
  {:else if name === 'moon'}
    <path d="M19.5 14.6A7.8 7.8 0 0 1 9.4 4.5a7.8 7.8 0 1 0 10.1 10.1Z" />
    <circle class="dot" cx="17.6" cy="6.4" r="1" />
  {:else if name === 'sound-on'}
    <path d="M4 9.5h3l4.5-3.5v12L7 14.5H4Z" />
    <path d="M15.2 9.3a3.8 3.8 0 0 1 0 5.4M17.9 6.8a7.5 7.5 0 0 1 0 10.4" />
  {:else if name === 'sound-off'}
    <path d="M4 9.5h3l4.5-3.5v12L7 14.5H4Z" />
    <path d="m15.5 9.5 5 5M20.5 9.5l-5 5" />
  {:else if name === 'arrow-right'}
    <path d="M4.5 12h15M13.5 6l6 6-6 6" />
  {:else if name === 'arrow-left'}
    <path d="M19.5 12h-15M10.5 6l-6 6 6 6" />
  {:else if name === 'arrow-up-right'}
    <path d="M7 17 17 7M9 7h8v8" />
  {:else if name === 'chevron-left'}
    <path d="m14.5 6-6 6 6 6" />
  {:else if name === 'chevron-right'}
    <path d="m9.5 6 6 6-6 6" />
  {:else if name === 'close'}
    <path d="M6 6l12 12M18 6 6 18" />
  {:else if name === 'map'}
    <path d="m9 4.5-5.5 2v13L9 17.5l6 2 5.5-2v-13l-5.5 2-6-2ZM9 4.5v13M15 6.5v13" />
  {:else if name === 'users'}
    <circle cx="9" cy="8.5" r="3" />
    <path d="M3.5 19c.7-3 3-4.6 5.5-4.6s4.8 1.6 5.5 4.6" />
    <circle cx="17" cy="9.5" r="2.3" />
    <path d="M16.2 14.5c2.4-.2 4.2 1.2 4.7 3.6" />
  {:else if name === 'shield'}
    <path d="M12 3.5 19 6v5.5c0 4.3-2.9 7.3-7 9-4.1-1.7-7-4.7-7-9V6Z" />
    <circle class="dot" cx="12" cy="11" r="1.2" />
  {:else if name === 'book'}
    <path d="M5 4.5h10.5a3 3 0 0 1 3 3v12H8a3 3 0 0 1-3-3Z" />
    <path d="M5 16.5a3 3 0 0 1 3-3h10.5M9 8h6" />
  {:else if name === 'spark'}
    <path d="M12 3.5c.6 4.6 3.9 7.9 8.5 8.5-4.6.6-7.9 3.9-8.5 8.5-.6-4.6-3.9-7.9-8.5-8.5 4.6-.6 7.9-3.9 8.5-8.5Z" />
  {:else if name === 'star'}
    <path d="m12 4 2.4 5 5.4.7-4 3.8 1 5.4L12 16.2 7.2 19l1-5.4-4-3.8 5.4-.7Z" />
  {:else if name === 'lock'}
    <rect height="9" rx="2" width="13" x="5.5" y="10.5" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    <circle class="dot" cx="12" cy="15" r="1" />
  {:else if name === 'key'}
    <circle cx="8" cy="12" r="3.5" />
    <path d="M11.5 12h9M17.5 12v3M20.5 12v2" />
  {:else if name === 'logout'}
    <path d="M9.5 4.5H6a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 6 19.5h3.5M15 8l4 4-4 4M19 12H9.5" />
  {:else if name === 'settings'}
    <path d="M4 8h8M17 8h3M4 16h3M12 16h8" />
    <circle cx="14.5" cy="8" r="2.2" />
    <circle cx="9.5" cy="16" r="2.2" />
  {:else if name === 'check'}
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  {:else if name === 'plus'}
    <path d="M12 5v14M5 12h14" />
  {:else if name === 'flame'}
    <path d="M12 3.5c.4 3.2-3.3 5-3.3 9a3.3 3.3 0 0 0 6.6 0c0-1.3-.5-2.3-1.1-3.1 3 1.2 4.8 3.8 4.8 6.6a7 7 0 0 1-14 0c0-5.6 5-7.3 7-12.5Z" />
    <circle class="dot" cx="12" cy="15.8" r="1" />
  {:else if name === 'shard'}
    <path d="m12 3.5 7 6.5-3 10.5H8L5 10Z" />
    <path d="M5 10h14M12 3.5 8 20.5M12 3.5l4 17" />
  {:else if name === 'planet'}
    <circle cx="12" cy="12" r="5" />
    <ellipse cx="12" cy="12" rx="10" ry="3.5" transform="rotate(-22 12 12)" />
    <circle class="dot" cx="19.4" cy="8.4" r="1.1" />
  {:else if name === 'balance'}
    <path d="M12 4v16M7 20h10M5 7.5h14" />
    <path d="m5 7.5-2.5 6a3 3 0 0 0 5 0Zm14 0-2.5 6a3 3 0 0 0 5 0Z" />
  {:else if name === 'image'}
    <rect height="14" rx="2" width="17" x="3.5" y="5" />
    <path d="m4 16 4.5-4.5 4 4 3-3L20 17" />
    <circle class="dot" cx="16" cy="9" r="1.1" />
  {:else if name === 'compass'}
    <circle cx="12" cy="12" r="8.5" />
    <path d="m15.5 8.5-2 5-5 2 2-5Z" />
  {/if}
</svg>

<style>
  .icon {
    flex: none;
    stroke: currentColor;
    stroke-width: 1.25;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .icon :global(.dot) {
    fill: var(--accent-bright, #18c6de);
    stroke: none;
  }
</style>
