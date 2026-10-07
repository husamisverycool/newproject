# 23: Other collectible-card apps (pack opening, rarity, duplicates, trading, serials) plus TCG Pocket gap-fill

Research date: 2026-10-07. Tool: WebSearch only, **24 calls** (all returned data). curl, WebFetch and Firecrawl were not used.
This file adds sources beyond `research/05-tcgpocket-telegram-discord-monopoly.md` and `research/13-tcg-telegram-discord-exact.md`. Facts already in those files are not repeated. Section 1 lists only **new** TCG Pocket rows.

## How to read this file

- WebSearch returns **an AI-summarised digest of snippets plus a list of URLs**. It does not say which URL each sentence came from. The "Source URL" column gives the result URL most likely to hold the fact. Quoted strings are exactly as they appeared in the digest. A digest can paraphrase UI text, so open the page or a screenshot before shipping any string.
- Tags (same as file 13):
  - **[V]**: an official first-party URL (apps.apple.com, pokemon.com, dena.com, blog/support.nbatopshot.com, hearthstone.blizzard.com) is in the result set and is the likely source, or two or more independent sites agree.
  - **[V-weak]**: one third-party site or one digest (wiki, guide site, news post).
  - **[B]**: background knowledge that was NOT verified this session. These rows appear **only** in the BACKGROUND KNOWLEDGE section near the end of the file.
- **No hex codes, font names, pixel sizes, haptic patterns or sound file names were verified for any app.** Where a colour appears in a verified row, it is a colour **name** taken from the digest (for example "orange glow"), not a code.
- The "Surface" column is the **source app's** surface. Section 11 maps each source to our §J surfaces.

---

## 1. Pokémon TCG Pocket: new rows only (gap-fill for file 13)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| TCG Pocket | App Store listing | Headline | "Enjoy Pokémon cards on mobile!" | https://apps.apple.com/us/app/pok%C3%A9mon-tcg-pocket/id6479970832 | [V] |
| TCG Pocket | App Store listing | Pack copy | "In Pokémon TCG Pocket, you can open two booster packs at no cost each day to quickly build up your collection!" | same; https://apptopia.com/ios/app/6479970832/about | [V] |
| TCG Pocket | App Store listing | Collecting copy | "Collect different kinds of Pokémon cards, like those with nostalgic illustrations from the past, as well as completely new cards exclusive to this game!" | same | [V] (digest may paraphrase) |
| TCG Pocket | App Store listing | Immersive card copy | Immersive cards have illustrations with a "3D feel". "…feel like they've leapt into the world of the card's illustration!" | same | [V] (digest may paraphrase) |
| TCG Pocket | App Store listing | Trade copy | "Use the trade feature to collect even more cards! Certain cards can be traded with friends." | same | [V] (digest may paraphrase) |
| TCG Pocket | App Store listing | Showcase copy | "Display your cards with binders or display boards, and showcase them to players around the world!" | same | [V] (digest may paraphrase) |
| TCG Pocket | Pack open (update) | Bulk open | A later update lets players "open up to **20 packs at a time** using '**Claim All**'". Before that, each pack needed its own animation sequence. | https://bulbagarden.net/threads/latest-pokemon-tcg-pocket-update-brings-a-variety-of-feature-improvements-requires-3-5gb-download.311193/ ; https://comicbook.com/gaming/news/pokemon-tcg-pocket-new-update-features/?nb=1 | [V-weak] |
| TCG Pocket | Wonder Pick (update) | Unseen marker | A "**New!**" bubble on Wonder Picks "that appeared since you last checked" | same | [V-weak] |
| TCG Pocket | Wonder Pick (Oct 30, 2025) | Tile label | "card names will now be displayed on each wonder pick". Cards from the latest expansion appear more often. | https://dena.com/intl/news/4758/ ; https://ptcgpocket.gg/ptcgp-anniversary-announcement-trading-gets-expanded-new-share-feature-revealed/ | [V] |
| TCG Pocket | Share (Oct 30, 2025) | Gift-a-card feature | A "share feature" lets you "give **♦–♦♦♦♦** rarity cards from booster packs to friends". You can send **one card to each friend each day** and receive **one card per day**. | same | [V] |
| TCG Pocket | Trade (Oct 30, 2025) | Scope | Trading expanded to cards from "even the most recent booster packs" | same | [V] |
| TCG Pocket | Gifts | Claim location | Three free Mega Rising packs "claimable in **Gifts** upon first log-in". Special missions give a "first-anniversary emblem". | https://dena.com/intl/news/4758/ ; https://pokejungle.net/2025/10/23/mega-rising-expansion-for-pokemon-tcg-pocket-revealed/ | [V] |
| TCG Pocket | Packs | Pack naming pattern | "<Set>: <Featured Pokémon>", for example "Mega Rising: Mega Gyarados", "Mega Rising: Mega Blaziken", "Mega Rising: Mega Altaria" | same | [V] |

TCG Pocket gaps from file 13 that are **still open**: literal pack-timer string, "NEW" badge on the results grid, Skip/Next labels, card-face positions, card back, My Cards sort and filter labels, trade sub-tabs and animation, Premium Pass paywall copy, UI colours and fonts. See Gaps.

---

## 2. Hearthstone (Blizzard)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Hearthstone | Open Packs screen | Screen name | "**Open Packs**" (wiki page title) | https://hearthstone.wiki.gg/wiki/Open_Packs | [V-weak] |
| Hearthstone | Open Packs screen | Layout | "unopened packs are displayed on the **left-hand side**". You "**drag a pack** over to the right-hand section or hit the **space bar** to open it". | https://hearthstone.wiki.gg/wiki/Card_packs ; https://hearthstone.wiki.gg/wiki/Open_Packs | [V-weak] |
| Hearthstone | Pack reveal | Face-down cards | "Once you open a pack, **5 cards appear face down**, and you must turn each card individually" by clicking each card or pressing space | same | [V-weak] |
| Hearthstone | Pack reveal | Hover tell (rarity glow) | Hovering a face-down card shows a glow: **no colour = Common**, **blue = Rare**, **purple = Epic**, **orange = Legendary** | https://hearthstone.wiki.gg/wiki/Card_packs ; https://hearthstone.wiki.gg/wiki/Rarity | [V-weak] (2 queries, same wiki) |
| Hearthstone | Card face | Rarity gem | Common cards show "a **white gem** located at the **bottom-center of the card's art**" and no glow during pack opening | https://hearthstone.wiki.gg/wiki/Common | [V-weak] |
| Hearthstone | Rarity colours | Origin | Quality colours are "based on World of Warcraft's gear system" | https://hearthstone.wiki.gg/wiki/Rarity | [V-weak] |
| Hearthstone | Pity timer | Legendary guarantee | "a Legendary card **every 40 packs**". "at least one legendary card in their **first 10 packs**" (since Knights of the Frozen Throne). Each expansion has its own Pity Timer. | https://hearthstone.wiki.gg/wiki/Pity_Timer ; https://esports.gg/news/hearthstone/hearthstone-pity-timer/ ; https://mein-mmo.de/hearthstone-garantierte-legendaries-nach-bestimmter-packungsmenge/ | [V] (3 sites) |
| Hearthstone | Duplicate currency | Name | "**Arcane Dust**" (also "Dust") | https://hearthstone.wiki.gg/wiki/Arcane_Dust ; https://hearthstone.blizzard.com/en-us/news/10245930 | [V] |
| Hearthstone | Duplicate currency | Verbs | "**Disenchant**" (card → dust) and "**Craft**" (dust → card). Blizzard blog title: "Hearthstone Crafting: **In Dust We Trust**". | https://hearthstone.wiki.gg/wiki/Disenchant ; https://hearthstone.wiki.gg/wiki/Craft ; https://hearthstone.blizzard.com/en-us/news/10245930 | [V] |
| Hearthstone | Dust values (regular) | Disenchant / Craft | Common 5 / 40 · Rare 20 / 100 · Epic 100 / 400 · Legendary 400 / 1,600 | same | [V] |
| Hearthstone | Dust values (golden) | Disenchant / Craft | Common 50 / 400 · Rare 100 / 800 · Epic 400 / 1,600 · Legendary 1,600 / 3,200 | same | [V] |
| Hearthstone | Card quality tiers | Names | Regular, plus three premium qualities: "**golden**", "**signature**", "**diamond**". "purely aesthetic, with no difference in gameplay". | https://hearthstone.wiki.gg/wiki/Quality ; https://esports.gg/news/hearthstone/new-hearthstone-signature-cards-explained/ | [V] |
| Hearthstone | Golden card | Look | "**animated versions of the default illustrations** and a **golden border**" | same | [V] |
| Hearthstone | Signature card | Look | "stylized **full-art** images", "different framing for every new set". March of the Lich King: "an icy sepia style". | https://esports.gg/news/hearthstone/new-hearthstone-signature-cards-explained/ ; https://www.thegamer.com/hearthstone-signature-cards/ | [V] |
| Hearthstone | Diamond card | How earned | From the Tavern Pass rewards track, "or by **collecting all Legendary cards from the set**" (Forged in the Barrens). Diamond cards are 3D. | https://www.ginx.tv/en/3d-diamond-cards-are-coming-to-hearthstone-with-forged-in-the-barrens | [V-weak] |

---

## 3. Marvel Snap (Second Dinner / Nuverse)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Marvel Snap | Card upgrade | Rarity ladder (7 levels) and frame per level | **Common**: grey border, normal art · **Uncommon**: green border, "**Frame Break**" (art extends past the frame) · **Rare**: blue border, 3D art that "pops out" · **Epic**: purple border, animated art · **Legendary**: orange/gold border, "shiny logo or nameplate" · **Ultra**: red border, "animated frame … with an energy pulse" · **Infinity**: "Splits the card into two copies and adds a visual effect" | https://upcomer.com/what-does-upgrading-cards-do-in-marvel-snap-card-upgrades-and-levels-explained/ ; https://marvelsnapzone.com/marvel-snap-progression-guide/ ; https://inverse.com/gaming/marvel-snap-more-cards-upgrade-collection-level-infinite | [V] (several sites) |
| Marvel Snap | Card upgrade | Start state | "Every single card in the game starts at the same common rarity" | same | [V] |
| Marvel Snap | Card upgrade | Currencies | "**Credits**" (shared) + "**Boosters**" (card-specific: "every single card … having individual boosters") | same | [V] |
| Marvel Snap | Card upgrade | Cost per step (credits + boosters) | Uncommon 25 + 5 · Rare 100 + 10 · Epic 200 + 20 · Legendary 300 + 30. Ultra and Infinity cost more (values not in digest). | same | [V] |
| Marvel Snap | Collection Level | Points per upgrade | Uncommon **+1**, Rare **+2**, Epic **+4**, Legendary **+6**, Ultra **+8**, Infinity **+10** | same | [V] |
| Marvel Snap | Collection Level | Purpose | Upgrading raises "**Collection Level**", which "gives new cards and various rewards" | same | [V] |
| Marvel Snap | Infinity Split | Finishes | 4 finishes: "**Foil**" (shiny rainbow background), "**Prism**" (background replaced by "sharp-edged, reflective hexagons with a rainbow finish"), "**Ink**" (rare), "**Gold**" ("solid gold background") | https://snap.fan/guides/infinity-splits-and-frame-breaks-guide/ ; https://marvelsnapzone.com/infinity-splits/ | [V] |
| Marvel Snap | Infinity Split | Flares | "**Flares** are effects that operate in the 3D space … on top of or surrounding your card". "45 Flares available in three different rarities". | same | [V-weak] (count may be outdated) |
| Marvel Snap | Infinity Split | Rare flare example | "**Krackle**" only from the **6th split**, 10% chance. "inked or gold card with black Krackle flare has a less than 1% chance". | same | [V-weak] |
| Marvel Snap | Custom Card | Apply look | "take any split combination you have unlocked and apply it to every variant of that character you own" | https://snap.fan/news/custom-borders-in-marvel-snap/ ; https://shacknews.com/article/139718/marvel-snap-april-30-2024-patch-notes?amphtml=1 | [V-weak] |
| Marvel Snap | Spotlight Caches (retired) | Dates | Retired **April 29, 2025**, after nearly two years. Replaced "the sluggish **Collector's Token** grind". | https://marvelsnapzone.com/marvel-snap-spotlight-caches-and-casino-style-progression/ ; https://marvelsnapzone.com/?p=139270 | [V] (2 articles + shacknews, mobalytics) |
| Marvel Snap | Spotlight Caches | Weekly pool | 4 items a week: usually "three spotlighted Series 4 or 5 cards, and one random Series 4 or 5 card" | same; https://mobalytics.gg/blog/marvel-snap/spotlight-cache-guide/ | [V] |
| Marvel Snap | Spotlight Caches | Shrinking-pool odds | Each "**Spotlight Key**" opens one item and removes it from the pool: 1st pull **25%**, 2nd **33%**, 3rd **50%**, 4th **100%** | same | [V] |
| Marvel Snap | Spotlight Caches | Key source | Keys "earned every **120 Collection Levels** after CL 500" | same | [V-weak] |
| Marvel Snap | Older reward names | Names | "**Collector's Tokens**", "**Collector's Reserves**" | same | [V-weak] |

---

## 4. NBA Top Shot (Dapper Labs): "Moments"

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| NBA Top Shot | Rarity | Tier names | "**Common**", "**Fandom**", "**Rare**", "**Legendary**", plus "**Ultimate**" (auction only, edition size of one or three) | https://blog.nbatopshot.com/posts/nba-top-shot-rarity-blog ; https://nftnow.com/guides/nba-top-shot-guide/ | [V] |
| NBA Top Shot | Rarity | Visual marker | Rare: "marked by **neon corners** on the front". Legendary also has neon corners. | same | [V-weak] |
| NBA Top Shot | Rarity | Edition sizes (digest) | Common "often starts from 4000-plus" · Rare "250 to 2,022" · Legendary "50 to 125". Fandom size is "driven by dynamic demand". Ranges look series-specific; check before use. | same | [V-weak] |
| NBA Top Shot | Edition type | Labels | "**LE**" = Limited Edition (count fixed; used for Rare and Legendary). "**CC**" = Circulating Count (Commons, "may have more minted"). | https://support.nbatopshot.com/hc/en-us/articles/4404889579027-Edition-Size-and-Retired-Moment-NFTs | [V] |
| NBA Top Shot | Serial | Meaning | Every Moment is "minted with an individual serial number". Lower serial = higher value. A serial that matches the player's jersey number (for example 23 for LeBron James) is worth more. | same; https://dappradar.com/blog/how-to-value-nba-top-shot-nfts | [V-weak] (jersey match) |
| NBA Top Shot | Pack open | Reveal visual | "an animated **3D box** design giving way to a short highlight clip" | https://decrypt.co/43461/nba-top-shot-crypto-collectibles-experience-launches-public | [V-weak] |
| NBA Top Shot | Pack open | Rarity shadow (anti-spoiler) | The "shadow underneath a Moment that is typically **colored** to distinguish between Common, Rare and Legendary now features a **delay** to prevent the excitement and surprise of a big hit from being unintentionally spoiled" | https://blog.nbatopshot.com/posts/nba-top-shot-developer-diary-march-2022 | [V] |
| NBA Top Shot | Pack open | Big-hit call-out | "**Big Hits**" feature "identifies and highlights any Moment you pull in a pack that is Rare or Legendary with a special call-out" | same | [V] |
| NBA Top Shot | Onboarding | First three steps | "pack drops, challenges, and the peer-to-peer marketplace" | https://dapperlabs.com/newsroom/nba-top-shot-takes-sports-collecting-to-the-next-level-only-on-flow | [V] |
| NBA Top Shot | Duplicate trade-in | Currency and pack | "**Trade Tickets**". "Each **Locker Pack** is available for **4 Trade Tickets**", up to 5 per transaction. Each pack = **3 Moments** (2 guaranteed Series 3 Base Set + 1 from Series 1, 2, Summer '21 or 3). | https://blog.nbatopshot.com/posts/series-one-locker-packs | [V] |

---

## 5. EA SPORTS FC Ultimate Team

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| EA FC | Pack walkout | Reveal order | Attributes shown in order "**Position, Nation, League, Club**". "Then the **rating counts up**, and finally, the full card along with image and rating appears." | https://www.dexerto.com/wikis/ea-fc-26-guides-walkthrough-tips/pack-animations ; https://mein-mmo.de/en/ea-fc-26-how-to-recognize-walkouts-during-pack-opening,1526086 | [V-weak] |
| EA FC | Pack walkout | Tell | When the camera zooms on the flags, "if the lines on either side of the flags are **silver**", the player is **86-rated or above** | https://www.fut.gg/news/how-to-tell-if-youve-packed-a-walkout-in-ea-sports-fc-24/ | [V-weak] (FC 24; may differ in FC 26) |
| EA FC | Pack walkout | Multiple-walkout tell | More than one walkout in a pack is shown by "the flag that shows a **club badge at the end**" | same | [V-weak] |
| EA FC | Duplicates | Storage | Duplicates "go to a **duplicate storage** accessible through the **SBC Storage** tab". Stores up to **100** duplicate player items (added in FC 25, kept in FC 26). | https://www.videogameschronicle.com/news/ea-sports-fc-25-ultimate-team-adding-duplicate-storage-more-evolutions ; https://realsport101.com/ea-sports-fc/fc-25-100-duplicates-storage-update/ ; https://destructoid.com/?p=604821 | [V] |
| EA FC | Store | Preview Pack | "select a **Preview Pack** to preview its contents, and then you have the option to buy it or leave it". Previewing costs nothing. | https://www.gameinformer.com/2021/06/18/you-can-now-look-inside-a-fifa-ultimate-team-pack-before-buying ; https://www.nme.com/news/gaming-news/fifa-ultimate-team-loot-boxes-let-you-see-whats-inside-now-2973312 | [V] |
| EA FC | Store | Preview timer | If you don't buy, you "wait **24 hours**" before the pack refreshes with new contents | same | [V] |
| EA FC | Store | Currencies | "**FIFA Points**" (real money; now "FC Points") or "**FUT Coins**" (earned) | same | [V] |
| EA FC | Post-pack | "Quick Sell", "Send to Club", "Swap Duplicates" labels | NOT FOUND (see [B]) | — | — |

---

## 6. Magic: The Gathering Arena

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| MTG Arena | Wildcard track | Mechanic | "Every time you open a pack, a bar on each track will light up until you've got **six lit bars**". Then you get a wildcard and the track resets. | https://draftsim.com/mtg-arena-wildcards/ ; https://primagames.com/tips/magic-gathering-arena-how-get-wildcards | [V] |
| MTG Arena | Wildcard track | Two wheels | Small track = uncommon wildcards. Big track: **4 rare wildcards, then 1 mythic**, then repeat. **Conflict**: one source says the uncommon wheel has 5 pips, the other 6. | same; https://mtgrocks.com/what-are-wildcards-in-mtg-arena | [V] (pip count conflicts) |
| MTG Arena | Wildcards in packs | Drop rates | Common **1:3** (33.30%), Uncommon **1:5** (20%), Rare **1:30** (3.33%), Mythic Rare **1:30** (3.33%) | same | [V-weak] |
| MTG Arena | Wildcards | Pity | "every time you don't get a wildcard … the drop rates for that rarity will increase". Resets after a hit. Called the "**pity timer**". | same | [V-weak] |
| MTG Arena | Duplicates | The Vault | "Once you own **four copies** of a card, every copy you open … grants **Vault progress**". "When the **Vault** opens, you land **one mythic, two rare, and three uncommon wildcards**." | same | [V] |

---

## 7. Pokémon GO (Niantic / Scopely) trading

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Pokémon GO | Trade entry | Path | Tap your Trainer Profile → "**Friends**" tab at the top → choose a friend → tap "**Trade**" | https://www.techradar.com/how-to/how-to-trade-pokemon-in-pokemon-go ; https://www.pocketgamer.com/pokemon-go/how-to-trade | [V] |
| Pokémon GO | Trade rule | Distance | Must be "within **100 meters**" of the friend | same; https://www.tomsguide.com/how-to/how-to-trade-in-pokemon-go-stardust-requirements-friendship-level-and-more | [V] |
| Pokémon GO | Trade flow | Steps | Both players pick a Pokémon, can view CP, HP and other stats, then both confirm | same | [V-weak] |
| Pokémon GO | Trade cost | Currency | "**Stardust**". "**Special Trades**" (not in your Pokédex, Legendary, Shiny, or new forms) "range from just a hundred all the way up to a million". Cost falls as friendship rises. | same | [V] |
| Pokémon GO | Friendship | Level names (digest) | "Good Friends, Great Friends, Ultra Friends, Best Friends and **Forever Friends**". "Forever Friends" is not in my background knowledge; verify. | https://www.tomsguide.com/how-to/how-to-trade-in-pokemon-go-stardust-requirements-friendship-level-and-more | [V-weak] |
| Pokémon GO | Lucky Friends | Trigger | Only **Best Friends** can become Lucky Friends. Can trigger only on the **first interaction of the day**, once per day per Best Friend. | https://www.dexerto.com/pokemon/lucky-friends-pokemon-go-467217/ ; https://deltiasgaming.com/?p=85747 ; https://mein-mmo.de/en/pokemon-go-update-0-139-2-finally-brings-new-friends-feature,335185 | [V] |
| Pokémon GO | Lucky Friends | Visual | "**golden circles around the name** and the friend will be **highlighted in gold**" in the friend overview | https://mein-mmo.de/en/pokemon-go-update-0-139-2-finally-brings-new-friends-feature,335185 | [V-weak] |
| Pokémon GO | Lucky Friends | Effect | "the trade of your next Pokémon is **guaranteed to be Lucky**" | same | [V] |
| Pokémon GO | Lucky Pokémon | Visual | "a **gold, glowing background** on the collection page and a **green 'Lucky Pokémon' label** with a gold, shimmering background on the summary screen" | https://serebii.net/pokemongo/luckypokemon.shtml ; https://deltiasgaming.com/?p=79288 | [V-weak] |
| Pokémon GO | Lucky Pokémon | Perk | "require significantly less Stardust to Power Up" | same | [V] |

---

## 8. Pokémon HOME trading

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Pokémon HOME | Trade menu | Four modes | "**Wonder Box**", "**GTS**" (Global Trade System), "**Room Trade**", "**Friend Trade**" | https://www.pokemon.com/us/app/pokemon-home ; https://www.thegamer.com/pokemon-home-complete-trading-guide/ | [V] |
| Pokémon HOME | Wonder Box | Copy | "Pokémon placed in the Wonder Box can be traded with people around the world … even when you're not using Pokémon HOME". More slots with the "Premium Paid Plan". | https://www.pokemon.com/us/app/pokemon-home | [V] |
| Pokémon HOME | GTS | Copy | "specify which Pokémon they want to trade and which Pokémon they want to receive and then be matched with a Trainer whose requests meet their criteria". Can request Pokémon not yet registered in the Pokédex. | same | [V] |
| Pokémon HOME | Room Trade | Copy | "create a room and trade Pokémon among the people who join". "each room can hold up to **20 people**". "**To add a little suspense, you won't know what Pokémon you'll receive until the trade is complete.**" No cost; creating rooms needs the Premium Plan. | same | [V] |
| Pokémon HOME | Friend Trade | Copy | Trade "with other users who you've become friends with in Pokémon HOME" | same | [V] |

---

## 9. Sorare, Topps BUNT, Pokémon TCG Live

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Sorare | Scarcity tiers | Name, colour, supply | **Limited** (yellow) 1,000 · **Rare** (red) 100 · **Super Rare** (blue) 10 · **Unique** (black) 1, each per player per season | https://www.fantasyfootballscout.co.uk/2022/10/16/the-beginners-guide-to-sorare-cards/ ; https://www.coindesk.com/learn/sorare-101-how-to-get-started-with-sorare-nfts/ ; https://dappradar.com/?p=6082 | [V] |
| Sorare | Serial | Format | Limited "**x/1000**", Rare "**x/100**", Super Rare "**x/10**", Unique "**1/1**" | same | [V] |
| Sorare | Scarcity | Copy | "numbered and provably unique on the blockchain". Scarcity rules "can't be altered". | same | [V-weak] |
| Topps BUNT | App Store listing | Tagline | "the officially licensed digital collectibles app of Major League Baseball and MLB Players, Inc!" | https://apps.apple.com/US/app/id514398862 | [V] |
| Topps BUNT | App Store listing | Core loop copy | Users "**rip digital packs** to build their collections, organize their inventory to **complete sets for awards**" | same; https://screensdesign.com/showcase/topps-bunt-mlb-card-trader | [V] |
| Topps BUNT | Currency | Name | Packs bought with "**coins**", earned by in-app activity or bought in the store | https://www.sikids.com/dugout-dispatch/collecting-goes-digital | [V-weak] |
| Topps BUNT | Rarity | Names (digest) | "common, uncommon, scarce, rare, and super-rare" | same | [V-weak] |
| Topps BUNT | Collection | Score | "**Collection Score**": "measure how your collection stacks up" | https://apps.apple.com/app/id514398862 | [V-weak] |
| Topps BUNT | Wishlist | Label | "Create **Wish/Trade Lists** to help complete sets" | same | [V-weak] |
| Topps BUNT | Craft | Copy | "Combine cards to craft into rarer collectibles" | same | [V-weak] |
| Topps BUNT | Card inspect | Mode name | "'**Inspect Mode**' … spin, tilt, and zoom in on the asset as if holding it in their hands, complete with **shifting foil reflections**" | https://screensdesign.com/showcase/topps-bunt-mlb-card-trader | [V-weak] |
| Topps BUNT | Onboarding | Screens | **5 onboarding steps**. Splash (player collage, MLB logos) → sign up / log in / guest, with a starter-bonus link → tutorial with "a free starter pack preview, instructional tooltip, and a free pack action button" | same | [V-weak] |
| Pokémon TCG Live | Duplicates | Rule | Duplicates beyond **four copies** are "turned into **credits**", which can be exchanged "to craft cards of your choice" | https://gamertagmythras.com/blog/pokemon-tcg/pokemon-tcg-live-code-cards-and-credits ; https://www.taptap.io/kr/post/5820932 | [V-weak] |
| Pokémon TCG Live | Crafting | Cost range | "**40 credits** for a basic common card to … **2,000 credits** for a 'secret rare'" | same | [V-weak] |

---

## 10. Sources not reached in this session

Disney Lorcana app, Panini apps, Topps NOW, and Topps Disney Collect! were not searched (budget). Marvel Snap card-face anatomy, EA FC post-pack menu labels, and MTG Arena pack-opening visuals were searched for but not found. They appear only in [B] or Gaps.

---

## 11. Which of our §J surfaces each source informs (verified rows only)

| Our surface (§J) | Best sources found this session | What the source shows (from the rows above) |
|---|---|---|
| Card face and rarity tiers (◇ / ◇◇ / ☆ / ☆☆☆ immersive) | Marvel Snap, Hearthstone, Sorare, TCG Pocket App Store | Marvel Snap: one colour per tier (grey → green → blue → purple → orange/gold → red), and each step adds a visual layer (Frame Break → 3D → animated → shiny logo → animated frame). Hearthstone: a rarity gem at the bottom centre of the art, and Golden = "animated versions of the default illustrations". Sorare: one colour per scarcity. TCG Pocket App Store: "3D feel" copy for immersive cards. |
| Weekly packs earned by posting | TCG Pocket, Topps BUNT | TCG Pocket: "two booster packs at no cost each day" and "Claim All" for up to 20 stored packs. Topps BUNT: coins earned by in-app activity buy packs. |
| Pack opening with tells | Hearthstone, EA FC, NBA Top Shot | Hearthstone: 5 face-down cards with a hover glow by rarity, clicked to flip. EA FC: staged reveal (Position → Nation → League → Club → rating counts up) with silver lines as the tell. Top Shot: a coloured rarity shadow delayed to avoid spoilers, and a "Big Hits" call-out. |
| Binder (30 slots) and completion rewards | Hearthstone, Topps BUNT, Marvel Snap | Hearthstone: a Diamond card for "collecting all Legendary cards from the set". Topps BUNT: "complete sets for awards" and "Collection Score". Marvel Snap: Collection Level points per upgrade. |
| Wishlist | Topps BUNT | "Wish/Trade Lists" (TCG Pocket wishlist is in file 05) |
| Blind pick from a friend's pack | Marvel Snap Spotlight, Pokémon HOME Room Trade, TCG Pocket | Spotlight: shrinking pool, 25% → 33% → 50% → 100%. Room Trade: "you won't know what Pokémon you'll receive until the trade is complete". TCG Pocket: "New!" bubble and card names on Wonder Pick tiles. |
| Same-rarity trading and duplicate-earned currency | Hearthstone, MTG Arena, Pokémon TCG Live, NBA Top Shot, EA FC, TCG Pocket | Hearthstone Arcane Dust "Disenchant / Craft" table. MTG Arena Vault after 4 copies. TCG Live credits after 4 copies. Top Shot "Trade Tickets" → "Locker Pack". FC duplicate storage of 100. TCG Pocket "share" of one card per friend per day. |
| Trading windows | Pokémon GO, EA FC | Pokémon GO: Lucky Friends once a day on the first interaction, and the 100 m rule. EA FC: Preview Pack 24-hour refresh. (Monopoly GO Golden Blitz is in file 13.) |
| Numbered upgrades worn as a badge | Marvel Snap, NBA Top Shot, Sorare, Hearthstone | Snap: Infinity Split finishes (Foil / Prism / Ink / Gold) and Flares, with Krackle only from the 6th split. Top Shot: serial plus "LE"/"CC", and jersey-match serials. Sorare: "x/1000" format. Hearthstone: golden / signature / diamond quality tiers. |
| Paid packs, 18+, odds shown | EA FC, Hearthstone, MTG Arena, Marvel Snap | FC: Preview Pack (see contents before buying). Hearthstone: pity of 40 packs and a legendary in the first 10. MTGA: "1:30" style rate notation and pity. Spotlight: per-pull odds. |

---

## BACKGROUND KNOWLEDGE [B] (NOT verified this session; do not merge into the tables above)

Confidence: **high** = I am confident and it is widely documented. **medium** = likely, but details may be off. **low** = an impression; treat it as a placeholder.

| App | Surface | Element | Recalled value | Tag | Confidence |
|---|---|---|---|---|---|
| Hearthstone | Open Packs | Reveal motion | The pack is dropped into a central circular slot and bursts. The 5 cards land face down in a loose arc or pentagon. Each click flips one card with a rarity-specific flash and sound. A Legendary flip gives a large orange burst and the card's voice line. A "**Done**" button appears in the centre after all 5 are flipped. | [B] | medium |
| Hearthstone | Open Packs | Bulk open | A mass pack-opening option was added in 2024 (exact label unknown, possibly "Open All"). | [B] | low |
| Hearthstone | Card face | Anatomy | Mana cost in a blue crystal at top-left. Attack (yellow/orange, bottom-left) and Health (red, bottom-right). Name banner across the middle. Rarity gem at the centre of the name banner (white/grey, blue, purple, orange). Text box below. Legendaries have a dragon ornament on the frame. | [B] | high |
| Hearthstone | Typography | Fonts | Card names and headings: **Belwe** (Belwe Bd BT / Belwe Medium). Card text: **Franklin Gothic**. | [B] | medium–high |
| Hearthstone | Duplicates | Duplicate protection | You can't open an extra copy of a Legendary you already own until you own every Legendary in that set. Later extended so you don't get more than the playable number of copies at other rarities. | [B] | medium |
| Hearthstone | Dust | Icon | A purple/pink swirling dust glyph (a vial or cloud) | [B] | low |
| Marvel Snap | Card face | Anatomy | Energy cost at top-left (blue circle/disc), Power at top-right (orange hexagon). The character's name logo sits at the bottom. Ability text is not printed on the card face; it appears on inspect. | [B] | high |
| Marvel Snap | Collection Level | Track | A vertical reward track showing rewards such as Credits, Boosters, "Collector's Cache" (a random card) and "Collector's Reserve". Card pools are named "Series 1" to "Series 5". | [B] | medium |
| Marvel Snap | Upgrade | Interaction | You tap a variant and press an "Upgrade" button showing a credit price. The card animates into the next tier with a shine. At Infinity a "Split" button appears, and the split reveals a random finish and flare. | [B] | medium |
| Marvel Snap | Tiers | Ultra colour | The Ultra frame tint reads pink/crimson rather than pure red. Infinity reads as a rainbow/gold frame. | [B] | low–medium |
| NBA Top Shot | Serial | Display | Shown as "#<serial> / <edition size>" with "LE" or "CC" beside it on the Moment page | [B] | medium |
| NBA Top Shot | Tier colours | Palette | Common grey/white, Fandom green/teal, Rare blue, Legendary orange/gold, Ultimate dark/black | [B] | low |
| NBA Top Shot | Packs | Queue | Pack drops use a virtual waiting room / queue with a position number | [B] | medium |
| EA FC | Card face | Anatomy | Overall rating large at top-left with the position abbreviation under it. Nation flag, league badge and club badge stacked under that. Player cut-out at right. Name below. Six stats in two columns: PAC SHO PAS / DRI DEF PHY. Bronze, silver and gold colouring, with the "rare" versions having an ornamented shiny design. | [B] | high |
| EA FC | Post-pack | Actions | Item actions include "Send to Club", "Quick Sell", "Send to Transfer List". Untradeable duplicates show a "Duplicate" marker and can be "Stored" or "Quick Sold". There are bulk actions on the pack-results list. | [B] | medium |
| EA FC | Pack walkout | Firework/flare colour tells | The colour of flares and smoke before the walkout hints at the rating or promo. The mapping changes every year. | [B] | low–medium |
| EA FC | Store | Odds link | Each pack tile has a "**Pack Probabilities**" (or similar) link that lists odds per item category | [B] | medium |
| MTG Arena | Rarity symbol | Colours | Expansion symbol colour: Common **black**, Uncommon **silver**, Rare **gold**, Mythic **orange-red** (the same convention as paper Magic) | [B] | high |
| MTG Arena | Packs | Duplicate protection | Owning 4 copies of a rare or mythic means you get a different one instead. Once you own all of them, you get **Gems** (20 for rare, 40 for mythic). | [B] | medium |
| MTG Arena | Packs | Opening | The pack is clicked open, cards fan out, and rares/mythics flip with a gold or orange glow. There is an option to open several packs at once. | [B] | low–medium |
| Pokémon GO | Trade flow | Screens | Connecting screen → pick a Pokémon from your box list → confirmation showing both Pokémon and the Stardust cost → "**CONFIRM**" → an animation of the two Poké Balls swapping → reveal with re-rolled IVs/CP. A Lucky result shows a "**Lucky!**" sparkle banner. | [B] | medium |
| Pokémon GO | Trade cost | Stardust table | Normal trade 100 Stardust. Special trade of a Pokémon not in your Pokédex: 20,000 / 16,000 / 1,600 / 800 (Good / Great / Ultra / Best). Shiny or Legendary already registered: 20,000 / 16,000 / 1,600 / 800. Shiny or Legendary not registered: 1,000,000 / 800,000 / 80,000 / 40,000. One Special Trade per day. | [B] | medium |
| Pokémon GO | Lucky Pokémon | Perks | 50% Stardust discount on power-ups. IV floor of 12/12/12. | [B] | high |
| Pokémon HOME | Slots | Free vs Premium | Wonder Box: 3 slots free, 10 with Premium. GTS: 1 free, 3 with Premium. | [B] | medium |
| Sorare | Card face | Anatomy | Player photo with name, position, club and season. The serial number (for example "12/100") sits in a corner. The tier colour is a gradient frame or background. Unique cards are black and holographic. There is also a free, non-NFT "Common" tier. | [B] | medium |
| Topps BUNT | Cards | Parallels | Cards come as base plus coloured "parallel" and insert variants. Some are serial-numbered "#/N". There are signature (autograph-style) cards and motion cards. | [B] | low–medium |
| TCG Pocket | Claim All | Results | After "Claim All", a combined results view lists every card pulled across the batch, rather than one animation per pack | [B] | low |

---

## Recommended additions to the source list

These are ordered by how many §J surfaces each source informs with **verified** rows. Each line names the exact items worth copying.

1. **Hearthstone**: the pack-reveal tell (5 face-down cards, hover glow: none / blue / purple / orange), the "Arcane Dust" disenchant/craft table, the pity timer (40 packs, first 10 packs), the golden / signature / diamond quality tiers, and a Diamond card for completing the set's Legendaries. Informs: pack opening, rarity, duplicate currency, completion rewards, odds.
2. **Marvel Snap**: the 7-step upgrade ladder with one colour and visual layer per step, Collection Level points (+1 to +10), Infinity Split finishes ("Foil", "Prism", "Ink", "Gold") and Flares ("Krackle" only from the 6th split), and Spotlight Cache shrinking-pool odds (25 / 33 / 50 / 100%). Informs: numbered upgrades, rarity tiers, blind pick, completion.
3. **NBA Top Shot**: "Big Hits" call-out, the delayed rarity shadow (anti-spoiler), "LE" / "CC" edition labels, jersey-match serials, and "Trade Tickets" → "Locker Pack" (3 Moments for 4 tickets). Informs: pack-opening tells, serial badges, duplicate currency. Note that it uses the word "Moments", the same word our spec uses.
4. **Pokémon HOME**: "Room Trade" (rooms of up to 20 people; "you won't know what Pokémon you'll receive until the trade is complete") and "Wonder Box". Informs: blind pick and group trading. All copy is from pokemon.com.
5. **Pokémon GO**: "Lucky Friends" (once a day, first interaction, gold ring on the friend's name, next trade guaranteed Lucky), the "Lucky Pokémon" gold background and green label, and the 100 m rule. Informs: trading windows and trade-result reward visuals.
6. **EA FC Ultimate Team**: the walkout reveal order and silver-line tell, "Preview Pack" with a 24-hour refresh, and duplicate storage of 100 in "SBC Storage". Informs: pack-opening tells, paid packs with transparency, duplicates.
7. **MTG Arena**: the wildcard track (6 lit bars, 4 rares then 1 mythic), "The Vault" (after 4 copies; opens to 1 mythic, 2 rare, 3 uncommon wildcards), and odds written as "1:30". Informs: duplicate currency and odds display.
8. **Sorare**: one colour per scarcity (yellow / red / blue / black) and the "x/1000 … 1/1" serial format. Informs: rarity colours and numbered badges.
9. **Topps BUNT**: "Wish/Trade Lists", "Collection Score", "Inspect Mode" (spin, tilt, zoom, shifting foil), "complete sets for awards", and a 5-step onboarding with a free starter pack. Informs: wishlist, binder completion, card inspect, onboarding. screensdesign.com has a full UX video walkthrough worth opening by hand.
10. **Pokémon TCG Live**: duplicates beyond 4 copies → "credits", with crafting from 40 to 2,000 credits. Informs: duplicate currency (a second Pokémon-family pattern next to Shinedust).
11. **Lower priority / not reached**: Disney Lorcana, Panini apps, Topps NOW, Topps Disney Collect!

---

## Gaps (UNKNOWN after this session)

**TCG Pocket (from file 13's list)**
- Still NOT FOUND: the literal pack-timer string; a "NEW" badge on the post-pack results grid; "Skip" / "Next" / "Open another" labels; card-face element positions; card-back art; in-app My Cards sort and filter labels; trade sub-tabs and the trade animation; Premium Pass paywall headline, bullets and CTA; UI colours, fonts, haptics and sound names.
- Partly filled: Wonder Pick tiles now show card names and a "New!" bubble. Bulk opening ("Claim All", up to 20 packs). New "share" feature. Official App Store copy.

**Other sources**
- **No hex codes** for any rarity colour: Hearthstone glows, Marvel Snap frames, Sorare tiers and Top Shot shadows are colour names only.
- **No font names** verified for any source.
- Hearthstone: the "Done" button label, pack-burst animation, sound and haptics, and the label of the mass-open feature.
- Marvel Snap: card-face anatomy, Ultra/Infinity upgrade costs, the current Collection Level reward names after Spotlight was retired (April 2025), and the in-app odds screen.
- NBA Top Shot: the literal serial display format on screen, the tier colour of each shadow, and "Challenges" screen copy.
- EA FC: post-pack menu labels ("Quick Sell", "Send to Club", "Swap Duplicates"), the in-store "Pack Probabilities" copy, and FC 26 walkout tells (the silver-line tell is from FC 24).
- MTG Arena: pack-opening visuals, the duplicate-to-Gems rule, and whether the uncommon wheel has 5 or 6 pips.
- Pokémon GO: confirmation-screen copy, the trade animation, the Stardust table and whether "Forever Friends" is a real level (only one digest said so).
- Pokémon HOME: Wonder Box and GTS slot counts, and the trade animation.
- Topps BUNT: card-face anatomy, serial format, trade-screen copy, paywall copy (it is in the screensdesign video, which was not retrieved).
- **Paid-pack odds screens**: no literal odds-disclosure copy was retrieved for any source.

---

## Search log (24 calls)

1 Hearthstone rarity glow · 2 Hearthstone dust values · 3 Marvel Snap rarity ladder and upgrade costs · 4 Marvel Snap Split finishes and flares · 5 Marvel Snap Spotlight Caches · 6 NBA Top Shot tiers · 7 EA FC walkout sequence · 8 EA FC duplicate storage · 9 MTG Arena wildcards and Vault · 10 Pokémon GO trade flow · 11 Sorare scarcity · 12 Topps BUNT · 13 TCG Pocket skip / NEW / bulk open · 14 TCG Pocket first-anniversary update · 15 Hearthstone Open Packs and pity timer · 16 NBA Top Shot pack reveal · 17 Pokémon HOME trade modes · 18 Pokémon GO Lucky Friends · 19 TCG Pocket App Store copy · 20 EA FC Preview Packs · 21 Pokémon TCG Live credits · 22 NBA Top Shot serial / LE / CC · 23 Hearthstone quality tiers · 24 Topps BUNT screensdesign
