/**
 * Group-local calendar math. Groups run on one ritual day per week (default Sunday,
 * Locket Rollcall). The week's roll "develops" (Lapse/Dispo) at `developHour` on that day.
 */

const DAY = 86_400_000;

export interface LocalParts {
  year: number;
  month: number; // 1–12
  day: number;
  hour: number;
  minute: number;
  weekday: number; // 0 = Sunday
}

const fmtCache = new Map<string, Intl.DateTimeFormat>();
function fmt(tz: string) {
  let f = fmtCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      weekday: 'short',
    });
    fmtCache.set(tz, f);
  }
  return f;
}

const WEEKDAYS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export function localParts(ts: number, tz: string): LocalParts {
  const parts = fmt(tz).formatToParts(new Date(ts));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '0';
  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    hour: Number(get('hour')) % 24,
    minute: Number(get('minute')),
    weekday: WEEKDAYS[get('weekday')] ?? 0,
  };
}

function offsetAt(ts: number, tz: string) {
  const p = localParts(ts, tz);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
  return asUtc - Math.floor(ts / 60_000) * 60_000;
}

/** Wall-clock time in `tz` → epoch ms. */
export function zonedToUtc(year: number, month: number, day: number, hour: number, minute: number, tz: string) {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  const first = guess - offsetAt(guess, tz);
  return guess - offsetAt(first, tz);
}

export function dateKey(p: { year: number; month: number; day: number }) {
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

export function parseDateKey(key: string) {
  const [year, month, day] = key.split('-').map(Number);
  return { year, month, day };
}

function addDays(p: { year: number; month: number; day: number }, n: number) {
  const d = new Date(Date.UTC(p.year, p.month - 1, p.day) + n * DAY);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

export interface RitualConfig {
  timeZone: string;
  ritualDay: number;
  developHour: number;
}

/** Epoch ms of the next develop moment strictly after `ts`. */
export function nextDevelop(ts: number, cfg: RitualConfig) {
  const p = localParts(ts, cfg.timeZone);
  const delta = (cfg.ritualDay - p.weekday + 7) % 7;
  let date = addDays(p, delta);
  let at = zonedToUtc(date.year, date.month, date.day, cfg.developHour, 0, cfg.timeZone);
  if (at <= ts) {
    date = addDays(date, 7);
    at = zonedToUtc(date.year, date.month, date.day, cfg.developHour, 0, cfg.timeZone);
  }
  return { at, key: dateKey(date) };
}

/** The ritual week a moment belongs to: keyed by the date its roll develops. */
export function weekKey(ts: number, cfg: RitualConfig) {
  return nextDevelop(ts, cfg).key;
}

export function previousWeekKey(key: string) {
  return dateKey(addDays(parseDateKey(key), -7));
}

export function weekKeyOffset(key: string, weeks: number) {
  return dateKey(addDays(parseDateKey(key), weeks * 7));
}

export interface RitualWindow {
  weekKey: string;
  /** Ritual day 00:00 local. */
  opensAt: number;
  /** Ritual day developHour local — the dump closes and the roll develops. */
  developsAt: number;
  isOpen: boolean;
}

/** Spec §N: the Sunday window that drives the Live Activity countdown and rare-card trading. */
export function ritualWindow(now: number, cfg: RitualConfig): RitualWindow {
  const { at, key } = nextDevelop(now, cfg);
  const d = parseDateKey(key);
  const opensAt = zonedToUtc(d.year, d.month, d.day, 0, 0, cfg.timeZone);
  return { weekKey: key, opensAt, developsAt: at, isOpen: now >= opensAt && now < at };
}

/** First day (local) of the ritual week whose key is given. */
export function weekStartKey(key: string) {
  return dateKey(addDays(parseDateKey(key), -6));
}

/** "this week N years ago" anchor for Rewind (Retro) and on-this-day (Timehop). */
export function sameWeekYearsAgo(now: number, years: number, tz: string) {
  const p = localParts(now, tz);
  const start = zonedToUtc(p.year - years, p.month, p.day, 0, 0, tz) - 3 * DAY;
  return { start, end: start + 7 * DAY };
}

export function isSameLocalDay(a: number, b: number, tz: string) {
  const pa = localParts(a, tz);
  const pb = localParts(b, tz);
  return pa.year === pb.year && pa.month === pb.month && pa.day === pb.day;
}

export { DAY };
