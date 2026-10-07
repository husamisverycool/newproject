import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { bereal, ios } from '@app/shared';
import { api } from '../lib/api';
import { Icon } from '../components/Icon';
import s from './calendar.module.css';

type Day = { id: string; thumb: string; createdAt: number };

/**
 * BeReal's "My BeReals" calendar, laid out from research/inspo/store/bereal-04-calendar [I]: black;
 * title centred; months stacked newest first, the month name small and uppercase; the weekday row
 * MON … SUN; each day with a photo shows it with the date over it in white; days without one show
 * just the number; today has a white outline. "Only you can see your Memories, not even your
 * friends" [V].
 */
export default function Calendar() {
  const nav = useNavigate();
  const q = useQuery({ queryKey: ['memories'], queryFn: () => api.get<{ days: Day[] }>('/me/memories') });
  const months = useMemo(() => {
    const byDay = new Map((q.data?.days ?? []).map((d) => [new Date(d.createdAt).toDateString(), d]));
    const now = new Date();
    const first = q.data?.days.at(-1)?.createdAt ?? now.getTime();
    const out: { key: string; label: string; cells: ({ n: number; day?: Day; today: boolean } | null)[] }[] = [];
    const cur = new Date(now.getFullYear(), now.getMonth(), 1);
    const stop = new Date(new Date(first).getFullYear(), new Date(first).getMonth(), 1);
    while (cur >= stop && out.length < 24) {
      const y = cur.getFullYear();
      const m = cur.getMonth();
      const lead = (new Date(y, m, 1).getDay() + 6) % 7;
      const len = new Date(y, m + 1, 0).getDate();
      const cells: ({ n: number; day?: Day; today: boolean } | null)[] = Array.from({ length: lead }, () => null);
      for (let n = 1; n <= len; n++) {
        const d = new Date(y, m, n);
        cells.push({ n, day: byDay.get(d.toDateString()), today: d.toDateString() === now.toDateString() });
      }
      out.push({ key: `${y}-${m}`, label: cur.toLocaleDateString('en-US', { month: 'long', ...(y !== now.getFullYear() ? { year: 'numeric' } : {}) }).toUpperCase(), cells });
      cur.setMonth(m - 1);
    }
    return out;
  }, [q.data]);

  return (
    <div className={s.root}>
      <header className={s.header}>
        <button className={s.back} onClick={() => nav(-1)} aria-label={ios.back}>
          <Icon name="chevronLeft" size={24} strokeWidth={2.6} />
        </button>
        <h1>{bereal.myPhotos}</h1>
        <span />
      </header>
      <div className={s.scroll}>
        <p className={s.private}>{bereal.memoriesPrivate}</p>
        {months.map((mo) => (
          <section key={mo.key} className={s.month}>
            <h2>{mo.label}</h2>
            <div className={s.grid}>
              {bereal.weekdays.map((w) => (
                <span key={w} className={s.wd}>
                  {w}
                </span>
              ))}
              {mo.cells.map((c, k) =>
                c ? (
                  <button key={k} className={`${s.cell} ${c.today ? s.today : ''}`} disabled={!c.day} onClick={() => c.day && nav(`/p/${c.day.id}`)}>
                    {c.day && <img src={c.day.thumb} alt="" />}
                    <span>{c.n}</span>
                  </button>
                ) : (
                  <span key={k} />
                ),
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
