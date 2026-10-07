import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from 'react';
import { AnimatePresence, motion, useMotionValue, useTransform, animate } from 'motion/react';
import { useNavigate, useParams } from 'react-router';
import { ios, rarityRank, tcg } from '@app/shared';
import { NavBar } from '../../components/ios';
import { Icon } from '../../components/Icon';
import { PackArt, CUT_Y, type PackMascot } from '../../components/cards/PackArt';
import { GEM_COUNT, Gem, SparkleGlyph, TcgCard, isFullArt } from '../../components/cards/TcgCard';
import { ImmersiveView } from '../../components/cards/ImmersiveView';
import { DustAmount } from '../../components/cards/Currency';
import { api } from '../../lib/api';
import { invalidateCards, useBinder } from '../../lib/queries';
import { haptic, sfx } from '../../lib/feedback';
import type { CardT } from '../../lib/types';
import { useGroupSummary } from './common';
import p from './pack.module.css';

/**
 * Pack opening, in TCG Pocket's order (research/05 §1.5, research/13 §1.3), drawn after
 * research/inspo/frames/tcg-pack-tear.jpg, tcg-pack-open.jpg, tcg-card-reveal.jpg, tcg-card-next.jpg,
 * tcg-card-new.jpg, tcg-ex-flip.jpg, tcg-ex-new.jpg [I]:
 * 1. "Swipe across the top" to cut — a light line slices across the pack [I]; "re-created in sound and
 *    vibration" [V] (sfx.rip + haptic); the opened rim glows [I]
 * 2. "the stack of cards fly out into your open hand" [V-weak]
 * 3. one card at a time on a lilac→periwinkle→white backdrop, big silver rarity gems under it, "NEW" on new
 *    cards, ‹ › at the edges and a ⏩ "Tap and hold" button [I]; "swipe to reveal the next one", rarest last [V-weak];
 *    ☆ cards flip in with a holographic shimmer [I]
 * 4. rare tells: "a shining effect when you swipe", "a glowing light", "a cracking sound" [V-weak]
 * 5. all five shown together, then "'swipe up' to add them to your card dex" [V]; unique/total counter updates [V-weak]
 */

interface OpenResult {
  weekKey: string;
  rarePack: boolean;
  tell: 'none' | 'glow' | 'crack';
  dust: number;
  before: { unique: number; total: number };
  after: { unique: number; total: number };
  setRewards: string[];
  cards: CardT[];
}

type Stage = 'ready' | 'cut' | 'fly' | 'reveal' | 'summary' | 'register' | 'done';
const PACK_W = 300;
const CUT_PX = (CUT_Y / 178) * PACK_W * 1.78;
const MOTES = [[14, 12], [78, 22], [36, 34], [88, 8], [60, 41]] as const;
const GLINTS = [[-6, 30, 0], [100, 22, 0.5], [104, 70, 1.1], [-8, 80, 0.8]] as const;

export default function PackOpening() {
  const { groupId, packId } = useParams();
  const nav = useNavigate();
  const binder = useBinder(groupId);
  const { group } = useGroupSummary(groupId);
  const pack = binder.data?.packs.find((x) => x.id === packId);
  const [stage, setStage] = useState<Stage>('ready');
  const [result, setResult] = useState<OpenResult | null>(null);
  const opening = useRef<Promise<OpenResult | null> | null>(null);
  const [cut, setCut] = useState<{ x0: number; x: number } | null>(null);
  const [index, setIndex] = useState(0);
  const [shaking, setShaking] = useState(false);
  const [immersive, setImmersive] = useState<CardT | null>(null);
  const [count, setCount] = useState<{ unique: number; total: number } | null>(null);
  const lastRip = useRef(0);
  const ff = useRef<number | null>(null);
  const pressing = useRef(false);
  const ffRan = useRef(false);
  const holdT = useRef<number | null>(null);
  const mascot: PackMascot | null = group ? { species: group.mascot.species, outfit: group.mascot.outfit, level: group.mascot.stage?.level, name: group.mascot.name } : null;
  const done = () => nav(`/g/${groupId}/cards?tab=cards`, { replace: true });
  const shake = () => {
    setShaking(true);
    window.setTimeout(() => setShaking(false), 450);
  };

  // Rarest last ("the highest rarity card in the back").
  const order = useMemo(() => (result ? result.cards.map((c, i) => ({ c, i })).sort((a, b) => rarityRank(a.c.rarity) - rarityRank(b.c.rarity) || a.i - b.i).map((x) => x.c) : []), [result]);
  const rareTell = result && result.tell !== 'none';

  const startOpen = () => {
    if (opening.current) return;
    opening.current = api
      .post<OpenResult>(`/groups/${groupId}/packs/${packId}/open`)
      .then((r) => {
        setResult(r);
        setCount(r.before);
        return r;
      })
      .catch(() => {
        haptic('heavy');
        done();
        return null;
      });
  };

  /* ── 1. Cut ── */
  const zone = useRef<HTMLDivElement>(null);
  const local = (e: RPointerEvent) => e.clientX - zone.current!.getBoundingClientRect().left - 60; // zone starts 60px left of the pack
  const onDown = (e: RPointerEvent) => {
    if (stage !== 'ready') return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    startOpen();
    const x = local(e);
    setCut({ x0: x, x });
    haptic('light');
  };
  const onMove = (e: RPointerEvent) => {
    if (!cut || stage !== 'ready') return;
    const x = local(e);
    setCut({ ...cut, x });
    const progress = Math.abs(x - cut.x0) / PACK_W;
    const now = performance.now();
    if (now - lastRip.current > 70) {
      lastRip.current = now;
      sfx.rip(Math.min(1, progress));
      haptic('light');
    }
    if (progress >= 0.72) void finishCut();
  };
  const onUp = () => {
    if (stage === 'ready') setCut(null);
  };
  const finishCut = async () => {
    setStage('cut');
    setCut(null);
    haptic('medium');
    sfx.rip(1);
    const r = await opening.current;
    if (!r) return;
    if (r.tell === 'crack') {
      sfx.crack();
      haptic('heavy');
      shake();
    }
    window.setTimeout(() => setStage('fly'), r.tell === 'none' ? 650 : 1200);
    window.setTimeout(() => setStage('reveal'), r.tell === 'none' ? 1550 : 2100);
  };

  /* ── 3. Reveal tells for the card coming up ── */
  useEffect(() => {
    if (stage !== 'reveal') return;
    const c = order[index];
    if (!c) return;
    if (c.rarity === 'immersive') {
      sfx.crack();
      haptic('heavy');
      shake();
    } else if (c.rarity === 'holo') {
      sfx.sparkle();
      haptic('medium');
    } else haptic('light');
  }, [stage, index, order]);

  const next = () => {
    if (index + 1 >= order.length) {
      stopFF();
      setStage('summary');
      sfx.pop();
    } else setIndex((n) => Math.min(order.length - 1, n + 1));
  };
  const prev = () => index > 0 && setIndex(index - 1);
  // ⏩ "Tap and hold": hold to run through the rest.
  const startFF = () => {
    if (ff.current) return;
    ff.current = window.setInterval(() => {
      setIndex((n) => {
        if (n + 1 >= order.length) {
          stopFF();
          setStage('summary');
          sfx.pop();
          return n;
        }
        return n + 1;
      });
    }, 260);
  };
  const stopFF = () => {
    if (ff.current) window.clearInterval(ff.current);
    ff.current = null;
  };
  useEffect(() => stopFF, []);
  const release = () => {
    pressing.current = false;
    if (holdT.current) window.clearTimeout(holdT.current);
    stopFF();
  };

  /* ── 5. Swipe up to register ── */
  const upStart = useRef<number | null>(null);
  const register = () => {
    if (stage !== 'summary' || !result) return;
    setStage('register');
    haptic('success');
    sfx.send();
    invalidateCards(groupId!);
    window.setTimeout(() => {
      setCount(result.after);
      sfx.sparkle();
    }, 750);
    window.setTimeout(() => setStage('done'), 900);
    window.setTimeout(done, 2900);
  };

  if (!pack && !result) {
    return (
      <div className={p.stage} data-light>
        <NavBar onBack={() => nav(-1)} />
      </div>
    );
  }

  const topCard = order[index];
  const revealing = stage === 'reveal' || stage === 'summary' || stage === 'register' || stage === 'done';
  const glowColor = topCard && stage === 'reveal' ? (topCard.rarity === 'immersive' ? 'var(--tcg-gold)' : topCard.rarity === 'holo' ? '#ffffff' : null) : null;

  return (
    <div
      className={`${p.stage} ${shaking ? p.shake : ''}`}
      data-light
      data-reveal={revealing || undefined}
      onPointerDown={(e) => {
        if (stage === 'summary') upStart.current = e.clientY;
      }}
      onPointerUp={(e) => {
        if (stage === 'summary' && upStart.current != null && upStart.current - e.clientY > 60) register();
        upStart.current = null;
      }}
      onWheel={(e) => {
        if (stage === 'summary' && e.deltaY > 30) register();
      }}
    >
      {MOTES.map(([x, y], i) => (
        <span key={i} className={p.mote} style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 0.6}s` }} />
      ))}
      <div className={p.top}>
        <button className="ios-glass-circle" onClick={() => (result ? done() : nav(-1))} aria-label={ios.close} style={{ background: 'rgba(255,255,255,0.85)', color: '#4a4f57' }}>
          <Icon name="close" size={20} />
        </button>
        {count && (stage === 'summary' || stage === 'register' || stage === 'done') && (
          <motion.span className={p.counter} key={count.total} initial={{ scale: 1.2 }} animate={{ scale: 1 }}>
            <Icon name="card" size={17} />
            {tcg.collectionCounter(count.unique, count.total)}
          </motion.span>
        )}
      </div>

      {/* Glow tell behind the pack / the next rare card */}
      <AnimatePresence>
        {((rareTell && (stage === 'cut' || stage === 'fly')) || glowColor) && (
          <motion.div
            key={glowColor ?? 'pack'}
            className={p.rays}
            style={{ '--glow': glowColor ?? (result?.tell === 'crack' ? 'var(--tcg-gold)' : '#ffffff'), top: stage === 'reveal' ? 'calc(27% + 200px)' : undefined } as CSSProperties}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>
      {result?.rarePack && (stage === 'cut' || stage === 'fly') && (
        <motion.div className={p.rarePack} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }}>
          {tcg.rarePack}
        </motion.div>
      )}

      {/* 1. Pack + cut */}
      {(stage === 'ready' || stage === 'cut' || stage === 'fly') && pack && (
        <>
          {stage === 'ready' && (
            <div className={p.hint} style={{ top: 'calc(44% - 70px)' }}>
              {tcg.swipeToOpen}
            </div>
          )}
          <motion.div
            className={p.packWrap}
            animate={stage === 'fly' ? { y: 620 } : stage === 'ready' ? { y: [0, -6, 0] } : { y: 0 }}
            transition={stage === 'fly' ? { duration: 0.8, ease: [0.55, 0, 0.8, 0.3], delay: 0.45 } : stage === 'ready' ? { duration: 3, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
          >
            {stage === 'ready' ? (
              <PackArt weekKey={pack.weekKey} mascot={mascot} guide />
            ) : (
              <>
                <PackArt weekKey={pack.weekKey} mascot={mascot} part="body" />
                <motion.div className={p.rim} style={{ top: CUT_PX }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} />
                <motion.div
                  style={{ position: 'absolute', inset: 0, zIndex: 12 }}
                  initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                  animate={{ x: 190, y: -330, rotate: 28, opacity: 0.9 }}
                  transition={{ duration: 0.75, ease: 'easeOut' }}
                >
                  <PackArt weekKey={pack.weekKey} mascot={mascot} part="top" />
                </motion.div>
                {stage === 'cut' && (
                  <motion.div className={p.lightLine} data-rare={rareTell || undefined} style={{ top: CUT_PX, width: PACK_W + 400 }} initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.6, delay: 0.15 }} />
                )}
              </>
            )}
            {stage === 'ready' && (
              <div ref={zone} className={p.cutZone} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} aria-label={tcg.swipeToOpen} role="button">
                {cut && <div className={p.lightLine} data-rare={rareTell || undefined} style={{ top: 10 + CUT_PX, left: 60 + Math.min(cut.x0, cut.x) - 40, width: Math.abs(cut.x - cut.x0) + 40 }} />}
                {!cut && (
                  <motion.div
                    className={p.finger}
                    style={{ top: 10 + CUT_PX }}
                    initial={{ left: 50, opacity: 0 }}
                    animate={{ left: [50, 50, 60 + PACK_W + 10, 60 + PACK_W + 10], opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 1.8, times: [0, 0.15, 0.8, 1], repeat: Infinity, repeatDelay: 0.4 }}
                  />
                )}
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* 2. The stack flies out of the pack */}
      {stage === 'fly' && order.length > 0 && (
        <motion.div className={p.stack} initial={{ y: 260, scale: 0.86, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 150, damping: 18, delay: 0.05 }} style={{ zIndex: 9 }}>
          <div className={p.stackSizer} />
          {order.slice(0, 3).reverse().map((c, i) => (
            <div key={c.id} className={p.stackCard} style={{ transform: `translate(${(2 - i) * 3}px, ${(2 - i) * 4}px)` }}>
              <TcgCard card={c} />
            </div>
          ))}
        </motion.div>
      )}

      {/* 3. One card at a time */}
      {stage === 'reveal' && topCard && (
        <>
          <div className={p.stack}>
            <div className={p.stackSizer} />
            <SwipeCard key={topCard.id} card={topCard} onGone={next} onHold={topCard.rarity === 'immersive' && topCard.post?.media.live ? () => setImmersive(topCard) : undefined} />
            {GLINTS.map(([x, y, d], i) => (
              <span key={`${topCard.id}${i}`} className={p.glint} style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s` }}>
                <SparkleGlyph size={i % 2 ? 16 : 26} />
              </span>
            ))}
          </div>
          <motion.div key={`g${topCard.id}`} className={p.gems} initial={{ scale: 0.4, opacity: 0, filter: 'brightness(3)' }} animate={{ scale: 1, opacity: 1, filter: 'brightness(1)' }} transition={{ delay: 0.2, duration: 0.5 }}>
            {Array.from({ length: GEM_COUNT[topCard.rarity] }, (_, i) => (
              <Gem key={i} rarity={topCard.rarity} size={50} big />
            ))}
          </motion.div>
          <button className={p.edgeArrow} style={{ left: 0 }} onClick={prev} disabled={index === 0} aria-label={ios.back}>
            <Icon name="chevronLeft" size={34} strokeWidth={1.6} />
          </button>
          <button className={p.edgeArrow} style={{ right: 0 }} onClick={next} aria-label={ios.next}>
            <Icon name="chevronRight" size={34} strokeWidth={1.6} />
          </button>
          <button
            className={p.ff}
            onPointerDown={() => {
              pressing.current = true;
              ffRan.current = false;
              holdT.current = window.setTimeout(() => {
                if (!pressing.current) return;
                ffRan.current = true;
                startFF();
              }, 380);
            }}
            onPointerUp={release}
            onPointerLeave={release}
            onPointerCancel={release}
            onClick={() => {
              if (!ffRan.current) next();
            }}
          >
            <span>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
                <path d="M3.5 6.5v11l8-5.5-8-5.5ZM12.5 6.5v11l8-5.5-8-5.5Z" />
              </svg>
            </span>
            {tcg.tapAndHold}
          </button>
        </>
      )}

      {/* 5. All five together, then swipe up */}
      {(stage === 'summary' || stage === 'register' || stage === 'done') && result && (
        <>
          <div className={p.summary}>
            {order.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={stage === 'summary' ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -520, scale: 0.3 }}
                transition={stage === 'summary' ? { delay: i * 0.06, type: 'spring', stiffness: 260, damping: 22 } : { delay: i * 0.05, duration: 0.55, ease: [0.6, 0, 0.8, 0.4] }}
              >
                <TcgCard card={c} isNew={c.isNew} />
              </motion.div>
            ))}
          </div>
          {stage === 'summary' && (
            <button className={p.swipeUp} onClick={register}>
              <Icon name="chevronUp" size={30} strokeWidth={2.6} />
              {tcg.swipeUp}
            </button>
          )}
          {stage !== 'summary' && result.dust > 0 && (
            <motion.div className={p.hint} style={{ top: '52%' }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
              <span className={p.gain}>
                + <DustAmount value={result.dust} size={20} />
              </span>
            </motion.div>
          )}
        </>
      )}

      <AnimatePresence>{immersive && <ImmersiveView card={immersive} onClose={() => setImmersive(null)} />}</AnimatePresence>
    </div>
  );
}

/** The card on show: drag sideways (or tap) to send it away; ☆ and up flip in with a shimmer [I tcg-ex-flip.jpg]. */
function SwipeCard({ card, onGone, onHold }: { card: CardT; onGone: () => void; onHold?: () => void }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-18, 18]);
  const gone = useRef(false);
  const rare = isFullArt(card.rarity);
  const fling = (dir: number) => {
    if (gone.current) return;
    gone.current = true;
    void animate(x, dir * 560, { duration: 0.3, ease: 'easeIn' }).then(onGone);
  };
  return (
    <motion.div
      className={p.stackCard}
      style={{ x, rotate, zIndex: 5, cursor: 'grab', transformPerspective: 900 }}
      drag="x"
      dragSnapToOrigin
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 70 || Math.abs(info.velocity.x) > 450) fling(Math.sign(info.offset.x || info.velocity.x));
      }}
      initial={rare ? { rotateY: 100, scale: 0.9 } : { scale: 0.94, opacity: 0.6 }}
      animate={rare ? { rotateY: 0, scale: 1 } : { scale: 1, opacity: 1 }}
      transition={rare ? { type: 'spring', stiffness: 120, damping: 14 } : { duration: 0.22 }}
    >
      <TcgCard card={card} tilt isNew={card.isNew} onClick={() => fling(-1)} onHoldStart={onHold} />
    </motion.div>
  );
}
