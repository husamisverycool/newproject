import type { Context } from 'hono';

/**
 * Hooks that let the same server run in two places:
 * - as a Node process (apps/server/src/main.ts): every hook stays null and the defaults apply
 *   (cookie sessions, WebSocket fan-out, Web Push, the Anthropic API);
 * - inside the page of the in-Claude build (apps/web/src/live): the page sets these hooks so the
 *   signed-in Claude viewer is the user, events reach the page and the viewer's friends, and the
 *   game master writes through the viewer's own Claude.
 */
export const platform = {
  /** True when the server runs inside the page. */
  inPage: false,
  /** The current user's id for a request, instead of the session cookie. */
  userIdFor: null as null | ((c: Context) => string | null),
  /** Receives every realtime event the server emits, with who it is for. */
  emit: null as null | ((target: { groupId?: string; userId?: string; exceptUserId?: string }, event: unknown) => void),
  /** Asks Claude for JSON. `prompt` already holds the instructions, data and output format. */
  askJson: null as null | ((prompt: string) => Promise<unknown>),
  /** Set while scheduled jobs run, so timer-driven work never asks Claude on someone's behalf. */
  jobDepth: 0,
};
