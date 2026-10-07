// A stand-in for the Claude artifact runtime, for testing the in-Claude build (apps/web/src/live)
// in Playwright: every page opened through `openViewer` shares one in-memory `db` store, one asset
// store and one room, and each page is a different signed-in viewer.
//
//   import { serveLive, openViewer } from './live-mock.mjs';
//   const server = await serveLive(buildDir);           // static files + /_blob/<id>
//   const a = await openViewer(browser, server, { id: 'u_alice', name: 'Alice', owner: true });
//
// Only the members the app calls are implemented; semantics follow the platform's type definitions
// (whole-document set, merge update, lexicographic orderBy, per-document leases, snapshots on change).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.wasm': 'application/wasm', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.txt': 'text/plain', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };

export const state = { docs: new Map(), assets: new Map(), leases: new Map(), pages: new Set(), writes: 0, reads: 0 };

export function serveLive(dir, port = 0) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    if (url.pathname.startsWith('/_blob/')) {
      const a = state.assets.get(url.pathname.slice(7));
      if (!a) return res.writeHead(404).end();
      res.writeHead(200, { 'content-type': a.type });
      return res.end(a.bytes);
    }
    let file = path.join(dir, decodeURIComponent(url.pathname));
    if (url.pathname === '/' || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(dir, 'index.html');
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
    if (file.endsWith('index.html')) {
      // Artifact pages are fragments; the platform wraps them in a document skeleton.
      const body = fs.readFileSync(file, 'utf8');
      return res.end(/^\s*<!doctype/i.test(body) ? body : `<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>${body}</body></html>`);
    }
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(port, () => resolve({ server, url: `http://localhost:${server.address().port}/` })));
}

const segs = (p) => p.split('/');
const inCollection = (docPath, col) => {
  const d = segs(docPath);
  const c = segs(col);
  return d.length === c.length + 1 && docPath.startsWith(col + '/');
};
const cmp = (a, b) => (a === b ? 0 : a === undefined ? 1 : b === undefined ? -1 : a < b ? -1 : 1);
const test = (v, op, x) =>
  op === '==' ? v === x : op === '!=' ? v !== x : op === '<' ? v < x : op === '<=' ? v <= x : op === '>' ? v > x : op === '>=' ? v >= x : op === 'in' ? x.includes(v) : op === 'not-in' ? !x.includes(v) : op === 'array-contains' ? Array.isArray(v) && v.includes(x) : false;

function runQuery(q) {
  let rows = [...state.docs.entries()].filter(([p]) => inCollection(p, q.col)).map(([p, data]) => ({ id: p.split('/').pop(), path: p, data }));
  for (const [f, op, v] of q.where) rows = rows.filter((r) => test(r.data[f], op, v));
  if (q.orderBy) rows.sort((a, b) => cmp(a.data[q.orderBy[0]], b.data[q.orderBy[0]]) * (q.orderBy[1] === 'desc' ? -1 : 1));
  else rows.sort((a, b) => cmp(a.id, b.id));
  if (q.limit) rows = rows.slice(0, q.limit);
  return rows.map((r) => ({ id: r.id, exists: true, data: r.data }));
}

async function notify() {
  for (const p of state.pages) {
    for (const [sid, sub] of p.subs) {
      const snap = sub.kind === 'doc' ? docSnap(sub.path) : runQuery(sub.q);
      const key = JSON.stringify(snap);
      if (key === sub.last) continue;
      sub.last = key;
      // Real delivery is asynchronous and may lag; keep a small delay.
      setTimeout(() => p.page.evaluate(([id, s]) => window.__mockDeliver?.(id, s), [sid, snap]).catch(() => undefined), 30);
    }
  }
}
const docSnap = (p) => (state.docs.has(p) ? { id: p.split('/').pop(), exists: true, data: state.docs.get(p) } : { id: p.split('/').pop(), exists: false });

const SIZE_CAP = 256 * 1024;

async function handle(viewer, call) {
  const { cap, method, args } = call;
  if (cap === 'db') {
    if (method === 'get') {
      state.reads++;
      return docSnap(args[0]);
    }
    if (method === 'set' || method === 'update') {
      if (viewer.readOnly) throw { code: 'invalid_argument', message: 'write below level' };
      const body = method === 'update' ? { ...(state.docs.get(args[0]) ?? {}), ...args[1] } : args[1];
      if (method === 'update' && !state.docs.has(args[0])) throw { code: 'invalid_argument', message: 'missing' };
      if (JSON.stringify(body).length > SIZE_CAP) throw { code: 'invalid_argument', message: 'document over 256 KiB' };
      state.docs.set(args[0], body);
      state.writes++;
      void notify();
      return null;
    }
    if (method === 'delete') {
      state.docs.delete(args[0]);
      void notify();
      return null;
    }
    if (method === 'acquire') {
      const [p, o] = args;
      const l = state.leases.get(p);
      const now = Date.now();
      if (l && l.until > now && l.holder !== o.holder) return { acquired: false, expiresAt: new Date(l.until).toISOString() };
      state.leases.set(p, { holder: o.holder, until: now + (o.ttlMs || 30000) });
      return { acquired: true };
    }
    if (method === 'query') {
      state.reads++;
      return runQuery(args[0]);
    }
    if (method === 'subscribe') {
      const [sid, sub] = args;
      viewer.subs.set(sid, { ...sub, last: null });
      void notify();
      return null;
    }
    if (method === 'unsubscribe') {
      viewer.subs.delete(args[0]);
      return null;
    }
  }
  if (cap === 'assets') {
    if (method === 'upload') {
      const [b64, type] = args;
      const id = Math.random().toString(16).slice(2).padEnd(32, '0').slice(0, 32);
      const bytes = Buffer.from(b64, 'base64');
      state.assets.set(id, { bytes, type });
      return { id, url: `/_blob/${id}`, sizeBytes: bytes.length, contentType: type };
    }
    if (method === 'delete') return { deleted: state.assets.delete(args[0]) };
  }
  if (cap === 'room') {
    if (method === 'emit') {
      const [topic, data] = args;
      for (const p of state.pages) {
        p.page
          .evaluate(([t, m]) => window.__mockRoom?.(t, m), [topic, { topic, data, peer: viewer.peer, by: viewer.id, isMe: p === viewer, sameTab: p === viewer, kind: 'viewer', guest: false }])
          .catch(() => undefined);
      }
      return null;
    }
  }
  if (cap === 'sample') {
    if (viewer.sample) return viewer.sample(args[0]);
    throw { code: 'not_granted', message: 'declined' };
  }
  if (cap === 'downloads') {
    viewer.downloads.push(args[0]);
    return { saved: true };
  }
  throw { code: 'capability_removed', message: `${cap}.${method}` };
}

const CLIENT = `(() => {
  const subs = new Map();
  let n = 0;
  const call = (cap, method, ...args) => window.__mockCall({ cap, method, args }).then((r) => { if (r && r.__error) throw r.__error; return r; });
  const snapDoc = (s) => ({ id: s.id, exists: s.exists, data: () => s.data, metadata: { fromCache: false, hasPendingWrites: false } });
  const snapQuery = (rows, prev) => {
    const docs = rows.map(snapDoc);
    const before = new Set(prev.map((r) => r.id));
    return { docs, size: docs.length, empty: !docs.length, metadata: { fromCache: false, hasPendingWrites: false }, docChanges: () => docs.filter((d) => !before.has(d.id)).map((doc) => ({ type: 'added', doc })) };
  };
  window.__mockDeliver = (id, s) => { const sub = subs.get(id); if (sub) sub(s); };
  const roomHandlers = new Map();
  window.__mockRoom = (topic, msg) => { for (const fn of roomHandlers.get(topic) ?? []) fn(msg); };
  const query = (col, q = { where: [], orderBy: null, limit: 0 }) => ({
    where: (f, op, v) => query(col, { ...q, where: [...q.where, [f, op, v]] }),
    orderBy: (f, d = 'asc') => query(col, { ...q, orderBy: [f, d] }),
    limit: (l) => query(col, { ...q, limit: l }),
    get: async () => snapQuery(await call('db', 'query', { col, ...q }), []),
    onSnapshot(next, err) {
      const id = 's' + ++n;
      let prev = [];
      subs.set(id, (rows) => { const s = snapQuery(rows, prev); prev = rows; next(s); });
      call('db', 'subscribe', id, { kind: 'query', q: { col, ...q } }).catch(err);
      return () => { subs.delete(id); call('db', 'unsubscribe', id); };
    },
  });
  const doc = (p) => ({
    id: p.split('/').pop(), path: p,
    get: async () => snapDoc(await call('db', 'get', p)),
    set: (d) => call('db', 'set', p, JSON.parse(JSON.stringify(d))),
    update: (d) => call('db', 'update', p, JSON.parse(JSON.stringify(d))),
    delete: () => call('db', 'delete', p),
    acquire: (o) => call('db', 'acquire', p, o),
    onSnapshot(next, err) {
      const id = 's' + ++n;
      subs.set(id, (s) => next(snapDoc(s)));
      call('db', 'subscribe', id, { kind: 'doc', path: p }).catch(err);
      return () => { subs.delete(id); call('db', 'unsubscribe', id); };
    },
    collection: (c) => ({ ...query(p + '/' + c), path: p + '/' + c, doc: (i) => doc(p + '/' + c + '/' + (i ?? Math.random().toString(36).slice(2))) }),
  });
  const db = { doc, collection: (c) => ({ ...query(c), path: c, doc: (i) => doc(c + '/' + (i ?? Math.random().toString(36).slice(2))) }) };
  const b64 = async (blob) => { const b = new Uint8Array(await blob.arrayBuffer()); let s = ''; for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000)); return btoa(s); };
  const V = window.__mockViewer;
  const caps = {
    db,
    user: {
      id: async () => V.id, me: async () => ({ id: V.id, name: V.name, avatarUrl: '', color: '#888', email: null, isOwner: V.owner, canEdit: V.owner }),
      isOwner: async () => V.owner, canEdit: async () => V.owner, can: async (x) => (x === 'data.write' ? !V.readOnly : V.owner),
      profiles: async (ids) => Object.fromEntries(ids.map((i) => [i, { id: i, name: '', avatarUrl: '', color: '#888', email: null, isMe: i === V.id, guest: false }])),
    },
    assets: V.assets ? { upload: async (blob, o) => call('assets', 'upload', await b64(blob), (o && o.type) || blob.type), delete: (id) => call('assets', 'delete', id), list: async () => ({ assets: [], usage: {} }) } : null,
    room: {
      emit: (t, d) => call('room', 'emit', t, d ?? null),
      on: (t, fn) => { const l = roomHandlers.get(t) ?? new Set(); l.add(fn); roomHandlers.set(t, l); return () => l.delete(fn); },
    },
    sample: Object.assign((input) => call('sample', 'text', input).then((t) => ({ text: String(t), truncated: false })), { json: (input) => call('sample', 'json', input), limits: async () => ({}) }),
    downloads: { save: async (o) => call('downloads', 'save', { filename: o.filename, size: o.data && o.data.size }) },
  };
  window.claude = { use: (name) => new Promise((r) => setTimeout(() => r(caps[name] ?? null), 20)) };
})();`;

/** Open the app as one viewer. Returns { page, viewer }. */
export async function openViewer(browser, server, v, ctxOpts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, ...ctxOpts });
  const page = await ctx.newPage();
  const viewer = { id: v.id, name: v.name, owner: Boolean(v.owner), readOnly: Boolean(v.readOnly), peer: Math.random().toString(36).slice(2), subs: new Map(), page, downloads: [], sample: v.sample ?? null, logs: [] };
  state.pages.add(viewer);
  await page.exposeFunction('__mockCall', async (c) => {
    try {
      return await handle(viewer, c);
    } catch (e) {
      return { __error: e && e.code ? e : { code: 'unavailable', message: String(e) } };
    }
  });
  if (v.init) await page.addInitScript(v.init);
  await page.addInitScript(`window.__mockViewer = ${JSON.stringify({ id: v.id, name: v.name, owner: Boolean(v.owner), readOnly: Boolean(v.readOnly), assets: v.assets !== false })};\n${CLIENT}`);
  page.on('console', (m) => viewer.logs.push(`[${m.type()}] ${m.text()}`));
  page.on('pageerror', (e) => viewer.logs.push(`[pageerror] ${e.message}`));
  await page.goto(server.url + (v.hash ?? ''));
  return { page, viewer, ctx };
}
