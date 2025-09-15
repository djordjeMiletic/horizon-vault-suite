import { useState, useEffect } from 'react';
import { useSession } from '@/state/SessionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Calendar, 
  MessageCircle, 
  Bell, 
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ticketsService } from '@/services/tickets';
import { documentsService } from '@/services/documents';
import { appointmentsService } from '@/services/appointments';
import { notificationsService } from '@/services/notifications';

interface DashboardStats {
  tickets: { total: number; open: number };
  documents: number;
  appointments: { total: number; upcoming: number };
  notifications: number;
}

const Dashboard = () => {
  const { user } = useSession();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    tickets: { total: 0, open: 0 },
    documents: 0,
    appointments: { total: 0, upcoming: 0 },
    notifications: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load stats from various services
      const [ticketsData, documentsData, appointmentsData, notificationsData] = await Promise.all([
        ticketsService.getTickets({ mine: true }).catch(() => ({ items: [] })),
        documentsService.listDocuments({ ownerEmail: user?.email }).catch(() => ({ items: [] })),
        appointmentsService.getAll().catch(() => []),
        notificationsService.getNotifications().catch(() => [])
      ]);

      // Calculate stats
      const tickets = Array.isArray(ticketsData) ? ticketsData : ticketsData.items || [];
      const documents = Array.isArray(documentsData) ? documentsData : documentsData.items || [];
      const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];
      const notifications = Array.isArray(notificationsData) ? notificationsData : [];

      setStats({
        tickets: {
          total: tickets.length,
          open: tickets.filter((t: any) => t.status === 'Open').length
        },
        documents: documents.length,
        appointments: {
          total: appointments.length,
          upcoming: appointments.filter((a: any) => new Date(a.scheduledDate) > new Date()).length
        },
        notifications: notifications.filter((n: any) => !n.isRead).length
      });

      // Create recent activity from latest items
      const activity = [
        ...tickets.slice(0, 3).map((ticket: any) => ({
          type: 'ticket',
          title: ticket.subject,
          time: ticket.createdAt,
          status: ticket.status
        })),
        ...documents.slice(0, 2).map((doc: any) => ({
          type: 'document',
          title: doc.fileName || doc.name,
          time: doc.uploadedAt || doc.createdAt,
          status: 'uploaded'
        }))
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

      setRecentActivity(activity);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'ticket':
        return <MessageCircle className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'appointment':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'pending':
        return 'destructive';
      case 'resolved':
      case 'completed':
      case 'uploaded':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.email}</p>
        </div>
        <Badge variant="outline" className="capitalize">
          {user?.role}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tickets.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.tickets.open} open tickets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.documents}</div>
            <p className="text-xs text-muted-foreground">
              Total documents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.appointments.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.appointments.upcoming} upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.notifications}</div>
            <p className="text-xs text-muted-foreground">
              Unread notifications
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-muted-foreground">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {getActivityIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.time).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full justify-start">
              <Link to="/client/tickets">
                <Plus className="mr-2 h-4 w-4" />
                Create Support Ticket
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full justify-start">
              <Link to="/client/documents">
                <FileText className="mr-2 h-4 w-4" />
                Upload Document
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full justify-start">
              <Link to="/client/appointments">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Appointment
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full justify-start">
              <Link to="/client/profile">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Update Profile
              </Link>
            </Button>

            {stats.notifications > 0 && (
              <Button variant="outline" asChild className="w-full justify-start">
                <Link to="/client/notifications">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  View Notifications ({stats.notifications})
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;