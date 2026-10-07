import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { COPY } from '@app/shared';
import { useCamera, fileToSquareJpeg, photoTakenAt } from '../lib/camera';
import { api } from '../lib/api';
import { invalidateGroup, useActiveGroup, useFeed, useRitual } from '../lib/queries';
import { useUi } from '../lib/store';
import { haptic, sfx } from '../lib/feedback';
import { countdown } from '../lib/format';
import type { GroupSummary } from '../lib/types';
import { Icon } from '../components/Icon';
import { Avatar, GlassButton, Sheet, Wordmark } from '../components/ui';
import { Mascot } from '../components/Mascot';
import { HistoryPage } from '../components/HistoryPage';
import s from './camera.module.css';

type Mode = 'photo' | 'dual';

interface Shot {
  main: Blob;
  mainUrl: string;
  inset: Blob | null;
  insetUrl: string | null;
  live: Blob[];
  fromRoll: boolean;
  takenAt: number;
}

/**
 * Home: Locket's camera — a square viewfinder the shape of the Home Screen widget, a white shutter
 * with the bolt on the left and the flip arrow on the right, icons in each corner — and, scrolling
 * down, the History of everything friends sent ("Scroll down … to travel back in time").
 */
export function CameraHome() {
  const nav = useNavigate();
  const { group, groups, me } = useActiveGroup();
  const setActive = useUi((st) => st.setActiveGroup);
  const ritual = useRitual(group?.id);
  const feed = useFeed(group?.id);
  const scroller = useRef<HTMLDivElement>(null);
  const [atTop, setAtTop] = useState(true);
  const [mode, setMode] = useState<Mode>('photo');
  const [bts, setBts] = useState(true);
  const [flash, setFlash] = useState(false);
  const [shot, setShot] = useState<Shot | null>(null);
  const [recording, setRecording] = useState(false);
  const [frontFlash, setFrontFlash] = useState(false);
  const [groupSheet, setGroupSheet] = useState(false);
  const cam = useCamera(atTop && !shot && !groupSheet, { bts });
  const fileInput = useRef<HTMLInputElement>(null);
  const holdTimer = useRef<number | null>(null);
  const recordFrames = useRef<Blob[]>([]);
  const recordTimer = useRef<number | null>(null);

  const posts = feed.data?.posts ?? [];

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const on = () => setAtTop(el.scrollTop < el.clientHeight * 0.5);
    el.addEventListener('scroll', on, { passive: true });
    return () => el.removeEventListener('scroll', on);
  }, []);

  // Mark history posts as seen as they scroll into view (feeds the "real new content" push rule).
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
    const live = bts ? cam.takeLive() : [];
    if (flash) {
      setFrontFlash(false);
      void cam.setTorch(false);
    }
    let inset: Blob | null = null;
    if (mode === 'dual') inset = await cam.captureOther();
    setShot({ main, mainUrl: URL.createObjectURL(main), inset, insetUrl: inset ? URL.createObjectURL(inset) : null, live, fromRoll: false, takenAt: Date.now() });
  }, [cam, flash, bts, mode]);

  // Hold the shutter to record a short live clip (Locket: yellow outline while capturing).
  const onShutterDown = () => {
    holdTimer.current = window.setTimeout(() => {
      setRecording(true);
      haptic('heavy');
      recordFrames.current = [];
      const tick = async () => {
        try {
          const b = await cam.capture(480);
          recordFrames.current.push(b);
        } catch {
          /* ignore */
        }
      };
      recordTimer.current = window.setInterval(tick, 120);
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
      sfx.shutter();
      setShot({ main, mainUrl: URL.createObjectURL(main), inset: null, insetUrl: null, live: frames, fromRoll: false, takenAt: Date.now() });
      return;
    }
    if (!recording) void takePhoto();
  };

  const onPickFile = async (f: File | undefined) => {
    if (!f) return;
    const main = await fileToSquareJpeg(f);
    const takenAt = await photoTakenAt(f);
    setShot({ main, mainUrl: URL.createObjectURL(main), inset: null, insetUrl: null, live: [], fromRoll: true, takenAt });
  };

  const goHistory = () => scroller.current?.scrollTo({ top: scroller.current.clientHeight, behavior: 'smooth' });
  const goCamera = () => scroller.current?.scrollTo({ top: 0, behavior: 'smooth' });

  const r = ritual.data;
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const left = r ? r.developsAt - (r.now + (now - ritual.dataUpdatedAt)) : 0;

  return (
    <div className="screen">
      <div ref={scroller} className={`${s.pager} scroll`}>
        {/* ───────────── Camera page ───────────── */}
        <section className={s.page}>
          <TopCorners me={me.data?.user} group={group} groupsCount={groups.length} onGroup={() => setGroupSheet(true)} onProfile={() => nav('/me')} onChat={() => nav(group ? `/chat/${group.id}` : '/chats')} unread={me.data?.unread ?? 0} />

          {r?.isOpen ? (
            <button className={s.ritual} onClick={() => nav(`/g/${group?.id}/settings`)}>
              <span className={s.ritualTitle}>{COPY.ritualPush}</span>
              <span className={s.ritualMeta}>
                {countdown(left)} left · {r.posted}/{r.of} in today’s roll{r.youPosted ? ' · you’re in' : ''}
              </span>
            </button>
          ) : (
            <div className={s.nextRoll}>
              {group ? (
                <>
                  <Icon name="film" size={14} /> next roll develops in {countdown(left)}
                </>
              ) : null}
            </div>
          )}

          <div className={`${s.viewfinder} ${recording ? s.recording : ''}`}>
            {shot ? (
              <img src={shot.mainUrl} className={s.media} alt="Your photo" />
            ) : (
              <>
                <video ref={cam.videoRef} className={`${s.media} ${cam.facing === 'user' ? s.mirror : ''}`} playsInline muted autoPlay />
                {!cam.ready && <CameraFallback error={cam.error} onRetry={cam.restart} onUpload={() => fileInput.current?.click()} />}
                {cam.ready && (
                  <>
                    <button className={`${s.btsToggle} ${bts ? s.btsOn : ''}`} onClick={() => setBts(!bts)} aria-pressed={bts}>
                      <Icon name="live" size={14} /> {bts ? COPY.btsOn : COPY.btsOff}
                    </button>
                    {mode === 'dual' && (
                      <div className={s.insetHint}>
                        <Icon name="person" size={18} />
                      </div>
                    )}
                  </>
                )}
              </>
            )}
            {shot?.insetUrl && <img src={shot.insetUrl} className={s.inset} alt="" />}
            {shot && <ShotEditor shot={shot} groups={groups} activeGroup={group} ritualOpen={Boolean(r?.isOpen)} onCancel={() => setShot(null)} onSent={() => {
              setShot(null);
              if (group) invalidateGroup(group.id);
            }} />}
          </div>

          {!shot && (
            <>
              <div className={s.controls}>
                <button className={`${s.side} ${flash ? s.sideOn : ''}`} onClick={() => setFlash(!flash)} aria-label="Flash" aria-pressed={flash}>
                  <Icon name={flash ? 'bolt' : 'boltOff'} size={28} filled={flash} />
                </button>
                <button className={s.shutter} aria-label="Take photo" onPointerDown={onShutterDown} onPointerUp={onShutterUp} onPointerLeave={() => recording && onShutterUp()} disabled={!cam.ready}>
                  <span className={s.shutterInner} />
                </button>
                <button className={s.side} onClick={() => { haptic('light'); void cam.flip(); }} aria-label="Flip camera">
                  <Icon name="flip" size={30} />
                </button>
              </div>
              <div className={s.modes}>
                {(['photo', 'dual'] as Mode[]).map((m) => (
                  <button key={m} className={mode === m ? s.modeOn : ''} onClick={() => setMode(m)}>
                    {m === 'photo' ? 'PHOTO' : 'DUAL'}
                  </button>
                ))}
                <button onClick={() => nav('/rewind')}>REWIND</button>
              </div>
              <div className={s.bottomRow}>
                <button className={s.roll} onClick={() => fileInput.current?.click()} aria-label="Upload from camera roll">
                  <Icon name="photo" size={22} />
                </button>
                <button className={s.historyHandle} onClick={goHistory}>
                  {posts[0] ? <img src={posts[0].media.thumb ?? posts[0].media.main} alt="" className={posts[0].blurred ? s.blurThumb : ''} /> : <span className={s.histEmpty} />}
                  <span>History</span>
                  <Icon name="chevronDown" size={18} />
                </button>
                <button className={s.roll} onClick={() => nav('/create')} aria-label="Create">
                  <Icon name="sparkles" size={22} />
                </button>
              </div>
            </>
          )}
          <input ref={fileInput} type="file" accept="image/*" hidden onChange={(e) => onPickFile(e.target.files?.[0])} />
          {frontFlash && <div className={s.frontFlash} />}
        </section>

        {/* ───────────── History pages ───────────── */}
        {posts.map((p) => (
          <section key={p.id} className={s.page} data-post={p.id}>
            <HistoryPage post={p} onCamera={goCamera} onGrid={() => nav('/journal')} groupName={group?.name ?? ''} />
          </section>
        ))}
        {posts.length === 0 && group && (
          <section className={s.page}>
            <div className={s.emptyHistory}>
              <Mascot species={group.mascot.species} level={group.mascot.stage.level} outfit={group.mascot.outfit} size={140} mood="sleepy" />
              <div className="t-title3">Nothing in the roll yet</div>
              <div className="t-sub">Photos from {group.name} show up here and on everyone’s Home Screen.</div>
            </div>
          </section>
        )}
      </div>

      {!atTop && (
        <div className={s.historyTop}>
          <TopCorners me={me.data?.user} group={group} groupsCount={groups.length} onGroup={() => setGroupSheet(true)} onProfile={() => nav('/me')} onChat={() => nav(group ? `/chat/${group.id}` : '/chats')} unread={me.data?.unread ?? 0} />
        </div>
      )}

      <Sheet open={groupSheet} onClose={() => setGroupSheet(false)} title="Your groups">
        <div className={s.groupList}>
          {groups.map((g) => (
            <button key={g.id} className={`${s.groupItem} ${g.id === group?.id ? s.groupOn : ''}`} onClick={() => { setActive(g.id); setGroupSheet(false); haptic('light'); }}>
              <span className={s.groupEmoji}>{g.emoji}</span>
              <span className="grow">
                <span className="t-headline">{g.name}</span>
                <span className="t-foot" style={{ display: 'block' }}>
                  {g.memberCount} {g.memberCount === 1 ? 'friend' : 'friends'} · {g.ritual.isOpen ? `roll day · ${g.ritual.posted}/${g.ritual.of}` : `${g.ritual.streak}-week streak`}
                </span>
              </span>
              {g.id === group?.id && <Icon name="check" size={20} color="var(--yellow)" />}
            </button>
          ))}
          <button className={s.groupItem} onClick={() => { setGroupSheet(false); nav('/new-group'); }}>
            <span className={s.groupEmoji}>
              <Icon name="plus" size={20} />
            </span>
            <span className="t-headline">New group</span>
          </button>
        </div>
      </Sheet>
    </div>
  );
}

function TopCorners({ me, group, groupsCount, onGroup, onProfile, onChat, unread }: { me?: { name: string; avatar: string | null; color: string }; group: GroupSummary | null; groupsCount: number; onGroup: () => void; onProfile: () => void; onChat: () => void; unread: number }) {
  return (
    <div className={s.top}>
      <button className={s.profileBtn} onClick={onProfile} aria-label="Profile">
        <Avatar user={me ?? null} size={40} />
      </button>
      <button className={s.groupPill} onClick={onGroup}>
        {group ? (
          <>
            <span>{group.emoji}</span>
            <span className={s.groupName}>{group.name}</span>
            <span className={s.groupCount}>
              <Icon name="people" size={15} /> {group.memberCount}
            </span>
            {groupsCount > 1 && <Icon name="chevronDown" size={16} />}
          </>
        ) : (
          <Wordmark size={18} />
        )}
      </button>
      <GlassButton icon="chat" label="Chats" onClick={onChat} badge={unread || null} />
    </div>
  );
}

function CameraFallback({ error, onRetry, onUpload }: { error: string | null; onRetry: () => void; onUpload: () => void }) {
  return (
    <div className={s.fallback}>
      <Icon name="camera" size={34} color="var(--hare)" />
      <div className="t-headline">{error === 'denied' ? 'Camera is off' : error ? 'No camera here' : 'Starting camera…'}</div>
      {error && (
        <>
          <div className="t-foot center">{error === 'denied' ? 'Allow camera access to take photos for your group.' : 'You can still share from your camera roll.'}</div>
          <div className="hstack gap8">
            <button className="chip" onClick={onRetry}>Try again</button>
            <button className="chip chip-on" onClick={onUpload}>Camera roll</button>
          </div>
        </>
      )}
    </div>
  );
}

/* ───────────────────────── After capture ───────────────────────── */

function ShotEditor({ shot, groups, activeGroup, ritualOpen, onCancel, onSent }: { shot: Shot; groups: GroupSummary[]; activeGroup: GroupSummary | null; ritualOpen: boolean; onCancel: () => void; onSent: () => void }) {
  const [caption, setCaption] = useState('');
  const [targets, setTargets] = useState<string[]>(activeGroup ? [activeGroup.id] : groups.slice(0, 1).map((g) => g.id));
  const [remember, setRemember] = useState(false);
  const [voice, setVoice] = useState<{ blob: Blob; duration: number; url: string } | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const ritual = ritualOpen && !shot.fromRoll;
  const old = shot.fromRoll && Date.now() - shot.takenAt > 14 * 86_400_000;

  const send = async () => {
    if (!targets.length || sending) return;
    setSending(true);
    setErr(null);
    const fd = new FormData();
    fd.set('groupIds', targets.join(','));
    fd.set('main', shot.main, 'photo.jpg');
    if (shot.inset) fd.set('inset', shot.inset, 'inset.jpg');
    shot.live.slice(-16).forEach((b, i) => fd.append('live', b, `live${i}.jpg`));
    if (voice) {
      fd.set('voice', voice.blob, 'voice');
      fd.set('voiceType', voice.blob.type);
      fd.set('voiceDuration', String(voice.duration));
    }
    fd.set('caption', caption);
    fd.set('kind', shot.inset ? 'dual' : old ? 'rewind' : 'photo');
    fd.set('ritual', String(ritual));
    fd.set('fromRoll', String(shot.fromRoll));
    fd.set('takenAt', String(shot.takenAt));
    fd.set('remember', String(remember && Boolean(caption)));
    try {
      await api.post('/posts', fd);
      sfx.send();
      haptic('success');
      setSent(true);
      setTimeout(onSent, 650);
    } catch (e) {
      setErr((e as Error).message);
      setSending(false);
    }
  };

  return (
    <>
      <button className={s.retake} onClick={onCancel} aria-label="Retake">
        <Icon name="close" size={20} />
      </button>
      {shot.live.length >= 3 && (
        <span className={s.liveBadge}>
          <Icon name="live" size={14} /> LIVE
        </span>
      )}
      {old && <span className={s.stamp}>{new Date(shot.takenAt).toLocaleDateString([], { year: '2-digit', month: '2-digit', day: '2-digit' })}</span>}
      <input className={s.caption} placeholder="Add a message" value={caption} onChange={(e) => setCaption(e.target.value.slice(0, 140))} maxLength={140} />
      <AnimatePresence>
        {sent && (
          <motion.div className={s.sentFly} initial={{ scale: 1, y: 0, opacity: 1 }} animate={{ scale: 0.2, y: -420, opacity: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <img src={shot.mainUrl} alt="" />
          </motion.div>
        )}
      </AnimatePresence>
      <div className={s.shotControls}>
        <VoiceButton value={voice} onChange={setVoice} />
        <button className={s.send} onClick={send} disabled={!targets.length || sending} aria-label="Send">
          {sending ? <span className="spinner" /> : <Icon name="send" size={34} strokeWidth={2.6} />}
        </button>
        <button className={`${s.side} ${remember ? s.sideOn : ''}`} onClick={() => setRemember(!remember)} aria-pressed={remember} aria-label="Let the game master remember this caption" title="Let the game master remember this caption">
          <Icon name="pin" size={26} />
        </button>
      </div>
      <div className={s.sendTo}>
        <div className={s.sendToLabel}>
          {ritual ? <><span className={s.dotLive} /> Part of today’s roll</> : shot.fromRoll ? 'From your camera roll' : 'Send to'}
          {err && <span style={{ color: 'var(--red)' }}> · {err}</span>}
        </div>
        <div className={`${s.targets} scroll`}>
          {groups.map((g) => {
            const on = targets.includes(g.id);
            return (
              <button key={g.id} className={`${s.target} ${on ? s.targetOn : ''}`} onClick={() => { haptic('light'); setTargets(on ? targets.filter((x) => x !== g.id) : [...targets, g.id]); }}>
                <span className={s.targetIcon}>{g.emoji}</span>
                <span className={s.targetName}>{g.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

/** Yope voice: "add voice to your memories". Hold to record. */
function VoiceButton({ value, onChange }: { value: { blob: Blob; duration: number; url: string } | null; onChange: (v: { blob: Blob; duration: number; url: string } | null) => void }) {
  const rec = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const started = useRef(0);
  const [on, setOn] = useState(false);
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!on) return;
    const id = setInterval(() => setT((Date.now() - started.current) / 1000), 100);
    return () => clearInterval(id);
  }, [on]);
  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunks.current = [];
      mr.ondataavailable = (e) => chunks.current.push(e.data);
      mr.onstop = () => {
        stream.getTracks().forEach((tr) => tr.stop());
        const blob = new Blob(chunks.current, { type: mr.mimeType });
        const duration = (Date.now() - started.current) / 1000;
        if (duration > 0.5) onChange({ blob, duration, url: URL.createObjectURL(blob) });
      };
      started.current = Date.now();
      mr.start();
      rec.current = mr;
      setOn(true);
      haptic('medium');
    } catch {
      /* mic unavailable */
    }
  };
  const stop = () => {
    rec.current?.stop();
    rec.current = null;
    setOn(false);
  };
  const audio = useMemo(() => (value ? new Audio(value.url) : null), [value]);
  if (value) {
    return (
      <button className={`${s.side} ${s.sideOn}`} onClick={() => (audio?.paused ? void audio.play() : onChange(null))} aria-label="Voice caption">
        <Icon name="volume" size={24} />
        <span className={s.voiceLen}>{Math.round(value.duration)}s</span>
      </button>
    );
  }
  return (
    <button className={`${s.side} ${on ? s.recordingMic : ''}`} onPointerDown={start} onPointerUp={stop} onPointerLeave={() => on && stop()} aria-label="Hold to add a voice caption">
      <Icon name="mic" size={26} />
      {on && <span className={s.voiceLen}>{t.toFixed(1)}</span>}
    </button>
  );
}


