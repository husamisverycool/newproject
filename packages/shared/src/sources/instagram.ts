/**
 * Instagram Instants (2026) and teen accounts. Research: research/11 §2.
 */
export const instagram = {
  /** [V] audience options */
  closeFriends: 'Close Friends',
  /** [V] "followers you follow back" */
  mutuals: 'followers you follow back',
  /** [V] "An undo button appears automatically the moment you share" */
  undo: 'Undo',
  /** [V] disappears after one view; unopened ones expire after 24 hours */
  expiry: 'Disappears after it’s viewed once',
  /** [V] launch copy "a new way to share in the moment – with spontaneous, unfiltered photos" */
  inTheMoment: 'share in the moment',

  /* ── "Add Yours" sticker (research/24 §7) → the weekly photo challenge (spec §K) ── */
  /** [V] sticker name and the viewer's button; the creator types a prompt, viewers respond with it pre-loaded */
  addYours: 'Add Yours',

  /* ── Teen Accounts (spec §S: "time on Instants counts toward Instagram daily limits") ── */
  /** [B-high] Teen Accounts setting "Daily limit" (a reminder to leave the app after a set time) */
  dailyLimit: 'Daily limit',
  /** [B-high] Teen Accounts: teens get a reminder after 60 minutes a day by default */
  teenDefaultMin: 60,
  /** [B-med] daily limit choices offered in Instagram's time settings */
  limitChoices: [15, 30, 45, 60, 120] as const,
} as const;
