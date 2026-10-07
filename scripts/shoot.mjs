// Screenshot harness: node scripts/shoot.mjs <out.png> <path> [--mobile] [--user=N] [--wait=ms] [--click=selector]... [--scroll=px]
import { chromium } from '@playwright/test';

const args = process.argv.slice(2);
const out = args[0];
const path = args[1] ?? '/';
const opt = (k, d) => (args.find((a) => a.startsWith(`--${k}=`)) ?? `--${k}=${d}`).split('=').slice(1).join('=');
const flags = new Set(args.filter((a) => a.startsWith('--') && !a.includes('=')));
const base = process.env.BASE ?? 'http://localhost:5173';
const mobile = flags.has('--mobile');
const cam = process.env.FAKECAM;

const browser = await chromium.launch({
  args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', ...(cam ? [`--use-file-for-fake-video-capture=${cam}`] : [])],
});
const ctx = await browser.newContext({
  viewport: mobile ? { width: 393, height: 852 } : { width: 1500, height: 960 },
  deviceScaleFactor: mobile ? 2 : 1,
  permissions: ['camera', 'microphone'],
  isMobile: mobile,
  hasTouch: mobile,
});
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') console.log('console:', m.text()); });
page.on('pageerror', (e) => console.log('pageerror:', e.message));
const userIdx = Number(opt('user', '0'));
if (userIdx >= 0) {
  const users = await (await page.request.get(`${base}/api/demo/users`)).json();
  await page.request.post(`${base}/api/demo/login`, { data: { userId: users.users[userIdx].id } });
}
await page.goto(base + path, { waitUntil: 'networkidle' });
await page.waitForTimeout(Number(opt('wait', '1200')));
for (const a of args.filter((x) => x.startsWith('--click='))) {
  const sel = a.slice('--click='.length);
  await page.locator(sel).first().click();
  await page.waitForTimeout(900);
}
const scroll = opt('scroll', '');
if (scroll) {
  await page.evaluate((y) => { const el = document.querySelector('[class*="pager"]') ?? document.querySelector('.scroll'); el?.scrollTo({ top: Number(y) }); }, scroll);
  await page.waitForTimeout(900);
}
const evalJs = opt('eval', '');
if (evalJs) { await page.evaluate(evalJs); await page.waitForTimeout(900); }
if (flags.has('--device')) await page.locator('[data-device=app]').screenshot({ path: out });
else if (flags.has('--both')) {
  const a = await page.locator('[data-device=app]').boundingBox();
  const b = await page.locator('[data-device=system]').boundingBox().catch(() => null);
  const x = a.x - 10, w = (b ? b.x + b.width : a.x + a.width) - x + 10;
  await page.screenshot({ path: out, clip: { x, y: Math.max(0, a.y - 10), width: w, height: a.height + 20 } });
} else await page.screenshot({ path: out });
await browser.close();
console.log('shot', out);
