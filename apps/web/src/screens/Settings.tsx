import { useNavigate } from 'react-router';
import { IconButton, TopBar } from '../components/ui';

export default function Settings() {
  const nav = useNavigate();
  return (
    <div className="screen">
      <TopBar title="Settings" left={<IconButton icon="chevronLeft" label="Back" onClick={() => nav(-1)} />} />
    </div>
  );
}
