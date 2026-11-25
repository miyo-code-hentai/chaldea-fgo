<script lang="ts">
  import { onMount } from 'svelte'

  /** Per-chapter particle layer: embers rise, data streaks fall, snow drifts, motes orbit. */
  let { kind, color }: { kind: 'embers' | 'data' | 'snow' | 'motes'; color: string } = $props()
  let canvas = $state<HTMLCanvasElement | null>(null)

  onMount(() => {
    const cv = canvas!
    const ctx = cv.getContext('2d')!
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0, h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      w = cv.clientWidth
      h = cv.clientHeight
      cv.width = w * dpr
      cv.height = h * dpr
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(cv)

    const count = kind === 'snow' ? 90 : kind === 'data' ? 36 : 60
    const ps = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      s: 0.4 + Math.random() * 1.2,
      p: Math.random() * 6.28,
    }))

    let frame = 0
    const draw = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = color
      ctx.strokeStyle = color
      for (const p of ps) {
        if (kind === 'embers') {
          p.y -= 0.0007 * p.s
          p.x += Math.sin(now * 0.001 + p.p) * 0.0004
          if (p.y < -0.02) p.y = 1.02
          ctx.globalAlpha = 0.15 + 0.5 * Math.abs(Math.sin(now * 0.002 + p.p))
          ctx.beginPath()
          ctx.arc(p.x * w, p.y * h, p.s * 1.4, 0, 6.28)
          ctx.fill()
        } else if (kind === 'data') {
          p.y += 0.0026 * p.s
          if (p.y > 1.1) p.y = -0.1
          ctx.globalAlpha = 0.28
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(p.x * w, p.y * h)
          ctx.lineTo(p.x * w, p.y * h - 34 * p.s)
          ctx.stroke()
        } else if (kind === 'snow') {
          p.y += 0.0005 * p.s
          p.x += Math.sin(now * 0.0006 + p.p) * 0.0003
          if (p.y > 1.02) p.y = -0.02
          ctx.globalAlpha = 0.25 + 0.45 * p.s * 0.5
          ctx.beginPath()
          ctx.arc(p.x * w, p.y * h, p.s * 1.7, 0, 6.28)
          ctx.fill()
        } else {
          const a = now * 0.00012 * p.s + p.p
          const rx = 0.25 + (p.x * 0.3)
          const x = 0.5 + Math.cos(a) * rx
          const y = 0.5 + Math.sin(a) * rx * 0.55 + (p.y - 0.5) * 0.15
          ctx.globalAlpha = 0.2 + 0.4 * Math.abs(Math.sin(now * 0.0015 + p.p))
          ctx.beginPath()
          ctx.arc(x * w, y * h, p.s * 1.2, 0, 6.28)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1
      if (!reduce) frame = requestAnimationFrame(draw)
    }
    frame = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
    }
  })
</script>

<canvas aria-hidden="true" bind:this={canvas} class="atmosphere"></canvas>

<style>
  .atmosphere {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
</style>
