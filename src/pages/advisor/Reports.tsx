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
import { Download, Filter, Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { canExportCSV, computeCommission, getProductName, type Policy } from '@/lib/commission';
import { usePaymentDataStore } from '@/lib/stores';
import CustomReports from './components/CustomReports';

import policiesData from '@/mocks/seed/policies.json';
import productsData from '@/mocks/seed/products.json';

const Reports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { payments: paymentsData } = usePaymentDataStore();
  const [filters, setFilters] = useState({
    period: 'all',
    product: 'all',
    role: 'all',
    advisor: 'all'
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
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

  // Calculate commission breakdown using centralized utility
  const calculateCommissionBreakdown = (payment: any) => {
    const policy = (policiesData as Policy[]).find(p => p.productId === payment.productId);
    if (!policy) {
      return {
        methodUsed: 'N/A' as const,
        productRatePct: 0,
        marginPct: 0,
        commissionBase: 0,
        poolAmount: 0,
        split: { Advisor: 0, Introducer: 0, Manager: 0, ExecSalesManager: 0 }
      };
    }
    
    return computeCommission(payment, policy);
  };

  // Filter payments based on current user and filters
  const getFilteredPayments = () => {
    let filtered = paymentsData;

    // Role-based data scoping
    if (user?.role === 'advisor') {
      filtered = filtered.filter(p => p.advisorEmail === user?.email);
    } else if (user?.role === 'manager' && filters.advisor !== 'all') {
      filtered = filtered.filter(p => p.advisorEmail === filters.advisor);
    }

    // Apply filters
    if (filters.product !== 'all') {
      filtered = filtered.filter(p => p.productId === filters.product);
    }

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
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPagePayments = filteredPayments.slice(startIndex, endIndex);

  const toggleRowExpansion = (paymentId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(paymentId)) {
      newExpanded.delete(paymentId);
    } else {
      newExpanded.add(paymentId);
    }
    setExpandedRows(newExpanded);
  };

  const handleExportCSV = () => {
    if (!canExportCSV(user?.role || '')) {
      toast({ 
        title: "Access Denied", 
        description: "You don't have permission to export data.", 
        variant: "destructive" 
      });
      return;
    }

    // Export the filtered dataset with commission breakdown
    const csvData = filteredPayments.map(payment => {
      const commission = calculateCommissionBreakdown(payment);
      const advisor = advisors.find(a => a.email === payment.advisorEmail);
      
      return {
        'Date': payment.date,
        'Advisor': advisor?.name || payment.advisorEmail,
        'Product': getProductName(payment.productId),
        'Provider': payment.provider,
        'APE': payment.ape,
        'Receipts': payment.receipts,
        'Method Used': commission.methodUsed,
        'Product Rate %': commission.productRatePct,
        'Margin %': commission.marginPct,
        'Commission Base': commission.commissionBase.toFixed(2),
        'Pool Amount': commission.poolAmount.toFixed(2),
        'Advisor Share': commission.split.Advisor.toFixed(2),
        'Introducer Share': commission.split.Introducer.toFixed(2),
        'Manager Share': commission.split.Manager.toFixed(2),
        'Exec Sales Manager Share': commission.split.ExecSalesManager.toFixed(2),
        'Status': payment.status
      };
    });

    // Convert to CSV
    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `commission-details-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ 
      title: "Export Complete", 
      description: `Exported ${csvData.length} commission records.` 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Commission reports and analytics</p>
        </div>
        {canExportCSV(user?.role || '') && (
          <Button onClick={handleExportCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        )}
      </div>

      <Tabs defaultValue="commission-details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="commission-details">Commission Details</TabsTrigger>
          <TabsTrigger value="custom-reports">Custom Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="commission-details" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Period</Label>
                  <Select
                    value={filters.period}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, period: value }))}
                  >
                    <SelectTrigger>
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
                  <Label>Product</Label>
                  <Select
                    value={filters.product}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, product: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Products</SelectItem>
                      {(policiesData as Policy[]).map((policy) => (
                        <SelectItem key={policy.productId} value={policy.productId}>
                          {getProductName(policy.productId)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {user?.role === 'manager' && (
                  <div>
                    <Label>Advisor</Label>
                    <Select
                      value={filters.advisor}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, advisor: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Advisors</SelectItem>
                        {advisors.map((advisor) => (
                          <SelectItem key={advisor.email} value={advisor.email}>
                            {advisor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Commission Table */}
          <Card>
            <CardHeader>
              <CardTitle>Commission Details</CardTitle>
              <CardDescription>
                Showing {startIndex + 1}-{Math.min(endIndex, filteredPayments.length)} of {filteredPayments.length} results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead></TableHead>
                      <TableHead>Date</TableHead>
                      {user?.role === 'manager' && <TableHead>Advisor</TableHead>}
                      <TableHead>Product</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead className="text-right">APE</TableHead>
                      <TableHead className="text-right">Receipts</TableHead>
                      <TableHead>Method Used</TableHead>
                      <TableHead className="text-right">Product Rate</TableHead>
                      <TableHead className="text-right">Pool Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentPagePayments.map((payment) => {
                      const advisor = advisors.find(a => a.email === payment.advisorEmail);
                      const commission = calculateCommissionBreakdown(payment);
                      const isExpanded = expandedRows.has(payment.id);
                      
                      return (
                        <>
                          <TableRow key={payment.id}>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleRowExpansion(payment.id)}
                                className="p-0 h-8 w-8"
                              >
                                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              </Button>
                            </TableCell>
                            <TableCell>
                              {new Date(payment.date).toLocaleDateString()}
                            </TableCell>
                            {user?.role === 'manager' && (
                              <TableCell>{advisor?.name || payment.advisorEmail}</TableCell>
                            )}
                            <TableCell>{getProductName(payment.productId)}</TableCell>
                            <TableCell>{payment.provider}</TableCell>
                            <TableCell className="text-right">£{payment.ape.toLocaleString()}</TableCell>
                            <TableCell className="text-right">£{payment.receipts.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge variant={commission.methodUsed === 'APE' ? 'default' : 'secondary'}>
                                {commission.methodUsed}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">{commission.productRatePct}%</TableCell>
                            <TableCell className="text-right font-medium">£{commission.poolAmount.toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  payment.status === 'Approved' ? 'default' : 
                                  payment.status === 'Pending' ? 'secondary' : 'destructive'
                                }
                              >
                                {payment.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                          {isExpanded && (
                            <TableRow>
                              <TableCell colSpan={user?.role === 'manager' ? 11 : 10}>
                                <div className="p-4 bg-muted/30 rounded-lg">
                                  <h4 className="font-medium mb-3">Commission Split Breakdown</h4>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">Advisor:</span>
                                      <div className="font-medium">£{commission.split.Advisor.toFixed(2)}</div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Introducer:</span>
                                      <div className="font-medium">£{commission.split.Introducer.toFixed(2)}</div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Manager:</span>
                                      <div className="font-medium">£{commission.split.Manager.toFixed(2)}</div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Exec Sales Manager:</span>
                                      <div className="font-medium">£{commission.split.ExecSalesManager.toFixed(2)}</div>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      );
                    })}
                  </TableBody>
                </Table>

                {filteredPayments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No commission data found for the selected filters.
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground whitespace-nowrap">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Pagination>
                    <PaginationContent>
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
                        const pageNumber = i + 1;
                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(pageNumber);
                              }}
                              isActive={currentPage === pageNumber}
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
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
        </TabsContent>

        <TabsContent value="custom-reports">
          <CustomReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;