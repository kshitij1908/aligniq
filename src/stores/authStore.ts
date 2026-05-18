// ============================================================
// Auth Store — Role-based authentication + SSO simulation
// ============================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '../types';
import { useDataStore } from './dataStore';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isSSOLogin: boolean;
  ssoLoading: boolean;
  login: (userId: string) => void;
  logout: () => void;
  switchRole: (userId: string) => void;
  loginWithMicrosoft: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,
      isSSOLogin: false,
      ssoLoading: false,

      login: (userId: string) => {
        const user = useDataStore.getState().getUser(userId);
        if (user) {
          set({ currentUser: user, isAuthenticated: true, isSSOLogin: false });
        }
      },

      logout: () => {
        set({ currentUser: null, isAuthenticated: false, isSSOLogin: false });
      },

      switchRole: (userId: string) => {
        const user = useDataStore.getState().getUser(userId);
        if (user) {
          set({ currentUser: user, isAuthenticated: true });
        }
      },

      loginWithMicrosoft: async (userId: string) => {
        set({ ssoLoading: true });
        // Simulate Azure AD OAuth2 redirect + token exchange delay
        await new Promise(r => setTimeout(r, 1800));
        const user = useDataStore.getState().getUser(userId);
        if (user) {
          set({ currentUser: user, isAuthenticated: true, isSSOLogin: true, ssoLoading: false });
        } else {
          set({ ssoLoading: false });
        }
      },
    }),
    { name: 'aligniq-auth' }
  )
);
