import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { haptic, sfx } from '../lib/feedback';
import { dateStamp, yearsAgo } from '../lib/format';
import { Icon } from './Icon';
import s from './rewind.module.css';

export interface DialItem {
  id: string;
  src: string;
  takenAt: number;
  label?: string;
}

/**
 * Retro's Rewind dial: "iPod-inspired", it "clicks" with "a subtle vibration as each new memory
 * loads"; you "spin the dial to move forward or backward in time, watching the photos … flip by",
 * "pause on specific moments, or jump to random memories" (research/02 §B4.6). Press and hold the
 * photo to see it uncropped (spec §A1).
 */
export function RewindDial({ items, picked, onTogglePick, onShare, onHide, compact }: { items: DialItem[]; picked?: Set<string>; onTogglePick?: (id: string) => void; onShare?: (item: DialItem) => void; onHide?: (item: DialItem) => void; compact?: boolean }) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [uncrop, setUncrop] = useState(false);
  const wheel = useRef<HTMLDivElement>(null);
  const last = useRef<number | null>(null);
  const acc = useRef(0);
  const item = items[Math.min(i, items.length - 1)];

  const step = (d: number) => {
    setDir(d);
    setI((x) => {
      const n = Math.max(0, Math.min(items.length - 1, x + d));
      if (n !== x) {
        sfx.click();
        haptic('light');
      }
      return n;
    });
  };

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setDir(1);
      setI((x) => (x + 1) % items.length);
      sfx.click();
    }, 900);
    return () => clearInterval(id);
  }, [playing, items.length]);

  const angle = (e: React.PointerEvent) => {
    const r = wheel.current!.getBoundingClientRect();
    return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
  };

  if (!item) return null;
  const ago = yearsAgo(item.takenAt);
  const isPicked = picked?.has(item.id);

  return (
    <div className={`${s.dial} ${compact ? s.compact : ''}`}>
      <div className={s.photoArea} onPointerDown={() => setUncrop(true)} onPointerUp={() => setUncrop(false)} onPointerLeave={() => setUncrop(false)}>
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={item.id}
            className={s.photo}
            custom={dir}
            initial={{ rotateX: dir > 0 ? -70 : 70, opacity: 0, y: dir > 0 ? -30 : 30 }}
            animate={{ rotateX: 0, opacity: 1, y: 0 }}
            exit={{ rotateX: dir > 0 ? 70 : -70, opacity: 0, y: dir > 0 ? 30 : -30 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <img src={item.src} alt="" style={{ objectFit: uncrop ? 'contain' : 'cover' }} />
            <span className={s.stamp}>{dateStamp(item.takenAt)}</span>
            {isPicked && (
              <span className={s.picked}>
                <Icon name="check" size={18} strokeWidth={3} />
              </span>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className={s.when}>
        <span className={s.whenBig}>{ago >= 1 ? `${ago} ${ago === 1 ? 'year' : 'years'} ago` : new Date(item.takenAt).toLocaleDateString([], { month: 'long', day: 'numeric' })}</span>
        <span className={s.whenSmall}>
          {new Date(item.takenAt).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} · {i + 1}/{items.length}
        </span>
      </div>
      <div
        ref={wheel}
        className={s.wheel}
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          last.current = angle(e);
          acc.current = 0;
        }}
        onPointerMove={(e) => {
          if (last.current === null) return;
          const a = angle(e);
          let d = a - last.current;
          if (d > 180) d -= 360;
          if (d < -180) d += 360;
          last.current = a;
          acc.current += d;
          while (acc.current > 26) {
            acc.current -= 26;
            step(1);
          }
          while (acc.current < -26) {
            acc.current += 26;
            step(-1);
          }
        }}
        onPointerUp={() => {
          last.current = null;
        }}
      >
        <button className={`${s.label} ${s.top}`} onClick={() => (onTogglePick ? onTogglePick(item.id) : onShare?.(item))}>
          {onTogglePick ? (isPicked ? 'PICKED' : 'PICK') : 'SHARE'}
        </button>
        <button className={`${s.label} ${s.left}`} onClick={() => step(-1)} aria-label="Newer">
          <Icon name="rewind" size={16} style={{ transform: 'scaleX(-1)' }} />
        </button>
        <button className={`${s.label} ${s.right}`} onClick={() => step(1)} aria-label="Older">
          <Icon name="rewind" size={16} />
        </button>
        <button className={`${s.label} ${s.bottom}`} onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pause' : 'Play'}>
          <Icon name={playing ? 'pause' : 'play'} size={15} />
        </button>
        <button
          className={s.center}
          onClick={() => {
            const n = Math.floor(Math.random() * items.length);
            setDir(n > i ? 1 : -1);
            setI(n);
            sfx.click();
            haptic('medium');
          }}
          aria-label="Jump to a random memory"
        >
          <Icon name="shuffle" size={20} />
        </button>
      </div>
      {onHide && !compact && (
        <button className={s.hide} onClick={() => onHide(item)}>
          <Icon name="eyeOff" size={16} /> Hide this one
        </button>
      )}
    </div>
  );
}
