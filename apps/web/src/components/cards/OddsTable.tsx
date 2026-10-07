import { RARITIES, RARITY_NAME, tcg } from '@app/shared';
import type { OddsTableT } from '../../lib/types';
import { RarityMark } from './TcgCard';

/**
 * Pull rates shown before any pack purchase (spec §J: "odds shown in the app"). TCG Pocket's published
 * per-position tables (research/05 §1.3) merged into four tiers; rarity marks and names only, plus numbers.
 */
const pct = (n: number | undefined) => (n == null ? '—' : `${Number(n.toFixed(3))}%`);

export function OddsTable({ odds }: { odds: OddsTableT }) {
  const cell = { padding: '9px 6px', textAlign: 'right' as const, fontVariantNumeric: 'tabular-nums' as const };
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', font: 'var(--t-footnote)', color: 'var(--sys-label)' }}>
      <thead>
        <tr style={{ color: 'var(--sys-label2)' }}>
          <th />
          {odds.slots.map((sl) => (
            <th key={sl.positions.join()} style={{ ...cell, fontWeight: 600 }}>
              {sl.positions.length > 1 ? `${sl.positions[0]}–${sl.positions[sl.positions.length - 1]}` : sl.positions[0]}
            </th>
          ))}
          <th style={{ ...cell, fontWeight: 600 }}>
            {tcg.rarePack}
            <div style={{ fontWeight: 400 }}>{pct(odds.rarePack.chance)}</div>
          </th>
        </tr>
      </thead>
      <tbody>
        {RARITIES.map((r) => (
          <tr key={r} style={{ borderTop: '0.5px solid var(--sys-sep)' }}>
            <td style={{ padding: '9px 6px', whiteSpace: 'nowrap' }}>
              <RarityMark rarity={r} style={{ fontSize: 13, color: r === 'immersive' ? undefined : 'var(--sys-label2)' }} />
              <div style={{ fontWeight: 600 }}>{RARITY_NAME[r]}</div>
            </td>
            {odds.slots.map((sl) => (
              <td key={sl.positions.join()} style={cell}>{pct(sl.odds[r])}</td>
            ))}
            <td style={cell}>{pct(odds.rarePack.odds[r])}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
