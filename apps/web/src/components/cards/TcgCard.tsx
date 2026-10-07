import { useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { BACKDROPS, BRAND, RARITY_MARK, backdropById, symbolById, tcg, type Rarity } from '@app/shared';
import type { CardFaceT, CardNumber, Post } from '../../lib/types';
import { longDate } from '../../lib/format';
import { Icon } from '../Icon';
import s from './cards.module.css';

/**
 * A Friend Card in TCG Pocket's frame (research/05 §1.7, research/13 §B):
 * - name bar over the illustration window (the photo) [B-med]
 * - "Illus. <name>" bottom-left with the rarity mark directly under it [V]
 * - collector number tcg.number(set, n, of) where the set is the week [B-low]; no HP, attacks or types
 * - ☆ Art Rare: full art, the photo fills the card [B]; ☆☆☆ Immersive Rare: golden stars [V]
 * - tilt "to view cards from different angles" [V] (DeviceOrientation, pointer fallback)
 * - numbered (Telegram collectible): backdrop gradient with the symbol repeated as grey icons [V-weak]
 * - flair "Sparkle Flair: Gold": animated gold sparkles
 */

/** A moment's card name: its caption, else the day it was taken (data only). */
export function cardName(post: Post | null | undefined) {
  if (!post) return '';
  return post.caption?.trim() || longDate(post.takenAt);
}

export function cardNumber(n: CardNumber | null | undefined) {
  return n ? tcg.number(n.set, n.n, n.of) : '';
}

export const isFullArt = (r: Rarity) => r === 'holo' || r === 'immersive';

export function RarityMark({ rarity, className = '', style }: { rarity: Rarity; className?: string; style?: CSSProperties }) {
  return (
    <span className={`${s.mark} ${className}`} data-gold={rarity === 'immersive' || undefined} style={style}>
      {RARITY_MARK[rarity]}
    </span>
  );
}

/** Four-point sparkle glyph used by the gold flair. */
export function SparkleGlyph({ size, style }: { size?: number; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} aria-hidden>
      <path d="M12 0c.7 6.6 4.8 10.8 12 12-7.2 1.2-11.3 5.4-12 12-.7-6.6-4.8-10.8-12-12C7.2 10.8 11.3 6.6 12 0Z" fill="currentColor" />
    </svg>
  );
}

const FLAIR_SPOTS = [
  [12, 18, 0], [78, 10, 0.4], [64, 46, 0.9], [18, 62, 1.3], [82, 74, 0.6], [40, 84, 1.1], [50, 30, 1.6],
] as const;

export function Flair() {
  return (
    <div className={s.flair} aria-hidden>
      {FLAIR_SPOTS.map(([x, y, d], i) => (
        <SparkleGlyph key={i} style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s` }} />
      ))}
    </div>
  );
}

let orientationAsked = false;
/** iOS asks for motion permission on a user gesture; other browsers fire DeviceOrientation directly. */
export function askOrientation() {
  if (orientationAsked) return;
  orientationAsked = true;
  const D = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } }).DeviceOrientationEvent;
  if (D?.requestPermission) void D.requestPermission().catch(() => undefined);
}

/**
 * Tilt: device orientation when the phone reports it, pointer position otherwise. Writes CSS variables on
 * the element (no re-render): --rx/--ry rotate the card, --mx/--my move the sheen.
 */
export function useTilt(ref: RefObject<HTMLElement | null>, enabled = true, strength = 14) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    let raf = 0;
    const set = (x: number, y: number) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--ry', `${(x - 0.5) * strength * 2}deg`);
        el.style.setProperty('--rx', `${-(y - 0.5) * strength * 2}deg`);
        el.style.setProperty('--mx', String(x));
        el.style.setProperty('--my', String(y));
      });
    };
    const reset = () => {
      el.removeAttribute('data-tilting');
      set(0.5, 0.5);
    };
    let gotOrientation = false;
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;
      gotOrientation = true;
      el.setAttribute('data-tilting', '');
      const x = 0.5 + Math.max(-1, Math.min(1, e.gamma / 30)) / 2;
      const y = 0.5 + Math.max(-1, Math.min(1, (e.beta - 40) / 30)) / 2;
      set(x, y);
    };
    const onMove = (e: PointerEvent) => {
      if (gotOrientation) return;
      const r = el.getBoundingClientRect();
      el.setAttribute('data-tilting', '');
      set(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)));
    };
    window.addEventListener('deviceorientation', onOrient);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', reset);
    el.addEventListener('pointerdown', askOrientation);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('deviceorientation', onOrient);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', reset);
      el.removeEventListener('pointerdown', askOrientation);
    };
  }, [ref, enabled, strength]);
}

export interface TcgCardProps {
  card: CardFaceT;
  tilt?: boolean;
  isNew?: boolean;
  copies?: number;
  wish?: 'on' | 'hi' | null;
  /** Use the Live clip in the illustration window (Immersive playback). */
  live?: boolean;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  onHoldStart?: () => void;
  onHoldEnd?: () => void;
  children?: ReactNode;
}

export function TcgCard({ card, tilt, isNew, copies, wish, live, className = '', style, onClick, onHoldStart, onHoldEnd, children }: TcgCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  useTilt(ref, Boolean(tilt));
  const holdTimer = useRef<number | null>(null);
  const held = useRef(false);
  const post = card.post;
  const full = isFullArt(card.rarity);
  const bd = card.serial ? backdropById(card.traits?.backdrop) ?? BACKDROPS[0] : null;
  const sym = card.serial ? symbolById(card.traits?.symbol) : null;
  const src = live && post?.media.live ? post.media.live : post ? (full ? post.media.main : post.media.thumb ?? post.media.main) : '';
  const vars = (bd ? { '--bd-from': bd.from, '--bd-to': bd.to } : {}) as CSSProperties;

  const down = () => {
    if (!onHoldStart) return;
    held.current = false;
    holdTimer.current = window.setTimeout(() => {
      held.current = true;
      onHoldStart();
    }, 420);
  };
  const up = () => {
    if (holdTimer.current) window.clearTimeout(holdTimer.current);
    holdTimer.current = null;
    if (held.current) onHoldEnd?.();
  };

  return (
    <div
      ref={ref}
      className={`${s.card} ${full ? s.full : ''} ${full ? s.holo : ''} ${bd ? s.numbered : ''} ${className}`}
      style={{ ...vars, ...style }}
      onClick={() => {
        if (held.current) {
          held.current = false;
          return;
        }
        onClick?.();
      }}
      onPointerDown={down}
      onPointerUp={up}
      onPointerCancel={up}
      onContextMenu={(e) => onHoldStart && e.preventDefault()}
      role={onClick ? 'button' : undefined}
      aria-label={post ? `${cardName(post)} ${RARITY_MARK[card.rarity]}` : RARITY_MARK[card.rarity]}
    >
      <div className={s.face}>
        {bd && sym && (
          <div className={s.symbols} aria-hidden>
            {Array.from({ length: 36 }, (_, i) => (
              <span key={i}>{sym.name}</span>
            ))}
          </div>
        )}
        <div className={s.inner}>
          <div className={s.nameBar}>
            <span className={s.name}>{cardName(post)}</span>
            {card.serial ? <span className={s.serial}>#{card.serial}</span> : null}
          </div>
          <div className={s.window}>{src && <img src={src} alt="" draggable={false} />}</div>
          <div className={s.foot}>
            <div className={s.illusCol}>
              <span className={s.illus}>{post ? tcg.illus(post.user.name) : ''}</span>
              <RarityMark rarity={card.rarity} />
            </div>
            <span className={s.num}>{cardNumber(card.number)}</span>
          </div>
        </div>
        <div className={s.sheen} />
        {card.flair && <Flair />}
      </div>
      {isNew && <span className={s.newBadge}>{tcg.newBadge}</span>}
      {copies && copies > 1 ? <span className={s.copies}>{copies}</span> : null}
      {wish && (
        <span className={s.heart} data-hi={wish === 'hi' || undefined}>
          <Icon name="heart" size={12} filled />
        </span>
      )}
      {children}
    </div>
  );
}

/** Plain black back with the app wordmark; an owned Card Sleeve recolors it. */
export function CardBack({ sleeve, style, className = '' }: { sleeve?: string | null; style?: CSSProperties; className?: string }) {
  const color = sleeve ? backdropById(sleeve.replace(/^sleeve_/, '')) : null;
  return (
    <div className={`${s.card} ${className}`} style={style}>
      <div className={s.back} data-sleeve={color ? '' : undefined} style={color ? ({ '--bd-from': color.from, '--bd-to': color.to } as CSSProperties) : undefined}>
        <span className="wordmark">{BRAND.name}</span>
      </div>
    </div>
  );
}

/** A card that turns over: face-up front, branded back. */
export function FlipCard({ down, front, sleeve, style, onClick }: { down: boolean; front: ReactNode; sleeve?: string | null; style?: CSSProperties; onClick?: () => void }) {
  return (
    <div className={s.flip} data-down={down || undefined} style={style} onClick={onClick}>
      <div className={s.flipSide}>{front}</div>
      <div className={`${s.flipSide} ${s.flipBack}`}>
        <CardBack sleeve={sleeve} />
      </div>
    </div>
  );
}

/** Card Dex slot for a missing card: number, name, illustrator and rarity, but not the appearance. */
export function DexSlot({ card, wish, onClick }: { card: CardFaceT; wish?: 'on' | 'hi' | null; onClick?: () => void }) {
  return (
    <div className={s.slot} onClick={onClick} role={onClick ? 'button' : undefined}>
      <span className={s.slotNum}>{card.number ? String(card.number.n).padStart(3, '0') : ''}</span>
      <span className={s.slotName}>{cardName(card.post)}</span>
      <div className={s.slotFoot}>
        <span className={s.illus}>{card.post ? tcg.illus(card.post.user.name) : ''}</span>
        <RarityMark rarity={card.rarity} />
      </div>
      {wish && (
        <span className={s.heart} data-hi={wish === 'hi' || undefined}>
          <Icon name="heart" size={12} filled />
        </span>
      )}
    </div>
  );
}
