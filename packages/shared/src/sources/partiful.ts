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
} as const;
