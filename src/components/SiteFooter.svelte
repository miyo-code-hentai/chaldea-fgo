<script lang="ts">
  import Emblem from './Emblem.svelte'
  import { reveal } from '@/lib/reveal'
</script>

<footer class="site-footer">
  <div class="footer-brand footer-reveal" use:reveal={0.15}>
    <a href="#/home" aria-label="Chaldea home">
      <Emblem size={46} />
      <span>
        <b>CHALDEA</b>
        <small>HUMAN ORDER SECURITY ORGANIZATION</small>
      </span>
    </a>
    <p>Preserving humanity’s history, observing every possibility, and protecting the future.</p>
  </div>
  <div class="footer-column footer-reveal" use:reveal={0.15}>
    <b>ABOUT CHALDEA</b>
    <a href="#/observatory">What is Chaldea?</a>
    <a href="https://typemoon.com/" rel="noreferrer" target="_blank">Type-Moon ↗</a>
    <a href="#/observatory">Who are the members?</a>
  </div>
  <div class="footer-column footer-reveal" use:reveal={0.15}>
    <b>OBSERVATORY</b>
    <a href="#/observatory">About Chaldea</a>
    <a href="#/lostbelts">Grand Order</a>
    <a href="#/contact">Contact</a>
  </div>
  <div class="footer-column footer-social footer-reveal" use:reveal={0.15}>
    <b>FOLLOW CHALDEA</b>
    <p>Receive observation records and organization updates.</p>
    <div>
      <a href="https://www.instagram.com/" rel="noreferrer" target="_blank">Instagram ↗</a>
      <a href="https://x.com/" rel="noreferrer" target="_blank">Twitter / X ↗</a>
      <a href="https://www.facebook.com/" rel="noreferrer" target="_blank">Facebook ↗</a>
    </div>
  </div>
  <div class="footer-legal footer-reveal" use:reveal={0.15}>
    <span>CHALDEA SECURITY ORGANIZATION / FAN ARCHIVE</span>
    <span>© {new Date().getFullYear()} OBSERVATION RECORD</span>
  </div>
</footer>
