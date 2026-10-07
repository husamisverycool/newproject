import sharp from 'sharp';
import { FREE_GROUP_RECAPS_PER_WEEK, PALETTE, PLANS, autoCreationAllowed, seeded, type Group } from '@app/shared';
import { all, get, json, now, run } from '../db.ts';
import { exportImage, readMedia, writeMedia, escapeXml } from '../media.ts';
import { getUser, id, insertObject, members, postsForGroup, type PostFull } from '../repo.ts';
import { toGroup } from '../realtime.ts';
import * as img from '../ai/image.ts';
import { MASCOT_SPECIES } from '@app/shared';

/**
 * Walls: Yope's "continuously evolving", "chaotic collage" of the week's photos, some turned into
 * cut-out stickers (research/02 §A4.3), editable and remixable with saved versions (spec §E).
 */

export type WallStyle = 'chaos' | 'scrapbook' | 'filmstrip' | 'grid';
export const WALL_STYLES: { id: WallStyle; name: string; source: string }[] = [
  { id: 'chaos', name: 'Chaos', source: 'Yope walls' },
  { id: 'scrapbook', name: 'Scrapbook', source: 'Wrapped 2025 mixtape / scrapbook' },
  { id: 'filmstrip', name: 'Film strip', source: 'Retro weekly film strip' },
  { id: 'grid', name: 'Collage', source: 'Retro recap collage' },
];

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
  shape: 'photo' | 'sticker' | 'polaroid';
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

const BGS = [PALETTE.black, PALETTE.g1, PALETTE.yellow, PALETTE.blue, PALETTE.purple, PALETTE.green, PALETTE.red];

export function layoutWall(posts: PostFull[], opts: { style: WallStyle; seed: string; title: string; subtitle: string; emoji: string }): WallLayout {
  const rng = seeded(opts.seed);
  const W = 1080;
  const H = 1920;
  const items: WallItem[] = [];
  const decos: WallDeco[] = [];
  const pool = posts.slice(0, 14);
  const bg = opts.style === 'scrapbook' ? PALETTE.swan : opts.style === 'filmstrip' ? PALETTE.black : BGS[Math.floor(rng() * BGS.length)];

  if (opts.style === 'grid' || opts.style === 'filmstrip') {
    const cols = opts.style === 'filmstrip' ? 1 : 2;
    const gap = 24;
    const top = 300;
    const cellW = (W - gap * (cols + 1)) / cols;
    const rows = Math.ceil(pool.length / cols);
    const cellH = Math.min(cellW * (opts.style === 'filmstrip' ? 0.62 : 1), (H - top - gap * (rows + 1)) / Math.max(1, rows));
    pool.forEach((p, i) => {
      const c = i % cols;
      const r = Math.floor(i / cols);
      items.push({ id: `i${i}`, postId: p.id, src: p.media.thumb ?? p.media.main, x: (gap + c * (cellW + gap)) / W, y: (top + gap + r * (cellH + gap)) / H, w: cellW / W, h: cellH / H, rot: 0, z: i, shape: 'photo', caption: p.caption });
    });
  } else {
    // Chaotic collage: jittered loose grid, mixed sizes, rotations, a few cut-out stickers.
    const cols = 3;
    const rows = Math.ceil(pool.length / cols) || 1;
    const top = 330;
    const cellW = W / cols;
    const cellH = (H - top - 120) / rows;
    pool.forEach((p, i) => {
      const c = i % cols;
      const r = Math.floor(i / cols);
      const scale = 0.85 + rng() * 0.55;
      const w = Math.min(W * 0.55, cellW * scale);
      const aspect = p.media.height / Math.max(1, p.media.width);
      const h = w * Math.min(1.4, Math.max(0.7, aspect));
      const cx = c * cellW + cellW / 2 + (rng() - 0.5) * cellW * 0.5;
      const cy = top + r * cellH + cellH / 2 + (rng() - 0.5) * cellH * 0.45;
      const shape: WallItem['shape'] = opts.style === 'scrapbook' ? (rng() < 0.5 ? 'polaroid' : 'photo') : rng() < 0.3 ? 'sticker' : rng() < 0.2 ? 'polaroid' : 'photo';
      items.push({
        id: `i${i}`, postId: p.id, src: p.media.thumb ?? p.media.main,
        x: Math.max(0, (cx - w / 2) / W), y: Math.max(0.12, (cy - h / 2) / H), w: w / W, h: h / H,
        rot: (rng() - 0.5) * (opts.style === 'scrapbook' ? 14 : 22), z: Math.floor(rng() * 100), shape,
        caption: shape === 'polaroid' ? p.caption : null, tape: opts.style === 'scrapbook' || rng() < 0.15,
      });
    });
    const emojis = [opts.emoji, '✨', '📸', '💛', '🔥', '🫶', '⭐️'];
    for (let i = 0; i < 6; i++) {
      decos.push({ id: `d${i}`, kind: 'emoji', value: emojis[Math.floor(rng() * emojis.length)], x: rng() * 0.9, y: 0.15 + rng() * 0.8, size: 0.07 + rng() * 0.06, rot: (rng() - 0.5) * 40 });
    }
    decos.push({ id: 'mascot', kind: 'mascot', value: 'mascot', x: 0.74, y: 0.86, size: 0.16, rot: -8 });
  }
  return { width: W, height: H, bg, title: opts.title, subtitle: opts.subtitle, items, decos };
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

export function weekTitle(weekKey: string) {
  const end = new Date(`${weekKey}T12:00:00Z`);
  const start = new Date(end.getTime() - 6 * 86_400_000);
  const f = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  return `${f(start)} – ${f(end)}`;
}

export function generateWall(group: Group, weekKey: string, style: WallStyle = 'chaos', createdBy: string | null = null, seed?: string) {
  const posts = postsForGroup(group.id, { weekKey });
  if (!posts.length) return null;
  const layout = layoutWall(posts, { style, seed: seed ?? `${group.id}:${weekKey}:${Date.now()}`, title: group.name, subtitle: weekTitle(weekKey), emoji: group.emoji });
  const version = saveWall(group, weekKey, layout, style, createdBy ? 'remix' : 'auto', createdBy);
  return { version, layout };
}

/* ───────────────────────── Render (export) ───────────────────────── */

export async function renderWall(group: Group, layout: WallLayout) {
  const { width: W, height: H } = layout;
  const species = MASCOT_SPECIES.find((s) => s.id === group.mascot.species) ?? MASCOT_SPECIES[0];
  const comps: sharp.OverlayOptions[] = [];
  const header = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <text x="64" y="170" font-family="Inter" font-weight="900" font-size="104" fill="${layout.bg === PALETTE.yellow || layout.bg === PALETTE.swan ? '#000' : '#fff'}" letter-spacing="-4">${escapeXml(layout.title)}</text>
    <text x="68" y="236" font-family="Inter" font-weight="700" font-size="44" fill="${layout.bg === PALETTE.yellow || layout.bg === PALETTE.swan ? PALETTE.eel : PALETTE.hare}">${escapeXml(layout.subtitle)}</text>
  </svg>`);
  comps.push({ input: header, top: 0, left: 0 });
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
    if (it.shape === 'polaroid') tile = await sharp(tile).extend({ top: 18, left: 18, right: 18, bottom: 70, background: '#fff' }).png().toBuffer();
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
  const decoSvg = layout.decos
    .map((d) => {
      const size = Math.round(d.size * W);
      if (d.kind === 'mascot') {
        return `<g transform="translate(${d.x * W} ${d.y * H}) rotate(${d.rot})"><circle r="${size / 2}" cx="${size / 2}" cy="${size / 2}" fill="${species.body}"/><circle cx="${size * 0.35}" cy="${size * 0.42}" r="${size * 0.1}" fill="#fff"/><circle cx="${size * 0.65}" cy="${size * 0.42}" r="${size * 0.1}" fill="#fff"/><circle cx="${size * 0.37}" cy="${size * 0.44}" r="${size * 0.05}" fill="#000"/><circle cx="${size * 0.67}" cy="${size * 0.44}" r="${size * 0.05}" fill="#000"/></g>`;
      }
      return `<text x="${d.x * W}" y="${d.y * H}" font-size="${size}" transform="rotate(${d.rot} ${d.x * W} ${d.y * H})">${escapeXml(d.value)}</text>`;
    })
    .join('');
  comps.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${decoSvg}</svg>`), top: 0, left: 0 });
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
