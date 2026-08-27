import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  Player,
  LoginPayload,
  RegisterPayload,
  AuthResponse,
} from '../types/player';
import { playerApi } from '../api/player';
import { storage } from '../utils/storage';
import { formatApiError } from '../utils/formatters';

interface AuthContextType {
  player: Player | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<Player>;
  register: (payload: RegisterPayload) => Promise<Player>;
  logout: () => void;
  refreshProfile: () => Promise<Player | null>;
  clearError: () => void;
  setPlayerState: (player: Player) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [token, setToken] = useState<string | null>(storage.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const extractToken = (res: AuthResponse): string | null => {
    return (
      res.access_token ||
      res.token ||
      res.jwt ||
      res.data?.access_token ||
      res.data?.token ||
      null
    );
  };

  const refreshProfile = useCallback(async (): Promise<Player | null> => {
    const currentToken = storage.getToken();
    if (!currentToken) {
      setPlayer(null);
      setIsLoading(false);
      return null;
    }

    try {
      const fetchedPlayer = await playerApi.getMe();
      setPlayer(fetchedPlayer);
      setError(null);
      return fetchedPlayer;
    } catch (err: any) {
      console.error('Failed to fetch player profile:', err);
      // If unauthorized, token is expired or invalid
      if (err.response?.status === 401) {
        storage.removeToken();
        setToken(null);
        setPlayer(null);
      } else {
        setError(formatApiError(err));
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // On initial mount, load profile if token exists
  useEffect(() => {
    const initialToken = storage.getToken();
    if (initialToken) {
      setToken(initialToken);
      refreshProfile();
    } else {
      setIsLoading(false);
    }
  }, [refreshProfile]);

  const login = async (payload: LoginPayload): Promise<Player> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await playerApi.login(payload);
      const jwtToken = extractToken(res);

      if (!jwtToken) {
        throw new Error(
          'Authentication response did not contain a valid JWT access token.'
        );
      }

      // 1. Save access_token
      storage.setToken(jwtToken);
      setToken(jwtToken);

      // 2. Authoritative GET /players/me call
      const authoritativePlayer = await playerApi.getMe();
      setPlayer(authoritativePlayer);
      setError(null);
      return authoritativePlayer;
    } catch (err: any) {
      console.error('Login error:', err);
      const friendlyMessage = formatApiError(err);
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload): Promise<Player> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await playerApi.register(payload);
      let jwtToken = extractToken(res);

      // If registration did not return a token, automatically log in
      if (!jwtToken) {
        const loginRes = await playerApi.login({
          email: payload.email,
          password: payload.password,
        });
        jwtToken = extractToken(loginRes);
      }

      if (!jwtToken) {
        throw new Error(
          'Registration completed, but could not establish an active session.'
        );
      }

      // Save token
      storage.setToken(jwtToken);
      setToken(jwtToken);

      // Authoritative GET /players/me
      const authoritativePlayer = await playerApi.getMe();
      setPlayer(authoritativePlayer);
      setError(null);
      return authoritativePlayer;
    } catch (err: any) {
      console.error('Registration error:', err);
      const friendlyMessage = formatApiError(err);
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    storage.removeToken();
    setToken(null);
    setPlayer(null);
    setError(null);
  };

  const clearError = () => setError(null);

  const setPlayerState = (updated: Player) => {
    setPlayer(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        player,
        token,
        isAuthenticated: !!token && !!player,
        isLoading,
        error,
        login,
        register,
        logout,
        refreshProfile,
        clearError,
        setPlayerState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
