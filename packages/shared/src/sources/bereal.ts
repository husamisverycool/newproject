import { BRAND } from '../brand.ts';

/**
 * BeReal: ritual push, dual capture, BTS, RealMoji, Memories, report/block.
 * Research: research/03 and research/11.
 */
export const bereal = {
  /** [V] help-center title "⚠️Time to BeReal.⚠️" (no spaces next to the emoji) · subst BeReal→roll */
  ritualPush: `⚠️Time to ${BRAND.name}⚠️`,
  /** [B-low] push body "2 min left to capture a BeReal and see what your friends are up to!" · subst BeReal→photo; the window length is ours */
  ritualPushBody: (left: string) => `${left} left to capture a photo and see what your friends are up to!`,
  /** [V] blog title "⚠️ It's Time for Bonus BeReal! ⚠️" */
  bonus: '⚠️ It\'s Time for Bonus roll! ⚠️',
  /** [B-high] wordmark ends with a period: "BeReal." */
  wordmarkPeriod: '.',

  /* ── Capture ── */
  /** [V] the countdown is already running when the camera opens; shown at the top ([B-med]) */
  timer: (mmss: string) => mmss,

  /* ── Post preview (help.bereal.com 15272815079453) ── */
  /** [V] */
  btsOn: 'BTS On',
  /** [V] */
  btsOff: 'BTS Off',
  /** [V] "Behind The Scenes (BTS)" */
  btsName: 'Behind The Scenes',
  /** [V] send button, all caps */
  send: 'SEND',
  /** [B-med] caption placeholder */
  addACaption: 'Add a caption...',

  /* ── Feed blur ── */
  /** [I] bereal-05-unlock-blur: title over the blurred photo, under an eye-slash glyph */
  shareToView: 'Share to view',
  /** [I] bereal-05-unlock-blur: "To view your friend's BeReal, post an update." · subst BeReal→photo */
  shareToViewBody: "To view your friend's photo, post an update.",
  /** [I] bereal-05-unlock-blur: white capsule "Post a BeReal." · subst BeReal→photo */
  postAPhoto: 'Post a photo.',
  /** [I] bereal-05-unlock-blur: "5 min late" under the poster's name */
  minLate: (n: number) => `${n} min late`,
  /** [I] bereal-03-same-time-feed: "Claire ✨ and 24 others posted a BeReal" · subst BeReal→photo */
  andOthersPosted: (name: string, n: number) => `${name} and ${n} others posted a photo`,
  /** [I] bereal-03 / -05: "View 10 comments" */
  viewComments: (n: number) => `View ${n} comments`,
  /** [I] bereal-06-realmojis-comments: "annavibes · 5 min ago" */
  minAgo: (n: number) => `${n} min ago`,
  /** [I] bereal-06-realmojis-comments: header capsule "See Profile" */
  seeProfile: 'See Profile',
  /** [I] bereal-06-realmojis-comments: overflow circle after the RealMojis "3+" */
  more: (n: number) => `${n}+`,
  /** [I] bereal-04-calendar: title "My BeReals" · subst BeReal→photo */
  myPhotos: 'My Photos',
  /** [I] bereal-04-calendar: weekday header */
  weekdays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const,
  /** [I] bereal-02-dualcam-preview: audience chip "🔒 My Friends" */
  myFriends: 'My Friends',
  /** [I] bereal-05-unlock-blur: feed tabs "My Friends" | "Friends of Friends" */
  friendsOfFriends: 'Friends of Friends',
  /** [I] bereal-02-dualcam-preview: toggle chip "Off" */
  off: 'Off',
  /** [I] App Store quote: "Like a mini time capsule of my everyday life" */
  timeCapsule: 'Like a mini time capsule of my everyday life',

  /* ── RealMoji (help.bereal.com 7536240858653; research/03 §1.7) ── */
  /** [B-high] the five preset RealMojis in order: Like, smile, surprise, love, burst out laughing ([V] names) */
  realMojis: ['👍', '😃', '😲', '😍', '😂'] as const,
  /** [V] sixth option at the end of the list, lightning bolt */
  instant: '⚡',
  /** [V] feature name */
  instantRealMoji: 'Instant RealMoji',
  /** [V] save button after capturing a RealMoji */
  realMojiContinue: 'Continue',
  /** [V] product name of selfie reactions */
  realMoji: 'RealMoji',

  /* ── Memories (help.bereal.com 7531349180829) ── */
  /** [V] profile link */
  viewAllMemories: 'View all my Memories',
  /** [V] "Only you can see your Memories, not even your friends" */
  memoriesPrivate: 'Only you can see your Memories, not even your friends',
  /** [V] alternativeto: "Your 2023 Recap" · year is ours */
  yourRecap: (year: number) => `Your ${year} Recap`,
  /** [V-weak] Bustle: "Generate my 2023 video recap" · year is ours */
  generateRecap: (year: number) => `Generate my ${year} video recap`,

  /* ── Report / block (help.bereal.com 10100086147229, 9775866279453) ── */
  /** [V] three-dot menu option */
  report: 'Report',
  /** [V] */
  block: 'Block',
  /** [V] eSafety: "All reports are anonymous" */
  reportsAnonymous: 'All reports are anonymous',
  /** [V] blocked users are not notified */
  blockNotNotified: 'They won’t be notified.',
} as const;
