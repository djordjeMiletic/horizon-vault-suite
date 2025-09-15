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
import { paymentsService as paymentsAPI } from '@/services/payments';
import { goalsService as goalsAPI } from '@/services/goals';
import { notificationsService as notificationsAPI } from '@/services/notifications';
import { useQuery } from '@tanstack/react-query';
import { computeCommission } from '@/lib/commission';
import AddPaymentModal from '@/components/AddPaymentModal';
import { rollupMonthly, getCurrentMonth } from '@/lib/timeSeries';

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { addPayment } = usePaymentStore();
  const { addTicket } = useTicketStore();
  const { addDocument } = useDocumentStore();
  const { addNotification } = useNotificationStore();
  
  const isManager = user?.role === 'manager';
  
  // Use API services
  const { data: payments = [] } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const result = await paymentsAPI.getAll();
      return Array.isArray(result) ? result : result.items || [];
    }
  });
  
  const { data: advisorGoals } = useQuery({
    queryKey: ['advisorGoals', user?.email],
    queryFn: () => goalsAPI.getAdvisorGoals(user?.email || ''),
    enabled: !!user?.email && !isManager
  });
  
  const { data: managerGoals } = useQuery({
    queryKey: ['managerGoals'],
    queryFn: goalsAPI.getManagerGoals,
    enabled: isManager
  });
  
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => notificationsAPI.getByRecipient(user?.email || ''),
    enabled: !!user?.email
  });

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

// Simple commission calculator for dashboard KPIs
const calculateCommission = (ape: number, receipts: number, productId: string = 'PRD-01') => {
  // Use default policy for calculation
  const defaultPolicy = {
    productRatePct: 3.5,
    marginPct: 20,
    thresholdMultiplier: 2.5,
    split: {
      Advisor: 0.7,
      Introducer: 0.1,
      Manager: 0.15,
      ExecSalesManager: 0.05
    }
  };
  
  const threshold = ape * defaultPolicy.thresholdMultiplier;
  const methodUsed = receipts <= threshold ? 'APE' : 'Receipts';
  const commissionBase = methodUsed === 'APE' 
    ? ape * (defaultPolicy.productRatePct / 100)
    : receipts * (defaultPolicy.productRatePct / 100);
  const poolAmount = commissionBase * (1 - defaultPolicy.marginPct / 100);
  
  return {
    methodUsed,
    commissionBase,
    poolAmount,
    split: {
      Advisor: poolAmount * defaultPolicy.split.Advisor,
      Introducer: poolAmount * defaultPolicy.split.Introducer,
      Manager: poolAmount * defaultPolicy.split.Manager,
      ExecSalesManager: poolAmount * defaultPolicy.split.ExecSalesManager
    }
  };
};

  // Calculate KPIs based on role
  const getKPIData = () => {
    if (isManager) {
      // Manager sees aggregated data from all advisors
      const relevantPayments = (payments as any[]) || [];
      const commissionData = relevantPayments.map(p => {
        const result = calculateCommission(p.ape || 0, p.receipts || 0, p.productId || 'PRD-01');
        return {
          commission: result.split.Advisor,
          date: p.date,
          advisorEmail: p.advisorEmail || ''
        };
      });
      
      const currentMonth = getCurrentMonth();
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const lastMonthStr = lastMonth.toISOString().slice(0, 7);
      
      const totalYTD = commissionData
        .filter(c => c.date.startsWith('2025'))
        .reduce((sum, c) => sum + c.commission, 0);
        
      const currentMonthCommissions = commissionData
        .filter(c => c.date.slice(0, 7) === currentMonth)
        .reduce((sum, c) => sum + c.commission, 0);
        
      const lastMonthCommissions = commissionData
        .filter(c => c.date.slice(0, 7) === lastMonthStr)
        .reduce((sum, c) => sum + c.commission, 0);
        
      const momChange = lastMonthCommissions > 0 
        ? ((currentMonthCommissions - lastMonthCommissions) / lastMonthCommissions) * 100 
        : 0;
        
      const paymentsLast30Days = relevantPayments
        .filter(p => p.status === 'Approved')
        .length;
        
      const avgPayment = paymentsLast30Days > 0 ? totalYTD / paymentsLast30Days : 0;
      
      // Recent payments (last 5) - format for display
      const recentPayments = (relevantPayments || [])
        .filter((p: any) => p.status === 'Approved')
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
        .map((p: any) => {
          const result = calculateCommission(p.ape, p.receipts, p.productId);
          return {
            id: p.id,
            policyNumber: p.id,
            paymentDate: p.date,
            commissionAmount: result.split.Advisor,
            product: p.productId,
            status: p.status
          };
        });
        
      // Manager goals
      const currentGoal = managerGoals ? {
        advisorId: user?.id,
        month: currentMonth,
        target: (managerGoals as any)?.monthlyTarget || 0,
        achieved: (managerGoals as any)?.history?.find((h: any) => h.month === currentMonth)?.achieved || 0,
        progress: ((managerGoals as any)?.monthlyTarget || 0) > 0 
          ? ((managerGoals as any)?.history?.find((h: any) => h.month === currentMonth)?.achieved || 0) / ((managerGoals as any)?.monthlyTarget || 0)
          : 0,
        type: 'Team Monthly Target'
      } : null;
      
      return { totalYTD, momChange, paymentsLast30Days, avgPayment, recentPayments, currentGoal };
    } else {
      // Advisor sees only their own data
      const advisorPayments = (payments as any[]).filter((p: any) => p.advisorEmail === user?.email);
      const commissionData = advisorPayments.map((p: any) => {
        const result = calculateCommission(p.ape || 0, p.receipts || 0, p.productId || 'PRD-01');
        return {
          commission: result.split.Advisor,
          date: p.date
        };
      });
      
      const currentMonth = getCurrentMonth();
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const lastMonthStr = lastMonth.toISOString().slice(0, 7);
      
      const totalYTD = commissionData
        .filter(c => c.date.startsWith('2025'))
        .reduce((sum, c) => sum + c.commission, 0);
        
      const currentMonthCommissions = commissionData
        .filter(c => c.date.slice(0, 7) === currentMonth)
        .reduce((sum, c) => sum + c.commission, 0);
        
      const lastMonthCommissions = commissionData
        .filter(c => c.date.slice(0, 7) === lastMonthStr)
        .reduce((sum, c) => sum + c.commission, 0);
        
      const momChange = lastMonthCommissions > 0 
        ? ((currentMonthCommissions - lastMonthCommissions) / lastMonthCommissions) * 100 
        : 0;
        
      const paymentsLast30Days = advisorPayments
        .filter(p => p.status === 'Approved')
        .length;
        
      const avgPayment = paymentsLast30Days > 0 ? totalYTD / paymentsLast30Days : 0;
      
      // Recent payments (last 5) - format for display
      const recentPayments = advisorPayments
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
        .map(p => {
          const result = calculateCommission(p.ape, p.receipts, p.productId);
          return {
            id: p.id,
            policyNumber: p.id,
            paymentDate: p.date,
            commissionAmount: result.split.Advisor,
            product: p.productId,
            status: p.status
          };
        });
        
      // Advisor goals
      const currentGoal = advisorGoals ? {
        advisorId: user?.id,
        month: currentMonth,
        target: (advisorGoals as any)?.monthlyTarget || 0,
        achieved: (advisorGoals as any)?.history?.find((h: any) => h.month === currentMonth)?.achieved || 0,
        progress: ((advisorGoals as any)?.monthlyTarget || 0) > 0 
          ? ((advisorGoals as any)?.history?.find((h: any) => h.month === currentMonth)?.achieved || 0) / ((advisorGoals as any)?.monthlyTarget || 0)
          : 0,
        type: 'Monthly APE'
      } : null;
      
      return { totalYTD, momChange, paymentsLast30Days, avgPayment, recentPayments, currentGoal };
    }
  };

  const { totalYTD, momChange, paymentsLast30Days, avgPayment, recentPayments, currentGoal } = getKPIData();

  // User notifications - format for display
  const userNotifications = ((notifications as any[]) || [])
    .slice(0, 5)
    .map((n: any) => ({
      ...n,
      message: n.title,
      timestamp: n.createdAt
    }));

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
      <AddPaymentModal 
        open={showPaymentModal} 
        onOpenChange={setShowPaymentModal}
        onPaymentAdded={() => {
          // Refresh data or trigger analytics update
          toast({ title: "Success", description: "Payment added successfully" });
        }}
      />

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