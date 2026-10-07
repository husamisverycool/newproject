/**
 * Partiful: event page, RSVP, Find a Time, Text Blast, Activity Feed and photo album, create flow,
 * settings, join-by-link. Research: research/04 §3 and research/15 §2.
 */
export const partiful = {
  /* ── Create (help.partiful.com "Creating your first Partiful event") ── */
  /** [V] "Plus icon or "Create" button on the homepage" */
  create: 'Create',
  /** [B-low] title placeholder */
  untitled: 'Untitled Event',
  /** [V] "Set a Date" */
  setADate: 'Set a Date',
  /** [V] link under Set a Date */
  pollYourGuests: 'Poll your guests',
  /** [V] sidebars */
  theme: 'Theme',
  /** [V] */
  effect: 'Effect',
  /** [V] */
  settings: 'Settings',
  /** [V] "Save Draft" (required before inviting) */
  saveDraft: 'Save Draft',
  /** [V] invite screen */
  invite: 'Invite',
  /** [V] poster picker: search by event type or vibe */
  posterTypes: ['birthday', 'housewarming', 'picnic', 'happy hour'] as const,
  /** [V] */
  posterVibes: ['chill', 'summer', 'outdoors'] as const,
  /** [V-weak] effect names (press): bubbles, fireworks, confetti */
  effects: ['bubbles', 'fireworks', 'confetti'] as const,

  /* ── RSVP ── */
  /** [V] */
  going: 'Going',
  /** [V] */
  maybe: 'Maybe',
  /** [V] */
  cantGo: "Can't Go",
  /** [V] "RSVP Button Style" default is Emojis; glyphs [B-med] */
  rsvpEmoji: { going: '👍', maybe: '🤔', cant_go: '😢' },
  /** [V] guest count label "# Going" */
  countGoing: (n: number) => `${n} Going`,
  /** [B-med] "Hosted by [name] & [name]" */
  hostedBy: (names: string) => `Hosted by ${names}`,
  /** [B-med] at capacity */
  joinWaitlist: 'Join Waitlist',
  /** [V] Text Blast recipient category */
  invited: 'Invited',

  /* ── Find a Time ── */
  /** [V] feature name */
  findATime: 'Find a Time',
  /** [V] vote options */
  yes: 'Yes',
  /** [V] */
  no: 'No',
  /** [V] host resolve button */
  pickThis: 'Pick this',

  /* ── Text Blast ── */
  /** [V] */
  textBlast: 'Text Blast',
  /** [V] */
  newMessage: 'New Message',
  /** [V] up to 10 blasts per event */
  maxBlasts: 10,
  /** [B-low] send */
  send: 'Send',

  /* ── Activity Feed and photos ── */
  /** [V] section name */
  activityFeed: 'Activity Feed',
  /** [V] button at the top of the Activity Feed */
  uploadPhotos: 'Upload Photos',

  /* ── Settings tabs ── */
  /** [V] */
  tabRsvps: 'RSVPs',
  /** [V] */
  tabQuestionnaire: 'Questionnaire',
  /** [V] */
  tabDisplay: 'Display + Privacy',
  /** [V] */
  tabHosts: 'Hosts',
  /** [V] */
  tabReminders: 'Auto-Reminders',
  /** [V] schedule: Going guests 2 hours before; Maybe / no-reply 1 week before. Reminder wording is UNKNOWN, so reminders carry only the event's own title and time. */
  reminderOffsetsMs: { going: 2 * 3_600_000, maybe: 7 * 86_400_000 },

  /* ── Event page, plan card and create flow (research/21 §1, research/15 §2) ── */
  /** [V-weak] the guest list shows how many are "Going" and how many marked "Maybe"; same "# Going" pattern [V] */
  countMaybe: (n: number) => `${n} Maybe`,
  /** [V] the "# Going" pattern applied to the other statuses the host sees ("Going", "Maybe", "Can't Go", "Invited", the Text Blast recipient categories) */
  countOf: (n: number, status: string) => `${n} ${status}`,
  /** [V] "Show Guest List" (Display + Privacy); the Guest List has "Export CSV" */
  guestList: 'Guest List',
  /** [V] core fields "Event name, date, location, description" (help center; capitalized as a field label) */
  location: 'Location',
  /** [V-weak] title-font ids in live partiful.com/create URLs: titleFont=display, titleFont=manrope (display names UNKNOWN) */
  titleFonts: { display: 'Display', manrope: 'Manrope' },
  /** [V-weak] effect ids in live partiful.com/create URLs: effect=sunbeams, effect=fireworks ("fireworks" is also in the press list) */
  effectNames: { sunbeams: 'sunbeams', fireworks: 'fireworks' },
  /** [V] Settings > RSVPs toggle */
  guestApproval: 'Guest Approval',
  /** [V] Settings > RSVPs */
  rsvpButtonStyle: 'RSVP Button Style',
  /** [V] "RSVP Button Style" options "Emojis", "Icons" */
  emojis: 'Emojis',
  /** [V] Settings > RSVPs: the option to turn off "Maybe" */
  acceptRsvps: 'Accept RSVPs',
  /** [V] Settings > Display + Privacy */
  showGuestList: 'Show Guest List',
  /** [V] Settings > Display + Privacy (aka "# Going") */
  showGuestCount: 'Show Guest Count',

  /* ── Edit, poster, +1s, Activity Feed comments (research/15 §2, research/21 §1) ── */
  /** [V] "Event page, then "Edit", then "Settings"" (Auto-Reminders article); "Save Draft … you can edit later" */
  edit: 'Edit',
  /** [V] "Edit button in the bottom-right corner of the poster opens the poster picker"; App Store "event posters" */
  poster: 'Poster',
  /** [V] Settings > RSVPs: "number of +1s (default one +1 per guest)" */
  plusOnes: '+1s',
  /** [V] default "one +1 per guest" */
  defaultPlusOnes: 1,
  /** [V] a guest's +1 count, written as in "+1s" */
  plusN: (n: number) => `+${n}`,
  /** [V] Display + Privacy: "hide Activity Feed timestamps" (capitalized as a switch label) */
  hideTimestamps: 'Hide Activity Feed timestamps',
  /** [V] comments: "Type "@" and the name pops up" */
  mention: (name: string) => `@${name}`,
} as const;
