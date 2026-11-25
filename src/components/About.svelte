<script lang="ts">
  import { chaldeas, facts, headquarters, history, staffGroups, systems } from '@/lib/chaldea'
  import { img } from '@/lib/lore'
  import { reveal } from '@/lib/reveal'
  import Arrow from './Arrow.svelte'
  import Img from './Img.svelte'

  let activeGroup = $state(staffGroups[0].id)
  let activeSlug = $state('')
  const group = $derived(staffGroups.find((g) => g.id === activeGroup) ?? staffGroups[0])
  const person = $derived(group.members.find((m) => m.slug === activeSlug) ?? group.members[0])

  function pickGroup(id: string) {
    activeGroup = id
    activeSlug = ''
  }

  const achievements = [
    ['01', 'Proved Rayshift theory', 'Converted human existence into spiritrons and established transfer into observed eras.'],
    ['02', 'Restored the Singularities', 'Worked with summoned Heroic Spirits to repair foundational distortions in human history.'],
    ['03', 'Confronted the Incineration', 'Carried the Grand Order to its conclusion at the Grand Temple of Time.'],
    ['04', 'Traversed the Lostbelts', 'Entered pruned histories after Proper Human History was bleached from the planet.'],
  ]
</script>

<main class="about-page">
  <section class="about-hero">
    <div class="about-hero-copy">
      <div class="eyebrow"><i></i> ORGANIZATION FILE / CHALDEA</div>
      <h1>Safeguarding the continuation of humanity.</h1>
      <p>
        Finis Chaldea combines magecraft, science, and future observation to identify extinction events and
        correct anomalies that threaten Proper Human History.
      </p>
      <div class="about-actions">
        <a class="solid-button" href="#/lostbelts">Open Grand Order <Arrow light /></a>
        <a class="text-link" href="#staff">Meet the staff ↗</a>
      </div>
    </div>
    <figure class="about-hero-visual">
      <Img alt="Chaldea facility" class="about-hero-img" src={img.aboutHero} />
    </figure>
  </section>

  <section class="ab-facts">
    {#each facts as [label, value, note] (label)}
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <span>{note}</span>
      </div>
    {/each}
  </section>

  <section class="ab-sec" id="history">
    <header class="ed-head">
      <div>
        <div class="ed-eyebrow"><i></i> HISTORY</div>
        <h2>From an observatory to the last light.</h2>
      </div>
      <div class="ed-note">
        <b>01</b>
        <p>Founded to prevent the certain extinction of humanity, Chaldea became an international, UN-sanctioned organization within a few years.</p>
      </div>
    </header>
    <ol class="ab-timeline">
      {#each history as [year, title, copy] (year)}
        <li class="ed-reveal" use:reveal={0.2}>
          <b>{year}</b>
          <h3>{title}</h3>
          <p>{copy}</p>
        </li>
      {/each}
    </ol>
  </section>

  <section class="ab-sec" id="headquarters">
    <header class="ed-head">
      <div>
        <div class="ed-eyebrow"><i></i> HEADQUARTERS</div>
        <h2>Where Chaldea has stood.</h2>
      </div>
      <div class="ed-note">
        <b>02</b>
        <p>The original base, its mobile successor, and the places connected to it.</p>
      </div>
    </header>
    <div class="ab-hq">
      {#each headquarters as place (place.slug)}
        <article class="ed-reveal" use:reveal={0.15}>
          <Img alt={place.name} class="ab-hq-img" src={img.facility(place.slug)} />
          <small>{place.place}</small>
          <h3>{place.name}</h3>
          <p>{place.copy}</p>
        </article>
      {/each}
    </div>
  </section>

  <section class="ab-sec" id="staff">
    <header class="ed-head">
      <div>
        <div class="ed-eyebrow"><i></i> PERSONNEL FILE</div>
        <h2>The people of Chaldea.</h2>
      </div>
      <div class="ed-note">
        <b>03</b>
        <p>Directors, Masters, Servants, operators and the staff of Seraphix. Pick a group, then a profile.</p>
      </div>
    </header>
    <div class="ab-tabs" role="tablist">
      {#each staffGroups as g (g.id)}
        <button aria-selected={g.id === activeGroup} onclick={() => pickGroup(g.id)} role="tab" type="button">
          {g.label} <em>{g.members.length}</em>
        </button>
      {/each}
    </div>
    <p class="ab-group-copy">{group.copy}</p>
    <div class="ab-staff">
      <article class="ab-featured" aria-live="polite">
        {#key `${group.id}-${person.slug}`}
          <Img alt={person.name} class="ab-featured-img" src={img.character(person.slug)} />
          <div class="ab-featured-copy">
            <small>{person.status}</small>
            <h3>{person.name}</h3>
            <b>{person.role}</b>
            {#if person.bio}<p>{person.bio}</p>{/if}
          </div>
        {/key}
      </article>
      <ul class="ab-roster">
        {#each group.members as member (member.slug)}
          <li>
            <button aria-pressed={member.slug === person.slug} onclick={() => (activeSlug = member.slug)} type="button">
              <Img alt={member.name} class="ab-roster-img" src={img.character(member.slug)} />
              <span>
                <strong>{member.name}</strong>
                <small>{member.role}</small>
              </span>
            </button>
          </li>
        {/each}
      </ul>
    </div>
  </section>

  <section class="ab-sec ab-systems" id="systems">
    <header class="ed-head">
      <div>
        <div class="ed-eyebrow"><i></i> TECHNICAL INFRASTRUCTURE</div>
        <h2>The systems behind the Grand Order.</h2>
      </div>
      <div class="ed-note">
        <b>04</b>
        <p>Magecraft, engineering, computation and observation in one network. The last system is the one everything else serves.</p>
      </div>
    </header>

    <div class="ab-sys-list">
      {#each systems as system, n (system.id)}
        <article class="ab-sys ed-reveal" id="system-{system.id}" use:reveal={0.15}>
          <div class="ab-sys-index">
            <b>{String(n + 1).padStart(2, '0')}</b>
            <small>{system.year}</small>
          </div>
          <div class="ab-sys-body">
            {#if system.id === 'seraphix'}
              <Img alt="Seraphix" class="ab-sys-img" src={img.system(system.id)} />
            {/if}
            <h3>{system.name}</h3>
            <em>{system.full}</em>
            <p>{system.copy}</p>

          </div>
        </article>
      {/each}
    </div>
  </section>

  <section class="ab-chaldeas" id="system-chaldeas">
    <Img alt="" class="ab-chaldeas-bg" src={img.chaldeasBg} />
    <div aria-hidden="true" class="ab-chaldeas-veil"></div>
    <div class="ab-chaldeas-copy ed-reveal" use:reveal={0.25}>
      <small>SYSTEM / {chaldeas.year} / THE FINAL SYSTEM</small>
      <h2>{chaldeas.name}</h2>
      <em>{chaldeas.full}</em>
      <p>{chaldeas.copy}</p>
    </div>
  </section>

  <section class="achievement-section">
    <div class="eyebrow"><i></i> OPERATIONAL RECORD</div>
    <h2>Chaldea’s defining achievements.</h2>
    <div>
      {#each achievements as [number, title, copy] (number)}
        <article>
          <small>{number}</small>
          <strong>{title}</strong>
          <p>{copy}</p>
        </article>
      {/each}
    </div>
  </section>
  <section class="about-enlist">
    <small>AUTHORIZED PERSONNEL NETWORK</small>
    <h2>Your observation record starts here.</h2>
    <p>Create a Chaldea personnel profile to keep your favourite Servants and track the records you have read.</p>
    <div>
      <a class="solid-button" href="/signup">Register as observer <Arrow light /></a>
      <a class="text-link" href="/login">Already registered? Sign in ↗</a>
    </div>
  </section>
</main>
