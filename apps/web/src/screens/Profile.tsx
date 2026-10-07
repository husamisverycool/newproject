import { useMemo, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ios, retro } from '@app/shared';
import { api } from '../lib/api';
import { queryClient, useActiveGroup, useMe } from '../lib/queries';
import { fileToSquareJpeg } from '../lib/camera';
import { isoWeek } from '../lib/format';
import { Icon } from '../components/Icon';
import { Avatar } from '../components/ios';
import { AppTabs } from '../components/AppTabs';
import s from './profile.module.css';

type Day = { id: string; thumb: string; createdAt: number };

/**
 * Your profile — Retro's profile, laid out from research/inspo/store/retro-02-profile [I]: white; the
 * name large in the serif with your photo at the right; info rows with small glyphs ("Weeks Posted:
 * 32"); outline capsules "Recaps" and "Share Profile" and a gear circle; then week sections
 * "Week 27 Jul 3 - 9" with "•••" and the day strip, the current week ending in the "+" tile.
 * Retro's profile is "Private by default" [I]: only you see this page.
 */
export default function Profile() {
  const nav = useNavigate();
  const me = useMe();
  const { group } = useActiveGroup();
  const q = useQuery({ queryKey: ['memories'], queryFn: () => api.get<{ days: Day[] }>('/me/memories') });
  const photo = useRef<HTMLInputElement>(null);
  const user = me.data?.user;

  const weeks = useMemo(() => {
    const map = new Map<string, { start: number; end: number; days: Day[] }>();
    for (const d of q.data?.days ?? []) {
      const t = new Date(d.createdAt);
      const monday = new Date(t.getFullYear(), t.getMonth(), t.getDate() - ((t.getDay() + 6) % 7));
      const key = monday.toDateString();
      const w = map.get(key) ?? { start: monday.getTime(), end: monday.getTime() + 6 * 86_400_000, days: [] };
      w.days.push(d);
      map.set(key, w);
    }
    const now = new Date();
    const thisMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
    if (!map.has(thisMonday.toDateString())) map.set(thisMonday.toDateString(), { start: thisMonday.getTime(), end: thisMonday.getTime() + 6 * 86_400_000, days: [] });
    return [...map.values()].sort((a, b) => b.start - a.start).map((w) => ({ ...w, days: w.days.sort((a, b) => a.createdAt - b.createdAt), current: w.start === thisMonday.getTime() }));
  }, [q.data]);
  const posted = weeks.filter((w) => w.days.length).length;

  const setAvatar = async (f: File | undefined) => {
    if (!f) return;
    const fd = new FormData();
    fd.set('avatar', await fileToSquareJpeg(f), 'avatar.jpg');
    await api.post('/me/avatar', fd).catch(() => undefined);
    void queryClient.invalidateQueries({ queryKey: ['me'] });
  };
  const shareProfile = () => {
    if (typeof navigator.share === 'function') void navigator.share({ url: location.origin }).catch(() => undefined);
  };

  return (
    <div className={s.root} data-light>
      <div className={s.scroll}>
        <header className={s.head}>
          <div className={s.names}>
            <h1>{user?.name}</h1>
          </div>
          <button className={s.photo} onClick={() => photo.current?.click()} aria-label={ios.edit}>
            <Avatar user={user} size={64} />
          </button>
          <input ref={photo} type="file" accept="image/*" hidden onChange={(e) => void setAvatar(e.target.files?.[0])} />
        </header>

        <div className={s.info}>
          <span>
            <Icon name="calendar" size={16} strokeWidth={2} />
            {retro.weeksPosted(posted)}
          </span>
        </div>

        <div className={s.buttons}>
          <button onClick={() => group && nav(`/g/${group.id}/week/${group.ritual.weekKey}`)}>{retro.recaps}</button>
          <button onClick={shareProfile}>{retro.shareProfile}</button>
          <button className={s.gear} onClick={() => nav('/me/settings')} aria-label={ios.settings}>
            <Icon name="gear" size={18} strokeWidth={2} />
          </button>
        </div>

        {weeks.map((w) => (
          <section key={w.start} className={s.week}>
            <div className={s.weekHead}>
              <span>
                <b>{retro.week(isoWeek(w.start))}</b> <i>{retro.weekRange(w.start, w.end)}</i>
              </span>
              <button className={s.dots} onClick={() => nav('/journal/calendar')} aria-label={ios.more}>
                <Icon name="more" size={22} strokeWidth={3.2} />
              </button>
            </div>
            <div className={s.strip}>
              {w.days.length > 0 && (
                <div className={s.tiles}>
                  {w.days.map((d) => (
                    <button key={d.id} className={s.tile} onClick={() => nav(`/p/${d.id}`)}>
                      <img src={d.thumb} alt="" />
                      <span>{retro.days[(new Date(d.createdAt).getDay() + 6) % 7]}</span>
                    </button>
                  ))}
                </div>
              )}
              {w.current && (
                <button className={s.plus} onClick={() => nav('/')} aria-label={ios.axShutter}>
                  <Icon name="plus" size={26} strokeWidth={2} />
                </button>
              )}
            </div>
          </section>
        ))}
        <div className={s.tabSpace} />
      </div>
      <AppTabs />
    </div>
  );
}
