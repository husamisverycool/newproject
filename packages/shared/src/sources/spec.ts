/**
 * Wording taken from the product spec itself ("The Friend-Group Camera, Rebuilt From Its Inspirations",
 * the user's document). Used only where no source app has a string for the thing. [S]
 */
export const spec = {
  /** [S] §E "adopt as a 'right now' strip at the top" */
  rightNow: 'right now',
  /** [S] §D "Dual camera … keep as a mode" (set as an iOS Camera mode label) */
  modeDual: 'DUAL',
  /** [S] §N "progress such as '7/12 posted'" */
  posted: (n: number, of: number) => `${n}/${of} posted`,
  /** [S] §A1 "the group's first 'starter wall'" */
  starterWall: 'starter wall',
  /** [S] §A1 "this week N years ago" */
  thisWeekYearsAgo: (n: number) => `this week ${n} ${n === 1 ? 'year' : 'years'} ago`,
  /** [S] §K "everyone posts 3 times this week to earn a rare pack" */
  questGoal: (n: number) => `everyone posts ${n} times this week`,
  /** [S] §K */
  questReward: 'a rare pack',
  /** [S] §C "unless the group votes to open the archive" */
  openArchive: 'open the archive',
  /** [S] §K game names */
  superlatives: 'Superlatives',
  /** [S] §K */
  photoTelephone: 'Photo telephone',
  /** [S] §K "Challenges — BeReal's daily challenges: adapt to weekly" */
  challenge: 'Challenge',
  /** [S] §V "guess whose photo" */
  guessWhose: 'guess whose photo',
  /** [S] §P "a 'plan' card" */
  plan: 'Plan',
  /** [S] §E heading "Wall / journal" */
  journal: 'Journal',
  /** [S] §J feature name */
  friendCards: 'Friend Cards',
  /** [S] §J currency */
  sparks: 'Sparks',
  /** [S] §F/§S feature name (Sora's "Cameo" naming is under a trademark dispute) */
  likeness: 'Likeness',
  /** [S] §A4 "the group admin picks the ritual day (default Sunday)" */
  ritualDay: 'Ritual day',
  /** [S] §V */
  yearbook: 'Printed yearbook',
  /** [S] §U */
  zine: 'Zine',
  /** [S] §F "my group can make me into stickers" */
  stickerConsent: 'my group can make me into stickers',
  /** [S] §G "a per-user toggle for automatic AI creations that use their likeness" */
  autoCreations: 'Automatic AI creations',
  /** [S] §T "event albums that expire unless they're 'kept'" */
  keep: 'Keep',
  /** [S] §R "a group reaching 8 members earns the inviter a month of Premium" */
  inviteReward: 8,
  /** [S] §U plan names follow Snapchat+ / Lens+ naming */
  sub: 'Subscription',
  /** [S] §F "a visible watermark (group mascot plus app name) on every exported sticker" */
  watermark: 'Watermark',
  /** [S] §L "opt-in group search by caption and self-tags only" */
  searchCaptions: 'Search captions',
  /** [S] §U perk "the full-resolution archive"; §T "the paid tier keeps the full-resolution archive" */
  fullRes: 'Full-resolution archive',
  /** [S] §T "the free tier stores compressed copies" */
  compressed: 'Compressed copies',
  /** [S] §Q "paid tiers get watermark styles"; §U perk "watermark styles" */
  watermarkStyles: 'Watermark styles',
  /** [S] §I heading "Figurine renders"; §U "figurine and zine generation" in the AI tier */
  figurines: 'Figurine renders',
  /** [S] §K heading "Weekly games and the AI game master" */
  weeklyGames: 'Weekly games',
  /** [S] §L "search by caption and self-tags"; §S "Self-tagging only" — you can tag only yourself in a photo */
  selfTag: 'Self-tag',
  /** [S] §L "opt-in group search by caption and self-tags only" (the search switch's footer) */
  searchFooter: 'opt-in group search by caption and self-tags only',
  /** [S] §I "Physical upsell — adapt as printed figurine cards" */
  figurineCards: 'printed figurine cards',
  /** [S] §D "a group-mascot lens only" */
  mascotLens: 'group-mascot lens',
} as const;
