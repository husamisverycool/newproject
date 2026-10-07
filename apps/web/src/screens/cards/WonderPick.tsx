import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate, useParams } from 'react-router';
import { ios, tcg } from '@app/shared';
import { Avatar, NavBar, Screen } from '../../components/ios';
import { Icon } from '../../components/Icon';
import { FlipCard, TcgCard } from '../../components/cards/TcgCard';
import { Pips } from '../../components/cards/Currency';
import { api } from '../../lib/api';
import { invalidateCards, useWonder } from '../../lib/queries';
import { countdown, timeAgo } from '../../lib/format';
import { haptic, sfx } from '../../lib/feedback';
import type { CardFaceT, CardT, WonderOffer } from '../../lib/types';
import { useNow } from './common';
import t from './tcg.module.css';

/**
 * Wonder Pick (TCG Pocket, research/05 §1.11, research/13 §1.4): "Wonder Picks from friends will always
 * display first" [V-weak]; each shows the opener and their five cards and costs Wonder Stamina by the best
 * card's rarity [V]; on a pick the five cards are "turned face down and shuffled" [V] and you tap one to flip
 * it [B-med]. Stamina: max 5, +1 every 12 h [V]. Picking never takes a card from the opener [V-weak].
 */
export default function WonderPick() {
  const { groupId } = useParams();
  const nav = useNavigate();
  const q = useWonder(groupId);
  const now = useNow();
  const [open, setOpen] = useState<WonderOffer | null>(null);
  const b = q.data?.binder;
  const wish = useMemo(() => new Map((b?.wishlist ?? []).map((w) => [`${w.postId}:${w.rarity}`, w.highlighted ? ('hi' as const) : ('on' as const)])), [b]);
  const offers = q.data?.offers ?? [];

  return (
    <Screen light className={t.screen}>
      <NavBar onBack={() => nav(-1)} title={tcg.wonderPick} />
      <div className={t.scroll}>
        <div className={t.statusRow}>
          <span className={t.chipStat}>
            {tcg.wonderStamina}
            {b && <Pips value={b.wonder.value} max={b.wonder.max} label={tcg.wonderStamina} />}
          </span>
          {b?.wonder.next ? (
            <span className={t.chipStat}>
              <Icon name="timer" size={16} />
              {countdown(b.wonder.next - now)}
            </span>
          ) : null}
        </div>
        <div className={t.sectionTitle}>{tcg.wonderFriendsFirst}</div>
        <div style={{ display: 'grid', gap: 12, padding: '0 var(--margin)' }}>
          {offers.map((o) => (
            <button key={o.id} className={t.panel} onClick={() => !o.picked && setOpen(o)} style={{ padding: 12, textAlign: 'left', opacity: o.picked ? 0.55 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Avatar user={o.opener} size={32} />
                <span style={{ flex: 1, font: '600 15px/1.2 var(--font-sf)' }}>
                  {o.opener?.name}
                  <span style={{ display: 'block', font: '500 12px/1.3 var(--font-sf)', color: 'var(--sys-label2)' }}>{timeAgo(o.createdAt, now)}</span>
                </span>
                {o.picked ? <Icon name="check" size={20} color="var(--tcg-teal)" strokeWidth={3} /> : <Pips value={o.cost} max={o.cost} label={tcg.wonderStamina} />}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                {o.cards.map((c, i) => (
                  <TcgCard key={i} card={c} wish={wish.get(`${c.postId}:${c.rarity}`) ?? null} />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {open && b && (
          <PickView
            offer={open}
            groupId={groupId!}
            stamina={b.wonder.value}
            sleeve={b.sleeve}
            wish={wish}
            onClose={() => {
              setOpen(null);
              invalidateCards(groupId!);
            }}
          />
        )}
      </AnimatePresence>
    </Screen>
  );
}

type Phase = 'show' | 'down' | 'gather' | 'shuffle' | 'choose' | 'result';

function PickView({ offer, groupId, stamina, sleeve, wish, onClose }: { offer: WonderOffer; groupId: string; stamina: number; sleeve: string | null; wish: Map<string, 'on' | 'hi'>; onClose: () => void }) {
  const [phase, setPhase] = useState<Phase>('show');
  const [faces, setFaces] = useState<CardFaceT[]>(offer.cards);
  const [down, setDown] = useState<boolean[]>(offer.cards.map(() => false));
  const [chosen, setChosen] = useState<number | null>(null);
  const [got, setGot] = useState<CardT | null>(null);
  const [jitter, setJitter] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(340);
  useEffect(() => {
    if (box.current) setW(box.current.clientWidth);
  }, []);
  const gap = 12;
  const cw = (w - gap * 2) / 3;
  const ch = (cw * 88) / 63;
  const slot = (i: number) => (i < 3 ? { x: i * (cw + gap), y: 0 } : { x: (w - cw * 2 - gap) / 2 + (i - 3) * (cw + gap), y: ch + gap });
  const center = { x: (w - cw) / 2, y: (ch + gap) / 2 };

  const start = () => {
    haptic('medium');
    setPhase('down');
    setDown(offer.cards.map(() => true));
    sfx.pop();
    window.setTimeout(() => setPhase('gather'), 600);
    window.setTimeout(() => {
      setPhase('shuffle');
      let n = 0;
      const id = window.setInterval(() => {
        setJitter((j) => j + 1);
        sfx.click();
        haptic('light');
        if (++n >= 6) {
          window.clearInterval(id);
          setPhase('choose');
        }
      }, 170);
    }, 1000);
  };

  const pick = async (i: number) => {
    if (phase !== 'choose') return;
    setChosen(i);
    setPhase('result');
    try {
      const r = await api.post<{ card: CardT; position: number; order: CardFaceT[] }>(`/groups/${groupId}/wonder/${offer.id}`, { choice: i });
      setFaces(r.order);
      setGot(r.card);
      setDown((d) => d.map((v, k) => (k === i ? false : v)));
      haptic(r.card.rarity === 'holo' || r.card.rarity === 'immersive' ? 'heavy' : 'success');
      if (r.card.rarity === 'immersive') sfx.crack();
      else sfx.sparkle();
      window.setTimeout(() => setDown(r.order.map(() => false)), 1100);
    } catch {
      haptic('heavy');
      onClose();
    }
  };

  const pos = (i: number) => {
    if (phase === 'gather' || phase === 'shuffle') {
      const a = ((i * 73 + jitter * 37) % 5) - 2;
      return phase === 'shuffle' ? { x: center.x + a * 14, y: center.y + ((jitter + i) % 3) * 4 - 4, rotate: a * 4 } : { ...center, rotate: 0 };
    }
    return { ...slot(i), rotate: 0 };
  };

  return (
    <motion.div className={t.detail} style={{ background: 'color-mix(in srgb, var(--tcg-panel) 92%, transparent)', color: 'var(--sys-label)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <button className={`ios-glass-circle ${t.detailClose}`} onClick={onClose} aria-label={ios.close} style={{ background: 'var(--tcg-bg)' }}>
        <Icon name="close" size={20} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
        <Avatar user={offer.opener} size={36} />
        <span style={{ font: '700 17px/1 var(--font-sf)' }}>{offer.opener?.name}</span>
      </div>
      <div ref={box} style={{ position: 'relative', width: 'calc(100% - 40px)', height: ch * 2 + gap, marginTop: 34 }}>
        {faces.map((c, i) => {
          const p = pos(i);
          return (
            <motion.div
              key={i}
              style={{ position: 'absolute', left: 0, top: 0, width: cw, zIndex: chosen === i ? 3 : 1 }}
              animate={{ x: p.x, y: p.y, rotate: p.rotate, scale: chosen === i && phase === 'result' ? 1.08 : 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              whileTap={phase === 'choose' ? { scale: 0.95 } : undefined}
              onClick={() => pick(i)}
            >
              <motion.div animate={phase === 'choose' ? { y: [0, -4, 0] } : { y: 0 }} transition={phase === 'choose' ? { duration: 1.2, repeat: Infinity, delay: i * 0.12 } : undefined}>
                <FlipCard down={down[i]} sleeve={sleeve} front={<TcgCard card={c} isNew={chosen === i && got ? got.isNew : undefined} wish={phase === 'show' ? wish.get(`${c.postId}:${c.rarity}`) ?? null : null} />} />
              </motion.div>
            </motion.div>
          );
        })}
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        {phase === 'show' && (
          <>
            <span className={t.chipStat}>
              {tcg.wonderStamina}
              <Pips value={offer.cost} max={offer.cost} label={tcg.wonderStamina} />
            </span>
            <button className={t.tealBtn} disabled={stamina < offer.cost} onClick={start}>
              {tcg.wonderPick}
            </button>
          </>
        )}
        {phase === 'result' && got && (
          <button className={t.whiteBtn} onClick={onClose}>
            {ios.done}
          </button>
        )}
      </div>
    </motion.div>
  );
}
