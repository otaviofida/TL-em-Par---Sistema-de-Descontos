import { create } from 'zustand';
import { api } from '../lib/api';
import type { User, LoginResponse } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string; cpf?: string }) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('@tlEmPar:accessToken'),
  isLoading: false,

  login: async (email, password) => {
    const { data } = await api.post<{ success: boolean; data: LoginResponse }>('/auth/login', { email, password });
    localStorage.setItem('@tlEmPar:accessToken', data.data.accessToken);
    localStorage.setItem('@tlEmPar:refreshToken', data.data.refreshToken);
    set({ user: data.data.user, isAuthenticated: true });
  },

  register: async (formData) => {
    const { data } = await api.post<{ success: boolean; data: LoginResponse }>('/auth/register', formData);
    localStorage.setItem('@tlEmPar:accessToken', data.data.accessToken);
    localStorage.setItem('@tlEmPar:refreshToken', data.data.refreshToken);
    set({ user: data.data.user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('@tlEmPar:accessToken');
    localStorage.removeItem('@tlEmPar:refreshToken');
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      set({ isLoading: true });
      const { data } = await api.get<{ success: boolean; data: User }>('/auth/me');
      set({ user: data.data, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
      localStorage.removeItem('@tlEmPar:accessToken');
      localStorage.removeItem('@tlEmPar:refreshToken');
    }
  },
}));
