# 13: Exact UI strings, layout and motion for TCG Pocket, Telegram Gifts, Discord Orbs/Shop/Quests and Monopoly GO (cluster 4 gap-fill)

Research date: 2026-10-07. Tool: WebSearch only, 26 calls. One of the 26 returned an API error (a blocked domain was in the filter) and gave no results, so 25 returned data. curl, WebFetch and Firecrawl were not used.
This file fills gaps left by `research/05-tcgpocket-telegram-discord-monopoly.md`. Facts already in that file (rarity symbols, pull rates, swipe-to-cut, Wonder Pick costs, Shinedust costs, the basic trade flow, wishlist, binders, "Sparkle Flair: Gold" and so on) are not repeated here.

## How to read this file

- WebSearch returns **an AI-summarised digest of snippets plus a list of URLs**. It does not say which URL each sentence came from. The "Source URL" column gives the result URL most likely to hold the fact. Quoted strings are exactly as they appeared in the digest. A digest can paraphrase UI text, so open the page or a screenshot before shipping any string.
- Tags:
  - **[V]**: official first-party source (telegram.org, support.discord.com, discord.com), or two or more independent sources agree.
  - **[V-weak]**: one third-party source or digest, such as game8, gamewith, destructoid or sportskeeda.
  - **[B]**: background knowledge that was NOT verified this session. These rows appear **only** in the separate section near the end of the file.
- **No hex colours, font names, pixel sizes, haptic patterns or sound file names were verified for any of the four apps.** A WebSearch digest cannot return them. Every such value is either in [B] or listed under Gaps.

---

## 1. Pokémon TCG Pocket (verified rows)

### 1.1 Home screen

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| TCG Pocket | Home | Number of home-screen buttons | Nine, numbered in this order: "Booster Packs", "Wonder Pick", "Shop", "Missions", "Profile", "Favorites", "Pass", "News", "Gifts" | https://game8.co/games/Pokemon-TCG-Pocket/archives/483886 | [V-weak] |
| TCG Pocket | Home | Booster Packs entry | The digest describes it as "the blue booster pack logo", which opens your packs. Pack Points earned by opening packs are exchanged for cards from here. | https://game8.co/games/Pokemon-TCG-Pocket/archives/483886 | [V-weak] |
| TCG Pocket | Home | Favorites | A binder or display board you favourite can be **pinned to the home screen in the upper-left corner** | https://game8.co/games/Pokemon-TCG-Pocket/archives/483886 | [V-weak] |
| TCG Pocket | Home | Profile | From Profile you can change player name, icon, emblems and featured cards, and view achievements and battle records | https://game8.co/games/Pokemon-TCG-Pocket/archives/483886 | [V-weak] |
| TCG Pocket | Home | Pass button icon | The Premium Pass "is recognizable by its **Delibird icon**" | https://game8.co/games/Pokemon-TCG-Pocket/archives/474488 ; https://www.pokemon-zone.com/articles/premium-pass/ | [V-weak] |
| TCG Pocket | Global nav | Bottom navigation bar items | "Home", "My Cards", "Social Hub", "Battle". The source gives no left-to-right order. Earlier research found the card icon is the 2nd icon. | https://game8.co/games/Pokemon-TCG-Pocket/archives/483029 ; https://game8.co/games/Pokemon-TCG-Pocket/archives/483886 | [V-weak] |

### 1.2 Packs screen and pack timer

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| TCG Pocket | Packs screen | Pack Stamina display | "displayed in the **top-right of the Packs screen** in the form of a **progress bar with a timer**" | https://www.pokemon-zone.com/articles/tcg-pocket-in-game-economy/ | [V-weak] |
| TCG Pocket | Packs screen | Timer behaviour | "there will be a countdown timer in the app". 1 Pack Stamina recovers every 12 h. | https://www.pokemon-zone.com/articles/tcg-pocket-in-game-economy/ ; https://primagames.com/tips/how-to-get-free-packs-in-pokemon-tcg-pocket | [V] |
| TCG Pocket | Packs screen | Spending order | When both are held, Pack Hourglasses are used before Poké Gold. Hourglass = −1 h, Poké Gold = −2 h. | https://www.pokemon-zone.com/articles/tcg-pocket-in-game-economy/ ; https://www.sportskeeda.com/pokemon/what-hourglasses-pokemon-tcg-pocket | [V] |
| TCG Pocket | Packs screen (Premium) | Extra gauge | "A new pack stamina gauge will be added which will let you open one more pack every 24 hours" (Premium Pass) | https://www.pokemon-zone.com/articles/premium-pass/ | [V-weak] |
| TCG Pocket | Packs screen | Literal timer string (for example "Next pack in 11:59:00") | NOT FOUND (see Gaps) | — | — |

### 1.3 Pack-opening sequence after the cut

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| TCG Pocket | Pack open | After cut | "You swipe across the top and **the stack of cards fly out into your open hand**" | https://nintendowire.com/guides/pokemon-tcg-pocket/introduction/ (result set; digest also drew on thegamer.com preview) | [V-weak] |
| TCG Pocket | Pack open | Per-card reveal | "You **swipe to reveal the next one**, marvel at its power and artwork, then flick through to the end" | https://www.thegamer.com/pokemon-tcg-pocket-preview-once-you-play-it-youll-get-it/ | [V-weak] |
| TCG Pocket | Pack open | Card order | "the highest rarity card **in the back**" (that is, revealed last) | https://www.thegamer.com/pokemon-tcg-pocket-preview-once-you-play-it-youll-get-it/ ; https://nintendowire.com/guides/pokemon-tcg-pocket/introduction/ | [V-weak] |
| TCG Pocket | Pack open | Summary, then register | "After opening the pack and **seeing what five cards you've pulled**, you'll be prompted to **'swipe up' to add them to your card dex**". The digest implies all 5 are shown together before the swipe-up. | https://nintendowire.com/guides/pokemon-tcg-pocket/introduction/ | [V] (two separate queries) |
| TCG Pocket | Pack open | First-pack tutorial | After the swipe-up animation, the tutorial asks you to select the Pokémon ex card you pulled and view it. The first pack completes the Dex Mission "Register 5 cards in the card dex". | https://nintendowire.com/guides/pokemon-tcg-pocket/introduction/ | [V-weak] |
| TCG Pocket | Pack open | Collection counter | "you'll get updates on the number of unique cards and the total number of cards you've collected" | https://www.pocket-lint.com/pokemon-tcg-pocket-launch/ (result set) | [V-weak] |
| TCG Pocket | Pack open (new, 2026) | Alternative "from the back" opening, as reported by a fan account on X | "1️⃣ Select a pack and turn it over 2️⃣ Lift the pack upwards 3️⃣ Open it with two fingers" | https://x.com/UniteVids/status/2049058977577644211 | [V-weak] (fan post, unofficial) |
| TCG Pocket | Pack open | "NEW" badge, Skip button, "Next"/"Open another" labels | NOT FOUND (see Gaps) | — | — |

### 1.4 Wonder Pick screen

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| TCG Pocket | Wonder Pick | Feed size | "initially made of **16 random packs from 16 random players**" | https://www.pokemon-zone.com/articles/wonder-pick/ ; https://game8.co/games/Pokemon-TCG-Pocket/archives/474489 | [V-weak] |
| TCG Pocket | Wonder Pick | Friend slots | "a maximum of **4 slots** will be dedicated to your friends' packs". "Wonder Picks from friends will always **display first**". | same | [V-weak] |
| TCG Pocket | Wonder Pick | Pick mechanic | "the cards in the chosen pack are **shuffled face down**, and the player draws one at random" | same | [V] (also in file 05) |
| TCG Pocket | Wonder Pick | Social | You can send a friend request after a battle or a Wonder Pick | https://game8.co/games/Pokemon-TCG-Pocket/archives/483029 | [V-weak] |
| TCG Pocket | Wonder Pick | Owner effect | "Using the Wonder Pick does not take away any cards from the other player" | https://game8.co/games/Pokemon-TCG-Pocket/archives/474489 | [V-weak] |

### 1.5 Social Hub and Trade

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| TCG Pocket | Social Hub | Menu options, numbered in this order | ① "Community Showcase" ② "Friends" ③ "Trade". At launch Trade was labelled "Trade (Coming Soon)". | https://game8.co/games/Pokemon-TCG-Pocket/archives/483029 | [V-weak] |
| TCG Pocket | Social Hub | Entry | "enter the Social Hub **at the bottom of the page** and tap the Trade option" | https://game8.co/games/Pokemon-TCG-Pocket/archives/474558 | [V-weak] |
| TCG Pocket | Trade (send) | Confirm step | "You will be shown the **Trade Stamina** and [currency] cost. If you're okay with the card and cost, tap on **OK**". The source predates July 2025, when Shinedust replaced Trade Tokens. | https://game8.co/games/Pokemon-TCG-Pocket/archives/474558 ; https://www.dexerto.com/pokemon/how-to-trade-in-pokemon-tcg-pocket-3050521/ | [V-weak] |
| TCG Pocket | Trade (send) | Completion gesture | When the partner accepts, the sender taps "**View**" and is "prompted to **swipe up to send your card** to your trade partner" | same | [V-weak] |
| TCG Pocket | Trade (receive) | Buttons | "View" → accept by tapping "**Trade**", or "**Decline**". Then pick an eligible card → tap "**OK**" until the trade is finalised. File 05 has "Accept" from a different source, so the accept label differs between sources. | same | [V-weak] |
| TCG Pocket | Trade | Expiry | The offer must be accepted "within **two days**" or it is automatically cancelled | same | [V-weak] |
| TCG Pocket | Trade | Notification | "You will get a notification on the Trade screen once they either decline or accept" | same | [V-weak] |
| TCG Pocket | Trade | Later feature | game8 has a separate "**Trading Board**" page. Contents not retrieved. | https://game8.co/games/Pokemon-TCG-Pocket/archives/496009 | [V-weak] (existence only) |

### 1.6 Missions

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| TCG Pocket | Missions | Mission categories (game8 list headings) | "Daily Missions", "Dex Missions", "Deck Missions", "Premium Missions", "Themed Collections", "Beginner Missions", "Advanced Missions". game8 also has a "Secret Missions" list. These are guide headings and may not be in-app tab labels. | https://game8.co/games/Pokemon-TCG-Pocket/archives/476481 ; https://game8.co/games/Pokemon-TCG-Pocket/archives/483769 ; https://www.serebii.net/tcgpocket/missions.shtml | [V-weak] |
| TCG Pocket | Missions | Daily reward claim | After the three daily missions are done, "tap the reward **near the top of the Daily Missions screen**" | https://game8.co/games/Pokemon-TCG-Pocket/archives/480759 | [V-weak] |
| TCG Pocket | Missions | Example Premium mission copy | "Collect 99 Cards" → 2 Pack Hourglasses. "Wonder pick 5 times" → 1 Pack Hourglass. | https://game8.co/games/Pokemon-TCG-Pocket/archives/474554 | [V-weak] |
| TCG Pocket | Missions | "Claim All" button | NOT FOUND | — | — |

### 1.7 Shop

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| TCG Pocket | Shop | Tab structure | A "**Main**" tab with a "**Special**" section (spend Special Shop Tickets). A "**Limited Time / Events**" tab with a "**Premium**" section (spend Premium Tickets). A Tickets section (spend Shop Tickets). Poké Gold bundles. | https://www.pokemon-zone.com/articles/special-shop-tickets-tcg-pocket/ ; https://www.pokemon-zone.com/articles/premium-pass/ ; https://game8.co/games/Pokemon-TCG-Pocket/archives/482660 | [V-weak] |
| TCG Pocket | Shop | Path string | Premium items: "Shop, **Limited Time/Events > Premium** menu" | https://www.pokemon-zone.com/articles/premium-pass/ | [V-weak] |
| TCG Pocket | Shop | What it sells (game8) | "Hourglasses, Poke Gold, Item Cards, Special Shop Items, Accessories, Premium Pass Items and even Limited-Time Event Items" | https://game8.co/games/Pokemon-TCG-Pocket/archives/483886 | [V-weak] |
| TCG Pocket | Shop | Shop Ticket prices | Hourglasses: 2–3 tickets each, 12–18 for a bundle of 6. Special Shop Ticket: 300 Shop Tickets. Item cards (Potion, X Speed, Hand Scope, Pokédex, Poké Ball, Red Card, Professor's Research): 2 tickets each. | https://game8.co/games/Pokemon-TCG-Pocket/archives/480617 ; https://bulbapedia.bulbagarden.net/wiki/Shop_(TCG_Pocket) | [V-weak] |
| TCG Pocket | Shop | Special Shop Ticket prices | Pokémon Coin 12 · Card Sleeve 12 · Playmat 26 · Backdrop 7 · Cover 7 | https://www.pokemon-zone.com/articles/special-shop-tickets-tcg-pocket/ | [V-weak] |
| TCG Pocket | Shop | Poké Gold bundle naming format | "Poke Gold x12 (5 paid + 7 bonus …)", "x30 (15 paid + 15 bonus)", "x72 (50 paid + 22 bonus)". **The digest gave $9.99 for all three, which is almost certainly a digest error. Do not use these prices.** | https://bulbapedia.bulbagarden.net/wiki/Shop_(TCG_Pocket) | [V-weak] (format only) |
| TCG Pocket | Shop | Premium Tickets | Up to 30 per month from Premium Missions | https://game8.co/games/Pokemon-TCG-Pocket/archives/482853 | [V-weak] |

### 1.8 Premium Pass

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| TCG Pocket | Premium Pass | Term and price | "30-day subscription" at $9.99 | https://game8.co/games/Pokemon-TCG-Pocket/archives/474488 ; https://www.dexerto.com/pokemon/is-the-pokemon-tcg-pocket-premium-pass-worth-it-perks-and-free-trial-2968198/ | [V] (with file 05) |
| TCG Pocket | Premium Pass | Benefits | Third pack per day (extra gauge, one pack every 24 h). Premium Missions → Premium Tickets plus items. Premium Shop (promo cards and accessories). | https://www.pokemon-zone.com/articles/premium-pass/ | [V] |
| TCG Pocket | Premium Pass | Trial | "First-time subscribers can try the Premium Pass for free for **two weeks**" | same | [V] |
| TCG Pocket | Premium Pass | Retroactive missions | When you subscribe, any premium mission whose requirements you already met is "automatically completed" | same | [V-weak] |
| TCG Pocket | Premium Pass | Literal paywall headline, button text | NOT FOUND | — | — |

### 1.9 My Cards and card anatomy

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| TCG Pocket | Set code | Genetic Apex | Set code "**A1**", 286 cards | https://www.elitefourum.com/t/first-digital-set-of-tcg-pocket-a1-genetic-apex/49803 | [V-weak] |
| TCG Pocket | My Cards | Rarity filter names (from **PokéBase**, a third-party site, not the app) | Crown Rare, Shiny EX, Shiny, Immersive Rare, Special Art Rare, Super Rare, Art Rare, Double Rare, Rare, Uncommon, Common | https://pokebase.app/pokemon-tcg-pocket/cards | [V-weak] (NOT in-app) |
| TCG Pocket | My Cards | In-app tab, sort and filter labels | NOT FOUND | — | — |
| TCG Pocket | Card face | Name, HP, type, stage, Illus. line, number placement | NOT FOUND (only [B]) | — | — |

---

## 2. Telegram collectible gifts (verified rows)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Telegram | Blog (Jan 2025) | Launch copy | "Gifts you receive on Telegram are now able to be **upgraded to collectibles**". Upgrading "unlocks a new appearance from dozens of custom variations, and collectibles also receive a random set of secondary traits, including a **background color, icon and number**". | https://telegram.org/blog/collectible-gifts-and-more | [V] |
| Telegram | Blog (Jan 2025) | Rarity copy | "Every collectible gift is a unique work of art — and some will be more rare than others" | https://telegram.org/blog/collectible-gifts-and-more | [V] |
| Telegram | Blog (Jan 2025) | Cost copy | "Upgrading a gift costs a small amount of Telegram Stars", used to cover blockchain fees | https://telegram.org/blog/collectible-gifts-and-more | [V] |
| Telegram | Blog (Jan 2025) | Transfer copy | Collectible gifts "can be transferred to other users or auctioned on NFT marketplaces" | https://telegram.org/blog/collectible-gifts-and-more | [V] |
| Telegram | Gift sheet | Attribute names | "**Model**", "**Backdrop**", "**Symbol**", each with a rarity %. The % is the share of the collection that has the same trait. | https://gemwallet.com/learn/telegram-gifts-a-beginners-guide-to-nfts-on-ton/ ; https://dropstab.com/research/alpha/what-are-telegram-gifts | [V] (2+ sources) |
| Telegram | Gift sheet | Model meaning | "the unique drawing and animation" of the gift | https://gemwallet.com/learn/telegram-gifts-a-beginners-guide-to-nfts-on-ton/ | [V-weak] |
| Telegram | Gift sheet | Backdrop meaning | "the background colour on the NFT" | same | [V-weak] |
| Telegram | Gift sheet | Symbol meaning | "the **grey icons** that are on the backdrop" (that is, a repeated symbol pattern over the backdrop) | same | [V-weak] |
| Telegram | Gift sheet | Title and number format | "Gem Signet – **Collectible #5475**" (gift name, then "Collectible #" and the number) | https://blog.invitemember.com/telegram-nfts-2026-guide-to-blockchain-digital-gifts/ (digest; also https://t.me/nft/InputKey-1 pattern) | [V-weak] |
| Telegram | Gift sheet | Row: Owner | "**Owner**": the current holder | same | [V-weak] |
| Telegram | Gift sheet | Row: Quantity | "**Quantity**", for example "**6 030 / 6 962 issued**" (a space as the thousands separator in that example) | same | [V-weak] |
| Telegram | Gift sheet | Provenance line | "**Gifted by … to … with the comment …**", the original gift transfer with sender, recipient, date and message | same | [V-weak] |
| Telegram | Public web | Collectible URL pattern | `t.me/nft/<GiftName>-<number>`, for example `https://t.me/nft/InputKey-1`. The page title is "Telegram: Collectible Gift". | https://t.me/nft/InputKey-1 | [V-weak] |
| Telegram | Wear | Effect copy | Upgraded gifts "can now be used as a **unique emoji status**, which gives them a **glittering star effect** and changes the appearance of your profile to **match the backdrop and symbol** from your collectible" | https://telegram.org/blog/wear-gifts-blockchain-and-more | [V] |
| Telegram | Wear | Path and button | "go to **My Profile > Gifts**, tap a gift and select '**Wear**'" | https://telegram.org/blog/wear-gifts-blockchain-and-more | [V] |
| Telegram | Transfer | Blockchain path | "My Profile > Gifts and tap one of your gifts, then select **Transfer > Send via Blockchain**" | https://telegram.org/blog/wear-gifts-blockchain-and-more | [V] |
| Telegram | Marketplace | Path | "**Settings > Gifts > Marketplace**", where listings are priced in Stars | https://telegram.org/blog/gift-marketplace-and-more (result set) | [V-weak] |
| Telegram | Auctions | Number assignment | "Your place in the auction determines the unique number of your gift — so the top bidder in Round 1 will receive the **#1** gift, 2nd place will get #2" | https://telegram.org/blog/live-stories-gift-auctions | [V] |
| Telegram | Upgrade | Price behaviour (2026, third-party) | The upgrade price "starts at 20,000 Stars and decays hourly toward a ~25-Star floor". The outcome is always a collectible, but the traits are random. | https://dropstab.com/research/alpha/what-are-telegram-gifts | [V-weak] |
| Telegram | Other features | Exist per blog titles | "Gift Collections" (grouping gifts), "Gift Crafting" (2026), "gift themes" | https://telegram.org/blog/post-search-story-albums-and-more ; https://telegram.org/blog/crafting-android-design-and-more ; https://telegram.org/blog/profile-music-gift-themes | [V] (existence only) |
| Telegram | Upgrade sheet | Literal sheet title, feature bullets, button label | NOT FOUND (only [B]) | — | — |

---

## 3. Discord Orbs, Quests and Shop (verified rows)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Discord | Orbs | Definition copy | "virtual rewards that you can earn by completing Quests. You can redeem them in the Shop for … Nitro credits and Orbs-exclusive items" | https://support.discord.com/hc/en-us/articles/30593690165783-Discord-Orbs-FAQ | [V] |
| Discord | Orbs balance (desktop) | Position | "your Orbs balance in the **top-right corner of Quest Home and Shop**" | same | [V] |
| Discord | Orbs balance (mobile) | Path | "tapping your avatar > **Orbs Balance**". Quests: "avatar > Settings > **Quests**". | same | [V] |
| Discord | Orbs balance (mobile) | Buttons | Tap your Orbs Balance in the "**You**" tab. "above the '**Earn Orbs**' button, you'll see an option to '**Redeem Orbs in Shop**'". | same (digest of query 24) | [V] |
| Discord | Shop | Orbs tab label | "**Orbs Exclusives**" tab at the top of the Shop (desktop). On mobile: tap the **Shop Menu icon in the upper-right**, then "Orbs Exclusives". The "**Shop All**" tab shows everything that can be claimed with Orbs. | same | [V] |
| Discord | Shop | Orb prices (PC Gamer) | Badge **70 Orbs**. Animated avatar border **3,500 Orbs**. "Misty Orbs profile background" **3,500 Orbs**. 3-day Nitro credit **1,400 Orbs**. | https://www.pcgamer.com/gaming-industry/discord-asks-users-to-ponder-its-orbs-an-earnable-currency-you-can-use-to-buy-nitro/ | [V-weak] (launch-era prices) |
| Discord | Orbs | Nitro multiplier | Nitro subscribers "can claim **1.2x** more Orbs" on Orb-reward Quests | https://support.discord.com/hc/en-us/articles/22225719947543-Discord-Quests-FAQ ; https://discord.com/blog/discord-orbs | [V] |
| Discord | Orbs | Monthly drop | Separate FAQ "Monthly Orbs Drop for Nitro Members". Contents not retrieved. | https://support.discord.com/hc/en-us/articles/37097755077015-Monthly-Orbs-Drop-for-Nitro-Members-FAQ | [V] (existence only) |
| Discord | Quests | Accept buttons | "**Accept Quest**" (Play Quest) and "**Start Video Quest**" (Video Quest), both available "through the **Quest bar** and **Quest Home**" | https://support.discord.com/hc/en-us/articles/22225719947543-Discord-Quests-FAQ | [V] |
| Discord | Quests | Claim | "hovering over the Quest bar and pressing the **Claim Reward** button" | same | [V] |
| Discord | Quests | Delivery | Discord rewards (Avatar Decorations, Orbs) are "automatically added to your Discord account once you claim it" | same | [V] |
| Discord | Blog | Marketing headline | "**Reward Your Play: Complete Quests. Earn Orbs. Get Sweet Stuff.**" | https://discord.com/blog/discord-orbs | [V] |
| Discord | Shop | Item categories (exact names) | "**Avatar Decorations**", "**Nameplates**", "**Profile Effects**", "**Profile Frames**" | https://support.discord.com/hc/en-us/articles/17162747936663-Shop-FAQ | [V] |
| Discord | Shop | Nameplate description | Nameplates "let you customize how your display name appears on Discord, adding flair to your name so it stands out with style in DMs, group chats, and servers" | https://support.discord.com/hc/en-us/articles/30408457944215-Nameplates-FAQ | [V] |
| Discord | Shop | Profile Effect description | "animated effects that play on your profile when someone views your profile" | https://support.discord.com/hc/en-us/articles/17828465914263-Profile-Effects | [V] |
| Discord | Shop | Bundles | Bundles of matching items from one collection "come with a discount". They are "available only if you haven't purchased any of the items included". | https://support.discord.com/hc/en-us/articles/17162747936663-Shop-FAQ | [V] |
| Discord | Shop | Nitro pricing | "special member pricing on eligible purchases", plus member-only items | same | [V] |
| Discord | Shop | Preview and Gift | Items can be previewed on your own profile before buying. Gifting is supported. | same | [V] |
| Discord | Shop | Other surfaces | Rental Decorations FAQ, Wishlist FAQ, "10 Days of Discord" limited collection. Contents not retrieved. | https://support.discord.com/hc/en-us/articles/36501705072279-Rental-Decorations-FAQ ; https://support.discord.com/hc/en-us/articles/36288192746903-Wishlist-FAQ | [V] (existence only) |
| Discord | Shop | Literal price-button text such as "Buy for x Orbs", the Orb icon art, tile layout | NOT FOUND | — | — |

---

## 4. Monopoly GO (verified rows)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Monopoly GO | Golden Blitz | What it is | A limited-time event and "the only way to trade gold stickers". It typically lasts up to 24 h. There is no fixed schedule, and it can run several times a month. | https://www.sportskeeda.com/esports/monopoly-go-q-a-avenue-trade-gold-stickers-golden-blitz-fps-drops-answered ; https://destructoid.com/?p=535169 | [V] (2 sources) |
| Monopoly GO | Golden Blitz | Scope | "Each event allows the trading of **two specific gold stickers**". Up to **five** gold-sticker trades per day during the event. | same | [V-weak] |
| Monopoly GO | Golden Blitz | Event icon | Tap "the event icon to open its menu, showing you two stickers you can exchange" | same | [V-weak] |
| Monopoly GO | Sticker trade | Send button | Album → pick the sticker → "**Send to a friend**" | same | [V-weak] |
| Monopoly GO | Sticker trade | One-for-one toggle | "slide the toggle next to '**Make an exchange!**'" | same | [V-weak] |
| Monopoly GO | Album | Structure | An album holds multiple Sticker Sets. **Each set = 9 stickers.** Completing a set gives rewards (for example free dice). Collecting every sticker in the album gives the "**HUGE REWARD**" (digest capitalisation). | https://www.pcinvasion.com/?p=410218 ; https://www.dexerto.com/monopoly-go/sticker-album-end-monopoly-go-2784190 | [V] |
| Monopoly GO | Album | Rarity | 1-star to 5-star (5 is rarest). Gold Stickers are rarer than stickers with the same star count. | same | [V-weak] |
| Monopoly GO | Sticker packs | Colour by tier | **Green** (1-star): 2 stickers, 1 guaranteed 1-star. **Yellow** (2-star): 3 stickers, 1 guaranteed 2-star. **Pink** (3-star): 3 stickers, 1 guaranteed 3-star. | https://www.gamerevolution.com/guides/962282-monopoly-go-sticker-strategy-how-to-get-stickers-new-gold-guide-packs-album (result set) | [V-weak] |
| Monopoly GO | Stars / vaults | Duplicates → Stars | Duplicate stickers become Stars. A gold sticker is worth twice its star value. | https://destructoid.com/?p=632771 | [V-weak] |
| Monopoly GO | Stars / vaults | Safe tiers (from one album) | "Orange Safe (250 stars), Blue Safe (500 stars), Gold Safe (1000 stars)". A later digest mentions a "**purple sticker vault**" that holds a blue, a purple and a "**Galaxy**" pack, so vault names change with each album. | https://primagames.com/?p=324952 ; https://www.destructoid.com/monopoly-go-swap-pack-explained/ | [V-weak] |
| Monopoly GO | Swap Pack | Contents | **4 stickers, all guaranteed above 3 stars.** During a Sticker Boom it gives 6 stickers. | https://www.destructoid.com/monopoly-go-swap-pack-explained/ | [V-weak] |
| Monopoly GO | Swap Pack | Swap rule | You can swap up to **3** stickers per pack. Each swap gives a random sticker **from the same tier**. | same | [V-weak] |
| Monopoly GO | Swap Pack | Origin and sources | First introduced as milestone rewards in the "**Peg-E Sticker Drop**" event. Also a grand prize in Treasures, Partners and Tycoon Racers events. | same ; https://thefilibusterblog.com/maximize-your-rewards-in-monopoly-go-tips-to-earn-more-swap-packs/ | [V-weak] |

---

## BACKGROUND KNOWLEDGE [B] (NOT verified this session; do not merge into the tables above)

Confidence: **high** = I am confident and it is widely documented. **medium** = likely, but details may be off. **low** = an impression; treat it as a placeholder.

| App | Surface | Element | Recalled value | Tag | Confidence |
|---|---|---|---|---|---|
| TCG Pocket | Packs screen | Pack selection | You pick a set, then a horizontal carousel of that set's booster-pack art (for example Genetic Apex had Charizard, Mewtwo and Pikachu packs). Tap the centred pack, then confirm with an "Open" button. | [B] | medium |
| TCG Pocket | Packs screen | Timer format | Countdown shown as hh:mm:ss next to or under the stamina bar. The literal prefix ("Next pack in", "Time until next pack") is unknown. | [B] | low |
| TCG Pocket | Pack open | Cut gesture visual | A dotted or glowing guide line across the top of the pack. After the swipe, the foil top tears off and the cards slide out. | [B] | medium |
| TCG Pocket | Pack open | Per-card reveal | Cards are stacked face-up. Swipe the front card sideways to send it away and show the next. Rare cards (☆ and up) get a pause, glow or special animation. | [B] | medium |
| TCG Pocket | Pack open | Results | After the 5th card, all five are laid out together (a 3-over-2 arrangement). Cards not yet in the dex carry a "NEW" marker. Then "swipe up" registers them, with dex counters ticking up. | [B] | low–medium |
| TCG Pocket | Global nav | Bottom bar | Five items, roughly Home · My Cards · Battle · Social · Menu, with Battle visually emphasised in the centre. | [B] | low |
| TCG Pocket | UI colour | Palette | Mostly white or very light grey backgrounds and panels, rounded-corner cards, soft drop shadows. Primary buttons are teal or turquoise pills with white text, and secondary buttons are white or grey. | [B] | low |
| TCG Pocket | UI font | Typeface | A rounded or humanist sans-serif, probably a licensed Japanese/Latin pair. Exact family unknown. | [B] | low |
| TCG Pocket | Card face | Top row | Stage label ("Basic" / "Stage 1" / "Stage 2") at top-left, name to its right. Stage 1 and 2 cards show a small evolves-from portrait near the stage label. HP at top-right written "HP" + number, with the type (energy) icon to its right. | [B] | medium |
| TCG Pocket | Card face | Body | Illustration window under the name bar. Attack rows: energy-cost icons left, attack name centre, damage number right, effect text below. Ability shown above attacks, in a distinct red/orange "Ability" tag. | [B] | medium |
| TCG Pocket | Card face | Bottom | "Weakness" (type icon + "+20") and "Retreat" (colourless energy icons). No Resistance. "Illus. <name>" bottom-left with the rarity mark below it (rarity position verified in file 05). | [B] | medium |
| TCG Pocket | Card face | Set or collector number on the face | Probably not printed on the face the way physical cards do. Community and DB notation is "A1 001" / "A1-001" / "001/286". Exact in-app display unknown. | [B] | low |
| TCG Pocket | Card frame | Border | A thin light silver/grey frame, unlike the yellow of older physical cards. Full-art ☆ cards are borderless art with a thin frame line. Crown (👑) cards are gold-toned. | [B] | low–medium |
| TCG Pocket | Card back | Default design | A Pocket-specific default card back. Card Sleeves (Shop accessories) replace it. Exact art unknown. | [B] | low |
| TCG Pocket | Wonder Pick | Feed tile | Each tile shows the opener's name and icon plus their 5 pulled cards in a small fanned or row layout, plus the stamina cost. A filter/sort control is near the top. "Bonus Pick" and "Chansey Pick" variants have special tile styling. | [B] | low–medium |
| TCG Pocket | Wonder Pick | Stamina display | "Wonder Stamina" shown as a meter of up to 5 pips near the top of the Wonder Pick screen, with a countdown to the next pip | [B] | low |
| TCG Pocket | Wonder Pick | Pick animation | The chosen pack's 5 cards are shown face-up, flip face-down, shuffle with motion, then spread out. You tap one to flip it. | [B] | medium |
| TCG Pocket | Trade | Completed-trade animation | The two cards cross or swap between the players with a sparkle effect | [B] | low |
| TCG Pocket | Shinedust | Icon | A sparkling, glitter-like dust icon in pale purple/pink/blue | [B] | low |
| TCG Pocket | My Cards | Controls | A search magnifier, a sort control (for example by number, rarity or type) and a filter sheet (by pack/set, rarity, type) above the grid. The "Card Dex" toggle sits near the top (verified in file 05). | [B] | low–medium |
| Telegram | Upgrade sheet | Title and feature rows | Title "Upgrade Gift". Three bullet rows: "**Unique**" (get a unique number, model, backdrop and symbol), "**Transferable**" (send to friends on Telegram), "**Tradable**" (sell or auction on NFT marketplaces). Button: "Upgrade for ⭐ N". Above the bullets, a live preview cycles randomly through possible models and backdrops. | [B] | medium |
| Telegram | Upgrade sheet | Pre-paid upgrade | A sender can pay the upgrade fee in advance ("Make Unique" toggle on the gift send screen). The receiver then sees "Upgrade for Free" (exact text unsure). | [B] | low–medium |
| Telegram | Gift sheet | Header visual | The model's animated sticker sits centred on a **radial gradient** backdrop (centre colour → edge colour). The Symbol is repeated as small low-opacity monochrome icons in concentric rings around the model. The gift name is in bold white and "Collectible #N" sits below it in lighter text. | [B] | medium |
| Telegram | Gift sheet | Rarity % display | Each attribute row reads "Model · <name> · <pill: N%>". The percentage sits in a small rounded pill tinted to match the backdrop, to the right of the value. | [B] | medium |
| Telegram | Gift sheet | Action buttons | A row of small icon buttons on the backdrop header: "Transfer", "Wear" (or "Take Off" while worn), "Sell" ("Unlist" when listed). There is also a Share option. | [B] | low–medium |
| Telegram | Wear sheet | Copy | Title "Wear <Gift Name>". Bullets about a radiant badge and unique profile design matching the gift, and proof of ownership. Button "Start Wearing". | [B] | low |
| Telegram | Profile when worn | Look | Profile header recoloured with the backdrop gradient. Symbol pattern around the avatar. The gift shows as the emoji status next to the name, with a glittering effect (verified in the blog). | [B] | medium |
| Telegram | Transfer confirm | Copy | "Do you want to transfer ownership of <Gift> to <User>?" with a confirm button that shows the Stars fee when there is one | [B] | low |
| Discord | Orbs icon | Visual | A glossy spherical "orb" glyph, purple/blue/pink, shown as a small icon before the number in the balance pill | [B] | low–medium |
| Discord | Quest bar | Placement | A collapsible Quest bar in the bottom-left above the user panel on desktop. It shows the game art, a progress bar (for example "x of 15 minutes"), then "Claim Reward" on completion. | [B] | medium |
| Discord | Quest card | Layout | Quest Home card: hero image of the game or brand, a sponsored-by line, the reward thumbnail and name, the task (for example "Play <Game> for 15 minutes", "Watch the video"), an expiry date, and an "Accept Quest" primary button (blurple) | [B] | medium |
| Discord | Shop tile | Layout | A square tile with the item preview (animated on hover), item name, then price. Non-Nitro price in local currency, Nitro member price shown with a Nitro icon. Orb items show an Orb icon + number. | [B] | low–medium |
| Discord | Shop | Item sheet buttons | "Buy for <price>" style primary button plus a gift button. Exact copy unknown. | [B] | low |
| Monopoly GO | Sticker packs | Higher tiers | Blue pack (4-star guarantee) and Purple pack (5-star guarantee), plus special packs (for example Galaxy/Rainbow, Swap). | [B] | medium |
| Monopoly GO | Album UI | Set tiles | A grid of set tiles with set art, set name, an "x/9" counter and the reward (dice) shown. Stickers appear as square cards with a star row (1–5) and a gold frame for gold stickers. | [B] | medium |
| Monopoly GO | Golden Blitz | Banner | Gold/yellow "GOLDEN BLITZ" event art showing the two featured gold stickers and a countdown timer | [B] | low–medium |
| Monopoly GO | Swap Pack | UI | The four stickers are shown with a swap button on each and a counter of remaining swaps (3) | [B] | low |

---

## Gaps (UNKNOWN after this session)

**TCG Pocket**
- Literal pack-timer string (for example "Next pack in 11:59:00") and the exact label of the open button ("Open" vs "Open Booster Pack" from file 05). Pack-carousel layout is unverified.
- Whether a "NEW" badge or results grid exists, and any "Skip", "Next" or "Open another" button text after a pack opening.
- Every card-face position (name, HP, type icon, stage label, attack rows, weakness and retreat row, "Illus." line) and whether a set number such as "A1 001/286" appears on the face. Card frame colour. Card-back art.
- In-app My Cards tab, sort and filter labels (only third-party PokéBase filter names were found). In-app Card Dex labels.
- Wonder Pick tile layout, the label of the button that starts a pick, and the stamina icon.
- Trade screen sub-tabs ("Offers", "History" and so on), the Shinedust icon and colour, the trade animation, and the "Trading Board" feature.
- Flair screen labels beyond "Obtain Flair" (from file 05).
- Missions in-app tab labels and whether a "Claim All" button exists.
- Premium Pass paywall headline, bullet copy and CTA text.
- All UI colours, fonts, haptic patterns and sound names.

**Telegram**
- Upgrade-sheet title, bullet copy and button label.
- Wear-sheet copy, Transfer-confirmation copy, the backdrop gradient spec, and symbol-pattern geometry.
- Crafting UI (2026).

**Discord**
- Orb icon art, exact price-button copy ("Buy for x Orbs"?), shop tile layout, and Quest card layout and progress copy.
- Current (2026) Orb prices.

**Monopoly GO**
- Exact Golden Blitz banner and modal copy.
- Album-screen labels, set-tile layout, and vault/safe names for the current album.
- Swap Pack UI copy.
- 4-star and 5-star pack colours (only Green, Yellow and Pink were verified).

## Search log (26 calls)
1 TCGP pack stamina/home · 2 pack reveal (no data) · 3 pack reveal (ext) · 4 card layout / Bulbapedia (no data) · 5 My Cards (third-party only) · 6 Wonder Pick · 7 game8 UI Explained (ext) · 8 Trade · 9 Missions · 10 Shop · 11 Telegram wear · 12 Telegram upgrade attributes (ext) · 13 Telegram upgrade sheet · 14 Telegram Jan-2025 blog · 15 Discord Orbs FAQ · 16 Discord Quests FAQ · 17 Discord Shop (API error, blocked domain in filter) · 18 Discord Shop · 19 Golden Blitz · 20 Sticker album · 21 Swap Packs · 22 Social Hub / nav · 23 Premium Pass · 24 Discord Orb prices · 25 pack results screen (ext) · 26 Telegram gift sheet fields (ext)
