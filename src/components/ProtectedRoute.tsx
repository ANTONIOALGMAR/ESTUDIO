import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from 'react-bootstrap';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isInitialLoading } = useAuth();

  if (isInitialLoading) {
    // Enquanto verifica a sessão, mostra um loading para evitar redirecionamentos incorretos
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!user || user.userType !== 'admin') {
    // Se não há usuário ou o usuário não é admin, redireciona para o login
    return <Navigate to="/login" replace />;
  }

  // Se o usuário é admin, permite o acesso
  return children;
};

export default ProtectedRoute;