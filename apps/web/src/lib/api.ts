import { LIVE, STATIC, staticGet } from './static';

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let body: { error?: string; message?: string } = {};
    try {
      body = await res.json();
    } catch {
      /* not json */
    }
    throw new ApiError(res.status, body.error ?? 'error', body.message ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

function staticCall<T>(path: string, method: string): Promise<T> {
  if (method !== 'GET') return Promise.resolve({ ok: true } as T);
  const v = staticGet(path);
  return v === undefined ? Promise.reject(new ApiError(404, 'not_found', '')) : Promise.resolve(structuredClone(v) as T);
}

/**
 * In-Claude mode: the request goes to the server running in this page (src/live/engine.ts). Media
 * URLs in the answer become displayable URLs, and go back to their stored form in request bodies.
 */
async function liveCall<T>(path: string, init: RequestInit, as: 'json' | 'blob' = 'json'): Promise<T> {
  const { engine } = await import('../live/engine');
  const e = await engine();
  const method = init.method ?? 'GET';
  if (method !== 'GET' && e.readOnly) throw new ApiError(403, 'read_only', '');
  let body = init.body;
  if (typeof body === 'string') body = JSON.stringify(e.media.unresolve(JSON.parse(body)));
  const res = await e.fetch(new Request(`https://roll.local/api${path}`, { ...init, body }));
  if (as === 'blob') {
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      throw new ApiError(res.status, b.error ?? 'error', b.message ?? res.statusText);
    }
    return (await res.blob()) as T;
  }
  return e.media.resolve(await handle<T>(res));
}

function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (STATIC) return staticCall<T>(path, init.method ?? 'GET');
  if (LIVE) return liveCall<T>(path, init);
  return fetch(`/api${path}`, { credentials: 'include', ...init }).then((r) => handle<T>(r));
}

export const api = {
  get: <T>(path: string) => call<T>(path),
  post: <T>(path: string, body?: unknown) =>
    call<T>(path, {
      method: 'POST',
      headers: body instanceof FormData ? undefined : { 'content-type': 'application/json' },
      body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
    }),
  patch: <T>(path: string, body: unknown) => call<T>(path, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
  del: <T>(path: string) => call<T>(path, { method: 'DELETE' }),
  blob: (path: string): Promise<Blob> =>
    STATIC
      ? Promise.reject(new ApiError(404, 'not_found', ''))
      : LIVE
        ? liveCall<Blob>(path, {}, 'blob')
        : fetch(`/api${path}`, { credentials: 'include' }).then(async (r) => {
            if (!r.ok) {
              const b = await r.json().catch(() => ({}));
              throw new ApiError(r.status, b.error ?? 'error', b.message ?? r.statusText);
            }
            return r.blob();
          }),
};

export async function downloadBlob(blob: Blob, filename: string) {
  if (LIVE) {
    // Inside Claude the page saves through the artifact's download confirmation.
    const { engine } = await import('../live/engine');
    const e = await engine();
    if (e.downloads) {
      await e.downloads.save({ filename, data: blob }).catch(() => undefined);
      return;
    }
  }
  const file = new File([blob], filename, { type: blob.type });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file] });
      return;
    } catch {
      /* fall back to download */
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
