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
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Começa como true para verificar a sessão

  useEffect(() => {
    const verifyUser = async () => {
      try {
        // Tenta obter um novo access token usando o cookie de refresh token
        const response = await api.get('/api/unified-auth/refresh');
        const { accessToken, user } = response.data;
        
        setUser(user);
        setAuthToken(accessToken);
      } catch (error) {
        // Se falhar, significa que não há sessão válida, o que é normal
        console.log("Nenhuma sessão ativa encontrada.");
      } finally {
        setIsLoading(false);
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
      console.error("Falha no login:", error);
      setAuthToken(null); // Garante que o token antigo seja limpo em caso de falha
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.post('/api/unified-auth/logout');
    } catch (error) {
      console.error("Erro no logout do servidor, limpando o estado localmente.", error);
    } finally {
      setUser(null);
      setAuthToken(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {/* Não renderiza o app enquanto verifica a sessão para evitar piscar a tela */}
      {!isLoading && children}
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