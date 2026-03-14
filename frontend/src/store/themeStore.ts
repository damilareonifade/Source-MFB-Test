'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'light',
      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: next });
        document.documentElement.classList.toggle('dark', next === 'dark');
      },
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.classList.toggle('dark', theme === 'dark');
      },
    }),
    { name: 'sfb-theme' }
  )
);

// Apply persisted theme on load
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('sfb-theme');
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as { state?: { theme?: string } };
      if (parsed?.state?.theme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    } catch {
      // ignore
    }
  }
}
