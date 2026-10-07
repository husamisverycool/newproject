import { BRAND } from '../brand.ts';

/**
 * Retro (Lone Palm Labs): weekly journal, "this week in" card, Rewind tab and dial, recaps,
 * postcards, group albums, widgets, Premium. Research: research/02 and research/12.
 */
export const retro = {
  /** [V] self-description */
  tagline: 'friends-only photo journal',
  /** [V] fragment of the card at the end of the row of shared photos */
  thisWeekIn: 'this week in',

  /* ── Rewind (TechCrunch 2025-12-12; Fast Company; App Store story) ── */
  /** [V] tab label, middle of the bottom nav */
  rewind: 'Rewind',
  /** [V-weak] What's New: "Rewind, a new tab to time travel through the best memories from your camera roll" */
  rewindWhatsNew: 'Rewind, a new tab to time travel through the best memories from your camera roll',
  /** [V] "private to you — unless you choose to share" */
  rewindPrivate: 'private to you — unless you choose to share',
  /** [V-weak] App Store story: "photos from this time last year and older" */
  rewindThisTime: 'this time last year and older',
  /** [V-weak] "each week they'll get a new batch of photos to explore" */
  rewindBatch: 'a new batch of photos to explore',
  /** [V-weak] Fast Company: "Share or send the photos to a friend, or hide those they'd rather not see" */
  rewindSend: 'Send',
  /** [V-weak] */
  rewindHide: 'Hide',
  /** [V] TechCrunch: "jump to random memories" */
  rewindRandom: 'Random',
  /** [V] TechCrunch: "pause on specific moments" */
  rewindPause: 'Pause',

  /* ── Onboarding (Engadget) ── */
  /** [V-weak] "choose how frequently you wish to share photos on Retro — daily, weekly or monthly" */
  cadence: ['Daily', 'Weekly', 'Monthly'] as const,

  /* ── Recaps (App Store; TechCrunch 2023-12-07) ── */
  /** [V-weak] profile button */
  recaps: 'Recaps',
  /** [V] "Create a beautiful photo collage or video slideshow from the photos you've shared from the week, month, or year" */
  recapsLine: "Create a beautiful photo collage or video slideshow from the photos you've shared from the week, month, or year",
  /** [V-weak] durations: "the past year, a specific month, a recent week or all their photos" */
  recapRanges: { year: 'Past year', month: 'Month', week: 'Week', all: 'All photos' },
  /** [V-weak] "a collage or a video" */
  recapFormats: { collage: 'Collage', video: 'Video' },
  /** [V-weak] "a Polaroid-style border" or "fullscreen" */
  recapFrames: { polaroid: 'Polaroid', fullscreen: 'Fullscreen' },
  /** [V-weak] "share via text or Instagram in a tap" */
  shareText: 'Text',
  /** [V-weak] */
  shareInstagram: 'Instagram',

  /* ── Postcards ── */
  /** [V] feature name */
  postcards: 'print and ship postcards',
  /** [V] "your photo as a high quality postcard and send it to anyone in the world via USPS first class" */
  postcardLine: 'your photo as a high quality postcard and send it to anyone in the world via USPS first class',
  /** [V-weak] "Pick a photo, add a message, and Retro will print and mail it for you." · subst Retro→roll. */
  postcardSteps: `Pick a photo, add a message, and ${BRAND.name} will print and mail it for you.`,

  /* ── Group albums, widgets ── */
  /** [V-weak] "Start a private album and drop the link in your group chat to collect and share photos after events" */
  groupAlbum: 'Start a private album and drop the link in your group chat to collect and share photos after events',
  /** [V-weak] "See the newest posts from friends or time hop back to your own memories" */
  widgets: 'See the newest posts from friends or time hop back to your own memories',
  /** [V-weak] widget label fragment */
  timeHop: 'time hop',

  /* ── Premium (Threads post; Engadget) ── */
  /** [V] product name "Retro Premium" */
  premium: 'Premium',
  /** [V-weak] "There will ALWAYS be a free tier with unlimited photos and friends." */
  alwaysFree: 'There will ALWAYS be a free tier with unlimited photos and friends.',
  /** [V-weak] perks "new recaps styles, unlimited keys for close friends, unlimited profile history, and unlimited videos" */
  perkRecapStyles: 'New recap styles',
  /** [V-weak] */
  perkHistory: 'Unlimited profile history',
  /** [V-weak] "video, GIF and sticker comments" */
  perkComments: 'Video, GIF and sticker comments',
  /** [V] referral: 5 friends = a year; spec §R adapts to a group reaching 8 */
  referral: (n: number) => `referring ${n} new friends`,
} as const;
