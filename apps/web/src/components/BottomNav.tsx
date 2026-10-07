import { useNavigate } from 'react-router';
import { Icon } from './Icon';
import { haptic } from '../lib/feedback';
import s from './bottomnav.module.css';

/** Retro's bottom navigation, with Rewind as the prominent middle tab (research/02 §B3). */
export function BottomNav({ active, groupId }: { active: 'journal' | 'rewind' | 'cards'; groupId: string }) {
  const nav = useNavigate();
  const go = (to: string) => {
    haptic('light');
    nav(to);
  };
  return (
    <nav className={s.nav}>
      <button className={active === 'journal' ? s.on : ''} onClick={() => go('/journal')}>
        <Icon name="film" size={24} />
        <span>Journal</span>
      </button>
      <button className={`${s.mid} ${active === 'rewind' ? s.midOn : ''}`} onClick={() => go('/rewind')} aria-label="Rewind">
        <Icon name="rewind" size={26} />
      </button>
      <button className={active === 'cards' ? s.on : ''} onClick={() => go(`/g/${groupId}/cards`)}>
        <Icon name="cards" size={24} />
        <span>Cards</span>
      </button>
    </nav>
  );
}
