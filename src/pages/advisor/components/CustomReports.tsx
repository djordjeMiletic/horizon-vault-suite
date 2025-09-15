import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Download, Save, FileText, Settings, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { canExportCSV, computeCommission } from '@/lib/commission';
import { useReportTemplateStore } from '@/lib/reportTemplates';

import commissionsData from '@/mocks/seed/commissions.json';
import productsData from '@/mocks/seed/products.json';
import policiesData from '@/mocks/seed/policies.json';

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

  const [selectedFields, setSelectedFields] = useState<string[]>(['date', 'product', 'ape', 'commissionBase', 'status']);
  const [filters, setFilters] = useState({
    dateRange: { from: '', to: '' },
    products: [] as string[],
    providers: [] as string[],
    roles: [] as string[],
    status: [] as string[],
    advisors: [] as string[]
  });
  const [generatedData, setGeneratedData] = useState<any[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');

  const buildReportData = () => {
    try {
      let data = commissionsData.map(commission => {
        const product = productsData.find(p => p.id === commission.productId);
        const policy = policiesData.find(p => p.productId === commission.productId);
        
        let calculatedData = {};
        if (policy && product) {
          try {
            const payment = {
              id: commission.id || '',
              productId: commission.productId || '',
              provider: product?.provider || '',
              date: commission.paymentDate || '',
              ape: commission.ape || 0,
              receipts: commission.actualReceipts || 0,
              status: commission.status as any || 'Pending',
              advisorId: commission.advisorId || '',
              policyNumber: commission.policyNumber || '',
              clientId: commission.clientId || ''
            };
            
            const result = computeCommission(payment, policy);
            calculatedData = {
              methodUsed: result.methodUsed,
              commissionBase: result.commissionBase,
              commissionPool: result.poolAmount,
              productRatePct: policy.productRatePct || 0,
              marginPct: policy.marginPct || 0,
              ...result.split
            };
          } catch (error) {
            console.error('Error calculating commission for:', commission.id, error);
            calculatedData = {
              methodUsed: 'N/A',
              commissionBase: 0,
              commissionPool: 0,
              productRatePct: 0,
              marginPct: 0
            };
          }
        }

        return {
          id: commission.id || '',
          date: commission.paymentDate || '',
          product: product?.name || commission.productId || 'Unknown Product',
          provider: product?.provider || 'Unknown',
          policyId: commission.policyNumber || 'N/A',
          client: `Client ${commission.clientId || 'Unknown'}`,
          advisor: `Advisor ${commission.advisorId || 'Unknown'}`,
          role: 'Advisor', // Default role display
          ape: commission.ape || 0,
          receipts: commission.actualReceipts || 0,
          status: commission.status || 'Pending',
          ...calculatedData
        };
      });

      // Apply filters with safety checks
      if (filters.dateRange.from) {
        data = data.filter(item => item.date && item.date >= filters.dateRange.from);
      }
      if (filters.dateRange.to) {
        data = data.filter(item => item.date && item.date <= filters.dateRange.to);
      }
      if (filters.products.length > 0) {
        data = data.filter(item => item.product && filters.products.includes(item.product));
      }
      if (filters.status.length > 0 && !filters.status.includes('all')) {
        data = data.filter(item => item.status && filters.status.includes(item.status));
      }

      return data;
    } catch (error) {
      console.error('Error building report data:', error);
      toast({
        title: 'Error Generating Report',
        description: 'There was an error processing the report data. Please try again.',
        variant: 'destructive'
      });
      return [];
    }
  };

  const handleGenerate = () => {
    if (selectedFields.length === 0) {
      toast({
        title: 'No Fields Selected',
        description: 'Please select at least one field to generate the report.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const data = buildReportData();
      setGeneratedData(data);
      
      toast({
        title: 'Report Generated',
        description: `Generated ${data.length} rows with ${selectedFields.length} columns.`
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Generation Failed',
        description: 'Unable to generate report. Please check your selections and try again.',
        variant: 'destructive'
      });
    }
  };

  const handleExportCSV = () => {
    const userRole = user?.role || 'guest';
    if (!canExportCSV(userRole)) {
      toast({
        title: 'Export Not Available',
        description: 'CSV export is not available for your role.',
        variant: 'destructive'
      });
      return;
    }

    if (generatedData.length === 0) {
      toast({
        title: 'No Data to Export',
        description: 'Please generate a report first.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const headers = selectedFields.map(field => 
        AVAILABLE_FIELDS.find(f => f.id === field)?.label || field
      );

      const csvData = generatedData.map(row => 
        selectedFields.map(field => {
          const value = row[field];
          if (value === null || value === undefined) {
            return '';
          }
          if (typeof value === 'number') {
            const fieldInfo = AVAILABLE_FIELDS.find(f => f.id === field);
            if (fieldInfo?.type === 'currency') {
              return `£${value.toFixed(2)}`;
            } else if (fieldInfo?.type === 'percentage') {
              return `${value.toFixed(2)}%`;
            }
          }
          return String(value).replace(/,/g, ';'); // Replace commas to avoid CSV issues
        })
      );

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `custom-report-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful',
        description: 'Custom report has been exported to CSV.'
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast({
        title: 'Export Failed',
        description: 'Unable to export CSV. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast({
        title: 'Template Name Required',
        description: 'Please enter a name for your template.',
        variant: 'destructive'
      });
      return;
    }

    addTemplate({
      name: templateName,
      selectedFields,
      filters,
      createdBy: user?.email || 'Unknown'
    });

    toast({
      title: 'Template Saved',
      description: `Template "${templateName}" has been saved.`
    });

    setTemplateName('');
    setShowSaveDialog(false);
  };

  const handleLoadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedFields(template.selectedFields);
      setFilters({
        dateRange: template.filters.dateRange || { from: '', to: '' },
        products: template.filters.products || [],
        providers: template.filters.providers || [],
        roles: template.filters.roles || [],
        status: template.filters.status || [],
        advisors: template.filters.advisors || []
      });
      toast({
        title: 'Template Loaded',
        description: `Template "${template.name}" has been loaded.`
      });
    }
  };

  const formatCellValue = (value: any, fieldId: string) => {
    const field = AVAILABLE_FIELDS.find(f => f.id === fieldId);
    if (typeof value === 'number' && field) {
      if (field.type === 'currency') {
        return `£${value.toFixed(2)}`;
      } else if (field.type === 'percentage') {
        return `${value.toFixed(2)}%`;
      }
    }
    return value;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Custom Reports Builder</h2>
          <p className="text-muted-foreground">Create custom commission reports with selected fields and filters</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
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
                  <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveTemplate}>
                    Save Template
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          {canExportCSV(user?.role || '') && (
            <Button onClick={handleExportCSV} disabled={generatedData.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Field Selector */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Select Fields
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {AVAILABLE_FIELDS.map(field => (
                <div key={field.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={field.id}
                    checked={selectedFields.includes(field.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedFields(prev => [...prev, field.id]);
                      } else {
                        setSelectedFields(prev => prev.filter(f => f !== field.id));
                      }
                    }}
                  />
                  <Label htmlFor={field.id} className="text-sm font-normal">
                    {field.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters and Results */}
        <div className="lg:col-span-3 space-y-6">
          {/* Templates */}
          {templates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Saved Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {templates.map(template => (
                    <div key={template.id} className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLoadTemplate(template.id)}
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        {template.name}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeTemplate(template.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>From Date</Label>
                  <Input
                    type="date"
                    value={filters.dateRange.from}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, from: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label>To Date</Label>
                  <Input
                    type="date"
                    value={filters.dateRange.to}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, to: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={filters.status.length > 0 ? filters.status[0] : 'all'}
                    onValueChange={(value) => setFilters(prev => ({
                      ...prev,
                      status: value === 'all' ? [] : [value]
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Processing">Processing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4">
                <Button onClick={handleGenerate} className="w-full">
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Table */}
          {generatedData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Report Results ({generatedData.length} rows)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto max-h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {selectedFields.map(fieldId => {
                          const field = AVAILABLE_FIELDS.find(f => f.id === fieldId);
                          return (
                            <TableHead key={fieldId}>{field?.label || fieldId}</TableHead>
                          );
                        })}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {generatedData.slice(0, 50).map((row, index) => (
                        <TableRow key={index}>
                          {selectedFields.map(fieldId => (
                            <TableCell key={fieldId}>
                              {formatCellValue(row[fieldId], fieldId)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {generatedData.length > 50 && (
                    <div className="text-center text-sm text-muted-foreground mt-2">
                      Showing first 50 rows. Export CSV to see all {generatedData.length} rows.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomReports;