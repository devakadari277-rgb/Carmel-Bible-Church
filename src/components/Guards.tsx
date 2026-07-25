import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from './Loader';

export const AuthGuard: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export const AdminGuard: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  // Ensure user exists and has role 'admin'
  if (!user || user.role !== 'admin') {
    return <Navigate to="/access-denied" replace />;
  }

  return <Outlet />;
};
