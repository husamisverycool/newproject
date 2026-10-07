import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Camera for the Locket-style viewfinder (square, the shape of the Home Screen widget) with the
 * BeReal extras: a dual (back + front) capture and a BTS clip of the ~2 seconds before the shutter.
 */

export type Facing = 'environment' | 'user';

export interface CameraApi {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  ready: boolean;
  error: string | null;
  facing: Facing;
  flip: () => Promise<void>;
  hasTorch: boolean;
  setTorch: (on: boolean) => Promise<void>;
  /** Square JPEG of the current frame. */
  capture: (size?: number) => Promise<Blob>;
  /** The BTS ring buffer: frames from the last ~2 seconds. */
  takeLive: () => Blob[];
  /** Capture with the other camera, then come back (BeReal dual). */
  captureOther: () => Promise<Blob | null>;
  restart: () => void;
}

const LIVE_FRAMES = 14;
const LIVE_EVERY = 140;

export function useCamera(enabled: boolean, opts: { bts: boolean }): CameraApi {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facing, setFacing] = useState<Facing>('environment');
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasTorch, setHasTorch] = useState(false);
  const [nonce, setNonce] = useState(0);
  const ring = useRef<Blob[]>([]);
  const facingRef = useRef(facing);
  facingRef.current = facing;

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setReady(false);
  }, []);

  const start = useCallback(async (f: Facing) => {
    stop();
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('unsupported');
      return null;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: f, width: { ideal: 1920 }, height: { ideal: 1920 } },
        audio: false,
      });
      streamRef.current = stream;
      const v = videoRef.current;
      if (v) {
        v.srcObject = stream;
        await v.play().catch(() => undefined);
      }
      const track = stream.getVideoTracks()[0];
      const caps = (track.getCapabilities?.() ?? {}) as MediaTrackCapabilities & { torch?: boolean };
      setHasTorch(Boolean(caps.torch));
      setError(null);
      setReady(true);
      return stream;
    } catch (e) {
      setError((e as Error).name === 'NotAllowedError' ? 'denied' : 'unavailable');
      setReady(false);
      return null;
    }
  }, [stop]);

  useEffect(() => {
    if (!enabled) {
      stop();
      return;
    }
    void start(facingRef.current);
    return stop;
  }, [enabled, start, stop, nonce]);

  // BTS ring buffer.
  useEffect(() => {
    if (!enabled || !opts.bts || !ready) return;
    const c = document.createElement('canvas');
    c.width = c.height = 360;
    const ctx = c.getContext('2d')!;
    const id = setInterval(() => {
      const v = videoRef.current;
      if (!v || !v.videoWidth) return;
      drawSquare(ctx, v, 360, facingRef.current === 'user');
      c.toBlob((b) => {
        if (!b) return;
        ring.current.push(b);
        if (ring.current.length > LIVE_FRAMES) ring.current.shift();
      }, 'image/jpeg', 0.72);
    }, LIVE_EVERY);
    return () => clearInterval(id);
  }, [enabled, opts.bts, ready]);

  const capture = useCallback(async (size = 1440) => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) throw new Error('camera not ready');
    const c = document.createElement('canvas');
    c.width = c.height = Math.min(size, Math.min(v.videoWidth, v.videoHeight));
    drawSquare(c.getContext('2d')!, v, c.width, facingRef.current === 'user');
    return new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('encode'))), 'image/jpeg', 0.92));
  }, []);

  const flip = useCallback(async () => {
    const next: Facing = facingRef.current === 'environment' ? 'user' : 'environment';
    setFacing(next);
    facingRef.current = next;
    ring.current = [];
    await start(next);
  }, [start]);

  const captureOther = useCallback(async () => {
    const original = facingRef.current;
    const other: Facing = original === 'environment' ? 'user' : 'environment';
    facingRef.current = other;
    setFacing(other);
    const s = await start(other);
    if (!s) {
      facingRef.current = original;
      setFacing(original);
      await start(original);
      return null;
    }
    await new Promise((r) => setTimeout(r, 450));
    const blob = await capture(720).catch(() => null);
    facingRef.current = original;
    setFacing(original);
    await start(original);
    return blob;
  }, [capture, start]);

  const setTorch = useCallback(async (on: boolean) => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    try {
      await track.applyConstraints({ advanced: [{ torch: on } as MediaTrackConstraintSet] });
    } catch {
      /* unsupported */
    }
  }, []);

  return {
    videoRef, ready, error, facing, flip, hasTorch, setTorch, capture,
    takeLive: () => {
      const frames = [...ring.current];
      ring.current = [];
      return frames;
    },
    captureOther,
    restart: () => setNonce((n) => n + 1),
  };
}

export function drawSquare(ctx: CanvasRenderingContext2D, src: HTMLVideoElement | HTMLImageElement | ImageBitmap, size: number, mirror: boolean) {
  const w = 'videoWidth' in src ? src.videoWidth : src.width;
  const h = 'videoHeight' in src ? src.videoHeight : src.height;
  const side = Math.min(w, h);
  ctx.save();
  if (mirror) {
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(src, (w - side) / 2, (h - side) / 2, side, side, 0, 0, size, size);
  ctx.restore();
}

/** Read the original capture time from a camera-roll file (EXIF DateTimeOriginal), else lastModified. */
export async function photoTakenAt(file: File): Promise<number> {
  try {
    const buf = new Uint8Array(await file.slice(0, 128 * 1024).arrayBuffer());
    const text = new TextDecoder('latin1').decode(buf);
    const m = text.match(/(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
    if (m) {
      const t = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]).getTime();
      if (t > 0 && t < Date.now() + 86_400_000) return t;
    }
  } catch {
    /* fall through */
  }
  return file.lastModified || Date.now();
}

export async function fileToSquareJpeg(file: Blob, size = 1440): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const c = document.createElement('canvas');
  c.width = c.height = Math.min(size, Math.min(bmp.width, bmp.height));
  drawSquare(c.getContext('2d')!, bmp, c.width, false);
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('encode'))), 'image/jpeg', 0.92));
}
