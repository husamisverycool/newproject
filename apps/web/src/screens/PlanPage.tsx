import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { imessage, ios, partiful, photos27 } from '@app/shared';
import { api } from '../lib/api';
import { queryClient, useMe, useMessages, usePlan } from '../lib/queries';
import { haptic } from '../lib/feedback';
import { fileToSquareJpeg, photoTakenAt } from '../lib/camera';
import { firstName } from '../lib/format';
import type { Message, PlanT, PublicUser } from '../lib/types';
import { Icon } from '../components/Icon';
import { Alert, Avatar, AvatarStack, BarButton, GlassCircle, Row, Screen, Section, Segmented, Sheet, Spinner, Switch } from '../components/ios';
import { PlanBackdrop, PlanPoster, RSVP_IDS, rsvpClosed, rsvpLabel, rsvpPlan, titleFont } from '../components/PlanCard';
import s from './plan.module.css';

type Vote = 'yes' | 'maybe' | 'no';
const VOTES: Vote[] = ['yes', 'maybe', 'no'];
type Audience = 'going' | 'maybe' | 'cant_go' | 'invited';

/**
 * Partiful's event page (spec §P/§T), research/04 §3, research/15 §2, research/21 §1:
 * - Theme (background) + Effect (animations) [V]; poster, then the title in Partiful Display [V-weak].
 * - Page order poster · title · date/time · "Hosted by" · location · RSVP · description · guest list ·
 *   Activity Feed [B-med]; "Hosted by" [V-weak]; "# Going" / Maybe counts [V]/[V-weak].
 * - RSVP "Going" / "Maybe" / "Can't Go" [V] with the default Emojis button style [V] (glyphs [B-med]).
 * - Guests see only the Going and Maybe lists [V]; the host also sees "Can't Go" and "Invited" [V].
 * - "Find a Time": Yes / No / Maybe per option, everyone sees the answers, the host taps an option and
 *   "Pick this" [V]; answers become RSVPs [V], so the poll stands in for the RSVP buttons until then.
 *   Running yes count per date: Rallly [V]. Vote control: stock segmented control [HIG].
 * - Host: "the Text Blast button" at the bottom of the screen [V] and the attendee count in that bar
 *   [V-weak]; "Text Blast" → "New Message" [V]; recipients by status [V], "Going" by default (Luma [V]).
 * - "Upload Photos" at the top of the "Activity Feed" [V]; the album is an iOS 27 temporary shared album:
 *   "Make Album Temporary" [V] (turning it off keeps the album), Apple's expiry sentence [V].
 * Unknown visuals fall back to stock iOS rows, sheets and alerts [HIG].
 */
export default function PlanPage() {
  const { planId } = useParams();
  const nav = useNavigate();
  const q = usePlan(planId);
  const me = useMe();
  const p = q.data?.plan;
  const msgs = useMessages(p?.groupId);
  const [sheet, setSheet] = useState<'guests' | 'blast' | null>(null);
  const [pick, setPick] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['plan', planId] });

  if (!p)
    return (
      <Screen light className={s.page}>
        <div className={s.back}>
          <GlassCircle icon="chevronLeft" label={ios.back} onClick={() => nav(-1)} />
        </div>
      </Screen>
    );

  const myId = me.data?.user.id;
  const undated = !p.startsAt && p.options.length > 0;
  const closed = rsvpClosed(p);
  const blasts = (msgs.data?.messages ?? []).filter((m) => m.refId === p.id && m.meta.blast).reverse();

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const f of [...files].slice(0, 10)) {
        const fd = new FormData();
        fd.set('groupIds', p.groupId);
        fd.set('main', await fileToSquareJpeg(f), 'photo.jpg');
        fd.set('fromRoll', 'true');
        fd.set('takenAt', String(await photoTakenAt(f)));
        fd.set('planId', p.id);
        await api.post('/posts', fd);
      }
    } finally {
      setUploading(false);
      if (file.current) file.current.value = '';
      void refresh();
    }
  };

  const keep = async () => {
    haptic('light');
    await api.post(`/plans/${p.id}/keep`);
    void refresh();
  };

  const daysLeft = p.albumExpiresAt ? Math.max(1, Math.ceil((p.albumExpiresAt - Date.now()) / 86_400_000)) : null;

  return (
    <Screen light className={s.page}>
      <PlanBackdrop theme={p.theme} effect={p.effect} />
      <div className={s.back}>
        <GlassCircle icon="chevronLeft" label={ios.back} onClick={() => nav(-1)} />
      </div>
      <div className={`ios-scroll ${s.scroll} ${p.isHost ? s.withBar : ''}`}>
        <div className={s.poster}>
          <PlanPoster plan={p} size="page" />
        </div>
        <div className={s.body}>
          <h1 className={s.title} style={titleFont(p.titleFont)}>
            {p.title}
          </h1>

          {p.startsAt && (
            <div className={s.fact}>
              <Icon name="calendar" size={22} />
              <span>
                <b>{ios.weekdayDate(p.startsAt)}</b>
                <span className={s.factSub}>{ios.time(p.startsAt)}</span>
              </span>
            </div>
          )}
          {p.createdBy && <div className={s.hosted}>{partiful.hostedBy(firstName(p.createdBy.name))}</div>}
          {p.location && (
            <a className={s.fact} href={`https://maps.apple.com/?q=${encodeURIComponent(p.location)}`} target="_blank" rel="noreferrer">
              <Icon name="pin" size={22} />
              <span>
                <b>{p.location}</b>
              </span>
            </a>
          )}

          {undated ? (
            <FindATime plan={p} myId={myId} onPick={setPick} onVote={refresh} />
          ) : (
            <div className={s.rsvp}>
              {RSVP_IDS.filter((k) => k !== 'maybe' || p.settings?.maybe !== false).map((k) => (
                <button key={k} className={s.rsvpBtn} aria-pressed={p.mine === k} disabled={closed} onClick={() => void rsvpPlan(p, k)}>
                  <span className={s.rsvpEmoji}>{partiful.rsvpEmoji[k]}</span>
                  {rsvpLabel[k]}
                </button>
              ))}
            </div>
          )}

          {p.details && <p className={s.details}>{p.details}</p>}

          <button className={s.going} onClick={() => setSheet('guests')}>
            {p.going.length + p.maybe.length > 0 && <AvatarStack users={[...p.going, ...p.maybe]} size={28} max={6} edge="var(--sys-bg)" />}
            {p.goingCount !== null && <span>{partiful.countGoing(p.goingCount ?? p.going.length)}</span>}
            {p.maybe.length > 0 && <span className={s.dim}>{partiful.countMaybe(p.maybe.length)}</span>}
            {p.isHost && p.cantGoCount > 0 && <span className={s.dim}>{partiful.countOf(p.cantGoCount, partiful.cantGo)}</span>}
          </button>

          <section className={s.feed}>
            <h2 className={s.h2}>{partiful.activityFeed}</h2>
            <button className={s.upload} onClick={() => file.current?.click()} disabled={uploading}>
              {uploading ? <Spinner size={18} /> : <Icon name="photos" size={20} />}
              {partiful.uploadPhotos}
            </button>
            <input ref={file} type="file" accept="image/*" multiple hidden onChange={(e) => void upload(e.target.files)} />
            {p.album.length > 0 && (
              <div className={s.album}>
                {p.album.map((ph) => (
                  <button key={ph.id} onClick={() => nav(`/p/${ph.id}`)}>
                    <img src={ph.media.thumb ?? ph.media.main} alt="" />
                  </button>
                ))}
              </div>
            )}
            <Section footer={photos27.expirySentence} style={{ margin: '14px 0 0' }}>
              <Row
                title={photos27.makeTemporary}
                sub={!p.albumKept && daysLeft ? photos27.expiresIn(daysLeft) : undefined}
                accessory={
                  <span className={p.albumKept ? s.locked : undefined}>
                    <Switch on={!p.albumKept} label={photos27.makeTemporary} onChange={(on) => !on && void keep()} />
                  </span>
                }
              />
            </Section>
            {blasts.map((m) => (
              <BlastItem key={m.id} msg={m} />
            ))}
          </section>
        </div>
      </div>

      {p.isHost && (
        <div className={s.hostBar}>
          <button className={s.barCount} onClick={() => setSheet('guests')}>
            {p.goingCount !== null && partiful.countGoing(p.goingCount ?? p.going.length)}
          </button>
          <button className={s.barBlast} onClick={() => setSheet('blast')}>
            {partiful.textBlast}
          </button>
        </div>
      )}

      <GuestSheet open={sheet === 'guests'} onClose={() => setSheet(null)} plan={p} />
      <BlastSheet open={sheet === 'blast'} onClose={() => setSheet(null)} plan={p} onSent={() => void msgs.refetch()} />
      <Alert
        open={pick !== null}
        title={pick !== null && p.options[pick] ? ios.dateTime(p.options[pick].at) : ''}
        onDismiss={() => setPick(null)}
        actions={[
          { label: ios.cancel, onClick: () => setPick(null) },
          {
            label: partiful.pickThis,
            preferred: true,
            onClick: async () => {
              const i = pick;
              setPick(null);
              if (i === null) return;
              haptic('success');
              await api.post(`/plans/${p.id}/pick`, { option: i });
              void refresh();
              void queryClient.invalidateQueries({ queryKey: ['messages', p.groupId] });
            },
          },
        ]}
      />
    </Screen>
  );
}

function FindATime({ plan, myId, onPick, onVote }: { plan: PlanT; myId: string | undefined; onPick: (i: number) => void; onVote: () => void }) {
  // "Pick this" needs at least one response first ("it can be you!") [V].
  const canPick = plan.isHost && plan.options.some((o) => o.votes.length > 0);
  const vote = async (option: number, v: Vote) => {
    haptic('light');
    await api.post(`/plans/${plan.id}/vote`, { option, vote: v });
    onVote();
  };
  return (
    <section className={s.poll}>
      <h2 className={s.h2}>{partiful.findATime}</h2>
      {plan.options.map((o, i) => {
        const mine = (o.votes.find((v) => v.user?.id === myId)?.vote ?? '') as Vote | '';
        const yes = o.votes.filter((v) => v.vote === 'yes');
        return (
          <div key={i} className={s.option}>
            <button className={s.optHead} disabled={!canPick} onClick={() => onPick(i)}>
              <span className={s.optWhen}>
                <b>{ios.shortDate(o.at)}</b>
                <span>{ios.time(o.at)}</span>
              </span>
              {yes.length > 0 && <AvatarStack users={yes.map((v) => v.user)} size={24} max={4} edge="var(--sys-bg2)" />}
              <span className={s.optCount}>{yes.length}</span>
            </button>
            <Segmented<Vote | ''> value={mine} options={VOTES.map((v) => ({ id: v, label: partiful[v] }))} onChange={(v) => v && void vote(i, v)} />
          </div>
        );
      })}
    </section>
  );
}

function BlastItem({ msg }: { msg: Message }) {
  return (
    <div className={s.item}>
      <Avatar user={msg.user} size={36} />
      <div className={s.itemText}>
        <div className={s.itemHead}>
          <b>{msg.user ? firstName(msg.user.name) : ''}</b>
          <span>{ios.dateTime(msg.createdAt)}</span>
        </div>
        <div className={s.itemBody}>{msg.body}</div>
      </div>
    </div>
  );
}

function People({ users }: { users: PublicUser[] }) {
  return (
    <>
      {users.map((u) => (
        <Row key={u.id} icon={<Avatar user={u} size={32} />} title={u.name} sepInset={60} />
      ))}
    </>
  );
}

/** "Guest List" [V]: Going and Maybe for everyone [V]; the host also sees Invited [V]. Stock inset grouped list [HIG]. */
function GuestSheet({ open, onClose, plan }: { open: boolean; onClose: () => void; plan: PlanT }) {
  return (
    <Sheet open={open} onClose={onClose} light title={partiful.guestList} trailing={<BarButton bold onClick={onClose}>{ios.done}</BarButton>} height="80%">
      <div className={s.sheetInk}>
        {plan.going.length > 0 && (
          <Section header={partiful.countGoing(plan.going.length)} style={{ margin: '8px 0 24px' }}>
            <People users={plan.going} />
          </Section>
        )}
        {plan.maybe.length > 0 && (
          <Section header={partiful.countMaybe(plan.maybe.length)} style={{ margin: '0 0 24px' }}>
            <People users={plan.maybe} />
          </Section>
        )}
        {plan.isHost && plan.invited.length > 0 && (
          <Section header={partiful.countOf(plan.invited.length, partiful.invited)} style={{ margin: '0 0 24px' }}>
            <People users={plan.invited} />
          </Section>
        )}
      </div>
    </Sheet>
  );
}

/** Text Blast → "New Message" [V]; recipients by RSVP status [V], "Going" preselected (Luma's default [V]). */
function BlastSheet({ open, onClose, plan, onSent }: { open: boolean; onClose: () => void; plan: PlanT; onSent: () => void }) {
  const [text, setText] = useState('');
  const [to, setTo] = useState<Audience[]>(['going']);
  const [busy, setBusy] = useState(false);
  const groups: [Audience, string, number][] = [
    ['going', partiful.going, plan.going.length],
    ['maybe', partiful.maybe, plan.maybe.length],
    ['cant_go', partiful.cantGo, plan.cantGoCount],
    ['invited', partiful.invited, plan.invited.length],
  ];
  const send = async () => {
    setBusy(true);
    try {
      await api.post(`/plans/${plan.id}/blast`, { text: text.trim(), audience: to });
      haptic('success');
      setText('');
      onSent();
      void queryClient.invalidateQueries({ queryKey: ['plan', plan.id] });
      onClose();
    } finally {
      setBusy(false);
    }
  };
  return (
    <Sheet
      open={open}
      onClose={onClose}
      light
      title={partiful.newMessage}
      leading={<BarButton onClick={onClose}>{ios.cancel}</BarButton>}
      trailing={
        <BarButton bold disabled={busy || !text.trim() || !to.length || plan.blastsLeft <= 0} onClick={() => void send()}>
          {partiful.send}
        </BarButton>
      }
    >
      <div className={s.sheetInk}>
        <Section style={{ margin: '8px 0 24px' }}>
          {groups.map(([k, label, n]) => (
            <Row
              key={k}
              title={label}
              value={n}
              chevron={false}
              onClick={() => setTo((cur) => (cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k]))}
              accessory={<Icon name="check" size={20} strokeWidth={2.4} className={to.includes(k) ? s.checkOn : s.checkOff} />}
            />
          ))}
        </Section>
        <Section style={{ margin: 0 }}>
          <textarea className={s.blastText} placeholder={imessage.textMessage} value={text} onChange={(e) => setText(e.target.value)} rows={5} maxLength={500} />
        </Section>
      </div>
    </Sheet>
  );
}
