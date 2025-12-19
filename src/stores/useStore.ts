import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AppState {
  // 사용자 상태
  user: User | null;
  isAuthenticated: boolean;

  // UI 상태
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';

  // 액션
  setUser: (user: User | null) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  logout: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // 초기 상태
      user: null,
      isAuthenticated: false,
      sidebarOpen: true,
      theme: 'system',

      // 액션
      setUser: (user) => set({
        user,
        isAuthenticated: !!user
      }),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      toggleSidebar: () => set((state) => ({
        sidebarOpen: !state.sidebarOpen
      })),

      setTheme: (theme) => set({ theme }),

      logout: () => set({
        user: null,
        isAuthenticated: false
      }),
    }),
    {
      name: 'political-arena-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
