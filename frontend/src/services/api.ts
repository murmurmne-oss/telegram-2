import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Добавляем токен из localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Добавляем Telegram initData для дополнительной валидации
    const tg = window.Telegram?.WebApp;
    if (tg?.initData) {
      config.headers['X-Telegram-Init-Data'] = tg.initData;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || 'Произошла ошибка';

    // Обработка ошибок
    if (error.response?.status === 401) {
      // Unauthorized - очистить токен и перенаправить
      localStorage.removeItem('token');
      toast.error('Сессия истекла. Пожалуйста, войдите снова.');
    } else if (error.response?.status === 403) {
      toast.error('Доступ запрещён');
    } else if (error.response?.status === 404) {
      toast.error('Ресурс не найден');
    } else if (error.response?.status === 500) {
      toast.error('Ошибка сервера. Попробуйте позже.');
    } else {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;
