/**
 * Apple Messages (Tapbacks, stickers), Apple Invites, WhatsApp (stickers, polls, events, composer),
 * iOS 27 Photos shared albums. Research: research/16 §9–11.
 */
export const imessage = {
  /** [V] classic Tapbacks: heart, thumbs-up, thumbs-down, Haha, !!, ? — plus any emoji (iOS 18) */
  tapbacks: ['❤️', '👍', '👎', '😂', '‼️', '❓'] as const,
  /** [V-weak] Live Sticker effects as listed by support.apple.com iph37b0bfe7b (research/26 §2): "Shiny" · "Comic" · "Puffy" · "Outline". "Original" is not confirmed; "Stroke" was background knowledge only. */
  stickerEffects: ['Shiny', 'Comic', 'Puffy', 'Outline'] as const,
  /** [V] support.apple.com iph37b0bfe7b: tap the photo subject, then "Add Sticker" */
  addSticker: 'Add Sticker',
  /** [V] support.apple.com iph37b0bfe7b: touch and hold the sticker, then "Add Effect" */
  addEffect: 'Add Effect',
  /** [B-med] "+" menu → "Stickers" */
  stickers: 'Stickers',
  /** [HIG] Messages list title */
  title: 'Messages',
  /** [B-med] list preview for an image */
  previewPhoto: 'Photo',
  /** [B-high] list preview for a voice message */
  previewAudio: 'Audio Message',
  /** [B-med] list preview for a sticker */
  previewSticker: 'Sticker',
  /** [B-high] composer placeholder in an SMS conversation */
  textMessage: 'Text Message',
  /** [HIG] Messages › group conversation details: the red row at the bottom */
  leaveConversation: 'Leave this Conversation',
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
  /** [V] create an event: "Add Description" */
  addDescription: 'Add Description',
  /** [V] create an event: tap "Add Background", then "Photos" or "Camera" (research/21 §3) */
  addBackground: 'Add Background',
  /** [V] */
  photos: 'Photos',
  /** [V] */
  camera: 'Camera',
  /** [V] RSVP: "optionally add a note that will be visible to the host and other guests" (capitalized as a field label) */
  addNote: 'Add a note',
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
  /** [V-weak] pack export button "Add to WhatsApp" (Sticker.ly flow, igeeksblog; research/26 §9) */
  addToWhatsApp: 'Add to WhatsApp',
  /** [V-weak] pack spec: 3–30 stickers, 512×512 WebP ≤ 100 KB, tray 96×96 */
  pack: { min: 3, max: 30, size: 512, maxKb: 100, tray: 96 },
  /** [B-high] group info › participants: the tag beside each admin */
  groupAdmin: 'Group admin',
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
  /** [V] support.apple.com 127875: "Temporary shared albums expire after 30 days, and any photos or videos not saved to your library will be deleted." */
  expirySentence: 'Temporary shared albums expire after 30 days, and any photos or videos not saved to your library will be deleted.',
  /** [B-high] shared-album photo: the comment field under the photo */
  addComment: 'Add a comment',
  /** [B-high] shared-album comment: the send button */
  post: 'Post',

  /* ── iOS 27 slideshow maker (research/22 §2c) ── */
  /** [V-weak] "Start Slideshow" from the three-dot menu */
  startSlideshow: 'Start Slideshow',
  /** [V-weak] tap the screen and a large "Customize" button appears below the slideshow */
  customize: 'Customize',
  /** [V-weak] Customize holds "transition style · duration per photo · music" (capitalized as section labels) */
  transition: 'Transition',
  /** [V-weak] */
  duration: 'Duration',
  /** [V-weak] music picker: "Choose Song" → soundtracks; "Off" for no music */
  chooseSong: 'Choose Song',
  /** [V-weak] */
  off: 'Off',
  /** [B-high] transition styles: iOS 27's names are NOT FOUND, so these are Apple's own Photos/Keynote slideshow names */
  transitions: { kenBurns: 'Ken Burns', dissolve: 'Dissolve', push: 'Push' } as Record<string, string>,
  /** [V-weak] per-photo duration choices: 1 Second Everyday's "1-, 2- or 3-second clips" (research/22 §1) */
  durations: [1, 2, 3] as const,
  /** [HIG] DateComponentsFormatter .abbreviated, e.g. "2s" */
  seconds: (n: number) => `${n}s`,
  /** [HIG] share-sheet action for a video ("Save the slideshow as a video to the Photos library" [V-weak]) */
  saveVideo: 'Save Video',
} as const;
