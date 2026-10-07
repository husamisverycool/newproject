import { useNavigate } from 'react-router';
import { IconButton, TopBar } from '../components/ui';

export default function Likeness() {
  const nav = useNavigate();
  return (
    <div className="screen">
      <TopBar title="Likeness" left={<IconButton icon="chevronLeft" label="Back" onClick={() => nav(-1)} />} />
    </div>
  );
}
