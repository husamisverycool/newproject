# 15 — Spotify Wrapped 2025 + Partiful: exact strings, layout, flows

Research date: 2026-10-07. Method: WebSearch only (26 searches, the hard limit). curl/WebFetch were not used. Search results come back as engine summaries of the pages, not the raw page text. A string in quotes is verbatim only as far as the summary quoted it. Check every [V] string against a live screen before you ship.

**Tag legend**
- **[V]**: verified from a first-party source (newsroom.spotify.com, help.partiful.com) in the search results.
- **[V-weak]**: from third-party press or tutorials, or a first-party page whose summary paraphrased the wording. Treat the wording as approximate.
- **[B]**: background knowledge that I could not verify. Listed only in the separate section at the end.

Already-known facts from the brief are not repeated here unless a source added to them or contradicted them.

---

## 1. Spotify Wrapped 2025 — verified rows

### 1a. Entry, eligibility, navigation

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Spotify | Entry point | Where Wrapped lives | "look for the Wrapped feed at the top of your Home screen or searching "2025 Wrapped"" | https://newsroom.spotify.com/2025-12-03/2025-wrapped-user-experience/ | [V] |
| Spotify | Eligibility | Threshold | Streamed at least 30 songs for more than 30 seconds each, and at least five different artists | https://newsroom.spotify.com/2025-12-03/2025-wrapped-user-experience/ | [V] |
| Spotify | Platform | Availability | Free and Premium; mobile app (iOS and Android) | https://newsroom.spotify.com/2025-12-03/2025-wrapped-user-experience/ | [V] |
| Spotify | Story player | New controls | "new controls, allowing users to adjust playback speed and revisit specific story moments without restarting" | https://newsroom.spotify.com/2025-12-03/2025-wrapped-user-experience/ | [V] |
| Spotify | Story player | Control name (press) | "Speed & Replay Controls" — "slow the pace, swipe back to stories you want to revisit, and skip ahead" | https://www.igeeksblog.com/how-to-find-spotify-wrapped-on-iphone-ipad-mac/ | [V-weak] |
| Spotify | Story player | Speed values (e.g. 0.5x/1x) | NOT FOUND (no source lists the speed values) | https://www.techradar.com/audio/spotify/spotify-wrapped-2025-has-landed-heres-how-to-find-it-plus-the-best-new-features-this-year | — |
| Spotify | Story player | Scroll direction | "smooth, vertical story layout, so you'll scroll up and down to reveal cards" (one press source; this conflicts with tap-through stories, so confirm on a device) | https://www.billboard.com/music/music-news/spotify-wrapped-2025-how-find-listening-summary-1236127215/ (or howtogeek; attribution unclear) | [V-weak] |
| Spotify | Wrapped Party entry | Location | Wrapped Party "can be found at the end of your personalized experience"; host taps "the Wrapped Party tile" | https://www.billboard.com/music/music-news/spotify-wrapped-2025-how-find-listening-summary-1236127215/ ; https://www.digitaltrends.com/phones/you-can-now-turn-spotify-wrapped-into-a-multiplayer-party-with-your-friends/ | [V-weak] |

### 1b. Story cards (content list; the order is approximate)

The order below is how one press source listed the stories. It is a content list, not a confirmed card sequence.

| # | App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|---|
| 1 | Spotify | Story | Minutes Listened | "Minutes Listened" — total listening time across music, podcasts, and audiobooks | https://www.igeeksblog.com/how-to-find-spotify-wrapped-on-iphone-ipad-mac/ | [V-weak] |
| 2 | Spotify | Story | Top Songs | "Top Songs" — top five songs plus a full "Top 100 Songs" playlist | same | [V-weak] |
| 3 | Spotify | Story | Top Artists | "Top Artists" — five most-streamed artists | same | [V-weak] |
| 4 | Spotify | Story | Top Genres | "Top Genres" — ranked list | same | [V-weak] |
| 5 | Spotify | Story | Artist clip | "your artist clip" (video message from an artist) | same | [V-weak] |
| 6 | Spotify | Story | Top Podcasts | "top podcasts" | same | [V-weak] |
| 7 | Spotify | Story | Listening Age | see 1c | same | [V-weak] |
| 8 | Spotify | Story | Top Song Quiz | "an interactive quiz where you guess which track soundtracked your year", shown before the top song is revealed | https://betanews.com/2025/12/03/spotify-wrapped-2025-is-here-and-this-time-its-interactive-and-competitive/ | [V-weak] |
| 9 | Spotify | Story | Top Albums | "Top Albums" — first year Spotify spotlights albums | https://www.axios.com/2025/12/03/spotify-wrapped-2025-new-features | [V-weak] |
| 10 | Spotify | Story | Top audiobook genre | "top audiobook genre" | https://www.igeeksblog.com/how-to-find-spotify-wrapped-on-iphone-ipad-mac/ | [V-weak] |
| 11 | Spotify | Story | Author / Podcaster clips | "your author clip", "your podcaster clip" | same | [V-weak] |
| 12 | Spotify | Story | Top Artist Sprint | "Top Artist Sprint": top five artists racing month by month for the number-one spot | https://betanews.com/2025/12/03/spotify-wrapped-2025-is-here-and-this-time-its-interactive-and-competitive/ ; https://newsroom.spotify.com/tag/top-artist-sprint/ | [V-weak] |
| 13 | Spotify | Story | Fan Leaderboard | "Fan Leaderboard": where you rank among your top artist's listeners worldwide by total minutes; tiers top 0.01%, 1%, 5% | https://newsroom.spotify.com/tag/fan-leaderboard/ ; igeeksblog | [V-weak] |
| 14 | Spotify | Story | Clubs | see 1d | newsroom | [V] |
| 15 | Spotify | Story | Listening Archive | AI-generated "snapshots of your most memorable streaming days", "up to five unique reports" | https://www.axios.com/2025/12/03/spotify-wrapped-2025-new-features ; https://newsroom.spotify.com/tag/listening-archive/ | [V-weak] |
| — | Spotify | Story | Per-track "first listen" | Shows when you first listened to each track (wording not found) | igeeksblog | [V-weak] |

### 1c. Listening Age card

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Spotify | Listening Age | Pre-reveal disclaimer | "Age is just a number. So don't take this personally" | https://www.forbes.com/sites/danidiplacido/2025/12/03/age-is-just-a-number-2025-spotify-wrapped-includes-listening-age/ ; https://www.today.com/popculture/music/spotify-wrapped-listening-age-rcna247306 | [V-weak] |
| Spotify | Listening Age | Header | "Your listening age" then the number (the brief's "Your listening age is 26" phrasing was not confirmed) | https://www.today.com/popculture/music/spotify-wrapped-listening-age-rcna247306 | [V-weak] |
| Spotify | Listening Age | Example explanation line (it varies by era) | "Since you were into music from the Late 70s. You're an old soul" | https://www.today.com/popculture/music/spotify-wrapped-listening-age-rcna247306 / https://www.npr.org/2025/12/04/nx-s1-5632595/spotify-wrapped-listening-age | [V-weak] |
| Spotify | Listening Age | Logic | Based on release years of your most-played tracks compared with others in your age group | https://www.axios.com/2025/12/03/spotify-wrapped-2025-new-features | [V-weak] |

### 1d. Clubs: roles (verbatim from newsroom)

Roles are assigned "based on your standout on-platform behavior and listening compared to the rest of your Club." Club names are already known (Soft Hearts Club, Club Serotonin, Full Charge Crew, Cosmic Stereo Club, Cloud State Society, Grit Collective).

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Spotify | Clubs | Role: Leader | "Your listening is strongly aligned with club values, making you a perfect role model." | https://newsroom.spotify.com/2025-12-03/wrapped-clubs-overview/ | [V] |
| Spotify | Clubs | Role: Scout | "You listen to the freshest releases, always pushing your club forward." | same | [V] |
| Spotify | Clubs | Role: Archivist | "Your listening delves into past eras, ensuring club history never fades." | same | [V] |
| Spotify | Clubs | Role: Curator | "You're a focused playlist creator, combining the best of your club into mixes." | same | [V] |
| Spotify | Clubs | Role: Collector | "You often save music to your library, building a large club collection." | same | [V] |
| Spotify | Clubs | Role: Recruiter | "You share music far and wide, bringing in frequent new club members." | same | [V] |
| Spotify | Clubs | Role: Loyalist | "You rarely skip tracks, confirming your unwavering dedication to the club." | same | [V] |
| Spotify | Clubs | Role: Supporter | "Your listening favors one artist, ensuring they're heard around your club." | same | [V] |
| Spotify | Clubs | Role: Broadcaster | "You listen to podcasts more than others, keeping club conversation alive." | same | [V] |
| Spotify | Clubs | Role: Specialist | "You explore experimental sounds, refining your club's sonic boundaries." | same | [V] |
| Spotify | Clubs | Role count | 10 roles in total; one role per user, inside one of the 6 clubs | same | [V] |

### 1e. Wrapped Party flow

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Spotify | Party | Host step 1 | "Create the party" (set up the party; you become the host) | https://newsroom.spotify.com/2025-12-03/wrapped-party-how-to/ | [V-weak] (step names come from the summary) |
| Spotify | Party | Host step 2 | "Make it your own": update profile image and name, rename your party | same | [V-weak] |
| Spotify | Party | Host step 3 | "Invite your friends": share "a unique party link or code"; press also mentions a QR code | same; https://www.digitaltrends.com/phones/you-can-now-turn-spotify-wrapped-into-a-multiplayer-party-with-your-friends/ | [V-weak] |
| Spotify | Party | Host step 4 | "Start the party": host decides when it begins and keeps it moving | same | [V-weak] |
| Spotify | Party | Host extras | Emoji reactions to reveals; host can "hand off hosting duties" | same | [V-weak] |
| Spotify | Party | Guest join | Tap the link, then button "Join Party", then confirm name and photo, then a "waiting room"; guests are let in automatically when the host starts | https://www.digitaltrends.com/phones/you-can-now-turn-spotify-wrapped-into-a-multiplayer-party-with-your-friends/ ; https://thetab.com/2025/12/03/heres-how-to-use-the-new-spotify-wrapped-party-feature-and-compare-music-with-your-friends | [V-weak] |
| Spotify | Party | Size | Press says "up to 9 people in a room". The brief says up to 10. These likely match as host + 9 friends; not confirmed | https://9to5mac.com/2025/12/03/spotify-wrapped-arrives-after-apple-music-replay-with-a-new-party-feature/ | [V-weak] (CONFLICT) |
| Spotify | Party | Eligibility | Age 13+ in a Wrapped-eligible market; mobile only | https://www.scotsman.com/arts-and-culture/what-is-spotify-wrapped-party-5428395 | [V-weak] |
| Spotify | Party | Core awards | "Most Minutes", "Rarest Listen", "Most Obsessed" (with top artist), most new artists discovered, most / least musically compatible | https://techcrunch.com/2025/12/03/spotifys-2025-wrapped-becomes-a-multiplayer-experience ; https://www.vice.com/en/article/spotify-wrapped-party/ | [V-weak] |
| Spotify | Party | Named awards (press) | "The Crate Digger Award", "The Eternal Optimist Award", "The Onion Chopper Award", "The Team Spirit Award", "The Hopeless Romantic Award", "The Chronic Yearner Award" | https://www.campaignlive.com/article/audiobooks-clubs-fan-destinations-spotify-wrapped-2025/1941843 / https://www.edmtunes.com/2025/12/spotify-wrapped-2025-wrapped-party/ | [V-weak] |
| Spotify | Party | Other data-story labels (press) | "early bird", "picky listener", "dinner table explainer" (most news podcasts) | same | [V-weak] |
| Spotify | Party | Award mix rule | Mix of awards "changes based on the group's size and composition", so "no two parties are ever the same" | same | [V-weak] |
| Spotify | Party | Web build | A "Spotify Wrapped Party" site is listed on CSS Design Awards (a possible source for motion reference) | https://www.cssdesignawards.com/sites/spotify-wrapped-party/49511/ | [V-weak] |

### 1f. Wrapped 2025 visual design

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Spotify | Design concept | Idea | Builds "on the tradition of mixtapes and burned CDs", a bold, dynamic "visual mixtape" | https://newsroom.spotify.com/2025-12-03/wrapped-marketing-campaign/ | [V] |
| Spotify | Design concept | Creative direction quote (Jeremy Wirth) | "2025 Wrapped captures that tension between chaos and clarity"; "stripped down with the reduced color palette and bold use of images to feel simple and super modern" | same | [V] |
| Spotify | Design | Texture | "layered with texture", mixing "analog and digital aesthetics"; "every gradient and texture" | same | [V] |
| Spotify | Design | Trends (third party) | "analog design, holographics, and dirty textures" | https://elements.envato.com/learn/spotify-wrapped-design-aesthetic | [V-weak] |
| Spotify | Typography | Typeface | "Spotify Mix", a bespoke typeface made with Dinamo Typefaces (Berlin), announced 22 May 2024 | https://newsroom.spotify.com/2024-05-22/introducing-spotify-mix-our-new-and-exclusive-font/ | [V] |
| Spotify | Typography | Use in Wrapped (Rasmus Wängelin quote) | "using our typeface as our main graphic element … looping and transforming it in unexpected ways across the canvas". This quote is probably from the 2024 Wrapped launch, so it may not describe 2025 | https://www.creativebloq.com/news/spotify-wrapped-font ; newsroom | [V-weak] |
| Spotify | Colors | Hex values | NOT FOUND (no source gives the hexes). The known palette is black / white / green / red | — | — |
| Spotify | Motion | Card transitions / progress bar | NOT FOUND | — | — |

---

## 2. Partiful — verified rows

### 2a. Event creation flow (in order)

| # | App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|---|
| 1 | Partiful | Home | Create entry point | Plus icon or "Create" button on the homepage | https://help.partiful.com/hc/en-us/articles/26559398129435-Creating-your-first-Partiful-event | [V] |
| 2 | Partiful | Create | Title + font | "name your event and change the font if you'd like!" | same | [V] |
| 3 | Partiful | Create | Poster | Edit button in the bottom-right corner of the poster opens the poster picker. You can search by event type (birthday, housewarming, picnic, happy hour, etc.) or by vibe (chill, summer, outdoors, etc.), or upload your own photo or a gif | same; https://help.partiful.com/en-us/articles/15525299-creating-your-first-partiful-event | [V] |
| 4 | Partiful | Create | Core fields | Event name, date, location, description | same | [V] |
| 5 | Partiful | Create | Date: poll | "Poll your guests" link underneath "Set a Date". Host writes in dates or times, then saves the options | https://help.partiful.com/en-us/articles/15525423-using-find-a-time-to-poll-guests-on-date-and-time | [V] |
| 6 | Partiful | Create | Sidebars | "Theme" (background) and "Effect" (animations) sidebars | Creating-your-first-Partiful-event | [V] |
| 7 | Partiful | Create | Settings | "Settings" sits below Theme + Effect: add a cohost, payment info, RSVP limit, guest questions, hide Activity Feed timestamps | same | [V] |
| 8 | Partiful | Create | Save | "Save Draft" (required before inviting; you can edit later) | same | [V] |
| 9 | Partiful | Invite | Invite screen | "Invite" screen lists your mutuals ("people you've partied with before"). Tap a name and they get a text or notification | same | [V] |
| — | Partiful | Create | Default title placeholder | NOT FOUND (the brief's "Untitled Event" was not confirmed) | — | — |
| — | Partiful | Third-party flow capture | Create-event flow is 18 screens on Lazyweb (sign-up wall) | https://www.lazyweb.com/canvas/flows/partiful/create-event | [V-weak] |

### 2b. Event Settings (tabs and toggles)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Partiful | Settings > "RSVPs" | Toggles | Guest Approval on/off; RSVPs on/off; number of +1s (default one +1 per guest); "RSVP Button Style"; let guests invite their mutuals | https://help.partiful.com/hc/en-us/articles/28895223149979-What-features-are-available-to-change-in-my-Event-Settings | [V] |
| Partiful | Settings > RSVPs | "Accept RSVPs" | Option to turn off "Maybe". With it off, guests only see "Going" / "Can't Go" | https://help.partiful.com/hc/en-us/articles/29937502247195-How-do-I-turn-off-the-option-to-RSVP-Maybe-on-my-event | [V] |
| Partiful | Settings > RSVPs | "RSVP Button Style" options | "Emojis", "Icons", and some seasonal options | https://help.partiful.com/hc/en-us/articles/28890168265115-Can-I-change-the-RSVP-buttons-I-don-t-like-the-emojis | [V] |
| Partiful | Settings > "Questionnaire" | Guest Questionnaire | "Guest Questionnaire": questions asked at RSVP (for example dietary restrictions, phone, email); "only the host can see these responses" | https://help.partiful.com/hc/en-us/articles/24467301043355-Can-I-poll-or-survey-my-guests | [V] |
| Partiful | Settings > "Display + Privacy" | Toggles | "Show Guest List", "Show Guest Count" (aka "# Going"), anonymize guest list, hide Activity Feed timestamps, "Crush" settings, password-protect event, allow guest photo uploads | https://help.partiful.com/hc/en-us/articles/26503238663195-Can-I-hide-the-guest-list-or-guest-count-on-the-party-page ; Event-Settings article | [V] |
| Partiful | Settings > "Hosts" | Cohosts | "add or remove any cohosts" (the help center spells it "cohost" with no hyphen) | Event-Settings article | [V] |
| Partiful | Settings | Capacity + waitlist | Set a max capacity and "enable an automatic waitlist" | https://help.partiful.com/hc/en-us/articles/26503173407899-How-can-I-limit-group-size | [V] |
| Partiful | Waitlist | Logic copy | "If a spot opens up, we'll automatically add the next waitlisted guest and notify them via text"; waitlist is "first in, first out" by time of first RSVP | https://help.partiful.com/en-us/articles/15525364-how-does-the-waitlist-move-my-guests-off-of-the-list | [V] |
| Partiful | Waitlist | Button label ("Join Waitlist"?) | NOT FOUND | https://help.partiful.com/en-us/articles/15525409-what-happens-if-the-waitlist-is-turned-off | — |
| Partiful | Settings > "Auto-Reminders" | Path | Event page, then "Edit", then "Settings", then "Auto-Reminders" (on/off only; you cannot change the schedule) | https://help.partiful.com/hc/en-us/articles/33909907496091-Can-I-customize-the-auto-reminders-schedule | [V] |

### 2c. RSVP

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Partiful | RSVP | Labels | "Going", "Maybe", "Can't Go" | https://help.partiful.com/hc/en-us/articles/29937502247195-How-do-I-turn-off-the-option-to-RSVP-Maybe-on-my-event | [V] |
| Partiful | RSVP | Older / press labels | "I'm going" / "Can't go" (Wikipedia/party.pro; probably an older version, so prefer the [V] labels) | https://en.wikipedia.org/wiki/Partiful ; https://party.pro/partiful/ | [V-weak] (CONFLICT) |
| Partiful | RSVP | Guest flow | Open link, enter phone number, see details, RSVP; no app download needed | https://party.pro/partiful/ | [V-weak] |
| Partiful | RSVP | Default emojis on buttons | Emojis are the default style (help article title: "I don't like the emojis!"). The emoji glyphs themselves were NOT FOUND | help article above | [V] (existence only) |

### 2d. Find a Time (date poll)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Partiful | Find a Time | Entry | "Poll your guests" underneath "Set a Date" | https://help.partiful.com/en-us/articles/15525423-using-find-a-time-to-poll-guests-on-date-and-time | [V] |
| Partiful | Find a Time | Guest vote options | "Yes", "No", "Maybe" | same | [V] |
| Partiful | Find a Time | Visibility | Guests can see which options other guests selected | https://help.partiful.com/hc/en-us/articles/33013032161563-Will-my-guests-be-able-to-see-what-other-guests-have-responded-in-a-Find-a-Time-poll | [V] |
| Partiful | Find a Time | Host resolve | Needs at least one response ("it can be you!"). Click the date options on the event page, then "Pick this" | same as entry | [V] |
| Partiful | Find a Time | After pick | "your guests will be notified. All of their responses will be automatically converted into RSVPs!" | same | [V] |

### 2e. Text Blast and reminders

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Partiful | Text Blast | Entry / button | "Text Blast", then "New Message" | https://help.partiful.com/hc/en-us/articles/24470111920667-Can-I-send-my-own-reminders | [V] |
| Partiful | Text Blast | Recipient categories | "Going", "Maybe", "Can't Go", "Invited" | https://help.partiful.com/hc/en-us/articles/31192516622107-What-s-the-maximum-number-of-text-blasts-I-can-send | [V] |
| Partiful | Text Blast | Limit | Up to 10 separate text blasts per event | same | [V] |
| Partiful | Text Blast | Invited cap | You cannot blast "Invited" when there are more than 100 Invited guests | https://help.partiful.com/hc/en-us/articles/27346133085723-I-can-t-send-a-text-blast-to-my-Invited-guests | [V] |
| Partiful | Auto-reminders | "Going" guests | Reminder 2 hours before the event | https://help.partiful.com/hc/en-us/articles/24470120681115-What-event-reminders-do-you-send | [V] |
| Partiful | Auto-reminders | "Maybe" / no RSVP | Reminder to finalize RSVP 1 week before | same | [V] |
| Partiful | Auto-reminders | Channel | Only to Invited users already signed up. Email invitees get email before they RSVP, then SMS or push after | https://help.partiful.com/hc/en-us/articles/34834944631707-Do-guests-invited-via-email-receive-event-reminders-and-Text-Blasts | [V] |
| Partiful | Auto-reminders | Message copy | NOT FOUND | — | — |

### 2f. Event page: Activity Feed, photos, comments, effects

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Partiful | Event page | Activity Feed | Section named "Activity Feed"; comments post there and tagged users are notified | https://help.partiful.com/en-us/articles/15525482-how-can-i-tag-someone-in-a-comment-on-an-event-page | [V] |
| Partiful | Event page | Mentions | Type "@" and the name pops up | same | [V] |
| Partiful | Event page | Photo Album | "Upload Photos" button "at the top of the Activity Feed"; anyone on the event can view and download | https://help.partiful.com/en-us/articles/15525446-how-do-i-upload-photos-to-my-event-page | [V] |
| Partiful | Event page | Guest count label | "# Going" | https://help.partiful.com/hc/en-us/articles/26503238663195-Can-I-hide-the-guest-list-or-guest-count-on-the-party-page | [V] |
| Partiful | Event page | Edit toolbar | "Edit", then "Effect" on the toolbar: pick a different Effect, upload a custom one, or remove it. Events ship with a default Effect | https://help.partiful.com/en-us/articles/15525357-how-do-i-turn-off-the-default-effect-on-my-event-page | [V] |
| Partiful | Effects | Example names (press) | bubbles, fireworks, confetti | https://www.pocket-lint.com/partiful-app/ | [V-weak] |
| Partiful | Event page | Full top-to-bottom layout, "Hosted by" line, comment placeholder | NOT FOUND | — | — |

### 2g. Partiful brand (marketing site, from a third-party style capture)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Partiful | Brand (partiful.com) | Display font | "Partiful Display Medium" (custom). Weights 400/500; sizes 26/40/42/48px, up to 112px for heroes; letter-spacing -0.02em to -0.03em; line height 1.00–1.20 | https://styles.refero.design/style/6db1057d-3457-4173-9184-df160415f060 | [V-weak] |
| Partiful | Brand (partiful.com) | UI font | "TWK Lausanne Pan" (all weights) | same | [V-weak] |
| Partiful | Brand (partiful.com) | Primary action color | Black: filled black buttons, black borders, black headings, no blue accent | same | [V-weak] |
| Partiful | Brand (partiful.com) | Gradients | Photo heroes "washed in purple-to-pink gradients"; feature sections use a "soft periwinkle-to-white gradient" | same | [V-weak] |
| Partiful | Brand | Hex values | NOT FOUND (the refero page has them, but they were not in the search results) | same | — |

---

## Gaps (UNKNOWN after 26 searches)

**Spotify Wrapped 2025**
- Opening/intro card copy.
- Exact headline wording on the "Your top songs", top artist and minutes cards.
- Top Song Quiz question/answer wording and UI (how many choices, the reveal copy).
- Listening Archive card titles and wording.
- Clubs card headline wording (for example "Welcome to …"). The role descriptions are verified.
- Final summary card: which stats it shows and its layout. Share button labels ("Share this story", "Share").
- Wrapped Hub naming and layout.
- Speed-control labels and values.
- Progress bar style.
- Hex colors. Motion and transition specs.
- Party: join-code format, award reveal animation, host/guest badge labels, and the complete official award list.
- Party size conflict: 9 vs 10 people.

**Partiful**
- Full event-page order from top to bottom.
- "Hosted by" wording and co-host label on the page.
- Guest list section headers and count format.
- Comment composer placeholder.
- "Join Waitlist" label and waitlist status copy.
- Title placeholder ("Untitled Event"?).
- Complete themes and effects name lists. Title font option names.
- RSVP confirmation copy and animation.
- Reminder SMS copy.
- Default RSVP emoji glyphs.
- Text Blast composer field labels.
- In-app (not marketing-site) colors and hexes.
- Questionnaire question types.

---

## BACKGROUND KNOWLEDGE [B] (not verified, do not merge into the tables above)

| App | Surface | Element | Believed value | Confidence | Tag |
|---|---|---|---|---|---|
| Spotify | Brand | Spotify green hex | #1ED760 (current brand green); #1DB954 (older green) | high | [B] |
| Spotify | Brand | Previous brand typeface | Spotify Circular (used before Spotify Mix) | high | [B] |
| Spotify | Story player | Progress indicator | Segmented bars across the top, one segment per story, filling left to right (Instagram-stories style) in recent Wrapped years | medium | [B] |
| Spotify | Story player | Share button | A "Share this story" pill at the bottom of shareable cards, opening a share sheet (Instagram Stories, etc.) in recent years | medium | [B] |
| Spotify | Summary card | Content | Recent years' final summary card shows Top Artists (5), Top Songs (5), Minutes Listened and Top Genre, with album or artist art; 2025's exact set is unverified | medium | [B] |
| Spotify | Story player | Navigation | Tap the right side to advance, tap the left to go back, hold to pause | medium | [B] |
| Spotify | Party | Size wording | Probably "you and up to 9 friends" (= 10 people) | medium | [B] |
| Partiful | RSVP | Default emoji buttons | 👍 Going · 🤔 Maybe · 😢 Can't Go | medium | [B] |
| Partiful | Event page | Host line | "Hosted by [name] & [name]" under the title | medium | [B] |
| Partiful | Event page | Rough order | Poster/cover, title, date/time, host line, location, RSVP buttons, description, guest list (Going/Maybe counts), Activity Feed (comments, blasts, photos) | medium | [B] |
| Partiful | Waitlist | Button | "Join Waitlist" when the event is at capacity | medium | [B] |
| Partiful | Create | Title placeholder | "Untitled Event" | low | [B] |
| Partiful | Text Blast | Composer | Recipient chips by RSVP status, a message box and a "Send" button | low | [B] |
| Partiful | Brand | In-app look | Dark, theme-driven backgrounds behind the event page, with a translucent card UI over animated themes | low | [B] |

---

## Sources consulted (all via WebSearch)
- https://newsroom.spotify.com/2025-12-03/wrapped-clubs-overview/
- https://newsroom.spotify.com/2025-12-03/2025-wrapped-user-experience/
- https://newsroom.spotify.com/2025-12-03/wrapped-party-how-to/
- https://newsroom.spotify.com/2025-12-03/wrapped-marketing-campaign/
- https://newsroom.spotify.com/2024-05-22/introducing-spotify-mix-our-new-and-exclusive-font/
- https://www.axios.com/2025/12/03/spotify-wrapped-2025-new-features
- https://techcrunch.com/2025/12/03/spotifys-2025-wrapped-becomes-a-multiplayer-experience
- https://www.digitaltrends.com/phones/you-can-now-turn-spotify-wrapped-into-a-multiplayer-party-with-your-friends/
- https://9to5mac.com/2025/12/03/spotify-wrapped-arrives-after-apple-music-replay-with-a-new-party-feature/
- https://www.campaignlive.com/article/audiobooks-clubs-fan-destinations-spotify-wrapped-2025/1941843
- https://www.today.com/popculture/music/spotify-wrapped-listening-age-rcna247306
- https://www.forbes.com/sites/danidiplacido/2025/12/03/age-is-just-a-number-2025-spotify-wrapped-includes-listening-age/
- https://www.igeeksblog.com/how-to-find-spotify-wrapped-on-iphone-ipad-mac/
- https://betanews.com/2025/12/03/spotify-wrapped-2025-is-here-and-this-time-its-interactive-and-competitive/
- https://elements.envato.com/learn/spotify-wrapped-design-aesthetic
- https://help.partiful.com/hc/en-us/articles/26559398129435-Creating-your-first-Partiful-event
- https://help.partiful.com/hc/en-us/articles/28895223149979-What-features-are-available-to-change-in-my-Event-Settings
- https://help.partiful.com/hc/en-us/articles/28890168265115-Can-I-change-the-RSVP-buttons-I-don-t-like-the-emojis
- https://help.partiful.com/hc/en-us/articles/29937502247195-How-do-I-turn-off-the-option-to-RSVP-Maybe-on-my-event
- https://help.partiful.com/en-us/articles/15525423-using-find-a-time-to-poll-guests-on-date-and-time
- https://help.partiful.com/hc/en-us/articles/31192516622107-What-s-the-maximum-number-of-text-blasts-I-can-send
- https://help.partiful.com/hc/en-us/articles/24470120681115-What-event-reminders-do-you-send
- https://help.partiful.com/en-us/articles/15525364-how-does-the-waitlist-move-my-guests-off-of-the-list
- https://help.partiful.com/en-us/articles/15525446-how-do-i-upload-photos-to-my-event-page
- https://help.partiful.com/en-us/articles/15525482-how-can-i-tag-someone-in-a-comment-on-an-event-page
- https://help.partiful.com/en-us/articles/15525357-how-do-i-turn-off-the-default-effect-on-my-event-page
- https://styles.refero.design/style/6db1057d-3457-4173-9184-df160415f060
- https://www.pocket-lint.com/partiful-app/
