import { Bell, LogOut, User } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useSession } from '@/state/SessionContext';
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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getNotifications, markAllRead } from '@/services/notifications';
import type { NotificationDto } from '@/types/api';

export const Topbar = () => {
  const { user, setUser } = useSession();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) return;
      
      setIsLoadingNotifications(true);
      try {
        const scope = user.role === 'Administrator' ? 'admin' : user.role === 'Client' ? 'client' : 'current';
        const data = await getNotifications(scope);
        setNotifications(data);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      } finally {
        setIsLoadingNotifications(false);
      }
    };

    loadNotifications();
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    
    try {
      const scope = user.role === 'Administrator' ? 'admin' : user.role === 'Client' ? 'client' : 'current';
      await markAllRead(scope);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast({ title: "Success", description: "All notifications marked as read" });
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
      toast({ title: "Error", description: "Failed to mark notifications as read", variant: "destructive" });
    }
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
    <header className="h-14 sm:h-16 border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="h-full flex items-center justify-between px-2 sm:px-4 lg:px-6">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <SidebarTrigger className="lg:hidden" />
          
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-accent rounded-lg flex items-center justify-center">
              <span className="text-background font-bold text-xs sm:text-sm">EH</span>
            </div>
            <span className="hidden sm:block font-semibold text-base lg:text-lg">
              Event Horizon
            </span>
          </Link>
          
          <div className="hidden sm:block">
            {getBreadcrumb()}
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
          {/* Notification Bell */}
          <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative focus-visible:outline-2 focus-visible:outline-secondary">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 sm:w-80" align="end">
              <div className="flex items-center justify-between p-3 border-b">
                <h4 className="font-semibold text-sm">Notifications</h4>
                <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-xs h-8 px-2">
                  Mark all read
                </Button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {isLoadingNotifications ? (
                  <div className="p-6 text-center text-muted-foreground">
                    Loading notifications...
                  </div>
                ) : notifications.length > 0 ? (
                  notifications.slice(0, 8).map((notification) => (
                    <div key={notification.id} className={`p-3 border-b hover:bg-muted/50 ${!notification.read ? 'bg-accent/10' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!notification.read && <div className="w-2 h-2 bg-accent rounded-full mt-1" />}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-muted-foreground">
                    No notifications
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full focus-visible:outline-2 focus-visible:outline-secondary">
                <Avatar className="h-8 w-8">
                  {/* <AvatarImage src={user.avatar} alt={user.displayName || user.email} /> */}
                  <AvatarFallback>
                    {(user.displayName || user.email).split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.displayName || user.email}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  <Badge variant="secondary" className="w-fit capitalize">{user.role}</Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Sheet>
                <SheetTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Profile Information</SheetTitle>
                    <SheetDescription>View and edit your profile details</SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    <div className="grid gap-2">
                      <Label>Name</Label>
                      <Input value={user.displayName || user.email} readOnly />
                    </div>
                    <div className="grid gap-2">
                      <Label>Email</Label>
                      <Input value={user.email} readOnly />
                    </div>
                    <div className="grid gap-2">
                      <Label>Role</Label>
                      <Badge variant="secondary" className="w-fit capitalize">{user.role}</Badge>
                    </div>
                    <div className="grid gap-2">
                      <Label>Default Office</Label>
                      <Input value="London" readOnly />
                    </div>
                    <div className="grid gap-2">
                      <Label>Phone</Label>
                      <Input value="+44 20 1234 5678" readOnly />
                    </div>
                    <div className="grid gap-2">
                      <Label>Timezone</Label>
                      <Input value="GMT+0 (London)" readOnly />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
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