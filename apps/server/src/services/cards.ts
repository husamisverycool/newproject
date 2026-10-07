import {
  BINDER,
  DUST_FROM_DUPLICATE,
  FLAIR,
  PACK_POINTS_PER_PACK,
  PACK_POINT_COST,
  RARITIES,
  SPARKS_PRICE,
  TRADE,
  UPGRADE_COST,
  WISHLIST,
  WONDER,
  canBuyPaidPacks,
  checkTrade,
  nextStaminaAt,
  oddsTable,
  openPack,
  rarityRank,
  ritualWindow,
  rollTraits,
  staminaNow,
  type Group,
  type Rarity,
} from '@app/shared';
import { all, get, json, now, run, tx } from '../db.ts';
import { addCurrency, cardsFor, getCard, getUser, id, insertCard, members, membership, postsForGroup, publicUser, type CardFull } from '../repo.ts';
import { toDTO, visiblePosts } from './posts.ts';
import { toUser } from '../realtime.ts';
import { push } from './notify.ts';

/**
 * Friend Cards (spec §J) on top of the shared TCG Pocket-derived economy in packages/shared/src/cards.ts.
 */

export class GameError extends Error {
  constructor(public code: string, message?: string) {
    super(message ?? code);
  }
}

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

/* ───────────────────────── Packs ───────────────────────── */

export function grantPack(userId: string, groupId: string, weekKey: string, source: 'ritual' | 'plus' | 'quest' | 'sparks' | 'paid' | 'gift' | 'welcome') {
  const pid = id('pk');
  run('INSERT INTO packs (id, user_id, group_id, week_key, source, created_at) VALUES (?, ?, ?, ?, ?, ?)', pid, userId, groupId, weekKey, source, now());
  return pid;
}

export function unopenedPacks(userId: string, groupId: string) {
  return all<{ id: string; week_key: string; source: string; created_at: number }>(
    'SELECT id, week_key, source, created_at FROM packs WHERE user_id = ? AND group_id = ? AND opened_at IS NULL ORDER BY created_at', userId, groupId,
  ).map((p) => ({ id: p.id, weekKey: p.week_key, source: p.source, createdAt: p.created_at }));
}

export function open(group: Group, userId: string, packId: string, rng: () => number = Math.random) {
  const pack = get<{ id: string; user_id: string; group_id: string; week_key: string; opened_at: number | null }>('SELECT * FROM packs WHERE id = ?', packId);
  if (!pack || pack.user_id !== userId || pack.group_id !== group.id) throw new GameError('not_found');
  if (pack.opened_at) throw new GameError('already_opened');
  const posts = visiblePosts(group, userId);
  if (!posts.length) throw new GameError('empty_pool', 'No moments in this group yet');
  const pool = posts.map((p) => ({ postId: p.id, maxTier: p.maxTier, inSet: p.weekKey === pack.week_key }));
  const result = openPack(pool, rng);
  const owned = new Set(cardsFor(userId, group.id).map((c) => `${c.postId}:${c.rarity}`));
  return tx(() => {
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
        push({ userId: m.userId, groupId: group.id, kind: 'wonder_pick', title: 'Wonder Pick', body: `${opener.name} pulled a ${RARITIES[best]} — pick one blind`, refIds: [wid], url: `/g/${group.id}/cards/wonder` });
      }
    }
    const postDtos = new Map(toDTO(postsForGroup(group.id).filter((p) => cards.some((c) => c.postId === p.id)), userId).map((p) => [p.id, p]));
    return { rarePack: result.rarePack, tell: result.tell, dust, packPoints: PACK_POINTS_PER_PACK, cards: cards.map((c) => ({ ...c, post: postDtos.get(c.postId) })) };
  });
}

/* ───────────────────────── Binder ───────────────────────── */

export function binder(group: Group, userId: string) {
  const cards = cardsFor(userId, group.id);
  const posts = visiblePosts(group, userId);
  const dto = new Map(toDTO(posts, userId).map((p) => [p.id, p]));
  // The "dex": every printable (moment, tier) pair in this group.
  const dex = posts.flatMap((p) => RARITIES.filter((r) => rarityRank(r) <= rarityRank(p.maxTier)).map((r) => ({ postId: p.id, rarity: r })));
  const ownedKeys = new Set(cards.map((c) => `${c.postId}:${c.rarity}`));
  const wishlist = all<{ post_id: string; rarity: string; highlighted: number }>('SELECT post_id, rarity, highlighted FROM wishlist WHERE user_id = ? AND group_id = ?', userId, group.id);
  const u = getUser(userId)!;
  return {
    cards: cards.map((c) => ({ ...c, post: dto.get(c.postId) ?? null })).filter((c) => c.post),
    dex: dex.map((d) => ({ ...d, owned: ownedKeys.has(`${d.postId}:${d.rarity}`), post: dto.get(d.postId) })),
    completion: dex.length ? ownedKeys.size / dex.length : 0,
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
    costs: { trade: TRADE.cost, wonder: WONDER.cost, exchange: PACK_POINT_COST, upgrade: UPGRADE_COST, sparksPack: SPARKS_PRICE.extraPack, flair: FLAIR },
    ritualOpen: ritualWindow(now(), group).isOpen,
  };
}

export function setWishlist(group: Group, userId: string, postId: string, rarity: Rarity, on: boolean, highlighted = false) {
  if (!on) {
    run('DELETE FROM wishlist WHERE user_id = ? AND post_id = ? AND rarity = ?', userId, postId, rarity);
    return;
  }
  const n = get<{ n: number }>('SELECT COUNT(*) AS n FROM wishlist WHERE user_id = ? AND group_id = ?', userId, group.id)!.n;
  if (n >= WISHLIST.max) throw new GameError('wishlist_full');
  if (highlighted) {
    const h = get<{ n: number }>('SELECT COUNT(*) AS n FROM wishlist WHERE user_id = ? AND group_id = ? AND highlighted = 1', userId, group.id)!.n;
    if (h >= WISHLIST.highlighted) throw new GameError('highlights_full');
  }
  run('INSERT OR REPLACE INTO wishlist (user_id, group_id, post_id, rarity, highlighted, created_at) VALUES (?, ?, ?, ?, ?, ?)', userId, group.id, postId, rarity, highlighted ? 1 : 0, now());
}

/** TCG Pocket Pack Points exchange: trade points for a specific (moment, tier). */
export function exchange(group: Group, userId: string, postId: string, rarity: Rarity) {
  const post = visiblePosts(group, userId).find((p) => p.id === postId);
  if (!post || rarityRank(rarity) > rarityRank(post.maxTier)) throw new GameError('not_printable');
  const cost = PACK_POINT_COST[rarity];
  const u = getUser(userId)!;
  if (u.packPoints < cost) throw new GameError('no_points');
  addCurrency(userId, { pack_points: -cost });
  return insertCard({ groupId: group.id, postId, ownerId: userId, rarity, source: 'quest', obtainedAt: now() });
}

export function buyPackWithSparks(group: Group, userId: string) {
  const u = getUser(userId)!;
  if (u.sparks < SPARKS_PRICE.extraPack) throw new GameError('no_sparks');
  addCurrency(userId, { sparks: -SPARKS_PRICE.extraPack });
  run('INSERT INTO purchases (id, user_id, group_id, item, price_sparks, created_at) VALUES (?, ?, ?, ?, ?, ?)', id('buy'), userId, group.id, 'pack', SPARKS_PRICE.extraPack, now());
  return grantPack(userId, group.id, ritualWindow(now(), group).weekKey, 'sparks');
}

/** Spec §J: paid random packs only for age-verified adults, odds shown, no cash-out. */
export function buyPaidPack(group: Group, userId: string) {
  const u = getUser(userId)!;
  if (!canBuyPaidPacks(u)) throw new GameError('age_gate', 'Paid packs are for verified adults (18+) only');
  run('INSERT INTO purchases (id, user_id, group_id, item, price_usd, created_at) VALUES (?, ?, ?, ?, ?, ?)', id('buy'), userId, group.id, 'paid_pack', 0.99, now());
  return grantPack(userId, group.id, ritualWindow(now(), group).weekKey, 'paid');
}

/* ───────────────────────── Wonder Pick ───────────────────────── */

export function wonderOffers(group: Group, userId: string) {
  const rows = all<{ id: string; opener_id: string; cards: string; picks: string; created_at: number }>(
    'SELECT * FROM wonder WHERE group_id = ? AND opener_id != ? AND created_at > ? ORDER BY created_at DESC LIMIT 20', group.id, userId, now() - 7 * 86_400_000,
  );
  const posts = new Map(toDTO(visiblePosts(group, userId), userId).map((p) => [p.id, p]));
  return rows
    .map((r) => {
      const cards = json.parse<{ postId: string; rarity: Rarity }[]>(r.cards, []);
      const picks = json.parse<Record<string, number>>(r.picks, {});
      const best = cards.reduce<Rarity>((m, c) => (rarityRank(c.rarity) > rarityRank(m) ? c.rarity : m), 'common');
      const opener = getUser(r.opener_id);
      return {
        id: r.id, opener: opener ? publicUser(opener) : null, createdAt: r.created_at, cost: WONDER.cost[best], best,
        picked: userId in picks, cards: cards.map((c) => ({ ...c, post: posts.get(c.postId) ?? null })),
      };
    })
    .filter((w) => w.cards.every((c) => c.post));
}

export function wonderPick(group: Group, userId: string, wonderId: string, choice: number, rng: () => number = Math.random) {
  const row = get<{ id: string; group_id: string; opener_id: string; cards: string; picks: string }>('SELECT * FROM wonder WHERE id = ?', wonderId);
  if (!row || row.group_id !== group.id || row.opener_id === userId) throw new GameError('not_found');
  const picks = json.parse<Record<string, number>>(row.picks, {});
  if (userId in picks) throw new GameError('already_picked');
  const cards = json.parse<{ postId: string; rarity: Rarity }[]>(row.cards, []);
  const best = cards.reduce<Rarity>((m, c) => (rarityRank(c.rarity) > rarityRank(m) ? c.rarity : m), 'common');
  spendStamina(userId, 'wonder', WONDER.cost[best]);
  // Cards are turned face down and shuffled; the choice picks a position in the shuffled order.
  const order = cards.map((_, i) => i).sort(() => rng() - 0.5);
  const got = cards[order[Math.max(0, Math.min(cards.length - 1, choice))]];
  picks[userId] = choice;
  run('UPDATE wonder SET picks = ? WHERE id = ?', json.str(picks), wonderId);
  const card = insertCard({ groupId: group.id, postId: got.postId, ownerId: userId, rarity: got.rarity, source: 'wonder', obtainedAt: now() });
  return { card, order: order.map((i) => cards[i]), position: choice };
}

/* ───────────────────────── Trades ───────────────────────── */

export function proposeTrade(group: Group, fromUserId: string, input: { offerCardId: string; toUserId: string; wantCardId: string }) {
  const offer = getCard(input.offerCardId);
  const want = getCard(input.wantCardId);
  if (!offer || offer.ownerId !== fromUserId || offer.groupId !== group.id) throw new GameError('bad_offer');
  if (!want || want.ownerId !== input.toUserId || want.groupId !== group.id) throw new GameError('bad_want');
  if (!membership(group.id, input.toUserId)) throw new GameError('not_member');
  const u = getUser(fromUserId)!;
  const st = stamina(fromUserId, 'trade');
  const check = checkTrade({ offer: offer.rarity, want: want.rarity, fromUserId, toUserId: input.toUserId, stamina: st.value, dust: u.shinedust, ritualOpen: ritualWindow(now(), group).isOpen });
  if (!check.ok) throw new GameError(check.reason);
  const tid = id('t');
  run('INSERT INTO trades (id, group_id, from_user, to_user, offer_card, want_card, rarity, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    tid, group.id, fromUserId, input.toUserId, offer.id, want.id, offer.rarity, 'open', now());
  push({ userId: input.toUserId, groupId: group.id, kind: 'trade_offer', title: 'Trade offer', body: `${u.name} wants to trade a ${offer.rarity} card`, refIds: [tid], url: `/g/${group.id}/cards/trades` });
  toUser(input.toUserId, { type: 'trade', tradeId: tid });
  return tid;
}

export function respondTrade(group: Group, userId: string, tradeId: string, action: 'accept' | 'decline' | 'cancel') {
  const t = get<{ id: string; group_id: string; from_user: string; to_user: string; offer_card: string; want_card: string; rarity: Rarity; status: string }>('SELECT * FROM trades WHERE id = ?', tradeId);
  if (!t || t.group_id !== group.id || t.status !== 'open') throw new GameError('not_found');
  if (action === 'cancel') {
    if (t.from_user !== userId) throw new GameError('forbidden');
    run("UPDATE trades SET status = 'cancelled', closed_at = ? WHERE id = ?", now(), tradeId);
    return { status: 'cancelled' };
  }
  if (t.to_user !== userId) throw new GameError('forbidden');
  if (action === 'decline') {
    run("UPDATE trades SET status = 'declined', closed_at = ? WHERE id = ?", now(), tradeId);
    toUser(t.from_user, { type: 'trade', tradeId });
    return { status: 'declined' };
  }
  const offer = getCard(t.offer_card);
  const want = getCard(t.want_card);
  if (!offer || !want || offer.ownerId !== t.from_user || want.ownerId !== t.to_user) throw new GameError('cards_moved');
  const cost = TRADE.cost[t.rarity];
  const from = getUser(t.from_user)!;
  const to = getUser(t.to_user)!;
  const ritualOpen = ritualWindow(now(), group).isOpen;
  // Both sides pay: 1 Trade Stamina and the rarity's Shinedust (TCG Pocket).
  for (const side of [from, to]) {
    const c = checkTrade({ offer: t.rarity, want: t.rarity, fromUserId: side.id, toUserId: side.id === from.id ? to.id : from.id, stamina: stamina(side.id, 'trade').value, dust: side.shinedust, ritualOpen });
    if (!c.ok) throw new GameError(side.id === userId ? c.reason : `partner_${c.reason}`);
  }
  tx(() => {
    spendStamina(from.id, 'trade', 1);
    spendStamina(to.id, 'trade', 1);
    addCurrency(from.id, { shinedust: -cost });
    addCurrency(to.id, { shinedust: -cost });
    run("UPDATE cards SET owner_id = ?, source = 'trade', obtained_at = ? WHERE id = ?", to.id, now(), offer.id);
    run("UPDATE cards SET owner_id = ?, source = 'trade', obtained_at = ? WHERE id = ?", from.id, now(), want.id);
    run("UPDATE trades SET status = 'accepted', closed_at = ? WHERE id = ?", now(), tradeId);
  });
  toUser(t.from_user, { type: 'trade', tradeId });
  return { status: 'accepted' };
}

export function tradesFor(group: Group, userId: string) {
  const rows = all<{ id: string; from_user: string; to_user: string; offer_card: string; want_card: string; rarity: string; status: string; created_at: number }>(
    'SELECT * FROM trades WHERE group_id = ? AND (from_user = ? OR to_user = ?) ORDER BY created_at DESC LIMIT 40', group.id, userId, userId,
  );
  const posts = new Map(toDTO(visiblePosts(group, userId), userId).map((p) => [p.id, p]));
  const card = (cid: string) => {
    const c = getCard(cid);
    return c ? { ...c, post: posts.get(c.postId) ?? null } : null;
  };
  return rows.map((r) => ({
    id: r.id, status: r.status, rarity: r.rarity, createdAt: r.created_at, incoming: r.to_user === userId,
    from: publicUser(getUser(r.from_user)!), to: publicUser(getUser(r.to_user)!), offer: card(r.offer_card), want: card(r.want_card),
  }));
}

/** Other members' cards you could ask for (same-rarity swaps only). */
export function tradeable(group: Group, userId: string) {
  const posts = new Map(toDTO(visiblePosts(group, userId), userId).map((p) => [p.id, p]));
  return members(group.id)
    .filter((m) => m.userId !== userId)
    .map((m) => ({ user: publicUser(m.user), cards: cardsFor(m.userId, group.id).map((c) => ({ ...c, post: posts.get(c.postId) ?? null })).filter((c) => c.post) }));
}

/* ───────────────────────── Upgrades & flair ───────────────────────── */

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

export function applyFlair(userId: string, cardId: string) {
  const c = getCard(cardId);
  if (!c || c.ownerId !== userId) throw new GameError('not_found');
  const dups = all<{ id: string }>('SELECT id FROM cards WHERE owner_id = ? AND post_id = ? AND rarity = ? AND id != ? AND flair IS NULL LIMIT ?', userId, c.postId, c.rarity, c.id, FLAIR.duplicates);
  if (dups.length < FLAIR.duplicates) throw new GameError('need_duplicates', `Needs ${FLAIR.duplicates} extra copies`);
  if (getUser(userId)!.shinedust < FLAIR.dust) throw new GameError('no_dust');
  tx(() => {
    for (const d of dups) run('DELETE FROM cards WHERE id = ?', d.id);
    addCurrency(userId, { shinedust: -FLAIR.dust });
    run('UPDATE cards SET flair = ? WHERE id = ?', FLAIR.id, cardId);
  });
  return { flair: FLAIR.id };
}

export function badge(userId: string, groupId: string, cardId: string | null) {
  const u = getUser(userId)!;
  const badges = { ...((u.settings as Record<string, unknown>).badges as Record<string, string | null> | undefined) };
  if (cardId) {
    const c = getCard(cardId);
    if (!c || c.ownerId !== userId || !c.serial) throw new GameError('not_numbered');
  }
  badges[groupId] = cardId;
  run('UPDATE users SET settings = ? WHERE id = ?', json.str({ ...u.settings, badges }), userId);
  return badges;
}
