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
  /** [I] locket-06-capture: top-centre pill, people glyph + "12 Friends" */
  friendsPill: (n: number) => `${n} Friends`,
  /** [I] locket-06-capture: thumbnail + "History" + chevron under the shutter */
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
  /** [I] locket-07-history: top-centre filter pill "Everyone ⌄" */
  everyone: 'Everyone',
  /** [I] locket-07-history: reply bar placeholder */
  sendMessage: 'Send message...',
  /** [I] locket-07-history and locket-04-chat: 🔥 and 💖 inside the bar, then the smiley-plus glyph */
  quickReactions: ['🔥', '💖'] as const,
  /** [I] locket-04-chat: chat input placeholder */
  saySomething: 'Say something...',
  /** [I] locket-04-chat: centred timestamp "Today at 9:40 PM" */
  todayAt: (time: string) => `Today at ${time}`,
  /** [I] locket-04-chat "Today at 9:40 PM"; other days follow the same pattern [B-low] */
  stamp: (t: number, now: number = Date.now()) => {
    const time = new Date(t).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const day = (x: number) => new Date(x).toDateString();
    if (day(t) === day(now)) return `Today at ${time}`;
    if (day(t) === day(now - 86_400_000)) return `Yesterday at ${time}`;
    return `${new Date(t).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at ${time}`;
  },
  /** [I] locket-03-rollcall: poster row "Karima K" (first name + last initial) */
  shortName: (name: string) => {
    const [first, ...rest] = name.trim().split(/\s+/);
    const last = rest.at(-1);
    return last ? `${first} ${last[0].toUpperCase()}` : first;
  },
  /** [I] frame locket-reply-grid: "Reply to Kile" (2021 reply sheet) */
  replyTo: (name: string) => `Reply to ${name}`,
  /** [I] frame locket-reply-grid: the 2×4 emoji grid (the eighth cell is the add-emoji glyph) */
  replyGrid: ['🫶', '💕', '😍', '🤣', '😋', '🥰', '😱'] as const,
  /** [I] frame locket-review-sendto: header over the photo "Send to" / name */
  sendTo: 'Send to',
  /** [I] locket-07-history "36m", locket-04-chat "1hr"; days [B-low] "d"; under a minute [B-low] "now" */
  ago: (ms: number) => {
    const m = Math.floor(ms / 60_000);
    if (m < 1) return 'now';
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}hr`;
    return `${Math.floor(h / 24)}d`;
  },
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
  /** [I] frame locket-widget-gallery: "Locket Widget" · subst Locket→roll. */
  widgetTitle: `${BRAND.name} Widget`,
  /** [I-partial] frame locket-widget-gallery: "…ve pics from all your friends / …ht on your Home Screen" */
  widgetDescription: 'Live pics from all your friends right on your Home Screen',
  /** [I] frame locket-widget-gallery: empty widget shows three avatars in yellow rings + "26 Friends" */
  widgetFriends: (n: number) => `${n} Friends`,
  /** [V-weak] button that adds another widget/Locket */
  createNew: `Create new ${BRAND.name}`,
  /** [I] frame locket-add-widget-steps (Locket TikTok): "1. Edit Home Screen", "2. Click on + in left corner", "3. Search Locket and Add Widget" · subst Locket→roll. */
  addWidgetSteps: ['1. Edit Home Screen', '2. Click on + in left corner', `3. Search ${BRAND.bare} and Add Widget`] as const,

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
  /** [I] locket-03-rollcall: header "Rollcall" with the megaphone glyph · subst Rollcall→roll. */
  rollcallTitle: BRAND.name,
  /** [I] locket-03-rollcall: "JAN 19–25" (uppercase month, en dash; a range crossing months repeats the month [B-low]) */
  rollcallRange: (start: number, end: number) => {
    const a = new Date(start);
    const b = new Date(end);
    const mon = (d: Date) => d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    return a.getMonth() === b.getMonth() ? `${mon(a)} ${a.getDate()}–${b.getDate()}` : `${mon(a)} ${a.getDate()}–${mon(b)} ${b.getDate()}`;
  },

  /* ── Store panels (locket-01…07): glyph + label, then headline ── */
  /** [I] App Store panels, in Locket's order · "Locket Widget" subst Locket→roll. */
  panels: [
    { glyph: 'heart', label: `${BRAND.name} Widget`, headline: 'Add your best friends to your Home Screen' },
    { glyph: 'paperplane', label: 'Send', headline: 'Send pics to friends’ Home Screens' },
    { glyph: 'megaphone', label: 'Rollcall', headline: 'Weekly photo dumps with your best friends' },
    { glyph: 'chat', label: 'Chat', headline: 'Reply to your friends’ pics' },
    { glyph: 'sparkle', label: 'Receive', headline: 'See new pictures throughout the day' },
    { glyph: 'aperture', label: 'Capture', headline: 'Tap the widget to open the camera' },
    { glyph: 'photos', label: 'History', headline: 'Explore your History to travel back in time' },
  ] as const,

  /* ── Recap (research/10 §8) ── */
  /** [V-weak] "February Recap on Locket" */
  monthRecap: (month: string) => `${month} Recap`,

  /* ── Push ([B-low]) ── */
  /** [B-low] "<Name> sent a new Locket" · subst Locket→photo */
  pushNew: (name: string) => `${name} sent a new photo`,
  /** [B-low] "<Name> reacted <emoji> to your Locket" · subst Locket→photo */
  pushReact: (name: string, emoji: string) => `${name} reacted ${emoji} to your photo`,
} as const;
