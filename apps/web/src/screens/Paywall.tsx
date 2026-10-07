import { useNavigate } from 'react-router';
import { IconButton, TopBar } from '../components/ui';

export default function Paywall() {
  const nav = useNavigate();
  return (
    <div className="screen">
      <TopBar title="Paywall" left={<IconButton icon="chevronLeft" label="Back" onClick={() => nav(-1)} />} />
    </div>
  );
}
