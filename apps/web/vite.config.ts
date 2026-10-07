import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const wasmDir = path.resolve(__dirname, '../../node_modules/@mediapipe/tasks-vision/wasm');

/** Serve MediaPipe's WASM runtime from node_modules in dev and copy it into the build. */
function mediapipeWasm(): Plugin {
  return {
    name: 'mediapipe-wasm',
    configureServer(server) {
      server.middlewares.use('/wasm', (req, res, next) => {
        const file = path.join(wasmDir, path.basename((req.url ?? '').split('?')[0]));
        if (!fs.existsSync(file)) return next();
        res.setHeader('content-type', file.endsWith('.wasm') ? 'application/wasm' : 'text/javascript');
        fs.createReadStream(file).pipe(res);
      });
    },
    generateBundle() {
      for (const f of fs.readdirSync(wasmDir)) {
        this.emitFile({ type: 'asset', fileName: `wasm/${f}`, source: fs.readFileSync(path.join(wasmDir, f)) });
      }
    },
  };
}

const API = `http://localhost:${process.env.API_PORT ?? 8787}`;

/**
 * In-Claude build (VITE_LIVE=1, src/live): the server is bundled into the page, so its Node-only
 * imports resolve to browser stand-ins.
 */
const LIVE = process.env.VITE_LIVE === '1';
const shim = (f: string) => path.resolve(__dirname, 'src/live/shims', f);
const liveAliases = [
  { find: /^node:sqlite$/, replacement: shim('sqlite.ts') },
  { find: /^sharp$/, replacement: shim('sharp.ts') },
  { find: /^node:fs$/, replacement: shim('node-fs.ts') },
  { find: /^node:path$/, replacement: shim('node-path.ts') },
  { find: /^node:url$/, replacement: shim('node-url.ts') },
  { find: /^ws$/, replacement: shim('empty.ts') },
  { find: /^web-push$/, replacement: shim('web-push.ts') },
  { find: /^@anthropic-ai\/sdk(\/.*)?$/, replacement: shim('empty.ts') },
];

/** Outside the in-Claude build, the page engine (and the server it bundles) is left out. */
function liveOnly(): Plugin {
  const real = path.resolve(__dirname, 'src/live/engine.ts');
  const stub = '\0live-engine-stub';
  return {
    name: 'live-only',
    enforce: 'pre',
    resolveId(source, importer) {
      if (LIVE || !importer || !source.endsWith('engine')) return null;
      return path.resolve(path.dirname(importer), source) + '.ts' === real ? stub : null;
    },
    load(id) {
      return id === stub ? 'export const engine = () => Promise.reject(new Error("in-Claude build only")); export const suggestedJoinCode = async () => null;' : null;
    },
  };
}

export default defineConfig({
  plugins: [react(), mediapipeWasm(), liveOnly()],
  resolve: LIVE ? { alias: liveAliases } : undefined,
  define: LIVE ? { 'process.env.NODE_ENV': JSON.stringify('production'), 'process.env': JSON.stringify({ DEMO: '0' }) } : undefined,
  server: {
    port: Number(process.env.WEB_PORT ?? 5173),
    host: true,
    allowedHosts: true,
    proxy: {
      '/api': API,
      '/media': API,
      '/ws': { target: API, ws: true },
    },
  },
  // `vite preview` serves the production build with the same API proxy (used for phone previews through a tunnel).
  preview: {
    port: Number(process.env.PREVIEW_PORT ?? 4173),
    host: true,
    allowedHosts: true,
    proxy: {
      '/api': API,
      '/media': API,
      '/ws': { target: API, ws: true },
    },
  },
  build: LIVE
    ? // In-Claude build: ordinary chunks (the page loads them as same-origin files), relative URLs.
      { target: 'es2022', sourcemap: false, chunkSizeWarningLimit: 100_000, assetsInlineLimit: 0 }
    : process.env.VITE_STATIC === '1'
      ? // Static preview (src/lib/static.ts): one JS file and one CSS file with every asset inlined, so the
        // page can be published as a single self-contained artifact.
        { target: 'es2022', sourcemap: false, cssCodeSplit: false, assetsInlineLimit: 100_000_000, chunkSizeWarningLimit: 100_000, rollupOptions: { output: { inlineDynamicImports: true } } }
      : { target: 'es2022', sourcemap: false, chunkSizeWarningLimit: 900 },
});
