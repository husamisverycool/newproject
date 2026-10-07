import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { COPY } from '@app/shared';
import { api } from '../lib/api';
import { useActiveGroup, useGroup, useJournal } from '../lib/queries';
import { firstName, weekRange } from '../lib/format';
import type { JournalWeek, Post } from '../lib/types';
import { Icon } from '../components/Icon';
import { Avatar, AvatarStack, IconButton, StreakBadge } from '../components/ui';
import { Mascot } from '../components/Mascot';
import { WallCanvas } from '../components/WallCanvas';
import { BottomNav } from '../components/BottomNav';
import s from './journal.module.css';

/**
 * Retro's weekly journal: "week-by-week", each week a horizontal "film strip" with rounded outer
 * corners; "tap on someone's card" to see their week; a "this week in" card at the end of the row
 * with Rewind just past it. The current week stays blurred until you post (Retro / BeReal, softened
 * per spec §E). Above it: Yope's "right now" split view, the Duolingo-style group quest, this week's game.
 */
export default function Journal() {
  const nav = useNavigate();
  const { group } = useActiveGroup();
  const j = useJournal(group?.id);
  const detail = useGroup(group?.id);
  const game = useQuery({ queryKey: ['game', group?.id], queryFn: () => api.get<{ game: { id: string; kind: string; intro: string; closed: boolean } | null }>(`/groups/${group!.id}/game`), enabled: Boolean(group) });
  if (!group) return null;
  const d = detail.data;
  return (
    <div className="screen">
      <header className={s.header}>
        <IconButton icon="chevronDown" label="Back to camera" onClick={() => nav('/')} />
        <button className={s.headTitle} onClick={() => nav(`/g/${group.id}/settings`)}>
          <span>{group.emoji} {group.name}</span>
          <StreakBadge weeks={group.ritual.streak} size={14} />
        </button>
        <IconButton icon="gear" label="Group settings" onClick={() => nav(`/g/${group.id}/settings`)} />
      </header>
      <div className={`${s.body} scroll`}>
        {/* Yope split view: what friends are up to right now */}
        {d && d.live.length > 0 && (
          <div className={s.nowStrip}>
            <div className={s.nowLabel}>right now</div>
            <div className={`${s.nowRow} scroll`}>
              {d.live.map((p) => (
                <button key={p.id} className={s.nowItem} onClick={() => nav(`/p/${p.id}`)}>
                  <span className={`${s.nowThumb} ${p.seen ? '' : s.nowUnseen}`}>
                    <img src={p.media.thumb ?? p.media.main} alt="" className={p.blurred ? s.blur : ''} />
                  </span>
                  <span className={s.nowName}>{p.mine ? 'You' : firstName(p.user.name)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={s.cards}>
          {game.data?.game && (
            <button className={s.gameCard} onClick={() => nav(`/g/${group.id}/game`)}>
              <Mascot species={group.mascot.species} level={group.mascot.stage.level} outfit={group.mascot.outfit} size={64} mood="party" />
              <span className="grow">
                <span className={s.gameKicker}>this week’s game</span>
                <span className={s.gameIntro}>{game.data.game.intro}</span>
              </span>
              <Icon name="chevronRight" size={20} color="var(--hare)" />
            </button>
          )}
          {d && (
            <button className={s.quest} onClick={() => nav(`/g/${group.id}/game`)}>
              <div className="hstack gap8">
                <Icon name="flame" size={20} color="var(--orange)" />
                <span className={s.questTitle}>{d.quest.label}</span>
              </div>
              <div className={s.questBar}>
                <span style={{ width: `${Math.min(100, (d.quest.progress / Math.max(1, d.quest.goal)) * 100)}%` }} />
                <b>{d.quest.progress} / {d.quest.goal}</b>
              </div>
              <div className="hstack gap8">
                <AvatarStack users={d.quest.members.filter((m) => m.count >= 3).map((m) => m.user)} size={22} max={6} />
                <span className="t-cap">{d.quest.rewarded ? 'Done! Bonus packs delivered 🎁' : `Reward: ${d.quest.reward}`}</span>
              </div>
            </button>
          )}
        </div>

        {j.data && !j.data.unlocked && (
          <div className={s.gate}>
            <Mascot species={group.mascot.species} level={group.mascot.stage.level} size={70} mood="sleepy" />
            <div>
              <div className="t-headline">{COPY.gateProgress(j.data.memberCount, 3)}</div>
              <div className="t-foot">The wall wakes up at 3 members.</div>
            </div>
            <button className="chip chip-on" onClick={() => nav(`/g/${group.id}/settings?invite=1`)}>Invite</button>
          </div>
        )}

        {j.data?.weeks.map((w) => <WeekRow key={w.weekKey} w={w} groupId={group.id} mascot={{ species: group.mascot.species, level: group.mascot.stage.level, outfit: group.mascot.outfit }} />)}
        <div style={{ height: 120 }} />
      </div>
      <BottomNav active="journal" groupId={group.id} />
    </div>
  );
}

function WeekRow({ w, groupId, mascot }: { w: JournalWeek; groupId: string; mascot: { species: string; level: number; outfit: string[] } }) {
  const nav = useNavigate();
  const count = w.members.reduce((n, m) => n + m.posts.length, 0);
  return (
    <section className={s.week}>
      <div className={s.weekHead}>
        <div>
          <div className={s.weekTitle}>{w.current ? 'This week' : weekRange(w.weekKey)}</div>
          <div className={s.weekSub}>
            {w.current ? `${weekRange(w.weekKey)} · developing` : `${count} moments · developed`}
          </div>
        </div>
        {!w.current && (
          <button className="chip" onClick={() => nav(`/g/${groupId}/week/${w.weekKey}`)}>
            Open <Icon name="chevronRight" size={14} />
          </button>
        )}
      </div>
      <div className={`${s.strip} scroll`}>
        {w.wall && (
          <button className={s.wallTile} onClick={() => nav(`/g/${groupId}/week/${w.weekKey}`)} aria-label="Open this week's wall">
            <WallCanvas layout={w.wall.layout} mascot={mascot} />
          </button>
        )}
        {w.members.length === 0 && (
          <div className={s.emptyWeek}>
            <Icon name="film" size={22} />
            <span>{w.current ? 'Nothing in this week’s roll yet' : 'A quiet week'}</span>
          </div>
        )}
        {w.members.map((m) => (
          <FriendCard key={m.user.id} name={m.posts[0]?.mine ? 'You' : firstName(m.user.name)} user={m.user} posts={m.posts} blurred={w.blurred} />
        ))}
        {w.thisWeekIn && (
          <button className={s.thisWeekIn} onClick={() => nav('/rewind')}>
            <img src={w.thisWeekIn.posts[0].media.thumb ?? w.thisWeekIn.posts[0].media.main} alt="" />
            <span className={s.twiLabel}>
              {COPY.thisWeekIn} <b>{new Date(w.thisWeekIn.posts[0].takenAt).getFullYear()}</b>
            </span>
          </button>
        )}
        {w.current && (
          <button className={s.rewindTile} onClick={() => nav('/rewind')}>
            <Icon name="rewind" size={28} />
            <span>Rewind</span>
          </button>
        )}
      </div>
      {w.blurred && (
        <button className={s.lockBar} onClick={() => nav('/')}>
          <Icon name="lock" size={16} /> Post to see this week
        </button>
      )}
    </section>
  );
}

/** A friend's week as one film strip: photos flush, outer corners rounded. */
function FriendCard({ name, user, posts, blurred }: { name: string; user: Post['user']; posts: Post[]; blurred: boolean }) {
  const nav = useNavigate();
  return (
    <button className={s.friend} onClick={() => nav(`/p/${posts[0].id}`)}>
      <span className={s.film}>
        {posts.slice(0, 4).map((p) => (
          <img key={p.id} src={p.media.thumb ?? p.media.main} alt="" className={blurred && !p.mine ? s.blur : ''} />
        ))}
      </span>
      <span className={s.friendName}>
        <Avatar user={user} size={18} /> {name}
        {posts.length > 1 && <span className={s.friendN}>{posts.length}</span>}
      </span>
    </button>
  );
}
