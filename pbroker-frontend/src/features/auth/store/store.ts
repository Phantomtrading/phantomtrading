import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

export interface AuthState {
  user: User | null;
  setUser: (u: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user: User) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: 'auth-storage' }
  )
);
