import { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Settings, 
  Target,
  MessageSquare,
  Calendar,
  Shield,
  CreditCard,
  UserCheck,
  Briefcase,
  UserPlus,
  GitBranch,
  Ticket,
  BellRing,
  ClipboardList,
  FolderOpen
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSession } from '@/state/SessionContext';
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

export const Sidebar = () => {
  const { state, setOpenMobile, isMobile } = useSidebar();
  const { user } = useSession();
  const location = useLocation();

  const advisorItems = [
    { title: 'Dashboard', url: '/advisor/dashboard', icon: BarChart3 },
    { title: 'Reports', url: '/advisor/reports', icon: FileText },
    { title: 'Analytics', url: '/advisor/analytics', icon: BarChart3 },
    { title: 'Audit Log', url: '/advisor/audit', icon: Shield },
    { title: 'Goals', url: '/advisor/goals', icon: Target },
  ];

  const managerItems = [
    { title: 'Dashboard', url: '/manager/dashboard', icon: BarChart3 },
    { title: 'Reports', url: '/advisor/reports', icon: FileText },
    { title: 'Analytics', url: '/advisor/analytics', icon: BarChart3 },
    { title: 'Audit Log', url: '/advisor/audit', icon: Shield },
    { title: 'Goals', url: '/advisor/goals', icon: Target },
    { title: 'Recruitment', url: '/hr/jobs', icon: Briefcase },
    { title: 'Applicants', url: '/hr/applications', icon: UserPlus },
    { title: 'Interviews', url: '/hr/interviews', icon: Calendar },
    { title: 'Onboarding', url: '/hr/onboarding', icon: ClipboardList },
  ];

  const clientItems = [
    { title: 'Dashboard', url: '/client/dashboard', icon: BarChart3 },
    { title: 'Cases', url: '/client/cases', icon: FolderOpen },
    { title: 'Documents', url: '/client/documents', icon: FileText },
    { title: 'Messages', url: '/client/messages', icon: MessageSquare },
    { title: 'Notifications', url: '/client/notifications', icon: BellRing },
    { title: 'Appointments', url: '/client/appointments', icon: Calendar },
    { title: 'Tickets', url: '/client/tickets', icon: Ticket },
    { title: 'Profile', url: '/client/profile', icon: Settings },
    { title: 'Compliance & Privacy', url: '/client/compliance', icon: Shield },
  ];

  const adminItems = [
    { title: 'Dashboard', url: '/admin/dashboard', icon: BarChart3 },
    { title: 'Compliance', url: '/admin/compliance', icon: Shield },
    { title: 'Payments', url: '/admin/payments', icon: CreditCard },
    { title: 'Leads', url: '/admin/leads', icon: Users },
    { title: 'Referral Partners', url: '/admin/referrals', icon: UserCheck },
    { title: 'Pipeline', url: '/admin/pipeline', icon: GitBranch },
    { title: 'Tickets', url: '/admin/tickets', icon: Ticket },
    { title: 'Audit Logs', url: '/admin/audit', icon: ClipboardList },
    { title: 'Notifications', url: '/admin/notifications', icon: BellRing },
    { title: 'Reports', url: '/admin/reports', icon: FileText },
  ];

  const hrItems = [
    { title: 'Recruitment', url: '/hr/jobs', icon: Briefcase },
    { title: 'Applicants', url: '/hr/applications', icon: UserPlus },
    { title: 'Interviews', url: '/hr/interviews', icon: Calendar },
    { title: 'Onboarding', url: '/hr/onboarding', icon: ClipboardList },
  ];

  const getItems = () => {
    const path = location.pathname;
    if (path.startsWith('/advisor')) {
      // Hide other advisor items for referral partners
      if (user?.role === 'ReferralPartner') {
        return advisorItems.filter(item => item.url === '/advisor/reports');
      }
      // Show manager items (with HR tabs) if user is manager
      if (user?.role === 'Manager') {
        return managerItems;
      }
      return advisorItems;
    }
    if (path.startsWith('/manager')) {
      return managerItems;
    }
    if (path.startsWith('/referral')) {
      return advisorItems.filter(item => item.url === '/advisor/reports');
    }
    if (path.startsWith('/client')) return clientItems;
    if (path.startsWith('/admin')) return adminItems;
    if (path.startsWith('/hr')) return hrItems;
    return [];
  };

  const items = getItems();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const handleNavigation = () => {
    // Auto-close sidebar on navigation for mobile/tablet
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const getNavClassName = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? 'bg-secondary/30 text-secondary font-medium focus-visible:outline-2 focus-visible:outline-secondary animate-scale-in' 
      : 'hover:bg-secondary/15 text-neutral focus-visible:outline-2 focus-visible:outline-secondary hover-scale transition-all duration-200';

  if (items.length === 0) return null;

  return (
    <SidebarComponent
      className="bg-primary border-primary/20 animate-slide-in-right"
      collapsible="offcanvas"
    >
      {/* Mobile trigger always visible */}
      <div className="lg:hidden">
        <SidebarTrigger className="m-2" />
      </div>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary-foreground/80">
            {location.pathname.startsWith('/advisor') && 'Advisory Portal'}
            {location.pathname.startsWith('/manager') && 'Manager Portal'}
            {location.pathname.startsWith('/referral') && 'Referral Portal'}
            {location.pathname.startsWith('/client') && 'Client Portal'}
            {location.pathname.startsWith('/admin') && 'Admin Portal'}
            {location.pathname.startsWith('/hr') && 'HR Portal'}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item, index) => (
                <SidebarMenuItem key={item.title} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavClassName}
                      onClick={handleNavigation}
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon className="mr-2 h-4 w-4 opacity-80 transition-all duration-200" />
                          <span className={`transition-all duration-200 ${collapsed ? 'sr-only' : ''}`}>
                            {item.title}
                          </span>
                          {isActive && <span className="sr-only" aria-current="page">Current page</span>}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarComponent>
  );
};