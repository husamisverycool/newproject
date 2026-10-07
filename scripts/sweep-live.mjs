#!/usr/bin/env node
// Sweep of the in-Claude build (scripts/build-live.mjs) on the mock Claude runtime (scripts/live-mock.mjs):
// three friends sign up and post, the week develops, every heavy server feature runs in the page
// (exports, AI styles, stickers, zine, archive, wall remix), and every screen opens without errors.
//
//   node scripts/sweep-live.mjs <siteDir> [shotsDir]
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { serveLive, openViewer, state } from './live-mock.mjs';

const dir = process.argv[2];
const shots = process.argv[3] ?? null;
if (shots) fs.mkdirSync(shots, { recursive: true });
const server = await serveLive(path.resolve(dir));
const browser = await chromium.launch();
const failures = [];
const check = (ok, what) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failures.push(what);
};
const frames = fs.readdirSync('research/inspo/frames').filter((f) => f.endsWith('.jpg')).map((f) => path.resolve('research/inspo/frames', f));

/** Call the page's own server. */
const call = (page, method, url, body) =>
  page.evaluate(
    async ([method, url, body]) => {
      const e = window.__rollEngine;
      const init = { method };
      if (body && body.__files) {
        const fd = new FormData();
        for (const [k, v] of Object.entries(body.fields ?? {})) fd.set(k, String(v));
        for (const [k, b64] of Object.entries(body.__files)) {
          const bin = atob(b64);
          const bytes = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
          fd.set(k, new Blob([bytes], { type: 'image/jpeg' }), `${k}.jpg`);
        }
        init.body = fd;
      } else if (body !== undefined) {
        init.body = JSON.stringify(body);
        init.headers = { 'content-type': 'application/json' };
      }
      const r = await e.fetch(new Request(`https://roll.local/api${url}`, init));
      const type = r.headers.get('content-type') ?? '';
      const out = type.includes('json') ? await r.json() : { bytes: (await r.arrayBuffer()).byteLength, type };
      e.sync.flush();
      return { status: r.status, body: out };
    },
    [method, url, body],
  );

async function boot(id, name, owner) {
  const v = await openViewer(browser, server, { id, name, owner, sample: async (input) => ({ reply: `${name}, noted!`, intro: 'New week, new game!', questions: [], challenge: null, input: String(input).length }) });
  await v.page.waitForFunction(() => Boolean(window.__rollEngine), null, { timeout: 30_000 });
  return v;
}

try {
  const alice = await boot('u_alice', 'Alice', true);
  const a = alice.page;
  const start = await call(a, 'POST', '/auth/start', { name: 'Alice', birthYear: 1999 });
  check(start.status === 200, 'Alice signs up');
  await call(a, 'PATCH', '/me', { onboarded: true });
  const g = await call(a, 'POST', '/groups', { name: 'Besties', species: 'owl', mascotName: 'Duo', ritualDay: new Date().getDay(), developHour: 23, timeZone: 'America/New_York' });
  check(g.status === 200, 'Alice makes a group');
  const gid = g.body.group.id;
  const code = (await call(a, 'GET', `/groups/${gid}`)).body.group.inviteCode;

  const friends = [];
  for (const [id, name] of [
    ['u_bob', 'Bob'],
    ['u_carol', 'Carol'],
  ]) {
    const f = await boot(id, name, false);
    await new Promise((r) => setTimeout(r, 1500));
    await call(f.page, 'POST', '/auth/start', { name, birthYear: 2000 });
    await call(f.page, 'PATCH', '/me', { onboarded: true });
    const j = await call(f.page, 'POST', `/join/${code}`);
    check(j.status === 200, `${name} joins with the room code`);
    friends.push(f);
  }
  await a.waitForTimeout(2500);
  const members = (await call(a, 'GET', `/groups/${gid}`)).body.members?.length;
  check(members === 3, `Alice's page sees 3 members (${members})`);

  // Everyone posts twice.
  const postIds = [];
  for (const [i, v] of [alice, ...friends].entries()) {
    for (let k = 0; k < 2; k++) {
      const img = fs.readFileSync(frames[(i * 2 + k) % frames.length]).toString('base64');
      const r = await call(v.page, 'POST', '/posts', { __files: { main: img }, fields: { groupIds: gid, caption: `${v.viewer.name} ${k}` } });
      check(r.status === 200, `${v.viewer.name} posts photo ${k + 1}`);
      if (r.body.posts?.[0]?.id) postIds.push(r.body.posts[0].id);
      else if (r.body.post?.id) postIds.push(r.body.post.id);
    }
  }
  await a.waitForTimeout(3000);
  const feed = await call(a, 'GET', `/groups/${gid}/feed`);
  check(feed.body.posts?.length === 6, `Alice's feed has all 6 posts (${feed.body.posts?.length})`);

  // Chat, reactions, the game master (answers through the viewer's Claude: here the mock sample).
  await call(friends[0].page, 'POST', `/groups/${gid}/messages`, { body: 'hello everyone' });
  if (postIds[0]) await call(friends[0].page, 'POST', `/posts/${postIds[0]}/react`, { emoji: '🔥' });
  await a.waitForTimeout(2500);
  const msgs = await call(a, 'GET', `/groups/${gid}/messages`);
  check(JSON.stringify(msgs.body).includes('hello everyone'), 'messages sync');

  // Heavy server work in the page: exports, AI styles, zine, archive, stickers.
  const pid = postIds[0];
  const exp = await call(a, 'GET', `/posts/${pid}/export`);
  check(exp.status === 200 && exp.body.bytes > 10_000, `photo export with watermark (${exp.body.bytes} bytes)`);
  await call(a, 'POST', '/me/plan', { plan: 'ai' }); // Remix+: the AI allowance and the figurine
  for (const style of ['comic', 'anime', 'sketch', 'watercolor', '8bit', 'polaroid', 'sticker', 'enamel_pin', 'figurine']) {
    const t = Date.now();
    const img = fs.readFileSync(frames[0]).toString('base64');
    const r = await call(a, 'POST', style === 'figurine' ? '/objects/figurine' : '/objects/remix', { __files: style === 'figurine' ? { cutout: img } : {}, fields: { postId: pid, style, groupId: gid, subjectId: 'u_alice' } });
    check(r.status === 200, `remix ${style} (${r.status}${r.status !== 200 ? ` ${JSON.stringify(r.body).slice(0, 120)}` : ''}, ${Date.now() - t} ms)`);
  }
  const zine = await call(a, 'POST', `/groups/${gid}/zine`, { weekKey: feed.body.posts?.[0]?.weekKey });
  check(zine.status === 200, `zine (${zine.status}${zine.status !== 200 ? ` ${JSON.stringify(zine.body).slice(0, 120)}` : ''})`);
  const zip = await call(a, 'GET', `/groups/${gid}/export`);
  check(zip.status === 200 && zip.body.bytes > 10_000, `archive export (${zip.body.bytes} bytes)`);

  // Develop the week (demo endpoint, turned on for the test): wall, recap, packs, awards.
  await a.evaluate(() => (window.__rollServer.env.demo = true));
  const dev = await call(a, 'POST', '/demo/develop', { groupId: gid });
  check(dev.status === 200, `develop the week (${dev.status}${dev.status !== 200 ? ` ${JSON.stringify(dev.body).slice(0, 160)}` : ''})`);
  await a.evaluate(() => (window.__rollServer.env.demo = false));
  const journal = await call(a, 'GET', `/groups/${gid}/journal?weeks=4`);
  const wk = journal.body.weeks?.[0]?.weekKey;
  if (wk) {
    const wall = await call(a, 'GET', `/groups/${gid}/walls/${wk}`);
    check(wall.status === 200, `wall for ${wk}`);
    const remix = await call(a, 'POST', `/groups/${gid}/walls/${wk}/remix`, {});
    check(remix.status === 200, `wall remix (${remix.status}${remix.status !== 200 ? ` ${JSON.stringify(remix.body).slice(0, 120)}` : ''})`);
    const wexp = await call(a, 'GET', `/groups/${gid}/walls/${wk}/export`);
    check(wexp.status === 200 && wexp.body.bytes > 10_000, `wall export (${wexp.body.bytes} bytes)`);
  }
  const binder = await call(a, 'GET', `/groups/${gid}/binder`);
  check(binder.status === 200, 'binder');
  const packs = binder.body.packs ?? [];

  // Every screen, opened fresh (each load rebuilds from the shared log).
  const plans = (await call(a, 'GET', `/groups/${gid}/plans`)).body.plans ?? [];
  const routes = [
    '/', '/chats', `/chat/${gid}`, '/journal', '/journal/calendar', '/rewind', '/me', '/me/settings', '/me/likeness', '/plans', '/notifications',
    '/shop', '/new-group', '/roll', '/create', '/create/remix', '/create/meme', '/create/sticker', `/g/${gid}/settings`, `/g/${gid}/wonder`,
    `/g/${gid}/trades`, `/g/${gid}/game`, `/g/${gid}/memory`, `/g/${gid}/wrapped`, `/g/${gid}/new-plan`, `/g/${gid}/cards`,
    ...(wk ? [`/g/${gid}/week/${wk}`] : []), ...(pid ? [`/p/${pid}`] : []), ...plans.map((p) => `/plan/${p.id}`), ...packs.slice(0, 1).map((p) => `/g/${gid}/pack/${p.id}`),
  ];
  const sweeper = await openViewer(browser, server, { id: 'u_alice', name: 'Alice', owner: true, hash: '#/' });
  const s = sweeper.page;
  for (const r of routes) {
    sweeper.viewer.logs.length = 0;
    await s.goto('about:blank');
    await s.goto(`${server.url}#${r}`); // a fresh load: the route is read once, at start
    await s.waitForTimeout(2600);
    if (shots) await s.screenshot({ path: path.join(shots, `route${r.replace(/[/:]/g, '_') || '_'}.png`) });
    const errs = sweeper.viewer.logs.filter((l) => l.startsWith('[pageerror]') || (l.startsWith('[error]') && !/favicon|ERR_FILE_NOT_FOUND/.test(l)));
    check(!errs.length, `screen ${r}${errs.length ? `\n      ${errs.slice(0, 3).join('\n      ')}` : ''}`);
  }
  const allErrs = [alice, ...friends].flatMap((v) => v.viewer.logs.filter((l) => l.startsWith('[pageerror]')));
  check(!allErrs.length, `no page errors on the friends' pages${allErrs.length ? `\n      ${allErrs.slice(0, 5).join('\n      ')}` : ''}`);
  const ops = [...state.docs.keys()].filter((k) => k.startsWith('ops/')).length;
  console.log(`shared store: ${state.docs.size} documents (${ops} ops), ${state.assets.size} assets`);
} finally {
  await browser.close();
  server.server.close();
}
if (failures.length) {
  console.log(`\n${failures.length} failed`);
  process.exit(1);
}
