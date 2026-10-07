# 02 — Yope & Retro: Visual / UX Source Dossier

Research date: 2026-10-07. Scope: **Yope** (Salo App, Inc.) and **Retro** (Lone Palm Labs).

## How to read this dossier

- **Method.** Every fact below comes from WebSearch result excerpts. Direct page fetches of App Store pages, company sites and press sites were blocked. The search tool returns *summarized excerpts* of the pages it finds. Text in quotation marks is the wording **as it appeared in the search excerpt**. It may be a light paraphrase of the page, so treat it as "reported wording" and not as verified pixel-exact UI copy unless it says otherwise.
- **Search budget.** I ran 21 WebSearch queries. Then the session-wide WebSearch budget (shared by all agents in this turn) was exhausted, and the tool told me not to work around it. The plan called for 30–60 queries. I could not run the non-English queries (DE/ES/PT/IT) or the queries about Yope's specific screens (streaks, Wrapped, split view, face-swap stickers, onboarding, paywall). See **Gaps**.
- **Confidence tags.**
  - `[multi]`: 2 or more independent sources agree. Two articles from the same outlet are noted as such.
  - `[single]`: one source.
  - `[inferred]`: my interpretation. These are rare and labelled.
- **UNKNOWN** means no source I reached states the fact. Nothing has been filled in by guessing.

---

# PART A — YOPE

## A0. Identity and positioning

| Fact | Source | Conf. |
|---|---|---|
| App Store listing title: **"yope: friends-only pics"** (lowercase "yope") | https://apps.apple.com/us/app/-/id1600195477 | [single] |
| Store/campaign listing title: **"yope: friends-only social game"** (lowercase "yope") | https://www.bluestacks.com/campaign/app.salo/it/ | [single] |
| Android package / bundle namespace appears as `app.salo` (from the BlueStacks URL) | https://www.bluestacks.com/campaign/app.salo/it/ | [single] |
| Described as "the safest, simplest way to stay close" | search excerpt drawing on https://apps.apple.com/us/app/-/id1600195477 and https://www.bluestacks.com/campaign/app.salo/it/ (exact originating page not isolated) | [single] |
| Positioning: a social platform with **no algorithms, no ads, no public content** | https://techcrunch.com/2026/07/22/yope-raises-12-3m-to-build-a-private-social-network-without-algorithms-or-ads/ ; https://www.globaldatinginsights.com/featured/yope-raises-12-3m-for-private-algorithm-free-social-networking-app/ ; https://zamin.uz/en/technology/213879-new-social-network-without-algorithms-and-ads-yope-project-raises-12-3-million.html | [multi] |
| Origin statement: Yope was created "because social media became too fake", with filters, edits and likes described as "all noise" | search excerpt from the result set for "Yope app friends-only social game photo chat design" (App Store / TechCrunch result set; exact page not isolated) | [single] |
| Described as blending features of **Instagram and WhatsApp** | https://petapixel.com/2025/02/26/fast-growing-photo-app-yope-lets-users-share-images-to-private-groups ; https://marketing4ecommerce.net/en/what-is-yope/ | [multi] |
| Built around "micro communities": small private groups of friends and family sharing photos, videos and messages, with games "soon" | https://techcrunch.com/2026/07/22/yope-raises-12-3m-to-build-a-private-social-network-without-algorithms-or-ads/ | [single] |
| Founded 2021 by **Bahram Ismailau and Paul Rudkouski** (former Belarus State University students). The current app version arrived **September 2024** after pivots. *(Vladimir Kremer was not named in any source I reached.)* | https://marketing4ecommerce.net/en/what-is-yope/ | [single] |
| Scale (context): ~15M registered users; 10–20M pieces of content shared weekly; $12.3M round led by Northzone (July 2026), $20M total | https://techcrunch.com/2026/07/22/yope-raises-12-3m-to-build-a-private-social-network-without-algorithms-or-ads/ ; https://zamin.uz/en/technology/213879-new-social-network-without-algorithms-and-ads-yope-project-raises-12-3-million.html ; https://yope.app/press | [multi] |
| Earlier scale (Feb 2025): 2.2M MAU, 800K DAU, ~40% day-7 retention | https://petapixel.com/2025/02/26/fast-growing-photo-app-yope-lets-users-share-images-to-private-groups ; https://marketing4ecommerce.net/en/what-is-yope/ | [multi] |

## A1. Brand

- **Name casing.** Both store listing titles render the name as lowercase **"yope"** ("yope: friends-only pics", "yope: friends-only social game") ([App Store](https://apps.apple.com/us/app/-/id1600195477), [BlueStacks](https://www.bluestacks.com/campaign/app.salo/it/)) `[multi]`. Press and the company's own press page title use capitalised "Yope" ([yope.app/press](https://yope.app/press): "Press — Yope raises $12.3M Pre-Series A, led by Northzone") `[single]`.
- **Logo / wordmark letterforms:** UNKNOWN.
- **App icon:** UNKNOWN.
- **Brand colors / hex:** UNKNOWN. No source states any color.
- **Mascot / character:** UNKNOWN. No source mentions one.
- **Illustration style:** UNKNOWN. The only related visual language in sources is the **cut-out sticker** and **"chaotic collage"** treatment of user photos (see A4.3).

## A2. Typography

- UI typeface: UNKNOWN.
- Marketing site fonts (yope.app / yope.tv): UNKNOWN.
- Serif vs sans, weights, casing conventions: UNKNOWN. The only casing evidence is the lowercase "yope" in store titles (A1).

## A3. Navigation structure

- Tabs, swipes and top bars: UNKNOWN.
- **Where the camera lives.** The send flow is: "take a photo in the app or pick one from their library and send it to a group chat that they've joined or created themselves" ([PetaPixel](https://petapixel.com/2025/02/26/fast-growing-photo-app-yope-lets-users-share-images-to-private-groups)) `[single]`. So an in-app camera exists, but its placement in the navigation is UNKNOWN.

## A4. Screens and elements

### A4.1 Group chat / "photo chat" layout
- Users send photos to group chats. Inside a group they "see images shared by other group members and react to pics and chat with the rest of the group" ([PetaPixel](https://petapixel.com/2025/02/26/fast-growing-photo-app-yope-lets-users-share-images-to-private-groups)) `[single]`.
- Each group "function[s] like a private album visible only to invited users" ([PetaPixel](https://petapixel.com/2025/02/26/fast-growing-photo-app-yope-lets-users-share-images-to-private-groups)) `[single]`.
- Marketing description: "built-in photo chats", "skip texting, and share visually" (search excerpt from the App Store/BlueStacks/TechCrunch result set: https://apps.apple.com/us/app/-/id1600195477) `[single]`.
- Visual layout (bubble vs full-bleed, corner radius, alignment, avatars): UNKNOWN.

### A4.2 How photos sit in the chat
- UNKNOWN. No source describes bubble shape, bleed or rounding.

### A4.3 Walls (AI recap collages and the profile wall)
- **Group wall.** "Each group features a wall where Yope's machine-learning technology stitches images into a continuously evolving photo collage" ([PetaPixel](https://petapixel.com/2025/02/26/fast-growing-photo-app-yope-lets-users-share-images-to-private-groups)). The app "integrates an automatic collage function generated by artificial intelligence, which organizes the shared images into a visual wall" ([marketing4ecommerce](https://marketing4ecommerce.net/en/what-is-yope/)) `[multi]`.
- **Chaotic, non-album arrangement.** "Photos are not displayed in an album format, but are placed on a 'wall' as a chaotic collage" ([marketing4ecommerce](https://marketing4ecommerce.net/en/what-is-yope/)). Users' photos "can be turned into cut-out stickers" and are "displayed in a collage-like, almost chaotic arrangement across each user's 'wall'" ([TechCrunch 2026-07-22](https://techcrunch.com/2026/07/22/yope-raises-12-3m-to-build-a-private-social-network-without-algorithms-or-ads/)) `[multi]`.
- **Profile wall (July 2026 roadmap).** Users "create their own profiles by sharing photos". Users "will be able to further customize their space by adding their interests, favorite music, and the mini-games, as well as customizing the look and feel with **colors and wallpapers** of their choosing" ([TechCrunch 2026-07-22](https://techcrunch.com/2026/07/22/yope-raises-12-3m-to-build-a-private-social-network-without-algorithms-or-ads/)) `[single]`. The specific colors and wallpapers offered are UNKNOWN.
- Sticker outline style, drop shadows, rotation, overlap rules, and the editing/remix UI: UNKNOWN.

### A4.4 Recap
- A "recap" feature compiles shared images into a **slideshow**, "akin to Google Photos and Apple's Photos app" ([PetaPixel](https://petapixel.com/2025/02/26/fast-growing-photo-app-yope-lets-users-share-images-to-private-groups)) `[single]`.

### A4.5 Split view ("see what your friends are up to right now")
- UNKNOWN. Not found in any source reached.

### A4.6 Face-swap stickers UI
- UNKNOWN. The only sticker fact is that photos can become **cut-out stickers** (A4.3).

### A4.7 Streaks UI
- UNKNOWN.

### A4.8 Wrapped 2025 (story-style recap)
- UNKNOWN.

### A4.9 Voice messages UI
- UNKNOWN.

### A4.10 Lock-screen "surprise" updates and widgets
- "Photos appear instantly on friends' **lock screens and widgets**" (search excerpt, App Store/BlueStacks result set: https://apps.apple.com/us/app/-/id1600195477) `[single]`.
- Widget sizes, visual frame and "surprise" mechanic presentation: UNKNOWN.

### A4.11 Onboarding (invite-friends gate, contacts, photo permissions, copy)
- UNKNOWN. No onboarding copy or screens found.

### A4.12 Premium paywall
- UNKNOWN.

### A4.13 "Real moments every hour" mechanic
- UNKNOWN.

### A4.14 Group creation; "different groups, different energy"
- Users can send to "a group chat that they've joined or created themselves" ([PetaPixel](https://petapixel.com/2025/02/26/fast-growing-photo-app-yope-lets-users-share-images-to-private-groups)) `[single]`.
- Group-creation screen and the "different groups, different energy" copy: UNKNOWN (that phrase was not found in any source).

### A4.15 Reactions
- Users can "react to pics" ([PetaPixel](https://petapixel.com/2025/02/26/fast-growing-photo-app-yope-lets-users-share-images-to-private-groups)) `[single]`. Reaction set, emoji vs custom, placement: UNKNOWN.

### A4.16 AI mini-games
- "Yope uses AI to create mini-games that you can play with your friends", expected to launch about a month after the July 2026 article. Mini-games can be added to a user's profile space ([TechCrunch 2026-07-22](https://techcrunch.com/2026/07/22/yope-raises-12-3m-to-build-a-private-social-network-without-algorithms-or-ads/)) `[single]`. Game visuals: UNKNOWN.

## A5. Yope microcopy (as reported in search excerpts)

| String | Context | Source | Conf. |
|---|---|---|---|
| "yope: friends-only pics" | App Store title | https://apps.apple.com/us/app/-/id1600195477 | [single] |
| "yope: friends-only social game" | Store/campaign title | https://www.bluestacks.com/campaign/app.salo/it/ | [single] |
| "the safest, simplest way to stay close" | Store description | https://apps.apple.com/us/app/-/id1600195477 (excerpt; exact page not isolated) | [single] |
| "skip texting, and share visually" | Store description | same as above | [single] |
| "because social media became too fake" | Origin line | same result set | [single] |

Buttons, empty states and notification strings: UNKNOWN.

## A6. Yope motion, haptics, sound
- UNKNOWN. The only motion-adjacent wording is that the wall is "continuously evolving" ([PetaPixel](https://petapixel.com/2025/02/26/fast-growing-photo-app-yope-lets-users-share-images-to-private-groups)) `[single]`.

---

# PART B — RETRO

## B0. Identity and positioning

| Fact | Source | Conf. |
|---|---|---|
| Store name: **"Retro — Photos with Friends"** (with an em dash) | https://apps.apple.com/us/app/retro-photos-with-friends/id6443709020 ; https://play.google.com/store/apps/details?id=io.lonepalm.retro&hl=en_US ; https://mwm.ai/apps/retro-photos-with-friends/6443709020 | [multi] |
| Alternate/older store name seen on APK mirrors: "Retro - Social Photo Journal" / "Retro. Social Photo Journal" | https://retro-social-photo-journal.en.softonic.com/android ; https://www.pgyer.com/apk/apk/io.lonepalm.retro | [multi] (mirror sites) |
| Android package: `io.lonepalm.retro` | https://play.google.com/store/apps/details?id=io.lonepalm.retro&hl=en_US | [single] |
| Self-description **"friends-only photo journal"** | https://www.engadget.com/2234246/retro-app-what-is-it-how-to-use/ ; https://retro.app/ethos ; https://www.trysignalbase.com/news/funding/retro-raises-21m-series-a-for-friends-only-photo-journal | [multi] |
| "A friends-only photo journal for moments big and small" | https://o.parsers.vc/startup/retro.app/ | [single] |
| "Retro is a social app that feels like a joy, not a habit." | https://retro.app/ethos | [single] |
| "Retro is a weekly photo journal that brings you closer to the people you actually care about and helps you appreciate your own life, all without the distractions and pressure of big social media." | https://apps.apple.com/us/app/retro-photos-with-friends/id6443709020 (mirrored at https://mwm.ai/apps/retro-photos-with-friends/6443709020) | [single] (store text + mirror) |
| "a social app where you share real photos with real friends" | https://apps.apple.com/app/id6443709020 | [single] |
| Founders **Nathan Sharp** (co-founder & CEO) and **Ryan Olson**, both former Instagram team members who worked on Stories | https://techcrunch.com/2024/04/04/retro-an-actually-good-photo-sharing-app-for-bffs-launches-collaborative-journals/ ; https://www.fastcompany.com/91462432/retro-photo-sharing-app ; https://yespress.io/nathan-sharp | [multi] |
| Launched 2023; ~1M users; #1 in photo apps in 12 countries; $21M Series A (Dec 2025) | https://techcrunch.com/2025/12/12/retro-a-photo-sharing-app-for-friends-lets-you-time-travel-through-your-camera-roll/ ; https://daily.dev/posts/friend-focused-photo-sharing-app-retro-snags-21m-jr3kelbhn ; https://www.netinfluencer.com/photo-sharing-app-retro-founded-by-ex-instagram-engineers-raises-21m-usd-series-a/ | [multi] |
| **Apple 2025 App Store Awards finalist, Cultural Impact.** Apple's blurb, as summarised in the excerpt: a "privacy-friendly social platform that keeps loved ones in the loop" (exact Apple wording not confirmed) | https://www.apple.com/newsroom/2025/11/apple-announces-finalists-for-the-2025-app-store-awards/ | [single] |
| Editors' Choice status | Not confirmed by any source reached. An App Store "story" page exists at https://apps.apple.com/nz/iphone/story/id1840659619, but its content was not retrieved | — |

### Retro product principles (retro.app/ethos), as reported
- "Remembering and appreciating life is an active process." Retro helps you "pick the ones that you'll want to remember each week" ([retro.app/ethos](https://retro.app/ethos)) `[single]`.
- "Social apps are better when everyone participates." Posting can feel "like you're the only one on the dance floor". Retro "gets everyone on the dance floor by nudging everyone to share at least once a week" ([retro.app/ethos](https://retro.app/ethos)) `[single]`.
- "The ability to keep up with your extended circle of friends is a superpower" ([retro.app/ethos](https://retro.app/ethos)) `[single]`.
- Privacy statements in the same result: "We don't sell or rent our user data to anybody. We aren't an ad-driven model. … We don't train AI models on any of your photos." ([retro.app/ethos](https://retro.app/ethos), excerpt) `[single]`.
- Founder statement (Nathan Sharp on X): "Social media has been around for so long that we've forgotten to ask 'What should we want from this? How should it work? How should it make me feel?' We built Retro for the people that want more from their social apps, for friends that want to stay involved in each others' lives." ([x.com/nsharp17/status/1927394864334885362](https://x.com/nsharp17/status/1927394864334885362)) `[single]`.
- Interviews with possible design content that I found but could not read: YouTube "The Slow and Comforting Social media app: Nathan Sharp on the World Retro Aims to Create" (https://www.youtube.com/watch?v=h3IfjbWsZz8); Full Stack Whatever Ep. 33 (https://fullstackwhatever.com/episode/nathan-sharp-ryan-olson-a-big-beautiful-retrospective); Apptisan #013 (https://apptisan.substack.com/p/apptisan-013-retro); Medium "Why we started Retro" (https://medium.com/@retrodotapp/why-we-started-retro-483baec50f55).

## B1. Brand

- **Name casing.** Store and press render it "Retro" with a capital R ([App Store](https://apps.apple.com/us/app/retro-photos-with-friends/id6443709020), [Google Play](https://play.google.com/store/apps/details?id=io.lonepalm.retro&hl=en_US)) `[multi]`. The social handle is "retrodotapp" ([Threads](https://www.threads.com/@retrodotapp/post/DIx3Wj9RpCN/as-a-big-step-toward-ad-free-social-media-were-introducing-retro-memberships-tha), [LinkedIn](https://www.linkedin.com/company/retrodotapp)) `[multi]`.
- **Logo / wordmark letterforms:** UNKNOWN.
- **App icon:** UNKNOWN. An icon exists on AlternativeTo (https://www.alternativeto.net/software/retro/about/), but no description of it was retrieved.
- **Brand colors / hex:** UNKNOWN.
- **Cream/light background:** UNKNOWN. No source states the background color.
- **Mascot:** UNKNOWN. None mentioned.
- **Illustration style:** UNKNOWN.
- **"Retro"/nostalgic styling.** Fast Company SA headlines Retro as "the nostalgic photo-sharing app" ([fastcompany.co.za](https://fastcompany.co.za/co-design/2025-12-21-transform-your-memories-discover-retro-the-nostalgic-photo-sharing-app/)) `[single]`. The one explicitly skeuomorphic reference is the **iPod-inspired dial** in Rewind (B4.5).

## B2. Typography

- UI typeface, marketing site fonts, serif vs sans, weights: UNKNOWN.
- *Unverified lead, not a fact:* a 2013 TCU Magazine profile, "Design with a flair... Nathan Sharp '06", describes a Nathan Sharp who was a senior designer at the SF studio MINE and a winner in the Communication Arts Typography Competition (https://magazine.tcu.edu/summer-2013/design-with-a-flair-nathan-sharp-06/). **No source confirms this is the Retro co-founder.** Do not use it.

## B3. Navigation structure

- **Bottom navigation bar exists. Rewind is the middle tab.** Rewind can be launched "from its more prominent position as the middle tab in the bottom navigation bar" ([TechCrunch 2025-12-12](https://techcrunch.com/2025/12/12/retro-a-photo-sharing-app-for-friends-lets-you-time-travel-through-your-camera-roll/)) `[single]`.
  - `[inferred]` "Middle tab" implies an odd number of tabs (at least 3). The other tabs' names and icons are UNKNOWN.
- **Earlier "Memories" tab.** The store text says "The Memories tab lets you browse images straight from your phone's camera roll" ([App Store](https://apps.apple.com/app/id6443709020)) `[single]`. How it relates to the Rewind tab is UNKNOWN.
- **Film strip at top of the home screen.** Users "add photos and videos to this week's film strip that is displayed at the top of the screen" ([TechCrunch 2023-07-07](https://techcrunch.com/2023/07/07/retro-is-a-deeply-personal-photo-journaling-app-for-close-friends/)) `[single]`.
- **No capture camera.** "You can't even capture photos with the app": Retro posts come from the camera roll ([Engadget](https://www.engadget.com/2234246/retro-app-what-is-it-how-to-use/); the same phrasing also appeared in a TechCrunch result set) `[single]`. (This is as of the Engadget article. Whether this has changed is UNKNOWN.)

## B4. Screens and elements

### B4.1 Weekly journal layout
- **Week-by-week format.** Retro showcases photos "in a week-by-week format" ([TechCrunch 2024-07-11](https://techcrunch.com/2024/07/11/photo-sharing-startup-retro-spots-google-photos-copying-its-idea-and-design/)) `[single]`.
- **Horizontal filmstrip rows with rounded outer corners.** TechCrunch, describing Google Photos' look-alike: "Like Retro's app, the Google Photos journal is displayed in a horizontal 'filmstrip'-style format, with rounded corners on the outside" ([TechCrunch 2024-07-11](https://techcrunch.com/2024/07/11/photo-sharing-startup-retro-spots-google-photos-copying-its-idea-and-design/)). TechCrunch 2023 also calls it "this week's film strip" ([TechCrunch 2023-07-07](https://techcrunch.com/2023/07/07/retro-is-a-deeply-personal-photo-journaling-app-for-close-friends/)) `[multi]` (two separate TechCrunch articles). The copycat story is corroborated by [MobileSyrup](https://mobilesyrup.com/2024/07/15/google-copies-retro-photo-sharing-app/).
  - `[inferred]` "Rounded corners on the outside" reads as: the strip as a whole has rounded outer corners, while the inner edges between adjacent photos are not rounded. The source does not spell out the inner edges.
- **Week label format.** The only label fragment in sources is the **"this week in"** card at the end of the row of shared photos ([TechCrunch 2025-12-12](https://techcrunch.com/2025/12/12/retro-a-photo-sharing-app-for-friends-lets-you-time-travel-through-your-camera-roll/)) `[single]`. The full format (dates, week numbers, month names) is UNKNOWN.

### B4.2 Profile / journal header
- UNKNOWN visually.
- Access rules: friends "can head to your profile and view photos you've uploaded in the past **four weeks**". A key unlocks the "entire photo journal" ([Engadget](https://www.engadget.com/2234246/retro-app-what-is-it-how-to-use/)) `[single]`.

### B4.3 Friends feed
- "As your friends start adding photos, Retro automatically regroups all the moments that they've shared that week, and at any point in time, you can **tap on someone's card** and view all the photos and videos of the week" ([TechCrunch 2023-07-07](https://techcrunch.com/2023/07/07/retro-is-a-deeply-personal-photo-journaling-app-for-close-friends/)) `[single]`. So the friends feed is organised as **per-friend cards per week**.
- A **row** shows the photos friends shared during the week. At its end is the **"this week in"** card, and past that is the entry point to Rewind ([TechCrunch 2025-12-12](https://techcrunch.com/2025/12/12/retro-a-photo-sharing-app-for-friends-lets-you-time-travel-through-your-camera-roll/)) `[single]`.
- No likes, no algorithms, no FOMO. You can't follow influencers, and there's no algorithmic feed ([Engadget](https://www.engadget.com/2234246/retro-app-what-is-it-how-to-use/)) `[single]`. Store text: "your friend list is private, likes on posts are private, no captions required" ([App Store](https://apps.apple.com/app/id6443709020)) `[single]`. Together these indicate a private like/reaction exists. Its visual form is UNKNOWN.

### B4.4 "Post to see" lock state
- Mechanic: "Retro requires you to post at least one photo a week to see what your friends have also posted." You can view friends' last four weeks "if you also share some photos yourself" ([Engadget](https://www.engadget.com/2234246/retro-app-what-is-it-how-to-use/)) `[single]`. Also "There's also no lurking, as everyone is encouraged to participate" (TechCrunch result set: https://techcrunch.com/2023/12/07/retro-lets-you-create-recaps-of-your-most-memorable-photos-and-send-the-best-ones-as-postcards) `[single]`.
- The locked state's look (blur? placeholder?) and exact copy: UNKNOWN.

### B4.5 Keys
- "You can hand a 'key' to someone, and this lets them scroll through your entire photo journal." **Free tier: one key.** Premium: unlimited ([Engadget](https://www.engadget.com/2234246/retro-app-what-is-it-how-to-use/)). Retro's announcement lists "unlimited keys for close friends" as a membership perk ([Threads @retrodotapp](https://www.threads.com/@retrodotapp/post/DIx3Wj9RpCN/as-a-big-step-toward-ad-free-social-media-were-introducing-retro-memberships-tha)) `[multi]`.
- What a key looks like (icon/glyph) and the give-a-key flow UI: UNKNOWN.

### B4.6 Rewind (Dec 2025)
- **What it is.** Scroll back "through months or years of images from their camera roll in a dedicated, personal view, with the option to selectively share" ([TechCrunch 2025-12-12](https://techcrunch.com/2025/12/12/retro-a-photo-sharing-app-for-friends-lets-you-time-travel-through-your-camera-roll/); [Global Dating Insights](https://www.globaldatinginsights.com/featured/retro-adds-rewind-feature-to-let-users-explore-and-share-old-camera-roll-memories/)) `[multi]`.
- **Private by default.** "Unlike Retro's core experience … Rewind is private by default" / "private to you — unless you choose to share" ([TechCrunch 2025-12-12](https://techcrunch.com/2025/12/12/retro-a-photo-sharing-app-for-friends-lets-you-time-travel-through-your-camera-roll/); [Global Dating Insights](https://www.globaldatinginsights.com/featured/retro-adds-rewind-feature-to-let-users-explore-and-share-old-camera-roll-memories/)) `[multi]`.
- **The dial.**
  - "Retro's new feature, Rewind, lets you look back at your photo memories and scroll through them with a dial." The dial is **"iPod-inspired"** ([Fast Company](https://www.fastcompany.com/91462432/retro-photo-sharing-app)) `[single]` for "iPod-inspired".
  - Users "navigate through time using an **interactive dial**, pause on specific moments, or **jump to random memories**", described as "a more **tactile** way to revisit older images" ([TechCrunch 2025-12-12](https://techcrunch.com/2025/12/12/retro-a-photo-sharing-app-for-friends-lets-you-time-travel-through-your-camera-roll/); [Global Dating Insights](https://www.globaldatinginsights.com/featured/retro-adds-rewind-feature-to-let-users-explore-and-share-old-camera-roll-memories/)) `[multi]` for the dial's existence.
- **Animation / haptics.** "As the iPod-inspired dial **clicks** back into your past, you'll feel a **subtle vibration as each new memory loads**, and you can **spin the dial** to move forward or backward in time, watching the photos from months and years past **flip by** on the screen" ([Fast Company](https://www.fastcompany.com/91462432/retro-photo-sharing-app)) `[single]`.
- **Actions on a memory.** "Share or send the photos to a friend, or **hide** those they'd rather not see" ([Fast Company](https://www.fastcompany.com/91462432/retro-photo-sharing-app)) `[single]`.
- **Timestamp stamp.** "When users choose to share a photo from Rewind, the app **adds a timestamp** to make it clear the image is from the past, not a recent capture" ([TechCrunch 2025-12-12](https://techcrunch.com/2025/12/12/retro-a-photo-sharing-app-for-friends-lets-you-time-travel-through-your-camera-roll/)) `[single]`. The stamp's typeface, position, color and format: UNKNOWN.
- **Resurfacing.** Rewind "resurfaces camera roll memories from this time last year" (excerpt drawing on [Fast Company](https://www.fastcompany.com/91462432/retro-photo-sharing-app) / [TechCrunch](https://techcrunch.com/2025/12/12/retro-a-photo-sharing-app-for-friends-lets-you-time-travel-through-your-camera-roll/)). There is also a card at the end of the weekly row that lets you "view your own photos from that same week a year ago" ([TechCrunch 2025-12-12](https://techcrunch.com/2025/12/12/retro-a-photo-sharing-app-for-friends-lets-you-time-travel-through-your-camera-roll/)) `[single]`.
- **Entry points.** (1) The end of the row of shared photos, "just past the 'this week in' card". (2) The middle tab of the bottom nav ([TechCrunch 2025-12-12](https://techcrunch.com/2025/12/12/retro-a-photo-sharing-app-for-friends-lets-you-time-travel-through-your-camera-roll/)) `[single]`.
- **Press-and-hold uncrop:** UNKNOWN. Not found in any source reached.
- The dial's visual (ring color, size, center button, tick marks): UNKNOWN beyond "iPod-inspired".

### B4.7 Recaps (collage and slideshow)
- "Pick a time period, like the past year or a recent week, and Retro will make a cool **collage or video** of your photos" ([TechCrunch 2023-12-07](https://techcrunch.com/2023/12/07/retro-lets-you-create-recaps-of-your-most-memorable-photos-and-send-the-best-ones-as-postcards)). Store text: "Create a beautiful **photo collage or video slideshow** from the photos you've shared from the **week, month, or year**", under a "Monthly Recaps" feature heading ([App Store](https://apps.apple.com/app/id6443709020)) `[multi]`.
- "New recaps styles" is a paid membership perk ([Threads @retrodotapp](https://www.threads.com/@retrodotapp/post/DIx3Wj9RpCN/as-a-big-step-toward-ad-free-social-media-were-introducing-retro-memberships-tha)) `[single]`. The names and looks of the styles: UNKNOWN.

### B4.8 Sticker recaps
- UNKNOWN. Not found in any source reached.

### B4.9 Widgets
- "See the newest posts from friends or time hop back to your own memories with our new widgets" ([App Store](https://apps.apple.com/app/id6443709020)). Nathan Sharp: "It's less practical, but having Retro widgets for my memories and my friends makes unlocking my phone a joy" ([X/@nsharp17](https://twitter.com/nsharp17/status/1836415983109705987)) `[multi]` that there are two widget kinds: friends' newest posts and own memories.
- Widget sizes and visual design: UNKNOWN.

### B4.10 Postcards ordering
- "Pick a photo, add a message, and Retro will print and mail it for you." Sent as "high-quality postcards … to anyone globally via USPS first-class mail" ([TechCrunch 2023-12-07](https://techcrunch.com/2023/12/07/retro-lets-you-create-recaps-of-your-most-memorable-photos-and-send-the-best-ones-as-postcards)) `[single]`.
- Ordering UI, price and card design: UNKNOWN.

### B4.11 Group albums / journals
- April 2024 "journals": "a flexible way to share photos with your favorite people and create visual records of whatever matters in your life". They can be "akin to a shared photo album or used to keep a private record". Sharp compares it to a **"photo-first WhatsApp group"** ([TechCrunch 2024-04-04](https://techcrunch.com/2024/04/04/retro-an-actually-good-photo-sharing-app-for-bffs-launches-collaborative-journals/); also covered by [Appetizer Mobile](https://appetizermobile.com/2024/04/09/retro-launches-collab-journals/)) `[single]` for the quote.
- Store text "Group Albums": "Start a private album and **drop the link in your group chat** to collect and share photos after events" ([App Store](https://apps.apple.com/app/id6443709020)) `[single]`. The feature (shared/group albums) is `[multi]` (TechCrunch 2024 + App Store + [TechCrunch 2025-12-12](https://techcrunch.com/2025/12/12/retro-a-photo-sharing-app-for-friends-lets-you-time-travel-through-your-camera-roll/): "or create shared albums").
- Visual layout: UNKNOWN.

### B4.12 Onboarding (cadence choice)
- "During initial setup, you can choose how frequently you wish to share photos on Retro — **daily, weekly or monthly**, and the app will then nudge you to post at your chosen interval" (search excerpt. The result set included [Engadget](https://engadget.com/2234246/retro-app-what-is-it-how-to-use) and several TechCrunch articles, and I could not isolate which page holds this sentence) `[single]`.
- Exact onboarding screen copy and button labels: UNKNOWN.

### B4.13 Premium screen
- Names used: **"Retro Premium"** ([Engadget](https://www.engadget.com/2234246/retro-app-what-is-it-how-to-use/)) and **"Retro Memberships"** ([Threads @retrodotapp](https://www.threads.com/@retrodotapp/post/DIx3Wj9RpCN/as-a-big-step-toward-ad-free-social-media-were-introducing-retro-memberships-tha)).
- Perks, as announced by Retro: "new recaps styles, unlimited keys for close friends, unlimited profile history, and unlimited videos". "There will ALWAYS be a free tier with unlimited photos and friends." You can upgrade "by either paying a small amount or referring 5 new friends" ([Threads @retrodotapp](https://www.threads.com/@retrodotapp/post/DIx3Wj9RpCN/as-a-big-step-toward-ad-free-social-media-were-introducing-retro-memberships-tha)) `[single]` (company post).
- Engadget adds: Premium lets you upload "as far back as you please". On free, uploads are limited to the current week. Premium also allows short video clips. Pricing "starts at **$2 a week, $5 monthly or $36** for the entire year" ([Engadget](https://www.engadget.com/2234246/retro-app-what-is-it-how-to-use/)) `[single]`.
- Referral rewards: 5 friends gets a year of Premium, 10 friends gets lifetime ([Engadget](https://www.engadget.com/2234246/retro-app-what-is-it-how-to-use/); [Threads @retrodotapp](https://www.threads.com/@retrodotapp/post/DIx3pHzxUlI/as-a-big-thank-you-were-gifting-a-full-year-of-free-premium-membership-and-as-an?hl=en)) `[multi]`.
- Paywall visual layout: UNKNOWN.

### B4.14 Colors / skeuomorphism
- Background color, accent color, cream/paper textures: UNKNOWN.
- Skeuomorphic references in sources: the "iPod-inspired" click dial ([Fast Company](https://www.fastcompany.com/91462432/retro-photo-sharing-app)) `[single]` and the "film strip" metaphor for the weekly row ([TechCrunch 2023](https://techcrunch.com/2023/07/07/retro-is-a-deeply-personal-photo-journaling-app-for-close-friends/), [TechCrunch 2024](https://techcrunch.com/2024/07/11/photo-sharing-startup-retro-spots-google-photos-copying-its-idea-and-design/)) `[multi]` (two TechCrunch articles).

## B5. Retro microcopy (as reported in search excerpts)

| String | Context | Source | Conf. |
|---|---|---|---|
| "Retro — Photos with Friends" | Store name | App Store / Google Play | [multi] |
| "friends-only photo journal" | Tagline | Engadget; retro.app/ethos | [multi] |
| "Retro is a social app that feels like a joy, not a habit." | Ethos page | https://retro.app/ethos | [single] |
| "share real photos with real friends" | Store text | https://apps.apple.com/app/id6443709020 | [single] |
| "your friend list is private, likes on posts are private, no captions required" | Store text | https://apps.apple.com/app/id6443709020 | [single] |
| "See the newest posts from friends or time hop back to your own memories with our new widgets" | Store text (widgets) | https://apps.apple.com/app/id6443709020 | [single] |
| "Start a private album and drop the link in your group chat to collect and share photos after events" | Store text (Group Albums) | https://apps.apple.com/app/id6443709020 | [single] |
| "Create a beautiful photo collage or video slideshow from the photos you've shared from the week, month, or year" | Store text (Monthly Recaps) | https://apps.apple.com/app/id6443709020 | [single] |
| "this week in" | In-app card label fragment | TechCrunch 2025-12-12 | [single] |
| "Rewind" | Feature / tab name | TechCrunch 2025-12-12; Fast Company; GDI | [multi] |
| "Memories" | Tab name (earlier store text) | https://apps.apple.com/app/id6443709020 | [single] |
| "key" | Access-sharing object | Engadget; Threads | [multi] |
| "journals" | Group feature name (2024) | TechCrunch 2024-04-04 | [single] |

Notification strings, empty states and button labels: UNKNOWN.

## B6. Retro motion, haptics, sound
- Rewind dial: "**clicks**", "**subtle vibration as each new memory loads**", "**spin the dial**", photos "**flip by**" ([Fast Company](https://www.fastcompany.com/91462432/retro-photo-sharing-app)) `[single]`. "Tactile" ([TechCrunch 2025-12-12](https://techcrunch.com/2025/12/12/retro-a-photo-sharing-app-for-friends-lets-you-time-travel-through-your-camera-roll/)) `[single]`.
- Whether the click is an audible sound or haptic only: UNKNOWN. The source says "clicks" and separately "you'll feel a subtle vibration".
- All other motion: UNKNOWN.

---

# GAPS

**Process gap.** The shared WebSearch budget ran out after 21 queries, short of the planned 30–60. I did not run any non-English queries (DE/ES/PT/IT), Dribbble/Behance queries or job-posting queries. Leads I found but could not open:
- Yope: https://www.qustodio.com/en/blog/is-yope-safe ; https://djinni.co/jobs/company-yope/ ; https://yope.notion.site/yope-product-team-openings ; https://www.businessinsider.nl/trying-the-buzzy-social-media-platform-yope-showed-me-how-hard-it-is-to-get-people-to-download-another-app/ ; https://dev.to/xoomar/15m-users-force-a-rethink-of-yope-private-social-network-2o99 ; https://www.ypulse.com/newsfeed/2025/02/27/a-new-instagram-like-app-yope-is-catching-gen-zs-attention-but-maybe-not-their-time/ ; https://marketing4ecommerce.net/asi-es-yope/ (Spanish) ; https://techcrunch.com/2025/02/24/yope-is-sparking-genz-and-vc-interest-with-an-instagram-like-app-for-private-groups/ (not excerpted in detail)
- Retro: https://apptisan.substack.com/p/apptisan-013-retro ; https://www.youtube.com/watch?v=h3IfjbWsZz8 ; https://fullstackwhatever.com/episode/nathan-sharp-ryan-olson-a-big-beautiful-retrospective ; https://medium.com/@retrodotapp/why-we-started-retro-483baec50f55 ; https://apps.apple.com/nz/iphone/story/id1840659619 ; https://notes.jeddacp.com/retro-app/ ; https://blog.push.fm/14613/retro-social-app-sharing-memories/ ; https://fastcompany.co.za/co-design/2025-12-21-transform-your-memories-discover-retro-the-nostalgic-photo-sharing-app/

**Content gaps. These are UNKNOWN for both apps:**
1. **All brand visuals.** Logo and wordmark letterforms, app icons, every brand color and hex, mascots, illustration style. No source gives a single color or font.
2. **All typography.** UI typeface, marketing fonts, weights.
3. **Yope screen-level detail.** Chat bubble and photo treatment, split view, face-swap stickers, streaks, Wrapped 2025, voice messages, widget look and "surprise" mechanic, onboarding gate and permission copy, paywall, "real moments every hour", "different groups, different energy", reaction set, mini-game visuals, navigation and tabs.
4. **Retro screen-level detail.** Week-label format beyond "this week in", profile header layout, key iconography, the look and copy of the "post to see" lock state, Rewind dial visuals, **press-and-hold uncrop** (not found), timestamp stamp styling, **sticker recaps** (not found), recap style names, postcard ordering UI, Premium screen layout, background color (cream or not), the other bottom-nav tabs.
5. **Exact microcopy.** All strings here come from search excerpts. None were verified against live screens. Buttons, empty states and notifications are unknown for both apps.
6. **Unconfirmed claims from the brief.** Retro's Editors' Choice status. Vladimir Kremer as a Yope founder (sources name Bahram Ismailau and Paul Rudkouski). yope.tv as a domain.
7. **Unverified identity.** A Nathan Sharp typography-award designer profile (TCU, 2013) was not confirmed to be Retro's founder.

---

# Source index

**Yope**
- https://apps.apple.com/us/app/-/id1600195477
- https://www.bluestacks.com/campaign/app.salo/it/
- https://techcrunch.com/2026/07/22/yope-raises-12-3m-to-build-a-private-social-network-without-algorithms-or-ads/
- https://techcrunch.com/2025/02/24/yope-is-sparking-genz-and-vc-interest-with-an-instagram-like-app-for-private-groups/
- https://petapixel.com/2025/02/26/fast-growing-photo-app-yope-lets-users-share-images-to-private-groups
- https://marketing4ecommerce.net/en/what-is-yope/
- https://www.globaldatinginsights.com/featured/yope-raises-12-3m-for-private-algorithm-free-social-networking-app/
- https://zamin.uz/en/technology/213879-new-social-network-without-algorithms-and-ads-yope-project-raises-12-3-million.html
- https://yope.app/press

**Retro**
- https://apps.apple.com/us/app/retro-photos-with-friends/id6443709020 ; https://apps.apple.com/app/id6443709020
- https://play.google.com/store/apps/details?id=io.lonepalm.retro&hl=en_US
- https://mwm.ai/apps/retro-photos-with-friends/6443709020
- https://retro.app/ethos
- https://www.engadget.com/2234246/retro-app-what-is-it-how-to-use/
- https://techcrunch.com/2023/07/07/retro-is-a-deeply-personal-photo-journaling-app-for-close-friends/
- https://techcrunch.com/2023/12/07/retro-lets-you-create-recaps-of-your-most-memorable-photos-and-send-the-best-ones-as-postcards
- https://techcrunch.com/2024/04/04/retro-an-actually-good-photo-sharing-app-for-bffs-launches-collaborative-journals/
- https://techcrunch.com/2024/07/11/photo-sharing-startup-retro-spots-google-photos-copying-its-idea-and-design/
- https://mobilesyrup.com/2024/07/15/google-copies-retro-photo-sharing-app/
- https://techcrunch.com/2025/12/12/retro-a-photo-sharing-app-for-friends-lets-you-time-travel-through-your-camera-roll/
- https://www.fastcompany.com/91462432/retro-photo-sharing-app
- https://www.globaldatinginsights.com/featured/retro-adds-rewind-feature-to-let-users-explore-and-share-old-camera-roll-memories/
- https://www.threads.com/@retrodotapp/post/DIx3Wj9RpCN/as-a-big-step-toward-ad-free-social-media-were-introducing-retro-memberships-tha
- https://www.threads.com/@retrodotapp/post/DIx3pHzxUlI/as-a-big-thank-you-were-gifting-a-full-year-of-free-premium-membership-and-as-an?hl=en
- https://x.com/nsharp17/status/1927394864334885362
- https://twitter.com/nsharp17/status/1836415983109705987
- https://www.apple.com/newsroom/2025/11/apple-announces-finalists-for-the-2025-app-store-awards/
- https://retro-social-photo-journal.en.softonic.com/android ; https://www.pgyer.com/apk/apk/io.lonepalm.retro
- https://o.parsers.vc/startup/retro.app/
- https://yespress.io/nathan-sharp
- https://daily.dev/posts/friend-focused-photo-sharing-app-retro-snags-21m-jr3kelbhn
