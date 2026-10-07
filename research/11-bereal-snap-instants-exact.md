# 11 — BeReal, Instagram Instants, Snapchat, Lapse, Dispo: exact UI details (cluster 2)

Compiled 2026-10-07. WebSearch only (26 of 26 allowed calls used). No page bodies were opened; every row comes from the search engine's result summary for the URL(s) cited.

## How to read this file

- **[V]**: stated in a search result from an official source (help.bereal.com, newsroom.snap.com, about.instagram.com, bereal.com) or a major outlet (TechCrunch, Engadget, PetaPixel, CNBC, Axios). Strings in quotes appeared in quotes in the result.
- **[V-weak]**: stated only by a third-party tutorial, aggregator or low-quality site, or paraphrased by the summary rather than quoted. Treat it as a lead to confirm with a screenshot.
- **[B]**: background knowledge, not verified this pass. These rows are kept in a separate section at the end and are never mixed into the verified tables.
- **Caveat on "exact"**: the search tool returns summaries. Even [V] strings may be lightly normalized (case, punctuation, emoji). Confirm against live screenshots before shipping copy.
- **Attribution**: when one result returned several URLs together, the citation lists the most likely URL(s).
- **Cross-reference**: `research/03-bereal-instants-snapchat.md` has more BeReal logo and wordmark rows from an earlier pass (for example, the trailing period in "BeReal.").
- **Legal note for the product team**: the names, wordmarks and feature names below (BeReal, RealMoji, Bonus BeReal, Snapstreak, Lens+, Instants and others) are other companies' trademarks. Copying them verbatim into a shipped app carries trademark and trade-dress risk. Have someone check this before launch.

---

## 1. BeReal

### 1.1 Notification and timing

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| BeReal | Push notification | Name of the daily prompt | "Time to BeReal" | https://help.bereal.com/hc/articles/15416869159197 ; https://help.bereal.com/hc/articles/7350386715165 | [V] |
| BeReal | Push notification | Capture window | TWO minutes to post after the notification | https://help.bereal.com/hc/articles/15416869159197 | [V] |
| BeReal | Push notification | Timing rule | Everyone in the same time zone gets the notification at the same time each day; the time is not known in advance | https://help.bereal.com/hc/articles/7350386715165 | [V] |
| BeReal | Push notification | Tap behavior | Tapping a Time to BeReal notification opens the app straight to the camera view | https://petapixel.com/bereal-guide/ | [V] |
| BeReal | Push notification | Visual | Notification "pops up with a yellow hazard sign" (the ⚠️ emoji) | https://socialbu.com/blog/glossary/bereal ; https://brandmentions.com/wiki/What_is_BeReal_app%3F | [V-weak] |
| BeReal | Bonus push or blog | Bonus BeReal headline (official blog title) | "⚠️ It's Time for Bonus BeReal! ⚠️" (blog title was "UK Users, ⚠️ It's Time for Bonus BeReal! ⚠️") | https://bereal.com/en/?p=521 | [V] |
| BeReal | Feed or post | Late stamp | Posts made after the 2 minutes are stamped "x hours late" | https://help.bereal.com/hc/articles/15416869159197 ; https://www.wjpitch.com/arts-and-entertainment/2022/06/17/time-to-bereal | [V-weak] (attribution to help.bereal.com uncertain) |
| BeReal | Feed | Late rule | You can post any time after the notification, but friends will know you posted late | https://help.bereal.com/hc/articles/15416869159197 | [V] |

### 1.2 Capture screen

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| BeReal | Camera | Timer | The two-minute countdown is already running when the camera opens | https://petapixel.com/bereal-guide/ | [V] |
| BeReal | Camera | Selfie inset position | Selfie preview at the **top left**; the rear-camera view fills most of the screen | https://petapixel.com/bereal-guide/ | [V] |
| BeReal | Camera | Capture order | The rear camera fires first, then the front (selfie) camera shortly after | https://petapixel.com/bereal-guide/ ; https://shotkit.com/bereal-ultimate-guide/ | [V-weak] |
| BeReal | Camera | Shutter | "press the shutter" (a single shutter button takes both photos) | https://petapixel.com/bereal-guide/ | [V] |
| BeReal | Camera | Retake rule | You can take as many shots as you like, but only one can be posted | https://shotkit.com/bereal-ultimate-guide/ | [V-weak] |

### 1.3 Post preview screen

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| BeReal | Post preview | BTS toggle, on state | 'BTS On' | https://help.bereal.com/hc/articles/15272815079453 | [V] |
| BeReal | Post preview | BTS toggle, off state | 'BTS Off' (tap once to enable) | https://help.bereal.com/hc/articles/15272815079453 | [V] |
| BeReal | Post preview | BTS toggle position | Top right | https://help.bereal.com/hc/articles/15272815079453 | [V] |
| BeReal | Post preview | BTS meaning | "Behind The Scenes (BTS)": shares the few seconds before your BeReal, like an iOS Live Photo | https://help.bereal.com/hc/articles/15272815079453 ; https://alternativeto.net/news/2023/12/bereal-unveils-four-new-features-bts-realgroups-tagging-and-your-2023-recap | [V] |
| BeReal | Post preview | Send button | 'SEND' (all caps) | https://help.bereal.com/hc/articles/15272815079453 | [V] |
| BeReal | Post preview | Retake control | Small "X"-shaped button in the upper-right corner deletes the pair of photos so you can retake | https://qa2.www.digitaltrends.com/?p=3232149 ; https://www.trustedreviews.com/how-to/how-to-see-your-friends-retake-number-on-bereal-4271902 | [V-weak] (conflicts with BTS "top right"; may be from an older version) |
| BeReal | Post preview | Caption | A caption can be added after the photo is taken | https://snappa.com/blog/what-is-bereal/ | [V-weak] |

### 1.4 Friends feed and blur

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| BeReal | Feed | Blur rule | Friends' posts stay blurred until you post your own BeReal | https://digitalparenthood.com/articles/bereal ; https://www.cultofmac.com/?p=805191 | [V-weak] |
| BeReal | Feed | Friends of Friends | You can't view your friends' feed or the Friends of Friends feed until you've posted | https://techcrunch.com/2023/08/21/bereal-gets-more-social-with-friends-of-friends-feature | [V] |
| BeReal | Feed | Unblur exception | Users with more than 100 friends could unblur 15 friends' posts without posting | https://www.nationalworld.com/lifestyle/tech/what-unblurred-bereal-mean-social-media-users-confused-new-feature-4176699 | [V-weak] |
| BeReal | Feed | Exact text over blurred posts | **UNKNOWN** (searched twice) | — | — |

### 1.5 RealMoji

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| BeReal | RealMoji | Count | Six RealMojis, one of which is the Instant RealMoji | https://help.bereal.com/hc/articles/7536240858653 | [V] |
| BeReal | RealMoji | Entry point 1 | Smiley-face icon at the **bottom right** of a friend's BeReal | https://help.bereal.com/hc/articles/7536240858653 | [V] |
| BeReal | RealMoji | Entry point 2 | Double-tap anywhere on the BeReal to open the RealMoji view | https://help.bereal.com/hc/articles/7536240858653 | [V] |
| BeReal | RealMoji | Capture | Tap the **white button** to capture your reaction | https://help.bereal.com/hc/articles/7536240858653 | [V] |
| BeReal | RealMoji | Save button | "Continue" | https://help.bereal.com/hc/articles/7536240858653 | [V] |
| BeReal | RealMoji | Limit | One RealMoji per BeReal; you can change it at any time | https://help.bereal.com/hc/articles/7536240858653 | [V] |
| BeReal | RealMoji | Instant RealMoji | Feature name "Instant RealMoji"; lightning-bolt icon; a one-time live reaction | https://help.bereal.com/hc/en-us/articles/17845941900445-Instant-RealMoji ; https://www.distractify.com/p/what-does-the-lightning-bolt-mean-on-bereal | [V] |
| BeReal | RealMoji | Instant unlock | Unlocked after sending a set number of RealMoji; the number is shown on the Instant RealMoji screen | https://help.bereal.com/hc/en-us/articles/17845941900445-Instant-RealMoji | [V] |
| BeReal | RealMoji | The five standard emoji | **UNKNOWN** this pass (see [B]) | — | — |

### 1.6 Bonus BeReal, Memories, Recap

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| BeReal | Bonus BeReal | Unlock rule | Posting on time unlocks two Bonus BeReal that day, at a time you choose; posting late locks them | https://help.bereal.com/hc/articles/10388190752669 | [V] |
| BeReal | Bonus BeReal | Entry point | A frame on the right of your BeReal; tap it to open the camera | https://help.bereal.com/hc/articles/10388190752669 | [V] |
| BeReal | Memories | Link on profile | "View all my Memories" | https://help.bereal.com/hc/en-us/articles/7531349180829 | [V] |
| BeReal | Memories | Privacy | Only you can see your Memories, not even your friends | https://help.bereal.com/hc/en-us/articles/7531349180829 | [V] |
| BeReal | Memories | Bonus posts | Bonus BeReal are saved in Memories | https://help.bereal.com/hc/articles/10388190752669 | [V] |
| BeReal | Navigation | Profile entry | Profile photo in the **top right** of the main screen | https://www.bustle.com/life/how-to-get-bereal-recap-year-in-review-video | [V-weak] |
| BeReal | 2023 Recap | Feature name | "Your 2023 Recap" | https://alternativeto.net/news/2023/12/bereal-unveils-four-new-features-bts-realgroups-tagging-and-your-2023-recap | [V] |
| BeReal | 2023 Recap | Entry icon | Bottom left of the Memories screen: an icon of a screen with sparkles | https://www.bustle.com/life/how-to-get-bereal-recap-year-in-review-video | [V-weak] |
| BeReal | 2023 Recap | Generate button | "Generate my 2023 video recap" | https://www.bustle.com/life/how-to-get-bereal-recap-year-in-review-video | [V-weak] |
| BeReal | 2023 Recap | Hashtag | #BeRealRewind | https://bereal.com/en/?p=3922 | [V] |
| BeReal | 2023 Recap | Share controls | Three-dot menu and Share icon appear in the **bottom right** after the first few seconds of playback | https://www.bustle.com/life/how-to-get-bereal-recap-year-in-review-video | [V-weak] |
| BeReal | 2022 Recap | Queue | The 2022 recap video had a waiting list | https://petapixel.com/2022/12/20/bereal-turns-photos-into-2022-recap-video-but-feature-has-waiting-list | [V] |

### 1.7 RealGroups and RealChat

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| BeReal | RealGroups | Function | Share your BeReal with a smaller group of friends, with messaging inside the group | https://alternativeto.net/news/2023/12/bereal-unveils-four-new-features-bts-realgroups-tagging-and-your-2023-recap ; https://www.socialmediatoday.com/news/bereal-adds-video-posts-group-chats-and-more-in-latest-feature-update/702446/ | [V] |
| BeReal | RealChat | Function | 1:1 messaging with friends; send a private BeReal with no time limit; react with RealMoji | https://techcrunch.com/?p=2549530 ; https://www.slashgear.com/1302690/bereal-testing-direct-messaging/ | [V] |
| BeReal | RealChat | Launch | First tested in Ireland | https://techcrunch.com/?p=2549530 | [V] |

### 1.8 Block and report

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| BeReal | Report post | Flow | Three-dot menu **above** the BeReal, then the report option, then choose a reason, then add optional details | https://help.bereal.com/hc/articles/10100086147229 | [V] |
| BeReal | Report profile | Flow | Profile, then three-dot menu at **top right**, then the report option, then a reason, then details | https://help.bereal.com/hc/articles/9775866279453 | [V] |
| BeReal | Block | Flow | Profile, then three-dot menu at top right, then the block option | https://help.bereal.com/hc/articles/9775866279453 | [V] |
| BeReal | Block | Effects | A blocked user can't send friend invites, see or react to your BeReals, see your reactions on other posts, or view your profile; they are not notified | https://help.bereal.com/hc/articles/9775866279453 | [V] |
| BeReal | Report | Anonymity | All reports are anonymous | https://esafety.gov.au/key-topics/esafety-guide/bereal | [V] |
| BeReal | Report | Reason list labels | **UNKNOWN** | — | — |

### 1.9 Brand

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| BeReal | Logo | Colors | White name on a black background | https://logokit.com/brands/bereal.com ; https://metricool.com/es/que-es-bereal | [V-weak] (aggregators) |
| BeReal | Logo or UI | Font name | **UNKNOWN** | — | — |

---

## 2. Instagram Instants (2026)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Instagram | Instants | Launch copy | "Instants, a new way to share in the moment – with spontaneous, unfiltered photos– with friends" | https://about.instagram.com/blog/announcements/introducing-instants-for-sharing-in-the-moment | [V] |
| Instagram | Instants | Location in app | **Bottom right corner** of the Instagram inbox (DMs); tap the camera to share | https://about.instagram.com/blog/announcements/introducing-instants-for-sharing-in-the-moment | [V] |
| Instagram | Instants | Audience options | Close Friends, or mutuals ("followers you follow back") | https://about.instagram.com/blog/announcements/introducing-instants-for-sharing-in-the-moment | [V] |
| Instagram | Instants | Caption order | The caption is added **first**, before the photo; Instants can't be edited further | https://about.instagram.com/blog/announcements/introducing-instants-for-sharing-in-the-moment | [V] |
| Instagram | Instants | Undo | An undo button appears automatically the moment you share, so you can take it back before friends get it | https://about.instagram.com/blog/announcements/introducing-instants-for-sharing-in-the-moment | [V] |
| Instagram | Instants | Recipient view | Received Instants show as a **stack of photos** in the bottom right corner of friends' inboxes | https://about.instagram.com/blog/announcements/introducing-instants-for-sharing-in-the-moment | [V] |
| Instagram | Instants | Expiry | Disappears after it is viewed once; unopened Instants expire after 24 hours | https://about.instagram.com/blog/announcements/introducing-instants-for-sharing-in-the-moment ; https://abc7ny.com/19098893/ | [V] |
| Instagram | Instants | Replies | Friends can react and reply; replies go to DMs | https://about.instagram.com/blog/announcements/introducing-instants-for-sharing-in-the-moment | [V] |
| Instagram | Instants | Screenshots | Screenshots and screen recordings are blocked | https://www.inro.social/blog/instagram-instants | [V-weak] |
| Instagram | Instants | Archive | Sent Instants are kept in a private archive only you can see, for up to one year | https://www.inro.social/blog/instagram-instants | [V-weak] |
| Instagram | Instants | Recap | Archived Instants can be compiled into a recap and posted to Stories | https://www.inro.social/blog/instagram-instants | [V-weak] |
| Instagram | Instants app | Standalone app | A separate "Instants" app that opens straight to the camera; available in select countries on iOS and Android | https://www.etvbharat.com/en/technology/instagram-launches-instants-app-for-sharing-disappearing-photos-like-snapchat-locket-bereal-enn26042501439 ; https://www.inro.social/blog/instagram-instants | [V-weak] |
| Instagram | Instants | Dates | Standalone app reported on 2026-04-23; in-app feature reported as introduced in May 2026 (sources differ) | https://www.etvbharat.com/en/technology/instagram-launches-instants-app-for-sharing-disappearing-photos-like-snapchat-locket-bereal-enn26042501439 ; https://www.gigazine.net/gsc_news/en/20260514-instants-instagram/ | [V-weak] |
| Instagram | Instants | Camera layout, text overlay, button labels | **UNKNOWN** | — | — |
| Instagram | Instants | Teen controls copy | **UNKNOWN** (search returned only general 2024 Teen Accounts news) | — | — |

---

## 3. Snapchat

### 3.1 Camera layout

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Snapchat | Camera | Shutter | Large button at **bottom middle**; tap for a photo, hold for a video | https://www.techlicious.com/tip/everything-you-ever-wanted-to-know-about-snapchat/ | [V-weak] (older guide) |
| Snapchat | Camera | Flip camera | Camera-switch icon at **top right** | https://www.techlicious.com/tip/everything-you-ever-wanted-to-know-about-snapchat/ | [V-weak] |
| Snapchat | Camera | Flash | Lightning-bolt icon at **top left** (older layout) | https://www.techlicious.com/tip/everything-you-ever-wanted-to-know-about-snapchat/ | [V-weak] (likely outdated) |
| Snapchat | Camera | Memories | Small circle **below** the shutter opens Memories (older layout) | https://www.techlicious.com/tip/everything-you-ever-wanted-to-know-about-snapchat/ | [V-weak] (likely outdated) |

### 3.2 Streaks

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Snapchat | Streaks | Hourglass ⌛ meaning | Warning that the streak is about to expire; send a Snap soon to keep it | https://beebom.com/what-hourglass-mean-snapchat/amp/ | [V-weak] |
| Snapchat | Streaks | Hourglass duration | The hourglass shows for about four hours before the 🔥 streak disappears | https://beebom.com/what-hourglass-mean-snapchat/amp/ | [V-weak] |
| Snapchat | Streaks | Restore window | Free Snapstreak Restore is available for 24 hours after a streak is lost | https://bgr.com/guides/how-to-recover-your-snapstreak/ ; https://beebom.com/snapchat-streak-lost-how-get-snapstreak-back/amp/ | [V-weak] |
| Snapchat | Streaks | What counts | Streaks count photo or video Snaps sent from the camera, not chat messages | https://www.unilink.us/blog/snapchat-streak-rules | [V-weak] |
| Snapchat | Group Streaks | Announcement title | "Introducing Infinite Retention and Group Streaks" | https://newsroom.snap.com/infiniteretentionandgroupstreaks | [V] |
| Snapchat | Group Streaks | Rule copy | "every Snap you share contributes to a collective Streak"; continues "as long as most of the members participate" | https://newsroom.snap.com/infiniteretentionandgroupstreaks | [V] |
| Snapchat | Group Streaks | Restore | Can be restored within a week of ending; optional and private | https://newsroom.snap.com/infiniteretentionandgroupstreaks | [V] |
| Snapchat | Group Streaks | Separation | Snaps in a group count toward the group streak, never toward a 1:1 streak with a member | https://www.unilink.us/blog/snapchat-streak-rules | [V-weak] |
| Snapchat | Streaks | Exact Streak Restore button and dialog copy | **UNKNOWN** | — | — |

### 3.3 Memories storage and subscriptions

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Snapchat | Memories | Announcement title, plan family name | "Introducing Memories Storage Plans" | https://newsroom.snap.com/snap-memory-storage | [V] |
| Snapchat | Memories | Free cap | 5GB free | https://newsroom.snap.com/snap-memory-storage ; https://www.businesstoday.in/amp/technology/news/story/snapchat-limits-storage-for-memories-introduces-paid-plans-for-cloud-storage-options-496098-2025-09-29 | [V] |
| Snapchat | Memories | Entry plan | 100GB for $1.99/month | https://www.storyboard18.com/digital/snapchat-caps-free-memories-storage-launches-paid-subscription-tiers-81675.htm | [V] |
| Snapchat | Memories | Snapchat+ storage | 250GB (Snapchat+ at $3.99/month) | https://www.storyboard18.com/digital/snapchat-caps-free-memories-storage-launches-paid-subscription-tiers-81675.htm | [V] |
| Snapchat | Memories | Platinum storage | 5TB in Platinum at $15.99/month | https://www.storyboard18.com/digital/snapchat-caps-free-memories-storage-launches-paid-subscription-tiers-81675.htm | [V] |
| Snapchat | Memories | Grace period | Users already over the cap get 12 months of temporary storage | https://newsroom.snap.com/snap-memory-storage ; https://www.medianama.com/2025/10/223-snapchat-unlimited-free-photos-videos-storage/ | [V] |
| Snapchat | Memories | Scale stat | Launched in 2016; more than a trillion saved Snaps | https://newsroom.snap.com/snap-memory-storage | [V] |
| Snapchat | Snapchat+ | Price and perks | $3.99/month; 40+ perks, including Friend Solar System, Story rewatch counts, one free Snapstreak restore, custom app icons, Ghost Trails on the Snap Map | https://www.subscriptioninsider.com/article-type/news/snapchat-introduces-ad-free-platinum-tier-will-subscribers-pay-the-price ; https://www.socialmediatoday.com/news/snapchat-plus-ad-free-subscription/738982/ | [V-weak] |
| Snapchat | Lens+ | Price and pitch | $8.99/month (launched June 2025); "hundreds of Lenses and AR experiences that let you play, create, and share Snaps with friends in whole new ways"; includes Snapchat+ perks | https://www.netinfluencer.com/snapchat-unveils-lens-plus-subscription-tier-for-snapchat-plus-users | [V-weak] |
| Snapchat | Platinum | Scope | Ad-free: removes Sponsored Snaps, Story ads and Lens ads; sponsored places and My AI responses can still appear | https://www.socialmediatoday.com/news/snapchat-plus-ad-free-subscription/738982/ | [V] |
| Snapchat | Platinum | Price conflict | Reported as $15.99 by most sources and $14.99 by one | https://www.netinfluencer.com/snapchat-unveils-lens-plus-subscription-tier-for-snapchat-plus-users | [V-weak] (conflict) |
| Snapchat | Imagine Lens | Free access | From 2025-10-22, free US users get a limited number of generations; the count varies by region and capacity | https://techcrunch.com/2025/10/22/snapchat-makes-its-first-open-prompt-ai-lens-available-for-free-in-the-us | [V] |
| Snapchat | Imagine Lens | Example prompts | "Turn me into an alien"; "grumpy cat" | https://techcrunch.com/2025/10/22/snapchat-makes-its-first-open-prompt-ai-lens-available-for-free-in-the-us | [V] |
| Snapchat | Imagine Lens | Limit-reached upgrade prompt copy | **UNKNOWN** | — | — |
| Snapchat | Snapchat+ | Paywall screen copy | **UNKNOWN** | — | — |

### 3.4 Download My Data

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Snapchat | Settings | Path | Profile, then the Settings icon (top right), then "My Data" | https://www.igeeksblog.com/how-to-download-snapchat-data/ ; https://redact.dev/blog/snapchat-data-download | [V-weak] |
| Snapchat | My Data | Options | Memories, HTML Files, JSON Files; then "Next" | https://www.igeeksblog.com/how-to-download-snapchat-data/ | [V-weak] |
| Snapchat | My Data | Date range | "All Time" | https://www.igeeksblog.com/how-to-download-snapchat-data/ | [V-weak] |
| Snapchat | My Data | Confirm | Confirm email, then "Submit"; an email arrives when the export is ready; target is within 7 days | https://www.igeeksblog.com/how-to-download-snapchat-data/ ; https://takeoutday.org/guides/how-to-export-snapchat-data | [V-weak] |
| Snapchat | My Data | Toggle label | "Export your Memories" (includes memories_history.json and the media files) | https://takeoutday.org/guides/how-to-export-snapchat-data | [V-weak] |

### 3.5 Family Center

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Snapchat | Family Center | Eligibility | Parents, guardians or trusted adults aged 25+ invite; only users aged 13–18 can join | https://www.engadget.com/snapchat-family-center-040146796.html | [V] |
| Snapchat | Family Center | Teen consent | The teen must opt in and accept the invite | https://www.engadget.com/snapchat-family-center-040146796.html | [V] |
| Snapchat | Family Center | What parents see | Full friend list, who the teen chatted with in the past 7 days, and a way to report accounts | https://www.engadget.com/snapchat-family-center-040146796.html | [V] |
| Snapchat | Family Center | Screen time | Weekly insights: average time and split across Chat, Camera, Snap Map, Stories, Spotlight | https://www.igeeksblog.com/how-to-set-up-snapchat-parental-controls/ | [V-weak] |
| Snapchat | Family Center | What parents can't see | No message content | https://www.engadget.com/snapchat-family-center-040146796.html | [V] |
| Snapchat | Family Center | Teen view | Teens see a "mirrored view" of what parents see | https://gizmodo.com.au/?p=1809070 | [V] |
| Snapchat | Family Center | Spelling | "Family Centre" in UK and AU locales | https://gizmodo.com.au/?p=1809070 | [V-weak] |

### 3.6 Flashbacks

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Snapchat | Memories | Flashbacks | The only results were spam-quality pages; nothing usable | — | **UNKNOWN** |

---

## 4. Lapse

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Lapse | Roll | Shots per roll | 36 photos per "roll" (early version) | https://www.tubefilter.com/2021/12/22/lapse-raises-11-million-seed-round/ | [V-weak] |
| Lapse | Develop | Mechanic | Photos "develop" at a surprise time; when a roll is done, the wait is 1 to 3 hours | https://www.tubefilter.com/2021/12/22/lapse-raises-11-million-seed-round/ ; https://techcrunch.com/?p=2605741 | [V-weak] |
| Lapse | Develop | Post-develop action | "right swipe" photos into a journal, or sort them into albums friends can see | https://www.tubefilter.com/2021/12/22/lapse-raises-11-million-seed-round/ | [V-weak] |
| Lapse | Onboarding gate | Forced invite | Users had to send a download link to **five contacts** and install a lock-screen widget before using the app | https://petapixel.com/2023/09/29/disposable-camera-app-lapse-tops-charts-by-making-users-invite-friends | [V] |
| Lapse | Store | Rating at peak | 4.8 stars from about 45k ratings; #1 in Top Free Photo & Video | https://petapixel.com/2023/09/29/disposable-camera-app-lapse-tops-charts-by-making-users-invite-friends | [V] |
| Lapse | All | Exact screen copy | **UNKNOWN** | — | — |

## 5. Dispo

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Dispo | Develop | Time | Photos develop "the next morning at 9 a.m." local time | https://www.cnbc.com/2021/03/04/dispo-for-iphone-is-the-picture-sharing-app-everyones-talking-about.html ; https://www.axios.com/2021/02/16/retro-photo-app-is-winning-buzz | [V] |
| Dispo | Camera | Look | The capture screen looks like the back of a disposable camera, down to the viewfinder | https://www.cnbc.com/2021/03/04/dispo-for-iphone-is-the-picture-sharing-app-everyones-talking-about.html | [V] |
| Dispo | Camera | Controls | The only control is flash on or off; no editing tools | https://www.cnbc.com/2021/03/04/dispo-for-iphone-is-the-picture-sharing-app-everyones-talking-about.html | [V] |
| Dispo | Rolls | Organization | Users create "film rolls" to hold photos and share them with friends | https://www.cnbc.com/2021/03/04/dispo-for-iphone-is-the-picture-sharing-app-everyones-talking-about.html | [V] |
| Dispo | Beta | Launch | Invite-only TestFlight beta hit the 10,000-user limit | https://www.axios.com/2021/02/16/retro-photo-app-is-winning-buzz | [V] |
| Dispo | Rolls | Roll names | **UNKNOWN** | — | — |

---

## Gaps (UNKNOWN after this pass)

1. **BeReal**: exact copy over blurred posts; the five standard RealMoji emoji and their labels; "Add a caption..." placeholder; "Late" label format; flash and flip icon positions; Memories calendar layout; daily challenge copy; RealGroups and RealChat screen labels; report reason list; settings labels; UI font and any hex values.
2. **Instagram Instants**: camera layout, text-overlay UI, button labels, the "viewed once / 24 hours" UI strings, Close Friends selector UI, standalone app screens, teen-control copy.
3. **Snapchat**: current camera layout (the [V-weak] rows are from an older guide); Streak Restore dialog copy; hourglass tooltip copy; Flashbacks and "On this day" copy; Memories storage upsell copy inside the app; Snapchat+, Lens+ and Platinum paywall copy; Imagine Lens limit message; Bitmoji sticker UI; hex colors and font.
4. **Lapse**: all screen copy (develop notification, invite-gate text, roll counter UI).
5. **Dispo**: roll names, develop notification copy.
6. **Haptics, sounds, motion**: no source found for any app.

Suggested next step: capture screenshots or screen recordings of each live app. Search snippets cannot supply verbatim UI copy reliably.

---

## BACKGROUND KNOWLEDGE [B] (unverified — do not treat as source of truth)

| App | Surface | Element | Value (from memory) | Confidence | Tag |
|---|---|---|---|---|---|
| BeReal | Push | Title | "⚠️ Time to BeReal. ⚠️" | medium | [B] |
| BeReal | Push | Body | "2 min left to capture a BeReal and see what your friends are up to!" (exact wording varies) | low | [B] |
| BeReal | RealMoji | Standard five | 👍 thumbs up, 😃 happy, 😲 surprised, 😍 heart eyes, 😂 laughing, plus ⚡ Instant | high | [B] |
| BeReal | Feed | Late label | Shown next to the post time, for example "3 hr late" or "Late" | medium | [B] |
| BeReal | Feed | Blur overlay copy | Something like "Post to view" / "Post your BeReal to see your friends'" | low | [B] |
| BeReal | Camera | Controls | Flash at bottom left, large white-ring shutter at bottom center, flip at bottom right; selfie inset with rounded corners at top left; timer at top | medium | [B] |
| BeReal | Post preview | Caption placeholder | "Add a caption..." | medium | [B] |
| BeReal | UI colors | Palette | Pure black background (#000000) with white text and icons (#FFFFFF), grey secondary text | high (black and white), low (hex) | [B] |
| BeReal | Wordmark | Form | "BeReal." with a trailing period, bold sans-serif | high (period), low (font name) | [B] |
| BeReal | Memories | Layout | Calendar month grid with a dual-photo thumbnail on each posted day | medium | [B] |
| Snapchat | Brand | Color | Snapchat yellow #FFFC00 | high | [B] |
| Snapchat | Brand | Font | App UI historically Avenir Next; brand typeface Graphik | medium (Avenir Next), low (Graphik) | [B] |
| Snapchat | Camera | Current layout | Bitmoji/profile and search at top left; vertical tool rail on the right (flip, flash, more); Memories icon left of the shutter; Lenses icon right of it; bottom nav Map, Chat, Camera, Stories, Spotlight | high | [B] |
| Snapchat | Streaks | Display | 🔥 with the day count next to a friend's name in Chat; ⌛ appended when the streak is about to end | high | [B] |
| Snapchat | Memories | Flashbacks | Memories surfaces "Flashbacks" from the same date in past years | medium | [B] |
| Snapchat | Data | Web page | accounts.snapchat.com has a "Download My Data" / "My Data" page | high | [B] |
| Instagram | Instants | Camera | Full-screen camera with a large shutter, flash and flip controls, and an audience chooser (Close Friends / mutuals) | low | [B] |
| Lapse | Develop | Copy | Push notification when a roll develops; app branded "Lapse" in black and white | low | [B] |
| Dispo | Rolls | Default | Photos go to a default personal roll; shared rolls are invite-based | low | [B] |

---

## Sources used (26 WebSearch calls)

help.bereal.com (articles 15416869159197, 7350386715165, 7536240858653, 17845941900445, 15272815079453, 10388190752669, 7531349180829, 10100086147229, 9775866279453); bereal.com/en/?p=521; bereal.com/en/?p=3922; petapixel.com (bereal-guide; 2022 recap; Lapse 2023-09-29); techcrunch.com (2023/08/21 friends of friends; ?p=2549530 RealChat; 2025/10/22 Imagine Lens); alternativeto.net; socialmediatoday.com; about.instagram.com/blog/announcements/introducing-instants-for-sharing-in-the-moment; inro.social; etvbharat.com; abc7ny.com; newsroom.snap.com (snap-memory-storage; infiniteretentionandgroupstreaks); storyboard18.com; businesstoday.in; medianama.com; netinfluencer.com; subscriptioninsider.com; engadget.com; gizmodo.com.au; igeeksblog.com; redact.dev; takeoutday.org; beebom.com; bgr.com; unilink.us; techlicious.com; tubefilter.com; cnbc.com; axios.com; esafety.gov.au; bustle.com; logokit.com; metricool.com; digitalparenthood.com; nationalworld.com; shotkit.com; snappa.com; distractify.com; trustedreviews.com; socialbu.com.
