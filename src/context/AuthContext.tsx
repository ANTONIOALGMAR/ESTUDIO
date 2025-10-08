import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import api, { setAuthToken, setupInterceptors } from '../api/api';

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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  const logout = useCallback(async () => {
    try {
      await api.post('/api/unified-auth/logout');
    } catch (error) {
      console.error("Erro no logout do servidor, limpando o estado localmente.", error);
    } finally {
      setUser(null);
      setAuthToken(null);
    }
  }, []);

  useEffect(() => {
    // Configura os interceptors, passando a função de logout para eles.
    // Isso permite que o módulo da API deslogue o usuário se o refresh token falhar.
    setupInterceptors(logout);

    const verifyUser = async () => {
      try {
        const response = await api.get('/api/unified-auth/refresh');
        const { accessToken, user } = response.data;
        setUser(user);
        setAuthToken(accessToken);
      } catch (error) {
        console.log("Nenhuma sessão ativa encontrada.");
      } finally {
        setIsInitialLoading(false);
      }
    };

    verifyUser();
  }, [logout]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/api/unified-auth/login', { email, password });
      const { accessToken, user } = response.data;
      setUser(user);
      setAuthToken(accessToken);
    } catch (error) {
      setAuthToken(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {!isInitialLoading && children}
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