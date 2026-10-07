import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { COPY } from '@app/shared';
import { api } from '../lib/api';
import { queryClient } from '../lib/queries';
import { useUi } from '../lib/store';
import { haptic, sfx } from '../lib/feedback';
import type { MascotState, WallLayout } from '../lib/types';
import { Mascot } from '../components/Mascot';
import { WallCanvas } from '../components/WallCanvas';
import { Wordmark } from '../components/ui';
import { weekRange } from '../lib/format';
import s from './join.module.css';

interface JoinData {
  group: { name: string; emoji: string; mascot: MascotState; code: string; memberCount: number; members: { name: string; color: string; avatar: string | null }[]; full: boolean };
  latest: { weekKey: string; layout: WallLayout } | null;
  reactions: { emoji: string; n: number }[];
  mine: string[];
  signedIn: boolean;
  isMember: boolean;
}

/**
 * Join by link, no install (spec §A2): Partiful's RSVP-by-link page — poster on top, title, the
 * guest list, one black action — showing the group mascot, member count and latest recap.
 * Anyone can view and react without an account; joining needs the app.
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
          <Wordmark size={40} color="var(--black)" />
          <p>This invite doesn’t exist anymore.</p>
        </div>
      </div>
    );
  }
  if (!d) return <div className={s.page} data-light />;
  const react = async (emoji: string) => {
    if (!d.latest) return;
    haptic('light');
    sfx.pop();
    setBurst(emoji + Date.now());
    await api.post(`/join/${code}/react`, { emoji, weekKey: d.latest.weekKey });
    void q.refetch();
  };
  const join = async () => {
    if (!d.signedIn) {
      nav(`/welcome?join=${code}`);
      return;
    }
    setBusy(true);
    const r = await api.post<{ groupId: string }>(`/join/${code}`);
    setActive(r.groupId);
    await queryClient.invalidateQueries({ queryKey: ['me'] });
    nav('/');
  };
  return (
    <div className={`${s.page} scroll`} data-light>
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
        <div className={s.kicker}>
          <Wordmark size={16} color="var(--black)" /> · {d.latest ? `latest roll · ${weekRange(d.latest.weekKey)}` : 'a new group'}
        </div>
        <h1 className={s.title}>
          {d.group.emoji} {d.group.name}
        </h1>
        <div className={s.hosts}>
          <span className={s.faces}>
            {d.group.members.map((m, i) => (
              <span key={i} className={s.face} style={{ background: m.avatar ? `center/cover url(${m.avatar})` : m.color, marginLeft: i ? -10 : 0 }}>
                {!m.avatar && m.name[0]}
              </span>
            ))}
          </span>
          <span>
            {d.group.members.slice(0, 3).map((m) => m.name).join(', ')}
            {d.group.memberCount > 3 ? ` + ${d.group.memberCount - 3} more` : ''}
          </span>
        </div>
        <div className={s.mascotLine}>
          <Mascot species={d.group.mascot.species} level={d.group.mascot.stage.level} outfit={d.group.mascot.outfit} size={44} idle={false} />
          <span>
            <b>{d.group.mascot.name}</b> is level {d.group.mascot.stage.level} · {d.group.mascot.stage.name}
          </span>
        </div>

        {d.latest && (
          <div className={s.reactRow}>
            {['💛', '🔥', '😂', '😍', '🫶'].map((e) => {
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
                {burst.slice(0, 2)}
              </motion.span>
            )}
          </div>
        )}
        <p className={s.note}>{d.signedIn ? 'Reacting as you.' : 'You can react without an account. Posting needs the app.'}</p>
      </div>
      <div className={s.actions}>
        {d.isMember ? (
          <button className={s.primary} onClick={() => { nav('/'); }}>Open roll.</button>
        ) : d.group.full ? (
          <button className={s.primary} disabled>This group is full</button>
        ) : (
          <button className={s.primary} onClick={join} disabled={busy}>
            {d.signedIn ? `Join ${d.group.name}` : COPY.joinParty.replace('Party', 'the group')}
          </button>
        )}
        <div className={s.code}>room code <b>{d.group.code}</b></div>
      </div>
    </div>
  );
}
