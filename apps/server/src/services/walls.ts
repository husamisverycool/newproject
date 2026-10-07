import sharp from 'sharp';
import { BRAND, FREE_GROUP_RECAPS_PER_WEEK, PLANS, autoCreationAllowed, seeded, yope, type Group } from '@app/shared';
import { all, get, json, now, run } from '../db.ts';
import { exportImage, readMedia, writeMedia, escapeXml } from '../media.ts';
import { getUser, id, insertObject, members, postsForGroup, type PostFull } from '../repo.ts';
import { toGroup } from '../realtime.ts';
import * as img from '../ai/image.ts';
import { MASCOT_SPECIES } from '@app/shared';

/**
 * Walls: Yope's "continuously evolving" collage of the week's photos, editable and remixable with
 * saved versions ([V-weak] research/02 §A4.3; spec §E). The arrangements are the ones in the user's
 * INSPO folder [I]:
 * - mosaic: Yope's week recap (frame yope-week-recap): photos tiled edge to edge in rows of one to
 *   three, no gaps, on black;
 * - scrapbook: Yope's recap (yope-03): the same tiling underneath, with a few photos lifted out as
 *   tilted die-cut stickers and striped washi tape;
 * - polaroid: Retro's recap (retro-04): photos in Polaroid frames, scattered, on black.
 * There are no emoji or mascot decorations — none of the sources show any.
 */

export type WallStyle = 'mosaic' | 'scrapbook' | 'polaroid';
export const WALL_STYLES: { id: WallStyle; source: string }[] = [
  { id: 'mosaic', source: '[I] frame yope-week-recap' },
  { id: 'scrapbook', source: '[I] yope-03-recaps-collage' },
  { id: 'polaroid', source: '[I] retro-04-recap' },
];
const LEGACY: Record<string, WallStyle> = { chaos: 'mosaic', grid: 'mosaic', filmstrip: 'polaroid' };
export const wallStyle = (s: string | undefined): WallStyle => (WALL_STYLES.some((x) => x.id === s) ? (s as WallStyle) : LEGACY[s ?? ''] ?? 'mosaic');

export interface WallItem {
  id: string;
  postId: string;
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
  z: number;
  shape: 'tile' | 'photo' | 'sticker' | 'polaroid';
  caption?: string | null;
  tape?: boolean;
}

export interface WallDeco {
  id: string;
  kind: 'emoji' | 'text' | 'mascot';
  value: string;
  x: number;
  y: number;
  size: number;
  rot: number;
}

export interface WallLayout {
  width: number;
  height: number;
  bg: string;
  title: string;
  subtitle: string;
  items: WallItem[];
  decos: WallDeco[];
}

/** Rows of 1–3 tiles filling the whole canvas edge to edge [I]. */
function mosaic(pool: PostFull[], rng: () => number, W: number, H: number, z0 = 0): WallItem[] {
  const counts: number[] = [];
  let left = pool.length;
  while (left > 0) {
    const n = Math.min(left, left <= 3 ? left : 1 + Math.floor(rng() * 3));
    counts.push(n);
    left -= n;
  }
  const rowH = H / Math.max(1, counts.length);
  const items: WallItem[] = [];
  let k = 0;
  counts.forEach((n, r) => {
    const weights = Array.from({ length: n }, () => 0.7 + rng() * 0.6);
    const sum = weights.reduce((x, y) => x + y, 0);
    let x = 0;
    weights.forEach((wt) => {
      const p = pool[k];
      const w = (wt / sum) * W;
      items.push({ id: `i${k}`, postId: p.id, src: p.media.thumb ?? p.media.main, x: x / W, y: (r * rowH) / H, w: w / W, h: rowH / H, rot: 0, z: z0 + k, shape: 'tile', caption: null });
      x += w;
      k++;
    });
  });
  return items;
}

export function layoutWall(posts: PostFull[], opts: { style: WallStyle; seed: string; title: string; subtitle: string }): WallLayout {
  const rng = seeded(opts.seed);
  const W = 1080;
  const H = 1440;
  const pool = [...posts].sort(() => rng() - 0.5).slice(0, 12);
  let items: WallItem[] = [];
  if (opts.style === 'mosaic') items = mosaic(pool, rng, W, H);
  else if (opts.style === 'scrapbook') {
    items = mosaic(pool, rng, W, H);
    const lifted = pool.slice(0, Math.min(4, Math.max(1, Math.floor(pool.length / 3))));
    lifted.forEach((p, i) => {
      const w = W * (0.34 + rng() * 0.14);
      const h = w * (1.05 + rng() * 0.25);
      items.push({
        id: `s${i}`, postId: p.id, src: p.media.thumb ?? p.media.main,
        x: (0.04 + rng() * (0.92 - w / W)), y: (0.04 + rng() * (0.9 - h / H)), w: w / W, h: h / H,
        rot: (rng() - 0.5) * 18, z: 100 + i, shape: 'sticker', caption: null, tape: rng() < 0.6,
      });
    });
  } else {
    const n = Math.min(pool.length, 7);
    for (let i = 0; i < n; i++) {
      const p = pool[i];
      const w = W * 0.46;
      const cx = (0.28 + (i % 2) * 0.44 + (rng() - 0.5) * 0.08) * W;
      const cy = ((Math.floor(i / 2) + 0.5) / Math.ceil(n / 2)) * H + (rng() - 0.5) * 60;
      items.push({
        id: `p${i}`, postId: p.id, src: p.media.thumb ?? p.media.main,
        x: (cx - w / 2) / W, y: (cy - w * 0.6) / H, w: w / W, h: w / H,
        rot: (rng() - 0.5) * 12, z: i, shape: 'polaroid', caption: p.caption,
      });
    }
  }
  return { width: W, height: H, bg: '#000000', title: opts.title, subtitle: opts.subtitle, items, decos: [] };
}

export function latestWall(groupId: string, weekKey: string) {
  const w = get<{ id: string; version: number; layout: string; style: string; generator: string; created_by: string | null; created_at: number }>(
    'SELECT * FROM walls WHERE group_id = ? AND week_key = ? ORDER BY version DESC LIMIT 1', groupId, weekKey,
  );
  return w ? { ...w, layout: json.parse<WallLayout | null>(w.layout, null) } : null;
}

export function wallVersions(groupId: string, weekKey: string) {
  return all<{ version: number; style: string; generator: string; created_by: string | null; created_at: number }>(
    'SELECT version, style, generator, created_by, created_at FROM walls WHERE group_id = ? AND week_key = ? ORDER BY version DESC', groupId, weekKey,
  );
}

export function saveWall(group: Group, weekKey: string, layout: WallLayout, style: string, generator: string, createdBy: string | null) {
  const prev = latestWall(group.id, weekKey);
  const version = (prev?.version ?? 0) + 1;
  run('INSERT INTO walls (id, group_id, week_key, version, layout, style, generator, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    id('w'), group.id, weekKey, version, json.str(layout), style, generator, createdBy, now());
  toGroup(group.id, { type: 'wall', groupId: group.id, weekKey, version });
  return version;
}

/** Yope's week label [I]: "18 aug-24 aug". */
export function weekTitle(weekKey: string) {
  const end = Date.parse(`${weekKey}T12:00:00Z`);
  return yope.weekRange(end - 6 * 86_400_000, end);
}

export function generateWall(group: Group, weekKey: string, style: WallStyle = 'mosaic', createdBy: string | null = null, seed?: string) {
  const posts = postsForGroup(group.id, { weekKey });
  if (!posts.length) return null;
  const layout = layoutWall(posts, { style: wallStyle(style), seed: seed ?? `${group.id}:${weekKey}:${Date.now()}`, title: group.name, subtitle: weekTitle(weekKey) });
  const version = saveWall(group, weekKey, layout, style, createdBy ? 'remix' : 'auto', createdBy);
  return { version, layout };
}

/* ───────────────────────── Render (export) ───────────────────────── */

export async function renderWall(_group: Group, layout: WallLayout) {
  const { width: W, height: H } = layout;
  const comps: sharp.OverlayOptions[] = [];
  for (const it of [...layout.items].sort((a, b) => a.z - b.z)) {
    let src: Buffer;
    try {
      src = readMedia(it.src);
    } catch {
      continue;
    }
    const w = Math.round(it.w * W);
    const h = Math.round(it.h * H);
    let tile = await sharp(src).rotate().resize(w, h, { fit: 'cover' }).png().toBuffer();
    if (it.shape === 'tile') {
      /* edge-to-edge tile [I] */
    } else if (it.shape === 'polaroid') tile = await sharp(tile).extend({ top: 18, left: 18, right: 18, bottom: 70, background: '#efeee6' }).png().toBuffer();
    else if (it.shape === 'sticker') {
      const r = Math.round(Math.min(w, h) * 0.18);
      const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" fill="#fff"/></svg>`);
      tile = await sharp(tile).composite([{ input: mask, blend: 'dest-in' }]).extend({ top: 12, left: 12, right: 12, bottom: 12, background: '#fff' }).png().toBuffer();
    } else {
      const r = Math.round(Math.min(w, h) * 0.06);
      const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" fill="#fff"/></svg>`);
      tile = await sharp(tile).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
    }
    const rotated = await sharp(tile).rotate(it.rot, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    const m = await sharp(rotated).metadata();
    const left = Math.round(it.x * W + w / 2 - (m.width ?? w) / 2);
    const top = Math.round(it.y * H + h / 2 - (m.height ?? h) / 2);
    const cl = Math.max(0, Math.min(W - 1, left));
    const ct = Math.max(0, Math.min(H - 1, top));
    const cropped = await sharp(rotated).extract({ left: cl - left, top: ct - top, width: Math.min((m.width ?? w) - (cl - left), W - cl), height: Math.min((m.height ?? h) - (ct - top), H - ct) }).png().toBuffer();
    comps.push({ input: cropped, left: cl, top: ct });
  }
  // Yope week-recap marks [I]: the range in bold capitals bottom left, the wordmark bottom right.
  const marks = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><g font-family="-apple-system, Helvetica, Arial" fill="#fff"><text x="56" y="${H - 56}" font-weight="800" font-size="58">${escapeXml(layout.subtitle.toUpperCase())}</text><text x="${W - 56}" y="${H - 56}" font-weight="800" font-size="46" text-anchor="end">${escapeXml(BRAND.name)}</text></g></svg>`;
  comps.push({ input: Buffer.from(marks), top: 0, left: 0 });
  return sharp({ create: { width: W, height: H, channels: 3, background: layout.bg } }).composite(comps).jpeg({ quality: 88 }).toBuffer();
}

export async function exportWall(group: Group, layout: WallLayout, userId: string) {
  const buf = await renderWall(group, layout);
  const species = MASCOT_SPECIES.find((s) => s.id === group.mascot.species) ?? MASCOT_SPECIES[0];
  const user = getUser(userId);
  return exportImage(buf, { generator: 'roll. walls', model: null, createdAt: now(), subjects: [], consentChecked: true, watermark: 'visible' }, { mascotColor: species.body, handle: user?.name.toLowerCase().replace(/\s+/g, '') });
}

/* ───────────────────────── Weekly AI recap: six panels (spec §G) ───────────────────────── */

export function recapCountThisWeek(groupId: string, weekKey: string) {
  return get<{ n: number }>(`SELECT COUNT(*) AS n FROM objects WHERE group_id = ? AND kind = 'recap' AND json_extract(meta, '$.weekKey') = ?`, groupId, weekKey)?.n ?? 0;
}

export function groupHasPaidMember(groupId: string) {
  return members(groupId).some((m) => m.user.plan !== 'free');
}

export async function generateRecap(group: Group, weekKey: string, requestedBy: string | null, style = 'comic') {
  const paid = groupHasPaidMember(group.id);
  const used = recapCountThisWeek(group.id, weekKey);
  if (!paid && used >= FREE_GROUP_RECAPS_PER_WEEK) return { ok: false as const, reason: 'free_limit' };
  const ms = members(group.id);
  const allowed = new Set(ms.filter((m) => autoCreationAllowed(m.user) || m.userId === requestedBy).map((m) => m.userId));
  const posts = postsForGroup(group.id, { weekKey }).filter((p) => allowed.has(p.userId));
  if (!posts.length) return { ok: false as const, reason: 'no_posts' };
  const pick = [...posts].sort((a, b) => Number(b.ritual) - Number(a.ritual) || (b.caption?.length ?? 0) - (a.caption?.length ?? 0)).slice(0, 6);
  const panels: string[] = [];
  let model = 'roll-local-renderer';
  let cost = 0;
  for (const p of pick) {
    const res = await img.remix(style, readMedia(p.media.main), { caption: p.caption });
    model = res.model;
    cost += res.costUsd;
    panels.push(writeMedia(res.image, 'jpg').url);
  }
  if (requestedBy) img.recordUsage(requestedBy, cost);
  const obj = insertObject({
    groupId: group.id, kind: 'recap', createdBy: requestedBy ?? 'system', subjects: [...new Set(pick.map((p) => p.userId))], media: panels[0], style,
    provenance: { generator: 'roll. recap', model, createdAt: now(), subjects: [...new Set(pick.map((p) => p.userId))], consentChecked: true, watermark: 'both' },
    createdAt: now(), meta: { weekKey, panels, postIds: pick.map((p) => p.id), costUsd: cost, paidPlan: paid ? 'group' : 'free', planNames: ms.map((m) => PLANS[m.user.plan].name) },
  });
  return { ok: true as const, object: obj };
}
