import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { z } from 'zod/v4';
import { seeded } from '@app/shared';
import { env } from '../env.ts';

/**
 * The game master: the group mascot's voice (Duolingo's Duo as a brand character, spec §M), which
 * runs one weekly game and remembers group lore ONLY from opt-in items in the visible memory panel
 * (Character.ai memory, Series' AI context — spec §K). Claude writes the lines when an API key is
 * configured; a scripted game master covers offline runs.
 */

export type GameKind = 'superlatives' | 'telephone' | 'challenge' | 'guess_whose';

export const GAME_ROTATION: GameKind[] = ['superlatives', 'telephone', 'challenge', 'guess_whose'];

export interface GmContext {
  groupName: string;
  mascotName: string;
  members: string[];
  /** Opt-in memory items, newest first. */
  memory: string[];
  /** Last week's winners, e.g. "Maya — Early Bird". */
  pastWinners: string[];
  weekKey: string;
  postsThisWeek: number;
}

export interface WeeklyGame {
  kind: GameKind;
  intro: string;
  questions: string[];
  challenge: string | null;
}

const WeeklyGameSchema = z.object({
  intro: z.string().describe('One or two short sentences in the mascot voice announcing the game. Warm, playful, never guilt-tripping.'),
  questions: z.array(z.string()).describe('For superlatives: exactly 3 positive "who\'s most likely to…" questions. Empty for other kinds.'),
  challenge: z.string().nullable().describe('For challenge: a one-line photo challenge for the week. Null otherwise.'),
});

const ReplySchema = z.object({ reply: z.string().describe('A short reply (max 2 sentences) in the mascot voice.') });

const client = () => (env.anthropicKey ? new Anthropic({ apiKey: env.anthropicKey }) : null);

const SYSTEM = (ctx: GmContext) => `You are ${ctx.mascotName}, the mascot and game master of a private friends-only photo group called "${ctx.groupName}".
Members: ${ctx.members.join(', ')}.
You run one small game per week and talk in short, warm, playful lines.
Rules you never break:
- Only positive, kind prompts. Never rank people negatively, never tease about looks, weight, money, grades or relationships.
- Nothing anonymous: votes are always shown with names.
- Never guilt-trip anyone for not posting.
- Only refer to group lore that appears in the memory list below. If something is not listed, you don't know it.
Group memory (opt-in, members can delete items at any time):
${ctx.memory.length ? ctx.memory.map((m) => `- ${m}`).join('\n') : '- (nothing saved yet)'}
Last week's winners: ${ctx.pastWinners.length ? ctx.pastWinners.join('; ') : 'none yet'}.`;

async function ask<T>(ctx: GmContext, user: string, schema: z.ZodType<T>): Promise<T | null> {
  const c = client();
  if (!c) return null;
  try {
    const res = await c.beta.messages.parse({
      model: env.anthropicModel,
      max_tokens: 2000,
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

export async function weeklyGame(ctx: GmContext, kind: GameKind): Promise<WeeklyGame> {
  const instructions: Record<GameKind, string> = {
    superlatives: 'This week\'s game is SUPERLATIVES: write 3 positive "who\'s most likely to…" questions the group will vote on (names visible). Use the memory list if something fits.',
    telephone: 'This week\'s game is PHOTO TELEPHONE: someone posts a photo, the next person captions it, an AI draws the caption, the next person guesses the original. Announce it.',
    challenge: 'This week\'s game is a PHOTO CHALLENGE: give one simple, fun photo challenge anyone can do this week (no dangerous stunts, nothing that requires money).',
    guess_whose: 'This week\'s game is GUESS WHOSE PHOTO: on ritual day the group guesses who took each of this week\'s photos. Announce it.',
  };
  const ai = await ask(ctx, instructions[kind], WeeklyGameSchema);
  if (ai) {
    return {
      kind,
      intro: ai.intro.slice(0, 280),
      questions: kind === 'superlatives' ? ai.questions.slice(0, 3).map((q) => q.slice(0, 120)) : [],
      challenge: kind === 'challenge' ? (ai.challenge ?? scriptedChallenge(ctx)).slice(0, 140) : null,
    };
  }
  return scriptedGame(ctx, kind);
}

export async function reply(ctx: GmContext, from: string, text: string): Promise<string> {
  const ai = await ask(ctx, `${from} says to you in the group chat: "${text.slice(0, 500)}". Reply briefly.`, ReplySchema);
  if (ai) return ai.reply.slice(0, 280);
  return scriptedReply(ctx, from, text);
}

/* ───────────────────────── Scripted game master ───────────────────────── */

/** Positive-only superlatives (tbh / Gas compliment polls, de-anonymised per spec §K). */
export const SUPERLATIVE_BANK = [
  'Who would plan the best surprise party?',
  'Who has the most contagious laugh?',
  'Who is most likely to turn a normal Tuesday into an adventure?',
  'Who gives the best advice at 2am?',
  'Who would survive longest on a deserted island?',
  'Who is most likely to remember your birthday first?',
  'Who takes the best photos of everyone else?',
  'Who would win a dance battle?',
  'Who has the best playlist right now?',
  'Who is most likely to befriend a stranger\'s dog?',
  'Who would be the best travel buddy?',
  'Who makes every group chat better?',
  'Who is most likely to start a new hobby this week?',
  'Who would you call to help you move?',
  'Who has the most golden-hour energy?',
  'Who is secretly the funniest?',
  'Who would make the best podcast host?',
  'Who is most likely to cook for everyone?',
  'Who keeps the group together?',
  'Who would win a cozy-night-in competition?',
];

export const CHALLENGE_BANK = [
  'Post something yellow 💛',
  'Your view right now, from the floor',
  'The best thing you ate this week',
  'Something that made you laugh out loud',
  'A shadow that looks like something else',
  'Your favourite corner of your room',
  'A sky worth stopping for',
  'Something tiny, very close up',
  'Two things that match by accident',
  'Whatever is in your left pocket',
];

function pick<T>(list: T[], rng: () => number, n: number) {
  const copy = [...list];
  const out: T[] = [];
  while (out.length < n && copy.length) out.push(copy.splice(Math.floor(rng() * copy.length), 1)[0]);
  return out;
}

function loreLine(ctx: GmContext, rng: () => number) {
  if (ctx.pastWinners.length && rng() < 0.6) return ` Last week ${pick(ctx.pastWinners, rng, 1)[0]} — can anyone take the crown?`;
  if (ctx.memory.length && rng() < 0.5) return ` (I haven't forgotten: ${pick(ctx.memory, rng, 1)[0]}.)`;
  return '';
}

function scriptedChallenge(ctx: GmContext) {
  return pick(CHALLENGE_BANK, seeded(`${ctx.groupName}:${ctx.weekKey}:challenge`), 1)[0];
}

export function scriptedGame(ctx: GmContext, kind: GameKind): WeeklyGame {
  const rng = seeded(`${ctx.groupName}:${ctx.weekKey}:${kind}`);
  const lore = loreLine(ctx, rng);
  switch (kind) {
    case 'superlatives':
      return { kind, intro: `Superlatives week! Three questions, names on every vote.${lore}`, questions: pick(SUPERLATIVE_BANK, rng, 3), challenge: null };
    case 'telephone':
      return { kind, intro: `Photo telephone is open: one photo, one caption, one drawing, one guess. Let's see how far it drifts.${lore}`, questions: [], challenge: null };
    case 'challenge':
      return { kind, intro: `This week's challenge just dropped.${lore}`, questions: [], challenge: scriptedChallenge(ctx) };
    case 'guess_whose':
      return { kind, intro: `Guess Whose is on: on roll day I'll shuffle this week's photos and you guess who took each one.${lore}`, questions: [], challenge: null };
  }
}

export function scriptedReply(ctx: GmContext, from: string, text: string) {
  const t = text.toLowerCase();
  if (/remember|forget/.test(t)) return `I only remember what's pinned in the memory panel, ${from}. Tap 📌 on a caption to add it.`;
  if (/game|play/.test(t)) return `This week's game is pinned at the top of the chat. Go go go!`;
  if (/who|winner|won/.test(t) && ctx.pastWinners.length) return `Last week: ${ctx.pastWinners.join(', ')}.`;
  if (/hi|hey|hello/.test(t)) return `Hi ${from}! ${ctx.postsThisWeek ? `${ctx.postsThisWeek} moments in the roll so far this week.` : 'The roll is wide open this week.'}`;
  return `Noted, ${from}. Roll day is when it all develops.`;
}
