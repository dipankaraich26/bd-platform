import { create } from 'zustand';
import api from './api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,

  loadFromStorage: () => {
    const token = localStorage.getItem('bd_token');
    const userStr = localStorage.getItem('bd_user');
    if (token && userStr) {
      set({ token, user: JSON.parse(userStr) });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('bd_token', data.token);
    localStorage.setItem('bd_user', JSON.stringify(data.user));
    set({ token: data.token, user: data.user, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('bd_token');
    localStorage.removeItem('bd_user');
    set({ user: null, token: null });
  },
}));
