# Dossier 20: Shared pets, mascots, group streaks and care loops (Finch, PicPet, Snepet, Duolingo widget, Apple Activity, Tamagotchi Uni, Neko Atsume, Pixel Pals, Pou, Habitica, Forest, Snapchat Bitmoji pets)

Compiled 2026-10-07. Tool: WebSearch only. **24 of 24 allowed searches were used** (the log is at the end). No page was opened directly, because curl and WebFetch are blocked by policy and were not worked around.

This file extends `research/14-duolingo-mascot-exact.md`. It does not repeat file 14's Duolingo design system, push copy, Friend Streak, Friends Quest, Widgetable, Pengu, Kakao, QQ Show or ZEPETO rows. Snapchat streak hourglass and Group Streak rules are already in `11-bereal-snap-instants-exact.md` §3.2 and are not repeated either.

## How to read this file

- **What a row is.** Every verified row comes from a WebSearch result summary and its result URLs, not from the full page. A summary does not always say which URL a sentence came from. In those cases the Source column lists the most likely URL, or every candidate URL.
- **What "exact" means here.** Text in quotation marks is quoted as the search result returned it. Capitalization and punctuation **may differ from the live UI**. Rows marked "(paraphrase)" are the summary's wording, not a UI string. A verified string is verified as documented, not as pixel-checked on a device.
- **Tags:**
  - **[V]**: an official or primary source (help.finchcare.com, apps.apple.com, support.apple.com, blog.duolingo.com, en.wikipedia.org), or two or more independent sources that agree.
  - **[V-weak]**: one secondary source (a fan wiki, a blog, a review, an app-intelligence listing such as mwm.ai), or a summary sentence that cannot be pinned to one URL.
  - **[B]**: background knowledge, not verified this session. These rows appear **only** in the "BACKGROUND KNOWLEDGE [B]" section, each with a confidence rating.
- **CONFLICT** marks a row where sources disagree. Both values are given.
- **Rights.** Finch's names (birb, Rainbow Stones, Tree Town, Good Vibes, Mr. Prickles, Sassafras, Da Finci, Professor Oat), Tamagotchi and the Tama- names (Bandai), Neko Atsume (Hit-Point), Pou (Zakeh), Pixel Pals, Habitica, Forest (Seekrtech), Bitmoji (Snap) and Activity rings (Apple) are other companies' trademarks or copyrighted copy. This file records what the sources say. It does not clear anything for reuse. Copying names and art verbatim carries trademark and trade-dress risk, so legal review is needed before shipping.

---

## 1. Finch: Self-Care Pet (strongest new source)

Finch is the closest proven model for our pet in three ways. Growth comes only from the user's own activity. The pet never punishes. Friends interact through light "vibes" rather than chat. The official help center (help.finchcare.com) surfaced in search, so most rows here are [V].

### 1.1 Store, positioning, vocabulary

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Finch | Store | App name | "Finch: Self-Care Pet" (iOS id1528595748; Android package `com.finch.finch`) | https://apps.apple.com/us/app/finch-self-care-pet/id1528595748 ; https://play.google.com/store/apps/details?id=com.finch.finch | [V] |
| Finch | Web | Site title / tagline | "Finch - Your New Self-Care Best Friend" | https://finchcare.com/ | [V] |
| Finch | Store | Core promise | You take care of your pet "through taking care of yourself" (paraphrase); "As you care for yourself, your own virtual pet grows right alongside you." | https://apps.apple.com/us/app/finch-self-care-pet/id1528595748 ; https://finchcare.com/about-finch | [V] |
| Finch | Pet noun | Pet name | The pet is a bird, called a **"birb"** | https://apps.apple.com/us/app/finch-self-care-pet/id1528595748 ; https://dishabhatia.substack.com/p/the-self-care-bird-app-finch ; https://tvtropes.org/pmwiki/pmwiki.php/VideoGame/Finch | [V] |
| Finch | Store | After-adventure line | "your birb returns with a story to share and may discover something new" | https://apps.apple.com/us/app/finch-self-care-pet/id1528595748 | [V] |
| Finch | Store | Feature list | goal tracking, bullet journaling, guided breathing, quizzes, mood tracker | https://apps.apple.com/us/app/finch-self-care-pet/id1528595748 ; https://finchcare.com/about-finch | [V] |
| Finch | Help center | Article titles (usable as structure and FAQ copy) | "Creating Your Birb" · "Exploring the Finch Home Page" · "Going on an Adventure" · "Energy vs. Rainbow Stones" · "Creating and Completing Goals" · "Goal of the Day - Explained" · "Daily and Special Quests" · "Understanding Streaks" · "Pause Mode" · "Shops in Finch: Outfits, Travel, and More!" · "The Finch Widget" · "Adding Friends" · "Sending Good Vibes" · "Goal Buddies" · "Accountability Buddies" · "Discoveries" · "Benefits of Finch Plus" · "Our Approach to Self-Care" · "New User Guide" · "FAQs" | help.finchcare.com/hc/en-us/articles/… (IDs listed under Leads) | [V] |
| Finch | Help center | Category names | "Getting Started" · "Finch Features" · "Friends and Social" | https://help.finchcare.com/hc/en-us/categories/37934062601229-Getting-Started ; https://help.finchcare.com/hc/en-us/categories/37934152903309-Finch-Features ; https://help.finchcare.com/hc/en-us/categories/37934405521933-Friends-and-Social | [V] |

### 1.2 Growth stages

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Finch | Growth | Rule | The birb "grows up as you achieve full Energy for a day and go on an Adventure". Growth is counted in **adventure days**, not calendar days. | https://finch.fandom.com/wiki/Stages_of_Growth | [V-weak] |
| Finch | Growth | Stage names, in order | **Egg → Baby → Toddler → Child → Teen → Adult** (the wiki says "5 stages of life", meaning the five after the egg) | https://finch.fandom.com/wiki/Stages_of_Growth | [V-weak] |
| Finch | Growth | Two thresholds, confirmed by a second source | Toddler "after 7 adventure days"; adult after "a total of 67 adventure days" | https://finch.fandom.com/wiki/Stages_of_Growth ; https://parental-control.flashget.com/finch-app-is-this-digital-pet-and-productivity-app-worth-it | [V] |
| Finch | Growth | Egg colors (choice at start) | Blue, Orange, Pink, Green, Purple, Gray | https://finch.fandom.com/wiki/Stages_of_Growth | [V-weak] |
| Finch | Growth | Baby | Lasts 7 adventure days; **15** energy to adventure; an adventure lasts ~8 hours | same as above | [V-weak] |
| Finch | Growth | Toddler | Starts after 7 adventures; lasts 15; **20** energy; ~7 hours | same as above | [V-weak] |
| Finch | Growth | Child | Starts after 22 adventures; lasts 20; **25** energy; ~6 hours | same as above | [V-weak] |
| Finch | Growth | Teen | Starts after 42 adventures; lasts 25; **30** energy; ~6 hours | same as above | [V-weak] |
| Finch | Growth | Adult | Starts after 67 adventures; "the final stage of growth"; **35** energy; ~6 hours | same as above | [V-weak] |
| Finch | Growth | CONFLICT on energy | One review says the birb adventures "once you have collected 25 energy points". The wiki's per-stage costs (15–35) suggest 25 is only the Child value. | https://parental-control.flashget.com/finch-app-is-this-digital-pet-and-productivity-app-worth-it vs https://finch.fandom.com/wiki/Stages_of_Growth | [V-weak] |

### 1.3 Energy, adventures, home screen

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Finch | Energy | Definition | Energy is earned "by completing goals and doing self-care activities" and is used "to energize your birb so it can go on adventures" | https://help.finchcare.com/hc/en-us/articles/37780134479757-Energy-vs-Rainbow-Stones | [V] |
| Finch | Adventure | Return | "Once your birb is done adventuring, they will share a short story about their day." | https://help.finchcare.com/hc/en-us/articles/37779979512845-Going-on-an-Adventure | [V] |
| Finch | Adventure | Reflection chat | After an adventure, "a conversation is started between the pet and the user", letting the user reflect and "develop their birb's personality" (paraphrase) | https://tvtropes.org/pmwiki/pmwiki.php/VideoGame/Finch ; https://www.hercampus.com/?p=1717857 | [V-weak] |
| Finch | Adventure | Rest | The birb goes on daily adventures and "returns home so they can rest up for their next big adventure" (paraphrase) | same result set as above | [V-weak] |
| Finch | Home | Top-left control | A **"Menu Button"** "in the upper left-hand corner" opens settings and other features "such as Self Care areas and activities" | https://help.finchcare.com/hc/en-us/articles/37780000231309-Exploring-the-Finch-Home-Page | [V] |
| Finch | Home | Goals list | **"Daily Goals"**: the day's to-do list, completed "to energize your birb" | same as above | [V] |
| Finch | Home | Adventure button | An **"Adventure Button"** "becomes available after you fully energize your birb" | same as above | [V] |
| Finch | Home | Post-adventure | Option to chat with your birb "after its daily adventure" | same as above | [V] |

### 1.4 Currency and shops (dress-up)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Finch | Currency | Name | **"Rainbow Stones"** | https://help.finchcare.com/hc/en-us/articles/37780134479757-Energy-vs-Rainbow-Stones ; https://finch.fandom.com/wiki/Rainbow_Stones | [V] |
| Finch | Currency | Sources (official) | "a special in-game currency earned by completing certain quests, seasonal event days, milestone achievements, or by completing goals **after your birb has returned from its daily adventure**" | https://help.finchcare.com/hc/en-us/articles/37780134479757-Energy-vs-Rainbow-Stones | [V] |
| Finch | Currency | Daily free box | Stones also come from "claiming the free box in the store every day" | https://www.internetmatters.org/advice/apps-and-platforms/wellbeing/finch/ (result set) | [V-weak] |
| Finch | Currency | Login streak rewards | Rewards for consecutive-day logins, previewed "at different milestones like 7 days and 14 days" | same result set as above | [V-weak] |
| Finch | Currency | Uses | Clothes, furniture and other customization items; also "color dye" | https://help.finchcare.com/hc/en-us/articles/37780134479757-Energy-vs-Rainbow-Stones ; https://waltonian.eastern.edu/ae/the-art-of-finch/ | [V] |
| Finch | Shop | Inclusive items | Items include "pride flags and mobility canes" | https://waltonian.eastern.edu/ae/the-art-of-finch/ or https://cellphoneplans.androidauthority.com/CellPhones/Guides/finch-self-care-app-review (same result set) | [V-weak] |
| Finch | Shop | Outfit shop name and keeper | **"Mr. Prickles' Shop"** sells outfits for Rainbow Stones | https://help.finchcare.com/hc/en-us/articles/37935977276813-Shops-in-Finch-Outfits-Travel-and-More | [V] |
| Finch | Shop | Path to outfits | Tap the **"Shop"** icon, then the **"Outfit"** button | same as above | [V] |
| Finch | Shop | Travel shop name and keeper | **"Travel with Sass"**, run by **"Sassafras, the adventurous travel agent"** | same as above | [V] |
| Finch | Travel | Rules | "Your birb's first flight is free when you unlock the Travel Agency"; each location takes "50 adventure days to fully complete" | same as above | [V] |
| Finch | Dye shop | Name and keeper | **"The Color Studio"**, owned by **"Da Finci"** | https://finch.fandom.com/wiki/The_Color_Studio ; https://finch.fandom.com/wiki/Da_Finci | [V-weak] |
| Finch | Dye shop | Body parts and counts | 235 dye bottles, each one color for one body part: Headpatch (38), Cheeks (32), Beak (24), Body (36), Wings (39), Belly (32), Feet (34). Dye access depends on growth stage. | https://finch.fandom.com/wiki/The_Color_Studio ; https://finch.fandom.com/wiki/Colors | [V-weak] |

### 1.5 Friends: Good Vibes, Tree Town, buddies

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Finch | Friends | Tab contents (official) | The Friends section lets you "invite or add friends via friend code, send good vibes, view friends' progress, and track shared goals" | https://help.finchcare.com/hc/en-us/articles/37780316582413-Adding-Friends ; https://help.finchcare.com/hc/en-us/articles/37780000231309-Exploring-the-Finch-Home-Page | [V] |
| Finch | Friends | Add flow | Enter a **friend code** in the friends section, send a request, and once it is accepted you have "a new self-care buddy" | https://www.lemon8-app.com/@brandolphin/7434604044741575223 (result set) + help center above | [V] (friend code) / [V-weak] (quoted phrase) |
| Finch | Good Vibes | Definition | "Good Vibes are little encouraging messages you can send to friends you've added in Finch" | https://help.finchcare.com/hc/en-us/articles/37780369483533-Sending-Good-Vibes | [V] |
| Finch | Good Vibes | Types | "hugs, high-fives, and thoughts" | same as above | [V] |
| Finch | Good Vibes | User description | "Sometimes it's a hug! Sometimes it's good morning or good night!" | https://chiltonm.bearblog.dev/everyone-i-know-is-addicted-to-the-bird-app/ | [V-weak] |
| Finch | Visits | Copy | You can send your "birb" over "for a visit to give a high-five, wish someone sweet dreams or just wave hello" | same result set as above (bearblog, rubiconline, hercampus) | [V-weak] |
| Finch | Tree Town | Concept | A "tree town" where friends send positive actions "such as a virtual hug or high-five"; you "invite a friend to your tree town" and "see how their pet grows" (paraphrase) | https://www.rubiconline.com/?p=90421 or https://www.hercampus.com/?p=1717857 (same result set) | [V-weak] |
| Finch | Friends tab | Tree placement | Friends see your goal "under their tree on the Friends tab and on your profile page" | https://help.finchcare.com/hc/en-us/articles/37936388919693-Goal-Buddies | [V] |
| Finch | Goal Buddies | Copy | "Goal Buddies lets you and a friend team up to work on the same daily goal together. You'll both be able to see each other's progress and encourage each other along the way!" | same as above | [V] |
| Finch | Accountability Buddies | Rule | "only one of you will display the goal on your homepage while the other offers encouragement from the sidelines" | https://help.finchcare.com/hc/en-us/articles/37943772406413-Accountability-Buddies | [V] |
| Finch | Gifting | Lead | A "Gifting FAQ" page exists. Its contents were not shown. | https://befinch.notion.site/Gifting-FAQ-f793624024e44345baaefb2e8281b597 | [V] (existence) |

### 1.6 Streaks, pause, widget, push

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Finch | Streak | Intro copy | "Streaks are a fun way to celebrate consistency and keep your self-care momentum going!" | https://help.finchcare.com/hc/en-us/articles/37780736136205-Understanding-Streaks | [V] |
| Finch | Streak | Rule copy | "Your streak is counted each day you open the Finch app - just checking in is enough!" | same as above | [V] |
| Finch | Pause | Feature name and place | **"Pause Mode"**, from the Settings page | https://help.finchcare.com/hc/en-us/articles/37936144770701-Pause-Mode | [V] |
| Finch | Pause | Copy | "While paused, your streak will be safely frozen and won't be affected by your time away." | same as above | [V] |
| Finch | Widget | Name | "The Finch Widget" | https://help.finchcare.com/hc/en-us/articles/39758423780621-The-Finch-Widget | [V] |
| Finch | Widget | Function copy | Lets you "peek at your birb" to see "what it's currently up to without opening the app"; "an extra reminder to check in with your birb" | same as above | [V] |
| Finch | Push | Style | "push notifications with affirmations" (no exact copy found) | https://eatproteins.com/finch-review/ (result set) | [V-weak] |
| Finch | Push | Exact copy | UNKNOWN. A push-flow gallery exists as a lead (see Leads). | https://gallery.reteno.com/flows/push-notifications-finch | — |

### 1.7 Micropets (second-tier pets)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Finch | Micropets | Definition | "companions your Finch can own to accompany them on their adventures" | https://finch.fandom.com/wiki/Micropets | [V-weak] |
| Finch | Micropets | Path | Tap the **Bag Button**, then the **Micropets** button, to reach **"Micropet Playland"**: "a grassy area with your birb and ten of your micropets" | https://finch.fandom.com/wiki/Micropet_Playland | [V-weak] |
| Finch | Micropets | Hatch rule | A micropet egg is linked to a goal through **"Professor Oat"**. After the goal is completed 7 times, a random micropet hatches. The baby becomes an adult after 7 adventures. | https://finch.fandom.com/wiki/Micropets ; https://finch.fandom.com/wiki/Professor_Oat's_Lab | [V-weak] |
| Finch | Micropets | Count and name pattern | 66 micropets, e.g. "Boopty the Spoopty", "Misty the Flamingo" (pattern: name + "the" + species) | https://finch.fandom.com/wiki/Micropets | [V-weak] |

---

## 2. PicPet (direct competitor: a shared pet fed by group photos)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| PicPet | Store | Identity | "PicPet" by O3O Labs Inc.; first released August 4, 2025; iOS id6742077014; an a16z speedrun company | https://apps.apple.com/py/app/picpet/id6742077014 ; https://mwm.ai/apps/picpet/6742077014 ; https://speedrun.a16z.com/companies/picpet | [V] (name, App Store id, a16z listing) / [V-weak] (publisher, date) |
| PicPet | Store | Pitch | "raise a virtual pet with your inner circle by turning daily photo dumps into treats that level up your shared pet and unlock aesthetic rewards" | https://mwm.ai/apps/picpet/6742077014 ; https://spark.mwm.ai/en/apps/id/6742077014 | [V-weak] |
| PicPet | Onboarding | Minimum group | "You need at least one friend to start." | same result set as above | [V-weak] |
| PicPet | Store | Framing | Staying in touch should "feel like a game rather than a chore"; "share unfiltered moments to keep your pet growing without the pressure of social media perfection" | same result set as above | [V-weak] |
| PicPet | Economy | Coins | "Every time you feed your pet, you earn coins that you can use to unlock new pets, decorations, and fun stuff"; "stack coins with every picture" | same result set as above | [V-weak] |
| PicPet | Shared room | Customization | "customize your shared room to create a digital aesthetic that is uniquely yours" | same result set as above | [V-weak] |
| PicPet | Traction | Stats at search time | 623K downloads; 4.8/5 rating | https://mwm.ai/apps/picpet/6742077014 | [V-weak] |
| PicPet | Support | Lead | A Notion support site exists: "Welcome to PicPet Support" | https://octagonal-cougar-ce1.notion.site/Welcome-to-PicPet-Support-1ae6c635a8ba802ba955f06f89e35836 | [V] (existence) |
| PicPet | Exact UI copy, art style, streak or neglect rules, push copy | — | UNKNOWN | — | — |

## 3. Snepet / "Snapet" (group co-raising with chat)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Snepet | Store | Identity | Publisher Injoy Game Limited; released December 11, 2025; category Social Networking; 34.7 MB; iOS id6755604022. CONFLICT: the summary says "Snepet" but the URL slug is "snapet". | https://mwm.ai/apps/snapet/6755604022 | [V-weak] |
| Snepet | Store | Pitch | "adopt virtual pets with unique personalities and backstories, create pet-raising groups to chat in real time, and team up with friends to feed, play with, and check in on their pets" | same as above | [V-weak] |
| Snepet | Growth | Copy | "daily growth points" level the pet up and unlock "new breeds, custom decorations, and exclusive features"; "Pets grow from cubs to companions" | same as above | [V-weak] |

---

## 4. Duolingo widget (only what file 14 lacks)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Duolingo | Widget | Concept copy | The redesigned widget features "Duo who will cheer you on as you make progress and start to stress out the less you practice" | https://blog.duolingo.com/widget-feature ; https://blog.duolingo.com/duolingo-widget-feature/ | [V] |
| Duolingo | Widget | State logic | "As long as the streak is not extended, Duo increasingly panics"; once a lesson extends the streak, "Duo looks relaxed and cheerful" (paraphrase) | same as above | [V] |
| Duolingo | Push | Escalation | Pushes "get progressively more desperate the longer you ignore them" | same result set (androidauthority / gulftoday) | [V-weak] |
| Duolingo | Live Activity | Streak Live Activity | UNKNOWN (no result) | — | — |

## 5. Apple Fitness: Activity sharing and competitions (group motivation)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Apple Activity | Competition | Purpose copy | "stay motivated with a little healthy competition" | https://support.apple.com/guide/watch/apd68a69f5c7 | [V] |
| Apple Activity | Competition | Scoring | Points are "based on the percentage of your Activity Rings that you close"; one point per percent | https://support.apple.com/guide/watch/apd68a69f5c7 ; https://www.macworld.com/article/673405/how-to-set-up-and-win-apple-watch-competitions.html | [V] |
| Apple Activity | Competition | Length and cap | 7 days; up to **600 points a day**; maximum **4,200** for the week | same as above ; https://www.imore.com/how-activity-competitions-work-watchos-5 | [V] |
| Apple Activity | Competition | Start flow | Sharing must already be on → Activity app → tap a friend's name → scroll down → tap **"Compete"** → tap **"Invite [your friend's name]"** → wait for the friend to accept | https://support.apple.com/guide/watch/apd68a69f5c7 | [V] |
| Apple Activity | Competition | In-progress alerts | Alerts "tell you if you're ahead of or falling behind your competitor—along with the score" | same as above | [V] |
| Apple Activity | Competition | Awards | The winner gets a badge, and **both** players get a participation badge | https://www.macworld.com/article/673405/how-to-set-up-and-win-apple-watch-competitions.html ; https://www.cultofmac.com/?p=606710 | [V-weak] |

## 6. Tamagotchi Uni (growth stages, "Tama" naming)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Tamagotchi Uni | Growth | Stages | egg → baby → child → teenager → adult | https://tamagotchi.fandom.com/wiki/Adult_Stage (result set) | [V-weak] |
| Tamagotchi Uni | Care | Meters | discipline meter, hunger meter, happy meter | same result set as above | [V-weak] |
| Tamagotchi Uni | Online | World name | **"Tamaverse"**, "the metaverse of the Tamagotchi world"; ages "6 and up" | https://thetoyinsider.com/tamagotchi-uni-launch/ ; https://toybook.com/?p=603786 (same result set) | [V-weak] |
| Tamagotchi Uni | Online | Areas | "Tama Arena, Tama Parties, Tama Fashion, and Tama Travel" | same as above | [V-weak] |
| Tamagotchi Uni | Economy | Currency and shop | **"Gotchi points"** to "order food delivery, go shopping at the **Tama Mall**" | same as above | [V-weak] |
| Tamagotchi Uni | Social | Wi-Fi actions | "exchanging items, creating accessories, and sharing recipes with friends"; "share your UniTama's style" | same as above | [V-weak] |

## 7. Neko Atsume and Neko Atsume 2 (low-pressure collecting)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Neko Atsume | Currency | Names | Cats leave silver or gold "niboshi" (dried sardines), called **"fish"** in English; spent on food, goods, remodels and yard extensions | https://en.wikipedia.org/wiki/Neko_Atsume | [V] |
| Neko Atsume 2 | Currency | Tiers | **"silver fish"** and **"gold fish"**; in 2, silver fish can also expand the yard | https://www.siliconera.com/how-to-get-gold-fish-in-neko-atsume-2/ | [V-weak] |
| Neko Atsume | Gifts | Collectibles | Cats may leave **"mementos"**; "the more times a cat plays in your Yard, the more likely" it gives one | https://nekoatsume.fandom.com/wiki/Game_Menu (result set) | [V-weak] |
| Neko Atsume | Collection | Book name | **"Catbook"**: each visiting cat's title, look, favourite toys and mementos | same result set as above | [V-weak] |
| Neko Atsume | Shop | Section name | **"Shop Goodies"**: buy Food and Goodies with fish; exchange silver ↔ gold fish | https://nekoatsume.fandom.com/wiki/Game_Menu | [V-weak] |
| Neko Atsume 2 | Store | Lead | App Store id6499131935 | https://apps.apple.com/app/id6499131935 | [V] (existence) |

## 8. Pixel Pals (Dynamic Island / Live Activity pet)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Pixel Pals | Store | Name | "Pixel Pals Widget Pet Game" (id6443919232), by Christian Selig; spun off from Apollo | https://apps.apple.com/ca/app/id6443919232 ; https://techcrunch.com/2023/09/22/pixepixel-pals-delivers-a-cute-and-clever-update-that-takes-advantage-of-new-ios-features ; https://fueled.com/blog/pixel-pals/ | [V] |
| Pixel Pals | Live Activity | Placement | Pets "live around the Dynamic Island, on your Home Screen, and on your Lock Screen", running as a Live Activity with an animated glyph around the Island | https://digitaltrends.com/?p=3219739 ; https://techcrunch.com/2023/09/22/… | [V] |
| Pixel Pals | Live Activity | Interaction | Hold on the Live Activity to feed or play | same result set as above | [V-weak] |
| Pixel Pals | Pet card | Stats | Tapping a pal shows its **age, weight, and six hearts** that fill as the relationship grows through feeding and games | same result set as above | [V-weak] |
| Pixel Pals | Widgets (2.0) | Minigames and social | Interactive widgets with minigames "PixelQuest, 2048, and Eternal Scroll"; add friends, see their Pixel Pals on your home screen, "and even fight them" | https://techcrunch.com/2023/09/22/… | [V-weak] |

## 9. Pou (care rooms and meters)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Pou | Store | Identity | "Pou" by Zakeh (iOS id575154654); "a friendly alien pet" you "feed, clean, play with, and care for" | https://apps.apple.com/app/575154654 ; https://mwm.ai/apps/pou/575154654 ; https://screenwiseapp.com/media/pou-app | [V] (name, developer) / [V-weak] (quoted phrases) |
| Pou | Rooms | Room → action | **Kitchen** (eat, replenish), **Game Room** (mini-games, raise Fun, earn coins), **Bedroom** (rest, regain energy), **Laboratory** (potions; the summary also says cleaning and treating illness, see CONFLICT) | https://bitcoinworld.co.in/pou-virtual-pet-guide/ (result set) | [V-weak] |
| Pou | Meters | Names | CONFLICT: "Food, Health, Fun, and Energy" vs "energy, hunger, and cleanliness" in the same result set | same as above | [V-weak] |
| Pou | Economy | Coins and XP | Care earns coins and XP to level up and unlock items | same as above | [V-weak] |
| Pou | Dress-up | Items | outfits, hats, eyeglasses, and the wallpaper of each room | same as above | [V-weak] |

## 10. Habitica (party accountability)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Habitica | Party quest | Group penalty | In harder quests, "missed Dailies will cause higher amounts of damage to the group"; a Healer in the party is "highly recommended" | https://habitica.fandom.com/wiki/The_Dolphin_of_Doubt (result set) | [V-weak] |
| Habitica | Pets | Pipeline | **Eggs** + **Hatching Potions** → pets; feed pets → **Mounts** | https://habitica.fandom.com/wiki/Brazen_Beetle_Battle (result set) | [V-weak] |
| Habitica | Shop | Prices | Extra eggs in the **Market** for 3 Gems each; quest scrolls in the **Quest Shop** for 4 Gems | same result set as above | [V-weak] |
| Habitica | Currency | Two tiers | **Gold** (earned from tasks; buys Rewards) and **Gems** | same result set as above | [V-weak] |
| Habitica | Quest names | Title style (pun on a vice) | "The Serpent of Distraction", "The Dolphin of Doubt", "The Guinea Pig Gang", "Brazen Beetle Battle", "Waffling with the Fool: Disaster Breakfast!", "What a Hippo-Crite" | habitica.fandom.com page titles in the result set | [V-weak] |

## 11. Forest (group focus; the anti-pattern)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Forest | Core loop | Rule | Plant a virtual tree at the start of a timed session; the tree **withers** if you open another app before the timer ends | https://en.wikipedia.org/wiki/Forest_(application) ; https://desirabilitylab.com/posts/forest | [V] |
| Forest | Economy | Coins | Coins from completed sessions unlock tree species, soundscapes and other items, or fund real-tree planting | https://en.wikipedia.org/wiki/Forest_(application) | [V] |
| Forest | Group mode | Rule | **"Plant together"**: plant a tree with friends, "and if anyone uses their phone, everyone's tree will die" | https://en.wikipedia.org/wiki/Forest_(application) (result set) | [V-weak] |
| Forest | Group mode | Join | Sessions have room codes and join links | https://top.gg/ar/bot/1387792853236842576 | [V-weak] |
| Forest | Collab | Example | TinyTAN (BTS) trees | https://www.bandwagon.asia/articles/seekrtech-forest-tinytan-trees-bts-how-to-download-productivity-app | [V-weak] |

## 12. Snapchat Bitmoji pets (photo-to-pet creation)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Snapchat | Snapchat+ perk | Prompt copy | Subscribers are prompted to **"add real or imaginary Bitmoji pets to the map"** (Jan 2024) | https://www.socialmediatoday.com/news/snapchat-adds-generative-ai-pets-snapchat-subscribers/705215/ ; https://yourstory.com/2024/01/snapchat-plus-ai-bitmoji-pets-revolution | [V] |
| Snapchat | Creation flow | Steps | Snap a photo of your pet → AI makes a cartoon avatar → choose from "a few different variations" | https://www.engadget.com/snapchats-latest-paid-perk-is-an-ai-bitmoji-of-your-pet-235027028.html ; socialmediatoday (above) | [V] |
| Snapchat | Placement | Where it shows | The pet appears next to the user's Bitmoji on Snap Map and in chat conversations | https://smallbiztrends.com/snapchat-adds-new-personalization-features-for-all-users/ (result set) | [V-weak] |
| Snapchat | Customization | Depth | "considerably less than what you can do with your own human-inspired Bitmoji" | https://www.engadget.com/… (above) | [V-weak] |

---

## BACKGROUND KNOWLEDGE [B]

Not verified this session. Confidence is given per row. Never treat these as source-confirmed, and never move them into the tables above without a source.

| App | Surface | Element | Value (from memory) | Confidence | Tag |
|---|---|---|---|---|---|
| Finch | Pet welfare | No death | The birb never dies, gets sick or runs away. A missed day only means no adventure that day; the tone stays warm. | high | [B] |
| Finch | Onboarding | Name and pronouns | You name the birb and choose its pronouns (he / she / they) when it hatches | medium | [B] |
| Finch | Art | Style | 2D flat vector, soft pastel palette, a small round birb with simple dot eyes; cozy illustrated house interiors; outfits layer onto the birb sprite. No heavy black outlines. | medium | [B] |
| Finch | Home | Layout | The birb in its house fills the top half; an energy progress bar sits above a scrolling goals list in a bottom sheet; tapping a goal checks it off with a small energy pop | low-medium | [B] |
| Finch | Adventure | Return dialogue | The birb's story arrives as chat bubbles in the birb's voice, then asks a reflection question with tappable answer chips | medium | [B] |
| Finch | Tree Town | Visual | Friends' birbs appear around a shared tree; tapping one opens the Good Vibes picker | low-medium | [B] |
| Finch | Monetization | Finch Plus | Paid tier that unlocks more items and features; roughly $70/year in the US | low | [B] |
| Duolingo | Widget | Duo states | The widget art moves through happy → worried → frantic/melting states as the evening passes without a lesson, beside the streak count and flame | medium | [B] |
| Duolingo | Live Activity | Streak countdown | An iOS Live Activity / Lock Screen countdown to the end of the streak day was tested | low | [B] |
| Apple Activity | Rings | Order and meaning | Three concentric rings: Move (outer, red/pink), Exercise (middle, green), Stand (inner, blue) | high | [B] |
| Apple Activity | Rings | Hex values | Community-extracted, not official: Move ~#FA114F, Exercise ~#92E82A (or #A6FF00), Stand ~#1EEAEF | low | [B] |
| Apple Activity | Sharing tab | Layout | A list of friends, each with mini rings and today's totals; tapping a friend opens their detail with Compete and Mute options | high (list) / medium (options) | [B] |
| Apple Activity | Celebration | Motion and haptics | When a ring closes, the ring spins and sparks or fireworks animate, with a haptic tap on the Watch | high | [B] |
| Apple Activity | Social | Reply | You can reply to a friend's achievement with a message from the Sharing detail (the "smack talk" pattern) | medium | [B] |
| Tamagotchi (classic) | Care menu | Icons | Eight icons: Food (Meal / Snack), Lights, Game, Medicine, Toilet (duck), Status (meter), Discipline, Attention call | high | [B] |
| Tamagotchi (classic) | Status | Meters | Hunger and Happy shown as 4 hearts each, plus Age and Weight screens | high | [B] |
| Tamagotchi (classic) | Death | Ending | Neglect leads to death, shown as an angel or ghost; later models say it "returned to its home planet". This is the opposite of our no-death rule. | high | [B] |
| Tamagotchi Uni | Hardware | Screen | A color LCD on a watch-style band, with Wi-Fi | medium-high | [B] |
| Neko Atsume | Studio | Developer | Hit-Point (Japan) | high | [B] |
| Neko Atsume | Art | Style | Hand-drawn 2D cats with thin dark outlines on a muted, warm, paper-like palette | medium | [B] |
| Neko Atsume | Loop | Pressure | The only need is refilling the food bowl. Cats come and go on their own and never die. You return to see who visited. | high | [B] |
| Neko Atsume | Cats | Named rare cats | e.g. Tubbs, Xerxes IX, Lady Meow-Meow | high | [B] |
| Pou | Art | Style | A brown, potato-shaped 2D blob with big eyes and no limbs | high | [B] |
| Pou | Rooms | Extra rooms | A Bathroom (soap and shower for cleaning) also exists; the Bedroom lamp is switched off to make Pou sleep | high (Bathroom) / high (lamp) | [B] |
| Pou | HUD | Meters | Four status icons along the top: food, health, energy, fun | medium | [B] |
| Pixel Pals | Art | Style | Pixel art pets (cat, dog, frog and others) walking along the edge of the Dynamic Island pill | medium | [B] |
| Habitica | Art | Style | 16-bit pixel-art RPG avatars, pets and mounts | high | [B] |
| Habitica | Party | Damage timing | At "cron" (day rollover), the quest boss damages every party member for each Daily any member left undone | high | [B] |
| Habitica | Party | Pause | "Rest in the Inn" pauses your Dailies and stops your damage to the party | high | [B] |
| Habitica | Party | Size | A party holds up to 30 members | medium | [B] |
| Habitica | Achievements | Streak | A "Streak" achievement is awarded for completing a Daily 21 days in a row | medium-high | [B] |
| Habitica | Brand | Purple | Brand purple around #6133B4 or #432874 | low | [B] |
| Forest | UI | Timer screen | A large circular timer with a sapling in the middle; a green "Plant" button; a "Give up" option during a session; dead trees show as brown and withered in the forest view | medium | [B] |
| Forest | Real trees | Partner | Real trees are planted through "Trees for the Future" | medium | [B] |
| Forest | Plant Together | Size | Rooms hold dozens of people (around 40) | low | [B] |
| My Tamagotchi Forever | App | Concept | Bandai Namco's 2018 mobile Tamagotchi: care actions grow a town ("Tamatown") | medium | [B] |

---

## Recommended additions to the source list

Each line names a source, the surface of ours it informs, what to copy, and why. Only verified rows ([V] / [V-weak]) are cited as "copy". Anything resting on [B] says so.

| Source | Our surface | What exactly to copy | Why this source |
|---|---|---|---|
| **Finch: growth stages** (§1.2) | §M growth | Five named stages after the egg: **Egg → Baby → Toddler → Child → Teen → Adult**. Count growth in "adventure days" (days the group hits its goal), not calendar days, with thresholds **7 / 22 / 42 / 67**. Raise the daily requirement per stage (15 / 20 / 25 / 30 / 35) [V-weak]. | Growth needs activity but never decays, which matches "no dying from neglect". Missing a day only delays growth. |
| **Finch: energy → adventure → story** (§1.3) | §M daily care; AI game master voice | Group activity fills **"Energy"**. When full, the **"Adventure Button"** unlocks. The mascot comes back and "share[s] a short story about their day", then starts a conversation [V]. | This is a ready-made slot for the AI game master: the mascot tells a story built from the group's week. |
| **Finch: Rainbow Stones rule** (§1.4) | §M earned currency | Earn currency from quests, seasonal event days and milestones, and from activity **after** the pet's daily need is met ("after your birb has returned from its daily adventure") [V]. Add a free daily box [V-weak]. | It separates "pet needs" from "shopping money", so over-achievers are rewarded without the pet growing faster. |
| **Finch: named shopkeepers** (§1.4) | §M dress-up shop | Each shop is a character with a pun name: "Mr. Prickles' Shop" (outfits), "Travel with Sass" by "Sassafras, the adventurous travel agent", "The Color Studio" by "Da Finci". Navigation is "Shop" icon → "Outfit". Dye is sold per body part (Headpatch, Cheeks, Beak, Body, Wings, Belly, Feet), gated by growth stage. | A named, cast-driven shop gives the AI game master more characters to voice. Per-part dye gives many cosmetics from one rig. |
| **Finch: Good Vibes** (§1.5) | §O social nudges; mascot as messenger | Friends send **"Good Vibes"**: "hugs, high-fives, and thoughts" [V], delivered by the pet visiting ("give a high-five, wish someone sweet dreams or just wave hello") [V-weak]. | These are low-effort, positive-only nudges that the mascot delivers. That fits "mascot is the voice of notifications" without guilt. |
| **Finch: Goal Buddies / Accountability Buddies** (§1.5) | Group streak; group goals | "team up to work on the same daily goal together"; or one person holds the goal "while the other offers encouragement from the sidelines" [V]. | A verified model for shared-goal copy and for members who cheer without posting. |
| **Finch: Pause Mode** (§1.6) | Group streak protection | "While paused, your streak will be safely frozen and won't be affected by your time away." [V] Streak rule: "just checking in is enough!" [V] | A planned break, distinct from the one warning. The copy is gentle and already written. |
| **Finch: widget** (§1.6) | §N widget | "peek at your [pet] to see what it's currently up to without opening the app" [V] | The widget shows the pet's current activity state (home, on adventure, back with a story), not only a number. |
| **Finch: micropets** (§1.7) | §M collection (later) | A second tier of small pets hatched by repeating a goal 7 times, shown in a playground of up to ten, named "<Name> the <Species>" [V-weak]. | Optional: a collectible layer per member that sits under the shared mascot. |
| **PicPet** (§2) | §M feeding input; whole product | Daily photos as "treats" that "level up your shared pet"; coins "with every picture"; a "shared room"; "You need at least one friend to start." [V-weak] | The closest competitor: a photo-fed shared pet for an "inner circle". Use it as the benchmark and to avoid copying too closely. |
| **Snepet** (§3) | §M growth copy | "daily growth points"; "Pets grow from cubs to companions" [V-weak] | A second group co-raising competitor. Its growth phrase is short and could serve as a stage subtitle. |
| **Duolingo widget** (§4) | §N widget; streak warning | Mascot expression follows the streak state: it "start[s] to stress out", "increasingly panics" until someone acts, then "looks relaxed and cheerful" [V]. | One visual warning on the widget, carried by the mascot's mood, fits "group streaks with one warning". Cap the escalation at one step to stay "no guilt". |
| **Apple Activity competitions** (§5) | Group motivation; §O | Points = percent of goal, capped per day (600/day, 4,200/week); 7-day format; "Compete" → "Invite [name]" → accept; alerts say whether you are "ahead of or falling behind ... along with the score"; a participation badge for both players [V]/[V-weak]. | Verified, plain group-competition copy and scoring that never punishes. |
| **Tamagotchi Uni** (§6) | §M stage names; world naming | Stage labels egg / baby / child / teenager / adult; the "Tama-" prefix family (Tamaverse, Tama Mall, Tama Fashion, Tama Travel); "Gotchi points" [V-weak]. | A canonical stage vocabulary. A name-prefix system works for our mascot's world. Avoid its death mechanic ([B]). |
| **Neko Atsume** (§7) | §M gifts and souvenirs; currency tiers | Two-tier currency ("silver fish" / "gold fish") with exchange; **"mementos"** left by visitors, more likely with repeat visits; a "Catbook" collection log [V]/[V-weak]. | It shows low pressure done well: return to see what came back. The mascot could bring a memento back from each adventure. |
| **Pixel Pals** (§8) | §N Live Activity / Dynamic Island | The pet lives "around the Dynamic Island", on the Lock Screen and on widgets; hold the Live Activity to feed or play; a pet card with age, weight and "six hearts" [V]/[V-weak]. | The only verified pet built for the Dynamic Island. Its card stats suit the mascot's profile sheet. |
| **Pou** (§9) | §M care actions | One room per care action (Kitchen, Game Room, Bedroom, Laboratory) and dress-up of outfits, hats, eyeglasses and room wallpaper [V-weak]. | A clear layout pattern for care actions. Its meters conflict between sources, so verify on device. |
| **Habitica** (§10) | Group streak (caution) | Group damage from missed Dailies [V-weak], and quest titles that pun on a vice ("The Dolphin of Doubt") [V-weak]. "Rest in the Inn" pause is [B]. | Shows how group accountability can turn punitive. Copy the naming and the pause idea, not the damage. |
| **Forest** (§11) | Anti-pattern reference | "if anyone uses their phone, everyone's tree will die" [V-weak]. | Documents the failure mode our spec rules out (group-wide death). Useful for explaining why the mascot does not die. |
| **Snapchat Bitmoji pets** (§12) | §M adopt / name flow | "add real or imaginary Bitmoji pets"; snap a photo → choose from AI variations [V]. | A verified photo-to-pet creation flow. The group could seed its mascot's look from a shared photo. |

### Which surfaces each source informs best (summary)

- **§M Mascot** (growth, care, currency, dress-up): Finch first, then Tamagotchi Uni (stage names), Neko Atsume (mementos, two-tier currency), Pou (care rooms), PicPet and Snepet (group framing).
- **§N Widget / Live Activity**: the Duolingo widget (mascot mood as streak state), the Finch widget (what the pet is doing now), Pixel Pals (Dynamic Island).
- **§O Notifications and mascot voice**: Finch Good Vibes and post-adventure stories, plus Apple's "ahead / behind with score" alerts. No verified push copy was found for Finch.
- **Group streak with one warning**: the Duolingo widget's escalation, Finch Pause Mode and "just checking in is enough!", and Snapchat's hourglass (file 11). Habitica and Forest are cautionary.

---

## Gaps

These are still UNKNOWN after 24 searches. They need more searches or a manual screenshot pass on a device (see `docs/CAPTURE.md`).

1. **Finch push copy.** No verbatim push notification was found. Lead: https://gallery.reteno.com/flows/push-notifications-finch
2. **Finch visuals.** No hex colors, font name, art construction rules or animation and haptic details. "The art of Finch" (waltonian.eastern.edu) was seen but not read.
3. **Finch screens.** The exact layout of the home screen, Tree Town, the Good Vibes picker, the shop grid and the adventure-return chat is UNKNOWN. Button labels other than "Menu Button", "Adventure Button", "Shop" and "Outfit" are UNKNOWN.
4. **Finch onboarding.** The "Creating Your Birb" article (naming, pronouns, egg pick) was found but its text was not shown.
5. **Finch quests.** The "Daily and Special Quests" and "Discoveries" articles were found, but not their contents.
6. **PicPet and Snepet.** In-app strings, art style, neglect or streak rules and push copy are UNKNOWN. Only listing-level copy was found.
7. **Duolingo widget.** The exact widget states and their number, any text on the widget, and the streak Live Activity are UNKNOWN.
8. **Apple Activity.** Exact notification strings ("ahead by N points" etc.), badge names and ring hexes are UNKNOWN.
9. **Tamagotchi Uni.** On-device menu labels, item category names and Tamaverse screen copy are UNKNOWN.
10. **Neko Atsume 2.** Widget existence and design, and gift-screen copy, are UNKNOWN.
11. **Pou.** Meter names conflict. Shop and closet labels are UNKNOWN.
12. **Pixel Pals.** Pet list, Live Activity layout and copy are UNKNOWN.
13. **Habitica.** Brand colors, pet-to-mount message copy and party UI strings are UNKNOWN.
14. **Forest.** Exact UI copy ("Plant", "Give up", the withered message) and the Plant Together room limit are UNKNOWN.
15. **Haptics and sound** for every source are UNKNOWN.

### Leads (URLs seen, contents not read)

- Finch help center (official):
  - https://help.finchcare.com/hc/en-us/articles/37779580853005-Creating-Your-Birb
  - https://help.finchcare.com/hc/en-us/articles/37780000231309-Exploring-the-Finch-Home-Page
  - https://help.finchcare.com/hc/en-us/articles/37779979512845-Going-on-an-Adventure
  - https://help.finchcare.com/hc/en-us/articles/37780134479757-Energy-vs-Rainbow-Stones
  - https://help.finchcare.com/hc/en-us/articles/37779940291213-Creating-and-Completing-Goals
  - https://help.finchcare.com/hc/en-us/articles/37780061122957-Goal-of-the-Day-Explained
  - https://help.finchcare.com/hc/en-us/articles/37943131828749-Daily-and-Special-Quests
  - https://help.finchcare.com/hc/en-us/articles/37780736136205-Understanding-Streaks
  - https://help.finchcare.com/hc/en-us/articles/37936144770701-Pause-Mode
  - https://help.finchcare.com/hc/en-us/articles/37935977276813-Shops-in-Finch-Outfits-Travel-and-More
  - https://help.finchcare.com/hc/en-us/articles/39758423780621-The-Finch-Widget
  - https://help.finchcare.com/hc/en-us/articles/37780316582413-Adding-Friends
  - https://help.finchcare.com/hc/en-us/articles/37780369483533-Sending-Good-Vibes
  - https://help.finchcare.com/hc/en-us/articles/37936388919693-Goal-Buddies
  - https://help.finchcare.com/hc/en-us/articles/37943772406413-Accountability-Buddies
  - https://help.finchcare.com/hc/en-us/articles/37944252634125-Discoveries
  - https://help.finchcare.com/hc/en-us/articles/37780200600589-Benefits-of-Finch-Plus
  - https://help.finchcare.com/hc/en-us/articles/42149821015693-New-User-Guide
  - https://help.finchcare.com/hc/en-us/articles/41672084300557-FAQs
- Finch fan wiki: https://finch.fandom.com/wiki/Stages_of_Growth ; …/Adventuring ; …/Energy ; …/Quests ; …/Micropets ; …/Colors ; …/The_Color_Studio ; …/Rainbow_Stones ; …/Birb ; …/Finchie_Forest ; …/Seasonal_Events ; …/2023_App_Update_Announcements
- Finch other: https://befinch.notion.site/Finch-FAQ-474652d0123d4883ac7a0cd6c8f5aa70 ; https://befinch.notion.site/Gifting-FAQ-f793624024e44345baaefb2e8281b597 ; https://gallery.reteno.com/flows/push-notifications-finch ; https://waltonian.eastern.edu/ae/the-art-of-finch/
- PicPet: https://apps.apple.com/py/app/picpet/id6742077014 ; https://octagonal-cougar-ce1.notion.site/Welcome-to-PicPet-Support-1ae6c635a8ba802ba955f06f89e35836
- Snepet: https://mwm.ai/apps/snapet/6755604022
- Duolingo: https://blog.duolingo.com/widget-feature ; https://www.push.duolingo.com/
- Apple: https://support.apple.com/guide/watch/apd68a69f5c7
- Neko Atsume 2: https://apps.apple.com/app/id6499131935 ; https://nekoatsume.fandom.com/wiki/Game_Menu
- Pixel Pals: https://apps.apple.com/ca/app/id6443919232
- Pou: https://apps.apple.com/app/575154654
- Other pet apps surfaced but not researched: "SUSH Virtual Pet Grow & Evolve" (https://apps.apple.com/app/id1622502023), "Pokipet - Raise virtual pets" (https://apps.apple.com/US/app/id6443760470)

---

## Search log (24 of 24)

1. Finch growth stages (third-party). 2. Finch friends / Good Vibes / Tree Town. 3. Finch Rainbow Stones shop (no relevant results). 4. Finch Rainbow Stones earn/shop. 5. Finch adventure notification copy (no copy found). 6. Finch App Store listing (official domains). 7. Finch help center: home, energy, Rainbow Stones. 8. Finch help center: streaks, Pause Mode, shops, Goal Buddies. 9. Finch help center: widget, Good Vibes, Accountability Buddies. 10. Tamagotchi Uni stages, meters, Tamaverse. 11. Neko Atsume currency, mementos, Catbook. 12. Pixel Pals Dynamic Island. 13. Habitica party, pets, gems. 14. Forest, Plant Together. 15. Apple Activity competitions. 16. Duolingo widget states. 17. Finch stages of growth (fan wiki). 18. Pou rooms and meters. 19. Snapchat Bitmoji pets. 20. Finch micropets and Color Studio. 21. Discovery: shared group pet apps (found PicPet, Snepet). 22. PicPet. 23. Snepet. 24. Finch push copy (no copy found; Reteno lead).
