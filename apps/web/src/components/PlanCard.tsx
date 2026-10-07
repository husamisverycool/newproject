import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import type { PlanT } from '../lib/types';
import { AvatarStack } from './ui';
import s from './plan.module.css';

/**
 * Partiful's event poster. Theme, effect and title-font ids are the ones seen in live Partiful
 * create URLs (research/04 §3.1): themes cloudflow / rainbowGlitter / phantom, effects sunbeams /
 * fireworks / none, title fonts manrope / display.
 */
export const THEMES: Record<string, { name: string; bg: string; ink: string }> = {
  cloudflow: { name: 'Cloudflow', bg: 'radial-gradient(60% 50% at 25% 30%, #FFFFFF 0%, transparent 70%), radial-gradient(50% 40% at 75% 65%, #FFFFFF 0%, transparent 70%), linear-gradient(160deg, var(--periwinkle), var(--blue))', ink: 'var(--black)' },
  rainbowGlitter: { name: 'Rainbow glitter', bg: 'linear-gradient(135deg, var(--red), var(--orange), var(--yellow), var(--green), var(--blue), var(--purple))', ink: 'var(--white)' },
  phantom: { name: 'Phantom', bg: 'radial-gradient(70% 60% at 50% 20%, var(--purple) 0%, transparent 70%), linear-gradient(180deg, var(--navy), var(--black))', ink: 'var(--white)' },
};

export function PlanPoster({ plan, style, big }: { plan: Pick<PlanT, 'title' | 'theme' | 'effect' | 'titleFont' | 'startsAt'>; style?: CSSProperties; big?: boolean }) {
  const t = THEMES[plan.theme] ?? THEMES.cloudflow;
  return (
    <div className={`${s.poster} ${big ? s.big : ''}`} style={{ background: t.bg, color: t.ink, ...style }}>
      {plan.theme === 'rainbowGlitter' && <span className={s.glitter} />}
      {plan.effect === 'sunbeams' && <span className={s.sunbeams} />}
      {plan.effect === 'fireworks' && (
        <span className={s.fireworks}>
          {[0, 1, 2].map((i) => (
            <motion.i key={i} style={{ left: `${20 + i * 30}%`, top: `${20 + (i % 2) * 25}%` }} animate={{ scale: [0, 1.4, 1.6], opacity: [0, 1, 0] }} transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.6 }} />
          ))}
        </span>
      )}
      <span className={s.posterTitle} style={{ fontFamily: plan.titleFont === 'display' ? 'var(--font-display)' : 'var(--font-plan)', fontStretch: plan.titleFont === 'display' ? '125%' : undefined }}>
        {plan.title}
      </span>
      {plan.startsAt && <span className={s.posterDate}>{new Date(plan.startsAt).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>}
    </div>
  );
}

/** The plan as it sits in the group chat. */
export function PlanCard({ plan }: { plan: PlanT }) {
  const nav = useNavigate();
  return (
    <button className={s.card} onClick={() => nav(`/plan/${plan.id}`)}>
      <PlanPoster plan={plan} />
      <span className={s.cardBody}>
        <span className={s.cardWhen}>
          {plan.startsAt ? new Date(plan.startsAt).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : `Find a Time · ${plan.options.length} options`}
        </span>
        <span className={s.cardGoing}>
          <AvatarStack users={plan.going} size={22} />
          <span>{plan.going.length} going{plan.maybe.length ? ` · ${plan.maybe.length} maybe` : ''}</span>
        </span>
        <span className={`${s.cardRsvp} ${plan.mine ? s[plan.mine] : ''}`}>{plan.mine === 'going' ? 'You’re going' : plan.mine === 'maybe' ? 'Maybe' : plan.mine === 'cant_go' ? 'Can’t Go' : 'RSVP'}</span>
      </span>
    </button>
  );
}
