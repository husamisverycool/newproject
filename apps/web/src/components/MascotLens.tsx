import { useEffect, useState, type RefObject } from 'react';
import { faceInVideo } from '../lib/vision';
import { Mascot } from './Mascot';

/**
 * The group-mascot lens (spec §D: "a group-mascot lens only", adapted from Snapchat Lenses [V]). The face
 * is tracked on the device (MediaPipe) and the group's mascot sits on top of the head, at the face's
 * scale, following it; with no face in view it waits in the bottom corner. On capture the mascot is
 * drawn into the photo at the same place. Snapchat's lens placement rules are UNKNOWN; the head
 * position follows Bitmoji-style lenses [B-med].
 */

export interface LensBox {
  /** in fractions of the viewfinder square */
  x: number;
  y: number;
  size: number;
  face: boolean;
}

const RESTING: LensBox = { x: 0.7, y: 0.66, size: 0.28, face: false };

/** Track the largest face in the viewfinder and place the mascot over it. */
export function useMascotLens(video: RefObject<HTMLVideoElement | null>, active: boolean, mirrored: boolean) {
  const [box, setBox] = useState<LensBox>(RESTING);
  useEffect(() => {
    if (!active) return;
    let stop = false;
    let timer = 0;
    const tick = async () => {
      const v = video.current;
      if (stop || !v) return;
      const f = await faceInVideo(v).catch(() => null);
      if (stop) return;
      if (f && v.videoWidth) {
        const side = Math.min(v.videoWidth, v.videoHeight);
        const ox = (v.videoWidth - side) / 2;
        const oy = (v.videoHeight - side) / 2;
        const size = Math.min(0.7, (f.w / side) * 1.15);
        let cx = (f.x + f.w / 2 - ox) / side;
        if (mirrored) cx = 1 - cx;
        const top = (f.y - oy) / side;
        setBox({ x: cx - size / 2, y: Math.max(-size * 0.2, top - size * 0.88), size, face: true });
      } else setBox(RESTING);
      timer = window.setTimeout(() => void tick(), 120);
    };
    void tick();
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, [active, video, mirrored]);
  return box;
}

export function LensOverlay({ box, species, level, outfit }: { box: LensBox; species: string; level: number; outfit: string[] }) {
  return (
    <span
      data-lens
      style={{
        position: 'absolute',
        left: `${box.x * 100}%`,
        top: `${box.y * 100}%`,
        width: `${box.size * 100}%`,
        aspectRatio: '1',
        pointerEvents: 'none',
        transition: 'left 120ms linear, top 120ms linear, width 120ms linear',
        zIndex: 3,
      }}
    >
      <Mascot species={species} level={level} outfit={outfit} size={200} style={{ width: '100%', height: '100%' }} />
    </span>
  );
}

/** Draw the lens's mascot into the captured square photo where it showed on the viewfinder. */
export async function applyLens(photo: Blob, box: LensBox, overlay: HTMLElement | null): Promise<Blob> {
  const svg = overlay?.querySelector('[data-lens] svg');
  if (!svg) return photo;
  const bmp = await createImageBitmap(photo);
  const c = document.createElement('canvas');
  c.width = bmp.width;
  c.height = bmp.height;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(bmp, 0, 0);
  const markup = new XMLSerializer().serializeToString(svg);
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
  await img.decode();
  const S = c.width;
  ctx.drawImage(img, box.x * S, box.y * S, box.size * S, box.size * S);
  return new Promise((res) => c.toBlob((b) => res(b ?? photo), 'image/jpeg', 0.92));
}
