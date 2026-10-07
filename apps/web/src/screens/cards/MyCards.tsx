import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { AnimatePresence } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router';
import { PACK_POINT_COST, RARITY_NAME, ios, tcg } from '@app/shared';
import { BarButton, NavBar, Segmented, Sheet, Switch, Avatar } from '../../components/ios';
import { Icon } from '../../components/Icon';
import { DexSlot, RarityMark, TcgCard, cardName, cardNumber } from '../../components/cards/TcgCard';
import { api } from '../../lib/api';
import { invalidateCards, useShop, useSocial, type BinderResponse } from '../../lib/queries';
import { weekRange } from '../../lib/format';
import { haptic, sfx } from '../../lib/feedback';
import type { CardFaceT, CardT, ShowcaseT, ShopItemT } from '../../lib/types';
import { CardDetail } from './CardDetail';
import t from './tcg.module.css';

type Thunk = { (): Promise<unknown> };

/**
 * My Cards (TCG Pocket): "By default, your cards display in three columns, but you can pinch the screen to
 * zoom outward and increase the number of columns up to 11" [V]; the Card Dex toggle "lists every missing
 * card with all details except the card's appearance" [V]; filter by booster pack (here: by set = week) [V];
 * wishlist up to 20 with 3 highlighted [V]; Binders (30 cards) and Display Boards with Private / Friends only
 * visibility [V]. Sets also work like Monopoly GO albums: completing one gives a reward [V].
 */

type View = 'grid' | 'binders' | 'displays';
const MIN_COLS = 3;
const MAX_COLS = 11;
/** [I research/inspo/store/tcg-04-my-cards.webp] shows five columns; Pocket's stated default is three [V-weak]. */
const DEFAULT_COLS = 5;

function readCols() {
  try {
    const n = Number(localStorage.getItem('roll.cardCols'));
    return n >= MIN_COLS && n <= MAX_COLS ? n : DEFAULT_COLS;
  } catch {
    return DEFAULT_COLS;
  }
}

/** Two-pointer pinch and ctrl+wheel (trackpad pinch) change the column count. */
function usePinchColumns(ref: RefObject<HTMLDivElement | null>) {
  const [cols, setCols] = useState(readCols);
  const colsRef = useRef(cols);
  colsRef.current = cols;
  useEffect(() => {
    try {
      localStorage.setItem('roll.cardCols', String(cols));
    } catch {
      /* storage unavailable */
    }
  }, [cols]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const pts = new Map<number, { x: number; y: number }>();
    let d0 = 0;
    let c0 = colsRef.current;
    let wheel = 0;
    const clamp = (n: number) => Math.max(MIN_COLS, Math.min(MAX_COLS, n));
    const dist = () => {
      const [a, b] = [...pts.values()];
      return Math.hypot(a.x - b.x, a.y - b.y);
    };
    const apply = (n: number) => {
      if (n !== colsRef.current) {
        colsRef.current = n;
        setCols(n);
        haptic('light');
      }
    };
    const down = (e: PointerEvent) => {
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2) {
        d0 = dist();
        c0 = colsRef.current;
      }
    };
    const move = (e: PointerEvent) => {
      if (!pts.has(e.pointerId)) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2 && d0 > 0) apply(clamp(Math.round((c0 * d0) / Math.max(1, dist()))));
    };
    const up = (e: PointerEvent) => {
      pts.delete(e.pointerId);
      if (pts.size < 2) d0 = 0;
    };
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      wheel += e.deltaY;
      if (Math.abs(wheel) > 24) {
        apply(clamp(colsRef.current + Math.sign(wheel)));
        wheel = 0;
      }
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.removeEventListener('wheel', onWheel);
    };
  }, [ref]);
  return cols;
}

const key = (c: { postId: string; rarity: string }) => `${c.postId}:${c.rarity}`;

export function MyCardsTab({ groupId, data }: { groupId: string; data: BinderResponse | undefined; onBack?: () => void }) {
  const [sp, setSp] = useSearchParams();
  const dexMode = sp.get('dex') === '1';
  const [wishOnly, setWishOnly] = useState(false);
  const [set, setSet] = useState<string | null>(null);
  const [view, setView] = useState<View>('grid');
  const [detail, setDetail] = useState<CardT | null>(null);
  const [dexEntry, setDexEntry] = useState<CardFaceT | null>(null);
  const [editor, setEditor] = useState<{ kind: 'binder' | 'display'; showcase?: ShowcaseT; seed?: CardT } | null>(null);
  const [openBinder, setOpenBinder] = useState<string | null>(null);
  const [filters, setFilters] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const cols = usePinchColumns(gridRef);
  const social = useSocial(groupId);
  const mine = (social.data?.showcases ?? []).filter((x) => x.mine);

  const wish = useMemo(() => new Map((data?.wishlist ?? []).map((w) => [key(w), w.highlighted ? ('hi' as const) : ('on' as const)])), [data]);

  // Owned cards, one tile per (moment, tier), with the copy count (TCG shows duplicates as one card).
  const owned = useMemo(() => {
    const m = new Map<string, CardT>();
    for (const c of data?.cards ?? []) {
      const prev = m.get(key(c));
      const better = !prev || (c.serial && !prev.serial) || (c.flair && !prev.flair && !prev.serial);
      if (better) m.set(key(c), c);
    }
    return m;
  }, [data]);

  const entries = useMemo(() => {
    const dex = (data?.dex ?? []).filter((d) => (!set || d.number?.set === set) && (!wishOnly || wish.has(key(d))));
    return dex.filter((d) => dexMode || owned.has(key(d)));
  }, [data, set, wishOnly, wish, dexMode, owned]);

  const sections = useMemo(() => {
    const out: { set: string; items: typeof entries }[] = [];
    for (const e of entries) {
      const s = e.number?.set ?? '';
      if (out[out.length - 1]?.set !== s) out.push({ set: s, items: [] });
      out[out.length - 1].items.push(e);
    }
    return out;
  }, [entries]);

  if (view !== 'grid') {
    return (
      <>
        <div style={{ flex: 'none', height: 40 }} />
        <NavBar onBack={() => (openBinder ? setOpenBinder(null) : setView('grid'))} title={view === 'binders' ? tcg.binders : tcg.displayBoards}
          trailing={
            openBinder ? (
              <BarButton onClick={() => setEditor({ kind: 'binder', showcase: mine.find((x) => x.id === openBinder) })}>{ios.edit}</BarButton>
            ) : (
              <BarButton label={ios.more} onClick={() => setEditor({ kind: view === 'binders' ? 'binder' : 'display' })} disabled={view === 'binders' && mine.filter((x) => x.kind === 'binder').length >= (data?.limits.binders ?? 15)}>
                <Icon name="plus" size={24} />
              </BarButton>
            )
          }
        />
        <div className={t.scroll}>
          {view === 'binders' && !openBinder && (
            <div style={{ display: 'grid', gap: 12, padding: '4px var(--margin) 0' }}>
              {mine.filter((x) => x.kind === 'binder').map((b) => (
                <button key={b.id} onClick={() => setOpenBinder(b.id)} style={{ textAlign: 'left' }}>
                  <BinderCover showcase={b} slots={data?.binderSlots ?? 30} />
                </button>
              ))}
            </div>
          )}
          {view === 'binders' && openBinder && <BinderPages showcase={mine.find((x) => x.id === openBinder)} slots={data?.binderSlots ?? 30} onCard={setDetail} />}
          {view === 'displays' && (
            <div style={{ display: 'grid', gap: 12, padding: '4px var(--margin) 0' }}>
              {mine.filter((x) => x.kind === 'display').map((d) => (
                <button key={d.id} onClick={() => setEditor({ kind: 'display', showcase: d })}>
                  <DisplayBoard showcase={d} />
                </button>
              ))}
            </div>
          )}
        </div>
        <ShowcaseEditor groupId={groupId} data={data} editor={editor} onClose={() => setEditor(null)} />
        <AnimatePresence>
          {detail && data && <CardDetail card={detail} data={data} groupId={groupId} onClose={() => setDetail(null)} onShowcase={(k, c) => { setDetail(null); setEditor({ kind: k, seed: c }); }} />}
        </AnimatePresence>
      </>
    );
  }

  return (
    <>
      {/* The section control above stands in for the "My Cards" header; the thin rainbow line under it is [I tcg-04-my-cards.webp] */}
      <header className={t.myHead} aria-hidden />
      <div className={t.scroll}>
        {/* Frosted panel: Binders / Display Boards squares; count pill, Card Dex toggle, magnifier [I] */}
        <div className={t.frost}>
          <div className={t.squareRow}>
            <button className={t.square} onClick={() => setView('binders')}>
              <span>
                <Icon name="cards" size={28} />
              </span>
              {tcg.binders}
            </button>
            <button className={t.square} onClick={() => setView('displays')}>
              <span>
                <Icon name="card" size={28} />
              </span>
              {tcg.displayBoards}
            </button>
          </div>
          <div className={t.frostRow}>
            <span className={t.countPill}>
              <Icon name="card" size={16} />
              {(data?.counter.total ?? 0).toLocaleString()}
            </span>
            <span className={t.dexToggle}>
              <span aria-hidden>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="5" y="3" width="14" height="18" rx="2" />
                  <circle cx="12" cy="12" r="3.6" />
                  <path d="M8.4 12h7.2" />
                </svg>
              </span>
              <Switch on={dexMode} label={tcg.cardDex} onChange={(v) => setSp(v ? { tab: 'cards', dex: '1' } : { tab: 'cards' }, { replace: true })} />
            </span>
            <span className={t.vsep} />
            <button className="ios-bar-btn" style={{ color: '#4a4f57', minWidth: 36, padding: 0 }} onClick={() => setFilters(true)} aria-label={ios.search}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <circle cx="10.5" cy="10.5" r="6" />
                <path d="m15 15 5 5" />
              </svg>
              {(set || wishOnly) && <span style={{ position: 'absolute', marginLeft: 22, marginTop: -16, width: 8, height: 8, borderRadius: 4, background: 'var(--tcg-teal)' }} />}
            </button>
          </div>
        </div>

        <div ref={gridRef} className={t.grid} style={{ '--cols': cols, '--gap': `${Math.max(4, 15 - cols)}px` } as CSSProperties}>
          {sections.map((sec) => (
            <Section key={sec.set} set={sec.set} meta={data?.sets.find((x) => x.weekKey === sec.set)}>
              {sec.items.map((d) => {
                const c = owned.get(key(d));
                return (
                  <div key={key(d)} className={t.gridItem}>
                    {c ? (
                      <TcgCard card={c} copies={c.copies} wish={wish.get(key(d)) ?? null} onClick={() => { haptic('light'); setDetail(c); }} />
                    ) : (
                      <DexSlot card={d} wish={wish.get(key(d)) ?? null} onClick={() => setDexEntry(d)} />
                    )}
                  </div>
                );
              })}
            </Section>
          ))}
        </div>
      </div>

      <Sheet open={filters} onClose={() => setFilters(false)} light>
        <div className={t.chips} style={{ padding: '4px 0 12px', flexWrap: 'wrap' }}>
          <button className={t.chip} aria-pressed={wishOnly} onClick={() => { haptic('light'); setWishOnly((w) => !w); }}>
            <Icon name="heart" size={15} filled={wishOnly} />
            {tcg.wishlist}
            <small>
              {data?.wishlist.length ?? 0}/{data?.limits.wishlist ?? 20}
            </small>
          </button>
          {(data?.sets ?? []).map((st) => (
            <button key={st.weekKey} className={t.chip} aria-pressed={set === st.weekKey} onClick={() => { haptic('light'); setSet((x) => (x === st.weekKey ? null : st.weekKey)); }}>
              {weekRange(st.weekKey)}
              <small>
                {st.owned}/{st.of}
              </small>
              {st.rewarded && <Icon name="gift" size={14} />}
            </button>
          ))}
        </div>
      </Sheet>
      <DexSheet groupId={groupId} entry={dexEntry} data={data} wish={dexEntry ? wish.get(key(dexEntry)) ?? null : null} onClose={() => setDexEntry(null)} />
      <ShowcaseEditor groupId={groupId} data={data} editor={editor} onClose={() => setEditor(null)} />
      <AnimatePresence>
        {detail && data && (
          <CardDetail
            card={data.cards.find((c) => c.id === detail.id) ?? detail}
            data={data}
            groupId={groupId}
            onClose={() => setDetail(null)}
            onShowcase={(k, c) => { setDetail(null); setEditor({ kind: k, seed: c }); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function Section({ set, meta, children }: { set: string; meta?: { owned: number; of: number; rewarded: boolean }; children: ReactNode }) {
  return (
    <>
      <div className={t.setHead}>
        <span>{weekRange(set)}</span>
        {meta && (
          <small style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            {meta.rewarded && <Icon name="gift" size={14} color="var(--tcg-teal)" />}
            {meta.owned}/{meta.of}
          </small>
        )}
      </div>
      {children}
    </>
  );
}

/* ───────────────────────── Card Dex entry: wishlist & Pack Points exchange ───────────────────────── */

function DexSheet({ groupId, entry, data, wish, onClose }: { groupId: string; entry: CardFaceT | null; data: BinderResponse | undefined; wish: 'on' | 'hi' | null; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  const cost = entry ? PACK_POINT_COST[entry.rarity] : 0;
  const run = async (fn: Thunk, success = false) => {
    setBusy(true);
    try {
      await fn();
      haptic(success ? 'success' : 'light');
      invalidateCards(groupId);
    } catch {
      haptic('heavy');
    } finally {
      setBusy(false);
    }
  };
  const setWish = (on: boolean, highlighted = false) =>
    run(() => api.post(`/groups/${groupId}/wishlist`, { postId: entry!.postId, rarity: entry!.rarity, on, highlighted }));
  return (
    <Sheet open={Boolean(entry)} onClose={onClose} light title={entry ? cardNumber(entry.number) : ''}>
      {entry && (
        <>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center', padding: '6px 4px 18px' }}>
            <div style={{ width: 120, flex: 'none' }}>
              <DexSlot card={entry} wish={wish} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ font: '700 18px/1.2 var(--font-card)' }}>{cardName(entry.post)}</div>
              <div style={{ font: '500 14px/1.4 var(--font-card)', color: 'var(--sys-label2)', marginTop: 4 }}>{entry.post ? tcg.illus(entry.post.user.name) : ''}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8, font: '600 14px/1 var(--font-sf)' }}>
                <RarityMark rarity={entry.rarity} size={16} />
                {RARITY_NAME[entry.rarity]}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className={t.whiteBtn} disabled={busy} onClick={() => setWish(!wish)} aria-pressed={Boolean(wish)} style={wish ? { color: 'var(--sys-pink)' } : undefined}>
              <Icon name="heart" size={17} filled={Boolean(wish)} />
              {tcg.wishlist}
            </button>
            {wish && (
              <button className={t.whiteBtn} disabled={busy} onClick={() => setWish(true, wish !== 'hi')} aria-label={tcg.wishlist} style={{ color: wish === 'hi' ? 'var(--tcg-gold)' : 'var(--sys-label3)' }}>
                <Icon name="pin" size={17} filled={wish === 'hi'} />
              </button>
            )}
          </div>
          <div className={t.sheetFoot} style={{ flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <span className={t.chipStat}>
              {tcg.packPoints}
              <b>{cost.toLocaleString()}</b>
              <small>/ {(data?.packPoints ?? 0).toLocaleString()}</small>
            </span>
            <button className={t.tealBtn} disabled={busy || (data?.packPoints ?? 0) < cost} onClick={() => run(async () => { await api.post(`/groups/${groupId}/exchange`, { postId: entry.postId, rarity: entry.rarity }); sfx.sparkle(); onClose(); }, true)}>
              {tcg.exchange}
            </button>
          </div>
        </>
      )}
    </Sheet>
  );
}

/* ───────────────────────── Binders & Display Boards ───────────────────────── */

function colorVars(item: ShopItemT | undefined) {
  return item?.color ? ({ '--cv-from': item.color.from, '--cv-to': item.color.to } as CSSProperties) : undefined;
}

function useStyleItems() {
  const shop = useShop();
  const items = shop.data?.items ?? [];
  return {
    covers: items.filter((i) => i.kind === 'cover'),
    backdrops: items.filter((i) => i.kind === 'backdrop'),
    byId: (id: string | null) => items.find((i) => i.id === id),
  };
}

/** "Binder covers display above your card collections and each have differing colours of background" [V]. */
export function BinderCover({ showcase, slots }: { showcase: ShowcaseT; slots: number }) {
  const { byId } = useStyleItems();
  const fan = showcase.cards.slice(0, 3);
  return (
    <div className={t.binderCard} style={colorVars(byId(showcase.style))}>
      <span className={t.binderSpine} />
      <div className={t.binderFan}>
        {fan.map((c, i) => (
          <div key={c.id} style={{ left: i * 22, transform: `rotate(${(i - 1) * 7}deg)`, zIndex: i }}>
            <TcgCard card={c} />
          </div>
        ))}
      </div>
      <span className={t.binderMeta}>
        {showcase.owner && <Avatar user={showcase.owner} size={22} />}
        {showcase.cards.length}/{slots}
      </span>
      <span className={t.binderMeta} style={{ opacity: 0.9 }}>
        <Icon name={showcase.visibility === 'private' ? 'lock' : 'people'} size={16} />
      </span>
    </div>
  );
}

function BinderPages({ showcase, slots, onCard }: { showcase: ShowcaseT | undefined; slots: number; onCard: (c: CardT) => void }) {
  if (!showcase) return null;
  return (
    <div style={{ padding: '0 var(--margin)' }}>
      <BinderCover showcase={showcase} slots={slots} />
      <div className={t.grid} style={{ '--cols': 3, padding: '14px 0 0' } as CSSProperties}>
        {Array.from({ length: slots }, (_, i) => {
          const c = showcase.cards[i];
          return c ? (
            <div key={c.id} className={t.gridItem}>
              <TcgCard card={c} onClick={() => onCard(c)} />
            </div>
          ) : (
            <div key={i} style={{ aspectRatio: '63 / 88', borderRadius: 8, border: '1.5px dashed var(--tcg-frame)' }} />
          );
        })}
      </div>
    </div>
  );
}

/** Display Board: "a single card wrapped in a proper encasing", on a backdrop [V]. */
export function DisplayBoard({ showcase }: { showcase: ShowcaseT }) {
  const { byId } = useStyleItems();
  const c = showcase.cards[0];
  return (
    <div className={t.display} style={colorVars(byId(showcase.style))}>
      {showcase.owner && !showcase.mine && (
        <span className={t.ownerTag}>
          <Avatar user={showcase.owner} size={22} />
          {showcase.owner.name}
        </span>
      )}
      {showcase.mine && (
        <span className={t.ownerTag} style={{ padding: 6 }}>
          <Icon name={showcase.visibility === 'private' ? 'lock' : 'people'} size={14} />
        </span>
      )}
      <div className={t.encasing}>{c && <TcgCard card={c} tilt />}</div>
    </div>
  );
}

function ShowcaseEditor({ groupId, data, editor, onClose }: { groupId: string; data: BinderResponse | undefined; editor: { kind: 'binder' | 'display'; showcase?: ShowcaseT; seed?: CardT } | null; onClose: () => void }) {
  const nav = useNavigate();
  const { covers, backdrops } = useStyleItems();
  const [cards, setCards] = useState<string[]>([]);
  const [style, setStyle] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<'private' | 'friends'>('friends');
  const [busy, setBusy] = useState(false);
  const social = useSocial(groupId);
  const existingBinders = (social.data?.showcases ?? []).filter((x) => x.mine && x.kind === 'binder');
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    if (!editor) return;
    setCards(editor.showcase ? editor.showcase.cards.map((c) => c.id) : editor.seed ? [editor.seed.id] : []);
    setStyle(editor.showcase?.style ?? null);
    setVisibility(editor.showcase?.visibility ?? 'friends');
    setTarget(editor.showcase?.id ?? null);
  }, [editor]);

  const isDisplay = editor?.kind === 'display';
  const max = isDisplay ? 1 : data?.binderSlots ?? 30;
  const options = (isDisplay ? backdrops : covers).filter((i) => i.owned);
  const toggle = (id: string) => {
    haptic('light');
    setCards((cs) => (cs.includes(id) ? cs.filter((x) => x !== id) : isDisplay ? [id] : cs.length < max ? [...cs, id] : cs));
  };
  const save = async () => {
    if (!editor) return;
    setBusy(true);
    try {
      let ids = cards;
      let id = target ?? undefined;
      // Adding a card from its detail view into an existing binder keeps that binder's cards.
      if (!editor.showcase && target && editor.seed) {
        const b = existingBinders.find((x) => x.id === target);
        ids = [...new Set([...(b?.cards.map((c) => c.id) ?? []), ...cards])].slice(0, max);
        id = target;
      }
      const existing = id ? existingBinders.find((x) => x.id === id) : undefined;
      await api.post(`/groups/${groupId}/showcases`, { id, kind: editor.kind, cardIds: ids, style: existing && !editor.showcase ? existing.style : style, visibility: existing && !editor.showcase ? existing.visibility : visibility });
      haptic('success');
      invalidateCards(groupId);
      onClose();
    } catch {
      haptic('heavy');
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    if (!editor?.showcase) return;
    await api.del(`/groups/${groupId}/showcases/${editor.showcase.id}`).catch(() => haptic('heavy'));
    invalidateCards(groupId);
    onClose();
  };
  const all = data?.cards ?? [];

  return (
    <Sheet
      open={Boolean(editor)}
      onClose={onClose}
      light
      height="92%"
      title={isDisplay ? tcg.displayBoards : tcg.binders}
      leading={<BarButton onClick={onClose}>{ios.cancel}</BarButton>}
      trailing={<BarButton bold onClick={save} disabled={busy || !cards.length}>{ios.save}</BarButton>}
    >
      {editor && !editor.showcase && editor.seed && !isDisplay && existingBinders.length > 0 && (
        <div className={t.chips} style={{ padding: '0 0 12px' }}>
          <button className={t.chip} aria-pressed={!target} onClick={() => setTarget(null)} aria-label={ios.more}>
            <Icon name="plus" size={15} />
          </button>
          {existingBinders.map((b, i) => (
            <button key={b.id} className={t.chip} aria-pressed={target === b.id} onClick={() => setTarget(b.id)}>
              <Icon name="grid" size={14} />
              {i + 1}
              <small>
                {b.cards.length}/{max}
              </small>
            </button>
          ))}
        </div>
      )}
      {(!target || editor?.showcase) && (
        <>
          <div style={{ margin: '0 0 12px' }}>
            <Segmented value={visibility} options={[{ id: 'private', label: tcg.private }, { id: 'friends', label: tcg.friendsOnly }]} onChange={setVisibility} />
          </div>
          <div className={t.chips} style={{ padding: '0 0 14px' }}>
            <button className={t.chip} aria-pressed={!style} onClick={() => setStyle(null)} aria-label={isDisplay ? tcg.backdrop : tcg.cover}>
              <span style={{ width: 18, height: 18, borderRadius: 6, background: isDisplay ? 'radial-gradient(#f2f2f7, #c7c7cc)' : 'radial-gradient(#8e8e93, #48484a)' }} />
            </button>
            {options.map((o) => (
              <button key={o.id} className={t.chip} aria-pressed={style === o.id} onClick={() => setStyle(o.id)}>
                <span style={{ width: 18, height: 18, borderRadius: 6, background: `radial-gradient(${o.color?.from}, ${o.color?.to})` }} />
                {o.name}
              </button>
            ))}
            <button className={t.chip} onClick={() => nav('/shop')} aria-label={tcg.shop}>
              <Icon name="gift" size={15} />
              {isDisplay ? tcg.backdrop : tcg.cover}
            </button>
          </div>
        </>
      )}
      <div className={t.pickGrid}>
        {all.map((c) => (
          <div key={c.id} className={`${t.gridItem} ${cards.includes(c.id) ? t.picked : ''}`} onClick={() => toggle(c.id)}>
            <TcgCard card={c} />
          </div>
        ))}
      </div>
      {editor?.showcase && (
        <div className={t.sheetFoot}>
          <BarButton onClick={remove}>
            <span style={{ color: 'var(--sys-red)' }}>{ios.delete}</span>
          </BarButton>
        </div>
      )}
    </Sheet>
  );
}

