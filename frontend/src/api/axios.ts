import axios from 'axios';
import { storage } from '../utils/storage';

export const getBaseUrl = (): string => {
  return storage.getApiUrl();
};

const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Dynamic BaseURL interceptor
api.interceptors.request.use(
  (config) => {
    config.baseURL = getBaseUrl();
    const token = storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token expiry / global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on Unauthorized if needed
      // Note: Components or AuthContext will handle state redirection
    }
    return Promise.reject(error);
  }
);

export default api;
