import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useMemo } from 'react';
import api, { setAuthToken, setupInterceptors } from '../api/api';
import { CircularProgress, Box } from '@mui/material';

// Interfaces
interface IUser {
  id: string;
  fullName: string;
  email: string;
  userType: 'admin' | 'customer';
}

interface IAuthContext {
  user: IUser | null;
  isLoading: boolean;
  isInitialLoading: boolean;
  login: (email: string, password: string) => Promise<IUser>;
  logout: () => void;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  const logout = useCallback(async () => {
    console.log('[AuthContext] Logging out...');
    try {
      await api.post('/api/unified-auth/logout');
    } catch (error) {
      console.error("[AuthContext] Server logout failed, clearing state locally.", error);
    }
    finally {
      setUser(null);
      setAuthToken(null);
    }
  }, []);

  useEffect(() => {
    setupInterceptors(logout);

    const verifyUser = async () => {
      try {
        const response = await api.get('/api/unified-auth/refresh');
        setUser(response.data.user);
        setAuthToken(response.data.accessToken);
      } catch (error) {
        // console.log("Nenhuma sessão ativa encontrada.");
      } finally {
        setIsInitialLoading(false);
      }
    };

    verifyUser();
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/api/unified-auth/login', { email, password });
      const { accessToken, user } = response.data;
      setUser(user);
      setAuthToken(accessToken);
      return user; // Retorna o usuário em caso de sucesso
    } catch (error) {
      setAuthToken(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const authContextValue = useMemo(() => ({
    user,
    isLoading,
    isInitialLoading,
    login,
    logout,
  }), [user, isLoading, isInitialLoading, login, logout]);

  // Previne a renderização do app antes da verificação inicial de autenticação
  if (isInitialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};