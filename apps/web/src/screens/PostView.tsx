import type { CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ios } from '@app/shared';
import { api } from '../lib/api';
import { useAmbient } from '../lib/ambient';
import type { Post } from '../lib/types';
import { HistoryPost } from '../components/HistoryPost';
import { Icon } from '../components/Icon';
import { Spinner } from '../components/ios';
import s from './camera.module.css';

/**
 * One photo on its own (from a chat reply, the journal, a push) — the same Locket History page
 * [I] (locket-07-history) on the photo-tinted background, with a ‹ in the top-left glass circle
 * where the avatar sits on the camera.
 */
export default function PostView() {
  const { postId } = useParams();
  const nav = useNavigate();
  const q = useQuery({ queryKey: ['post', postId], queryFn: () => api.get<{ post: Post }>(`/posts/${postId}`) });
  const p = q.data?.post;
  const ambient = useAmbient(p && !p.blurred ? p.media.thumb ?? p.media.main : null);
  return (
    <div className={s.root} data-dark style={ambient ? ({ '--amb': ambient } as CSSProperties) : undefined}>
      <div className={s.top}>
        <button className={s.corner} onClick={() => nav(-1)} aria-label={ios.back}>
          <Icon name="chevronLeft" size={22} strokeWidth={2.6} />
        </button>
      </div>
      <div className={s.single}>
        {p ? <HistoryPost post={p} onCamera={() => nav('/')} onGrid={() => nav('/journal')} /> : <Spinner size={28} />}
      </div>
    </div>
  );
}
