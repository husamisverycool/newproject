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
  /** Flat fill, darker same-hue shade, belly, accent (beak/feet/nose) — Duolingo palette [V] / shades [B-med]. */
  body: string;
  shade: string;
  belly: string;
  accent: string;
  /** One of Duolingo's five eye styles: round, glasses, almond, linear, dots [V]. */
  eyes: 'round' | 'almond' | 'dots';
}

/**
 * Species: Widgetable "Raise Pets Together" list (cat, dog, bird, panda, polar bear, rubber duck) [V-weak]
 * plus Pengu's penguin [V]. Drawn by Duolingo's character rules (design.duolingo.com/illustration) [V].
 * Fill colors are the Duolingo palette nearest each animal's natural color.
 */
export const MASCOT_SPECIES: MascotSpeciesDef[] = [
  { id: 'cat', name: 'Cat', body: '#FF9600', shade: '#CD7900', belly: '#FFFFFF', accent: '#FF4B4B', eyes: 'almond' },
  { id: 'dog', name: 'Dog', body: '#777777', shade: '#4B4B4B', belly: '#E5E5E5', accent: '#4B4B4B', eyes: 'dots' },
  { id: 'bird', name: 'Bird', body: '#1CB0F6', shade: '#1899D6', belly: '#FFFFFF', accent: '#FFC800', eyes: 'round' },
  { id: 'panda', name: 'Panda', body: '#FFFFFF', shade: '#E5E5E5', belly: '#FFFFFF', accent: '#4B4B4B', eyes: 'round' },
  { id: 'polarbear', name: 'Polar bear', body: '#FFFFFF', shade: '#E5E5E5', belly: '#F7F7F7', accent: '#4B4B4B', eyes: 'dots' },
  { id: 'duck', name: 'Rubber duck', body: '#FFC800', shade: '#E5A000', belly: '#FFC800', accent: '#FF9600', eyes: 'round' },
  { id: 'penguin', name: 'Penguin', body: '#4B4B4B', shade: '#3C3C3C', belly: '#FFFFFF', accent: '#FF9600', eyes: 'round' },
];

/** Growth levels at Duolingo's streak milestones (7, 30, 50, 100, 365) [V-weak], counted in group posts. */
export const MASCOT_STAGES = [
  { level: 1, xp: 0 },
  { level: 2, xp: 7 },
  { level: 3, xp: 30 },
  { level: 4, xp: 50 },
  { level: 5, xp: 100 },
  { level: 6, xp: 365 },
] as const;

export function mascotStage(xp: number) {
  let stage: (typeof MASCOT_STAGES)[number] = MASCOT_STAGES[0];
  for (const s of MASCOT_STAGES) if (xp >= s.xp) stage = s;
  const next = MASCOT_STAGES.find((s) => s.xp > xp) ?? null;
  return { ...stage, next, progress: next ? (xp - stage.xp) / (next.xp - stage.xp) : 1 };
}

/** XP the mascot earns per group activity. */
/** One post = one "lesson": the mascot grows by group posts (Duolingo milestones above). */
export const MASCOT_XP = { post: 1, ritualPost: 1, game: 0, plan: 0, newMember: 0 } as const;
