import { useNavigate } from 'react-router';
import { ios, locket, pets } from '@app/shared';
import { Icon } from '../components/Icon';
import { GroupForm } from './Onboarding';
import s from './onboarding.module.css';

/** "Different groups, different energy" (Yope) — a new group is Widgetable's "Choose a pet, name it, invite a friend" (spec §C/§M). */
export default function NewGroup() {
  const nav = useNavigate();
  return (
    <div className={s.root} data-dark>
      <div className={s.step}>
        <div className={s.top}>
          <button className={s.back} onClick={() => nav(-1)} aria-label={ios.close}>
            <Icon name="close" size={24} strokeWidth={2.4} />
          </button>
        </div>
        <h1 className={s.title}>{pets.choosePet}</h1>
        <GroupForm submitLabel={locket.continue} onCreated={(id) => nav(`/g/${id}/settings?invite=1`, { replace: true })} />
      </div>
    </div>
  );
}
