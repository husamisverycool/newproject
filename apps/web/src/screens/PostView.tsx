import { useNavigate, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Post } from '../lib/types';
import { HistoryPage } from '../components/HistoryPage';
import { IconButton, Spinner } from '../components/ui';

export default function PostView() {
  const { postId } = useParams();
  const nav = useNavigate();
  const q = useQuery({ queryKey: ['post', postId], queryFn: () => api.get<{ post: Post }>(`/posts/${postId}`) });
  return (
    <div className="screen" style={{ paddingTop: 'var(--safe-top)', paddingBottom: 'var(--safe-bottom)' }}>
      <div style={{ position: 'absolute', top: 'calc(var(--safe-top) + 6px)', left: 12, zIndex: 5 }}>
        <IconButton icon="chevronLeft" label="Back" onClick={() => nav(-1)} />
      </div>
      {q.data ? <HistoryPage post={q.data.post} onCamera={() => nav('/')} onGrid={() => nav('/journal')} groupName="" /> : <div style={{ margin: 'auto' }}><Spinner /></div>}
    </div>
  );
}
