import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '@/state/SessionContext';
import type { UserSession } from '@/types/api';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserSession["role"][];
  redirectTo?: string;
}

export const ProtectedRoute = ({ 
  children, 
  allowedRoles,
  redirectTo = '/login' 
}: ProtectedRouteProps) => {
  const { user } = useSession();
  const location = useLocation();

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};