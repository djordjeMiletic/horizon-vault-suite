import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Download, Filter, Calendar } from 'lucide-react';
import { useAuth } from '@/lib/auth';

import commissionsData from '@/mocks/seed/commissions.json';
import productsData from '@/mocks/seed/products.json';

const Reports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    period: 'all',
    product: 'all',
    role: 'all'
  });

  // Filter commissions based on current user and filters
  const getFilteredCommissions = () => {
    let filtered = commissionsData;

    // Role-based filtering
    if (user?.role === 'referral') {
      // Referral partners see all commissions (read-only)
      // In a real app, this would be restricted to their referrals only
    } else {
      // Advisors and managers see their own commissions
      filtered = filtered.filter(c => c.advisorId === user?.id);
    }

    // Apply additional filters
    if (filters.product !== 'all') {
      filtered = filtered.filter(c => c.productId === filters.product);
    }

    // Period filtering (simplified for demo)
    if (filters.period === 'current-month') {
      const currentMonth = new Date().toISOString().slice(0, 7);
      filtered = filtered.filter(c => c.month === currentMonth);
    } else if (filters.period === 'last-month') {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const lastMonthStr = lastMonth.toISOString().slice(0, 7);
      filtered = filtered.filter(c => c.month === lastMonthStr);
    }

    return filtered;
  };

  const filteredCommissions = getFilteredCommissions();

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Commission Reports</h1>
          <p className="text-muted-foreground">
            {user?.role === 'referral' ? 'View commission reports (read-only)' : 'Detailed commission tracking and analysis'}
          </p>
        </div>
        <Button onClick={handleExportCSV} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>Filter reports by period, product, and role</CardDescription>
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
                  {productsData.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {user?.role === 'manager' && (
              <div>
                <Label>Role Filter</Label>
                <Select
                  value={filters.role}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Commissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{totalCommissions.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From {filteredCommissions.length} policies
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total APE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{totalAPE.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Annual Premium Equivalent
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Commission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{averageCommission.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Per policy
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Commission Table */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle>Commission Details</CardTitle>
          <CardDescription>Detailed breakdown of commission payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Policy Number</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>APE</TableHead>
                  <TableHead>Receipts</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCommissions.map((commission) => {
                  const product = productsData.find(p => p.id === commission.productId);
                  return (
                    <TableRow key={commission.id}>
                      <TableCell className="font-medium">
                        {commission.policyNumber}
                      </TableCell>
                      <TableCell>{product?.name || commission.productId}</TableCell>
                      <TableCell>£{commission.ape.toLocaleString()}</TableCell>
                      <TableCell>£{commission.actualReceipts.toLocaleString()}</TableCell>
                      <TableCell className="font-medium">
                        £{commission.commissionAmount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={commission.status === 'Paid' ? 'default' : 'secondary'}
                        >
                          {commission.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(commission.paymentDate).toLocaleDateString()}
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
        </CardContent>
      </Card>

      {/* Banding Breakdown */}
      {bandingBreakdown.length > 0 && (
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle>Performance Banding Breakdown</CardTitle>
            <CardDescription>Commission bonuses based on performance thresholds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bandingBreakdown.map((band, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">{band.threshold}</p>
                    <p className="text-sm text-muted-foreground">
                      {band.count} policies • +{(band.bonusRate * 100).toFixed(1)}% bonus rate
                    </p>
                  </div>
                  <div className="text-right">
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