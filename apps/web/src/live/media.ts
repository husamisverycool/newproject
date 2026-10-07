/**
 * Photo, voice and sticker storage for the in-Claude build (the server's MediaStore, apps/server/src/media.ts).
 *
 * - Viewers who can upload assets (the owner and editors) store each file as an artifact asset; its
 *   URL is `/_blob/<id>`, which every viewer's page can load directly.
 * - Everyone else stores the file in the shared `db` store, split into documents of at most
 *   ~190 KB of base64 (`media/<id>`, `media/<id>~1`, …), under a URL shaped like the Node server's
 *   (`/media/<id>.<ext>`). Pages turn those URLs into data: URLs before the app sees them
 *   (`resolveMedia`), and keep the bytes in IndexedDB so each file downloads once per device.
 */
import { Buffer } from 'buffer';
import type { Assets, Db } from './claude';

const PART = 190_000;
const TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  webm: 'video/webm',
  mp4: 'video/mp4',
  m4a: 'audio/mp4',
  zip: 'application/zip',
};

function sniffType(b: Uint8Array, ext: string) {
  if (b[0] === 0xff && b[1] === 0xd8) return 'image/jpeg';
  if (b[0] === 0x89 && b[1] === 0x50) return 'image/png';
  if (b[0] === 0x52 && b[1] === 0x49 && b[8] === 0x57) return 'image/webp';
  if (b[0] === 0x47 && b[1] === 0x49) return 'image/gif';
  if (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return 'video/webm';
  if (b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70) return ext === 'm4a' ? 'audio/mp4' : 'video/mp4';
  return TYPES[ext] ?? 'application/octet-stream';
}

/** Asset uploads accept these types; anything else goes to the document store. */
const ASSET_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/webm', 'video/mp4']);

function b64(bytes: Uint8Array) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
function unb64(s: string) {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/* ───────────── IndexedDB cache (a per-device convenience; everything works without it) ───────────── */

let idb: Promise<IDBDatabase | null> | null = null;
function openCache() {
  idb ??= new Promise((resolve) => {
    // Some framed contexts never answer an open request: give up quickly and go without the cache.
    setTimeout(() => resolve(null), 1500);
    try {
      const req = indexedDB.open('roll-media', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('files');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return idb;
}
async function cacheGet(key: string): Promise<{ type: string; bytes: Uint8Array } | null> {
  const d = await openCache();
  if (!d) return null;
  return new Promise((resolve) => {
    setTimeout(() => resolve(null), 1500);
    try {
      const r = d.transaction('files').objectStore('files').get(key);
      r.onsuccess = () => resolve((r.result as { type: string; bytes: Uint8Array } | undefined) ?? null);
      r.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}
async function cachePut(key: string, v: { type: string; bytes: Uint8Array }) {
  const d = await openCache();
  if (!d) return;
  try {
    d.transaction('files', 'readwrite').objectStore('files').put(v, key);
  } catch {
    /* quota or private mode */
  }
}

/* ───────────── the store ───────────── */

export class MediaStore {
  private dataUrls = new Map<string, string>();
  private origin = new Map<string, string>(); // data: URL → stored URL, for request bodies
  private loading = new Map<string, Promise<{ type: string; bytes: Uint8Array }>>();

  constructor(
    private db: Db | null,
    private assets: Assets | null,
  ) {}

  private idOf(url: string) {
    return url.replace(/^\/media\//, '').replace(/\.[a-z0-9]+$/i, '');
  }

  /** Server side: store bytes, return the URL the database keeps. */
  async write(buf: Buffer, ext: string): Promise<{ url: string; bytes: number }> {
    const bytes = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    const type = sniffType(bytes, ext);
    if (this.assets && ASSET_TYPES.has(type)) {
      try {
        const r = await this.assets.upload(new Blob([bytes as BlobPart], { type }), { type });
        return { url: `/_blob/${r.id}`, bytes: r.sizeBytes };
      } catch {
        /* fall back to documents */
      }
    }
    const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
    const url = `/media/${id}.${ext}`;
    const text = b64(bytes);
    const parts = Math.max(1, Math.ceil(text.length / PART));
    if (this.db) {
      for (let i = parts - 1; i >= 0; i--) {
        const body: Record<string, unknown> = { z: text.slice(i * PART, (i + 1) * PART) };
        if (i === 0) Object.assign(body, { t: type, n: parts, size: bytes.length });
        await this.db.doc(`media/${i === 0 ? id : `${id}~${i}`}`).set(body);
      }
    }
    const entry = { type, bytes };
    this.loading.set(id, Promise.resolve(entry));
    void cachePut(id, entry);
    return { url, bytes: bytes.length };
  }

  private load(url: string): Promise<{ type: string; bytes: Uint8Array }> {
    const id = this.idOf(url);
    let p = this.loading.get(id);
    if (!p) {
      p = (async () => {
        const hit = await cacheGet(id);
        if (hit) return hit;
        if (!this.db) throw new Error('media unavailable');
        const head = await this.db.doc(`media/${id}`).get();
        if (!head.exists) throw new Error('media missing');
        const h = head.data() as { z: string; t: string; n: number };
        const rest = await Promise.all(Array.from({ length: Math.max(0, h.n - 1) }, (_, i) => this.db!.doc(`media/${id}~${i + 1}`).get()));
        const text = h.z + rest.map((r) => String(r.data()?.z ?? '')).join('');
        const entry = { type: h.t, bytes: unb64(text) };
        void cachePut(id, entry);
        return entry;
      })();
      p.catch(() => this.loading.delete(id));
      this.loading.set(id, p);
    }
    return p;
  }

  /** Server side: the bytes behind a stored URL. */
  async read(url: string): Promise<Buffer> {
    if (url.startsWith('/_blob/') || url.startsWith('data:')) {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`media ${r.status}`);
      return Buffer.from(await r.arrayBuffer());
    }
    const { bytes } = await this.load(url);
    return Buffer.from(bytes);
  }

  /** Client side: a URL an <img>/<audio> can show. */
  async displayUrl(url: string) {
    const cached = this.dataUrls.get(url);
    if (cached) return cached;
    const { type, bytes } = await this.load(url);
    const d = `data:${type};base64,${b64(bytes)}`;
    this.dataUrls.set(url, d);
    this.origin.set(d, url);
    return d;
  }

  /** Replace every `/media/…` string in an API response with a displayable URL. */
  async resolve<T>(value: T): Promise<T> {
    const found = new Set<string>();
    const walk = (v: unknown) => {
      if (typeof v === 'string') {
        if (v.startsWith('/media/')) found.add(v);
      } else if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === 'object') Object.values(v).forEach(walk);
    };
    walk(value);
    if (!found.size) return value;
    const urls = [...found];
    const map = new Map<string, string>();
    let i = 0;
    const worker = async () => {
      while (i < urls.length) {
        const u = urls[i++];
        map.set(u, await this.displayUrl(u).catch(() => ''));
      }
    };
    await Promise.all(Array.from({ length: Math.min(6, urls.length) }, worker));
    const swap = (v: unknown): unknown => {
      if (typeof v === 'string') return map.get(v) ?? v;
      if (Array.isArray(v)) return v.map(swap);
      if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, swap(x)]));
      return v;
    };
    return swap(value) as T;
  }

  /** The reverse of `resolve`, for JSON the app sends back (wall layouts, avatars). */
  unresolve<T>(value: T): T {
    if (!this.origin.size) return value;
    const swap = (v: unknown): unknown => {
      if (typeof v === 'string') return v.startsWith('data:') ? (this.origin.get(v) ?? v) : v;
      if (Array.isArray(v)) return v.map(swap);
      if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, swap(x)]));
      return v;
    };
    return swap(value) as T;
  }
}
