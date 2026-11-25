import raw from './lore.json'

/**
 * Single source of truth for Grand Order chapters, staff, servant classes and image paths.
 * Every image the site expects is derived from this file (see ASSETS_GUIDE.md).
 */

export const ASSET_ROOT = '/assets'

export type CharacterRef = { slug: string; name: string; role: string; class: string; note: string }

/** Panel transition used while a record is on screen. Each record in a chapter gets a different one. */
export type PanelFx =
  | 'tide' // an accent band sweeps across, the banner settles
  | 'lift' // the banner rises out of soft focus, the title follows
  | 'eclipse' // the banner opens from a circle at the centre
  | 'bloom' // a slow fade through a bright veil
  | 'omega' // Solomon: the Ω dissolves into the name
  | 'zero' // Lostbelt No.0: the 0 collapses into the name
  | 'gate' // the Ordeal Call doorway after Nahui Mictlan

type RawRecord = {
  id: string
  number: string
  era: string
  location: string
  title: string
  summary: string
  characters: CharacterRef[]
}
export type GrandRecord = RawRecord & {
  /** "Singularity 3", "Pseudo-Singularity EX", "Lostbelt No.5", "Ordeal Call II" ... */
  tag: string
  fx: PanelFx
  /** Folder under /assets/chapters/ that holds banner.webp and map.webp */
  dir: string
  /** Music candidates, most specific first. A missing file falls through to the next one. */
  bgm: string[]
  /** Only set for the doorway panel. */
  gate?: boolean
}
export type TransitionKind = 'iris' | 'slice' | 'frost' | 'blinds'
export type ChapterTheme = {
  id: 'incineration' | 'remnant' | 'lostbelt' | 'ordeal'
  label: string
  title: string
  tagline: string
  summary: string
  icon: 'flame' | 'shard' | 'planet' | 'balance'
  accent: string
  font: string
  transition: TransitionKind
  /** Light chapters (Chapter II and Ordeal Call) use dark ink on a white background. */
  light: boolean
  atmosphere: 'embers' | 'data' | 'snow' | 'motes'
  bgm: string
  background: string
  records: GrandRecord[]
  /** Chapter II only: the Ordeal Call sub-tab that opens after Nahui Mictlan. */
  sub?: ChapterTheme
}

const themes: Omit<ChapterTheme, 'records' | 'sub'>[] = [
  {
    id: 'incineration',
    label: 'CHAPTER I',
    title: 'Observer on Timeless Temple',
    tagline: 'Human Order Incineration',
    summary: 'The first Grand Order: Fuyuki, seven Singularities, and the Grand Temple of Time where Solomon waits.',
    icon: 'flame',
    accent: '#4fa8ff',
    font: "'Cinzel', serif",
    transition: 'iris',
    light: false,
    atmosphere: 'embers',
    bgm: 'incineration',
    background: 'radial-gradient(circle at 70% 20%, #1c4f8c 0, transparent 55%), linear-gradient(160deg, #061a33, #03070f)',
  },
  {
    id: 'remnant',
    label: 'CHAPTER I.5',
    title: 'Epic of Remnant',
    tagline: 'Remnant Order',
    summary: 'Five pseudo-Singularities left behind after the Incineration, ending with the abyssal SE.RA.PH operation.',
    icon: 'shard',
    accent: '#ff5566',
    font: "'Marcellus', serif",
    transition: 'slice',
    light: false,
    atmosphere: 'data',
    bgm: 'remnant',
    background: 'radial-gradient(circle at 20% 80%, #6b0f1f 0, transparent 55%), linear-gradient(200deg, #1a0307, #070203)',
  },
  {
    id: 'lostbelt',
    label: 'CHAPTER II',
    title: 'Cosmos in the Lostbelt',
    tagline: 'Human Order Revision',
    summary: 'Seven pruned histories that survived the bleaching of the planet. After Nahui Mictlan, the Ordeal Call opens.',
    icon: 'planet',
    accent: '#1b2a4a',
    font: "'Cormorant Garamond', serif",
    transition: 'frost',
    light: true,
    atmosphere: 'motes',
    bgm: 'lostbelt',
    background: 'radial-gradient(circle at 50% 0%, #ffffff 0, transparent 60%), linear-gradient(180deg, #f4f7fc, #dfe8f5)',
  },
]

// Ordeal Call is not a chapter of its own: it is a sub-tab of Chapter II.
const ordealTheme: Omit<ChapterTheme, 'records' | 'sub'> = {
  id: 'ordeal',
  label: 'CHAPTER II / ORDEAL CALL',
  title: 'Ordeal Call',
  tagline: 'The trials that follow',
  summary: 'Four ordeals after Lostbelt No.7, each judging how Chaldea used its power. They end with a special chapter: Lostbelt No.0.',
  icon: 'balance',
  accent: '#2c3e66',
  font: "'Iceberg', sans-serif",
  transition: 'blinds',
  light: true,
  atmosphere: 'motes',
  bgm: 'ordeal',
  background: 'radial-gradient(circle at 80% 70%, #ffffff 0, transparent 55%), linear-gradient(150deg, #eef2f9, #d7e0ee)',
}

// Ten ordinary transitions. A chapter walks through them from its own starting point, so no two
// neighbouring records move the same way. Solomon and Lostbelt No.0 get their own (see below).
const FX: PanelFx[] = ['tide', 'lift', 'eclipse', 'bloom']
const FX_START: Record<ChapterTheme['id'], number> = { incineration: 0, remnant: 5, lostbelt: 0, ordeal: 6 }

function tagFor(chapter: ChapterTheme['id'], r: RawRecord): string {
  if (chapter === 'incineration') return r.id === 'solomon' ? 'Final Singularity' : `Singularity ${r.number}`
  if (chapter === 'remnant') return `Pseudo-Singularity ${r.number}`
  if (chapter === 'lostbelt') return `Lostbelt No.${r.number}`
  return r.id === 'lostbelt-0' ? 'Lostbelt No.0' : `Ordeal Call ${r.number}`
}

function decorate(theme: Omit<ChapterTheme, 'records' | 'sub'>, list: RawRecord[]): GrandRecord[] {
  let n = 0
  return list.map((r) => {
    const fx: PanelFx =
      r.id === 'solomon' ? 'omega' : r.id === 'lostbelt-0' ? 'zero' : FX[(FX_START[theme.id] + n++) % FX.length]
    return {
      ...r,
      tag: tagFor(theme.id, r),
      fx,
      dir: `${theme.id}/${r.id}`,
      bgm: [`${theme.id}/${r.id}`, theme.bgm],
    }
  })
}

const rawChapters = raw.chapters as { id: string; records: RawRecord[] }[]
const rawRecords = (id: string) => rawChapters.find((c) => c.id === id)?.records ?? []

const ordeal: ChapterTheme = { ...ordealTheme, records: decorate(ordealTheme, rawRecords('ordeal')) }

export const chapters: ChapterTheme[] = themes.map((theme) => ({
  ...theme,
  records: decorate(theme, rawRecords(theme.id)),
  sub: theme.id === 'lostbelt' ? ordeal : undefined,
}))

/** Every chapter-like block that has records (the profile page counts Ordeal Call separately). */
export const recordChapters: ChapterTheme[] = [...chapters, ordeal]

/** The doorway panel that appears after Nahui Mictlan in Chapter II. */
export const ordealGate: GrandRecord = {
  id: 'gate',
  number: '',
  era: 'After Lostbelt No.7',
  location: 'Ordeal Call',
  title: ordeal.tagline,
  summary: ordeal.summary,
  characters: [],
  tag: 'Sub-chapter',
  fx: 'gate',
  dir: 'ordeal/gate',
  bgm: ['ordeal/gate', 'ordeal'],
  gate: true,
}

export type StaffMember = { slug: string; name: string; role: string; status: string; bio: string }
export const staff = raw.staff as StaffMember[]

// ---- Image path helpers (the ONLY place paths are built) ----------------------------------
export const img = {
  character: (slug: string) => `${ASSET_ROOT}/characters/${slug}.webp`,
  chapterCover: (chapter: string) => `${ASSET_ROOT}/chapters/${chapter}/cover.webp`,
  chapterWorld: (chapter: string) => `${ASSET_ROOT}/chapters/${chapter}/world.webp`,
  banner: (dir: string) => `${ASSET_ROOT}/chapters/${dir}/banner.webp`,
  map: (dir: string) => `${ASSET_ROOT}/chapters/${dir}/map.webp`,
  hero: `${ASSET_ROOT}/hero/bleached-earth.webp`,
  homeBg: `${ASSET_ROOT}/hero/home-bg.webp`,
  grandOrderBg: `${ASSET_ROOT}/hero/grand-order-bg.webp`,
  servantsHero: `${ASSET_ROOT}/hero/servants-hero.webp`,
  aboutHero: `${ASSET_ROOT}/about/chaldea-facility.webp`,
  chaldeasBg: `${ASSET_ROOT}/about/chaldeas-bg.webp`,
  facility: (slug: string) => `${ASSET_ROOT}/about/${slug}.webp`,
  system: (id: string) => `${ASSET_ROOT}/about/systems/${id}.webp`,
  lostroom: `${ASSET_ROOT}/hero/lostroom.webp`,
  classArt: (cls: string) => `${ASSET_ROOT}/classes/art/${cls}.webp`,
  classEmblem: (cls: string) => `${ASSET_ROOT}/classes/${cls}.webp`,
}

// ---- Background music ------------------------------------------------------------------------
// Chapter tracks live at audio/bgm/<chapter>.mp3. Every record can also have its own track at
// audio/bgm/<chapter>/<record>.mp3 (see GrandRecord.bgm); when that file is missing the chapter
// track plays instead.
export const bgmTracks: Record<string, string> = {
  main: `${ASSET_ROOT}/audio/bgm/main.mp3`,
  profile: `${ASSET_ROOT}/audio/bgm/profile.mp3`,
  incineration: `${ASSET_ROOT}/audio/bgm/incineration.mp3`,
  remnant: `${ASSET_ROOT}/audio/bgm/remnant.mp3`,
  lostbelt: `${ASSET_ROOT}/audio/bgm/lostbelt.mp3`,
  ordeal: `${ASSET_ROOT}/audio/bgm/ordeal.mp3`,
}
export const bgmSrc = (key: string) => bgmTracks[key] ?? `${ASSET_ROOT}/audio/bgm/${key}.mp3`

// ---- Servant classes (About page) ------------------------------------------------------------
export type ServantClass = {
  id: string
  name: string
  group: 'Knight' | 'Extra'
  copy: string
  examples: { slug: string; name: string }[]
}

export const servantClasses: ServantClass[] = [
  {
    id: 'saber',
    name: 'Saber',
    group: 'Knight',
    copy: 'Swordsmen with balanced stats and strong resistance to magecraft. The archetypal front-line class.',
    examples: [
      { slug: 'artoria-pendragon', name: 'Artoria Pendragon' },
      { slug: 'nero-claudius', name: 'Nero Claudius' },
      { slug: 'mordred', name: 'Mordred' },
    ],
  },
  {
    id: 'archer',
    name: 'Archer',
    group: 'Knight',
    copy: 'Ranged specialists with Independent Action, able to operate long after their Master stops supplying mana.',
    examples: [
      { slug: 'emiya', name: 'EMIYA' },
      { slug: 'gilgamesh-archer', name: 'Gilgamesh' },
      { slug: 'orion', name: 'Orion' },
    ],
  },
  {
    id: 'lancer',
    name: 'Lancer',
    group: 'Knight',
    copy: 'Agile spear-wielders defined by speed and decisive close-range strikes.',
    examples: [
      { slug: 'cu-chulainn-lancer', name: 'Cú Chulainn' },
      { slug: 'scathach', name: 'Scáthach' },
      { slug: 'karna-lancer', name: 'Karna' },
    ],
  },
  {
    id: 'rider',
    name: 'Rider',
    group: 'Knight',
    copy: 'Heroes who command mounts, ships or vehicles, with high mobility and a wide range of Noble Phantasms.',
    examples: [
      { slug: 'alexander', name: 'Alexander' },
      { slug: 'medusa-rider', name: 'Medusa' },
      { slug: 'francis-drake', name: 'Francis Drake' },
    ],
  },
  {
    id: 'caster',
    name: 'Caster',
    group: 'Knight',
    copy: 'Practitioners of magecraft who build workshops, cast rituals and support the party conceptually.',
    examples: [
      { slug: 'merlin', name: 'Merlin' },
      { slug: 'medea', name: 'Medea' },
      { slug: 'tamamo-no-mae', name: 'Tamamo no Mae' },
    ],
  },
  {
    id: 'assassin',
    name: 'Assassin',
    group: 'Knight',
    copy: 'Stealth specialists with Presence Concealment, best at striking Masters and unprepared targets.',
    examples: [
      { slug: 'hassan-of-the-hundred-personas', name: 'Hassan of the Hundred Personas' },
      { slug: 'jack-the-ripper', name: 'Jack the Ripper' },
      { slug: 'mata-hari', name: 'Mata Hari' },
    ],
  },
  {
    id: 'berserker',
    name: 'Berserker',
    group: 'Knight',
    copy: 'Heroes enhanced by madness: enormous raw power, at the price of reason and control.',
    examples: [
      { slug: 'heracles', name: 'Heracles' },
      { slug: 'lancelot-berserker', name: 'Lancelot' },
      { slug: 'spartacus', name: 'Spartacus' },
    ],
  },
  {
    id: 'ruler',
    name: 'Ruler',
    group: 'Extra',
    copy: 'Arbiters summoned to oversee a Holy Grail War, normally given authority over other Servants.',
    examples: [{ slug: 'jeanne-d-arc', name: 'Jeanne d’Arc' }],
  },
  {
    id: 'avenger',
    name: 'Avenger',
    group: 'Extra',
    copy: 'Spirits of vengeance, shaped by the grudges and hatred of those who suffered.',
    examples: [{ slug: 'jeanne-d-arc-alter', name: 'Jeanne d’Arc (Alter)' }],
  },
  {
    id: 'shielder',
    name: 'Shielder',
    group: 'Extra',
    copy: 'A defensive class. Mash Kyrielight is Chaldea’s Demi-Servant Shielder.',
    examples: [{ slug: 'mash-kyrielight', name: 'Mash Kyrielight' }],
  },
  {
    id: 'moon-cancer',
    name: 'Moon Cancer',
    group: 'Extra',
    copy: 'A rare Extra class tied to the Moon and its Holy Grail War.',
    examples: [{ slug: 'bb-dubai', name: 'BB' }],
  },
  {
    id: 'foreigner',
    name: 'Foreigner',
    group: 'Extra',
    copy: 'Entities from outside the world, whose nature is hard to define in human terms.',
    examples: [{ slug: 'abigail-williams', name: 'Abigail Williams' }],
  },
]

// ---- Chaldea systems (facts from the TYPE-MOON wiki) --------------------------------------------
export const systems = [
  { year: '1990', name: 'CHALDEAS', copy: 'A planetary model of Earth built as a miniature celestial body to observe the continuity of human history.' },
  { year: '1999', name: 'SHEBA', copy: 'An observation lens used to look at CHALDEAS and detect anomalies in the Common Era.' },
  { year: '2004', name: 'FATE', copy: 'The Guardian Heroic Spirit Summoning System, which brings Servants to Chaldea and supports them with its energy.' },
  { year: '1950', name: 'LAPLACE', copy: 'Monitors the past and collects history that was quietly buried, and helps safeguard Masters during Rayshift.' },
  { year: '2015', name: 'TRISMEGISTUS', copy: 'Oversees Rayshift and analyzes observations; a copy of the Atlas Academy’s TRI-HERMES.' },
  { year: '—', name: 'RAYSHIFT', copy: 'Spiritron transference that sends a Master into the past, stabilized by Klein Coffins.' },
]

export const sourceNote = 'Lore summarized from the TYPE-MOON Wiki and the official Fate/Grand Order USA site. Spoilers ahead.'
