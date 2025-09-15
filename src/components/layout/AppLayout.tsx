import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { SidebarProvider } from '@/components/ui/sidebar';

export const AppLayout = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isAdvisorRoute = location.pathname.startsWith('/advisor');
  const isClientRoute = location.pathname.startsWith('/client'); 
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isHRRoute = location.pathname.startsWith('/hr');

  // Role-based access control
  if (isAdvisorRoute && !['advisor', 'manager', 'referral'].includes(user?.role || '')) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  if (isClientRoute && user?.role !== 'client') {
    return <Navigate to="/unauthorized" replace />;
  }
  
  if (isAdminRoute && !['admin'].includes(user?.role || '')) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  if (isHRRoute && !['admin', 'manager'].includes(user?.role || '')) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 p-2 sm:p-4 lg:p-6 overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};