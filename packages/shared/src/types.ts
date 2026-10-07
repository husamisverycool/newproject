export type ID = string;

/** Subscription tiers. Spec §U: $3.99 entry (plus) and a $5.99 AI tier. */
export type Plan = 'free' | 'plus' | 'ai';

/**
 * Spec §S: per-person likeness permissions, Sora's four audiences [V]: "Only me" (no_one),
 * "People I approve" (specific_friends), "Mutuals" (my_groups: people you share a group with),
 * "Everyone" (everyone).
 */
export type LikenessScope = 'no_one' | 'my_groups' | 'specific_friends' | 'everyone';

export interface User {
  id: ID;
  name: string;
  /** Avatar image URL (self-chosen photo). */
  avatar: string | null;
  /** Hex color used for the user's initial chip when no avatar. */
  color: string;
  birthYear: number;
  /** Age-verified adult (18+). Paid random packs are gated on this. */
  isAdult: boolean;
  plan: Plan;
  likenessScope: LikenessScope;
  /** User ids allowed when likenessScope === 'specific_friends'. */
  likenessAllow: ID[];
  /** Spec §G: per-user toggle for automatic AI creations that use their likeness. */
  autoAiCreations: boolean;
  /** Earned currency (Discord Orbs analogue). */
  sparks: number;
  /** Trade currency from duplicates (TCG Pocket Shinedust analogue). */
  shinedust: number;
  createdAt: number;
}

export type MascotSpecies = 'cat' | 'dog' | 'bird' | 'panda' | 'polarbear' | 'duck' | 'penguin';

export interface Mascot {
  name: string;
  species: MascotSpecies;
  xp: number;
  /** Equipped cosmetic ids. */
  outfit: string[];
}

export interface Group {
  id: ID;
  name: string;
  emoji: string;
  mascot: Mascot;
  /** 0 = Sunday … 6 = Saturday. Spec §A4: admin picks the ritual day, default Sunday. */
  ritualDay: number;
  /** Hour (0–23, group local time) when the week's roll develops. */
  developHour: number;
  timeZone: string;
  inviteCode: string;
  /** Spec §C: new members only see content from their join date unless the group opened the archive. */
  archiveOpen: boolean;
  createdBy: ID;
  createdAt: number;
}

export type Role = 'admin' | 'member';

export interface Membership {
  groupId: ID;
  userId: ID;
  role: Role;
  joinedAt: number;
}

export type PostKind = 'photo' | 'dual' | 'rewind';

export interface PostMedia {
  main: string;
  /** 480px thumbnail for walls, widgets and cards. */
  thumb?: string;
  /** Full-resolution original (paid tiers only, spec §T). */
  original?: string | null;
  /** Front-camera inset for dual posts (BeReal). */
  inset?: string;
  /** 2-second pre-capture "live" clip (BeReal BTS) — frames as an animated webp/mp4 url. */
  live?: string;
  /** Voice caption (Yope voice). */
  voice?: string;
  voiceDuration?: number;
  width: number;
  height: number;
}

export interface Post {
  id: ID;
  groupId: ID;
  userId: ID;
  kind: PostKind;
  media: PostMedia;
  caption: string | null;
  /** When the photo was originally taken (Rewind posts carry an old timestamp). */
  takenAt: number;
  createdAt: number;
  /** Ritual-week key (YYYY-MM-DD of the ritual day closing the week). */
  weekKey: string;
  /** Part of the Sunday dump. Ritual posts are camera-only (spec §D). */
  ritual: boolean;
  fromRoll: boolean;
  /** Camera theme / frame id. */
  frame: string | null;
  /** Opt-in: the game master may remember this caption (spec §K). */
  remember: boolean;
}

export interface Reaction {
  postId: ID;
  userId: ID;
  emoji: string | null;
  /** A likeness sticker used as a reaction (BeReal RealMoji, adapted). */
  stickerId: ID | null;
  createdAt: number;
}

export type MessageKind = 'text' | 'photo' | 'voice' | 'sticker' | 'plan' | 'system' | 'gm' | 'post_reply';

export interface Message {
  id: ID;
  groupId: ID;
  userId: ID | null;
  kind: MessageKind;
  body: string | null;
  media: string | null;
  refId: ID | null;
  createdAt: number;
}

export type Rarity = 'common' | 'rare' | 'holo' | 'immersive';

export interface Card {
  id: ID;
  groupId: ID;
  /** The moment this card depicts. Rarity attaches to moments, not people. */
  postId: ID;
  ownerId: ID;
  rarity: Rarity;
  /** Numbered upgrade (Telegram collectible analogue). */
  serial: number | null;
  obtainedAt: number;
  source: 'pack' | 'wonder' | 'trade' | 'quest';
}

export type TradeStatus = 'open' | 'accepted' | 'declined' | 'cancelled';

export interface Trade {
  id: ID;
  groupId: ID;
  fromUserId: ID;
  toUserId: ID;
  offerCardId: ID;
  wantCardId: ID;
  status: TradeStatus;
  createdAt: number;
}

/** Google Photos Create tools made on the device (spec §G/§H): photo_to_video, cinematic, animation, highlight; the recap slideshow export (iOS 27). */
export type CreationKind = 'photo_to_video' | 'cinematic' | 'animation' | 'highlight' | 'slideshow';
export type ObjectKind = 'sticker' | 'comic' | 'zine' | 'figurine' | 'meme' | 'wall' | 'recap' | 'share_card' | CreationKind;

export interface LikenessObject {
  id: ID;
  groupId: ID | null;
  kind: ObjectKind;
  createdBy: ID;
  /** Users whose likeness appears in the object. */
  subjects: ID[];
  media: string;
  style: string | null;
  /** Provenance manifest (C2PA-style) — embedded on export too. */
  provenance: Provenance;
  createdAt: number;
  revoked: boolean;
}

export interface Provenance {
  generator: string;
  model: string | null;
  createdAt: number;
  subjects: ID[];
  consentChecked: boolean;
  watermark: 'visible' | 'invisible' | 'both';
}

export type NotificationKind =
  | 'ritual_open'
  | 'ritual_closing'
  | 'roll_developed'
  | 'game_open'
  | 'reaction'
  | 'new_posts'
  | 'streak_warning'
  | 'trade_offer'
  | 'wonder_pick'
  | 'plan'
  | 'likeness_used'
  | 'waitlist';

export interface AppNotification {
  id: ID;
  userId: ID;
  groupId: ID | null;
  kind: NotificationKind;
  title: string;
  body: string;
  /** Content the push points at. Spec §O hard rule: every push points to real new content. */
  refIds: ID[];
  createdAt: number;
  readAt: number | null;
}

export interface MemoryItem {
  id: ID;
  groupId: ID;
  text: string;
  sourcePostId: ID | null;
  addedBy: ID;
  createdAt: number;
}
