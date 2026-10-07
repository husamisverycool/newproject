# Research dossier 01: Locket Widget (main), Lapse, Dispo

Status: **INCOMPLETE.** The shared web-search budget for this turn (200 calls across all agents) ran out after about 41 searches, all of them on Locket. **Lapse and Dispo were not researched at all** (see the Gaps section).

## How to read this document

- **Method.** WebSearch was the only tool available. App Store pages, company sites, press sites, Reddit and Medium could not be fetched. Everything below comes from the search tool's result listings and the result summaries it generates. **Text in quotation marks is the wording those summaries reported for the cited page. It was not checked against the live page**, so treat quotes as near-verbatim, not guaranteed verbatim.
- **Confidence tags.**
  - `[multi]`: two or more independent sources agree.
  - `[single]`: one source.
  - `[inferred]`: researcher interpretation, labelled as such.
- **Missing values.** Any value not found in a source is written as **UNKNOWN**. No hex codes, font names or copy strings were invented.
- **Dates.** Several Locket sources date from January to August 2022, when the app launched. The UI may have changed since. Each source's date is noted where known.

---

# 1. Locket Widget (Locket Labs, Inc.)

## 1.1 Brand

### App icon
- The icon is yellow with a heart. One source describes the app as "a yellow icon with a heart in the middle." [multi]
  - https://www.protectyoungeyes.com/apps/locket-widget-app-review
  - https://www.bark.us/app-reviews/apps/locket-widget-review/ (the logo image's alt text is "locket logo, yellow heart")
  - https://fueled.com/blog/locket-photo-sharing-widget/
- The heart is a cutout. Fueled says "the app's icon has a slight texture and a drop shadow within the cutout heart." [single] https://fueled.com/blog/locket-photo-sharing-widget/ (2022)
- Exact icon yellow: **UNKNOWN**.

### Brand color (hex)
- **UNKNOWN (no verified value).**
- One search surfaced a Brandfetch listing at https://brandfetch.com/locketconnect.com giving "Yellow Orange #FFA242" (RGB 255,162,66).
  - **Caution:** that listing belongs to the domain `locketconnect.com`. No source confirms that this domain belongs to Locket Labs. Locket Labs' own properties seen in results are `locket.camera` / `locketcamera.com` (help center at help.locketcamera.com, TikTok handle @locketcamera) and `help.locket.com`.
  - Status: **not attributable to Locket Widget**. Listed only so the team knows it exists and is unverified. [single, unverified attribution]

### Wordmark / logo letterforms
- Case, weight and letterforms: **UNKNOWN.**
- No source described the wordmark.

### Design-language descriptions from sources
- Fueled (2022): the app "is wonderfully simple, clean, and even brings back a bit of much-loved skeuomorphic design language." [single] https://fueled.com/blog/locket-photo-sharing-widget/
- Vietnamese guides: the interface is "khá giống camera thông thường" ("fairly similar to a normal camera"). [single] https://fptshop.com.vn/tin-tuc/danh-gia/locket-la-gi-162675 and https://www.duchuymobile.com/locket-la-gi
  - Both pages were returned for the same query. The summary gave two near-identical phrasings, so exact attribution between the two pages is unverified.

### Locket Gold color and badge
- **UNKNOWN.**
- No source described a gold color, a gold badge, or how Gold styling looks in the UI.
- A Vietnamese query ("Locket Gold màu vàng giao diện huy hiệu") returned only jewelry results.

## 1.2 Typography
- App UI typeface (SF Pro, SF Pro Rounded or custom): **UNKNOWN.**
- Marketing-site fonts: **UNKNOWN.**
- Weights, sizes, letter-spacing and casing conventions: **UNKNOWN.**
- No search result described Locket's fonts. The planned font-specific queries could not be run because the search budget was used up.

## 1.3 Navigation model
- The app does not use a tab bar. "When in the app, icons in each corner guide you to the requisite sections, which is a welcomed departure from the common 'tab bar' most apps employ." [single] https://fueled.com/blog/locket-photo-sharing-widget/ (2022)
- Tapping the Home Screen widget opens straight into the in-app camera. [multi]
  - https://fueled.com/blog/locket-photo-sharing-widget/ ("Tapping the widget will immediately open the camera within Locket")
  - https://9to5mac.com/2022/01/13/locket-app-iphone-widgets/ ("tap into the widget, take a pic with the camera, and then hit send")
- History is reached by moving vertically from the camera. [multi]
  - Fueled: "a quick swipe up from the bottom brings [you] to your history, allowing you to scroll through all of the photos that were shared." https://fueled.com/blog/locket-photo-sharing-widget/
  - Locket's own App Store copy, as quoted by press: "Scroll down in the Locket app to travel back in time and explore your History." https://9to5mac.com/2022/01/13/locket-app-iphone-widgets/ and https://www.tapsmart.com/tips-and-tricks/home-screen-lockets/
  - A parent guide calls it the "History" tab. https://smartsocial.com/post/locket-widget

## 1.4 Camera screen (top to bottom)

| Element | What sources say | Tag / Source |
|---|---|---|
| Top bar (friends pill and count, profile button, chat button) | **UNKNOWN.** The only related statement is that "icons in each corner guide you to the requisite sections." | [single] https://fueled.com/blog/locket-photo-sharing-widget/ |
| Viewfinder | Screen Rant: opening the app "shows a preview of your iPhone camera's viewfinder along with a white button below it." Shape, aspect ratio and corner radius are **UNKNOWN**. | [single] https://screenrant.com/locket-widget-app-how-take-pictures-camera-controls/ |
| Viewfinder while capturing video | Locket's help center: a **yellow outline around the viewfinder** indicates that capture is in progress (holding to record video). | [single] https://help.locketcamera.com/en/articles/7915017-how-do-i-capture-video-on-locket |
| Shutter button | Described as a **white button** below the viewfinder. Tapping it takes the photo. Size, ring and fill details are **UNKNOWN**. | [single] https://screenrant.com/locket-widget-app-how-take-pictures-camera-controls/ |
| Flash | "To the left of the capture button is a lightning bolt icon that's turned off by default." Tapping it forces the flash on every shot. | [single] same Screen Rant URL |
| Flip camera | "An arrow icon to the right of the capture button" switches between rear and front cameras. | [single] same Screen Rant URL |
| Other camera tools | Screen Rant says there are no other tools: no ultra-wide or telephoto switching (an early-2022 description; current builds unverified). Fueled says the only features are front/back camera and flash. | [multi] Screen Rant URL above; https://fueled.com/blog/locket-photo-sharing-widget/ |
| Zoom indicator ("1x") | **UNKNOWN.** Screen Rant (2022) implies there was none at that time. | [single] Screen Rant URL above |
| History affordance at bottom | Swipe up from the bottom, or scroll down, to reach History (see 1.3). The visual treatment of the affordance is **UNKNOWN**. | [multi] see 1.3 |
| Background color | **UNKNOWN** | none |
| Dark mode only, or light mode too | **UNKNOWN** | none |
| Video | Short "live videos" can be captured. Video upload from the library is listed as a Gold perk (see 1.11). | [multi] https://www.vodafone.co.uk/newscentre/smart-living/digital-parenting/digital-parenting-pro/locket/ ; https://help.locketcamera.com/en/articles/7915017-how-do-i-capture-video-on-locket |

## 1.5 Post-capture and send screen
- **Send control.** Vietnamese guides describe an **arrow icon** for sending. Quote: "Chỉ việc nhấn nút chụp và dùng biểu tượng mũi tên để chia sẻ hình ảnh với bạn bè" ("just press the shutter button and use the arrow icon to share the image with friends"). [single] https://www.duchuymobile.com/locket-la-gi ; https://fptshop.com.vn/tin-tuc/danh-gia/locket-la-gi-162675
  - Shape and color of the arrow button: **UNKNOWN**.
- **Caption.** Users can add text to a photo: "you can add a text, so you can kinda explain or say something about the picture." [multi]
  - https://www.lemon8-app.com/@ecochamberxyz/7442040397092192823?region=us
  - https://www.vodafone.co.uk/newscentre/smart-living/digital-parenting/digital-parenting-pro/locket/ ("send messages with captions, emojis")
- **Caption limits.** Gold allows "longer photo captions." [multi] (see 1.11)
- **Placeholder text.** The exact string (for example "Add a message") is **UNKNOWN**.
- **Caption bubble style.** **UNKNOWN.**
- **Choosing recipients.** Users share "with selected friends." [single] https://www.vodafone.co.uk/newscentre/smart-living/digital-parenting/digital-parenting-pro/locket/
  - The look of the "send to" avatar row ("All" versus individual friends): **UNKNOWN**.
- **Friend cap.** Up to 5 friends at launch (January 2022). Later 20. A larger number requires Gold.
  - [multi] https://www.aol.com/news/locket-app-sharing-photos-friends-175845610.html (5)
  - https://www.tapsmart.com/tips-and-tricks/home-screen-lockets/ (20)
  - https://9to5mac.com/2022/01/13/locket-app-iphone-widgets/

## 1.6 History / feed
- **Structure.** A vertically scrolled history of photos you have sent and received (see 1.3). [multi]
  - Whether it pages one full-screen photo at a time: **UNKNOWN**.
  - Grid view of past Lockets: **UNKNOWN**.
- **Replies.** After receiving an image, users can respond "with a message or emoji, such as a heart or smiley face." [multi]
  - https://www.vodafone.co.uk/newscentre/smart-living/digital-parenting/digital-parenting-pro/locket/
  - https://smartsocial.com/post/locket-widget ("react to them with emoji or text")
- **Emoji rain.** Reactions make emojis "rain down" on the photo. Wording reported from Locket's store description: "send Locket reactions to friends to let them know they saw their image, and they'll get a notification and see emojis rain down on their photo." [multi]
  - https://www.vodafone.co.uk/newscentre/smart-living/digital-parenting/digital-parenting-pro/locket/ ("make emojis rain down on a screen")
  - https://www.apkmirror.com/apk/locket-labs-inc/locket-widget/ (app description)
  - Visual parameters (count, speed, direction, size) are **UNKNOWN**.
- **Reaction bar.** The "Send message…" field, emoji set and layout: **UNKNOWN**.
- **Timestamp and name row.** **UNKNOWN.**
- **Feed qualities.** "no public feeds, no likes count, and no filter." [single] https://smartsocial.com/post/locket-widget

## 1.7 Home Screen widget
- **Content.** The widget shows the latest photo a friend sent. Images "appear immediately on friends' home screens alongside the sender's username and streak score." [single for the username and streak overlay] https://www.vodafone.co.uk/newscentre/smart-living/digital-parenting/digital-parenting-pro/locket/
- **Streak toggle.** Users "can turn off the streak function, so that their widget does not show the streak score." [single] same Vodafone URL
- **Customizable.** Images appear "alongside your apps in a customizable widget." [single] https://www.tapsmart.com/tips-and-tricks/home-screen-lockets/
- **Behavior.** It "acts like a live photo album on a user's phone home screen and updates in real time." [single] https://smartsocial.com/post/locket-widget
- **Adding it (onboarding copy as reported).** "holding down on any app, and tapping Edit Home Screen, then tapping the + button in the top-left corner. You should see the Locket widget near the top of the list." [single] https://nerdschalk.com/how-to-use-locket-widget-step-by-step-guide/
  - This is a third-party walkthrough, not in-app copy.
- **Not found (UNKNOWN):**
  - Widget sizes offered
  - Name/avatar badge styling, position and color
  - Caption overlay styling
  - Lock Screen widget
  - "Crush" or "Best Friend" widget

## 1.8 Rollcall (launched around October 2025)
- **What it is.**
  - Users post a collection of their favorite photos from the past week. It happens every Sunday.
  - Rollcall posts are viewable for seven days.
  - [multi] https://techcrunch.com/2025/11/03/lockets-social-app-is-picking-up-steam-with-gen-alpha ; https://www.aol.com/articles/gen-alpha-loves-photo-dump-160101343.html ; https://www.techbuzz.ai/articles/locket-cracks-gen-alpha-code-with-ios-lock-screen-takeover
- **Live Activity.** "Every Sunday, Locket takes over the Lock Screen with a Live Activity." Press also mentions the Dynamic Island in general terms. [multi] TechCrunch and techbuzz URLs above ; https://mezha.net/eng/bukvy/locket-rollcall-boosts-gen-alpha-engagement-with-ios-live-activities/
- **Description wording.** "facilitates weekly photo dumps among best friends." [single] https://mwm.ai/apps/locket-widget/1600525061
- **Metrics reported.** [multi] TechCrunch, AOL, Bitget, mezha
  - Over 1 million shares in the first week
  - More than a quarter of active users take part weekly
  - About 80% of weekly photo-dump posters are Gen Alpha
- **Not found (UNKNOWN):**
  - Visual design of the Live Activity (colors, layout, countdown, copy)
  - Dynamic Island compact and expanded states
  - Rollcall composer UI
  - How a Rollcall post renders (grid, carousel or stack)
  - All Rollcall copy strings

## 1.9 Streaks
- **Definition.** A "streak score" counts how many days in a row users have exchanged images. [multi]
  - https://www.vodafone.co.uk/newscentre/smart-living/digital-parenting/digital-parenting-pro/locket/
  - https://www.apkmirror.com/apk/locket-labs-inc/locket-widget/ (description)
- **On the widget.** The score is shown on the widget and can be hidden (see 1.7). [single] Vodafone URL above
- **Android launch.** Locket's TikTok account announced "Streaks" for Android (2025). [single] https://www.tiktok.com/@locketcamera/video/7498394022428331295
  - A fire emoji (🔥) was associated with that announcement, according to the search summary. Whether the in-app streak glyph is a flame: **UNKNOWN** (not verified).
- **Streak restore.** Requires Locket Gold. A streak can be restored only within one day of losing it, by uploading a Locket from the camera roll to fill the missed day. After that window the streak resets and cannot be recovered. [single] https://help.locket.com/en/articles/14189020-how-do-i-restore-my-locket-streak
  - Visual design of the restore prompt: **UNKNOWN**.
- **Streak visuals.** Glyph, number styling and color: **UNKNOWN.**

## 1.10 Celebrity Lockets
- Reported in August 2025. The feature had been tested quietly for about six months. [single] https://www.androidheadlines.com/2025/08/photo-sharing-app-locket-banks-on-celebrity-feature-to-drive-growth.html
  - Focus is music artists; artists named in testing were Suki Waterhouse and JVKE.
  - Posts go "straight to fans' home screens."
  - Artists choose a fan capacity of 1,000 to 15,000 slots.
- UI (profile, join button, how celebrity posts are marked in the feed or widget): **UNKNOWN.**

## 1.11 Locket Gold (subscription)
- **Perks listed by sources.** [multi] https://www.dienmayxanh.com/kinh-nghiem-hay/locket-la-gi-cach-tai-va-su-dung-locket-widget-1570975 ; https://www.xtmobile.vn/cach-dang-anh-len-locket ; https://hoanghamobile.com/tin-tuc/locket-widget/ ; https://www.bustle.com/life/locket-app-how-to-use-tiktok-photo-widget
  - No ads while browsing photos
  - See who viewed or opened your posts
  - Upload photos from the photo library (camera roll)
  - Longer captions
  - Video uploads
  - Change the app icon (custom app icons)
  - More than 20 friends ("unlimited friends")
  - Streak restore (see 1.9; source: https://help.locket.com/en/articles/14189020-how-do-i-restore-my-locket-streak)
- **Watermark.** Removing the Locket watermark or logo is listed by one Vietnamese source. [single]
- **Prices.** The App Store (Germany) in-app purchases range from €1.99 to €39.00. [single] https://apps.apple.com/DE/app/id1600525061
  - Specific plan names and periods: **UNKNOWN**.
- **Paywall flows exist.** Lazyweb has catalogued a Locket "Paywall" flow and a 5-step "Locked Feature Paywall" flow (updated August 2026). Their screen content could not be retrieved. https://app.lazyweb.com/flow/locket/paywall ; https://experiments.lazyweb.com/flow/locket/locked-feature-paywall
- **Not found (UNKNOWN):**
  - Paywall layout and price layout
  - Gold color and badge
  - Custom icon options

## 1.12 Onboarding
Lazyweb's catalogued iOS onboarding flow (8 screens, updated May 2026; a 10-screen version is dated August 2026) [single] https://lazyweb.com/canvas/flows/locket/onboarding ; https://app.lazyweb.com/flow/locket/onboarding ; https://experiments.lazyweb.com/flow/locket/onboarding

1. **Intro screen.** The primary button reads **"Set up my Locket"**.
2. **Phone number.** Title **"What's your number?"**, with a country-code selector, an input field and a **"Continue"** button. SMS verification follows.
3. **Verification.** Enter a 6-digit SMS code.
4. **Name.** **"What's your name?"**, with first-name and last-name fields and a primary **Continue** button.
5. **Username.** A single text field. Continue stays disabled until a valid username is entered.
6. **Contacts permission.** Primary **"Share All Contacts"**, secondary **"Not now"**.
7. **Skip modal.** **"Skip contacts?"**, explaining how to enable full contacts access in Settings.
8. **Add friends.** A progress line, **"0 of 5 friends added"**, with **"Continue"** disabled until friends are added.

Corroboration from a third-party walkthrough: phone number, then six-digit code, then name, then import contacts and pick friends (the app drafts an invite text automatically), then add the widget. [multi with Lazyweb on the order] https://nerdschalk.com/how-to-use-locket-widget-step-by-step-guide/

Not found:
- **Birthday step: UNKNOWN.** None of the sources mention a birthday step.
- Visual styling of the onboarding screens: **UNKNOWN.**

## 1.13 Microcopy found (exact or near-exact)

| String | Context | Source / Tag |
|---|---|---|
| "Set up my Locket" | Onboarding intro, primary button | Lazyweb [single] |
| "What's your number?" | Phone entry title | Lazyweb [single] |
| "Continue" | Primary button on onboarding steps | Lazyweb [single] |
| "What's your name?" | Name step title | Lazyweb [single] |
| "Share All Contacts" / "Not now" | Contacts permission buttons | Lazyweb [single] |
| "Skip contacts?" | Modal title | Lazyweb [single] |
| "0 of 5 friends added" | Add-friends progress | Lazyweb [single] |
| "Locket is a widget that shows you live pictures from your friends, right on your Home Screen." | App Store description | https://9to5mac.com/2022/01/13/locket-app-iphone-widgets/ ; https://apps.apple.com/us/app/1600525061 [multi] |
| "It's like a portal to the people you care about — a little glimpse at what they're up to throughout the day." | App Store description | https://apps.apple.com/us/app/1600525061 [single] |
| "Scroll down in the Locket app to travel back in time and explore your History." | App Store description | 9to5mac / tapsmart [multi] |
| "…live photos from your best friends, right to your Home Screen … see new pictures from each other every time you unlock your phone" | Android store description | https://www.apkmirror.com/?p=4597488 [single] |
| "…they'll get a notification and see emojis rain down on their photo." | Store description (reactions) | https://www.apkmirror.com/apk/locket-labs-inc/locket-widget/ [single] |

- Push notification strings: **UNKNOWN.**
- Empty-state strings: **UNKNOWN.**
- Caption placeholder: **UNKNOWN.**

## 1.14 Motion and haptics
- Emoji "rain" animation on reactions (see 1.6). [multi]
- Yellow outline around the viewfinder during video capture (a state change, not described as animated). [single] https://help.locketcamera.com/en/articles/7915017-how-do-i-capture-video-on-locket
- All other motion (shutter animation, send transition, paging) and all haptics: **UNKNOWN.**

## 1.15 Other requested Locket items not found (all UNKNOWN)
- Monthly recap video style
- Music attachment UI (Spotify / Apple Music pill)
- Locket Looks (AI selfie) UI
- Chat / messages UI
- Camera themes
- Custom app icon set
- Dark or light mode
- Grid view

---

# 2. Lapse

**NOT RESEARCHED.** The search budget ran out before any Lapse query could run. Every item requested is **UNKNOWN**:
- Fonts and colors
- Camera UI
- The "develop" animation
- "Rolls"
- Drop and develop timing
- Journal / memories UI
- Invite screen

# 3. Dispo

**NOT RESEARCHED.** The search budget ran out before any Dispo query could run. Every item requested is **UNKNOWN**:
- Viewfinder
- The "develops at 9am" mechanic UI
- Grain and date-stamp look
- Fonts and colors

---

# 4. Gaps

## Locket: not found or unverified
1. **Exact brand hex.** None verified. The `#FFA242` from Brandfetch belongs to `locketconnect.com`, which is not confirmed to be Locket Labs.
2. **Locket Gold.** Gold color and badge, and paywall layout and price layout.
3. **Typography.** All of it: UI font, marketing font, weights, sizes, tracking, casing.
4. **Wordmark.** Letterforms, case and weight.
5. **Camera screen.** Top bar contents, viewfinder aspect ratio and corner radius, shutter dimensions and ring treatment, zoom indicator, background color, and light/dark mode.
6. **Send screen.** Caption placeholder and bubble style, and the "send to" avatar row (All / individual).
7. **History.** Paging style, caption bubble, timestamp/name row, reaction bar layout and emoji set, and grid view.
8. **Widget.** Sizes, badge styling, caption overlay, Lock Screen widget, and Crush/Best Friend widget.
9. **Rollcall.** Live Activity and Dynamic Island visuals and copy, the composer, and how posts render.
10. **Streaks.** Glyph, number and color. Only a 🔥 association with a TikTok announcement was seen.
11. **Other features.** Monthly recap, music pill, Celebrity Lockets UI, Locket Looks, chat UI, camera themes, and the custom icon set.
12. **Copy and motion.** Push notifications, empty states, the birthday step (if one exists), and all motion and haptics beyond emoji rain.

## Lapse and Dispo
Entirely unresearched.

## Leads for a follow-up session
These surfaced in results but their content was not retrieved:
- **Lazyweb Locket flows** (onboarding, 10-screen version; paywall; locked-feature paywall). These hold screen-level descriptions.
- **Help centers:**
  - https://help.locketcamera.com/
  - https://help.locket.com/
- **Screen Rant guide:** https://screenrant.com/what-is-locket-iphone-app-how-use/
- **UK safeguarding guide:** https://oursaferschools.co.uk/2025/11/17/locket-widget/ (November 2025, likely to cover Rollcall)
- **Product case study:** https://medium.com/@siddhisonwalkar1/locket-product-case-study-e79e0823070c (Medium, blocked for fetch)
- **Release notes:** https://scout.appaloosa.io/en/apps/ios/com.locket.Locket/history and APKMirror "What's new" pages
- **Official TikTok:** @locketcamera
- **French and Portuguese press** (both 2022, returned but not mined for UI details):
  - https://iphonesoft.fr/2022/01/14/locket-app-partager-photo-widget-iphone-ami
  - https://macmagazine.com.br/post/2022/01/11/app-locket-torna-widgets-do-ios-uma-experiencia-social/
