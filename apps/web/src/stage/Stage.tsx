import { useEffect, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router';
import { api } from '../lib/api';
import { queryClient, useActiveGroup, useConfig, useRitual } from '../lib/queries';
import { useUi } from '../lib/store';
import { Mascot } from '../components/Mascot';
import { Wordmark } from '../components/Brand';
import { bereal, demo, locket } from '@app/shared';
import { SystemPhone, SystemSwitch } from './SystemPhone';
import './stage.css';

/**
 * Desktop presentation [DEMO]: the app runs inside an iPhone-sized frame (393×852 pt) next to a second
 * device showing the system surfaces the spec relies on — the Lock Screen (Yope [I], the Rollcall
 * Live Activity [V]) and the Home Screen widgets (Locket [I], Widgetable [V], Retro [V-weak]) — fed
 * by the same live data. The intro uses Locket's own store lines [V].
 */
export function Stage({ children }: { children: ReactNode }) {
  const loc = useLocation();
  const cfg = useConfig();
  const { group, me } = useActiveGroup();
  return (
    <div className="stage">
      <div className="stage-intro">
        <Wordmark size={44} />
        <p className="stage-tag">{locket.subtitle}</p>
        <p className="stage-copy">{locket.storeLine}</p>
        {cfg.data?.demo && me.data && <DemoPanel groupId={group?.id ?? null} />}
        <p className="stage-foot">{demo.provenance}</p>
      </div>
      <Device notchSlot={<IslandActivity groupId={group?.id ?? null} />} label="app">
        <div className="device-screen" data-path={loc.pathname}>
          {children}
        </div>
      </Device>
      {me.data && (
        <div className="sys-col">
          <Device label="system" dim>
            <SystemPhone />
          </Device>
          <SystemSwitch />
        </div>
      )}
    </div>
  );
}

export function Device({ children, notchSlot, label, dim }: { children: ReactNode; notchSlot?: ReactNode; label: string; dim?: boolean }) {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 15_000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className={`device ${dim ? 'device-dim' : ''}`} data-device={label}>
      <div className="device-glass">
        <div className="statusbar">
          <span className="sb-time">{time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M/i, '')}</span>
          <span className="sb-right">
            <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-hidden>
              <rect x="0" y="8" width="3" height="4" rx="1" />
              <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
              <rect x="10" y="3" width="3" height="9" rx="1" />
              <rect x="15" y="0" width="3" height="12" rx="1" />
            </svg>
            <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" aria-hidden>
              <path d="M8 2.6c2.2 0 4.2.9 5.6 2.3l1.1-1.1A9.4 9.4 0 0 0 8 1 9.4 9.4 0 0 0 1.3 3.8l1.1 1.1A7.8 7.8 0 0 1 8 2.6Zm0 3.2c1.3 0 2.5.5 3.4 1.4l1.1-1.1A6.3 6.3 0 0 0 8 4.2 6.3 6.3 0 0 0 3.5 6.1l1.1 1.1c.9-.9 2.1-1.4 3.4-1.4Zm0 3.2c-.5 0-1 .2-1.3.6L8 11l1.3-1.4c-.3-.4-.8-.6-1.3-.6Z" />
            </svg>
            <span className="sb-battery">
              <span />
            </span>
          </span>
        </div>
        <div className="island">{notchSlot}</div>
        {children}
        <div className="home-indicator" />
      </div>
    </div>
  );
}

const clock = (ms: number) => {
  const t = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  return `${h > 0 ? `${h}:` : ''}${String(m).padStart(h > 0 ? 2 : 1, '0')}:${String(t % 60).padStart(2, '0')}`;
};

/** Dynamic Island compact presentation of the ritual Live Activity [HIG]: leading the mascot, trailing BeReal's countdown [V]. */
function IslandActivity({ groupId }: { groupId: string | null }) {
  const r = useRitual(groupId);
  const { group } = useActiveGroup();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!r.data?.isOpen || !group) return null;
  const left = r.data.developsAt - (r.data.now + (now - r.dataUpdatedAt));
  return (
    <div className="island-compact">
      <span className="island-lead">
        <Mascot species={group.mascot.species} level={group.mascot.stage.level} size={26} />
      </span>
      <span className="island-trail">{bereal.timer(clock(left))}</span>
    </div>
  );
}

function DemoPanel({ groupId }: { groupId: string | null }) {
  const users = useQuery({ queryKey: ['demo-users'], queryFn: () => api.get<{ users: { id: string; name: string; color: string }[] }>('/demo/users') });
  const { me } = useActiveGroup();
  const setStage = useUi((s) => s.setStage);
  const [busy, setBusy] = useState(false);
  const act = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
      await queryClient.invalidateQueries();
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="demo">
      <div className="demo-label">{demo.viewAs}</div>
      <div className="demo-users">
        {users.data?.users.map((u) => (
          <button
            key={u.id}
            className={`demo-user ${me.data?.user.id === u.id ? 'on' : ''}`}
            onClick={() => act(async () => {
              await api.post('/demo/login', { userId: u.id });
              setStage('app');
            })}
          >
            <span className="dot" style={{ background: u.color }} />
            {u.name.split(' ')[0]}
          </button>
        ))}
      </div>
      <div className="demo-label">{demo.time}</div>
      <div className="demo-users">
        <button className="demo-user" disabled={busy} onClick={() => act(() => api.post('/demo/clock', { to: 'ritual', groupId }))}>{demo.jumpToRoll}</button>
        <button className="demo-user" disabled={busy} onClick={() => act(() => api.post('/demo/clock', { to: 'develop', groupId }))}>{demo.developNow}</button>
        <button className="demo-user" disabled={busy} onClick={() => act(() => api.post('/demo/clock', { to: 'reset', groupId }))}>{demo.backToToday}</button>
      </div>
    </div>
  );
}
