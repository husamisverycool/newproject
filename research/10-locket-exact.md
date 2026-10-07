# 10: Locket Widget (Locket Labs), exact UI details

Cluster 1 research for the friend-group camera rebuild. Compiled 2026-10-07.

## How to read this file

- **Method.** The only tool was WebSearch. Pages were never opened directly: curl and WebFetch are blocked, and reddit.com and theverge.com are refused even as search filters.
- **Quotes.** Quoted strings are the wording reported in search-result snippets and summaries for the cited URL. They are as close to verbatim as the snippets allow. Capitalisation could not be checked against the live app.
- **Tags.**
  - **[V]**: two or more sources agree, or the source is an official Locket help-center or App Store page.
  - **[V-weak]**: one third-party snippet, tutorial or review.
  - **[B]**: the researcher's own background knowledge, not verified. These appear only in the separate BACKGROUND KNOWLEDGE section.
- **Search budget.** 26 of 26 WebSearch calls were used, counting 2 calls the domain filter refused.
- **Help-center domains.** The live help center is **help.locket.com**. **help.locketcamera.com** serves the same article IDs, apparently as a mirror or the older domain. help.locket.camera never came up.
- **Related file.** `01-locket-lapse-dispo.md` already covers the icon, the corner-icon layout, the yellow video outline, emoji rain and early onboarding. This file adds to it and does not repeat it.

---

## 1. Brand and App Store metadata

| Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|
| App Store | App name | "Locket Widget" | https://apps.apple.com/us/app/locket-widget/id1600525061 | [V] |
| App Store | Subtitle | "Best friends first" | https://apps.apple.com/us/app/locket-widget/id1600525061 | [V-weak] (search summary of the App Store page) |
| App Store | Description line | "Locket is a widget that shows live photos from your best friends, right to your Home Screen." (as reported) | https://apps.apple.com/us/app/locket-widget/id1600525061 | [V-weak] |
| App Store | Description line | "You and your best friends will see new pictures from each other every time you unlock your phone." (as reported) | https://apps.apple.com/us/app/locket-widget/id1600525061 | [V-weak] |
| App Store | Description line | "when a friend sends you a photo, it instantly appears on your Locket widget!" (as reported; preceded by "Add the Locket widget to your Home Screen") | https://apps.apple.com/us/app/locket-widget/id1600525061 | [V-weak] |
| App Store | Description, friend cap | "your significant other or up to 20 of your closest friends" | https://apps.apple.com/us/app/locket-widget/id1600525061 ; https://help.locketcamera.com/en/articles/7915024-how-many-friends-can-i-have-on-locket | [V] (free tier cap is 20; Gold is "Unlimited Friends") |
| App Store | What's New, v2.64.0 (Sep 11, 2025) | Mentions "chat reactions" and Lockets from "favorite artists" (paraphrased by the summary; exact note text not captured) | https://mwm.ai/apps/locket-widget/1600525061 | [V-weak] |
| App Store | Recent version | 2.67.0 (date relative to the crawl; not pinned) | https://mwm.ai/apps/locket-widget/1600525061 | [V-weak] |
| Press | Scale | Over 91 million total installs (iOS and Android), Nov 2025 | https://techcrunch.com/2025/11/03/lockets-social-app-is-picking-up-steam-with-gen-alpha | [V] |
| Help center | Collection names | "Locket Basics", "Rollcall", "Streaks", "Locket Gold", "Features", "Overview" | https://help.locket.com/en/collections/19136404-locket-basics ; https://help.locket.com/en/collections/19149021-rollcall ; https://help.locket.com/en/collections/19149011-streaks ; https://help.locket.com/en/collections/19148119-locket-gold ; https://help.locket.com/en/collections/19148956-features ; https://help.locket.com/en/collections/19148281-overview | [V] |
| Help center | Article titles (usable as FAQ copy) | "What is Rollcall?" · "What is Locket Gold and what features are included?" · "How do I restore my Locket Streak?" · "How do I restore my Locket Gold purchase?" · "How do I request a refund for Locket Gold?" · "How do I connect Spotify or Apple Music to Locket?" · "How do I capture video on Locket?" · "How do I add friends on Locket?" · "How do I unfriend someone?" · "How do I block someone on Locket?" · "How many friends can I have on Locket?" · "How do I share past Lockets with new friends?" · "How is Locket different from other social media?" · "My teen asked me to get Locket. What is it?" · "What is the Locket Leader program?" | help.locket.com article URLs listed in Sources | [V] |
| Brand | Content noun | A posted photo is called "a Locket" (plural "Lockets"), e.g. "upload a Locket from your camera roll" | https://help.locket.com/en/articles/14189020-how-do-i-restore-my-locket-streak | [V] |

## 2. Camera screen and capture

| Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|
| Camera | Profile entry point | Profile icon in the **top-left corner**. Tapping it opens a menu that contains "Locket Gold". | https://mrhack.io/how-to-upgrade-to-locket-gold-subscription/ | [V-weak] |
| Camera | Messages entry point | Messages icon in the **top-right corner** ("Messages tab located in the top right corner") | https://mrhack.io/messages-in-locket-widget-app-full-overview-how-to-send-messages/ ; https://mrhack.io/how-to-comment-or-reply-via-text-in-locket-widget-app/ | [V] (several mrhack pages, one author) |
| Camera | History entry point | "tap history at the bottom" of the camera screen. Swiping up also works (see 01 file). | https://mrhack.io/how-to-see-history-in-locket-widget-app/ | [V-weak] |
| Camera | Video gesture | Hold the shutter to record. Tutorial title wording: "HOLD DOWN to RECORD". | https://mrhack.io/locket-hold-down-to-record-how-to-make-videos-7/ ; https://help.locketcamera.com/en/articles/7915017-how-do-i-capture-video-on-locket | [V-weak] (exact on-screen hint text unverified) |
| Camera | Video length | Gold: "up to 10 seconds". Free length UNKNOWN. | https://help.locketcamera.com/en/articles/11057185-what-is-locket-gold-and-what-features-are-included | [V-weak] |
| Capture | Caption types | Text, Location, Time, Weather, Stickers, "Now Playing" (music) | https://mrhack.io/how-to-add-captions-in-locket-widget-app/ ; https://mrhack.io/how-to-add-music-in-locket-widget/ | [V-weak] |
| Capture | Caption position | Caption or message sits "at the bottom" of the photo | https://mrhack.io/can-you-add-captions-in-locket-widget-app/ | [V-weak] |
| Capture (2022, v1.1) | Recipient picker (historical) | "Pick Friends" button below the send button, then "Send to friends". Added in v1.1 on Jan 26, 2022. The current UI likely differs (see [B]). | https://screenrant.com/locket-widget-send-picture-to-one-person-how/ | [V-weak] (outdated) |
| Capture | Default audience | A snap goes to the **entire friends list** by default. | https://screenrant.com/locket-widget-send-picture-to-one-person-how/ ; https://mrhack.io/can-you-send-pictures-to-specific-people-in-locket-widget/ | [V] |

## 3. History, reactions, messages, activity

| Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|
| History | Navigation | Swipe up or down to move between photos | https://mrhack.io/how-to-see-history-in-locket-widget-app/ | [V-weak] |
| History | Overflow menu | Three-dot menu with a delete option (removes the photo from your personal history) | https://mrhack.io/how-to-delete-locket-from-history-in-locket-widget-app/ ; https://mrhack.io/how-to-see-history-in-locket-widget-app/ | [V-weak] |
| History | Contents | Shows the Lockets you sent and the ones that appeared on your widget | https://mrhack.io/how-to-see-history-in-locket-widget-app/ | [V-weak] |
| Reactions | Interaction | Tap a reaction emoji on a Locket to react. Emoji rain is covered in the 01 file. | https://mrhack.io/how-to-send-reactions-in-locket-widget-app/ | [V-weak] |
| Messages | Feature name | "Locket Messages" | https://mrhack.io/messages-in-locket-widget-app-full-overview-how-to-send-messages/ | [V-weak] |
| Messages | Flow | Open a Locket, type a reply, and the conversation appears in the Messages inbox (top-right). Tap a contact to open the chat. | https://mrhack.io/how-to-reply-to-locket-send-a-message-in-locket-widget-app/ ; https://mrhack.io/how-to-comment-or-reply-via-text-in-locket-widget-app/ | [V-weak] |
| Messages | Chat reactions | "chat reactions" shipped in v2.64.0 (Sep 2025) | https://mwm.ai/apps/locket-widget/1600525061 | [V-weak] |
| Activity | Viewers (Gold) | Gold feature named "Locket Views": see who opened your Lockets | https://mrhack.io/how-to-see-who-viewed-your-locket-via-locket-gold/ | [V-weak] |
| Sharing | Past Lockets | Help article "How do I share past Lockets with new friends?" confirms the feature. UI copy not captured. | https://help.locket.com/en/articles/10927024-how-do-i-share-past-lockets-with-new-friends | [V] (existence only) |

## 4. Widgets (Home Screen, Best Friend or Crush, multiple Lockets)

| Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|
| Widget | Special widget name | "Best Friend or Crush widget". In the iOS widget gallery, search "Locket" and swipe left until it appears. | https://mrhack.io/how-to-add-best-friend-or-crush-widget-in-locket-widget-app/ | [V-weak] |
| Widget | Configuration | Can be set to one individual friend or a group | https://mrhack.io/how-to-add-best-friend-or-crush-widget-in-locket-widget-app/ | [V-weak] |
| Widget | Multiple widgets: button label | "Create new Locket". Flow: tap the top-left icon, tap the **yellow button at the bottom**, choose "Create new Locket", then add the widget and pick friends. | https://mrhack.io/how-to-add-best-friend-or-crush-widget-in-locket-widget-app/ ; https://mrhack.io/how-to-add-separate-widgets-for-different-people-in-locket-widget-app/ | [V-weak] |
| Widget | Add-widget steps (OS copy) | Long-press the Home Screen, tap "+" (top right in recent iOS), search "Locket", swipe through the sizes | https://mrhack.io/how-to-add-best-friend-or-crush-widget-in-locket-widget-app/ | [V-weak] |

## 5. Streaks

| Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|
| Streaks | Feature name | "Locket Streak" (article title "How do I restore my Locket Streak?") | https://help.locket.com/en/articles/14189020-how-do-i-restore-my-locket-streak | [V] |
| Streaks | Calendar surface name | "Memories Calendar". It shows a streak icon. | https://help.locket.com/en/articles/14189020-how-do-i-restore-my-locket-streak ; https://help.locketcamera.com/en/articles/14189020-how-do-i-restore-my-locket-streak | [V] |
| Streaks | Restore flow | 1. Open Locket. 2. Open the Memories Calendar. 3. Tap the streak icon on the calendar. 4. Upload a Locket from your camera roll to fill the missed day. | same as above | [V] |
| Streaks | Restore rules | Gold only. Must be done within **one day** of losing the streak, after which it resets for good. Must use a camera-roll upload, not a new in-app photo. | same as above | [V] |

## 6. Locket Gold (subscription and paywall)

| Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|
| Gold | Product name | "Locket Gold" | https://help.locket.com/en/articles/11057185-what-is-locket-gold-and-what-features-are-included | [V] |
| Gold | Perk list (help-center order and wording as reported) | "Custom app icons" · "Upload from Camera Roll" · "Unlimited Friends" · "Longer videos" · "Streak restoration" · "No Ads" · "Custom Gold Badge" · "Camera themes" | https://help.locket.com/en/articles/11057185-what-is-locket-gold-and-what-features-are-included ; https://help.locketcamera.com/en/articles/11057185-what-is-locket-gold-and-what-features-are-included | [V] (items) / capitalisation [V-weak] |
| Gold | Extra perk (third party) | "Locket Views" (who opened your Locket) | https://mrhack.io/how-to-see-who-viewed-your-locket-via-locket-gold/ | [V-weak] |
| Gold | Entry point | Profile icon (top-left), then "Locket Gold" row in the menu | https://mrhack.io/how-to-upgrade-to-locket-gold-subscription/ | [V-weak] |
| Gold | Price | Conflicting: "$3.99 per month" / "$36 per year" vs "$4.99 a month or $45 a year". Region- and time-dependent. | https://mrhack.io/how-to-upgrade-to-locket-gold-subscription/ ; https://techweez.com/2026/06/26/locket-app-review-photo-widget-social-app/ | [V-weak] (conflict) |
| Gold | Paywall flows exist | Lazyweb catalogues "Paywall" and "Locked Feature Paywall" flows. Screen text was not retrievable. | (see 01 file) | [V-weak] |

## 7. Rollcall

| Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|
| Rollcall | Official definition | "Rollcall is a feature on Locket where you can share your favorite memories from the week with your friends, every Sunday." | https://help.locket.com/en/articles/11057175-what-is-rollcall | [V] |
| Rollcall | Step 1 | "Every Sunday, you'll get a Live Activity (it's looks similar to a notification) inviting you to share your week on Rollcall." (the typo "it's" is in the source) | https://help.locket.com/en/articles/11057175-what-is-rollcall | [V] |
| Rollcall | Step 2, photo count | "Tap the Live Activity and share your favorite 10 photos from the past week." | https://help.locket.com/en/articles/11057175-what-is-rollcall | [V] |
| Rollcall | Step 3, reveal | "Once you share your Rollcall, you'll instantly see what your friends shared too." | https://help.locket.com/en/articles/11057175-what-is-rollcall | [V] |
| Rollcall | Step 4 | "Tap through everyone's Rollcalls and leave a reactions/comments!" (source grammar) | https://help.locket.com/en/articles/11057175-what-is-rollcall | [V] |
| Rollcall | Gating | Posting unlocks everyone else's Rollcall. You can then "scroll through their weeks, react with emojis, or leave quick comments". | https://imp.news/apps-and-software/rollcall-and-real-friends-the-rise-of-locket-among-the-youngest-users-74019/ ; help article above | [V] (gating also implied by the help article) |
| Rollcall | Audience | Shared with a wider group of friends, not only the widget pair | https://techcrunch.com/2025/11/03/lockets-social-app-is-picking-up-steam-with-gen-alpha | [V] |
| Rollcall | Surfaces | Live Activity on the Lock Screen and in the Dynamic Island. TechCrunch frames it as relying on the Live Activities features of iOS 18. | https://techcrunch.com/2025/11/03/lockets-social-app-is-picking-up-steam-with-gen-alpha ; https://mezha.net/eng/bukvy/locket-rollcall-boosts-gen-alpha-engagement-with-ios-live-activities/ | [V] |
| Rollcall | Lifetime | Rollcall photos stay up for 7 days and then disappear | https://instapv.co.uk/rollcall-app/ | [V-weak] (low-quality site) |
| Rollcall | Push copy (reported) | "Time for Rollcall – share your week!" (the source hedges with "something like") | https://instapv.co.uk/rollcall-app/ | [V-weak] (likely paraphrase; do not ship as verbatim) |
| Rollcall | Official launch tagline | "Recap your week, every Sunday. Introducing Rollcall, new on Locket 📣" (TikTok caption, @locketcamera) | https://www.tiktok.com/@locketcamera/video/7460656081153445163 | [V] (official account) |
| Rollcall | Metrics | Over 1M shares in the first week. More than a quarter of active users post a Rollcall every week. | https://techcrunch.com/2025/11/03/lockets-social-app-is-picking-up-steam-with-gen-alpha | [V] |

## 8. Recaps, Locket Looks, Celebrity Lockets, music

| Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|
| Recap | Monthly recap | An automatic monthly recap (video montage of the month's Lockets). TikTok search terms show users call it "monthly recap" / "Locket Recap". | https://www.tiktok.com/discover/how-to-get-monthly-recap-on-locket ; https://www.tiktok.com/@hachishigatsu/video/7582174535005310215 | [V-weak] |
| Recap | Official monthly post | "February Recap on Locket: Share Your Moments 🌟💛" (TikTok title, @locketcamera) | https://www.tiktok.com/@locketcamera/video/7069892557970345259 | [V-weak] |
| Recap | Year-end teaser copy | "Check your Locket today for a surprise! Here's to 2023! 🎉💐🎊🥳" with hashtag #locketrecap | https://www.tiktok.com/@locketcamera/video/7182656074468674859 | [V] (official account) |
| Locket Looks | Definition | An AI selfie feature for making and sharing "fun, personal, and creative selfies in Locket using AI" with close friends | https://www.prnewswire.com/news-releases/locket-solidifies-itself-as-go-to-social-platform-for-teens-and-young-adults-302826786.html ; https://blog.crescitaly.com/locket-looks-private-ai-selfies-social-growth-2026/ | [V] |
| Locket Looks | Partner and model | Google DeepMind. Locket is a launch partner for the "Nano Banana 2 Lite" model. | https://www.prnewswire.com/news-releases/locket-solidifies-itself-as-go-to-social-platform-for-teens-and-young-adults-302826786.html | [V-weak] |
| Locket Looks | Announce date | July 15, 2026 | same as above | [V-weak] |
| Locket Looks | Launch stats | Over 2M images expected in the first few days. Over 30% of active users adopted it in early tests. | same as above | [V-weak] |
| Celebrity Lockets | Feature name | "Celebrity Lockets" (music-artist focused; tested for about 6 months before Aug 2025) | https://techcrunch.com/2025/08/06/photo-sharing-app-locket-is-banking-on-a-new-celebrity-focused-feature-to-fuel-its-growth/ | [V] |
| Celebrity Lockets | Names | **Suki Waterhouse**, **JVKE** ("more artists to be announced") | same as above | [V] |
| Celebrity Lockets | Stat | Suki Waterhouse had 5,000 fans on the app, 17% of them new to Locket | same as above | [V] |
| Music | Connect label | "Add Music", then pick Spotify or Apple Music and log in | https://help.locket.com/en/articles/7914992-how-do-i-connect-spotify-or-apple-music-to-locket ; https://mrhack.io/how-to-add-music-in-locket-widget/ | [V] |
| Music | Caption name | "Now Playing" caption, which auto-fills the song you are playing | https://help.locket.com/en/articles/7914992-how-do-i-connect-spotify-or-apple-music-to-locket | [V] |
| Music | Behavior | Apple Music: the song must be actively playing while you make the Locket. Spotify: you can pause and resume. Tapping the song on a received Locket opens Spotify or Apple Music. | https://help.locket.com/en/articles/7914992-how-do-i-connect-spotify-or-apple-music-to-locket | [V] |

---

## BACKGROUND KNOWLEDGE [B]

These items are not verified. They come from the researcher's memory of the app (roughly 2024 and 2025 builds). Each has a confidence level. **Do not ship any [B] string as "copied" without screenshot confirmation.**

| Surface | Element | Recalled value | Confidence | Tag |
|---|---|---|---|---|
| Camera | Top bar layout | Left: circular profile avatar. Center: pill button with a people icon and friend count (e.g. "12 Friends"). Right: chat-bubble icon with an unread dot. | medium | [B] |
| Camera | Viewfinder shape | Square (1:1) viewfinder with large rounded corners (roughly a 40–60pt radius on about a 350pt square), on a black background | high (square, rounded) / low (radius) | [B] |
| Camera | Zoom control | Small "1×" toggle (switches to "0.5×") overlaid near the bottom of the viewfinder | low | [B] |
| Camera | Shutter | Large white circle inside a yellow/gold ring. Flash bolt on the left, flip-camera arrows on the right (flip is also on double-tap). | medium | [B] |
| Camera | History affordance | Bottom center: a small thumbnail of the last Locket plus the label "History" and a down chevron | medium | [B] |
| Typography | Font | SF Pro Rounded, heavy/bold weights for titles and pills | medium | [B] |
| Color | Yellow | A warm yellow close to #FFC300–#FFD60A. Exact hex unknown. | low | [B] |
| Capture review | Caption pill | Translucent dark pill on the photo reading "Add a message" | medium | [B] |
| Capture review | Controls | Left: "X" discard. Center: large send button (paper-plane glyph). Right: download/save. | medium | [B] |
| Capture review | Recipient row | Horizontal row of avatar circles under the controls. The first is "All" (selected by default), followed by each friend's avatar and first name. | medium | [B] |
| History | Filter | Top-center dropdown pill "Everyone" that filters by friend | medium | [B] |
| History | Grid toggle | A grid icon (bottom-left) switches the single view to a 3-column grid of rounded squares | medium | [B] |
| History | Single view | Full-width rounded square photo. Sender avatar, first name and relative time (e.g. "2h") under it. Reply bar at the bottom. | medium | [B] |
| Reply bar | Placeholder | "Send message..." in a dark rounded field, with quick-reaction emojis (💛 🔥 😍) and an add-emoji button to the right | medium (placeholder) / low (emoji set) | [B] |
| Activity | Own Locket | An "Activity" row (sparkle icon) on your own Locket that lists who reacted. Empty state like "No activity yet!" | low | [B] |
| Friends sheet | Header copy | "X out of 20 friends allowed" counter at the top of the friends sheet (free tier) | medium | [B] |
| Friends sheet | Sections | Search field ("Add a new friend"), "Find friends from other apps" with Messenger/Instagram/Messages/Other icons, a "Your Friends" list, and a share-link button | medium (sections) / low (exact strings) | [B] |
| Onboarding | Order | Phone number, SMS code, name ("What's your name?"), birthday, contacts permission ("Share All Contacts" / "Not now"), add friends ("0 of 5 friends added"), add-widget tutorial | medium | [B] |
| Onboarding | Birthday question | "When's your birthday?" | low | [B] |
| Push | New Locket | "<Name> sent a new Locket" style | low | [B] |
| Push | Reaction | "<Name> reacted <emoji> to your Locket" style | low | [B] |
| Widget | Layout | Full-bleed photo with a small circular sender avatar overlaid in a corner, and the caption at the bottom | low | [B] |
| Streaks | Display | Streak count with a flame-like or yellow icon, shown on the profile/calendar and on friend chips | low | [B] |
| Gold | Paywall | Dark background, gold-gradient "Locket Gold" title, perk list with icons, and a yellow full-width CTA (wording possibly "Continue" or "Try Locket Gold") | low | [B] |
| Gold | Badge | Small gold badge or pill next to the user's name | low | [B] |
| Rollcall | Live Activity | Shows "Rollcall" title, a row of avatars of friends who already posted, and a CTA to share your week. A countdown until it closes is possible. | low | [B] |
| Rollcall | Composer | Opens a camera-roll picker preselected with the last 7 days, select up to 10, optional per-photo caption, then post | low-medium (10-photo cap verified; rest [B]) | [B] |
| Haptics | Capture | Light impact haptic on shutter press | low | [B] |

---

## Gaps (UNKNOWN after 26 searches)

- **Hex colors.** Locket yellow, Gold gradient and background blacks: UNKNOWN.
- **Fonts.** Typeface is UNKNOWN; no source names it.
- **SF Symbol names.** UNKNOWN for all icons.
- **Sizes and corner radii.** Viewfinder corner radius, widget layout and button sizes: UNKNOWN.
- **Current send-to selector label.** "All" vs "Everyone": UNKNOWN (only the 2022 "Pick Friends" / "Send to friends" strings were found).
- **Caption placeholder text.** UNKNOWN ("Add a message" is [B] only).
- **Reply bar placeholder.** UNKNOWN ("Send message..." is [B] only).
- **History grid vs single view toggle.** UNKNOWN beyond swipe navigation and the three-dot delete.
- **Activity view copy.** "Who reacted/viewed" layout, labels and empty states: UNKNOWN. "Locket Views" is the only name found.
- **Rollcall Live Activity.** Exact text, layout, countdown and Dynamic Island compact/expanded presentation: UNKNOWN.
- **Rollcall composer.** Caption support and photo-picker UI: UNKNOWN.
- **Rollcall launch date.** The brief's date (Oct 12, 2025) was not confirmed. The official TikTok post "Introducing Rollcall, new on Locket" has an ID that encodes a date around Jan 2025 (researcher inference from TikTok's ID scheme). TechCrunch covered Rollcall as "its latest feature" on Nov 3, 2025. Reconcile before relying on any date.
- **Rollcall push copy.** The verified wording is only the help-center phrase "inviting you to share your week on Rollcall". "Time for Rollcall – share your week!" comes from one low-quality site.
- **Gold paywall.** Headline, bullet icons, CTA label, trial terms and legal footer: UNKNOWN. Price conflicts between sources.
- **Custom app icons and camera themes.** Names, count and visuals of each: UNKNOWN.
- **Gold badge.** Appearance: UNKNOWN.
- **Streak UI.** Icon, count placement and wording of the at-risk or lost warning: UNKNOWN.
- **Push notifications.** No verified push copy for new Locket, reaction, message or streak.
- **Settings screen.** Row labels: UNKNOWN beyond "Locket Gold" in the profile menu.
- **Onboarding.** Permission pre-prompt copy (camera, notifications), birthday step and widget tutorial copy: UNKNOWN beyond the strings already known.
- **Monthly recap.** Title format, music and placement in the app: UNKNOWN.
- **Locket Looks UI.** Entry point, style or preset names, generation flow, labels and disclaimer text: UNKNOWN.
- **Celebrity Lockets.** Only two names found (Suki Waterhouse, JVKE). The celebrity profile UI and verified badge: UNKNOWN.
- **Music caption visuals.** Album-art chip vs text: UNKNOWN.
- **Animations.** Emoji-rain timing, shutter animation and transitions: UNKNOWN.

## Sources

- https://help.locket.com/en/articles/11057175-what-is-rollcall
- https://help.locket.com/en/collections/19149021-rollcall
- https://help.locket.com/en/articles/11057185-what-is-locket-gold-and-what-features-are-included
- https://help.locketcamera.com/en/articles/11057185-what-is-locket-gold-and-what-features-are-included
- https://help.locket.com/en/articles/14189020-how-do-i-restore-my-locket-streak
- https://help.locket.com/en/articles/7914992-how-do-i-connect-spotify-or-apple-music-to-locket
- https://help.locket.com/en/articles/10927024-how-do-i-share-past-lockets-with-new-friends
- https://help.locketcamera.com/en/articles/7915024-how-many-friends-can-i-have-on-locket
- https://help.locketcamera.com/en/articles/7915017-how-do-i-capture-video-on-locket
- https://apps.apple.com/us/app/locket-widget/id1600525061
- https://mwm.ai/apps/locket-widget/1600525061
- https://techcrunch.com/2025/11/03/lockets-social-app-is-picking-up-steam-with-gen-alpha
- https://techcrunch.com/2025/08/06/photo-sharing-app-locket-is-banking-on-a-new-celebrity-focused-feature-to-fuel-its-growth/
- https://mezha.net/eng/bukvy/locket-rollcall-boosts-gen-alpha-engagement-with-ios-live-activities/
- https://imp.news/apps-and-software/rollcall-and-real-friends-the-rise-of-locket-among-the-youngest-users-74019/
- https://instapv.co.uk/rollcall-app/
- https://www.prnewswire.com/news-releases/locket-solidifies-itself-as-go-to-social-platform-for-teens-and-young-adults-302826786.html
- https://blog.crescitaly.com/locket-looks-private-ai-selfies-social-growth-2026/
- https://www.tiktok.com/@locketcamera/video/7460656081153445163
- https://www.tiktok.com/@locketcamera/video/7069892557970345259
- https://www.tiktok.com/@locketcamera/video/7182656074468674859
- https://www.tiktok.com/discover/how-to-get-monthly-recap-on-locket
- https://screenrant.com/locket-widget-send-picture-to-one-person-how/
- https://techweez.com/2026/06/26/locket-app-review-photo-widget-social-app/
- mrhack.io tutorials: how-to-upgrade-to-locket-gold-subscription, messages-in-locket-widget-app-full-overview-how-to-send-messages, how-to-comment-or-reply-via-text-in-locket-widget-app, how-to-reply-to-locket-send-a-message-in-locket-widget-app, how-to-send-reactions-in-locket-widget-app, how-to-see-history-in-locket-widget-app, how-to-delete-locket-from-history-in-locket-widget-app, how-to-see-who-viewed-your-locket-via-locket-gold, how-to-add-best-friend-or-crush-widget-in-locket-widget-app, how-to-add-separate-widgets-for-different-people-in-locket-widget-app, how-to-add-captions-in-locket-widget-app, can-you-add-captions-in-locket-widget-app, how-to-add-music-in-locket-widget, locket-hold-down-to-record-how-to-make-videos-7, can-you-send-pictures-to-specific-people-in-locket-widget (all at https://mrhack.io/<slug>/)
