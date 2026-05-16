// ============================================================
// Auth Store — Role-based authentication for demo
// ============================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '../types';
import { useDataStore } from './dataStore';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (userId: string) => void;
  logout: () => void;
  switchRole: (userId: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,

      login: (userId: string) => {
        const user = useDataStore.getState().getUser(userId);
        if (user) {
          set({ currentUser: user, isAuthenticated: true });
        }
      },

      logout: () => {
        set({ currentUser: null, isAuthenticated: false });
      },

      switchRole: (userId: string) => {
        const user = useDataStore.getState().getUser(userId);
        if (user) {
          set({ currentUser: user, isAuthenticated: true });
        }
      },
    }),
    {
      name: 'aligniq-auth',
    }
  )
);
