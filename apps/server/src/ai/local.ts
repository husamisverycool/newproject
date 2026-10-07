import '../bootstrap.ts';
import sharp from 'sharp';
import { PALETTE, gphotos } from '@app/shared';
import { escapeXml } from '../media.ts';

/**
 * Local renderer: deterministic, offline stand-ins for the image model. Each style is named after
 * a Google Photos Remix style (research/06 §1.4); the figurine follows the Nano Banana figurine
 * composition (research/06 §2.2). When GEMINI_API_KEY is set, ai/image.ts uses the model instead.
 */

export type RemixStyle = 'comic' | 'anime' | 'sketch' | 'watercolor' | '8bit' | 'polaroid' | 'sticker' | 'enamel_pin';

/** Names come from the Google Photos deck (gphotos.remixStyles), keyed by these ids. */
export const REMIX_STYLES: { id: RemixStyle | '3d' | 'figurine'; name: string; local: boolean }[] = (
  [
    ['comic', true],
    ['anime', true],
    ['sketch', true],
    ['3d', false],
    ['watercolor', true],
    ['8bit', true],
    ['sticker', true],
    ['enamel_pin', true],
    ['polaroid', true],
    ['figurine', true],
  ] as const
).map(([id, local]) => ({ id, name: gphotos.remixStyles[id], local }));

type Raw = { data: Buffer; info: sharp.OutputInfo };

async function raw(img: sharp.Sharp): Promise<Raw> {
  return img.removeAlpha().raw().toBuffer({ resolveWithObject: true });
}

function fromRaw(r: { data: Buffer; width: number; height: number; channels: 1 | 3 | 4 }) {
  return sharp(r.data, { raw: { width: r.width, height: r.height, channels: r.channels } });
}

async function prep(input: Buffer, max = 900) {
  return sharp(input, { failOn: 'none' }).rotate().resize({ width: max, height: max, fit: 'inside', withoutEnlargement: true });
}

function posterize(buf: Buffer, levels: number) {
  const step = 255 / (levels - 1);
  const out = Buffer.alloc(buf.length);
  for (let i = 0; i < buf.length; i++) out[i] = Math.round(Math.round(buf[i] / step) * step);
  return out;
}

/** Sobel magnitude on a greyscale buffer → ink mask (0 = ink, 255 = paper). */
function inkMask(gray: Buffer, w: number, h: number, threshold: number) {
  const out = Buffer.alloc(w * h, 255);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const gx = -gray[i - w - 1] - 2 * gray[i - 1] - gray[i + w - 1] + gray[i - w + 1] + 2 * gray[i + 1] + gray[i + w + 1];
      const gy = -gray[i - w - 1] - 2 * gray[i - w] - gray[i - w + 1] + gray[i + w - 1] + 2 * gray[i + w] + gray[i + w + 1];
      if (Math.hypot(gx, gy) > threshold) out[i] = 0;
    }
  }
  return out;
}

async function edges(base: sharp.Sharp, w: number, h: number, threshold: number, thicken = 1) {
  const g = await base.clone().greyscale().blur(0.8).raw().toBuffer();
  let mask: Buffer = inkMask(g, w, h, threshold);
  if (thicken > 0) {
    mask = await sharp(mask, { raw: { width: w, height: h, channels: 1 } })
      .blur(0.3 + thicken * 0.5)
      .threshold(200)
      .raw()
      .toBuffer();
  }
  return mask;
}

function multiplyMask(rgb: Buffer, mask: Buffer, channels: number) {
  const out = Buffer.from(rgb);
  for (let i = 0, p = 0; i < mask.length; i++, p += channels) {
    if (mask[i] < 128) {
      out[p] = 0;
      out[p + 1] = 0;
      out[p + 2] = 0;
    }
  }
  return out;
}

/** Halftone dots in shadow regions, comic-book style. */
function halftoneSvg(gray: Buffer, w: number, h: number, cell = 7) {
  let dots = '';
  for (let y = 0; y < h; y += cell) {
    for (let x = 0; x < w; x += cell) {
      const v = gray[Math.min(h - 1, y + (cell >> 1)) * w + Math.min(w - 1, x + (cell >> 1))];
      const dark = 1 - v / 255;
      if (dark < 0.35) continue;
      const r = (cell / 2) * Math.min(1, (dark - 0.3) * 1.4);
      dots += `<circle cx="${x + cell / 2}" cy="${y + cell / 2}" r="${r.toFixed(2)}"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><g fill="#000" fill-opacity="0.38">${dots}</g></svg>`;
}

export async function comic(input: Buffer, caption?: string | null) {
  const base = (await prep(input)).median(5).modulate({ saturation: 1.45, brightness: 1.06 });
  const r = await raw(base.clone());
  const { width: w, height: h, channels } = r.info;
  const post = posterize(r.data, 5);
  const ink = await edges(base, w, h, 190, 1);
  const inked = multiplyMask(post, ink, channels);
  const gray = await base.clone().greyscale().raw().toBuffer();
  const border = Math.round(Math.min(w, h) * 0.025);
  const layers: sharp.OverlayOptions[] = [{ input: Buffer.from(halftoneSvg(gray, w, h)), blend: 'multiply' }];
  if (caption) layers.push({ input: Buffer.from(speechBubble(w, h, caption)), top: 0, left: 0 });
  const img = await fromRaw({ data: inked, width: w, height: h, channels: channels as 3 }).composite(layers).png().toBuffer();
  return sharp(img).extend({ top: border, bottom: border, left: border, right: border, background: '#000' }).jpeg({ quality: 90 }).toBuffer();
}

function speechBubble(w: number, h: number, text: string) {
  const words = text.toUpperCase().split(/\s+/).slice(0, 14);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    if ((line + ' ' + word).trim().length > 16) {
      lines.push(line.trim());
      line = word;
    } else line += ' ' + word;
  }
  if (line.trim()) lines.push(line.trim());
  const fs = Math.round(w * 0.045);
  const bw = Math.min(w * 0.62, Math.max(...lines.map((l) => l.length)) * fs * 0.66 + fs * 2);
  const bh = lines.length * fs * 1.2 + fs * 1.4;
  const x = w * 0.05;
  const y = h * 0.05;
  const tspans = lines.map((l, i) => `<tspan x="${x + bw / 2}" dy="${i === 0 ? 0 : fs * 1.2}">${escapeXml(l)}</tspan>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <path d="M ${x + bw * 0.3} ${y + bh - 2} L ${x + bw * 0.22} ${y + bh + fs * 1.4} L ${x + bw * 0.45} ${y + bh - 2} Z" fill="#fff" stroke="#000" stroke-width="${fs * 0.14}"/>
    <rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="${bh / 2.2}" fill="#fff" stroke="#000" stroke-width="${fs * 0.14}"/>
    <rect x="${x + bw * 0.27}" y="${y + bh - fs * 0.3}" width="${bw * 0.2}" height="${fs * 0.5}" fill="#fff"/>
    <text x="${x + bw / 2}" y="${y + fs * 1.3}" text-anchor="middle" font-family="Inter" font-weight="900" font-size="${fs}" fill="#000">${tspans}</text>
  </svg>`;
}

export async function anime(input: Buffer) {
  const base = (await prep(input)).median(7).median(5).modulate({ saturation: 1.35, brightness: 1.08 });
  const r = await raw(base.clone());
  const { width: w, height: h, channels } = r.info;
  const post = posterize(r.data, 7);
  const ink = await edges(base, w, h, 240, 0);
  return fromRaw({ data: multiplyMask(post, ink, channels), width: w, height: h, channels: channels as 3 }).jpeg({ quality: 90 }).toBuffer();
}

export async function sketch(input: Buffer) {
  const base = (await prep(input)).greyscale();
  const g = await base.clone().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = g.info;
  const inv = Buffer.from(g.data.map((v) => 255 - v));
  const blurred = await sharp(inv, { raw: { width: w, height: h, channels: 1 } }).blur(9).raw().toBuffer();
  const out = Buffer.alloc(w * h);
  for (let i = 0; i < out.length; i++) {
    const b = blurred[i];
    out[i] = b >= 255 ? 255 : Math.min(255, (g.data[i] * 255) / (255 - b));
  }
  return sharp(out, { raw: { width: w, height: h, channels: 1 } }).linear(1.1, -12).jpeg({ quality: 90 }).toBuffer();
}

export async function watercolor(input: Buffer) {
  const base = (await prep(input)).median(9).modulate({ saturation: 1.25, brightness: 1.08 });
  const r = await raw(base.clone());
  const { width: w, height: h, channels } = r.info;
  const ink = await edges(base, w, h, 140, 0);
  const soft = Buffer.from(r.data);
  for (let i = 0, p = 0; i < ink.length; i++, p += channels) {
    if (ink[i] < 128) for (let c = 0; c < 3; c++) soft[p + c] = Math.round(soft[p + c] * 0.78);
  }
  const grain = Buffer.alloc(w * h);
  for (let i = 0; i < grain.length; i++) grain[i] = 225 + Math.floor(Math.random() * 30);
  const paper = await sharp(grain, { raw: { width: w, height: h, channels: 1 } }).blur(1.2).png().toBuffer();
  return fromRaw({ data: soft, width: w, height: h, channels: channels as 3 })
    .blur(1.1)
    .composite([{ input: paper, blend: 'multiply' }])
    .jpeg({ quality: 90 })
    .toBuffer();
}

export async function eightBit(input: Buffer) {
  const base = await prep(input, 900);
  const meta = await base.clone().toBuffer({ resolveWithObject: true });
  const w = meta.info.width;
  const h = meta.info.height;
  const small = await sharp(meta.data).resize(Math.max(24, Math.round(w / 12)), null, { kernel: 'nearest' }).png({ palette: true, colors: 16, dither: 0 }).toBuffer();
  return sharp(small).resize(w, h, { kernel: 'nearest' }).png().toBuffer();
}

/** Spec: the "polaroid" Gemini trend — flash in a dark room, soft blur, white instant-film frame. */
export async function polaroid(input: Buffer, caption?: string | null) {
  const side = 760;
  const photo = await sharp(input).rotate().resize(side, side, { fit: 'cover' }).modulate({ brightness: 1.12, saturation: 0.92 }).blur(0.6).toBuffer();
  const vignette = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${side}" height="${side}">
    <defs><radialGradient id="v" cx="50%" cy="42%" r="70%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.55"/></radialGradient></defs>
    <rect width="100%" height="100%" fill="url(#v)"/></svg>`);
  const lit = await sharp(photo).composite([{ input: vignette }]).toBuffer();
  const pad = 44;
  const bottom = 190;
  const frame = await sharp(lit)
    .extend({ top: pad, left: pad, right: pad, bottom, background: '#FFFFFF' })
    .composite(
      caption
        ? [{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${side + pad * 2}" height="${side + pad + bottom}"><text x="${pad + 8}" y="${side + pad + bottom * 0.52}" font-family="Inter" font-weight="700" font-size="40" fill="${PALETTE.eel}">${escapeXml(caption.slice(0, 36))}</text></svg>`) }]
        : [],
    )
    .jpeg({ quality: 90 })
    .toBuffer();
  return frame;
}

/* ───────────────────────── Cut-outs ───────────────────────── */

/**
 * Die-cut sticker: a thick white border around the alpha shape plus a soft drop shadow
 * (iMessage / Bitmoji sticker convention). If the input has no alpha, a rounded square is used.
 */
export async function stickerize(cutout: Buffer, size = 512) {
  const img = sharp(cutout).ensureAlpha().resize(size - 64, size - 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });
  const fitted = await img.png().toBuffer();
  const meta = await sharp(fitted).metadata();
  const hasAlpha = meta.hasAlpha && (await sharp(fitted).stats()).channels[3]?.min === 0;
  let shape = fitted;
  if (!hasAlpha) {
    const w = meta.width!;
    const h = meta.height!;
    const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${Math.min(w, h) * 0.22}" fill="#fff"/></svg>`);
    shape = await sharp(fitted).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
  }
  const padded = await sharp(shape).extend({ top: 32, bottom: 32, left: 32, right: 32, background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const pm = await sharp(padded).metadata();
  const alpha = await sharp(padded).extractChannel(3).blur(7).threshold(10).toBuffer();
  const white = await sharp({ create: { width: pm.width!, height: pm.height!, channels: 3, background: '#FFFFFF' } })
    .joinChannel(alpha)
    .png()
    .toBuffer();
  const shadowAlpha = await sharp(alpha).blur(6).linear(0.35, 0).toBuffer();
  const shadow = await sharp({ create: { width: pm.width!, height: pm.height!, channels: 3, background: '#000000' } })
    .joinChannel(shadowAlpha)
    .png()
    .toBuffer();
  return sharp({ create: { width: pm.width!, height: pm.height! + 6, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([
      { input: shadow, top: 6, left: 0 },
      { input: white, top: 0, left: 0 },
      { input: padded, top: 0, left: 0 },
    ])
    .png()
    .toBuffer();
}

export async function enamelPin(cutout: Buffer) {
  const base = sharp(cutout).ensureAlpha().resize(420, 420, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });
  const rgba = await base.raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = rgba.info;
  const data = Buffer.from(rgba.data);
  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) data[i + c] = Math.round(Math.round(data[i + c] / 85) * 85);
  }
  const flat = await sharp(data, { raw: { width: w, height: h, channels: 4 } }).modulate({ saturation: 1.4 }).png().toBuffer();
  const padded = await sharp(flat).extend({ top: 46, bottom: 46, left: 46, right: 46, background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const pm = await sharp(padded).metadata();
  const alpha = await sharp(padded).extractChannel(3).blur(10).threshold(8).toBuffer();
  const gold = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${pm.width}" height="${pm.height}">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="0.35" stop-color="${PALETTE.yellow}"/><stop offset="0.7" stop-color="${PALETTE.orange}"/><stop offset="1" stop-color="${PALETTE.yellow}"/></linearGradient></defs>
      <rect width="100%" height="100%" fill="url(#g)"/></svg>`))
    .removeAlpha()
    .joinChannel(alpha)
    .png()
    .toBuffer();
  const gloss = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${pm.width}" height="${pm.height}"><ellipse cx="${pm.width! * 0.35}" cy="${pm.height! * 0.25}" rx="${pm.width! * 0.28}" ry="${pm.height! * 0.1}" fill="#fff" fill-opacity="0.35" transform="rotate(-25 ${pm.width! * 0.35} ${pm.height! * 0.25})"/></svg>`);
  return sharp({ create: { width: pm.width!, height: pm.height!, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: gold }, { input: padded }, { input: gloss, blend: 'over' }])
    .png()
    .toBuffer();
}

/* ───────────────────────── Figurine (Nano Banana trend) ───────────────────────── */

/**
 * Layout of the viral prompt, rendered locally: "a 1/7 scale commercialized figurine … placed on a
 * computer desk … round transparent acrylic base … the computer screen shows the Zbrush modeling
 * process … next to the screen a BANDAI-style toy packaging box printed with the original artwork."
 */
export async function figurine(cutout: Buffer, original: Buffer, opts: { name: string; groupName: string }) {
  const W = 1080;
  const H = 1080;
  const fig = await sharp(cutout).ensureAlpha().resize(360, 470, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).modulate({ saturation: 1.15, brightness: 1.05 }).png().toBuffer();
  const figMeta = await sharp(fig).metadata();
  const wire = await sharp(cutout)
    .ensureAlpha()
    .resize(250, 330, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .greyscale()
    .linear(0.4, 120)
    .png()
    .toBuffer();
  const boxArt = await sharp(original).rotate().resize(250, 300, { fit: 'cover' }).modulate({ saturation: 1.2 }).toBuffer();
  const scene = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2C2C2E"/><stop offset="1" stop-color="#1C1C1E"/></linearGradient>
      <linearGradient id="desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4B4B4B"/><stop offset="1" stop-color="#2C2C2E"/></linearGradient>
      <linearGradient id="screen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A3A3C"/><stop offset="1" stop-color="#2C2C2E"/></linearGradient>
      <radialGradient id="base" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#ffffff" stop-opacity="0.55"/><stop offset="1" stop-color="#ffffff" stop-opacity="0.12"/></radialGradient>
      <linearGradient id="box" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${PALETTE.yellow}"/><stop offset="1" stop-color="${PALETTE.orange}"/></linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#wall)"/>
    <rect x="0" y="690" width="${W}" height="${H - 690}" fill="url(#desk)"/>
    <rect x="0" y="690" width="${W}" height="10" fill="#000" fill-opacity="0.25"/>
    <!-- monitor -->
    <rect x="80" y="140" width="560" height="380" rx="18" fill="#000"/>
    <rect x="96" y="156" width="528" height="330" rx="6" fill="url(#screen)"/>
    <rect x="96" y="156" width="528" height="26" fill="#1C1C1E"/>
    <circle cx="112" cy="169" r="5" fill="${PALETTE.red}"/><circle cx="128" cy="169" r="5" fill="${PALETTE.yellow}"/><circle cx="144" cy="169" r="5" fill="${PALETTE.green}"/>
    <text x="170" y="174" font-family="Inter" font-size="13" fill="#AFAFAF">sculpt — ${escapeXml(opts.name)}_figure.ztl</text>
    <rect x="108" y="196" width="70" height="278" rx="4" fill="#1C1C1E"/>
    ${Array.from({ length: 7 }, (_, i) => `<rect x="118" y="${208 + i * 36}" width="50" height="26" rx="4" fill="#3A3A3C"/>`).join('')}
    ${Array.from({ length: 12 }, (_, i) => `<line x1="${200 + i * 36}" y1="196" x2="${200 + i * 36}" y2="474" stroke="#777" stroke-opacity="0.18"/>`).join('')}
    ${Array.from({ length: 8 }, (_, i) => `<line x1="190" y1="${210 + i * 34}" x2="612" y2="${210 + i * 34}" stroke="#777" stroke-opacity="0.18"/>`).join('')}
    <rect x="330" y="520" width="60" height="110" fill="#000"/>
    <rect x="250" y="620" width="220" height="24" rx="8" fill="#000"/>
    <!-- keyboard -->
    <rect x="150" y="740" width="430" height="70" rx="12" fill="#E5E5E5"/>
    ${Array.from({ length: 24 }, (_, i) => `<rect x="${164 + (i % 12) * 34}" y="${752 + Math.floor(i / 12) * 26}" width="28" height="20" rx="4" fill="#AFAFAF"/>`).join('')}
    <!-- toy box -->
    <g transform="translate(720 300)">
      <rect x="0" y="0" width="300" height="420" rx="10" fill="url(#box)"/>
      <rect x="0" y="0" width="300" height="420" rx="10" fill="none" stroke="#000" stroke-opacity="0.25" stroke-width="3"/>
      <rect x="18" y="18" width="264" height="44" rx="8" fill="#000"/>
      <text x="150" y="48" text-anchor="middle" font-family="Inter" font-weight="900" font-size="22" fill="#fff">roll<tspan fill="${PALETTE.yellow}">.</tspan> FIGURE SERIES</text>
      <rect x="18" y="74" width="264" height="300" rx="6" fill="#fff"/>
      <text x="150" y="400" text-anchor="middle" font-family="Inter" font-weight="900" font-size="20" fill="#000">${escapeXml(opts.name.toUpperCase())} · 1/7</text>
    </g>
    <!-- acrylic base -->
    <ellipse cx="440" cy="910" rx="150" ry="34" fill="#000" fill-opacity="0.3"/>
    <ellipse cx="440" cy="896" rx="150" ry="34" fill="url(#base)" stroke="#ffffff" stroke-opacity="0.6" stroke-width="2"/>
    <ellipse cx="440" cy="884" rx="150" ry="34" fill="url(#base)" stroke="#ffffff" stroke-opacity="0.8" stroke-width="2"/>
    <text x="40" y="1050" font-family="Inter" font-weight="700" font-size="20" fill="#fff" fill-opacity="0.55">${escapeXml(opts.groupName)} · limited run</text>
  </svg>`);
  return sharp(scene)
    .composite([
      { input: wire, top: 170, left: 290, blend: 'screen' },
      { input: boxArt, top: 374, left: 738 },
      { input: fig, top: 884 - (figMeta.height ?? 470) + 10, left: 440 - Math.round((figMeta.width ?? 360) / 2) },
    ])
    .jpeg({ quality: 90 })
    .toBuffer();
}

/* ───────────────────────── Me Meme (template + your face) ───────────────────────── */

/** Paste a face cut-out over a box in a template image (the client finds the box with face detection). */
export async function memeSwap(template: Buffer, face: Buffer, box: { x: number; y: number; w: number; h: number }, caption?: { top?: string; bottom?: string }) {
  const t = sharp(template).rotate();
  const meta = await t.metadata();
  const W = meta.width ?? 1080;
  const H = meta.height ?? 1080;
  const fw = Math.round(box.w * 1.15);
  const fh = Math.round(box.h * 1.3);
  const f = await sharp(face).ensureAlpha().resize(fw, fh, { fit: 'cover' }).png().toBuffer();
  const ellipse = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${fw}" height="${fh}"><defs><radialGradient id="m"><stop offset="0.72" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><ellipse cx="${fw / 2}" cy="${fh / 2}" rx="${fw / 2}" ry="${fh / 2}" fill="url(#m)"/></svg>`);
  const feathered = await sharp(f).composite([{ input: ellipse, blend: 'dest-in' }]).png().toBuffer();
  const fs = Math.round(W * 0.075);
  const text = (s: string, y: number) =>
    `<text x="${W / 2}" y="${y}" text-anchor="middle" font-family="Inter" font-weight="900" font-size="${fs}" fill="#fff" stroke="#000" stroke-width="${fs * 0.08}" paint-order="stroke">${escapeXml(s.toUpperCase())}</text>`;
  const overlay = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${caption?.top ? text(caption.top, fs * 1.2) : ''}${caption?.bottom ? text(caption.bottom, H - fs * 0.5) : ''}</svg>`);
  return t
    .composite([
      { input: feathered, left: Math.max(0, Math.round(box.x - (fw - box.w) / 2)), top: Math.max(0, Math.round(box.y - (fh - box.h) / 2)) },
      { input: overlay, top: 0, left: 0 },
    ])
    .jpeg({ quality: 90 })
    .toBuffer();
}

export async function renderStyle(style: RemixStyle, input: Buffer, opts: { caption?: string | null; cutout?: Buffer | null }) {
  switch (style) {
    case 'comic':
      return comic(input, opts.caption);
    case 'anime':
      return anime(input);
    case 'sketch':
      return sketch(input);
    case 'watercolor':
      return watercolor(input);
    case '8bit':
      return eightBit(input);
    case 'polaroid':
      return polaroid(input, opts.caption);
    case 'sticker':
      return stickerize(opts.cutout ?? input);
    case 'enamel_pin':
      return enamelPin(opts.cutout ?? input);
  }
}
