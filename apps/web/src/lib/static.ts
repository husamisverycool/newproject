/**
 * Static preview mode (VITE_STATIC=1): the app runs with no server, reading a snapshot of the demo
 * data embedded in the page (<script id="roll-snapshot" type="application/json">). Used to publish a
 * view-only preview that opens inside Claude and on a phone. Writes are accepted and ignored.
 */
export const STATIC = import.meta.env.VITE_STATIC === '1';

let snap: Record<string, unknown> | null = null;
function snapshot() {
  if (snap) return snap;
  try {
    snap = JSON.parse(document.getElementById('roll-snapshot')?.textContent ?? '{}') as Record<string, unknown>;
  } catch {
    snap = {};
  }
  return snap;
}

export function staticGet(path: string): unknown | undefined {
  const s = snapshot();
  if (path in s) return s[path];
  const bare = path.split('?')[0];
  if (bare in s) return s[bare];
  const hit = Object.keys(s).find((k) => k.split('?')[0] === bare);
  return hit ? s[hit] : undefined;
}
