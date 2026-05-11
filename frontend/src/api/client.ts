import axios from 'axios';

// baseURL '/api' is proxied to http://localhost:3000 by Vite in development
// (vite.config.ts server.proxy). In production, configure a reverse proxy instead.
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export default api;
