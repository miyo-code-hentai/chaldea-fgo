<script lang="ts">
  import Arrow from './Arrow.svelte'
  import Icon from './Icon.svelte'
  import Status from './Status.svelte'

  let sent = $state(false)
  function submit(event: SubmitEvent) {
    event.preventDefault()
    sent = true
  }
</script>

<Status />
<main class="contact-page">
  <section>
    <div class="eyebrow"><i></i> COMMUNICATION / OPEN CHANNEL</div>
    <h1>Open a channel.</h1>
    <p>
      Send a transmission to the archive team. Corrections, new observations and fan records are all
      welcome.
    </p>
    {#if sent}
      <div class="contact-sent" role="status">
        <Icon name="check" size={22} />
        <div>
          <b>Transmission recorded.</b>
          <p>This form is UI-only for now, so nothing was sent yet.</p>
        </div>
      </div>
    {:else}
      <form class="contact-form" onsubmit={submit}>
        <label>Name <input autocomplete="name" placeholder="Ritsuka Fujimaru" required /></label>
        <label>Email <input autocomplete="email" placeholder="master@chaldea.org" required type="email" /></label>
        <label>Message <textarea placeholder="Your observation…" required rows="5"></textarea></label>
        <button class="solid-button" type="submit">Send transmission <Arrow light /></button>
      </form>
    {/if}
    <a class="back-link" href="#/home">← Return to the observatory</a>
  </section>
</main>
