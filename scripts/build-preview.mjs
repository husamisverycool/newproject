#!/usr/bin/env node
// Builds the self-contained, view-only preview of the app that can be published as a Claude artifact
// (or opened from any static host). Needs the dev servers running (web :5173, API :8787) with demo data.
//
//   node scripts/build-preview.mjs <outDir>
//
// Steps:
//  1. Browse every screen as the first demo user and record every GET /api response (the snapshot).
//  2. Download the photos the snapshot points to, scaled to ≤1080 px, into <outDir>/site/media.
//  3. Build the web app with VITE_STATIC=1 (src/lib/static.ts: reads the snapshot, ignores writes,
//     in-memory router) as one JS file and one CSS file.
//  4. Write <outDir>/site/index.html: the CSS and JS inlined, the snapshot embedded as JSON. Fonts come
//     from Google Fonts instead of being inlined (the only font host the artifact page allows).
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = new URL('..', import.meta.url).pathname;
const out = path.resolve(process.argv[2] ?? path.join(root, 'preview-dist'));
const base = process.env.BASE ?? 'http://localhost:5173';
const apiBase = process.env.API ?? 'http://localhost:8787';
fs.mkdirSync(path.join(out, 'site/media'), { recursive: true });

/* 1. Snapshot */
const snap = {};
const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
async function session(viewport, mobile) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, permissions: ['camera', 'microphone'], isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage();
  page.on('response', async (r) => {
    const u = new URL(r.url());
    if (!u.pathname.startsWith('/api/') || r.request().method() !== 'GET') return;
    if (!(r.headers()['content-type'] ?? '').includes('json')) return;
    try {
      snap[u.pathname.slice(4) + u.search] = await r.json();
    } catch {
      /* not json */
    }
  });
  return page;
}
const page = await session({ width: 393, height: 852 }, true);
const users = await (await page.request.get(`${base}/api/demo/users`)).json();
await page.request.post(`${base}/api/demo/login`, { data: { userId: users.users[0].id } });
const me = await (await page.request.get(`${base}/api/me`)).json();
const go = async (r, then) => {
  await page.goto(base + r, { waitUntil: 'networkidle' }).catch(() => {});
  await page.waitForTimeout(700);
  if (then) {
    await then().catch(() => {});
    await page.waitForTimeout(700);
  }
};
const click = (sel) => () => page.locator(sel).first().click({ timeout: 2000 });
for (const r of ['/', '/chats', '/journal', '/journal/calendar', '/rewind', '/me', '/me/settings', '/me/likeness', '/plans', '/notifications', '/shop', '/new-group', '/roll', '/create', '/create/remix', '/create/meme', '/create/sticker']) await go(r);
for (const g of me.groups) {
  const gid = g.id;
  await go(`/chat/${gid}`, click('header button:last-child'));
  for (const r of ['settings', 'wonder', 'trades', 'game', 'memory', 'wrapped', 'new-plan']) await go(`/g/${gid}/${r}`);
  await go(`/g/${gid}/cards`);
  const j = await (await page.request.get(`${base}/api/groups/${gid}/journal?weeks=10`)).json();
  for (const w of j.weeks) await go(`/g/${gid}/week/${w.weekKey}`);
  const plans = await (await page.request.get(`${base}/api/groups/${gid}/plans`)).json();
  for (const p of plans.plans ?? []) await go(`/plan/${p.id}`);
  const feed = await (await page.request.get(`${base}/api/groups/${gid}/feed`)).json();
  for (const p of feed.posts) {
    const d = await page.request.get(`${base}/api/posts/${p.id}`);
    if (d.ok()) snap[`/posts/${p.id}`] = await d.json();
  }
}
const wide = await session({ width: 1500, height: 960 }, false);
await wide.request.post(`${base}/api/demo/login`, { data: { userId: users.users[0].id } });
await wide.goto(base + '/', { waitUntil: 'networkidle' });
await wide.waitForTimeout(1500);
await browser.close();
if (snap['/config']) snap['/config'].demo = false; // nobody can switch person in the preview
let json = JSON.stringify(snap);

/* 2. Media */
const media = [...new Set([...json.matchAll(/"(\/media\/[^"]+)"/g)].map((m) => m[1]))];
for (const m of media) {
  const r = await fetch(apiBase + m);
  if (!r.ok) continue;
  let buf = Buffer.from(await r.arrayBuffer());
  const name = m.split('/').pop();
  if (/\.(jpe?g|png|webp)$/i.test(name)) {
    const meta = await sharp(buf).metadata();
    const strip = (meta.height ?? 0) > (meta.width ?? 0) * 2; // live-clip frame strips stay whole
    if (!strip && (meta.width ?? 0) > 1080) buf = await sharp(buf).resize({ width: 1080 }).toFormat(meta.format, { quality: 74 }).toBuffer();
  }
  fs.writeFileSync(path.join(out, 'site/media', name), buf);
}
json = json.replaceAll('"/media/', '"media/');

/* 3. Build */
const buildDir = path.join(out, 'build');
execFileSync('npx', ['vite', 'build', '--base', './', '--outDir', buildDir, '--emptyOutDir'], { cwd: path.join(root, 'apps/web'), env: { ...process.env, VITE_STATIC: '1' }, stdio: 'inherit' });
const assets = path.join(buildDir, 'assets');
const css = fs.readFileSync(path.join(assets, fs.readdirSync(assets).find((f) => f.endsWith('.css'))), 'utf8').replace(/@font-face\{[^}]*\}/g, '');
const js = fs.readFileSync(path.join(assets, fs.readdirSync(assets).find((f) => f.endsWith('.js'))), 'utf8').replaceAll('</script', '<\\/script');

/* 4. Page */
const html = `<title>roll. preview</title>
<meta name="theme-color" content="#000000">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@6..144,100..1000&display=swap">
<style>${css}
:root{--font-google:'Google Sans Flex','Google Sans',Roboto,system-ui,sans-serif;color-scheme:dark}
html,body{background:#000}
</style>
<div id="root"></div>
<script id="roll-snapshot" type="application/json">${json.replaceAll('</', '<\\/')}</script>
<script type="module">${js}</script>
`;
fs.writeFileSync(path.join(out, 'site/index.html'), html);
console.log(`preview: ${path.join(out, 'site')} (${(html.length / 1e6).toFixed(2)} MB page, ${media.length} media files)`);
