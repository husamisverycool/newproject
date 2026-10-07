/**
 * Character.ai memory (current UI from May 21, 2026) → "what the game master remembers" (spec §K).
 * Research: research/16 §4.
 */
export const characterai = {
  /** [V-weak] entry: "Memory" in the chat menu, or a notebook icon in the chat header */
  memory: 'Memory',
  /** [V-weak] section 1: background you write yourself */
  storyMemory: 'Story Memory',
  /** [V-weak] section 2: recorded while you chat (c.ai+ only there; here, pinned captions) */
  facts: 'Facts',
  /** [V-weak] section 3: what currently fills memory */
  memoryUsage: 'Memory Usage',
  /** [V-weak] long-press a message → "Pin" */
  pin: 'Pin',
  /** [V-weak] up to 15 pins per chat */
  maxPins: 15,
} as const;
