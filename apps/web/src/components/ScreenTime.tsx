import { useEffect, useState } from 'react';
import { BRAND, instagram, ios } from '@app/shared';
import { useMe } from '../lib/queries';
import { Alert } from './ios';

/**
 * Teen time limits (spec §S, from Instagram's Teen Accounts: time in Instants "counts toward Instagram
 * daily limits" [V]). For members under 18 the app counts the minutes it is on screen today and, past
 * their "Daily limit" (60 minutes by default [B-high]), shows Screen Time's limit alert — "Time Limit",
 * "You've reached your limit on …" [HIG/B-high] — again every 15 minutes while they stay. The count is
 * kept on the device.
 */
const TICK_S = 15;
const SNOOZE_MS = 15 * 60_000;
const key = () => {
  const d = new Date();
  return `roll.screenTime.${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};
const read = () => {
  try {
    return Number(localStorage.getItem(key()) ?? '0') || 0;
  } catch {
    return 0;
  }
};
const write = (s: number) => {
  try {
    localStorage.setItem(key(), String(s));
  } catch {
    /* private mode: counted in memory only */
  }
};

export function ScreenTime() {
  const me = useMe();
  const minor = Boolean(me.data?.user.minor);
  const limitMin = me.data?.user.settings.teenTimeLimitMin ?? instagram.teenDefaultMin;
  const [used, setUsed] = useState(read);
  const [snooze, setSnooze] = useState(0);
  useEffect(() => {
    if (!minor) return;
    const t = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      const next = read() + TICK_S;
      write(next);
      setUsed(next);
    }, TICK_S * 1000);
    return () => clearInterval(t);
  }, [minor]);
  const over = minor && used >= limitMin * 60 && Date.now() > snooze;
  const dismiss = () => setSnooze(Date.now() + SNOOZE_MS);
  return <Alert open={over} title={ios.timeLimit} message={ios.reachedLimit(BRAND.name)} onDismiss={dismiss} actions={[{ label: ios.ok, preferred: true, onClick: dismiss }]} />;
}
