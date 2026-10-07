import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ios, retro } from '@app/shared';
import { haptic, sfx } from '../lib/feedback';
import { isoWeek } from '../lib/format';
import { Icon } from './Icon';
import { Menu } from './ios';
import s from './rewind.module.css';

export interface DialItem {
  id: string;
  src: string;
  takenAt: number;
}

const TICKS = 40;

/**
 * Retro's Rewind, laid out from research/inspo/store/retro-05-rewind [I]:
 * - the photo fills the screen;
 * - the big serif date "July 5, 2021" sits at the top left with "On this week" under it;
 * - "•••" in a translucent circle at the top right;
 * - at the bottom centre, a ring of radial tick marks with one longer, brighter tick (the position)
 *   and ❙❙ in the middle.
 * Behaviour [V] (Fast Company / TechCrunch): "spin the dial to move forward or backward in time,
 * watching the photos … flip by", "a subtle vibration as each new memory loads", "pause on specific
 * moments, or jump to random memories", "share or send the photos to a friend, or hide those they'd
 * rather not see". Tap the photo to pick it (onboarding's starter wall, spec §A1); hold it to see it
 * uncropped.
 */
export function RewindDial({ items, picked, onSelect, onSend, onHide, extraActions = [] }: {
  items: DialItem[];
  picked?: Set<string>;
  onSelect?: (item: DialItem) => void;
  onSend?: (item: DialItem) => void;
  onHide?: (item: DialItem) => void;
  extraActions?: { label: string; icon: string; onClick: () => void }[];
}) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [playing, setPlaying] = useState(true);
  const [uncrop, setUncrop] = useState(false);
  const [menu, setMenu] = useState(false);
  const [hand, setHand] = useState(0);
  const ring = useRef<HTMLDivElement>(null);
  const last = useRef<number | null>(null);
  const acc = useRef(0);
  const hold = useRef<number | null>(null);
  const held = useRef(false);
  const item = items[Math.min(i, items.length - 1)];

  const step = (d: number) => {
    setDir(d);
    setHand((h) => (h + d + TICKS) % TICKS);
    setI((x) => {
      const n = (x + d + items.length) % Math.max(1, items.length);
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
    if (!playing || items.length < 2) return;
    const t = setInterval(() => step(1), 2200);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, items.length]);

  const angle = (e: React.PointerEvent) => {
    const r = ring.current!.getBoundingClientRect();
    return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
  };

  if (!item) return null;
  const sameWeek = isoWeek(item.takenAt) === isoWeek(Date.now()) && new Date(item.takenAt).getFullYear() < new Date().getFullYear();

  return (
    <div className={s.root}>
      <div
        className={s.photoArea}
        onPointerDown={() => {
          held.current = false;
          hold.current = window.setTimeout(() => {
            held.current = true;
            setUncrop(true);
          }, 320);
        }}
        onPointerUp={() => {
          if (hold.current) clearTimeout(hold.current);
          setUncrop(false);
          if (!held.current && onSelect) {
            haptic('medium');
            onSelect(item);
          }
        }}
        onPointerLeave={() => {
          if (hold.current) clearTimeout(hold.current);
          setUncrop(false);
        }}
      >
        <AnimatePresence initial={false} custom={dir}>
          <motion.img
            key={item.id}
            src={item.src}
            alt=""
            className={s.photo}
            style={{ objectFit: uncrop ? 'contain' : 'cover' }}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            draggable={false}
          />
        </AnimatePresence>
        {picked?.has(item.id) && (
          <span className={s.picked}>
            <Icon name="check" size={18} strokeWidth={3} />
          </span>
        )}
      </div>

      <div className={s.head}>
        <div>
          <h1 className={s.date}>{retro.longDate(item.takenAt)}</h1>
          {sameWeek && <p className={s.sub}>{retro.onThisWeek}</p>}
        </div>
        <button className={s.more} onClick={() => setMenu(true)} aria-label={ios.more}>
          <Icon name="more" size={20} strokeWidth={3.2} />
        </button>
      </div>

      <div
        ref={ring}
        className={s.dial}
        onPointerDown={(e) => {
          (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
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
          const per = 360 / TICKS;
          while (acc.current > per) {
            acc.current -= per;
            setPlaying(false);
            step(1);
          }
          while (acc.current < -per) {
            acc.current += per;
            setPlaying(false);
            step(-1);
          }
        }}
        onPointerUp={() => {
          last.current = null;
        }}
      >
        <svg viewBox="0 0 120 120" className={s.ticks} aria-hidden>
          {Array.from({ length: TICKS }, (_, k) => {
            const on = k === hand;
            const a = (k / TICKS) * Math.PI * 2 - Math.PI / 2;
            const r1 = on ? 38 : 46;
            const r2 = 56;
            return (
              <line
                key={k}
                x1={60 + Math.cos(a) * r1}
                y1={60 + Math.sin(a) * r1}
                x2={60 + Math.cos(a) * r2}
                y2={60 + Math.sin(a) * r2}
                stroke="#fff"
                strokeOpacity={on ? 1 : 0.7}
                strokeWidth={on ? 3 : 1.6}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
        <button
          className={s.play}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => { haptic('light'); setPlaying(!playing); }}
          aria-label={retro.rewindPause}
        >
          <Icon name={playing ? 'pause' : 'play'} size={30} strokeWidth={4} filled={!playing} />
        </button>
      </div>

      <Menu
        open={menu}
        onClose={() => setMenu(false)}
        actions={[
          { label: retro.rewindRandom, icon: 'shuffle', onClick: random },
          ...(onSend ? [{ label: retro.rewindSend, icon: 'paperplane', onClick: () => onSend(item) }] : []),
          ...(onHide ? [{ label: retro.rewindHide, icon: 'eyeOff', onClick: () => onHide(item) }] : []),
          ...extraActions,
        ]}
      />
    </div>
  );
}
