// src/store/auth-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/services/api';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: 'user' | 'admin' | 'restaurant';
}

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login({ email, password });
          const { token, user } = response.data;
          
          localStorage.setItem('token', token);
          set({ user, isAuthenticated: true, isLoading: false });
          return true;
        } catch (error: any) {
          const message = error.response?.data?.message || 'Erreur de connexion';
          set({ error: message, isLoading: false });
          return false;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(userData);
          const { token, user } = response.data;
          
          localStorage.setItem('token', token);
          set({ user, isAuthenticated: true, isLoading: false });
          return true;
        } catch (error: any) {
          const message = error.response?.data?.message || "Erreur d'inscription";
          set({ error: message, isLoading: false });
          return false;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, isAuthenticated: false });
      },

      checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        try {
          const response = await authService.getMe();
          set({ user: response.data, isAuthenticated: true });
        } catch (error) {
          localStorage.removeItem('token');
          set({ isAuthenticated: false, user: null });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);