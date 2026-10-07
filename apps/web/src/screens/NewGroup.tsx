import { useState } from 'react';
import { useNavigate } from 'react-router';
import { MASCOT_SPECIES } from '@app/shared';
import { api } from '../lib/api';
import { queryClient } from '../lib/queries';
import { useUi } from '../lib/store';
import { haptic } from '../lib/feedback';
import { dayName } from '../lib/format';
import { IconButton, PillButton, TopBar } from '../components/ui';
import { Mascot } from '../components/Mascot';
import s from './onboarding.module.css';

/** "Different groups, different energy" (Yope): unlimited groups, each with its own mascot and roll day. */
export default function NewGroup() {
  const nav = useNavigate();
  const setActive = useUi((st) => st.setActiveGroup);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📸');
  const [species, setSpecies] = useState('bun');
  const [mascotName, setMascotName] = useState('Bun');
  const [day, setDay] = useState(0);
  const [busy, setBusy] = useState(false);
  return (
    <div className="screen">
      <TopBar title="New group" left={<IconButton icon="close" label="Close" onClick={() => nav(-1)} />} />
      <div className="screen-body scroll" style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column' }}>
        <div className={s.mascotPick}>
          <Mascot species={species} level={1} size={140} />
          <div className={s.speciesRow}>
            {MASCOT_SPECIES.map((sp) => (
              <button key={sp.id} className={`${s.species} ${species === sp.id ? s.speciesOn : ''}`} onClick={() => { setSpecies(sp.id); setMascotName(sp.name); haptic('light'); }} style={{ background: sp.body }} aria-label={sp.name} />
            ))}
          </div>
        </div>
        <div className={s.fields}>
          <div className="hstack gap8">
            <input className={s.emojiField} value={emoji} onChange={(e) => setEmoji([...e.target.value].slice(-1).join('') || '📸')} aria-label="Group emoji" />
            <input className={s.bigField} placeholder="Group name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <input className="field" placeholder="Mascot name" value={mascotName} onChange={(e) => setMascotName(e.target.value)} />
          <div className={s.dayLabel}>Roll day — the week develops at 9pm</div>
          <div className={s.days}>
            {[0, 1, 2, 3, 4, 5, 6].map((d) => (
              <button key={d} className={day === d ? s.dayOn : ''} onClick={() => setDay(d)}>
                {dayName(d).slice(0, 2)}
              </button>
            ))}
          </div>
          <p className="t-cap" style={{ margin: 0 }}>Groups hold up to 30 people. 5–15 is the sweet spot.</p>
        </div>
        <div className={s.cta}>
          <PillButton disabled={!name.trim() || busy} onClick={async () => {
            setBusy(true);
            const r = await api.post<{ group: { id: string } }>('/groups', { name: name.trim(), emoji, species, mascotName, ritualDay: day, developHour: 21, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
            setActive(r.group.id);
            await queryClient.invalidateQueries({ queryKey: ['me'] });
            nav(`/g/${r.group.id}/settings?invite=1`, { replace: true });
          }}>Create group</PillButton>
        </div>
      </div>
    </div>
  );
}
