import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router';
import { invites, ios, partiful } from '@app/shared';
import { api } from '../lib/api';
import { queryClient, useGroup, useMe, usePlan } from '../lib/queries';
import { haptic } from '../lib/feedback';
import { fileToSquareJpeg } from '../lib/camera';
import type { PlanT } from '../lib/types';
import { Icon } from '../components/Icon';
import { Alert, Avatar, BarButton, GlassCircle, NavBar, Row, Screen, Section, Sheet, Spinner, Switch } from '../components/ios';
import { EFFECT_IDS, FONT_IDS, PlanBackdrop, PlanPoster, THEME_IDS, effectName, themeOf, titleFont } from '../components/PlanCard';
import s from './newplan.module.css';

interface DraftSettings {
  maybe: boolean;
  showGuestList: boolean;
  showGuestCount: boolean;
  /** Settings > RSVPs "number of +1s (default one +1 per guest)" [V] */
  plusOnes: number;
  /** Display + Privacy "hide Activity Feed timestamps" [V] */
  hideTimestamps: boolean;
}
interface Draft {
  title: string;
  titleFont: string;
  theme: string;
  effect: string;
  mode: 'date' | 'poll';
  startsAt: number | null;
  options: number[];
  location: string;
  details: string;
  /** Partiful Settings [V]: accept "Maybe", show the guest list, show the guest count, +1s, timestamps. */
  settings: DraftSettings;
}
const DEFAULT_SETTINGS: DraftSettings = { maybe: true, showGuestList: true, showGuestCount: true, plusOnes: partiful.defaultPlusOnes, hideTimestamps: false };
/** Server defaults: theme cloudflow and the default Effect [V] sunbeams; title in Partiful Display. */
const EMPTY: Draft = { title: '', titleFont: 'display', theme: 'cloudflow', effect: 'sunbeams', mode: 'date', startsAt: null, options: [], location: '', details: '', settings: DEFAULT_SETTINGS };
const MAX_OPTIONS = 6; // the server keeps six
const MAX_PLUS_ONES = 5; // the server's bound (Partiful's maximum is UNKNOWN)
const key = (groupId: string) => `roll.planDraft.${groupId}`;
const loadDraft = (groupId: string): Draft => {
  try {
    const raw = localStorage.getItem(key(groupId));
    if (!raw) return EMPTY;
    const d = JSON.parse(raw) as Partial<Draft>;
    return { ...EMPTY, ...d, settings: { ...DEFAULT_SETTINGS, ...(d.settings ?? {}) } };
  } catch {
    return EMPTY;
  }
};
const storeDraft = (groupId: string, d: Draft | null) => {
  try {
    if (d) localStorage.setItem(key(groupId), JSON.stringify(d));
    else localStorage.removeItem(key(groupId));
  } catch {
    /* private mode: the draft lives in memory only */
  }
};
const toLocal = (t: number) => {
  const d = new Date(t - new Date(t).getTimezoneOffset() * 60_000);
  return d.toISOString().slice(0, 16);
};
const fromPlan = (p: PlanT): Draft => ({
  title: p.title,
  titleFont: p.titleFont,
  theme: p.theme,
  effect: p.effect,
  mode: !p.startsAt && p.options.length ? 'poll' : 'date',
  startsAt: p.startsAt,
  options: p.options.map((o) => o.at),
  location: p.location ?? '',
  details: p.details ?? '',
  settings: { ...DEFAULT_SETTINGS, ...(p.settings ?? {}) },
});

type Poster = { url: string; blob: Blob | null } | null;

/**
 * Partiful's create flow, in order (research/15 §2a, research/04 §3.7) [V]: name the event and change
 * the font ("Multiple font options pop up"); the poster with its edit button in the bottom-right
 * corner — "upload your own photo" [V], here through Apple Invites' "Add Background" → "Photos" /
 * "Camera" [V] since Partiful's picker labels are UNKNOWN; event name, date, location, description;
 * "Set a Date" with "Poll your guests" under it ("Find a Time": the host writes in dates or times);
 * "Theme" (background) and "Effect" (animations) [V]; "Settings" below them; "Save Draft" (required
 * before inviting; you can edit later); then the "Invite" screen listing the people you know [V].
 * Fill-ins: "Add Description" (Apple Invites [V]); the "add date" row and the date wheel (Contacts and
 * UIDatePicker [HIG]); theme names (Luma [V], see PlanCard). Settings stores Accept RSVPs › Maybe, the
 * number of +1s [V] (UIStepper [HIG]), Display + Privacy (guest list, guest count, Activity Feed
 * timestamps) [V]; Guest Approval and Auto-Reminders stay at this app's fixed values, shown locked.
 * Everyone in the group is invited (the plan lands in the group chat), so the Invite list shows the group.
 *
 * `/plan/:planId/edit` is the same screen for the event page's "Edit" [V]: every field, the poster and
 * the settings, saved with "Save" [HIG]; the host can also delete the plan [HIG].
 */
export default function NewPlan() {
  const { groupId: groupParam = '', planId } = useParams();
  const nav = useNavigate();
  const me = useMe();
  const existing = usePlan(planId);
  const plan = existing.data?.plan ?? null;
  const editing = Boolean(planId);
  const groupId = plan?.groupId ?? groupParam;
  const group = useGroup(groupId || undefined);
  const [d, setD] = useState<Draft>(() => (planId ? EMPTY : loadDraft(groupParam)));
  const [loaded, setLoaded] = useState(!planId);
  const [poster, setPoster] = useState<Poster>(null);
  const [step, setStep] = useState<'edit' | 'invite'>('edit');
  const [sheet, setSheet] = useState<'poster' | 'theme' | 'effect' | 'settings' | null>(null);
  const [fontsOpen, setFontsOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const photosInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const set = (patch: Partial<Draft>) => setD((cur) => ({ ...cur, ...patch }));
  const setSettings = (patch: Partial<DraftSettings>) => setD((cur) => ({ ...cur, settings: { ...cur.settings, ...patch } }));

  // Edit: start from the saved plan once it arrives.
  useEffect(() => {
    if (!planId || loaded || !plan) return;
    setD(fromPlan(plan));
    setPoster(plan.poster ? { url: plan.poster, blob: null } : null);
    setLoaded(true);
  }, [planId, plan, loaded]);

  const ready = d.title.trim().length > 0 && (d.mode === 'date' ? Boolean(d.startsAt) : d.options.length >= 2);
  const preview = { ...d, title: d.title.trim() || partiful.untitled, poster: poster?.url ?? null };

  const choosePoster = async (f: File | undefined) => {
    if (!f) return;
    const blob = await fileToSquareJpeg(f);
    setPoster({ url: URL.createObjectURL(blob), blob });
    setSheet(null);
    haptic('light');
  };

  const body = () => ({
    title: d.title.trim(),
    theme: d.theme,
    effect: d.effect,
    titleFont: d.titleFont,
    startsAt: d.mode === 'date' ? d.startsAt : null,
    options: d.mode === 'poll' ? [...d.options].sort((a, b) => a - b) : [],
    location: d.location.trim() || null,
    details: d.details.trim() || null,
    settings: d.settings,
  });

  const uploadPoster = async (pid: string) => {
    if (poster?.blob) {
      const fd = new FormData();
      fd.set('file', poster.blob, 'poster.jpg');
      await api.post(`/plans/${pid}/poster`, fd);
    } else if (!poster && plan?.poster) await api.del(`/plans/${pid}/poster`);
  };

  const saveDraft = () => {
    haptic('light');
    storeDraft(groupId, d);
    setStep('invite');
  };

  const invite = async () => {
    setBusy(true);
    try {
      const r = await api.post<{ id: string }>(`/groups/${groupId}/plans`, body());
      await uploadPoster(r.id).catch(() => undefined);
      haptic('success');
      storeDraft(groupId, null);
      void queryClient.invalidateQueries({ queryKey: ['messages', groupId] });
      nav(`/plan/${r.id}`, { replace: true });
    } finally {
      setBusy(false);
    }
  };

  const saveEdit = async () => {
    if (!planId) return;
    setBusy(true);
    try {
      await api.patch(`/plans/${planId}`, body());
      await uploadPoster(planId);
      haptic('success');
      void queryClient.invalidateQueries({ queryKey: ['plan', planId] });
      void queryClient.invalidateQueries({ queryKey: ['messages', groupId] });
      void queryClient.invalidateQueries({ queryKey: ['plans', groupId] });
      nav(-1);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!planId) return;
    setConfirmDelete(false);
    setBusy(true);
    try {
      await api.del(`/plans/${planId}`);
      haptic('heavy');
      void queryClient.invalidateQueries({ queryKey: ['messages', groupId] });
      void queryClient.invalidateQueries({ queryKey: ['plans', groupId] });
      nav(groupId ? `/chat/${groupId}` : '/chats', { replace: true });
    } finally {
      setBusy(false);
    }
  };

  if (editing && !loaded)
    return (
      <Screen light className={s.page}>
        <div className={s.nav}>
          <NavBar onBack={() => nav(-1)} />
        </div>
        <div className={s.loading}>
          <Spinner />
        </div>
      </Screen>
    );

  if (step === 'invite') {
    const others = (group.data?.members ?? []).filter((m) => m.user.id !== me.data?.user.id);
    return (
      <Screen light className={s.page}>
        <PlanBackdrop theme={d.theme} effect="none" />
        <div className={s.nav}>
          <NavBar title={partiful.invite} onBack={() => setStep('edit')} />
        </div>
        <div className={`ios-scroll ${s.scroll}`}>
          <div className={s.invitePoster}>
            <PlanPoster plan={preview} size="swatch" />
          </div>
          <Section style={{ margin: '20px 16px 0' }}>
            {others.map((m) => (
              <Row key={m.user.id} icon={<Avatar user={m.user} size={36} />} title={m.user.name} sepInset={64} accessory={<Icon name="check" size={20} strokeWidth={2.4} />} />
            ))}
          </Section>
        </div>
        <div className={s.bottom}>
          <button className={s.primary} disabled={busy} onClick={() => void invite()}>
            {busy ? <Spinner size={20} /> : partiful.invite}
          </button>
        </div>
      </Screen>
    );
  }

  const st = d.settings;
  return (
    <Screen light className={s.page}>
      <PlanBackdrop theme={d.theme} effect={d.effect} />
      <div className={s.nav}>
        <NavBar
          leading={<BarButton onClick={() => nav(-1)}>{ios.cancel}</BarButton>}
          trailing={
            editing ? (
              <BarButton bold disabled={!ready || busy} onClick={() => void saveEdit()}>
                {busy ? <Spinner size={18} /> : ios.save}
              </BarButton>
            ) : (
              <BarButton bold disabled={!ready} onClick={saveDraft}>
                {partiful.saveDraft}
              </BarButton>
            )
          }
        />
      </div>
      <div className={`ios-scroll ${s.scroll} ${s.withBar}`}>
        <div className={s.poster}>
          <PlanPoster plan={preview} size="page" />
          <span className={s.posterEdit}>
            <GlassCircle icon="pencil" label={partiful.poster} size={40} iconSize={18} onClick={() => setSheet('poster')} />
          </span>
        </div>

        <div className={s.body}>
          <input
            className={s.title}
            style={titleFont(d.titleFont)}
            value={d.title}
            placeholder={partiful.untitled}
            maxLength={80}
            onFocus={() => setFontsOpen(true)}
            onBlur={() => setFontsOpen(false)}
            onChange={(e) => set({ title: e.target.value })}
          />
          {fontsOpen && (
            <div className={s.fonts}>
              {FONT_IDS.map((f) => (
                <button key={f} aria-pressed={d.titleFont === f} style={titleFont(f)} onPointerDown={(e) => e.preventDefault()} onClick={() => set({ titleFont: f })}>
                  {partiful.titleFonts[f]}
                </button>
              ))}
            </div>
          )}

          {d.mode === 'date' ? (
            <>
              <DateField value={d.startsAt} onChange={(t) => set({ startsAt: t })} className={s.field}>
                <Icon name="calendar" size={22} />
                <span className={d.startsAt ? s.fieldValue : s.fieldEmpty}>{d.startsAt ? ios.dateTime(d.startsAt) : partiful.setADate}</span>
              </DateField>
              <button className={s.link} onClick={() => set({ mode: 'poll' })}>
                {partiful.pollYourGuests}
              </button>
            </>
          ) : (
            <>
              <div className={s.field}>
                <Icon name="calendar" size={22} />
                <span className={s.fieldValue}>{partiful.findATime}</span>
              </div>
              <div className={s.options}>
                {d.options.map((t, i) => (
                  <div key={i} className={s.optionRow}>
                    <button className={s.minus} aria-label={ios.delete} onClick={() => set({ options: d.options.filter((_, k) => k !== i) })} />
                    <DateField value={t} onChange={(v) => set({ options: d.options.map((x, k) => (k === i ? v : x)) })} className={s.optionValue}>
                      {ios.dateTime(t)}
                    </DateField>
                  </div>
                ))}
                {d.options.length < MAX_OPTIONS && (
                  <DateField value={null} onChange={(v) => set({ options: [...d.options, v] })} className={s.optionRow}>
                    <span className={s.plus} />
                    <span className={s.addDate}>{ios.addDate}</span>
                  </DateField>
                )}
              </div>
              <button className={s.link} onClick={() => set({ mode: 'date' })}>
                {partiful.setADate}
              </button>
            </>
          )}

          <label className={s.field}>
            <Icon name="pin" size={22} />
            <input className={s.input} value={d.location} placeholder={partiful.location} maxLength={120} onChange={(e) => set({ location: e.target.value })} />
          </label>
          <textarea className={s.details} value={d.details} placeholder={invites.addDescription} rows={3} maxLength={2048} onChange={(e) => set({ details: e.target.value })} />

          {editing && (
            <Section style={{ margin: '28px 0 0' }}>
              <button className={`ios-row destructive ${s.center}`} onClick={() => setConfirmDelete(true)} disabled={busy}>
                {ios.delete}
              </button>
            </Section>
          )}
        </div>
      </div>

      <div className={s.toolbar}>
        <button onClick={() => setSheet('theme')}>{partiful.theme}</button>
        <button onClick={() => setSheet('effect')}>{partiful.effect}</button>
        <button onClick={() => setSheet('settings')}>{partiful.settings}</button>
      </div>

      {/* The poster picker: "upload your own photo" [V] via Apple Invites' "Add Background" → "Photos" / "Camera" [V] */}
      <Sheet open={sheet === 'poster'} onClose={() => setSheet(null)} light title={invites.addBackground} trailing={<BarButton bold onClick={() => setSheet(null)}>{ios.done}</BarButton>}>
        <Section style={{ margin: '8px 0 20px' }}>
          <Row icon={<Icon name="photos" size={22} />} title={invites.photos} onClick={() => photosInput.current?.click()} />
          <Row icon={<Icon name="camera" size={22} />} title={invites.camera} onClick={() => cameraInput.current?.click()} />
          {poster && <Row title={ios.remove} destructive onClick={() => { setPoster(null); haptic('light'); }} />}
        </Section>
        <Section header={partiful.theme} style={{ margin: 0 }}>
          <div className={s.swatches}>
            {THEME_IDS.map((t) => (
              <button key={t} aria-pressed={!poster && d.theme === t} onClick={() => { set({ theme: t }); setPoster(null); }}>
                <PlanPoster plan={{ ...preview, theme: t, poster: null }} size="swatch" />
                <span>{themeOf(t).name}</span>
              </button>
            ))}
          </div>
        </Section>
      </Sheet>
      <input ref={photosInput} type="file" accept="image/*" hidden onChange={(e) => { void choosePoster(e.target.files?.[0]); e.target.value = ''; }} />
      <input ref={cameraInput} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { void choosePoster(e.target.files?.[0]); e.target.value = ''; }} />

      <Sheet open={sheet === 'theme'} onClose={() => setSheet(null)} light title={partiful.theme} trailing={<BarButton bold onClick={() => setSheet(null)}>{ios.done}</BarButton>}>
        <div className={s.swatches}>
          {THEME_IDS.map((t) => (
            <button key={t} aria-pressed={d.theme === t} onClick={() => set({ theme: t })}>
              <PlanPoster plan={{ ...preview, theme: t, poster: null }} size="swatch" />
              <span>{themeOf(t).name}</span>
            </button>
          ))}
        </div>
      </Sheet>

      <Sheet open={sheet === 'effect'} onClose={() => setSheet(null)} light title={partiful.effect} trailing={<BarButton bold onClick={() => setSheet(null)}>{ios.done}</BarButton>}>
        <div className={s.swatches}>
          {EFFECT_IDS.map((e) => (
            <button key={e} aria-pressed={d.effect === e} onClick={() => set({ effect: e })}>
              <PlanPoster plan={{ ...preview, effect: e }} size="swatch" withEffect />
              <span>{effectName(e)}</span>
            </button>
          ))}
        </div>
      </Sheet>

      <Sheet open={sheet === 'settings'} onClose={() => setSheet(null)} light title={partiful.settings} trailing={<BarButton bold onClick={() => setSheet(null)}>{ios.done}</BarButton>} height="80%">
        <Section header={partiful.tabRsvps} style={{ margin: '8px 0 24px' }}>
          <Row title={partiful.guestApproval} accessory={<Locked on={false} label={partiful.guestApproval} />} />
          <Row title={partiful.rsvpButtonStyle} value={partiful.emojis} />
          <Row
            title={partiful.plusOnes}
            value={String(st.plusOnes)}
            accessory={
              <span className={s.stepper}>
                <button onClick={() => setSettings({ plusOnes: Math.max(0, st.plusOnes - 1) })} disabled={st.plusOnes <= 0} aria-label={ios.remove}>
                  <Icon name="minus" size={18} strokeWidth={2.4} />
                </button>
                <i />
                <button onClick={() => setSettings({ plusOnes: Math.min(MAX_PLUS_ONES, st.plusOnes + 1) })} disabled={st.plusOnes >= MAX_PLUS_ONES} aria-label={partiful.plusOnes}>
                  <Icon name="plus" size={18} strokeWidth={2.4} />
                </button>
              </span>
            }
          />
        </Section>
        <Section header={partiful.acceptRsvps} style={{ margin: '0 0 24px' }}>
          <Row title={partiful.maybe} accessory={<Switch on={st.maybe} label={partiful.maybe} onChange={(v) => setSettings({ maybe: v })} />} />
        </Section>
        <Section header={partiful.tabDisplay} style={{ margin: '0 0 24px' }}>
          <Row title={partiful.showGuestList} accessory={<Switch on={st.showGuestList} label={partiful.showGuestList} onChange={(v) => setSettings({ showGuestList: v })} />} />
          <Row title={partiful.showGuestCount} accessory={<Switch on={st.showGuestCount} label={partiful.showGuestCount} onChange={(v) => setSettings({ showGuestCount: v })} />} />
          <Row title={partiful.hideTimestamps} accessory={<Switch on={st.hideTimestamps} label={partiful.hideTimestamps} onChange={(v) => setSettings({ hideTimestamps: v })} />} />
        </Section>
        <Section header={partiful.tabHosts} style={{ margin: '0 0 24px' }}>
          <Row icon={<Avatar user={plan?.createdBy ?? me.data?.user} size={32} />} title={plan?.createdBy?.name ?? me.data?.user.name ?? ''} />
        </Section>
        <Section header={partiful.tabReminders} style={{ margin: '0 0 24px' }}>
          <Row title={partiful.tabReminders} accessory={<Locked on label={partiful.tabReminders} />} />
        </Section>
      </Sheet>

      <Alert
        open={confirmDelete}
        title={d.title || partiful.untitled}
        onDismiss={() => setConfirmDelete(false)}
        actions={[
          { label: ios.cancel, onClick: () => setConfirmDelete(false) },
          { label: ios.delete, destructive: true, onClick: () => void remove() },
        ]}
      />
    </Screen>
  );
}

/** A setting this app doesn't let you change yet: the stock switch, dimmed [HIG]. */
function Locked({ on, label }: { on: boolean; label: string }) {
  return (
    <span className={s.locked}>
      <Switch on={on} label={label} onChange={() => undefined} />
    </span>
  );
}

/** A row that opens the native date-and-time wheel (UIDatePicker) [HIG]. */
function DateField({ value, onChange, className, children }: { value: number | null; onChange: (t: number) => void; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLInputElement>(null);
  const [min, setMin] = useState('');
  useEffect(() => setMin(toLocal(Date.now())), []);
  return (
    <label className={`${className ?? ''} ${s.dateField}`}>
      {children}
      <input
        ref={ref}
        type="datetime-local"
        className={s.native}
        value={value ? toLocal(value) : ''}
        min={min}
        onClick={() => {
          try {
            ref.current?.showPicker();
          } catch {
            /* Safari opens the wheel on tap */
          }
        }}
        onChange={(e) => e.target.value && onChange(new Date(e.target.value).getTime())}
      />
    </label>
  );
}
