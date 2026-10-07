import { useNavigate } from 'react-router';
import { useQueries } from '@tanstack/react-query';
import { imessage, ios, locket } from '@app/shared';
import { api } from '../lib/api';
import { useMe } from '../lib/queries';
import { firstName } from '../lib/format';
import type { Message } from '../lib/types';
import { Icon } from '../components/Icon';
import { Mascot } from '../components/Mascot';
import { AppTabs } from '../components/AppTabs';
import s from './chat.module.css';

/**
 * One row per group. No INSPO image shows a chat list, so this is the iOS Messages list [HIG] in
 * Yope's chat colors [I] (yope-04): face, name, time, one-line preview, an unread dot in Yope lime.
 */
export default function ChatList() {
  const nav = useNavigate();
  const me = useMe();
  const groups = me.data?.groups ?? [];
  const msgs = useQueries({ queries: groups.map((g) => ({ queryKey: ['messages', g.id], queryFn: () => api.get<{ messages: Message[] }>(`/groups/${g.id}/messages`) })) });
  const preview = (m: Message | undefined, mascotName: string) => {
    if (!m) return '';
    const who = m.kind === 'gm' ? mascotName : m.user ? firstName(m.user.name) : '';
    const body = m.kind === 'photo' ? imessage.previewPhoto : m.kind === 'voice' ? imessage.previewAudio : m.kind === 'sticker' ? imessage.previewSticker : m.body ?? '';
    return who && m.kind !== 'system' ? `${who}: ${body}` : body;
  };
  return (
    <div className={s.root}>
      <header className={s.header}>
        <button className={s.circle} onClick={() => nav('/')} aria-label={ios.back}>
          <Icon name="chevronLeft" size={22} strokeWidth={2.6} />
        </button>
      </header>
      <h1 className={s.listTitle}>{imessage.title}</h1>
      <div className={s.list}>
        {groups.map((g, i) => {
          const last = msgs[i]?.data?.messages.at(-1);
          return (
            <button key={g.id} className={s.listRow} onClick={() => nav(`/chat/${g.id}`)}>
              <span className={s.listFace}>
                {g.unread > 0 && <span className={s.unread} />}
                <Mascot species={g.mascot.species} level={g.mascot.stage.level} outfit={g.mascot.outfit} size={44} />
              </span>
              <span className={s.listText}>
                <span className={s.listTop}>
                  <span className={s.listName}>{g.name}</span>
                  <span className={s.listTime}>{last ? locket.ago(Date.now() - last.createdAt) : ''}</span>
                </span>
                <span className={s.listPreview}>{preview(last, g.mascot.name)}</span>
              </span>
            </button>
          );
        })}
      </div>
      <AppTabs />
    </div>
  );
}
