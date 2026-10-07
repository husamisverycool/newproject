import { zipSync, strToU8 } from 'fflate';
import { BACKDROPS, PLANS, SPARKS_PRICE, STORAGE, oddsTable, pets, spec, type Group, type Plan } from '@app/shared';
import { all, get, json, now, run } from '../db.ts';
import { readMedia } from '../media.ts';
import { addCurrency, getGroup, getObject, getPost, getUser, id, members, membership, postsForGroup, publicUser, updateMascot, updateUser } from '../repo.ts';
import { GameError, buyPackWithSparks, grantPack } from './cards.ts';
import { ritualWindow } from '@app/shared';

/**
 * Cosmetics shop paid in Sparks (Discord Orbs → Shop, no ads), subscriptions (Snapchat+ / Locket
 * Gold / Retro Premium pricing), gifts (Telegram gifts, no resale), print orders with group chip-in
 * (Retro postcards, Partiful payment links), storage accounting and the full archive export
 * (Snapchat "Download My Data", in every tier).
 *
 * Shop categories come from the sources: Duolingo shop outfits for the mascot (pets.outfits), Locket Gold
 * perks "Camera themes" and "Custom app icons" (included with roll+, as Gold includes them), and TCG Pocket
 * Special Shop kinds "Card Sleeve", "Cover", "Backdrop". Prices are Discord Orb prices [V-weak]:
 * decorations 3,500 · a premium item 1,400 (the 3-day Nitro credit) · badge 70. Card Sleeve (12 Special
 * Shop Tickets) is priced at the top tier, Cover and Backdrop (7 tickets each) at the next.
 */

export type ItemKind = 'outfit' | 'theme' | 'icon' | 'sleeve' | 'cover' | 'backdrop' | 'pack';
export interface ShopItem {
  id: string;
  kind: ItemKind;
  /** Deck wording or an Apple system color name [HIG]; null when the item has no sourced name. */
  name: string | null;
  /** Variant color (Apple system color): centre hex and darker edge. */
  color?: { id: string; from: string; to: string };
  sparks: number;
  /** Comes with roll+ (Locket Gold perks); not sold for Sparks. */
  plusOnly?: boolean;
  /** Listed under the "Sparks Exclusives" tab (Discord "Orbs Exclusives"). */
  exclusive: boolean;
}

const colorItems = (kind: ItemKind, sparks: number, opts: { plusOnly?: boolean; exclusive: boolean }): ShopItem[] =>
  BACKDROPS.map((b) => ({ id: `${kind}_${b.id}`, kind, name: b.name, color: { id: b.id, from: b.from, to: b.to }, sparks, ...opts }));

export const SHOP: ShopItem[] = [
  { id: 'pack', kind: 'pack', name: null, sparks: SPARKS_PRICE.extraPack, exclusive: true },
  ...Object.entries(pets.outfitNames).map(([oid, name]) => ({ id: oid, kind: 'outfit' as const, name, sparks: SPARKS_PRICE.decoration, exclusive: true })),
  ...colorItems('sleeve', SPARKS_PRICE.decoration, { exclusive: true }),
  ...colorItems('cover', SPARKS_PRICE.premium, { exclusive: true }),
  ...colorItems('backdrop', SPARKS_PRICE.premium, { exclusive: true }),
  ...colorItems('theme', 0, { plusOnly: true, exclusive: false }),
  ...colorItems('icon', 0, { plusOnly: true, exclusive: false }),
];

export function owned(userId: string) {
  return new Set(all<{ item: string }>('SELECT item FROM purchases WHERE user_id = ?', userId).map((r) => r.item));
}

/** Items a member can use: bought, gifted, or included with their plan. */
export function usable(userId: string) {
  const u = getUser(userId)!;
  const mine = owned(userId);
  for (const i of SHOP) if (i.plusOnly && u.plan !== 'free') mine.add(i.id);
  return mine;
}

export function shop(userId: string) {
  const u = getUser(userId)!;
  const mine = usable(userId);
  const settings = u.settings as Record<string, unknown>;
  return {
    sparks: u.sparks,
    plan: u.plan,
    plans: Object.values(PLANS),
    items: SHOP.map((i) => ({ ...i, owned: i.kind !== 'pack' && mine.has(i.id) })),
    equipped: { sleeve: (settings.sleeve as string) ?? null, theme: u.settings.frame ?? null, icon: u.settings.appIcon ?? null },
    odds: oddsTable(),
  };
}

export function buy(userId: string, itemId: string, groupId: string | null) {
  const item = SHOP.find((i) => i.id === itemId);
  if (!item) throw new GameError('not_found');
  if (item.kind === 'pack') {
    const g = groupId ? getGroup(groupId) : null;
    if (!g || !membership(g.id, userId)) throw new GameError('group_required');
    return { ok: true, packId: buyPackWithSparks(g, userId) };
  }
  const u = getUser(userId)!;
  if (item.plusOnly) throw new GameError('plan_required');
  if (owned(userId).has(itemId)) throw new GameError('owned');
  if (u.sparks < item.sparks) throw new GameError('no_sparks');
  addCurrency(userId, { sparks: -item.sparks });
  run('INSERT INTO purchases (id, user_id, group_id, item, price_sparks, created_at) VALUES (?, ?, ?, ?, ?, ?)', id('buy'), userId, groupId, itemId, item.sparks, now());
  return { ok: true };
}

/** Uses an owned sleeve, camera theme or app icon (null takes it off). */
export function equip(userId: string, kind: 'sleeve' | 'theme' | 'icon', itemId: string | null) {
  if (itemId) {
    const item = SHOP.find((i) => i.id === itemId);
    if (!item || item.kind !== kind || !usable(userId).has(itemId)) throw new GameError('not_owned');
  }
  const u = getUser(userId)!;
  const key = kind === 'sleeve' ? 'sleeve' : kind === 'theme' ? 'frame' : 'appIcon';
  run('UPDATE users SET settings = ? WHERE id = ?', json.str({ ...u.settings, [key]: itemId ?? undefined }), userId);
  return shop(userId).equipped;
}

/** Mascot cosmetics are worn group-wide — whoever bought them can dress the group mascot. */
export function dressMascot(group: Group, userId: string, outfit: string[]) {
  const mine = owned(userId);
  const allowed = outfit.filter((o) => mine.has(o) || group.mascot.outfit.includes(o));
  updateMascot(group.id, (m) => ({ ...m, outfit: allowed.slice(0, 3) }));
}

/** Demo purchase flow — no real payments in this build. */
export function setPlan(userId: string, plan: Plan) {
  updateUser(userId, { plan });
  run('INSERT INTO purchases (id, user_id, item, price_usd, created_at) VALUES (?, ?, ?, ?, ?)', id('buy'), userId, `plan_${plan}`, PLANS[plan].monthly, now());
}

/**
 * Gifts (Discord Shop "Gift"; Telegram gifts without resale): a month of roll+, a pack, or a shop item for
 * a friend. Packs and items are paid in the sender's Sparks at the shop price.
 */
export function gift(fromId: string, toId: string, kind: 'plus_month' | 'pack' | 'item', groupId: string | null, itemId?: string) {
  const to = getUser(toId);
  if (!to) throw new GameError('not_found');
  const from = fromId === 'system' ? null : getUser(fromId);
  if (kind === 'plus_month') {
    if (to.plan === 'free') updateUser(toId, { plan: 'plus' });
    run('INSERT INTO purchases (id, user_id, group_id, item, price_usd, created_at) VALUES (?, ?, ?, ?, ?, ?)', id('buy'), fromId, groupId, `gift_${kind}_to_${toId}`, 3.99, now());
    return;
  }
  if (!groupId || !membership(groupId, toId) || (from && !membership(groupId, from.id))) throw new GameError('group_required');
  if (from && from.id === toId) throw new GameError('same_user');
  if (kind === 'pack') {
    if (from) {
      if (from.sparks < SPARKS_PRICE.extraPack) throw new GameError('no_sparks');
      addCurrency(from.id, { sparks: -SPARKS_PRICE.extraPack });
    }
    const g = get<{ ritual_day: number; develop_hour: number; time_zone: string }>('SELECT ritual_day, develop_hour, time_zone FROM groups WHERE id = ?', groupId)!;
    grantPack(toId, groupId, ritualWindow(now(), { ritualDay: g.ritual_day, developHour: g.develop_hour, timeZone: g.time_zone }).weekKey, 'gift');
    run('INSERT INTO purchases (id, user_id, group_id, item, price_sparks, created_at) VALUES (?, ?, ?, ?, ?, ?)', id('buy'), fromId, groupId, `gift_pack_to_${toId}`, from ? SPARKS_PRICE.extraPack : 0, now());
    return;
  }
  const item = SHOP.find((i) => i.id === itemId);
  if (!item || item.kind === 'pack' || item.plusOnly) throw new GameError('not_found');
  if (owned(toId).has(item.id)) throw new GameError('owned');
  if (from) {
    if (from.sparks < item.sparks) throw new GameError('no_sparks');
    addCurrency(from.id, { sparks: -item.sparks });
  }
  run('INSERT INTO purchases (id, user_id, group_id, item, price_sparks, created_at) VALUES (?, ?, ?, ?, ?, ?)', id('buy'), toId, groupId, item.id, 0, now());
  run('INSERT INTO purchases (id, user_id, group_id, item, price_sparks, created_at) VALUES (?, ?, ?, ?, ?, ?)', id('buy'), fromId, groupId, `gift_${item.id}_to_${toId}`, from ? item.sparks : 0, now());
}

/* ───────────────────────── Print orders with group chip-in ───────────────────────── */

/**
 * Retro postcards are $2 (research/02 §B4.10); other print prices are product parameters. Names come from
 * the decks (Retro "postcard", spec §U "Zine", §V "Printed yearbook"); the figurine card has no sourced name.
 */
export const PRINT: Record<'postcard' | 'zine' | 'yearbook' | 'figurine_card', { name: string | null; usd: number }> = {
  postcard: { name: 'Postcard', usd: 2 },
  zine: { name: spec.zine, usd: 6 },
  yearbook: { name: spec.yearbook, usd: 29 },
  figurine_card: { name: null, usd: 3 },
};

export function createOrder(group: Group, userId: string, kind: keyof typeof PRINT, items: string[], qty = 1) {
  const total = PRINT[kind].usd * Math.max(1, qty);
  const oid = id('ord');
  run('INSERT INTO orders (id, group_id, created_by, kind, items, total_usd, chips, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    oid, group.id, userId, kind, json.str(items), total, json.str({}), 'collecting', now());
  return oid;
}

export function chipIn(orderId: string, userId: string, usd: number) {
  const o = get<{ id: string; group_id: string; total_usd: number; chips: string; status: string }>('SELECT * FROM orders WHERE id = ?', orderId);
  if (!o || o.status !== 'collecting' || !membership(o.group_id, userId)) throw new GameError('not_found');
  const chips = json.parse<Record<string, number>>(o.chips, {});
  // Each member chips in toward the group order; no one can pay past the total.
  const left = Math.max(0, o.total_usd - Object.values(chips).reduce((a, b) => a + b, 0));
  chips[userId] = Math.round(((chips[userId] ?? 0) + Math.min(left, Math.max(0, Number(usd) || 0))) * 100) / 100;
  const paid = Object.values(chips).reduce((a, b) => a + b, 0);
  run('UPDATE orders SET chips = ?, status = ? WHERE id = ?', json.str(chips), paid >= o.total_usd ? 'paid' : 'collecting', orderId);
}

/** The first item's picture: a post's thumbnail (postcard) or a made object's media (zine, figurine card). */
function orderPreview(item: string | undefined) {
  if (!item) return null;
  const post = getPost(item);
  if (post) return post.media.thumb ?? post.media.main;
  const o = getObject(item);
  return o && !o.revoked ? o.media : null;
}

export function ordersFor(groupId: string) {
  const users = new Map(members(groupId).map((m) => [m.userId, publicUser(m.user)]));
  return all<{ id: string; created_by: string; kind: keyof typeof PRINT; items: string; total_usd: number; chips: string; status: string; created_at: number }>(
    'SELECT * FROM orders WHERE group_id = ? ORDER BY created_at DESC', groupId,
  ).map((o) => {
    const chips = json.parse<Record<string, number>>(o.chips, {});
    return {
      id: o.id, kind: o.kind, name: PRINT[o.kind]?.name ?? o.kind, items: json.parse<string[]>(o.items, []), total: o.total_usd, status: o.status, createdAt: o.created_at,
      preview: orderPreview(json.parse<string[]>(o.items, [])[0]),
      createdBy: users.get(o.created_by) ?? null, paid: Object.values(chips).reduce((a, b) => a + b, 0),
      chips: Object.entries(chips).map(([u, v]) => ({ user: users.get(u) ?? null, usd: v })),
    };
  });
}

/* ───────────────────────── Storage & export ───────────────────────── */

export function storage(group: Group) {
  const rows = all<{ user_id: string; bytes: number; n: number }>('SELECT user_id, SUM(bytes) AS bytes, COUNT(*) AS n FROM posts WHERE group_id = ? GROUP BY user_id', group.id);
  const used = rows.reduce((s, r) => s + (r.bytes ?? 0), 0);
  const ms = members(group.id);
  const paid = ms.some((m) => m.user.plan !== 'free');
  return {
    used,
    budget: paid ? null : STORAGE.freeGroupBudget,
    tier: paid ? 'full-resolution originals' : 'compressed copies (1600px)',
    byMember: rows.map((r) => ({ user: publicUser(ms.find((m) => m.userId === r.user_id)?.user ?? getUser(r.user_id)!), bytes: r.bytes, posts: r.n })),
  };
}

/** Full archive export in every tier: every photo the member can see plus a JSON index. */
export async function exportArchive(group: Group, userId: string) {
  const posts = postsForGroup(group.id);
  const files: Record<string, Uint8Array> = {};
  const index = posts.map((p) => ({ id: p.id, by: getUser(p.userId)?.name, caption: p.caption, takenAt: new Date(p.takenAt).toISOString(), createdAt: new Date(p.createdAt).toISOString(), week: p.weekKey, kind: p.kind }));
  for (const p of posts) {
    const src = p.media.original ?? p.media.main;
    try {
      files[`photos/${p.weekKey}/${p.id}.jpg`] = await readMedia(src);
    } catch {
      /* missing file */
    }
  }
  const me = getUser(userId)!;
  files['index.json'] = strToU8(JSON.stringify({ group: group.name, exportedBy: me.name, exportedAt: new Date().toISOString(), posts: index }, null, 2));
  return Buffer.from(zipSync(files, { level: 0 }));
}
