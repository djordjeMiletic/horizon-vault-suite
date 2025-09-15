import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useSession } from '@/state/SessionContext';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { SidebarProvider } from '@/components/ui/sidebar';

export const AppLayout = () => {
  const { user } = useSession();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isAdvisorRoute = location.pathname.startsWith('/advisor');
  const isClientRoute = location.pathname.startsWith('/client'); 
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isHRRoute = location.pathname.startsWith('/hr');

  // Role-based access control
  if (isAdvisorRoute && !['Advisor', 'Manager', 'ReferralPartner'].includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  if (isClientRoute && user.role !== 'Client') {
    return <Navigate to="/unauthorized" replace />;
  }
  
  if (isAdminRoute && user.role !== 'Administrator') {
    return <Navigate to="/unauthorized" replace />;
  }
  
  if (isHRRoute && !['Administrator', 'Manager'].includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 p-2 sm:p-4 lg:p-6 overflow-x-hidden animate-fade-in">
            <div className="w-full overflow-hidden">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};