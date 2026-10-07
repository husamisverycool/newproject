import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { PLANS, PLAN_NAMES, STORAGE, ios, locket, retro, snapchat, spec, tcg, type Plan } from '@app/shared';
import { GlassCircle, Row, Screen, Section, Spinner } from '../components/ios';
import { Icon } from '../components/Icon';
import { api } from '../lib/api';
import { haptic } from '../lib/feedback';
import { queryClient, useMe } from '../lib/queries';
import s from './paywall.module.css';

/**
 * Plans (spec §U), after Locket Gold (research/10 §6):
 * - the perk list is Locket Gold's [V], keeping the perks spec §U keeps ("Camera themes", "Custom app icons",
 *   "Streak restoration") and adding §U's own in §U's order — AI generations (Snapchat's wording [V]),
 *   figurines (§I), the full-resolution archive, the extra weekly pack (TCG Premium Pass [V-weak], 24 hours →
 *   week), watermark styles (§Q). Locket's friend cap, roll uploads, ads and videos are dropped (§C, §D, §U);
 * - plan names roll+ / Remix+ (Snapchat+ / Lens+ pattern, spec §U) at $3.99 a month or $36 a year, and $5.99;
 *   prices written as Locket's "$3.99 per month" / "$36 per year" [V-weak];
 * - storage: Snapchat's "Memories Storage Plans" [V] — compressed copies and a per-group cap on Free, the
 *   full-resolution archive on paid plans (§T);
 * - Retro's promise "There will ALWAYS be a free tier with unlimited photos and friends." [V-weak].
 */

type Option = { id: string; plan: Exclude<Plan, 'free'>; price: number; per: 'month' | 'year' };

const OPTIONS: Option[] = [
  { id: 'plus_month', plan: 'plus', price: PLANS.plus.monthly, per: 'month' },
  ...(PLANS.plus.yearly ? [{ id: 'plus_year', plan: 'plus' as const, price: PLANS.plus.yearly, per: 'year' as const }] : []),
  { id: 'ai_month', plan: 'ai', price: PLANS.ai.monthly, per: 'month' },
  ...(PLANS.ai.yearly ? [{ id: 'ai_year', plan: 'ai' as const, price: PLANS.ai.yearly, per: 'year' as const }] : []),
];

const usd = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: n % 1 ? 2 : 0 });
const priceLine = (o: Option) => (o.per === 'month' ? locket.perMonth(usd(o.price)) : locket.perYear(usd(o.price)));

function perks(plan: Exclude<Plan, 'free'>) {
  const p = PLANS[plan];
  return [
    { icon: 'camera', label: locket.perkThemes },
    { icon: 'sparkles', label: snapchat.imageGenerations(p.aiMonthly) },
    p.figurines && { icon: 'star', label: spec.figurines },
    p.fullRes && { icon: 'photos', label: spec.fullRes },
    p.extraWeeklyPack && { icon: 'cards', label: tcg.passExtraPack },
    p.watermarkStyles && { icon: 'wand', label: spec.watermarkStyles },
    p.appIcons && { icon: 'grid4', label: locket.perkIcons },
    p.streakRestore && { icon: 'flame', label: locket.perkStreak },
  ].filter(Boolean) as { icon: string; label: string }[];
}

export default function Paywall() {
  const nav = useNavigate();
  const { hash } = useLocation();
  const me = useMe();
  const current = me.data?.user.plan ?? 'free';
  const [sel, setSel] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const storageRef = useRef<HTMLDivElement>(null);
  const option = OPTIONS.find((o) => o.id === sel) ?? OPTIONS.find((o) => o.plan === current) ?? OPTIONS[0];
  const list = useMemo(() => perks(option.plan), [option.plan]);

  // Settings › Storage › "Memories Storage Plans" opens this page at the storage list.
  useEffect(() => {
    if (hash === '#storage') storageRef.current?.scrollIntoView({ block: 'center' });
  }, [hash]);

  const buy = async () => {
    setBusy(true);
    try {
      await api.post('/me/plan', { plan: option.plan });
      haptic('success');
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      nav(-1);
    } finally {
      setBusy(false);
    }
  };

  const restore = () => void queryClient.invalidateQueries({ queryKey: ['me'] });

  return (
    <Screen dark className={s.screen}>
      <GlassCircle icon="close" label={ios.close} onClick={() => nav(-1)} size={36} iconSize={16} style={{ position: 'absolute', top: 'calc(var(--safe-top) + 10px)', left: 16, zIndex: 5, background: 'var(--locket-glass)' }} />
      <div className={s.scroll}>
        <div className={s.hero}>
          <Icon name="crown" size={44} strokeWidth={1.8} />
          <div className={s.title}>{PLANS[option.plan].name}</div>
        </div>

        <div className={s.perks}>
          {list.map((p) => (
            <div key={p.label} className={s.perk}>
              <Icon name={p.icon} size={22} strokeWidth={2.2} />
              <span className={s.cap}>{p.label}</span>
            </div>
          ))}
        </div>

        <div className={s.options} role="radiogroup">
          {OPTIONS.map((o) => (
            <button key={o.id} className={s.option} role="radio" aria-checked={o.id === option.id} onClick={() => { haptic('light'); setSel(o.id); }}>
              <span className={s.optText}>
                <span className={s.optName}>{PLANS[o.plan].name}</span>
                <span className={s.optPrice}>{priceLine(o)}</span>
              </span>
              <span className={s.radio}>{o.id === option.id && <Icon name="check" size={14} strokeWidth={3} />}</span>
            </button>
          ))}
        </div>

        <div ref={storageRef} id="storage" className={s.storage}>
          <Section header={snapchat.storagePlans}>
            <Row title={PLAN_NAMES.free} sub={spec.compressed} value={snapchat.gb(STORAGE.freeGroupBudget / 1024 ** 3)} />
            <Row title={PLANS.plus.name} sub={spec.fullRes} />
            <Row title={PLANS.ai.name} sub={spec.fullRes} />
          </Section>
        </div>

        <p className={s.free}>{retro.alwaysFree}</p>
      </div>

      <div className={s.footer}>
        <button className={s.cta} onClick={buy} disabled={busy || option.plan === current}>
          {busy ? <Spinner size={20} /> : locket.continue}
        </button>
        <button className={s.restore} onClick={restore}>
          {ios.restorePurchases}
        </button>
      </div>
    </Screen>
  );
}
