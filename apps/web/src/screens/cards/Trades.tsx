import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { RARITY_MARK, ios, monopoly, tcg } from '@app/shared';
import { Avatar, NavBar, Screen } from '../../components/ios';
import { Icon } from '../../components/Icon';
import { TcgCard } from '../../components/cards/TcgCard';
import { DustAmount, Pips } from '../../components/cards/Currency';
import { api } from '../../lib/api';
import { invalidateCards, useBinder, useTrades, type BinderResponse, type TradeHub } from '../../lib/queries';
import { countdown } from '../../lib/format';
import { haptic, sfx } from '../../lib/feedback';
import type { CardT, PublicUser, TradeT } from '../../lib/types';
import { useNow } from './common';
import t from './tcg.module.css';

/**
 * Social Hub → Trade (TCG Pocket, research/05 §1.12, research/13 §1.5):
 * - send: pick a Friend → pick a card → "shown the Trade Stamina and [Shinedust] cost" → "OK" → "OK" to send
 * - receive: "View" → "Trade" or "Decline" → pick a card of the same rarity → "OK"
 * - sender finishes: "swipe up to send your card"; offers lapse "within two days" [V-weak]
 * ☆ cards trade only in the Golden Blitz window (Monopoly GO: "the only way to trade gold stickers") [V].
 */

type Flow =
  | { kind: 'send'; step: 'friend' | 'card' | 'confirm' | 'proposed'; friend?: PublicUser; card?: CardT }
  | { kind: 'receive'; step: 'view' | 'pick' | 'confirm' | 'swap'; trade: TradeT; give?: CardT }
  | { kind: 'finish'; trade: TradeT; sent: boolean };

export default function Trades() {
  const { groupId } = useParams();
  const nav = useNavigate();
  const [sp, setSp] = useSearchParams();
  const hub = useTrades(groupId);
  const binder = useBinder(groupId);
  const now = useNow();
  const [flow, setFlow] = useState<Flow | null>(null);

  // Arriving from a card's "Trade" action: start a send with that card chosen.
  useEffect(() => {
    const offer = sp.get('offer');
    const card = offer ? binder.data?.cards.find((c) => c.id === offer) : null;
    if (card && !flow) {
      setFlow({ kind: 'send', step: 'friend', card });
      setSp({}, { replace: true });
    }
  }, [sp, binder.data, flow, setSp]);

  const h = hub.data;
  const close = () => {
    setFlow(null);
    invalidateCards(groupId!);
  };

  return (
    <Screen light className={t.screen}>
      <NavBar onBack={() => nav(-1)} title={tcg.trade} />
      <div className={t.scroll}>
        <div className={t.statusRow}>
          <span className={t.chipStat}>
            {tcg.tradeStamina}
            {h && <Pips value={h.stamina.value} max={h.stamina.max} label={tcg.tradeStamina} />}
            {h?.stamina.next ? <small>{countdown(h.stamina.next - now)}</small> : null}
          </span>
          <span className={t.chipStat}>
            <DustAmount value={h?.shinedust ?? 0} />
          </span>
        </div>
        {h && <BlitzBanner hub={h} now={now} />}
        <div className={t.panel} style={{ margin: '14px var(--margin) 0' }}>
          {(h?.trades ?? []).map((tr) => (
            <TradeRow key={tr.id} trade={tr} now={now} groupId={groupId!} onView={() => setFlow(tr.incoming ? { kind: 'receive', step: 'view', trade: tr } : { kind: 'finish', trade: tr, sent: false })} />
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 'calc(var(--safe-bottom) + 22px)', display: 'flex', justifyContent: 'center', zIndex: 5 }}>
        <button className={t.tealBtn} onClick={() => { haptic('medium'); setFlow({ kind: 'send', step: 'friend' }); }}>
          <Icon name="trade" size={20} />
          {tcg.trade}
        </button>
      </div>
      <AnimatePresence>
        {flow && h && binder.data && (
          <motion.div key="flow" className={t.detail} style={{ background: 'linear-gradient(180deg, #edf0f5, #e7ebf1)', color: 'var(--sys-label)', padding: 0, alignItems: 'stretch', fontFamily: 'var(--font-card)' }} initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 380, damping: 38 }}>
            {flow.kind === 'send' && <SendFlow flow={flow} setFlow={setFlow} hub={h} binder={binder.data} groupId={groupId!} onClose={close} />}
            {flow.kind === 'receive' && <ReceiveFlow flow={flow} setFlow={setFlow} hub={h} binder={binder.data} groupId={groupId!} onClose={close} />}
            {flow.kind === 'finish' && <FinishFlow flow={flow} setFlow={setFlow} groupId={groupId!} onClose={close} />}
          </motion.div>
        )}
      </AnimatePresence>
    </Screen>
  );
}

/* ───────────────────────── Golden Blitz banner ───────────────────────── */

function BlitzBanner({ hub, now }: { hub: TradeHub; now: number }) {
  const b = hub.blitz;
  const skew = b.now - Date.now();
  const target = b.isOpen ? b.closesAt : b.opensAt;
  return (
    <div
      style={{
        margin: '0 var(--margin)',
        borderRadius: 18,
        padding: '14px 16px',
        color: '#3a2a00',
        background: 'radial-gradient(circle at 18% 20%, #fff6c8 0%, var(--tcg-gold) 45%, color-mix(in srgb, var(--tcg-gold) 70%, #a2845e) 100%)',
        boxShadow: '0 10px 22px -14px rgba(162,132,94,0.9), inset 0 0 0 1px rgba(255,255,255,0.5)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <span style={{ display: 'flex', gap: 2, fontSize: 22, color: '#fff', textShadow: '0 1px 4px rgba(162,132,94,0.9)' }}>{RARITY_MARK.holo}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: '900 19px/1.05 var(--font-sf)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{monopoly.goldenBlitz}</div>
        <div style={{ font: '500 13px/1.3 var(--font-sf)', opacity: 0.8, marginTop: 2 }}>{monopoly.blitzLine}</div>
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 999, background: b.isOpen ? '#3a2a00' : 'rgba(255,255,255,0.6)', color: b.isOpen ? 'var(--tcg-gold)' : '#3a2a00', font: '700 14px/1 var(--font-sf)', fontVariantNumeric: 'tabular-nums' }}>
        <Icon name={b.isOpen ? 'timer' : 'lock'} size={15} />
        {countdown(target - (now + skew))}
      </span>
    </div>
  );
}

/* ───────────────────────── Trade list rows ───────────────────────── */

function TradeRow({ trade, now, groupId, onView }: { trade: TradeT; now: number; groupId: string; onView: () => void }) {
  const other = trade.incoming ? trade.from : trade.to;
  const card = trade.incoming ? trade.offer : trade.status === 'open' ? trade.offer : trade.give ?? trade.offer;
  const canView = (trade.incoming && trade.status === 'open') || (!trade.incoming && trade.status === 'accepted');
  const cancel = async () => {
    try {
      await api.post(`/groups/${groupId}/trades/${trade.id}/cancel`);
      invalidateCards(groupId);
    } catch {
      haptic('heavy');
    }
  };
  return (
    <div className={t.friendRow} style={{ opacity: ['declined', 'cancelled', 'expired'].includes(trade.status) ? 0.5 : 1 }}>
      <Avatar user={other} size={40} />
      <span className={t.friendName}>
        {other.name}
        <small style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name={trade.incoming ? 'chevronDown' : 'chevronUp'} size={13} strokeWidth={2.6} />
          {trade.status === 'open' && countdown(trade.expiresAt - now)}
        </small>
      </span>
      <span style={{ width: 40 }}>{card && <TcgCard card={card} />}</span>
      {canView ? (
        <button className={t.tealBtn} style={{ minWidth: 0, height: 34, padding: '0 16px', fontSize: 15 }} onClick={() => { haptic('light'); onView(); }}>
          {tcg.view}
        </button>
      ) : trade.status === 'open' ? (
        <button className="ios-bar-btn" onClick={cancel} aria-label={ios.cancel} style={{ color: 'var(--sys-label2)' }}>
          <Icon name="close" size={20} />
        </button>
      ) : (
        <span style={{ width: 44, display: 'grid', placeItems: 'center', color: trade.status === 'completed' || trade.status === 'accepted' ? 'var(--tcg-teal)' : 'var(--sys-label3)' }}>
          <Icon name={trade.status === 'expired' ? 'hourglass' : trade.status === 'completed' || trade.status === 'accepted' ? 'check' : 'close'} size={20} strokeWidth={2.6} />
        </span>
      )}
    </div>
  );
}

/* ───────────────────────── Shared bits ───────────────────────── */

function FlowHead({ title, onBack, onClose }: { title?: string; onBack?: () => void; onClose: () => void }) {
  return <NavBar onBack={onBack} title={title} trailing={<button className="ios-bar-btn" onClick={onClose}>{ios.cancel}</button>} />;
}

/** One tile per (moment, tier), like My Cards; numbered and flaired copies stay out of trades' way. */
function uniqueCards(cards: CardT[]) {
  const seen = new Map<string, CardT>();
  for (const c of cards) {
    const k = `${c.postId}:${c.rarity}`;
    const prev = seen.get(k);
    if (!prev || (prev.serial && !c.serial) || (prev.flair && !c.flair)) seen.set(k, c);
  }
  return [...seen.values()];
}

function CardPicker({ cards, locked, selected, onPick }: { cards: CardT[]; locked: (c: CardT) => boolean; selected?: string; onPick: (c: CardT) => void }) {
  return (
    <div className={t.pickGrid} style={{ padding: '4px var(--margin) 24px' }}>
      {cards.map((c) => (
        <div key={c.id} className={`${t.gridItem} ${selected === c.id ? t.picked : ''}`} onClick={() => !locked(c) && onPick(c)} style={{ position: 'relative' }}>
          <TcgCard card={c} />
          {locked(c) && (
            <span className={t.lock}>
              <Icon name="lock" size={20} />
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ───────────────────────── Send ───────────────────────── */

function SendFlow({ flow, setFlow, hub, binder, groupId, onClose }: { flow: Extract<Flow, { kind: 'send' }>; setFlow: (f: Flow) => void; hub: TradeHub; binder: BinderResponse; groupId: string; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  const locked = (c: CardT) => hub.ritualOnly.includes(c.rarity) && !hub.blitz.isOpen;
  const send = async () => {
    setBusy(true);
    try {
      await api.post(`/groups/${groupId}/trades`, { toUserId: flow.friend!.id, offerCardId: flow.card!.id });
      haptic('success');
      sfx.send();
      onClose();
    } catch {
      haptic('heavy');
    } finally {
      setBusy(false);
    }
  };
  const cost = flow.card ? hub.cost[flow.card.rarity] : 0;
  const affordable = hub.stamina.value >= 1 && hub.shinedust >= cost;
  return (
    <>
      {flow.step === 'friend' && (
        <>
          <FlowHead title={tcg.friends} onClose={onClose} />
          <div className={t.scroll}>
            <div className={t.panel} style={{ margin: '0 var(--margin)' }}>
              {hub.friends.map((f) => (
                <button key={f.id} className={t.friendRow} style={{ width: '100%', textAlign: 'left' }} onClick={() => setFlow({ ...flow, friend: f, step: flow.card ? 'confirm' : 'card' })}>
                  <Avatar user={f} size={40} />
                  <span className={t.friendName}>{f.name}</span>
                  <Icon name="chevronRight" size={16} color="var(--sys-label3)" strokeWidth={2.6} />
                </button>
              ))}
            </div>
          </div>
        </>
      )}
      {flow.step === 'card' && (
        <>
          <FlowHead title={tcg.myCards} onBack={() => setFlow({ ...flow, step: 'friend' })} onClose={onClose} />
          <div className={t.scroll}>
            <CardPicker cards={uniqueCards(binder.cards)} locked={locked} onPick={(c) => setFlow({ ...flow, card: c, step: 'confirm' })} />
          </div>
        </>
      )}
      {(flow.step === 'confirm' || flow.step === 'proposed') && flow.card && flow.friend && (
        <ShareLayout
          partner={flow.friend}
          card={flow.card}
          copies={flow.card.copies ?? 1}
          hub={hub}
          proposed={flow.step === 'proposed'}
          disabled={!affordable || busy || locked(flow.card)}
          onOk={() => (flow.step === 'confirm' ? setFlow({ ...flow, step: 'proposed' }) : send())}
          onBack={() => setFlow({ ...flow, step: flow.step === 'proposed' ? 'confirm' : 'card' })}
        />
      )}
    </>
  );
}

/**
 * Confirm step in TCG Pocket's share layout [I research/inspo/store/tcg-02-share-card.webp]: a mint pill with the
 * partner under it, the card large, and a white bottom sheet with "Number owned" and its "2 › 1" stepper, a
 * glowing cyan button and a round ↩. The sheet also shows the Trade Stamina and Shinedust cost [V-weak].
 */
function ShareLayout({ partner, card, copies, hub, proposed, disabled, onOk, onBack }: { partner: PublicUser; card: CardT; copies: number; hub: TradeHub; proposed?: boolean; disabled: boolean; onOk: () => void; onBack: () => void }) {
  const cost = hub.cost[card.rarity];
  return (
    <div className={t.share}>
      <div className={t.partnerPill}>{tcg.trade}</div>
      <div className={t.partner}>
        <Avatar user={partner} size={36} />
        {partner.name}
      </div>
      <motion.div
        style={{ width: 236, marginTop: 18 }}
        animate={proposed ? { y: -26, scale: 0.9, rotate: -3 } : { y: 0, scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 20 }}
      >
        <TcgCard card={card} tilt />
      </motion.div>
      <div className={t.shareSheet}>
        <span className={t.ownedLabel}>{tcg.numberOwned}</span>
        <span className={t.stepper}>
          {copies} <i>›</i> {Math.max(0, copies - 1)}
        </span>
        <span className={t.costLine}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {tcg.tradeStamina}
            <Pips value={1} max={1} label={tcg.tradeStamina} />
          </span>
          <DustAmount value={cost} style={{ color: hub.shinedust >= cost ? undefined : 'var(--sys-red)' }} />
        </span>
        <button className={t.cyanBtn} disabled={disabled} onClick={onOk}>
          {tcg.ok}
        </button>
        <button className={t.round} onClick={onBack} aria-label={ios.back}>
          <span>
            <Icon name="undo" size={22} />
          </span>
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────── Receive ───────────────────────── */

function ReceiveFlow({ flow, setFlow, hub, binder, groupId, onClose }: { flow: Extract<Flow, { kind: 'receive' }>; setFlow: (f: Flow) => void; hub: TradeHub; binder: BinderResponse; groupId: string; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  const offer = flow.trade.offer;
  const same = useMemo(() => uniqueCards(binder.cards).filter((c) => offer && c.rarity === offer.rarity), [binder.cards, offer]);
  const decline = async () => {
    setBusy(true);
    try {
      await api.post(`/groups/${groupId}/trades/${flow.trade.id}/decline`);
      haptic('light');
      onClose();
    } catch {
      haptic('heavy');
    } finally {
      setBusy(false);
    }
  };
  const accept = async () => {
    setBusy(true);
    try {
      await api.post(`/groups/${groupId}/trades/${flow.trade.id}/accept`, { giveCardId: flow.give!.id });
      haptic('success');
      sfx.sparkle();
      setFlow({ ...flow, step: 'swap' });
    } catch {
      haptic('heavy');
    } finally {
      setBusy(false);
    }
  };
  if (!offer) return null;
  const cost = hub.cost[offer.rarity];
  const affordable = hub.stamina.value >= 1 && hub.shinedust >= cost;
  return (
    <>
      <FlowHead title={tcg.trade} onBack={flow.step === 'pick' || flow.step === 'confirm' ? () => setFlow({ ...flow, step: flow.step === 'confirm' ? 'pick' : 'view' }) : undefined} onClose={onClose} />
      <div className={t.scroll}>
        {flow.step === 'view' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '6px 0 18px', font: '600 17px/1 var(--font-sf)' }}>
              <Avatar user={flow.trade.from} size={36} />
              {flow.trade.from.name}
            </div>
            <div style={{ width: 210, margin: '0 auto' }}>
              <TcgCard card={offer} tilt />
            </div>
            <div className={t.center} style={{ paddingTop: 26 }}>
              <button className={t.whiteBtn} style={{ height: 48, minWidth: 120 }} onClick={decline} disabled={busy}>
                {tcg.decline}
              </button>
              <button className={t.tealBtn} style={{ minWidth: 140 }} onClick={() => setFlow({ ...flow, step: 'pick' })} disabled={busy}>
                {tcg.acceptTrade}
              </button>
            </div>
          </>
        )}
        {flow.step === 'pick' && (
          <>
            <div style={{ width: 92, margin: '0 auto 14px' }}>
              <TcgCard card={offer} />
            </div>
            <CardPicker cards={same} locked={() => false} selected={flow.give?.id} onPick={(c) => setFlow({ ...flow, give: c })} />
            <div style={{ height: 90 }} />
            <div className={t.center} style={{ position: 'absolute', left: 0, right: 0, bottom: 'calc(var(--safe-bottom) + 20px)', zIndex: 3 }}>
              <button className={t.tealBtn} disabled={!flow.give} onClick={() => setFlow({ ...flow, step: 'confirm' })}>
                {tcg.ok}
              </button>
            </div>
          </>
        )}
        {flow.step === 'confirm' && flow.give && (
          <ShareLayout
            partner={flow.trade.from}
            card={flow.give}
            copies={flow.give.copies ?? 1}
            hub={hub}
            disabled={!affordable || busy}
            onOk={accept}
            onBack={() => setFlow({ ...flow, step: 'pick' })}
          />
        )}
        {flow.step === 'swap' && flow.give && <SwapAnimation mine={flow.give} theirs={offer} onDone={onClose} />}
      </div>
    </>
  );
}

/** A completed trade plays "a unique animation to commemorate the exchange" [V-weak]; its look is UNKNOWN, so the two cards simply cross. */
function SwapAnimation({ mine, theirs, onDone }: { mine: CardT; theirs: CardT; onDone: () => void }) {
  return (
    <div style={{ position: 'relative', height: 420 }}>
      <motion.div style={{ position: 'absolute', left: '50%', top: 40, width: 150, marginLeft: -75 }} initial={{ y: 200, x: 0, rotate: 0 }} animate={{ y: -420, rotate: -10, opacity: 0 }} transition={{ duration: 0.9, ease: 'easeIn' }}>
        <TcgCard card={mine} />
      </motion.div>
      <motion.div style={{ position: 'absolute', left: '50%', top: 40, width: 190, marginLeft: -95 }} initial={{ y: -420, rotate: 10, opacity: 0 }} animate={{ y: 0, rotate: 0, opacity: 1 }} transition={{ delay: 0.7, type: 'spring', stiffness: 160, damping: 18 }}>
        <TcgCard card={theirs} tilt isNew />
      </motion.div>
      <div className={t.center} style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
        <button className={t.whiteBtn} onClick={onDone}>
          {ios.done}
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────── Sender finishes: swipe up to send ───────────────────────── */

function FinishFlow({ flow, setFlow, groupId, onClose }: { flow: Extract<Flow, { kind: 'finish' }>; setFlow: (f: Flow) => void; groupId: string; onClose: () => void }) {
  const { offer, give } = flow.trade;
  const sending = useRef(false);
  const send = async () => {
    if (flow.sent || sending.current) return;
    sending.current = true;
    setFlow({ ...flow, sent: true });
    haptic('success');
    sfx.send();
    await api.post(`/groups/${groupId}/trades/${flow.trade.id}/finish`).catch(() => haptic('heavy'));
  };
  if (!offer || !give) return null;
  return (
    <>
      <FlowHead title={tcg.trade} onClose={onClose} />
      <div style={{ position: 'relative', flex: 1, width: '100%', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, font: '600 17px/1 var(--font-sf)', paddingTop: 4 }}>
          <Avatar user={flow.trade.to} size={36} />
          {flow.trade.to.name}
        </div>
        <motion.div
          style={{ position: 'absolute', left: '50%', top: 70, width: 190, marginLeft: -95 }}
          initial={false}
          animate={flow.sent ? { y: 0, opacity: 1, scale: 1 } : { y: -40, opacity: 0, scale: 0.8 }}
          transition={{ delay: flow.sent ? 0.55 : 0, type: 'spring', stiffness: 170, damping: 18 }}
        >
          <TcgCard card={give} tilt isNew />
        </motion.div>
        <motion.div
          style={{ position: 'absolute', left: '50%', top: 160, width: 190, marginLeft: -95, touchAction: 'none', cursor: 'grab' }}
          drag={flow.sent ? false : 'y'}
          dragConstraints={{ top: -400, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.y < -80 || info.velocity.y < -500) void send();
          }}
          animate={flow.sent ? { y: -700, opacity: 0, rotate: -6 } : { y: 0 }}
          transition={{ duration: 0.5, ease: 'easeIn' }}
          onClick={send}
        >
          <TcgCard card={offer} />
        </motion.div>
        {!flow.sent ? (
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 'calc(var(--safe-bottom) + 30px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, font: '700 17px/1 var(--font-sf)', pointerEvents: 'none' }}>
            <motion.span animate={{ y: [0, -8, 0] }} transition={{ duration: 1.1, repeat: Infinity }}>
              <Icon name="chevronUp" size={30} strokeWidth={2.6} />
            </motion.span>
            {tcg.swipeUpToSend}
          </div>
        ) : (
          <div className={t.center} style={{ position: 'absolute', left: 0, right: 0, bottom: 'calc(var(--safe-bottom) + 30px)' }}>
            <button className={t.whiteBtn} onClick={onClose}>
              {ios.done}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
