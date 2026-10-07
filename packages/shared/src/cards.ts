import type { Post, Rarity } from './types.ts';
import { tcg } from './sources/tcg.ts';
import { imessage } from './sources/messages.ts';

/**
 * Friend Cards economy, adapted from Pokémon TCG Pocket (research/05 §1).
 *
 * The rarity ladder collapses TCG Pocket's eight tiers into the spec's four (spec §J):
 *   common    ◇        ← TCG 1◇
 *   rare      ◇◇       ← TCG 2◇ + 3◇ + 4◇
 *   holo      ☆        ← TCG 1☆ + 2☆
 *   immersive ☆☆☆     ← TCG 3☆ + 👑   (golden stars, animated from a Live clip)
 *
 * Rarity attaches to MOMENTS, not people: a moment can be printed at any tier up to the highest
 * tier its qualities earn (spec "untested combinations": rank moments, never friends).
 */

export const RARITIES: Rarity[] = ['common', 'rare', 'holo', 'immersive'];

export const RARITY_MARK: Record<Rarity, string> = {
  common: '◇',
  rare: '◇◇',
  holo: '☆',
  immersive: '☆☆☆',
};

/** Displayed tier names come from the TCG Pocket deck (◇ Common, ◇◇ Uncommon, ☆ Art Rare, ☆☆☆ Immersive Rare). */
export const RARITY_NAME: Record<Rarity, string> = {
  common: tcg.rCommon,
  rare: tcg.rUncommon,
  holo: tcg.rArtRare,
  immersive: tcg.rImmersive,
};

export function rarityRank(r: Rarity) {
  return RARITIES.indexOf(r);
}

/**
 * Pull rates. Cards 1–3 are always common ("Three of the five cards in every pack are guaranteed
 * to be 1-Diamond cards"). Cards 4 and 5 use TCG Pocket's published tables merged into four tiers:
 *
 *   4th card: 2◇ 90 + 3◇ 5 + 4◇ 1.666 = 96.666 rare · 1☆ 2.572 + 2☆ 0.5 = 3.072 holo · 3☆ 0.222 + 👑 0.04 = 0.262 immersive
 *   5th card: 2◇ 60 + 3◇ 20 + 4◇ 6.664 = 86.664 rare · 1☆ 10.288 + 2☆ 2 = 12.288 holo · 3☆ 0.888 + 👑 0.16 = 1.048 immersive
 */
export const SLOT_ODDS: Record<'slot4' | 'slot5', Partial<Record<Rarity, number>>> = {
  slot4: { rare: 96.666, holo: 3.072, immersive: 0.262 },
  slot5: { rare: 86.664, holo: 12.288, immersive: 1.048 },
};

/** TCG Pocket "Rare Pack": 0.05% (1 in 2,000), ☆ and above only. Art Rare 40 + SAR/SR 50 → holo 90; Immersive 5 + crown 5 → immersive 10. */
export const RARE_PACK_CHANCE = 0.0005;
export const RARE_PACK_ODDS: Partial<Record<Rarity, number>> = { holo: 90, immersive: 10 };

export const PACK_SIZE = 5;

/** TCG Pocket: 5 Pack Points per pack; exchange costs 1◇ 35 · 3◇ 150 · 1☆ 500 · 3☆ 1,500. */
export const PACK_POINTS_PER_PACK = 5;
export const PACK_POINT_COST: Record<Rarity, number> = { common: 35, rare: 150, holo: 500, immersive: 1500 };

/** TCG Pocket Wonder Pick: 5 face-down cards, stamina max 5, +1 every 12 h; cost by target rarity 1/2/3/4. */
export const WONDER = { maxStamina: 5, regenMs: 12 * 3_600_000, cost: { common: 1, rare: 2, holo: 3, immersive: 4 } as Record<Rarity, number> };

/**
 * TCG Pocket trading (Shinedust era): same-rarity swaps only; 3◇ 1,200 · 1☆ 4,000 · 4◇ 5,000 Shinedust;
 * every trade consumes 1 Trade Stamina (pre-update cadence: 1 per 24 h, max 5).
 * Spec §J: rare cards (holo, immersive) trade only during the ritual-day window (Monopoly GO Golden Blitz).
 */
export const TRADE = {
  maxStamina: 5,
  regenMs: 24 * 3_600_000,
  cost: { common: 0, rare: 1200, holo: 4000, immersive: 5000 } as Record<Rarity, number>,
  ritualOnly: ['holo', 'immersive'] as Rarity[],
};

/** TCG Pocket wishlist: up to 20 cards, 3 highlighted. Binders: 30 cards each, up to 15. */
export const WISHLIST = { max: 20, highlighted: 3 };
export const BINDER = { slots: 30, max: 15 };

/** Shinedust from duplicates (TCG Pocket doubled this in July 2025). Values are product parameters. */
export const DUST_FROM_DUPLICATE: Record<Rarity, number> = { common: 20, rare: 120, holo: 600, immersive: 1500 };
/** TCG Pocket: 50 Shinedust per level-up. */
export const DUST_PER_LEVEL = 50;

/** TCG Pocket "Sparkle Flair: Gold": 3 extra copies + 50 Shinedust. */
export const FLAIR = { id: 'sparkle_gold', name: 'Sparkle Flair: Gold', duplicates: 3, dust: 50 };

/** Telegram-style numbered upgrade (spec §J): cost in Shinedust. */
export const UPGRADE_COST: Record<Rarity, number> = { common: 200, rare: 600, holo: 1500, immersive: 3000 };

/* ───────────────────────── Moment → max tier ───────────────────────── */

export interface MomentSignals {
  kind: Post['kind'];
  ritual: boolean;
  hasLive: boolean;
  hasCaption: boolean;
  hasVoice: boolean;
  inPlanAlbum: boolean;
  remembered: boolean;
  frame: string | null;
}

export function signalsOf(post: Post, inPlanAlbum = false): MomentSignals {
  return {
    kind: post.kind,
    ritual: post.ritual,
    hasLive: Boolean(post.media.live),
    hasCaption: Boolean(post.caption && post.caption.trim()),
    hasVoice: Boolean(post.media.voice),
    inPlanAlbum,
    remembered: post.remember,
    frame: post.frame,
  };
}

/** The highest tier a moment can be printed at. Immersive needs a Live clip (spec: "animated from a Live Photo"). */
export function maxTier(s: MomentSignals): Rarity {
  if (s.hasLive) return 'immersive';
  if (s.kind === 'dual' || s.kind === 'rewind' || s.inPlanAlbum || s.remembered || s.frame) return 'holo';
  if (s.ritual || s.hasCaption || s.hasVoice) return 'rare';
  return 'common';
}

/* ───────────────────────── Pack opening ───────────────────────── */

export type Rng = () => number;

function pickWeighted<T extends string>(odds: Partial<Record<T, number>>, rng: Rng): T {
  const entries = Object.entries(odds) as [T, number][];
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let roll = rng() * total;
  for (const [k, w] of entries) {
    roll -= w;
    if (roll < 0) return k;
  }
  return entries[entries.length - 1][0];
}

export interface PoolMoment {
  postId: string;
  maxTier: Rarity;
  /** Belongs to the pack's set (the week that developed). */
  inSet: boolean;
}

export interface PulledCard {
  postId: string;
  rarity: Rarity;
}

export interface PackResult {
  rarePack: boolean;
  cards: PulledCard[];
  /** Index of the first card above common — drives the TCG "glow + crack" tell. */
  tell: 'none' | 'glow' | 'crack';
}

function choose<T>(list: T[], rng: Rng): T {
  return list[Math.floor(rng() * list.length) % list.length];
}

/** Pick a moment printable at `tier`, preferring the pack's set, else any week; downgrade if none qualify. */
function momentFor(pool: PoolMoment[], tier: Rarity, rng: Rng): PulledCard | null {
  for (let t = rarityRank(tier); t >= 0; t--) {
    const want = RARITIES[t];
    const ok = pool.filter((m) => rarityRank(m.maxTier) >= t);
    if (!ok.length) continue;
    const inSet = ok.filter((m) => m.inSet);
    const m = choose(inSet.length ? inSet : ok, rng);
    return { postId: m.postId, rarity: want };
  }
  return null;
}

export function openPack(pool: PoolMoment[], rng: Rng = Math.random): PackResult {
  if (!pool.length) return { rarePack: false, cards: [], tell: 'none' };
  const rarePack = rng() < RARE_PACK_CHANCE;
  const tiers: Rarity[] = rarePack
    ? Array.from({ length: PACK_SIZE }, () => pickWeighted(RARE_PACK_ODDS, rng))
    : ['common', 'common', 'common', pickWeighted(SLOT_ODDS.slot4, rng), pickWeighted(SLOT_ODDS.slot5, rng)];
  const cards = tiers.map((t) => momentFor(pool, t, rng)).filter((c): c is PulledCard => c !== null);
  const best = Math.max(...cards.map((c) => rarityRank(c.rarity)));
  const tell = best >= rarityRank('immersive') || rarePack ? 'crack' : best >= rarityRank('holo') ? 'glow' : 'none';
  return { rarePack, cards, tell };
}

export interface OddsTable {
  /** Pack positions (1-based) and the percent chance of each tier at those positions. */
  slots: { positions: number[]; odds: Partial<Record<Rarity, number>> }[];
  /** TCG Pocket "Rare Pack": percent chance per pack and its per-card tier odds. */
  rarePack: { chance: number; odds: Partial<Record<Rarity, number>> };
}

/** Expected odds table shown in-app before any pack purchase (spec §J: odds shown). Data only, no labels. */
export function oddsTable(): OddsTable {
  return {
    slots: [
      { positions: [1, 2, 3], odds: { common: 100 } },
      { positions: [4], odds: SLOT_ODDS.slot4 },
      { positions: [5], odds: SLOT_ODDS.slot5 },
    ],
    rarePack: { chance: RARE_PACK_CHANCE * 100, odds: RARE_PACK_ODDS },
  };
}

/* ───────────────────────── Stamina ───────────────────────── */

export interface StaminaState {
  value: number;
  /** Timestamp the value was last computed at. */
  at: number;
}

export function staminaNow(s: StaminaState, max: number, regenMs: number, now: number): StaminaState {
  if (s.value >= max) return { value: max, at: now };
  const gained = Math.floor((now - s.at) / regenMs);
  if (gained <= 0) return s;
  const value = Math.min(max, s.value + gained);
  return { value, at: value >= max ? now : s.at + gained * regenMs };
}

export function nextStaminaAt(s: StaminaState, max: number, regenMs: number) {
  return s.value >= max ? null : s.at + regenMs;
}

/* ───────────────────────── Trading ───────────────────────── */

export type TradeCheck = { ok: true; dust: number } | { ok: false; reason: 'rarity_mismatch' | 'ritual_window' | 'no_stamina' | 'no_dust' | 'same_owner' };

export function checkTrade(opts: {
  offer: Rarity;
  want: Rarity;
  fromUserId: string;
  toUserId: string;
  stamina: number;
  dust: number;
  ritualOpen: boolean;
}): TradeCheck {
  if (opts.fromUserId === opts.toUserId) return { ok: false, reason: 'same_owner' };
  if (opts.offer !== opts.want) return { ok: false, reason: 'rarity_mismatch' };
  if (TRADE.ritualOnly.includes(opts.offer) && !opts.ritualOpen) return { ok: false, reason: 'ritual_window' };
  if (opts.stamina < 1) return { ok: false, reason: 'no_stamina' };
  const cost = TRADE.cost[opts.offer];
  if (opts.dust < cost) return { ok: false, reason: 'no_dust' };
  return { ok: true, dust: cost };
}

/* ───────────────────────── Numbered upgrade traits (Telegram) ───────────────────────── */

/**
 * Telegram collectibles get "a random set of secondary traits, including a background color, icon and
 * number" [V]. The % Telegram shows next to each trait is the share of the collection that has it [V];
 * the server computes it from the cards actually issued in the group, so no weights are stored here.
 */
export interface Trait {
  id: string;
  name: string;
}

/** Mixes a #RRGGBB hex toward black by `amount` (0–1): the dark edge of a radial backdrop. */
export function darken(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (shift: number) => Math.round(((n >> shift) & 255) * (1 - amount));
  return `#${[16, 8, 0].map((sh) => ch(sh).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

/**
 * Backdrops: Apple's system colors by name with their light-mode hexes [HIG] (Telegram's own backdrop
 * set is UNKNOWN). Drawn as a radial gradient from the hex at the centre to a darker mix at the edge
 * ("radial gradient backdrop (centre colour → edge colour)" [B-med]).
 */
export const BACKDROPS: (Trait & { from: string; to: string })[] = (
  [
    ['red', 'Red', '#FF3B30'],
    ['orange', 'Orange', '#FF9500'],
    ['yellow', 'Yellow', '#FFCC00'],
    ['green', 'Green', '#34C759'],
    ['mint', 'Mint', '#00C7BE'],
    ['teal', 'Teal', '#30B0C7'],
    ['cyan', 'Cyan', '#32ADE6'],
    ['blue', 'Blue', '#007AFF'],
    ['indigo', 'Indigo', '#5856D6'],
    ['purple', 'Purple', '#AF52DE'],
    ['pink', 'Pink', '#FF2D55'],
    ['brown', 'Brown', '#A2845E'],
    ['gray', 'Gray', '#8E8E93'],
  ] as const
).map(([id, name, hex]) => ({ id, name, from: hex, to: darken(hex, 0.45) }));

/** Symbols: the iMessage Tapback set [V], shown as the repeated grey icons on the backdrop. */
export const SYMBOLS: Trait[] = imessage.tapbacks.map((e, i) => ({ id: `tapback${i}`, name: e }));

export const backdropById = (id: string | undefined) => BACKDROPS.find((b) => b.id === id);
export const symbolById = (id: string | undefined) => SYMBOLS.find((s) => s.id === id);

/** Both traits are rolled uniformly — no invented weights. */
export function rollTraits(rng: Rng = Math.random) {
  return { backdrop: choose(BACKDROPS, rng), symbol: choose(SYMBOLS, rng) };
}

/** Maps any stored trait ids (including retired ones) onto the current tables, deterministically per card. */
export function normalizeTraits(raw: { backdrop?: string; symbol?: string } | null | undefined, seed: string) {
  if (!raw) return null;
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return {
    backdrop: backdropById(raw.backdrop)?.id ?? BACKDROPS[h % BACKDROPS.length].id,
    symbol: symbolById(raw.symbol)?.id ?? SYMBOLS[(h >>> 8) % SYMBOLS.length].id,
  };
}

/* ───────────────────────── Sparks (Discord Orbs analogue, no ads) ───────────────────────── */

/**
 * Discord Quest payouts [V-weak]: 200 for small actions, 700 for big ones. Ad-paying Quests are omitted
 * (spec §J); Sparks come only from posting, playing and reacting.
 */
export const SPARKS_EARN = {
  post: 200,
  reactRecap: 200,
  missions: 200,
  ritualPost: 700,
  playGame: 700,
  questComplete: 700,
} as const;

/**
 * Discord Orb prices [V-weak] (PC Gamer, launch era): animated avatar decoration / profile background
 * 3,500 Orbs, badge 70 Orbs, 3-day Nitro credit 1,400 Orbs. A pack costs the Nitro-credit price.
 */
export const SPARKS_PRICE = {
  extraPack: 1400,
  decoration: 3500,
  premium: 1400,
  badge: 70,
} as const;

/* ───────────────────────── Missions (TCG Pocket Daily Missions) ───────────────────────── */

/**
 * TCG Pocket mission copy patterns "Wonder pick N times" and "Collect N Cards" [V-weak]. Goals are product
 * parameters: Wonder Stamina refills 2 a day (+1 every 12 h), so 2 picks a day is the natural cap.
 */
export const MISSIONS = { wonder: 2, collect: 2 } as const;

/* ───────────────────────── Albums (Monopoly GO) ───────────────────────── */

/** Monopoly GO: completing a sticker set gives a reward [V]. Here a week's set rewards one pack. */
export const SET_REWARD_PACKS = 1;
