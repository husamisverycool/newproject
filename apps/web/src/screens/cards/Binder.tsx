import { useNavigate } from 'react-router';
import { IconButton, TopBar } from '../../components/ui';

export default function Binder() {
  const nav = useNavigate();
  return (
    <div className="screen">
      <TopBar title="Binder" left={<IconButton icon="chevronLeft" label="Back" onClick={() => nav(-1)} />} />
    </div>
  );
}
