<script lang="ts">
  import { onMount } from 'svelte'
  import { bgm } from '@/lib/audio.svelte'
  import { display, NAV_POSITIONS, type NavPos } from '@/lib/display.svelte'
  import { animateTheme } from '@/lib/theme-transition'

  type ThemeMode = 'light' | 'dark' | 'system'
  const THEMES: { id: ThemeMode; label: string }[] = [
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
    { id: 'system', label: 'System' },
  ]

  let themeMode = $state<ThemeMode>('system')

  function readTheme(): ThemeMode {
    try {
      const saved = window.localStorage.getItem('chaldea-theme')
      return saved === 'dark' || saved === 'light' ? saved : 'system'
    } catch {
      return 'system'
    }
  }

  // Same storage key and class as the navbar toggle, so both stay in sync.
  function setTheme(mode: ThemeMode) {
    if (mode === themeMode) return
    themeMode = mode
    const dark = mode === 'system' ? window.matchMedia('(prefers-color-scheme: dark)').matches : mode === 'dark'
    animateTheme(() => {
      try {
        if (mode === 'system') window.localStorage.removeItem('chaldea-theme')
        else window.localStorage.setItem('chaldea-theme', mode)
      } catch {}
      document.documentElement.classList.toggle('dark', dark)
    })
  }

  function chooseNav(pos: NavPos) {
    display.setNav(pos)
  }

  function onVolume(event: Event) {
    bgm.setVolume(Number((event.currentTarget as HTMLInputElement).value) / 100)
  }

  onMount(() => {
    display.init()
    bgm.init()
    themeMode = readTheme()
  })
</script>

<div class="app-shell set-page">
  <header class="set-top">
    <a class="set-back" href="/#/home">← Back to Chaldea</a>
    <span class="set-eyebrow">CHALDEA ARCHIVE / SETTINGS</span>
  </header>

  <main class="set-main">
    <h1>Settings</h1>
    <p class="set-lead">Saved on this device. Changes apply straight away across the Chaldea site.</p>

    <section aria-labelledby="set-theme" class="set-card">
      <h2 id="set-theme">Appearance</h2>
      <p class="set-muted">Light, dark, or follow your system.</p>
      <div class="set-seg" role="radiogroup" aria-label="Theme">
        {#each THEMES as t (t.id)}
          <button aria-checked={themeMode === t.id} class:is-on={themeMode === t.id} onclick={() => setTheme(t.id)} role="radio" type="button">{t.label}</button>
        {/each}
      </div>
    </section>

    <section aria-labelledby="set-nav" class="set-card">
      <h2 id="set-nav">Floating navbar position</h2>
      <p class="set-muted">On phones the navbar always sits at the bottom.</p>
      <div class="set-seg" role="radiogroup" aria-label="Navbar position">
        {#each NAV_POSITIONS as p (p.id)}
          <button aria-checked={display.navPos === p.id} class:is-on={display.navPos === p.id} onclick={() => chooseNav(p.id)} role="radio" type="button">
            <span class="set-mini set-mini-{p.id}" aria-hidden="true"><i></i></span>
            {p.label}
          </button>
        {/each}
      </div>
    </section>

    <section aria-labelledby="set-intro" class="set-card">
      <h2 id="set-intro">Intro</h2>
      <div class="set-row">
        <div>
          <strong>Intro film</strong>
          <p class="set-muted">
            {display.introFilm ? 'The intro film plays before the Chaldea logo.' : 'Skip the film and go straight to "Tap anywhere to enter".'}
          </p>
        </div>
        <button
          aria-checked={display.introFilm}
          aria-label="Intro film"
          class="set-switch"
          class:is-on={display.introFilm}
          onclick={() => display.setIntroFilm(!display.introFilm)}
          role="switch"
          type="button"
        ><span></span></button>
      </div>
    </section>

    <section aria-labelledby="set-audio" class="set-card">
      <h2 id="set-audio">Music</h2>
      <div class="set-row">
        <div>
          <strong>Background music</strong>
          <p class="set-muted">Plays on the Grand Order pages and the Personnel page.</p>
        </div>
        <button
          aria-checked={bgm.enabled}
          aria-label="Background music"
          class="set-switch"
          class:is-on={bgm.enabled}
          onclick={() => bgm.setEnabled(!bgm.enabled)}
          role="switch"
          type="button"
        ><span></span></button>
      </div>
      <div class="set-row">
        <label for="set-volume"><strong>Volume</strong> <span class="set-muted">{Math.round(bgm.volume * 100)}%</span></label>
        <input
          id="set-volume"
          class="set-range"
          disabled={!bgm.enabled}
          max="100"
          min="0"
          oninput={onVolume}
          step="1"
          type="range"
          value={Math.round(bgm.volume * 100)}
        />
      </div>
    </section>
  </main>
</div>
