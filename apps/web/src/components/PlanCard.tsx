import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router';
import { ios, luma, partiful } from '@app/shared';
import { api } from '../lib/api';
import { queryClient } from '../lib/queries';
import { haptic, sfx } from '../lib/feedback';
import type { PlanT } from '../lib/types';
import { AvatarStack } from './ios';
import { Icon } from './Icon';
import s from './plan.module.css';

/**
 * Partiful's customization layers (research/04 §3.1, research/15 §2): a poster, a Theme (the page
 * background), an Effect (animations) and a title font. The ids are the ones the server accepts, which
 * are Partiful's own ids from live create URLs [V-weak]: themes cloudflow / phantom / rainbowGlitter,
 * effects sunbeams / fireworks (or none), title fonts display / manrope. Partiful's display names are
 * UNKNOWN, so themes carry Luma's verified category names [V] (research/21 §2c, §9):
 * - cloudflow → Quantum: "Soft animated gradients with preset color palettes" [V], in Partiful's
 *   "soft periwinkle-to-white" page and "purple-to-pink" wash [V-weak].
 * - phantom → Minimal: "Clean, classic design that works for any event" [V], Partiful's white canvas
 *   and black "pure contrast" [V-weak].
 * - rainbowGlitter → Confetti: "animated confetti effects" with heart, star and circle shapes [V].
 */
export const THEME_IDS = ['phantom', 'cloudflow', 'rainbowGlitter'] as const;
export const THEMES: Record<string, { name: string; page: string; poster: string }> = {
  phantom: { name: luma.themes.minimal, page: s.pageMinimal, poster: s.posterMinimal },
  cloudflow: { name: luma.themes.quantum, page: s.pageQuantum, poster: s.posterQuantum },
  rainbowGlitter: { name: luma.themes.confetti, page: s.pageConfetti, poster: s.posterConfetti },
};
export const themeOf = (id: string) => THEMES[id] ?? THEMES.cloudflow;

/** Effect ids [V-weak]; "remove an Effect" [V] shows as the stock "None" [HIG]. */
export const EFFECT_IDS = ['none', 'sunbeams', 'fireworks'] as const;
export const effectName = (id: string) => (id === 'sunbeams' || id === 'fireworks' ? partiful.effectNames[id] : ios.none);

/** Title fonts [V-weak]: "display" is Partiful Display Medium, "manrope" is Manrope (tokens.css). */
export const FONT_IDS = ['display', 'manrope'] as const;
export const titleFont = (id: string): CSSProperties => ({ fontFamily: id === 'manrope' ? 'var(--font-partiful-manrope)' : 'var(--font-partiful-display)' });

/** RSVPs can't change once the event is over [V] (help-article title); the server allows 6 hours. */
export const rsvpClosed = (plan: Pick<PlanT, 'startsAt'>) => Boolean(plan.startsAt && plan.startsAt + 6 * 3_600_000 < Date.now());
export const RSVP_IDS = ['going', 'maybe', 'cant_go'] as const;
export const rsvpLabel = { going: partiful.going, maybe: partiful.maybe, cant_go: partiful.cantGo } as const;

export async function rsvpPlan(plan: Pick<PlanT, 'id' | 'groupId'>, status: (typeof RSVP_IDS)[number]) {
  haptic('medium');
  if (status === 'going') sfx.sparkle();
  await api.post(`/plans/${plan.id}/rsvp`, { status });
  void queryClient.invalidateQueries({ queryKey: ['plan', plan.id] });
  void queryClient.invalidateQueries({ queryKey: ['messages', plan.groupId] });
}

/** Luma Confetti theme: heart, star and circle shapes [V] in the Apple system colors [HIG]. */
const CONFETTI_COLORS = ['var(--sys-red)', 'var(--sys-orange)', 'var(--sys-yellow)', 'var(--sys-green)', 'var(--sys-cyan)', 'var(--sys-purple)', 'var(--sys-pink)'];
function Confetti({ n = 18, still }: { n?: number; still?: boolean }) {
  return (
    <span className={`${s.confetti} ${still ? s.still : ''}`}>
      {Array.from({ length: n }, (_, i) => {
        const shape = i % 3;
        const style = { left: `${(i * 37) % 100}%`, top: still ? `${(i * 53) % 100}%` : undefined, color: CONFETTI_COLORS[i % CONFETTI_COLORS.length], animationDelay: `${-((i * 7) % 11)}s`, animationDuration: `${9 + (i % 5)}s` } as CSSProperties;
        return shape === 2 ? <i key={i} className={s.dot} style={style} /> : <Icon key={i} name={shape ? 'star' : 'heart'} size={12} filled className={s.piece} style={style} />;
      })}
    </span>
  );
}

/** The Effect layer (animations) [V]. What sunbeams and fireworks look like is UNKNOWN; drawn literally. */
export function PlanEffect({ effect }: { effect: string }) {
  if (effect === 'sunbeams') return <span className={s.sunbeams} aria-hidden />;
  if (effect === 'fireworks')
    return (
      <span className={s.fireworks} aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <i key={i} style={{ left: `${18 + i * 22}%`, top: `${14 + (i % 2) * 22}%`, animationDelay: `${i * 0.55}s`, color: CONFETTI_COLORS[(i * 2) % CONFETTI_COLORS.length] }} />
        ))}
      </span>
    );
  return null;
}

/** The page background: Theme (background) [V] plus the Effect (animations) [V]. */
export function PlanBackdrop({ theme, effect }: { theme: string; effect: string }) {
  return (
    <div className={`${s.backdrop} ${themeOf(theme).page}`} aria-hidden>
      {theme === 'rainbowGlitter' && <Confetti />}
      <PlanEffect effect={effect} />
    </div>
  );
}

const SIZE = { page: s.sizePage, card: s.sizeCard, swatch: s.sizeSwatch };

/**
 * The poster [V]: the host's own photo ("upload your own photo" [V]) filling it, or a typographic poster
 * (Partiful ships typographic posters such as invite-chrome-purple [V-weak]) in the theme's colors with
 * the title. On the event page a photo poster stands alone, since the title follows it; on the chat card
 * and the swatches the title sits over the photo on a dark scrim [HIG legibility].
 */
export function PlanPoster({ plan, size, withEffect }: { plan: Pick<PlanT, 'title' | 'theme' | 'effect' | 'titleFont' | 'poster'>; size: 'page' | 'card' | 'swatch'; withEffect?: boolean }) {
  const photo = plan.poster;
  return (
    <div className={`${s.poster} ${SIZE[size]} ${photo ? s.posterPhoto : themeOf(plan.theme).poster}`}>
      {photo && <img className={s.posterImg} src={photo} alt="" draggable={false} />}
      {!photo && plan.theme === 'rainbowGlitter' && <Confetti n={size === 'swatch' ? 8 : 14} still />}
      {withEffect && <PlanEffect effect={plan.effect} />}
      {!(photo && size === 'page') && (
        <span className={s.posterTitle} style={titleFont(plan.titleFont)}>
          {plan.title}
        </span>
      )}
    </div>
  );
}

/**
 * The plan in the group chat: a WhatsApp group event card [V] (research/21 §4, §9) — title, date and
 * time, location, the going count, and the RSVP responses right on the card — with Partiful's poster,
 * labels and default emoji buttons [V] (glyphs [B-med]). A "Find a Time" plan lists its options with
 * Rallly's running count of yeses [V]. The card sits in the Yope chat as a dark bubble [I] (yope-04).
 */
export function PlanCard({ plan }: { plan: PlanT }) {
  const nav = useNavigate();
  const open = () => nav(`/plan/${plan.id}`);
  const closed = rsvpClosed(plan);
  return (
    <div className={s.card} data-dark>
      <button className={s.cardOpen} onClick={open}>
        <PlanPoster plan={plan} size="card" withEffect />
        <span className={s.cardBody}>
          <span className={s.cardWhen}>{plan.startsAt ? ios.dateTime(plan.startsAt) : partiful.findATime}</span>
          {plan.location && (
            <span className={s.cardWhere}>
              <Icon name="pin" size={15} />
              <span>{plan.location}</span>
            </span>
          )}
          <span className={s.cardGoing}>
            {plan.going.length > 0 && <AvatarStack users={plan.going} size={20} edge="var(--yope-bubble)" />}
            {plan.goingCount !== null && <span>{partiful.countGoing(plan.goingCount ?? plan.going.length)}</span>}
            {plan.maybe.length > 0 && <span className={s.cardDim}>{partiful.countMaybe(plan.maybe.length)}</span>}
          </span>
        </span>
      </button>
      {plan.startsAt ? (
        <div className={s.cardRsvp}>
          {RSVP_IDS.filter((k) => k !== 'maybe' || plan.settings?.maybe !== false).map((k) => (
            <button key={k} aria-pressed={plan.mine === k} disabled={closed} onClick={() => void rsvpPlan(plan, k)}>
              <span className={s.cardEmoji}>{partiful.rsvpEmoji[k]}</span>
              {rsvpLabel[k]}
            </button>
          ))}
        </div>
      ) : (
        <div className={s.cardPoll}>
          {plan.options.map((o, i) => {
            const yes = o.votes.filter((v) => v.vote === 'yes');
            return (
              <button key={i} onClick={open}>
                <span>{ios.dateTime(o.at)}</span>
                {yes.length > 0 && <AvatarStack users={yes.map((v) => v.user)} size={18} max={3} edge="var(--yope-circle)" />}
                <b>{yes.length}</b>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
