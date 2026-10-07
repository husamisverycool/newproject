import { useEffect, useState } from 'react';
import { ios } from '@app/shared';
import s from './live.module.css';

/**
 * Inside Claude, a friend the app is shared with as a Viewer can look but not change anything: the
 * shared store refuses their writes. Say so the way iCloud sharing does ("View only") [B-high], in a
 * system-style pill at the top of the screen.
 */
export function LiveBanner() {
  const [readOnly, setReadOnly] = useState(false);
  useEffect(() => {
    let off = () => {};
    void import('./engine').then(async ({ engine }) => {
      const e = await engine();
      setReadOnly(e.readOnly);
      off = e.onReadOnly(() => setReadOnly(true));
    });
    return () => off();
  }, []);
  if (!readOnly) return null;
  return <div className={s.pill}>{ios.viewOnly}</div>;
}
