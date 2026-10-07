import './bootstrap.ts';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { duolingo, ritualWindow, weekKeyOffset, zonedToUtc, parseDateKey } from '@app/shared';
import { POLL_BANK } from './ai/gm.ts';
import { db, json, now, run } from './db.ts';
import { ROOT } from './env.ts';
import { createUser, getGroup, id, insertMessage, updateSettings, updateUser } from './repo.ts';
import { isGoldenHour, storeImage, syntheticLive } from './media.ts';
import { createPost, addMemory } from './services/posts.ts';
import { developWeek } from './jobs.ts';
import { grantPack, open as openPack, upgrade } from './services/cards.ts';
import { startWeeklyGame, vote } from './services/games.ts';
import { createPlan, rsvp, votePlan } from './services/plans.ts';
import { makeSticker } from './services/objects.ts';
import { getUser } from './repo.ts';
import { seeded } from '@app/shared';

/**
 * Demo data: one friend group ("Sunday Club") with five members and four weeks of moments, so the
 * journal, walls, packs, games and Wrapped have something to show on first run. Photos are the
 * public-domain / CC0 / CC BY sample images in seed-assets/ (see LICENSES.md), plus crops of them
 * and a few generated "sky" frames.
 */

const ASSETS = path.join(ROOT, 'apps/server/seed-assets');
const rng = seeded('roll-demo');

if (process.argv.includes('--reset')) {
  for (const t of ['reactions', 'views', 'posts', 'messages', 'walls', 'likeness', 'objects', 'cards', 'packs', 'wonder', 'trades', 'wishlist', 'games', 'memory', 'notifications', 'plan_votes', 'plan_rsvps', 'plans', 'ai_usage', 'purchases', 'orders', 'quests', 'jobs_done', 'archive_votes', 'memberships', 'groups', 'sessions', 'users', 'wall_reactions']) {
    db.exec(`DELETE FROM ${t}`);
  }
  run('UPDATE clock SET offset_ms = 0 WHERE id = 1');
}

const exists = db.prepare("SELECT COUNT(*) AS n FROM users WHERE json_extract(settings, '$.demo') = 1").get() as { n: number };
if (exists.n > 0 && !process.argv.includes('--reset')) {
  console.log('Demo data already present (use --reset to rebuild).');
  process.exit(0);
}

async function photo(file: string, crop?: { l: number; t: number; w: number; h: number }, tweak?: Parameters<sharp.Sharp["modulate"]>[0]) {
  let img = sharp(path.join(ASSETS, file)).rotate();
  const m = await img.metadata();
  if (crop) img = img.extract({ left: Math.round(crop.l * m.width!), top: Math.round(crop.t * m.height!), width: Math.round(crop.w * m.width!), height: Math.round(crop.h * m.height!) });
  if (tweak) img = img.modulate(tweak);
  if ((m.channels ?? 3) === 1 || file === 'camera.png') img = img.toColourspace('srgb');
  return img.resize(1200, 1200, { fit: 'inside', withoutEnlargement: false }).jpeg({ quality: 90 }).toBuffer();
}

/** Generated skies (sunset / dusk / night) for variety — palette hexes only. */
async function sky(kind: 'sunset' | 'dusk' | 'night' | 'noon', seed: number) {
  const r = seeded(`sky${seed}`);
  const stops = {
    sunset: ['#2B70C9', '#CE82FF', '#FF4B4B', '#FF9600', '#FFC800'],
    dusk: ['#000000', '#2B70C9', '#CE82FF', '#FF9600'],
    night: ['#000000', '#1C1C1E', '#2B70C9'],
    noon: ['#1CB0F6', '#AECBFA', '#FFFFFF'],
  }[kind];
  const W = 1200;
  const H = 1500;
  const grad = stops.map((c, i) => `<stop offset="${i / (stops.length - 1)}" stop-color="${c}"/>`).join('');
  const sun = kind === 'sunset' ? `<circle cx="${W * (0.3 + r() * 0.4)}" cy="${H * 0.72}" r="${W * 0.12}" fill="#FFC800" fill-opacity="0.9"/>` : '';
  const stars = kind === 'night' ? Array.from({ length: 160 }, () => `<circle cx="${r() * W}" cy="${r() * H * 0.75}" r="${r() * 2.2}" fill="#fff" fill-opacity="${0.3 + r() * 0.7}"/>`).join('') : '';
  const hills = `<path d="M0 ${H * 0.8} Q ${W * 0.25} ${H * (0.7 + r() * 0.08)} ${W * 0.5} ${H * 0.78} T ${W} ${H * 0.76} L ${W} ${H} L 0 ${H} Z" fill="#000" fill-opacity="0.85"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">${grad}</linearGradient></defs><rect width="${W}" height="${H}" fill="url(#g)"/>${stars}${sun}${hills}</svg>`;
  const base = await sharp(Buffer.from(svg)).blur(1.2).png().toBuffer();
  const noise = Buffer.alloc(W * H);
  for (let i = 0; i < noise.length; i++) noise[i] = 110 + Math.floor(Math.random() * 36);
  const grain = await sharp(noise, { raw: { width: W, height: H, channels: 1 } }).png().toBuffer();
  return sharp(base).composite([{ input: grain, blend: 'soft-light' }]).jpeg({ quality: 88 }).toBuffer();
}

async function main() {
  const tz = 'America/New_York';
  const people = [
    { name: 'Maya Chen', color: '#FFC800', birthYear: 2001 },
    { name: 'Theo Park', color: '#1CB0F6', birthYear: 2000 },
    { name: 'Ines Duarte', color: '#CE82FF', birthYear: 2002 },
    { name: 'Sam Okafor', color: '#58CC02', birthYear: 1999 },
    { name: 'Jules Martin', color: '#FF9600', birthYear: 2001 },
  ];
  const users = people.map((p) => {
    const u = createUser({ ...p, isAdult: true, timeZone: tz });
    updateSettings(u.id, { demo: true, timeZone: tz } as never);
    updateUser(u.id, { onboarded: 1 });
    return u;
  });
  const [maya, theo, ines, sam, jules] = users;
  updateUser(maya.id, { plan: 'ai' });
  updateUser(theo.id, { plan: 'plus' });
  run('UPDATE users SET sparks = ?, shinedust = ? WHERE id = ?', 640, 6200, maya.id);
  run('UPDATE users SET sparks = 220, shinedust = 1800 WHERE id != ?', maya.id);

  // The group was made five weeks ago.
  const t = now();
  const createdAt = t - 33 * 86_400_000;
  const gid = id('grp');
  run(
    'INSERT INTO groups (id, name, emoji, mascot, ritual_day, develop_hour, time_zone, invite_code, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    gid, 'Sunday Club', '🌻', json.str({ name: 'Pip', species: 'cat', xp: 120, outfit: ['outfit_formal'] }), 0, 21, tz, 'SUNDAY', maya.id, createdAt,
  );
  users.forEach((u, i) => run('INSERT INTO memberships (group_id, user_id, role, joined_at, invited_by) VALUES (?, ?, ?, ?, ?)', gid, u.id, i === 0 ? 'admin' : 'member', createdAt + i * 3_600_000, i === 0 ? null : maya.id));
  run('INSERT INTO purchases (id, user_id, group_id, item, price_sparks, created_at) VALUES (?, ?, ?, ?, ?, ?)', id('buy'), maya.id, gid, 'outfit_party_hat', 80, createdAt);
  const group = getGroup(gid)!;

  const pics: { buf: () => Promise<Buffer>; caption: string | null; kind?: 'dual' | 'rewind'; live?: boolean; voice?: boolean }[] = [
    { buf: () => photo('coffee.png'), caption: 'sunday espresso before the chaos', live: true },
    { buf: () => photo('chelsea.png'), caption: 'she knows it’s caturday', live: true },
    { buf: () => sky('sunset', 1), caption: 'drive home glow' },
    { buf: () => photo('flower.jpg'), caption: 'found these on the walk' },
    { buf: () => photo('china.jpg'), caption: 'trip #1 recap', kind: 'rewind' },
    { buf: () => photo('rocket.jpg'), caption: 'WE SAW IT LAUNCH', live: true },
    { buf: () => sky('night', 2), caption: 'roof stars' },
    { buf: () => photo('chelsea.png', { l: 0.25, t: 0.1, w: 0.5, h: 0.75 }), caption: 'judging you', kind: 'dual' },
    { buf: () => photo('coffee.png', { l: 0.2, t: 0.1, w: 0.6, h: 0.8 }, { saturation: 1.2 }), caption: null },
    { buf: () => photo('hubble_deep_field.jpg'), caption: 'thinking about how small we are' },
    { buf: () => sky('dusk', 3), caption: 'last light' },
    { buf: () => photo('flower.jpg', { l: 0.3, t: 0.2, w: 0.45, h: 0.6 }, { brightness: 1.05 }), caption: 'macro mode unlocked' },
    { buf: () => photo('camera.png'), caption: 'black & white phase', kind: 'rewind' },
    { buf: () => sky('noon', 4), caption: 'blue blue blue' },
    { buf: () => photo('rocket.jpg', { l: 0.2, t: 0, w: 0.6, h: 0.9 }), caption: null },
    { buf: () => photo('china.jpg', { l: 0.1, t: 0.2, w: 0.55, h: 0.7 }, { saturation: 1.25 }), caption: 'roof details', kind: 'rewind' },
    { buf: () => sky('sunset', 5), caption: 'golden hour got me again' },
    { buf: () => photo('chelsea.png', { l: 0.35, t: 0.25, w: 0.35, h: 0.45 }), caption: 'the eyes', live: true },
    { buf: () => photo('coffee.png', { l: 0, t: 0.3, w: 0.5, h: 0.7 }), caption: 'second cup', voice: true },
    { buf: () => sky('dusk', 6), caption: null },
  ];

  const current = ritualWindow(t, group).weekKey;
  const weeks = [weekKeyOffset(current, -3), weekKeyOffset(current, -2), weekKeyOffset(current, -1), current];
  let pi = 0;
  const posted: { id: string; userId: string; weekKey: string }[] = [];
  for (const wk of weeks) {
    const d = parseDateKey(wk);
    const sunday = zonedToUtc(d.year, d.month, d.day, 0, 0, tz);
    const perWeek = wk === current ? 4 : 5;
    for (let k = 0; k < perWeek; k++) {
      // This week: everyone but Maya has posted, so the demo viewer sees the "post to see" blur.
      const u = wk === current ? users[1 + (k % (users.length - 1))] : users[(pi + k) % users.length];
      const spec = pics[pi % pics.length];
      pi++;
      // Spread across the week; one ritual (Sunday) post per person in developed weeks.
      const ritual = wk !== current && k < 4;
      const at = wk === current
        ? t - (2 + k * 9 + Math.floor(rng() * 6)) * 3_600_000
        : ritual ? sunday + (10 + k * 2) * 3_600_000 : sunday - (1 + Math.floor(rng() * 5)) * 86_400_000 + (7 + Math.floor(rng() * 14)) * 3_600_000;
      if (at > t) continue;
      const buf = await spec.buf();
      const stored = await storeImage(buf, u.plan);
      const live = spec.live ? await syntheticLive(buf) : null;
      const inset = spec.kind === 'dual' ? await storeImage(await photo('coffee.png', { l: 0.3, t: 0.2, w: 0.4, h: 0.5 }), u.plan) : null;
      const takenAt = spec.kind === 'rewind' ? at - (365 + Math.floor(rng() * 400)) * 86_400_000 : at;
      const post = createPost(group, {
        userId: u.id, kind: spec.kind ?? 'photo', caption: spec.caption, takenAt, bytes: stored.bytes + (live?.bytes ?? 0),
        media: { main: stored.url, thumb: stored.thumb, original: stored.original, inset: inset?.url, live: live?.url, width: stored.width, height: stored.height, golden: await isGoldenHour(buf) } as never,
        ritual: false, fromRoll: spec.kind === 'rewind', frame: null, remember: false, planId: null, createdAt: at,
      }, { silent: true });
      if (ritual) run('UPDATE posts SET ritual = 1, max_tier = CASE WHEN max_tier = ? THEN ? ELSE max_tier END WHERE id = ?', 'common', 'rare', post.id);
      posted.push({ id: post.id, userId: u.id, weekKey: wk });
    }
  }

  // Reactions (visible only to each poster), a few lore items, chat history.
  const emojis = ['💛', '🔥', '😂', '😍', '🫶', '😮'];
  for (const p of posted) {
    for (const u of users) if (u.id !== p.userId && rng() < 0.55) run('INSERT INTO reactions (id, post_id, user_id, emoji, created_at) VALUES (?, ?, ?, ?, ?)', id('r'), p.id, u.id, emojis[Math.floor(rng() * emojis.length)], t - Math.floor(rng() * 5) * 86_400_000);
    for (const u of users) if (u.id !== p.userId && rng() < 0.7) run('INSERT OR IGNORE INTO views (user_id, ref_id, at) VALUES (?, ?, ?)', u.id, p.id, t);
  }
  addMemory(gid, 'Theo still owes everyone dumplings from the road trip', null, ines.id);
  addMemory(gid, 'Pip’s official song is the one Sam plays on repeat', null, sam.id);
  addMemory(gid, 'The rocket launch weekend', posted[5]?.id ?? null, theo.id);

  const chat: [typeof maya, string, number][] = [
    [maya, 'roll day tomorrow!! who’s posting the coffee again', 30],
    [theo, 'me. always me', 29],
    [ines, '📌 Jules wins every dance battle, no debate', 28],
    [sam, 'pip looks extra round this week', 26],
    [jules, 'pip is THRIVING', 25],
  ];
  for (const [u, body, hoursAgo] of chat) insertMessage({ groupId: gid, userId: u.id, kind: 'text', body, createdAt: t - hoursAgo * 3_600_000 });
  addMemory(gid, 'Jules wins every dance battle, no debate', null, ines.id);

  // Past weeks' games: tbh/Gas polls with verbatim questions (research/24), closed by the develop step.
  const g0 = getGroup(gid)!;
  for (const [i, wk] of weeks.slice(0, 3).entries()) {
    const d = parseDateKey(wk);
    const startedAt = zonedToUtc(d.year, d.month, d.day, 21, 5, tz) - 7 * 86_400_000;
    const qs = POLL_BANK.slice(i * 3, i * 3 + 3);
    const state = {
      intro: duolingo.hiItsDuo(g0.mascot.name),
      questions: [
        { text: qs[0], votes: { [theo.id]: maya.id, [ines.id]: maya.id, [sam.id]: jules.id } },
        { text: qs[1], votes: { [maya.id]: ines.id, [jules.id]: ines.id } },
        { text: qs[2], votes: { [maya.id]: sam.id, [ines.id]: sam.id, [theo.id]: sam.id } },
      ],
    };
    run('INSERT INTO games (id, group_id, week_key, kind, state, created_at) VALUES (?, ?, ?, ?, ?, ?)', id('g'), gid, wk, 'superlatives', json.str(state), startedAt);
  }

  // Develop past weeks (walls, recaps, packs, game results).
  for (const wk of weeks.slice(0, 3)) {
    run('INSERT OR IGNORE INTO jobs_done (key, at) VALUES (?, ?)', `develop:${gid}:${wk}`, t);
    run('INSERT OR IGNORE INTO jobs_done (key, at) VALUES (?, ?)', `ritual_open:${gid}:${wk}`, t);
    const d = parseDateKey(wk);
    await developWeek(group, wk, zonedToUtc(d.year, d.month, d.day, 21, 0, tz));
  }

  // Everyone opens some packs; Maya numbers one card.
  for (const u of users) {
    const packs = db.prepare('SELECT id FROM packs WHERE user_id = ? AND group_id = ? AND opened_at IS NULL ORDER BY created_at').all(u.id, gid) as { id: string }[];
    for (const p of packs.slice(0, Math.max(0, packs.length - 1))) openPack(group, u.id, p.id, seeded(`open${p.id}`));
  }
  grantPack(maya.id, gid, current, 'welcome');
  const mayaCard = db.prepare("SELECT id FROM cards WHERE owner_id = ? AND rarity != 'common' ORDER BY obtained_at LIMIT 1").get(maya.id) as { id: string } | undefined;
  if (mayaCard) upgrade(maya.id, mayaCard.id);

  // This week's game: superlatives, with a couple of votes in.
  const game = await startWeeklyGame(group, { kind: 'superlatives', silent: true });
  {
    const d = parseDateKey(weeks[2]);
    run("UPDATE messages SET created_at = ? WHERE group_id = ? AND kind = 'gm' AND ref_id = ?", zonedToUtc(d.year, d.month, d.day, 21, 5, tz), gid, game.id);
  }
  vote(group, theo.id, game.id, 0, jules.id);
  vote(group, ines.id, game.id, 0, jules.id);
  vote(group, sam.id, game.id, 1, maya.id);

  // A plan with a Find-a-Time poll (Partiful).
  const sat = Date.parse(`${weekKeyOffset(current, 0)}T00:00:00Z`) + 6 * 86_400_000 + 23 * 3_600_000;
  const planId = createPlan(group, ines.id, { title: 'Picnic + film night', theme: 'cloudflow', effect: 'sunbeams', titleFont: 'manrope', options: [sat, sat + 86_400_000], location: 'Prospect Park, the big tree', details: 'bring a blanket. Sam has the projector' });
  votePlan(planId, maya.id, 0, 'yes');
  votePlan(planId, theo.id, 0, 'maybe');
  votePlan(planId, sam.id, 1, 'yes');
  rsvp(planId, jules.id, 'maybe');

  // A self-made sticker for Maya (rounded die-cut from a crop — real cut-outs come from the camera).
  const stickerSrc = await photo('chelsea.png', { l: 0.25, t: 0.1, w: 0.5, h: 0.8 });
  await makeSticker(getUser(maya.id)!, { cutout: stickerSrc, original: null, groupId: gid, subjectId: maya.id });

  // A second, smaller group so the group switcher has something to switch to.
  const g2 = id('grp');
  run('INSERT INTO groups (id, name, emoji, mascot, ritual_day, develop_hour, time_zone, invite_code, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    g2, 'Roomies', '🏠', json.str({ name: 'Moss', species: 'penguin', xp: 9, outfit: [] }), 0, 21, tz, 'ROOMIE', maya.id, t - 9 * 86_400_000);
  for (const [i, u] of [maya, sam].entries()) run('INSERT INTO memberships (group_id, user_id, role, joined_at) VALUES (?, ?, ?, ?)', g2, u.id, i === 0 ? 'admin' : 'member', t - 9 * 86_400_000);

  console.log(`Seeded ${users.length} users, ${posted.length} moments. Demo group invite: /j/SUNDAY`);
  console.log('Demo users:', users.map((u) => `${u.name} (${u.id})`).join(', '));
}

await main();
fs.mkdirSync(path.join(ROOT, '.data'), { recursive: true });
process.exit(0);
