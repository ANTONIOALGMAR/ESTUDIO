import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import api, { setAuthToken } from '../api/api';

// Interfaces
interface IUser {
  id: string;
  fullName: string;
  email: string;
  userType: 'admin' | 'customer';
}

interface IAuthContext {
  user: IUser | null;
  isLoading: boolean; // Loading state for login/logout operations
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // For login/logout UI feedback
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true); // For initial session check

  useEffect(() => {
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
  }, []);

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

  const logout = async () => {
    // We don't set loading here, as it might unmount components before navigation completes
    try {
      await api.post('/api/unified-auth/logout');
    } catch (error) {
      console.error("Erro no logout do servidor, limpando o estado localmente.", error);
    } finally {
      setUser(null);
      setAuthToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {/* Only render children after the initial session check is complete */}
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
