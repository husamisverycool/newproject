#!/usr/bin/env node
// Sync stress test for the in-Claude build (scripts/build-live.mjs) on the mock runtime:
// two friends write at the same moment and must end with identical databases; then the leader
// compacts the log into a snapshot and a third friend who opens the app later loads from it and
// matches too.
//
//   node scripts/test-sync.mjs <siteDir>
import path from 'node:path';
import zlib from 'node:zlib';
import { chromium } from '@playwright/test';
import { serveLive, openViewer, state } from './live-mock.mjs';

const server = await serveLive(path.resolve(process.argv[2]));
const browser = await chromium.launch();
const failures = [];
const check = (ok, what) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failures.push(what);
};
const call = (page, method, url, body) =>
  page.evaluate(
    async ([method, url, body]) => {
      const e = window.__rollEngine;
      const r = await e.fetch(new Request(`https://roll.local/api${url}`, { method, ...(body ? { body: JSON.stringify(body), headers: { 'content-type': 'application/json' } } : {}) }));
      return { status: r.status, body: await r.json().catch(() => null) };
    },
    [method, url, body],
  );
const digest = (page) => page.evaluate(() => window.__rollEngine.sync.digest());
// SNAPSHOT_IN_DOCS=1: nobody can upload assets, so the snapshot is written in document parts.
const assets = process.env.SNAPSHOT_IN_DOCS !== '1';
const open = async (id, name, owner, init) => {
  const v = await openViewer(browser, server, { id, name, owner, init, assets });
  await v.page.waitForFunction(() => Boolean(window.__rollEngine), null, { timeout: 30_000 });
  return v;
};

try {
  const fast = 'window.__rollCompactAfter = 25; window.__rollStableLag = 500;';
  const alice = await open('u_alice', 'Alice', true, fast);
  const a = alice.page;
  await call(a, 'POST', '/auth/start', { name: 'Alice', birthYear: 1999 });
  const g = (await call(a, 'POST', '/groups', { name: 'Besties', species: 'owl', mascotName: 'Duo', ritualDay: 0, developHour: 21, timeZone: 'UTC' })).body.group;
  const code = (await call(a, 'GET', `/groups/${g.id}`)).body.group.inviteCode;
  const bob = await open('u_bob', 'Bob', false, fast);
  const b = bob.page;
  await b.waitForTimeout(1500);
  await call(b, 'POST', '/auth/start', { name: 'Bob', birthYear: 2000 });
  await call(b, 'POST', `/join/${code}`);
  await a.waitForTimeout(2000);

  // Both write at once: their ops interleave and arrive out of order on each side.
  const burst = (page, who) => (async () => {
    for (let i = 0; i < 15; i++) await call(page, 'POST', `/groups/${g.id}/messages`, { body: `${who} ${i}` });
  })();
  await Promise.all([burst(a, 'alice'), burst(b, 'bob')]);
  await a.waitForTimeout(4000);
  const [da, db] = [await digest(a), await digest(b)];
  check(da.hash === db.hash, `simultaneous writes converge (alice ${da.hash}, bob ${db.hash}; messages ${da.counts.messages}/${db.counts.messages})`);
  const ma = (await call(a, 'GET', `/groups/${g.id}/messages`)).body;
  const mb = (await call(b, 'GET', `/groups/${g.id}/messages`)).body;
  check(JSON.stringify(ma.messages?.map((m) => m.id)) === JSON.stringify(mb.messages?.map((m) => m.id)), 'both see the same chat, in the same order');

  // More writes, then wait for the leader (Alice) to compact the log into a snapshot.
  for (let i = 0; i < 10; i++) await call(b, 'POST', `/groups/${g.id}/messages`, { body: `more ${i}` });
  let snap = null;
  for (let t = 0; t < 40 && !snap; t++) {
    await a.waitForTimeout(1000);
    snap = state.docs.get('snap/current') ?? null;
  }
  check(Boolean(snap), `the leader wrote a snapshot${snap ? ` (at ${snap.k}, ${snap.asset ? 'asset' : `${snap.parts} parts`})` : ''}`);
  await a.waitForTimeout(2000);

  // Carol opens the app afterwards: snapshot + the ops after it.
  const carol = await open('u_carol', 'Carol', false);
  await carol.page.waitForTimeout(2500);
  const [d1, d2, d3] = [await digest(a), await digest(b), await digest(carol.page)];
  check(d1.hash === d3.hash && d2.hash === d3.hash, `a page loading from the snapshot matches (${d1.hash} ${d2.hash} ${d3.hash}; carol replayed ${d3.ops} ops after ${d3.snap})`);

  // Writes after the snapshot still flow to everyone.
  await call(carol.page, 'POST', '/auth/start', { name: 'Carol', birthYear: 2001 });
  await call(carol.page, 'POST', `/join/${code}`);
  await call(carol.page, 'POST', `/groups/${g.id}/messages`, { body: 'carol here' });
  await a.waitForTimeout(3000);
  const [e1, e2, e3] = [await digest(a), await digest(b), await digest(carol.page)];
  check(e1.hash === e2.hash && e2.hash === e3.hash, `all three still match after new writes (${e1.hash} ${e2.hash} ${e3.hash})`);
  // A very late op (written with an old key, behind every page's checkpoint) still lands everywhere.
  // (Its key sorts just after the snapshot: a writer's key is always later than what it had seen.)
  const late = `${state.docs.get('snap/current').k}~latecomer`;
  const stmt = ['INSERT INTO memory (id, group_id, text, source_post_id, added_by, created_at) VALUES (?, ?, ?, ?, ?, ?)', ['mem_late', g.id, 'arrived late', null, 'u_bob', Date.now() - 90_000]];
  state.docs.set(`ops/${late}`, { k: late, u: 'u_bob', z: zlib.gzipSync(JSON.stringify({ s: [stmt], e: [] })).toString('base64') });
  for (const v of [alice, bob, carol]) await v.page.evaluate(() => window.__rollEngine.sync.catchUp(true));
  await a.waitForTimeout(1500);
  const [l1, l2, l3] = [await digest(a), await digest(b), await digest(carol.page)];
  check(l1.hash === l2.hash && l2.hash === l3.hash && l1.counts.memory === e1.counts.memory + 1, `a late op behind the checkpoint lands on every page (${l1.hash} ${l2.hash} ${l3.hash}; memory ${e1.counts.memory}→${l1.counts.memory})`);

  for (const v of [alice, bob, carol]) {
    const errs = v.viewer.logs.filter((l) => l.startsWith('[pageerror]'));
    check(!errs.length, `${v.viewer.name}: no page errors${errs.length ? `\n      ${errs.slice(0, 4).join('\n      ')}` : ''}`);
  }
} finally {
  await browser.close();
  server.server.close();
}
if (failures.length) {
  console.log(`\n${failures.length} failed`);
  process.exit(1);
}
