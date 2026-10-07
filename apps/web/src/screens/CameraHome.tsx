import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router';
import { bereal, ios, locket, spec } from '@app/shared';
import { useCamera, fileToSquareJpeg, photoTakenAt } from '../lib/camera';
import { api } from '../lib/api';
import { invalidateGroup, useActiveGroup, useFeed, useRitual } from '../lib/queries';
import { useUi } from '../lib/store';
import { useAmbient, useVideoAmbient } from '../lib/ambient';
import { haptic, sfx } from '../lib/feedback';
import { Icon } from '../components/Icon';
import { Avatar, Section, Row, Sheet } from '../components/ios';
import { Mascot } from '../components/Mascot';
import { HistoryPost } from '../components/HistoryPost';
import { LocketReview, BeRealPreview, type Shot } from './CaptureReview';
import s from './camera.module.css';

type Mode = 'photo' | 'dual';

/**
 * Home — Locket's camera, laid out from locket-06-capture [I]: no tab bar; your avatar top-left, the
 * "👥 12 Friends" capsule centred, the chat circle with a numbered yellow badge top-right; the rounded
 * square viewfinder; flash ⚡ · shutter (white, dark gap, yellow ring) · flip; a small thumbnail +
 * "History" with a chevron under it. The whole screen is tinted by the photo on it [I]. History pages
 * follow below (locket-07-history). Hold the shutter to record (yellow outline) [V]. Spec additions:
 * the DUAL mode as an iOS Camera mode label [HIG/S]; BeReal's running countdown at the top during the
 * ritual window [V]; the library button for "Upload from Camera Roll" (a Locket Gold perk [V]).
 */
export function CameraHome() {
  const nav = useNavigate();
  const { group, groups, me } = useActiveGroup();
  const setActive = useUi((st) => st.setActiveGroup);
  const ritual = useRitual(group?.id);
  const feed = useFeed(group?.id);
  const scroller = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [mode, setMode] = useState<Mode>('photo');
  const [flash, setFlash] = useState(false);
  const [shot, setShot] = useState<Shot | null>(null);
  const [recording, setRecording] = useState(false);
  const [frontFlash, setFrontFlash] = useState(false);
  const [friendsSheet, setFriendsSheet] = useState(false);
  const [grid, setGrid] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);
  const [filterSheet, setFilterSheet] = useState(false);
  const atTop = page === 0;
  const cam = useCamera(atTop && !shot && !friendsSheet && !grid, { bts: true });
  const camAmbient = useVideoAmbient(cam.videoRef, atTop && !shot && cam.ready);
  const fileInput = useRef<HTMLInputElement>(null);
  const holdTimer = useRef<number | null>(null);
  const recordFrames = useRef<Blob[]>([]);
  const recordTimer = useRef<number | null>(null);

  const all = feed.data?.posts ?? [];
  const posts = filter ? all.filter((p) => p.user.id === filter) : all;
  const people = [...new Map(all.map((p) => [p.user.id, p.user])).values()];
  const pagePost = page > 0 ? posts[page - 1] : null;
  const photoAmbient = useAmbient(shot ? shot.mainUrl : pagePost ? (pagePost.blurred ? null : pagePost.media.thumb ?? pagePost.media.main) : null);
  const ambient = (shot || pagePost ? photoAmbient : camAmbient) ?? undefined;

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const on = () => setPage(Math.round(el.scrollTop / el.clientHeight));
    el.addEventListener('scroll', on, { passive: true });
    return () => el.removeEventListener('scroll', on);
  }, []);

  // Seen markers feed the "only push real new content" rule (spec §O).
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const seen = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        const ids = entries.filter((e) => e.isIntersecting).map((e) => (e.target as HTMLElement).dataset.post).filter((x): x is string => Boolean(x) && !seen.has(x!));
        if (!ids.length) return;
        ids.forEach((i) => seen.add(i));
        void api.post('/posts/seen', { ids });
      },
      { root: el, threshold: 0.6 },
    );
    el.querySelectorAll('[data-post]').forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [posts.length]);

  const takePhoto = useCallback(async () => {
    if (!cam.ready) return;
    haptic('medium');
    if (flash && cam.facing === 'user') {
      setFrontFlash(true);
      await new Promise((r) => setTimeout(r, 260));
    } else if (flash) await cam.setTorch(true);
    sfx.shutter();
    const main = await cam.capture();
    const live = cam.takeLive(); // BeReal BTS: the seconds before the shot [V]
    if (flash) {
      setFrontFlash(false);
      void cam.setTorch(false);
    }
    let inset: Blob | null = null;
    if (mode === 'dual') inset = await cam.captureOther(); // BeReal: rear first, then front [V-weak]
    setShot({ main, mainUrl: URL.createObjectURL(main), inset, insetUrl: inset ? URL.createObjectURL(inset) : null, live, fromRoll: false, takenAt: Date.now() });
  }, [cam, flash, mode]);

  // Locket: hold the shutter to record; the viewfinder outline turns yellow [V].
  const onShutterDown = () => {
    holdTimer.current = window.setTimeout(() => {
      setRecording(true);
      haptic('heavy');
      recordFrames.current = [];
      recordTimer.current = window.setInterval(async () => {
        try {
          recordFrames.current.push(await cam.capture(480));
        } catch {
          /* ignore */
        }
      }, 120);
      window.setTimeout(() => onShutterUp(), 3000);
    }, 320);
  };
  const onShutterUp = async () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = null;
    if (recordTimer.current) {
      clearInterval(recordTimer.current);
      recordTimer.current = null;
      setRecording(false);
      const frames = recordFrames.current;
      recordFrames.current = [];
      const main = await cam.capture();
      setShot({ main, mainUrl: URL.createObjectURL(main), inset: null, insetUrl: null, live: frames, fromRoll: false, takenAt: Date.now() });
      return;
    }
    if (!recording) void takePhoto();
  };

  const onPickFile = async (f: File | undefined) => {
    if (!f) return;
    const main = await fileToSquareJpeg(f);
    setShot({ main, mainUrl: URL.createObjectURL(main), inset: null, insetUrl: null, live: [], fromRoll: true, takenAt: await photoTakenAt(f) });
  };

  const goTo = (i: number) => scroller.current?.scrollTo({ top: (scroller.current?.clientHeight ?? 0) * i, behavior: 'smooth' });

  const r = ritual.data;
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const left = r ? Math.max(0, r.developsAt - (r.now + (now - ritual.dataUpdatedAt))) : 0;
  const hms = (ms: number) => {
    const t = Math.floor(ms / 1000);
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const sec = t % 60;
    return `${h > 0 ? `${h}:` : ''}${String(m).padStart(h > 0 ? 2 : 1, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const onSent = () => {
    setShot(null);
    if (group) invalidateGroup(group.id);
  };

  return (
    <div className={s.root} data-dark style={ambient ? ({ '--amb': ambient } as CSSProperties) : undefined}>
      <div ref={scroller} className={s.pager}>
        {/* ───────────── Camera ───────────── */}
        <section className={s.page}>
          <div className={s.topSpace} />
          {r?.isOpen && !r.youPosted && !shot && (
            <button className={s.timer} onClick={() => nav('/roll')}>
              {hms(left)}
            </button>
          )}
          <div className={`${s.viewfinder} ${recording ? s.recording : ''}`}>
            {shot ? (
              <img src={shot.mainUrl} className={s.media} alt="" />
            ) : (
              <>
                <video ref={cam.videoRef} className={`${s.media} ${cam.facing === 'user' ? s.mirror : ''}`} playsInline muted autoPlay />
                {!cam.ready && (
                  <div className={s.fallback}>
                    <Icon name="camera" size={40} strokeWidth={1.6} />
                    {cam.error && <button className={s.fallbackBtn} onClick={() => fileInput.current?.click()}>{ios.photoLibrary}</button>}
                  </div>
                )}
              </>
            )}
            {shot?.insetUrl && <img src={shot.insetUrl} className={s.inset} alt="" />}
            {shot && !shot.inset && <LocketReview shot={shot} groups={groups} activeGroup={group} ritualOpen={Boolean(r?.isOpen)} onCancel={() => setShot(null)} onSent={onSent} />}
          </div>
          {shot?.inset && <BeRealPreview shot={shot} groups={groups} activeGroup={group} ritualOpen={Boolean(r?.isOpen)} onCancel={() => setShot(null)} onSent={onSent} />}

          {!shot && (
            <>
              <div className={s.modes}>
                {(['photo', 'dual'] as Mode[]).map((m) => (
                  <button key={m} className={mode === m ? s.modeOn : ''} onClick={() => { haptic('light'); setMode(m); }}>
                    {m === 'photo' ? ios.modePhoto : spec.modeDual}
                  </button>
                ))}
              </div>
              <div className={s.controls}>
                <button className={s.side} onClick={() => setFlash(!flash)} aria-label={ios.axFlash} aria-pressed={flash}>
                  <Icon name="bolt" size={28} filled={flash} color={flash ? 'var(--locket-yellow)' : '#fff'} />
                </button>
                <button className={s.shutter} aria-label={ios.axShutter} onPointerDown={onShutterDown} onPointerUp={onShutterUp} onPointerLeave={() => recording && onShutterUp()} disabled={!cam.ready} />
                <button className={s.side} onClick={() => { haptic('light'); void cam.flip(); }} aria-label={ios.axFlip}>
                  <Icon name="flip" size={32} />
                </button>
              </div>
              <div className={s.bottom}>
                <button className={s.library} onClick={() => fileInput.current?.click()} aria-label={ios.photoLibrary}>
                  <Icon name="photos" size={24} />
                </button>
                <button className={s.historyBtn} onClick={() => goTo(1)}>
                  <span className={s.historyRow}>
                    {all[0] && <img src={all[0].media.thumb ?? all[0].media.main} alt="" className={all[0].blurred ? s.blurThumb : ''} />}
                    <span>{locket.history}</span>
                  </span>
                  <Icon name="chevronDown" size={20} strokeWidth={2.6} />
                </button>
                <span className={s.library} />
              </div>
            </>
          )}
          <input ref={fileInput} type="file" accept="image/*" hidden onChange={(e) => onPickFile(e.target.files?.[0])} />
          {frontFlash && <div className={s.frontFlash} />}
        </section>

        {/* ───────────── History ───────────── */}
        {posts.map((p) => (
          <section key={p.id} className={s.page} data-post={p.id}>
            <HistoryPost post={p} onCamera={() => goTo(0)} onGrid={() => setGrid(true)} />
          </section>
        ))}
        {posts.length === 0 && group && (
          <section className={s.page}>
            <div className={s.emptyHistory}>
              <Mascot species={group.mascot.species} level={group.mascot.stage.level} outfit={group.mascot.outfit} size={120} shadow="rgba(255,255,255,0.1)" />
              <p>{locket.historyHint}</p>
            </div>
          </section>
        )}
      </div>

      {/* Corners: fixed over camera and History (Locket) */}
      <div className={s.top} hidden={Boolean(shot)}>
        <button className={s.me} onClick={() => nav('/me')} aria-label={ios.settings}>
          <Avatar user={me.data?.user ?? null} size={34} style={{ boxShadow: '0 0 0 2px var(--locket-glass)' }} />
        </button>
        {atTop ? (
          <button className={s.pill} onClick={() => setFriendsSheet(true)}>
            <Icon name="people" size={18} strokeWidth={2.2} filled />
            {locket.friendsPill(group?.memberCount ?? 0)}
          </button>
        ) : (
          <button className={s.pill} onClick={() => setFilterSheet(true)}>
            {filter ? people.find((u) => u.id === filter)?.name.split(' ')[0] : locket.everyone}
            <Icon name="chevronDown" size={16} strokeWidth={2.6} />
          </button>
        )}
        <button className={s.corner} onClick={() => nav(group ? `/chat/${group.id}` : '/chats')} aria-label={ios.notifications}>
          <Icon name="chat" size={20} strokeWidth={2.2} />
          {(me.data?.unread ?? 0) > 0 && <span className={s.badge}>{Math.min(me.data?.unread ?? 0, 99)}</span>}
        </button>
      </div>

      {/* Friends sheet (Locket): "X out of 20 friends allowed", "Create new Locket" → groups */}
      <Sheet open={friendsSheet} onClose={() => setFriendsSheet(false)} dark title={locket.yourFriends}>
        {group && <p className={s.allowed}>{locket.friendsAllowed(group.memberCount, 30)}</p>}
        <Section>
          {groups.map((g) => (
            <Row
              key={g.id}
              icon={<Mascot species={g.mascot.species} level={g.mascot.stage.level} outfit={g.mascot.outfit} size={36} />}
              title={g.name}
              sub={locket.friendsPill(g.memberCount)}
              onClick={() => { setActive(g.id); setFriendsSheet(false); haptic('light'); }}
              chevron={false}
              accessory={g.id === group?.id ? <Icon name="check" size={20} color="var(--locket-yellow)" strokeWidth={2.6} /> : undefined}
              sepInset={64}
            />
          ))}
        </Section>
        <button className={s.createNew} onClick={() => { setFriendsSheet(false); nav('/new-group'); }}>{locket.createNew}</button>
      </Sheet>

      {/* History filter (Locket "Everyone" dropdown) */}
      <Sheet open={filterSheet} onClose={() => setFilterSheet(false)} dark>
        <Section>
          <Row title={locket.everyone} onClick={() => { setFilter(null); setFilterSheet(false); }} chevron={false} accessory={!filter ? <Icon name="check" size={20} color="var(--locket-yellow)" strokeWidth={2.6} /> : undefined} />
          {people.map((u) => (
            <Row key={u.id} icon={<Avatar user={u} size={30} />} title={u.name} onClick={() => { setFilter(u.id); setFilterSheet(false); goTo(1); }} chevron={false} accessory={filter === u.id ? <Icon name="check" size={20} color="var(--locket-yellow)" strokeWidth={2.6} /> : undefined} sepInset={58} />
          ))}
        </Section>
      </Sheet>

      {/* History grid (Locket: 3-column rounded squares) */}
      {grid && (
        <div className={s.grid}>
          <div className={s.gridInner}>
            {posts.map((p, i) => (
              <button key={p.id} onClick={() => { setGrid(false); setTimeout(() => goTo(i + 1), 0); }}>
                <img src={p.media.thumb ?? p.media.main} alt="" className={p.blurred ? s.blurThumb : ''} />
              </button>
            ))}
          </div>
          <div className={s.gridBar}>
            <button className={s.shutterSmall} onClick={() => { setGrid(false); goTo(0); }} aria-label={ios.axShutter} />
          </div>
        </div>
      )}
      <span className="sr-only">{bereal.ritualPush}</span>
    </div>
  );
}
