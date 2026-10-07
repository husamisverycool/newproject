import { useEffect, useMemo, useRef, useState } from 'react';
import { Route, Routes, useNavigate, useSearchParams } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { COPY, MASCOT_SPECIES, WALL_UNLOCK_MEMBERS } from '@app/shared';
import { api, ApiError } from '../lib/api';
import { queryClient, useMe } from '../lib/queries';
import { useUi } from '../lib/store';
import { haptic } from '../lib/feedback';
import { useCamera, fileToSquareJpeg, photoTakenAt } from '../lib/camera';
import { dayName } from '../lib/format';
import { Icon } from '../components/Icon';
import { PillButton, Sheet, Wordmark, IconButton } from '../components/ui';
import { Mascot } from '../components/Mascot';
import { QR, shareInvite } from '../components/QR';
import { RewindDial, type DialItem } from '../components/RewindDial';
import s from './onboarding.module.css';

/**
 * Onboarding, following Locket's sequence and copy ("Set up my Locket" → "What's your name?" →
 * contacts with "Share All Contacts" / "Not now" → "0 of 5 friends added"), with the spec's changes:
 * a birthday for teen safety (§S), Retro's Rewind as a cold start before any friends exist (§A1),
 * a 3-member soft gate instead of a hard "invite 5" (§A3), consented likeness enrollment (§A5), and
 * notifications asked last, tied to the Sunday promise (§B).
 */
export default function Onboarding() {
  return (
    <div className="screen">
      <Routes>
        <Route index element={<Intro />} />
        <Route path="name" element={<NameStep />} />
        <Route path="birthday" element={<BirthdayStep />} />
        <Route path="contacts" element={<ContactsStep />} />
        <Route path="rewind" element={<RewindStep />} />
        <Route path="group" element={<GroupStep />} />
        <Route path="invite" element={<InviteStep />} />
        <Route path="likeness" element={<LikenessStep />} />
        <Route path="notifications" element={<NotificationsStep />} />
      </Routes>
    </div>
  );
}

const draft = {
  first: '',
  last: '',
  joinCode: '' as string,
  rewind: [] as { blob: Blob; url: string; takenAt: number }[],
};

function Step({ children, back, progress }: { children: React.ReactNode; back?: boolean; progress?: number }) {
  const nav = useNavigate();
  return (
    <motion.div className={s.step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ type: 'spring', stiffness: 380, damping: 36 }}>
      <div className={s.stepTop}>
        {back ? <IconButton icon="chevronLeft" label="Back" onClick={() => nav(-1)} /> : <span style={{ width: 36 }} />}
        {progress !== undefined && (
          <div className={s.progress}>
            <span style={{ width: `${progress * 100}%` }} />
          </div>
        )}
        <span style={{ width: 36 }} />
      </div>
      {children}
    </motion.div>
  );
}

/* 1 ── Intro */
function Intro() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [code, setCode] = useState(params.get('join') ?? '');
  const [joinSheet, setJoinSheet] = useState(false);
  const me = useMe();
  useEffect(() => {
    if (params.get('join')) draft.joinCode = params.get('join')!;
  }, [params]);
  return (
    <div className={s.intro}>
      <div className={s.collage}>
        {MASCOT_SPECIES.map((sp, i) => (
          <motion.div
            key={sp.id}
            className={s.collageCard}
            style={{ background: sp.body, rotate: [-8, 6, -4, 9][i], left: `${[6, 50, 14, 54][i]}%`, top: `${[4, 10, 50, 46][i]}%` }}
            initial={{ y: 40, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.12, type: 'spring', stiffness: 220, damping: 18 }}
          >
            <Mascot species={sp.id} level={[3, 4, 2, 5][i]} size={120} mood={(['happy', 'wink', 'wow', 'party'] as const)[i]} />
          </motion.div>
        ))}
      </div>
      <div className={s.introText}>
        <Wordmark size={64} />
        <p className={s.tagline}>friends-only camera</p>
        <p className={s.sub}>Photos from your people, right on your Home Screen. Every Sunday the week’s roll develops — together.</p>
      </div>
      <div className={s.cta}>
        <PillButton onClick={() => nav(me.data ? '/welcome/contacts' : '/welcome/name')}>{COPY.setup}</PillButton>
        <button className={s.textBtn} onClick={() => setJoinSheet(true)}>I have an invite code</button>
      </div>
      <Sheet open={joinSheet} onClose={() => setJoinSheet(false)} title="Join with a code">
        <div className="stack gap12" style={{ paddingBottom: 12 }}>
          <input className={`field ${s.codeField}`} value={code} onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))} placeholder="SUNDAY" autoCapitalize="characters" />
          <PillButton disabled={code.length < 4} onClick={() => { draft.joinCode = code; setJoinSheet(false); nav(me.data ? `/j/${code}` : '/welcome/name'); }}>
            {COPY.continue}
          </PillButton>
        </div>
      </Sheet>
    </div>
  );
}

/* 2 ── What's your name? */
function NameStep() {
  const nav = useNavigate();
  const me = useMe();
  const [first, setFirst] = useState(draft.first || me.data?.user.name.split(' ')[0] || '');
  const [last, setLast] = useState(draft.last);
  const ok = first.trim().length > 0;
  return (
    <Step back progress={0.12}>
      <h1 className={s.title}>{COPY.whatsYourName}</h1>
      <div className={s.fields}>
        <input className={s.bigField} placeholder="First name" value={first} onChange={(e) => setFirst(e.target.value)} autoFocus autoComplete="given-name" />
        <input className={s.bigField} placeholder="Last name" value={last} onChange={(e) => setLast(e.target.value)} autoComplete="family-name" />
      </div>
      <div className={s.cta}>
        <PillButton disabled={!ok} onClick={async () => {
          draft.first = first.trim();
          draft.last = last.trim();
          if (me.data) {
            await api.patch('/me', { name: `${draft.first} ${draft.last}`.trim() });
            nav('/welcome/contacts');
          } else nav('/welcome/birthday');
        }}>{COPY.continue}</PillButton>
      </div>
    </Step>
  );
}

/* 3 ── Birthday (iOS picker wheels) */
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function Wheel({ items, value, onChange, width }: { items: string[]; value: number; onChange: (i: number) => void; width: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const ITEM = 36;
  useEffect(() => {
    ref.current?.scrollTo({ top: value * ITEM });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div
      ref={ref}
      className={`${s.wheel} scroll`}
      style={{ width }}
      onScroll={(e) => {
        const i = Math.round((e.currentTarget.scrollTop) / ITEM);
        if (i !== value && i >= 0 && i < items.length) {
          haptic('light');
          onChange(i);
        }
      }}
    >
      <div style={{ height: ITEM * 2 }} />
      {items.map((it, i) => (
        <div key={it} className={`${s.wheelItem} ${i === value ? s.wheelOn : ''}`} style={{ height: ITEM }}>
          {it}
        </div>
      ))}
      <div style={{ height: ITEM * 2 }} />
    </div>
  );
}

function BirthdayStep() {
  const nav = useNavigate();
  const thisYear = new Date().getFullYear();
  const years = useMemo(() => Array.from({ length: 90 }, (_, i) => String(thisYear - 13 - i)), [thisYear]);
  const [m, setM] = useState(5);
  const [d, setD] = useState(14);
  const [y, setY] = useState(6);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <Step back progress={0.24}>
      <h1 className={s.title}>When’s your birthday?</h1>
      <p className={s.lede}>Only used to keep the right safety settings on. Friends never see your age.</p>
      <div className={s.picker}>
        <div className={s.pickerBand} />
        <Wheel items={MONTHS} value={m} onChange={setM} width={150} />
        <Wheel items={Array.from({ length: 31 }, (_, i) => String(i + 1))} value={d} onChange={setD} width={60} />
        <Wheel items={years} value={y} onChange={setY} width={90} />
      </div>
      {err && <p className={s.err}>{err}</p>}
      <div className={s.cta}>
        <PillButton disabled={busy} onClick={async () => {
          setBusy(true);
          try {
            await api.post('/auth/start', { name: `${draft.first} ${draft.last}`.trim() || 'Friend', birthYear: Number(years[y]), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
            await queryClient.invalidateQueries({ queryKey: ['me'] });
            nav('/welcome/contacts');
          } catch (e) {
            setErr(e instanceof ApiError ? e.message : 'Something went wrong');
          } finally {
            setBusy(false);
          }
        }}>{COPY.continue}</PillButton>
      </div>
      <span className="sr-only">{MONTHS[m]} {d + 1}</span>
    </Step>
  );
}

/* 4 ── Contacts (optional; Locket's buttons) */
function ContactsStep() {
  const nav = useNavigate();
  const [skip, setSkip] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const supported = 'contacts' in navigator && 'ContactsManager' in window;
  const next = () => nav(draft.joinCode ? `/j/${draft.joinCode}` : '/welcome/rewind');
  return (
    <Step back progress={0.36}>
      <div className={s.hero}>
        <div className={s.contactBubbles}>
          {['#FFC800', '#1CB0F6', '#CE82FF', '#58CC02', '#FF9600'].map((c, i) => (
            <motion.span key={c} className={s.contactBubble} style={{ background: c }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.08, type: 'spring' }} />
          ))}
        </div>
      </div>
      <h1 className={s.title}>Find your people</h1>
      <p className={s.lede}>Your contacts are only used to show who’s already here. Nothing is uploaded, nobody gets a message unless you send it.</p>
      {picked.length > 0 && <p className={s.lede} style={{ color: 'var(--yellow)' }}>{picked.length} picked — you’ll share an invite in a sec.</p>}
      <div className={s.cta}>
        <PillButton onClick={async () => {
          if (supported) {
            try {
              const res = await (navigator as unknown as { contacts: { select: (p: string[], o: { multiple: boolean }) => Promise<{ name?: string[] }[]> } }).contacts.select(['name'], { multiple: true });
              setPicked(res.map((r) => r.name?.[0] ?? 'Friend'));
              await api.patch('/me', { settings: { contactsShared: true } });
            } catch {
              /* cancelled */
            }
          }
          next();
        }}>{COPY.shareContacts}</PillButton>
        <button className={s.textBtn} onClick={() => setSkip(true)}>{COPY.notNow}</button>
      </div>
      <Sheet open={skip} onClose={() => setSkip(false)} title={COPY.skipContacts}>
        <p className="t-sub center" style={{ marginTop: 0 }}>You can still invite friends with a link. Turn contacts on any time in Settings.</p>
        <div className="stack gap8" style={{ paddingBottom: 12 }}>
          <PillButton tone="white" onClick={() => { setSkip(false); next(); }}>Skip</PillButton>
          <PillButton tone="dark" onClick={() => setSkip(false)}>Go back</PillButton>
        </div>
      </Sheet>
    </Step>
  );
}

/* 5 ── Rewind cold start (Retro: built because new users had nothing to look back on) */
function RewindStep() {
  const nav = useNavigate();
  const input = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<DialItem[]>(draft.rewind.map((r) => ({ id: r.url, src: r.url, takenAt: r.takenAt })));
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const add = async (files: FileList | null) => {
    if (!files) return;
    const out: typeof draft.rewind = [];
    for (const f of [...files].slice(0, 40)) {
      const blob = await fileToSquareJpeg(f, 1200);
      out.push({ blob, url: URL.createObjectURL(blob), takenAt: await photoTakenAt(f) });
    }
    out.sort((a, b) => b.takenAt - a.takenAt);
    draft.rewind = out;
    setItems(out.map((r) => ({ id: r.url, src: r.url, takenAt: r.takenAt })));
  };
  return (
    <Step back progress={0.48}>
      <h1 className={s.title}>Start with your camera roll</h1>
      <p className={s.lede}>Spin back through your own photos. It’s private — pick a few to start your group’s first wall.</p>
      {items.length ? (
        <div className={s.dialWrap}>
          <RewindDial items={items} picked={picked} onTogglePick={(id) => setPicked((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; })} compact />
        </div>
      ) : (
        <button className={s.rollPick} onClick={() => input.current?.click()}>
          <Icon name="photos" size={40} />
          <span className="t-headline">Choose photos</span>
          <span className="t-foot">Limited access is fine — pick just what you want.</span>
        </button>
      )}
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => add(e.target.files)} />
      <div className={s.cta}>
        <PillButton onClick={() => {
          draft.rewind = draft.rewind.filter((r) => picked.has(r.url));
          nav('/welcome/group');
        }}>{picked.size ? `Use ${picked.size} for our first wall` : COPY.continue}</PillButton>
        {!items.length && <button className={s.textBtn} onClick={() => nav('/welcome/group')}>{COPY.notNow}</button>}
      </div>
    </Step>
  );
}

/* 6 ── First group: name, mascot, ritual day (Retro cadence → admin picks the day) */
function GroupStep() {
  const nav = useNavigate();
  const setActive = useUi((st) => st.setActiveGroup);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🌻');
  const [species, setSpecies] = useState('blob');
  const [mascotName, setMascotName] = useState('Pip');
  const [day, setDay] = useState(0);
  const [busy, setBusy] = useState(false);
  return (
    <Step back progress={0.6}>
      <h1 className={s.title}>Start a group</h1>
      <div className={s.mascotPick}>
        <Mascot species={species} level={1} size={130} />
        <div className={s.speciesRow}>
          {MASCOT_SPECIES.map((sp) => (
            <button key={sp.id} className={`${s.species} ${species === sp.id ? s.speciesOn : ''}`} onClick={() => { setSpecies(sp.id); setMascotName(sp.name === 'Blob' ? 'Pip' : sp.name); haptic('light'); }} style={{ background: sp.body }} aria-label={sp.name} />
          ))}
        </div>
        <p className="t-foot center" style={{ margin: 0 }}>Your group’s mascot hatches from this egg and grows as you post.</p>
      </div>
      <div className={s.fields}>
        <div className="hstack gap8">
          <input className={s.emojiField} value={emoji} onChange={(e) => setEmoji([...e.target.value].slice(-1).join('') || '🌻')} aria-label="Group emoji" />
          <input className={s.bigField} placeholder="Group name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <input className="field" placeholder="Mascot name" value={mascotName} onChange={(e) => setMascotName(e.target.value)} />
        <div className={s.dayLabel}>Roll day — when the week develops</div>
        <div className={s.days}>
          {[0, 1, 2, 3, 4, 5, 6].map((d) => (
            <button key={d} className={day === d ? s.dayOn : ''} onClick={() => setDay(d)}>
              {dayName(d).slice(0, 2)}
            </button>
          ))}
        </div>
      </div>
      <div className={s.cta}>
        <PillButton disabled={!name.trim() || busy} onClick={async () => {
          setBusy(true);
          const res = await api.post<{ group: { id: string } }>('/groups', { name: name.trim(), emoji, species, mascotName, ritualDay: day, developHour: 21, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
          setActive(res.group.id);
          for (const r of draft.rewind.slice(0, 6)) {
            const fd = new FormData();
            fd.set('groupIds', res.group.id);
            fd.set('main', r.blob, 'rewind.jpg');
            fd.set('kind', 'rewind');
            fd.set('fromRoll', 'true');
            fd.set('takenAt', String(r.takenAt));
            await api.post('/posts', fd).catch(() => undefined);
          }
          await queryClient.invalidateQueries({ queryKey: ['me'] });
          nav('/welcome/invite');
        }}>Create group</PillButton>
      </div>
    </Step>
  );
}

/* 7 ── Invite: the soft gate (Locket's "0 of 5 friends added", at 3) */
function InviteStep() {
  const nav = useNavigate();
  const me = useMe();
  const group = me.data?.groups[me.data.groups.length - 1];
  const detail = useQueryGroup(group?.id);
  const [msg, setMsg] = useState<string | null>(null);
  const have = detail?.gate.have ?? 1;
  const need = WALL_UNLOCK_MEMBERS;
  return (
    <Step back progress={0.72}>
      <h1 className={s.title}>Bring your people</h1>
      <p className={s.lede}>The wall unlocks when {need} of you are in. Everything else works right away.</p>
      {group && detail && (
        <div className={s.inviteCard}>
          <Mascot species={group.mascot.species} level={group.mascot.stage.level} size={88} mood="wow" />
          <div className={s.gateText}>{COPY.gateProgress(Math.min(have, need), need)}</div>
          <div className={s.gateBar}>
            {Array.from({ length: need }, (_, i) => (
              <span key={i} className={i < have ? s.gateOn : ''} />
            ))}
          </div>
          <QR value={detail.group.inviteUrl} size={150} />
          <div className={s.code}>{detail.group.inviteCode}</div>
        </div>
      )}
      {msg && <p className="t-foot center">{msg}</p>}
      <div className={s.cta}>
        <PillButton onClick={async () => {
          if (!detail) return;
          const r = await shareInvite(detail.group.inviteUrl, detail.group.name);
          setMsg(r === 'copied' ? 'Link copied — paste it in your group chat' : r === 'shared' ? 'Sent!' : null);
        }}>
          <Icon name="share" size={20} /> Share invite link
        </PillButton>
        <button className={s.textBtn} onClick={() => nav('/welcome/likeness')}>{have >= need ? COPY.continue : 'Later'}</button>
      </div>
    </Step>
  );
}

function useQueryGroup(id: string | undefined) {
  const [data, setData] = useState<import('../lib/types').GroupDetail | null>(null);
  useEffect(() => {
    if (!id) return;
    let stop = false;
    const load = () => api.get<import('../lib/types').GroupDetail>(`/groups/${id}`).then((d) => !stop && setData(d)).catch(() => undefined);
    void load();
    const t = setInterval(load, 5000);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, [id]);
  return data;
}

/* 8 ── Likeness (Sora Cameos: oval guide, head turns, scope) */
const POSES = [
  { label: 'Look straight at the camera', icon: '😐' },
  { label: 'Turn a little to your left', icon: '👈' },
  { label: 'Now a little to your right', icon: '👉' },
];

export function LikenessCapture({ onDone }: { onDone: () => void }) {
  const cam = useCamera(true, { bts: false });
  const [shots, setShots] = useState<Blob[]>([]);
  const [scope, setScope] = useState<'no_one' | 'specific_friends' | 'my_groups'>('my_groups');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (cam.ready && cam.facing !== 'user') void cam.flip();
  }, [cam.ready]); // eslint-disable-line react-hooks/exhaustive-deps
  const step = Math.min(shots.length, POSES.length - 1);
  const done = shots.length >= POSES.length;
  return (
    <>
      <div className={s.likeCam}>
        <video ref={cam.videoRef} className={s.likeVideo} playsInline muted autoPlay />
        <div className={s.oval} />
        <AnimatePresence mode="wait">
          <motion.div key={step + (done ? 'd' : '')} className={s.poseHint} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {done ? 'All set ✓' : `${POSES[step].icon} ${POSES[step].label}`}
          </motion.div>
        </AnimatePresence>
        <div className={s.poseDots}>
          {POSES.map((_, i) => (
            <span key={i} className={i < shots.length ? s.gateOn : ''} />
          ))}
        </div>
      </div>
      {!done ? (
        <div className={s.cta}>
          <PillButton disabled={!cam.ready} onClick={async () => { setShots([...shots, await cam.capture(900)]); haptic('medium'); }}>Take selfie {shots.length + 1} of {POSES.length}</PillButton>
        </div>
      ) : (
        <>
          <div className={s.scope}>
            <div className={s.dayLabel}>Who can make stickers and objects with you?</div>
            {([['no_one', COPY.onlyMe, 'Nobody else can use your likeness'], ['specific_friends', COPY.peopleIApprove, 'Only friends you pick'], ['my_groups', COPY.myGroups, 'Anyone in a group with you']] as const).map(([v, l, sub]) => (
              <button key={v} className={`${s.scopeRow} ${scope === v ? s.scopeOn : ''}`} onClick={() => setScope(v)}>
                <span className="grow">
                  <span className="t-headline">{l}</span>
                  <span className="t-foot" style={{ display: 'block' }}>{sub}</span>
                </span>
                {scope === v && <Icon name="check" size={20} color="var(--yellow)" />}
              </button>
            ))}
            <p className="t-cap" style={{ margin: '4px 4px 0' }}>You can see and revoke everything made with your face, any time.</p>
          </div>
          <div className={s.cta}>
            <PillButton disabled={busy} onClick={async () => {
              setBusy(true);
              const fd = new FormData();
              shots.forEach((b, i) => fd.append('selfies', b, `selfie${i}.jpg`));
              fd.set('verified', 'true');
              await api.post('/me/likeness', fd);
              await api.patch('/me', { likenessScope: scope });
              await queryClient.invalidateQueries({ queryKey: ['me'] });
              onDone();
            }}>Save my likeness</PillButton>
          </div>
        </>
      )}
    </>
  );
}

function LikenessStep() {
  const nav = useNavigate();
  return (
    <Step back progress={0.84}>
      <h1 className={s.title}>Make your stickers</h1>
      <p className={s.lede}>Three quick selfies so you can turn yourself into stickers, comics and figurines. Optional.</p>
      <LikenessCapture onDone={() => nav('/welcome/notifications')} />
      <button className={s.textBtn} onClick={() => nav('/welcome/notifications')} style={{ marginBottom: 12 }}>{COPY.notNow}</button>
    </Step>
  );
}

/* 9 ── Notifications, asked last and tied to the ritual */
function NotificationsStep() {
  const nav = useNavigate();
  const me = useMe();
  const group = me.data?.groups[0];
  const finish = async () => {
    await api.patch('/me', { onboarded: true });
    await queryClient.invalidateQueries({ queryKey: ['me'] });
    nav('/', { replace: true });
  };
  return (
    <Step progress={1}>
      <div className={s.hero}>
        <div className={s.fakeLa}>
          {group && <Mascot species={group.mascot.species} level={group.mascot.stage.level} size={46} idle={false} />}
          <div className="grow">
            <div className="t-headline">{group?.name ?? 'Your group'} · roll day</div>
            <div className={s.fakeLaCount}>2:41:07</div>
          </div>
          <div className={s.fakeLaPill}>3/5</div>
        </div>
      </div>
      <h1 className={s.title}>One ping on roll day</h1>
      <p className={s.lede}>We only notify you when there’s something real to see: your roll opening, friends’ new photos, and your week developing.</p>
      <div className={s.cta}>
        <PillButton onClick={async () => {
          try {
            if ('Notification' in window) await Notification.requestPermission();
            await api.patch('/me', { settings: { pushEnabled: Notification.permission === 'granted', liveActivities: true } });
          } catch {
            /* unsupported */
          }
          await finish();
        }}>Turn on notifications</PillButton>
        <button className={s.textBtn} onClick={finish}>{COPY.notNow}</button>
      </div>
    </Step>
  );
}
