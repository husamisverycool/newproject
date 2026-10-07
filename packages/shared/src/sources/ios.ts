/**
 * Apple iOS system wording. Locket, BeReal, Retro and Yope are native iPhone apps; where their own
 * wording is unknown, the platform's standard control label is what such an app shows by default.
 * Source: Apple Human Interface Guidelines and the stock iOS apps. [HIG]
 */
export const ios = {
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
} as const;
