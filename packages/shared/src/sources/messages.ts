/**
 * Apple Messages (Tapbacks, stickers), Apple Invites, WhatsApp (stickers, polls, events, composer),
 * iOS 27 Photos shared albums. Research: research/16 §9–11.
 */
export const imessage = {
  /** [V] classic Tapbacks: heart, thumbs-up, thumbs-down, Haha, !!, ? — plus any emoji (iOS 18) */
  tapbacks: ['❤️', '👍', '👎', '😂', '‼️', '❓'] as const,
  /** [B-med-high] Live Sticker effects */
  stickerEffects: ['Original', 'Shiny', 'Puffy', 'Comic', 'Stroke'] as const,
  /** [B-med] */
  addSticker: 'Add Sticker',
  /** [B-med] "+" menu → "Stickers" */
  stickers: 'Stickers',
} as const;

export const invites = {
  /** [V] Apple Invites RSVP */
  going: 'Going',
  /** [V] */
  notGoing: 'Not Going',
  /** [V] */
  maybe: 'Maybe',
  /** [V] */
  sendReply: 'Send Reply',
  /** [V] guest list group */
  notResponded: 'Not Responded',
} as const;

export const whatsapp = {
  /** [B-med-high] composer placeholder (Android) */
  message: 'Message',
  /** [B-med] new-group field placeholder */
  groupName: 'Group name',
  /** [V] poll field */
  question: 'Question',
  /** [V] */
  allowMultiple: 'Allow multiple answers',
  /** [V-weak] "+" → "Event" */
  event: 'Event',
  /** [V-weak] paperclip → "Poll" */
  poll: 'Poll',
  /** [B-med] sticker tab → "Create sticker" */
  createSticker: 'Create sticker',
  /** [V-weak] pack spec: 3–30 stickers, 512×512 WebP ≤ 100 KB, tray 96×96 */
  pack: { min: 3, max: 30, size: 512, maxKb: 100, tray: 96 },
} as const;

export const photos27 = {
  /** [V] */
  sharingOptions: 'Sharing Options',
  /** [V] */
  makeTemporary: 'Make Album Temporary',
  /** [V] */
  manage: 'Manage Shared Album',
  /** [V] temporary albums auto-delete after 30 days */
  days: 30,
  /** [B-low] header countdown */
  expiresIn: (n: number) => `Expires in ${n} ${n === 1 ? 'day' : 'days'}`,
} as const;
