import { useNavigate } from 'react-router';
import { useQueries } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useMe } from '../lib/queries';
import { firstName, timeAgo } from '../lib/format';
import type { Message } from '../lib/types';
import { Icon } from '../components/Icon';
import { IconButton, TopBar } from '../components/ui';
import { Mascot } from '../components/Mascot';
import s from './chat.module.css';

/** Yope's built-in photo chats, one per group ("different groups, different energy"). */
export default function ChatList() {
  const nav = useNavigate();
  const me = useMe();
  const groups = me.data?.groups ?? [];
  const msgs = useQueries({ queries: groups.map((g) => ({ queryKey: ['messages', g.id], queryFn: () => api.get<{ messages: Message[] }>(`/groups/${g.id}/messages`) })) });
  return (
    <div className="screen">
      <TopBar title="Chats" left={<IconButton icon="chevronLeft" label="Back" onClick={() => nav('/')} />} right={<IconButton icon="plus" label="New group" onClick={() => nav('/new-group')} />} />
      <div className="screen-body scroll">
        {groups.map((g, i) => {
          const last = msgs[i].data?.messages.at(-1);
          const preview = last ? (last.kind === 'gm' ? `${g.mascot.name}: ${last.body}` : last.kind === 'system' ? last.body : last.kind === 'plan' ? `📅 ${last.body}` : last.kind === 'photo' ? '📷 Photo' : last.kind === 'voice' ? '🎙️ Voice message' : last.kind === 'sticker' ? 'Sticker' : `${last.user ? firstName(last.user.name) : ''}: ${last.body}`) : 'Say hi';
          return (
            <button key={g.id} className={s.listRow} onClick={() => nav(`/chat/${g.id}`)}>
              <span className={s.listAvatar}>
                <span className={s.listEmoji}>{g.emoji}</span>
                <span className={s.listMascot}>
                  <Mascot species={g.mascot.species} level={g.mascot.stage.level} size={26} idle={false} />
                </span>
              </span>
              <span className="grow">
                <span className={s.listTop}>
                  <span className={s.listName}>{g.name}</span>
                  <span className={s.listTime}>{last ? timeAgo(last.createdAt) : ''}</span>
                </span>
                <span className={s.listPreview}>{preview}</span>
              </span>
              {g.unread > 0 && <span className={s.unreadDot} />}
            </button>
          );
        })}
        <button className={s.listRow} onClick={() => nav('/new-group')}>
          <span className={s.listAvatar} style={{ background: 'var(--g2)' }}>
            <Icon name="plus" size={22} />
          </span>
          <span className={s.listName}>New group</span>
        </button>
      </div>
    </div>
  );
}
