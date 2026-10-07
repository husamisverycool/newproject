import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BACKDROPS, FLAIR, SYMBOLS, telegram, tcg } from '@app/shared';
import { Sheet, Avatar, Spinner } from '../ios';
import { Icon } from '../Icon';
import { api } from '../../lib/api';
import { invalidateCards, queryClient, useCollectible } from '../../lib/queries';
import { haptic, sfx } from '../../lib/feedback';
import type { CardT, Collectible } from '../../lib/types';
import { TcgCard, SparkleGlyph, cardName } from './TcgCard';
import { DustAmount, DustIcon } from './Currency';
import s from './sheets.module.css';

/* ───────────────────────── Telegram: symbol rings & header ───────────────────────── */

/** "the grey icons that are on the backdrop" [V-weak], in concentric rings around the model [B-med]. */
function Rings({ symbol }: { symbol: string }) {
  const spots = useMemo(() => {
    const out: { x: number; y: number; size: number }[] = [];
    [
      [92, 8, 15],
      [132, 12, 13],
      [172, 16, 12],
    ].forEach(([r, n, size], ring) => {
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + ring * 0.35;
        out.push({ x: Math.cos(a) * r, y: Math.sin(a) * r * 0.86, size });
      }
    });
    return out;
  }, []);
  return (
    <div className={s.rings} aria-hidden>
      {spots.map((p, i) => (
        <span key={i} style={{ left: p.x, top: p.y, fontSize: p.size }}>
          {symbol}
        </span>
      ))}
    </div>
  );
}

/** Wearing gives "a glittering star effect" [V]. */
function Glitter() {
  const spots = [[6, 10, 0], [88, 4, 0.5], [96, 62, 1.1], [2, 74, 1.5], [48, -4, 0.8], [52, 100, 1.9]];
  return (
    <div className={s.glitter} aria-hidden>
      {spots.map(([x, y, d], i) => (
        <SparkleGlyph key={i} size={i % 2 ? 12 : 18} style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s` }} />
      ))}
    </div>
  );
}

/* ───────────────────────── Collectible + upgrade sheet ───────────────────────── */

export function CollectibleSheet({ open, onClose, groupId, cardId, dust }: { open: boolean; onClose: () => void; groupId: string; cardId: string | null; dust: number }) {
  const q = useCollectible(groupId, open ? cardId : null);
  const data = q.data;
  return (
    <Sheet open={open} onClose={onClose} light height="92%">
      {!data ? (
        <div style={{ display: 'grid', placeItems: 'center', height: 300 }}>
          <Spinner />
        </div>
      ) : data.card.serial && data.traits ? (
        <CollectibleView data={data} groupId={groupId} />
      ) : data.mine ? (
        <UpgradeView data={data} groupId={groupId} dust={dust} />
      ) : null}
    </Sheet>
  );
}

function CollectibleView({ data, groupId }: { data: Collectible; groupId: string }) {
  const t = data.traits!;
  const [busy, setBusy] = useState(false);
  const vars = { '--bd-from': t.backdrop.from, '--bd-to': t.backdrop.to } as CSSProperties;
  const wear = async () => {
    setBusy(true);
    try {
      await api.post(`/groups/${groupId}/badge`, { cardId: data.worn ? null : data.card.id });
      haptic('success');
      if (!data.worn) sfx.sparkle();
      queryClient.setQueryData(['collectible', groupId, data.card.id], { ...data, worn: !data.worn });
      invalidateCards(groupId);
      void queryClient.invalidateQueries({ queryKey: ['group', groupId] });
    } catch {
      haptic('heavy');
    } finally {
      setBusy(false);
    }
  };
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 24 }} style={vars}>
      <div className={s.tgHeader} style={vars}>
        <Rings symbol={t.symbol.name} />
        <div className={s.model}>
          {data.worn && <Glitter />}
          <TcgCard card={data.card} tilt />
        </div>
        <div className={s.tgTitle}>{telegram.collectibleTitle(cardName(data.card.post), data.card.serial!)}</div>
      </div>
      <div className={s.table}>
        <div className={s.tr}>
          <span>{telegram.owner}</span>
          <span className={s.td}>
            <Avatar user={data.owner} size={24} />
            {data.owner?.name}
          </span>
        </div>
        <div className={s.tr}>
          <span>{telegram.model}</span>
          <span className={s.td}>
            {t.model.name} {t.model.mark}
            <span className={s.pill}>{t.model.pct}%</span>
          </span>
        </div>
        <div className={s.tr}>
          <span>{telegram.backdrop}</span>
          <span className={s.td}>
            {t.backdrop.name}
            <span className={s.pill}>{t.backdrop.pct}%</span>
          </span>
        </div>
        <div className={s.tr}>
          <span>{telegram.symbol}</span>
          <span className={s.td}>
            {t.symbol.name}
            <span className={s.pill}>{t.symbol.pct}%</span>
          </span>
        </div>
        <div className={s.tr}>
          <span>{telegram.quantity}</span>
          <span className={s.td}>{telegram.issued(data.quantity.issued, data.quantity.of)}</span>
        </div>
      </div>
      {data.mine && (
        <button className={s.tgButton} data-gray={data.worn || undefined} onClick={wear} disabled={busy}>
          {data.worn ? telegram.takeOff : telegram.wear}
        </button>
      )}
    </motion.div>
  );
}

function UpgradeView({ data, groupId, dust }: { data: Collectible; groupId: string; dust: number }) {
  const [i, setI] = useState(0);
  const [busy, setBusy] = useState(false);
  // "a live preview cycles randomly through possible models and backdrops" [B-med]
  useEffect(() => {
    const t = setInterval(() => setI((n) => n + 1 + Math.floor(Math.random() * 5)), 1100);
    return () => clearInterval(t);
  }, []);
  const bd = BACKDROPS[i % BACKDROPS.length];
  const sy = SYMBOLS[(i * 7) % SYMBOLS.length];
  const preview = { ...data.card, serial: data.quantity.issued + 1, traits: { backdrop: bd.id, symbol: sy.id } };
  const can = dust >= data.upgradeCost;
  const upgrade = async () => {
    setBusy(true);
    try {
      const res = await api.post<Collectible>(`/cards/${data.card.id}/upgrade`);
      haptic('success');
      sfx.sparkle();
      queryClient.setQueryData(['collectible', groupId, data.card.id], res);
      invalidateCards(groupId);
    } catch {
      haptic('heavy');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div style={{ '--bd-from': bd.from, '--bd-to': bd.to } as CSSProperties}>
      <div className={s.tgHeader}>
        <AnimatePresence mode="popLayout">
          <motion.div key={sy.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <Rings symbol={sy.name} />
          </motion.div>
        </AnimatePresence>
        <div className={s.model}>
          <TcgCard card={preview} />
        </div>
        <div className={s.tgTitle}>{telegram.upgradeTitle}</div>
        <div className={s.tgSub}>{telegram.rarityLine}</div>
      </div>
      <div className={s.feature}>
        <span className={s.featureIcon}>
          <Icon name="sparkles" size={18} />
        </span>
        <span>
          <div className={s.featureTitle}>{telegram.unique}</div>
          <div className={s.featureText}>{telegram.uniqueLine}</div>
        </span>
      </div>
      <button className={s.tgButton} onClick={upgrade} disabled={!can || busy}>
        {telegram.upgradeFor('')}
        <DustIcon size={18} />
        {data.upgradeCost.toLocaleString()}
      </button>
    </div>
  );
}

/* ───────────────────────── TCG Pocket flair ───────────────────────── */

/** "Obtain Flair" → choose a flair type → "exchange" [V]; "Sparkle Flair: Gold" costs 3 extra cards + 50 Shinedust [V]. */
export function FlairSheet({ open, onClose, card, dust, groupId }: { open: boolean; onClose: () => void; card: CardT; dust: number; groupId: string }) {
  const [busy, setBusy] = useState(false);
  const spare = (card.copies ?? 1) - 1;
  const can = !card.flair && spare >= FLAIR.duplicates && dust >= FLAIR.dust;
  const go = async () => {
    setBusy(true);
    try {
      await api.post(`/cards/${card.id}/flair`);
      haptic('success');
      sfx.sparkle();
      invalidateCards(groupId);
      onClose();
    } catch {
      haptic('heavy');
    } finally {
      setBusy(false);
    }
  };
  return (
    <Sheet open={open} onClose={onClose} light title={tcg.obtainFlair}>
      <div className={s.flairRow}>
        <div style={{ width: 84, flex: 'none' }}>
          <TcgCard card={{ ...card, flair: FLAIR.id }} />
        </div>
        <div>
          <div className={s.flairName}>{tcg.sparkleFlair}</div>
          <div className={s.costs}>
            <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center', font: '600 15px/1 var(--font-sf)', color: spare >= FLAIR.duplicates ? 'var(--sys-label)' : 'var(--sys-red)' }}>
              <Icon name="cards" size={18} />
              {FLAIR.duplicates}
            </span>
            <DustAmount value={FLAIR.dust} style={{ color: dust >= FLAIR.dust ? 'var(--sys-label)' : 'var(--sys-red)' }} />
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', margin: '22px 0 8px' }}>
        <button className={s.tcgButton} onClick={go} disabled={!can || busy}>
          {tcg.exchange}
        </button>
      </div>
    </Sheet>
  );
}
