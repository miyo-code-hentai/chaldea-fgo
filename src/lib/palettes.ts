/**
 * Every record has its own background colours. They show behind the banner photo, so each record still
 * looks distinct before its real banner file is dropped into public/assets/chapters/<dir>/banner.webp.
 * Keyed by record id (the same ids as lore.json).
 */
const PALETTES: Record<string, [string, string, string]> = {
  // Chapter I — Human Order Incineration (blue)
  fuyuki: ['#0b2a4a', '#1f5fa8', '#6fb8ff'],
  orleans: ['#0a2f57', '#2d7bc9', '#9fd3ff'],
  septem: ['#112a6b', '#3b4fd1', '#a5b4ff'],
  okeanos: ['#03324d', '#0e7fa6', '#7ff0ff'],
  london: ['#1a2a3f', '#46607f', '#c3d3e6'],
  'e-pluribus-unum': ['#0f1f4f', '#2b58b8', '#e2ecff'],
  camelot: ['#06213d', '#1d5c94', '#8fc1ff'],
  babylonia: ['#14305c', '#3a6fb0', '#d7b77a'],
  solomon: ['#050a1f', '#1a2f6b', '#4b6fd6'],
  // Chapter I.5 — Epic of Remnant (red)
  shinjuku: ['#3a0a12', '#b3263b', '#ff8a7a'],
  seraph: ['#2b0620', '#8e1f5a', '#ff6fb0'],
  agartha: ['#3d0d05', '#a33a12', '#ffb36b'],
  shimosa: ['#2a0b0b', '#7a1414', '#e05a4f'],
  salem: ['#1f0410', '#6e0f2b', '#ff4d6d'],
  // Chapter II — Cosmos in the Lostbelt (white)
  anastasia: ['#eef4fb', '#bcd3ea', '#6c93bf'],
  gotterdammerung: ['#f5f1ea', '#d9cbb0', '#8c7656'],
  sin: ['#f3eef8', '#cdbfe3', '#7a64a8'],
  yugakshetra: ['#fdf3e6', '#f0cfa5', '#c98a4a'],
  atlantis: ['#e9fbff', '#a9e6f5', '#3aa7c4'],
  olympus: ['#fffdf5', '#f5e7b2', '#c9a13a'],
  'heian-kyo': ['#fbf0f3', '#f0c6d3', '#b8607f'],
  'avalon-le-fae': ['#eefaf0', '#bfe6c9', '#5ea37a'],
  'traum': ['#f0f4f8', '#c9d4e6', '#5a6f96'],
  'nahui-mictlan': ['#f6f6ee', '#d8d8b0', '#7d7f3f'],
  // Ordeal Call (inside Chapter II, white)
  'paper-moon': ['#f7f7fb', '#d6d4ea', '#6d69a8'],
  id: ['#fbfbf7', '#e4e1cf', '#8b8660'],
  'archetype-inception': ['#f2f7fc', '#cfe0f1', '#4c7fae'],
  'trinity-metatronius': ['#faf5fb', '#e6cfe9', '#8c5aa0'],
  'lostbelt-0': ['#e8e8f2', '#b9b9d6', '#2b2b3d'],
  gate: ['#f1eefa', '#cfc6ec', '#5b4d9a'],
}

const FALLBACK: [string, string, string] = ['#101425', '#24305a', '#7a8fd0']

export function paletteFor(recordId: string): string {
  const [a, b, c] = PALETTES[recordId] ?? FALLBACK
  return [
    `radial-gradient(120% 90% at 80% 14%, ${c} 0, transparent 58%)`,
    `radial-gradient(90% 80% at 6% 100%, ${b} 0, transparent 62%)`,
    `linear-gradient(160deg, ${a} 0%, ${a} 35%, ${b} 100%)`,
  ].join(', ')
}
