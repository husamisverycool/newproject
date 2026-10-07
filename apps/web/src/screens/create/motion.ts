import { gphotos, photos27 } from '@app/shared';
import { api } from '../../lib/api';
import { type AudioCue, type Layers, depthLayers, drawFill, drawWatermark, ease, loadPicture, posterOf, recordVideo, renderFrames, rng, videoType, type Picture } from '../../lib/render';
import type { CreationKind } from '@app/shared';
import type { LikenessObject } from '../../lib/types';

/**
 * The Google Photos Create tools, rendered on the device (research/06 §1.2, 16 §1):
 * - Photo to video: "six-second video clips" [V-weak] with the two prompts "Subtle movement" and
 *   "I'm feeling lucky" [V-weak]. Google animates with Veo; here the motion is a camera move with
 *   parallax between the person and the background (no generated content), recorded as a video.
 * - Cinematic photos: "A 3D effect added to photos" / "vibrant, moving, 3D representations" [V-weak]:
 *   a looping orbit with the same person/background depth. Clip length UNKNOWN → 4 s.
 * - Animations: "A quick-moving GIF of selected photos" [V-weak]; frame time UNKNOWN → 250 ms a photo.
 * - Highlight videos and the recap slideshow (iOS 27 "Customize": transition, duration per photo, music,
 *   saved as a video [V-weak]) are recorded with MediaRecorder at 9:16 (spec §Q share-card format).
 */

/** Clip size: the Live-clip square; recorded videos use the larger square. */
export const CLIP_SIZE = 480;
export const VIDEO_SQUARE = 720;
export const CINEMATIC_SECONDS = 4;
export const ANIMATION_FRAME_MS = 250;
/** WebP stores an animation as one tall image (16383 px max), so a frame clip holds at most 34 frames at 480 px. */
export const MAX_CLIP_FRAMES = Math.floor(16383 / CLIP_SIZE);

export type PhotoMode = 'subtle' | 'lucky';
export type LuckyMove = 'pan' | 'pullBack' | 'orbit' | 'dolly';
const LUCKY: LuckyMove[] = ['pan', 'pullBack', 'orbit', 'dolly'];

/** Paints one moment (t from 0 to 1) of a clip into a square of side `size`. */
type Painter = (ctx: CanvasRenderingContext2D, t: number, size: number) => void;

export interface Clip {
  video?: { blob: Blob; type: string } | null;
  frames?: Blob[];
  delay?: number;
  poster: Blob;
}

/**
 * A clip of `seconds`: recorded as a video with the moving watermark where the browser can record
 * (Google's output is a video), else as a short frame clip (animated WebP; the server adds the moving
 * watermark on export).
 */
async function clip(paint: Painter, seconds: number, mascotColor: string, onProgress?: (p: number) => void): Promise<Clip> {
  const poster = await posterOf((ctx) => paint(ctx, 0, VIDEO_SQUARE), VIDEO_SQUARE, VIDEO_SQUARE);
  if (videoType()) {
    const ms = seconds * 1000;
    const video = await recordVideo({
      width: VIDEO_SQUARE, height: VIDEO_SQUARE, durationMs: ms, onProgress,
      draw: (ctx, at) => {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, VIDEO_SQUARE, VIDEO_SQUARE);
        paint(ctx, at / ms, VIDEO_SQUARE);
        drawWatermark(ctx, VIDEO_SQUARE, VIDEO_SQUARE, at / ms, mascotColor);
      },
    });
    if (video) return { video, poster };
  }
  const n = Math.min(MAX_CLIP_FRAMES, Math.round(seconds * 8));
  const frames = await renderFrames(CLIP_SIZE, n, (ctx, i) => paint(ctx, i / n, CLIP_SIZE), onProgress);
  return { frames, delay: (seconds * 1000) / n, poster };
}

function drawLayers(ctx: CanvasRenderingContext2D, L: Layers, size: number, back: Parameters<typeof drawFill>[4], front: Parameters<typeof drawFill>[4]) {
  drawFill(ctx, L.back, size, size, back);
  if (L.front) drawFill(ctx, L.front, size, size, front);
}

/** Photo to video: 6 s of motion over one photo. "Regenerate" changes the seed (another lucky move). */
export async function photoToVideo(url: string, mode: PhotoMode, seed: number, mascotColor: string, onProgress?: (p: number) => void) {
  const L = await depthLayers(url);
  const r = rng(seed);
  const move = LUCKY[Math.floor(r() * LUCKY.length)];
  const dir = r() < 0.5 ? -1 : 1;
  const paint: Painter = (ctx, t, size) => {
    const e = ease(t);
    if (mode === 'subtle') {
      // A slow push in: the background drifts less than the person, who breathes slightly.
      const sway = Math.sin(t * Math.PI * 2) * 0.006;
      drawLayers(ctx, L, size, { zoom: 1.05 + 0.07 * e, dx: sway * 0.5 }, { zoom: 1.0 + 0.05 * e + Math.sin(t * Math.PI) * 0.01, dx: sway, dy: -0.012 * e });
      return;
    }
    switch (move) {
      case 'pan':
        drawLayers(ctx, L, size, { zoom: 1.2, dx: dir * (-0.06 + 0.12 * e) }, { zoom: 1.14, dx: dir * (-0.1 + 0.2 * e) });
        break;
      case 'pullBack':
        drawLayers(ctx, L, size, { zoom: 1.32 - 0.3 * e }, { zoom: 1.28 - 0.28 * e, dy: 0.02 * e });
        break;
      case 'orbit':
        drawLayers(ctx, L, size, { zoom: 1.18, rot: dir * (-0.035 + 0.07 * e), dx: dir * 0.03 * Math.sin(t * Math.PI) }, { zoom: 1.12, rot: dir * (-0.02 + 0.04 * e), dx: -dir * 0.04 * Math.sin(t * Math.PI) });
        break;
      case 'dolly':
        // The "vertigo" move: the background pushes in while the person holds their size.
        drawLayers(ctx, L, size, { zoom: 1.0 + 0.28 * e }, { zoom: 1.16 - 0.14 * e });
        break;
    }
  };
  return { ...(await clip(paint, gphotos.photoToVideoSeconds, mascotColor, onProgress)), style: mode === 'subtle' ? 'subtle' : move };
}

/** Cinematic photo: a 4 s orbit that loops seamlessly, the person in front of the background. */
export async function cinematic(url: string, mascotColor: string, onProgress?: (p: number) => void) {
  const L = await depthLayers(url);
  const paint: Painter = (ctx, t, size) => {
    const a = t * Math.PI * 2;
    drawLayers(
      ctx, L, size,
      { zoom: 1.14 + 0.02 * Math.sin(a), dx: 0.022 * Math.cos(a), dy: 0.012 * Math.sin(a) },
      { zoom: 1.08 + 0.03 * Math.sin(a), dx: -0.03 * Math.cos(a), dy: -0.016 * Math.sin(a) },
    );
  };
  return { ...(await clip(paint, CINEMATIC_SECONDS, mascotColor, onProgress)), depth: Boolean(L.front) };
}

/** Animation: the chosen photos one after another, quickly, on a loop (at most one WebP's worth of frames). */
export async function animation(urls: string[], onProgress?: (p: number) => void, frameMs = ANIMATION_FRAME_MS) {
  const pics = await Promise.all(urls.slice(0, MAX_CLIP_FRAMES).map((u) => loadPicture(u)));
  const frames = await renderFrames(CLIP_SIZE, pics.length, (ctx, i) => drawFill(ctx, pics[i], CLIP_SIZE, CLIP_SIZE), onProgress);
  return { frames, delay: frameMs };
}

/* ───────────────────────── Slideshow / Highlight video ───────────────────────── */

export type Transition = 'kenBurns' | 'dissolve' | 'push';
export const TRANSITIONS: Transition[] = ['kenBurns', 'dissolve', 'push'];
export const transitionName = (t: Transition) => photos27.transitions[t];

export interface SlideshowOptions {
  transition: Transition;
  /** seconds per photo (1 Second Everyday's 1, 2 or 3 [V-weak]) */
  seconds: number;
  /** voice notes to play under the photos ("Choose Song" / "Off") */
  music: AudioCue[];
}

export const VIDEO_W = 720;
export const VIDEO_H = 1280;

/** Record the photos as a 9:16 video with the chosen transition, timing and sound. */
export async function slideshow(urls: string[], o: SlideshowOptions, mascotColor: string, onProgress?: (p: number) => void) {
  const pics: Picture[] = await Promise.all(urls.map((u) => loadPicture(u)));
  const per = o.seconds * 1000;
  const fade = Math.min(600, per * 0.3);
  const total = pics.length * per;
  const frame = (ctx: CanvasRenderingContext2D, ms: number) => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, VIDEO_W, VIDEO_H);
    const i = Math.min(pics.length - 1, Math.floor(ms / per));
    const local = (ms - i * per) / per;
    const nextIn = i < pics.length - 1 ? Math.max(0, (ms - (i * per + per - fade)) / fade) : 0;
    const kb = (k: number, u: number) => ({ zoom: 1.04 + 0.1 * (k % 2 ? 1 - u : u), dx: (k % 2 ? -1 : 1) * 0.02 * (u - 0.5) });
    if (o.transition === 'push' && nextIn > 0) {
      const e = ease(nextIn);
      drawFill(ctx, pics[i], VIDEO_W, VIDEO_H, { dx: -e });
      drawFill(ctx, pics[i + 1], VIDEO_W, VIDEO_H, { dx: 1 - e });
    } else {
      drawFill(ctx, pics[i], VIDEO_W, VIDEO_H, o.transition === 'kenBurns' ? kb(i, local) : {});
      if (nextIn > 0) drawFill(ctx, pics[i + 1], VIDEO_W, VIDEO_H, o.transition === 'kenBurns' ? { ...kb(i + 1, 0), alpha: nextIn } : { alpha: nextIn });
    }
    drawWatermark(ctx, VIDEO_W, VIDEO_H, total ? ms / total : 0, mascotColor);
  };
  const video = await recordVideo({ width: VIDEO_W, height: VIDEO_H, durationMs: total, draw: frame, audio: o.music, onProgress });
  const poster = await posterOf((ctx) => frame(ctx, 0), VIDEO_W, VIDEO_H);
  return video ? { ...video, poster } : null;
}

/** Saves a creation to the group through the objects API so every member sees it under Creations. */
export async function saveCreation(input: {
  groupId: string; kind: CreationKind; sourcePostIds: string[]; style?: string | null; meta?: Record<string, unknown>;
  frames?: Blob[]; delay?: number; video?: { blob: Blob; type: string } | null; poster?: Blob | null;
}) {
  const fd = new FormData();
  fd.set('groupId', input.groupId);
  fd.set('kind', input.kind);
  fd.set('sourcePostIds', input.sourcePostIds.join(','));
  if (input.style) fd.set('style', input.style);
  fd.set('meta', JSON.stringify(input.meta ?? {}));
  (input.frames ?? []).forEach((f, i) => fd.append('frames', f, `f${i}.jpg`));
  if (input.delay) fd.set('delay', String(Math.round(input.delay)));
  if (input.video) {
    fd.set('video', input.video.blob, `video.${input.video.type.includes('mp4') ? 'mp4' : 'webm'}`);
    fd.set('videoType', input.video.type);
  }
  const poster = input.poster ?? input.frames?.[0] ?? null;
  if (poster) fd.set('poster', poster, 'poster.jpg');
  return (await api.post<{ object: LikenessObject }>('/objects/creation', fd)).object;
}
