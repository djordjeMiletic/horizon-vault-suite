import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/lib/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export const ProtectedRoute = ({ 
  children, 
  allowedRoles,
  redirectTo = '/login' 
}: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};