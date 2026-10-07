import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import type { WallItem, WallLayout } from '../lib/types';
import { Mascot } from './Mascot';
import s from './wall.module.css';

/**
 * Yope wall: the week's photos "stitched into a continuously evolving photo collage" in a
 * "chaotic" arrangement, some as cut-out stickers (research/02 §A4.3). Rendered from the layout the
 * server stores; in edit mode items can be dragged, rotated and resized, then saved as a new version.
 */
export function WallCanvas({ layout, mascot, editable, onChange, selected, onSelect, animateIn }: {
  layout: WallLayout;
  mascot?: { species: string; level: number; outfit: string[] };
  editable?: boolean;
  onChange?: (l: WallLayout) => void;
  selected?: string | null;
  onSelect?: (id: string | null) => void;
  animateIn?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const light = layout.bg.toUpperCase() === '#FFC800' || layout.bg.toUpperCase() === '#E5E5E5';
  const items = [...layout.items].sort((a, b) => a.z - b.z);

  const update = (id: string, patch: Partial<WallItem>) => {
    if (!onChange) return;
    onChange({ ...layout, items: layout.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) });
  };

  return (
    <div ref={ref} className={s.wall} style={{ background: layout.bg, aspectRatio: `${layout.width} / ${layout.height}`, color: light ? 'var(--black)' : 'var(--white)' }} onPointerDown={(e) => e.target === e.currentTarget && onSelect?.(null)}>
      <div className={s.head}>
        <div className={s.title}>{layout.title}</div>
        <div className={s.subtitle}>{layout.subtitle}</div>
      </div>
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
    </div>
  );
}

function WallPiece({ it, idx, editable, selected, onSelect, container, onMove, animateIn }: { it: WallItem; idx: number; editable?: boolean; selected: boolean; onSelect: () => void; container: React.RefObject<HTMLDivElement | null>; onMove: (p: Partial<WallItem>) => void; animateIn?: boolean }) {
  const start = useRef<{ x: number; y: number; ix: number; iy: number } | null>(null);
  const [drag, setDrag] = useState(false);
  return (
    <motion.div
      className={`${s.piece} ${s[it.shape]} ${selected ? s.selected : ''}`}
      style={{ left: `${it.x * 100}%`, top: `${it.y * 100}%`, width: `${it.w * 100}%`, height: `${it.h * 100}%`, rotate: it.rot, zIndex: it.z + 1, cursor: editable ? (drag ? 'grabbing' : 'grab') : undefined }}
      initial={animateIn ? { scale: 0.4, opacity: 0, rotate: it.rot - 20 } : false}
      animate={{ scale: 1, opacity: 1, rotate: it.rot }}
      transition={{ delay: animateIn ? idx * 0.06 : 0, type: 'spring', stiffness: 260, damping: 20 }}
      onPointerDown={(e) => {
        if (!editable) return;
        e.stopPropagation();
        onSelect();
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        start.current = { x: e.clientX, y: e.clientY, ix: it.x, iy: it.y };
        setDrag(true);
      }}
      onPointerMove={(e) => {
        if (!start.current || !container.current) return;
        const r = container.current.getBoundingClientRect();
        onMove({ x: start.current.ix + (e.clientX - start.current.x) / r.width, y: start.current.iy + (e.clientY - start.current.y) / r.height });
      }}
      onPointerUp={() => {
        start.current = null;
        setDrag(false);
      }}
    >
      <img src={it.src} alt="" draggable={false} />
      {it.shape === 'polaroid' && it.caption && <span className={s.polaroidCap}>{it.caption}</span>}
      {it.tape && <span className={s.tape} />}
    </motion.div>
  );
}
