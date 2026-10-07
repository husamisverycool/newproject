import { useNavigate } from 'react-router';
import { IconButton, TopBar } from '../components/ui';

export default function Rewind() {
  const nav = useNavigate();
  return (
    <div className="screen">
      <TopBar title="Rewind" left={<IconButton icon="chevronLeft" label="Back" onClick={() => nav(-1)} />} />
    </div>
  );
}
