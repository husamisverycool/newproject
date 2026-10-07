import type { CSSProperties } from 'react';
import { MASCOT_SPECIES } from '@app/shared';

/**
 * The group mascot — built from rounded geometric shapes like Duolingo's Duo, whose palette
 * "comes straight from the mascot" (research/04 §2.1); it grows with group activity like a
 * Widgetable / Pengu co-pet and never dies (spec §M). Outfits are QQ Show / Zepeto-style cosmetics.
 */

export type Mood = 'happy' | 'wow' | 'sleepy' | 'wink' | 'party';

interface Props {
  species?: string;
  level?: number;
  outfit?: string[];
  mood?: Mood;
  size?: number;
  idle?: boolean;
  style?: CSSProperties;
  className?: string;
}

export function Mascot({ species = 'blob', level = 3, outfit = [], mood = 'happy', size = 120, idle = true, style, className }: Props) {
  const s = MASCOT_SPECIES.find((x) => x.id === species) ?? MASCOT_SPECIES[0];
  const egg = level <= 1;
  // Body grows with level: 0.72 at Sprout → 1 at Grown.
  const k = egg ? 0.78 : Math.min(1, 0.68 + level * 0.07);
  const W = 200;
  const bodyRx = 64 * k;
  const bodyRy = 60 * k;
  const cx = 100;
  const cy = 118 + (1 - k) * 30;
  const eyeY = cy - bodyRy * 0.28;
  const eyeDx = bodyRx * 0.36;
  const eyeR = 16 * Math.max(0.85, k);
  const pupil = eyeR * 0.55;
  const blinkClass = idle ? 'mascot-blink' : undefined;

  const eye = (x: number, side: 1 | -1) => {
    if (mood === 'sleepy') return <path key={x} d={`M ${x - eyeR * 0.8} ${eyeY} Q ${x} ${eyeY + eyeR * 0.6} ${x + eyeR * 0.8} ${eyeY}`} stroke="#000" strokeWidth={4} fill="none" strokeLinecap="round" />;
    if (mood === 'wink' && side === 1) return <path key={x} d={`M ${x - eyeR * 0.8} ${eyeY + 2} Q ${x} ${eyeY - eyeR * 0.5} ${x + eyeR * 0.8} ${eyeY + 2}`} stroke="#000" strokeWidth={4} fill="none" strokeLinecap="round" />;
    const r = mood === 'wow' ? eyeR * 1.1 : eyeR;
    return (
      <g key={x} className={blinkClass} style={{ transformOrigin: `${x}px ${eyeY}px` }}>
        <circle cx={x} cy={eyeY} r={r} fill="#fff" />
        <circle cx={x + side * -1.5} cy={eyeY + 2} r={mood === 'wow' ? pupil * 0.8 : pupil} fill="#000" />
        <circle cx={x + side * -1.5 - pupil * 0.35} cy={eyeY + 2 - pupil * 0.4} r={pupil * 0.3} fill="#fff" />
      </g>
    );
  };

  const mouthY = cy + bodyRy * 0.08;
  const mouth =
    mood === 'wow' ? (
      <ellipse cx={cx} cy={mouthY + 6} rx={7} ry={9} fill="#000" />
    ) : species === 'frog' ? (
      <path d={`M ${cx - 26 * k} ${mouthY} Q ${cx} ${mouthY + 20 * k} ${cx + 26 * k} ${mouthY}`} stroke="#000" strokeWidth={4} fill="none" strokeLinecap="round" />
    ) : (
      <path d={`M ${cx - 9} ${mouthY} Q ${cx} ${mouthY + 10} ${cx + 9} ${mouthY}`} stroke="#000" strokeWidth={4} fill="#000" strokeLinejoin="round" />
    );

  return (
    <svg viewBox={`0 0 ${W} ${W}`} width={size} height={size} style={style} className={className} aria-label={`${s.name} mascot`} role="img">
      <g className={idle ? 'mascot-bob' : undefined} style={{ transformOrigin: `${cx}px ${cy + bodyRy}px` }}>
        {/* species features behind the body */}
        {species === 'bun' && !egg && (
          <g fill={s.body}>
            <ellipse cx={cx - bodyRx * 0.45} cy={cy - bodyRy * 1.05} rx={13 * k} ry={38 * k} transform={`rotate(-12 ${cx - bodyRx * 0.45} ${cy - bodyRy * 1.05})`} />
            <ellipse cx={cx + bodyRx * 0.45} cy={cy - bodyRy * 1.05} rx={13 * k} ry={38 * k} transform={`rotate(12 ${cx + bodyRx * 0.45} ${cy - bodyRy * 1.05})`} />
            <ellipse cx={cx - bodyRx * 0.45} cy={cy - bodyRy * 1.02} rx={6 * k} ry={26 * k} fill={s.accent} opacity={0.5} transform={`rotate(-12 ${cx - bodyRx * 0.45} ${cy - bodyRy * 1.02})`} />
            <ellipse cx={cx + bodyRx * 0.45} cy={cy - bodyRy * 1.02} rx={6 * k} ry={26 * k} fill={s.accent} opacity={0.5} transform={`rotate(12 ${cx + bodyRx * 0.45} ${cy - bodyRy * 1.02})`} />
          </g>
        )}
        {species === 'moth' && !egg && (
          <g>
            <ellipse cx={cx - bodyRx * 0.95} cy={cy - 6} rx={34 * k} ry={46 * k} fill={s.accent} opacity={0.9} transform={`rotate(-24 ${cx - bodyRx * 0.95} ${cy - 6})`} />
            <ellipse cx={cx + bodyRx * 0.95} cy={cy - 6} rx={34 * k} ry={46 * k} fill={s.accent} opacity={0.9} transform={`rotate(24 ${cx + bodyRx * 0.95} ${cy - 6})`} />
            <path d={`M ${cx - 12} ${cy - bodyRy * 0.95} Q ${cx - 26} ${cy - bodyRy * 1.6} ${cx - 34} ${cy - bodyRy * 1.55}`} stroke="#000" strokeWidth={4} fill="none" strokeLinecap="round" />
            <path d={`M ${cx + 12} ${cy - bodyRy * 0.95} Q ${cx + 26} ${cy - bodyRy * 1.6} ${cx + 34} ${cy - bodyRy * 1.55}`} stroke="#000" strokeWidth={4} fill="none" strokeLinecap="round" />
            <circle cx={cx - 34} cy={cy - bodyRy * 1.55} r={6} fill="#000" />
            <circle cx={cx + 34} cy={cy - bodyRy * 1.55} r={6} fill="#000" />
          </g>
        )}

        {egg ? (
          <g>
            <ellipse cx={cx} cy={cy - 6} rx={54} ry={68} fill="#fff" />
            <ellipse cx={cx - 16} cy={cy - 30} rx={10} ry={14} fill={s.body} opacity={0.6} />
            <ellipse cx={cx + 22} cy={cy + 10} rx={14} ry={10} fill={s.body} opacity={0.6} />
            <path d={`M ${cx - 54} ${cy - 2} l 14 -10 l 12 12 l 14 -12 l 14 12 l 14 -12 l 12 12 l 14 -10 l 14 8`} stroke={s.body} strokeWidth={5} fill="none" strokeLinejoin="round" />
            <g transform={`translate(0 ${-8})`}>{eye(cx - 16, -1)}{eye(cx + 16, 1)}</g>
          </g>
        ) : (
          <g>
            {/* feet */}
            <ellipse cx={cx - bodyRx * 0.42} cy={cy + bodyRy * 0.98} rx={15 * k} ry={8 * k} fill={s.accent} />
            <ellipse cx={cx + bodyRx * 0.42} cy={cy + bodyRy * 0.98} rx={15 * k} ry={8 * k} fill={s.accent} />
            {/* body */}
            <path
              d={`M ${cx} ${cy - bodyRy} C ${cx + bodyRx * 1.02} ${cy - bodyRy} ${cx + bodyRx * 1.1} ${cy - bodyRy * 0.1} ${cx + bodyRx} ${cy + bodyRy * 0.42} C ${cx + bodyRx * 0.86} ${cy + bodyRy * 1.02} ${cx - bodyRx * 0.86} ${cy + bodyRy * 1.02} ${cx - bodyRx} ${cy + bodyRy * 0.42} C ${cx - bodyRx * 1.1} ${cy - bodyRy * 0.1} ${cx - bodyRx * 1.02} ${cy - bodyRy} ${cx} ${cy - bodyRy} Z`}
              fill={s.body}
            />
            {/* belly */}
            <ellipse cx={cx} cy={cy + bodyRy * 0.42} rx={bodyRx * 0.58} ry={bodyRy * 0.46} fill={s.belly} opacity={species === 'frog' ? 1 : 0.92} />
            {/* blob nubs / frog eye bumps */}
            {species === 'blob' && (
              <g fill={s.body}>
                <circle cx={cx - 10} cy={cy - bodyRy * 1.02} r={9 * k} />
                <circle cx={cx + 6} cy={cy - bodyRy * 1.08} r={7 * k} />
              </g>
            )}
            {species === 'frog' && (
              <g fill={s.body}>
                <circle cx={cx - eyeDx} cy={eyeY - 8} r={eyeR + 8} />
                <circle cx={cx + eyeDx} cy={eyeY - 8} r={eyeR + 8} />
              </g>
            )}
            {/* wings / arms */}
            <ellipse cx={cx - bodyRx * 0.98} cy={cy + bodyRy * 0.2} rx={10 * k} ry={20 * k} fill={s.body} transform={`rotate(20 ${cx - bodyRx * 0.98} ${cy + bodyRy * 0.2})`} />
            <ellipse cx={cx + bodyRx * 0.98} cy={cy + bodyRy * 0.2} rx={10 * k} ry={20 * k} fill={s.body} transform={`rotate(-20 ${cx + bodyRx * 0.98} ${cy + bodyRy * 0.2})`} />
            {/* cheeks */}
            <ellipse cx={cx - eyeDx - 6} cy={eyeY + eyeR + 8} rx={8} ry={5} fill="#FF0069" opacity={0.28} />
            <ellipse cx={cx + eyeDx + 6} cy={eyeY + eyeR + 8} rx={8} ry={5} fill="#FF0069" opacity={0.28} />
            <g transform={species === 'frog' ? `translate(0 -8)` : undefined}>
              {eye(cx - eyeDx, -1)}
              {eye(cx + eyeDx, 1)}
            </g>
            {mouth}
          </g>
        )}

        {/* outfits */}
        {outfit.includes('outfit_party_hat') && (
          <g transform={`translate(${cx + 8} ${cy - bodyRy - (egg ? 30 : 4)}) rotate(14)`}>
            <path d="M -18 0 L 0 -46 L 18 0 Z" fill="#FFC800" stroke="#000" strokeWidth={3} strokeLinejoin="round" />
            <path d="M -9 -22 L 9 -22 M -14 -10 L 14 -10" stroke="#FF4B4B" strokeWidth={4} />
            <circle cx={0} cy={-48} r={6} fill="#FF4B4B" stroke="#000" strokeWidth={3} />
          </g>
        )}
        {outfit.includes('outfit_beanie') && (
          <g transform={`translate(${cx} ${cy - bodyRy + 4})`}>
            <path d={`M ${-bodyRx * 0.7} 6 Q 0 ${-bodyRy * 0.95} ${bodyRx * 0.7} 6 Z`} fill="#FF4B4B" stroke="#000" strokeWidth={3} />
            <rect x={-bodyRx * 0.74} y={-2} width={bodyRx * 1.48} height={14} rx={7} fill="#fff" stroke="#000" strokeWidth={3} />
            <circle cx={0} cy={-bodyRy * 0.5} r={9} fill="#fff" stroke="#000" strokeWidth={3} />
          </g>
        )}
        {outfit.includes('outfit_crown') && (
          <g transform={`translate(${cx} ${cy - bodyRy - (egg ? 26 : 2)})`}>
            <path d="M -26 0 L -26 -24 L -12 -10 L 0 -30 L 12 -10 L 26 -24 L 26 0 Z" fill="#FFC800" stroke="#000" strokeWidth={3} strokeLinejoin="round" />
            <circle cx={0} cy={-8} r={4} fill="#1CB0F6" />
          </g>
        )}
        {outfit.includes('outfit_flower') && (
          <g transform={`translate(${cx + bodyRx * 0.55} ${cy - bodyRy * 0.8})`}>
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx={0} cy={-9} rx={6} ry={9} fill="#fff" transform={`rotate(${a})`} />
            ))}
            <circle r={6} fill="#FFC800" />
          </g>
        )}
        {outfit.includes('outfit_shades') && !egg && (
          <g transform={`translate(${cx} ${eyeY + (species === 'frog' ? -8 : 0)})`}>
            <rect x={-eyeDx - eyeR - 2} y={-eyeR * 0.7} width={eyeR * 2 + 4} height={eyeR * 1.4} rx={8} fill="#000" />
            <rect x={eyeDx - eyeR - 2} y={-eyeR * 0.7} width={eyeR * 2 + 4} height={eyeR * 1.4} rx={8} fill="#000" />
            <path d={`M ${-eyeDx + eyeR} 0 L ${eyeDx - eyeR} 0`} stroke="#000" strokeWidth={4} />
            <rect x={-eyeDx - eyeR + 4} y={-eyeR * 0.45} width={8} height={4} rx={2} fill="#fff" opacity={0.6} />
          </g>
        )}
        {outfit.includes('outfit_headphones') && !egg && (
          <g>
            <path d={`M ${cx - bodyRx * 0.95} ${cy - bodyRy * 0.15} Q ${cx} ${cy - bodyRy * 1.7} ${cx + bodyRx * 0.95} ${cy - bodyRy * 0.15}`} stroke="#000" strokeWidth={7} fill="none" />
            <rect x={cx - bodyRx * 1.08} y={cy - bodyRy * 0.3} width={20} height={30} rx={8} fill="#1CB0F6" stroke="#000" strokeWidth={3} />
            <rect x={cx + bodyRx * 1.08 - 20} y={cy - bodyRy * 0.3} width={20} height={30} rx={8} fill="#1CB0F6" stroke="#000" strokeWidth={3} />
          </g>
        )}
        {level >= 6 && (
          <g fill="#FFC800">
            <path d={`M ${cx - bodyRx - 12} ${cy - bodyRy} l 4 10 l 10 4 l -10 4 l -4 10 l -4 -10 l -10 -4 l 10 -4 Z`} />
            <path d={`M ${cx + bodyRx + 10} ${cy - bodyRy * 0.6} l 3 7 l 7 3 l -7 3 l -3 7 l -3 -7 l -7 -3 l 7 -3 Z`} />
          </g>
        )}
        {mood === 'party' && (
          <g>
            {['#FFC800', '#1CB0F6', '#FF4B4B', '#58CC02', '#CE82FF'].map((c, i) => (
              <rect key={c} x={30 + i * 32} y={20 + (i % 2) * 18} width={8} height={14} rx={2} fill={c} transform={`rotate(${i * 37} ${34 + i * 32} ${27 + (i % 2) * 18})`} />
            ))}
          </g>
        )}
      </g>
    </svg>
  );
}
