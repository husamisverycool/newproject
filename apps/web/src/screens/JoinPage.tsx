import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { imessage, ios, jackbox, partiful } from '@app/shared';
import { api } from '../lib/api';
import { queryClient } from '../lib/queries';
import { useUi } from '../lib/store';
import { haptic } from '../lib/feedback';
import type { MascotState, WallLayout } from '../lib/types';
import { Mascot } from '../components/Mascot';
import { WallCanvas } from '../components/WallCanvas';
import { Wordmark } from '../components/Brand';
import s from './join.module.css';

interface JoinData {
  group: { name: string; emoji: string; mascot: MascotState; code: string; memberCount: number; members: { name: string; color: string; avatar: string | null }[]; full: boolean; hosts?: string[] };
  latest: { weekKey: string; layout: WallLayout } | null;
  reactions: { emoji: string; n: number }[];
  mine: string[];
  signedIn: boolean;
  isMember: boolean;
  waitlisted?: boolean;
}

/**
 * Join by link, no install (spec §A2) — Partiful's guest event page [V/B-med]: poster, title in the
 * display face, "Hosted by …", "# Going", emoji RSVP buttons (👍 Going · 😢 Can't Go, "Maybe" turned off
 * as hosts can [V]), "Join Waitlist" at capacity, then the "Activity Feed". Jackbox's four-letter
 * "Room Code" [V]. Reactions: iOS 27 shared albums take any emoji [V-weak]; the quick set is the
 * Messages Tapback set [V]. Viewing and reacting need no account; joining needs the app (spec §A2).
 */
export default function JoinPage() {
  const { code = '' } = useParams();
  const nav = useNavigate();
  const setActive = useUi((st) => st.setActiveGroup);
  const q = useQuery({ queryKey: ['join', code], queryFn: () => api.get<JoinData>(`/join/${code}`) });
  const [busy, setBusy] = useState(false);
  const [burst, setBurst] = useState<string | null>(null);
  const d = q.data;
  if (q.isError) {
    return (
      <div className={s.page} data-light>
        <div className={s.missing}>
          <Wordmark size={40} />
        </div>
      </div>
    );
  }
  if (!d) return <div className={s.page} data-light />;
  const react = async (emoji: string) => {
    if (!d.latest) return;
    haptic('light');
    setBurst(emoji + Date.now());
    await api.post(`/join/${code}/react`, { emoji, weekKey: d.latest.weekKey });
    void q.refetch();
  };
  const going = async () => {
    if (!d.signedIn) {
      nav(`/welcome?join=${code}`);
      return;
    }
    setBusy(true);
    haptic('medium');
    if (d.group.full) {
      await api.post(`/join/${code}/waitlist`);
      void q.refetch();
      setBusy(false);
      return;
    }
    const r = await api.post<{ groupId: string }>(`/join/${code}`);
    setActive(r.groupId);
    await queryClient.invalidateQueries({ queryKey: ['me'] });
    nav('/');
  };
  const hosts = d.group.hosts?.length ? d.group.hosts : d.group.members.slice(0, 1).map((m) => m.name.split(' ')[0]);
  return (
    <div className={`${s.page} ios-scroll`} data-light>
      <div className={s.poster}>
        {d.latest ? (
          <WallCanvas layout={d.latest.layout} mascot={{ species: d.group.mascot.species, level: d.group.mascot.stage.level, outfit: d.group.mascot.outfit }} animateIn />
        ) : (
          <div className={s.posterEmpty}>
            <Mascot species={d.group.mascot.species} level={d.group.mascot.stage.level} outfit={d.group.mascot.outfit} size={180} />
          </div>
        )}
      </div>
      <div className={s.body}>
        <h1 className={s.title}>{d.group.name}</h1>
        <div className={s.hosted}>{partiful.hostedBy(hosts.join(' & '))}</div>
        <div className={s.going}>
          <span className={s.faces}>
            {d.group.members.slice(0, 6).map((m, i) => (
              <span key={i} className={s.face} style={{ background: m.avatar ? `center/cover url(${m.avatar})` : undefined, marginLeft: i ? -8 : 0 }}>
                {!m.avatar && m.name[0]}
              </span>
            ))}
          </span>
          <span>{partiful.countGoing(d.group.memberCount)}</span>
        </div>
        <div className={s.mascot}>
          <Mascot species={d.group.mascot.species} level={d.group.mascot.stage.level} outfit={d.group.mascot.outfit} size={40} />
          <b>{d.group.mascot.name}</b>
        </div>

        {d.isMember ? (
          <button className={s.open} onClick={() => nav('/')}>{ios.open}</button>
        ) : (
          <div className={s.rsvp}>
            <button className={s.rsvpBtn} onClick={going} disabled={busy || d.waitlisted}>
              <span className={s.rsvpEmoji}>{partiful.rsvpEmoji.going}</span>
              {d.group.full ? partiful.joinWaitlist : partiful.going}
            </button>
            <button className={s.rsvpBtn} onClick={() => nav(-1)}>
              <span className={s.rsvpEmoji}>{partiful.rsvpEmoji.cant_go}</span>
              {partiful.cantGo}
            </button>
          </div>
        )}

        <div className={s.room}>
          <span>{jackbox.roomCode}</span>
          <b>{d.group.code}</b>
        </div>

        {d.latest && (
          <section className={s.feed}>
            <h2 className={s.feedHead}>{partiful.activityFeed}</h2>
            <div className={s.reactRow}>
              {imessage.tapbacks.map((e) => {
                const n = d.reactions.find((r) => r.emoji === e)?.n ?? 0;
                return (
                  <button key={e} className={`${s.reactBtn} ${d.mine.includes(e) ? s.reactMine : ''}`} onClick={() => react(e)}>
                    <span>{e}</span>
                    {n > 0 && <span className={s.reactN}>{n}</span>}
                  </button>
                );
              })}
              {burst && (
                <motion.span key={burst} className={s.burst} initial={{ y: 0, opacity: 1, scale: 1 }} animate={{ y: -80, opacity: 0, scale: 1.8 }} transition={{ duration: 0.8 }}>
                  {[...burst][0]}
                </motion.span>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
