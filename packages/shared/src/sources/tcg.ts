/**
 * Pokémon TCG Pocket: packs, card frame, My Cards, Card Dex, wishlist, binders, Wonder Pick,
 * Social Hub trading, Shinedust, Flair, Missions, Premium Pass. Research: research/05 and research/13.
 * Our four tiers map onto Pocket's ladder (packages/shared/src/cards.ts): ◇ / ◇◇ / ☆ / ☆☆☆.
 */
export const tcg = {
  /* ── Navigation (game8) ── */
  /** [V-weak] bottom-nav items "Home", "My Cards", "Social Hub", "Battle" (research/13 §1.1); Battle is not used */
  home: 'Home',
  /** [V-weak] bottom-nav item; the card icon is the 2nd icon */
  myCards: 'My Cards',
  /** [V-weak] bottom-nav item that holds Trade */
  socialHub: 'Social Hub',
  /** [V-weak] home buttons, in game8's order */
  boosterPacks: 'Booster Packs',
  /** [V] */
  wonderPick: 'Wonder Pick',
  /** [V-weak] */
  shop: 'Shop',
  /** [V-weak] */
  missions: 'Missions',
  /** [V-weak] pinned binder top-left of Home */
  favorites: 'Favorites',
  /** [V-weak] */
  pass: 'Pass',
  /** [V-weak] Social Hub menu, in order */
  communityShowcase: 'Community Showcase',
  /** [V-weak] */
  friends: 'Friends',
  /** [V-weak] */
  trade: 'Trade',

  /* ── Packs (research/05 §1.4–1.5; research/13 §1.2–1.3) ── */
  /** [V-weak] button label at the end of pack selection */
  openBoosterPack: 'Open Booster Pack',
  /** [V] "swipe a finger across the top of the digital package" */
  swipeToOpen: 'Swipe across the top',
  /** [V] prompt after all five cards: "swipe up" to add them to the card dex */
  swipeUp: 'Swipe up',
  /** [V] "Pack Stamina" progress bar with a timer, top-right of the Packs screen */
  packStamina: 'Pack Stamina',
  /** [B-low-med] marker on cards not yet in the dex */
  newBadge: 'NEW',
  /** [I] research/inspo/store/tcg-01-pack-select.webp — left pill under the packs · first-party App Store screenshot [V] */
  offeringRates: 'Offering Rates',
  /** [I] research/inspo/store/tcg-01-pack-select.webp — right pill "Select other booster packs ›" · App Store screenshot [V] */
  selectOtherPacks: 'Select other booster packs',
  /** [I] research/inspo/store/tcg-01-pack-select.webp — pack-points badge "40 pts" · App Store screenshot [V] */
  pts: (n: number) => `${n.toLocaleString()} pts`,
  /** [I] research/inspo/frames/tcg-card-reveal.jpg — caption under the round ⏩ button during the reveal · video frame [V-weak] */
  tapAndHold: 'Tap and hold',
  /** [I] research/inspo/store/tcg-02-share-card.webp — bottom sheet label over the "2 › 1" stepper · App Store screenshot [V] */
  numberOwned: 'Number owned',
  /** [V] "Rare Pack" (0.05%) */
  rarePack: 'Rare Pack',
  /** [V] Pack Points: 5 per pack */
  packPoints: 'Pack Points',
  /** [V-weak] "you'll get updates on the number of unique cards and the total number of cards you've collected" */
  collectionCounter: (unique: number, total: number) => `${unique} / ${total}`,

  /* ── Rarity names (PokéBase list [V-weak]; mapped to our four tiers) ── */
  /** [V-weak] ◇ */
  rCommon: 'Common',
  /** [V-weak] ◇◇ */
  rUncommon: 'Uncommon',
  /** [V] ☆ "Art Rare" */
  rArtRare: 'Art Rare',
  /** [V] ☆☆☆ "Immersive Rare" */
  rImmersive: 'Immersive Rare',

  /* ── Card face ([B-med] layout; rarity mark position [V]) ── */
  /** [B-med] illustrator line, bottom-left, rarity mark under it [V] */
  illus: (name: string) => `Illus. ${name}`,
  /** [B-low] collector number "A1 001/286": set code, number, set size */
  number: (set: string, n: number, of: number) => `${set} ${String(n).padStart(3, '0')}/${String(of).padStart(3, '0')}`,

  /* ── My Cards / Card Dex / wishlist / binders ── */
  /** [V] toggle that lists missing cards without their appearance */
  cardDex: 'Card Dex',
  /** [V] wishlist (up to 20, 3 highlighted) */
  wishlist: 'Wishlist',
  /** [V] binders show up to 30 cards */
  binders: 'Binders',
  /** [V] single-card showcase */
  displayBoards: 'Display Boards',
  /** [V] binder visibility options (spec §C drops Public) */
  private: 'Private',
  /** [V] */
  friendsOnly: 'Friends only',

  /* ── Wonder Pick (research/05 §1.11; research/13 §1.4) ── */
  /** [V] stamina name */
  wonderStamina: 'Wonder Stamina',
  /** [V-weak] "Wonder Picks from friends will always display first" */
  wonderFriendsFirst: 'Friends',

  /* ── Trade (research/05 §1.12; research/13 §1.5) ── */
  /** [V] Shinedust (replaced Trade Tokens, July 2025) */
  shinedust: 'Shinedust',
  /** [V] "Every trade—free or otherwise—consumes 1 Trade Stamina." */
  tradeStamina: 'Trade Stamina',
  /** [V-weak] confirm */
  ok: 'OK',
  /** [V-weak] receiver opens the offer */
  view: 'View',
  /** [V-weak] receiver accepts by tapping "Trade" */
  acceptTrade: 'Trade',
  /** [V-weak] */
  decline: 'Decline',
  /** [V-weak] sender finishes: "swipe up to send your card" */
  swipeUpToSend: 'Swipe up to send your card',
  /** [V-weak] offers are cancelled after two days */
  expiresDays: 2,

  /* ── Flair (research/05 §1.13) ── */
  /** [V] */
  obtainFlair: 'Obtain Flair',
  /** [V-weak] flair flow: "choose a flair type → 'exchange'"; Pack Points "are exchanged for cards" (research/05 §1.13, research/13 §1.1) */
  exchange: 'Exchange',
  /** [V] first flair, cosmetic */
  sparkleFlair: 'Sparkle Flair: Gold',

  /* ── Missions (research/13 §1.6) ── */
  /** [V-weak] heading */
  dailyMissions: 'Daily Missions',
  /** [V-weak] example mission copy "Wonder pick 5 times" */
  missionWonder: (n: number) => `Wonder pick ${n} times`,
  /** [V-weak] example mission copy "Collect 99 Cards" */
  missionCollect: (n: number) => `Collect ${n} Cards`,

  /* ── Shop: Special Shop item kinds (research/13 §1.7, "Card Sleeve 12 · Playmat 26 · Backdrop 7 · Cover 7") ── */
  /** [V-weak] Special Shop item; replaces the card back [B-low] */
  cardSleeve: 'Card Sleeve',
  /** [V-weak] Special Shop item; binder covers "each have differing colours of background" [V] */
  cover: 'Cover',
  /** [V-weak] Special Shop item; Display Boards take "backdrops" [V] */
  backdrop: 'Backdrop',

  /* ── Premium Pass ── */
  /** [V-weak] Premium Pass: "open one more pack every 24 hours" · subst 24 hours→week */
  passExtraPack: 'open one more pack every week',
  /** [V] name */
  premiumPass: 'Premium Pass',
} as const;
