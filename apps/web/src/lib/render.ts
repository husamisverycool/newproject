import { BRAND, PALETTE } from '@app/shared';
import { loadImage, personMask } from './vision';

/**
 * On-device rendering for the Create tools (Google Photos Photo to video, Cinematic photos, Animations,
 * Highlight videos) and the recap slideshow (iOS 27): canvas frames for animated clips, MediaRecorder
 * for videos. Nothing here is generative — motion is a camera move over the photo, depth comes from the
 * on-device person mask (MediaPipe), so no likeness is generated.
 */

export type Picture = HTMLImageElement | HTMLCanvasElement;
const dims = (p: Picture) => (p instanceof HTMLImageElement ? { w: p.naturalWidth, h: p.naturalHeight } : { w: p.width, h: p.height });

export const loadPicture = (src: string | Blob) => loadImage(src);

export const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
/** easeInOutSine — the curve UIView animations use by default ("curveEaseInOut") [HIG]. */
export const ease = (t: number) => -(Math.cos(Math.PI * clamp01(t)) - 1) / 2;

export interface Move {
  zoom?: number;
  /** offset as a fraction of the frame */
  dx?: number;
  dy?: number;
  rot?: number;
  alpha?: number;
}

/** Draw a picture so it fills the W×H frame (aspect fill), moved by `m`. */
export function drawFill(ctx: CanvasRenderingContext2D, pic: Picture, W: number, H: number, m: Move = {}) {
  const { w, h } = dims(pic);
  if (!w || !h) return;
  const s = Math.max(W / w, H / h) * (m.zoom ?? 1);
  ctx.save();
  ctx.globalAlpha = m.alpha ?? 1;
  ctx.translate(W / 2 + (m.dx ?? 0) * W, H / 2 + (m.dy ?? 0) * H);
  if (m.rot) ctx.rotate(m.rot);
  ctx.drawImage(pic, (-w * s) / 2, (-h * s) / 2, w * s, h * s);
  ctx.restore();
}

function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = Math.round(w);
  c.height = Math.round(h);
  return c;
}

/** Grow a mask by `r` mask pixels (separable max filter) so the filled hole covers the person's edge. */
function dilate(data: Float32Array, w: number, h: number, r: number) {
  const tmp = new Float32Array(data.length);
  const out = new Float32Array(data.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let m = 0;
      for (let k = Math.max(0, x - r); k <= Math.min(w - 1, x + r); k++) m = Math.max(m, data[y * w + k]);
      tmp[y * w + x] = m;
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let m = 0;
      for (let k = Math.max(0, y - r); k <= Math.min(h - 1, y + r); k++) m = Math.max(m, tmp[k * w + x]);
      out[y * w + x] = m;
    }
  }
  return out;
}

function maskCanvas(data: Float32Array, w: number, h: number, invert: boolean) {
  const c = canvas(w, h);
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(w, h);
  for (let i = 0; i < data.length; i++) {
    const a = clamp01((data[i] - 0.3) / 0.4);
    img.data[i * 4 + 3] = Math.round((invert ? 1 - a : a) * 255);
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

/**
 * Push-pull fill: each smaller copy of the holed image averages only its visible pixels (canvas keeps
 * colors un-premultiplied), so coarse-to-fine copies carry the surrounding colors into the hole; the
 * sharp image goes back on top.
 */
function fillHoles(keep: HTMLCanvasElement, W: number, H: number) {
  const acc = canvas(W, H);
  const a = acc.getContext('2d')!;
  a.imageSmoothingQuality = 'high';
  for (const n of [2, 4, 8, 16, 32, 64, 128]) {
    const c = canvas(n, Math.max(1, Math.round((n * H) / W)));
    const x = c.getContext('2d', { willReadFrequently: true })!;
    x.imageSmoothingQuality = 'high';
    x.drawImage(keep, 0, 0, c.width, c.height);
    const d = x.getImageData(0, 0, c.width, c.height);
    for (let i = 3; i < d.data.length; i += 4) d.data[i] = d.data[i] > 6 ? 255 : 0;
    x.putImageData(d, 0, 0);
    a.drawImage(c, 0, 0, W, H);
  }
  const out = canvas(W, H);
  const o = out.getContext('2d')!;
  o.filter = `blur(${Math.max(2, Math.round(W * 0.015))}px)`;
  o.drawImage(acc, 0, 0);
  o.filter = 'none';
  o.drawImage(keep, 0, 0);
  return out;
}

export interface Layers {
  /** the photo with the person's area filled from its blurred surroundings */
  back: HTMLCanvasElement;
  /** the person, cut out on transparency; null when nobody is in the photo */
  front: HTMLCanvasElement | null;
  size: { w: number; h: number };
}

/** Split a photo into a background and a person layer for 2.5D motion (the "3D effect"). */
export async function depthLayers(src: string | Blob, maxSide = 900): Promise<Layers> {
  const img = await loadImage(src);
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const W = Math.round(img.naturalWidth * scale);
  const H = Math.round(img.naturalHeight * scale);
  const base = canvas(W, H);
  base.getContext('2d')!.drawImage(img, 0, 0, W, H);
  const mask = await personMask(img).catch(() => null);
  if (!mask) return { back: base, front: null, size: { w: W, h: H } };

  const front = canvas(W, H);
  const f = front.getContext('2d')!;
  f.drawImage(base, 0, 0);
  f.globalCompositeOperation = 'destination-in';
  f.drawImage(maskCanvas(mask.data, mask.width, mask.height, false), 0, 0, W, H);

  // Background: the photo with the (grown) person area cut away, the hole filled from its surroundings.
  const grown = dilate(mask.data, mask.width, mask.height, Math.max(2, Math.round(mask.width * 0.035)));
  const keep = canvas(W, H);
  const k = keep.getContext('2d')!;
  k.drawImage(base, 0, 0);
  k.globalCompositeOperation = 'destination-in';
  k.drawImage(maskCanvas(grown, mask.width, mask.height, true), 0, 0, W, H);
  const back = fillHoles(keep, W, H);
  return { back, front, size: { w: W, h: H } };
}

/** Render `count` square frames to JPEG blobs. */
export async function renderFrames(size: number, count: number, draw: (ctx: CanvasRenderingContext2D, i: number, t: number) => void, onProgress?: (p: number) => void) {
  const c = canvas(size, size);
  const ctx = c.getContext('2d')!;
  const out: Blob[] = [];
  for (let i = 0; i < count; i++) {
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = PALETTE.black;
    ctx.fillRect(0, 0, size, size);
    draw(ctx, i, count > 1 ? i / (count - 1) : 0);
    out.push(await new Promise<Blob>((res, rej) => c.toBlob((bl) => (bl ? res(bl) : rej(new Error('encode'))), 'image/jpeg', 0.84)));
    onProgress?.((i + 1) / count);
  }
  return out;
}

/** The video container this browser can record, if any (Safari records MP4, Chromium WebM). */
export function videoType(): string | null {
  if (typeof MediaRecorder === 'undefined' || typeof HTMLCanvasElement.prototype.captureStream !== 'function') return null;
  for (const t of ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']) if (MediaRecorder.isTypeSupported(t)) return t;
  return null;
}

export interface AudioCue {
  url: string;
  atMs: number;
}

/**
 * Record a canvas animation as a video, in real time. `draw` is called on every animation frame with
 * the elapsed milliseconds. Audio cues (voice notes) are mixed in at their offsets.
 */
export async function recordVideo(opts: { width: number; height: number; durationMs: number; draw: (ctx: CanvasRenderingContext2D, ms: number) => void; audio?: AudioCue[]; onProgress?: (p: number) => void }) {
  const type = videoType();
  if (!type) return null;
  const c = canvas(opts.width, opts.height);
  const ctx = c.getContext('2d')!;
  opts.draw(ctx, 0);
  const stream = c.captureStream(30);
  let ac: AudioContext | null = null;
  const sources: AudioBufferSourceNode[] = [];
  if (opts.audio?.length && typeof AudioContext !== 'undefined') {
    ac = new AudioContext();
    const dest = ac.createMediaStreamDestination();
    for (const cue of opts.audio) {
      try {
        const buf = await ac.decodeAudioData(await (await fetch(cue.url)).arrayBuffer());
        const src = ac.createBufferSource();
        src.buffer = buf;
        src.connect(dest);
        sources.push(Object.assign(src, { _at: cue.atMs }));
      } catch {
        /* an unreadable voice note is left out */
      }
    }
    for (const t of dest.stream.getAudioTracks()) stream.addTrack(t);
  }
  const rec = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 4_000_000 });
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const stopped = new Promise<void>((res) => (rec.onstop = () => res()));
  rec.start(250);
  const t0 = performance.now();
  if (ac) for (const s of sources) s.start(ac.currentTime + (s as AudioBufferSourceNode & { _at: number })._at / 1000);
  await new Promise<void>((done) => {
    const tick = () => {
      const ms = performance.now() - t0;
      opts.draw(ctx, Math.min(ms, opts.durationMs));
      opts.onProgress?.(clamp01(ms / opts.durationMs));
      if (ms >= opts.durationMs) done();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  rec.stop();
  await stopped;
  stream.getTracks().forEach((t) => t.stop());
  void ac?.close();
  return { blob: new Blob(chunks, { type: type.split(';')[0] }), type: type.split(';')[0] };
}

/** First frame of a rendered clip as a JPEG (the creation's poster). */
export async function posterOf(draw: (ctx: CanvasRenderingContext2D) => void, w: number, h: number) {
  const c = canvas(w, h);
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = PALETTE.black;
  ctx.fillRect(0, 0, w, h);
  draw(ctx);
  return new Promise<Blob>((res, rej) => c.toBlob((bl) => (bl ? res(bl) : rej(new Error('encode'))), 'image/jpeg', 0.86));
}

/**
 * The visible watermark (spec §Q) on recorded videos — the server's mark drawn on the device: the
 * wordmark with the Locket-yellow period [I] and the group mascot glyph, at Gemini's geometry
 * (bottom-right, 48 px mark and 32 px margin; 96/64 above 1024 px) [V-weak], moving through the four
 * corners over the clip like Sora's moving watermark [V-weak] (media.ts watermarkSvg / exportAnimated).
 */
export function drawWatermark(ctx: CanvasRenderingContext2D, W: number, H: number, t01: number, mascotColor: string) {
  const large = Math.max(W, H) > 1024;
  const size = large ? 96 : 48;
  const margin = large ? 64 : 32;
  const fontSize = Math.round(size * 0.62);
  const textW = Math.round(fontSize * 2.3);
  const spots: [number, number][] = [
    [W - margin - size * 3.6, H - margin - size],
    [margin, H - margin - size],
    [margin, margin],
    [W - margin - size * 3.6, margin],
  ];
  const [x, y] = spots[Math.floor(clamp01(t01) * spots.length) % spots.length];
  ctx.save();
  ctx.globalAlpha = 0.7;
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = size * 0.16;
  ctx.shadowOffsetY = size * 0.04;
  ctx.translate(x, y);
  ctx.font = `900 ${fontSize}px Inter, -apple-system, sans-serif`;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = PALETTE.white;
  ctx.fillText(BRAND.bare, 0, size * 0.74);
  ctx.fillStyle = PALETTE.locket;
  ctx.fillText(BRAND.name.slice(BRAND.bare.length), ctx.measureText(BRAND.bare).width, size * 0.74);
  // Mascot glyph (media.ts mascotGlyphSvg): body circle, two eyes, a smile.
  const r = size / 2;
  ctx.translate(textW + size * 0.25, 0);
  ctx.fillStyle = mascotColor;
  ctx.beginPath();
  ctx.arc(r, r, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = PALETTE.white;
  for (const ex of [0.68, 1.32]) {
    ctx.beginPath();
    ctx.arc(r * ex, r * 0.86, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = PALETTE.black;
  for (const ex of [0.72, 1.36]) {
    ctx.beginPath();
    ctx.arc(r * ex, r * 0.9, r * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = PALETTE.black;
  ctx.lineWidth = r * 0.1;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(r * 0.7, r * 1.3);
  ctx.quadraticCurveTo(r, r * 1.55, r * 1.3, r * 1.3);
  ctx.stroke();
  ctx.restore();
}

/** A small deterministic generator, so "Regenerate" gives another variation. */
export function rng(seed: number) {
  let a = seed >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
