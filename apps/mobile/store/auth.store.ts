import { create } from 'zustand';

interface AuthState {
  token: string | null;
  selectedDogId: string | null;
  setToken: (token: string | null) => void;
  setSelectedDogId: (id: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  selectedDogId: null,
  setToken: (token) => set({ token }),
  setSelectedDogId: (id) => set({ selectedDogId: id }),
}));
