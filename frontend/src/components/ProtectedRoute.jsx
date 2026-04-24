// frontend/src/components/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/auth/login" />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/unauthorized" />;
  return children;
};

export default ProtectedRoute;
