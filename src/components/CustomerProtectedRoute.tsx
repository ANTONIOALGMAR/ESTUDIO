import React from 'react';
import { Navigate } from 'react-router-dom';

interface CustomerProtectedRouteProps {
  children: React.ReactElement;
}

const CustomerProtectedRoute: React.FC<CustomerProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('customer-auth-token');

  if (!token) {
    // Se não houver token, redireciona para a página de login do cliente
    return <Navigate to="/customer/login" />;
  }

  return children;
};

export default CustomerProtectedRoute;
