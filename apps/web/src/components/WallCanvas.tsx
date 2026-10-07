import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import type { WallItem, WallLayout } from '../lib/types';
import { Mascot } from './Mascot';
import { Wordmark } from './Brand';
import s from './wall.module.css';

/**
 * Yope wall: the week's photos "stitched into a continuously evolving photo collage" in a
 * "chaotic" arrangement, some as cut-out stickers (research/02 §A4.3; yope-03 [I]). With a `label`,
 * Yope's week-recap marks sit on it (frame yope-week-recap [I]): the range in bold capitals bottom
 * left, the wordmark bottom right. In edit mode a piece is dragged with one finger and pinched or
 * twisted with two (the standard iOS gestures [HIG]); the result is saved as a new version.
 */
export function WallCanvas({ layout, mascot, editable, onChange, selected, onSelect, animateIn, label }: {
  layout: WallLayout;
  mascot?: { species: string; level: number; outfit: string[] };
  editable?: boolean;
  onChange?: (l: WallLayout) => void;
  selected?: string | null;
  onSelect?: (id: string | null) => void;
  animateIn?: boolean;
  label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const light = layout.bg.toUpperCase() === '#FFC800' || layout.bg.toUpperCase() === '#E5E5E5';
  const items = [...layout.items].sort((a, b) => a.z - b.z);

  const update = (id: string, patch: Partial<WallItem>) => {
    if (!onChange) return;
    onChange({ ...layout, items: layout.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) });
  };

  return (
    <div ref={ref} className={s.wall} style={{ background: layout.bg, aspectRatio: `${layout.width} / ${layout.height}`, color: light ? '#000' : '#fff' }} onPointerDown={(e) => e.target === e.currentTarget && onSelect?.(null)}>
      {items.map((it, idx) => (
        <WallPiece key={it.id} it={it} idx={idx} editable={editable} selected={selected === it.id} onSelect={() => onSelect?.(it.id)} container={ref} onMove={(patch) => update(it.id, patch)} animateIn={animateIn} />
      ))}
      {layout.decos.map((d) =>
        d.kind === 'mascot' ? (
          mascot ? (
            <div key={d.id} className={s.deco} style={{ left: `${d.x * 100}%`, top: `${d.y * 100}%`, width: `${d.size * 100 * 1.2}%`, transform: `rotate(${d.rot}deg)` }}>
              <Mascot species={mascot.species} level={mascot.level} outfit={mascot.outfit} size={200} style={{ width: '100%', height: 'auto' }} />
            </div>
          ) : null
        ) : (
          <div key={d.id} className={s.deco} style={{ left: `${d.x * 100}%`, top: `${d.y * 100}%`, fontSize: `calc(${d.size} * var(--wall-w, 360px))`, transform: `rotate(${d.rot}deg)` }}>
            {d.value}
          </div>
        ),
      )}
      {label && (
        <div className={s.marks}>
          <b>{label}</b>
          <Wordmark size={18} color="currentColor" />
        </div>
      )}
    </div>
  );
}

function WallPiece({ it, idx, editable, selected, onSelect, container, onMove, animateIn }: { it: WallItem; idx: number; editable?: boolean; selected: boolean; onSelect: () => void; container: React.RefObject<HTMLDivElement | null>; onMove: (p: Partial<WallItem>) => void; animateIn?: boolean }) {
  const pts = useRef(new Map<number, { x: number; y: number }>());
  const start = useRef<{ x: number; y: number; ix: number; iy: number; dist: number; ang: number; w: number; h: number; rot: number } | null>(null);
  const [drag, setDrag] = useState(false);
  const snapshot = () => {
    const list = [...pts.current.values()];
    const [a, b] = list;
    const cx = b ? (a.x + b.x) / 2 : a.x;
    const cy = b ? (a.y + b.y) / 2 : a.y;
    start.current = { x: cx, y: cy, ix: it.x, iy: it.y, dist: b ? Math.hypot(b.x - a.x, b.y - a.y) : 0, ang: b ? Math.atan2(b.y - a.y, b.x - a.x) : 0, w: it.w, h: it.h, rot: it.rot };
  };
  return (
    <motion.div
      className={`${s.piece} ${s[it.shape]} ${selected ? s.selected : ''}`}
      style={{ left: `${it.x * 100}%`, top: `${it.y * 100}%`, width: `${it.w * 100}%`, height: `${it.h * 100}%`, rotate: it.rot, zIndex: it.z + 1, cursor: editable ? (drag ? 'grabbing' : 'grab') : undefined, touchAction: editable ? 'none' : undefined }}
      initial={animateIn ? { scale: 0.4, opacity: 0, rotate: it.rot - 20 } : false}
      animate={{ scale: 1, opacity: 1, rotate: it.rot }}
      transition={{ delay: animateIn ? idx * 0.06 : 0, type: 'spring', stiffness: 260, damping: 20 }}
      onPointerDown={(e) => {
        if (!editable) return;
        e.stopPropagation();
        onSelect();
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
        pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        snapshot();
        setDrag(true);
      }}
      onPointerMove={(e) => {
        if (!start.current || !container.current || !pts.current.has(e.pointerId)) return;
        pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const r = container.current.getBoundingClientRect();
        const list = [...pts.current.values()];
        const [a, b] = list;
        const st = start.current;
        if (b && st.dist) {
          const k = Math.max(0.3, Math.min(3, Math.hypot(b.x - a.x, b.y - a.y) / st.dist));
          const ang = ((Math.atan2(b.y - a.y, b.x - a.x) - st.ang) * 180) / Math.PI;
          const cx = (a.x + b.x) / 2;
          const cy = (a.y + b.y) / 2;
          onMove({ w: st.w * k, h: st.h * k, rot: st.rot + ang, x: st.ix + (cx - st.x) / r.width - (st.w * (k - 1)) / 2, y: st.iy + (cy - st.y) / r.height - (st.h * (k - 1)) / 2 });
        } else {
          onMove({ x: st.ix + (a.x - st.x) / r.width, y: st.iy + (a.y - st.y) / r.height });
        }
      }}
      onPointerUp={(e) => {
        pts.current.delete(e.pointerId);
        if (pts.current.size) snapshot();
        else {
          start.current = null;
          setDrag(false);
        }
      }}
      onPointerCancel={(e) => {
        pts.current.delete(e.pointerId);
        if (!pts.current.size) {
          start.current = null;
          setDrag(false);
        }
      }}
    >
      <img src={it.src} alt="" draggable={false} />
      {it.shape === 'polaroid' && it.caption && <span className={s.polaroidCap}>{it.caption}</span>}
      {it.tape && <span className={s.tape} />}
    </motion.div>
  );
}
