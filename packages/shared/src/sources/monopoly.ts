/**
 * Monopoly GO: Golden Blitz trading window and sticker albums (spec §J). Research: research/13 §4.
 * gold sticker → ☆ card by the noun table.
 */
export const monopoly = {
  /** [V] event name: "the only way to trade gold stickers" */
  goldenBlitz: 'Golden Blitz',
  /** [V] "the only way to trade gold stickers" · subst gold stickers→☆ cards */
  blitzLine: 'the only time to trade ☆ cards',
  /** [V-weak] trade button */
  sendToAFriend: 'Send to a friend',
  /** [V-weak] one-for-one toggle */
  makeAnExchange: 'Make an exchange!',
  /** [V] completing the whole album gives the "HUGE REWARD" */
  hugeReward: 'HUGE REWARD',
  /** [V] each set holds 9 stickers */
  setSize: 9,
} as const;
