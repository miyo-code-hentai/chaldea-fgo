<script lang="ts">
  import { chapters, img } from '@/lib/lore'
  import { reveal } from '@/lib/reveal'
  import Arrow from './Arrow.svelte'
  import Icon from './Icon.svelte'
  import Img from './Img.svelte'
  import Status from './Status.svelte'

  const telemetry = [
    ['08', 'Singularities'],
    ['05', 'Remnant records'],
    ['07', 'Lostbelts'],
    ['04', 'Ordeal Calls'],
  ]
  const overview = [
    ['01', 'About Chaldea', 'The organization, its personnel, servants, and observation systems.', 'observatory', 'observe'],
    ['02', 'Grand Order', 'Every chapter: Singularities, Lostbelts, and Ordeal Calls, with maps and characters.', 'lostbelts', 'rayshift'],
    ['03', 'Open Channel', 'Contact the fan archive and send a new observation record.', 'contact', 'signal'],
  ] as const
</script>

<div class="home-page">
  <Status />
  <main class="cd-hero hx-hero" id="home-observatory">
    <Img alt="" class="ed-hero-bg" src={img.homeBg} />
    <div aria-hidden="true" class="ed-hero-veil"></div>
    <div class="ed-hero-copy">
      <div class="eyebrow"><i></i> CHALDEA SECURITY ORGANIZATION</div>
      <h1 class="hx-title">Observe the Human Order.</h1>
      <p>
        When humanity’s future vanished, Chaldea set out to prove it could still be saved. Follow the
        Grand Order from Fuyuki to the Lostbelts.
      </p>
      <div class="hero-actions">
        <a class="solid-button" href="#/lostbelts">Enter Grand Order <Arrow light /></a>
        <a class="text-link" href="#/observatory">Meet the staff ↗</a>
      </div>
    </div>
    <a class="cd-scroll" href="#home-telemetry" aria-label="Scroll down">
      <Icon name="chevron-right" size={16} class="rot90" />
    </a>
  </main>
  <footer class="legend">
    <em>For the stories that keep humanity moving forward.</em>
    <a href="#/observatory">LEARN ABOUT CHALDEA ↗</a>
  </footer>
  <section class="home-telemetry" id="home-telemetry" aria-label="Grand Order archive coverage">
    {#each telemetry as [value, label] (label)}
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    {/each}
  </section>
  <section class="home-overview">
    <Img alt="" class="home-overview-bg" src={img.lostroom} />
    {#each overview as [number, title, copy, route, icon] (route)}
      <a class="reveal-on-scroll" href="#/{route}" use:reveal={0.18}>
        <small>{number} / OBSERVATION</small>
        <Icon name={icon} size={26} class="overview-icon" />
        <h2>{title}</h2>
        <p>{copy}</p>
        <Arrow />
      </a>
    {/each}
  </section>
  <section class="home-worlds">
    <div class="home-worlds-heading reveal-on-scroll" use:reveal={0.18}>
      <div class="eyebrow"><i></i> COMPLETE STORY OBSERVATION</div>
      <h2>
        Three chapters.
        <br />
        One Grand Order.
      </h2>
      <p>Each record has its own transition, music, map and cast. Ordeal Call waits inside Chapter II, after Nahui Mictlan.</p>
    </div>
    <div class="home-world-grid">
      {#each chapters as chapter (chapter.id)}
        <a class="home-world-card reveal-on-scroll" href="#/lostbelts" use:reveal={0.18}>
          <Img alt="{chapter.title} cover" class="home-world-img" src={img.chapterWorld(chapter.id)} />
          <span>
            <small>{chapter.label}</small>
            <strong>{chapter.title}</strong>
          </span>
        </a>
      {/each}
    </div>
  </section>
</div>
