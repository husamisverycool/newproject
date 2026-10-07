import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ios, locket, type NotificationKind } from '@app/shared';
import { NavBar, Screen, Section, Spinner } from '../components/ios';
import { Icon } from '../components/Icon';
import { Mascot } from '../components/Mascot';
import { api } from '../lib/api';
import { queryClient, useMe } from '../lib/queries';
import type { GroupSummary } from '../lib/types';
import s from './notifications.module.css';

interface Item {
  id: string;
  groupId: string | null;
  kind: NotificationKind;
  title: string;
  body: string;
  refIds: string[];
  createdAt: number;
  readAt: number | null;
}

/**
 * The kinds the server pushes (packages/shared/src/notify.ts, spec §O) and the glyph each carries.
 * Glyph sources: BeReal's camera prompt, Retro's film recap, Locket's reactions and new photos,
 * Snapchat's ⌛ streak warning [V-weak], TCG Pocket's trades and Wonder Pick, Partiful plans.
 */
const GLYPH: Record<NotificationKind, string> = {
  ritual_open: 'camera',
  ritual_closing: 'camera',
  roll_developed: 'film',
  game_open: 'game',
  reaction: 'smile',
  new_posts: 'photos',
  streak_warning: 'hourglass',
  trade_offer: 'trade',
  wonder_pick: 'cards',
  plan: 'calendar',
  likeness_used: 'person',
  waitlist: 'personPlus',
};

/** Where a notification leads — the same targets as the push's own url (server) and the in-app banner. */
function target(n: Item) {
  const g = n.groupId;
  const ref = n.refIds[0] ?? '';
  switch (n.kind) {
    case 'roll_developed':
      return g && ref.startsWith('wall:') ? `/g/${g}/week/${ref.slice(5)}` : '/journal';
    case 'game_open':
      return g ? `/g/${g}/game` : '/';
    case 'trade_offer':
      return g ? `/g/${g}/trades` : '/';
    case 'wonder_pick':
      return g ? `/g/${g}/wonder` : '/';
    case 'plan':
      return ref.startsWith('pl_') ? `/plan/${ref}` : g ? `/chat/${g}` : '/';
    case 'likeness_used':
      return '/me/likeness';
    case 'new_posts':
      return ref ? `/p/${ref}` : '/journal';
    case 'reaction':
      return '/journal';
    case 'waitlist':
      return g ? `/chat/${g}` : '/';
    default:
      return '/';
  }
}

function getNotifications() {
  return api.get<{ notifications: Item[] }>('/notifications');
}

const dayKey = (t: number) => new Date(t).toDateString();

/** Today / Yesterday / the date, as Notification Center and Mail group them [HIG]. */
function dayLabel(t: number, now: number) {
  if (dayKey(t) === dayKey(now)) return ios.today;
  if (dayKey(t) === dayKey(now - 86_400_000)) return ios.yesterday;
  return ios.longDate(t);
}

/**
 * Notifications inbox: every push the server sent, newest first, in a stock iOS list [HIG]. Opening the
 * list marks everything read (iOS clears the badge once Notification Center is seen), while the blue
 * dots stay for this visit so you can still see what was new.
 */
export default function Notifications() {
  const nav = useNavigate();
  const me = useMe();
  const q = useQuery({ queryKey: ['notifications'], queryFn: getNotifications });
  const marked = useRef(false);
  const groups = useMemo(() => new Map((me.data?.groups ?? []).map((g) => [g.id, g])), [me.data]);
  const list = q.data?.notifications;

  useEffect(() => {
    if (!list || marked.current || !list.some((n) => !n.readAt)) return;
    marked.current = true;
    void api.post('/notifications/read').then(() => queryClient.invalidateQueries({ queryKey: ['me'] }));
  }, [list]);

  const now = Date.now();
  const sections = useMemo(() => {
    const out: { label: string; items: Item[] }[] = [];
    for (const n of list ?? []) {
      const label = dayLabel(n.createdAt, now);
      const last = out.at(-1);
      if (last?.label === label) last.items.push(n);
      else out.push({ label, items: [n] });
    }
    return out;
  }, [list, now]);

  return (
    <Screen grouped>
      <NavBar onBack={() => nav(-1)} title={ios.notifications} />
      <div className={s.scroll}>
        {q.isLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <Spinner />
          </div>
        )}
        {list && list.length === 0 && (
          <div className={s.empty}>
            <Icon name="bell" size={52} strokeWidth={1.6} />
            <div className={s.emptyTitle}>{locket.noActivity}</div>
          </div>
        )}
        {sections.map((sec) => (
          <Section key={sec.label} header={sec.label}>
            {sec.items.map((n) => (
              <button key={n.id} className={s.row} onClick={() => nav(target(n))}>
                {!n.readAt && <span className={s.dot} />}
                <Face group={n.groupId ? groups.get(n.groupId) : undefined} glyph={GLYPH[n.kind] ?? 'bell'} />
                <span className={s.text}>
                  <span className={s.top}>
                    <span className={s.title}>{n.title}</span>
                    <span className={s.time}>{locket.ago(now - n.createdAt)}</span>
                  </span>
                  <span className={s.body}>{n.body}</span>
                </span>
              </button>
            ))}
          </Section>
        ))}
      </div>
    </Screen>
  );
}

function Face({ group, glyph }: { group?: GroupSummary; glyph: string }) {
  return (
    <span className={s.face}>
      {group ? <Mascot species={group.mascot.species} level={group.mascot.stage.level} outfit={group.mascot.outfit} size={40} /> : <Icon name={glyph} size={22} />}
      {group && (
        <span className={s.badge} style={{ background: 'var(--sys-gray)' }}>
          <Icon name={glyph} size={12} strokeWidth={2.4} />
        </span>
      )}
    </span>
  );
}
