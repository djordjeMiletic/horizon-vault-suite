import { Bell, LogOut, User } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export const Topbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getBreadcrumb = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    if (segments.length >= 2) {
      const portal = segments[0];
      const section = segments[1];
      
      return (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span className="capitalize">{portal}</span>
          <span>/</span>
          <span className="text-foreground capitalize">{section}</span>
        </div>
      );
    }
    
    return null;
  };

  if (!user) return null;

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="h-full flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <SidebarTrigger className="md:hidden" />
          
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-accent rounded-lg flex items-center justify-center">
              <span className="text-background font-bold text-sm">EH</span>
            </div>
            <span className="hidden md:block font-semibold text-lg">
              Event Horizon
            </span>
          </Link>
          
          {getBreadcrumb()}
        </div>

        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              2
            </Badge>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                  <Badge variant="secondary" className="w-fit capitalize">
                    {user.role}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};