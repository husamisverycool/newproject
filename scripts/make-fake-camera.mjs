// Builds a Y4M clip from a seed photo for Chromium's fake camera (used by e2e screenshots).
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const [, , src, out, frames = '45'] = process.argv;
const W = 720, H = 720;
const N = Number(frames);
const meta = await sharp(src).metadata();
const side = Math.min(meta.width, meta.height);
const fd = fs.openSync(out, 'w');
fs.writeSync(fd, `YUV4MPEG2 W${W} H${H} F30:1 Ip A1:1 C420jpeg\n`);
for (let i = 0; i < N; i++) {
  const t = i / N;
  const zoom = 1 + 0.05 * Math.sin(t * Math.PI * 2);
  const crop = Math.min(side, Math.round(side / zoom));
  const left = Math.min(meta.width - crop, Math.max(0, Math.round((meta.width - crop) / 2 + Math.sin(t * Math.PI * 2) * 6)));
  const top = Math.min(meta.height - crop, Math.max(0, Math.round((meta.height - crop) / 2)));
  const rgb = await sharp(src).extract({ left: Math.max(0, left), top: Math.max(0, top), width: crop, height: crop }).resize(W, H).removeAlpha().raw().toBuffer();
  const Y = Buffer.alloc(W * H), U = Buffer.alloc((W / 2) * (H / 2)), V = Buffer.alloc((W / 2) * (H / 2));
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const p = (y * W + x) * 3, r = rgb[p], g = rgb[p + 1], b = rgb[p + 2];
    Y[y * W + x] = Math.max(0, Math.min(255, 0.299 * r + 0.587 * g + 0.114 * b));
    if (y % 2 === 0 && x % 2 === 0) {
      const q = (y / 2) * (W / 2) + x / 2;
      U[q] = Math.max(0, Math.min(255, 128 - 0.168736 * r - 0.331264 * g + 0.5 * b));
      V[q] = Math.max(0, Math.min(255, 128 + 0.5 * r - 0.418688 * g - 0.081312 * b));
    }
  }
  fs.writeSync(fd, 'FRAME\n');
  fs.writeSync(fd, Y); fs.writeSync(fd, U); fs.writeSync(fd, V);
}
fs.closeSync(fd);
console.log('wrote', path.resolve(out));
