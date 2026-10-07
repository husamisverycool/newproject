#!/usr/bin/env node
// Builds the in-Claude version of the app (apps/web/src/live): the whole server runs inside the page and
// friends share state through the artifact's storage. Output is a folder ready to publish as an artifact.
//
//   node scripts/build-live.mjs <outDir> [artifactUrl]
//
// <outDir>/site/index.html   the page (publish it as the artifact)
// <outDir>/site/assets/…     JS and CSS chunks         } supporting files, listed with their published
// <outDir>/site/wasm/…       on-device vision runtime  } paths in <outDir>/site/files.json
// <outDir>/site/models/…     vision models             }
//
// `artifactUrl` (the artifact's claude.ai link, known after the first publish) is baked in so invites
// and "share profile" point at the app.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = new URL('..', import.meta.url).pathname;
const out = path.resolve(process.argv[2] ?? path.join(root, 'live-dist'));
const artifactUrl = process.argv[3] ?? '';
const build = path.join(out, 'build');
const site = path.join(out, 'site');
fs.rmSync(site, { recursive: true, force: true });
fs.mkdirSync(path.join(site, 'assets'), { recursive: true });

execFileSync('npx', ['vite', 'build', '--base', './', '--outDir', build, '--emptyOutDir'], {
  cwd: path.join(root, 'apps/web'),
  env: { ...process.env, VITE_LIVE: '1', VITE_LIVE_URL: artifactUrl },
  stdio: ['ignore', 'ignore', 'inherit'],
});

// Chunks. Fonts come from Google Fonts (the font host the artifact page allows), so @font-face rules
// pointing at bundled font files are dropped.
const files = {};
for (const f of fs.readdirSync(path.join(build, 'assets'))) {
  const src = path.join(build, 'assets', f);
  if (f.endsWith('.css')) fs.writeFileSync(path.join(site, 'assets', f), fs.readFileSync(src, 'utf8').replace(/@font-face\{[^}]*\}/g, ''));
  else if (f.endsWith('.js')) fs.copyFileSync(src, path.join(site, 'assets', f));
  else continue;
  files[`assets/${f}`] = path.join(site, 'assets', f);
}

// MediaPipe (stickers' cut-outs, Me Meme's face box): the SIMD runtime and its fallback, and the models.
fs.mkdirSync(path.join(site, 'wasm'), { recursive: true });
for (const f of ['vision_wasm_internal.js', 'vision_wasm_internal.wasm', 'vision_wasm_nosimd_internal.js', 'vision_wasm_nosimd_internal.wasm']) {
  fs.copyFileSync(path.join(build, 'wasm', f), path.join(site, 'wasm', f));
  files[`wasm/${f}`] = path.join(site, 'wasm', f);
}
fs.mkdirSync(path.join(site, 'models'), { recursive: true });
// Artifacts serve only web media types, so each model goes as base64 text (lib/vision.ts decodes it).
for (const f of fs.readdirSync(path.join(root, 'apps/web/public/models')).filter((x) => x.endsWith('.tflite'))) {
  const name = `${f}.b64.txt`;
  fs.writeFileSync(path.join(site, 'models', name), fs.readFileSync(path.join(root, 'apps/web/public/models', f)).toString('base64'));
  files[`models/${name}`] = path.join(site, 'models', name);
}

// The page: the build's entry script and stylesheet, plus the theme the app expects.
const html = fs.readFileSync(path.join(build, 'index.html'), 'utf8');
const entry = /<script type="module"[^>]*src="\.\/(assets\/[^"]+\.js)"/.exec(html)?.[1];
const css = [...html.matchAll(/<link rel="stylesheet"[^>]*href="\.\/(assets\/[^"]+\.css)"/g)].map((m) => m[1]);
if (!entry) throw new Error('entry script not found in the build');
const page = `<title>roll.</title>
<meta name="theme-color" content="#000000">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@6..144,100..1000&display=swap">
${css.map((c) => `<link rel="stylesheet" href="${c}">`).join('\n')}
<style>
:root{--font-google:'Google Sans Flex','Google Sans',Roboto,system-ui,sans-serif;color-scheme:dark}
html,body{background:#000;margin:0;height:100%}
#root{height:100%}
</style>
<div id="root"></div>
<script type="module" src="${entry}"></script>
`;
fs.writeFileSync(path.join(site, 'index.html'), page);
fs.writeFileSync(path.join(site, 'files.json'), JSON.stringify(files, null, 1));
const bytes = Object.values(files).reduce((n, f) => n + fs.statSync(f).size, 0);
console.log(`live build: ${site} — ${Object.keys(files).length} files, ${(bytes / 1e6).toFixed(1)} MB`);
