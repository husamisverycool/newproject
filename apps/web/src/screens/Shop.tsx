import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { BRAND, PLAN_NAMES, discord, ios, locket, pets, tcg } from '@app/shared';
import { Avatar, NavBar, Screen, Segmented, Sheet } from '../components/ios';
import { Icon } from '../components/Icon';
import { Mascot } from '../components/Mascot';
import { CardBack, FlipCard, TcgCard } from '../components/cards/TcgCard';
import { PackArt } from '../components/cards/PackArt';
import { OddsTable } from '../components/cards/OddsTable';
import { SparkOrb } from '../components/cards/Currency';
import { api } from '../lib/api';
import { invalidateCards, queryClient, useActiveGroup, useBinder, useGroup, useShop, type ShopResponse } from '../lib/queries';
import { haptic, sfx } from '../lib/feedback';
import type { CardT, GroupSummary, ShopItemT } from '../lib/types';
import s from './shop.module.css';
import cs from '../components/cards/cards.module.css';

type Thunk = { (): Promise<unknown> };

/**
 * Shop, after Discord's Shop and Orbs (research/13 §3), with Orbs → Sparks:
 * - "your Orbs balance in the top-right corner of Quest Home and Shop" [V]; tapping it shows the balance with
 *   "Earn Orbs" and "Redeem Orbs in Shop" [V]
 * - tabs "Orbs Exclusives" and "Shop All" [V]; items can be previewed and gifted [V]
 * - prices: Discord Orb prices [V-weak] (decoration 3,500 · Nitro credit 1,400)
 * Categories are named by their sources: Duolingo outfits for the mascot (pets.outfits), Locket Gold perks
 * "Camera themes" / "Custom app icons" (included with roll+), and TCG Pocket's "Card Sleeve", "Cover", "Backdrop".
 */
type Tab = 'exclusives' | 'all';

export default function Shop() {
  const nav = useNavigate();
  const shop = useShop();
  const { group, me } = useActiveGroup();
  const binder = useBinder(group?.id);
  const [tab, setTab] = useState<Tab>('exclusives');
  const [item, setItem] = useState<ShopItemT | null>(null);
  const [balance, setBalance] = useState(false);
  const items = shop.data?.items ?? [];
  const shown = items.filter((i) => tab === 'all' || i.exclusive);
  const sampleCard = useMemo(() => {
    const cs = binder.data?.cards ?? [];
    return cs.find((c) => c.rarity === 'holo' || c.rarity === 'immersive') ?? cs[0] ?? null;
  }, [binder.data]);

  const sections: { kind: ShopItemT['kind']; title: string; layout: 'grid' | 'row' }[] = [
    { kind: 'pack', title: tcg.boosterPacks, layout: 'grid' },
    { kind: 'outfit', title: pets.outfits, layout: 'grid' },
    { kind: 'sleeve', title: tcg.cardSleeve, layout: 'row' },
    { kind: 'cover', title: tcg.cover, layout: 'row' },
    { kind: 'backdrop', title: tcg.backdrop, layout: 'row' },
    { kind: 'theme', title: locket.perkThemes, layout: 'row' },
    { kind: 'icon', title: locket.perkIcons, layout: 'row' },
  ];

  return (
    <Screen dark className={s.screen}>
      <NavBar
        onBack={() => nav(-1)}
        title={discord.shop}
        trailing={
          <button className={s.balance} onClick={() => setBalance(true)} aria-label={discord.balance} style={{ marginRight: 8 }}>
            <SparkOrb size={20} />
            {(shop.data?.sparks ?? 0).toLocaleString()}
          </button>
        }
      />
      <div className={s.scroll}>
        <div className={s.tabs}>
          <Segmented value={tab} options={[{ id: 'exclusives', label: discord.exclusives }, { id: 'all', label: discord.shopAll }]} onChange={setTab} />
        </div>
        <div className={s.hero}>
          <SparkOrb size={74} style={{ position: 'absolute', right: 16, top: 16 }} />
          <div className={s.heroTitle}>{discord.headline}</div>
          <button className={s.heroBtn} onClick={() => group && nav(`/g/${group.id}/cards?tab=home`)}>
            {discord.earn}
          </button>
        </div>
        {sections.map((sec) => {
          const list = shown.filter((i) => i.kind === sec.kind);
          if (!list.length) return null;
          return (
            <section key={sec.kind}>
              <div className={s.sectionHead}>{sec.title}</div>
              <div className={sec.layout === 'grid' ? s.grid : s.row}>
                {list.map((i) => (
                  <Tile key={i.id} item={i} group={group} card={sampleCard} onClick={() => { haptic('light'); setItem(i); }} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <ItemSheet item={item} onClose={() => setItem(null)} data={shop.data} group={group} card={sampleCard} plan={me.data?.user.plan ?? 'free'} meId={me.data?.user.id} />

      <Sheet open={balance} onClose={() => setBalance(false)} dark title={discord.balance}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '10px 0 6px' }}>
          <SparkOrb size={64} />
          <div style={{ font: '800 34px/1 var(--font-discord)', color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{(shop.data?.sparks ?? 0).toLocaleString()}</div>
        </div>
        <div className={s.actions} style={{ flexDirection: 'column' }}>
          <button className={s.secondary} onClick={() => setBalance(false)}>
            {discord.redeem}
          </button>
          <button className={s.primary} onClick={() => group && nav(`/g/${group.id}/cards?tab=home`)}>
            {discord.earn}
          </button>
        </div>
      </Sheet>
    </Screen>
  );
}

/* ───────────────────────── Previews ───────────────────────── */

function colorVars(i: ShopItemT) {
  return (i.color ? { '--from': i.color.from, '--to': i.color.to } : {}) as CSSProperties;
}

function Preview({ item, group, card, big }: { item: ShopItemT; group: GroupSummary | null; card: CardT | null; big?: boolean }) {
  const species = group?.mascot.species ?? 'cat';
  switch (item.kind) {
    case 'pack':
      return (
        <div style={{ width: big ? 132 : '46%', margin: big ? '16px 0' : undefined }}>
          <PackArt weekKey={group?.ritual.weekKey ?? ''} mascot={group ? { species, outfit: group.mascot.outfit, level: group.mascot.stage?.level } : null} />
        </div>
      );
    case 'outfit':
      return <Mascot species={species} outfit={[item.id]} level={group?.mascot.stage?.level ?? 3} size={big ? 200 : 120} />;
    case 'sleeve':
      return (
        <div className={s.sleevePreview} style={big ? { width: 150 } : undefined}>
          <CardBack sleeve={item.id} />
        </div>
      );
    case 'cover':
      return <div className={s.cover} style={{ ...colorVars(item), ...(big ? { width: '70%', height: 170 } : null) }} />;
    case 'backdrop':
      return (
        <div className={s.backdropPrev} style={colorVars(item)}>
          <div className={s.encase} style={big ? { width: 120, padding: 7 } : undefined}>{big && card && <TcgCard card={card} />}</div>
        </div>
      );
    case 'theme':
      return <div className={s.viewfinder} style={{ ...colorVars(item), ...(big ? { width: 170 } : null) }} />;
    case 'icon':
      return (
        <div className={s.appIcon} style={{ ...colorVars(item), ...(big ? { width: 120 } : null) }}>
          <span className={cs.brand}>{BRAND.name}</span>
        </div>
      );
  }
}

function PriceTag({ item }: { item: ShopItemT }) {
  if (item.plusOnly) return <span className={s.plus}>{PLAN_NAMES.plus}</span>;
  return (
    <span className={s.price}>
      <SparkOrb size={16} />
      {item.sparks.toLocaleString()}
    </span>
  );
}

function Tile({ item, group, card, onClick }: { item: ShopItemT; group: GroupSummary | null; card: CardT | null; onClick: () => void }) {
  return (
    <button className={s.tile} onClick={onClick}>
      <div className={s.preview}>
        <Preview item={item} group={group} card={card} />
        {item.owned && (
          <span className={s.owned}>
            <Icon name="check" size={14} strokeWidth={3} />
          </span>
        )}
      </div>
      <div className={s.tileBody}>
        {item.name && <span className={s.tileName}>{item.name}</span>}
        <PriceTag item={item} />
      </div>
    </button>
  );
}

/* ───────────────────────── Item sheet: buy, preview, gift, use ───────────────────────── */

function ItemSheet({ item, onClose, data, group, card, plan, meId }: { item: ShopItemT | null; onClose: () => void; data: ShopResponse | undefined; group: GroupSummary | null; card: CardT | null; plan: string; meId: string | undefined }) {
  const nav = useNavigate();
  const detail = useGroup(group?.id);
  const [mode, setMode] = useState<'item' | 'preview' | 'gift'>('item');
  const [to, setTo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [packId, setPackId] = useState<string | null>(null);
  const live = item ? data?.items.find((i) => i.id === item.id) ?? item : null;
  const close = () => {
    setMode('item');
    setTo(null);
    setPackId(null);
    onClose();
  };
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['shop'] });
    void queryClient.invalidateQueries({ queryKey: ['me'] });
    if (group) {
      invalidateCards(group.id);
      void queryClient.invalidateQueries({ queryKey: ['group', group.id] });
    }
  };
  const act = async (fn: Thunk) => {
    setBusy(true);
    try {
      await fn();
      haptic('success');
      sfx.sparkle();
      refresh();
    } catch {
      haptic('heavy');
    } finally {
      setBusy(false);
    }
  };
  if (!live) return <Sheet open={false} onClose={close} dark>{null}</Sheet>;

  const afford = (data?.sparks ?? 0) >= live.sparks;
  const kindEquip = live.kind === 'sleeve' || live.kind === 'theme' || live.kind === 'icon' ? live.kind : null;
  const equipped = kindEquip && data?.equipped[kindEquip] === live.id;
  const worn = live.kind === 'outfit' && Boolean(group?.mascot.outfit.includes(live.id));
  const others = (detail.data?.members ?? []).filter((m) => m.user.id !== meId);

  const buy = () =>
    act(async () => {
      const r = await api.post<{ ok: boolean; packId?: string }>('/shop/buy', { item: live.id, groupId: group?.id });
      if (r.packId) setPackId(r.packId);
    });
  const use = () =>
    act(async () => {
      if (live.kind === 'outfit' && group) {
        const next = worn ? group.mascot.outfit.filter((o) => o !== live.id) : [...group.mascot.outfit.filter((o) => !o.startsWith('outfit_')), live.id];
        await api.post(`/groups/${group.id}/mascot/outfit`, { outfit: next });
      } else if (kindEquip) await api.post('/shop/equip', { kind: kindEquip, item: equipped ? null : live.id });
    });
  const gift = () =>
    act(async () => {
      await api.post('/gift', { toUserId: to, kind: live.kind === 'pack' ? 'pack' : 'item', itemId: live.id, groupId: group?.id });
      setMode('item');
      setTo(null);
    });

  let body: ReactNode;
  if (mode === 'gift') {
    body = (
      <>
        {others.map((m) => (
          <button key={m.user.id} className={s.member} aria-pressed={to === m.user.id} onClick={() => setTo(m.user.id)}>
            <Avatar user={m.user} size={40} />
            <span style={{ flex: 1 }}>{m.user.name}</span>
            {to === m.user.id && <Icon name="check" size={20} strokeWidth={3} />}
          </button>
        ))}
        <div className={s.actions}>
          <button className={s.secondary} onClick={() => setMode('item')}>
            {ios.cancel}
          </button>
          <button className={s.primary} disabled={!to || !afford || busy} onClick={gift}>
            <Icon name="gift" size={18} />
            <SparkOrb size={18} />
            {live.sparks.toLocaleString()}
          </button>
        </div>
      </>
    );
  } else {
    body = (
      <>
        <div className={s.sheetPreview} style={live.kind === 'backdrop' ? { minHeight: 280 } : undefined}>
          {mode === 'preview' ? <InContext item={live} group={group} card={card} /> : <Preview item={live} group={group} card={card} big />}
        </div>
        {live.name && <div className={s.sheetName}>{live.name}</div>}
        <div style={{ marginTop: 6 }}>
          <PriceTag item={live} />
        </div>
        {live.kind === 'pack' && data && (
          <div style={{ marginTop: 14, padding: '4px 12px', borderRadius: 14, background: 'var(--sys-bg3)' }}>
            <OddsTable odds={data.odds} />
          </div>
        )}
        <div className={s.actions}>
          {live.kind !== 'pack' && live.kind !== 'theme' && live.kind !== 'icon' && (
            <button className={s.secondary} onClick={() => setMode(mode === 'preview' ? 'item' : 'preview')} aria-pressed={mode === 'preview'}>
              <Icon name="eye" size={18} />
              {discord.preview}
            </button>
          )}
          {!live.plusOnly && (
            <button className={s.secondary} onClick={() => setMode('gift')} disabled={!group}>
              <Icon name="gift" size={18} />
              {discord.gift}
            </button>
          )}
        </div>
        <div className={s.actions}>
          {packId && group ? (
            <button className={s.primary} onClick={() => { close(); nav(`/g/${group.id}/pack/${packId}`); }}>
              {tcg.openBoosterPack}
            </button>
          ) : live.plusOnly && plan === 'free' ? (
            <button className={s.primary} onClick={() => { close(); nav('/plans'); }}>
              {PLAN_NAMES.plus}
            </button>
          ) : live.owned ? (
            <button className={s.primary} onClick={use} disabled={busy || (live.kind === 'outfit' && !group)}>
              {equipped || worn ? <Icon name="check" size={18} strokeWidth={3} /> : null}
              {equipped || worn ? ios.remove : ios.select}
            </button>
          ) : (
            <button className={s.primary} onClick={buy} disabled={!afford || busy || (live.kind === 'pack' && !group)}>
              <SparkOrb size={20} />
              {live.sparks.toLocaleString()}
            </button>
          )}
        </div>
      </>
    );
  }
  return (
    <Sheet open={Boolean(item)} onClose={close} dark title={mode === 'gift' ? discord.gift : undefined}>
      {body}
    </Sheet>
  );
}

/** "Preview" — the item on your own things before buying [V]: the group mascot, your card back, binder or display board. */
function InContext({ item, group, card }: { item: ShopItemT; group: GroupSummary | null; card: CardT | null }) {
  const [flip, setFlip] = useState(false);
  if (item.kind === 'outfit')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 18, color: '#fff', font: '700 17px/1 var(--font-discord)' }}>
        <Mascot species={group?.mascot.species ?? 'cat'} outfit={[item.id]} level={group?.mascot.stage?.level ?? 3} size={180} mood="party" />
        {group ? [group.emoji, group.mascot.name].join(' ') : ''}
      </div>
    );
  if (item.kind === 'sleeve' && card)
    return (
      <div style={{ width: 150, padding: '20px 0' }} onClick={() => setFlip((f) => !f)}>
        <FlipCard down={!flip} sleeve={item.id} front={<TcgCard card={card} />} />
      </div>
    );
  if (item.kind === 'cover')
    return (
      <div className={s.cover} style={{ ...colorVars(item), width: '86%', height: 190, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 18 }}>
        {card && (
          <div style={{ width: 92, transform: 'rotate(6deg)' }}>
            <TcgCard card={card} />
          </div>
        )}
      </div>
    );
  return <Preview item={item} group={group} card={card} big />;
}
