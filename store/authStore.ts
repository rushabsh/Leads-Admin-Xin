import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api, { setToken } from '../lib/api';
import { MockUser } from '../utils/mockData';

interface AuthState {
  user: MockUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<{ success: boolean; message: string; role?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (emailOrUsername, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/login', { emailOrUsername, password });
          const { accessToken, user } = response.data;

          setToken(accessToken);

          set({
            user,
            accessToken,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true, message: 'Logged in successfully', role: user.role };
        } catch (error: any) {
          set({ isLoading: false });
          return {
            success: false,
            message: error.response?.data?.message || 'Login failed. Please check your credentials.'
          };
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await api.post('/auth/logout');
        } catch (e) {
          console.error('Logout error on backend', e);
        }

        setToken(null);

        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      checkAuth: async () => {
        try {
          const response = await api.get('/auth/me');
          const { user } = response.data;
          set({
            user,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (e) {
          setToken(null);
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
