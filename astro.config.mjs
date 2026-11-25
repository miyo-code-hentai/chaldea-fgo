import { defineConfig } from 'astro/config'
import svelte from '@astrojs/svelte'
import node from '@astrojs/node'
import tailwindcss from '@tailwindcss/vite'

// SSR is needed for /account and the /api/auth/* endpoints (httpOnly session cookie).
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [svelte()],
  vite: {
    plugins: [tailwindcss()],
  },
})
