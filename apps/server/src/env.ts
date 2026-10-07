import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(here, '../../..');

export const env = {
  port: Number(process.env.PORT ?? 8787),
  dataDir: path.resolve(process.env.DATA_DIR ?? path.join(ROOT, '.data')),
  publicUrl: process.env.PUBLIC_URL ?? `http://localhost:${process.env.WEB_PORT ?? 5173}`,
  webDist: path.join(ROOT, 'apps/web/dist'),
  /** Nano Banana 2 (Gemini 3.1 Flash Image) — spec §G default model. Optional; local renderer otherwise. */
  geminiKey: process.env.GEMINI_API_KEY ?? '',
  geminiImageModel: process.env.GEMINI_IMAGE_MODEL ?? 'gemini-3.1-flash-image-preview',
  /** Game master text model. Optional; scripted game master otherwise. */
  anthropicKey: process.env.ANTHROPIC_API_KEY ?? '',
  anthropicModel: process.env.ANTHROPIC_MODEL ?? 'claude-opus-5-5',
  /** Demo affordances (view-as switcher, time travel) — on by default for local runs. */
  demo: process.env.DEMO !== '0',
};

export const paths = {
  db: path.join(env.dataDir, 'app.db'),
  media: path.join(env.dataDir, 'media'),
};
