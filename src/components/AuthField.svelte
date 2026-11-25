<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements'

  let { label, error, ...rest }: { label: string; error?: string } & HTMLInputAttributes = $props()
</script>

<label class="auth-field">
  <span>{label}</span>
  <input {...rest} aria-invalid={Boolean(error)} />
  {#if error}<em>{error}</em>{/if}
</label>
