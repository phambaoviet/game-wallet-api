import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storage } from '../utils/storage';
import { playerApi } from '../api/player';

interface ApiContextType {
  apiUrl: string;
  isBackendConnected: boolean | null; // null = checking
  isChecking: boolean;
  updateApiUrl: (newUrl: string) => void;
  resetApiUrl: () => void;
  checkConnection: () => Promise<boolean>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiUrl, setApiUrl] = useState<string>(storage.getApiUrl());
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    setIsChecking(true);
    try {
      const isReachable = await playerApi.pingBackend();
      setIsBackendConnected(isReachable);
      return isReachable;
    } catch {
      setIsBackendConnected(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [apiUrl, checkConnection]);

  const updateApiUrl = (newUrl: string) => {
    const formattedUrl = newUrl.replace(/\/$/, ''); // strip trailing slash
    storage.setApiUrl(formattedUrl);
    setApiUrl(formattedUrl);
  };

  const resetApiUrl = () => {
    storage.resetApiUrl();
    const defaultUrl = storage.getApiUrl();
    setApiUrl(defaultUrl);
  };

  return (
    <ApiContext.Provider
      value={{
        apiUrl,
        isBackendConnected,
        isChecking,
        updateApiUrl,
        resetApiUrl,
        checkConnection,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = (): ApiContextType => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};
