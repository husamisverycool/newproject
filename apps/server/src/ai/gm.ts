import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { z } from 'zod/v4';
import { characterai, duolingo, gartic, gas, instagram, seeded, tbh, wrapped } from '@app/shared';
import { env } from '../env.ts';
import { platform } from '../platform.ts';

/**
 * The game master: the group mascot speaking in Duolingo's voice (Duo as a brand character, spec §M).
 * It runs one weekly game and knows group lore ONLY from the visible memory panel, shaped like
 * Character.ai's memory (Story Memory + Facts, spec §K). Claude writes the lines when an API key is
 * configured. Offline, the game master says only deck lines (packages/shared/src/sources):
 * Duolingo's "Hi, it's Duo!" greeting, and poll questions taken verbatim from tbh and Gas.
 */

export type GameKind = 'superlatives' | 'telephone' | 'challenge' | 'guess_whose';

export const GAME_ROTATION: GameKind[] = ['superlatives', 'telephone', 'challenge', 'guess_whose'];

export interface GmContext {
  groupName: string;
  mascotName: string;
  members: string[];
  /** Story Memory (Character.ai): lines members wrote, pinned in chat, or marked to remember on a photo; newest first. */
  story: string[];
  /** Facts (Character.ai: "recorded automatically"): the last game's results, as "title: names". */
  facts: string[];
  weekKey: string;
  postsThisWeek: number;
}

export interface WeeklyGame {
  kind: GameKind;
  intro: string;
  questions: string[];
  challenge: string | null;
}

/** Every verified tbh and Gas poll question (research/24 §1). */
export const POLL_BANK: readonly string[] = [...tbh.questions, ...gas.questions];

const WeeklyGameSchema = z.object({
  intro: z.string().describe('One or two short sentences in your voice announcing this week\'s game to the group chat.'),
  questions: z.array(z.string()).describe(`For a poll week: exactly ${tbh.perRound} poll questions, each answered by picking one of ${tbh.names} friends. Empty for other weeks.`),
  challenge: z.string().nullable().describe('For an "Add Yours" week: the one prompt everyone answers with a photo. Null otherwise.'),
});

const ReplySchema = z.object({ reply: z.string().describe('A short reply (at most 2 sentences) in your voice.') });

const client = () => (env.anthropicKey ? new Anthropic({ apiKey: env.anthropicKey }) : null);

const list = (xs: readonly string[], empty: string) => (xs.length ? xs.map((x) => `- ${x}`).join('\n') : `- ${empty}`);

/**
 * The brief. Voice: design.duolingo.com/writing/voice and /writing/duo (research/14 §1.7). Content
 * rule: tbh's moderation rule, verbatim (research/24 §1). Names visible, no guilt, lore from the
 * memory panel only: spec §K and §M.
 */
const SYSTEM = (ctx: GmContext) => `You are ${ctx.mascotName}, the mascot and game master of a private friends-only photo group called "${ctx.groupName}".
Members: ${ctx.members.join(', ')}.

Voice. Write the way Duolingo writes for Duo. The Duolingo voice has four qualities:
${Object.entries(duolingo.voiceDefinitions).map(([k, v]) => `- ${k}: ${v}`).join('\n')}
Like Duo, you are the group's "${duolingo.duoRole}": ${duolingo.duoAdjectives.join(', ')}.

Rules you never break:
- Everything you write is ${tbh.contentRule}. (This is the rule tbh applied to every poll.)
- Polls are about friends and are never anonymous: everyone sees who voted for whom.
- Never guilt anyone for not posting or not playing.
- You only know the group lore listed under Story Memory and Facts below. If it is not listed, you don't know it.

${characterai.storyMemory} (written, pinned or marked to remember by members; they can delete any line):
${list(ctx.story, '(empty)')}

${characterai.facts} (recorded automatically: last game's results as "award: winners"; members can delete any line):
${list(ctx.facts, '(empty)')}`;

async function ask<T>(ctx: GmContext, user: string, schema: z.ZodType<T>): Promise<T | null> {
  if (platform.askJson) {
    // In the in-Claude build the viewer's own Claude answers, and only for something a member did
    // (never from the job timer). The brief is the same; the reply format rides in the prompt.
    if (platform.jobDepth > 0) return null;
    try {
      const shape = JSON.stringify(z.toJSONSchema(schema));
      const out = await platform.askJson(`${SYSTEM(ctx)}\n\n${user}\n\nReply with only one JSON object matching this JSON Schema:\n${shape}`);
      const parsed = schema.safeParse(out);
      return parsed.success ? parsed.data : null;
    } catch {
      return null;
    }
  }
  const c = client();
  if (!c) return null;
  try {
    const res = await c.beta.messages.parse({
      model: env.anthropicModel,
      max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'low', format: betaZodOutputFormat(schema) },
      system: SYSTEM(ctx),
      messages: [{ role: 'user', content: user }],
    });
    if (res.stop_reason === 'refusal') return null;
    return (res.parsed_output as T | null) ?? null;
  } catch (e) {
    if (e instanceof Anthropic.APIError) console.warn(`[gm] API ${e.status}: ${e.message}`);
    else console.warn('[gm] failed:', (e as Error).message);
    return null;
  }
}

export function gameKindFor(weekKey: string): GameKind {
  const n = Math.floor(Date.parse(`${weekKey}T00:00:00Z`) / (7 * 86_400_000));
  return GAME_ROTATION[((n % GAME_ROTATION.length) + GAME_ROTATION.length) % GAME_ROTATION.length];
}

/** Per-game briefs, each naming the source mechanic the screen copies. */
const BRIEF: Record<GameKind, string> = {
  superlatives: `This week's game is a poll played like tbh and Gas: write exactly ${tbh.perRound} questions; for each, everyone picks one of ${tbh.names} friends.
Every question must follow one of these patterns, taken from real tbh and Gas questions:
${tbh.patterns.map((p) => `- ${p}`).join('\n')}
Real examples (you may reuse them as written):
${POLL_BANK.map((q) => `- ${q}`).join('\n')}
Fill a blank only with something from the examples or from Story Memory / Facts. Do not invent new lore.`,
  telephone: `This week's game is photo telephone, played like Gartic Phone: someone picks a photo, the next friend writes a sentence about it ("${gartic.writeASentence}"), the AI draws that sentence ("${gartic.draw}"), the next friend describes the drawing ("${gartic.describe}"), and every ${gartic.album.toLowerCase()} is revealed when the week develops. Announce it.`,
  challenge: `This week's game is a photo challenge played like Instagram's "${instagram.addYours}" sticker: write one short prompt that everyone answers with a photo this week, then announce it.`,
  guess_whose: `This week's game is a quiz like Spotify Wrapped's Top Song Quiz ("${wrapped.quizName}"): everyone guesses who took each of this week's photos. Announce it.`,
};

export async function weeklyGame(ctx: GmContext, kind: GameKind): Promise<WeeklyGame> {
  const ai = await ask(ctx, BRIEF[kind], WeeklyGameSchema);
  if (ai) {
    const rng = seeded(`${ctx.groupName}:${ctx.weekKey}:${kind}`);
    const questions = kind === 'superlatives' ? ai.questions.map((q) => q.trim().slice(0, 120)).filter(Boolean).slice(0, tbh.perRound) : [];
    // Top up a short AI round with verbatim tbh / Gas questions.
    if (kind === 'superlatives' && questions.length < tbh.perRound) questions.push(...pick(POLL_BANK.filter((q) => !questions.includes(q)), rng, tbh.perRound - questions.length));
    return {
      kind,
      intro: ai.intro.slice(0, 280),
      questions,
      challenge: kind === 'challenge' && ai.challenge?.trim() ? ai.challenge.trim().slice(0, 140) : null,
    };
  }
  return scriptedGame(ctx, kind);
}

export async function reply(ctx: GmContext, from: string, text: string): Promise<string> {
  const ai = await ask(ctx, `${from} says to you in the group chat: "${text.slice(0, 500)}". Reply briefly.`, ReplySchema);
  if (ai) return ai.reply.slice(0, 280);
  return scriptedReply(ctx);
}

/* ───────────────────────── Offline game master: deck lines only ───────────────────────── */

function pick<T>(xs: readonly T[], rng: () => number, n: number) {
  const copy = [...xs];
  const out: T[] = [];
  while (out.length < n && copy.length) out.push(copy.splice(Math.floor(rng() * copy.length), 1)[0]);
  return out;
}

/**
 * No API key: the greeting is Duolingo's "Hi, it's Duo!" [V-weak] with the mascot's name; a poll week
 * draws its questions verbatim from tbh and Gas; an "Add Yours" week has no prompt until a member
 * types one (Instagram: the sticker's creator types the prompt). Nothing is written here.
 */
export function scriptedGame(ctx: GmContext, kind: GameKind): WeeklyGame {
  const rng = seeded(`${ctx.groupName}:${ctx.weekKey}:${kind}`);
  return {
    kind,
    intro: duolingo.hiItsDuo(ctx.mascotName),
    questions: kind === 'superlatives' ? pick(POLL_BANK, rng, tbh.perRound) : [],
    challenge: null,
  };
}

export function scriptedReply(ctx: GmContext) {
  return duolingo.hiItsDuo(ctx.mascotName);
}
