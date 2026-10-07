import { Hono } from 'hono';
import { api } from './routes.ts';

/**
 * The server as the in-Claude build runs it inside the page (apps/web/src/live/engine.ts): the same
 * routes, answered through `app.fetch` instead of a socket. The page sets the hooks in platform.ts
 * and the media store (media.ts) before the first request.
 */
export const app = new Hono();
app.route('/api', api);

export { platform } from './platform.ts';
export { setMediaStore } from './media.ts';
export { runJobsOnce } from './jobs.ts';
export { env } from './env.ts';
