import { useLocation, useNavigate } from 'react-router';
import { imessage, ios, spec } from '@app/shared';
import { useActiveGroup, useMe } from '../lib/queries';
import { haptic } from '../lib/feedback';
import { Avatar } from './ios';
import s from './apptabs.module.css';

/**
 * The app's tab bar is Yope's [I] (research/inspo/store/yope-01): a floating dark capsule with five
 * filled glyphs and no labels — chat bubbles, stacked cards, camera, archive box, your photo. The
 * selected glyph is white in a lighter circle; the rest are gray. Mapped to our sections: Chat,
 * Friend Cards, Camera (spec §D "open to the camera"), the journal (Retro's weekly journal, spec §E
 * "chat and wall as separate tabs") and your profile. Labels are for VoiceOver only.
 */
export function AppTabs() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const me = useMe();
  const { group } = useActiveGroup();
  const gid = group?.id;
  const tabs = [
    { id: 'chat', icon: 'chats', label: imessage.title, to: '/chats', match: (p: string) => p.startsWith('/chat') },
    { id: 'cards', icon: 'cardStack', label: spec.friendCards, to: gid ? `/g/${gid}/cards` : '/', match: (p: string) => /\/cards|\/pack|\/trades|\/wonder|\/shop/.test(p) },
    { id: 'camera', icon: 'camera', label: ios.axShutter, to: '/', match: (p: string) => p === '/' },
    { id: 'journal', icon: 'archive', label: spec.journal, to: '/journal', match: (p: string) => p.startsWith('/journal') || p.startsWith('/rewind') || /\/week\//.test(p) },
  ];
  const onProfile = pathname.startsWith('/me');
  return (
    <nav className={s.bar}>
      {tabs.map((t) => {
        const on = t.match(pathname);
        return (
          <button key={t.id} className={`${s.tab} ${on ? s.on : ''}`} aria-label={t.label} aria-current={on ? 'page' : undefined} onClick={() => { haptic('light'); nav(t.to); }}>
            <TabGlyph name={t.icon} />
          </button>
        );
      })}
      <button className={`${s.tab} ${onProfile ? s.on : ''}`} aria-label={ios.settings} onClick={() => { haptic('light'); nav('/me'); }}>
        <Avatar user={me.data?.user} size={36} />
      </button>
    </nav>
  );
}

/** Yope's filled tab glyphs [I] (yope-01), drawn at 28 pt; overlaps are cut with the capsule color. */
function TabGlyph({ name }: { name: string }) {
  const cut = 'rgb(44, 44, 46)';
  return (
    <svg width={28} height={28} viewBox="0 0 28 28" fill="currentColor" aria-hidden>
      {name === 'chats' && (
        <>
          <path d="M11.5 3.5c-5 0-9 3.4-9 7.6 0 2.3 1.2 4.3 3 5.7l-.9 3.4 3.9-2c1 .3 2 .4 3 .4 5 0 9-3.4 9-7.5s-4-7.6-9-7.6Z" />
          <path d="M18.8 11.2c-3.8 0-6.8 2.6-6.8 5.8s3 5.8 6.8 5.8c.8 0 1.5-.1 2.2-.3l3 1.5-.7-2.6c1.4-1.1 2.3-2.6 2.3-4.4 0-3.2-3-5.8-6.8-5.8Z" stroke={cut} strokeWidth={2} />
        </>
      )}
      {name === 'cardStack' && (
        <>
          <rect x="5" y="3.5" width="13" height="17" rx="3" transform="rotate(-10 11.5 12)" />
          <rect x="9.5" y="7.5" width="13.5" height="17.5" rx="3" stroke={cut} strokeWidth={2} />
        </>
      )}
      {name === 'camera' && <path fillRule="evenodd" d="M9.6 5.5h8.8l1.6 2.3h2.5A2.5 2.5 0 0 1 25 10.3v10.2a2.5 2.5 0 0 1-2.5 2.5h-17A2.5 2.5 0 0 1 3 20.5V10.3a2.5 2.5 0 0 1 2.5-2.5H8l1.6-2.3ZM14 19.8a4.4 4.4 0 1 0 0-8.8 4.4 4.4 0 0 0 0 8.8Z" />}
      {name === 'archive' && (
        <>
          <rect x="4" y="4.5" width="20" height="5" rx="1.6" />
          <path fillRule="evenodd" d="M5.5 11h17v11a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V11Zm5 3.5a1 1 0 0 0 0 2h7a1 1 0 0 0 0-2h-7Z" />
        </>
      )}
    </svg>
  );
}
