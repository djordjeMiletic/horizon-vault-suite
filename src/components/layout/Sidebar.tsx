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
import { useAuth } from '@/lib/auth';
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
  const { state } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();

  const advisorItems = [
    { title: 'Dashboard', url: '/advisor/dashboard', icon: BarChart3 },
    { title: 'Reports', url: '/advisor/reports', icon: FileText },
    { title: 'Analytics', url: '/advisor/analytics', icon: BarChart3 },
    { title: 'Audit Log', url: '/advisor/audit', icon: Shield },
    { title: 'Goals', url: '/advisor/goals', icon: Target },
  ];

  const clientItems = [
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
    { title: 'Compliance', url: '/admin/compliance', icon: Shield },
    { title: 'Payments', url: '/admin/payments', icon: CreditCard },
    { title: 'Leads', url: '/admin/leads', icon: Users },
    { title: 'Referral Partners', url: '/admin/referrals', icon: UserCheck },
    { title: 'Pipeline', url: '/admin/pipeline', icon: GitBranch },
    { title: 'Tickets', url: '/admin/tickets', icon: Ticket },
    { title: 'Audit Logs', url: '/admin/audit', icon: ClipboardList },
    { title: 'Notifications', url: '/admin/notifications', icon: BellRing },
  ];

  const hrItems = [
    { title: 'Jobs', url: '/hr/jobs', icon: Briefcase },
    { title: 'Applications', url: '/hr/applications', icon: UserPlus },
    { title: 'Interviews', url: '/hr/interviews', icon: Calendar },
    { title: 'Onboarding', url: '/hr/onboarding', icon: ClipboardList },
  ];

  const getItems = () => {
    const path = location.pathname;
    if (path.startsWith('/advisor')) {
      // Hide other advisor items for referral partners
      if (user?.role === 'referral') {
        return advisorItems.filter(item => item.url === '/advisor/reports');
      }
      return advisorItems;
    }
    if (path.startsWith('/client')) return clientItems;
    if (path.startsWith('/admin')) return adminItems;
    if (path.startsWith('/hr')) return hrItems;
    return [];
  };

  const items = getItems();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const getNavClassName = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? 'bg-secondary/30 text-secondary font-medium focus-visible:outline-2 focus-visible:outline-secondary' 
      : 'hover:bg-secondary/15 text-neutral focus-visible:outline-2 focus-visible:outline-secondary';

  if (items.length === 0) return null;

  return (
    <SidebarComponent
      className={`${collapsed ? 'w-14' : 'w-60'} bg-primary border-primary/20`}
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {location.pathname.startsWith('/advisor') && 'Advisory Portal'}
            {location.pathname.startsWith('/client') && 'Client Portal'}
            {location.pathname.startsWith('/admin') && 'Admin Portal'}
            {location.pathname.startsWith('/hr') && 'HR Portal'}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavClassName}
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon className="mr-2 h-4 w-4 opacity-80" />
                          <span className={collapsed ? 'sr-only' : ''}>{item.title}</span>
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