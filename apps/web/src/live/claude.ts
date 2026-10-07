/**
 * The Claude artifact runtime as the in-Claude build uses it. `window.claude.use(name)` resolves a
 * capability's namespace, or null when this view cannot run it. Only the members the app calls are
 * typed here; the platform's own type definitions are authoritative.
 */

export interface DocSnap {
  id: string;
  exists: boolean;
  data(): Record<string, unknown> | undefined;
  metadata: { fromCache: boolean; hasPendingWrites: boolean };
}
export interface QuerySnap {
  docs: DocSnap[];
  size: number;
  empty: boolean;
  docChanges(): { type: 'added' | 'modified' | 'removed'; doc: DocSnap }[];
  metadata: { fromCache: boolean; hasPendingWrites: boolean };
}
export interface DbError {
  code: string;
  message: string;
}
export interface Query {
  where(field: string, op: string, value: unknown): Query;
  orderBy(field: string, dir?: 'asc' | 'desc'): Query;
  limit(n: number): Query;
  get(): Promise<QuerySnap>;
  onSnapshot(next: (s: QuerySnap) => void, error?: (e: DbError) => void): () => void;
}
export interface DocRef {
  id: string;
  path: string;
  get(): Promise<DocSnap>;
  set(data: Record<string, unknown>): Promise<void>;
  update(data: Record<string, unknown>): Promise<void>;
  delete(): Promise<void>;
  acquire(o: { holder: string; ttlMs?: number; data?: Record<string, unknown> }): Promise<{ acquired: boolean; expiresAt?: string }>;
  onSnapshot(next: (s: DocSnap) => void, error?: (e: DbError) => void): () => void;
}
export interface CollectionRef extends Query {
  path: string;
  doc(id?: string): DocRef;
}
export interface Db {
  doc(path: string): DocRef;
  collection(path: string): CollectionRef;
}
export interface Assets {
  upload(blob: Blob, o?: { type?: string }): Promise<{ id: string; url: string; sizeBytes: number; contentType: string }>;
  delete(ref: string): Promise<{ deleted: boolean }>;
}
export interface Profile {
  id: string;
  name: string;
  avatarUrl: string;
  color: string;
  isMe: boolean;
  guest: boolean;
}
export interface User {
  id(): Promise<string | null>;
  me(): Promise<{ id: string | null; name: string; avatarUrl: string; color: string; isOwner: boolean; canEdit: boolean }>;
  profiles(ids: readonly string[]): Promise<Record<string, Profile>>;
  can(name: string): Promise<boolean | null>;
  canEdit(): Promise<boolean>;
  isOwner(): Promise<boolean>;
}
export interface RoomMessage {
  topic: string;
  data?: unknown;
  peer: string;
  by: string | null;
  isMe: boolean;
  sameTab: boolean;
  kind: 'viewer' | 'agent';
  guest: boolean;
}
export interface Room {
  emit(topic: string, data?: unknown): Promise<void>;
  on(topic: string, fn: (msg: RoomMessage) => void, onError?: (e: { code: string }) => void): () => void;
}
export interface Sample {
  (input: string | { role: 'user' | 'assistant'; content: string }[], o?: Record<string, unknown>): Promise<{ text: string; truncated: boolean }>;
  json<T = unknown>(input: string | { role: 'user' | 'assistant'; content: string }[], o?: Record<string, unknown>): Promise<T>;
}
export interface Downloads {
  save(o: { filename: string; data: Blob | string | Uint8Array }): Promise<unknown>;
}

interface CapabilityMap {
  db: Db;
  assets: Assets;
  user: User;
  room: Room;
  sample: Sample;
  downloads: Downloads;
}

type ClaudeRuntime = { use<K extends keyof CapabilityMap>(name: K): Promise<CapabilityMap[K] | null> };

export function runtime(): ClaudeRuntime | null {
  return (window as unknown as { claude?: ClaudeRuntime }).claude ?? null;
}

export async function use<K extends keyof CapabilityMap>(name: K): Promise<CapabilityMap[K] | null> {
  const rt = runtime();
  if (!rt?.use) return null;
  try {
    return await rt.use(name);
  } catch {
    return null;
  }
}
