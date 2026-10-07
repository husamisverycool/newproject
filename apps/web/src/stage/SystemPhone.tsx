import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BRAND, bereal, ios, locket, pets, spec, yope } from '@app/shared';
import { api } from '../lib/api';
import type { Post, PublicUser, MascotState } from '../lib/types';
import { useUi } from '../lib/store';
import { Avatar } from '../components/ios';
import { AppIcon } from '../components/Brand';
import { Mascot } from '../components/Mascot';
import { Icon } from '../components/Icon';
import s from './system.module.css';

interface WidgetGroup {
  group: { id: string; name: string; emoji: string; mascot: MascotState };
  latest: Post | null;
  streak: number;
  ritual: { isOpen: boolean; developsAt: number; opensAt: number; posted: number; of: number; posters: PublicUser[]; youPosted: boolean };
  memory: { yearsAgo: number; posts: Post[] } | null;
  unseen: number;
  members: PublicUser[];
}

export function useWidgets() {
  return useQuery({ queryKey: ['widgets'], queryFn: () => api.get<{ groups: WidgetGroup[]; hideStreak: boolean }>('/widgets'), refetchInterval: 20_000 });
}

interface BestieWidget {
  groupId: string;
  user: PublicUser;
  latest: { media: { main: string; thumb?: string }; caption: string | null; createdAt: number } | null;
}

/** Locket's "Best Friend or Crush widget" [V-weak]: photos from only that person (spec §C). */
function useBestieWidget() {
  return useQuery({ queryKey: ['widgets', 'bestie'], queryFn: () => api.get<{ bestie: BestieWidget | null }>('/widgets/bestie'), refetchInterval: 20_000 });
}

/** The second device: the Lock Screen or the Home Screen, switchable. */
export function SystemPhone() {
  const stage = useUi((st) => st.stage);
  const w = useWidgets();
  const mode = stage === 'app' ? 'lock' : stage;
  return <div className={s.sys}>{mode === 'lock' ? <LockScreen data={w.data?.groups ?? []} /> : <HomeScreen data={w.data?.groups ?? []} />}</div>;
}

export function SystemSwitch() {
  const stage = useUi((st) => st.stage);
  const setStage = useUi((st) => st.setStage);
  const mode = stage === 'app' ? 'lock' : stage;
  return (
    <div className={s.switch}>
      <button aria-pressed={mode === 'lock'} onClick={() => setStage('lock')}>
        {ios.lockScreen}
      </button>
      <button aria-pressed={mode === 'home'} onClick={() => setStage('home')}>
        {ios.homeScreen}
      </button>
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

const hms = (ms: number) => {
  const t = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  return `${h > 0 ? `${h}:` : ''}${String(m).padStart(h > 0 ? 2 : 1, '0')}:${String(t % 60).padStart(2, '0')}`;
};

/* ───────── Lock Screen ─────────
 * Yope's lock screen [I] (yope-02): the iOS date and big glass clock; a photo widget at the bottom
 * the width of a Live Activity (HIG 371 pt), the friend's photo filling it with the time large in the
 * middle and the caption under it, the sender's avatar bottom left; flashlight and camera at the
 * bottom. During the ritual the Rollcall Live Activity [V] ("Every Sunday, you'll get a Live Activity
 * (it looks similar to a notification) inviting you to share your week") sits above it with
 * BeReal's running countdown [V]. Lock Screen widgets above the clock [HIG]: the pet (Widgetable /
 * Pengu "Raise Pets Together" [V]) and the streak (Yope "🔥N" [I]).
 */
function LockScreen({ data }: { data: WidgetGroup[] }) {
  const now = useNow();
  const d = new Date(now);
  const main = data[0];
  const toasts = useUi((st) => st.toasts);
  return (
    <div className={s.lock}>
      <div className={s.lockDate}>{d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long' }).replace(',', '')}</div>
      <div className={s.lockTime}>{d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M/i, '')}</div>
      {main && (
        <div className={s.accessories}>
          <span className={s.accCirc} aria-label={pets.raiseTogether}>
            <Mascot species={main.group.mascot.species} level={main.group.mascot.stage.level} size={40} style={{ filter: 'grayscale(1) brightness(1.9)' }} />
          </span>
          <span className={s.accRect}>
            <b>{main.group.name}</b>
            <span>{yope.streakCount(main.streak)}</span>
          </span>
        </div>
      )}
      <div className={s.spacer} />
      {toasts.slice(-2).map((t) => (
        <div key={t.id} className={s.note}>
          <AppIcon size={38} />
          <span className={s.noteText}>
            <b>{t.title}</b>
            <span>{t.body}</span>
          </span>
          <span className={s.noteTime}>{ios.now}</span>
        </div>
      ))}
      {data.map((g) =>
        g.ritual.isOpen && !g.ritual.youPosted ? (
          <div key={g.group.id} className={s.la}>
            <span className={s.laLead}>
              <Icon name="megaphone" size={24} strokeWidth={2} />
            </span>
            <span className={s.laText}>
              <b>{locket.rollcallTitle}</b>
              <span>{locket.shareYourWeek}</span>
              {/* spec §N: "a lock-screen countdown to the dump and progress such as '7/12 posted'" */}
              <span className={s.laProgress}>{spec.posted(g.ritual.posted, g.ritual.of)}</span>
            </span>
            <span className={s.laTimer}>{bereal.timer(hms(g.ritual.developsAt - now))}</span>
          </div>
        ) : null,
      )}
      {main?.latest && (
        <div className={s.photoWidget}>
          <img src={main.latest.media.thumb ?? main.latest.media.main} alt="" className={main.latest.blurred ? s.blur : ''} />
          <span className={s.pwTime}>{yope.time(main.latest.createdAt)}</span>
          {main.latest.caption && !main.latest.blurred && <span className={s.pwCaption}>{main.latest.caption}</span>}
          <span className={s.pwFace}>
            <Avatar user={main.latest.user} size={26} />
          </span>
        </div>
      )}
      <div className={s.lockBottom}>
        <span className={s.round} aria-label={ios.axFlash}>
          <Icon name="bolt" size={20} />
        </span>
        <span className={s.round} aria-label={ios.axShutter}>
          <Icon name="camera" size={20} />
        </span>
      </div>
    </div>
  );
}

/* ───────── Home Screen ─────────
 * Locket's Home Screen [I] (locket-02 / -05): the small Locket widget top left — the photo filling it,
 * the caption pill ("Sundays ☀️"), the sender's avatar bottom left, the yellow count badge top right
 * and the app name under it; when empty, three avatars in yellow rings and "N Friends" (frame
 * locket-widget-gallery). Stock app icons around it and the dock. Next to it the group pet
 * (Widgetable [V]) and Retro's time-hop widget [V-weak] ("time hop back to your own memories"). With a
 * Best Friend chosen (spec §C), a second small Locket widget shows only that friend's photos ("Best
 * Friend or Crush widget" [V-weak]), labelled with their name.
 */
function HomeScreen({ data }: { data: WidgetGroup[] }) {
  const main = data[0];
  const latest = main?.latest;
  const bestie = useBestieWidget().data?.bestie ?? null;
  return (
    <div className={s.home}>
      <div className={s.grid}>
        <div className={s.cell2}>
          <div className={s.locketWidget}>
            {latest ? (
              <>
                <img src={latest.media.thumb ?? latest.media.main} alt="" className={latest.blurred ? s.blur : ''} />
                {latest.caption && !latest.blurred && <span className={s.lwCaption}>{latest.caption}</span>}
                <span className={s.lwFace}>
                  <Avatar user={latest.user} size={20} />
                </span>
                {main.unseen > 0 && <span className={s.lwBadge}>{main.unseen}</span>}
              </>
            ) : (
              <span className={s.lwEmpty}>
                <span className={s.lwRings}>
                  {(main?.members ?? []).slice(0, 3).map((u) => (
                    <Avatar key={u.id} user={u} size={30} />
                  ))}
                </span>
                <b>{locket.widgetFriends(main?.members.length ?? 0)}</b>
              </span>
            )}
          </div>
          <span className={s.label}>{BRAND.name}</span>
        </div>
        <div className={s.cell2}>
          <div className={s.petWidget}>{main && <Mascot species={main.group.mascot.species} level={main.group.mascot.stage.level} outfit={main.group.mascot.outfit} size={110} />}</div>
          <span className={s.label}>{main?.group.mascot.name}</span>
        </div>
        <div className={s.app}>
          <AppIcon size={60} />
          <span className={s.label}>{BRAND.name}</span>
        </div>
        {ios.homeApps.slice(0, 3).map((a) => (
          <div key={a.name} className={s.app}>
            <span className={s.icon} style={{ background: a.bg }}>
              <AppGlyph name={a.name} />
            </span>
            <span className={s.label}>{a.name}</span>
          </div>
        ))}
        {bestie && (
          <div className={s.cell2}>
            {/* The same small Locket widget [I], filled by one friend; their face when nothing came yet */}
            <div className={s.locketWidget}>
              {bestie.latest ? (
                <>
                  <img src={bestie.latest.media.thumb ?? bestie.latest.media.main} alt="" />
                  {bestie.latest.caption && <span className={s.lwCaption}>{bestie.latest.caption}</span>}
                  <span className={s.lwFace}>
                    <Avatar user={bestie.user} size={20} />
                  </span>
                </>
              ) : (
                <span className={s.lwEmpty}>
                  <span className={s.lwRings}>
                    <Avatar user={bestie.user} size={30} />
                  </span>
                </span>
              )}
            </div>
            <span className={s.label}>{bestie.user.name.split(' ')[0]}</span>
          </div>
        )}
        {bestie && ios.homeApps.slice(3).map((a) => (
          <div key={a.name} className={s.app}>
            <span className={s.icon} style={{ background: a.bg }}>
              <AppGlyph name={a.name} />
            </span>
            <span className={s.label}>{a.name}</span>
          </div>
        ))}
        {main?.memory && (
          <div className={s.cell4}>
            <div className={s.memoryWidget}>
              <img src={main.memory.posts[0].media.thumb ?? main.memory.posts[0].media.main} alt="" />
              <span>{spec.thisWeekYearsAgo(main.memory.yearsAgo)}</span>
            </div>
          </div>
        )}
        {!bestie && ios.homeApps.slice(3).map((a) => (
          <div key={a.name} className={s.app}>
            <span className={s.icon} style={{ background: a.bg }}>
              <AppGlyph name={a.name} />
            </span>
            <span className={s.label}>{a.name}</span>
          </div>
        ))}
      </div>
      <span className={s.search}>
        <Icon name="searchGlass" size={12} strokeWidth={2.4} />
        {ios.search}
      </span>
      <div className={s.dock}>
        {ios.dockApps.map((a) => (
          <span key={a.name} className={s.icon} style={{ background: a.bg }} aria-label={a.name}>
            <AppGlyph name={a.name} />
          </span>
        ))}
      </div>
    </div>
  );
}

/** Simplified stock iOS app icons [I] as they appear in locket-02 / -05 (Calendar shows the day). */
function AppGlyph({ name }: { name: string }) {
  const now = new Date();
  switch (name) {
    case 'Calendar':
      return (
        <svg viewBox="0 0 60 60" width="60" height="60">
          <text x="30" y="17" textAnchor="middle" fontSize="10" fontWeight="600" fill="#ff3b30" fontFamily="-apple-system, system-ui">{now.toLocaleDateString('en-US', { weekday: 'short' })}</text>
          <text x="30" y="47" textAnchor="middle" fontSize="30" fontWeight="300" fill="#000" fontFamily="-apple-system, system-ui">{now.getDate()}</text>
        </svg>
      );
    case 'Photos':
      return (
        <svg viewBox="0 0 60 60" width="60" height="60">
          {['#f5b400', '#f6801f', '#ec4a3f', '#c54a9b', '#8063c1', '#3b8de0', '#43b86f', '#a6cf3e'].map((c, i) => (
            <ellipse key={c} cx="30" cy="19" rx="6" ry="11" fill={c} opacity="0.85" transform={`rotate(${i * 45} 30 30)`} />
          ))}
        </svg>
      );
    case 'Notes':
      return (
        <svg viewBox="0 0 60 60" width="60" height="60">
          <rect width="60" height="16" fill="#f8cf38" />
          {[26, 34, 42, 50].map((y) => (
            <line key={y} x1="6" x2="54" y1={y} y2={y} stroke="#d6d6d6" strokeWidth="1" />
          ))}
        </svg>
      );
    case 'Clock':
      return (
        <svg viewBox="0 0 60 60" width="60" height="60">
          <circle cx="30" cy="30" r="25" fill="#fff" stroke="#000" strokeWidth="1.5" />
          <line x1="30" y1="30" x2="30" y2="13" stroke="#000" strokeWidth="2.4" strokeLinecap="round" />
          <line x1="30" y1="30" x2="42" y2="34" stroke="#000" strokeWidth="2.4" strokeLinecap="round" />
          <line x1="30" y1="30" x2="22" y2="46" stroke="#ff9500" strokeWidth="1" />
        </svg>
      );
    case 'App Store':
      return <Icon name="pencil" size={34} color="#fff" strokeWidth={2.6} style={{ margin: 13 }} />;
    case 'Maps':
      return <Icon name="location" size={30} color="#fff" filled style={{ margin: 15 }} />;
    case 'Podcasts':
      return <Icon name="mic" size={30} color="#fff" strokeWidth={2.6} style={{ margin: 15 }} />;
    case 'Phone':
      return <Icon name="phone" size={30} color="#fff" filled style={{ margin: 15 }} />;
    case 'Safari':
      return (
        <svg viewBox="0 0 60 60" width="60" height="60">
          <circle cx="30" cy="30" r="24" fill="#1d8af8" />
          <path d="M30 14 34 30 30 46 26 30Z" fill="#fff" transform="rotate(45 30 30)" />
          <path d="M30 14 34 30 26 30Z" fill="#ff3b30" transform="rotate(45 30 30)" />
        </svg>
      );
    case 'Messages':
      return <Icon name="chat" size={34} color="#fff" filled style={{ margin: 13 }} />;
    case 'Music':
      return <Icon name="note" size={30} color="#fff" filled style={{ margin: 15 }} />;
    default:
      return null;
  }
}
