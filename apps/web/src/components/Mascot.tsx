import type { CSSProperties } from 'react';
import { MASCOT_SPECIES } from '@app/shared';

/**
 * The group's shared pet (spec §M), drawn by Duolingo's character rules [V] (design.duolingo.com/illustration):
 * - only three shapes — rounded rectangle (most), circle, rounded triangle; "pointy shapes are off-brand"
 * - head and body from 1–2 shapes each; flat perspective
 * - geometric eyes in one of the five styles (round, almond, dots used here)
 * - a pill-shaped shadow below, colored by the background
 * - flat fills, one darker same-hue shadow shape, small white highlights, no outlines [B-med]
 * Species from Widgetable / Pengu [V-weak / V]. Outfits from Duolingo's shop [B-high]:
 * "Formal Attire", "Champion Jersey", "Luxury Tracksuit".
 * Motion: idle bounce [B-med]; celebration "Duo spins in the air and bursts into an orange flame" [V-weak].
 */
export function Mascot({ species = 'cat', level = 3, outfit = [], mood = 'happy', size = 120, shadow, style, className = '' }: {
  species?: string;
  level?: number;
  outfit?: string[];
  mood?: 'happy' | 'party';
  size?: number;
  /** Pill shadow color; "the shadow's color depends on the background" [V]. */
  shadow?: string;
  style?: CSSProperties;
  className?: string;
}) {
  const s = MASCOT_SPECIES.find((x) => x.id === species) ?? MASCOT_SPECIES[0];
  const id = `m${species}${size}`;
  const grow = 0.86 + Math.min(level, 6) * 0.025; // grows with the group (Widgetable "watch them grow")
  const eyeL = 49;
  const eyeR = 71;
  const eyeY = 58;
  const dark = '#4B4B4B'; // Duolingo Eel
  const wear = new Set(outfit);
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={`${mood === 'party' ? 'mascot-party' : 'mascot-bob'} ${className}`} style={style} role="img" aria-hidden>
      <defs>
        <clipPath id={`${id}-body`}>
          <rect x="30" y="34" width="60" height="70" rx="27" />
        </clipPath>
      </defs>
      {/* flame burst on celebration (Duolingo streak extend) */}
      {mood === 'party' && (
        <g className="mascot-flame">
          <rect x="40" y="6" width="40" height="64" rx="20" fill="#FF9600" />
          <rect x="48" y="20" width="24" height="44" rx="12" fill="#FFC800" />
        </g>
      )}
      {/* pill shadow */}
      <rect x="34" y="106" width="52" height="9" rx="4.5" fill={shadow ?? 'rgba(0,0,0,0.14)'} />
      <g transform={`translate(60 104) scale(${grow}) translate(-60 -104)`}>
        {/* ears / tufts behind the body */}
        {species === 'cat' && (
          <>
            <path d="M38 44 L42 22 L56 36 Z" fill={s.body} stroke={s.body} strokeWidth="8" strokeLinejoin="round" />
            <path d="M82 44 L78 22 L64 36 Z" fill={s.body} stroke={s.body} strokeWidth="8" strokeLinejoin="round" />
          </>
        )}
        {species === 'dog' && (
          <>
            <rect x="22" y="38" width="16" height="34" rx="8" fill={s.shade} />
            <rect x="82" y="38" width="16" height="34" rx="8" fill={s.shade} />
          </>
        )}
        {(species === 'panda' || species === 'polarbear') && (
          <>
            <circle cx="38" cy="38" r="10" fill={species === 'panda' ? dark : s.body} />
            <circle cx="82" cy="38" r="10" fill={species === 'panda' ? dark : s.body} />
            {species === 'polarbear' && (
              <>
                <circle cx="38" cy="38" r="5" fill={s.shade} />
                <circle cx="82" cy="38" r="5" fill={s.shade} />
              </>
            )}
          </>
        )}
        {(species === 'bird' || species === 'duck') && <path d="M54 34 L60 20 L66 34 Z" fill={s.body} stroke={s.body} strokeWidth="6" strokeLinejoin="round" />}

        {/* arms / wings: rounded rectangles */}
        <rect x="22" y="66" width="14" height="26" rx="7" fill={species === 'panda' ? dark : s.shade} transform="rotate(14 29 79)" />
        <rect x="84" y="66" width="14" height="26" rx="7" fill={species === 'panda' ? dark : s.shade} transform="rotate(-14 91 79)" />

        {/* head + body: one rounded rectangle */}
        <rect x="30" y="34" width="60" height="70" rx="27" fill={s.body} />
        {/* one darker same-hue shadow shape, hard-edged */}
        <g clipPath={`url(#${id}-body)`}>
          <rect x="30" y="34" width="13" height="70" fill={s.shade} />
        </g>
        {/* belly */}
        {s.belly !== s.body && <rect x="42" y="68" width="36" height="32" rx="16" fill={s.belly} />}
        {/* highlight */}
        <rect x="74" y="42" width="7" height="12" rx="3.5" fill="#FFFFFF" opacity="0.55" />

        {/* panda eye patches */}
        {species === 'panda' && (
          <>
            <rect x="38" y="48" width="20" height="22" rx="10" fill={dark} transform="rotate(-16 48 59)" />
            <rect x="62" y="48" width="20" height="22" rx="10" fill={dark} transform="rotate(16 72 59)" />
          </>
        )}

        {/* eyes */}
        {s.eyes === 'round' && (
          <>
            <circle cx={eyeL} cy={eyeY} r="10" fill="#FFFFFF" />
            <circle cx={eyeR} cy={eyeY} r="10" fill="#FFFFFF" />
            <circle cx={eyeL + 2} cy={eyeY + 1} r="5.5" fill={dark} className="mascot-blink" />
            <circle cx={eyeR + 2} cy={eyeY + 1} r="5.5" fill={dark} className="mascot-blink" />
            <circle cx={eyeL + 4} cy={eyeY - 2} r="1.8" fill="#FFFFFF" />
            <circle cx={eyeR + 4} cy={eyeY - 2} r="1.8" fill="#FFFFFF" />
          </>
        )}
        {s.eyes === 'almond' && (
          <>
            <ellipse cx={eyeL} cy={eyeY} rx="8" ry="6" fill="#FFFFFF" />
            <ellipse cx={eyeR} cy={eyeY} rx="8" ry="6" fill="#FFFFFF" />
            <ellipse cx={eyeL + 1} cy={eyeY} rx="3" ry="5" fill={dark} className="mascot-blink" />
            <ellipse cx={eyeR + 1} cy={eyeY} rx="3" ry="5" fill={dark} className="mascot-blink" />
          </>
        )}
        {s.eyes === 'dots' && (
          <>
            <circle cx={eyeL} cy={eyeY} r="4.5" fill={dark} className="mascot-blink" />
            <circle cx={eyeR} cy={eyeY} r="4.5" fill={dark} className="mascot-blink" />
          </>
        )}

        {/* beak / bill / nose */}
        {(species === 'bird' || species === 'penguin') && <path d="M55 68 L65 68 L60 76 Z" fill={s.accent} stroke={s.accent} strokeWidth="5" strokeLinejoin="round" />}
        {species === 'duck' && <rect x="50" y="66" width="20" height="9" rx="4.5" fill={s.accent} />}
        {(species === 'cat' || species === 'dog' || species === 'polarbear' || species === 'panda') && <rect x="56" y="66" width="8" height="6" rx="3" fill={species === 'cat' ? s.accent : dark} />}

        {/* feet */}
        <rect x="42" y="98" width="15" height="9" rx="4.5" fill={species === 'bird' || species === 'duck' || species === 'penguin' ? s.accent : s.shade} />
        <rect x="63" y="98" width="15" height="9" rx="4.5" fill={species === 'bird' || species === 'duck' || species === 'penguin' ? s.accent : s.shade} />

        {/* Duolingo shop outfits [B-high] */}
        {wear.has('outfit_formal') && (
          <g clipPath={`url(#${id}-body)`}>
            <rect x="30" y="78" width="60" height="30" fill={dark} />
            <path d="M52 78 L68 78 L60 92 Z" fill="#FFFFFF" />
            <rect x="53" y="76" width="6" height="6" rx="3" fill="#FF4B4B" />
            <rect x="61" y="76" width="6" height="6" rx="3" fill="#FF4B4B" />
          </g>
        )}
        {wear.has('outfit_jersey') && (
          <g clipPath={`url(#${id}-body)`}>
            <rect x="30" y="76" width="60" height="32" fill="#FF4B4B" />
            <rect x="30" y="76" width="60" height="4" fill="#FFFFFF" />
            <rect x="57" y="84" width="6" height="14" rx="3" fill="#FFFFFF" />
          </g>
        )}
        {wear.has('outfit_tracksuit') && (
          <g clipPath={`url(#${id}-body)`}>
            <rect x="30" y="74" width="60" height="34" fill="#CE82FF" />
            <rect x="59" y="74" width="2" height="34" fill="#FFFFFF" />
          </g>
        )}
      </g>
    </svg>
  );
}
