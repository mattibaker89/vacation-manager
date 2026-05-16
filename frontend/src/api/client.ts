import axios from 'axios';
import { useAuth } from '../composables/useAuth';

// baseURL '/api' is proxied to http://localhost:3000 by Vite in development
// (vite.config.ts server.proxy). In production, configure a reverse proxy instead.
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuth().getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLoginRequest = err.config?.url === '/auth/login';
    if (err.response?.status === 401 && !isLoginRequest) {
      useAuth().clearSession();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export default api;
