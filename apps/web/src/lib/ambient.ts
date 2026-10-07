import { useEffect, useState, type RefObject } from 'react';

/**
 * Locket's ambient background [I]: every Locket screen in the INSPO folder sits on a dark gradient
 * tinted by the photo on it (locket-06 warm brown #1D1914 → #2E1A09; locket-04 green #192717).
 * We average the photo down to one color; CSS mixes it into black (see .ambient in hig.css).
 */
const cache = new Map<string, string>();

function average(source: CanvasImageSource, w: number, h: number): string | null {
  const c = document.createElement('canvas');
  c.width = 12;
  c.height = 12;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  if (!ctx || !w || !h) return null;
  ctx.drawImage(source, 0, 0, 12, 12);
  try {
    const d = ctx.getImageData(0, 0, 12, 12).data;
    let r = 0;
    let g = 0;
    let b = 0;
    for (let i = 0; i < d.length; i += 4) {
      r += d[i];
      g += d[i + 1];
      b += d[i + 2];
    }
    const n = d.length / 4;
    return `rgb(${Math.round(r / n)}, ${Math.round(g / n)}, ${Math.round(b / n)})`;
  } catch {
    return null; // tainted canvas
  }
}

/** Ambient color of an image URL. */
export function useAmbient(src: string | null | undefined): string | null {
  const [color, setColor] = useState<string | null>(src ? cache.get(src) ?? null : null);
  useEffect(() => {
    if (!src) return setColor(null);
    const hit = cache.get(src);
    if (hit) return setColor(hit);
    let alive = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = average(img, img.naturalWidth, img.naturalHeight);
      if (c) cache.set(src, c);
      if (alive) setColor(c);
    };
    img.src = src;
    return () => {
      alive = false;
    };
  }, [src]);
  return color;
}

/** Ambient color of a live <video>, sampled every 1.5 s while `active`. */
export function useVideoAmbient(video: RefObject<HTMLVideoElement | null>, active: boolean): string | null {
  const [color, setColor] = useState<string | null>(null);
  useEffect(() => {
    if (!active) return;
    const tick = () => {
      const v = video.current;
      if (v && v.readyState >= 2) {
        const c = average(v, v.videoWidth, v.videoHeight);
        if (c) setColor(c);
      }
    };
    tick();
    const i = window.setInterval(tick, 1500);
    return () => clearInterval(i);
  }, [video, active]);
  return color;
}
