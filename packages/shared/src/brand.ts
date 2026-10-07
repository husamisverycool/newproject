/**
 * Brand constants and sourced microcopy. Every string here is patterned on a source string from
 * the research dossiers — see docs/INSPIRATION.md for the line-by-line provenance.
 */

export const BRAND = {
  /** Lowercase (yope) + trailing period (BeReal.). */
  name: 'roll.',
  bare: 'roll',
  /** Store-title pattern "yope: friends-only pics" / "Retro — Photos with Friends". */
  tagline: 'friends-only camera',
  domain: 'roll.example',
} as const;

/** Plan names: Snapchat+ ($3.99) and Lens+ (AI tier) naming pattern; "Remix" from Google Photos. */
export const PLAN_NAMES = { free: 'Free', plus: 'roll+', ai: 'Remix+' } as const;

/** Ledger palette (docs/INSPIRATION.md §2) — server-side use (watermarks, renders). */
export const PALETTE = {
  black: '#000000',
  white: '#FFFFFF',
  g1: '#1C1C1E',
  g2: '#2C2C2E',
  g3: '#3A3A3C',
  swan: '#E5E5E5',
  hare: '#AFAFAF',
  wolf: '#777777',
  eel: '#4B4B4B',
  yellow: '#FFC800',
  orange: '#FF9600',
  red: '#FF4B4B',
  green: '#58CC02',
  greenLight: '#89E219',
  blue: '#1CB0F6',
  purple: '#CE82FF',
  navy: '#2B70C9',
  spotify: '#1ED760',
  pink: '#FF0069',
  periwinkle: '#AECBFA',
  gemini: '#8E75B2',
  imessage: '#34DA50',
  whatsapp: '#25D366',
} as const;

export const COPY = {
  // Locket onboarding (research/01 §1.12)
  setup: `Set up my ${'roll.'}`,
  whatsYourName: "What's your name?",
  continue: 'Continue',
  shareContacts: 'Share All Contacts',
  notNow: 'Not now',
  skipContacts: 'Skip contacts?',
  gateProgress: (n: number, of: number) => `${n} of ${of} friends joined`,
  // BeReal (research/03)
  ritualPush: '⚠️ Time to roll. ⚠️',
  btsOn: 'BTS On',
  btsOff: 'BTS Off',
  send: 'SEND',
  viewAllMemories: 'View all my memories',
  // Retro (research/02)
  thisWeekIn: 'this week in',
  // Spotify Wrapped Party (research/04 §1.6)
  joinParty: 'Join Party',
  // Partiful (research/04 §3)
  going: 'Going',
  maybe: 'Maybe',
  cantGo: "Can't Go",
  findATime: 'Find a Time',
  pollYourGuests: 'Poll your guests',
  setADate: 'Set a Date',
  pickThis: 'Pick this',
  uploadPhotos: 'Upload Photos',
  newBlast: 'New Blast',
  // Google Photos (research/06 §1)
  yourTools: 'Your tools',
  aiInfo: 'AI info',
  aiCredit: 'Made with roll. AI',
  aiEdited: 'Edited with roll. AI',
  selfieHint: 'Pick a selfie that is well-lit, focused, and front-facing',
  // Sora Cameos (research/06 §3.2)
  onlyMe: 'Only Me',
  peopleIApprove: 'People I Approve',
  myGroups: 'My Groups',
  // TCG Pocket (research/05)
  openPack: 'Open Pack',
  swipeToCut: 'Swipe across the top to open',
  swipeUpToAdd: 'Swipe up to add to your binder',
  sparkleFlair: 'Sparkle Flair: Gold',
} as const;

export interface MascotSpeciesDef {
  id: string;
  name: string;
  /** Body color — the group palette "comes straight from the mascot" (Duolingo). */
  body: string;
  belly: string;
  accent: string;
}

/** Rounded-geometric creatures (Duo construction), co-pet growth (Widgetable / Pengu). */
export const MASCOT_SPECIES: MascotSpeciesDef[] = [
  { id: 'blob', name: 'Blob', body: '#FFC800', belly: '#FFFFFF', accent: '#FF9600' },
  { id: 'bun', name: 'Bun', body: '#CE82FF', belly: '#FFFFFF', accent: '#FF0069' },
  { id: 'moth', name: 'Moth', body: '#1CB0F6', belly: '#FFFFFF', accent: '#2B70C9' },
  { id: 'frog', name: 'Frog', body: '#58CC02', belly: '#89E219', accent: '#FF4B4B' },
];

/** Mascot growth stages by XP. */
export const MASCOT_STAGES = [
  { level: 1, xp: 0, name: 'Egg' },
  { level: 2, xp: 60, name: 'Sprout' },
  { level: 3, xp: 200, name: 'Kid' },
  { level: 4, xp: 500, name: 'Teen' },
  { level: 5, xp: 1000, name: 'Grown' },
  { level: 6, xp: 2000, name: 'Legend' },
] as const;

export function mascotStage(xp: number) {
  let stage: (typeof MASCOT_STAGES)[number] = MASCOT_STAGES[0];
  for (const s of MASCOT_STAGES) if (xp >= s.xp) stage = s;
  const next = MASCOT_STAGES.find((s) => s.xp > xp) ?? null;
  return { ...stage, next, progress: next ? (xp - stage.xp) / (next.xp - stage.xp) : 1 };
}

/** XP the mascot earns per group activity. */
export const MASCOT_XP = { post: 5, ritualPost: 12, game: 10, plan: 8, newMember: 20 } as const;
