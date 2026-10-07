/**
 * `sharp` for the in-Claude build. The server's image code (photo storage, walls, stickers, the local
 * remix renderer, exports) runs unchanged in the page; this module implements the part of sharp's
 * API it calls with canvas and plain pixel loops.
 *
 * Images are held as RGBA pixels plus a logical channel count (1 grey, 2 grey + alpha, 3 RGB,
 * 4 RGBA) so `.raw()` output and channel operations match sharp's. Operations apply in call order.
 * Live clips (sharp's animated WebP) are written as a vertical strip of square frames, which the
 * app plays frame by frame (components/cards/ImmersiveView.tsx, LiveClip).
 */
import { Buffer } from 'buffer';

type Ch = 1 | 2 | 3 | 4;
interface Img {
  w: number;
  h: number;
  ch: Ch;
  px: Uint8ClampedArray; // RGBA, w * h * 4
}
type Colour = string | { r?: number; g?: number; b?: number; alpha?: number };
type Fmt = 'jpeg' | 'png' | 'webp' | 'raw' | 'svg' | 'gif';
type Input = Uint8Array | ArrayBuffer | { create: { width: number; height: number; channels: number; background: Colour } } | undefined;
interface InputOpts {
  raw?: { width: number; height: number; channels: number };
  failOn?: string;
  animated?: boolean;
  page?: number;
}

/* ───────────── canvas ───────────── */

type AnyCanvas = OffscreenCanvas | HTMLCanvasElement;
type Ctx2D = OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;

function canvas(w: number, h: number): AnyCanvas {
  if (typeof OffscreenCanvas !== 'undefined') {
    try {
      const c = new OffscreenCanvas(w, h);
      if (c.getContext('2d')) return new OffscreenCanvas(w, h);
    } catch {
      /* fall through */
    }
  }
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function ctx2d(c: AnyCanvas): Ctx2D {
  return c.getContext('2d', { willReadFrequently: true } as CanvasRenderingContext2DSettings) as Ctx2D;
}

function toCanvas(img: Img): AnyCanvas {
  const c = canvas(img.w, img.h);
  ctx2d(c).putImageData(new ImageData(new Uint8ClampedArray(img.px), img.w, img.h), 0, 0);
  return c;
}

function fromCanvas(c: AnyCanvas, ch: Ch): Img {
  const d = ctx2d(c).getImageData(0, 0, c.width, c.height);
  return { w: c.width, h: c.height, ch, px: d.data };
}

async function encode(c: AnyCanvas, type: string, quality?: number): Promise<{ bytes: Uint8Array; type: string }> {
  let blob: Blob;
  if ('convertToBlob' in c) blob = await c.convertToBlob({ type, quality });
  else blob = await new Promise<Blob>((res, rej) => (c as HTMLCanvasElement).toBlob((b) => (b ? res(b) : rej(new Error('encode failed'))), type, quality));
  return { bytes: new Uint8Array(await blob.arrayBuffer()), type: blob.type || type };
}

/* ───────────── colours ───────────── */

const NAMED: Record<string, string> = { white: '#ffffff', black: '#000000', transparent: '#00000000' };

function colour(c: Colour | undefined, dflt: [number, number, number, number] = [0, 0, 0, 255]): [number, number, number, number] {
  if (c === undefined) return dflt;
  if (typeof c === 'string') {
    let s = NAMED[c.toLowerCase()] ?? c;
    if (s.startsWith('#')) {
      s = s.slice(1);
      if (s.length === 3 || s.length === 4) s = [...s].map((x) => x + x).join('');
      const n = (i: number) => parseInt(s.slice(i, i + 2), 16);
      return [n(0), n(2), n(4), s.length >= 8 ? n(6) : 255];
    }
    return dflt;
  }
  return [c.r ?? 0, c.g ?? 0, c.b ?? 0, Math.round((c.alpha ?? 1) * 255)];
}

/* ───────────── decoding ───────────── */

function sniff(b: Uint8Array): Fmt | null {
  if (b[0] === 0xff && b[1] === 0xd8) return 'jpeg';
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'png';
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45) return 'webp';
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return 'gif';
  const head = new TextDecoder().decode(b.subarray(0, 256)).trimStart();
  if (head.startsWith('<svg') || head.startsWith('<?xml')) return 'svg';
  return null;
}

const MIME: Record<string, string> = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' };

function svgFonts(svg: string) {
  // The server's SVG overlays name Inter; in the page the system font stands in.
  return svg.replace(/font-family="Inter"/g, 'font-family="Inter, -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif"');
}

async function decodeSvg(bytes: Uint8Array): Promise<Img> {
  const text = svgFonts(new TextDecoder().decode(bytes));
  const m = /<svg[^>]*?\swidth="([\d.]+)"[^>]*?\sheight="([\d.]+)"/.exec(text) ?? /<svg[^>]*?\sheight="([\d.]+)"[^>]*?\swidth="([\d.]+)"/.exec(text);
  const im = new Image();
  im.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(text)}`;
  await im.decode();
  const w = Math.max(1, Math.round(m ? Number(m[1]) : im.naturalWidth || 1));
  const h = Math.max(1, Math.round(m ? Number(m[2]) : im.naturalHeight || 1));
  const c = canvas(w, h);
  ctx2d(c).drawImage(im, 0, 0, w, h);
  return fromCanvas(c, 4);
}

async function decodeRaster(bytes: Uint8Array, fmt: Fmt): Promise<Img> {
  const blob = new Blob([bytes as BlobPart], { type: MIME[fmt] ?? 'application/octet-stream' });
  let source: ImageBitmap | HTMLImageElement;
  try {
    source = await createImageBitmap(blob);
  } catch {
    const im = new Image();
    im.src = `data:${MIME[fmt]};base64,${Buffer.from(bytes).toString('base64')}`;
    await im.decode();
    source = im;
  }
  const w = 'naturalWidth' in source ? source.naturalWidth : source.width;
  const h = 'naturalHeight' in source ? source.naturalHeight : source.height;
  const c = canvas(w, h);
  ctx2d(c).drawImage(source, 0, 0);
  if ('close' in source) source.close();
  const img = fromCanvas(c, 3);
  if (fmt !== 'jpeg') {
    for (let i = 3; i < img.px.length; i += 4) {
      if (img.px[i] < 255) {
        img.ch = 4;
        break;
      }
    }
  }
  return img;
}

function fromRaw(bytes: Uint8Array, raw: { width: number; height: number; channels: number }): Img {
  const { width: w, height: h, channels } = raw;
  const px = new Uint8ClampedArray(w * h * 4);
  for (let i = 0, p = 0, q = 0; i < w * h; i++, p += 4, q += channels) {
    if (channels === 1) {
      px[p] = px[p + 1] = px[p + 2] = bytes[q];
      px[p + 3] = 255;
    } else if (channels === 2) {
      px[p] = px[p + 1] = px[p + 2] = bytes[q];
      px[p + 3] = bytes[q + 1];
    } else {
      px[p] = bytes[q];
      px[p + 1] = bytes[q + 1];
      px[p + 2] = bytes[q + 2];
      px[p + 3] = channels === 4 ? bytes[q + 3] : 255;
    }
  }
  return { w, h, ch: channels as Ch, px };
}

function solid(w: number, h: number, bg: Colour, channels: number): Img {
  const [r, g, b, a] = colour(bg);
  const px = new Uint8ClampedArray(w * h * 4);
  for (let p = 0; p < px.length; p += 4) {
    px[p] = r;
    px[p + 1] = g;
    px[p + 2] = b;
    px[p + 3] = channels === 4 ? a : 255;
  }
  return { w, h, ch: channels === 4 ? 4 : 3, px };
}

function bytesOf(input: Uint8Array | ArrayBuffer) {
  return input instanceof Uint8Array ? input : new Uint8Array(input);
}

async function decodeInput(input: Input, opts: InputOpts): Promise<{ img: Img; fmt: Fmt }> {
  if (input && typeof input === 'object' && 'create' in input) {
    const c = input.create;
    return { img: solid(c.width, c.height, c.background, c.channels), fmt: 'png' };
  }
  if (!input) throw new Error('sharp: no input');
  const bytes = bytesOf(input);
  if (opts.raw) return { img: fromRaw(bytes, opts.raw), fmt: 'raw' };
  const fmt = sniff(bytes);
  if (!fmt) throw new Error('Input buffer contains unsupported image format');
  if (fmt === 'svg') return { img: await decodeSvg(bytes), fmt };
  return { img: await decodeRaster(bytes, fmt), fmt };
}

/* ───────────── pixel operations ───────────── */

const hasAlpha = (ch: Ch) => ch === 2 || ch === 4;
const isGrey = (ch: Ch) => ch === 1 || ch === 2;

function boxBlurH(src: Float32Array, dst: Float32Array, w: number, h: number, r: number) {
  const iarr = 1 / (r + r + 1);
  for (let y = 0; y < h; y++) {
    let ti = y * w;
    let li = ti;
    let ri = ti + r;
    const fv = src[ti];
    const lv = src[ti + w - 1];
    let val = (r + 1) * fv;
    for (let j = 0; j < r; j++) val += src[ti + Math.min(j, w - 1)];
    for (let j = 0; j <= r; j++) {
      val += src[Math.min(ri++, ti + w - 1)] - fv;
      dst[ti++] = val * iarr;
    }
    for (let j = r + 1; j < w - r; j++) {
      val += src[ri++] - src[li++];
      dst[ti++] = val * iarr;
    }
    for (let j = Math.max(w - r, r + 1); j < w; j++) {
      val += lv - src[li++];
      dst[ti++] = val * iarr;
    }
  }
}

function boxBlurV(src: Float32Array, dst: Float32Array, w: number, h: number, r: number) {
  const iarr = 1 / (r + r + 1);
  for (let x = 0; x < w; x++) {
    let ti = x;
    let li = ti;
    let ri = ti + r * w;
    const fv = src[ti];
    const lv = src[ti + w * (h - 1)];
    let val = (r + 1) * fv;
    for (let j = 0; j < r; j++) val += src[ti + Math.min(j, h - 1) * w];
    for (let j = 0; j <= r; j++) {
      val += src[Math.min(ri, x + (h - 1) * w)] - fv;
      ri += w;
      dst[ti] = val * iarr;
      ti += w;
    }
    for (let j = r + 1; j < h - r; j++) {
      val += src[ri] - src[li];
      ri += w;
      li += w;
      dst[ti] = val * iarr;
      ti += w;
    }
    for (let j = Math.max(h - r, r + 1); j < h; j++) {
      val += lv - src[li];
      li += w;
      dst[ti] = val * iarr;
      ti += w;
    }
  }
}

/** Gaussian blur approximated by three box blurs (sharp's blur(sigma)). */
function blur(img: Img, sigma = 0.5) {
  if (sigma < 0.3) return img;
  const n = 3;
  const wIdeal = Math.sqrt((12 * sigma * sigma) / n + 1);
  let wl = Math.floor(wIdeal);
  if (wl % 2 === 0) wl--;
  const m = Math.round((12 * sigma * sigma - n * wl * wl - 4 * n * wl - 3 * n) / (-4 * wl - 4));
  const radii = [0, 1, 2].map((i) => ((i < m ? wl : wl + 2) - 1) / 2);
  const { w, h, px } = img;
  const a = new Float32Array(w * h);
  const b = new Float32Array(w * h);
  const out = new Uint8ClampedArray(px);
  const chans = isGrey(img.ch) ? [0] : [0, 1, 2];
  if (hasAlpha(img.ch)) chans.push(3);
  for (const c of chans) {
    for (let i = 0; i < w * h; i++) a[i] = px[i * 4 + c];
    for (const r of radii) {
      if (r < 1) continue;
      boxBlurH(a, b, w, h, r);
      boxBlurV(b, a, w, h, r);
    }
    for (let i = 0; i < w * h; i++) out[i * 4 + c] = a[i];
    if (c === 0 && isGrey(img.ch)) for (let i = 0; i < w * h; i++) out[i * 4 + 1] = out[i * 4 + 2] = out[i * 4];
  }
  return { ...img, px: out };
}

/** Median filter (sharp's median(size)), per colour channel with a sliding histogram. */
function median(img: Img, size = 3) {
  const { w, h, px } = img;
  const r = Math.floor(size / 2);
  const out = new Uint8ClampedArray(px);
  const chans = isGrey(img.ch) ? [0] : [0, 1, 2];
  const half = Math.floor((size * size) / 2);
  const hist = new Uint16Array(256);
  for (const c of chans) {
    for (let y = 0; y < h; y++) {
      hist.fill(0);
      let count = 0;
      for (let dy = -r; dy <= r; dy++) {
        const yy = Math.min(h - 1, Math.max(0, y + dy));
        for (let dx = -r; dx <= r; dx++) {
          const xx = Math.min(w - 1, Math.max(0, dx));
          hist[px[(yy * w + xx) * 4 + c]]++;
          count++;
        }
      }
      for (let x = 0; x < w; x++) {
        if (x > 0) {
          const xo = Math.min(w - 1, Math.max(0, x - r - 1));
          const xi = Math.min(w - 1, x + r);
          for (let dy = -r; dy <= r; dy++) {
            const yy = Math.min(h - 1, Math.max(0, y + dy));
            hist[px[(yy * w + xo) * 4 + c]]--;
            hist[px[(yy * w + xi) * 4 + c]]++;
          }
        }
        let acc = 0;
        let v = 0;
        const target = Math.min(half, count - 1);
        for (; v < 256; v++) {
          acc += hist[v];
          if (acc > target) break;
        }
        out[(y * w + x) * 4 + c] = v;
      }
    }
  }
  if (isGrey(img.ch)) for (let p = 0; p < out.length; p += 4) out[p + 1] = out[p + 2] = out[p];
  return { ...img, px: out };
}

function mapColour(img: Img, f: (r: number, g: number, b: number) => [number, number, number]) {
  const out = new Uint8ClampedArray(img.px);
  for (let p = 0; p < out.length; p += 4) {
    const [r, g, b] = f(out[p], out[p + 1], out[p + 2]);
    out[p] = r;
    out[p + 1] = g;
    out[p + 2] = b;
  }
  return { ...img, px: out };
}

const lum = (r: number, g: number, b: number) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

function modulate(img: Img, o: { brightness?: number; saturation?: number; lightness?: number; hue?: number }) {
  const br = o.brightness ?? 1;
  const sat = o.saturation ?? 1;
  const li = o.lightness ?? 0;
  return mapColour(img, (r, g, b) => {
    r = r * br + li;
    g = g * br + li;
    b = b * br + li;
    const y = lum(r, g, b);
    return [y + (r - y) * sat, y + (g - y) * sat, y + (b - y) * sat];
  });
}

function greyscale(img: Img): Img {
  const out = mapColour(img, (r, g, b) => {
    const y = lum(r, g, b);
    return [y, y, y];
  });
  return { ...out, ch: hasAlpha(img.ch) ? 2 : 1 };
}

function linear(img: Img, a: number, b: number) {
  return mapColour(img, (r, g, bl) => [a * r + b, a * g + b, a * bl + b]);
}

function threshold(img: Img, t = 128): Img {
  const out = mapColour(img, (r, g, b) => {
    const v = lum(r, g, b) >= t ? 255 : 0;
    return [v, v, v];
  });
  return { ...out, ch: hasAlpha(img.ch) ? 2 : 1 };
}

function extractChannel(img: Img, ch: number | string): Img {
  const idx = typeof ch === 'number' ? ch : ({ red: 0, green: 1, blue: 2, alpha: 3 } as Record<string, number>)[ch] ?? 0;
  const src = isGrey(img.ch) && idx > 0 && idx < 3 ? 0 : isGrey(img.ch) && idx === 1 ? 3 : idx;
  const out = new Uint8ClampedArray(img.px.length);
  for (let p = 0; p < out.length; p += 4) {
    const v = img.px[p + src];
    out[p] = out[p + 1] = out[p + 2] = v;
    out[p + 3] = 255;
  }
  return { w: img.w, h: img.h, ch: 1, px: out };
}

function joinChannel(img: Img, extra: Img): Img {
  const out = new Uint8ClampedArray(img.px);
  for (let p = 0; p < out.length; p += 4) out[p + 3] = extra.px[p] ?? 255;
  return { ...img, px: out, ch: isGrey(img.ch) ? 2 : 4 };
}

function removeAlpha(img: Img): Img {
  const out = new Uint8ClampedArray(img.px);
  for (let p = 3; p < out.length; p += 4) out[p] = 255;
  return { ...img, px: out, ch: isGrey(img.ch) ? 1 : 3 };
}

function ensureAlpha(img: Img): Img {
  return hasAlpha(img.ch) ? img : { ...img, ch: isGrey(img.ch) ? 2 : 4 };
}

/* ───────────── geometry ───────────── */

interface ResizeOpts {
  width?: number | null;
  height?: number | null;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  withoutEnlargement?: boolean;
  background?: Colour;
  kernel?: string;
  position?: string;
}

function resize(img: Img, o: ResizeOpts): Img {
  let W = o.width ?? null;
  let H = o.height ?? null;
  const fit = o.fit ?? 'cover';
  if (W == null && H == null) return img;
  if (W == null) W = Math.round((img.w * H!) / img.h);
  if (H == null) H = Math.round((img.h * W) / img.w);
  const smooth = o.kernel !== 'nearest';
  let dw = W;
  let dh = H;
  let sx = 0;
  let sy = 0;
  let sw = img.w;
  let sh = img.h;
  let ox = 0;
  let oy = 0;
  let cw = W;
  let ch = H;
  let alpha = hasAlpha(img.ch);
  if (fit === 'inside' || fit === 'outside') {
    const s = fit === 'inside' ? Math.min(W / img.w, H / img.h) : Math.max(W / img.w, H / img.h);
    const scale = o.withoutEnlargement ? Math.min(1, s) : s;
    cw = dw = Math.max(1, Math.round(img.w * scale));
    ch = dh = Math.max(1, Math.round(img.h * scale));
  } else if (fit === 'cover') {
    if (o.withoutEnlargement && W >= img.w && H >= img.h) {
      const s = Math.min(1, Math.max(W / img.w, H / img.h));
      W = Math.round(img.w * s);
      H = Math.round(img.h * s);
    }
    const s = Math.max(W / img.w, H / img.h);
    sw = Math.min(img.w, W / s);
    sh = Math.min(img.h, H / s);
    sx = (img.w - sw) / 2;
    sy = (img.h - sh) / 2;
    cw = dw = W;
    ch = dh = H;
  } else if (fit === 'contain') {
    const s = Math.min(W / img.w, H / img.h);
    dw = Math.max(1, Math.round(img.w * s));
    dh = Math.max(1, Math.round(img.h * s));
    ox = Math.floor((W - dw) / 2);
    oy = Math.floor((H - dh) / 2);
    const bg = colour(o.background, [0, 0, 0, 255]);
    if (bg[3] < 255) alpha = true;
  }
  const c = canvas(cw, ch);
  const x = ctx2d(c);
  if (fit === 'contain') {
    const [r, g, b, a] = colour(o.background, [0, 0, 0, 255]);
    x.fillStyle = `rgba(${r},${g},${b},${a / 255})`;
    x.fillRect(0, 0, cw, ch);
  }
  x.imageSmoothingEnabled = smooth;
  if (smooth) x.imageSmoothingQuality = 'high';
  x.drawImage(toCanvas(img), sx, sy, sw, sh, ox, oy, dw, dh);
  const out = fromCanvas(c, img.ch);
  out.ch = alpha ? (isGrey(img.ch) ? 2 : 4) : img.ch;
  return out;
}

function rotate(img: Img, angle: number | undefined, o?: { background?: Colour }): Img {
  if (!angle) return img; // EXIF orientation is applied when the browser decodes
  const a = ((angle % 360) + 360) % 360;
  if (a === 0) return img;
  const rad = (a * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const right = a % 90 === 0;
  const w = right ? (a % 180 === 0 ? img.w : img.h) : Math.ceil(img.w * cos + img.h * sin);
  const h = right ? (a % 180 === 0 ? img.h : img.w) : Math.ceil(img.w * sin + img.h * cos);
  const c = canvas(w, h);
  const x = ctx2d(c);
  const bg = colour(o?.background, [0, 0, 0, 255]);
  if (!right) {
    x.fillStyle = `rgba(${bg[0]},${bg[1]},${bg[2]},${bg[3] / 255})`;
    x.fillRect(0, 0, w, h);
  }
  x.translate(w / 2, h / 2);
  x.rotate(rad);
  x.drawImage(toCanvas(img), -img.w / 2, -img.h / 2);
  const out = fromCanvas(c, img.ch);
  if (!right && bg[3] < 255) out.ch = isGrey(img.ch) ? 2 : 4;
  return out;
}

function extract(img: Img, r: { left: number; top: number; width: number; height: number }): Img {
  const w = Math.max(1, Math.round(r.width));
  const h = Math.max(1, Math.round(r.height));
  const out = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    const sy = Math.round(r.top) + y;
    if (sy < 0 || sy >= img.h) continue;
    for (let x = 0; x < w; x++) {
      const sx = Math.round(r.left) + x;
      if (sx < 0 || sx >= img.w) continue;
      const s = (sy * img.w + sx) * 4;
      const d = (y * w + x) * 4;
      out[d] = img.px[s];
      out[d + 1] = img.px[s + 1];
      out[d + 2] = img.px[s + 2];
      out[d + 3] = img.px[s + 3];
    }
  }
  return { w, h, ch: img.ch, px: out };
}

function extend(img: Img, o: { top?: number; bottom?: number; left?: number; right?: number; background?: Colour } | number): Img {
  const e = typeof o === 'number' ? { top: o, bottom: o, left: o, right: o } : o;
  const t = e.top ?? 0;
  const l = e.left ?? 0;
  const w = img.w + l + (e.right ?? 0);
  const h = img.h + t + (e.bottom ?? 0);
  const bg = colour(typeof o === 'number' ? undefined : o.background, [0, 0, 0, 255]);
  const base = solid(w, h, { r: bg[0], g: bg[1], b: bg[2], alpha: bg[3] / 255 }, 4);
  for (let y = 0; y < img.h; y++) {
    base.px.set(img.px.subarray(y * img.w * 4, (y + 1) * img.w * 4), ((y + t) * w + l) * 4);
  }
  base.ch = bg[3] < 255 || hasAlpha(img.ch) ? (isGrey(img.ch) ? 2 : 4) : img.ch;
  return base;
}

interface Overlay {
  input: Uint8Array | ArrayBuffer | { create: { width: number; height: number; channels: number; background: Colour } };
  top?: number;
  left?: number;
  blend?: string;
  gravity?: string;
  raw?: { width: number; height: number; channels: number };
  tile?: boolean;
}

const BLEND: Record<string, GlobalCompositeOperation> = {
  over: 'source-over',
  multiply: 'multiply',
  screen: 'screen',
  'dest-in': 'destination-in',
  'dest-out': 'destination-out',
  'dest-over': 'destination-over',
  in: 'source-in',
  out: 'source-out',
  atop: 'source-atop',
  overlay: 'overlay',
  darken: 'darken',
  lighten: 'lighten',
  'soft-light': 'soft-light',
  'hard-light': 'hard-light',
  difference: 'difference',
  exclusion: 'exclusion',
  xor: 'xor',
};

async function composite(img: Img, layers: Overlay[]): Promise<Img> {
  const c = toCanvas(img);
  const x = ctx2d(c);
  let alpha = hasAlpha(img.ch);
  for (const layer of layers) {
    const { img: li } = await decodeInput(layer.input as Input, { raw: layer.raw });
    const left = layer.left ?? Math.round((img.w - li.w) / 2);
    const top = layer.top ?? Math.round((img.h - li.h) / 2);
    const op = BLEND[layer.blend ?? 'over'] ?? 'source-over';
    x.globalCompositeOperation = op;
    if (op === 'destination-in' || op === 'destination-out' || op === 'source-in' || op === 'source-out') {
      // Porter-Duff ops act on the whole canvas: give the layer a full-size, transparent-padded canvas.
      const full = canvas(img.w, img.h);
      ctx2d(full).drawImage(toCanvas(li), left, top);
      x.drawImage(full, 0, 0);
      alpha = true;
    } else x.drawImage(toCanvas(li), left, top);
    x.globalCompositeOperation = 'source-over';
  }
  const out = fromCanvas(c, img.ch);
  out.ch = alpha ? (isGrey(img.ch) ? 2 : 4) : img.ch;
  return out;
}

/* ───────────── palette (png({ palette })) ───────────── */

function quantize(img: Img, colours: number): Img {
  // Median cut over a sample of pixels, then nearest-colour mapping.
  const sample: number[][] = [];
  const step = Math.max(1, Math.floor((img.w * img.h) / 20000));
  for (let i = 0; i < img.w * img.h; i += step) sample.push([img.px[i * 4], img.px[i * 4 + 1], img.px[i * 4 + 2]]);
  let boxes = [sample];
  while (boxes.length < colours) {
    boxes.sort((a, b) => b.length - a.length);
    const box = boxes.shift()!;
    if (box.length < 2) {
      boxes.push(box);
      break;
    }
    const ranges = [0, 1, 2].map((c) => Math.max(...box.map((p) => p[c])) - Math.min(...box.map((p) => p[c])));
    const c = ranges.indexOf(Math.max(...ranges));
    box.sort((a, b) => a[c] - b[c]);
    boxes.push(box.slice(0, box.length >> 1), box.slice(box.length >> 1));
  }
  boxes = boxes.filter((b) => b.length);
  const pal = boxes.map((b) => [0, 1, 2].map((c) => Math.round(b.reduce((s, p) => s + p[c], 0) / b.length)));
  const out = new Uint8ClampedArray(img.px);
  for (let p = 0; p < out.length; p += 4) {
    let best = 0;
    let bd = Infinity;
    for (let k = 0; k < pal.length; k++) {
      const d = (out[p] - pal[k][0]) ** 2 + (out[p + 1] - pal[k][1]) ** 2 + (out[p + 2] - pal[k][2]) ** 2;
      if (d < bd) {
        bd = d;
        best = k;
      }
    }
    out[p] = pal[best][0];
    out[p + 1] = pal[best][1];
    out[p + 2] = pal[best][2];
  }
  return { ...img, px: out };
}

/* ───────────── EXIF (withExif) ───────────── */

/** A minimal EXIF block (IFD0 ASCII tags) inserted after the JPEG SOI marker. */
function withExifJpeg(jpeg: Uint8Array, ifd0: Record<string, string>): Uint8Array {
  const TAGS: Record<string, number> = { ImageDescription: 0x010e, Make: 0x010f, Model: 0x0110, Software: 0x0131, Artist: 0x013b, Copyright: 0x8298 };
  const entries = Object.entries(ifd0)
    .filter(([k]) => TAGS[k])
    .map(([k, v]) => ({ tag: TAGS[k], bytes: new TextEncoder().encode(`${v}\0`) }))
    .sort((a, b) => a.tag - b.tag);
  const ifdSize = 2 + entries.length * 12 + 4;
  const dataStart = 8 + ifdSize;
  const dataLen = entries.reduce((s, e) => s + (e.bytes.length > 4 ? e.bytes.length : 0), 0);
  const tiff = new Uint8Array(dataStart + dataLen);
  const dv = new DataView(tiff.buffer);
  tiff.set([0x4d, 0x4d, 0x00, 0x2a, 0, 0, 0, 8]); // big-endian TIFF header, IFD0 at offset 8
  dv.setUint16(8, entries.length);
  let off = dataStart;
  entries.forEach((e, i) => {
    const p = 10 + i * 12;
    dv.setUint16(p, e.tag);
    dv.setUint16(p + 2, 2); // ASCII
    dv.setUint32(p + 4, e.bytes.length);
    if (e.bytes.length <= 4) tiff.set(e.bytes, p + 8);
    else {
      dv.setUint32(p + 8, off);
      tiff.set(e.bytes, off);
      off += e.bytes.length;
    }
  });
  dv.setUint32(10 + entries.length * 12, 0);
  const app1Len = 2 + 6 + tiff.length;
  if (app1Len > 0xffff) return jpeg;
  const app1 = new Uint8Array(2 + app1Len);
  app1.set([0xff, 0xe1, app1Len >> 8, app1Len & 0xff, 0x45, 0x78, 0x69, 0x66, 0, 0]);
  app1.set(tiff, 10);
  const out = new Uint8Array(jpeg.length + app1.length);
  out.set(jpeg.subarray(0, 2));
  out.set(app1, 2);
  out.set(jpeg.subarray(2), 2 + app1.length);
  return out;
}

/* ───────────── the pipeline ───────────── */

type Op = (img: Img) => Img | Promise<Img>;

interface OutOpts {
  quality?: number;
  palette?: boolean;
  colours?: number;
  colors?: number;
  pageHeight?: number;
  [k: string]: unknown;
}

class Sharp {
  private ops: Op[] = [];
  private fmt: Fmt | null = null;
  private outOpts: OutOpts = {};
  private exif: Record<string, string> | null = null;
  private decoded: Promise<{ img: Img; fmt: Fmt }> | null = null;

  constructor(
    private input: Input,
    private opts: InputOpts = {},
  ) {}

  private source() {
    this.decoded ??= decodeInput(this.input, this.opts);
    return this.decoded;
  }

  private push(op: Op) {
    this.ops.push(op);
    return this;
  }

  clone() {
    const s = new Sharp(this.input, this.opts);
    s.ops = [...this.ops];
    s.fmt = this.fmt;
    s.outOpts = { ...this.outOpts };
    s.exif = this.exif;
    s.decoded = this.decoded;
    return s;
  }

  rotate(angle?: number, o?: { background?: Colour }) {
    return this.push((img) => rotate(img, angle, o));
  }
  resize(a?: number | null | ResizeOpts, b?: number | null, c?: ResizeOpts) {
    const o: ResizeOpts = typeof a === 'object' && a !== null ? a : { ...(c ?? {}), width: a ?? null, height: b ?? null };
    return this.push((img) => resize(img, o));
  }
  extract(r: { left: number; top: number; width: number; height: number }) {
    return this.push((img) => extract(img, r));
  }
  extend(o: Parameters<typeof extend>[1]) {
    return this.push((img) => extend(img, o));
  }
  composite(layers: Overlay[]) {
    return this.push((img) => composite(img, layers));
  }
  modulate(o: { brightness?: number; saturation?: number; lightness?: number; hue?: number }) {
    return this.push((img) => modulate(img, o));
  }
  blur(sigma?: number) {
    return this.push((img) => blur(img, sigma));
  }
  median(size?: number) {
    return this.push((img) => median(img, size));
  }
  greyscale(on = true) {
    return on ? this.push(greyscale) : this;
  }
  grayscale(on = true) {
    return this.greyscale(on);
  }
  linear(a: number | number[] = 1, b: number | number[] = 0) {
    const av = Array.isArray(a) ? a[0] : a;
    const bv = Array.isArray(b) ? b[0] : b;
    return this.push((img) => linear(img, av, bv));
  }
  threshold(t?: number) {
    return this.push((img) => threshold(img, t));
  }
  extractChannel(c: number | string) {
    return this.push((img) => extractChannel(img, c));
  }
  joinChannel(input: Uint8Array | ArrayBuffer, o?: InputOpts) {
    return this.push(async (img) => joinChannel(img, (await decodeInput(input, o ?? {})).img));
  }
  removeAlpha() {
    return this.push(removeAlpha);
  }
  ensureAlpha() {
    return this.push(ensureAlpha);
  }
  flatten(o?: { background?: Colour }) {
    return this.push((img) => {
      const [r, g, b] = colour(o?.background, [0, 0, 0, 255]);
      const out = new Uint8ClampedArray(img.px);
      for (let p = 0; p < out.length; p += 4) {
        const a = out[p + 3] / 255;
        out[p] = out[p] * a + r * (1 - a);
        out[p + 1] = out[p + 1] * a + g * (1 - a);
        out[p + 2] = out[p + 2] * a + b * (1 - a);
        out[p + 3] = 255;
      }
      return { ...img, px: out, ch: isGrey(img.ch) ? 1 : 3 };
    });
  }

  png(o: OutOpts = {}) {
    this.fmt = 'png';
    this.outOpts = o;
    return this;
  }
  jpeg(o: OutOpts = {}) {
    this.fmt = 'jpeg';
    this.outOpts = o;
    return this;
  }
  webp(o: OutOpts = {}) {
    this.fmt = 'webp';
    this.outOpts = o;
    return this;
  }
  raw() {
    this.fmt = 'raw';
    return this;
  }
  toFormat(f: string, o: OutOpts = {}) {
    this.fmt = (f === 'jpg' ? 'jpeg' : f) as Fmt;
    this.outOpts = o;
    return this;
  }
  withExif(e: { IFD0?: Record<string, string> }) {
    this.exif = e.IFD0 ?? null;
    return this;
  }
  withMetadata() {
    return this;
  }
  keepExif() {
    return this;
  }

  async metadata() {
    const { img, fmt } = await this.source();
    return {
      width: img.w,
      height: img.h,
      format: fmt === 'raw' ? undefined : fmt,
      channels: img.ch,
      hasAlpha: hasAlpha(img.ch),
      space: isGrey(img.ch) ? 'b-w' : 'srgb',
      pages: 1,
      pageHeight: img.h,
      delay: [] as number[],
    };
  }

  private async run() {
    const { img, fmt } = await this.source();
    let cur: Img = { ...img, px: img.px };
    for (const op of this.ops) cur = await op(cur);
    return { img: cur, inFmt: fmt };
  }

  async stats() {
    const { img } = await this.run();
    const n = img.w * img.h;
    const chans = img.ch === 1 ? [0] : img.ch === 2 ? [0, 3] : img.ch === 3 ? [0, 1, 2] : [0, 1, 2, 3];
    const channels = chans.map((c) => {
      let min = 255;
      let max = 0;
      let sum = 0;
      for (let i = 0; i < n; i++) {
        const v = img.px[i * 4 + c];
        if (v < min) min = v;
        if (v > max) max = v;
        sum += v;
      }
      return { min, max, sum, mean: sum / n };
    });
    const bins = new Map<number, number>();
    for (let i = 0; i < n; i++) {
      const k = ((img.px[i * 4] >> 4) << 8) | ((img.px[i * 4 + 1] >> 4) << 4) | (img.px[i * 4 + 2] >> 4);
      bins.set(k, (bins.get(k) ?? 0) + 1);
    }
    let best = 0;
    let bestN = -1;
    for (const [k, v] of bins) if (v > bestN) [best, bestN] = [k, v];
    const dominant = { r: ((best >> 8) & 15) * 16 + 8, g: ((best >> 4) & 15) * 16 + 8, b: (best & 15) * 16 + 8 };
    return { channels, dominant, isOpaque: !hasAlpha(img.ch) || channels[channels.length - 1].min === 255 };
  }

  async toBuffer(o?: { resolveWithObject?: boolean }) {
    const { img, inFmt } = await this.run();
    const fmt: Fmt = this.fmt ?? (inFmt === 'svg' || inFmt === 'gif' ? 'png' : inFmt);
    let data: Uint8Array;
    let outFmt: string = fmt;
    let channels: number = img.ch;
    if (fmt === 'raw') {
      const n = img.w * img.h;
      data = new Uint8Array(n * img.ch);
      for (let i = 0, p = 0, q = 0; i < n; i++, p += 4, q += img.ch) {
        if (img.ch === 1) data[q] = img.px[p];
        else if (img.ch === 2) {
          data[q] = img.px[p];
          data[q + 1] = img.px[p + 3];
        } else {
          data[q] = img.px[p];
          data[q + 1] = img.px[p + 1];
          data[q + 2] = img.px[p + 2];
          if (img.ch === 4) data[q + 3] = img.px[p + 3];
        }
      }
    } else {
      let src = img;
      if (fmt === 'png' && this.outOpts.palette) src = quantize(img, Number(this.outOpts.colours ?? this.outOpts.colors ?? 256));
      // Live clips (animated WebP in sharp) are stored as a JPEG strip of frames.
      const strip = fmt === 'webp' && Boolean(this.outOpts.pageHeight);
      const want = strip || fmt === 'jpeg' ? 'image/jpeg' : fmt === 'webp' ? 'image/webp' : 'image/png';
      const quality = typeof this.outOpts.quality === 'number' ? this.outOpts.quality / 100 : want === 'image/jpeg' ? 0.8 : undefined;
      const enc = await encode(toCanvas(want === 'image/jpeg' ? flattenBlack(src) : src), want, quality);
      data = enc.bytes;
      outFmt = enc.type.replace('image/', '');
      if (outFmt === 'jpeg') {
        channels = isGrey(img.ch) ? 1 : 3;
        if (this.exif) data = withExifJpeg(data, this.exif);
      }
    }
    const buf = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
    if (o?.resolveWithObject) return { data: buf, info: { width: img.w, height: img.h, channels, format: outFmt, size: buf.length } };
    return buf;
  }
}

function flattenBlack(img: Img): Img {
  if (!hasAlpha(img.ch)) return img;
  const out = new Uint8ClampedArray(img.px);
  for (let p = 0; p < out.length; p += 4) {
    const a = out[p + 3] / 255;
    out[p] *= a;
    out[p + 1] *= a;
    out[p + 2] *= a;
    out[p + 3] = 255;
  }
  return { ...img, px: out };
}

function sharp(input?: Input, opts?: InputOpts) {
  return new Sharp(input, opts);
}

export default sharp;
