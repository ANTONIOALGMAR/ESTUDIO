import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('auth-token');
  const userString = localStorage.getItem('user');

  if (!token || !userString) {
    // Se não houver token ou dados do usuário, redireciona para o login
    return <Navigate to="/login" />;
  }

  try {
    const user = JSON.parse(userString);

    if (user.userType !== 'admin') {
      // Se o usuário não for admin, redireciona para o login
      // (ou para uma página de "acesso negado" no futuro)
      return <Navigate to="/login" />;
    }

    // Se for admin, permite o acesso à rota
    return children;

  } catch (error) {
    // Se houver erro ao parsear os dados do usuário, limpa o storage e redireciona
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user');
    return <Navigate to="/login" />;
  }
};

export default ProtectedRoute;
