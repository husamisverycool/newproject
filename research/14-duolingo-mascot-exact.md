# 14: Duolingo mascot, buttons, streaks, quests and notifications; Widgetable, Pengu, Kakao Friends, QQ Show, ZEPETO

Compiled 2026-10-07 (cluster 5). Every fact here comes from a WebSearch result summary. No page was opened, because curl, WebFetch and browsers are blocked.

## How to read this file

- **Method.** I ran 26 WebSearch calls, the hard limit. The search tool merges several results into one summary. When a sentence could have come from more than one URL in a result set, the Source column lists every candidate URL.
- **Tags:**
  - **[V]**: an official source (design.duolingo.com, blog.duolingo.com, the App Store listing, kakaocorp.com), or two or more independent sources that agree.
  - **[V-weak]**: one third-party source (a fan wiki, a guide site, an extraction tool or a clone project), or a summary sentence I cannot pin to one URL.
  - **[B]**: my background knowledge, not verified this session. All [B] rows are in their own section near the end, and none appear in the verified tables.
- **Overlap with file 04.** Typography and the 12 core palette hexes are already in `research/04-wrapped-duolingo-partiful.md` §2. They were not searched again. The typography rows in §1.1 are carried over from file 04 with its source URLs.
- **Rights and licensing (read before building).** The brief asks to copy these apps exactly. That collides with intellectual property:
  - **Duolingo:** Duo, the World Characters and the Feather Bold typeface are proprietary. Feather Bold is a bespoke typeface that "no one else can use".
  - **Kakao:** the Kakao Friends characters are trademarked, licensed IP.
  - **Copy:** verbatim notification text is copyrighted brand copy.
  - **DIN Next Rounded** is a commercial Monotype font and needs a licence.

  This file records what the sources say. It does not clear any of it for reuse. Legal review is needed before shipping lookalikes.

---

## 1. Duolingo design system

### 1.1 Typography (carried over from file 04, not re-searched)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Duolingo | Brand type | Headline / logo face | **Feather Bold**: custom/bespoke ("no one else can use it"), letterforms "inspired by the curves and shapes of the Duo owl", used "for impact" in headlines | https://www.canny-creative.com/brand-breakdown/brand/duolingo/ ; https://madegooddesigns.com/duolingo-brand-guidelines/ ; https://www.shadcn.io/design/duolingo | [V] |
| Duolingo | Brand type | Body / subheads face | **DIN Next Rounded**: used "for longer sentences" and "makes up the subheadings and body copy" | https://www.canny-creative.com/brand-breakdown/brand/duolingo/ ; https://madegooddesigns.com/duolingo-brand-guidelines/ | [V] |
| Duolingo | Brand type | Casing rule | "Feather Bold should be set in lowercase, whereas DIN Next Rounded uses typical sentence case." "Feather Bold and DIN Next Rounded should not be used together in the same sentence." | https://www.canny-creative.com/brand-breakdown/brand/duolingo/ | [V-weak] |
| Duolingo | Brand type | Size / weight / line-height scale | UNKNOWN (see Gaps) | — | — |

### 1.2 Buttons ("3D lip")

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Duolingo | Primary button | Background | #58cc02 | https://open-design.ai/plugins/design-system-duolingo/ (third-party extraction; also oppadu.com gallery) | [V-weak] |
| Duolingo | Primary button | Label color | #ffffff | same as the row above | [V-weak] |
| Duolingo | Primary button | Padding | 14px 24px | same as the row above | [V-weak] |
| Duolingo | Primary button | Corner radius | 16px | same as the row above | [V-weak] |
| Duolingo | Primary button | Lip (bottom edge) | `border-bottom: 4px solid #58a700`, described as "the chunky shadow" | same as the row above | [V-weak] |
| Duolingo | Primary button | Hover | background #89e219 | same as the row above | [V-weak] |
| Duolingo | Primary button | Pressed / active | `translate-y 4px` + `border-bottom 0`, so the button "presses" | same as the row above | [V-weak] |
| Duolingo | All buttons | Rule | "chunky 4px bottom-shadow on every button" as a "tactile press" affordance | same as the row above | [V-weak] |
| Duolingo | Button labels | Casing, font size, height, secondary-button style | UNKNOWN in verified sources (see [B]) | — | — |

### 1.3 Dark mode

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Duolingo | Dark mode | Existence | An official dark mode exists in Settings. It changes background, text and other UI elements to dark shades. | https://chrome.google.com/webstore/detail/duolingo-dark-mode/hdonifknoaabcipnicooajpencgllcaf/reviews and blog-spam results (low quality) | [V-weak] |
| Duolingo | Dark mode | Canvas `--bg` | #131f24 ("deep slate-teal canvas") | https://github.com/titanaprilian/private-movie/issues/575 (an unrelated project's "Duolingo Dark Slate-Teal Palette"; NOT a Duolingo source) | [V-weak] |
| Duolingo | Dark mode | Card `--surface` | #202f36 | same as the row above | [V-weak] |
| Duolingo | Dark mode | Raised / hover `--surface-raised` | #2b3d46 | same as the row above | [V-weak] |
| Duolingo | Dark mode | Border `--border` | #37464f | same as the row above | [V-weak] |
| Duolingo | Dark mode | Strong border `--border-strong` | #4e616c | same as the row above | [V-weak] |
| Duolingo | Dark mode | Active nav green tint `--green-soft` | #1b2f1a | same as the row above | [V-weak] |
| Duolingo | Dark mode | Official dark-mode token list | UNKNOWN. design.duolingo.com did not surface any dark palette. | — | — |

### 1.4 Illustration rules (official design.duolingo.com and blog)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Duolingo | Illustration | Shape vocabulary | All illustrations are made from **three basic shapes: the rounded rectangle, the circle, and the rounded triangle**. "The rounded rectangle is used the most frequently." | https://design.duolingo.com/illustration ; https://blog.duolingo.com/shape-language-duolingos-art-style/ | [V] |
| Duolingo | Illustration | Corners | "Every shape has rounded edges"; "pointy shapes are off-brand" | https://design.duolingo.com/illustration | [V] |
| Duolingo | Characters | Construction | Characters are "simple to construct" but should "feel like more than the sum of their parts". "Usually, the head and body are composed of 1–2 basic shapes each." | https://design.duolingo.com/illustration/characters | [V] |
| Duolingo | Characters | Eye styles | Five main eye styles: **round, glasses, almond, linear, dots**. Other styles may be explored, "but they must be geometric in nature". | https://design.duolingo.com/illustration/characters | [V] |
| Duolingo | Characters | Eye expression | Eyes convey personality through effects such as a "shiny-eye effect for tears" or adjusting pupil size | https://design.duolingo.com/illustration/characters | [V] |
| Duolingo | Illustration | Shadows | "Shadows always appear below characters as a pill shape"; "the shadow's color depends on the background" | https://design.duolingo.com/illustration | [V] |
| Duolingo | Illustration | Perspective | "Characters and icons are designed on a flat perspective" | https://design.duolingo.com/illustration | [V] |
| Duolingo | Characters | Tone | "diverse, quirky, and lovable" | https://design.duolingo.com/illustration/characters | [V] |
| Duolingo | Duo | Iconic feature | "Duo's ears are his most iconic feature, but they're the most challenging to turn in space" | https://design.duolingo.com/illustration/duo | [V] |
| Duolingo | Duo | Posing | Duo can bend "at the waist, elbow, and wrists". When bending at the waist, "a rounded rectangle should be placed over his body instead of editing his existing shape". | https://design.duolingo.com/illustration/duo | [V] |
| Duolingo | Duo | Drawing tutorial (lead) | An official "how to draw Duo" post exists. Its steps were not shown. | https://blog.duolingo.com/how-to-draw-duo-the-owl | [V] (existence only) |
| Duolingo | Illustration | Outlines (none) and in-shape shading | Not stated in any snippet. UNKNOWN as verified (see [B]). | — | — |

### 1.5 Character cast

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Duolingo | Cast | Count | "ten World Characters" (in the context of lip-sync) | https://blog.duolingo.com/world-character-visemes | [V] |
| Duolingo | Cast | Design intent | It was important for characters to have "different ages, ethnicities, and personalities so that learners all over the world could relate to at least one character" | https://blog.duolingo.com/duolingo-female-character-origin-stories ; https://blog.duolingo.com/linda-simensky-duocon-interview/ | [V] |
| Duolingo | Lily | Personality | Sarcastic, introverted teenager; loves drawing and purple clothes; "secretly caring, despite her serious look". Lily is "super introverted" and best friend of Zari. | https://duolingoguides.com/all-duolingo-characters ; https://blog.duolingo.com/duolingo-female-character-origin-stories | [V] |
| Duolingo | Zari | Personality | Outgoing, ambitious, "type-A", "super outgoing"; Muslim | same as the row above | [V-weak] |
| Duolingo | Lin | Personality | "Really laid-back"; undercut hairstyle, casual attire; practical and street-smart; granddaughter of Lucy; roommate of Bea; canonically queer | https://duolingoguides.com/all-duolingo-characters ; https://blog.duolingo.com/duolingo-female-character-origin-stories | [V-weak] |
| Duolingo | Bea | Personality | "Quite neurotic"; likely under 30 | https://duolingo.fandom.com/wiki/Bea ; https://blog.duolingo.com/duolingo-female-character-origin-stories | [V-weak] |
| Duolingo | Eddy | Personality | Fitness-obsessed single father, well-meaning, father of Junior | https://duolingoguides.com/all-duolingo-characters | [V-weak] |
| Duolingo | Oscar | Personality | Sophisticated, art-loving teacher with dramatic flair; loves opera, fine art and fashion | same as the row above | [V-weak] |
| Duolingo | Lucy | Personality | Lin's grandmother | same as the row above | [V-weak] |
| Duolingo | Falstaff | Identity | "Falstaff the Bear" | same as the row above | [V-weak] |
| Duolingo | Junior, Vikram | Identity | Junior is Eddy's son. Nothing else verified; Vikram is UNKNOWN. | same as the row above | [V-weak] |

### 1.6 Animation / motion

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Duolingo | Characters | Tool | **Rive**. Its "State Machine" is "a visual representation of the logic that connects the animations ('states') together". | https://blog.duolingo.com/world-character-visemes | [V] |
| Duolingo | Characters | Lip-sync pipeline | Speech tech analyses phonemes and timing, which drives viseme mouth shapes. Rive state machines blend them in real time. When a challenge is shown, the app fetches audio and timing and triggers the state machine in sync. | same as the row above | [V] |
| Duolingo | Characters | Constraint | The animation has to scale to 40+ languages and 100+ courses, and the file size must stay small enough for Android, iOS and Web. Characters move "beyond idle animations". | same as the row above | [V] |
| Duolingo | Streak milestone | Concept | Milestones are treated "like 'power ups' in a video game, where Duo himself physically changed on these exciting days" | https://blog.duolingo.com/streak-milestone-design-animation/ | [V] |
| Duolingo | Streak milestone | Research finding | Some new learners don't understand the streak, because "keeping the flame alive" / "on fire" is "not shared by all cultures" | same as the row above | [V] |
| Duolingo | Streak extend | Motion | Extending a streak shows Duo and the day count. "Duo spins in the air and bursts into an orange flame." | https://blog.duolingo.com/streak-milestone-design-animation/ or https://duolingo.deconstructoroffun.com/mechanics/streaks (same result set) | [V-weak] |

### 1.7 Writing voice (official)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Duolingo | Voice | Definition | "The Duolingo voice is how our brand personality comes through in words. When our voice is consistent across Duolingo content, it builds trust and familiarity." | https://design.duolingo.com/writing/voice | [V] |
| Duolingo | Voice | Four qualities | **Expressive** ("simple words and phrases to convey big feelings"), **Playful** ("bringing creativity to the conversation"), **Embracing** ("a cheerleader to whoever you are"), **Worldly** ("interested, knowledgeable, and having a broad worldview") | https://design.duolingo.com/writing/voice | [V] |
| Duolingo | Personality | Traits seen | **Inspiring** ("anything is possible when you Duolingo"), **Inclusive** (welcoming everyone; accessible product). The full list may be longer. | https://design.duolingo.com/writing/voice ; https://design.duolingo.com/writing/brand-narrative | [V] |
| Duolingo | Personality | Celebrity reference | Trevor Noah: "funny, accessible, and smart"; "speaks eight languages" | https://design.duolingo.com/writing/voice (result set) | [V-weak] |
| Duolingo | Duo's voice | Role | Duo "loves Duolingo and seeing learners succeed"; learners' "#1 fan and biggest cheerleader" | https://design.duolingo.com/writing/duo | [V] |
| Duolingo | Duo's voice | Adjectives | helpful, motivating, organized, dependable, dedicated, persistent, supportive, positive, emotive, **slightly awkward** | https://design.duolingo.com/writing/duo | [V] |
| Duolingo | Brand tone | Shorthand | "wholesome but unhinged" | https://www.dawncreative.co.uk/?p=11033 or https://skillsmp.com/creators/hktitan/duolingo/skills-duo-voice (same result set; third-party) | [V-weak] |

---

## 2. Duolingo surfaces

### 2.1 Push notifications

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Duolingo | Push | Back-off message | "These reminders don't seem to be working. We'll stop sending them for now." | https://taplytics.com/blog/duolingo-sends-push-notifications-to-let-users-know-they-know-theyre-not-engaging-with-their-reminders ; https://debugger.medium.com/duolingo-needs-to-chill-8f1832745ca0 | [V] |
| Duolingo | Push | Back-off rule | Duolingo scales back pushes that aren't engaged with or useful | same as the row above | [V] |
| Duolingo | Push | Duo lapsed-user message | "Hi, it's Duo! I missed you. It has been 3 days. It's not too late to come back and practice today!" | https://www.ngrow.ai/blog/heres-what-you-can-learn-from-the-amazing-push-notifications-of-duolingo ; https://tinomwadeyi.substack.com/p/how-duolingo-perfected-the-art-of ; https://www.universityxp.com/news/2025/7/25/we-havent-seen-you-in-a-while-duolingos-passive-aggressive-strategy-for-keeping-users-hooked (same result set) | [V-weak] |
| Duolingo | Push | Zari back-off variant | "Hi! It's Zari! Duo says you're ignoring him 😔 We'll stop these reminders, but please come back soon!" | same result set as the row above | [V-weak] |
| Duolingo | Push | Lily variant | "Hey. It's Lily. Did you practice [Language] today? Be a lot cooler if you did..." | same result set as the row above | [V-weak] |
| Duolingo | Push | Monthly badge | "You're falling behind! Do a [Language] lesson today to get back on track for your monthly badge" | same result set as the row above | [V-weak] |
| Duolingo | Push | Tone line | "Don't let Duo down!" | same result set as the row above | [V-weak] |
| Duolingo | Push | Copy testing | Duolingo A/B tests notification copy (blog post exists; details not shown) | https://blog.duolingo.com/copy-testing-experiments ; https://taplytics.com/blog/how-duolingo-ran-an-experiment-on-their-streaks-feature | [V] (existence) |
| Duolingo | Push | Streak-at-risk exact copy | UNKNOWN | — | — |

### 2.2 Streak, Streak Freeze, milestones

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Duolingo | Streak | Rule | Consecutive days with at least one lesson. The flame icon "grows and changes color as the number rises". | https://desirabilitylab.com/backfill/backfill-2025-353-duolingo-streak-system ; https://duolingo.deconstructoroffun.com/mechanics/streaks | [V-weak] |
| Duolingo | Streak | Milestones | A celebration screen at 7 days; "at 30 the icon upgrades". Further milestones at 50, 100 and 365. | same as the row above | [V-weak] |
| Duolingo | Streak Freeze | Cap | "Learners can equip up to two Streak Freezes at a time" | https://blog.duolingo.com/how-duolingo-streak-builds-habit (result set) | [V-weak] |
| Duolingo | Streak calendar | Frozen / missed day | "A light orange streak means a streak freeze or a missed day" | same result set as the row above | [V-weak] |
| Duolingo | Streak | Positioning | Streaks are "the single most effective retention lever in the product" | https://desirabilitylab.com/backfill/backfill-2025-353-duolingo-streak-system | [V-weak] |
| Duolingo | Streak Freeze | Shop page (lead) | A wiki page exists at Shop/Streak_freeze. Its contents were not shown. | https://duolingo.fandom.com/wiki/Shop/Streak_freeze | [V] (existence) |

### 2.3 Friend Streak

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Duolingo | Friend Streak | Feature name | "Friend Streak" | https://blog.duolingo.com/friend-streak/ | [V] |
| Duolingo | Friend Streak | Max partners | "up to five friends" / "up to 5 friends" | https://blog.duolingo.com/friend-streak/ ; https://blog.duolingo.com/product-lessons-friend-streak/ | [V] |
| Duolingo | Friend Streak | Rule | You keep a separate streak with each friend. The friend must accept the invitation. Each of you must do a daily lesson. The streak goes up by one for each day you both complete a lesson. | https://blog.duolingo.com/friend-streak/ | [V] |
| Duolingo | Friend Streak | Entry point | Go to the "Streak" section, choose friends, send an invitation, and wait for them to accept | https://duolingoguides.com/how-to-start-a-friend-streak-on-duolingo-tips-for-daily-practice/ | [V-weak] |
| Duolingo | Streak screen | Tabs | "PERSONAL" and "FRIENDS" tabs; Lily and Duo shown in a handshake | https://blog.duolingo.com/product-lessons-friend-streak/ (summary of an image) | [V-weak] |
| Duolingo | Friend Streak | Impact stat | Learners with at least one Friend Streak are "22% more likely to complete their daily lesson" | https://blog.duolingo.com/product-lessons-friend-streak/ | [V] |
| Duolingo | Friend Streak | Context stat | "57% of Duolingo users" have at least one friend | same as the row above | [V] |
| Duolingo | Friend Streak | Build process | The first internal version was an "uber prototype": the "dumbest" version, all local, with no backend | same as the row above | [V] |
| Duolingo | Friend Streak | Nudges | Users receive nudge messages that use pre-written text. The texts themselves were not shown. | https://duolingoguides.com/duolingo-friend-streak-nudge-messages/ | [V-weak] |
| Duolingo | Friend Streak | "Start a Friend Streak", "x day Friend Streak", milestone copy, ended copy | UNKNOWN | — | — |

### 2.4 Friends Quest and Quests

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Duolingo | Friends Quest | Name | "Friends Quest" | https://blog.duolingo.com/friends-quests/ | [V] |
| Duolingo | Friends Quest | Mechanic | You and one partner complete the week's challenge together, for example a number of perfect lessons or an XP goal | https://blog.duolingo.com/friends-quests/ | [V] |
| Duolingo | Friends Quest | Cadence | Weekly; pairs you with a friend "every Tuesday after 1 PM EST" | https://duolingoguides.com/what-is-a-quest-in-duolingo/ | [V-weak] |
| Duolingo | Friends Quest | Split | Progress is pooled. For example, "30 lessons in 4 days" can be split however partners choose. | same as the row above | [V-weak] |
| Duolingo | Friends Quest | Rewards | Examples: "an XP Boost that lasts 30 minutes" or "a chest of 100 gems"; worth more Quest Points than daily quests | https://blog.duolingo.com/friends-quests/ ; https://duolingoguides.com/what-is-a-quest-in-duolingo/ | [V-weak] |
| Duolingo | Friends Quest | Nudge | You can send your partner a message and "give them a nudge to do their daily lesson" | https://blog.duolingo.com/friends-quests/ ; https://blog.duolingo.com/friends-social-features/ | [V] |
| Duolingo | Friends Quest | Gift | "tap the gift icon on the Friends Quest module and use your gems to transfer a surprise XP boost" | https://blog.duolingo.com/friends-social-features/ or duolingoguides (same result set) | [V-weak] |
| Duolingo | Daily Quests | Structure | Launched early 2022; three new challenges each day, refreshing every 24h (XP, lesson count, time, perfect scores) | https://duolingoguides.com/what-is-a-quest-in-duolingo/ | [V-weak] |
| Duolingo | Monthly challenge | Start | Began May 2021 with the "Hamamatsu Kite Festival" badge; 25–50 quests per month | same as the row above | [V-weak] |
| Duolingo | Badges | Achievements | A revamped achievement system; rare badges include a year-long streak | https://blog.duolingo.com/achievement-badges | [V] |
| Duolingo | Friends Quest card copy, quest strings, Quests screen layout | — | UNKNOWN | — | — |

### 2.5 Energy, XP, gems, lesson complete

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Duolingo | Energy | Launch | Testing began July 3, 2025; planned replacement for Hearts | https://duolingo.fandom.com/wiki/Energy | [V-weak] |
| Duolingo | Energy | Numbers | 25 Energy; −1 per correct answer, −1 to −2 per incorrect; streaks of correct answers add Energy | same as the row above | [V-weak] |
| Duolingo | Energy | Depletion | Unlike Hearts, Energy "depletes with every exercise" | https://www.androidauthority.com/quitting-duolingo-energy-system-3599842/ | [V-weak] |
| Duolingo | Energy | Refill | Buy with gems, do practice lessons, watch ads. Super Duolingo and Duolingo Max get unlimited Energy. | https://duolingo.fandom.com/wiki/Energy ; https://feedbagel.com/post/duolingo-introduces-energy-feature-to-replace-hearts-for-enhanced-learning | [V-weak] |
| Duolingo | Energy | Rationale | "reward learners for getting things right instead of penalizing" | same as the row above | [V-weak] |
| Duolingo | Lesson complete | Copy and stat boxes | UNKNOWN. The search found nothing. | https://screensdesign.com/apps/duolingo-language-lessons/ (lead) | — |

---

## 3. Widgetable

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Widgetable | Store | App name | "Widgetable: Besties & Couples" | https://apps.apple.com/us/app/widgetable-besties-couples/id1641107226 | [V] |
| Widgetable | Store | Tagline | "turn your lock and home screens into a vibrant space for love and connection" with interactive widgets to "share life's moments with your besties and loved ones" | same as the row above | [V] |
| Widgetable | Co-pet | Feature name | "Raise Pets Together": "adopt adorable virtual pets and co-parent them with your friends", "feed, play, and watch them grow" | same as the row above | [V] |
| Widgetable | Co-pet | Species | cat, dog, bird, panda, polar bear, rubber duck | https://www.lemon8-app.com/@second.kira/7425209793985659398 or apkmody (same result set) | [V-weak] |
| Widgetable | Co-pet | Flow | Choose a pet, name it, invite a friend, then together "feed, bathe, hug, pet" it | same as the row above | [V-weak] |
| Widgetable | Co-pet | Currency | Coins; premium means you "don't need to spend coins for maintenance", and coins buy "new clothes and house decorations" for co-parented pets | https://www.applevis.com/comment/123275 (and nearby applevis comments) | [V-weak] |
| Widgetable | Co-pet | Ads | Up to 400 coins for watching 3 ads, resetting every 8 minutes | same as the row above | [V-weak] |
| Widgetable | Other widgets | Names | Sleep Widget, Mood Bubble, Mood Jar; pets and plants are the "two major features" | https://apps.apple.com/us/app/widgetable-besties-couples/id1641107226 ; https://www.applevis.com/comment/123275 | [V] |
| Widgetable | Widget | Behaviour | The pet widget "provides real-time updates as soon as it's time for caring" (this may come from the Care Pet Game listing in the same result set) | https://apps.apple.com/vn/app/id6504230695 (Care Pet Game, a different app) | [V-weak] |
| Widgetable | Pet status copy ("Your pet is hungry"), levels, art style | — | UNKNOWN | — | — |

## 4. Pengu (now "Friends – Pengu, Bao & Mellow")

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Pengu | Store | Names | Formerly "Pengu - Raise Virtual Pets"; now "Friends – Pengu, Bao & Mellow" (also listed as "Friends – Raise AI Companions") | https://apps.apple.com/gb/app/pengu-raise-virtual-pets/id6462927800 ; https://apps.apple.com/app/id6462927800 ; https://www.apkmirror.com/apk/slay-gmbh/friends-raise-ai-companions/ | [V] |
| Pengu | Store | Developer and launch | SLAY GmbH; launched September 30, 2023 | https://apps.apple.com/gb/app/pengu-raise-virtual-pets/id6462927800 | [V] |
| Pengu | Store | Claim | "#1 virtual pet game in the world"; "pet widget and game with friends" | same as the row above | [V] |
| Pengu | Companions | Cast | **Pengu**: shared companion raised with a partner or close friend; two people shape its personality through conversations, choices and shared interactions. **Mellow**: "calm AI study and focus companion". **Bao**: "self-care AI companion for healthy habits and well-being". | https://apps.apple.com/app/id6462927800 | [V] |
| Pengu | Co-parenting | Audience | "couples, close friends, and siblings"; "shared milestones and co-parenting adventures" | same as the row above | [V] |
| Pengu | Social | Actions | "send reactions and gifts, celebrate milestones", in a "shared digital space that grows with your relationships" | same as the row above | [V] |
| Pengu | Widget | Function | "check in, chat, and interact with your AI friend directly from your home screen" | https://apps.apple.com/gb/app/pengu-raise-virtual-pets/id6462927800 | [V] |
| Pengu | Dress-up | Items | "stylish outfits, accessories, and unique wallpapers"; mini-games "unlock exclusive items" | same as the row above | [V] |
| Pengu | Store | Rating | 4.9★, 233.7K reviews (at search time) | https://apps.apple.com/app/id6462927800 | [V] |
| Pengu | Needs meters, exact status copy, art style | — | UNKNOWN | — | — |

## 5. Kakao Friends

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Kakao Friends | Origin | Launch and creator | KakaoTalk emoticon characters released November 2012; illustrator Kwon Soon-ho ("Hozo") | https://en.wikipedia.org/wiki/Kakao_Friends ; https://www.kakaocorp.com/page/detail/9438?lang=ENG | [V] |
| Kakao Friends | Ryan | Design | A lion without a mane; "stoic charm"; nicknamed "Ryan Jeon-mu" (managing director); 53.4% of Kakao Bank 2017 card users picked Ryan | https://theculturetrip.com/asia/south-korea/articles/who-are-the-kakao-friends-2 ; https://en.wikipedia.org/wiki/Kakao_Friends | [V] |
| Kakao Friends | Muzi | Design | A piece of radish in rabbit clothes; curious and playful; created as Kakao's mascot, "based on the company colours of yellow and brown" | https://theculturetrip.com/asia/south-korea/articles/who-are-the-kakao-friends-2 | [V-weak] |
| Kakao Friends | Con | Design | A tiny crocodile who grew Muzi; a detective; "depictions of Con always show only one side of his face" | same as the row above | [V-weak] |
| Kakao Friends | Apeach | Design | A pink peach; playful and flirty; became sentient through a genetic mutation and escaped her tree | same as the row above | [V-weak] |
| Kakao Friends | Frodo | Design | A big-city mixed-breed dog who hides his heritage; a little bossy | same as the row above | [V-weak] |
| Kakao Friends | Neo | Design | Cares about looks and style; "perfectly-coiffured hair"; Frodo's girlfriend | same as the row above | [V-weak] |
| Kakao Friends | Jay-G | Design | A mole in disguise; a Jay-Z fan; a secret agent | same as the row above | [V-weak] |
| Kakao Friends | Tube | Design | A duck who "transforms into a sharp-toothed, green monster when he's angry" | same as the row above | [V-weak] |
| Kakao Friends | Choonsik | Design | A stray cat adopted by Ryan; non-binary; favourite food pumpkin sweet potato; name chosen on Instagram on Sept 10, 2020; first appeared in a short toon, not as an emoticon | https://middleclass.sg/trending/kakao-choonsik/ ; https://creatrip.com/en/blog/8589 ; https://www.kakaocorp.com/page/detail/9440?lang=ENG | [V] |
| Kakao Friends | Cast | Theme | "All the characters are insecure about something" (looks or background) | https://theculturetrip.com/asia/south-korea/articles/who-are-the-kakao-friends-2 | [V-weak] |
| Kakao Friends | Drawing rules, hex colors | — | UNKNOWN in verified sources | — | — |

## 6. QQ Show and ZEPETO

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| QQ Show (QQ秀) | Origin | Launch | 2003; users build 2D full-body avatars; modelled on Cyworld (Korea) | https://www.chinadaily.com.cn/a/201301/25/WS5a2a1851a3101a51ddf8e941.html | [V] |
| QQ Show | Monetisation | Currency | Q coins (Q币, introduced 2002) are spent on avatar items; more than 80% of Tencent's revenue came from value-added services paid with Q coins (2013 article) | same as the row above | [V] |
| QQ Show | Shop | Concept | "virtual shopping malls packed with Chinese brands" and "virtual car dealerships" | same as the row above | [V-weak] |
| Super QQ Show (超级QQ秀) | 3D | Launch | 3D full-body avatar; began testing November 2021; later replaced avatars in chat | https://www-web.itiger.com/news/1172022097 | [V] |
| Super QQ Show | Lifecycle | Shutdown | Tencent notice (June 11, 2026): from **August 11, 2026** users can no longer log in to or use Super QQ Show and 小窝 ("little nest") | https://www.ithome.com/0/962/999.htm | [V] |
| Super QQ Show | Brand collab | Example | Jordan Brand, for QQ's 25th anniversary | https://jingdaily.com/jordan-super-qq-show-25th-anniversary-nostalgia/ | [V-weak] |
| ZEPETO | Dress-up | Copy | "fill up your closet and dress up", with "trending new styles released every week"; "hundreds of customization options" for fashion and interior | https://www.apkmirror.com/apk/snow-corporation/zepeto/zepeto-2-21-0-release/ | [V-weak] |
| QQ Show / ZEPETO | Shop category labels | — | UNKNOWN in verified sources | — | — |

---

## BACKGROUND KNOWLEDGE [B]

Not verified this session. Confidence is noted per row. Never treat these as source-confirmed.

| App | Surface | Element | Value (from memory) | Confidence | Tag |
|---|---|---|---|---|---|
| Duolingo | Web | Font-family token | duolingo.com CSS uses `font-family: "din-round", sans-serif` for UI text. Feather Bold is used for the wordmark and marketing headlines, not running UI. | medium-high | [B] |
| Duolingo | Buttons | Label style | UPPERCASE, bold (700), ~15px on web, letter-spacing ~0.8px; examples "CHECK", "CONTINUE", "SKIP", "START", "GET STARTED", "I ALREADY HAVE AN ACCOUNT" | high (casing and strings), medium (px) | [B] |
| Duolingo | Buttons | Height / radius | ~48–50px tall, radius 12–16px; the lip is a bottom border or box-shadow of 4px in a darker shade of the fill | medium | [B] |
| Duolingo | Buttons | Shadow shades | Green #58CC02 → #58A700 (also "Tree Frog"); Macaw #1CB0F6 → #1899D6 ("Whale"); Cardinal #FF4B4B → #EA2B2B ("Fire Ant"); Bee #FFC800 → ~#E5A000; Fox #FF9600 → ~#CD7900; Beetle #CE82FF → ~#A568CC | medium (green/blue/red), low (others) | [B] |
| Duolingo | Buttons | Secondary button | White fill, 2px #E5E5E5 (Swan) border with a 4px Swan bottom lip; label in Macaw blue or Wolf gray | medium | [B] |
| Duolingo | Buttons | Disabled | Fill #E5E5E5, label #AFAFAF, no lip | medium | [B] |
| Duolingo | Palette | Extra neutrals and tints | Polar #F7F7F7 (light surface); Iguana #DDF4FF (selected-answer blue tint); Sea Sponge #D7FFB8 (correct footer); Walking Fish #FFDFE0 (incorrect footer) | medium | [B] |
| Duolingo | Dark mode | Tokens | Background #131F24; cards/sheets #202F36; borders/dividers #37464F; body text ~#F1F7FB / #DCE6EC; muted text ~#52656D; green slightly brighter (~#93D333) | medium (bg/card/border), low (text and green) | [B] |
| Duolingo | Lesson | Answer footer | A correct answer slides up a light-green sheet with a green heading ("Nice!", "Great job!", "Correct!", "Excellent!") and a green "CONTINUE" button. A wrong answer slides up a light-red sheet with "Correct solution:" in red and a red "GOT IT" button. Each plays a chime or buzz sound plus haptic. | high (behaviour), medium (exact strings) | [B] |
| Duolingo | Lesson complete | Screen | Header "Lesson complete!" with Duo or characters celebrating, and three stat cards with a colored header strip: "TOTAL XP" (yellow), accuracy ("AMAZING"/"GOOD"/"GREAT" + %, green), time ("QUICK"/"SPEEDY"/"COMMITTED" + m:ss, blue); "CLAIM XP" / "CONTINUE" button | medium | [B] |
| Duolingo | HUD | Top bar | Course flag; streak flame + count (orange #FF9600 when extended today, gray otherwise); gems (blue gem) + count; hearts (red, max 5) or Energy (lightning/battery) + count | high (items), medium (icon details) | [B] |
| Duolingo | Streak | Items | "Streak Freeze" (shop item; frozen days show ice-blue on the calendar); "Streak Repair"; "Streak Society" (365+ days); "Weekend Amulet" | high (names), medium (details) | [B] |
| Duolingo | Leagues | Tiers | Bronze, Silver, Gold, Sapphire, Ruby, Emerald, Amethyst, Pearl, Obsidian, Diamond; 30-person weekly leaderboard with a promotion zone (green) and demotion zone (red) | high | [B] |
| Duolingo | Daily Quests | Example strings | "Earn 30 XP"; "Score 90% or higher in 2 lessons"; "Get 10 in a row correct"; "Spend 10 minutes learning". Each row has an icon, a yellow progress bar with "x / y", and a chest icon. | medium (pattern), low (exact strings) | [B] |
| Duolingo | Friends Quest | Card | Two avatars (you + friend), a shared progress bar split by contributor color, a "x days left" timer, a chest reward, and buttons to nudge or gift | medium (layout), low (strings) | [B] |
| Duolingo | Friend Streak | Visual | Overlapping friend avatars with a flame; friend streak count shown on the Streak screen "FRIENDS" tab; empty slots invite you to add friends | low-medium | [B] |
| Duolingo | Illustration | Line and shading | No outlines (strokes) on characters. Flat fills, plus one darker same-hue shadow shape with hard edges (no gradients) and small white highlight shapes. | medium-high (no outlines), medium (shading) | [B] |
| Duolingo | Duo | Construction | A compact rounded body in Feather Green #58CC02 with a lighter belly (Mask Green #89E219); two large white circular eyes with dark pupils and white highlight dots; orange (Fox-ish) rounded-triangle beak and feet; ear tufts on top; short rounded wings used as hands | medium-high | [B] |
| Duolingo | Rebrand | History | The 2019 rebrand introduced Feather Bold and the simplified, geometric Duo and illustration system; the World Characters arrived around 2020–2021 | medium | [B] |
| Duolingo | Cast | Looks | Lily: purple hair and hoodie, half-lidded eyes; Lin: undercut; Lucy: elderly, gray hair; Falstaff: bear; Eddy: muscular, headband; Oscar: mustache, scarf/beret style. Vikram's role is uncertain. | low-medium | [B] |
| Duolingo | Motion | Duo personality | Duo bounces, waves and reacts. The "unhinged" Duo is mostly marketing and social media (TikTok); in-app Duo stays cheerleader-like with an occasional guilt-trip (e.g. a sad or crying Duo on streak loss). | medium | [B] |
| Kakao | Brand | Kakao yellow | #FEE500 (Kakao Login button fill; label black ~85%) | high | [B] |
| Kakao Friends | Style | Drawing | Simple round silhouettes, small dot or bean eyes, minimal features, flat fills; emoticons use dark outlines; Ryan: yellow-tan with brown eyebrows and round ears; Apeach: pink with a peach cleft; Muzi: white rabbit suit over a yellow radish; Con: small green crocodile; Tube: yellow duck; Jay-G: brown mole in sunglasses | medium | [B] |
| QQ Show | Membership | Red Diamond | 红钻 ("Red Diamond") is the paid QQ Show VIP tier; the item store sorts by hair, tops, bottoms, shoes, accessories, background, expression, sets | high (红钻), low (categories) | [B] |
| ZEPETO | Currency / shop | Labels | Two currencies: ZEM (premium) and Coins; user-made items via ZEPETO Studio; shop categories for hair, tops, bottoms, shoes, accessories, sets, makeup, poses | high (ZEM/Coins/Studio), low (category list) | [B] |
| Widgetable | Art | Style | Flat 2D kawaii illustrations with soft pastel backgrounds in the widget | low | [B] |

---

## Gaps

These are UNKNOWN after 26 searches. They need either more searches or a manual screenshot pass on device.

1. **Official button spec.** design.duolingo.com never surfaced a button page in the snippets. The only button spec is a third-party extraction (open-design.ai). Shade hexes for non-green buttons, label casing, font size, height and secondary or disabled styles are all unverified.
2. **Dark mode tokens.** The hexes come only from an unrelated GitHub project. No official Duolingo source was found.
3. **Typography scale.** Font sizes, weights and line-heights are UNKNOWN, as is the exact web font family name.
4. **Illustration details.** No snippet stated the "no outlines" rule, the in-shape shading or highlight construction, or character proportions. The steps in https://blog.duolingo.com/how-to-draw-duo-the-owl were not seen.
5. **Character facts.** Vikram's identity and role, and Junior's age and looks, are UNKNOWN. Looks for all characters are unverified.
6. **Duo motion rules.** No official in-app animation or personality spec beyond Rive, visemes and the streak "power up" concept.
7. **Friend Streak strings.** "Start a Friend Streak", "x day Friend Streak", the invite, accept and ended texts, milestone screens (7/30/100/365) and nudge message texts were all not found.
8. **Friends Quest card.** Card copy, quest goal strings, the progress-bar visual and the nudge or gift button labels were not found.
9. **Quests screen.** Layout, daily quest exact strings and the chest/reward visuals were not found.
10. **Streak copy.** The streak-at-risk push copy, Streak Freeze shop copy and price, and flame color progression by milestone were not found.
11. **Lesson complete.** The "Lesson complete!" copy and stat-card labels were not found in any source.
12. **Haptics and sound.** Nothing was searched successfully.
13. **Widgetable.** Exact status copy ("Your pet is hungry" etc.), pet level and growth rules, art style and the widget layout are UNKNOWN. The species list comes from one third-party source.
14. **Pengu.** Needs and meters, exact copy, art style (2D or 3D) and the widget layout are UNKNOWN.
15. **Kakao Friends.** Official hex colors and official drawing rules are UNKNOWN.
16. **QQ Show and ZEPETO.** Shop category labels and tab names are UNKNOWN. Note that Super QQ Show shut down on Aug 11, 2026.

### Leads (URLs seen, contents not read)

- design.duolingo.com:
  - https://design.duolingo.com/illustration
  - https://design.duolingo.com/illustration/characters
  - https://design.duolingo.com/illustration/duo
  - https://design.duolingo.com/writing/voice
  - https://design.duolingo.com/writing/duo
  - https://design.duolingo.com/writing/brand-narrative
  - https://design.duolingo.com/marketing/assets
- blog.duolingo.com:
  - https://blog.duolingo.com/shape-language-duolingos-art-style/
  - https://blog.duolingo.com/how-to-draw-duo-the-owl
  - https://blog.duolingo.com/streak-milestone-design-animation/
  - https://blog.duolingo.com/world-character-visemes
  - https://blog.duolingo.com/product-lessons-friend-streak/
  - https://blog.duolingo.com/friends-quests/
  - https://blog.duolingo.com/improving-the-streak
- Other Duolingo leads:
  - https://duolingo.fandom.com/wiki/Shop/Streak_freeze
  - https://duolingo.fandom.com/wiki/Energy
  - https://duolingoguides.com/duolingo-friend-streak-nudge-messages/
  - https://screensdesign.com/apps/duolingo-language-lessons/
  - https://www.lazyweb.com/canvas/flows/duolingo/start-lesson
  - https://making.duolingo.com/how-streaks-keep-duolingo-learners-committed-to-their-language-goals
- Pengu: https://apps.apple.com/app/id6462927800
