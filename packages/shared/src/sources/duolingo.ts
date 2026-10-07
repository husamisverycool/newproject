/**
 * Duolingo: the mascot's voice, game buttons, streaks, Friend Streak, Friends Quest, lesson-complete
 * and feedback sheets. Research: research/04 §2 and research/14. "Duo" → the group's mascot name.
 */
export const duolingo = {
  /* ── Voice (design.duolingo.com/writing) — used to brief the AI game master ── */
  /** [V] four qualities */
  voiceQualities: ['Expressive', 'Playful', 'Embracing', 'Worldly'] as const,
  /** [V] Duo's adjectives */
  duoAdjectives: ['helpful', 'motivating', 'organized', 'dependable', 'dedicated', 'persistent', 'supportive', 'positive', 'emotive', 'slightly awkward'] as const,
  /** [V] the four qualities as design.duolingo.com/writing/voice defines them (research/14 §1.7) */
  voiceDefinitions: {
    Expressive: 'simple words and phrases to convey big feelings',
    Playful: 'bringing creativity to the conversation',
    Embracing: 'a cheerleader to whoever you are',
    Worldly: 'interested, knowledgeable, and having a broad worldview',
  },
  /** [V] design.duolingo.com/writing/duo: Duo is learners' "#1 fan and biggest cheerleader" */
  duoRole: '#1 fan and biggest cheerleader',
  /** [V-weak] first sentence of "Hi, it's Duo! I missed you. …" (research/14 §2.1) · subst Duo→mascot */
  hiItsDuo: (mascot: string) => `Hi, it's ${mascot}!`,

  /* ── Push (research/14 §2.1) ── */
  /** [V] back-off message */
  backOff: "These reminders don't seem to be working. We'll stop sending them for now.",
  /** [V-weak] "Hi, it's Duo! I missed you. It has been 3 days. It's not too late to come back and practice today!" · subst Duo→mascot, practice→post */
  missedYou: (mascot: string, days: number) => `Hi, it's ${mascot}! I missed you. It has been ${days} days. It's not too late to come back and post today!`,
  /** [V-weak] "Don't let Duo down!" · subst Duo→mascot */
  dontLetDown: (mascot: string) => `Don't let ${mascot} down!`,

  /* ── Streak (research/14 §2.2–2.3) ── */
  /** [V] Friend Streak feature name */
  friendStreak: 'Friend Streak',
  /** [V-weak] Streak screen tabs */
  tabPersonal: 'PERSONAL',
  /** [V-weak] */
  tabFriends: 'FRIENDS',
  /** [V-weak] milestones 7, 30, 50, 100, 365 */
  milestones: [7, 30, 50, 100, 365] as const,
  /** [V-weak] "A light orange streak means a streak freeze or a missed day" */
  streakFreeze: 'Streak Freeze',

  /* ── Friends Quest (blog.duolingo.com/friends-quests) ── */
  /** [V] */
  friendsQuest: 'Friends Quest',
  /** [V] "give them a nudge to do their daily lesson" */
  nudge: 'Nudge',
  /** [V-weak] gift icon on the Friends Quest module */
  gift: 'Gift',
  /** [B-med] "x days left" timer on the module */
  daysLeft: (n: number) => `${n} ${n === 1 ? 'day' : 'days'} left`,

  /* ── Buttons and feedback ([B-high] labels are UPPERCASE) ── */
  /** [B-high] */
  continue: 'CONTINUE',
  /** [B-high] */
  start: 'START',
  /** [B-high] */
  skip: 'SKIP',
  /** [B-high] */
  check: 'CHECK',
  /** [B-med] correct-answer sheet headings */
  correct: ['Nice!', 'Great job!', 'Correct!', 'Excellent!'] as const,
  /** [B-med] lesson-complete header */
  lessonComplete: 'Lesson complete!',
  /** [B-med] stat cards */
  statTotal: 'TOTAL XP',
  /** [B-med] */
  claim: 'CLAIM XP',
} as const;
