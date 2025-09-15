import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import { Download, Filter, Calendar } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { canExportCSV } from '@/lib/commission';
import CustomReports from './components/CustomReports';

import paymentsData from '@/mocks/seed/payments.json';
import productsData from '@/mocks/seed/products.json';

const Reports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    period: 'all',
    product: 'all',
    role: 'all',
    advisor: 'all'
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Get unique advisors for filtering
  const getAdvisors = () => {
    const advisorEmails = [...new Set(paymentsData.map(p => p.advisorEmail))];
    return advisorEmails.map(email => {
      if (email === 'advisor@advisor.com') return { email, name: 'Sarah Johnson' };
      if (email === 'advisor2@advisor.com') return { email, name: 'Michael Carter' };
      return { email, name: email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase()) };
    });
  };

  const advisors = getAdvisors();

  // Calculate commission from payment data
  const calculateCommission = (payment: any) => {
    // Simple commission calculation - 3% of APE
    return payment.ape * 0.03;
  };

  // Filter payments based on current user and filters
  const getFilteredPayments = () => {
    let filtered = paymentsData;

    // Role-based data scoping
    if (user?.role === 'advisor') {
      // Advisors ONLY see their own data - no exceptions
      filtered = filtered.filter(p => p.advisorEmail === user?.email);
    } else if (user?.role === 'referral') {
      // Referral partners see all payments (read-only)
      // In production, this would be scoped to their referrals only
    } else if (user?.role === 'manager') {
      // Managers see all advisors by default, can filter with advisor selection
      // No initial filtering - they see everything unless advisor filter is applied
    }

    // Apply advisor filter (only relevant for managers)
    if (user?.role === 'manager' && filters.advisor !== 'all') {
      if (Array.isArray(filters.advisor)) {
        // Multi-select support
        filtered = filtered.filter(p => filters.advisor.includes(p.advisorEmail));
      } else {
        // Single select fallback
        filtered = filtered.filter(p => p.advisorEmail === filters.advisor);
      }
    }

    // Apply product filter
    if (filters.product !== 'all') {
      filtered = filtered.filter(p => p.productId === filters.product);
    }

    // Period filtering
    if (filters.period === 'current-month') {
      const currentMonth = new Date().toISOString().slice(0, 7);
      filtered = filtered.filter(p => p.date.slice(0, 7) === currentMonth);
    } else if (filters.period === 'last-month') {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const lastMonthStr = lastMonth.toISOString().slice(0, 7);
      filtered = filtered.filter(p => p.date.slice(0, 7) === lastMonthStr);
    } else if (filters.period === 'ytd') {
      const currentYear = new Date().getFullYear().toString();
      filtered = filtered.filter(p => p.date.startsWith(currentYear));
    }

    return filtered;
  };

  const filteredPayments = getFilteredPayments();
  
  // Transform payments to commissions format for display
  const filteredCommissions = filteredPayments.map(payment => ({
    ...payment,
    commissionAmount: calculateCommission(payment),
    policyNumber: `${payment.productId.toUpperCase()}-${payment.id}`,
    paymentDate: payment.date,
    actualReceipts: payment.receipts
  }));

  // Pagination logic
  const totalPages = Math.ceil(filteredCommissions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCommissions = filteredCommissions.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // Calculate totals
  const totalCommissions = filteredCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);
  const totalAPE = filteredCommissions.reduce((sum, c) => sum + c.ape, 0);
  const averageCommission = filteredCommissions.length > 0 ? totalCommissions / filteredCommissions.length : 0;

  const getBandingBreakdown = () => {
    const breakdown: Record<string, { count: number; totalCommission: number; bonusRate: number }> = {};
    
    filteredCommissions.forEach(commission => {
      const product = productsData.find(p => p.id === commission.productId);
      if (product?.bands) {
        product.bands.forEach(band => {
          if (commission.ape >= band.threshold) {
            const key = `£${band.threshold.toLocaleString()}+ threshold`;
            if (!breakdown[key]) {
              breakdown[key] = {
                count: 0,
                totalCommission: 0,
                bonusRate: band.rateAdjustment
              };
            }
            breakdown[key].count++;
            breakdown[key].totalCommission += commission.commissionAmount;
          }
        });
      }
    });

    return Object.entries(breakdown).map(([threshold, data]) => ({
      threshold,
      ...data
    }));
  };

  const bandingBreakdown = getBandingBreakdown();

  const handleExportCSV = () => {
    if (!canExportCSV(user?.role || '')) {
      toast({
        title: 'Export Not Available',
        description: 'CSV export is not available for your role.',
        variant: 'destructive'
      });
      return;
    }
    
    const csvHeaders = ['Policy Number', 'Product', 'APE', 'Commission', 'Status', 'Date'];
    const csvData = filteredCommissions.map(c => {
      const product = productsData.find(p => p.id === c.productId);
      return [
        c.policyNumber,
        product?.name || c.productId,
        c.ape,
        c.commissionAmount,
        c.status,
        c.paymentDate
      ];
    });

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `commissions-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export Successful',
      description: 'Commission report has been exported to CSV.'
    });
  };

  return (
    <div className="space-y-4 lg:space-y-6 p-1 sm:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Commission Reports</h1>
          <p className="text-sm lg:text-base text-muted-foreground">
            {user?.role === 'advisor' && 'Your commission tracking and analysis'}
            {user?.role === 'manager' && 'Team commission tracking and analysis'}  
            {user?.role === 'referral' && 'View commission reports (read-only)'}
            {user?.role === 'admin' && 'Detailed commission tracking and analysis'}
          </p>
        </div>
        {/* Show export button only for roles that can export, and hide for referral partners */}
        {canExportCSV(user?.role || '') && user?.role !== 'referral' && (
          <Button onClick={handleExportCSV} className="flex items-center gap-2 w-full sm:w-auto">
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
        )}
      </div>

      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reports">Commission Reports</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="reports" className="space-y-4 lg:space-y-6">
          <StandardReports
            filters={filters}
            setFilters={handleFilterChange}
            filteredCommissions={filteredCommissions}
            paginatedCommissions={paginatedCommissions}
            totalCommissions={totalCommissions}
            totalAPE={totalAPE}
            averageCommission={averageCommission}
            bandingBreakdown={bandingBreakdown}
            advisors={advisors}
            user={user}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
          />
        </TabsContent>
        
        <TabsContent value="custom">
          <CustomReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const StandardReports = ({ 
  filters, 
  setFilters, 
  filteredCommissions,
  paginatedCommissions,
  totalCommissions, 
  totalAPE, 
  averageCommission, 
  bandingBreakdown, 
  advisors,
  user,
  currentPage,
  setCurrentPage,
  totalPages,
  itemsPerPage
}: any) => {
  
  const getSelectedAdvisorNames = () => {
    if (user?.role === 'advisor') {
      const currentAdvisor = advisors.find((a: any) => a.email === user.email);
      return currentAdvisor ? currentAdvisor.name : user.name || 'Unknown Advisor';
    }
    
    if (filters.advisor === 'all') return 'All Advisors';
    if (Array.isArray(filters.advisor)) {
      return filters.advisor.map((email: string) => 
        advisors.find((a: any) => a.email === email)?.name || email
      ).join(', ');
    }
    const advisor = advisors.find((a: any) => a.email === filters.advisor);
    return advisor ? advisor.name : 'Selected Advisor';
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Filters */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription className="text-sm">
            Filter reports by period, product, and role
            {user?.role !== 'advisor' && (
              <span className="block mt-1 text-sm font-medium">
                Viewing: {getSelectedAdvisorNames()}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm">Period</Label>
              <Select
                value={filters.period}
                onValueChange={(value) => setFilters((prev: any) => ({ ...prev, period: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="current-month">Current Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="ytd">Year to Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm">Product</Label>
              <Select
                value={filters.product}
                onValueChange={(value) => setFilters((prev: any) => ({ ...prev, product: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {productsData.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Advisor Filter - ONLY shown for managers */}
            {user?.role === 'manager' && (
              <div>
                <Label className="text-sm">Advisor</Label>
                <Select
                  value={filters.advisor || 'all'}
                  onValueChange={(value) => setFilters((prev: any) => ({ ...prev, advisor: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Advisors</SelectItem>
                    {advisors.map(advisor => (
                      <SelectItem key={advisor.email} value={advisor.email}>
                        {advisor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {user?.role === 'manager' && (
              <div>
                <Label className="text-sm">Role Filter</Label>
                <Select
                  value={filters.role}
                  onValueChange={(value) => setFilters((prev: any) => ({ ...prev, role: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="advisor">Advisors</SelectItem>
                    <SelectItem value="introducer">Introducers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <Card className="bg-gradient-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Commissions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl lg:text-2xl font-bold">£{totalCommissions.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From {filteredCommissions.length} policies
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total APE
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl lg:text-2xl font-bold">£{totalAPE.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Annual Premium Equivalent
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Commission
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl lg:text-2xl font-bold">£{averageCommission.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Per policy
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Commission Table */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-lg">Commission Details</span>
              <p className="text-sm font-normal text-muted-foreground mt-1">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredCommissions.length)} of {filteredCommissions.length} results
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Policy Number</TableHead>
                  <TableHead className="min-w-[100px]">Product</TableHead>
                  <TableHead className="min-w-[80px]">APE</TableHead>
                  <TableHead className="min-w-[90px]">Receipts</TableHead>
                  <TableHead className="min-w-[100px]">Commission</TableHead>
                  <TableHead className="min-w-[80px]">Status</TableHead>
                  <TableHead className="min-w-[80px]">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCommissions.map((commission) => {
                  const product = productsData.find(p => p.id === commission.productId);
                  return (
                    <TableRow key={commission.id}>
                      <TableCell className="font-medium">
                        {commission.policyNumber}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate" title={product?.name || commission.productId}>
                        {product?.name || commission.productId}
                      </TableCell>
                      <TableCell>£{commission.ape.toLocaleString()}</TableCell>
                      <TableCell>£{commission.actualReceipts.toLocaleString()}</TableCell>
                      <TableCell className="font-medium">
                        £{commission.commissionAmount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={commission.status === 'Paid' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {commission.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(commission.paymentDate).toLocaleDateString('en-GB', { 
                          day: '2-digit', 
                          month: '2-digit',
                          year: '2-digit'
                        })}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {filteredCommissions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No commission data found for the selected filters.
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <Pagination>
                <PaginationContent className="flex-wrap">
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(pageNum);
                          }}
                          isActive={currentPage === pageNum}
                          className="min-w-[40px]"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                      }}
                      className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Banding Breakdown */}
      {bandingBreakdown.length > 0 && (
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Performance Banding Breakdown</CardTitle>
            <CardDescription>Commission bonuses based on performance thresholds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bandingBreakdown.map((band, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/30 rounded-lg gap-2">
                  <div>
                    <p className="font-medium">{band.threshold}</p>
                    <p className="text-sm text-muted-foreground">
                      {band.count} policies • +{(band.bonusRate * 100).toFixed(1)}% bonus rate
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="font-medium">£{band.totalCommission.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Total commission</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Reports;