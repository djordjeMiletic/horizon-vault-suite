import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter } from '@/components/ui/modal';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, TrendingDown, PoundSterling, Users, Bell, Calendar, ChevronRight, Plus, FileUp, Ticket, CreditCard } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useState } from 'react';
import { usePaymentStore, useTicketStore, useDocumentStore, useNotificationStore } from '@/lib/stores';

// Import mock data
import commissionsData from '@/mocks/seed/commissions.json';
import goalsData from '@/mocks/seed/goals.json';
import notificationsData from '@/mocks/seed/notifications.json';

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { addPayment } = usePaymentStore();
  const { addTicket } = useTicketStore();
  const { addDocument } = useDocumentStore();
  const { addNotification } = useNotificationStore();

  // Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);

  // Form states
  const [paymentForm, setPaymentForm] = useState({
    policyNumber: '',
    amount: '',
    type: 'APE' as 'APE' | 'Receipts',
    product: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [ticketForm, setTicketForm] = useState({
    subject: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    description: ''
  });

  const handleAddPayment = () => {
    if (!paymentForm.policyNumber || !paymentForm.amount || !paymentForm.product) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    addPayment({
      policyNumber: paymentForm.policyNumber,
      amount: parseFloat(paymentForm.amount),
      type: paymentForm.type,
      product: paymentForm.product,
      date: paymentForm.date,
      status: 'pending'
    });

    addNotification({
      userId: user?.id || '',
      type: 'payment',
      title: 'Payment Added',
      message: `Payment of £${paymentForm.amount} for policy ${paymentForm.policyNumber} has been added.`,
      read: false,
      priority: 'normal'
    });

    setPaymentForm({ policyNumber: '', amount: '', type: 'APE', product: '', date: new Date().toISOString().split('T')[0] });
    setShowPaymentModal(false);
    toast({ title: "Success", description: "Payment added (demo)" });
  };

  const handleRequestApproval = () => {
    // Mock approval request
    addNotification({
      userId: user?.id || '',
      type: 'approval',
      title: 'Approval Requested',
      message: 'Approval has been requested for pending payments.',
      read: false,
      priority: 'high'
    });

    setShowApprovalModal(false);
    toast({ title: "Success", description: "Approval requested (demo)" });
  };

  const handleUploadDocument = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      addDocument({
        name: file.name,
        type: file.type,
        size: file.size
      });

      addNotification({
        userId: user?.id || '',
        type: 'document',
        title: 'Document Uploaded',
        message: `Document "${file.name}" has been uploaded successfully.`,
        read: false,
        priority: 'normal'
      });

      toast({ title: "Success", description: "Document uploaded (demo)" });
    }
    setShowDocumentModal(false);
  };

  const handleCreateTicket = () => {
    if (!ticketForm.subject) {
      toast({ title: "Error", description: "Please enter a subject", variant: "destructive" });
      return;
    }

    addTicket({
      subject: ticketForm.subject,
      priority: ticketForm.priority,
      description: ticketForm.description
    });

    addNotification({
      userId: user?.id || '',
      type: 'ticket',
      title: 'Support Ticket Created',
      message: `Ticket "${ticketForm.subject}" has been created.`,
      read: false,
      priority: 'normal'
    });

    setTicketForm({ subject: '', priority: 'medium', description: '' });
    setShowTicketModal(false);
    toast({ title: "Success", description: "Ticket created (demo)" });
  };

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
            <Button 
              variant="secondary" 
              className="h-20 flex-col focus-visible:outline-2 focus-visible:outline-secondary" 
              onClick={() => setShowPaymentModal(true)}
            >
              <CreditCard className="h-6 w-6 mb-2" />
              <span className="text-sm">Add Payment</span>
            </Button>
            <Button 
              variant="secondary" 
              className="h-20 flex-col focus-visible:outline-2 focus-visible:outline-secondary" 
              onClick={() => setShowApprovalModal(true)}
            >
              <Users className="h-6 w-6 mb-2" />
              <span className="text-sm">Request Approval</span>
            </Button>
            <Button 
              variant="secondary" 
              className="h-20 flex-col focus-visible:outline-2 focus-visible:outline-secondary" 
              onClick={() => setShowDocumentModal(true)}
            >
              <FileUp className="h-6 w-6 mb-2" />
              <span className="text-sm">Upload Document</span>
            </Button>
            <Button 
              variant="secondary" 
              className="h-20 flex-col focus-visible:outline-2 focus-visible:outline-secondary" 
              onClick={() => setShowTicketModal(true)}
            >
              <Ticket className="h-6 w-6 mb-2" />
              <span className="text-sm">Create Ticket</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Payment Modal */}
      <Modal open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <ModalHeader>
          <ModalTitle>Add Payment</ModalTitle>
          <ModalDescription>Create a new commission payment record</ModalDescription>
        </ModalHeader>
        <ModalContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="policyNumber">Policy Number *</Label>
              <Input
                id="policyNumber"
                value={paymentForm.policyNumber}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, policyNumber: e.target.value }))}
                placeholder="e.g., RP-2024-001"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="product">Product *</Label>
              <Input
                id="product"
                value={paymentForm.product}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, product: e.target.value }))}
                placeholder="e.g., Life Insurance Premium"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select value={paymentForm.type} onValueChange={(value: 'APE' | 'Receipts') => setPaymentForm(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APE">APE</SelectItem>
                    <SelectItem value="Receipts">Receipts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={paymentForm.date}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
          <Button onClick={handleAddPayment}>Add Payment</Button>
        </ModalFooter>
      </Modal>

      {/* Request Approval Modal */}
      <Modal open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <ModalHeader>
          <ModalTitle>Request Approval</ModalTitle>
          <ModalDescription>Request approval for pending payments</ModalDescription>
        </ModalHeader>
        <ModalContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Batch/Cycle</Label>
              <Select defaultValue="current">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Month</SelectItem>
                  <SelectItem value="previous">Previous Month</SelectItem>
                  <SelectItem value="quarter">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              This will mark pending payments for approval review.
            </p>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowApprovalModal(false)}>Cancel</Button>
          <Button onClick={handleRequestApproval}>Request Approval</Button>
        </ModalFooter>
      </Modal>

      {/* Upload Document Modal */}
      <Modal open={showDocumentModal} onOpenChange={setShowDocumentModal}>
        <ModalHeader>
          <ModalTitle>Upload Client Document</ModalTitle>
          <ModalDescription>Upload a document for client records</ModalDescription>
        </ModalHeader>
        <ModalContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="file">Select File</Label>
              <Input
                id="file"
                type="file"
                onChange={handleUploadDocument}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Supported formats: PDF, Word documents, Images (JPG, PNG)
            </p>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowDocumentModal(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>

      {/* Create Ticket Modal */}
      <Modal open={showTicketModal} onOpenChange={setShowTicketModal}>
        <ModalHeader>
          <ModalTitle>Create Support Ticket</ModalTitle>
          <ModalDescription>Submit a support request</ModalDescription>
        </ModalHeader>
        <ModalContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={ticketForm.subject}
                onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Brief description of the issue"
              />
            </div>
            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select value={ticketForm.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setTicketForm(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={ticketForm.description}
                onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Additional details (optional)"
              />
            </div>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowTicketModal(false)}>Cancel</Button>
          <Button onClick={handleCreateTicket}>Create Ticket</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default Dashboard;