import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { bereal, imessage, invites, ios, partiful, photos27 } from '@app/shared';
import { api } from '../lib/api';
import { queryClient, useGroup, useMe, useMessages, usePlan } from '../lib/queries';
import { onRealtime } from '../lib/realtime';
import { haptic } from '../lib/feedback';
import { fileToSquareJpeg, photoTakenAt } from '../lib/camera';
import { firstName } from '../lib/format';
import type { PlanFeedItem, PlanGuest, PlanT, PublicUser } from '../lib/types';
import { Icon } from '../components/Icon';
import { Alert, Avatar, AvatarStack, BarButton, GlassCircle, Menu, Row, Screen, Section, Segmented, Sheet, Spinner, Switch } from '../components/ios';
import { PlanBackdrop, PlanPoster, RSVP_IDS, rsvpClosed, rsvpLabel, titleFont } from '../components/PlanCard';
import s from './plan.module.css';

type Vote = 'yes' | 'maybe' | 'no';
const VOTES: Vote[] = ['yes', 'maybe', 'no'];
type Audience = 'going' | 'maybe' | 'cant_go' | 'invited';
type Status = (typeof RSVP_IDS)[number];

/**
 * Partiful's event page (spec §P/§T), research/04 §3, research/15 §2, research/21 §1:
 * - Theme (background) + Effect (animations) [V]; the poster (the host's own photo or the typographic
 *   one) [V], then the title in Partiful Display [V-weak].
 * - Page order poster · title · date/time · "Hosted by" · location · RSVP · description · guest list ·
 *   Activity Feed [B-med]; "Hosted by" [V-weak]; "# Going" / Maybe counts [V]/[V-weak]; "# Going"
 *   counts +1s.
 * - RSVP "Going" / "Maybe" / "Can't Go" [V] with the default Emojis button style [V] (glyphs [B-med]).
 *   Tapping one opens the RSVP screen: the response, the attendee count (+1s) and an optional comment
 *   [V-weak], sent with Apple Invites' "Send Reply" [V]; the note is "visible to the host and other
 *   guests" [V], so it shows in the Guest List and the Activity Feed.
 * - Guests see only the Going and Maybe lists [V]; the host also sees "Can't Go" and "Invited" [V].
 * - "Find a Time": Yes / No / Maybe per option, everyone sees the answers, the host taps an option and
 *   "Pick this" [V]; answers become RSVPs [V]. Running yes count per date: Rallly [V].
 * - Host: the bar at the bottom "with editing, inviting guests and viewing the number of attendees"
 *   [V-weak]: the count, "Edit" [V] and "Text Blast" → "New Message" [V]; recipients by status [V],
 *   "Going" by default (Luma [V]); "You can send a photo along with your message" [V].
 * - "Upload Photos" at the top of the "Activity Feed" [V]; the album is an iOS 27 temporary shared album:
 *   "Make Album Temporary" [V], Apple's expiry sentence [V]. Comments with photos post to the feed [V];
 *   typing "@" pops up names and the tagged guest is notified [V]. The comment field is iOS shared
 *   albums' "Add a comment" / "Post" [B-high] because Partiful's placeholder is UNKNOWN. Comments can be
 *   reported (BeReal "Report" [V]) or deleted by their writer or the host [HIG].
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
  const [reply, setReply] = useState<Status | null>(null);
  const [pick, setPick] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['plan', planId] });
  const groupId = p?.groupId;

  // Comments, RSVPs and edits from other members arrive as group events.
  useEffect(
    () =>
      onRealtime((e) => {
        if ((e.type === 'message' || e.type === 'group' || e.type === 'post') && e.groupId === groupId) void queryClient.invalidateQueries({ queryKey: ['plan', planId] });
      }),
    [groupId, planId],
  );

  if (!p)
    return (
      <Screen light className={s.page}>
        <div className={s.back}>
          <GlassCircle icon="chevronLeft" label={ios.back} onClick={() => nav(-1)} />
        </div>
        {q.isLoading && (
          <div className={s.loading}>
            <Spinner />
          </div>
        )}
      </Screen>
    );

  const myId = me.data?.user.id;
  const undated = !p.startsAt && p.options.length > 0;
  const closed = rsvpClosed(p);
  void msgs;

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
  const plusMine = p.myPlusOnes ?? 0;

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
            <>
              <div className={s.rsvp}>
                {RSVP_IDS.filter((k) => k !== 'maybe' || p.settings?.maybe !== false).map((k) => (
                  <button key={k} className={s.rsvpBtn} aria-pressed={p.mine === k} disabled={closed} onClick={() => { haptic('light'); setReply(k); }}>
                    <span className={s.rsvpEmoji}>{partiful.rsvpEmoji[k]}</span>
                    {rsvpLabel[k]}
                  </button>
                ))}
              </div>
              {p.mine && (plusMine > 0 || p.myNote) && (
                <button className={s.myReply} onClick={() => setReply(p.mine)}>
                  {plusMine > 0 && <b>{partiful.plusN(plusMine)}</b>}
                  {p.myNote && <span>{p.myNote}</span>}
                </button>
              )}
            </>
          )}

          {p.details && <p className={s.details}>{p.details}</p>}

          <button className={s.going} onClick={() => setSheet('guests')}>
            {p.going.length + p.maybe.length > 0 && <AvatarStack users={[...p.going, ...p.maybe]} size={28} max={6} edge="var(--sys-bg)" />}
            {p.goingCount != null && <span>{partiful.countGoing(p.goingCount)}</span>}
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
            <Composer plan={p} onPosted={refresh} />
            {(p.feed ?? []).map((item) => (
              <FeedItem key={item.id} item={item} plan={p} onChanged={refresh} />
            ))}
          </section>
        </div>
      </div>

      {p.isHost && (
        <div className={s.hostBar}>
          <button className={s.barCount} onClick={() => setSheet('guests')}>
            {p.goingCount != null && partiful.countGoing(p.goingCount)}
          </button>
          <button className={s.barEdit} onClick={() => nav(`/plan/${p.id}/edit`)}>
            {partiful.edit}
          </button>
          <button className={s.barBlast} onClick={() => setSheet('blast')}>
            {partiful.textBlast}
          </button>
        </div>
      )}

      <GuestSheet open={sheet === 'guests'} onClose={() => setSheet(null)} plan={p} />
      <BlastSheet open={sheet === 'blast'} onClose={() => setSheet(null)} plan={p} onSent={() => void refresh()} />
      <ReplySheet status={reply} onClose={() => setReply(null)} plan={p} />
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

/** "@" pops up the names [V]; the tagged members are sent with the comment and notified. */
function mentionsIn(text: string, people: PublicUser[]) {
  return people.filter((u) => text.includes(partiful.mention(firstName(u.name)))).map((u) => u.id);
}

/** Bold "@Name" runs in a comment, the way tags read in the feed [B-med]. */
function Mentions({ text, people }: { text: string; people: PublicUser[] }) {
  const names = people.map((u) => partiful.mention(firstName(u.name))).filter((n, i, a) => a.indexOf(n) === i);
  if (!names.length) return <>{text}</>;
  const re = new RegExp(`(${names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
  return (
    <>
      {text.split(re).map((part, i) => (names.includes(part) ? <b key={i}>{part}</b> : <span key={i}>{part}</span>))}
    </>
  );
}

function Composer({ plan, onPosted }: { plan: PlanT; onPosted: () => void }) {
  const me = useMe();
  const group = useGroup(plan.groupId);
  const people = useMemo(() => (group.data?.members ?? []).map((m) => m.user).filter((u) => u.id !== me.data?.user.id), [group.data, me.data]);
  const [text, setText] = useState('');
  const [photo, setPhoto] = useState<{ blob: Blob; url: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const pickRef = useRef<HTMLInputElement>(null);
  const at = /(?:^|\s)@(\S*)$/.exec(text);
  const suggestions = at ? people.filter((u) => firstName(u.name).toLowerCase().startsWith(at[1].toLowerCase())).slice(0, 5) : [];

  const insert = (u: PublicUser) => {
    haptic('light');
    setText((t) => t.replace(/@(\S*)$/, `${partiful.mention(firstName(u.name))} `));
  };
  const post = async () => {
    if (busy || (!text.trim() && !photo)) return;
    setBusy(true);
    try {
      const mentions = mentionsIn(text, people);
      if (photo) {
        const fd = new FormData();
        fd.set('body', text.trim());
        fd.set('file', photo.blob, 'photo.jpg');
        fd.set('mentions', mentions.join(','));
        await api.post(`/plans/${plan.id}/comments`, fd);
      } else await api.post(`/plans/${plan.id}/comments`, { body: text.trim(), mentions });
      haptic('success');
      setText('');
      if (photo) URL.revokeObjectURL(photo.url);
      setPhoto(null);
      onPosted();
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className={s.composer}>
      {suggestions.length > 0 && (
        <div className={s.mentions}>
          {suggestions.map((u) => (
            <button key={u.id} onPointerDown={(e) => e.preventDefault()} onClick={() => insert(u)}>
              <Avatar user={u} size={26} />
              {u.name}
            </button>
          ))}
        </div>
      )}
      {photo && (
        <div className={s.composerPhoto}>
          <img src={photo.url} alt="" />
          <button onClick={() => setPhoto(null)} aria-label={ios.remove}>
            <Icon name="close" size={12} strokeWidth={3} />
          </button>
        </div>
      )}
      <div className={s.composerRow}>
        <Avatar user={me.data?.user} size={32} />
        <textarea
          className={s.composerInput}
          rows={1}
          placeholder={photos27.addComment}
          value={text}
          maxLength={1000}
          onChange={(e) => setText(e.target.value)}
        />
        <button className={s.composerIcon} onClick={() => pickRef.current?.click()} aria-label={invites.photos}>
          <Icon name="photos" size={22} />
        </button>
        <button className={s.composerPost} disabled={busy || (!text.trim() && !photo)} onClick={() => void post()}>
          {busy ? <Spinner size={16} /> : photos27.post}
        </button>
      </div>
      <input
        ref={pickRef}
        type="file"
        accept="image/*"
        hidden
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (!f) return;
          const blob = await fileToSquareJpeg(f);
          setPhoto({ blob, url: URL.createObjectURL(blob) });
        }}
      />
    </div>
  );
}

function FeedItem({ item, plan, onChanged }: { item: PlanFeedItem; plan: PlanT; onChanged: () => void }) {
  const me = useMe();
  const [full, setFull] = useState(false);
  const group = useGroup(plan.groupId);
  const people = (group.data?.members ?? []).map((m) => m.user);
  const [menu, setMenu] = useState(false);
  const [alert, setAlert] = useState(false);
  const mine = item.user?.id === me.data?.user.id;
  const actions =
    item.kind === 'comment'
      ? [
          ...(item.canDelete ? [{ label: ios.delete, icon: 'trash', destructive: true, onClick: async () => { await api.del(`/plans/${plan.id}/comments/${item.id}`); onChanged(); } }] : []),
          ...(!mine ? [{ label: bereal.report, icon: 'flag', destructive: true, onClick: async () => { await api.post('/report', { kind: 'plan_comment', id: item.id, reason: '' }); setAlert(true); } }] : []),
        ]
      : [];
  return (
    <div className={s.item}>
      <Avatar user={item.user} size={36} />
      <div className={s.itemText}>
        <div className={s.itemHead}>
          <b>{item.user ? firstName(item.user.name) : ''}</b>
          {item.kind === 'blast' && <i className={s.tag}>{partiful.textBlast}</i>}
          {item.kind === 'rsvp' && (
            <i className={s.tag}>
              {partiful.rsvpEmoji[item.status]} {rsvpLabel[item.status]}
              {item.plusOnes > 0 && ` ${partiful.plusN(item.plusOnes)}`}
            </i>
          )}
          {item.createdAt != null && <span>{ios.dateTime(item.createdAt)}</span>}
          {actions.length > 0 && (
            <button className={s.itemMore} onClick={() => setMenu(true)} aria-label={ios.more}>
              <Icon name="more" size={18} strokeWidth={3} />
            </button>
          )}
        </div>
        {item.kind === 'rsvp' ? (
          <div className={s.itemBody}>{item.note}</div>
        ) : (
          <>
            {item.body && (
              <div className={s.itemBody}>
                <Mentions text={item.body} people={people} />
              </div>
            )}
            {item.media && (
              <button className={s.itemPhoto} onClick={() => setFull(true)}>
                <img src={item.media} alt="" />
              </button>
            )}
          </>
        )}
      </div>
      {full && item.kind !== 'rsvp' && item.media && (
        <button className={s.lightbox} onClick={() => setFull(false)} aria-label={ios.close}>
          <img src={item.media} alt="" />
        </button>
      )}
      <Menu open={menu} onClose={() => setMenu(false)} actions={actions} />
      <Alert open={alert} title={bereal.report} message={bereal.reportsAnonymous} onDismiss={() => setAlert(false)} actions={[{ label: ios.ok, preferred: true, onClick: () => setAlert(false) }]} />
    </div>
  );
}

function People({ guests }: { guests: PlanGuest[] }) {
  return (
    <>
      {guests.map((g) =>
        g.user ? (
          <Row
            key={g.user.id}
            icon={<Avatar user={g.user} size={32} />}
            title={g.user.name}
            sub={g.note ?? undefined}
            value={g.plusOnes > 0 ? partiful.plusN(g.plusOnes) : undefined}
            sepInset={60}
          />
        ) : null,
      )}
    </>
  );
}

/** "Guest List" [V]: Going and Maybe for everyone [V]; the host also sees Can't Go and Invited [V]. +1s and notes per guest. */
function GuestSheet({ open, onClose, plan }: { open: boolean; onClose: () => void; plan: PlanT }) {
  const guests = plan.guests ?? [...plan.going.map((u) => ({ user: u, status: 'going' as const, plusOnes: 0, note: null })), ...plan.maybe.map((u) => ({ user: u, status: 'maybe' as const, plusOnes: 0, note: null }))];
  const by = (st: PlanGuest['status']) => guests.filter((g) => g.status === st);
  const going = by('going');
  const goingTotal = going.reduce((n, g) => n + 1 + g.plusOnes, 0);
  return (
    <Sheet open={open} onClose={onClose} light title={partiful.guestList} trailing={<BarButton bold onClick={onClose}>{ios.done}</BarButton>} height="80%">
      <div className={s.sheetInk}>
        {going.length > 0 && (
          <Section header={partiful.countGoing(goingTotal)} style={{ margin: '8px 0 24px' }}>
            <People guests={going} />
          </Section>
        )}
        {by('maybe').length > 0 && (
          <Section header={partiful.countMaybe(by('maybe').length)} style={{ margin: '0 0 24px' }}>
            <People guests={by('maybe')} />
          </Section>
        )}
        {plan.isHost && by('cant_go').length > 0 && (
          <Section header={partiful.countOf(by('cant_go').length, partiful.cantGo)} style={{ margin: '0 0 24px' }}>
            <People guests={by('cant_go')} />
          </Section>
        )}
        {plan.isHost && plan.invited.length > 0 && (
          <Section header={partiful.countOf(plan.invited.length, partiful.invited)} style={{ margin: '0 0 24px' }}>
            <People guests={plan.invited.map((u) => ({ user: u, status: 'maybe', plusOnes: 0, note: null }))} />
          </Section>
        )}
      </div>
    </Sheet>
  );
}

/**
 * The RSVP screen (research/21 §1): the choice of "Going", "Maybe" or "Can't Go", the attendee count
 * (+1s, up to the host's "number of +1s" [V]) and an optional comment [V-weak] — Apple Invites' note
 * "visible to the host and other guests" and "Send Reply" [V]. The stepper is the stock UIStepper [HIG].
 */
function ReplySheet({ status, onClose, plan }: { status: Status | null; onClose: () => void; plan: PlanT }) {
  const [choice, setChoice] = useState<Status>('going');
  const [plus, setPlus] = useState(0);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const max = plan.settings?.plusOnes ?? partiful.defaultPlusOnes;
  useEffect(() => {
    if (!status) return;
    setChoice(status);
    setPlus(plan.myPlusOnes ?? 0);
    setNote(plan.myNote ?? '');
  }, [status, plan.myPlusOnes, plan.myNote]);
  const send = async () => {
    setBusy(true);
    try {
      haptic(choice === 'going' ? 'success' : 'medium');
      await api.post(`/plans/${plan.id}/rsvp`, { status: choice, plusOnes: choice === 'cant_go' ? 0 : plus, note });
      void queryClient.invalidateQueries({ queryKey: ['plan', plan.id] });
      void queryClient.invalidateQueries({ queryKey: ['messages', plan.groupId] });
      onClose();
    } finally {
      setBusy(false);
    }
  };
  const statuses = RSVP_IDS.filter((k) => k !== 'maybe' || plan.settings?.maybe !== false);
  return (
    <Sheet
      open={Boolean(status)}
      onClose={onClose}
      light
      leading={<BarButton onClick={onClose}>{ios.cancel}</BarButton>}
      trailing={
        <BarButton bold disabled={busy} onClick={() => void send()}>
          {invites.sendReply}
        </BarButton>
      }
    >
      <div className={s.sheetInk}>
        <div className={`${s.rsvp} ${s.rsvpSheet}`}>
          {statuses.map((k) => (
            <button key={k} className={s.rsvpBtn} aria-pressed={choice === k} onClick={() => { haptic('light'); setChoice(k); }}>
              <span className={s.rsvpEmoji}>{partiful.rsvpEmoji[k]}</span>
              {rsvpLabel[k]}
            </button>
          ))}
        </div>
        {choice !== 'cant_go' && max > 0 && (
          <Section style={{ margin: '20px 0 0' }}>
            <Row
              title={partiful.plusOnes}
              value={plus > 0 ? partiful.plusN(plus) : '0'}
              accessory={
                <span className={s.stepper}>
                  <button onClick={() => setPlus((n) => Math.max(0, n - 1))} disabled={plus <= 0} aria-label={ios.remove}>
                    <Icon name="minus" size={18} strokeWidth={2.4} />
                  </button>
                  <i />
                  <button onClick={() => setPlus((n) => Math.min(max, n + 1))} disabled={plus >= max} aria-label={partiful.plusOnes}>
                    <Icon name="plus" size={18} strokeWidth={2.4} />
                  </button>
                </span>
              }
            />
          </Section>
        )}
        <Section style={{ margin: '20px 0 24px' }}>
          <textarea className={s.blastText} placeholder={invites.addNote} value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={280} />
        </Section>
      </div>
    </Sheet>
  );
}

/** Text Blast → "New Message" [V]; recipients by RSVP status [V], "Going" preselected (Luma's default [V]); a photo along with the message [V]. */
function BlastSheet({ open, onClose, plan, onSent }: { open: boolean; onClose: () => void; plan: PlanT; onSent: () => void }) {
  const [text, setText] = useState('');
  const [to, setTo] = useState<Audience[]>(['going']);
  const [photo, setPhoto] = useState<{ blob: Blob; url: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const pickRef = useRef<HTMLInputElement>(null);
  const guests = plan.guests ?? [];
  const groups: [Audience, string, number][] = [
    ['going', partiful.going, plan.going.length],
    ['maybe', partiful.maybe, plan.maybe.length],
    ['cant_go', partiful.cantGo, plan.cantGoCount || guests.filter((g) => g.status === 'cant_go').length],
    ['invited', partiful.invited, plan.invited.length],
  ];
  const send = async () => {
    setBusy(true);
    try {
      if (photo) {
        const fd = new FormData();
        fd.set('text', text.trim());
        fd.set('audience', to.join(','));
        fd.set('file', photo.blob, 'photo.jpg');
        await api.post(`/plans/${plan.id}/blast-photo`, fd);
      } else await api.post(`/plans/${plan.id}/blast`, { text: text.trim(), audience: to });
      haptic('success');
      setText('');
      setPhoto(null);
      onSent();
      void queryClient.invalidateQueries({ queryKey: ['plan', plan.id] });
      void queryClient.invalidateQueries({ queryKey: ['messages', plan.groupId] });
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
        <BarButton bold disabled={busy || (!text.trim() && !photo) || !to.length || plan.blastsLeft <= 0} onClick={() => void send()}>
          {busy ? <Spinner size={16} /> : partiful.send}
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
        <Section style={{ margin: '0 0 16px' }}>
          <textarea className={s.blastText} placeholder={imessage.textMessage} value={text} onChange={(e) => setText(e.target.value)} rows={5} maxLength={500} />
        </Section>
        <Section style={{ margin: '0 0 24px' }}>
          {photo ? (
            <Row
              icon={<img className={s.blastThumb} src={photo.url} alt="" />}
              title={invites.photos}
              accessory={
                <button className={s.rowX} onClick={() => setPhoto(null)} aria-label={ios.remove}>
                  <Icon name="close" size={14} strokeWidth={3} />
                </button>
              }
            />
          ) : (
            <Row icon={<Icon name="photos" size={22} />} title={invites.photos} link onClick={() => pickRef.current?.click()} />
          )}
        </Section>
        <input
          ref={pickRef}
          type="file"
          accept="image/*"
          hidden
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (!f) return;
            const blob = await fileToSquareJpeg(f);
            setPhoto({ blob, url: URL.createObjectURL(blob) });
          }}
        />
      </div>
    </Sheet>
  );
}
