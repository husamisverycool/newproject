import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ios, locket } from '@app/shared';
import { api } from '../lib/api';
import { invalidateGroup, useActiveGroup, useFeed, useRitual } from '../lib/queries';
import { haptic } from '../lib/feedback';
import { BarButton, NavBar, Screen, Spinner } from '../components/ios';
import s from './roll.module.css';

/**
 * Locket Rollcall composer [V]: "Tap the Live Activity and share your favorite 10 photos from the past
 * week." Picks come from your own in-app photos this week (ritual posts stay camera-only, spec §D),
 * in an iOS photo-picker grid with numbered selection [HIG]. "Once you share your Rollcall, you'll
 * instantly see what your friends shared too" [V] → the week opens.
 */
export default function RollComposer() {
  const nav = useNavigate();
  const { group } = useActiveGroup();
  const ritual = useRitual(group?.id);
  const feed = useFeed(group?.id);
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const week = ritual.data?.weekKey;
  const mine = (feed.data?.posts ?? []).filter((p) => p.mine && p.weekKey === week && !p.fromRoll && p.kind !== 'rewind');
  const toggle = (id: string) => {
    haptic('light');
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= locket.rollcallMax ? p : [...p, id]));
  };
  return (
    <Screen dark>
      <NavBar
        title={locket.shareYourWeek}
        leading={<BarButton onClick={() => nav(-1)}>{ios.cancel}</BarButton>}
        trailing={
          <BarButton bold disabled={!picked.length || busy || !group} onClick={async () => {
            if (!group) return;
            setBusy(true);
            await api.post(`/groups/${group.id}/roll`, { postIds: picked });
            invalidateGroup(group.id);
            nav(`/g/${group.id}/week/${week}`, { replace: true });
          }}>
            {busy ? <Spinner /> : ios.share}
          </BarButton>
        }
      />
      <p className={s.tagline}>{locket.rollcallTagline}</p>
      <div className={`${s.grid} ios-scroll`}>
        <button className={s.camera} onClick={() => nav('/')} aria-label={ios.axShutter}>
          <span />
        </button>
        {mine.map((p) => {
          const n = picked.indexOf(p.id);
          return (
            <button key={p.id} className={s.cell} onClick={() => toggle(p.id)}>
              <img src={p.media.thumb ?? p.media.main} alt="" />
              <span className={`${s.check} ${n >= 0 ? s.checkOn : ''}`}>{n >= 0 ? n + 1 : ''}</span>
            </button>
          );
        })}
      </div>
      <div className={s.count}>
        {picked.length}/{locket.rollcallMax}
      </div>
    </Screen>
  );
}
