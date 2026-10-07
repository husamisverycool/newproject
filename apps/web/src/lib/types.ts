import type { Plan, Rarity, LikenessScope, PostKind } from '@app/shared';

export interface PublicUser {
  id: string;
  name: string;
  avatar: string | null;
  color: string;
  plus: boolean;
}

export interface Me {
  id: string;
  name: string;
  avatar: string | null;
  color: string;
  birthYear: number;
  isAdult: boolean;
  minor: boolean;
  plan: Plan;
  likenessScope: LikenessScope;
  likenessAllow: string[];
  autoAiCreations: boolean;
  sparks: number;
  shinedust: number;
  packPoints: number;
  onboarded: boolean;
  settings: {
    cadence?: 'daily' | 'weekly' | 'monthly';
    hideStreakOnWidget?: boolean;
    quietHours?: boolean;
    teenTimeLimitMin?: number;
    contactsShared?: boolean;
    timeZone?: string;
    frame?: string;
    pushEnabled?: boolean;
    liveActivities?: boolean;
    rewindDeleteSync?: boolean;
    demo?: boolean;
    badges?: Record<string, string | null>;
  };
}

export interface MascotState {
  name: string;
  species: string;
  xp: number;
  outfit: string[];
  stage: { level: number; xp: number; name: string; next: { level: number; xp: number; name: string } | null; progress: number };
}

export interface GroupSummary {
  id: string;
  name: string;
  emoji: string;
  mascot: MascotState;
  memberCount: number;
  members: PublicUser[];
  unlocked: boolean;
  ritual: { isOpen: boolean; opensAt: number; developsAt: number; posted: number; of: number; youPosted: boolean; weekKey: string; streak: number };
  packs: number;
  unread: number;
}

export interface MeResponse {
  user: Me;
  groups: GroupSummary[];
  ai: { used: number; remaining: number; monthly: number; model: string };
  unread: number;
  stickers: { id: string; media: string }[];
  likeness: { selfies: string[]; face: string | null; verified: boolean; enrolledAt: number } | null;
  owned: string[];
}

export interface PostMedia {
  main: string;
  thumb?: string;
  original?: string | null;
  inset?: string;
  live?: string;
  voice?: string;
  voiceDuration?: number;
  width: number;
  height: number;
  golden?: boolean;
}

export interface Post {
  id: string;
  groupId: string;
  user: PublicUser;
  kind: PostKind;
  media: PostMedia;
  caption: string | null;
  takenAt: number;
  createdAt: number;
  weekKey: string;
  ritual: boolean;
  fromRoll: boolean;
  frame: string | null;
  remember: boolean;
  maxTier: Rarity;
  planId: string | null;
  mine: boolean;
  seen: boolean;
  blurred?: boolean;
  reactions?: { user: PublicUser | null; emoji: string | null; stickerUrl: string | null; createdAt: number; guest: boolean }[];
}

export interface Streak {
  weeks: number;
  currentDone: boolean;
  current: number;
  need: number;
  atRisk: boolean;
  nextMilestone: number | null;
}

export interface RitualState {
  weekKey: string;
  opensAt: number;
  developsAt: number;
  isOpen: boolean;
  now: number;
  posted: number;
  of: number;
  posters: PublicUser[];
  waiting: PublicUser[];
  youPosted: boolean;
  streak: Streak;
}

export interface WallItem {
  id: string;
  postId: string;
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
  z: number;
  shape: 'photo' | 'sticker' | 'polaroid';
  caption?: string | null;
  tape?: boolean;
}

export interface WallDeco {
  id: string;
  kind: 'emoji' | 'text' | 'mascot';
  value: string;
  x: number;
  y: number;
  size: number;
  rot: number;
}

export interface WallLayout {
  width: number;
  height: number;
  bg: string;
  title: string;
  subtitle: string;
  items: WallItem[];
  decos: WallDeco[];
}

export interface JournalWeek {
  weekKey: string;
  startKey: string;
  current: boolean;
  developed: boolean;
  blurred: boolean;
  wall: { version: number; layout: WallLayout; style: string } | null;
  members: { user: PublicUser; posts: Post[] }[];
  thisWeekIn: { yearsAgo: number; posts: Post[] } | null;
}

export interface GroupDetail {
  group: {
    id: string;
    name: string;
    emoji: string;
    mascot: MascotState;
    ritualDay: number;
    developHour: number;
    timeZone: string;
    inviteCode: string;
    inviteUrl: string;
    archiveOpen: boolean;
    createdBy: string;
    createdAt: number;
  };
  me: { role: 'admin' | 'member'; joinedAt: number };
  members: { user: PublicUser; role: string; joinedAt: number; badge: string | null }[];
  ritual: RitualState;
  quest: { weekKey: string; label: string; reward: string; progress: number; goal: number; rewarded: boolean; members: { user: PublicUser; count: number }[] };
  unlocked: boolean;
  gate: { have: number; need: number; max: number };
  archive: { open: boolean; yes: number; no: number; mine: number | null; need: number };
  storage: { used: number; budget: number | null; tier: string; byMember: { user: PublicUser; bytes: number; posts: number }[] };
  packs: { id: string; weekKey: string; source: string; createdAt: number }[];
  live: Post[];
}

export interface CardNumber {
  set: string;
  n: number;
  of: number;
}

export interface CardT {
  id: string;
  groupId: string;
  postId: string;
  ownerId: string;
  rarity: Rarity;
  serial: number | null;
  traits: { backdrop: string; symbol: string } | null;
  flair: string | null;
  source: string;
  obtainedAt: number;
  post: Post | null;
  /** Collector number in its set (the week). */
  number: CardNumber | null;
  /** Copies of the same (moment, tier) the owner holds. */
  copies?: number;
  duplicate?: boolean;
  isNew?: boolean;
  dust?: number;
}

/** A card shown face-up without an owned copy (Wonder Pick, Card Dex). */
export interface CardFaceT {
  postId: string;
  rarity: Rarity;
  number: CardNumber | null;
  post: Post | null;
  serial?: number | null;
  traits?: { backdrop: string; symbol: string } | null;
  flair?: string | null;
}

export interface Stamina {
  value: number;
  at: number;
  max: number;
  next: number | null;
}

export interface OddsTableT {
  slots: { positions: number[]; odds: Partial<Record<Rarity, number>> }[];
  rarePack: { chance: number; odds: Partial<Record<Rarity, number>> };
}

export interface Blitz {
  isOpen: boolean;
  opensAt: number;
  closesAt: number;
  now: number;
}

export interface MissionsT {
  list: { kind: 'wonder' | 'collect'; goal: number; progress: number }[];
  reward: number;
  done: boolean;
  claimed: boolean;
  resetsAt: number;
}

export interface WonderOffer {
  id: string;
  opener: PublicUser | null;
  createdAt: number;
  cost: number;
  best: Rarity;
  picked: boolean;
  cards: CardFaceT[];
}

export interface TradeT {
  id: string;
  status: 'open' | 'accepted' | 'completed' | 'declined' | 'cancelled' | 'expired';
  rarity: Rarity;
  createdAt: number;
  closedAt: number | null;
  expiresAt: number;
  incoming: boolean;
  from: PublicUser;
  to: PublicUser;
  offer: CardT | null;
  give: CardT | null;
}

export interface Collectible {
  card: CardT;
  owner: PublicUser | null;
  mine: boolean;
  worn: boolean;
  traits: {
    model: { rarity: Rarity; name: string; mark: string; pct: number };
    backdrop: { id: string; name: string; from: string; to: string; pct: number };
    symbol: { id: string; name: string; pct: number };
  } | null;
  quantity: { issued: number; of: number };
  upgradeCost: number;
  backdrops: { id: string; name: string; from: string; to: string }[];
}

export interface ShowcaseT {
  id: string;
  kind: 'binder' | 'display';
  style: string | null;
  visibility: 'private' | 'friends';
  createdAt: number;
  mine: boolean;
  owner: PublicUser | null;
  cards: CardT[];
}

export interface ShopItemT {
  id: string;
  kind: 'outfit' | 'theme' | 'icon' | 'sleeve' | 'cover' | 'backdrop' | 'pack';
  name: string | null;
  color?: { id: string; from: string; to: string };
  sparks: number;
  plusOnly?: boolean;
  exclusive: boolean;
  owned: boolean;
}

export interface Message {
  id: string;
  groupId: string;
  userId: string | null;
  kind: 'text' | 'photo' | 'voice' | 'sticker' | 'plan' | 'system' | 'gm' | 'post_reply';
  body: string | null;
  media: string | null;
  refId: string | null;
  createdAt: number;
  meta: Record<string, unknown>;
  user: PublicUser | null;
  plan?: PlanT | null;
  /** the History photo a post_reply answers (Locket chat [I]) */
  post?: Post | null;
}

export interface PlanT {
  id: string;
  groupId: string;
  title: string;
  theme: string;
  effect: string;
  titleFont: string;
  startsAt: number | null;
  location: string | null;
  details: string | null;
  createdAt: number;
  createdBy: PublicUser | null;
  options: { at: number; votes: { user: PublicUser | null; vote: string }[] }[];
  going: PublicUser[];
  maybe: PublicUser[];
  cantGoCount: number;
  invited: PublicUser[];
  mine: 'going' | 'maybe' | 'cant_go' | null;
  isHost: boolean;
  album: Post[];
  albumExpiresAt: number | null;
  albumKept: boolean;
  blastsLeft: number;
}

export interface LikenessObject {
  id: string;
  groupId: string | null;
  kind: string;
  createdBy: string;
  subjects: string[];
  media: string;
  style: string | null;
  provenance: { generator: string; model: string | null; createdAt: number; subjects: string[]; consentChecked: boolean; watermark: string };
  createdAt: number;
  revoked: boolean;
  meta: Record<string, unknown>;
  creator?: PublicUser | null;
}
