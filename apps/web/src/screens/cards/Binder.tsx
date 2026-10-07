import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { discord, ios, rarityRank, tcg } from '@app/shared';
import { Screen, Segmented, Sheet } from '../../components/ios';
import { Icon } from '../../components/Icon';
import { PackArt, type PackMascot } from '../../components/cards/PackArt';
import { OddsTable } from '../../components/cards/OddsTable';
import { TcgCard } from '../../components/cards/TcgCard';
import { Pips, SparkOrb } from '../../components/cards/Currency';
import { AppTabs } from '../../components/AppTabs';
import { api } from '../../lib/api';
import { invalidateCards, useBinder, type BinderResponse } from '../../lib/queries';
import { countdown, weekRange } from '../../lib/format';
import { haptic, sfx } from '../../lib/feedback';
import type { GroupSummary } from '../../lib/types';
import { useGroupSummary, useNow } from './common';
import { MyCardsTab } from './MyCards';
import { SocialTab } from './Social';
import t from './tcg.module.css';

/**
 * Friend Cards (spec §J). TCG Pocket's sections "Home", "My Cards", "Social Hub" [V-weak] switch with a stock
 * segmented control [HIG]: the app-wide tab bar (AppTabs, Yope [I]) replaces Pocket's own bottom bar. Home opens
 * on the pack select screen [I research/inspo/store/tcg-01-pack-select.webp].
 */
type Tab = 'home' | 'cards' | 'social';

export default function Binder() {
  const { groupId } = useParams();
  const [sp, setSp] = useSearchParams();
  const nav = useNavigate();
  const tab = (['home', 'cards', 'social'].includes(sp.get('tab') ?? '') ? sp.get('tab') : 'home') as Tab;
  const binder = useBinder(groupId);
  const { group } = useGroupSummary(groupId);
  const missions = sp.get('missions') === '1';
  const setMissions = (on: boolean) => setSp(on ? { tab, missions: '1' } : { tab }, { replace: true });
  const back = () => (window.history.length > 1 ? nav(-1) : nav('/'));

  return (
    <Screen light className={t.screen}>
      <div className={t.segTop}>
        <Segmented
          value={tab}
          options={[
            { id: 'home', label: tcg.home },
            { id: 'cards', label: tcg.myCards },
            { id: 'social', label: tcg.socialHub },
          ]}
          onChange={(v) => setSp({ tab: v }, { replace: true })}
        />
      </div>
      {tab === 'home' && <HomeTab groupId={groupId!} data={binder.data} group={group} onBack={back} onMissions={() => setMissions(true)} />}
      {tab === 'cards' && <MyCardsTab groupId={groupId!} data={binder.data} onBack={back} />}
      {tab === 'social' && <SocialTab groupId={groupId!} onBack={back} />}
      <AppTabs />
      <MissionsSheet open={missions} onClose={() => setMissions(false)} groupId={groupId!} data={binder.data} />
    </Screen>
  );
}

/* ───────────────────────── Home: pack select [I tcg-01-pack-select.webp] ───────────────────────── */

function HomeTab({ groupId, data, group, onBack, onMissions }: { groupId: string; data: BinderResponse | undefined; group: GroupSummary | null; onBack: () => void; onMissions: () => void }) {
  const nav = useNavigate();
  const now = useNow();
  const [sel, setSel] = useState(0);
  const [armed, setArmed] = useState(false);
  const [rates, setRates] = useState(false);
  const [other, setOther] = useState(false);
  const drag = useRef<number | null>(null);
  const packs = data?.packs ?? [];
  const i = Math.min(sel, Math.max(0, packs.length - 1));
  const current = packs[i] ?? null;
  const weekKey = current?.weekKey ?? group?.ritual.weekKey ?? '';
  const mascot: PackMascot | null = group ? { species: group.mascot.species, outfit: group.mascot.outfit, level: group.mascot.stage?.level, name: group.mascot.name } : null;
  const m = data?.missions;

  // The speech bubble previews the set's featured cards: its highest tiers first.
  const featured = useMemo(
    () => (data?.dex ?? []).filter((d) => d.number?.set === weekKey).sort((a, b) => rarityRank(b.rarity) - rarityRank(a.rarity)).slice(0, 6),
    [data, weekKey],
  );

  // Pack Stamina: the free pack is weekly, earned by posting in the ritual (spec §J); it arrives when the roll develops.
  const developsAt = group?.ritual.developsAt ?? now;
  const elapsed = 1 - Math.max(0, Math.min(1, (developsAt - now) / (7 * 86_400_000)));

  const select = (n: number) => {
    if (n < 0 || n >= packs.length || n === i) return;
    haptic('light');
    sfx.click();
    setSel(n);
    setArmed(false);
  };
  const slot = (k: number) => k - i; // -1 left, 0 centre, 1 right

  return (
    <div
      className={t.home}
      onPointerDown={(e) => (drag.current = e.clientX)}
      onPointerUp={(e) => {
        if (drag.current == null) return;
        const dx = e.clientX - drag.current;
        drag.current = null;
        const step = Math.abs(dx) > 50 ? Math.sign(-dx) : 0;
        if (step) select(i + step);
      }}
    >
      <div className={t.homeTop}>
        <div className={t.roundGroup}>
          <button className={t.round} onClick={() => nav(`/g/${groupId}/wonder`)}>
            <span>
              <Icon name="shuffle" size={22} />
            </span>
            {tcg.wonderPick}
          </button>
          <button className={t.round} onClick={onMissions}>
            <span>
              <Icon name="flag" size={22} />
            </span>
            {tcg.missions}
            {m && m.done && !m.claimed ? <span className={t.dotBadge}>1</span> : null}
          </button>
          <button className={t.round} onClick={() => nav('/shop')}>
            <span>
              <Icon name="gift" size={22} />
            </span>
            {tcg.shop}
          </button>
        </div>
        <div className={t.timer}>
          <span style={{ display: 'flex', gap: 8 }}>
            {tcg.packStamina}
            <b>{countdown(developsAt - now)}</b>
          </span>
          <div className={t.bar}>
            <span style={{ width: `${elapsed * 100}%` }} />
          </div>
          {data && <Pips value={data.wonder.value} max={data.wonder.max} label={tcg.wonderStamina} />}
        </div>
      </div>

      <div className={t.bubble}>
        <div className={t.bubbleStrip}>
          {featured.map((d) => (
            <div key={`${d.postId}:${d.rarity}`}>
              <TcgCard card={d} />
            </div>
          ))}
        </div>
      </div>

      <div className={t.fan}>
        {packs.length ? (
          packs.map((p, k) => {
            const pos = slot(k);
            if (Math.abs(pos) > 1) return null;
            return (
              <motion.button
                key={p.id}
                className={t.fanPack}
                style={{ zIndex: pos === 0 ? 3 : 1 }}
                animate={{ x: pos * 118, scale: pos === 0 ? (armed ? 1.06 : 1) : 0.8, y: pos === 0 ? (armed ? -10 : 0) : 30, opacity: pos === 0 ? 1 : 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                onClick={() => {
                  if (pos !== 0) return select(k);
                  haptic('medium');
                  setArmed((a) => !a);
                }}
              >
                <PackArt weekKey={p.weekKey} mascot={mascot} />
              </motion.button>
            );
          })
        ) : (
          <div className={t.fanPack} style={{ opacity: 0.4, filter: 'grayscale(1)' }}>
            <PackArt weekKey={weekKey} mascot={mascot} />
          </div>
        )}
      </div>

      <button className={t.ptsBadge} onClick={() => nav(`/g/${groupId}/cards?tab=cards&dex=1`)} aria-label={tcg.packPoints}>
        <span>
          <div style={{ width: 20 }}>
            <PackArt weekKey={weekKey} mascot={mascot} />
          </div>
        </span>
        <span className={t.ptsPill}>{tcg.pts(data?.packPoints ?? 0)}</span>
      </button>

      <AnimatePresence>
        {armed && current && (
          <motion.div className={t.openWrap} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}>
            <button className={t.tealBtn} onClick={() => { haptic('medium'); nav(`/g/${groupId}/pack/${current.id}`); }}>
              {tcg.openBoosterPack}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={t.homeBottom}>
        <button className={`${t.pill} ${t.pillLeft}`} onClick={() => setRates(true)}>
          {tcg.offeringRates}
        </button>
        <button className={t.round} data-big onClick={onBack} aria-label={ios.back}>
          <span>
            <Icon name="undo" size={26} />
          </span>
        </button>
        <button className={`${t.pill} ${t.pillRight}`} onClick={() => setOther(true)}>
          {tcg.selectOtherPacks}
          <Icon name="chevronRight" size={18} strokeWidth={2.2} />
        </button>
      </div>

      <Sheet open={rates} onClose={() => setRates(false)} light title={tcg.offeringRates}>
        {data && <OddsTable odds={data.odds} />}
      </Sheet>
      <OtherPacksSheet open={other} onClose={() => setOther(false)} data={data} groupId={groupId} mascot={mascot} onPick={(k) => { setSel(k); setArmed(true); setOther(false); }} />
    </div>
  );
}

/* ───────────────────────── Other packs: unopened packs + buying (odds first, spec §J) ───────────────────────── */

function OtherPacksSheet({ open, onClose, data, groupId, mascot, onPick }: { open: boolean; onClose: () => void; data: BinderResponse | undefined; groupId: string; mascot: PackMascot | null; onPick: (i: number) => void }) {
  const nav = useNavigate();
  const [buy, setBuy] = useState<'sparks' | 'usd' | null>(null);
  const [busy, setBusy] = useState(false);
  const packs = data?.packs ?? [];
  const can = buy === 'usd' ? Boolean(data?.canBuyPaidPacks) : (data?.sparks ?? 0) >= (data?.costs.sparksPack ?? Infinity);
  const go = async () => {
    setBusy(true);
    try {
      const r = await api.post<{ packId: string }>(`/groups/${groupId}/packs/buy`, { with: buy });
      haptic('success');
      invalidateCards(groupId);
      setBuy(null);
      onClose();
      nav(`/g/${groupId}/pack/${r.packId}`);
    } catch {
      haptic('heavy');
    } finally {
      setBusy(false);
    }
  };
  const close = () => {
    setBuy(null);
    onClose();
  };
  return (
    <Sheet open={open} onClose={close} light title={buy ? tcg.offeringRates : tcg.boosterPacks}>
      {buy ? (
        <>
          {data && <OddsTable odds={data.odds} />}
          <div className={t.center} style={{ paddingTop: 20 }}>
            <button className={t.tealBtn} disabled={!can || busy} onClick={go}>
              {buy === 'usd' ? (
                `$${data?.paidPackUsd.toFixed(2) ?? ''}`
              ) : (
                <>
                  <SparkOrb size={20} />
                  {(data?.costs.sparksPack ?? 0).toLocaleString()}
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, padding: '4px 4px 8px' }}>
            {packs.map((p, k) => (
              <button key={p.id} onClick={() => onPick(k)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, font: '600 12px/1.1 var(--font-card)', color: 'var(--sys-label2)' }}>
                <PackArt weekKey={p.weekKey} mascot={mascot} />
                {weekRange(p.weekKey)}
              </button>
            ))}
          </div>
          <div className={t.center} style={{ paddingTop: 14 }}>
            <button className={t.whiteBtn} onClick={() => setBuy('sparks')} aria-label={discord.balance}>
              <Icon name="plus" size={16} strokeWidth={2.6} />
              <SparkOrb size={18} />
              {(data?.costs.sparksPack ?? 0).toLocaleString()}
            </button>
            {data?.canBuyPaidPacks && (
              <button className={t.whiteBtn} onClick={() => setBuy('usd')}>
                <Icon name="plus" size={16} strokeWidth={2.6} />
                {`$${data.paidPackUsd.toFixed(2)}`}
              </button>
            )}
          </div>
        </>
      )}
    </Sheet>
  );
}

/* ───────────────────────── Missions (TCG Pocket Daily Missions) ───────────────────────── */

function MissionsSheet({ open, onClose, groupId, data }: { open: boolean; onClose: () => void; groupId: string; data: BinderResponse | undefined }) {
  const m = data?.missions;
  const [busy, setBusy] = useState(false);
  // "After the three daily missions are done, tap the reward near the top of the Daily Missions screen" [V-weak]
  const claim = async () => {
    if (!m?.done || m.claimed || busy) return;
    setBusy(true);
    try {
      await api.post(`/groups/${groupId}/missions/claim`);
      haptic('success');
      sfx.sparkle();
      invalidateCards(groupId);
    } catch {
      haptic('heavy');
    } finally {
      setBusy(false);
    }
  };
  return (
    <Sheet open={open} onClose={onClose} light title={tcg.dailyMissions}>
      {m && (
        <div style={{ fontFamily: 'var(--font-card)' }}>
          <button className={t.reward} data-ready={(m.done && !m.claimed) || undefined} data-claimed={m.claimed || undefined} onClick={claim} aria-label={discord.claimReward}>
            {m.claimed ? <Icon name="check" size={26} strokeWidth={3} /> : <SparkOrb size={34} />}
            {m.reward.toLocaleString()}
          </button>
          {m.list.map((x) => (
            <div key={x.kind} className={`${t.panel} ${t.mission}`}>
              <div className={t.missionTop}>
                {x.kind === 'wonder' ? tcg.missionWonder(x.goal) : tcg.missionCollect(x.goal)}
                <small>
                  {x.progress}/{x.goal}
                </small>
              </div>
              <div className={t.bar}>
                <span style={{ width: `${(x.progress / x.goal) * 100}%`, background: x.progress >= x.goal ? 'var(--tcg-gold)' : undefined }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Sheet>
  );
}
