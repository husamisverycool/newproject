import './bootstrap.ts';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { nanoid } from 'nanoid';
import { BRAND, PALETTE, type Plan, type Provenance, STORAGE, storageTierFor } from '@app/shared';
import { paths } from './env.ts';

fs.mkdirSync(paths.media, { recursive: true });

export function mediaPath(url: string) {
  // urls look like /media/<file>
  const file = url.replace(/^\/media\//, '');
  const resolved = path.join(paths.media, path.basename(file));
  return resolved;
}

export function readMedia(url: string) {
  return fs.readFileSync(mediaPath(url));
}

export function writeMedia(buf: Buffer, ext: string) {
  const name = `${nanoid(16)}.${ext}`;
  fs.writeFileSync(path.join(paths.media, name), buf);
  return { url: `/media/${name}`, bytes: buf.length };
}

export interface StoredImage {
  url: string;
  thumb: string;
  original: string | null;
  width: number;
  height: number;
  bytes: number;
}

/**
 * Spec §T: the free tier stores a compressed copy; paid tiers keep the full-resolution archive.
 * Every image also gets a 480px thumbnail for walls, widgets and cards.
 */
export async function storeImage(input: Buffer, plan: Plan): Promise<StoredImage> {
  const tier = storageTierFor(plan);
  const base = sharp(input, { failOn: 'none' }).rotate();
  const main = await base
    .clone()
    .resize({ width: tier.longEdge, height: tier.longEdge, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: tier.quality, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });
  const thumb = await base
    .clone()
    .resize({ width: STORAGE.thumbLongEdge, height: STORAGE.thumbLongEdge, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 72, mozjpeg: true })
    .toBuffer();
  const m = writeMedia(main.data, 'jpg');
  const t = writeMedia(thumb, 'jpg');
  let original: string | null = null;
  let bytes = m.bytes + t.bytes;
  if (plan !== 'free') {
    const o = writeMedia(await base.clone().jpeg({ quality: 95 }).toBuffer(), 'jpg');
    original = o.url;
    bytes += o.bytes;
  }
  return { url: m.url, thumb: t.url, original, width: main.info.width, height: main.info.height, bytes };
}

/** Store a transparent PNG as-is (stickers, cut-outs). */
export async function storePng(input: Buffer) {
  const out = await sharp(input).png().toBuffer({ resolveWithObject: true });
  const w = writeMedia(out.data, 'png');
  return { ...w, width: out.info.width, height: out.info.height };
}

export function storeBlob(input: Buffer, ext: string) {
  return writeMedia(input, ext);
}

/* ───────────────────────── Live clips ───────────────────────── */

/**
 * A short animated WebP. Used for the BeReal-style "BTS" clip: the client uploads frames it
 * captured in the 2 seconds before the shutter; seeds synthesize a gentle push-in.
 */
export async function framesToLive(frames: Buffer[], size = 480, delay = 100) {
  const resized = await Promise.all(
    frames.map((f) => sharp(f).resize(size, size, { fit: 'cover' }).ensureAlpha().raw().toBuffer()),
  );
  const raw = Buffer.concat(resized);
  const anim = await sharp(raw, { raw: { width: size, height: size * frames.length, channels: 4 } })
    .webp({ quality: 70, loop: 0, delay: Array(frames.length).fill(delay), pageHeight: size } as sharp.WebpOptions & { pageHeight: number })
    .toBuffer();
  return writeMedia(anim, 'webp');
}

export async function syntheticLive(input: Buffer, count = 16, size = 480) {
  const meta = await sharp(input).metadata();
  const w = meta.width ?? size;
  const h = meta.height ?? size;
  const side = Math.min(w, h);
  const frames: Buffer[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const zoom = 1 + 0.12 * Math.sin(t * Math.PI);
    const crop = Math.round(side / zoom);
    const left = Math.round((w - crop) / 2 + Math.sin(t * Math.PI * 2) * side * 0.02);
    const top = Math.round((h - crop) / 2);
    frames.push(
      await sharp(input)
        .extract({ left: Math.max(0, Math.min(w - crop, left)), top: Math.max(0, Math.min(h - crop, top)), width: crop, height: crop })
        .resize(size, size)
        .png()
        .toBuffer(),
    );
  }
  return framesToLive(frames, size, 90);
}

/* ───────────────────────── Watermark (spec §Q) ───────────────────────── */

/**
 * Geometry from Gemini's visible watermark (research/06 §2.5): bottom-right, 48 px mark with a
 * 32 px margin, or 96 px with 64 px on large images. Our mark is the group mascot glyph plus the
 * app wordmark (spec §F/§Q).
 */
export function watermarkGeometry(width: number, height: number) {
  const large = Math.max(width, height) > 1024;
  return large ? { size: 96, margin: 64 } : { size: 48, margin: 32 };
}

export function mascotGlyphSvg(color: string, size: number) {
  const r = size / 2;
  return `<g>
    <circle cx="${r}" cy="${r}" r="${r}" fill="${color}"/>
    <circle cx="${r * 0.68}" cy="${r * 0.86}" r="${r * 0.2}" fill="#fff"/>
    <circle cx="${r * 1.32}" cy="${r * 0.86}" r="${r * 0.2}" fill="#fff"/>
    <circle cx="${r * 0.72}" cy="${r * 0.9}" r="${r * 0.1}" fill="#000"/>
    <circle cx="${r * 1.36}" cy="${r * 0.9}" r="${r * 0.1}" fill="#000"/>
    <path d="M ${r * 0.7} ${r * 1.3} Q ${r} ${r * 1.55} ${r * 1.3} ${r * 1.3}" stroke="#000" stroke-width="${r * 0.1}" fill="none" stroke-linecap="round"/>
  </g>`;
}

export function watermarkSvg(width: number, height: number, opts: { mascotColor: string; handle?: string; x?: number; y?: number; opacity?: number }) {
  const { size, margin } = watermarkGeometry(width, height);
  const fontSize = Math.round(size * 0.62);
  const textW = Math.round(fontSize * 2.3);
  const handle = opts.handle ? `@${opts.handle}` : '';
  const handleSize = Math.round(size * 0.3);
  const x = opts.x ?? width - margin - size - textW - size * 0.25;
  const y = opts.y ?? height - margin - size;
  const opacity = opts.opacity ?? 0.92;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs><filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="${size * 0.04}" stdDeviation="${size * 0.08}" flood-color="#000" flood-opacity="0.45"/></filter></defs>
    <g opacity="${opacity}" filter="url(#s)" transform="translate(${x} ${y})">
      <text x="0" y="${size * 0.74}" font-family="Inter" font-weight="900" font-size="${fontSize}" fill="${PALETTE.white}" letter-spacing="-${fontSize * 0.04}">${BRAND.bare}<tspan fill="${PALETTE.locket}">.</tspan></text>
      <g transform="translate(${textW + size * 0.25} 0)">${mascotGlyphSvg(opts.mascotColor, size)}</g>
      ${handle ? `<text x="${textW + size * 1.25}" y="${size + handleSize * 1.4}" text-anchor="end" font-family="Inter" font-weight="700" font-size="${handleSize}" fill="#fff">${escapeXml(handle)}</text>` : ''}
    </g>
  </svg>`;
}

export function escapeXml(s: string) {
  return s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!);
}

/**
 * Export with a visible watermark and embedded provenance (C2PA-style manifest in EXIF
 * ImageDescription; SynthID-style invisible marking is out of scope for a local renderer).
 */
export async function exportImage(input: Buffer, provenance: Provenance, opts: { mascotColor: string; handle?: string; format?: 'jpeg' | 'png' }) {
  const img = sharp(input).rotate();
  const meta = await img.metadata();
  const width = meta.width ?? 1080;
  const height = meta.height ?? 1080;
  const overlay = Buffer.from(watermarkSvg(width, height, opts));
  const composed = img.composite([{ input: overlay, top: 0, left: 0 }]);
  const exif = {
    IFD0: {
      ImageDescription: JSON.stringify({ c2pa_like: true, ...provenance }),
      Software: `${BRAND.name} renderer`,
      Artist: opts.handle ?? BRAND.name,
    },
  };
  const out = opts.format === 'png'
    ? await composed.png().withExif(exif).toBuffer()
    : await composed.jpeg({ quality: 90 }).withExif(exif).toBuffer();
  return out;
}

/** Sora-style moving watermark on an animated export: the mark changes position across frames. */
export async function exportAnimated(input: Buffer, provenance: Provenance, opts: { mascotColor: string; handle?: string }) {
  const meta = await sharp(input, { animated: true }).metadata();
  const pages = meta.pages ?? 1;
  const width = meta.width ?? 480;
  const pageHeight = meta.pageHeight ?? meta.height ?? 480;
  const frames: Buffer[] = [];
  const { size, margin } = watermarkGeometry(width, pageHeight);
  const spots = [
    [width - margin - size * 3.6, pageHeight - margin - size],
    [margin, pageHeight - margin - size],
    [margin, margin],
    [width - margin - size * 3.6, margin],
  ];
  for (let i = 0; i < pages; i++) {
    const [x, y] = spots[Math.floor((i / pages) * spots.length) % spots.length];
    const frame = await sharp(input, { page: i }).png().toBuffer();
    frames.push(
      await sharp(frame)
        .composite([{ input: Buffer.from(watermarkSvg(width, pageHeight, { ...opts, x, y, opacity: 0.7 })), top: 0, left: 0 }])
        .ensureAlpha()
        .raw()
        .toBuffer(),
    );
  }
  const raw = Buffer.concat(frames);
  const delay = (meta.delay ?? []).length ? meta.delay! : Array(pages).fill(100);
  return sharp(raw, { raw: { width, height: pageHeight * pages, channels: 4 } })
    .webp({ quality: 75, loop: 0, delay, pageHeight } as sharp.WebpOptions & { pageHeight: number })
    .withExif({ IFD0: { ImageDescription: JSON.stringify({ c2pa_like: true, ...provenance }), Software: `${BRAND.name} renderer` } })
    .toBuffer();
}

/* ───────────────────────── Analysis ───────────────────────── */

/** Warm, mid-bright dominant colour → "golden hour" (feeds the Most Sunsets award). */
export async function isGoldenHour(input: Buffer) {
  const { dominant } = await sharp(input).resize(64, 64, { fit: 'inside' }).stats();
  const { r, g, b } = dominant;
  return r > 150 && r > g * 1.15 && g > b * 1.1 && b < 140;
}

export async function imageSize(input: Buffer) {
  const m = await sharp(input).metadata();
  return { width: m.width ?? 0, height: m.height ?? 0 };
}
