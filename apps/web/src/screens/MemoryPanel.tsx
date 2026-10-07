import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { queryClient, useGroup } from '../lib/queries';
import { haptic } from '../lib/feedback';
import { firstName, timeAgo } from '../lib/format';
import type { PublicUser } from '../lib/types';
import { Icon } from '../components/Icon';
import { Avatar, Empty, IconButton, TopBar } from '../components/ui';
import { Mascot } from '../components/Mascot';

interface Item {
  id: string;
  text: string;
  sourcePostId: string | null;
  addedBy: PublicUser | null;
  createdAt: number;
}

/** Character.ai chat memories: a free-text note capped at 400 characters. [B] */
const MAX = 400;

/**
 * What the mascot remembers (spec §K), shaped like Character.ai's memory panel: a "Memory" text box
 * plus a list of pinned items, each deletable. The mascot only knows what is listed here: things
 * pinned with 📌 in chat, photos marked "remember", and notes added on this screen.
 */
export default function MemoryPanel() {
  const { groupId = '' } = useParams();
  const nav = useNavigate();
  const g = useGroup(groupId);
  const q = useQuery({ queryKey: ['memory', groupId], queryFn: () => api.get<{ items: Item[]; mascot: string }>(`/groups/${groupId}/memory`) });
  const [text, setText] = useState('');
  const mascot = g.data?.group.mascot;
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['memory', groupId] });

  const add = async () => {
    if (!text.trim()) return;
    haptic('light');
    await api.post(`/groups/${groupId}/memory`, { text: text.trim() });
    setText('');
    void refresh();
  };
  const remove = async (id: string) => {
    haptic('medium');
    await api.del(`/groups/${groupId}/memory/${id}`);
    void refresh();
  };

  return (
    <div className="screen">
      <TopBar title="Memory" sub={q.data?.mascot} left={<IconButton icon="chevronLeft" label="Back" onClick={() => nav(-1)} />} />
      <div className="screen-body scroll" style={{ padding: '6px var(--margin) 40px' }}>
        {mascot && (
          <div className="stack" style={{ alignItems: 'center', gap: 6, margin: '6px 0 18px' }}>
            <Mascot species={mascot.species} level={mascot.stage.level} outfit={mascot.outfit} size={84} mood="happy" />
            <div className="t-sub" style={{ textAlign: 'center', maxWidth: 290 }}>
              {mascot.name} only remembers what’s on this list. Anyone in the group can add or delete a memory.
            </div>
          </div>
        )}

        <div className="section-head" style={{ padding: '0 4px 8px' }}>
          <span>Memory</span>
        </div>
        <div style={{ position: 'relative' }}>
          <textarea
            className="field"
            style={{ height: 110, padding: '12px 14px 26px', resize: 'none', lineHeight: '21px' }}
            placeholder={`Something ${mascot?.name ?? 'the mascot'} should remember — “Ines is training for the half marathon”`}
            value={text}
            maxLength={MAX}
            onChange={(e) => setText(e.target.value)}
          />
          <span className="t-cap" style={{ position: 'absolute', right: 12, bottom: 10, color: 'var(--text-3)' }}>
            {text.length}/{MAX}
          </span>
        </div>
        <button className="pill pill-white" style={{ width: '100%', marginTop: 10, height: 46 }} disabled={!text.trim()} onClick={add}>
          Save
        </button>

        <div className="section-head" style={{ padding: '26px 4px 8px' }}>
          <span>Pinned</span>
          <span>{q.data?.items.length ?? 0}</span>
        </div>
        {q.data && q.data.items.length === 0 && (
          <Empty icon={<Icon name="pin" size={30} color="var(--wolf)" />} title="Nothing pinned yet" body="Long-press a message and pin it with 📌, or mark a photo “remember”." />
        )}
        <div className="stack gap8">
          {q.data?.items.map((m) => (
            <div key={m.id} className="hstack gap12" style={{ alignItems: 'flex-start', padding: '12px 12px 12px 14px', borderRadius: 'var(--r-card)', background: 'var(--surface)' }}>
              <div className="grow">
                <div style={{ font: 'var(--t-subhead)' }}>{m.text}</div>
                <div className="hstack gap4 t-cap" style={{ marginTop: 6, color: 'var(--text-3)' }}>
                  {m.addedBy && <Avatar user={m.addedBy} size={16} />}
                  {m.addedBy ? firstName(m.addedBy.name) : 'Someone'} · {m.sourcePostId ? 'from a photo' : 'pinned'} · {timeAgo(m.createdAt)}
                  {m.sourcePostId && (
                    <button style={{ color: 'var(--blue)', marginLeft: 4 }} onClick={() => nav(`/p/${m.sourcePostId}`)}>
                      View
                    </button>
                  )}
                </div>
              </div>
              <IconButton icon="trash" label="Delete memory" onClick={() => remove(m.id)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
