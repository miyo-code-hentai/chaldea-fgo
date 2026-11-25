export const assets = '/assets'

export type Page =
  | 'home'
  | 'lostbelts'
  | 'archive'
  | 'journal'
  | 'contact'
  | 'signin'
  | 'account'
  | 'observatory'
  | 'servants'
  | 'forum'

export const pages: Record<Exclude<Page, 'home'>, { eyebrow: string; title: string; copy: string }> = {
  lostbelts: {
    eyebrow: 'DIVERGENT HISTORIES / 01–07',
    title: 'History',
    copy: 'Explore seven pruned histories—worlds that grew apart from the proper human order.',
  },
  archive: {
    eyebrow: 'RECORDS / HUMAN ORDER',
    title: 'Lore',
    copy: 'Recovered observations, personnel records, and field notes from Chaldea’s long journey.',
  },
  journal: {
    eyebrow: 'FIELD NOTES / LATEST',
    title: 'Observation Journal',
    copy: 'Essays and dispatches documenting the people, places, and ideas that shaped our future.',
  },
  contact: {
    eyebrow: 'COMMUNICATION / OPEN CHANNEL',
    title: 'Email to Us.',
    copy: 'Send a transmission to the archive team. We welcome corrections, notes, and new observations.',
  },
  signin: {
    eyebrow: 'AUTHORIZED PERSONNEL',
    title: 'Sign in',
    copy: 'Access your saved records and continue your observation.',
  },
  account: {
    eyebrow: 'PERSONNEL REGISTRATION',
    title: 'Create an account',
    copy: 'Join the observatory and build your own collection of records.',
  },
  forum: {
    eyebrow: 'COMMUNITY / FORUM',
    title: 'Forum',
    copy: 'Start a topic, reply and vote. The Chaldea community in one place.',
  },
  servants: {
    eyebrow: 'SERVANT RECORDS / 14 CLASSES',
    title: 'Servants',
    copy: 'Scroll through the fourteen classes of Heroic Spirit, then roll for one.',
  },
  observatory: {
    eyebrow: 'FACILITY / CHALDEAS',
    title: 'Inside the observatory',
    copy: 'Discover the instruments, systems, and people working to preserve humanity’s story.',
  },
}

export const lostbelts = [
  {
    key: 'russia',
    number: '01',
    region: 'Russia / A.D. 1570',
    title: 'The Grand Duchess of the Beast Nation',
    subtitle: 'Permafrost Empire, Anastasia',
    copy: 'A frozen world where survival demanded that humanity abandon its former shape.',
    credit: 'Philip Myrtorp',
  },
  {
    key: 'scandinavia',
    number: '02',
    region: 'Scandinavia / B.C. 1000',
    title: 'The Good Fellow of Everlasting Flame',
    subtitle: 'Götterdämmerung',
    copy: 'A gentle prison beneath a false sun, preserved in the shadow of the final giants.',
    credit: 'Johny Goerend',
  },
  {
    key: 'china',
    number: '03',
    region: 'China / B.C. 0210',
    title: 'The Crimson Beauty under the Moon',
    subtitle: 'S I N',
    copy: 'A perfectly ordered empire where peace endured at the cost of human possibility.',
    credit: 'zhang kaiyv',
  },
  {
    key: 'india',
    number: '04',
    region: 'India / ????.??',
    title: 'The Final Dark God',
    subtitle: 'Yuga Kshetra',
    copy: 'A universe repeatedly destroyed and remade by a god seeking an immaculate world.',
    credit: 'SIBY',
  },
  {
    key: 'atlantis',
    number: '05',
    region: 'Atlantic Ocean / B.C. 12000',
    title: 'The Day to Bring Down Gods',
    subtitle: 'Atlantis & Olympus',
    copy: 'The gods never fell, and their impossible civilization continued beyond humanity.',
    credit: 'Max Brown',
  },
  {
    key: 'britain',
    number: '06',
    region: 'Britain / A.D. 0500',
    title: 'The Moment a Planet Is Born',
    subtitle: 'Avalon le Fae',
    copy: 'A brilliant and cruel fairy kingdom built upon a history that should never have existed.',
    credit: 'Inggrid Koe',
  },
  {
    key: 'mictlan',
    number: '07',
    region: 'South America / B.C. ???',
    title: 'Those Who Rule the Planet',
    subtitle: 'Nahui Mictlan',
    copy: 'A subterranean world beneath an artificial sun, approaching the final day of the planet.',
    credit: 'Mauro Lima',
  },
]

export const singularities = [
  ['X', 'A.D. 2004', 'Flame-Contaminated City', 'Fuyuki'],
  ['I', 'A.D. 1431', 'Hundred Years’ War of the Evil Dragons', 'Orleans'],
  ['II', 'A.D. 0060', 'Eternal Madness Empire', 'Septem'],
  ['III', 'A.D. 1573', 'Sealed Ends of the Four Seas', 'Okeanos'],
  ['IV', 'A.D. 1888', 'Death World in the City of Demonic Fog', 'London'],
  ['V', 'A.D. 1783', 'North American Myth War', 'E Pluribus Unum'],
  ['VI', 'A.D. 1273', 'Divine Realm of the Round Table', 'Camelot'],
  ['VII', 'B.C. 2655', 'Absolute Demonic Front', 'Babylonia'],
]

export const pseudoSingularities = [
  ['I', 'A.D. 1999', 'Quarantined Territory of Malice', 'Shinjuku'],
  ['EX', 'A.D. 2030', 'Abyssal Cyber Paradise', 'SE.RA.PH'],
  ['II', 'A.D. 2000', 'Subterranean World of Folklore', 'Agartha'],
  ['III', 'A.D. 1639', 'Seven Duels of Swordmasters', 'Shimosa'],
  ['IV', 'A.D. 1692', 'The Forbidden Advent Garden', 'Salem'],
]

export const revisionRecords = [
  ...lostbelts.slice(0, 4),
  {
    ...lostbelts[4],
    number: '05.1',
    subtitle: 'Atlantis',
    title: 'Ancient Ocean of the Dreadnought Gods',
  },
  { ...lostbelts[4], number: '05.2', subtitle: 'Olympus', title: 'Interstellar Mountainous City' },
  {
    key: 'india',
    number: '05.5',
    region: 'Japan / A.D. 1008',
    subtitle: 'Heian-kyo',
    title: 'Naraka Mandala — Thunderous Flash',
    copy: '',
    credit: 'SIBY',
  },
  lostbelts[5],
  {
    key: 'china',
    number: '06.5',
    region: 'Europe / A.D. 2017',
    subtitle: 'Traum',
    title: 'Realm of the Thanatos Impulse',
    copy: '',
    credit: 'zhang kaiyv',
  },
  lostbelts[6],
]

export const ordealArchive = [
  {
    image: 'ordeal-paper-moon.webp',
    number: 'I',
    order: 'ALTER EGO',
    location: 'Paper Moon',
    title: 'Imaginary Compass Inner World',
  },
  {
    image: 'ordeal-id.webp',
    number: 'II',
    order: 'AVENGER',
    location: 'Id',
    title: 'Irreversible Waste Hole',
  },
  {
    image: 'ordeal-archetype.webp',
    number: 'III',
    order: 'MOON CANCER',
    location: 'Archetype Inception',
    title: 'New Primordial Prosperous City',
  },
  {
    image: 'ordeal-trinity.webp',
    number: 'IV',
    order: 'RULER',
    location: 'Trinity Metatronius',
    title: 'Final Arbitration Domain',
  },
  {
    image: 'ordeal-zero.webp',
    number: '0',
    order: 'LOSTBELT',
    location: 'Grand Order',
    title: 'Lostbelt No.0',
  },
]

export const officialFgoSource = 'https://fate-go.us/world/'

export const chapterVisuals = {
  incineration: 'grand-order-incineration.webp',
  remnant: 'grand-order-remnant.webp',
  revision: 'grand-order-lostbelt.webp',
  ordeal: 'grand-order-ordeal.webp',
} as const

export const incinerationBackgrounds = [
  'singularity-fuyuki.webp',
  'singularity-orleans.webp',
  'singularity-septem.webp',
  'singularity-okeanos.webp',
  'singularity-london.webp',
  'singularity-america.webp',
  'singularity-camelot.webp',
  'singularity-babylonia.webp',
] as const

export const remnantBackgrounds = [
  'remnant-shinjuku.webp',
  'remnant-seraph.webp',
  'remnant-agartha.webp',
  'remnant-shimosa.webp',
  'remnant-salem.webp',
] as const

export const revisionBackgrounds = [
  'lostbelt-anastasia.webp',
  'lostbelt-gotterdammerung.webp',
  'lostbelt-sin.webp',
  'lostbelt-yuga-kshetra.webp',
  'lostbelt-atlantis.webp',
  'lostbelt-olympus.webp',
  'lostbelt-heian-kyo.webp',
  'lostbelt-avalon.webp',
  'lostbelt-traum.webp',
  'lostbelt-mictlan.webp',
] as const

export const worldRecords = [
  {
    chapter: 'CHAPTER I',
    copy: 'Eight Singularities and the final confrontation at the Grand Temple of Time.',
    image: 'world-incineration.webp',
    title: 'Human Order Incineration',
  },
  {
    chapter: 'CHAPTER I.5',
    copy: 'Five remnant incidents left behind after the restoration of the Human Order.',
    image: 'world-remnant.webp',
    title: 'Epic of Remnant',
  },
  {
    chapter: 'CHAPTER II',
    copy: 'Seven pruned histories competing with Proper Human History for the future of Earth.',
    image: 'world-lostbelt.webp',
    title: 'Cosmos in the Lostbelt',
  },
  {
    chapter: 'CHAPTER II.5',
    copy: 'A sequence of ordeals required to reclaim the right to return to Antarctica.',
    image: 'world-ordeal.webp',
    title: 'Ordeal Call',
  },
]

