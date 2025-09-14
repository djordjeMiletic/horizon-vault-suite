import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, PoundSterling, Users, Bell, Calendar, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/auth';

// Import mock data
import commissionsData from '@/mocks/seed/commissions.json';
import goalsData from '@/mocks/seed/goals.json';
import notificationsData from '@/mocks/seed/notifications.json';

const Dashboard = () => {
  const { user } = useAuth();

  // Calculate KPIs from mock data
  const totalYTD = commissionsData
    .filter(c => c.advisorId === user?.id)
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthStr = lastMonth.toISOString().slice(0, 7);

  const currentMonthCommissions = commissionsData
    .filter(c => c.advisorId === user?.id && c.month === currentMonth)
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  const lastMonthCommissions = commissionsData
    .filter(c => c.advisorId === user?.id && c.month === lastMonthStr)
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  const momChange = lastMonthCommissions > 0 
    ? ((currentMonthCommissions - lastMonthCommissions) / lastMonthCommissions) * 100 
    : 0;

  const paymentsLast30Days = commissionsData
    .filter(c => c.advisorId === user?.id && c.status === 'Paid')
    .length;

  const avgPayment = paymentsLast30Days > 0 ? totalYTD / paymentsLast30Days : 0;

  // Recent payments (last 5)
  const recentPayments = commissionsData
    .filter(c => c.advisorId === user?.id)
    .slice(0, 5);

  // User notifications
  const userNotifications = notificationsData
    .filter(n => n.userId === user?.id)
    .slice(0, 5);

  // Current goals
  const currentGoal = goalsData.find(g => 
    g.advisorId === user?.id && g.month === currentMonth
  );

  const kpiCards = [
    {
      title: 'Total YTD Commission',
      value: `£${totalYTD.toFixed(2)}`,
      description: 'Year to date earnings',
      icon: PoundSterling,
      trend: null,
      color: 'text-primary'
    },
    {
      title: 'Month-on-Month',
      value: `${momChange >= 0 ? '+' : ''}${momChange.toFixed(1)}%`,
      description: 'vs. previous month',
      icon: momChange >= 0 ? TrendingUp : TrendingDown,
      trend: momChange >= 0 ? 'up' : 'down',
      color: momChange >= 0 ? 'text-emerald-500' : 'text-red-500'
    },
    {
      title: 'Payments (30d)',
      value: paymentsLast30Days.toString(),
      description: 'Commission payments',
      icon: Users,
      trend: null,
      color: 'text-blue-500'
    },
    {
      title: 'Avg per Payment',
      value: `£${avgPayment.toFixed(2)}`,
      description: 'Average commission',
      icon: TrendingUp,
      trend: null,
      color: 'text-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}</p>
        </div>
        <Badge variant="outline" className="capitalize">
          {user?.role}
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <Card key={index} className="bg-gradient-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">{kpi.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Goals Progress */}
      {currentGoal && (
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Monthly Goal Progress
              <Badge variant={currentGoal.progress >= 1 ? 'default' : 'secondary'}>
                {(currentGoal.progress * 100).toFixed(0)}%
              </Badge>
            </CardTitle>
            <CardDescription>
              £{currentGoal.achieved.toLocaleString()} of £{currentGoal.target.toLocaleString()} target
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress 
              value={Math.min(currentGoal.progress * 100, 100)} 
              className="mb-2"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Target: £{currentGoal.target.toLocaleString()}</span>
              <span>Achieved: £{currentGoal.achieved.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle>Recent Commission Payments</CardTitle>
            <CardDescription>Your latest commission payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{payment.policyNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">£{payment.commissionAmount.toFixed(2)}</p>
                    <Badge 
                      variant={payment.status === 'Paid' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {recentPayments.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No recent payments found
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Recent updates and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-3 rounded-lg ${notification.read ? 'bg-muted/30' : 'bg-primary/10'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-primary rounded-full mt-1" />
                    )}
                  </div>
                </div>
              ))}
              {userNotifications.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No notifications
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col" asChild>
              <div>
                <Calendar className="h-6 w-6 mb-2" />
                <span className="text-sm">Schedule Meeting</span>
              </div>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <div>
                <Users className="h-6 w-6 mb-2" />
                <span className="text-sm">New Client</span>
              </div>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <div>
                <TrendingUp className="h-6 w-6 mb-2" />
                <span className="text-sm">View Reports</span>
              </div>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <div>
                <Bell className="h-6 w-6 mb-2" />
                <span className="text-sm">Notifications</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;