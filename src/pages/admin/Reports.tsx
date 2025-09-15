import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Download, Filter } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { canExportCSV } from '@/lib/commission';
import CustomReports from '../advisor/components/CustomReports';

import commissionsData from '@/mocks/seed/commissions.json';
import productsData from '@/mocks/seed/products.json';

const AdminReports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    period: 'all',
    product: 'all',
    role: 'all',
    advisor: 'all'
  });

  // Get all commissions for admin view
  const getFilteredCommissions = () => {
    let filtered = commissionsData;

    // Apply filters
    if (filters.product !== 'all') {
      filtered = filtered.filter(c => c.productId === filters.product);
    }

    if (filters.advisor !== 'all') {
      filtered = filtered.filter(c => c.advisorId === filters.advisor);
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

  const handleExportCSV = () => {
    if (!canExportCSV(user?.role || '')) {
      toast({
        title: 'Export Not Available',
        description: 'CSV export is not available for your role.',
        variant: 'destructive'
      });
      return;
    }
    
    const csvHeaders = ['Policy Number', 'Product', 'Advisor', 'APE', 'Commission', 'Status', 'Date'];
    const csvData = filteredCommissions.map(c => {
      const product = productsData.find(p => p.id === c.productId);
      return [
        c.policyNumber,
        product?.name || c.productId,
        `Advisor ${c.advisorId}`,
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
    link.download = `admin-commissions-report-${new Date().toISOString().slice(0, 10)}.csv`;
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
            Administrative commission tracking and analysis
          </p>
        </div>
        {canExportCSV(user?.role || '') && (
          <Button onClick={handleExportCSV} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        )}
      </div>

      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reports">Commission Reports</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="reports" className="space-y-6">
          <StandardReports
            filters={filters}
            setFilters={setFilters}
            filteredCommissions={filteredCommissions}
            totalCommissions={totalCommissions}
            totalAPE={totalAPE}
            averageCommission={averageCommission}
            user={user}
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
  totalCommissions, 
  totalAPE, 
  averageCommission, 
  user 
}: any) => (
  <div className="space-y-6">
    {/* Filters */}
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
        <CardDescription>Filter reports by period, product, and advisor</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label>Period</Label>
            <Select
              value={filters.period}
              onValueChange={(value) => setFilters((prev: any) => ({ ...prev, period: value }))}
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
              onValueChange={(value) => setFilters((prev: any) => ({ ...prev, product: value }))}
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
          
          <div>
            <Label>Advisor</Label>
            <Select
              value={filters.advisor}
              onValueChange={(value) => setFilters((prev: any) => ({ ...prev, advisor: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Advisors</SelectItem>
                <SelectItem value="1">John Smith</SelectItem>
                <SelectItem value="2">Sarah Johnson</SelectItem>
                <SelectItem value="3">Mike Davis</SelectItem>
                <SelectItem value="4">Emma Wilson</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Role</Label>
            <Select
              value={filters.role}
              onValueChange={(value) => setFilters((prev: any) => ({ ...prev, role: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="advisor">Advisors</SelectItem>
                <SelectItem value="introducer">Introducers</SelectItem>
                <SelectItem value="manager">Managers</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
        <CardDescription>Detailed breakdown of all commission payments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Policy Number</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Advisor</TableHead>
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
                    <TableCell>Advisor {commission.advisorId}</TableCell>
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
  </div>
);

export default AdminReports;