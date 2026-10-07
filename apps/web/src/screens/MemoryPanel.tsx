import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { characterai, ios } from '@app/shared';
import { Avatar, BarButton, Menu, NavBar, Row, Screen, Section, Spinner, type MenuAction } from '../components/ios';
import { Icon } from '../components/Icon';
import { Mascot } from '../components/Mascot';
import { api } from '../lib/api';
import { queryClient, useGroup } from '../lib/queries';
import { haptic } from '../lib/feedback';
import { firstName } from '../lib/format';
import type { PublicUser } from '../lib/types';
import s from './memory.module.css';

interface StoryItem {
  id: string;
  text: string;
  sourcePostId: string | null;
  addedBy: PublicUser | null;
  createdAt: number;
  /** Among the newest `cap` lines, i.e. what the game master currently reads. */
  inUse: boolean;
}
interface Fact {
  id: string;
  title: string;
  winners: PublicUser[];
}
interface MemoryView {
  mascot: string;
  cap: number;
  story: StoryItem[];
  facts: Fact[];
}

/**
 * What the game master remembers (spec §K), laid out like Character.ai's memory UI after May 21, 2026
 * (research/16 §4): "Story Memory" (background members write, pin in chat, or mark to remember on a
 * photo), "Facts" (recorded automatically: last game's results), "Memory Usage" (what fills memory now;
 * up to 15 pins per chat [V-weak]), and "Pin", which locks a fact's exact wording into Story Memory.
 * Every line can be deleted (spec §K). Visuals are stock iOS (memory.module.css).
 */
export default function MemoryPanel() {
  const { groupId = '' } = useParams();
  const nav = useNavigate();
  const g = useGroup(groupId);
  const q = useQuery({ queryKey: ['memory', groupId], queryFn: () => api.get<MemoryView>(`/groups/${groupId}/memory`), enabled: Boolean(groupId) });
  const [text, setText] = useState('');
  const [menu, setMenu] = useState<MenuAction[] | null>(null);
  const mascot = g.data?.group.mascot;
  const data = q.data;
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['memory', groupId] });

  const add = async () => {
    if (!text.trim()) return;
    haptic('light');
    await api.post(`/groups/${groupId}/memory`, { text: text.trim() }).catch(() => undefined);
    setText('');
    void refresh();
  };
  const remove = async (id: string) => {
    haptic('medium');
    await api.del(`/groups/${groupId}/memory/${encodeURIComponent(id)}`).catch(() => undefined);
    void refresh();
  };
  const pin = async (id: string) => {
    haptic('success');
    await api.post(`/groups/${groupId}/memory/${encodeURIComponent(id)}/pin`, {}).catch(() => undefined);
    void refresh();
  };

  const storyInUse = data?.story.filter((m) => m.inUse).length ?? 0;
  const facts = data?.facts.length ?? 0;
  const cap = data?.cap ?? characterai.maxPins;
  const total = cap * 2;

  return (
    <Screen grouped>
      <NavBar onBack={() => nav(-1)} title={characterai.memory} />
      <div className={s.scroll}>
        {mascot && (
          <div className={s.head}>
            <Mascot species={mascot.species} level={mascot.stage.level} outfit={mascot.outfit} size={76} />
            <span className={s.headName}>{mascot.name}</span>
          </div>
        )}
        {!data && (
          <div className={s.head}>
            <Spinner />
          </div>
        )}

        {data && (
          <>
            <Section header={characterai.storyMemory}>
              {data.story.map((m) => (
                <Row
                  key={m.id}
                  icon={m.sourcePostId ? <Icon name="photo" size={18} /> : undefined}
                  iconBg={m.sourcePostId ? 'var(--sys-blue)' : undefined}
                  title={<span className={`${s.text} ${m.inUse ? '' : s.out}`}>{m.text}</span>}
                  sub={
                    m.addedBy ? (
                      <span className={s.by}>
                        <Avatar user={m.addedBy} size={16} />
                        {firstName(m.addedBy.name)}
                      </span>
                    ) : undefined
                  }
                  onClick={() =>
                    setMenu([
                      ...(m.sourcePostId ? [{ label: ios.open, icon: 'photo', onClick: () => nav(`/p/${m.sourcePostId}`) }] : []),
                      { label: ios.delete, icon: 'trash', destructive: true, onClick: () => void remove(m.id) },
                    ])
                  }
                  chevron={false}
                />
              ))}
              <div className={s.add}>
                <textarea className="ios-field" rows={1} value={text} maxLength={200} onChange={(e) => setText(e.target.value)} aria-label={characterai.storyMemory} />
                <BarButton bold onClick={add} disabled={!text.trim()}>
                  {ios.save}
                </BarButton>
              </div>
            </Section>

            {data.facts.length > 0 && (
              <Section header={characterai.facts}>
                {data.facts.map((f) => (
                  <Row
                    key={f.id}
                    title={<span className={s.text}>{f.title}</span>}
                    value={f.winners.map((w) => firstName(w.name)).join(', ')}
                    onClick={() =>
                      setMenu([
                        { label: characterai.pin, icon: 'pin', onClick: () => void pin(f.id) },
                        { label: ios.delete, icon: 'trash', destructive: true, onClick: () => void remove(f.id) },
                      ])
                    }
                    chevron={false}
                  />
                ))}
              </Section>
            )}

            <Section header={characterai.memoryUsage}>
              <div className={s.usage}>
                <span className={s.usageLine}>{ios.ofUsed(storyInUse + facts, total)}</span>
                <div className={s.bar}>
                  <span className={s.story} style={{ width: `${(storyInUse / total) * 100}%` }} />
                  <span className={s.facts} style={{ width: `${(facts / total) * 100}%` }} />
                </div>
                <div className={s.legend}>
                  <span>
                    <i className={s.story} />
                    {characterai.storyMemory}
                  </span>
                  <span>
                    <i className={s.facts} />
                    {characterai.facts}
                  </span>
                </div>
              </div>
              <Row title={characterai.storyMemory} value={ios.ofUsed(storyInUse, cap)} />
              <Row title={characterai.facts} value={ios.ofUsed(facts, cap)} />
            </Section>
          </>
        )}
      </div>
      <Menu open={Boolean(menu)} onClose={() => setMenu(null)} actions={menu ?? []} />
    </Screen>
  );
}
