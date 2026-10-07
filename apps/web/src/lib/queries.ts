import { QueryClient, useQuery } from '@tanstack/react-query';
import { api } from './api';
import type { GroupDetail, JournalWeek, MeResponse, Message, PlanT, Post, RitualState, CardT, LikenessObject, CardNumber, Stamina, OddsTableT, Blitz, MissionsT, WonderOffer, TradeT, PublicUser, Collectible, ShowcaseT, ShopItemT } from './types';
import type { Rarity } from '@app/shared';
import { useUi } from './store';

export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 15_000, retry: 1, refetchOnWindowFocus: false } },
});

export const useConfig = () =>
  useQuery({
    queryKey: ['config'],
    queryFn: () => api.get<{ brand: { name: string }; demo: boolean; ai: { image: string; text: string }; vapidPublicKey: string; remixStyles: { id: string; name: string; local: boolean }[]; species: { id: string; name: string; body: string; belly: string; accent: string }[] }>('/config'),
    staleTime: Infinity,
  });

export const useMe = () => useQuery({ queryKey: ['me'], queryFn: () => api.get<MeResponse>('/me'), retry: false, retryOnMount: false });

/** The group the camera sends to and the journal shows (Locket's top-centre pill). */
export function useActiveGroup() {
  const me = useMe();
  const activeId = useUi((s) => s.activeGroupId);
  const groups = me.data?.groups ?? [];
  const group = groups.find((g) => g.id === activeId) ?? groups[0] ?? null;
  return { group, groups, me };
}

export const useGroup = (groupId: string | null | undefined) =>
  useQuery({ queryKey: ['group', groupId], queryFn: () => api.get<GroupDetail>(`/groups/${groupId}`), enabled: Boolean(groupId) });

export const useFeed = (groupId: string | null | undefined) =>
  useQuery({ queryKey: ['feed', groupId], queryFn: () => api.get<{ posts: Post[] }>(`/groups/${groupId}/feed`), enabled: Boolean(groupId) });

export const useJournal = (groupId: string | null | undefined) =>
  useQuery({ queryKey: ['journal', groupId], queryFn: () => api.get<{ weeks: JournalWeek[]; unlocked: boolean; memberCount: number }>(`/groups/${groupId}/journal?weeks=10`), enabled: Boolean(groupId) });

export const useRitual = (groupId: string | null | undefined) =>
  useQuery({ queryKey: ['ritual', groupId], queryFn: () => api.get<RitualState>(`/groups/${groupId}/ritual`), enabled: Boolean(groupId), refetchInterval: 60_000 });

export const useMessages = (groupId: string | null | undefined) =>
  useQuery({ queryKey: ['messages', groupId], queryFn: () => api.get<{ messages: Message[]; mascot: GroupDetail['group']['mascot'] }>(`/groups/${groupId}/messages`), enabled: Boolean(groupId) });

export const usePlan = (planId: string | undefined) =>
  useQuery({ queryKey: ['plan', planId], queryFn: () => api.get<{ plan: PlanT }>(`/plans/${planId}`), enabled: Boolean(planId) });

export interface BinderResponse {
  cards: CardT[];
  dex: { postId: string; rarity: Rarity; owned: boolean; number: CardNumber | null; post: Post }[];
  counter: { unique: number; total: number };
  completion: number;
  sets: { weekKey: string; owned: number; of: number; rewarded: boolean }[];
  wishlist: { postId: string; rarity: Rarity; highlighted: boolean }[];
  packs: { id: string; weekKey: string; source: string; createdAt: number }[];
  trade: Stamina;
  wonder: Stamina;
  shinedust: number;
  packPoints: number;
  sparks: number;
  binderSlots: number;
  odds: OddsTableT;
  canBuyPaidPacks: boolean;
  paidPackUsd: number;
  costs: { trade: Record<Rarity, number>; wonder: Record<Rarity, number>; exchange: Record<Rarity, number>; upgrade: Record<Rarity, number>; sparksPack: number; flair: { id: string; name: string; duplicates: number; dust: number } };
  limits: { wishlist: number; highlighted: number; binders: number; binderSlots: number };
  ritualOpen: boolean;
  blitz: Blitz;
  sleeve: string | null;
  badge: string | null;
  missions: MissionsT;
}

export const useBinder = (groupId: string | null | undefined) =>
  useQuery({ queryKey: ['binder', groupId], queryFn: () => api.get<BinderResponse>(`/groups/${groupId}/binder`), enabled: Boolean(groupId) });

export const useWonder = (groupId: string | null | undefined) =>
  useQuery({ queryKey: ['wonder', groupId], queryFn: () => api.get<{ offers: WonderOffer[]; binder: BinderResponse }>(`/groups/${groupId}/wonder`), enabled: Boolean(groupId) });

export interface TradeHub {
  trades: TradeT[];
  friends: PublicUser[];
  blitz: Blitz;
  stamina: Stamina;
  shinedust: number;
  cost: Record<Rarity, number>;
  ritualOnly: Rarity[];
}

export const useTrades = (groupId: string | null | undefined) =>
  useQuery({ queryKey: ['trades', groupId], queryFn: () => api.get<TradeHub>(`/groups/${groupId}/trades`), enabled: Boolean(groupId) });

export const useCollectible = (groupId: string | null | undefined, cardId: string | null | undefined) =>
  useQuery({ queryKey: ['collectible', groupId, cardId], queryFn: () => api.get<Collectible>(`/groups/${groupId}/cards/${cardId}`), enabled: Boolean(groupId && cardId) });

export interface SocialResponse {
  friends: { user: PublicUser; me: boolean; unique: number; total: number; badge: CardT | null }[];
  showcases: ShowcaseT[];
}

export const useSocial = (groupId: string | null | undefined) =>
  useQuery({ queryKey: ['social', groupId], queryFn: () => api.get<SocialResponse>(`/groups/${groupId}/social`), enabled: Boolean(groupId) });

export interface ShopResponse {
  sparks: number;
  plan: string;
  items: ShopItemT[];
  equipped: { sleeve: string | null; theme: string | null; icon: string | null };
  odds: OddsTableT;
}

export const useShop = () => useQuery({ queryKey: ['shop'], queryFn: () => api.get<ShopResponse>('/shop') });

/** Refreshes every Friend Cards query after a card changes hands. */
export function invalidateCards(groupId: string) {
  for (const k of ['binder', 'wonder', 'trades', 'social', 'collectible']) void queryClient.invalidateQueries({ queryKey: [k, groupId] });
  void queryClient.invalidateQueries({ queryKey: ['shop'] });
  void queryClient.invalidateQueries({ queryKey: ['me'] });
}

export const useObjects = (groupId: string | null | undefined, kind?: string) =>
  useQuery({ queryKey: ['objects', groupId, kind], queryFn: () => api.get<{ objects: LikenessObject[] }>(`/objects?${groupId ? `groupId=${groupId}` : ''}${kind ? `&kind=${kind}` : ''}`), enabled: groupId !== undefined });

export function invalidateGroup(groupId: string) {
  for (const k of ['group', 'feed', 'journal', 'ritual', 'binder', 'game', 'objects']) void queryClient.invalidateQueries({ queryKey: [k, groupId] });
  void queryClient.invalidateQueries({ queryKey: ['me'] });
}
