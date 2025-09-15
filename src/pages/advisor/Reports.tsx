import { useState, useEffect } from 'react';
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
import { useSession } from '@/state/SessionContext';
import { getCommissionDetails } from '@/services/payments';
import type { CommissionDetailsRowDto, Paginated } from '@/types/api';
import CustomReports from './components/CustomReports';

const Reports = () => {
  const { user } = useSession();
  const { toast } = useToast();
  const [commissionData, setCommissionData] = useState<Paginated<CommissionDetailsRowDto>>({
    items: [],
    page: 1,
    pageSize: 12,
    totalCount: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    period: 'all',
    advisor: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const itemsPerPage = 12;

  // Load commission details
  useEffect(() => {
    const loadCommissionDetails = async () => {
      setIsLoading(true);
      try {
        const params: any = {
          page: currentPage,
          pageSize: itemsPerPage
        };

        // Apply advisor filter based on role
        if (user?.role === 'Advisor') {
          params.advisorEmail = user.email;
        } else if (user?.role === 'Manager' && filters.advisor !== 'all') {
          params.advisorEmail = filters.advisor;
        }

        const data = await getCommissionDetails(params);
        setCommissionData(data);
      } catch (error) {
        console.error('Failed to load commission details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load commission details',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCommissionDetails();
  }, [currentPage, filters, user, toast]);

  const toggleRowExpansion = (paymentId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(paymentId)) {
      newExpanded.delete(paymentId);
    } else {
      newExpanded.add(paymentId);
    }
    setExpandedRows(newExpanded);
  };

  const totalPages = Math.ceil(commissionData.totalCount / itemsPerPage);

  const handleExport = async () => {
    try {
      const params: any = {};
      
      if (user?.role === 'Advisor') {
        params.advisorEmail = user.email;
      } else if (user?.role === 'Manager' && filters.advisor !== 'all') {
        params.advisorEmail = filters.advisor;
      }

      const exportData = await getCommissionDetails({ ...params, page: 1, pageSize: 10000 });
      
      const headers = [
        'Date', 'Provider', 'Product', 'Method Used', 'Product Rate %', 'Margin %', 
        'Commission Base', 'Pool Amount', 'Advisor Share', 'Introducer Share', 
        'Manager Share', 'Exec Share', 'Advisor Email'
      ];
      
      const csvContent = [
        headers.join(','),
        ...exportData.items.map(row => [
          row.date,
          `"${row.provider}"`,
          `"${row.product}"`,
          row.methodUsed,
          row.productRatePct,
          row.marginPct,
          row.commissionBase.toFixed(2),
          row.poolAmount.toFixed(2),
          row.advisorShare.toFixed(2),
          row.introducerShare.toFixed(2),
          row.managerShare.toFixed(2),
          row.execShare.toFixed(2),
          row.advisorEmail
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `commission-details-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Complete',
        description: `Exported ${exportData.items.length} commission records`
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export Failed', 
        description: 'Failed to export commission details',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Commission reports and analytics for your business
        </p>
      </div>

      <Tabs defaultValue="commission" className="space-y-4">
        <TabsList>
          <TabsTrigger value="commission">Commission Details</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="commission" className="space-y-4">
          <Card>
            <div className="flex items-center justify-between p-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Commission Details</h3>
                <p className="text-sm text-muted-foreground">
                  Showing {((commissionData.page - 1) * commissionData.pageSize) + 1} to {Math.min(commissionData.page * commissionData.pageSize, commissionData.totalCount)} of {commissionData.totalCount} records
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Pool Amount</TableHead>
                    <TableHead className="text-right">Advisor Share</TableHead>
                    {user?.role === 'Manager' && <TableHead>Advisor</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={user?.role === 'Manager' ? 8 : 7} className="text-center py-8">
                        Loading commission details...
                      </TableCell>
                    </TableRow>
                  ) : commissionData.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={user?.role === 'Manager' ? 8 : 7} className="text-center py-8">
                        No commission data found
                      </TableCell>
                    </TableRow>
                  ) : (
                    commissionData.items.map((row) => (
                      <>
                        <TableRow 
                          key={row.id} 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleRowExpansion(row.id)}
                        >
                          <TableCell>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              {expandedRows.has(row.id) ? 
                                <ChevronDown className="h-4 w-4" /> : 
                                <ChevronRight className="h-4 w-4" />
                              }
                            </Button>
                          </TableCell>
                          <TableCell className="font-medium">
                            {new Date(row.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{row.provider}</TableCell>
                          <TableCell>{row.product}</TableCell>
                          <TableCell>
                            <Badge variant={row.methodUsed === 'APE' ? 'default' : 'secondary'}>
                              {row.methodUsed}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            £{row.poolAmount.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            £{row.advisorShare.toFixed(2)}
                          </TableCell>
                          {user?.role === 'Manager' && (
                            <TableCell>{row.advisorEmail}</TableCell>
                          )}
                        </TableRow>
                        
                        {expandedRows.has(row.id) && (
                          <TableRow>
                            <TableCell colSpan={user?.role === 'Manager' ? 8 : 7}>
                              <div className="bg-muted/30 p-4 rounded-lg">
                                <h4 className="font-semibold mb-3">Commission Breakdown</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Product Rate:</span>
                                    <div className="font-medium">{row.productRatePct}%</div>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Margin:</span>
                                    <div className="font-medium">{row.marginPct}%</div>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Commission Base:</span>
                                    <div className="font-medium">£{row.commissionBase.toFixed(2)}</div>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Pool Amount:</span>
                                    <div className="font-medium">£{row.poolAmount.toFixed(2)}</div>
                                  </div>
                                </div>
                                
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Role</TableHead>
                                      <TableHead className="text-right">Amount</TableHead>
                                      <TableHead className="text-right">Percentage</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    <TableRow>
                                      <TableCell>Advisor</TableCell>
                                      <TableCell className="text-right">£{row.advisorShare.toFixed(2)}</TableCell>
                                      <TableCell className="text-right">{((row.advisorShare / row.poolAmount) * 100).toFixed(1)}%</TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell>Introducer</TableCell>
                                      <TableCell className="text-right">£{row.introducerShare.toFixed(2)}</TableCell>
                                      <TableCell className="text-right">{((row.introducerShare / row.poolAmount) * 100).toFixed(1)}%</TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell>Manager</TableCell>
                                      <TableCell className="text-right">£{row.managerShare.toFixed(2)}</TableCell>
                                      <TableCell className="text-right">{((row.managerShare / row.poolAmount) * 100).toFixed(1)}%</TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell>Exec Sales Manager</TableCell>
                                      <TableCell className="text-right">£{row.execShare.toFixed(2)}</TableCell>
                                      <TableCell className="text-right">{((row.execShare / row.poolAmount) * 100).toFixed(1)}%</TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-muted-foreground whitespace-nowrap">
                  Page {commissionData.page} of {totalPages}
                </div>
                <Pagination>
                  <PaginationContent>
                    {commissionData.page > 1 && (
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(commissionData.page - 1)}
                          className="cursor-pointer"
                        />
                      </PaginationItem>
                    )}
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => setCurrentPage(pageNum)}
                            isActive={pageNum === commissionData.page}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    {totalPages > 5 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}

                    {commissionData.page < totalPages && (
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(commissionData.page + 1)}
                          className="cursor-pointer"
                        />
                      </PaginationItem>
                    )}
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="custom">
          <CustomReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;