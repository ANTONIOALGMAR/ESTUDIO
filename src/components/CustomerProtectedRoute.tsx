import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from 'react-bootstrap';

interface CustomerProtectedRouteProps {
  children: React.ReactElement;
}

const CustomerProtectedRoute: React.FC<CustomerProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // Mostra um loading enquanto a sessão está sendo verificada
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!user) {
    // Se não há usuário logado, redireciona para a página de login principal
    return <Navigate to="/login" replace />;
  }

  // Se houver um usuário, permite o acesso (pode ser admin ou cliente)
  // Se quiséssemos restringir APENAS a clientes, adicionaríamos: if (user.userType !== 'customer') return <Navigate to="/login" replace />;
  return children;
};

export default CustomerProtectedRoute;