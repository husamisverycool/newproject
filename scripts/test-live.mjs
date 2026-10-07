#!/usr/bin/env node
// End-to-end test of the in-Claude build with two friends on one shared store (scripts/live-mock.mjs).
//
//   VITE_LIVE=1 npx vite build --base ./ --outDir <dir>   (in apps/web)
//   node scripts/test-live.mjs <dir> [shotsDir]
//
// Alice (the artifact's owner) signs up, makes a group and posts a photo. Bob opens the shared app,
// is offered Alice's group, joins, sees her photo and writes in the chat; Alice sees his message.
// Then Bob reloads and must come back signed in with the same data, from the shared log alone.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { serveLive, openViewer, state } from './live-mock.mjs';

const dir = process.argv[2];
const shots = process.argv[3] ?? null;
if (!dir) throw new Error('usage: node scripts/test-live.mjs <buildDir> [shotsDir]');
if (shots) fs.mkdirSync(shots, { recursive: true });

const server = await serveLive(path.resolve(dir));
const browser = await chromium.launch();
const failures = [];
const check = (ok, what) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failures.push(what);
};
const snap = async (page, name) => shots && page.screenshot({ path: path.join(shots, `${name}.png`) });
const visibleButtons = async (page) => (await page.locator('button:visible').allInnerTexts()).map((t) => t.trim()).filter(Boolean);
const clickFirst = async (page, names) => {
  const b = await visibleButtons(page);
  const pick = names.find((n) => b.includes(n));
  if (!pick) return false;
  await page.getByRole('button', { name: pick, exact: true }).last().click();
  return true;
};
const photo = path.resolve('research/inspo/frames', fs.readdirSync('research/inspo/frames').find((f) => f.endsWith('.jpg')));

async function signUp(page, name, makeGroup) {
  await page.getByRole('button', { name: 'Set up my roll.' }).click({ timeout: 20_000 });
  await page.locator('input:visible').first().fill(name);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.waitForTimeout(600);
  await page.getByRole('button', { name: 'Continue' }).click(); // birthday
  await page.waitForTimeout(600);
  await page.getByRole('button', { name: 'Not now' }).click(); // contacts
  await page.getByRole('button', { name: 'Continue' }).last().click(); // "Skip contacts?"
  await page.waitForTimeout(1500);
  if (!makeGroup) {
    // The shared app suggests the owner's group: the join page.
    const going = page.getByRole('button', { name: /Going/ }).first();
    check(await going.isVisible().catch(() => false), `${name} is offered the owner's group`);
    await snap(page, `${name}-join`);
    await going.click();
    await page.waitForTimeout(1500);
  }
  await page.getByRole('button', { name: 'Not now' }).click(); // rewind
  await page.waitForTimeout(800);
  if (makeGroup) {
    const i = page.locator('input:visible');
    await i.nth(0).fill('Duo');
    await i.nth(1).fill('Besties');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForTimeout(1500);
    await page.getByRole('button', { name: 'Continue' }).click(); // invite
    await page.waitForTimeout(600);
  }
  for (let n = 0; n < 4; n++) {
    await page.waitForTimeout(700);
    if (!(await clickFirst(page, ['Not now', 'Add Widget', 'Continue']))) break;
  }
  await page.waitForTimeout(1500);
}

try {
  const alice = await openViewer(browser, server, { id: 'u_alice', name: 'Alice', owner: true });
  const a = alice.page;
  await signUp(a, 'Alice', true);
  await snap(a, 'alice-home');
  check(await a.getByRole('button', { name: 'Take Picture' }).first().isVisible(), 'Alice reaches the camera');

  // No camera inside the frame: the shutter opens the system camera (a file chooser).
  const [chooser] = await Promise.all([a.waitForEvent('filechooser', { timeout: 8000 }), a.getByRole('button', { name: 'Take Picture' }).first().dispatchEvent('pointerdown')]);
  await chooser.setFiles(photo);
  await a.getByRole('button', { name: 'Send to friends' }).click({ timeout: 10_000 });
  await a.waitForTimeout(4000);
  await snap(a, 'alice-sent');
  const opsAfterAlice = [...state.docs.keys()].filter((k) => k.startsWith('ops/')).length;
  check(opsAfterAlice >= 3, `Alice's writes reached the shared log (${opsAfterAlice} ops)`);

  const bob = await openViewer(browser, server, { id: 'u_bob', name: 'Bob', assets: false });
  const b = bob.page;
  await signUp(b, 'Bob', false);
  await snap(b, 'bob-home');
  check(await b.getByRole('button', { name: 'Take Picture' }).first().isVisible(), 'Bob reaches the camera');
  // Chat: Bob writes, Alice reads.
  await b.evaluate(() => document.querySelector('[class*="pager"]')?.scrollTo({ top: 0 }));
  await b.waitForTimeout(600);
  await b.getByRole('button', { name: 'Notifications' }).first().click();
  await b.waitForTimeout(1500);
  await b.getByPlaceholder('start typing...').fill('hi from bob');
  await b.getByRole('button', { name: 'Share' }).first().click();
  await b.waitForTimeout(1500);
  await snap(b, 'bob-chat');
  await a.getByRole('button', { name: 'Notifications' }).first().click();
  await a.waitForTimeout(4000);
  await snap(a, 'alice-chat');
  check(await a.getByText('hi from bob').first().isVisible().catch(() => false), 'Alice sees Bob’s message');

  // Alice posts again; Bob (a member now — new members see posts from when they joined, spec §C)
  // gets it live, without reloading.
  await a.getByRole('button', { name: 'Back' }).first().click();
  await a.waitForTimeout(1200);
  const [chooser2] = await Promise.all([a.waitForEvent('filechooser', { timeout: 8000 }), a.getByRole('button', { name: 'Take Picture' }).first().dispatchEvent('pointerdown')]);
  await chooser2.setFiles(photo);
  await a.getByRole('button', { name: 'Send to friends' }).click({ timeout: 10_000 });
  await a.waitForTimeout(3000);
  await b.getByRole('button', { name: 'Back' }).first().click();
  await b.waitForTimeout(1500);
  await b.locator('button', { hasText: 'History' }).first().click();
  await b.waitForTimeout(3000);
  await snap(b, 'bob-history');
  const imgs = await b.locator('img[src^="/_blob/"], img[src^="data:image"]').count();
  check(imgs > 0, `Bob sees Alice's new photo (${imgs} images)`);

  // Bob posts (he cannot upload assets, so his photo is stored in shared documents) and Alice sees it.
  await b.locator('[class*="pager"]').first().evaluate((el) => el.scrollTo({ top: 0 }));
  await b.waitForTimeout(800);
  const [chooser3] = await Promise.all([b.waitForEvent('filechooser', { timeout: 8000 }), b.getByRole('button', { name: 'Take Picture' }).first().dispatchEvent('pointerdown')]);
  await chooser3.setFiles(photo);
  await b.getByRole('button', { name: 'Send to friends' }).click({ timeout: 10_000 });
  await b.waitForTimeout(3000);
  check([...state.docs.keys()].some((k) => k.startsWith('media/')), 'Bob’s photo is stored in shared documents');
  await a.locator('[class*="pager"]').first().evaluate((el) => el.scrollTo({ top: el.clientHeight }));
  await a.waitForTimeout(3500);
  await snap(a, 'alice-history');
  check((await a.locator('img[src^="data:image"]').count()) > 0, 'Alice sees Bob’s photo from shared documents');

  // Idle pages must not keep writing to each other (no feedback loop through refetches).
  const before = state.writes;
  await a.waitForTimeout(12_000);
  const idleWrites = state.writes - before;
  check(idleWrites <= 3, `idle pages stay quiet (${idleWrites} writes in 12 s)`);

  // Bob comes back later: everything is rebuilt from the shared log.
  await b.reload();
  await b.waitForTimeout(5000);
  await snap(b, 'bob-reload');
  check(await b.getByRole('button', { name: 'Take Picture' }).first().isVisible().catch(() => false), 'Bob is still signed in after a reload');

  for (const v of [alice.viewer, bob.viewer]) {
    const errs = v.logs.filter((l) => l.startsWith('[pageerror]') || (l.startsWith('[error]') && !l.includes('favicon')));
    check(!errs.length, `${v.name}: no page errors${errs.length ? `\n      ${errs.slice(0, 5).join('\n      ')}` : ''}`);
  }
  console.log(`shared store: ${state.docs.size} documents, ${state.assets.size} assets, ${state.writes} writes`);
} finally {
  await browser.close();
  server.server.close();
}
if (failures.length) {
  console.log(`\n${failures.length} failed`);
  process.exit(1);
}
