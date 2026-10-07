import { useEffect, useState } from 'react';
import { useMe } from '../../lib/queries';

/** The group's summary (mascot, ritual window) from /me. */
export function useGroupSummary(groupId: string | undefined) {
  const me = useMe();
  return { group: me.data?.groups.find((g) => g.id === groupId) ?? null, me };
}

/** A clock that re-renders every `ms` — for countdowns (stamina, Golden Blitz, pack timer). */
export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

/** Group a list into consecutive buckets by key, keeping order. */
export function groupBy<T>(list: T[], key: (t: T) => string) {
  const out: { key: string; items: T[] }[] = [];
  for (const item of list) {
    const k = key(item);
    const last = out[out.length - 1];
    if (last && last.key === k) last.items.push(item);
    else out.push({ key: k, items: [item] });
  }
  return out;
}
