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
  /** [B-low] copy over blurred posts until you post */
  postToView: 'Post to view',

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
