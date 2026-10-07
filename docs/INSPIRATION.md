# Inspiration Ledger

This file records every visual and interaction decision in **roll.** and the source app it came from. The brief was to rely *purely on inspiration*: no house style and no personal taste. When a source's exact value was unknown, the decision follows a rule written down here instead of being invented.

The research dossiers behind this ledger are in [`/research`](../research).

## Confidence tags

| Tag | Meaning |
|---|---|
| **[V]** | Found in this project's research pass. The dossier and section are cited (e.g. `03 §1.6`). Research ran only through web-search summaries, since app stores, press sites and company sites were network-blocked, so "verified" means a cited search result says it. |
| **[B]** | Background knowledge of the *source app* (how it looks or behaves). It was not re-verified in this pass because the shared search budget ran out. It describes the source, not a preference. It is listed again under **Verify before build** at the end. |
| **[S]** | Required by the product spec itself (the brief's section letter is given). |
| **[I]** | Inferred from a source by an explicit step, which is written out. |
| **[P]** | Platform convention (Apple HIG). The value is cited where research found it. |

## The four sourcing rules

1. **Each surface borrows the visual language of the app its mechanic came from.** The camera looks like Locket and BeReal, the journal like Retro, packs and binders like TCG Pocket, Wrapped like Spotify Wrapped, plans like Partiful, games like Duolingo and the party games, and AI objects like Google Photos, Gemini and Sora. The spec already names a source app for every mechanic, and this rule extends that to its pixels.
2. **The shell follows the direct competitors.** The parts every screen shares (canvas, corner controls, sheets, type) follow Locket and BeReal, the two category leaders with the most sourced visual facts.
3. **Every hex value appears in the research.** The palette is built only from:
   - official brand colors in the `simple-icons` dataset (each with a source URL in that dataset);
   - the Duolingo palette in dossier 04 §2.1;
   - Apple's system colors **[B][P]**.

   No hex value was invented. If a source's color is known only in words ("yellow icon"), the nearest documented hex *with the same role* stands in for it, and the substitution is written down.
4. **Every typeface is one a source uses, or the openly licensed release of a family a source uses.** Proprietary faces (SF Pro, Spotify Mix, Feather, TWK Lausanne, Gill Sans) are used through the OS where the OS ships them, and are never bundled.

---

## 1. Identity

| Decision | Source | Evidence |
|---|---|---|
| Name **roll.** is lowercase | Yope | Both store titles render "yope" in lowercase. [V] 02 §A1 |
| Name ends in a period | BeReal | The wordmark is stylized "BeReal." with a trailing period, sometimes called a "square dot". [V] 03 §1.1 |
| What the name means | Lapse and Dispo | A week's *roll* of photos *develops* on ritual day. The disposable-camera "develop" mechanic. [S] §D |
| Icon: black rounded square, white wordmark centered | BeReal | "Black square with rounded corners, with the name and its ending period centered." [V] 03 §1.1 |
| Icon accent: the period is yellow | Locket | The Locket icon is yellow. [V] 01 §1.1. Hex from rule 3 (see `--yellow`). |
| Wordmark typeface: Inter, weight 900 | BeReal | The only typeface any source attaches to BeReal's app UI is Inter. [V] 03 §1.2, single source, disputed. The logo face (Texta Heavy / Genera Grotesk) is commercial, so it is not used. |

## 2. Color tokens (`apps/web/src/styles/tokens.css`)

| Token | Hex | Role | Source |
|---|---|---|---|
| `--black` | `#000000` | Canvas | BeReal brand color in simple-icons. Black background is [V][multi] 03 §1.3. |
| `--white` | `#FFFFFF` | Text and primary glyphs | BeReal's white text on black. [V] 03 §1.3 |
| `--g1` | `#1C1C1E` | Raised surface (sheets, pills) | Apple `secondarySystemBackground` dark. [B][P] Locket and BeReal are native iOS apps. |
| `--g2` | `#2C2C2E` | Controls on black | Apple `tertiarySystemBackground` dark. [B][P] |
| `--g3` | `#3A3A3C` | Pressed, hairline-strong | Apple `systemGray4` dark. [B][P] |
| `--swan` | `#E5E5E5` | Hairlines on light surfaces | Duolingo Swan. [V] 04 §2.1 |
| `--hare` | `#AFAFAF` | Secondary text on black | Duolingo Hare. [V] 04 §2.1 |
| `--wolf` | `#777777` | Tertiary text | Duolingo Wolf. [V] 04 §2.1 |
| `--eel` | `#4B4B4B` | Body text on light surfaces ("used instead of pure black") | Duolingo Eel. [V][multi] 04 §2.1 |
| `--yellow` | `#FFC800` | Recording outline, streaks, rewards, Plus | Locket's yellow appears on the icon [V] 01 §1.1 and as the **yellow viewfinder outline while recording** [V] 01 §1.4, but no Locket hex is known. The stand-in is Duolingo **Bee**, whose documented role is "warning, highlight, streak/reward". [V] 04 §2.1 |
| `--orange` | `#FF9600` | Streak flame, film date-stamp | Duolingo Fox, "secondary rewards". [V] 04 §2.1 |
| `--red` | `#FF4B4B` | Destructive, the record dot, Wrapped red | Duolingo Cardinal. [V] 04 §2.1. Wrapped 2025's palette is black/white/green/red. [V][multi] 04 §1.2 |
| `--green` | `#58CC02` | Game "correct" and primary game CTA | Duolingo Feather Green. [V][multi] 04 §2.1 |
| `--green-light` | `#89E219` | Mascot surface | Duolingo Mask Green, "the surface Duo can sit on". [V] 04 §2.1 |
| `--blue` | `#1CB0F6` | Links, selected | Duolingo Macaw, "links, selected/active states". [V] 04 §2.1 |
| `--purple` | `#CE82FF` | Holo rarity, plan gradient start | Duolingo Beetle. [V] 04 §2.1 |
| `--navy` | `#2B70C9` | Deep accent | Duolingo Humpback. [V] 04 §2.1 |
| `--spotify` | `#1ED760` | Wrapped green | Spotify brand color in simple-icons. Green is part of Wrapped 2025's palette. [V] 04 §1.2 |
| `--pink` | `#FF0069` | Plan gradient end | Instagram brand color in simple-icons. Partiful's site uses "purple-to-pink gradients". [V] 04 §3.2 |
| `--periwinkle` | `#AECBFA` | Plan section backgrounds | Partiful uses "soft periwinkle-to-white gradient backgrounds". [V] 04 §3.2. The hex is Google's light-blue icon color in simple-icons. |
| `--gemini` | `#8E75B2` | AI-object accent | Google Gemini brand color in simple-icons. |
| `--imessage` | `#34DA50` | iMessage export | iMessage color in simple-icons. |
| `--whatsapp` | `#25D366` | WhatsApp export | WhatsApp color in simple-icons. |

## 3. Type

| Use | Face | Source |
|---|---|---|
| UI text everywhere | `-apple-system` (SF Pro on iPhone), then **Inter** bundled | The core sources are native iOS apps, so system text is SF Pro. [B][P] The fallback is Inter, the one face tied to BeReal's app UI. [V] 03 §1.2 |
| Game surfaces (polls, quests, telephone) | `ui-rounded` (SF Pro Rounded), then **Google Sans Flex with ROND=100** | Duolingo sets body text in **DIN Next Rounded**, "rounded, sans serif". [V][multi] 04 §2.2. On Apple the system rounded face is used. Elsewhere, the open Google family's roundness axis reproduces the rounded terminals. |
| Wrapped and recap display | **Roboto Flex**, variable width and weight | The 2024 Wrapped face, Spotify Mix, is "a variable font with expansive width and weight range". [V][multi] 04 §1.3. Roboto Flex is the open variable family with width (25–151) and weight (100–1000) axes, and Roboto is the face BeReal's website uses. [V] 03 §1.2 |
| Plan (event) titles | **Manrope**, or Roboto Flex in its wide "display" setting | Partiful's title-font options include `manrope` and `display`. [V] 04 §3.1, from live create URLs |
| AI-object chrome (Create, Remix, AI info) | **Google Sans Flex** | The source surfaces are Google Photos tools. [V] 06 §1. Google Sans is Google's product face. [B] |
| Card name and stat lines | `"Gill Sans"` and `"Futura"` (present on iOS and macOS), then Inter | The physical Pokémon TCG uses Gill Sans for text and Futura for HP. [V] 05 §1.7 (physical cards only) |

## 4. Shape and motion

| Decision | Source |
|---|---|
| Photo frame = Home Screen widget shape, 28 pt corner radius, square | Locket's camera writes straight onto friends' widgets [V] 01 §1.3, so the viewfinder previews the widget [I]. The iOS 26 widget radius is 28 pt [V-weak] 06 §4.3. |
| Nested radii are concentric (inner = outer − padding) | Apple's concentric layout rule. [V][multi] 06 §4.2 |
| Floating corner controls: translucent glass circles | iOS 26 Liquid Glass. [B][P] Not researched; see 06 §4.4 |
| No tab bar on the camera; "icons in each corner" lead to each section | Locket. [V] 01 §1.3 |
| Swipe up (or scroll down) from the camera into History | Locket. [V][multi] 01 §1.3 |
| Reactions "rain down" on the photo | Locket. [V][multi] 01 §1.6 |
| Retro's weekly film strip: a horizontal strip with rounded *outer* corners only | Retro. [V][multi] 02 §B4.1 |
| Rewind dial: an iPod-style click wheel that ticks with a haptic per memory while photos "flip by" | Retro. [V] 02 §B4.6 |
| Pack cut: swipe across the top of the pack, with rip sound and vibration | TCG Pocket. [V][multi] 05 §1.5 |
| Rare pack tells: a glowing light plus a cracking sound | TCG Pocket. [V] 05 §1.5 |
| After a pack: "swipe up" to add the cards | TCG Pocket. [V] 05 §1.5 |
| Immersive card: tap and hold expands it to full screen; the camera pans past the card borders; tilt for parallax | TCG Pocket. [V][multi] 05 §1.6 and §1.1 |
| Wrapped type "dancing like sound waves" over collage layers, textures and gradients | Wrapped 2025. [V] 04 §1.1 |
| Kinetic display type that loops and transforms as the main graphic | Wrapped 2024. [V][multi] 04 §1.9 |

## 5. Surface-by-surface ledger

### A. Onboarding

| Element | Source | Evidence |
|---|---|---|
| Intro button "Set up my roll." | Locket | "Set up my Locket". [V] 01 §1.12 |
| "What's your name?" → Continue | Locket | Same step order and wording. [V] 01 §1.12 |
| Birthday step | Spec §S and §J | Teen controls and 18+ packs need an age. Locket has no birthday step on record (01 §1.12), so this one is spec-driven. |
| Contacts: "Share All Contacts" / "Not now", then a "Skip contacts?" sheet | Locket | [V] 01 §1.12 |
| Gate progress "1 of 3 friends joined" | Locket's "0 of 5 friends added" pattern, applied to the spec's 3-member gate | [V] 01 §1.12, [S] §A3 |
| Rewind before friends exist | Retro Rewind | [V] 02 §B4.6, [S] §A1 |
| Cadence picker (daily / weekly / monthly) | Retro onboarding. The group admin picks the ritual day. | [V] 02 §B4.12, [S] §A4 |
| Likeness capture: face inside an oval guide, read numbers aloud, turn head | Sora Cameos | [V][multi] 06 §3.1 |
| Join page by link: mascot, member count, latest recap; react without an account | Partiful, Apple Invites, Jackbox | [S] §A2. Spotify's "Join Party" button label. [V] 04 §1.6 |

### C. Groups

| Element | Source |
|---|---|
| Group pill at top center showing the group and member count | Locket's friends pill [B]. Corner placement [V] 01 §1.3 |
| Multiple groups, each with its own wall | Yope "micro communities". [V] 02 §A0 |
| Wall unlocks at 3 members | [S] §A3 |
| Cap of 30, 5–15 recommended | [S] §C |
| Archive opens only by group vote | Retro keys, adapted. [V] 02 §B4.5, [S] §C |

### D. Camera

| Element | Source |
|---|---|
| White shutter under the viewfinder; flash bolt on the left; flip arrow on the right | Locket. [V] 01 §1.4 |
| Yellow outline around the viewfinder while recording | Locket help center. [V] 01 §1.4 |
| Dual mode: the selfie is a small inset **top-left** of the main photo | BeReal. [V][multi] 03 §1.6 |
| "BTS On" / "BTS Off" toggle top-right; a 2-second pre-capture clip; long-press to play; Live Photo symbol in the upper corner | BeReal BTS. [V] 03 §1.8 |
| After capture, an ✕ top-right to retake | BeReal. [V] 03 §1.5 |
| Send uses an arrow icon | Locket. [V] 01 §1.5 |
| Ritual posts are camera-only | Instagram Instants, Yope. [S] §D |
| Camera-roll upload is free | Locket charges for it in Gold [V] 01 §1.11. Made free per [S] §D. |
| Frames and themes | Locket Gold camera themes [B]; purikura [B]. [S] §D |

### E. Wall and journal

| Element | Source |
|---|---|
| Weekly film-strip rows, with per-friend cards per week | Retro. [V] 02 §B4.1 and §B4.3 |
| A "this week in" card at the end of the row, and Rewind just past it | Retro. [V] 02 §B4.1 and §B4.6 |
| Current week blurred until you post; past weeks never blurred | Retro (post weekly to see) [V] 02 §B4.4. Softened per [S] §E. |
| AI wall: a "chaotic collage" of cut-out stickers that keeps evolving | Yope. [V][multi] 02 §A4.3 |
| Wall editing, remix and saved versions | Yope walls ("edit them, remix them"). [S] §E |
| Live "right now" strip at the top | Yope split view. [S] §E |
| Chat and wall in separate tabs | KakaoTalk rollback. [S] §E |

### F. Stickers and likeness

| Element | Source |
|---|---|
| Cut-out stickers from photos | Yope. [V] 02 §A4.3 |
| White die-cut border on stickers | Bitmoji / iMessage sticker convention. [B] |
| Likeness permissions labelled "Only Me" / "People I Approve" / "My Groups" | Sora Cameos labels "Only Me", "People I Approve", "Mutuals". [V] 06 §3.2. "Mutuals" becomes "My Groups" because the app has no follow graph. |
| Every object made with your face is visible to you, and access can be revoked any time | Sora. [V][multi] 06 §3.3 |
| Export watermark on every exported likeness object | [S] §F and §Q. Geometry from Gemini (section Q below). |

### G and H. Recaps, comics, zines, memes

| Element | Source |
|---|---|
| Create grid tiles titled "Your tools", each with a one-line description | Google Photos Create tab. [V] 06 §1.2 |
| Style chips: Anime, Comic book, Sketch, 3D animation, plus more | Google Photos Remix. [V][multi] 06 §1.4 |
| Me Meme flow: template → "well-lit, focused, and front-facing" selfie → result with regenerate, save, share and compare | Google Photos Me Meme. [V] 06 §1.5 |
| "AI info" in details: an 'i' badged with a sparkle; "Credit: Made with roll. AI" | Google Photos AI info. [V][multi] 06 §1.6 |
| Recap formats: collage or video slideshow, for a week, month or year | Retro recaps. [V][multi] 02 §B4.7 |
| Auto-creation toggle | Google Photos "New for you" teardown. [S] §G |

### I. Figurines

| Element | Source |
|---|---|
| Composition: a 1/7 scale figure on a round transparent acrylic base, on a computer desk; the monitor shows the modelling process; a toy box printed with the original art sits beside it | The Nano Banana figurine prompt. [V][multi] 06 §2.2. Used as the exact prompt and as the layout of the local renderer. |

### J. Friend Cards

| Element | Source |
|---|---|
| Rarity marks ◇ ◇◇ ☆ ☆☆☆, bottom-left under the "photo by" line; immersive cards get **golden** stars | TCG Pocket. [V][multi] 05 §1.2 and §1.7 |
| Pull rates: cards 1–3 are common; cards 4 and 5 use TCG's tables, merged into 4 tiers | TCG Pocket. [V] 05 §1.3. See `packages/shared/src/cards.ts` for the arithmetic. |
| Rare Pack: 0.05%, ☆ and above only | TCG Pocket. [V] 05 §1.3 |
| Binder of 30 slots; collection grid 3 columns by default, pinch to 11 | TCG Pocket. [V] 05 §1.8 and §1.9 |
| Wonder Pick: 5 face-down cards are shuffled and you pick 1; stamina max 5, +1 every 12 h; cost 1–4 by rarity | TCG Pocket. [V] 05 §1.11 |
| Trades only between same rarities; Shinedust costs 1,200 / 4,000 / 5,000; 1 Trade Stamina per trade | TCG Pocket. [V][multi] 05 §1.12 |
| Wishlist of 20, 3 highlighted | TCG Pocket. [V] 05 §1.8 |
| Pack Points: 5 per pack; exchange costs by tier | TCG Pocket. [V] 05 §1.10 |
| "Sparkle Flair: Gold" cosmetic | TCG Pocket. [V][multi] 05 §1.13 |
| Numbered upgrade "#N" with backdrop and symbol traits, each shown as a rarity % | Telegram collectible gifts. [B] (Telegram was not researched: 05 §2) |
| Sparks shop | Discord Orbs. [B] (not researched: 05 §3) |

### K. Games and the game master

| Element | Source |
|---|---|
| Awards that regenerate each session, e.g. "Early Bird" (active at sunrise) and "Crate Digger" | Spotify Wrapped Party. [V][multi] 04 §1.6 |
| Roles: Archivist, Scout, Curator, Collector, Loyalist, Broadcaster, Specialist… | Spotify Wrapped Clubs roles. [V] 04 §1.7 |
| Photo telephone with a replay at the end | Gartic Phone. [B] |
| Share grid made of emoji squares | Wordle. [B] |
| Host with a VIP crown, room code, audience past 10 players | Jackbox. [B] |
| Positive polls with four named options on gradient cards | tbh / Gas. [B]. Anonymity removed per [S] §K. |
| Memory panel, where each item can be deleted | Character.ai memory. [B], [S] §K |
| Game buttons: rounded, with a darker bottom "lip" | Duolingo. [B] (unconfirmed: 04 §2.3) |

### L. Memory

| Element | Source |
|---|---|
| "N years ago": the photo is **cut into the shape of the number** on a bold colored background | Google Photos Memories redesign. [V] 06 §1.7 |
| A Rewind card at the end of the week row: "this week, last year" | Retro. [V] 02 §B4.6 |
| Shared old photos get a timestamp | Retro Rewind [V] 02 §B4.6. Styled as the film-camera date imprint of Dispo and Lapse [B]. |

### M. Mascot

| Element | Source |
|---|---|
| Built from rounded geometric shapes; the palette "comes straight from the mascot" | Duolingo Duo. [V] 04 §2.1 ("core palette comes straight from the mascot"). Construction [B] |
| Grows with group activity; never dies | Widgetable / Pengu co-pets. [B], [S] §M |

### N. Widgets and Live Activities

| Element | Source |
|---|---|
| Widget: the photo fills it, with the sender's name and an optional streak score | Locket. [V] 01 §1.7 |
| Widget sizes 170×170, 364×170 and 364×382 pt | iOS. [V] 06 §4.3 |
| Two widget kinds: friends' newest posts, and "time hop" to your own memories | Retro. [V][multi] 02 §B4.9 |
| Live Activity at most 160 pt tall, 20 pt margins; Dynamic Island compact, minimal and expanded | Apple. [V][multi] 06 §4.1 and §4.2 |
| A Sunday Live Activity that "takes over the Lock Screen" | Locket Rollcall. [V][multi] 01 §1.8 |

### O. Notifications

| Element | Source |
|---|---|
| Ritual push "⚠️ Time to roll. ⚠️" | BeReal's "⚠️Time to BeReal.⚠️". [V][multi] 03 §1.4 |
| Every push points to real new content | Yope's empty-push complaint. [S] §O |

### P. Reactions

| Element | Source |
|---|---|
| Five selfie reactions (thumbs up, smile, surprise, heart eyes, crying-laughing) plus a ⚡ instant one at the end of the row | BeReal RealMoji. [V][multi] 03 §1.7 |
| Uncounted reactions, visible only to the poster | Locket and Retro. [V] 01 §1.6, 02 §B4.3 |
| Plan RSVP labels Going / Maybe / Can't Go; "Find a Time" poll with Yes / No / Maybe; "Pick this"; "Upload Photos" at the top of the activity | Partiful. [V][multi] 04 §3.3 and §3.7 |

### Q. Export

| Element | Source |
|---|---|
| Visible watermark bottom-right: 48 px with a 32 px margin, or 96 px with a 64 px margin on large images | Gemini sparkle watermark geometry. [V] 06 §2.5 |
| Animated exports: the watermark moves across frames and carries the creator's handle | Sora. [V][multi] 06 §3.4 |
| C2PA-style provenance metadata | Sora and SynthID. [V][multi] 06 §3.4 and §2.5 |

### U. Monetization

| Element | Source |
|---|---|
| $3.99 a month or $36 a year | Locket and Retro ($36/yr). [V] 02 §B4.13; spec §U |
| Referral reward: 5 friends earn a year, 10 earn lifetime | Retro. [V][multi] 02 §B4.13. Adapted to a group goal per [S] §R. |

### V. Wrapped

| Element | Source |
|---|---|
| "Visual mixtape" look: mixtape, CD and scrapbook textures; black, white, green and red; color only for key moments | Wrapped 2025. [V][multi] 04 §1.1 and §1.2 |
| Party mode: "Join Party", a host, awards that change every session | Wrapped Party. [V] 04 §1.6 |
| Five memorable days ("Your Biggest … Day") | Wrapped Listening Archive. [V] 04 §1.8 |
| "Guess whose photo" quiz before the reveal | Wrapped Top Song Quiz. [V][multi] 04 §1.8 |

---

## Verify before build

Every **[B]** item above, in particular:
- Locket's exact yellow hex and its camera-screen geometry.
- BeReal's inset border and corner radius.
- Telegram's collectible anatomy.
- Discord Orbs.
- Duolingo's lip-button depth.
- The Wordle share header.
- Gartic Phone visuals.
- Liquid Glass parameters.

The research gaps (`/research/*.md`, "Gaps" sections) list the exact follow-up queries. The search budget ran out in this pass.
