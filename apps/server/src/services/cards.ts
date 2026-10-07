import {
  BACKDROPS,
  BINDER,
  DUST_FROM_DUPLICATE,
  FLAIR,
  MISSIONS,
  PACK_POINTS_PER_PACK,
  PACK_POINT_COST,
  RARITIES,
  RARITY_MARK,
  RARITY_NAME,
  SET_REWARD_PACKS,
  SPARKS_EARN,
  SPARKS_PRICE,
  TRADE,
  UPGRADE_COST,
  WISHLIST,
  WONDER,
  backdropById,
  canBuyPaidPacks,
  checkTrade,
  localParts,
  nextStaminaAt,
  normalizeTraits,
  oddsTable,
  openPack,
  rarityRank,
  ritualWindow,
  rollTraits,
  staminaNow,
  symbolById,
  tcg,
  zonedToUtc,
  type Group,
  type Rarity,
} from '@app/shared';
import { all, db, get, json, now, run, tx } from '../db.ts';
import { addCurrency, cardsFor, getCard, getGroup, getUser, id, insertCard, members, membership, postsForGroup, publicUser, type CardFull, type PostFull } from '../repo.ts';
import { toDTO, visiblePosts } from './posts.ts';
import { toUser } from '../realtime.ts';
import { push } from './notify.ts';

/**
 * Friend Cards (spec §J) on top of the shared TCG Pocket-derived economy in packages/shared/src/cards.ts.
 * Pushes carry deck titles (tcg deck) and data-only bodies (a name and a rarity mark).
 */

export class GameError extends Error {
  constructor(public code: string, message?: string) {
    super(message ?? code);
  }
}

/** Community Showcase (TCG Pocket): Binders (≤30 cards) and Display Boards (one card + backdrop). */
db.exec(`CREATE TABLE IF NOT EXISTS showcases (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  group_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  cards TEXT NOT NULL DEFAULT '[]',
  style TEXT,
  visibility TEXT NOT NULL DEFAULT 'friends',
  created_at INTEGER NOT NULL
)`);

const DAY_MS = 86_400_000;
const TRADE_TTL = tcg.expiresDays * DAY_MS;

function stamina(userId: string, kind: 'trade' | 'wonder') {
  const u = getUser(userId)!;
  const cfg = kind === 'trade' ? TRADE : WONDER;
  const s = staminaNow(kind === 'trade' ? u.tradeStamina : u.wonderStamina, cfg.maxStamina, cfg.regenMs, now());
  return { ...s, max: cfg.maxStamina, next: nextStaminaAt(s, cfg.maxStamina, cfg.regenMs) };
}

function spendStamina(userId: string, kind: 'trade' | 'wonder', n: number) {
  const s = stamina(userId, kind);
  if (s.value < n) throw new GameError('no_stamina');
  const col = kind === 'trade' ? 'trade_stamina' : 'wonder_stamina';
  run(`UPDATE users SET ${col} = ?, ${col}_at = ? WHERE id = ?`, s.value - n, s.value >= s.max ? now() : s.at, userId);
}

/* ───────────────────────── Collector numbers & DTOs ───────────────────────── */

export interface CardNumber {
  set: string;
  n: number;
  of: number;
}

/**
 * Collector numbers per set (the week): every printable (moment, tier) pair, commons first, then by the
 * moment's time — TCG Pocket's "A1 001/286" pattern (tcg.number) [B-low].
 */
function numbering(posts: PostFull[]) {
  const map = new Map<string, CardNumber>();
  const weeks = new Map<string, PostFull[]>();
  for (const p of posts) {
    if (!weeks.has(p.weekKey)) weeks.set(p.weekKey, []);
    weeks.get(p.weekKey)!.push(p);
  }
  for (const [wk, list] of weeks) {
    list.sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id));
    const keys = RARITIES.flatMap((r) => list.filter((p) => rarityRank(r) <= rarityRank(p.maxTier)).map((p) => `${p.id}:${r}`));
    keys.forEach((k, i) => map.set(k, { set: wk, n: i + 1, of: keys.length }));
  }
  return map;
}

function cardContext(group: Group, viewerId: string) {
  const posts = visiblePosts(group, viewerId);
  const dto = new Map(toDTO(posts, viewerId).map((p) => [p.id, p]));
  const numbers = numbering(postsForGroup(group.id));
  const view = (c: CardFull) => ({
    ...c,
    traits: normalizeTraits(c.traits, c.id),
    post: dto.get(c.postId) ?? null,
    number: numbers.get(`${c.postId}:${c.rarity}`) ?? null,
  });
  return { posts, dto, numbers, view };
}

export type CardView = ReturnType<ReturnType<typeof cardContext>['view']>;

/* ───────────────────────── Packs ───────────────────────── */

export function grantPack(userId: string, groupId: string, weekKey: string, source: 'ritual' | 'plus' | 'quest' | 'sparks' | 'paid' | 'gift' | 'welcome' | 'set') {
  const pid = id('pk');
  run('INSERT INTO packs (id, user_id, group_id, week_key, source, created_at) VALUES (?, ?, ?, ?, ?, ?)', pid, userId, groupId, weekKey, source, now());
  return pid;
}

export function unopenedPacks(userId: string, groupId: string) {
  return all<{ id: string; week_key: string; source: string; created_at: number }>(
    'SELECT id, week_key, source, created_at FROM packs WHERE user_id = ? AND group_id = ? AND opened_at IS NULL ORDER BY created_at', userId, groupId,
  ).map((p) => ({ id: p.id, weekKey: p.week_key, source: p.source, createdAt: p.created_at }));
}

function counter(userId: string, groupId: string) {
  const cards = cardsFor(userId, groupId);
  return { unique: new Set(cards.map((c) => `${c.postId}:${c.rarity}`)).size, total: cards.length };
}

/**
 * Monopoly GO albums: completing a set (a week's dex) gives a reward [V]. One pack per completed set,
 * granted once. Runs inside callers' transactions, so it never opens its own.
 */
function checkSetRewards(group: Group, userId: string) {
  const posts = visiblePosts(group, userId);
  const owned = new Set(cardsFor(userId, group.id).map((c) => `${c.postId}:${c.rarity}`));
  const weeks = new Map<string, string[]>();
  for (const p of posts) {
    const keys = RARITIES.filter((r) => rarityRank(r) <= rarityRank(p.maxTier)).map((r) => `${p.id}:${r}`);
    weeks.set(p.weekKey, [...(weeks.get(p.weekKey) ?? []), ...keys]);
  }
  const granted: string[] = [];
  for (const [wk, keys] of weeks) {
    if (!keys.length || !keys.every((k) => owned.has(k))) continue;
    const key = `set:${group.id}:${userId}:${wk}`;
    if (get('SELECT 1 FROM jobs_done WHERE key = ?', key)) continue;
    run('INSERT INTO jobs_done (key, at) VALUES (?, ?)', key, now());
    for (let i = 0; i < SET_REWARD_PACKS; i++) grantPack(userId, group.id, wk, 'set');
    granted.push(wk);
  }
  return granted;
}

export function open(group: Group, userId: string, packId: string, rng: () => number = Math.random) {
  const pack = get<{ id: string; user_id: string; group_id: string; week_key: string; opened_at: number | null }>('SELECT * FROM packs WHERE id = ?', packId);
  if (!pack || pack.user_id !== userId || pack.group_id !== group.id) throw new GameError('not_found');
  if (pack.opened_at) throw new GameError('already_opened');
  const posts = visiblePosts(group, userId);
  if (!posts.length) throw new GameError('empty_pool');
  const pool = posts.map((p) => ({ postId: p.id, maxTier: p.maxTier, inSet: p.weekKey === pack.week_key }));
  const result = openPack(pool, rng);
  const before = counter(userId, group.id);
  const owned = new Set(cardsFor(userId, group.id).map((c) => `${c.postId}:${c.rarity}`));
  const out = tx(() => {
    const cards: (CardFull & { duplicate: boolean; dust: number })[] = [];
    let dust = 0;
    for (const pulled of result.cards) {
      const key = `${pulled.postId}:${pulled.rarity}`;
      const duplicate = owned.has(key);
      const card = insertCard({ groupId: group.id, postId: pulled.postId, ownerId: userId, rarity: pulled.rarity, source: 'pack', obtainedAt: now() });
      const d = duplicate ? DUST_FROM_DUPLICATE[pulled.rarity] : 0;
      dust += d;
      owned.add(key);
      cards.push({ ...card, duplicate, dust: d });
    }
    addCurrency(userId, { shinedust: dust, pack_points: PACK_POINTS_PER_PACK });
    run('UPDATE packs SET opened_at = ?, result = ? WHERE id = ?', now(), json.str({ ...result, cardIds: cards.map((c) => c.id) }), packId);
    // Wonder Pick: friends can blind-pick one card from this pack (TCG Pocket).
    const wid = id('wp');
    run('INSERT INTO wonder (id, group_id, opener_id, pack_id, cards, created_at) VALUES (?, ?, ?, ?, ?, ?)', wid, group.id, userId, packId,
      json.str(cards.map((c) => ({ postId: c.postId, rarity: c.rarity }))), now());
    const best = cards.reduce((m, c) => Math.max(m, rarityRank(c.rarity)), 0);
    if (best >= rarityRank('holo')) {
      const opener = getUser(userId)!;
      for (const m of members(group.id)) {
        if (m.userId === userId) continue;
        push({ userId: m.userId, groupId: group.id, kind: 'wonder_pick', title: tcg.wonderPick, body: `${opener.name} ${RARITY_MARK[RARITIES[best]]}`, refIds: [wid], url: `/g/${group.id}/wonder` });
      }
    }
    const sets = checkSetRewards(group, userId);
    return { cards, dust, sets };
  });
  const { view } = cardContext(group, userId);
  return {
    weekKey: pack.week_key,
    rarePack: result.rarePack,
    tell: result.tell,
    dust: out.dust,
    packPoints: PACK_POINTS_PER_PACK,
    before,
    after: counter(userId, group.id),
    setRewards: out.sets,
    cards: out.cards.map((c) => ({ ...view(c), duplicate: c.duplicate, isNew: !c.duplicate, dust: c.dust })),
  };
}

export function buyPackWithSparks(group: Group, userId: string) {
  const u = getUser(userId)!;
  if (u.sparks < SPARKS_PRICE.extraPack) throw new GameError('no_sparks');
  addCurrency(userId, { sparks: -SPARKS_PRICE.extraPack });
  run('INSERT INTO purchases (id, user_id, group_id, item, price_sparks, created_at) VALUES (?, ?, ?, ?, ?, ?)', id('buy'), userId, group.id, 'pack', SPARKS_PRICE.extraPack, now());
  return grantPack(userId, group.id, ritualWindow(now(), group).weekKey, 'sparks');
}

/** Spec §J: paid random packs only for age-verified adults, odds shown, no cash-out. */
export const PAID_PACK_USD = 0.99;
export function buyPaidPack(group: Group, userId: string) {
  const u = getUser(userId)!;
  if (!canBuyPaidPacks(u)) throw new GameError('age_gate');
  run('INSERT INTO purchases (id, user_id, group_id, item, price_usd, created_at) VALUES (?, ?, ?, ?, ?, ?)', id('buy'), userId, group.id, 'paid_pack', PAID_PACK_USD, now());
  return grantPack(userId, group.id, ritualWindow(now(), group).weekKey, 'paid');
}

/* ───────────────────────── Binder (My Cards) ───────────────────────── */

/** Golden Blitz (Monopoly GO) = the ritual-day window: the only time ☆ cards trade. */
export function blitz(group: Group) {
  const w = ritualWindow(now(), group);
  return { isOpen: w.isOpen, opensAt: w.opensAt, closesAt: w.developsAt, now: now() };
}

export function binder(group: Group, userId: string) {
  const { posts, dto, numbers, view } = cardContext(group, userId);
  const cards = cardsFor(userId, group.id);
  const copies = new Map<string, number>();
  for (const c of cards) copies.set(`${c.postId}:${c.rarity}`, (copies.get(`${c.postId}:${c.rarity}`) ?? 0) + 1);
  // The "dex": every printable (moment, tier) pair in this group.
  const dex = posts.flatMap((p) => RARITIES.filter((r) => rarityRank(r) <= rarityRank(p.maxTier)).map((r) => ({ postId: p.id, rarity: r })));
  const ownedKeys = new Set(cards.map((c) => `${c.postId}:${c.rarity}`));
  const wishlist = all<{ post_id: string; rarity: string; highlighted: number }>('SELECT post_id, rarity, highlighted FROM wishlist WHERE user_id = ? AND group_id = ? ORDER BY created_at', userId, group.id);
  const u = getUser(userId)!;
  const settings = u.settings as Record<string, unknown>;
  const setKeys = [...new Set(dex.map((d) => posts.find((p) => p.id === d.postId)!.weekKey))].sort().reverse();
  const sets = setKeys.map((wk) => {
    const keys = dex.filter((d) => posts.find((p) => p.id === d.postId)!.weekKey === wk).map((d) => `${d.postId}:${d.rarity}`);
    return { weekKey: wk, owned: keys.filter((k) => ownedKeys.has(k)).length, of: keys.length, rewarded: Boolean(get('SELECT 1 FROM jobs_done WHERE key = ?', `set:${group.id}:${userId}:${wk}`)) };
  });
  return {
    cards: cards.map((c) => ({ ...view(c), copies: copies.get(`${c.postId}:${c.rarity}`) ?? 1 })).filter((c) => c.post),
    dex: dex
      .map((d) => ({ ...d, owned: ownedKeys.has(`${d.postId}:${d.rarity}`), number: numbers.get(`${d.postId}:${d.rarity}`) ?? null, post: dto.get(d.postId)! }))
      .sort((a, b) => (a.number && b.number ? b.number.set.localeCompare(a.number.set) || a.number.n - b.number.n : 0)),
    counter: { unique: ownedKeys.size, total: cards.length },
    completion: dex.length ? [...ownedKeys].filter((k) => dex.some((d) => `${d.postId}:${d.rarity}` === k)).length / dex.length : 0,
    sets,
    wishlist: wishlist.map((w) => ({ postId: w.post_id, rarity: w.rarity as Rarity, highlighted: !!w.highlighted })),
    packs: unopenedPacks(userId, group.id),
    trade: stamina(userId, 'trade'),
    wonder: stamina(userId, 'wonder'),
    shinedust: u.shinedust,
    packPoints: u.packPoints,
    sparks: u.sparks,
    binderSlots: BINDER.slots,
    odds: oddsTable(),
    canBuyPaidPacks: canBuyPaidPacks(u),
    paidPackUsd: PAID_PACK_USD,
    costs: { trade: TRADE.cost, wonder: WONDER.cost, exchange: PACK_POINT_COST, upgrade: UPGRADE_COST, sparksPack: SPARKS_PRICE.extraPack, flair: FLAIR },
    limits: { wishlist: WISHLIST.max, highlighted: WISHLIST.highlighted, binders: BINDER.max, binderSlots: BINDER.slots },
    ritualOpen: ritualWindow(now(), group).isOpen,
    blitz: blitz(group),
    sleeve: typeof settings.sleeve === 'string' ? settings.sleeve : null,
    badge: ((settings.badges as Record<string, string | null> | undefined) ?? {})[group.id] ?? null,
    missions: missions(group, userId),
  };
}

export function setWishlist(group: Group, userId: string, postId: string, rarity: Rarity, on: boolean, highlighted = false) {
  if (!on) {
    run('DELETE FROM wishlist WHERE user_id = ? AND post_id = ? AND rarity = ?', userId, postId, rarity);
    return;
  }
  const existing = get<{ highlighted: number }>('SELECT highlighted FROM wishlist WHERE user_id = ? AND post_id = ? AND rarity = ?', userId, postId, rarity);
  const n = get<{ n: number }>('SELECT COUNT(*) AS n FROM wishlist WHERE user_id = ? AND group_id = ?', userId, group.id)!.n;
  if (!existing && n >= WISHLIST.max) throw new GameError('wishlist_full');
  if (highlighted && !existing?.highlighted) {
    const h = get<{ n: number }>('SELECT COUNT(*) AS n FROM wishlist WHERE user_id = ? AND group_id = ? AND highlighted = 1', userId, group.id)!.n;
    if (h >= WISHLIST.highlighted) throw new GameError('highlights_full');
  }
  if (existing) run('UPDATE wishlist SET highlighted = ? WHERE user_id = ? AND post_id = ? AND rarity = ?', highlighted ? 1 : 0, userId, postId, rarity);
  else run('INSERT INTO wishlist (user_id, group_id, post_id, rarity, highlighted, created_at) VALUES (?, ?, ?, ?, ?, ?)', userId, group.id, postId, rarity, highlighted ? 1 : 0, now());
}

/** TCG Pocket Pack Points exchange: trade points for a specific (moment, tier). */
export function exchange(group: Group, userId: string, postId: string, rarity: Rarity) {
  const post = visiblePosts(group, userId).find((p) => p.id === postId);
  if (!post || rarityRank(rarity) > rarityRank(post.maxTier)) throw new GameError('not_printable');
  const cost = PACK_POINT_COST[rarity];
  const u = getUser(userId)!;
  if (u.packPoints < cost) throw new GameError('no_points');
  return tx(() => {
    addCurrency(userId, { pack_points: -cost });
    const card = insertCard({ groupId: group.id, postId, ownerId: userId, rarity, source: 'quest', obtainedAt: now() });
    checkSetRewards(group, userId);
    return card;
  });
}

/* ───────────────────────── Missions (TCG Pocket Daily Missions) ───────────────────────── */

function dayStart(userId: string) {
  const tz = getUser(userId)?.settings.timeZone ?? 'America/New_York';
  const p = localParts(now(), tz);
  return { start: zonedToUtc(p.year, p.month, p.day, 0, 0, tz), key: `${p.year}-${p.month}-${p.day}` };
}

export function missions(group: Group, userId: string) {
  const { start, key } = dayStart(userId);
  const wonder = get<{ n: number }>("SELECT COUNT(*) AS n FROM cards WHERE owner_id = ? AND group_id = ? AND source = 'wonder' AND obtained_at >= ?", userId, group.id, start)!.n;
  const collect = get<{ n: number }>('SELECT COUNT(*) AS n FROM cards WHERE owner_id = ? AND group_id = ? AND obtained_at >= ?', userId, group.id, start)!.n;
  const list = [
    { kind: 'wonder' as const, goal: MISSIONS.wonder, progress: Math.min(MISSIONS.wonder, wonder) },
    { kind: 'collect' as const, goal: MISSIONS.collect, progress: Math.min(MISSIONS.collect, collect) },
  ];
  return {
    list,
    reward: SPARKS_EARN.missions,
    done: list.every((m) => m.progress >= m.goal),
    claimed: Boolean(get('SELECT 1 FROM jobs_done WHERE key = ?', `missions:${group.id}:${userId}:${key}`)),
    resetsAt: start + DAY_MS,
  };
}

export function claimMissions(group: Group, userId: string) {
  const m = missions(group, userId);
  if (!m.done) throw new GameError('not_done');
  if (m.claimed) throw new GameError('claimed');
  run('INSERT INTO jobs_done (key, at) VALUES (?, ?)', `missions:${group.id}:${userId}:${dayStart(userId).key}`, now());
  addCurrency(userId, { sparks: m.reward });
  return missions(group, userId);
}

/* ───────────────────────── Wonder Pick ───────────────────────── */

export function wonderOffers(group: Group, userId: string) {
  const rows = all<{ id: string; opener_id: string; cards: string; picks: string; created_at: number }>(
    'SELECT * FROM wonder WHERE group_id = ? AND opener_id != ? AND created_at > ? ORDER BY created_at DESC LIMIT 20', group.id, userId, now() - 7 * DAY_MS,
  );
  const { dto, numbers } = cardContext(group, userId);
  return rows
    .map((r) => {
      const cards = json.parse<{ postId: string; rarity: Rarity }[]>(r.cards, []);
      const picks = json.parse<Record<string, number>>(r.picks, {});
      const best = cards.reduce<Rarity>((m, c) => (rarityRank(c.rarity) > rarityRank(m) ? c.rarity : m), 'common');
      const opener = getUser(r.opener_id);
      return {
        id: r.id, opener: opener ? publicUser(opener) : null, createdAt: r.created_at, cost: WONDER.cost[best], best,
        picked: userId in picks,
        cards: cards.map((c) => ({ ...c, number: numbers.get(`${c.postId}:${c.rarity}`) ?? null, post: dto.get(c.postId) ?? null })),
      };
    })
    .filter((w) => w.cards.length && w.cards.every((c) => c.post));
}

export function wonderPick(group: Group, userId: string, wonderId: string, choice: number, rng: () => number = Math.random) {
  const row = get<{ id: string; group_id: string; opener_id: string; cards: string; picks: string }>('SELECT * FROM wonder WHERE id = ?', wonderId);
  if (!row || row.group_id !== group.id || row.opener_id === userId) throw new GameError('not_found');
  const picks = json.parse<Record<string, number>>(row.picks, {});
  if (userId in picks) throw new GameError('already_picked');
  const cards = json.parse<{ postId: string; rarity: Rarity }[]>(row.cards, []);
  const best = cards.reduce<Rarity>((m, c) => (rarityRank(c.rarity) > rarityRank(m) ? c.rarity : m), 'common');
  // Cards are turned face down and shuffled; the choice picks a position in the shuffled order.
  const order = cards.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const position = Math.max(0, Math.min(cards.length - 1, choice));
  const got = cards[order[position]];
  const card = tx(() => {
    spendStamina(userId, 'wonder', WONDER.cost[best]);
    picks[userId] = position;
    run('UPDATE wonder SET picks = ? WHERE id = ?', json.str(picks), wonderId);
    const c = insertCard({ groupId: group.id, postId: got.postId, ownerId: userId, rarity: got.rarity, source: 'wonder', obtainedAt: now() });
    checkSetRewards(group, userId);
    return c;
  });
  const { view, dto, numbers } = cardContext(group, userId);
  return {
    card: view(card),
    position,
    order: order.map((i) => ({ ...cards[i], number: numbers.get(`${cards[i].postId}:${cards[i].rarity}`) ?? null, post: dto.get(cards[i].postId) ?? null })),
  };
}

/* ───────────────────────── Trades (TCG Pocket Social Hub → Trade) ───────────────────────── */

type TradeRow = { id: string; group_id: string; from_user: string; to_user: string; offer_card: string; want_card: string | null; rarity: Rarity; status: string; created_at: number; closed_at: number | null };

/** Offers not accepted "within two days" are automatically cancelled [V-weak]. */
function expireTrades(groupId: string) {
  run("UPDATE trades SET status = 'expired', closed_at = ? WHERE group_id = ? AND status = 'open' AND created_at < ?", now(), groupId, now() - TRADE_TTL);
}

function inOpenTrade(cardId: string) {
  return Boolean(get("SELECT 1 FROM trades WHERE status = 'open' AND (offer_card = ? OR want_card = ?)", cardId, cardId));
}

/** A proposal carries only the offered card; the receiver chooses what to give when accepting. */
export function proposeTrade(group: Group, fromUserId: string, input: { offerCardId: string; toUserId: string; wantCardId?: string | null }) {
  expireTrades(group.id);
  const offer = getCard(input.offerCardId);
  if (!offer || offer.ownerId !== fromUserId || offer.groupId !== group.id) throw new GameError('bad_offer');
  if (inOpenTrade(offer.id)) throw new GameError('in_trade');
  if (!membership(group.id, input.toUserId)) throw new GameError('not_member');
  let wantRarity = offer.rarity;
  if (input.wantCardId) {
    const want = getCard(input.wantCardId);
    if (!want || want.ownerId !== input.toUserId || want.groupId !== group.id) throw new GameError('bad_want');
    wantRarity = want.rarity;
  }
  const u = getUser(fromUserId)!;
  const st = stamina(fromUserId, 'trade');
  const check = checkTrade({ offer: offer.rarity, want: wantRarity, fromUserId, toUserId: input.toUserId, stamina: st.value, dust: u.shinedust, ritualOpen: ritualWindow(now(), group).isOpen });
  if (!check.ok) throw new GameError(check.reason);
  const tid = id('t');
  run('INSERT INTO trades (id, group_id, from_user, to_user, offer_card, want_card, rarity, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    tid, group.id, fromUserId, input.toUserId, offer.id, input.wantCardId ?? null, offer.rarity, 'open', now());
  push({ userId: input.toUserId, groupId: group.id, kind: 'trade_offer', title: tcg.trade, body: `${u.name} ${RARITY_MARK[offer.rarity]}`, refIds: [tid], url: `/g/${group.id}/trades` });
  toUser(input.toUserId, { type: 'trade', tradeId: tid });
  return tid;
}

export function respondTrade(group: Group, userId: string, tradeId: string, action: 'accept' | 'decline' | 'cancel' | 'finish', giveCardId?: string | null) {
  expireTrades(group.id);
  const t = get<TradeRow>('SELECT * FROM trades WHERE id = ?', tradeId);
  if (!t || t.group_id !== group.id) throw new GameError('not_found');
  if (action === 'finish') {
    // Sender: "prompted to swipe up to send your card" once the partner accepts [V-weak].
    if (t.from_user !== userId || t.status !== 'accepted') throw new GameError('forbidden');
    run("UPDATE trades SET status = 'completed' WHERE id = ?", tradeId);
    return { status: 'completed' };
  }
  if (t.status !== 'open') throw new GameError(t.status === 'expired' ? 'expired' : 'not_found');
  if (action === 'cancel') {
    if (t.from_user !== userId) throw new GameError('forbidden');
    run("UPDATE trades SET status = 'cancelled', closed_at = ? WHERE id = ?", now(), tradeId);
    toUser(t.to_user, { type: 'trade', tradeId });
    return { status: 'cancelled' };
  }
  if (t.to_user !== userId) throw new GameError('forbidden');
  if (action === 'decline') {
    run("UPDATE trades SET status = 'declined', closed_at = ? WHERE id = ?", now(), tradeId);
    toUser(t.from_user, { type: 'trade', tradeId });
    return { status: 'declined' };
  }
  const offer = getCard(t.offer_card);
  const give = getCard(giveCardId ?? t.want_card ?? '');
  if (!offer || offer.ownerId !== t.from_user) throw new GameError('cards_moved');
  if (!give || give.ownerId !== t.to_user || give.groupId !== group.id) throw new GameError('bad_give');
  if (give.id !== t.want_card && inOpenTrade(give.id)) throw new GameError('in_trade');
  const from = getUser(t.from_user)!;
  const to = getUser(t.to_user)!;
  const ritualOpen = ritualWindow(now(), group).isOpen;
  // Same rarity only; both sides pay 1 Trade Stamina and the rarity's Shinedust (TCG Pocket).
  for (const side of [to, from]) {
    const c = checkTrade({ offer: offer.rarity, want: give.rarity, fromUserId: side.id, toUserId: side.id === from.id ? to.id : from.id, stamina: stamina(side.id, 'trade').value, dust: side.shinedust, ritualOpen });
    if (!c.ok) throw new GameError(side.id === userId ? c.reason : `partner_${c.reason}`);
  }
  const cost = TRADE.cost[t.rarity];
  tx(() => {
    spendStamina(from.id, 'trade', 1);
    spendStamina(to.id, 'trade', 1);
    addCurrency(from.id, { shinedust: -cost });
    addCurrency(to.id, { shinedust: -cost });
    run("UPDATE cards SET owner_id = ?, source = 'trade', obtained_at = ?, flair = NULL WHERE id = ?", to.id, now(), offer.id);
    run("UPDATE cards SET owner_id = ?, source = 'trade', obtained_at = ?, flair = NULL WHERE id = ?", from.id, now(), give.id);
    run("UPDATE trades SET status = 'accepted', want_card = ?, closed_at = ? WHERE id = ?", give.id, now(), tradeId);
    checkSetRewards(group, from.id);
    checkSetRewards(group, to.id);
  });
  push({ userId: from.id, groupId: group.id, kind: 'trade_offer', title: tcg.trade, body: `${to.name} ${RARITY_MARK[give.rarity]}`, refIds: [`${tradeId}:accepted`], url: `/g/${group.id}/trades` });
  toUser(t.from_user, { type: 'trade', tradeId });
  return { status: 'accepted' };
}

export function tradesFor(group: Group, userId: string) {
  expireTrades(group.id);
  const rows = all<TradeRow>('SELECT * FROM trades WHERE group_id = ? AND (from_user = ? OR to_user = ?) ORDER BY created_at DESC LIMIT 40', group.id, userId, userId);
  const { view } = cardContext(group, userId);
  const card = (cid: string | null) => {
    const c = cid ? getCard(cid) : null;
    return c ? view(c) : null;
  };
  return rows.map((r) => ({
    id: r.id, status: r.status, rarity: r.rarity, createdAt: r.created_at, closedAt: r.closed_at, expiresAt: r.created_at + TRADE_TTL,
    incoming: r.to_user === userId,
    from: publicUser(getUser(r.from_user)!), to: publicUser(getUser(r.to_user)!), offer: card(r.offer_card), give: card(r.want_card),
  }));
}

export function tradeHub(group: Group, userId: string) {
  const u = getUser(userId)!;
  return {
    trades: tradesFor(group, userId),
    friends: members(group.id).filter((m) => m.userId !== userId).map((m) => publicUser(m.user)),
    blitz: blitz(group),
    stamina: stamina(userId, 'trade'),
    shinedust: u.shinedust,
    cost: TRADE.cost,
    ritualOnly: TRADE.ritualOnly,
  };
}

/* ───────────────────────── Numbered upgrade (Telegram collectible) & flair ───────────────────────── */

export function upgrade(userId: string, cardId: string) {
  const c = getCard(cardId);
  if (!c || c.ownerId !== userId) throw new GameError('not_found');
  if (c.serial) throw new GameError('already_numbered');
  const cost = UPGRADE_COST[c.rarity];
  if (getUser(userId)!.shinedust < cost) throw new GameError('no_dust');
  const serial = (get<{ n: number }>('SELECT COALESCE(MAX(serial), 0) AS n FROM cards WHERE post_id = ?', c.postId)?.n ?? 0) + 1;
  const traits = rollTraits();
  addCurrency(userId, { shinedust: -cost });
  run('UPDATE cards SET serial = ?, traits = ? WHERE id = ?', serial, json.str({ backdrop: traits.backdrop.id, symbol: traits.symbol.id }), cardId);
  return { serial, traits };
}

/**
 * The collectible sheet (Telegram): Owner, Model, Backdrop and Symbol rows with the share of the
 * collection that has each trait [V] — computed from the numbered cards issued in this group — and
 * Quantity "N / M issued" [V-weak] for this moment.
 */
export function collectible(group: Group, viewerId: string, cardId: string) {
  const c = getCard(cardId);
  if (!c || c.groupId !== group.id) throw new GameError('not_found');
  const { view } = cardContext(group, viewerId);
  const owner = getUser(c.ownerId);
  const numbered = all<{ id: string; rarity: string; traits: string | null }>('SELECT id, rarity, traits FROM cards WHERE group_id = ? AND serial IS NOT NULL', group.id)
    .map((r) => ({ rarity: r.rarity, traits: normalizeTraits(json.parse(r.traits, null), r.id) }));
  const pct = (n: number) => (numbered.length ? Math.round((n / numbered.length) * 1000) / 10 : 0);
  const t = normalizeTraits(c.traits, c.id);
  const issued = get<{ n: number }>('SELECT COUNT(*) AS n FROM cards WHERE post_id = ? AND serial IS NOT NULL', c.postId)!.n;
  const of = get<{ n: number }>('SELECT COUNT(*) AS n FROM cards WHERE post_id = ?', c.postId)!.n;
  const badges = ((owner?.settings as Record<string, unknown> | undefined)?.badges as Record<string, string | null> | undefined) ?? {};
  const bd = backdropById(t?.backdrop);
  const sy = symbolById(t?.symbol);
  return {
    card: view(c),
    owner: owner ? publicUser(owner) : null,
    mine: c.ownerId === viewerId,
    worn: badges[group.id] === c.id,
    traits: c.serial && t && bd && sy
      ? {
        model: { rarity: c.rarity, name: RARITY_NAME[c.rarity], mark: RARITY_MARK[c.rarity], pct: pct(numbered.filter((n) => n.rarity === c.rarity).length) },
        backdrop: { ...bd, pct: pct(numbered.filter((n) => n.traits?.backdrop === bd.id).length) },
        symbol: { ...sy, pct: pct(numbered.filter((n) => n.traits?.symbol === sy.id).length) },
      }
      : null,
    quantity: { issued, of },
    upgradeCost: UPGRADE_COST[c.rarity],
    backdrops: BACKDROPS,
  };
}

export function applyFlair(userId: string, cardId: string) {
  const c = getCard(cardId);
  if (!c || c.ownerId !== userId) throw new GameError('not_found');
  if (c.flair) throw new GameError('has_flair');
  const dups = all<{ id: string }>('SELECT id FROM cards WHERE owner_id = ? AND post_id = ? AND rarity = ? AND id != ? AND flair IS NULL AND serial IS NULL LIMIT ?', userId, c.postId, c.rarity, c.id, FLAIR.duplicates);
  if (dups.length < FLAIR.duplicates) throw new GameError('need_duplicates');
  if (getUser(userId)!.shinedust < FLAIR.dust) throw new GameError('no_dust');
  tx(() => {
    for (const d of dups) run('DELETE FROM cards WHERE id = ?', d.id);
    addCurrency(userId, { shinedust: -FLAIR.dust });
    run('UPDATE cards SET flair = ? WHERE id = ?', FLAIR.id, cardId);
  });
  return { flair: FLAIR.id };
}

/** Telegram "Wear": a numbered card becomes the member's badge in this group. */
export function badge(userId: string, groupId: string, cardId: string | null) {
  const u = getUser(userId)!;
  const badges = { ...((u.settings as Record<string, unknown>).badges as Record<string, string | null> | undefined) };
  if (cardId) {
    const c = getCard(cardId);
    if (!c || c.ownerId !== userId || !c.serial || c.groupId !== groupId) throw new GameError('not_numbered');
  }
  badges[groupId] = cardId;
  run('UPDATE users SET settings = ? WHERE id = ?', json.str({ ...u.settings, badges }), userId);
  return badges;
}

/* ───────────────────────── Social Hub: Friends & Community Showcase ───────────────────────── */

type ShowcaseRow = { id: string; user_id: string; group_id: string; kind: 'binder' | 'display'; cards: string; style: string | null; visibility: 'private' | 'friends'; created_at: number };

export function social(group: Group, viewerId: string) {
  const { view } = cardContext(group, viewerId);
  const ms = members(group.id);
  const friends = ms.map((m) => {
    const cs = cardsFor(m.userId, group.id);
    const badgeId = ((m.user.settings as Record<string, unknown>).badges as Record<string, string | null> | undefined)?.[group.id] ?? null;
    const b = badgeId ? getCard(badgeId) : null;
    return {
      user: publicUser(m.user),
      me: m.userId === viewerId,
      unique: new Set(cs.map((c) => `${c.postId}:${c.rarity}`)).size,
      total: cs.length,
      badge: b && b.ownerId === m.userId ? view(b) : null,
    };
  });
  const rows = all<ShowcaseRow>("SELECT * FROM showcases WHERE group_id = ? AND (user_id = ? OR visibility = 'friends') ORDER BY created_at DESC", group.id, viewerId);
  const showcases = rows.map((r) => {
    const owner = ms.find((m) => m.userId === r.user_id);
    const cards = json.parse<string[]>(r.cards, []).map((cid) => getCard(cid)).filter((c): c is CardFull => Boolean(c && c.ownerId === r.user_id)).map(view).filter((c) => c.post);
    return { id: r.id, kind: r.kind, style: r.style, visibility: r.visibility, createdAt: r.created_at, mine: r.user_id === viewerId, owner: owner ? publicUser(owner.user) : null, cards };
  }).filter((s) => s.owner);
  return { friends, showcases };
}

export function saveShowcase(group: Group, userId: string, input: { id?: string; kind: 'binder' | 'display'; cardIds: string[]; style?: string | null; visibility: 'private' | 'friends' }, ownedItems: Set<string>) {
  if (!['binder', 'display'].includes(input.kind) || !['private', 'friends'].includes(input.visibility)) throw new GameError('bad_input');
  const ids = [...new Set(input.cardIds)];
  if (input.kind === 'display' ? ids.length !== 1 : ids.length > BINDER.slots) throw new GameError('bad_cards');
  for (const cid of ids) {
    const c = getCard(cid);
    if (!c || c.ownerId !== userId || c.groupId !== group.id) throw new GameError('bad_cards');
  }
  const style = input.style ?? null;
  if (style && !ownedItems.has(style)) throw new GameError('not_owned');
  if (input.id) {
    const row = get<ShowcaseRow>('SELECT * FROM showcases WHERE id = ?', input.id);
    if (!row || row.user_id !== userId || row.group_id !== group.id) throw new GameError('not_found');
    run('UPDATE showcases SET cards = ?, style = ?, visibility = ? WHERE id = ?', json.str(ids), style, input.visibility, input.id);
    return input.id;
  }
  if (input.kind === 'binder') {
    const n = get<{ n: number }>("SELECT COUNT(*) AS n FROM showcases WHERE user_id = ? AND group_id = ? AND kind = 'binder'", userId, group.id)!.n;
    if (n >= BINDER.max) throw new GameError('binders_full');
  }
  const sid = id('sc');
  run('INSERT INTO showcases (id, user_id, group_id, kind, cards, style, visibility, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', sid, userId, group.id, input.kind, json.str(ids), style, input.visibility, now());
  return sid;
}

export function deleteShowcase(group: Group, userId: string, showcaseId: string) {
  run('DELETE FROM showcases WHERE id = ? AND user_id = ? AND group_id = ?', showcaseId, userId, group.id);
}

/** Resolves a card's group for routes keyed by card id. */
export function groupOfCard(cardId: string) {
  const c = getCard(cardId);
  return c ? getGroup(c.groupId) : null;
}
