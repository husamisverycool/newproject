import { BRAND } from '../brand.ts';

/**
 * Locket Widget (Locket Labs): camera home, capture review, History, reactions, friends sheet,
 * onboarding, widget, Gold, streaks and Rollcall. Research: research/01 and research/10.
 */
export const locket = {
  /* ── Onboarding (Lazyweb onboarding flow, research/01 §1.12) ── */
  /** [V-weak] "Set up my Locket" · subst Locket→roll. */
  setUp: `Set up my ${BRAND.name}`,
  /** [V-weak] "What's your name?" */
  whatsYourName: "What's your name?",
  /** [V-weak] first-name and last-name fields (placeholder wording [B-med]) */
  firstName: 'First name',
  /** [B-med] */
  lastName: 'Last name',
  /** [V-weak] primary button on every onboarding step */
  continue: 'Continue',
  /** [V-weak] contacts permission primary */
  shareAllContacts: 'Share All Contacts',
  /** [V-weak] contacts permission secondary */
  notNow: 'Not now',
  /** [V-weak] skip modal title */
  skipContacts: 'Skip contacts?',
  /** [V-weak] "0 of 5 friends added" · subst 5→2 (spec §A3: the wall unlocks at 3 members = you + 2 friends) */
  friendsAdded: (n: number, of: number) => `${n} of ${of} friends added`,
  /** [V-weak] App Store: "Locket is a widget that shows you live pictures from your friends, right on your Home Screen." · subst Locket→roll. */
  storeLine: `${BRAND.name} is a widget that shows you live pictures from your friends, right on your Home Screen.`,
  /** [V-weak] App Store: "It's like a portal to the people you care about — a little glimpse at what they're up to throughout the day." */
  storePortal: "It's like a portal to the people you care about — a little glimpse at what they're up to throughout the day.",
  /** [V] App Store subtitle "Best friends first" */
  subtitle: 'Best friends first',

  /* ── Camera home (research/10 §2 and [B]) ── */
  /** [B-med] top-centre pill: people icon + friend count, e.g. "12 Friends" */
  friendsPill: (n: number) => `${n} Friends`,
  /** [V-weak] History entry at the bottom of the camera ("tap history at the bottom") */
  history: 'History',
  /** [V-weak] tutorial wording for the video gesture */
  holdToRecord: 'HOLD DOWN to RECORD',

  /* ── Capture review ([B]) ── */
  /** [B-med] translucent caption pill on the photo */
  addAMessage: 'Add a message',
  /** [B-med] first chip in the recipient row, selected by default; "a snap goes to the entire friends list by default" [V] */
  all: 'All',
  /** [V-weak] 2022 recipient picker button "Send to friends" */
  sendToFriends: 'Send to friends',
  /** [V-weak] caption types offered on a capture */
  captionText: 'Text',
  /** [V-weak] */
  captionTime: 'Time',
  /** [V-weak] */
  captionStickers: 'Stickers',

  /* ── History ([B]) ── */
  /** [B-med] top-centre filter pill */
  everyone: 'Everyone',
  /** [B-med] reply bar placeholder */
  sendMessage: 'Send message...',
  /** [B-low] quick reactions to the right of the reply bar */
  quickReactions: ['💛', '🔥', '😍'] as const,
  /** [B-low] activity on your own photo */
  activity: 'Activity',
  /** [B-low] */
  noActivity: 'No activity yet!',
  /** [V-weak] App Store: "Scroll down in the Locket app to travel back in time and explore your History." · subst Locket→roll. */
  historyHint: `Scroll down in the ${BRAND.name} app to travel back in time and explore your History.`,
  /** [V] spec §1.2 quoting Locket: "Locket doesn't count or track reactions" · subst Locket→roll. */
  noCounts: `${BRAND.name} doesn't count or track reactions`,

  /* ── Friends sheet ([B]) ── */
  /** [B-med] "X out of 20 friends allowed" · subst 20→30 (spec §C) */
  friendsAllowed: (n: number, of: number) => `${n} out of ${of} friends allowed`,
  /** [B-low] */
  addANewFriend: 'Add a new friend',
  /** [B-low] */
  yourFriends: 'Your Friends',
  /** [B-low] */
  findFriendsFromOtherApps: 'Find friends from other apps',

  /* ── Widgets (research/10 §4) ── */
  /** [V-weak] widget gallery name */
  bestFriendWidget: 'Best Friend or Crush widget',
  /** [V-weak] button that adds another widget/Locket */
  createNew: `Create new ${BRAND.name}`,
  /** [V-weak] add-widget steps: "Long-press the Home Screen, tap "+", search "Locket", swipe through the sizes" · subst Locket→roll. */
  addWidgetSteps: [`Long-press the Home Screen`, `Tap +`, `Search “${BRAND.bare}”`, `Swipe through the sizes`] as const,

  /* ── Gold (research/10 §6; help-center perk names) ── */
  /** [V] perk */
  perkIcons: 'Custom app icons',
  /** [V] perk */
  perkRoll: 'Upload from Camera Roll',
  /** [V] perk */
  perkVideos: 'Longer videos',
  /** [V] perk */
  perkStreak: 'Streak restoration',
  /** [V] perk */
  perkNoAds: 'No Ads',
  /** [V] perk */
  perkBadge: 'Custom Gold Badge',
  /** [V] perk */
  perkThemes: 'Camera themes',
  /** [V] profile menu row that opens the paywall · "Locket Gold" */
  goldRow: 'Locket Gold',

  /* ── Streaks (research/10 §5) ── */
  /** [V] help-center name of the calendar that shows the streak icon */
  memoriesCalendar: 'Memories Calendar',
  /** [V] article title "How do I restore my Locket Streak?" */
  restoreStreak: 'Restore my streak',

  /* ── Rollcall (research/10 §7; help.locket.com "What is Rollcall?") ── */
  /** [V] "Rollcall is a feature on Locket where you can share your favorite memories from the week with your friends, every Sunday." · subst Rollcall/Locket→roll. */
  rollcallWhat: `Share your favorite memories from the week with your friends, every Sunday.`,
  /** [V] "Every Sunday, you'll get a Live Activity (it's looks similar to a notification) inviting you to share your week on Rollcall." · subst Rollcall→roll.; source typo "it's looks" corrected */
  rollcallStep1: `Every Sunday, you'll get a Live Activity (it looks similar to a notification) inviting you to share your week on ${BRAND.name}`,
  /** [V] "Tap the Live Activity and share your favorite 10 photos from the past week." */
  rollcallStep2: 'Tap the Live Activity and share your favorite 10 photos from the past week.',
  /** [V] "Once you share your Rollcall, you'll instantly see what your friends shared too." · subst Rollcall→roll */
  rollcallStep3: "Once you share your roll, you'll instantly see what your friends shared too.",
  /** [V] "Tap through everyone's Rollcalls and leave a reactions/comments!" · subst; source grammar corrected */
  rollcallStep4: "Tap through everyone's rolls and leave a reaction!",
  /** [V] official TikTok: "Recap your week, every Sunday." */
  rollcallTagline: 'Recap your week, every Sunday.',
  /** [V] Rollcall photo count */
  rollcallMax: 10,
  /** [V] inviting you to "share your week" */
  shareYourWeek: 'share your week',

  /* ── Recap (research/10 §8) ── */
  /** [V-weak] "February Recap on Locket" */
  monthRecap: (month: string) => `${month} Recap`,

  /* ── Push ([B-low]) ── */
  /** [B-low] "<Name> sent a new Locket" · subst Locket→photo */
  pushNew: (name: string) => `${name} sent a new photo`,
  /** [B-low] "<Name> reacted <emoji> to your Locket" · subst Locket→photo */
  pushReact: (name: string, emoji: string) => `${name} reacted ${emoji} to your photo`,
} as const;
