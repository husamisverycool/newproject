import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router';
import { invites, ios, partiful } from '@app/shared';
import { api } from '../lib/api';
import { queryClient, useGroup, useMe } from '../lib/queries';
import { haptic } from '../lib/feedback';
import { Icon } from '../components/Icon';
import { Avatar, BarButton, GlassCircle, NavBar, Row, Screen, Section, Sheet, Spinner, Switch } from '../components/ios';
import { EFFECT_IDS, FONT_IDS, PlanBackdrop, PlanPoster, THEME_IDS, effectName, themeOf, titleFont } from '../components/PlanCard';
import s from './newplan.module.css';

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
  /** Partiful Settings [V]: accept "Maybe", show the guest list, show the guest count. */
  settings: { maybe: boolean; showGuestList: boolean; showGuestCount: boolean };
}
/** Server defaults: theme cloudflow and the default Effect [V] sunbeams; title in Partiful Display. */
const EMPTY: Draft = { title: '', titleFont: 'display', theme: 'cloudflow', effect: 'sunbeams', mode: 'date', startsAt: null, options: [], location: '', details: '', settings: { maybe: true, showGuestList: true, showGuestCount: true } };
const MAX_OPTIONS = 6; // the server keeps six
const key = (groupId: string) => `roll.planDraft.${groupId}`;
const loadDraft = (groupId: string): Draft => {
  try {
    const raw = localStorage.getItem(key(groupId));
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<Draft>) } : EMPTY;
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

/**
 * Partiful's create flow, in order (research/15 §2a, research/04 §3.7) [V]: name the event and change
 * the font ("Multiple font options pop up"); the poster with its edit button in the bottom-right
 * corner; event name, date, location, description; "Set a Date" with "Poll your guests" under it
 * ("Find a Time": the host writes in dates or times); "Theme" (background) and "Effect" (animations),
 * changed from the toolbar on the event page itself [V]; "Settings" below them; "Save Draft" (required
 * before inviting; you can edit later); then the "Invite" screen listing the people you know [V].
 * Fill-ins: "Add Description" (Apple Invites [V]); the "add date" row and the date wheel (Contacts and
 * UIDatePicker [HIG]); theme names (Luma [V], see PlanCard). Settings stores Accept RSVPs › Maybe and
 * Display + Privacy (guest list, guest count); Guest Approval and Auto-Reminders stay at this app's
 * fixed values, locked, so
 * Settings shows Partiful's settings with this app's fixed values, locked. Everyone in the group is
 * invited (the plan lands in the group chat), so the Invite list shows the group.
 */
export default function NewPlan() {
  const { groupId = '' } = useParams();
  const nav = useNavigate();
  const me = useMe();
  const group = useGroup(groupId);
  const [d, setD] = useState<Draft>(() => loadDraft(groupId));
  const [step, setStep] = useState<'edit' | 'invite'>('edit');
  const [sheet, setSheet] = useState<'theme' | 'effect' | 'settings' | null>(null);
  const [fontsOpen, setFontsOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (patch: Partial<Draft>) => setD((cur) => ({ ...cur, ...patch }));

  const ready = d.title.trim().length > 0 && (d.mode === 'date' ? Boolean(d.startsAt) : d.options.length >= 2);
  const preview = { ...d, title: d.title.trim() || partiful.untitled };

  const saveDraft = () => {
    haptic('light');
    storeDraft(groupId, d);
    setStep('invite');
  };

  const invite = async () => {
    setBusy(true);
    try {
      const r = await api.post<{ id: string }>(`/groups/${groupId}/plans`, {
        title: d.title.trim(),
        theme: d.theme,
        effect: d.effect,
        titleFont: d.titleFont,
        startsAt: d.mode === 'date' ? d.startsAt : null,
        options: d.mode === 'poll' ? [...d.options].sort((a, b) => a - b) : [],
        location: d.location.trim() || undefined,
        details: d.details.trim() || undefined,
        settings: d.settings ?? EMPTY.settings,
      });
      haptic('success');
      storeDraft(groupId, null);
      void queryClient.invalidateQueries({ queryKey: ['messages', groupId] });
      nav(`/plan/${r.id}`, { replace: true });
    } finally {
      setBusy(false);
    }
  };

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

  return (
    <Screen light className={s.page}>
      <PlanBackdrop theme={d.theme} effect={d.effect} />
      <div className={s.nav}>
        <NavBar
          leading={<BarButton onClick={() => nav(-1)}>{ios.cancel}</BarButton>}
          trailing={
            <BarButton bold disabled={!ready} onClick={saveDraft}>
              {partiful.saveDraft}
            </BarButton>
          }
        />
      </div>
      <div className={`ios-scroll ${s.scroll} ${s.withBar}`}>
        <div className={s.poster}>
          <PlanPoster plan={preview} size="page" />
          <span className={s.posterEdit}>
            <GlassCircle icon="pencil" label={ios.edit} size={40} iconSize={18} onClick={() => setSheet('theme')} />
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
        </div>
      </div>

      <div className={s.toolbar}>
        <button onClick={() => setSheet('theme')}>{partiful.theme}</button>
        <button onClick={() => setSheet('effect')}>{partiful.effect}</button>
        <button onClick={() => setSheet('settings')}>{partiful.settings}</button>
      </div>

      <Sheet open={sheet === 'theme'} onClose={() => setSheet(null)} light title={partiful.theme} trailing={<BarButton bold onClick={() => setSheet(null)}>{ios.done}</BarButton>}>
        <div className={s.swatches}>
          {THEME_IDS.map((t) => (
            <button key={t} aria-pressed={d.theme === t} onClick={() => set({ theme: t })}>
              <PlanPoster plan={{ ...preview, theme: t }} size="swatch" />
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
        </Section>
        <Section header={partiful.acceptRsvps} style={{ margin: '0 0 24px' }}>
          <Row title={partiful.maybe} accessory={<Switch on={(d.settings ?? EMPTY.settings).maybe} label={partiful.maybe} onChange={(v) => set({ settings: { ...(d.settings ?? EMPTY.settings), maybe: v } })} />} />
        </Section>
        <Section header={partiful.tabDisplay} style={{ margin: '0 0 24px' }}>
          <Row title={partiful.showGuestList} accessory={<Switch on={(d.settings ?? EMPTY.settings).showGuestList} label={partiful.showGuestList} onChange={(v) => set({ settings: { ...(d.settings ?? EMPTY.settings), showGuestList: v } })} />} />
          <Row title={partiful.showGuestCount} accessory={<Switch on={(d.settings ?? EMPTY.settings).showGuestCount} label={partiful.showGuestCount} onChange={(v) => set({ settings: { ...(d.settings ?? EMPTY.settings), showGuestCount: v } })} />} />
        </Section>
        <Section header={partiful.tabHosts} style={{ margin: '0 0 24px' }}>
          <Row icon={<Avatar user={me.data?.user} size={32} />} title={me.data?.user.name ?? ''} />
        </Section>
        <Section header={partiful.tabReminders} style={{ margin: '0 0 24px' }}>
          <Row title={partiful.tabReminders} accessory={<Locked on label={partiful.tabReminders} />} />
        </Section>
      </Sheet>
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
