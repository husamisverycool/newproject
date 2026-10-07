import fs from 'node:fs';
import { zipSync, strToU8 } from 'fflate';
import { PLANS, STORAGE, type Group, type Plan } from '@app/shared';
import { all, get, json, now, run } from '../db.ts';
import { mediaPath } from '../media.ts';
import { addCurrency, getUser, id, members, postsForGroup, publicUser, updateMascot, updateUser } from '../repo.ts';
import { GameError, grantPack } from './cards.ts';
import { ritualWindow } from '@app/shared';

/**
 * Cosmetics shop paid in Sparks (Discord Orbs → Shop, no ads), subscriptions (Snapchat+ / Locket
 * Gold / Retro Premium pricing), gifts (Telegram gifts, no resale), print orders with group chip-in
 * (Retro postcards, Partiful payment links), storage accounting and the full archive export
 * (Snapchat "Download My Data", in every tier).
 */

export type ItemKind = 'outfit' | 'frame' | 'cover' | 'icon' | 'watermark';
export interface ShopItem {
  id: string;
  kind: ItemKind;
  name: string;
  sparks: number;
  plusOnly?: boolean;
  /** Where the item's idea comes from (docs/INSPIRATION.md). */
  source: string;
}

export const SHOP: ShopItem[] = [
  { id: 'outfit_party_hat', kind: 'outfit', name: 'Party hat', sparks: 80, source: 'QQ Show / Zepeto dress-up' },
  { id: 'outfit_beanie', kind: 'outfit', name: 'Beanie', sparks: 120, source: 'QQ Show / Zepeto dress-up' },
  { id: 'outfit_headphones', kind: 'outfit', name: 'Headphones', sparks: 160, source: 'QQ Show / Zepeto dress-up' },
  { id: 'outfit_shades', kind: 'outfit', name: 'Shades', sparks: 140, source: 'QQ Show / Zepeto dress-up' },
  { id: 'outfit_crown', kind: 'outfit', name: 'Crown', sparks: 400, source: 'QQ Show / Zepeto dress-up' },
  { id: 'outfit_flower', kind: 'outfit', name: 'Flower', sparks: 60, source: 'QQ Show / Zepeto dress-up' },
  { id: 'frame_film', kind: 'frame', name: 'Film strip', sparks: 100, source: 'Locket Gold camera themes; Lapse / Dispo film' },
  { id: 'frame_datestamp', kind: 'frame', name: 'Date stamp', sparks: 90, source: 'Dispo / disposable-camera date imprint' },
  { id: 'frame_hearts', kind: 'frame', name: 'Purikura hearts', sparks: 120, source: 'Purikura frames; SNOW / B612' },
  { id: 'frame_instant', kind: 'frame', name: 'Instant film', sparks: 140, source: 'Polaroid trend (Nano Banana)' },
  { id: 'cover_bee', kind: 'cover', name: 'Bee binder cover', sparks: 150, source: 'TCG Pocket binder covers' },
  { id: 'cover_macaw', kind: 'cover', name: 'Macaw binder cover', sparks: 150, source: 'TCG Pocket binder covers' },
  { id: 'cover_beetle', kind: 'cover', name: 'Beetle binder cover', sparks: 150, source: 'TCG Pocket binder covers' },
  { id: 'icon_yellow', kind: 'icon', name: 'Yellow icon', sparks: 0, plusOnly: true, source: 'Locket Gold custom app icons' },
  { id: 'icon_mascot', kind: 'icon', name: 'Mascot icon', sparks: 0, plusOnly: true, source: 'Locket Gold custom app icons' },
  { id: 'wm_mascot', kind: 'watermark', name: 'Mascot-only watermark', sparks: 0, plusOnly: true, source: 'Spec §Q watermark styles' },
  { id: 'wm_mono', kind: 'watermark', name: 'Mono watermark', sparks: 0, plusOnly: true, source: 'Spec §Q watermark styles' },
];

export function owned(userId: string) {
  return new Set(all<{ item: string }>('SELECT item FROM purchases WHERE user_id = ?', userId).map((r) => r.item));
}

export function shop(userId: string) {
  const u = getUser(userId)!;
  const mine = owned(userId);
  return {
    sparks: u.sparks,
    plan: u.plan,
    plans: Object.values(PLANS),
    items: SHOP.map((i) => ({ ...i, owned: mine.has(i.id) || (i.plusOnly && u.plan !== 'free') })),
  };
}

export function buy(userId: string, itemId: string, groupId: string | null) {
  const item = SHOP.find((i) => i.id === itemId);
  if (!item) throw new GameError('not_found');
  const u = getUser(userId)!;
  if (item.plusOnly && u.plan === 'free') throw new GameError('plan_required', `${item.name} comes with roll+`);
  if (owned(userId).has(itemId)) throw new GameError('owned');
  if (u.sparks < item.sparks) throw new GameError('no_sparks');
  addCurrency(userId, { sparks: -item.sparks });
  run('INSERT INTO purchases (id, user_id, group_id, item, price_sparks, created_at) VALUES (?, ?, ?, ?, ?, ?)', id('buy'), userId, groupId, itemId, item.sparks, now());
  return { ok: true };
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

/** Gifts: a month of roll+ or a pack for a friend — never resellable (spec §U, Telegram gifts adapted). */
export function gift(fromId: string, toId: string, kind: 'plus_month' | 'pack', groupId: string | null) {
  const to = getUser(toId);
  if (!to) throw new GameError('not_found');
  if (kind === 'plus_month') {
    if (to.plan === 'free') updateUser(toId, { plan: 'plus' });
  } else {
    if (!groupId) throw new GameError('group_required');
    const g = get<{ ritual_day: number; develop_hour: number; time_zone: string }>('SELECT ritual_day, develop_hour, time_zone FROM groups WHERE id = ?', groupId)!;
    grantPack(toId, groupId, ritualWindow(now(), { ritualDay: g.ritual_day, developHour: g.develop_hour, timeZone: g.time_zone }).weekKey, 'gift');
  }
  run('INSERT INTO purchases (id, user_id, group_id, item, price_usd, created_at) VALUES (?, ?, ?, ?, ?, ?)', id('buy'), fromId, groupId, `gift_${kind}_to_${toId}`, kind === 'plus_month' ? 3.99 : 0.99, now());
}

/* ───────────────────────── Print orders with group chip-in ───────────────────────── */

/** Retro postcards are $2 (research/02 §B4.10); other print prices are product parameters. */
export const PRINT = {
  postcard: { name: 'Postcard', usd: 2 },
  zine: { name: 'Printed zine', usd: 6 },
  yearbook: { name: 'Yearbook', usd: 29 },
  figurine_card: { name: 'Figurine card', usd: 3 },
} as const;

export function createOrder(group: Group, userId: string, kind: keyof typeof PRINT, items: string[], qty = 1) {
  const total = PRINT[kind].usd * Math.max(1, qty);
  const oid = id('ord');
  run('INSERT INTO orders (id, group_id, created_by, kind, items, total_usd, chips, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    oid, group.id, userId, kind, json.str(items), total, json.str({}), 'collecting', now());
  return oid;
}

export function chipIn(orderId: string, userId: string, usd: number) {
  const o = get<{ id: string; total_usd: number; chips: string; status: string }>('SELECT * FROM orders WHERE id = ?', orderId);
  if (!o || o.status !== 'collecting') throw new GameError('not_found');
  const chips = json.parse<Record<string, number>>(o.chips, {});
  chips[userId] = Math.round(((chips[userId] ?? 0) + Math.max(0, usd)) * 100) / 100;
  const paid = Object.values(chips).reduce((a, b) => a + b, 0);
  run('UPDATE orders SET chips = ?, status = ? WHERE id = ?', json.str(chips), paid >= o.total_usd ? 'paid' : 'collecting', orderId);
}

export function ordersFor(groupId: string) {
  const users = new Map(members(groupId).map((m) => [m.userId, publicUser(m.user)]));
  return all<{ id: string; created_by: string; kind: keyof typeof PRINT; items: string; total_usd: number; chips: string; status: string; created_at: number }>(
    'SELECT * FROM orders WHERE group_id = ? ORDER BY created_at DESC', groupId,
  ).map((o) => {
    const chips = json.parse<Record<string, number>>(o.chips, {});
    return {
      id: o.id, kind: o.kind, name: PRINT[o.kind]?.name ?? o.kind, items: json.parse<string[]>(o.items, []), total: o.total_usd, status: o.status, createdAt: o.created_at,
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
export function exportArchive(group: Group, userId: string) {
  const posts = postsForGroup(group.id);
  const files: Record<string, Uint8Array> = {};
  const index = posts.map((p) => ({ id: p.id, by: getUser(p.userId)?.name, caption: p.caption, takenAt: new Date(p.takenAt).toISOString(), createdAt: new Date(p.createdAt).toISOString(), week: p.weekKey, kind: p.kind }));
  for (const p of posts) {
    const src = p.media.original ?? p.media.main;
    try {
      files[`photos/${p.weekKey}/${p.id}.jpg`] = fs.readFileSync(mediaPath(src));
    } catch {
      /* missing file */
    }
  }
  const me = getUser(userId)!;
  files['index.json'] = strToU8(JSON.stringify({ group: group.name, exportedBy: me.name, exportedAt: new Date().toISOString(), posts: index }, null, 2));
  return Buffer.from(zipSync(files, { level: 0 }));
}
