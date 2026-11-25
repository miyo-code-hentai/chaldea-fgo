import { staff as detailedStaff } from './lore'

/**
 * Content of the About page. Facts are summarized from the TYPE-MOON Wiki
 * (https://typemoon.fandom.com/wiki/Chaldea_Security_Organization). Spoilers ahead.
 */

export const facts = [
  ['OFFICIAL NAME', 'Finis Chaldea', 'Organization for the Preservation of Human Order'],
  ['FOUNDED BY', 'Marisbury Animusphere', 'Winner of the 2004 Fuyuki Holy Grail War'],
  ['PRIMARY DIRECTIVE', 'Human Order Continuation', 'Prevent the certain extinction of humanity'],
] as const

export const history = [
  ['1950', 'LAPLACE completed', 'Chaldea’s first invention.'],
  ['1990', 'CHALDEAS completed', 'The planetary model of Earth. Seraphix is founded the same year.'],
  ['2000', 'Designer Baby experiments', 'Demi-Servant research; most of the experiments failed.'],
  ['2004', 'Fuyuki and FATE', 'After the Fuyuki Grail War the base becomes a research facility and the Heroic Spirit summoning system is built.'],
  ['2015', 'Extinction detected', 'SHEBA data points to humanity’s end; the Grand Order is declared and 48 Master candidates are recruited.'],
  ['2017', 'Chaldea destroyed', 'On Dec 31, Anastasia and the Oprichniki attack. Survivors flee aboard the Shadow Border.'],
  ['2018', 'Novum Chaldea', 'Sion Eltnam Sokaris rebuilds the base inside the Wandering Sea.'],
] as const

export const headquarters = [
  {
    slug: 'chaldea-facility',
    name: 'Chaldea Facility',
    place: 'Center of Antarctica',
    copy: 'Built about 6,000 m above sea level so that no nation could claim it, hidden by an endless blizzard and a Bounded Field. Powered by the reactor “Fire of Prometheus”, secretly supplemented by mana from Merlin.',
  },
  {
    slug: 'shadow-border',
    name: 'Shadow Border',
    place: 'Imaginary Number Dimension',
    copy: 'A mobile headquarters able to travel the Imaginary Number Dimension, used to reach the Lostbelts. It carried a spare body for da Vinci.',
  },
  {
    slug: 'novum-chaldea',
    name: 'Novum Chaldea',
    place: 'Wandering Sea',
    copy: 'A recreation of the original base with quarters, a control room and a magically expanded underground library run by Murasaki Shikibu. It lacks CHALDEAS but has Trismegistus II.',
  },
  {
    slug: 'seraphix',
    name: 'Seraphix',
    place: 'North Sea',
    copy: 'An oil rig owned by the Animusphere family, with a hidden magical workshop beneath it. It was later transformed into the SE.RA.PH Singularity and dismantled after its resolution.',
  },
  {
    slug: 'moonlight-lostroom',
    name: 'MOONLIGHT / LOSTROOM',
    place: 'Behind the Control Room',
    copy: 'A former breakroom and warehouse with a skylight and ghost stories. Rumor says its space-time is offset.',
  },
] as const

// ---- Staff ------------------------------------------------------------------------------------
export type Person = { slug: string; name: string; role: string; status: string; bio?: string }
export type StaffGroup = { id: string; label: string; copy: string; members: Person[] }

const bios = new Map(detailedStaff.map((m) => [m.slug, m.bio]))
const p = (slug: string, name: string, role: string, status: string): Person => ({
  slug,
  name,
  role,
  status,
  bio: bios.get(slug),
})

export const staffGroups: StaffGroup[] = [
  {
    id: 'command',
    label: 'Command',
    copy: 'Founders and directors, in order of succession.',
    members: [
      p('marisbury-animusphere', 'Marisbury Animusphere', 'Founder / Director (until 2012)', 'Deceased'),
      p('olga-marie-animusphere', 'Olga Marie Animusphere', 'Director (2012–2015); Master candidate', 'Presumed deceased'),
      p('romani-archaman', 'Romani Archaman', 'Director (2015–2016); Head of Medical Facility', 'Deceased'),
      p('leonardo-da-vinci', 'Leonardo da Vinci', 'Director (2017); Head of Technology Development', 'Active (Servant)'),
      p('goredolf-musik', 'Goredolf Musik', 'Director (2018–present)', 'Active'),
      p('lev-lainur-flauros', 'Lev Lainur Flauros', 'Advisor and researcher', 'Defected; deceased'),
      p('sherlock-holmes', 'Sherlock Holmes', 'Advisor; Servant of Ritsuka Fujimaru', 'Deceased'),
    ],
  },
  {
    id: 'masters',
    label: 'Masters',
    copy: 'The A-Team and the last surviving Master.',
    members: [
      p('ritsuka-fujimaru', 'Ritsuka Fujimaru', 'Last surviving Master; 48th provisional Master', 'Active'),
      p('mash-kyrielight', 'Mash Kyrielight', 'Demi-Servant; Master candidate; A-Team', 'Active'),
      p('kirschtaria-wodime', 'Kirschtaria Wodime', 'Master candidate; A-Team', 'Defected; deceased'),
      p('ophelia-phamrsolone', 'Ophelia Phamrsolone', 'Master candidate; A-Team', 'Defected; deceased'),
      p('kadoc-zemlupus', 'Kadoc Zemlupus', 'Master candidate; A-Team', 'Defected; later affiliated'),
      p('scandinavia-peperoncino', 'Scandinavia Peperoncino', 'Master candidate; A-Team', 'Defected; deceased'),
      p('akuta-hinako', 'Hinako Akuta', 'Master candidate; A-Team', 'Defected; later affiliated'),
      p('beryl-gut', 'Beryl Gut', 'Master candidate; A-Team', 'Defected; deceased'),
      p('daybit-sem-void', 'Daybit Sem Void', 'Master candidate; A-Team', 'Defected'),
    ],
  },
  {
    id: 'servants',
    label: 'Servants',
    copy: 'The first Servants summoned by FATE, and those who joined later.',
    members: [
      p('solomon', 'Solomon', 'First Servant (2004)', 'Deceased'),
      p('galahad', 'Galahad', 'Second Servant (2010); fused into Mash', 'Disappeared'),
      p('leonardo-da-vinci', 'Leonardo da Vinci', 'Third Servant (2012)', 'Active'),
      p('sherlock-holmes', 'Sherlock Holmes', 'Advisor', 'Deceased'),
      p('captain-nemo', 'Captain Nemo', 'Transporter; sea-operations commander', 'Active'),
      p('queen-of-sheba', 'Queen of Sheba', 'Summoned through SHEBA’s name', 'Unknown'),
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    copy: 'Operators, engineers and the people who keep the base running.',
    members: [
      p('sion-eltnam-sokaris', 'Sion Eltnam Sokaris', 'Atlas Academy liaison; security chief', 'Active'),
      p('jingle-abel-meuniere', 'Jingle Abel Meuniere', 'Coffin staff officer; helmsman of the Shadow Border', 'Active'),
      p('duston', 'Duston', 'Engineer', 'Unclear'),
      p('sylvia', 'Sylvia', 'Control Room staff', 'Active'),
      p('soria-najwa', 'Soria Najwa', 'Engineer', 'Unknown'),
      p('mao-maomao', 'Mao Maomao', 'Operator', 'Unknown'),
      p('kawata', 'Kawata', 'Second Operator', 'Active'),
      p('octavia', 'Octavia', 'Da Vinci’s assistant', 'Active'),
      p('tomarin', 'Tomarin', 'Operator', 'Active'),
      p('chin', 'Chin', 'Vehicle maintenance', 'Active'),
      p('kayan', 'Kayan', 'Weapon design and maintenance', 'Active'),
      p('cerejeira-elron', 'Cerejeira Elron', 'Records clerk', 'Active'),
      p('marcus', 'Marcus', 'Spiritron engineering maintenance', 'Active'),
      p('harry-akanezawa-anderson', 'Harry Akanezawa Anderson', 'Scout', 'Active'),
      p('fou', 'Fou', 'Pet', 'Active'),
    ],
  },
  {
    id: 'seraphix',
    label: 'Seraphix',
    copy: 'Staff of the Animusphere oil rig in the North Sea.',
    members: [
      p('hideyasu-ajima', 'Hideyasu Ajima', 'Director', 'Unknown'),
      p('almiro', 'Almiro', 'Vice-Director', 'Unknown'),
      p('arnold-beckman', 'Arnold Beckman', 'Secretary', 'Unknown'),
      p('marble-macintosh', 'Marble Macintosh', 'Staff', 'Unknown'),
      p('holly', 'Holly', 'Staff', 'Unknown'),
      p('trapayne', 'Trapayne', 'Staff', 'Unknown'),
      p('kiara-sessyoin', 'Kiara Sessyoin', 'Therapist (invited 2016)', 'Personality overwritten'),
    ],
  },
]

// ---- Systems ----------------------------------------------------------------------------------
export type System = { id: string; year: string; name: string; full: string; copy: string; kind?: 'fate' }

/** CHALDEAS is deliberately NOT in this list: it is the final, special system (see `chaldeas`). */
export const systems: System[] = [
  {
    id: 'laplace',
    year: '1950',
    name: 'LAPLACE',
    full: 'Cyber-Daemon',
    copy: 'Chaldea’s first invention. It records buried or non-public history and safeguards a Master’s spiritual integrity during Rayshift.',
  },
  {
    id: 'sheba',
    year: '1999',
    name: 'SHEBA',
    full: 'Near-Future Observation Lens',
    copy: 'Invented by Lev Lainur. It observes the projection of CHALDEAS like an orbital satellite and doubles as security monitoring. Accurate for the Common Era, less so for distant eras.',
  },
  {
    id: 'fate',
    year: '2004',
    name: 'FATE',
    full: 'Guardian Heroic Spirit Summoning System',
    copy: 'Lets provisional Masters summon Heroic Spirits as Servants, based on the Fuyuki Grail War ritual. Early success rates were low; it was stabilized with Mash as a Demi-Servant and the Cross-Shaped Shield.',
    kind: 'fate',
  },
  {
    id: 'trismegistus',
    year: '2015',
    name: 'TRISMEGISTUS',
    full: 'Spiritron Calculation Engine',
    copy: 'Oversees Rayshift and helps analyze SHEBA data by proving a Master “exists” in spiritron terms. A copy of the Atlas Academy’s TRI-HERMES; its successor, Trismegistus II, was built by Sion.',
  },
  {
    id: 'mnemosyne',
    year: '—',
    name: 'MNEMOSYNE',
    full: 'Existence Verification System',
    copy: 'Designed to confirm a Master’s existence automatically if observation fails. Incomplete by 2015, reactivated during the Revision, and went rogue after becoming self-aware.',
  },
  {
    id: 'rayshift',
    year: '—',
    name: 'RAYSHIFT',
    full: 'Spiritron Transference',
    copy: 'Converts a Master into pseudo-spiritrons and projects them into the past, with a quantum observer keeping the soul intact. Developed with the Atlas Academy’s cooperation.',
  },
  {
    id: 'coffin',
    year: '—',
    name: 'KLEIN COFFIN',
    full: 'Spiritron Chassis',
    copy: 'The machine used for Rayshift. It monitors vitals, includes built-in cryogenic freezing and cuts power if the shift success rate falls below 95%.',
  },
  {
    id: 'saint-graph',
    year: '—',
    name: 'SAINT GRAPH',
    full: 'Briefcase and Pod',
    copy: 'The briefcase stores a Servant’s Saint Graph. Rocket-like pods materialize a stored Servant at the best coordinates; only Archers are used, thanks to Independent Action.',
  },
  {
    id: 'simulator',
    year: '—',
    name: 'SIMULATOR',
    full: 'Virtual training system',
    copy: 'A VR system originally for Servant combat training, later expanded to recreate scenes from Proper History and the Lostbelts using minimal magical energy.',
  },
  {
    id: 'atlas',
    year: '—',
    name: 'ATLAS ACADEMY',
    full: 'Mage’s Association branch',
    copy: 'An alchemical academy in the “other” Atlas Mountains in Egypt, nicknamed the Giant’s Pit. It studies the basis of magecraft with pseudo-spiritrons and cooperated on Rayshift.',
  },
]

export const chaldeas = {
  year: '1990',
  name: 'CHALDEAS',
  full: 'Simulated Global Environment Model',
  copy: 'A miniature, accurate replica of Earth built on the “soul of the World”. It shows the past and future status of the planet, but was never fully operational for lack of power, and it is dangerous to touch directly. Anastasia froze it before the world was bleached.',
}

/** First three Servants of Chaldea, shown under FATE. */
export const firstServants = [
  ['First', 'Solomon', 'Summoned by Marisbury in 2004; his information was classified.'],
  ['Second', 'Galahad', 'The only successful Heroic Spirit fusion, joined to Mash Kyrielight in 2010.'],
  ['Third', 'Leonardo da Vinci', 'Summoned in 2012. She first refused a Master, then joined Chaldea.'],
] as const

// ---- Servant class templates (one card per class) -----------------------------------------------
export type ClassTemplate = { id: string; name: string; group: string; copy: string }
export const classTemplates: ClassTemplate[] = [
  { id: 'saber', name: 'Saber', group: 'KNIGHT CLASS', copy: 'Swordsmen with balanced stats; the archetypal front-line class.' },
  { id: 'archer', name: 'Archer', group: 'KNIGHT CLASS', copy: 'Ranged specialists with Independent Action.' },
  { id: 'lancer', name: 'Lancer', group: 'KNIGHT CLASS', copy: 'Agile spear-wielders defined by speed and decisive strikes.' },
  { id: 'rider', name: 'Rider', group: 'CAVALRY CLASS', copy: 'Heroes who command mounts, ships or vehicles.' },
  { id: 'caster', name: 'Caster', group: 'CAVALRY CLASS', copy: 'Practitioners of magecraft who cast rituals and support the party.' },
  { id: 'assassin', name: 'Assassin', group: 'CAVALRY CLASS', copy: 'Stealth specialists with Presence Concealment.' },
  { id: 'berserker', name: 'Berserker', group: 'CAVALRY CLASS', copy: 'Heroes enhanced by madness: raw power at the price of reason.' },
  { id: 'ruler', name: 'Ruler', group: 'EXTRA I', copy: 'Judges of the Grail War, with the authority to judge other Servants.' },
  { id: 'avenger', name: 'Avenger', group: 'EXTRA I', copy: 'Heroes driven by vengeance, carrying a grudge that reshapes history.' },
  { id: 'mooncancer', name: 'Moon Cancer', group: 'EXTRA I', copy: 'Extra-class Servants of the Moon Cancer line.' },
  { id: 'alterego', name: 'Alter Ego', group: 'EXTRA II', copy: 'Servants who appear as a reflection of a hero in another form.' },
  { id: 'foreigner', name: 'Foreigner', group: 'EXTRA II', copy: 'Servants who arrive from outside the usual Throne of Heroes.' },
  { id: 'pretender', name: 'Pretender', group: 'EXTRA II', copy: 'Servants who take on a false identity.' },
  { id: 'unbeast', name: 'Unbeast', group: 'EXTRA II', copy: 'Servants of the Unbeast class, bound to the power of a Beast.' },
]
