export function timeAgo(ts: number, now = Date.now()) {
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 60) return 'now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d`;
  const w = Math.round(d / 7);
  if (w < 52) return `${w}w`;
  return `${Math.round(d / 365)}y`;
}

export function countdown(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Oct 5 – 11" style range for a ritual week (Retro's week-by-week format). */
export function weekRange(weekKey: string) {
  const end = new Date(`${weekKey}T12:00:00Z`);
  const start = new Date(end.getTime() - 6 * 86_400_000);
  const sm = MONTH[start.getUTCMonth()];
  const em = MONTH[end.getUTCMonth()];
  return sm === em ? `${sm} ${start.getUTCDate()} – ${end.getUTCDate()}` : `${sm} ${start.getUTCDate()} – ${em} ${end.getUTCDate()}`;
}

export function dayName(day: number) {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day] ?? 'Sunday';
}

export function hourLabel(h: number) {
  const ap = h >= 12 ? 'pm' : 'am';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}${ap}`;
}

export function clock(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function longDate(ts: number) {
  return new Date(ts).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

/** Film-camera date imprint for Rewind shares: '24 10 07 (Dispo / disposable-camera style). */
export function dateStamp(ts: number) {
  const d = new Date(ts);
  return `'${String(d.getFullYear()).slice(2)} ${String(d.getMonth() + 1).padStart(2, ' ')} ${String(d.getDate()).padStart(2, '0')}`;
}

export function yearsAgo(ts: number, now = Date.now()) {
  const y = Math.floor((now - ts) / (365.25 * 86_400_000));
  return y;
}

export function bytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(0)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(2)} GB`;
}

export function firstName(name: string) {
  return name.split(' ')[0];
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

/** ISO-8601 week number (Retro's "Week 27" for Jul 3–9, 2023 [I] retro-01/-02). */
export function isoWeek(ts: number) {
  const d = new Date(ts);
  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day + 3);
  const firstThu = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  return 1 + Math.round(((d.getTime() - firstThu.getTime()) / 86_400_000 - 3 + ((firstThu.getUTCDay() + 6) % 7)) / 7);
}

/** Start and end (ms) of the ritual week that ends on `weekKey` (a yyyy-mm-dd date). */
export function weekBounds(weekKey: string) {
  const end = new Date(`${weekKey}T12:00:00Z`).getTime();
  return { start: end - 6 * 86_400_000, end };
}
