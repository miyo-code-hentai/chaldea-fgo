<script lang="ts">
  import type { AuthActionState } from '@/lib/auth'
  import AuthField from './AuthField.svelte'
  import Icon from './Icon.svelte'

  let { mode }: { mode: 'login' | 'signup' } = $props()

  let result = $state<AuthActionState>({ ok: false, message: '' })
  let pending = $state(false)

  function clientValidate(fd: FormData) {
    const errors: NonNullable<AuthActionState['fieldErrors']> = {}
    const email = String(fd.get('email') ?? '').trim()
    const password = String(fd.get('password') ?? '')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.'
    if (password.length < 8) errors.password = 'Password must be at least 8 characters.'
    if (mode === 'signup' && String(fd.get('name') ?? '').trim().length < 2) errors.name = 'Name must be at least 2 characters.'
    return errors
  }

  async function submit(event: SubmitEvent) {
    event.preventDefault()
    if (pending) return
    const form = event.currentTarget as HTMLFormElement
    const fd = new FormData(form)
    const fieldErrors = clientValidate(fd)
    if (Object.keys(fieldErrors).length) {
      result = { ok: false, message: 'Check the highlighted fields.', fieldErrors }
      return
    }
    pending = true
    try {
      const res = await fetch(mode === 'login' ? '/api/auth/login' : '/api/auth/signup', {
        method: 'POST',
        body: fd,
        credentials: 'same-origin',
      })
      let data: AuthActionState | null = null
      try {
        data = (await res.json()) as AuthActionState
      } catch {}
      if (!res.ok || !data?.ok) {
        result = data ?? { ok: false, message: `Something went wrong (${res.status}). Try again.` }
        return
      }
      result = data
      const next = new URLSearchParams(window.location.search).get('next')
      window.setTimeout(() => window.location.assign(next && next.startsWith('/') && !next.startsWith('//') ? next : '/account'), 450)
    } catch {
      result = { ok: false, message: 'Could not reach the server. Check your connection and try again.' }
    } finally {
      pending = false
    }
  }
</script>

<form class="auth-form" novalidate onsubmit={submit}>
  {#if mode === 'signup'}
    <AuthField autocomplete="name" error={result.fieldErrors?.name} label="Full name" name="name" placeholder="Ritsuka Fujimaru" />
    <AuthField autocomplete="nickname" error={result.fieldErrors?.callSign} label="Call sign (optional)" name="callSign" placeholder="MASTER-48" />
    <label class="auth-field">
      <span>Observation zone</span>
      <select name="region" value="antarctica">
        <option value="antarctica">Antarctica Command</option>
        <option value="asia-pacific">Asia-Pacific</option>
        <option value="europe">Europe</option>
        <option value="north-america">North America</option>
        <option value="south-america">South America</option>
        <option value="other">Other Observation Zone</option>
      </select>
    </label>
  {/if}
  <AuthField autocomplete="email" error={result.fieldErrors?.email} label="Email address" name="email" placeholder="master@chaldea.org" type="email" />
  <AuthField
    autocomplete={mode === 'login' ? 'current-password' : 'new-password'}
    error={result.fieldErrors?.password}
    label="Password"
    name="password"
    placeholder="Minimum 8 characters"
    type="password"
  />
  {#if result.message}
    <p aria-live="polite" class="auth-message {result.ok ? 'is-ok' : 'is-error'}">
      <Icon name={result.ok ? 'check' : 'lock'} size={16} />
      {result.message}
    </p>
  {/if}
  <button class="auth-submit" disabled={pending} type="submit">
    {pending ? 'Establishing link…' : mode === 'login' ? 'Enter personnel archive' : 'Create personnel record'}
    <Icon name="arrow-right" size={16} />
  </button>
</form>
