import { loadImage } from '../../lib/vision';

/**
 * iMessage Live Sticker effects, drawn on-device. Names are Apple's ("Shiny" · "Comic" · "Puffy" ·
 * "Outline", support.apple.com via research/26 §2 [V-weak]); the looks follow the background notes in
 * research/16 [B] and 26 [B] ("Shiny" shimmers like foil; "Puffy" is inflated; "Comic" is a comic-book
 * print; "Outline" is the white die-cut edge). The server's die-cut (ai/local.ts `stickerize`) always
 * adds the white edge and drop shadow, so the upload carries only the effect and the preview adds the edge.
 */
export type Effect = 'Shiny' | 'Comic' | 'Puffy' | 'Outline';

function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return { c, ctx: c.getContext('2d')! };
}

function toBlob(c: HTMLCanvasElement) {
  return new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('encode'))), 'image/png'));
}

/** Same shape, one flat color. */
function silhouette(src: CanvasImageSource, w: number, h: number, color: string) {
  const { c, ctx } = canvas(w, h);
  ctx.drawImage(src, 0, 0, w, h);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
  return c;
}

/** The effect alone (what gets uploaded). */
export async function applyEffect(png: Blob, effect: Effect): Promise<Blob> {
  const img = await loadImage(png);
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const { c, ctx } = canvas(w, h);
  ctx.drawImage(img, 0, 0);
  if (effect === 'Outline') return toBlob(c);
  if (effect === 'Comic') {
    // Posterized color and an ink line just inside the edge.
    const px = ctx.getImageData(0, 0, w, h);
    const step = 255 / 3;
    for (let i = 0; i < px.data.length; i += 4) for (let k = 0; k < 3; k++) px.data[i + k] = Math.round(Math.round(px.data[i + k] / step) * step);
    ctx.putImageData(px, 0, 0);
    const ink = silhouette(img, w, h, '#000');
    const { c: ring, ctx: r } = canvas(w, h);
    r.drawImage(ink, 0, 0);
    r.globalCompositeOperation = 'destination-out';
    const t = Math.max(2, Math.round(Math.min(w, h) / 160));
    for (let a = 0; a < 16; a++) r.drawImage(ink, Math.cos((a / 16) * Math.PI * 2) * t, Math.sin((a / 16) * Math.PI * 2) * t);
    ctx.drawImage(ring, 0, 0);
    return toBlob(c);
  }
  // Puffy and Shiny: a light pass clipped to the shape.
  ctx.globalCompositeOperation = 'source-atop';
  if (effect === 'Puffy') {
    const g = ctx.createRadialGradient(w * 0.35, h * 0.28, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.75);
    g.addColorStop(0, 'rgba(255,255,255,0.45)');
    g.addColorStop(0.45, 'rgba(255,255,255,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.28)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  } else {
    // Foil sheen across Apple's system pink, cyan, green and yellow [HIG] (the real hues are UNKNOWN).
    const g = ctx.createLinearGradient(0, 0, w, h);
    ['#ff2d55', '#32ade6', '#34c759', '#ffcc00', '#ff2d55'].forEach((col, i, all) => g.addColorStop(i / (all.length - 1), col));
    ctx.globalAlpha = 0.45;
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  return toBlob(c);
}

/** Preview of the finished sticker: the effect plus the white die-cut edge the server adds. */
export async function previewSticker(png: Blob, effect: Effect): Promise<string> {
  const fx = await loadImage(await applyEffect(png, effect));
  const w = fx.naturalWidth;
  const h = fx.naturalHeight;
  const edge = Math.max(6, Math.round(Math.min(w, h) / 40));
  const { c, ctx } = canvas(w + edge * 2, h + edge * 2);
  const white = silhouette(fx, w, h, '#fff');
  for (let a = 0; a < 24; a++) ctx.drawImage(white, edge + Math.cos((a / 24) * Math.PI * 2) * edge, edge + Math.sin((a / 24) * Math.PI * 2) * edge);
  ctx.drawImage(fx, edge, edge);
  return URL.createObjectURL(await toBlob(c));
}
