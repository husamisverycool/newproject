import sharp from 'sharp';
import { zipSync, strToU8 } from 'fflate';
import { MASCOT_SPECIES, PLANS, aiRemaining, canUseLikeness, type Group } from '@app/shared';
import { all, get, json, now, run } from '../db.ts';
import { exportAnimated, exportImage, readMedia, storePng, writeMedia, escapeXml } from '../media.ts';
import { getGroup, getObject, getPost, getUser, groupsForUser, insertObject, objectsFor, publicUser, type UserFull } from '../repo.ts';
import * as img from '../ai/image.ts';
import { GameError } from './cards.ts';
import { push } from './notify.ts';

/**
 * Likeness objects (spec §F, §H, §I, §S). Every generation passes the consent check (Sora Cameos
 * model), is metered against the member's monthly AI allowance (Snapchat Lens+ compute limits), is
 * logged for every subject ("see every object made with my face"), and leaves the app only with a
 * visible watermark plus embedded provenance.
 */

export function enrollLikeness(userId: string, selfies: string[], face: string | null, verified: boolean) {
  run('INSERT OR REPLACE INTO likeness (user_id, selfies, face, verified, enrolled_at) VALUES (?, ?, ?, ?, ?)', userId, json.str(selfies), face, verified ? 1 : 0, now());
}

export function likenessOf(userId: string) {
  const r = get<{ selfies: string; face: string | null; verified: number; enrolled_at: number }>('SELECT * FROM likeness WHERE user_id = ?', userId);
  return r ? { selfies: json.parse<string[]>(r.selfies, []), face: r.face, verified: !!r.verified, enrolledAt: r.enrolled_at } : null;
}

export function consent(actor: UserFull, subjectIds: string[], groupId: string | null) {
  const actorGroups = groupsForUser(actor.id).map((g) => g.id);
  for (const sid of subjectIds) {
    const owner = getUser(sid);
    if (!owner) throw new GameError('no_subject');
    const r = canUseLikeness({ owner, actorId: actor.id, groupId, ownerGroupIds: groupsForUser(sid).map((g) => g.id), actorGroupIds: actorGroups });
    if (!r.ok) throw new GameError(`consent_${r.reason}`, `${owner.name} hasn't allowed this`);
  }
}

export function meter(actor: UserFull) {
  const used = img.aiUsedThisMonth(actor.id);
  const left = aiRemaining(actor.plan, used);
  if (left <= 0) throw new GameError('ai_limit', `You've used all ${PLANS[actor.plan].aiMonthly} AI creations this month`);
  return { used, left };
}

function notifySubjects(actor: UserFull, subjectIds: string[], objectId: string, kind: string, groupId: string | null) {
  for (const s of subjectIds) {
    if (s === actor.id) continue;
    push({ userId: s, groupId, kind: 'likeness_used', title: 'Your likeness was used', body: `${actor.name} made a ${kind} with you. You can see it or revoke it.`, refIds: [objectId], url: '/me/likeness' });
  }
}

function provenance(generator: string, model: string, subjects: string[]) {
  return { generator, model, createdAt: now(), subjects, consentChecked: true, watermark: 'both' as const };
}

export async function makeSticker(actor: UserFull, input: { cutout: Buffer; original: Buffer | null; groupId: string | null; subjectId: string; sourcePostId?: string | null }) {
  consent(actor, [input.subjectId], input.groupId);
  const res = await img.sticker(input.cutout, input.original);
  const stored = await storePng(await sharp(res.image).png().toBuffer());
  const o = insertObject({
    groupId: input.groupId, kind: 'sticker', createdBy: actor.id, subjects: [input.subjectId], media: stored.url, style: 'die-cut',
    provenance: provenance('roll. stickers', res.model, [input.subjectId]), createdAt: now(), meta: { sourcePostId: input.sourcePostId ?? null },
  });
  notifySubjects(actor, [input.subjectId], o.id, 'sticker', input.groupId);
  return o;
}

export async function makeRemix(actor: UserFull, input: { postId: string; style: string; subjects: string[]; groupId: string; cutout?: Buffer | null }) {
  const post = getPost(input.postId);
  if (!post || post.groupId !== input.groupId) throw new GameError('bad_post');
  consent(actor, input.subjects, input.groupId);
  meter(actor);
  const res = await img.remix(input.style, readMedia(post.media.main), { caption: post.caption, cutout: input.cutout ?? null });
  img.recordUsage(actor.id, res.costUsd);
  const ext = input.style === '8bit' || input.style === 'sticker' || input.style === 'enamel_pin' ? 'png' : 'jpg';
  const media = writeMedia(res.image, ext).url;
  const o = insertObject({
    groupId: input.groupId, kind: 'comic', createdBy: actor.id, subjects: input.subjects, media, style: input.style,
    provenance: provenance('roll. remix', res.model, input.subjects), createdAt: now(), meta: { sourcePostId: post.id, generator: res.generator },
  });
  notifySubjects(actor, input.subjects, o.id, 'remix', input.groupId);
  return o;
}

export async function makeFigurine(actor: UserFull, input: { cutout: Buffer; original: Buffer; subjectId: string; groupId: string }) {
  if (!PLANS[actor.plan].figurines) throw new GameError('plan_required', 'Figurines are part of Remix+');
  consent(actor, [input.subjectId], input.groupId);
  meter(actor);
  const group = getGroup(input.groupId)!;
  const subject = getUser(input.subjectId)!;
  const res = await img.figurine(input.cutout, input.original, { name: subject.name, groupName: group.name });
  img.recordUsage(actor.id, res.costUsd);
  const o = insertObject({
    groupId: input.groupId, kind: 'figurine', createdBy: actor.id, subjects: [input.subjectId], media: writeMedia(res.image, 'jpg').url, style: 'figurine',
    provenance: provenance('roll. figurines', res.model, [input.subjectId]), createdAt: now(), meta: { generator: res.generator },
  });
  notifySubjects(actor, [input.subjectId], o.id, 'figurine', input.groupId);
  return o;
}

export async function makeMeme(actor: UserFull, input: { template: Buffer; face: Buffer; box: { x: number; y: number; w: number; h: number }; subjectId: string; groupId: string; top?: string; bottom?: string; templatePostId?: string | null }) {
  consent(actor, [input.subjectId], input.groupId);
  meter(actor);
  const res = await img.meme(input.template, input.face, input.box, { top: input.top, bottom: input.bottom });
  img.recordUsage(actor.id, res.costUsd);
  const o = insertObject({
    groupId: input.groupId, kind: 'meme', createdBy: actor.id, subjects: [input.subjectId], media: writeMedia(res.image, 'jpg').url, style: 'me-meme',
    provenance: provenance('roll. me meme', res.model, [input.subjectId]), createdAt: now(), meta: { templatePostId: input.templatePostId ?? null, generator: res.generator },
  });
  notifySubjects(actor, [input.subjectId], o.id, 'meme', input.groupId);
  return o;
}

/**
 * Printable eight-page zine from a week (Popsa auto-layout, Chatbooks) — one sheet that folds into
 * a booklet: 8 panels on a 4×2 grid, the top row rotated 180° for the classic fold.
 */
export async function makeZine(actor: UserFull, group: Group, weekKey: string, postIds: string[]) {
  const posts = postIds.map((p) => getPost(p)).filter((p): p is NonNullable<typeof p> => Boolean(p && p.groupId === group.id)).slice(0, 6);
  if (!posts.length) throw new GameError('no_posts');
  const W = 3300;
  const H = 2550; // US Letter landscape at 300dpi
  const pw = W / 4;
  const ph = H / 2;
  const species = MASCOT_SPECIES.find((s) => s.id === group.mascot.species) ?? MASCOT_SPECIES[0];
  const pages: Buffer[] = [];
  const cover = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${pw}" height="${ph}"><rect width="100%" height="100%" fill="${species.body}"/>
    <text x="70" y="260" font-family="Inter" font-weight="900" font-size="150" fill="#000" letter-spacing="-6">${escapeXml(group.name)}</text>
    <text x="74" y="360" font-family="Inter" font-weight="700" font-size="64" fill="#000">week of ${escapeXml(weekKey)}</text>
    <text x="74" y="${ph - 90}" font-family="Inter" font-weight="900" font-size="90" fill="#000">roll<tspan fill="#fff">.</tspan> zine</text></svg>`);
  pages.push(await sharp(cover).png().toBuffer());
  for (const p of posts) {
    const photo = await sharp(readMedia(p.media.main)).rotate().resize(Math.round(pw - 120), Math.round(ph - 360), { fit: 'cover' }).png().toBuffer();
    const user = getUser(p.userId);
    const cap = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${pw}" height="${ph}"><rect width="100%" height="100%" fill="#fff"/>
      <text x="60" y="${ph - 170}" font-family="Inter" font-weight="900" font-size="58" fill="#000">${escapeXml((p.caption ?? '').slice(0, 26))}</text>
      <text x="60" y="${ph - 90}" font-family="Inter" font-weight="700" font-size="44" fill="${'#777777'}">${escapeXml(user?.name ?? '')}</text></svg>`);
    pages.push(await sharp(cap).composite([{ input: photo, top: 60, left: 60 }]).png().toBuffer());
  }
  while (pages.length < 7) pages.push(await sharp({ create: { width: Math.round(pw), height: Math.round(ph), channels: 3, background: '#FFFFFF' } }).png().toBuffer());
  const back = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${pw}" height="${ph}"><rect width="100%" height="100%" fill="#000"/>
    <text x="${pw / 2}" y="${ph / 2}" text-anchor="middle" font-family="Inter" font-weight="900" font-size="120" fill="#fff">roll<tspan fill="#FFC800">.</tspan></text></svg>`);
  pages.push(await sharp(back).png().toBuffer());
  // Classic one-sheet fold order: top row (rotated) 5 4 3 2 ← bottom row 6 7 8 1 (1-indexed).
  const order = [[4, 3, 2, 1], [5, 6, 7, 0]];
  const comps: sharp.OverlayOptions[] = [];
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 4; c++) {
      let page = await sharp(pages[order[r][c]]).resize(Math.round(pw), Math.round(ph), { fit: 'cover' }).png().toBuffer();
      if (r === 0) page = await sharp(page).rotate(180).png().toBuffer();
      comps.push({ input: page, left: Math.round(c * pw), top: Math.round(r * ph) });
    }
  }
  const sheet = await sharp({ create: { width: W, height: H, channels: 3, background: '#fff' } }).composite(comps).jpeg({ quality: 90 }).toBuffer();
  const subjects = [...new Set(posts.map((p) => p.userId))];
  return insertObject({
    groupId: group.id, kind: 'zine', createdBy: actor.id, subjects, media: writeMedia(sheet, 'jpg').url, style: 'one-sheet',
    provenance: { generator: 'roll. zine', model: null, createdAt: now(), subjects, consentChecked: true, watermark: 'visible' }, createdAt: now(),
    meta: { weekKey, postIds: posts.map((p) => p.id), print: { size: 'US Letter', dpi: 300 } },
  });
}

/* ───────────────────────── Export ───────────────────────── */

export async function exportObject(actor: UserFull, objectId: string) {
  const o = getObject(objectId);
  if (!o || o.revoked) throw new GameError('not_found');
  const group = o.groupId ? getGroup(o.groupId) : null;
  const species = MASCOT_SPECIES.find((s) => s.id === group?.mascot.species) ?? MASCOT_SPECIES[0];
  const buf = readMedia(o.media);
  const handle = actor.name.toLowerCase().replace(/\s+/g, '');
  if (o.media.endsWith('.webp')) return { buf: await exportAnimated(buf, o.provenance, { mascotColor: species.body, handle }), type: 'image/webp' };
  const isPng = o.media.endsWith('.png');
  return { buf: await exportImage(buf, o.provenance, { mascotColor: species.body, handle, format: isPng ? 'png' : 'jpeg' }), type: isPng ? 'image/png' : 'image/jpeg' };
}

/**
 * Sticker pack export: WhatsApp-style pack (512×512 WebP stickers, 96×96 tray icon, contents.json)
 * plus PNGs for iMessage. Every sticker carries the watermark (spec §F: likeness objects never lose it).
 */
export async function stickerPack(actor: UserFull, groupId: string | null) {
  const stickers = objectsFor({ kind: 'sticker', ...(groupId ? { groupId } : {}) }).filter((o) => !o.revoked && (o.createdBy === actor.id || o.subjects.includes(actor.id))).slice(0, 30);
  if (stickers.length < 3) throw new GameError('need_3', 'A pack needs at least 3 stickers');
  const group = groupId ? getGroup(groupId) : null;
  const species = MASCOT_SPECIES.find((s) => s.id === group?.mascot.species) ?? MASCOT_SPECIES[0];
  const files: Record<string, Uint8Array> = {};
  const contents: { image_file: string; emojis: string[] }[] = [];
  for (const [i, s] of stickers.entries()) {
    const base = await sharp(readMedia(s.media)).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    const marked = await sharp(base)
      .composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><g transform="translate(436 452)"><circle cx="24" cy="24" r="24" fill="${species.body}"/><text x="24" y="31" text-anchor="middle" font-family="Inter" font-weight="900" font-size="18" fill="#000">r.</text></g></svg>`) }])
      .png()
      .toBuffer();
    files[`whatsapp/${i + 1}.webp`] = await sharp(marked).webp({ quality: 80 }).toBuffer();
    files[`imessage/${i + 1}.png`] = marked;
    contents.push({ image_file: `${i + 1}.webp`, emojis: ['😀'] });
  }
  files['whatsapp/tray.png'] = await sharp(readMedia(stickers[0].media)).resize(96, 96, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  files['whatsapp/contents.json'] = strToU8(JSON.stringify({ identifier: `roll-${groupId ?? actor.id}`, name: `${group?.name ?? actor.name} · roll.`, publisher: 'roll.', tray_image_file: 'tray.png', stickers: contents }, null, 2));
  files['README.txt'] = strToU8('WhatsApp: import the whatsapp/ folder with a sticker-pack importer. iMessage: drag the PNGs from imessage/ into a conversation or a sticker app.\nEvery sticker carries the roll. watermark.');
  return Buffer.from(zipSync(files, { level: 6 }));
}

/* ───────────────────────── Likeness log & revoke ───────────────────────── */

export function likenessLog(userId: string) {
  return objectsFor({ subject: userId }).map((o) => ({
    id: o.id, kind: o.kind, media: o.media, style: o.style, createdAt: o.createdAt, revoked: o.revoked, groupId: o.groupId,
    createdBy: getUser(o.createdBy) ? publicUser(getUser(o.createdBy)!) : null,
  }));
}

export function revokeObject(userId: string, objectId: string) {
  const o = getObject(objectId);
  if (!o) throw new GameError('not_found');
  if (o.createdBy !== userId && !o.subjects.includes(userId)) throw new GameError('forbidden');
  run('UPDATE objects SET revoked = 1 WHERE id = ?', objectId);
  return { revoked: true };
}

export function objectList(viewerId: string, groupId: string | null, kind?: string) {
  const rows = objectsFor({ ...(groupId ? { groupId } : {}), ...(kind ? { kind } : {}) });
  const memberOf = new Set(groupsForUser(viewerId).map((g) => g.id));
  return rows
    .filter((o) => !o.revoked && (o.groupId ? memberOf.has(o.groupId) : o.createdBy === viewerId))
    .map((o) => ({ ...o, creator: getUser(o.createdBy) ? publicUser(getUser(o.createdBy)!) : null }));
}

export function aiStatus(user: UserFull) {
  const used = img.aiUsedThisMonth(user.id);
  return { used, remaining: aiRemaining(user.plan, used), monthly: PLANS[user.plan].aiMonthly, model: img.geminiEnabled() ? 'Nano Banana 2' : 'Local renderer' };
}

export function stickersFor(userId: string) {
  return all<{ id: string; media: string }>(
    `SELECT id, media FROM objects WHERE kind = 'sticker' AND revoked = 0 AND (created_by = ? OR EXISTS (SELECT 1 FROM json_each(objects.subjects) WHERE value = ?)) ORDER BY created_at DESC`,
    userId, userId,
  );
}
