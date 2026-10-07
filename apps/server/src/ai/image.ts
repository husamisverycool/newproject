import { IMAGE_COST } from '@app/shared';
import { env } from '../env.ts';
import { all, get, now, run } from '../db.ts';
import * as local from './local.ts';

/**
 * Image generation. With GEMINI_API_KEY set, objects are rendered by Nano Banana 2 (spec §G:
 * "Nano Banana 2 as the default model"); otherwise the deterministic local renderer stands in so
 * every flow works offline. Usage is metered per member per month (spec §U: show remaining).
 */

export type ImageKind = 'remix' | 'figurine' | 'meme' | 'sticker' | 'comic_panel' | 'telephone';

/** Prompt text. The figurine prompt is the viral one verbatim (research/06 §2.2, variant A). */
export const PROMPTS = {
  figurine:
    'Using the model, create a 1/7 scale commercialized figurine of the characters in the picture, in a realistic style, in a real environment. The figurine is placed on a computer desk. The figurine has a round transparent acrylic base, with no text on the base. The content on the computer screen is the Zbrush modeling process of this figurine. Next to the computer screen is a BANDAI-style toy packaging box printed with the original artwork. The packaging features two-dimensional flat illustrations.',
  polaroid:
    'Take a Polaroid style photo. The image should look like a casual snapshot. Add a soft blur and keep the lighting consistent as if a flash went off in a dark room. Keep faces unchanged. Change the background to a white curtain.',
  remix: (style: string) => `Transform this photo into ${style} style. Keep the people, pose and composition recognisable. No text.`,
  meme: 'Put the person from the second image into the first image (a meme template), matching the template\'s lighting, angle and expression. Keep the template\'s composition. Keep the face recognisable.',
  sticker: 'Turn the person in this photo into a die-cut sticker with a thick white border on a plain transparent background.',
  telephone: (caption: string) => `A single playful illustration of: "${caption}". Bold shapes, clean background, no text.`,
} as const;

export interface GenResult {
  image: Buffer;
  model: string;
  generator: 'gemini' | 'local';
  costUsd: number;
}

function monthKey(t = now()) {
  const d = new Date(t);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function aiUsedThisMonth(userId: string) {
  return get<{ count: number }>('SELECT count FROM ai_usage WHERE user_id = ? AND month = ?', userId, monthKey())?.count ?? 0;
}

export function recordUsage(userId: string, costUsd: number) {
  run(
    `INSERT INTO ai_usage (user_id, month, count, cost_usd) VALUES (?, ?, 1, ?)
     ON CONFLICT (user_id, month) DO UPDATE SET count = count + 1, cost_usd = cost_usd + excluded.cost_usd`,
    userId, monthKey(), costUsd,
  );
}

export function usageReport() {
  return all<{ month: string; users: number; images: number; cost: number }>(
    'SELECT month, COUNT(*) AS users, SUM(count) AS images, ROUND(SUM(cost_usd), 3) AS cost FROM ai_usage GROUP BY month ORDER BY month DESC',
  );
}

export const geminiEnabled = () => Boolean(env.geminiKey);

async function gemini(prompt: string, images: { data: Buffer; mime: string }[]): Promise<Buffer> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.geminiImageModel}:generateContent`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': env.geminiKey },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }, ...images.map((i) => ({ inline_data: { mime_type: i.mime, data: i.data.toString('base64') } }))] }],
      generationConfig: { responseModalities: ['IMAGE'] },
    }),
  });
  if (!res.ok) throw new Error(`gemini ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const body = (await res.json()) as { candidates?: { content?: { parts?: { inlineData?: { data: string }; inline_data?: { data: string } }[] } }[] };
  const part = body.candidates?.[0]?.content?.parts?.find((p) => p.inlineData || p.inline_data);
  const data = part?.inlineData?.data ?? part?.inline_data?.data;
  if (!data) throw new Error('gemini returned no image');
  return Buffer.from(data, 'base64');
}

/** Try the model, fall back to the local renderer on any failure. */
async function withFallback(prompt: string, images: { data: Buffer; mime: string }[], fallback: () => Promise<Buffer>): Promise<GenResult> {
  if (geminiEnabled()) {
    try {
      const image = await gemini(prompt, images);
      return { image, model: env.geminiImageModel, generator: 'gemini', costUsd: IMAGE_COST.nb2_1k };
    } catch (e) {
      console.warn('[ai] gemini failed, using local renderer:', (e as Error).message);
    }
  }
  return { image: await fallback(), model: 'roll-local-renderer', generator: 'local', costUsd: 0 };
}

const jpeg = (data: Buffer) => ({ data, mime: 'image/jpeg' });
const png = (data: Buffer) => ({ data, mime: 'image/png' });

export function remix(style: string, photo: Buffer, opts: { caption?: string | null; cutout?: Buffer | null }) {
  const name = local.REMIX_STYLES.find((s) => s.id === style)?.name ?? style;
  if (style === 'polaroid') return withFallback(PROMPTS.polaroid, [jpeg(photo)], () => local.polaroid(photo, opts.caption));
  if (style === '3d' && !geminiEnabled()) {
    // No offline equivalent for 3D animation: render the closest local style and say so in provenance.
    return withFallback(PROMPTS.remix(name), [jpeg(photo)], () => local.anime(photo));
  }
  return withFallback(PROMPTS.remix(name), [jpeg(photo)], () => local.renderStyle(style as local.RemixStyle, photo, opts) as Promise<Buffer>);
}

export function figurine(cutout: Buffer, original: Buffer, opts: { name: string; groupName: string }) {
  return withFallback(PROMPTS.figurine, [jpeg(original)], () => local.figurine(cutout, original, opts));
}

export function sticker(cutout: Buffer, original: Buffer | null) {
  // Segmentation already happened on-device; the model is only used to stylise when available.
  return withFallback(PROMPTS.sticker, [png(original ?? cutout)], () => local.stickerize(cutout));
}

export function meme(template: Buffer, face: Buffer, box: { x: number; y: number; w: number; h: number }, caption?: { top?: string; bottom?: string }) {
  return withFallback(PROMPTS.meme, [jpeg(template), png(face)], () => local.memeSwap(template, face, box, caption));
}

export function telephoneRender(caption: string, seedPhoto: Buffer | null) {
  return withFallback(PROMPTS.telephone(caption), seedPhoto ? [jpeg(seedPhoto)] : [], async () => {
    if (seedPhoto) return local.comic(seedPhoto, caption);
    return local.comic(await placeholder(caption), caption);
  });
}

async function placeholder(caption: string) {
  const sharp = (await import('sharp')).default;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="720"><rect width="720" height="720" fill="#1CB0F6"/><circle cx="360" cy="380" r="200" fill="#FFC800"/><text x="360" y="400" text-anchor="middle" font-family="Inter" font-weight="900" font-size="44" fill="#000">${caption.slice(0, 20).replace(/[<&>]/g, '')}</text></svg>`;
  return sharp(Buffer.from(svg)).jpeg().toBuffer();
}
