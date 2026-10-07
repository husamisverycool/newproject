import { useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ios, retro } from '@app/shared';
import { api } from '../lib/api';
import { useActiveGroup } from '../lib/queries';
import { fileToSquareJpeg, photoTakenAt } from '../lib/camera';
import type { Post } from '../lib/types';
import { RewindDial, type DialItem } from '../components/RewindDial';
import { AppTabs } from '../components/AppTabs';
import { Icon } from '../components/Icon';
import { Spinner } from '../components/ios';
import s from './rewindtab.module.css';

const HIDDEN = 'rewind.hidden';

/**
 * The Rewind tab — Retro's [V] "new tab to time travel through the best memories from your camera
 * roll", laid out from research/inspo/store/retro-05-rewind [I] (see RewindDial). It holds the
 * group's photos from this week in past years first, then older ones ("photos from this time last year
 * and older" [V]). Camera-roll photos you add stay "private to you — unless you choose to share" [V]
 * (Send posts them to the group). Hide keeps a photo out of your Rewind.
 */
export default function Rewind() {
  const { group } = useActiveGroup();
  const q = useQuery({ queryKey: ['rewind', group?.id], queryFn: () => api.get<{ onThisWeek: Post[]; older: Post[] }>(`/groups/${group!.id}/rewind`), enabled: Boolean(group) });
  const [local, setLocal] = useState<(DialItem & { blob: Blob })[]>([]);
  const [hidden, setHidden] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(HIDDEN) ?? '[]') as string[]);
    } catch {
      return new Set();
    }
  });
  const input = useRef<HTMLInputElement>(null);
  const items = useMemo<DialItem[]>(() => {
    const posts = [...(q.data?.onThisWeek ?? []), ...(q.data?.older ?? [])];
    return [...local, ...posts.map((p) => ({ id: p.id, src: p.media.main, takenAt: p.takenAt }))].filter((x) => !hidden.has(x.id));
  }, [q.data, local, hidden]);

  const hide = (it: DialItem) => {
    const n = new Set(hidden).add(it.id);
    setHidden(n);
    try {
      localStorage.setItem(HIDDEN, JSON.stringify([...n]));
    } catch {
      /* private mode */
    }
  };
  const send = async (it: DialItem) => {
    const mine = local.find((l) => l.id === it.id);
    if (mine && group) {
      const fd = new FormData();
      fd.set('groupIds', group.id);
      fd.set('main', mine.blob, 'photo.jpg');
      fd.set('kind', 'rewind');
      fd.set('fromRoll', 'true');
      fd.set('takenAt', String(mine.takenAt));
      await api.post('/posts', fd);
      setLocal((l) => l.filter((x) => x.id !== it.id));
      void q.refetch();
    } else if (typeof navigator.share === 'function') {
      await navigator.share({ url: `${location.origin}/api/posts/${it.id}/export` }).catch(() => undefined);
    }
  };
  const addFromLibrary = async (files: FileList | null) => {
    if (!files) return;
    const added = await Promise.all(
      [...files].slice(0, 40).map(async (f, k) => {
        const blob = await fileToSquareJpeg(f);
        return { id: `local-${Date.now()}-${k}`, src: URL.createObjectURL(blob), takenAt: await photoTakenAt(f), blob };
      }),
    );
    setLocal((l) => [...added.sort((a, b) => b.takenAt - a.takenAt), ...l]);
  };

  return (
    <div className={s.root}>
      {q.isLoading ? (
        <div className={s.center}>
          <Spinner size={28} />
        </div>
      ) : items.length ? (
        <RewindDial items={items} onSend={send} onHide={hide} extraActions={[{ label: ios.photoLibrary, icon: 'photos', onClick: () => input.current?.click() }]} />
      ) : (
        <button className={s.empty} onClick={() => input.current?.click()}>
          <Icon name="photos" size={44} strokeWidth={1.6} />
          <b>{ios.photoLibrary}</b>
          <span>{retro.rewindWhatsNew}</span>
          <span className={s.private}>{retro.rewindPrivate}</span>
        </button>
      )}
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => void addFromLibrary(e.target.files)} />
      <AppTabs />
    </div>
  );
}
