# 25: Camera, journal, widget and shared-album sources: exact UI details (cluster 4)

Compiled 2026-10-07. WebSearch only. **24 of 24 allowed searches used (23 standard, 1 extended).** No page bodies were opened because curl and WebFetch are blocked. Every row comes from the search engine's result summary for the URL(s) cited.

## How to read this file

- **[V]**: stated by an official source or a major outlet, or two or more sources agree. Official sources are apple.com, developer.apple.com, App Store listings, and the app maker's own help center or blog. Major outlets are 9to5Mac, MacRumors, TechCrunch, PetaPixel, Android Central, BGR and Cult of Mac.
- **[V-weak]**: one third-party or low-quality source, or the summary paraphrased the source instead of quoting it. Treat it as a lead to confirm with a screenshot.
- **[B]**: background knowledge that was not verified this pass. These rows appear **only** in the BACKGROUND KNOWLEDGE section and are never mixed into the verified tables.
- **Quotes.** Text in "double quotes" appeared in quotes, or as a proper-noun label, in the result. Text without quotes describes behavior or layout and is not copy. **Only quoted strings are candidates for verbatim UI copy.**
- **Attribution.** When one search returned several URLs together, the row cites the most likely ones.
- **Related files.** `10-locket-exact.md`, `11-bereal-snap-instants-exact.md` and `12-retro-yope-exact.md` are not repeated here. Part A adds only rows that are **new** compared with those files.
- **Legal note.** Feature names such as Dual Camera, Rollcall, Rewind, Pin It!, Featured Photos and Classic Mode Switching belong to other companies. Copying names, wordmarks or trade dress verbatim carries trademark risk, so have it reviewed before launch.

---

## Part A: Gap fills for files 10, 11 and 12

### A1. Locket (gaps from file 10)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Locket | Capture review | Caption options | Users can add a caption such as "pre-written text (e.g. 'Goodnight')", the current time, or their own text before sending. "Goodnight" is the first preset caption string found in any source. | https://www.vodafone.co.uk/newscentre/?p=49765 | [V-weak] (one guide) |
| Locket | Capture review | Recipients | "select certain friends to receive the image or send it to everyone" (paraphrase; the button label is still unknown) | https://www.vodafone.co.uk/newscentre/?p=49765 | [V-weak] |
| Locket | History | Placement | Photos appear in a "History" folder "which you can scroll through just below the camera button" | https://www.vodafone.co.uk/newscentre/?p=49765 | [V-weak] (agrees with file 10's "tap history at the bottom") |
| Locket | History | Contents | History holds "sent and received images and messages" | https://www.vodafone.co.uk/newscentre/?p=49765 | [V-weak] |
| Locket | Reply | Reply types | Users respond "with a message or emoji, such as a heart or smiley face" | https://www.vodafone.co.uk/newscentre/?p=49765 | [V-weak] |
| Locket | Widget | Tap actions | The widget "can be tapped to take photos, invite friends, send messages or amend settings" | https://www.vodafone.co.uk/newscentre/?p=49765 | [V-weak] |
| Locket | Rollcall Live Activity | Founder quote on the takeover | "Every Sunday, we'll take over your Lock Screen and you'll get this nice Live Activity that pops up right on the homepage of the iPhone" | https://techcrunch.com/2025/11/03/lockets-social-app-is-picking-up-steam-with-gen-alpha | [V] (TechCrunch quote; the speaker is not named in the snippet) |
| Locket | Rollcall Live Activity | Surfaces | Lock Screen and Dynamic Island ("the black bar at the top of the screen") | same TechCrunch URL | [V] |
| Locket | Caption placeholder, reply-bar placeholder, History grid toggle, Gold paywall copy | — | **Still UNKNOWN** after 2 targeted searches. | — | — |

### A2. BeReal (gaps from file 11)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| BeReal | Feed blur | Mechanic reconfirmed | "If you don't post a photo, the app will blur everyone else's photos"; "Until someone posts a BeReal, all they'll see are blurred images" (outlet wording, not UI copy) | https://www.digitalparenthood.com/articles/bereal ; https://nmsuroundup.com/20372/showcase/bereal-the-new-social-media-app-to-beyourself/ | [V-weak] |
| BeReal | Feed blur | Rationale (outlet wording) | It is meant to keep you from being "discouraged to post by seeing that others are doing something cooler" | same | [V-weak] |
| BeReal | Overlay copy on blurred posts | — | **Still UNKNOWN** (third search overall, after 2 in file 11). | — | — |
| BeReal | RealMoji picker labels | — | Not searched this pass. The [B] set in file 11 (👍 😃 😲 😍 😂 + ⚡) remains the best lead. | — | — |

### A3. Retro (gaps from file 12)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Retro | Composer | Same-week picker rule | "The photo picker only lets you choose images captured during the same week" | https://engadget.com/2234246/retro-app-what-is-it-how-to-use | [V-weak] (summary of Engadget; matches file 12's free-tier rule) |
| Retro | Lock (soft) | Premium bypass | The premium subscription "allows viewing content without a reciprocal post" | https://engadget.com/2234246/retro-app-what-is-it-how-to-use ; https://app.dealroom.co/companies/retro_4 | [V-weak] |
| Retro | Albums | Name conflict | One profile calls shared albums "Journals". The store copy in file 12 says "Group Albums". **Conflict, so do not ship either as verified.** | https://app.dealroom.co/companies/retro_4 | [V-weak] (conflict) |
| Retro | "this week in" card | What the card is | "at the end of the chain of friends' posts, a card appears inviting you to view your own memories for the same week, but from a year ago". This explains the "this week in" fragment from file 12: it is a **same-week-last-year time-hop card**. | https://www.bitget.com/news/detail/12560605109438 ; https://mezha.net/eng/bukvy/retro-launches-rewind-feature-to-relive-past-memories-privately/amp/ ; https://www.fastcompany.com/91462432/retro-photo-sharing-app | [V-weak] (summary across several outlets) |
| Retro | Rewind | Entry points reconfirmed | "the end of the row of shared content, via the 'this week in' card, or from a more prominent position on the middle tab in the bottom navigation bar" | https://techcrunch.com/?p=3075566 ; https://www.globaldatinginsights.com/featured/retro-adds-rewind-feature-to-let-users-explore-and-share-old-camera-roll-memories/ | [V] |
| Retro | Rewind | Shared-photo timestamp | The app "adds a timestamp to make it clear the image is from the past, not a recent capture". **The format is still UNKNOWN.** | same | [V] (existence) |
| Retro | Week header, lock copy, key-flow copy | — | **Still UNKNOWN.** | — | — |

### A4. Yope (gaps from file 12)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Yope | Category framing | Self-description | "private mobile messenger focused on communication within closed groups, with no public profiles, follower counts, or algorithmic content feeds"; the CEO says "it's a messaging app" | https://en.wikipedia.org/wiki/YOPE ; https://eftm.com/2025/12/yope-is-the-great-hope-for-kids-after-the-social-media-ban-ceo-says-its-a-messaging-app-269483 | [V-weak] |
| Yope | Walls | Definition | users "build visual 'walls' or collages of shared photos that capture group memories over time" | https://en.wikipedia.org/wiki/YOPE ; https://techcrunch.com/?p=3145364 | [V-weak] |
| Yope | Widgets | Surfaces | a home-screen widget or "a lock-screen feature that lets them see their friends' latest posts without having to open up the app" | https://techcrunch.com/?p=3145364 ; https://pre.qustodio.com/en/blog/is-yope-safe/ | [V] |
| Yope | Scale | 2025 metrics | 2.2M MAU, 800K DAU, average age 18 | https://en.wikipedia.org/wiki/YOPE | [V-weak] |
| Yope | Tab structure and wall button labels | — | **Still UNKNOWN.** The search engine confused "split view" with iPadOS Split View. | — | — |

---

## Part B: New sources

### B1. Apple Camera (iOS 26 redesign)

Best informs: **open-to-camera home**, **corner icons and top controls**, **mode switching**, **capture-review thumbnail**.

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Apple Camera | Camera home | Primary modes | The main screen "prioritize[s] Photo and Video modes". Cinematic, Portrait, Slo-Mo and the other modes are still there, reached "by swiping left or right". | https://9to5mac.com/2025/06/09/ios-26-dramatically-overhauls-the-camera-interface/ ; https://www.macrumors.com/guide/ios-26-camera-app | [V] |
| Apple Camera | Camera home | Mode labels position | Photo and Video labels now sit **below** the shutter button instead of above it; controls shifted down | https://www.macrumors.com/guide/ios-26-camera-app ; https://www.macstories.net/stories/ios-and-ipados-26-the-macstories-review/14 | [V] |
| Apple Camera | Camera home | Top bar | Resolution and frame-rate controls moved to the **top** of the screen, "alongside toggles for Flash and Night Mode" | https://9to5mac.com/2025/06/09/ios-26-dramatically-overhauls-the-camera-interface/ ; https://www.macrumors.com/guide/ios-26-camera-app | [V] |
| Apple Camera | Camera home | Settings drawer gesture | "Swiping up within a mode" reveals settings such as "Exposure, Timer, and Aperture" | same | [V] |
| Apple Camera | Camera home | Last-photo thumbnail | The photo-library button is now **round** instead of square, matching Liquid Glass | https://www.macrumors.com/guide/ios-26-camera-app | [V] |
| Apple Camera | Motion | Mode-switch indicator | A "glass loupe that moves in the direction of your finger"; to go from photo to video, "you swipe left toward video" | https://9to5mac.com/2025/08/05/ios-26-camera-swipe-direction/ | [V] |
| Apple Camera | Settings | Toggle label | "Classic Mode Switching" (Settings, Camera; **off by default**) | https://9to5mac.com/2025/08/05/ios-26-camera-swipe-direction/ | [V] |

### B2. Snapchat Dual Camera, and Snapchat navigation in 2024–2025

Best informs: **dual camera mode**, **open-to-camera home**.

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Snapchat | Dual Camera | Feature name | "Dual Camera" | https://www.phonearena.com/news/Snapchat-introduces-a-Dual-Camera-feature_id142162 ; https://campaignme.com/snap-unveils-new-dual-camera-feature/ ; https://www.nasdaq.com/articles/snap-adds-dual-camera-feature-to-snapchat-for-ios-users | [V] |
| Snapchat | Dual Camera | Official pitch | "a new way for Snapchatters to capture multiple perspectives at the same time – so everyone can be part of the moment" | https://campaignme.com/snap-unveils-new-dual-camera-feature/ ; https://mobilemarketingmagazine.com/?p=116136 | [V] |
| Snapchat | Dual Camera | Layout names (4) | "vertical", "horizontal", "picture in picture", "cutout" | https://androidcentral.com/apps-software/snaps-new-dual-camera-feature-is-a-lot-cooler-than-you-think ; https://www.phonearena.com/news/Snapchat-introduces-a-Dual-Camera-feature_id142162 | [V] |
| Snapchat | Dual Camera | Horizontal layout | Screen split at the horizontal center: rear camera on top and front camera below, or the reverse | https://www.neowin.net/news/new-snapchat-feature-now-lets-you-record-videos-from-both-the-rear-and-front-cameras/ ; https://t2online.in/tech/tech-news/snapchat-brings-dual-camera-mode/82385 | [V-weak] |
| Snapchat | Dual Camera | Vertical layout | Split at the vertical center: rear on the left and front on the right, or the reverse | same | [V-weak] |
| Snapchat | Dual Camera | Picture-in-picture | The second camera shows "in a circular form" on top of the main camera view (a **circle**, not a rounded rectangle) | same | [V-weak] |
| Snapchat | Dual Camera | Cutout | An AR cutout of you is overlaid "on the bottom" of the video | https://androidcentral.com/apps-software/snaps-new-dual-camera-feature-is-a-lot-cooler-than-you-think | [V] |
| Snapchat | Dual Camera | Tool compatibility | Music, Stickers and Lenses work together with Dual Camera | https://campaignme.com/snap-unveils-new-dual-camera-feature/ | [V] |
| Snapchat | Dual Camera | Rollout | iOS first, "starting August 29"; Android later | https://www.phonearena.com/news/Snapchat-introduces-a-Dual-Camera-feature_id142162 | [V] |
| Snapchat | Navigation | 3-tab test name | "Simple Snapchat" (tabs: Messaging and Stories, Camera, a Reels-like Feed) | https://www.netinfluencer.com/simple-snapchat-simplified-interface-snap-partner-summit/ ; https://www.digit.in/news/apps/snapchat-unveils-a-new-3-tab-interface-ditches-5-tab-menu-know-more.html | [V] |
| Snapchat | Navigation | Outcome | The 3-tab design was scrapped after testing (about 7 months in). Snap is testing a tweaked **five-tab** layout instead, with more Stories in messaging and **Spotlight placed right next to the Camera button** | https://www.neowin.net/news/snapchat-ditches-three-tab-redesign-amid-user-loss-in-north-america/ ; https://propakistani.pk/2025/05/01/snap-kills-simplified-snapchat-redesign-after-user-backlash/amp/ ; https://influencermarketinghub.com/snapchat-redesign | [V] |

### B3. Apple Photos widgets, and Shared Albums in iOS 27

Best informs: **home-screen photo widget**, **time-hop widget**, **History**, **shared albums and reactions**.

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Apple Photos | Widget | Widget types | Two types: "Featured" (shuffles "Featured Photos" and "Memories" from **For You**) and "Album" (pick one album, shuffled) | https://allthings.how/how-to-set-a-photos-album-widget-on-iphone/ ; https://iphonelife.com/content/shuffle-photo-album-home-screen | [V] |
| Apple Photos | Widget | Album widget behavior | The widget "will shuffle through the photos in the album you choose throughout the day" (iOS 17+) | https://iphonelife.com/content/shuffle-photo-album-home-screen | [V] |
| Apple Photos | Widget | Curation control (iOS 18) | Users can add, remove or hide specific photos and Memories from the Featured Photos widget | https://igeeksblog.com/?p=605029 | [V-weak] |
| Apple Photos | Lock Screen | Photo Shuffle by album | From iOS 17.1, the "Photo Shuffle" Lock Screen can be limited to a specific album | https://mjtsai.com/blog/2023/11/08/ios-17-1-lock-screen-photo-album-shuffle ; https://iphonelife.com/content/set-photo-shuffle-wallpaper-to-specific-album | [V] |
| Apple Photos (iOS 27) | Shared Albums | Reactions flow | Open a Shared Album, preview a picture full screen, tap the **emoji button at the bottom**, then pick an emoji or "tap plus for more" (any emoji allowed) | https://www.cultofmac.com/news/ios-27-photos-features ; https://www.digitaltrends.com/phones/shared-albums-in-ios-27-feels-like-a-private-social-media-universe-of-its-own-and-i-love-it/ | [V] |
| Apple Photos (iOS 27) | Shared Albums | Quality | Full-resolution photos and videos (previously lower quality); counts against iCloud storage | https://thenote.app/post/en/ios-27-shared-albums-go-full-res-at-the-cost-of-your-icloud-storage-xrcisfpacy ; https://www.bgr.com/2189973/ios-27-android-users-shared-albums/ | [V] |
| Apple Photos (iOS 27) | Shared Albums | Temporary albums | Temporary Shared Albums "do not consume iCloud storage"; content "is deleted after 30 days if not saved" | https://www.cultofmac.com/news/ios-27-photos-features ; https://9to5mac.com/?p=1056963 | [V] |
| Apple Photos (iOS 27) | Shared Albums | Cross-platform | Android and Windows users can contribute; new participant permissions | https://www.bgr.com/2189973/ios-27-android-users-shared-albums/ | [V] |
| Apple Photos (iOS 27) | Collections | Names | "Captured by Me" (only photos you took) and "Identity Documents", both under **Utilities** | https://www.khaleejtimes.com/business/tech/ios-27-finally-gives-apple-photos-a-proper-camera-roll-with-captured-by-me ; https://www.cultofmac.com/news/ios-27-photos-features | [V] |
| Apple Photos (iOS 27) | Photo detail | Option label | "Add Keywords", shown when you scroll up on a photo | https://www.cultofmac.com/news/ios-27-photos-features | [V-weak] |
| Apple Photos (iOS 27) | Press framing | Headline | "Shared Albums in iOS 27 feels like a private social media universe of its own" (Digital Trends headline) | https://www.digitaltrends.com/phones/shared-albums-in-ios-27-feels-like-a-private-social-media-universe-of-its-own-and-i-love-it/ | [V] (headline, not UI) |

### B4. Apple Journal (iOS 26)

Best informs: **weekly journal**, **voice captions** (indirectly; see [B]).

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Apple Journal | Organization | Multiple journals | You can create multiple journals that act "as folders for unique seasons or topics" | https://medium.com/macoclock/apple-journal-just-got-huge-upgrades-in-ios-26-8-new-features-you-should-know-dca9e2f6f00b ; https://bgr.com/1922123/ios-26-journal-preview-ipad-mac-app/ | [V] |
| Apple Journal | Views | Map View | "Map View" shows all previous entries on a map | https://9to5mac.com/?p=1006506 ; https://www.techradar.com/phones/ios/apple-journal-is-finally-coming-to-the-ipad-and-mac-with-6-new-features-and-they-could-be-the-reason-i-switch-from-notes | [V] |
| Apple Journal | Entry | Inline images | Images can be added inline with the text, not only in the media section | https://www.heise.de/en/news/Apple-s-Journal-app-for-tablets-and-computers-10453477.html?view=print | [V-weak] |
| Apple Journal | Platforms | iPad and Mac | Arrives on iPad (with Apple Pencil handwriting) and Mac with iPadOS 26 and macOS Tahoe | https://bgr.com/1922123/ios-26-journal-preview-ipad-mac-app/ ; https://www.techradar.com/phones/ios/apple-journal-is-finally-coming-to-the-ipad-and-mac-with-6-new-features-and-they-could-be-the-reason-i-switch-from-notes | [V] |

### B5. Day One (journal widgets)

Best informs: **time-hop widget**, **streak and calendar entry**, **weekly journal**.

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Day One | Widgets | Count and places | "four unique widgets"; available in Today View, on the Home Screen and on the Lock Screen | https://help.dayoneapp.com/articles/1694292-day-one-widgets-for-ios ; https://dayoneapp.com/blog/introducing-widgets/ | [V] |
| Day One | Widget | Name | "On This Day" ("revisit photos from past years with the On This Day preview"; tapping opens entries from this date in previous years) | https://help.dayoneapp.com/articles/1694292-day-one-widgets-for-ios ; https://dayoneapp.com/blog/day-one-widgets-iphone-ipad/ | [V] |
| Day One | Widget | Name | "Daily Prompt" (tapping starts an entry "with the prompt already at the top"; answered prompts show as **faded text**) | same | [V] |
| Day One | Widget | Name and size behavior | "Streaks" (also "Journal Streaks"). The **small** size jumps to "Calendar View" and the **medium** size to "Today View". Tapping a date starts an entry for that day. | same | [V] |
| Day One | Widget | Fourth widget name | UNKNOWN (not in the snippet) | — | — |

### B6. Google Photos (Memories view, collaborative memories)

Best informs: **weekly journal** (timeline of moments) and **shared albums**. File 12 notes that Retro accused Google of copying its week-strip design (TechCrunch, 2024-07-11).

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Google Photos | Memories | Feature name and pitch | "Memories view": "a scrapbook-like timeline that lets you easily relive, customize and share your most memorable trips, celebrations and daily moments with your loved ones" | https://blog.google/products/photos/google-photos-memories-view/ ; https://techcrunch.com/2023/08/15/google-photos-adds-a-scrapbook-like-memories-view-feature-aided-by-ai | [V] (official blog) |
| Google Photos | Memories | Collaboration | Invite friends or family to collaborate on a memory, "contributing photos and videos to help fill in the gaps" | https://blog.google/products/photos/google-photos-memories-view/ ; https://www.zdnet.com.au/article/google-photos-will-offer-ai-assist-for-collaborating-on-your-favorite-memories/ | [V] |
| Google Photos | Memories | Share formats | Share as a photo, with video "in the coming weeks" (Aug 2023) | https://techcrunch.com/2023/08/15/google-photos-adds-a-scrapbook-like-memories-view-feature-aided-by-ai | [V] |
| Google Photos | Navigation | Bottom bar | The 2023 redesign added Memories to the navigation bar | https://www.sammobile.com/news/google-photos-redesign-navigation-bar-scrapbook-memories/ | [V-weak] |
| Google Photos | Press | Copy accusation | "Google copies Retro photo sharing app" (MobileSyrup headline, 2024-07-15) | https://mobilesyrup.com/2024/07/15/google-copies-retro-photo-sharing-app/ | [V] (headline) |

### B7. Airbuds Widget (friends' music widget)

Best informs: **live "right now" strip** (what friends are doing now), **home-screen widget**, a **weekly ritual** (Sunday recap).

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Airbuds | App Store | App name | "Airbuds Widget" | https://apps.apple.com/app/id1638906106 ; https://apps.appfollow.io/ios/airbuds-widget/1638906106?country=us | [V] |
| Airbuds | App Store | Core line | "a widget for best friends to share their listening activity" (you and your friends "see what each other are listening to right on your home screens") | https://apps.apple.com/app/id1638906106 | [V] |
| Airbuds | Interactions | Actions | "react to songs, play music on the app, and start a conversation" | https://apps.apple.com/app/id1638906106 | [V-weak] |
| Airbuds | Onboarding | Sign-up services | Spotify, Apple Music, Amazon Music, SoundCloud, Audiomack, Deezer | https://apps.apple.com/app/id1638906106 | [V] |
| Airbuds | Weekly ritual | Sunday recap | "Every Sunday you will receive a recap of your music to share with friends or to your socials" | https://apps.apple.com/app/id1638906106 | [V] |
| Airbuds | Scale | Metrics | 15M+ downloads, 5M MAU, 1.5M daily; $5M from Seven Seven Six | https://techcrunch.com/?p=3046865 | [V] |
| Airbuds | Analysis | Teardown | "Golden Mechanics: Airbuds" (a mechanics teardown worth opening by hand) | https://www.deconstructoroffun.com/blog/golden-mechanics-airbuds ; https://consumerapplab.substack.com/p/inside-airbuds-the-app-that-grew | [V-weak] (lead) |

### B8. Bump (by Amo, the Zenly team)

Best informs: **live "right now" strip** (presence details), **home-screen widget**.

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Bump | App Store | App name (US) | "Bump - hang with friends IRL" | https://apps.apple.com/us/app/-/id6471519217 | [V] |
| Bump | App Store | App name (FR) | "Bump - va voir tes amis IRL" | https://apps.apple.com/FR/app/id6471519217 | [V] |
| Bump | App Store | Core line | "create a personal map of your favorite people and places with precise, real-time, and battery friendly location sharing" | https://apps.apple.com/us/app/-/id6471519217 | [V] |
| Bump | Presence details | Live fields | who your friends are with, their **battery level**, **speed**, **how long they've been somewhere**, and what they're listening to "right now" | https://apps.apple.com/us/app/-/id6471519217 | [V] |
| Bump | Gesture | Shake to bump | "shake phones to 'BUMP'" | https://apps.apple.com/us/app/-/id6471519217 | [V-weak] |
| Bump | Widget | Home screen | "location widgets" to "quickly see what friends are up to" | https://apps.apple.com/us/app/-/id6471519217 | [V-weak] |
| Bump | Brand | Provenance line | "from the Zenly team" | https://apps.apple.com/us/app/-/id6471519217 ; https://techcrunch.com/2023/12/19/with-amos-third-app-the-makers-of-zenly-release-a-zenly-like-app | [V] |

### B9. Widgetable (and other friend-widget apps)

Best informs: **home-screen photo widget** (sending to a friend's screen).

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Widgetable | App Store | App name | "Widgetable: Besties & Couples" | https://apps.apple.com/us/app/widgetable-besties-couples/id1641107226 | [V] |
| Widgetable | App Store | Tagline | "Share Whatever on BFF's Screen" | https://apps.apple.com/us/app/widgetable-besties-couples/id1641107226 | [V] |
| Widgetable | Feature | Photo-to-friend widget | "Pin It!": put "your snaps, funny emojis, doodles, and texts" on your besties' screens | https://apps.apple.com/us/app/widgetable-besties-couples/id1641107226 | [V] |
| Widgetable | Feature | Widget names | "Pet Widget" (co-parent virtual pets), "Sleep Widget", "Mood Bubble", "Mood Jar", "Distance Widget" (real-time distance on the lock screen), "Miss You Widget" ("send love bombs"), "Plant Widget" | https://apps.apple.com/us/app/widgetable-besties-couples/id1641107226 ; https://www.ithinkdiff.com/widgetable-long-distance-lock-screen/ | [V] |
| Widgetable | Feature | Wallpaper styles | "3D art, AI designs, and paper cuts" | https://apps.apple.com/us/app/widgetable-besties-couples/id1641107226 | [V-weak] |
| Other | App Store | Comparable app names | "Widget Buddy - LiveIn Friends" ; "Photo Widget - WidGeek" (names only) | https://apps.apple.com/us/app/-/id1637158421 ; https://apps.apple.com/us/app/-/id6749874236 | [V-weak] |

### B10. Lapse (2025)

Best informs: **capture review** (archive vs. share), **weekly journal**, **History**.

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Lapse | App Store | App name | "Lapse - Disposable Camera" | https://apps.apple.com/app/apple-store/id1636699256 | [V] |
| Lapse | Brand | Slogan | "Friends not followers™" ; "Lapse is for Friends, not Followers" | https://bouncewatch.com/company/lapse ; https://cbubanner.com/2025/11/25/app-of-the-issue-lapse-brings-nostalgia-back/ | [V] |
| Lapse | Develop | Wait time (2025) | "anywhere from 10 minutes to an hour" (file 11 had 1–3 hours for a full roll in 2021) | https://cbubanner.com/2025/11/25/app-of-the-issue-lapse-brings-nostalgia-back/ | [V-weak] |
| Lapse | Post-develop | Three actions | **archive**, **delete** or **upload to journal**. Archive is "for your eyes only"; the journal "allows your friends to see it". | https://cbubanner.com/2025/11/25/app-of-the-issue-lapse-brings-nostalgia-back/ | [V-weak] |
| Lapse | Profile | Auto recap | A "monthly photodump" is created automatically on your profile | same | [V-weak] |
| Lapse | Profile | Customization | Profile music; highlight favorite snaps; private disappearing snaps to friends | same | [V-weak] |
| Lapse | 2025 direction | Store wording | "returned to its roots as a disposable-camera app for capturing and keeping your most treasured memories", with updates "to keep snapping and sync memories to your device" | https://apps.apple.com/app/apple-store/id1636699256 ; https://en.wikipedia.org/wiki/Lapse_(social_network) | [V-weak] (summary of the listing) |
| Lapse | Store | Reviews | More than 73,000 App Store reviews, close to 5 stars | https://cbubanner.com/2025/11/25/app-of-the-issue-lapse-brings-nostalgia-back/ | [V-weak] |

### B11. 1 Second Everyday (1SE)

Best informs: **weekly journal** (calendar grid of days), **voice and notes on entries**.

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| 1SE | Timeline | Calendar mode | The app "auto-arrang[es] moments by date in calendar mode"; you tap a day in the calendar, or use "+" in "Freestyle" | https://help.1se.co/en/articles/10290888-quick-start-guide-for-1-second-everyday-on-android | [V] (official help center) |
| 1SE | Entry | Per-day capacity | Two one-second snippets per day; journal notes; mood | https://iphonelife.com/content/capture-story-your-life-one-second-day-1se-app ; https://www.techradar.com/computing/websites-apps/im-no-movie-director-but-this-app-helped-me-create-a-movie-of-my-life | [V-weak] |
| 1SE | Timelines | Multiple | Several timelines (for yourself, each child, daily outfits) | same | [V-weak] |
| 1SE | Reminders | Wording | turn on notifications "to never miss a day"; "friendly reminders" | https://help.1se.co/en/articles/10290888-quick-start-guide-for-1-second-everyday-on-android | [V-weak] |
| 1SE | Feature names | Labels | "Freestyle", "Diary" (private notes) | same ; https://gulfnews.com/technology/app-spotlight-1-second-everyday-1.2127557 | [V-weak] |

### B12. Halide Mark III (Lux)

Best informs: **square viewfinder** (1:1 framing named after a film format) and the **camera control layout**.

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Halide | Camera | Design principle (quote) | "Composition is the bedrock of photography, so we put composition tools front and center" | https://petapixel.com/2026/05/27/halide-mark-iii-promises-most-beautiful-photos-possible-on-iphone/ | [V] |
| Halide | Camera | Aspect-ratio labels | "35mm (3:2)", "medium format (1:1)", "pano (65:24)", plus a dynamic ratio for Instagram | https://petapixel.com/2026/05/27/halide-mark-iii-promises-most-beautiful-photos-possible-on-iphone/ ; https://www.digitaltrends.com/phones/halide-mark-iii-brings-artsy-film-magic-to-one-of-the-best-iphone-camera-apps/ | [V] |
| Halide | Camera | Guides | rule of thirds, golden ratio, "rectangle fold-over" | same | [V] |
| Halide | Review | Feature names | "Looks", "Quick Edit", "Photo Lab"; "Shutter Priority" and "ISO Priority" modes | same | [V] |
| Halide | Pricing | Price | $19.99/year or $59.99 one-time; free for existing Mark II owners | https://petapixel.com/2026/05/27/halide-mark-iii-promises-most-beautiful-photos-possible-on-iphone/ | [V] |
| Halide | Release | Dates | Previewed 2024-12-23; shipped by 2026-05-27 | https://petapixel.com/2024/12/23/halide-mark-iii-previewed-one-tap-color-grading-hdr-and-a-new-ui ; https://techcrunch.com/2024/12/23/halides-next-version-will-come-with-new-film-filters-hdr/ | [V] |

### B13. PHHHOTO (original; 2025–2026 revival unconfirmed)

Best informs: **2-second pre-capture clip** (one tap makes a multi-frame loop).

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| PHHHOTO | Capture | Format definition | "a series of frames captured with a single touch, which are then looped back and forth to bring subjects to life" | https://coolhunting.com/tech/phhhoto-iphone-app/ ; https://techcrunch.com/2014/09/15/phhhoto-is-an-addictive-albeit-poorly-named-gif-style-photo-app/embed/ | [V] |
| PHHHOTO | Origin | Photobooth | SXSW 2013 iPad photobooth that "captured four frames" and looped them into a GIF | https://www.popphoto.com/news/2013/02/phhhoto-ipad-powered-gif-making-photobooth/ | [V] |
| PHHHOTO | Revival | 2025–2026 status | **UNCONFIRMED.** One App Store id surfaced (id6740413099, whose number suggests a 2025 listing) along with a Jan 23, 2026 student-paper item titled "new app shares moving photos". Neither summary named PHHHOTO. | https://apps.apple.com/app/id6740413099 ; https://cardinalpointsonline.com/new-app-shares-moving-photos | [V-weak] (lead only) |

### B14. Apple Human Interface Guidelines: Live Activities

Best informs: **Live Activity countdown on ritual day**.

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Apple HIG | Dynamic Island | Presentation names | "compact", "minimal", "expanded". With a single Live Activity, the system uses compact. | https://developer-rno.apple.com/design/human-interface-guidelines/components/system-experiences/live-activities ; https://wwdcnotes.com/documentation/wwdc23-10194-design-dynamic-live-activities/ | [V] |
| Apple HIG | Dynamic Island | Interactions | Tapping a minimal Live Activity opens the app. Touch-and-hold on compact or minimal shows expanded. | same | [V] |
| Apple HIG | StandBy | Placement | The minimal presentation appears at the top of the Lock Screen in StandBy | same | [V] |
| Apple HIG | Lock Screen | After-end lifetime | The system shows a Live Activity on the Lock Screen "for up to four hours after it ends" | same | [V] |
| Apple HIG | Layout | Consistency rules | Keep compact and expanded layouts consistent, and use a consistent design between the Lock Screen and expanded presentations | same ; https://9to5mac.com/2022/09/26/iphone-14-pro-live-activities-guidelines/ | [V] |

---

## Part C: Our surfaces mapped to the best sources

| Our surface (spec §D/§E/§N) | Best verified sources (this file + files 10–12) | What to copy |
|---|---|---|
| Open-to-camera home with corner icons | Apple Camera iOS 26 (B1); Locket (file 10); Snapchat 5-tab layout with Spotlight next to Camera (B2) | Top bar holds Flash and Night Mode style toggles; mode labels sit below the shutter; round last-photo thumbnail |
| Square viewfinder | Halide "medium format (1:1)" (B12); Locket square ([B] in file 10) | Name the square ratio after a film format; offer composition guides |
| Dual camera mode | Snapchat Dual Camera (B2); BeReal (file 11) | The four layout names; picture-in-picture as a **circle** |
| 2-second pre-capture clip | BeReal BTS (file 11); PHHHOTO loop (B13); Apple Live Photos ([B]) | "Behind The Scenes" toggle pattern; a loop made from one tap |
| Voice captions | Yope voice (file 12); Apple Journal audio ([B]) | **Weak.** No verified UI strings for voice captions. See Gaps. |
| Capture review with recipients | Locket "select certain friends … or send it to everyone" + "Goodnight" preset caption (A1); Lapse archive / delete / journal (B10) | A three-way choice after capture; preset caption chips |
| History of friends' photos | Locket History below the camera button (A1); iOS 27 Shared Albums emoji button at the bottom (B3) | Emoji button at the bottom with "+" for more |
| Weekly journal grouped by week with a soft "post to see" lock | Retro (A3, file 12); Google Photos Memories view (B6); 1SE calendar (B11); Apple Journal multiple journals (B4) | Same-week picker rule; premium bypass of the lock; a same-week-last-year card at the end of the row |
| Live "right now" strip | Bump presence fields (B8); Airbuds listening activity (B7); Yope split view (file 12) | "right now" wording; presence fields (with whom, how long) |
| Home-screen photo widget | Apple Photos "Album" widget shuffle (B3); Widgetable "Pin It!" (B9); Locket (file 10) | Shuffles "throughout the day"; push a photo onto a friend's screen |
| Time-hop widget | Day One "On This Day" (B5); Apple Photos "Featured" (B3); Retro widgets and "this week in" card (A3) | "On This Day" naming; tap opens past entries |
| Live Activity countdown on ritual day | Apple HIG (B14); Locket Rollcall (A1, file 10); Airbuds Sunday recap (B7) | Compact, minimal and expanded presentations; 4-hour after-end window; Sunday cadence |

---

## BACKGROUND KNOWLEDGE [B]

Not verified this pass. **Do not ship any of these as "copied" without screenshot or documentation confirmation.**

| App | Surface | Element | Recalled value | Confidence | Tag |
|---|---|---|---|---|---|
| Apple Camera | Live Photos | Capture window | Live Photos record about 1.5 s before and 1.5 s after the shutter (about 3 s total). This is the closest OS precedent for a 2-second pre-capture clip. | high | [B] |
| Apple Camera | Aspect ratio | Options | 4:3, 16:9 and "Square" (1:1) are offered from the top-bar or chevron controls. Placement in iOS 26 is unverified. | medium | [B] |
| Apple Camera | Haptics | Mode switch | A light selection haptic on each mode detent | medium | [B] |
| Apple HIG | Live Activities | Max duration | Active for up to **8 hours**, then up to 4 more hours on the Lock Screen (only the 4-hour figure was verified above) | high | [B] |
| ActivityKit | Countdown | Implementation | SwiftUI `Text(timerInterval:countsDown:)` renders a self-updating countdown without push updates | high | [B] |
| Apple HIG | Lock Screen | Height | The Lock Screen Live Activity view is limited to about 160 pt tall | medium | [B] |
| Snapchat | Dual Camera | Year and entry | Launched Aug 2022. Entry is an icon in the right-side camera tool rail. | high (year) / medium (entry) | [B] |
| Snapchat | Simple Snapchat | Announce | Unveiled at Snap Partner Summit, Sept 2024 | high | [B] |
| Apple Journal | Voice | Audio entries | Audio recordings with live transcription (iOS 18) | medium | [B] |
| Apple Journal | Insights | Streaks | An "Insights" view with streaks, total words and a calendar (iOS 18) | medium | [B] |
| Apple Journal | Privacy | Lock | Journal can be locked with Face ID | high | [B] |
| Apple Journal | Suggestions | Picker | "Journaling Suggestions" picker, plus a separate API for third-party apps | high | [B] |
| Apple Invites | Events | Shared album | The Apple Invites app (Feb 2025) attaches a Shared Album and an Apple Music playlist to each event invite | high | [B] |
| Google Photos | Shared albums | Join | Shared albums can be joined by link, and since 2025 by QR code | medium (link) / low (QR) | [B] |
| Instagram | Edits app | Identity | "Edits" is Instagram's standalone video editor and camera (2025) with long recording limits. It is not a friends-only sharing app. | medium | [B] |
| Instagram | Stories camera | Dual | Stories and Reels camera has a "Dual" mode that records front and back cameras together | medium | [B] |
| Airbuds | Widget | Layout | Friend's album art with their avatar overlaid, plus song title and artist; tap opens a reaction and reply sheet | low | [B] |
| Bump | Visual | Map style | Colorful stylized 3D map with large avatar pins, inherited from Zenly | medium | [B] |
| Halide | Visual | Accent color | Dark UI with a yellow or amber accent and a manual-focus dial | medium (dark/yellow) / low (hex) | [B] |
| Noteit | Widget | Mechanic | "Noteit Widget" lets you draw a doodle that appears on a friend's home-screen widget | medium | [B] |
| Candle | Couples | Mechanic | Couples app with daily questions and shared widgets | low | [B] |
| Polarsteps | Travel | Mechanic | Automatic trip tracking with a printable "Travel Book" | high | [B] |
| WidgetClub | Widgets | Mechanic | Home-screen theming app (icon packs and photo widgets), not friend-to-friend | medium | [B] |
| Dispo | 2026 | Status | No current information. The app was relaunched and repositioned several times after 2021. | low | [B] |
| Gatsby | — | Identity | Could not identify which "Gatsby" app the brief means | — | [B] |

---

## Recommended additions to the source list

1. **Apple HIG: Live Activities** (developer.apple.com). Official rules for the ritual-day countdown: presentation names, tap and hold behavior, StandBy, lifetime. More useful than any third-party app for §N.
2. **Apple Photos Shared Albums (iOS 27).** Emoji button at the bottom with "+" for more; temporary albums deleted "after 30 days if not saved". This is the OS-native pattern our friends will compare us to.
3. **Day One widgets** (help.dayoneapp.com/articles/1694292). "On This Day", "Daily Prompt" and "Streaks" names and tap behaviors. The cleanest time-hop widget precedent.
4. **Apple Photos Featured and Album widgets.** Shuffle "throughout the day" behavior for the home-screen photo widget.
5. **Halide Mark III.** The "medium format (1:1)" label and its composition-first principle for the square viewfinder.
6. **Apple Camera iOS 26.** Mode labels below the shutter, top-bar toggles, round thumbnail, "Classic Mode Switching".
7. **Snapchat Dual Camera** (2022 newsroom). Four layout names; a circular picture-in-picture.
8. **Airbuds Widget.** "Every Sunday … a recap" weekly ritual, and a friends-activity widget with 5M MAU.
9. **Bump (Amo).** "right now" presence fields (with whom, how long they've been somewhere) for the live strip.
10. **Widgetable.** The "Pin It!" push-to-friend's-screen pattern and the "Share Whatever on BFF's Screen" framing.
11. **Lapse (2025).** The archive / delete / journal triage after capture, and the "Friends not followers™" positioning.
12. **Google Photos Memories view.** Collaborative memories that friends fill in ("help fill in the gaps").
13. **1 Second Everyday** (help.1se.co). Calendar-mode grid and "+" in "Freestyle".
14. **Apple Invites** ([B]; verify next pass). Event-scoped shared album, a precedent for ritual-day albums.

**Deprioritise or drop** (searched with no usable result, or not searched): PHHHOTO revival (unconfirmed), Dispo 2026, Gatsby (unidentified), Swipe / PicPals, WidgetClub, Polarsteps, Candle, Noteit, Instagram Edits, Kino. None were verified, and the [B] notes suggest most are off-surface.

---

## Gaps (UNKNOWN after 24 searches)

**Carried over from files 10–12, still open**
- Locket: caption placeholder ("Add a message" is still [B]), reply-bar placeholder, History grid toggle, Rollcall Live Activity **on-screen text** and countdown, Gold paywall headline and CTA. Only the founder's description of the takeover was found.
- BeReal: overlay text on blurred posts (3 searches total, none found); RealMoji picker labels (not searched).
- Retro: week-header wording and date format, lock-state copy, key-flow copy, Rewind **timestamp format**. "this week in" is now understood as a same-week-last-year card, but the full label is unknown. "Journals" vs "Group Albums" naming conflict.
- Yope: tab structure, wall button labels.

**New**
- **Voice captions.** No verified source has voice-caption UI strings: record button label, waveform, length limit or playback chip.
- **Live Activity copy.** No app's real Live Activity text was found (Locket, Airbuds or any other).
- **Apple Camera iOS 26.** Exact aspect-ratio control and square-mode label; haptics.
- **Snapchat 2025–2026 camera.** Exact icon positions in the current five-tab layout; Dual Camera icon and label in the tool rail.
- **Airbuds and Bump.** Widget layouts, reaction sheet strings, empty states.
- **Widgetable.** "Pin It!" composer screen strings.
- **Day One.** Name of the fourth widget; exact empty-state text for "On This Day".
- **Hex colors, fonts, motion.** None found for any new source. The only motion detail is iOS 26's "glass loupe that moves in the direction of your finger".
- **iOS 27 "Moments".** The brief's "Moments" feature was not found; only Shared Albums and collection changes surfaced.
- **PHHHOTO revival.** Existence unconfirmed.

**Leads to open by hand** (pages were blocked here): https://help.dayoneapp.com/articles/1694292-day-one-widgets-for-ios ; https://www.macrumors.com/guide/ios-26-camera-app ; https://www.cultofmac.com/news/ios-27-photos-features ; https://www.deconstructoroffun.com/blog/golden-mechanics-airbuds ; https://apps.apple.com/app/id6740413099 ; https://cardinalpointsonline.com/new-app-shares-moving-photos ; https://www.vodafone.co.uk/newscentre/?p=49765 (Locket parent guide, which may contain screenshots).

---

## Sources (24 WebSearch calls)

vodafone.co.uk/newscentre/?p=49765 ; techcrunch.com (2025/11/03 Locket; ?p=3075566 Retro Rewind; ?p=3145364 Yope; ?p=3046865 Airbuds; 2023/12/19 Amo Bump; 2023/08/15 Google Photos; 2024/12/23 Halide; 2014/09/15 Phhhoto) ; digitalparenthood.com/articles/bereal ; nmsuroundup.com ; engadget.com/2234246 ; app.dealroom.co/companies/retro_4 ; bitget.com/news/detail/12560605109438 ; mezha.net ; fastcompany.com/91462432 ; globaldatinginsights.com ; en.wikipedia.org/wiki/YOPE ; eftm.com ; pre.qustodio.com ; 9to5mac.com (2025/06/09; 2025/08/05; ?p=1006506; ?p=1056963; 2022/09/26) ; macrumors.com/guide/ios-26-camera-app ; macstories.net ; phonearena.com ; androidcentral.com ; campaignme.com ; mobilemarketingmagazine.com ; neowin.net (2) ; t2online.in ; nasdaq.com ; netinfluencer.com ; digit.in ; propakistani.pk ; influencermarketinghub.com ; medium.com/macoclock ; bgr.com (2) ; techradar.com (2) ; heise.de ; allthings.how ; iphonelife.com (3) ; igeeksblog.com ; mjtsai.com ; cultofmac.com ; khaleejtimes.com ; digitaltrends.com (2) ; thenote.app ; blog.google ; zdnet.com.au ; sammobile.com ; mobilesyrup.com ; apps.apple.com (Airbuds 1638906106; Bump 6471519217 US/FR; Widgetable 1641107226; Widget Buddy 1637158421; WidGeek 6749874236; Lapse 1636699256; 6740413099) ; deconstructoroffun.com ; consumerapplab.substack.com ; ithinkdiff.com ; help.dayoneapp.com ; dayoneapp.com/blog (2) ; cbubanner.com ; bouncewatch.com ; en.wikipedia.org/wiki/Lapse_(social_network) ; help.1se.co ; gulfnews.com ; petapixel.com (2026/05/27; 2024/12/23) ; coolhunting.com ; popphoto.com ; cardinalpointsonline.com ; developer-rno.apple.com (HIG Live Activities) ; wwdcnotes.com.
