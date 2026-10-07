import { create } from 'zustand';

export interface Toast {
  id: string;
  title: string;
  body: string;
  kind?: string;
  groupId?: string | null;
  icon?: string;
  at: number;
}

interface UiState {
  activeGroupId: string | null;
  setActiveGroup: (id: string | null) => void;
  toasts: Toast[];
  pushToast: (t: Omit<Toast, 'id' | 'at'>) => void;
  dismissToast: (id: string) => void;
  /** Emoji rain on a post (Locket reactions). */
  rain: { postId: string; emoji: string; key: number } | null;
  setRain: (r: UiState['rain']) => void;
  stage: 'app' | 'lock' | 'home';
  setStage: (s: UiState['stage']) => void;
}

const savedGroup = (() => {
  try {
    return localStorage.getItem('roll.group');
  } catch {
    return null;
  }
})();

export const useUi = create<UiState>((set) => ({
  activeGroupId: savedGroup,
  setActiveGroup: (id) => {
    try {
      if (id) localStorage.setItem('roll.group', id);
    } catch {
      /* storage unavailable */
    }
    set({ activeGroupId: id });
  },
  toasts: [],
  pushToast: (t) =>
    set((s) => ({ toasts: [...s.toasts.slice(-3), { ...t, id: Math.random().toString(36).slice(2), at: Date.now() }] })),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  rain: null,
  setRain: (rain) => set({ rain }),
  stage: 'app',
  setStage: (stage) => set({ stage }),
}));
