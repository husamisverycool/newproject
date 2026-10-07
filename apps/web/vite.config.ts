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

export default defineConfig({
  plugins: [react(), mediapipeWasm()],
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
  build:
    process.env.VITE_STATIC === '1'
      ? // Static preview (src/lib/static.ts): one JS file and one CSS file with every asset inlined, so the
        // page can be published as a single self-contained artifact.
        { target: 'es2022', sourcemap: false, cssCodeSplit: false, assetsInlineLimit: 100_000_000, chunkSizeWarningLimit: 100_000, rollupOptions: { output: { inlineDynamicImports: true } } }
      : { target: 'es2022', sourcemap: false, chunkSizeWarningLimit: 900 },
});
