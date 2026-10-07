import { STATIC, staticGet } from './static';

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

export const api = {
  get: <T>(path: string) => (STATIC ? staticCall<T>(path, 'GET') : fetch(`/api${path}`, { credentials: 'include' }).then((r) => handle<T>(r))),
  post: <T>(path: string, body?: unknown) =>
    STATIC ? staticCall<T>(path, 'POST') : fetch(`/api${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: body instanceof FormData ? undefined : { 'content-type': 'application/json' },
      body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
    }).then((r) => handle<T>(r)),
  patch: <T>(path: string, body: unknown) =>
    STATIC ? staticCall<T>(path, 'PATCH') : fetch(`/api${path}`, { method: 'PATCH', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }).then((r) => handle<T>(r)),
  del: <T>(path: string) => (STATIC ? staticCall<T>(path, 'DELETE') : fetch(`/api${path}`, { method: 'DELETE', credentials: 'include' }).then((r) => handle<T>(r))),
  blob: (path: string) =>
    STATIC ? Promise.reject(new ApiError(404, 'not_found', '')) : fetch(`/api${path}`, { credentials: 'include' }).then(async (r) => {
      if (!r.ok) {
        const b = await r.json().catch(() => ({}));
        throw new ApiError(r.status, b.error ?? 'error', b.message ?? r.statusText);
      }
      return r.blob();
    }),
};

export async function downloadBlob(blob: Blob, filename: string) {
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
