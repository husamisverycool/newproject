import { useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router';
import { tcg } from '@app/shared';
import { Avatar, Sheet } from '../../components/ios';
import { Icon } from '../../components/Icon';
import { TcgCard } from '../../components/cards/TcgCard';
import { CollectibleSheet } from '../../components/cards/CardSheets';
import { useBinder, useSocial } from '../../lib/queries';
import { haptic } from '../../lib/feedback';
import type { ShowcaseT } from '../../lib/types';
import { BinderCover, DisplayBoard } from './MyCards';
import t from './tcg.module.css';

/**
 * Social Hub (TCG Pocket): menu options in order ① "Community Showcase" ② "Friends" ③ "Trade" [V-weak].
 * Friends show the numbered card they wear as their badge in the group (Telegram "Wear") [V].
 */
export function SocialTab({ groupId }: { groupId: string; onBack?: () => void }) {
  const nav = useNavigate();
  const social = useSocial(groupId);
  const binder = useBinder(groupId);
  const [section, setSection] = useState<'showcase' | 'friends'>('showcase');
  const [binderOpen, setBinderOpen] = useState<ShowcaseT | null>(null);
  const [badge, setBadge] = useState<string | null>(null);
  const showcases = social.data?.showcases ?? [];

  return (
    <>
      <div style={{ flex: 'none', height: 'calc(var(--safe-top) + 46px)' }} />
      <div className={t.scroll}>
        <div className={t.hubMenu}>
          <button className={`${t.panel} ${t.hubBtn}`} aria-pressed={section === 'showcase'} onClick={() => { haptic('light'); setSection('showcase'); }}>
            <Icon name="photos" size={26} color="var(--tcg-teal)" />
            {tcg.communityShowcase}
          </button>
          <button className={`${t.panel} ${t.hubBtn}`} aria-pressed={section === 'friends'} onClick={() => { haptic('light'); setSection('friends'); }}>
            <Icon name="people" size={26} color="var(--tcg-teal)" />
            {tcg.friends}
          </button>
          <button className={`${t.panel} ${t.hubBtn}`} onClick={() => { haptic('light'); nav(`/g/${groupId}/trades`); }}>
            <Icon name="trade" size={26} color="var(--tcg-teal)" />
            {tcg.trade}
          </button>
        </div>

        {section === 'showcase' && (
          <div style={{ display: 'grid', gap: 12, padding: '0 var(--margin)' }}>
            {showcases.filter((x) => x.kind === 'display').map((d) => (
              <DisplayBoard key={d.id} showcase={d} />
            ))}
            {showcases.filter((x) => x.kind === 'binder').map((b) => (
              <button key={b.id} onClick={() => setBinderOpen(b)} style={{ textAlign: 'left' }}>
                <BinderCover showcase={b} slots={binder.data?.binderSlots ?? 30} />
              </button>
            ))}
          </div>
        )}

        {section === 'friends' && (
          <div className={t.panel} style={{ margin: '0 var(--margin)' }}>
            {(social.data?.friends ?? []).map((f) => (
              <div key={f.user.id} className={t.friendRow}>
                <Avatar user={f.user} size={44} />
                <span className={t.friendName}>
                  {f.user.name}
                  <small>{tcg.collectionCounter(f.unique, f.total)}</small>
                </span>
                {f.badge && (
                  <button className={t.badgeMini} onClick={() => setBadge(f.badge!.id)} aria-label={f.badge.serial ? `#${f.badge.serial}` : undefined}>
                    <TcgCard card={f.badge} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Sheet open={Boolean(binderOpen)} onClose={() => setBinderOpen(null)} light height="92%">
        {binderOpen && (
          <>
            <BinderCover showcase={binderOpen} slots={binder.data?.binderSlots ?? 30} />
            <div className={t.grid} style={{ '--cols': 3, padding: '14px 0 0' } as CSSProperties}>
              {binderOpen.cards.map((c) => (
                <div key={c.id} className={t.gridItem}>
                  <TcgCard card={c} />
                </div>
              ))}
            </div>
          </>
        )}
      </Sheet>
      <CollectibleSheet open={Boolean(badge)} onClose={() => setBadge(null)} groupId={groupId} cardId={badge} dust={binder.data?.shinedust ?? 0} />
    </>
  );
}
