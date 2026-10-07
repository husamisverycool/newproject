import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { countdown, firstName, timeAgo, weekRange } from '../lib/format';
import type { Post, PublicUser, MascotState } from '../lib/types';
import { useUi } from '../lib/store';
import { Avatar, AvatarStack, StreakBadge, Wordmark } from '../components/ui';
import { Mascot } from '../components/Mascot';
import { Icon } from '../components/Icon';

interface WidgetGroup {
  group: { id: string; name: string; emoji: string; mascot: MascotState };
  latest: Post | null;
  streak: number;
  ritual: { isOpen: boolean; developsAt: number; opensAt: number; posted: number; of: number; posters: PublicUser[]; youPosted: boolean };
  memory: { yearsAgo: number; posts: Post[] } | null;
}

export function useWidgets() {
  return useQuery({ queryKey: ['widgets'], queryFn: () => api.get<{ groups: WidgetGroup[]; hideStreak: boolean }>('/widgets'), refetchInterval: 20_000 });
}

/** The second device: Lock Screen or Home Screen, switchable. */
export function SystemPhone() {
  const stage = useUi((s) => s.stage);
  const w = useWidgets();
  const mode = stage === 'app' ? 'lock' : stage;
  return <div className="sys">{mode === 'lock' ? <LockScreen data={w.data?.groups ?? []} /> : <HomeScreen data={w.data?.groups ?? []} hideStreak={Boolean(w.data?.hideStreak)} />}</div>;
}

export function SystemSwitch() {
  const stage = useUi((s) => s.stage);
  const setStage = useUi((s) => s.setStage);
  const mode = stage === 'app' ? 'lock' : stage;
  return (
    <div className="sys-switch">
      <button aria-pressed={mode === 'lock'} onClick={() => setStage('lock')}>Lock Screen</button>
      <button aria-pressed={mode === 'home'} onClick={() => setStage('home')}>Home Screen</button>
    </div>
  );
}

function useNow(ms = 1000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

/* ───────────────────────── Lock Screen ───────────────────────── */

function LockScreen({ data }: { data: WidgetGroup[] }) {
  const now = useNow();
  const d = new Date(now);
  const main = data[0];
  const toasts = useUi((s) => s.toasts);
  return (
    <div className="lock">
      <div className="lock-date">{d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</div>
      <div className="lock-time">{d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M/i, '')}</div>
      {main && (
        <div className="lock-widgets">
          {/* accessoryCircular: mascot level ring */}
          <div className="acc-circ" title="Mascot level">
            <svg viewBox="0 0 36 36" className="ring">
              <circle cx="18" cy="18" r="15" stroke="rgba(255,255,255,.25)" strokeWidth="3" fill="none" />
              <circle cx="18" cy="18" r="15" stroke="#fff" strokeWidth="3" fill="none" strokeDasharray={`${main.group.mascot.stage.progress * 94} 94`} transform="rotate(-90 18 18)" strokeLinecap="round" />
            </svg>
            <Mascot species={main.group.mascot.species} level={main.group.mascot.stage.level} size={34} idle={false} style={{ filter: 'grayscale(1) brightness(2.2)' }} />
          </div>
          {/* accessoryRectangular: next roll */}
          <div className="acc-rect">
            <div className="acc-rect-title">
              {main.group.emoji} {main.group.name}
            </div>
            <div className="acc-rect-body">{main.ritual.isOpen ? `${main.ritual.posted}/${main.ritual.of} posted` : `develops in ${countdown(main.ritual.developsAt - now)}`}</div>
            <div className="acc-rect-sub">
              <Icon name="flame" size={12} /> {main.streak}-week streak
            </div>
          </div>
        </div>
      )}
      <div className="lock-spacer" />
      {data.map((g) => (g.ritual.isOpen ? <LiveActivity key={g.group.id} g={g} now={now} /> : null))}
      {toasts.slice(-2).map((t) => (
        <div key={t.id} className="lock-note">
          <span className="lock-note-icon">
            <Wordmark size={9} />
          </span>
          <span className="grow">
            <span className="lock-note-title">{t.title}</span>
            <span className="lock-note-body">{t.body}</span>
          </span>
          <span className="lock-note-time">now</span>
        </div>
      ))}
      {!data.some((g) => g.ritual.isOpen) && main?.latest && (
        <div className="lock-note">
          <span className="lock-note-icon">
            <Wordmark size={9} />
          </span>
          <span className="grow">
            <span className="lock-note-title">
              {main.group.emoji} {main.group.name}
            </span>
            <span className="lock-note-body">{firstName(main.latest.user.name)} posted · next roll {weekRange(main.latest.weekKey)}</span>
          </span>
          <span className="lock-note-time">{timeAgo(main.latest.createdAt)}</span>
        </div>
      )}
      <div className="lock-bottom">
        <span className="lock-round">
          <Icon name="bolt" size={20} />
        </span>
        <span className="lock-round">
          <Icon name="camera" size={20} />
        </span>
      </div>
    </div>
  );
}

/**
 * Lock Screen Live Activity for the Sunday roll (Locket Rollcall: "Every Sunday, Locket takes over
 * the Lock Screen with a Live Activity"). HIG geometry: ≤160 pt tall, 20 pt margins.
 */
function LiveActivity({ g, now }: { g: WidgetGroup; now: number }) {
  const pct = g.ritual.of ? g.ritual.posted / g.ritual.of : 0;
  return (
    <div className="la">
      <div className="la-top">
        <Mascot species={g.group.mascot.species} level={g.group.mascot.stage.level} outfit={g.group.mascot.outfit} size={44} idle={false} />
        <div className="grow">
          <div className="la-title">
            {g.group.name} <span className="la-dim">· roll day</span>
          </div>
          <div className="la-count">{countdown(g.ritual.developsAt - now)}</div>
          <div className="la-sub">until it develops</div>
        </div>
        <div className="la-ring">
          <svg viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,.18)" strokeWidth="5" fill="none" />
            <circle cx="24" cy="24" r="20" stroke="var(--yellow)" strokeWidth="5" fill="none" strokeDasharray={`${pct * 125.6} 125.6`} transform="rotate(-90 24 24)" strokeLinecap="round" />
          </svg>
          <span>
            {g.ritual.posted}/{g.ritual.of}
          </span>
        </div>
      </div>
      <div className="la-bottom">
        <AvatarStack users={g.ritual.posters} size={22} max={6} />
        <span className="la-dim">{g.ritual.youPosted ? 'You’re in' : `${g.ritual.posted} posted`}</span>
        <span className="la-btn">{g.ritual.youPosted ? 'Open' : 'Post yours'}</span>
      </div>
    </div>
  );
}

/* ───────────────────────── Home Screen ───────────────────────── */

function HomeScreen({ data, hideStreak }: { data: WidgetGroup[]; hideStreak: boolean }) {
  const now = useNow(30_000);
  const main = data[0];
  return (
    <div className="home">
      <div className="home-grid">
        {/* Locket widget: friend's latest photo, name + streak score on the photo */}
        <div className="w w-small w-photo">
          {main?.latest ? (
            <>
              <img src={main.latest.media.thumb ?? main.latest.media.main} alt="" />
              <div className="w-photo-meta">
                <Avatar user={main.latest.user} size={22} />
                <span>{firstName(main.latest.user.name)}</span>
                {!hideStreak && <StreakBadge weeks={main.streak} size={12} />}
              </div>
              {main.latest.caption && <div className="w-caption">{main.latest.caption}</div>}
            </>
          ) : (
            <div className="w-empty">
              <Wordmark size={22} />
              <span>New photos from friends land here</span>
            </div>
          )}
        </div>
        {/* Widgetable / Pengu co-pet: the group mascot */}
        <div className="w w-small w-mascot" style={{ background: 'var(--g1)' }}>
          {main && (
            <>
              <Mascot species={main.group.mascot.species} level={main.group.mascot.stage.level} outfit={main.group.mascot.outfit} size={96} />
              <div className="w-mascot-meta">
                <b>{main.group.mascot.name}</b> · Lv {main.group.mascot.stage.level}
                <div className="w-bar">
                  <span style={{ width: `${main.group.mascot.stage.progress * 100}%` }} />
                </div>
              </div>
            </>
          )}
        </div>
        {/* Retro "time hop" widget: your own memories */}
        <div className="w w-medium w-memory">
          {main?.memory ? (
            <>
              <img src={main.memory.posts[0].media.thumb ?? main.memory.posts[0].media.main} alt="" />
              <div className="w-memory-meta">
                <span className="w-memory-n">{main.memory.yearsAgo}</span>
                <span>year ago this week</span>
              </div>
            </>
          ) : (
            <div className="w-roll">
              <div className="w-roll-head">
                <Wordmark size={16} /> <span className="la-dim">{main?.group.name}</span>
              </div>
              <div className="w-roll-count">{main ? countdown(main.ritual.developsAt - now) : '—'}</div>
              <div className="la-dim">until this week develops</div>
              <div className="w-roll-row">
                {main && <AvatarStack users={main.ritual.posters} size={22} />}
                <span className="la-dim">{main ? `${main.ritual.posted}/${main.ritual.of} in the roll` : ''}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="home-icons">
        <div className="app-icon">
          <span className="app-icon-art">
            <Wordmark size={17} />
          </span>
          <span className="app-icon-label">roll.</span>
        </div>
        {['Camera', 'Photos', 'Messages', 'Settings'].map((n) => (
          <div key={n} className="app-icon">
            <span className="app-icon-art app-icon-blank" />
            <span className="app-icon-label">{n}</span>
          </div>
        ))}
      </div>
      <div className="dock">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="app-icon-art app-icon-blank" />
        ))}
      </div>
    </div>
  );
}
