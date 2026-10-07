/**
 * Snapchat: streak hourglass, Group Streaks, Memories Storage Plans, Download My Data, Imagine Lens.
 * Research: research/03 and research/11.
 */
export const snapchat = {
  /* ── Streaks ── */
  /** [V-weak] ⌛ shows when the streak is about to expire (about four hours left) */
  hourglass: '⌛',
  /** [B-high] 🔥 with the day count */
  flame: '🔥',
  /** [V] newsroom: "every Snap you share contributes to a collective Streak" · subst Snap→photo */
  groupStreakLine: 'every photo you share contributes to a collective Streak',
  /** [V] "as long as most of the members participate" */
  groupStreakRule: 'as long as most of the members participate',
  /** [V] Group Streaks can be restored within a week of ending */
  restoreWithinWeek: 'Restore within a week',

  /* ── Memories Storage Plans (newsroom.snap.com) ── */
  /** [V] "Introducing Memories Storage Plans" */
  storagePlans: 'Memories Storage Plans',
  /** [V] free cap */
  freeCap: '5GB',
  /** [V] "Users already over the cap get 12 months of temporary storage" */
  graceLine: '12 months of temporary storage',

  /* ── Download My Data (igeeksblog; takeoutday) ── */
  /** [V-weak] settings row */
  myData: 'My Data',
  /** [V-weak] toggle */
  exportMemories: 'Export your Memories',
  /** [V-weak] option */
  htmlFiles: 'HTML Files',
  /** [V-weak] option */
  jsonFiles: 'JSON Files',
  /** [V-weak] date range */
  allTime: 'All Time',
  /** [V-weak] confirm button */
  submit: 'Submit',
  /** [V-weak] next button */
  next: 'Next',

  /* ── Sign-up ── */
  /** [B-med] sign-up step title */
  whensYourBirthday: "When's your birthday?",

  /* ── Imagine Lens (TechCrunch 2025-10-22) ── */
  /** [V] example prompts */
  imaginePrompts: ['Turn me into an alien', 'grumpy cat'] as const,
} as const;
