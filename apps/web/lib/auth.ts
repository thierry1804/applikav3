'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token): void => {
        set({ token });
      },
      clearToken: (): void => {
        set({ token: null });
      },
    }),
    { name: 'dogapp-auth' },
  ),
);
