import { LIVE } from './static';
import type { FaceDetector, ImageSegmenter } from '@mediapipe/tasks-vision';

/**
 * On-device vision (MediaPipe): selfie segmentation for cut-out stickers (Yope "photos can be turned
 * into cut-out stickers") and face detection for Me Meme framing. Nothing leaves the device for this.
 */

/** The in-Claude build ships the runtime and models next to the page, so paths are page-relative. */
const at = (p: string) => (LIVE ? new URL(p.slice(1), document.baseURI).href : p);

/**
 * A model's base options. Artifacts serve only web media types, so the in-Claude build ships each
 * model as base64 text (scripts/build-live.mjs) and hands MediaPipe the bytes.
 */
async function model(path: string): Promise<{ modelAssetPath: string } | { modelAssetBuffer: Uint8Array }> {
  if (!LIVE) return { modelAssetPath: path };
  const text = await (await fetch(at(`${path}.b64.txt`))).text();
  const bin = atob(text.trim());
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { modelAssetBuffer: bytes };
}

let segmenter: Promise<ImageSegmenter> | null = null;
let faces: Promise<FaceDetector> | null = null;

async function vision() {
  const mp = await import('@mediapipe/tasks-vision');
  const files = await mp.FilesetResolver.forVisionTasks(at('/wasm'));
  return { mp, files };
}

function getSegmenter() {
  segmenter ??= (async () => {
    const { mp, files } = await vision();
    const asset = await model('/models/selfie_segmenter.tflite');
    const make = (delegate: 'GPU' | 'CPU') =>
      mp.ImageSegmenter.createFromOptions(files, {
        baseOptions: { ...asset, delegate },
        runningMode: 'IMAGE',
        outputConfidenceMasks: true,
        outputCategoryMask: false,
      });
    return make('GPU').catch(() => make('CPU'));
  })();
  return segmenter;
}

function getFaces() {
  faces ??= (async () => {
    const { mp, files } = await vision();
    const asset = await model('/models/blaze_face_short_range.tflite');
    const make = (delegate: 'GPU' | 'CPU') =>
      mp.FaceDetector.createFromOptions(files, { baseOptions: { ...asset, delegate }, runningMode: 'IMAGE', minDetectionConfidence: 0.5 });
    return make('GPU').catch(() => make('CPU'));
  })();
  return faces;
}

export async function loadImage(src: Blob | string): Promise<HTMLImageElement> {
  const url = typeof src === 'string' ? src : URL.createObjectURL(src);
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = url;
  await img.decode();
  return img;
}

/**
 * Cut the person out of a photo. Returns a tightly-cropped transparent PNG, or null when no person
 * covers enough of the frame (stickers of things fall back to a rounded die-cut on the server).
 */
export async function cutout(src: Blob | string): Promise<{ png: Blob; coverage: number } | null> {
  const img = await loadImage(src);
  const seg = await getSegmenter();
  const result = seg.segment(img);
  const mask = result.confidenceMasks?.[0];
  if (!mask) return null;
  const w = mask.width;
  const h = mask.height;
  const data = mask.getAsFloat32Array();
  let on = 0;
  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[y * w + x] > 0.5) {
        on++;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  const coverage = on / (w * h);
  result.close();
  if (coverage < 0.03) return null;
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  const px = ctx.getImageData(0, 0, c.width, c.height);
  const sx = w / c.width;
  const sy = h / c.height;
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      const m = data[Math.min(h - 1, Math.floor(y * sy)) * w + Math.min(w - 1, Math.floor(x * sx))];
      px.data[(y * c.width + x) * 4 + 3] = Math.round(Math.max(0, Math.min(1, (m - 0.3) / 0.4)) * 255);
    }
  }
  ctx.putImageData(px, 0, 0);
  const pad = 0.04;
  const bx = Math.max(0, Math.floor((minX / w - pad) * c.width));
  const by = Math.max(0, Math.floor((minY / h - pad) * c.height));
  const bw = Math.min(c.width - bx, Math.ceil(((maxX - minX) / w + pad * 2) * c.width));
  const bh = Math.min(c.height - by, Math.ceil(((maxY - minY) / h + pad * 2) * c.height));
  const out = document.createElement('canvas');
  out.width = bw;
  out.height = bh;
  out.getContext('2d')!.drawImage(c, bx, by, bw, bh, 0, 0, bw, bh);
  const png = await new Promise<Blob>((res, rej) => out.toBlob((b) => (b ? res(b) : rej(new Error('encode'))), 'image/png'));
  return { png, coverage };
}

export interface FaceBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export async function detectFace(src: Blob | string): Promise<{ box: FaceBox; width: number; height: number } | null> {
  const img = await loadImage(src);
  const det = await getFaces();
  const r = det.detect(img);
  const d = r.detections.sort((a, b) => (b.boundingBox?.width ?? 0) - (a.boundingBox?.width ?? 0))[0];
  if (!d?.boundingBox) return null;
  const b = d.boundingBox;
  return { box: { x: b.originX, y: b.originY, w: b.width, h: b.height }, width: img.naturalWidth, height: img.naturalHeight };
}

/** Crop a face (with headroom) to a PNG for meme swaps and RealMoji-style reactions. */
export async function faceCrop(src: Blob | string): Promise<Blob | null> {
  const f = await detectFace(src);
  if (!f) return null;
  const img = await loadImage(src);
  const pad = 0.35;
  const x = Math.max(0, f.box.x - f.box.w * pad);
  const y = Math.max(0, f.box.y - f.box.h * pad * 1.4);
  const w = Math.min(img.naturalWidth - x, f.box.w * (1 + pad * 2));
  const h = Math.min(img.naturalHeight - y, f.box.h * (1 + pad * 2.4));
  const c = document.createElement('canvas');
  c.width = Math.round(w);
  c.height = Math.round(h);
  c.getContext('2d')!.drawImage(img, x, y, w, h, 0, 0, c.width, c.height);
  return new Promise((res) => c.toBlob((b) => res(b), 'image/png'));
}

/**
 * The person mask over the whole frame (for the Create tools' 3D/parallax effects): confidence 0–1 per
 * mask pixel, at the segmenter's output size. Null when no one covers enough of the frame.
 */
export async function personMask(src: Blob | string | HTMLImageElement): Promise<{ data: Float32Array; width: number; height: number; coverage: number } | null> {
  const img = src instanceof HTMLImageElement ? src : await loadImage(src);
  const seg = await getSegmenter();
  const result = seg.segment(img);
  const mask = result.confidenceMasks?.[0];
  if (!mask) {
    result.close();
    return null;
  }
  const data = new Float32Array(mask.getAsFloat32Array());
  const width = mask.width;
  const height = mask.height;
  result.close();
  let on = 0;
  for (let i = 0; i < data.length; i++) if (data[i] > 0.5) on++;
  const coverage = on / data.length;
  return coverage < 0.03 ? null : { data, width, height, coverage };
}

/** The largest face in the current video frame, in video pixels (the camera's mascot lens). */
export async function faceInVideo(video: HTMLVideoElement): Promise<FaceBox | null> {
  if (!video.videoWidth) return null;
  const det = await getFaces();
  const r = det.detect(video);
  const d = r.detections.sort((a, b) => (b.boundingBox?.width ?? 0) - (a.boundingBox?.width ?? 0))[0];
  return d?.boundingBox ? { x: d.boundingBox.originX, y: d.boundingBox.originY, w: d.boundingBox.width, h: d.boundingBox.height } : null;
}
