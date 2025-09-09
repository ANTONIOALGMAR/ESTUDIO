import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('auth-token');

  if (!token) {
    // Se não houver token, redireciona para a página de login
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
