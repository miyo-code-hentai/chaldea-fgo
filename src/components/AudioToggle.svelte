<script lang="ts">
  import { bgm } from '@/lib/audio.svelte'
  import Icon from './Icon.svelte'

  const noFile = $derived(bgm.current ? bgm.missing[bgm.current] : false)
</script>

<button
  aria-label={bgm.enabled ? 'Mute background music' : 'Play background music'}
  aria-pressed={bgm.enabled}
  class="icon-button audio-toggle"
  class:is-playing={bgm.enabled && !noFile}
  onclick={() => bgm.toggle()}
  title={noFile ? 'Music file not found yet — see ASSETS_GUIDE.md' : bgm.enabled ? 'Music on' : 'Music off'}
  type="button"
>
  <Icon name={bgm.enabled ? 'sound-on' : 'sound-off'} size={18} />
  <span aria-hidden="true" class="eq"><i></i><i></i><i></i></span>
</button>
