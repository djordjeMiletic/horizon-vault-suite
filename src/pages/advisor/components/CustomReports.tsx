import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Download, Save, FileText, Settings, Trash2, Search } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { canExportCSV, computeCommission } from '@/lib/commission';
import { useReportTemplateStore } from '@/lib/reportTemplates';
import { exportToCsv } from '@/lib/utils';
import { getDateRange } from '@/lib/timeSeries';
import { getCommissionDetails } from '@/services/payments';
import { getProducts } from '@/services/products';
import { getPolicies } from '@/services/policies';

const AVAILABLE_FIELDS = [
  { id: 'date', label: 'Date', type: 'date' },
  { id: 'product', label: 'Product', type: 'text' },
  { id: 'provider', label: 'Provider', type: 'text' },
  { id: 'policyId', label: 'Policy ID', type: 'text' },
  { id: 'client', label: 'Client', type: 'text' },
  { id: 'advisor', label: 'Advisor', type: 'text' },
  { id: 'role', label: 'Role', type: 'text' },
  { id: 'ape', label: 'APE', type: 'currency' },
  { id: 'receipts', label: 'Receipts', type: 'currency' },
  { id: 'methodUsed', label: 'Method Used', type: 'text' },
  { id: 'productRatePct', label: 'Product Rate %', type: 'percentage' },
  { id: 'marginPct', label: 'Margin %', type: 'percentage' },
  { id: 'commissionBase', label: 'Commission Base', type: 'currency' },
  { id: 'commissionPool', label: 'Commission Pool', type: 'currency' },
  { id: 'roleShareName', label: 'Role Share Name', type: 'text' },
  { id: 'roleSharePct', label: 'Role Share %', type: 'percentage' },
  { id: 'roleShareAmount', label: 'Role Share Amount', type: 'currency' },
  { id: 'status', label: 'Status', type: 'text' }
];

const CustomReports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { templates, addTemplate, removeTemplate } = useReportTemplateStore();

  // API Data State
  const [commissionsData, setCommissionsData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [policiesData, setPoliciesData] = useState([]);
  const [paymentsData, setPaymentsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [selectedFields, setSelectedFields] = useState<string[]>(
    AVAILABLE_FIELDS.slice(0, 8).map(f => f.id)
  );
  const [dateRange, setDateRange] = useState(() => getDateRange('ytd'));
  const [productFilter, setProductFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [commissions, products, policies] = await Promise.all([
          getCommissionDetails({}),
          getProducts(),
          getPolicies(),
        ]);
        setCommissionsData(commissions.items);
        setProductsData(products);
        setPoliciesData(policies);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch report data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Calculate filtered commissions based on filters
  const filteredCommissions = commissionsData.filter((commission: any) => {
    const commissionDate = new Date(commission.date);
    const inDateRange = commissionDate >= new Date(dateRange.from) && 
                        commissionDate <= new Date(dateRange.to);
    
    const matchesProduct = productFilter === 'all' || commission.productId === productFilter;
    
    const matchesSearch = !searchTerm || 
      Object.values(commission).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
      
    return inDateRange && matchesProduct && matchesSearch;
  });

  // Transform commission data for display
  const transformedData = filteredCommissions.map((commission: any) => {
    const product = productsData.find((p: any) => p.id === commission.productId);
    const policy = policiesData.find((p: any) => p.id === commission.policyId);
    
    return {
      date: commission.date,
      product: product?.productName || commission.productId,
      provider: commission.provider,
      policyId: commission.policyNumber || commission.id,
      client: commission.clientName || 'N/A',
      advisor: `Advisor ${commission.advisorEmail}`,
      role: 'Advisor',
      ape: commission.ape || 0,
      receipts: commission.receipts || 0,
      methodUsed: commission.methodUsed,
      productRatePct: commission.productRatePct,
      marginPct: commission.marginPct,
      commissionBase: commission.commissionBase,
      commissionPool: commission.poolAmount,
      roleShareName: 'Advisor Share',
      roleSharePct: 100,
      roleShareAmount: commission.advisorShare,
      status: commission.status || 'Pending'
    };
  });

  const handleFieldToggle = (fieldId: string, checked: boolean) => {
    if (checked) {
      setSelectedFields(prev => [...prev, fieldId]);
    } else {
      setSelectedFields(prev => prev.filter(id => id !== fieldId));
    }
  };

  const handleExportCSV = () => {
    if (!canExportCSV(user)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to export data",
        variant: "destructive",
      });
      return;
    }

    const headers = AVAILABLE_FIELDS
      .filter(field => selectedFields.includes(field.id))
      .map(field => field.label);
      
    const csvData = transformedData.map(row => 
      selectedFields.map(fieldId => {
        const field = AVAILABLE_FIELDS.find(f => f.id === fieldId);
        const value = row[fieldId as keyof typeof row];
        
        if (field?.type === 'currency' && typeof value === 'number') {
          return `£${value.toLocaleString()}`;
        }
        if (field?.type === 'percentage' && typeof value === 'number') {
          return `${(value * 100).toFixed(2)}%`;
        }
        return String(value || '');
      })
    );

    const csvContent = [
      headers,
      ...csvData
    ].map(row => 
      Array.isArray(row) ? row.join(',') : String(row)
    ).join('\n');
    
    toast({
      title: "Export Complete",
      description: "Report exported successfully",
    });
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a template name",
        variant: "destructive",
      });
      return;
    }

    addTemplate({
      name: templateName,
      selectedFields,
      filters: {
        dateRange,
        products: [],
        status: []
      },
      createdBy: user?.email || 'unknown'
    });

    toast({
      title: "Template Saved",
      description: `Template "${templateName}" saved successfully`,
    });

    setTemplateName('');
    setIsTemplateDialogOpen(false);
  };

  const handleLoadTemplate = (template: any) => {
    setSelectedFields(template.fields);
    if (template.filters) {
      setDateRange(template.filters.dateRange || dateRange);
      setProductFilter(template.filters.productFilter || 'all');
      setStatusFilter(template.filters.statusFilter || 'all');
    }
    
    toast({
      title: "Template Loaded",
      description: `Template "${template.name}" loaded successfully`,
    });
  };

  const handleDeleteTemplate = (templateId: string) => {
    removeTemplate(templateId);
    toast({
      title: "Template Deleted",
      description: "Template deleted successfully",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Custom Report Builder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Templates Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Report Templates</h3>
                <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Save Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Save Report Template</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="templateName">Template Name</Label>
                        <Input
                          id="templateName"
                          value={templateName}
                          onChange={(e) => setTemplateName(e.target.value)}
                          placeholder="Enter template name"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveTemplate}>
                          Save Template
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              {templates.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {templates.map((template) => (
                    <Card key={template.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{template.name}</span>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleLoadTemplate(template)}
                          >
                            Load
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Filters */}
            <div>
              <h3 className="text-lg font-medium mb-4">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="fromDate">From Date</Label>
                  <Input
                    id="fromDate"
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="toDate">To Date</Label>
                  <Input
                    id="toDate"
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="productFilter">Product</Label>
                  <Select value={productFilter} onValueChange={setProductFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Products</SelectItem>
                      {productsData.map((product: any) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.productName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search records..."
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Field Selection */}
            <div>
              <h3 className="text-lg font-medium mb-4">Select Fields</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {AVAILABLE_FIELDS.map((field) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={field.id}
                      checked={selectedFields.includes(field.id)}
                      onCheckedChange={(checked) => 
                        handleFieldToggle(field.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={field.id} className="text-sm">
                      {field.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button onClick={handleExportCSV} disabled={selectedFields.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV ({transformedData.length} records)
              </Button>
            </div>

            {/* Preview Table */}
            <div>
              <h3 className="text-lg font-medium mb-4">
                Preview ({transformedData.length} records)
              </h3>
              {transformedData.length > 0 ? (
                <div className="border rounded-lg overflow-auto max-h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {AVAILABLE_FIELDS
                          .filter(field => selectedFields.includes(field.id))
                          .map(field => (
                            <TableHead key={field.id}>{field.label}</TableHead>
                          ))
                        }
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transformedData.slice(0, 10).map((row, index) => (
                        <TableRow key={index}>
                          {selectedFields.map(fieldId => {
                            const field = AVAILABLE_FIELDS.find(f => f.id === fieldId);
                            const value = row[fieldId as keyof typeof row];
                            
                            return (
                              <TableCell key={fieldId}>
                                {field?.type === 'currency' && typeof value === 'number' 
                                  ? `£${value.toLocaleString()}`
                                  : field?.type === 'percentage' && typeof value === 'number'
                                  ? `${(value * 100).toFixed(2)}%`
                                  : String(value || '')
                                }
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {transformedData.length > 10 && (
                    <div className="p-4 text-center text-muted-foreground">
                      Showing first 10 of {transformedData.length} records
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No data matches the current filters
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomReports;