import type { CSSProperties } from 'react';
import { BRAND, MASCOT_SPECIES } from '@app/shared';
import { Mascot } from '../Mascot';
import { weekRange } from '../../lib/format';
import s from './cards.module.css';

/**
 * Booster pack. TCG Pocket's pack art is per set with a featured Pokémon [V]; the layout follows
 * [I research/inspo/store/tcg-01-pack-select.webp]: crimped foil ends, a patterned top band holding the logo,
 * full-bleed art, the set title in big outlined letters with the featured character's name under it. Ours
 * features the group's mascot (and its name), the wordmark, and the set (the week) — the only sourced identities
 * this app has. The cut guide is "a dotted or glowing guide line across the top of the pack" [B-med].
 */

export const CUT_Y = 15.5; // in viewBox units of 178: just under the top band's logo

function edge(y0: number, y1: number, top: boolean) {
  const pts: string[] = [];
  for (let x = 0, i = 0; x <= 100; x += 2.5, i++) pts.push(`${x},${i % 2 ? y1 : y0}`);
  return top ? pts : pts.reverse();
}

const OUTLINE = `M${edge(0, 2.4, true).join(' L')} L100,175.6 L${edge(178, 175.6, false).join(' L')} Z`;

export interface PackMascot {
  species: string;
  outfit?: string[];
  level?: number;
  name?: string;
}

export function PackArt({ weekKey, mascot, part = 'whole', guide, style }: { weekKey: string; mascot?: PackMascot | null; part?: 'whole' | 'top' | 'body'; guide?: boolean; style?: CSSProperties }) {
  const sp = MASCOT_SPECIES.find((m) => m.id === mascot?.species) ?? MASCOT_SPECIES[0];
  const cut = `${(CUT_Y / 178) * 100}%`;
  const clip = part === 'top' ? `inset(0 0 calc(100% - ${cut}) 0)` : part === 'body' ? `inset(${cut} 0 0 0)` : undefined;
  return (
    <div className={s.pack} style={{ ...style, clipPath: clip }} aria-hidden>
      <svg className={s.packLayer} viewBox="0 0 100 178" preserveAspectRatio="none" width="100%" height="100%">
        <defs>
          <linearGradient id="pk-foil" x1="0" y1="0" x2="1" y2="0.35">
            <stop offset="0" stopColor="#d1d1d6" />
            <stop offset="0.22" stopColor="#f2f2f7" />
            <stop offset="0.45" stopColor="#aeaeb2" />
            <stop offset="0.62" stopColor="#e5e5ea" />
            <stop offset="0.85" stopColor="#c7c7cc" />
            <stop offset="1" stopColor="#f2f2f7" />
          </linearGradient>
          <pattern id="pk-crimp" width="1.6" height="4" patternUnits="userSpaceOnUse">
            <rect width="0.8" height="4" fill="rgba(0,0,0,0.10)" />
          </pattern>
        </defs>
        <path d={OUTLINE} fill="url(#pk-foil)" />
        <rect x="0" y="1.5" width="100" height="10" fill="url(#pk-crimp)" />
        <rect x="0" y="166.5" width="100" height="10" fill="url(#pk-crimp)" />
      </svg>
      <div className={s.packArt} style={{ '--art': sp.body } as CSSProperties}>
        <div className={s.packBand}>
          <span className={s.brand}>{BRAND.name}</span>
        </div>
        <div className={s.packHero}>
          <Mascot species={sp.id} outfit={mascot?.outfit ?? []} level={mascot?.level ?? 3} size={150} style={{ width: '86%', height: 'auto' }} />
        </div>
        <div className={s.packTitle}>
          <span className={s.packSet}>{weekRange(weekKey)}</span>
          {mascot?.name && <span className={s.packSub}>{mascot.name}</span>}
        </div>
      </div>
      {guide && (
        <svg className={s.packLayer} viewBox="0 0 100 178" preserveAspectRatio="none" width="100%" height="100%">
          <line x1="2" x2="98" y1={CUT_Y} y2={CUT_Y} stroke="rgba(255,255,255,0.9)" strokeWidth="0.8" strokeDasharray="2 1.6" />
        </svg>
      )}
      <div className={s.packShine} />
    </div>
  );
}
