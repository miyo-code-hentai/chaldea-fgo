/** Servant classes. Shared by the admin form, the API validation and the Servants page roulette. */
export const KNIGHT_CLASSES = ['Saber', 'Archer', 'Lancer', 'Rider', 'Caster', 'Assassin', 'Berserker'] as const

// The Extra classes, grouped the way the Servants page shows them.
export const EXTRA_I = ['Ruler', 'Avenger', 'Moon Cancer'] as const
export const EXTRA_II = ['Alter Ego', 'Foreigner', 'Pretender', 'Unbeast'] as const

export const ALL_CLASSES: string[] = [...KNIGHT_CLASSES, ...EXTRA_I, ...EXTRA_II]

/** Class card id (the file name under /assets/classes) -> the servant classes it stands for. */
export const CLASS_GROUPS: Record<string, string[]> = {
  ...Object.fromEntries(ALL_CLASSES.map((name) => [name.toLowerCase().replace(/\s+/g, ''), [name]])),
  // The roulette's Extra cards stand for a whole group each.
  'extra-1': [...EXTRA_I],
  'extra-2': [...EXTRA_II],
}
