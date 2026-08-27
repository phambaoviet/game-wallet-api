const TOKEN_KEY = 'game_wallet_token';
const API_URL_KEY = 'game_wallet_api_url';
const DEFAULT_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const storage = {
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },
  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },
  getApiUrl: (): string => {
    return localStorage.getItem(API_URL_KEY) || DEFAULT_API_URL;
  },
  setApiUrl: (url: string): void => {
    localStorage.setItem(API_URL_KEY, url);
  },
  resetApiUrl: (): void => {
    localStorage.removeItem(API_URL_KEY);
  }
};
