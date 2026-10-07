/**
 * Apple iOS system wording. Locket, BeReal, Retro and Yope are native iPhone apps; where their own
 * wording is unknown, the platform's standard control label is what such an app shows by default.
 * Source: Apple Human Interface Guidelines and the stock iOS apps. [HIG]
 */
export const ios = {
  /** [HIG] Contacts address field labels, used for Retro's "Mailing Address" [I] */
  addressFields: ['Name', 'Street', 'City, State', 'ZIP'] as const,
  /** [HIG] the two system surfaces */
  lockScreen: 'Lock Screen',
  /** [HIG] */
  homeScreen: 'Home Screen',
  /** [I] locket-02/-05: the stock apps around the Locket widget (name + icon color) */
  homeApps: [
    { name: 'Calendar', bg: '#ffffff' },
    { name: 'Photos', bg: '#ffffff' },
    { name: 'Notes', bg: '#ffffff' },
    { name: 'Clock', bg: '#ffffff' },
    { name: 'App Store', bg: '#1d8af8' },
    { name: 'Maps', bg: '#7fd47f' },
    { name: 'Podcasts', bg: '#9b4fdc' },
  ] as const,
  /** [I] locket-05: dock */
  dockApps: [
    { name: 'Phone', bg: '#34c759' },
    { name: 'Safari', bg: '#ffffff' },
    { name: 'Messages', bg: '#34c759' },
    { name: 'Music', bg: '#fc3c44' },
  ] as const,
  /** [HIG] standard alert / sheet buttons */
  ok: 'OK',
  /** [HIG] */
  cancel: 'Cancel',
  /** [HIG] */
  done: 'Done',
  /** [HIG] */
  edit: 'Edit',
  /** [HIG] */
  save: 'Save',
  /** [HIG] */
  delete: 'Delete',
  /** [HIG] */
  share: 'Share',
  /** [HIG] */
  close: 'Close',
  /** [HIG] navigation back button title when the previous screen has no title */
  back: 'Back',
  /** [HIG] */
  next: 'Next',
  /** [HIG] */
  continue: 'Continue',
  /** [HIG] the Settings app / an app's settings screen title */
  settings: 'Settings',
  /** [HIG] permission alert buttons (iOS 17+) */
  allow: 'Allow',
  /** [HIG] */
  dontAllow: 'Don’t Allow',
  /** [HIG] */
  notNow: 'Not Now',
  /** [HIG] */
  more: 'More',
  /** [HIG] */
  select: 'Select',
  /** [HIG] */
  copy: 'Copy',
  /** [HIG] */
  copyLink: 'Copy Link',
  /** [HIG] */
  remove: 'Remove',
  /** [HIG] */
  search: 'Search',
  /** [HIG] */
  today: 'Today',
  /** [HIG] */
  yesterday: 'Yesterday',
  /** [HIG] Photos picker */
  photos: 'Photos',
  /** [HIG] Notification Center, Lock Screen */
  notifications: 'Notifications',
  /** [HIG] lock screen glyph label */
  now: 'now',
  /** [HIG] Home Screen edit mode → widget gallery */
  addWidget: 'Add Widget',
  /** [HIG] Camera app mode label */
  modePhoto: 'PHOTO',
  /** [HIG] VoiceOver label on the Camera app shutter */
  axShutter: 'Take Picture',
  /** [HIG] VoiceOver label on the Camera app flash control */
  axFlash: 'Flash',
  /** [HIG] VoiceOver label on the Camera app camera switcher */
  axFlip: 'Switch Camera',
  /** [HIG] Photos app Library */
  photoLibrary: 'Photo Library',
  /** [HIG] Settings → Notifications → Scheduled / Focus wording */
  quietHours: 'Scheduled Summary',
  /** [HIG] Screen Time */
  screenTime: 'Screen Time',
  /** [HIG] standard sign-out row */
  signOut: 'Sign Out',
  /** [HIG] standard date-picker title used by the Contacts app for birthdays */
  birthday: 'Birthday',
  /** [HIG] weekday names (Calendar) */
  weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const,
  /** [B-high] iPod click wheel: "MENU" at the top of the wheel (Retro's dial is "iPod-inspired" [V]) */
  ipodMenu: 'MENU',
  /** [HIG] DateFormatter .long date style, e.g. "October 7, 2025" */
  longDate: (t: number) => new Date(t).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  /** [HIG] App Store button for an installed app */
  open: 'Open',
  /** [HIG] App Store button to install */
  get: 'Get',
  /** [HIG] */
  on: 'On',
  /** [HIG] */
  off: 'Off',
  /** [HIG] picker option for "no selection" (Settings → Sounds, Clock alarm sound) */
  none: 'None',
  /** [B-high] Contacts edit mode: the green ⊕ row for another date */
  addDate: 'add date',
  /** [HIG] DateFormatter template "EEEEMMMMd", e.g. "Saturday, October 17" */
  weekdayDate: (t: number) => new Date(t).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
  /** [HIG] DateFormatter template "EEEMMMd", e.g. "Sat, Oct 17" */
  shortDate: (t: number) => new Date(t).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
  /** [HIG] DateFormatter timeStyle .short, e.g. "7:00 PM" */
  time: (t: number) => new Date(t).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
  /** [HIG] DateFormatter template "EEEMMMdjmm", e.g. "Sat, Oct 17, 7:00 PM" */
  dateTime: (t: number) => new Date(t).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
  /** [HIG] Settings › Notifications › (app): the first switch */
  allowNotifications: 'Allow Notifications',
  /** [HIG] Settings › (app): the "Live Activities" switch (Locket's Rollcall runs as a Live Activity [V]) */
  liveActivities: 'Live Activities',
  /** [HIG] Settings › Focus › "Do Not Disturb" with a schedule: the stock name for nightly quiet hours */
  doNotDisturb: 'Do Not Disturb',
  /** [HIG] Focus schedule range, e.g. "10:00 PM–8:00 AM" (Apple Style Guide: en dash, no spaces, in a range) */
  timeRange: (from: string, to: string) => `${from}–${to}`,
  /** [HIG] Settings › Apple Account › iCloud: the "Storage" bar */
  storage: 'Storage',
  /** [HIG] App Review Guideline 5.1.1(v): apps that create accounts must offer account deletion ("Offering account deletion in your app") */
  deleteAccount: 'Delete Account',
  /** [HIG] StoreKit / App Review Guideline 3.1.1 restore mechanism; Locket help: "How do I restore my Locket Gold purchase?" [V] */
  restorePurchases: 'Restore Purchases',
  /** [HIG] AVPlayerViewController "Playback Speed" menu (iOS 16+): 0.5×, 1×, 1.25×, 1.5×, 2× */
  playbackSpeeds: [0.5, 1, 1.25, 1.5, 2] as const,
  /** [HIG] AVKit speed label, e.g. "1.25×" */
  speedLabel: (n: number) => `${n}×`,
  /** [HIG] AVKit menu title */
  playbackSpeed: 'Playback Speed',
  /** [HIG] Settings › General › iPhone Storage usage line, e.g. "64.2 GB of 128 GB Used" */
  ofUsed: (n: number | string, of: number | string) => `${n} of ${of} Used`,
} as const;
