import { LIVE } from '../lib/static';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Route, Routes, useNavigate, useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import { BRAND, MASCOT_SPECIES, WALL_UNLOCK_MEMBERS, gphotos, ios, jackbox, locket, pets, retro, snapchat, sora, spec, whatsapp } from '@app/shared';
import { api, ApiError } from '../lib/api';
import { queryClient, useActiveGroup, useMe } from '../lib/queries';
import { useUi } from '../lib/store';
import { haptic } from '../lib/feedback';
import { useCamera, fileToSquareJpeg, photoTakenAt, systemCameraShot } from '../lib/camera';
import { Icon } from '../components/Icon';
import { Alert, Avatar, Section, Row, Sheet, Spinner } from '../components/ios';
import { Mascot } from '../components/Mascot';
import { QR, shareInvite } from '../components/QR';
import { RewindDial, type DialItem } from '../components/RewindDial';
import { AppIcon } from '../components/Brand';
import s from './onboarding.module.css';

/**
 * Onboarding. Shell and order: Locket's onboarding (Lazyweb flow, research/01 §1.12) — intro "Set up
 * my Locket", "What's your name?" (first/last), contacts "Share All Contacts" / "Not now" with a
 * "Skip contacts?" modal, "0 of 5 friends added", then the widget. Spec changes: Snapchat's birthday
 * step for teen safety (§S), Retro's Rewind as the cold start (§A1), Widgetable's "Raise Pets Together"
 * flow for the group and its mascot (§M), the gate at 3 and never hard (§A3), Sora cameo + Google
 * Me Meme guidance for the likeness (§A5), notifications explained with Locket's Rollcall help text (§B).
 */
export default function Onboarding() {
  return (
    <div className={s.root} data-dark>
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
        <Route path="widget" element={<WidgetStep />} />
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

function Step({ children, back = true }: { children: React.ReactNode; back?: boolean }) {
  const nav = useNavigate();
  return (
    <motion.div className={s.step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 38 }}>
      <div className={s.top}>
        {back && (
          <button className={s.back} onClick={() => nav(-1)} aria-label={ios.back}>
            <Icon name="chevronLeft" size={26} strokeWidth={2.6} />
          </button>
        )}
      </div>
      {children}
    </motion.div>
  );
}

function Primary({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button className={s.primary} disabled={disabled} onClick={() => { haptic('light'); onClick(); }}>
      {children}
    </button>
  );
}

/* 1 ── Intro: "Set up my Locket" [V-weak] */
function Intro() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [code, setCode] = useState(params.get('join') ?? '');
  const [joinSheet, setJoinSheet] = useState(false);
  const [page, setPage] = useState(0);
  const me = useMe();
  useEffect(() => {
    if (params.get('join')) draft.joinCode = params.get('join')!;
    // In Claude, opening the shared app is the invitation: suggest the owner's group.
    else if (LIVE) void import('../live/engine').then(({ suggestedJoinCode }) => suggestedJoinCode()).then((c) => c && !draft.joinCode && (draft.joinCode = c));
  }, [params]);
  return (
    <div className={s.intro}>
      {/* First page: the app icon with Locket's subtitle and store line [V]; then Locket's own App
          Store panels [I] (locket-01…07): gray glyph + label, white bold headline; page dots. */}
      <div
        className={s.pages}
        onScroll={(e) => {
          const el = e.currentTarget;
          setPage(Math.round(el.scrollLeft / el.clientWidth));
        }}
      >
        <div className={s.introArt}>
          <AppIcon size={120} />
          <p className={s.subtitle}>{locket.subtitle}</p>
          <p className={s.storeLine}>{locket.storeLine}</p>
        </div>
        {locket.panels.map((p, i) => (
          <div key={p.label} className={s.panel}>
            <span className={`${s.panelLabel} ${i === 0 ? s.panelLabelYellow : ''}`}>
              {i === 0 ? <AppIcon size={26} /> : <Icon name={p.glyph} size={26} strokeWidth={2} />}
              {p.label}
            </span>
            <h2 className={s.panelHeadline}>{p.headline}</h2>
          </div>
        ))}
      </div>
      <div className={s.pageDots}>
        {[0, ...locket.panels.map((_, i) => i + 1)].map((i) => (
          <i key={i} className={i === page ? s.pageDotOn : ''} />
        ))}
      </div>
      <div className={s.cta}>
        <Primary onClick={() => nav(me.data ? '/welcome/contacts' : '/welcome/name')}>{locket.setUp}</Primary>
        <button className={s.secondary} onClick={() => setJoinSheet(true)}>{jackbox.roomCode}</button>
      </div>
      <Sheet open={joinSheet} onClose={() => setJoinSheet(false)} title={jackbox.roomCode} dark>
        <input className={s.codeField} value={code} onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))} autoCapitalize="characters" aria-label={jackbox.roomCode} />
        <Primary disabled={code.length < 4} onClick={() => { draft.joinCode = code; setJoinSheet(false); nav(me.data ? `/j/${code}` : '/welcome/name'); }}>{jackbox.play}</Primary>
      </Sheet>
    </div>
  );
}

/* 2 ── "What's your name?" with first-name and last-name fields [V-weak] */
function NameStep() {
  const nav = useNavigate();
  const me = useMe();
  const [first, setFirst] = useState(draft.first || me.data?.user.name.split(' ')[0] || '');
  const [last, setLast] = useState(draft.last);
  return (
    <Step>
      <h1 className={s.title}>{locket.whatsYourName}</h1>
      <div className={s.fields}>
        <input className={s.field} placeholder={locket.firstName} value={first} onChange={(e) => setFirst(e.target.value)} autoFocus autoComplete="given-name" />
        <input className={s.field} placeholder={locket.lastName} value={last} onChange={(e) => setLast(e.target.value)} autoComplete="family-name" />
      </div>
      <div className={s.cta}>
        <Primary disabled={!first.trim()} onClick={async () => {
          draft.first = first.trim();
          draft.last = last.trim();
          if (me.data) {
            await api.patch('/me', { name: `${draft.first} ${draft.last}`.trim() });
            nav('/welcome/contacts');
          } else nav('/welcome/birthday');
        }}>{locket.continue}</Primary>
      </div>
    </Step>
  );
}

/* 3 ── Birthday: Snapchat's "When's your birthday?" [B-med]; iOS wheel date picker [HIG] */
const MONTHS = Array.from({ length: 12 }, (_, i) => new Date(2000, i, 1).toLocaleDateString('en-US', { month: 'long' }));

function Wheel({ items, value, onChange, width }: { items: string[]; value: number; onChange: (i: number) => void; width: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const ITEM = 34;
  useEffect(() => {
    ref.current?.scrollTo({ top: value * ITEM });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div
      ref={ref}
      className={s.wheel}
      style={{ width }}
      onScroll={(e) => {
        const i = Math.round(e.currentTarget.scrollTop / ITEM);
        if (i !== value && i >= 0 && i < items.length) {
          haptic('light');
          onChange(i);
        }
      }}
    >
      <div style={{ height: ITEM * 3 }} />
      {items.map((it, i) => (
        <div key={it} className={`${s.wheelItem} ${i === value ? s.wheelOn : ''}`} style={{ height: ITEM }}>
          {it}
        </div>
      ))}
      <div style={{ height: ITEM * 3 }} />
    </div>
  );
}

function BirthdayStep() {
  const nav = useNavigate();
  const thisYear = new Date().getFullYear();
  const years = useMemo(() => Array.from({ length: 100 }, (_, i) => String(thisYear - i)), [thisYear]);
  const [m, setM] = useState(new Date().getMonth());
  const [d, setD] = useState(new Date().getDate() - 1);
  const [y, setY] = useState(18);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <Step>
      <h1 className={s.title}>{snapchat.whensYourBirthday}</h1>
      <div className={s.picker}>
        <div className={s.pickerBand} />
        <Wheel items={MONTHS} value={m} onChange={setM} width={140} />
        <Wheel items={Array.from({ length: 31 }, (_, i) => String(i + 1))} value={d} onChange={setD} width={56} />
        <Wheel items={years} value={y} onChange={setY} width={84} />
      </div>
      {err && <p className={s.err}>{err}</p>}
      <div className={s.cta}>
        <Primary disabled={busy} onClick={async () => {
          setBusy(true);
          try {
            await api.post('/auth/start', { name: `${draft.first} ${draft.last}`.trim(), birthYear: Number(years[y]), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
            await queryClient.invalidateQueries({ queryKey: ['me'] });
            nav('/welcome/contacts');
          } catch (e) {
            setErr(e instanceof ApiError ? e.message : null);
          } finally {
            setBusy(false);
          }
        }}>{busy ? <Spinner /> : locket.continue}</Primary>
      </div>
    </Step>
  );
}

/* 4 ── Contacts: "Share All Contacts" / "Not now" → "Skip contacts?" [V-weak] */
function ContactsStep() {
  const nav = useNavigate();
  const [skip, setSkip] = useState(false);
  const supported = 'contacts' in navigator && 'ContactsManager' in window;
  const next = () => nav(draft.joinCode ? `/j/${draft.joinCode}` : '/welcome/rewind');
  return (
    <Step>
      <div className={s.heroIcon}>
        <Icon name="personCircle" size={96} strokeWidth={1.4} />
      </div>
      <div className={s.cta}>
        <Primary onClick={async () => {
          if (supported) {
            try {
              await (navigator as unknown as { contacts: { select: (p: string[], o: { multiple: boolean }) => Promise<unknown[]> } }).contacts.select(['name', 'tel'], { multiple: true });
              await api.patch('/me', { settings: { contactsShared: true } });
            } catch {
              /* cancelled */
            }
          }
          next();
        }}>{locket.shareAllContacts}</Primary>
        <button className={s.secondary} onClick={() => setSkip(true)}>{locket.notNow}</button>
      </div>
      <Alert
        open={skip}
        title={locket.skipContacts}
        onDismiss={() => setSkip(false)}
        actions={[
          { label: ios.cancel, onClick: () => setSkip(false) },
          { label: ios.continue, preferred: true, onClick: () => { setSkip(false); next(); } },
        ]}
      />
    </Step>
  );
}

/* 5 ── Rewind cold start: Retro's Rewind tab [V]; picks seed the "starter wall" (spec §A1) */
/** Post the Rewind picks to a group (the starter wall, spec §A1). */
async function postRewind(groupId: string) {
  for (const r of draft.rewind.slice(0, 10)) {
    const fd = new FormData();
    fd.set('groupIds', groupId);
    fd.set('main', r.blob, 'rewind.jpg');
    fd.set('kind', 'rewind');
    fd.set('fromRoll', 'true');
    fd.set('takenAt', String(r.takenAt));
    await api.post('/posts', fd).catch(() => undefined);
  }
  draft.rewind = [];
}

function RewindStep() {
  const nav = useNavigate();
  const me = useMe();
  const input = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<DialItem[]>(draft.rewind.map((r) => ({ id: r.url, src: r.url, takenAt: r.takenAt })));
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const add = async (files: FileList | null) => {
    if (!files) return;
    setLoading(true);
    const out: typeof draft.rewind = [];
    for (const f of [...files].slice(0, 60)) {
      const blob = await fileToSquareJpeg(f, 1200);
      out.push({ blob, url: URL.createObjectURL(blob), takenAt: await photoTakenAt(f) });
    }
    out.sort((a, b) => b.takenAt - a.takenAt);
    draft.rewind = out;
    setItems(out.map((r) => ({ id: r.url, src: r.url, takenAt: r.takenAt })));
    setLoading(false);
  };
  return (
    <Step>
      <h1 className={s.title}>{retro.rewind}</h1>
      <p className={s.lede}>{retro.rewindWhatsNew}</p>
      {items.length ? (
        <div className={s.dialWrap}>
          <RewindDial items={items} picked={picked} onSelect={(it) => setPicked((p) => { const n = new Set(p); if (n.has(it.id)) n.delete(it.id); else n.add(it.id); return n; })} />
        </div>
      ) : (
        <button className={s.rollPick} onClick={() => input.current?.click()}>
          {loading ? <Spinner size={28} /> : <Icon name="photos" size={44} strokeWidth={1.6} />}
          <span>{ios.photoLibrary}</span>
          <span className={s.rollSub}>{retro.rewindPrivate}</span>
        </button>
      )}
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => add(e.target.files)} />
      <div className={s.cta}>
        <Primary onClick={async () => {
          draft.rewind = draft.rewind.filter((r) => picked.has(r.url));
          // Someone who joined a friend's group during sign-up seeds that group and skips making one.
          const joined = me.data?.groups[0];
          if (!joined) return nav('/welcome/group');
          await postRewind(joined.id);
          nav('/welcome/likeness');
        }}>{locket.continue}</Primary>
        {!items.length && <button className={s.secondary} onClick={() => nav(me.data?.groups.length ? '/welcome/likeness' : '/welcome/group')}>{locket.notNow}</button>}
      </div>
    </Step>
  );
}

/* 6 ── Group: Widgetable "Raise Pets Together" — "Choose a pet, name it, invite a friend" [V-weak] */
export function GroupForm({ onCreated, submitLabel }: { onCreated: (id: string) => void; submitLabel: string }) {
  const setActive = useUi((st) => st.setActiveGroup);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState(MASCOT_SPECIES[0].id);
  const [mascotName, setMascotName] = useState('');
  const [day, setDay] = useState(0);
  const [daySheet, setDaySheet] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <div className={s.petStage}>
        <Mascot species={species} level={1} size={150} shadow="rgba(255,255,255,0.12)" />
      </div>
      <div className={s.species}>
        {MASCOT_SPECIES.map((sp) => (
          <button key={sp.id} className={`${s.speciesBtn} ${species === sp.id ? s.speciesOn : ''}`} onClick={() => { setSpecies(sp.id); haptic('light'); }} aria-label={sp.name}>
            <Mascot species={sp.id} level={1} size={52} />
          </button>
        ))}
      </div>
      <div className={s.fields}>
        <input className={s.field} placeholder={pets.nameIt} value={mascotName} onChange={(e) => setMascotName(e.target.value)} />
        <input className={s.field} placeholder={whatsapp.groupName} value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <Section style={{ margin: '14px 0 0' }}>
        <Row title={spec.ritualDay} value={ios.weekdays[day]} onClick={() => setDaySheet(true)} />
      </Section>
      <Sheet open={daySheet} onClose={() => setDaySheet(false)} title={spec.ritualDay} dark trailing={<button className="ios-bar-btn bold" onClick={() => setDaySheet(false)}>{ios.done}</button>}>
        <Section style={{ margin: '0 0 16px' }}>
          {ios.weekdays.map((w, i) => (
            <Row key={w} title={w} onClick={() => setDay(i)} chevron={false} accessory={day === i ? <Icon name="check" size={20} color="var(--sys-blue)" strokeWidth={2.6} /> : undefined} />
          ))}
        </Section>
      </Sheet>
      <div className={s.cta}>
        <Primary disabled={!name.trim() || !mascotName.trim() || busy} onClick={async () => {
          setBusy(true);
          const res = await api.post<{ group: { id: string } }>('/groups', { name: name.trim(), species, mascotName: mascotName.trim(), ritualDay: day, developHour: 21, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
          setActive(res.group.id);
          await postRewind(res.group.id);
          await queryClient.invalidateQueries({ queryKey: ['me'] });
          onCreated(res.group.id);
        }}>{busy ? <Spinner /> : submitLabel}</Primary>
      </div>
    </>
  );
}

function GroupStep() {
  const nav = useNavigate();
  return (
    <Step>
      <h1 className={s.title}>{pets.choosePet}</h1>
      <GroupForm submitLabel={locket.continue} onCreated={() => nav('/welcome/invite')} />
    </Step>
  );
}

/* 7 ── Invite: Locket's "0 of 5 friends added" at 3 (spec §A3), never a hard gate */
function InviteStep() {
  const nav = useNavigate();
  const me = useMe();
  const group = me.data?.groups[me.data.groups.length - 1];
  const detail = useQueryGroup(group?.id);
  const have = detail?.gate.have ?? 1;
  const need = WALL_UNLOCK_MEMBERS;
  return (
    <Step>
      <h1 className={s.title}>{pets.inviteAFriend}</h1>
      <p className={s.gate}>{locket.friendsAdded(Math.max(0, Math.min(have - 1, need - 1)), need - 1)}</p>
      {group && detail && (
        <div className={s.invite}>
          <QR value={detail.group.inviteUrl} size={168} />
          <div className={s.codeLabel}>{jackbox.roomCode}</div>
          <div className={s.code}>{detail.group.inviteCode}</div>
        </div>
      )}
      <div className={s.cta}>
        <Primary onClick={async () => { if (detail) await shareInvite(detail.group.inviteUrl, detail.group.name); }}>
          <Icon name="share" size={20} /> {ios.share}
        </Primary>
        <button className={s.secondary} onClick={() => nav('/welcome/likeness')}>{locket.continue}</button>
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

/* 8 ── Likeness: Sora cameo setup (head turns) + Google Me Meme photo guidance; Sora permissions */
const POSES = [
  { key: 'front', icon: 'personCircle', label: gphotos.selfieGuidance },
  { key: 'left', icon: 'chevronLeft', label: sora.directions.left },
  { key: 'right', icon: 'chevronRight', label: sora.directions.right },
] as const;

export function LikenessCapture({ onDone }: { onDone: () => void }) {
  const cam = useCamera(true, { bts: false });
  const [shots, setShots] = useState<Blob[]>([]);
  const [scope, setScope] = useState<'no_one' | 'specific_friends' | 'my_groups' | 'everyone'>('my_groups');
  const [restrictions, setRestrictions] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (cam.ready && cam.facing !== 'user') void cam.flip();
  }, [cam.ready]); // eslint-disable-line react-hooks/exhaustive-deps
  const step = Math.min(shots.length, POSES.length - 1);
  const done = shots.length >= POSES.length;
  if (!done)
    return (
      <>
        <div className={s.likeCam}>
          <video ref={cam.videoRef} className={s.likeVideo} playsInline muted autoPlay />
          <div className={s.oval} />
          <div className={s.pose}>
            <Icon name={POSES[step].icon} size={20} strokeWidth={2.4} /> {POSES[step].label}
          </div>
        </div>
        <div className={s.poseDots}>
          {POSES.map((p, i) => (
            <span key={p.key} className={i < shots.length ? s.dotOn : ''} />
          ))}
        </div>
        <div className={s.cta}>
          <button className={s.shutter} disabled={!cam.ready && !cam.error} aria-label={ios.axShutter} onClick={async () => {
            const shot = cam.ready ? await cam.capture(900) : await systemCameraShot('user', 900);
            if (!shot) return;
            setShots([...shots, shot]);
            haptic('medium');
          }} />
        </div>
      </>
    );
  return (
    <>
      <Section>
        {([['no_one', sora.onlyMe], ['specific_friends', sora.peopleIApprove], ['my_groups', sora.mutuals], ['everyone', sora.everyone]] as const).map(([v, l]) => (
          <Row key={v} title={l} onClick={() => setScope(v)} chevron={false} accessory={scope === v ? <Icon name="check" size={20} color="var(--sys-blue)" strokeWidth={2.6} /> : undefined} />
        ))}
      </Section>
      <Section header={sora.restrictions}>
        <textarea className={s.restrictions} rows={3} placeholder={sora.restrictionExamples[0]} value={restrictions} onChange={(e) => setRestrictions(e.target.value)} />
      </Section>
      <div className={s.cta}>
        <Primary disabled={busy} onClick={async () => {
          setBusy(true);
          const fd = new FormData();
          shots.forEach((b, i) => fd.append('selfies', b, `selfie${i}.jpg`));
          fd.set('verified', 'true');
          await api.post('/me/likeness', fd);
          await api.patch('/me', { likenessScope: scope, settings: { likenessRestrictions: restrictions.trim() } });
          await queryClient.invalidateQueries({ queryKey: ['me'] });
          onDone();
        }}>{busy ? <Spinner /> : ios.save}</Primary>
      </div>
    </>
  );
}

function LikenessStep() {
  const nav = useNavigate();
  return (
    <Step>
      <h1 className={s.title}>{spec.likeness}</h1>
      <LikenessCapture onDone={() => nav('/welcome/notifications')} />
      <button className={s.secondary} onClick={() => nav('/welcome/notifications')} style={{ marginBottom: 12 }}>{locket.notNow}</button>
    </Step>
  );
}

/* 9 ── Notifications: Locket's Rollcall help text [V] with a Live Activity preview [HIG] */
function NotificationsStep() {
  const nav = useNavigate();
  const me = useMe();
  const group = me.data?.groups[me.data.groups.length - 1];
  const next = () => nav('/welcome/widget');
  return (
    <Step>
      <div className={s.laPreview}>
        <div className={s.la}>
          {group && <Mascot species={group.mascot.species} level={group.mascot.stage.level} size={44} />}
          <div className={s.laText}>
            <span className={s.laTitle}>{BRAND.name}</span>
            <span className={s.laSub}>{locket.shareYourWeek}</span>
          </div>
          <span className={s.laCount}>{spec.posted(0, group?.memberCount ?? WALL_UNLOCK_MEMBERS)}</span>
        </div>
      </div>
      <p className={s.lede}>{locket.rollcallStep1}</p>
      <div className={s.cta}>
        <Primary onClick={async () => {
          try {
            if ('Notification' in window) await Notification.requestPermission();
            await api.patch('/me', { settings: { pushEnabled: 'Notification' in window && Notification.permission === 'granted', liveActivities: true } });
          } catch {
            /* unsupported */
          }
          next();
        }}>{locket.continue}</Primary>
        <button className={s.secondary} onClick={next}>{locket.notNow}</button>
      </div>
    </Step>
  );
}

/* 10 ── Widget: Locket's own TikTok steps [I] (frame locket-add-widget-steps) over the iOS widget
   gallery card as Locket shows it [I] (frame locket-widget-gallery): "Locket Widget", "Live pics from
   all your friends right on your Home Screen", the dark preview with three avatars in yellow rings
   and "26 Friends", page dots, the blue "⊕ Add Widget" button. */
function WidgetStep() {
  const nav = useNavigate();
  const me = useMe();
  const { group } = useActiveGroup();
  const finish = async () => {
    await api.patch('/me', { onboarded: true });
    await queryClient.invalidateQueries({ queryKey: ['me'] });
    nav('/', { replace: true });
  };
  const faces = group?.members.slice(0, 3) ?? (me.data ? [me.data.user] : []);
  return (
    <Step>
      <ol className={s.steps}>
        {locket.addWidgetSteps.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ol>
      <div className={s.gallery}>
        <span className={s.galleryGrabber} />
        <h2>{locket.widgetTitle}</h2>
        <p>{locket.widgetDescription}</p>
        <span className={s.galleryWidget}>
          <span className={s.galleryRings}>
            {faces.map((u) => (
              <Avatar key={u.id} user={u} size={34} />
            ))}
          </span>
          <b>{locket.widgetFriends(group?.memberCount ?? 1)}</b>
        </span>
        <span className={s.galleryDots}>
          <i className={s.galleryDotOn} />
          <i />
        </span>
        <button className={s.galleryAdd} onClick={finish}>
          <Icon name="plus" size={16} strokeWidth={3} />
          {ios.addWidget}
        </button>
      </div>
    </Step>
  );
}
