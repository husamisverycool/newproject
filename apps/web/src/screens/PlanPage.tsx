import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { COPY } from '@app/shared';
import { api } from '../lib/api';
import { queryClient, usePlan } from '../lib/queries';
import { haptic, sfx } from '../lib/feedback';
import { fileToSquareJpeg, photoTakenAt } from '../lib/camera';
import type { PlanT } from '../lib/types';
import { Icon } from '../components/Icon';
import { Avatar, Sheet } from '../components/ui';
import { PlanPoster } from '../components/PlanCard';
import s from './plan.module.css';

/**
 * Partiful inside the group (spec §P): poster, RSVP Going / Maybe / Can't Go, "Find a Time" with
 * Yes / No / Maybe per option and "Pick this", Text Blasts (10 max), a shared album with "Upload
 * Photos" at the top that expires after 30 days unless kept (iOS 27 temporary albums).
 */
export default function PlanPage() {
  const { planId } = useParams();
  const nav = useNavigate();
  const q = usePlan(planId);
  const [blast, setBlast] = useState(false);
  const p = q.data?.plan;
  const file = useRef<HTMLInputElement>(null);
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['plan', planId] });
  if (!p) return <div className={s.page} data-light />;

  const rsvp = async (status: 'going' | 'maybe' | 'cant_go') => {
    haptic('medium');
    if (status === 'going') sfx.sparkle();
    await api.post(`/plans/${p.id}/rsvp`, { status });
    void refresh();
  };
  const upload = async (files: FileList | null) => {
    if (!files) return;
    for (const f of [...files].slice(0, 10)) {
      const fd = new FormData();
      fd.set('groupIds', p.groupId);
      fd.set('main', await fileToSquareJpeg(f), 'photo.jpg');
      fd.set('fromRoll', 'true');
      fd.set('takenAt', String(await photoTakenAt(f)));
      fd.set('planId', p.id);
      await api.post('/posts', fd);
    }
    void refresh();
  };

  return (
    <div className={`${s.page} scroll`} data-light>
      <div className={s.top}>
        <button className={s.back} onClick={() => nav(-1)} aria-label="Back">
          <Icon name="chevronLeft" size={22} />
        </button>
      </div>
      <div className={s.posterWrap}>
        <PlanPoster plan={p} big />
      </div>
      <div className={s.body}>
        <h1 className={s.title} style={{ fontFamily: p.titleFont === 'display' ? 'var(--font-display)' : 'var(--font-plan)', fontStretch: p.titleFont === 'display' ? '125%' : undefined }}>{p.title}</h1>
        <div className={s.host}>
          <Avatar user={p.createdBy} size={26} /> Hosted by <b>{p.createdBy?.name.split(' ')[0]}</b>
        </div>
        <div className={s.facts}>
          <div className={s.fact}>
            <Icon name="calendar" size={20} />
            {p.startsAt ? (
              <span>
                <b>{new Date(p.startsAt).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</b>
                <span className={s.factSub}>{new Date(p.startsAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
              </span>
            ) : (
              <span>
                <b>{COPY.findATime}</b>
                <span className={s.factSub}>Vote below — the host picks</span>
              </span>
            )}
          </div>
          {p.location && (
            <div className={s.fact}>
              <Icon name="pin" size={20} />
              <span>
                <b>{p.location}</b>
              </span>
            </div>
          )}
        </div>
        {p.details && <p className={s.details}>{p.details}</p>}

        {!p.startsAt && p.options.length > 0 && <FindATime plan={p} onChange={refresh} />}

        {/* RSVP */}
        <div className={s.rsvp}>
          {([['going', COPY.going], ['maybe', COPY.maybe], ['cant_go', COPY.cantGo]] as const).map(([k, label]) => (
            <button key={k} className={`${s.rsvpBtn} ${p.mine === k ? s.rsvpOn : ''}`} onClick={() => rsvp(k)}>
              {p.mine === k && <Icon name="check" size={18} strokeWidth={3} />}
              {label}
            </button>
          ))}
        </div>

        {/* Guest list: Going and Maybe are visible; who can't go stays private (Partiful). */}
        <div className={s.section}>
          <div className={s.sectionHead}>Guest list</div>
          <GuestRow label={COPY.going} users={p.going} />
          {p.maybe.length > 0 && <GuestRow label={COPY.maybe} users={p.maybe} />}
          {p.invited.length > 0 && <GuestRow label="Invited" users={p.invited} dim />}
          {p.cantGoCount > 0 && <div className={s.cantGo}>{p.cantGoCount} can’t make it</div>}
        </div>

        {/* Activity: Upload Photos at the top, then the album */}
        <div className={s.section}>
          <div className={s.sectionHead}>
            Photos
            {p.albumExpiresAt && !p.albumKept && <span className={s.expires}>expires {new Date(p.albumExpiresAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>}
          </div>
          <button className={s.upload} onClick={() => file.current?.click()}>
            <Icon name="photos" size={20} /> {COPY.uploadPhotos}
          </button>
          <input ref={file} type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} />
          {p.album.length > 0 && (
            <div className={s.album}>
              {p.album.map((ph) => (
                <img key={ph.id} src={ph.media.thumb ?? ph.media.main} alt="" onClick={() => nav(`/p/${ph.id}`)} />
              ))}
            </div>
          )}
          {p.album.length > 0 && !p.albumKept && (
            <button className={s.keep} onClick={async () => { await api.post(`/plans/${p.id}/keep`); void refresh(); }}>
              <Icon name="cards" size={18} /> Keep this album in the binder & yearbook
            </button>
          )}
          {p.albumKept && <div className={s.kept}>Kept ✓ — this album won’t expire</div>}
        </div>

        {p.isHost && (
          <button className={s.blastBtn} onClick={() => setBlast(true)}>
            <Icon name="volume" size={18} /> Text Blast · {p.blastsLeft} left
          </button>
        )}
        <div style={{ height: 40 }} />
      </div>
      <BlastSheet open={blast} onClose={() => setBlast(false)} plan={p} onSent={refresh} />
    </div>
  );
}

function GuestRow({ label, users, dim }: { label: string; users: PlanT['going']; dim?: boolean }) {
  return (
    <div className={s.guestRow} style={dim ? { opacity: 0.55 } : undefined}>
      <span className={s.guestLabel}>
        {label} <b>{users.length}</b>
      </span>
      <span className={s.guests}>
        {users.map((u) => (
          <span key={u.id} className={s.guest}>
            <Avatar user={u} size={40} />
            <span>{u.name.split(' ')[0]}</span>
          </span>
        ))}
      </span>
    </div>
  );
}

function FindATime({ plan, onChange }: { plan: PlanT; onChange: () => void }) {
  return (
    <div className={s.section}>
      <div className={s.sectionHead}>{COPY.findATime}</div>
      {plan.options.map((o, i) => {
        const yes = o.votes.filter((v) => v.vote === 'yes');
        return (
          <div key={i} className={s.option}>
            <div className={s.optHead}>
              <span>
                <b>{new Date(o.at).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</b> · {new Date(o.at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </span>
              <span className={s.optCount}>{yes.length} yes</span>
            </div>
            <div className={s.optVotes}>
              {(['yes', 'maybe', 'no'] as const).map((v) => (
                <button key={v} className={s.voteBtn} onClick={async () => { haptic('light'); await api.post(`/plans/${plan.id}/vote`, { option: i, vote: v }); onChange(); }}>
                  {v === 'yes' ? 'Yes' : v === 'maybe' ? 'Maybe' : 'No'}
                </button>
              ))}
              {plan.isHost && (
                <button className={s.pick} onClick={async () => { await api.post(`/plans/${plan.id}/pick`, { option: i }); onChange(); }}>
                  {COPY.pickThis}
                </button>
              )}
            </div>
            <div className={s.voters}>
              {o.votes.map((v, k) => (
                <span key={k} className={s.voter} data-vote={v.vote}>
                  <Avatar user={v.user} size={22} />
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BlastSheet({ open, onClose, plan, onSent }: { open: boolean; onClose: () => void; plan: PlanT; onSent: () => void }) {
  const [text, setText] = useState('');
  const [aud, setAud] = useState<'all' | 'going' | 'maybe'>('all');
  return (
    <Sheet open={open} onClose={onClose} title={COPY.newBlast} tone="light">
      <div className="stack gap12" style={{ paddingBottom: 14 }}>
        <textarea className={s.blastText} placeholder="Message everyone…" value={text} onChange={(e) => setText(e.target.value)} rows={4} />
        <div className="hstack gap8">
          {(['all', 'going', 'maybe'] as const).map((a) => (
            <button key={a} className={`${s.audience} ${aud === a ? s.audOn : ''}`} onClick={() => setAud(a)}>
              {a === 'all' ? 'Everyone' : a === 'going' ? COPY.going : COPY.maybe}
            </button>
          ))}
        </div>
        <button className={s.primary} disabled={!text.trim() || plan.blastsLeft <= 0} onClick={async () => {
          await api.post(`/plans/${plan.id}/blast`, { text, audience: aud === 'all' ? undefined : [aud] });
          setText('');
          onSent();
          onClose();
        }}>Send blast</button>
      </div>
    </Sheet>
  );
}
