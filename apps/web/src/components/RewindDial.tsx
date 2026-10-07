import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ios, retro, spec } from '@app/shared';
import { haptic, sfx } from '../lib/feedback';
import { Icon } from './Icon';
import { Menu } from './ios';
import s from './rewind.module.css';

export interface DialItem {
  id: string;
  src: string;
  takenAt: number;
}

/**
 * Retro's Rewind dial [V] (Fast Company / TechCrunch / App Store story): an "iPod-inspired dial" that
 * "clicks back into your past", "a subtle vibration as each new memory loads", "spin the dial to move
 * forward or backward in time, watching the photos … flip by"; "pause on specific moments, or jump to
 * random memories"; "share or send the photos to a friend, or hide those they'd rather not see".
 * Drawn as the iPod click wheel [B-high]: MENU top, ⏮ ⏭ sides, ⏯ bottom, centre button.
 * Press and hold the photo to see it uncropped (spec §A1).
 */
export function RewindDial({ items, picked, onSelect, onSend, onHide }: {
  items: DialItem[];
  /** Selected ids (e.g. photos chosen for the starter wall). */
  picked?: Set<string>;
  /** Centre button. */
  onSelect?: (item: DialItem) => void;
  onSend?: (item: DialItem) => void;
  onHide?: (item: DialItem) => void;
}) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [uncrop, setUncrop] = useState(false);
  const [menu, setMenu] = useState(false);
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
  const random = () => {
    const n = Math.floor(Math.random() * items.length);
    setDir(n > i ? 1 : -1);
    setI(n);
    sfx.click();
    haptic('medium');
  };

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setDir(1);
      setI((x) => (x + 1) % items.length);
      sfx.click();
      haptic('light');
    }, 900);
    return () => clearInterval(t);
  }, [playing, items.length]);

  const angle = (e: React.PointerEvent) => {
    const r = wheel.current!.getBoundingClientRect();
    return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
  };

  if (!item) return null;
  const years = new Date().getFullYear() - new Date(item.takenAt).getFullYear();

  return (
    <div className={s.dial}>
      <div className={s.when}>{years >= 1 ? spec.thisWeekYearsAgo(years) : ios.longDate(item.takenAt)}</div>
      <div className={s.photoArea} onPointerDown={() => setUncrop(true)} onPointerUp={() => setUncrop(false)} onPointerLeave={() => setUncrop(false)}>
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={item.id}
            className={s.photo}
            initial={{ rotateX: dir > 0 ? -80 : 80, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: dir > 0 ? 80 : -80, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <img src={item.src} alt="" style={{ objectFit: uncrop ? 'contain' : 'cover' }} />
            {picked?.has(item.id) && (
              <span className={s.picked}>
                <Icon name="check" size={16} strokeWidth={3} />
              </span>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className={s.date}>{ios.longDate(item.takenAt)}</div>
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
          while (acc.current > 24) {
            acc.current -= 24;
            step(1);
          }
          while (acc.current < -24) {
            acc.current += 24;
            step(-1);
          }
        }}
        onPointerUp={() => {
          last.current = null;
        }}
      >
        <button className={`${s.label} ${s.top}`} onClick={() => setMenu(true)}>{ios.ipodMenu}</button>
        <button className={`${s.label} ${s.left}`} onClick={() => step(-1)} aria-label={retro.rewind}>
          <Icon name="skipBack" size={18} />
        </button>
        <button className={`${s.label} ${s.right}`} onClick={() => step(1)} aria-label={retro.rewind}>
          <Icon name="skipForward" size={18} />
        </button>
        <button className={`${s.label} ${s.bottom}`} onClick={() => setPlaying(!playing)} aria-label={retro.rewindPause}>
          <Icon name="playPause" size={18} />
        </button>
        <button className={s.center} onClick={() => { haptic('medium'); onSelect?.(item); }} aria-label={ios.select} />
      </div>
      <Menu
        open={menu}
        onClose={() => setMenu(false)}
        actions={[
          { label: retro.rewindRandom, icon: 'shuffle', onClick: random },
          ...(onSend ? [{ label: retro.rewindSend, icon: 'send', onClick: () => onSend(item) }] : []),
          ...(onHide ? [{ label: retro.rewindHide, icon: 'eyeOff', onClick: () => onHide(item) }] : []),
        ]}
      />
    </div>
  );
}
