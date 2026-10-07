import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ios, locket } from '@app/shared';
import { api } from '../lib/api';
import { useAmbient } from '../lib/ambient';
import { fileToSquareJpeg } from '../lib/camera';
import { firstName } from '../lib/format';
import { haptic } from '../lib/feedback';
import { onRealtime } from '../lib/realtime';
import { queryClient } from '../lib/queries';
import type { Post, PublicUser } from '../lib/types';
import { Avatar, Spinner } from '../components/ios';
import { Icon } from '../components/Icon';
import { HistoryPost } from '../components/HistoryPost';
import s from './camera.module.css';
import b from './bestie.module.css';

interface Direct {
  id: string;
  groupId: string;
  direct: true;
  user: PublicUser | null;
  to: string;
  media: { main: string; thumb: string };
  caption: string | null;
  createdAt: number;
}
type Item = { kind: 'post'; at: number; post: Post } | { kind: 'direct'; at: number; direct: Direct };
interface Lane {
  user: PublicUser;
  /** the group the two share (photos sent from the lane go through it) */
  groupId: string;
  items: Item[];
}

/**
 * The one-to-one lane (spec §C) behind Locket's "Best Friend or Crush widget" [V-weak]: "shows photos
 * from only that person, and you can send images to just that person" [V]. Laid out as Locket's History
 * [I] (locket-07-history): photo-tinted background, the photo in the rounded square with its caption pill,
 * avatar · name · "36m" under it; the top-centre capsule names the friend (where History shows
 * "Everyone ⌄" [I]). Their group photos keep every History action; photos sent only to you or by you
 * show the same page without group actions. The small shutter sends them a photo (the system camera
 * sheet [HIG]), with "Add a message" [B-med] and the paper-plane send [I].
 */
export default function Bestie() {
  const { userId = '' } = useParams();
  const nav = useNavigate();
  const q = useQuery({ queryKey: ['bestie', userId], queryFn: () => api.get<Lane>(`/bestie/${userId}`), enabled: Boolean(userId) });
  const scroller = useRef<HTMLDivElement>(null);
  const capture = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(0);
  const [shot, setShot] = useState<{ blob: Blob; url: string } | null>(null);
  const items = q.data?.items ?? [];
  const current = items[page];
  const tint = useAmbient(current ? (current.kind === 'post' ? (current.post.blurred ? null : current.post.media.thumb ?? current.post.media.main) : current.direct.media.thumb) : null);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const on = () => setPage(Math.round(el.scrollTop / el.clientHeight));
    el.addEventListener('scroll', on, { passive: true });
    return () => el.removeEventListener('scroll', on);
  }, [q.data]);
  useEffect(() => onRealtime((e) => e.type === 'notification' && void queryClient.invalidateQueries({ queryKey: ['bestie', userId] })), [userId]);

  const friend = q.data?.user;
  const groupId = q.data?.groupId;

  return (
    <div className={s.root} data-dark style={tint ? ({ '--amb': tint } as CSSProperties) : undefined}>
      <div ref={scroller} className={s.pager}>
        {q.isLoading && (
          <section className={s.page}>
            <div className={b.center}>
              <Spinner />
            </div>
          </section>
        )}
        {items.map((it) => (
          <section key={it.kind === 'post' ? it.post.id : it.direct.id} className={s.page}>
            {it.kind === 'post' ? (
              <HistoryPost post={it.post} onCamera={() => capture.current?.click()} onGrid={() => scroller.current?.scrollTo({ top: 0, behavior: 'smooth' })} />
            ) : (
              <DirectPage d={it.direct} onCamera={() => capture.current?.click()} />
            )}
          </section>
        ))}
        {!q.isLoading && items.length === 0 && friend && (
          <section className={s.page}>
            <div className={s.emptyHistory}>
              <Avatar user={friend} size={96} />
              <p>{locket.historyHint}</p>
              <button className={s.shutterSmall} onClick={() => capture.current?.click()} aria-label={ios.axShutter} />
            </div>
          </section>
        )}
      </div>

      <div className={s.top}>
        <button className={s.corner} onClick={() => nav(-1)} aria-label={ios.back}>
          <Icon name="chevronLeft" size={22} strokeWidth={2.6} />
        </button>
        {friend && (
          <span className={s.pill}>
            <Avatar user={friend} size={24} />
            {firstName(friend.name)}
          </span>
        )}
        <span className={b.spacer} />
      </div>

      <input
        ref={capture}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (!f) return;
          const blob = await fileToSquareJpeg(f);
          setShot({ blob, url: URL.createObjectURL(blob) });
        }}
      />
      {shot && friend && groupId && <SendReview shot={shot} friend={friend} groupId={groupId} onDone={() => { setShot(null); void q.refetch(); scroller.current?.scrollTo({ top: 0 }); }} onCancel={() => setShot(null)} />}
    </div>
  );
}

/** A photo sent only between the two of you: the History page without group actions [I]. */
function DirectPage({ d, onCamera }: { d: Direct; onCamera: () => void }) {
  return (
    <div className={s.historyPage}>
      <div className={s.topSpace} />
      <div className={s.viewfinder}>
        <img src={d.media.main} className={s.media} alt="" draggable={false} />
        {d.caption && <div className={s.captionPill}>{d.caption}</div>}
      </div>
      <div className={s.byline}>
        <Avatar user={d.user} size={24} />
        <span className={s.bylineName}>{d.user ? firstName(d.user.name) : ''}</span>
        <span className={s.bylineTime}>{locket.ago(Date.now() - d.createdAt)}</span>
      </div>
      <div className={s.historyBar}>
        <span className={s.barBtn} />
        <button className={s.shutterSmall} onClick={onCamera} aria-label={ios.axShutter} />
        <span className={s.barBtn} />
      </div>
    </div>
  );
}

/** Locket's capture review [I] for one person: "Send to" + the friend's name, the caption pill, ✕ · send. */
function SendReview({ shot, friend, groupId, onDone, onCancel }: { shot: { blob: Blob; url: string }; friend: PublicUser; groupId: string; onDone: () => void; onCancel: () => void }) {
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const send = async () => {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set('main', shot.blob, 'photo.jpg');
      fd.set('groupId', groupId);
      fd.set('caption', caption);
      await api.post(`/bestie/${friend.id}/photos`, fd);
      haptic('success');
      setSent(true);
      window.setTimeout(onDone, 700);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className={b.review}>
      <div className={s.topSpace} />
      <div className={s.sendTo}>
        <span>{locket.sendTo}</span>
        <strong>{firstName(friend.name)}</strong>
      </div>
      <div className={s.viewfinder}>
        <img src={shot.url} className={s.media} alt="" />
        <input className={s.captionInput} placeholder={locket.addAMessage} value={caption} onChange={(e) => setCaption(e.target.value.slice(0, 50))} />
      </div>
      <div className={b.controls}>
        <button className={s.side} onClick={onCancel} aria-label={ios.cancel}>
          <Icon name="close" size={30} strokeWidth={2.4} />
        </button>
        <button className={s.sendBtn} disabled={busy} onClick={() => void send()} aria-label={locket.sendTo}>
          {sent ? <Icon name="check" size={30} strokeWidth={2.6} /> : busy ? <Spinner size={26} /> : <Icon name="paperplane" size={28} strokeWidth={2.2} />}
        </button>
        <span className={s.side} />
      </div>
    </div>
  );
}
