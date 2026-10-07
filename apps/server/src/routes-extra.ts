import { Hono, type Context } from 'hono';
import { MASCOT_SPECIES, type CreationKind } from '@app/shared';
import { now } from './db.ts';
import { getGroup, getPost, membership, type UserFull } from './repo.ts';
import { exportImage, readMedia, storeImage } from './media.ts';
import * as plans from './services/plans.ts';
import * as objects from './services/objects.ts';
import * as search from './services/search.ts';
import * as bestie from './services/bestie.ts';
import * as wrappedSvc from './services/wrapped.ts';
import { GameError } from './services/cards.ts';
import { toDTO, visiblePosts } from './services/posts.ts';

/**
 * Endpoints for the features finished in this pass (mounted from routes.ts after its auth middleware):
 * Partiful plan editing, poster, comments; self-tags and caption search (spec §L/§S); the bestie lane
 * (spec §C); Google Photos Create tools made on the device (spec §G/§H); Wrapped Party "Make it your own"
 * and hand-off (spec §V); and the watermarked photo export used by Save / Share (spec §Q).
 */
type Env = { Variables: { user: UserFull } };
export const extra = new Hono<Env>();

const user = (c: Context<Env>) => c.get('user');
const year = () => new Date(now()).getUTCFullYear();

function memberGroup(c: Context<Env>) {
  const group = getGroup(c.req.param('groupId')!);
  if (!group || !membership(group.id, user(c).id)) throw new GameError('not_found');
  return group;
}

async function fileBuf(v: unknown): Promise<Buffer | null> {
  if (v && typeof v === 'object' && 'arrayBuffer' in v) return Buffer.from(await (v as File).arrayBuffer());
  return null;
}

async function filesBuf(v: unknown): Promise<Buffer[]> {
  const list = Array.isArray(v) ? v : v ? [v] : [];
  const out: Buffer[] = [];
  for (const f of list) {
    const b = await fileBuf(f);
    if (b) out.push(b);
  }
  return out;
}

const isMultipart = (c: Context) => (c.req.header('content-type') ?? '').includes('multipart');

/* ───────────────────────── plans (Partiful) ───────────────────────── */

extra.patch('/plans/:planId', async (c) => {
  plans.updatePlan(c.req.param('planId'), user(c).id, await c.req.json());
  return c.json({ plan: plans.planView(c.req.param('planId'), user(c).id) });
});

extra.delete('/plans/:planId', (c) => {
  plans.deletePlan(c.req.param('planId'), user(c).id);
  return c.json({ ok: true });
});

extra.post('/plans/:planId/poster', async (c) => {
  const body = await c.req.parseBody();
  const buf = await fileBuf(body.file);
  if (!buf) throw new GameError('file_required');
  plans.setPoster(c.req.param('planId'), user(c).id, (await storeImage(buf, user(c).plan)).url);
  return c.json({ plan: plans.planView(c.req.param('planId'), user(c).id) });
});

extra.delete('/plans/:planId/poster', (c) => {
  plans.setPoster(c.req.param('planId'), user(c).id, null);
  return c.json({ plan: plans.planView(c.req.param('planId'), user(c).id) });
});

extra.post('/plans/:planId/comments', async (c) => {
  let input: { body?: string; media?: string | null; mentions?: string[] };
  if (isMultipart(c)) {
    const b = await c.req.parseBody();
    const buf = await fileBuf(b.file);
    input = { body: b.body ? String(b.body) : '', media: buf ? (await storeImage(buf, user(c).plan)).url : null, mentions: String(b.mentions ?? '').split(',').filter(Boolean) };
  } else input = await c.req.json();
  plans.addComment(c.req.param('planId'), user(c).id, input);
  return c.json({ plan: plans.planView(c.req.param('planId'), user(c).id) });
});

extra.delete('/plans/:planId/comments/:commentId', (c) => {
  plans.deleteComment(c.req.param('planId'), c.req.param('commentId'), user(c).id);
  return c.json({ plan: plans.planView(c.req.param('planId'), user(c).id) });
});

/** Text Blast with a photo [V] ("You can send a photo along with your message"). JSON blasts stay on routes.ts. */
extra.post('/plans/:planId/blast-photo', async (c) => {
  const b = await c.req.parseBody();
  const buf = await fileBuf(b.file);
  if (!buf) throw new GameError('file_required');
  const audience = String(b.audience ?? '').split(',').filter(Boolean) as plans.RsvpStatus[];
  const media = (await storeImage(buf, user(c).plan)).url;
  return c.json({ id: plans.blast(c.req.param('planId'), user(c).id, String(b.text ?? ''), audience.length ? audience : 'all', media) });
});

/* ───────────────────────── posts: export, self-tags, search ───────────────────────── */

/** Save / Share a photo: the visible watermark (group mascot + app name, spec §Q) and the embedded manifest. */
extra.get('/posts/:postId/export', async (c) => {
  const p = getPost(c.req.param('postId'));
  const g = p ? getGroup(p.groupId) : null;
  if (!p || !g || !visiblePosts(g, user(c).id).some((x) => x.id === p.id)) throw new GameError('not_found');
  const species = MASCOT_SPECIES.find((s) => s.id === g.mascot.species) ?? MASCOT_SPECIES[0];
  const buf = await exportImage(await readMedia(p.media.original ?? p.media.main), { generator: 'camera', model: null, createdAt: p.takenAt, subjects: [p.userId], consentChecked: true, watermark: 'visible' }, {
    mascotColor: species.body, handle: user(c).name.toLowerCase().replace(/\s+/g, ''),
  });
  return new Response(new Uint8Array(buf), { headers: { 'content-type': 'image/jpeg', 'content-disposition': `inline; filename="${p.id}.jpg"` } });
});

/** Self-tagging only (spec §S): the body names no user — the tag is always the caller. */
extra.post('/posts/:postId/tag', async (c) => {
  const p = getPost(c.req.param('postId'));
  const g = p ? getGroup(p.groupId) : null;
  if (!p || !g || !visiblePosts(g, user(c).id).some((x) => x.id === p.id)) throw new GameError('not_found');
  const { on } = await c.req.json<{ on: boolean }>();
  search.setSelfTag(p, user(c).id, Boolean(on));
  return c.json({ post: toDTO([p], user(c).id)[0] });
});

extra.get('/groups/:groupId/search', (c) => c.json({ posts: search.search(memberGroup(c), user(c).id, String(c.req.query('q') ?? '').slice(0, 80)) }));

/* ───────────────────────── bestie lane (Locket Best Friend widget) ───────────────────────── */

extra.get('/bestie/:userId', (c) => c.json(bestie.lane(user(c), c.req.param('userId'))));
extra.get('/widgets/bestie', (c) => c.json({ bestie: bestie.widget(user(c)) }));

extra.post('/bestie/:userId/photos', async (c) => {
  const b = await c.req.parseBody();
  const buf = await fileBuf(b.main);
  if (!buf) throw new GameError('photo_required');
  const groupId = String(b.groupId ?? '');
  bestie.assertPair(groupId, user(c).id, c.req.param('userId'));
  const stored = await storeImage(buf, user(c).plan);
  const caption = String(b.caption ?? '').trim().slice(0, 140) || null;
  return c.json({ id: bestie.sendDirect(user(c), groupId, c.req.param('userId'), { main: stored.url, thumb: stored.thumb }, caption) });
});

/* ───────────────────────── Create tools made on the device ───────────────────────── */

extra.post('/objects/creation', async (c) => {
  const b = await c.req.parseBody({ all: true });
  const video = await fileBuf(b.video);
  const o = await objects.saveCreation(user(c), {
    groupId: String(b.groupId ?? ''),
    kind: String(b.kind) as CreationKind,
    frames: await filesBuf(b.frames),
    delay: Number(b.delay) || 100,
    video,
    videoType: String(b.videoType ?? ''),
    poster: await fileBuf(b.poster),
    sourcePostIds: String(b.sourcePostIds ?? '').split(',').filter(Boolean),
    style: b.style ? String(b.style) : null,
    meta: JSON.parse(String(b.meta ?? '{}')) as Record<string, unknown>,
  });
  return c.json({ object: o });
});

/* ───────────────────────── Wrapped Party: Make it your own, hand off hosting ───────────────────────── */

extra.patch('/groups/:groupId/party', async (c) => {
  const { name } = await c.req.json<{ name: string }>();
  return c.json({ party: wrappedSvc.renameParty(memberGroup(c).id, user(c).id, name, year()) });
});

extra.post('/groups/:groupId/party/profile', async (c) => {
  const g = memberGroup(c);
  const b = await c.req.parseBody();
  const buf = await fileBuf(b.file);
  const avatar = buf ? (await storeImage(buf, 'free')).thumb : String(b.removePhoto) === 'true' ? null : undefined;
  return c.json({ party: wrappedSvc.setPartyProfile(g.id, user(c).id, { name: b.name === undefined ? undefined : String(b.name), avatar }, year()) });
});

extra.post('/groups/:groupId/party/host', async (c) => {
  const { userId } = await c.req.json<{ userId: string }>();
  return c.json({ party: wrappedSvc.handOffParty(memberGroup(c).id, user(c).id, userId, year()) });
});
