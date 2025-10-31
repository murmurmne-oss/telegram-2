import { create } from 'zustand';
import { api } from '../services/api';

interface User {
  id: string;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
  role: string;
  isPremium: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  initialize: (initData: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,

  initialize: async (initData: string) => {
    set({ isLoading: true });

    try {
      // Если initData пустой (тестирование), пропускаем
      if (!initData) {
        console.warn('No initData, skipping authentication');
        set({ isLoading: false });
        return;
      }

      // Аутентификация через API
      const response = await api.post('/auth/telegram', { initData });
      const { user, token } = response.data.data;

      // Сохраняем токен в localStorage
      localStorage.setItem('token', token);

      // Устанавливаем токен в axios по умолчанию
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Authentication failed:', error);
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];

    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  setUser: (user: User) => {
    set({ user });
  },
}));

// Восстановление токена при загрузке
const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  useAuthStore.setState({ token, isAuthenticated: true });
}
