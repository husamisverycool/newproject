import { useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { bereal, duolingo, ios, locket, retro, spec } from '@app/shared';
import { useActiveGroup, useGroup, useJournal } from '../lib/queries';
import { useUi } from '../lib/store';
import { haptic } from '../lib/feedback';
import { firstName, isoWeek, weekBounds } from '../lib/format';
import type { JournalWeek, Post } from '../lib/types';
import { Icon } from '../components/Icon';
import { Avatar, Menu, Row, Section, Sheet } from '../components/ios';
import { Mascot } from '../components/Mascot';
import { AppTabs } from '../components/AppTabs';
import s from './journal.module.css';

/**
 * The group's journal — Retro's weekly feed, laid out from research/inspo/store/retro-01-weekly-feed
 * and retro-02-profile [I]: light screen; the large serif "Week 27" title with two glyphs at the
 * right; your week as day tiles flush together ("Mon", "Tue", …) ending in a gray "+" tile; friends'
 * weeks as tall cards in a carousel, name above, a red "6 new" pill; earlier weeks as sections
 * "Week 26 Jun 26 - Jul 2" with "•••" and their day strip. Retro's "this week in" card [V] ends the
 * current strip. The current week is blurred until you post (BeReal's "Share to view" [I], spec §E,
 * never past weeks). The Duolingo Friends Quest module [V] carries the group quest (spec §K).
 * Search (spec §L) is the stock search field that sits above the large title and stays hidden until
 * you pull the list down (UISearchController, hidesSearchBarWhenScrolling) [HIG], so Retro's header
 * is unchanged at rest.
 */
export default function Journal() {
  const nav = useNavigate();
  const { group, groups } = useActiveGroup();
  const setActive = useUi((st) => st.setActiveGroup);
  const j = useJournal(group?.id);
  const detail = useGroup(group?.id);
  const [picker, setPicker] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const searchRow = useRef<HTMLButtonElement>(null);
  // Start scrolled past the search field (hidden until pulled down) [HIG], once the weeks are in.
  const loaded = Boolean(j.data);
  useLayoutEffect(() => {
    if (loaded && scroller.current && searchRow.current) scroller.current.scrollTop = searchRow.current.offsetHeight + 10;
  }, [group?.id, loaded]);
  if (!group) return null;
  const weeks = j.data?.weeks ?? [];
  const current = weeks.find((w) => w.current);
  const past = weeks.filter((w) => !w.current);
  const d = detail.data;
  const start = current ? weekBounds(current.weekKey).start : Date.now();

  return (
    <div className={s.root} data-light>
      <div className={s.scroll} ref={scroller}>
        <button ref={searchRow} className={s.search} onClick={() => nav('/journal/search')}>
          <Icon name="searchGlass" size={17} strokeWidth={2.4} />
          {ios.search}
        </button>
        <header className={s.header}>
          <div className={s.titles}>
            <h1 className={s.title}>{retro.week(isoWeek(start))}</h1>
            <button className={s.groupName} onClick={() => setPicker(true)}>
              {group.name}
              <Icon name="chevronDown" size={14} strokeWidth={2.6} />
            </button>
          </div>
          <button className={s.glyph} onClick={() => nav('/journal/calendar')} aria-label={bereal.myPhotos}>
            <Icon name="book" size={26} strokeWidth={1.8} />
          </button>
          <button className={s.glyph} onClick={() => nav('/rewind')} aria-label={retro.rewind}>
            <Icon name="clockBack" size={26} strokeWidth={1.8} />
          </button>
        </header>

        {j.data && !j.data.unlocked && (
          <button className={s.gate} onClick={() => nav(`/g/${group.id}/settings`)}>
            <Mascot species={group.mascot.species} level={group.mascot.stage.level} outfit={group.mascot.outfit} size={56} />
            <span>{locket.friendsAdded(Math.max(0, j.data.memberCount - 1), 2)}</span>
            <Icon name="chevronRight" size={18} />
          </button>
        )}

        {current && <MyWeek week={current} onAdd={() => nav('/')} />}
        {current && <Friends week={current} />}

        {d && (
          <section className={s.quest}>
            <div className={s.questHead}>
              <b>{duolingo.friendsQuest}</b>
              <span>{duolingo.daysLeft(Math.max(1, Math.ceil((weekBounds(d.quest.weekKey).end - Date.now()) / 86_400_000)))}</span>
            </div>
            <p className={s.questGoal}>{spec.questGoal(3)}</p>
            <div className={s.questBar}>
              <span style={{ width: `${Math.min(100, (d.quest.progress / Math.max(1, d.quest.goal)) * 100)}%` }} />
              <b>
                {d.quest.progress} / {d.quest.goal}
              </b>
              <Icon name="gift" size={26} filled color="var(--duo-bee)" />
            </div>
          </section>
        )}

        {past.map((w) => (
          <PastWeek key={w.weekKey} week={w} groupId={group.id} />
        ))}
        <div className={s.tabSpace} />
      </div>
      <AppTabs />

      <Sheet open={picker} onClose={() => setPicker(false)} light>
        <Section>
          {groups.map((g) => (
            <Row
              key={g.id}
              icon={<Mascot species={g.mascot.species} level={g.mascot.stage.level} outfit={g.mascot.outfit} size={36} />}
              title={g.name}
              sub={locket.friendsPill(g.memberCount)}
              chevron={false}
              accessory={g.id === group.id ? <Icon name="check" size={20} color="var(--sys-blue)" strokeWidth={2.6} /> : undefined}
              onClick={() => { haptic('light'); setActive(g.id); setPicker(false); }}
              sepInset={64}
            />
          ))}
        </Section>
        <Section>
          <Row title={locket.createNew} link onClick={() => { setPicker(false); nav('/new-group'); }} chevron={false} />
        </Section>
      </Sheet>
    </div>
  );
}

/** The first photo of each day, Monday first. */
function byDay(posts: Post[]) {
  const days = new Map<number, Post>();
  for (const p of [...posts].sort((a, b) => a.takenAt - b.takenAt)) {
    const k = (new Date(p.createdAt).getDay() + 6) % 7;
    if (!days.has(k)) days.set(k, p);
  }
  return [...days.entries()].sort((a, b) => a[0] - b[0]);
}

/** [I] retro-01: your week, day tiles flush together, then the gray "+" tile. */
function MyWeek({ week, onAdd }: { week: JournalWeek; onAdd: () => void }) {
  const nav = useNavigate();
  const mine = week.members.find((m) => m.posts[0]?.mine)?.posts ?? [];
  return (
    <div className={s.strip}>
      <div className={s.tiles}>
        {byDay(mine).map(([day, p]) => (
          <button key={p.id} className={s.tile} onClick={() => nav(`/p/${p.id}`)}>
            <img src={p.media.thumb ?? p.media.main} alt="" />
            <span>{retro.days[day]}</span>
          </button>
        ))}
      </div>
      <button className={s.plus} onClick={onAdd} aria-label={ios.axShutter}>
        <Icon name="plus" size={26} strokeWidth={2} />
      </button>
      {week.thisWeekIn && (
        <button className={s.thisWeekIn} onClick={() => nav('/rewind')}>
          <img src={week.thisWeekIn.posts[0].media.thumb ?? week.thisWeekIn.posts[0].media.main} alt="" />
          <span>{spec.thisWeekYearsAgo(week.thisWeekIn.yearsAgo)}</span>
        </button>
      )}
    </div>
  );
}

/** [I] retro-01: friends' weeks — avatar + name above a tall card, red "N new" pill. */
function Friends({ week }: { week: JournalWeek }) {
  const nav = useNavigate();
  const friends = week.members.filter((m) => !m.posts[0]?.mine && m.posts.length);
  if (!friends.length) return null;
  return (
    <div className={s.carousel}>
      {friends.map((m) => {
        const latest = m.posts[m.posts.length - 1];
        const fresh = m.posts.filter((p) => !p.seen).length;
        return (
          <button key={m.user.id} className={s.friend} onClick={() => nav(`/p/${latest.id}`)}>
            <span className={s.friendName}>
              <Avatar user={m.user} size={22} />
              {firstName(m.user.name)}
            </span>
            <span className={s.card}>
              <img src={latest.media.thumb ?? latest.media.main} alt="" className={week.blurred ? s.blur : ''} />
              {fresh > 0 && !week.blurred && <span className={s.newPill}>{retro.nNew(fresh)}</span>}
              {week.blurred && (
                <span className={s.lock}>
                  <Icon name="eyeOff" size={22} strokeWidth={2.2} />
                  <b>{bereal.shareToView}</b>
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** [I] retro-02: "Week 26 Jun 26 - Jul 2" with "•••", then the day strip. */
function PastWeek({ week, groupId }: { week: JournalWeek; groupId: string }) {
  const nav = useNavigate();
  const [more, setMore] = useState(false);
  const { start, end } = weekBounds(week.weekKey);
  const posts = week.members.flatMap((m) => m.posts);
  const open = () => nav(`/g/${groupId}/week/${week.weekKey}`);
  return (
    <section className={s.past}>
      <div className={s.pastHead}>
        <button onClick={open}>
          <b>{retro.week(isoWeek(start))}</b> <span>{retro.weekRange(start, end)}</span>
        </button>
        <button className={s.dots} onClick={() => setMore(true)} aria-label={ios.more}>
          <Icon name="more" size={22} strokeWidth={3.2} />
        </button>
      </div>
      <div className={s.tiles}>
        {byDay(posts).map(([day, p]) => (
          <button key={p.id} className={s.tile} onClick={open}>
            <img src={p.media.thumb ?? p.media.main} alt="" />
            <span>{retro.days[day]}</span>
          </button>
        ))}
      </div>
      <Menu
        open={more}
        onClose={() => setMore(false)}
        actions={[
          { label: retro.recaps, icon: 'film', onClick: open },
          { label: retro.postcard, icon: 'pencil', onClick: () => nav(`/g/${groupId}/week/${week.weekKey}?postcard=1`) },
        ]}
      />
    </section>
  );
}
