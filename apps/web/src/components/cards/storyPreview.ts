import { telegram } from '@app/shared';
import { clamp01, ease, loadPicture, posterOf, recordVideo, drawWatermark, type Picture } from '../../lib/render';
import type { Collectible } from '../../lib/types';
import { cardName } from './TcgCard';

/**
 * Telegram's collectible "Share › Post to Story": "an elegant animated preview to show off your rare
 * artwork and lucky numbers" [V] (telegram.org/blog/wear-gifts-blockchain-and-more). Ours is a 9:16
 * clip of the numbered card on its backdrop: the backdrop's center-to-edge gradient, its symbol in
 * rings around the model (the same layout as the collectible sheet's Rings), the card turning with a
 * sheen, the collectible title and issue line, and the moving watermark (spec §Q). Recorded on the
 * device; where the browser cannot record video, the first frame is shared as a still.
 */
const W = 1080;
const H = 1920;
const MS = 4200;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function cover(ctx: CanvasRenderingContext2D, pic: Picture, x: number, y: number, w: number, h: number) {
  const pw = pic instanceof HTMLImageElement ? pic.naturalWidth : pic.width;
  const ph = pic instanceof HTMLImageElement ? pic.naturalHeight : pic.height;
  const s = Math.max(w / pw, h / ph);
  ctx.drawImage(pic, x + (w - pw * s) / 2, y + (h - ph * s) / 2, pw * s, ph * s);
}

function frame(ctx: CanvasRenderingContext2D, data: Collectible, photo: Picture | null, ms: number, mascotColor: string) {
  const t = data.traits!;
  const p = ms / MS;
  // Backdrop: center → edge.
  const g = ctx.createRadialGradient(W / 2, H * 0.42, 40, W / 2, H * 0.42, H * 0.62);
  g.addColorStop(0, t.backdrop.from);
  g.addColorStop(1, t.backdrop.to);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // Symbol rings, turning slowly.
  ctx.save();
  ctx.globalAlpha = 0.28;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  [
    [300, 8, 48],
    [430, 12, 42],
    [560, 16, 38],
  ].forEach(([r, n, size], ring) => {
    ctx.font = `${size}px -apple-system, "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + ring * 0.35 + p * 0.5 * (ring % 2 ? -1 : 1);
      ctx.fillText(t.symbol.name, W / 2 + Math.cos(a) * r, H * 0.42 + Math.sin(a) * r * 0.86);
    }
  });
  ctx.restore();
  // The card turns (a y-axis swing drawn as a horizontal scale) and rises in.
  const cw = 600;
  const ch = 838;
  const turn = Math.cos(Math.sin(p * Math.PI * 2) * 0.42);
  const rise = 1 - ease(clamp01(ms / 700));
  ctx.save();
  ctx.translate(W / 2, H * 0.42 + rise * 120);
  ctx.scale(turn, 1);
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 24;
  roundRect(ctx, -cw / 2, -ch / 2, cw, ch, 36);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.save();
  roundRect(ctx, -cw / 2 + 22, -ch / 2 + 22, cw - 44, ch - 44, 22);
  ctx.clip();
  if (photo) cover(ctx, photo, -cw / 2 + 22, -ch / 2 + 22, cw - 44, ch - 44);
  else {
    ctx.fillStyle = t.backdrop.to;
    ctx.fillRect(-cw / 2, -ch / 2, cw, ch);
  }
  // Sheen sweeping across.
  const sx = -cw + p * cw * 3;
  const sheen = ctx.createLinearGradient(sx - 180, -ch / 2, sx + 180, ch / 2);
  sheen.addColorStop(0, 'rgba(255,255,255,0)');
  sheen.addColorStop(0.5, 'rgba(255,255,255,0.42)');
  sheen.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(-cw / 2, -ch / 2, cw, ch);
  ctx.restore();
  ctx.restore();
  // Title and issue line.
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 12;
  ctx.font = '700 54px -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif';
  ctx.fillText(telegram.collectibleTitle(cardName(data.card.post), data.card.serial ?? 0), W / 2, H * 0.42 + ch / 2 + 130, W - 120);
  ctx.globalAlpha = 0.85;
  ctx.font = '500 38px -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif';
  ctx.fillText(telegram.issued(data.quantity.issued, data.quantity.of), W / 2, H * 0.42 + ch / 2 + 196, W - 120);
  ctx.restore();
  drawWatermark(ctx, W, H, p, mascotColor);
}

export async function collectibleStory(data: Collectible, mascotColor: string, onProgress?: (p: number) => void): Promise<{ blob: Blob; ext: string }> {
  const src = data.card.post?.media.main;
  const photo = src ? await loadPicture(src).catch(() => null) : null;
  const video = await recordVideo({ width: W, height: H, durationMs: MS, draw: (ctx, ms) => frame(ctx, data, photo, ms, mascotColor), onProgress });
  if (video) return { blob: video.blob, ext: video.type.includes('mp4') ? 'mp4' : 'webm' };
  return { blob: await posterOf((ctx) => frame(ctx, data, photo, MS * 0.25, mascotColor), W, H), ext: 'jpg' };
}
