// Centralized Axios instance with sensible defaults
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 10000, // 10s to avoid hanging loaders
});

// Ensure Authorization header is forwarded from global axios (set by auth store)
api.interceptors.request.use((config) => {
  const bearer = axios.defaults.headers.common['Authorization'];
  if (bearer && !config.headers['Authorization']) {
    config.headers['Authorization'] = bearer;
  }
  return config;
});

export default api;