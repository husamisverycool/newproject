import { useId, type CSSProperties, type ReactNode } from 'react';
import { discord, tcg } from '@app/shared';
import s from './cards.module.css';

/**
 * Currency glyphs. Shinedust: "a sparkling, glitter-like dust icon in pale purple/pink/blue" [B-low].
 * Sparks use Discord's Orb glyph: "a glossy spherical orb, purple/blue/pink, shown as a small icon before
 * the number in the balance pill" [B-low-med]. Stamina is drawn as pips (max 5) [B-low].
 */

export function DustIcon({ size = 18, style }: { size?: number; style?: CSSProperties }) {
  const id = useId();
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} aria-label={tcg.shinedust} role="img">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c9b8ff" />
          <stop offset="0.5" stopColor="#ffb3dc" />
          <stop offset="1" stopColor="#9fd8ff" />
        </linearGradient>
      </defs>
      <path d="M10 1.5c.6 4.7 3 7.2 7.5 8-4.5.8-6.9 3.3-7.5 8-.6-4.7-3-7.2-7.5-8 4.5-.8 6.9-3.3 7.5-8Z" fill={`url(#${id})`} stroke="#8e7cc3" strokeWidth="0.8" strokeLinejoin="round" />
      <path d="M18.5 13c.3 2.4 1.5 3.6 3.7 4-2.2.4-3.4 1.6-3.7 4-.3-2.4-1.5-3.6-3.7-4 2.2-.4 3.4-1.6 3.7-4Z" fill={`url(#${id})`} stroke="#8e7cc3" strokeWidth="0.6" strokeLinejoin="round" />
      <circle cx="4.5" cy="19.5" r="1.4" fill="#c9b8ff" />
    </svg>
  );
}

export function SparkOrb({ size = 18, style }: { size?: number; style?: CSSProperties }) {
  const id = useId();
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} aria-hidden>
      <defs>
        <radialGradient id={id} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="0.25" stopColor="#c7a9ff" />
          <stop offset="0.6" stopColor="var(--discord-blurple)" />
          <stop offset="1" stopColor="#eb459e" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill={`url(#${id})`} />
      <ellipse cx="8.6" cy="7.4" rx="3.2" ry="2" fill="#fff" opacity="0.55" transform="rotate(-30 8.6 7.4)" />
    </svg>
  );
}

export function Amount({ icon, value, style, label }: { icon: ReactNode; value: number | string; style?: CSSProperties; label?: string }) {
  return (
    <span className={s.amount} style={style} aria-label={label}>
      {icon}
      {typeof value === 'number' ? value.toLocaleString() : value}
    </span>
  );
}

export const DustAmount = ({ value, size = 16, style }: { value: number; size?: number; style?: CSSProperties }) => (
  <Amount icon={<DustIcon size={size} />} value={value} style={style} label={tcg.shinedust} />
);

export const SparksAmount = ({ value, size = 16, style }: { value: number; size?: number; style?: CSSProperties }) => (
  <Amount icon={<SparkOrb size={size} />} value={value} style={style} label={discord.balance} />
);

export function Pips({ value, max, color, label }: { value: number; max: number; color?: string; label?: string }) {
  return (
    <span className={s.pips} role="meter" aria-label={label} aria-valuenow={value} aria-valuemax={max} style={color ? ({ '--pip': color } as CSSProperties) : undefined}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={s.pip} data-on={i < value || undefined} />
      ))}
    </span>
  );
}
