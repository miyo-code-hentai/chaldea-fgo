<script lang="ts">
  import { onMount } from 'svelte'
  import { bgm } from '@/lib/audio.svelte'
  import LoadingScreen from './LoadingScreen.svelte'

  /**
   * Shown once per browser session on whatever page the visitor lands on. Browsers refuse to play
   * audio before a user gesture, so the tap on the intro is what unlocks the music for the visit.
   */
  let show = $state(false)
  let skipFilm = $state(false)

  onMount(() => {
    bgm.init()
    bgm.play('main')
    let entered = false
    try {
      entered = window.sessionStorage.getItem('chaldea-entered') === 'true'
    } catch {}
    if (entered) {
      document.documentElement.classList.remove('gate-pending')
      return
    }
    skipFilm = window.localStorage.getItem('chaldea-intro') === 'skip'
    show = true
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  })

  function unlock() {
    bgm.unlock()
    try {
      window.sessionStorage.setItem('chaldea-entered', 'true')
    } catch {}
    document.documentElement.classList.remove('gate-pending')
  }

  function done() {
    show = false
    document.body.style.overflow = ''
  }
</script>

{#if show}
  <LoadingScreen {skipFilm} onDone={done} onUnlock={unlock} />
{/if}
