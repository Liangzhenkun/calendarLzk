import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute; 