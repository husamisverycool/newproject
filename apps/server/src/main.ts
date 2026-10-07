import './bootstrap.ts';
import fs from 'node:fs';
import path from 'node:path';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import type { Server } from 'node:http';
import { env, paths } from './env.ts';
import { api } from './routes.ts';
import { attachRealtime } from './realtime.ts';
import { startJobs } from './jobs.ts';

const app = new Hono();

app.route('/api', api);

const TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.webm': 'audio/webm', '.m4a': 'audio/mp4',
  '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json',
  '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain',
};

function sendFile(file: string, cache: string) {
  const ext = path.extname(file).toLowerCase();
  return new Response(fs.readFileSync(file), { headers: { 'content-type': TYPES[ext] ?? 'application/octet-stream', 'cache-control': cache } });
}

app.get('/media/:file', (c) => {
  const file = path.join(paths.media, path.basename(c.req.param('file')));
  if (!fs.existsSync(file)) return c.notFound();
  return sendFile(file, 'public, max-age=31536000, immutable');
});

// Production: serve the built PWA with an SPA fallback.
if (fs.existsSync(env.webDist)) {
  app.get('*', (c) => {
    const rel = decodeURIComponent(new URL(c.req.url).pathname);
    const file = path.join(env.webDist, path.normalize(rel).replace(/^(\.\.[/\\])+/, ''));
    if (rel !== '/' && fs.existsSync(file) && fs.statSync(file).isFile()) {
      return sendFile(file, rel.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache');
    }
    return sendFile(path.join(env.webDist, 'index.html'), 'no-cache');
  });
}

const server = serve({ fetch: app.fetch, port: env.port }, (info) => {
  console.log(`roll. server on http://localhost:${info.port}  (image AI: ${env.geminiKey ? 'gemini' : 'local'}, game master: ${env.anthropicKey ? 'claude' : 'scripted'})`);
}) as Server;

attachRealtime(server);
if (process.env.NO_JOBS !== '1') startJobs();
