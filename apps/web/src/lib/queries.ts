import { QueryClient, useQuery } from '@tanstack/react-query';
import { api } from './api';
import type { GroupDetail, JournalWeek, MeResponse, Message, PlanT, Post, RitualState, CardT, LikenessObject } from './types';
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
  dex: { postId: string; rarity: string; owned: boolean; post: Post }[];
  completion: number;
  wishlist: { postId: string; rarity: string; highlighted: boolean }[];
  packs: { id: string; weekKey: string; source: string; createdAt: number }[];
  trade: { value: number; at: number; max: number; next: number | null };
  wonder: { value: number; at: number; max: number; next: number | null };
  shinedust: number;
  packPoints: number;
  sparks: number;
  binderSlots: number;
  odds: Record<string, Record<string, number>>;
  canBuyPaidPacks: boolean;
  costs: { trade: Record<string, number>; wonder: Record<string, number>; exchange: Record<string, number>; upgrade: Record<string, number>; sparksPack: number; flair: { id: string; name: string; duplicates: number; dust: number } };
  ritualOpen: boolean;
}

export const useBinder = (groupId: string | null | undefined) =>
  useQuery({ queryKey: ['binder', groupId], queryFn: () => api.get<BinderResponse>(`/groups/${groupId}/binder`), enabled: Boolean(groupId) });

export const useObjects = (groupId: string | null | undefined, kind?: string) =>
  useQuery({ queryKey: ['objects', groupId, kind], queryFn: () => api.get<{ objects: LikenessObject[] }>(`/objects?${groupId ? `groupId=${groupId}` : ''}${kind ? `&kind=${kind}` : ''}`), enabled: groupId !== undefined });

export function invalidateGroup(groupId: string) {
  for (const k of ['group', 'feed', 'journal', 'ritual', 'binder', 'game', 'objects']) void queryClient.invalidateQueries({ queryKey: [k, groupId] });
  void queryClient.invalidateQueries({ queryKey: ['me'] });
}
