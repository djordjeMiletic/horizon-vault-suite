import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ResponsiveTableDesktop,
  ResponsiveTableMobile,
  ResponsiveTableCard,
  ResponsiveTableField,
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/responsive-table';
import { productsService as productsAPI } from '@/services/products';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Search } from 'lucide-react';

const AdminProducts = () => {
  const queryClient = useQueryClient();
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: productsAPI.getAll
  });

  const createProductMutation = useMutation({
    mutationFn: productsAPI.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => productsAPI.update(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  });

  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    provider: '',
    type: '',
    commissionRate: '',
    margin: '',
    description: '',
    features: '',
    apeExample: '',
    commissionExample: '',
    bands: ''
  });

  const filteredProducts = products.filter((product: any) =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.provider?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setForm({
      name: '',
      provider: '',
      type: '',
      commissionRate: '',
      margin: '',
      description: '',
      features: '',
      apeExample: '',
      commissionExample: '',
      bands: ''
    });
    setEditingProduct(null);
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setForm({
      name: product.name || '',
      provider: product.provider || '',
      type: product.type || '',
      commissionRate: ((product.commissionRate || 0) * 100).toString(),
      margin: ((product.margin || 0) * 100).toString(),
      description: product.description || '',
      features: product.features?.join(', ') || '',
      apeExample: product.commissionExample?.ape?.toString() || '',
      commissionExample: product.commissionExample?.commission?.toString() || '',
      bands: product.bands?.map((b: any) => `${b.threshold}:${(b.rateAdjustment || 0) * 100}`).join(', ') || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name || !form.provider || !form.type) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const productData = {
      name: form.name,
      provider: form.provider,
      type: form.type,
      commissionRate: parseFloat(form.commissionRate) / 100,
      margin: parseFloat(form.margin) / 100,
      description: form.description,
      features: form.features.split(',').map(f => f.trim()).filter(Boolean),
      commissionExample: {
        ape: parseInt(form.apeExample) || 10000,
        rate: `${form.commissionRate}%`,
        commission: parseInt(form.commissionExample) || 0,
        note: `Plus ${form.margin}% margin applied to pool`
      },
      bands: form.bands
        ? form.bands.split(',').map(band => {
            const [threshold, rate] = band.trim().split(':');
            return {
              threshold: parseInt(threshold),
              rateAdjustment: parseFloat(rate) / 100
            };
          })
        : []
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, updates: productData });
      toast({
        title: "Product updated", 
        description: `${productData.name} has been updated successfully.`,
      });
    } else {
      createProductMutation.mutate(productData);
      toast({
        title: "Product created",
        description: `${productData.name} has been created successfully.`,
      });
    }

    resetForm();
    setIsModalOpen(false);
  };

  const handleToggleActive = (id: string, currentStatus: boolean) => {
    updateProductMutation.mutate({ id, updates: { active: !currentStatus } });
    toast({
      title: currentStatus ? "Product deactivated" : "Product activated",
      description: `Product has been ${currentStatus ? 'deactivated' : 'activated'} successfully.`,
    });
  };

  return (
    <div className="space-y-6 p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    placeholder="e.g. Royal Protect"
                  />
                </div>
                <div>
                  <Label htmlFor="provider">Provider *</Label>
                  <Input
                    id="provider"
                    value={form.provider}
                    onChange={(e) => setForm({...form, provider: e.target.value})}
                    placeholder="e.g. Royal London"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Input
                    id="type"
                    value={form.type}
                    onChange={(e) => setForm({...form, type: e.target.value})}
                    placeholder="e.g. Life Insurance"
                  />
                </div>
                <div>
                  <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                  <Input
                    id="commissionRate"
                    type="number"
                    step="0.1"
                    value={form.commissionRate}
                    onChange={(e) => setForm({...form, commissionRate: e.target.value})}
                    placeholder="2.5"
                  />
                </div>
                <div>
                  <Label htmlFor="margin">Margin (%)</Label>
                  <Input
                    id="margin"
                    type="number"
                    step="0.1"
                    value={form.margin}
                    onChange={(e) => setForm({...form, margin: e.target.value})}
                    placeholder="15"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  placeholder="Product description..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="features">Features (comma-separated)</Label>
                <Textarea
                  id="features"
                  value={form.features}
                  onChange={(e) => setForm({...form, features: e.target.value})}
                  placeholder="Feature 1, Feature 2, Feature 3"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="apeExample">APE Example</Label>
                  <Input
                    id="apeExample"
                    type="number"
                    value={form.apeExample}
                    onChange={(e) => setForm({...form, apeExample: e.target.value})}
                    placeholder="10000"
                  />
                </div>
                <div>
                  <Label htmlFor="commissionExample">Commission Example</Label>
                  <Input
                    id="commissionExample"
                    type="number"
                    value={form.commissionExample}
                    onChange={(e) => setForm({...form, commissionExample: e.target.value})}
                    placeholder="250"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bands">Commission Bands (threshold:rate%, comma-separated)</Label>
                <Input
                  id="bands"
                  value={form.bands}
                  onChange={(e) => setForm({...form, bands: e.target.value})}
                  placeholder="50000:0.5, 100000:1.0, 250000:1.5"
                />
              </div>

              <Button onClick={handleSubmit} className="w-full">
                {editingProduct ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <ResponsiveTableDesktop>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Margin</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 {filteredProducts.map((product: any) => (
                   <TableRow key={product.id}>
                     <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.provider}</TableCell>
                    <TableCell>{product.type}</TableCell>
                    <TableCell>{(product.commissionRate * 100).toFixed(1)}%</TableCell>
                    <TableCell>{(product.margin * 100).toFixed(1)}%</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={product.active !== false}
                          onCheckedChange={() => handleToggleActive(product.id, product.active !== false)}
                        />
                        <Badge variant={product.active !== false ? "default" : "secondary"}>
                          {product.active !== false ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ResponsiveTableDesktop>

          {/* Mobile Cards */}
          <ResponsiveTableMobile>
            {filteredProducts.map((product) => (
               <ResponsiveTableCard key={product.id}>
                 <ResponsiveTableField label="Name">
                   <span className="font-medium">{product.name}</span>
                 </ResponsiveTableField>
                <ResponsiveTableField label="Provider">
                  {product.provider}
                </ResponsiveTableField>
                <ResponsiveTableField label="Type">
                  {product.type}
                </ResponsiveTableField>
                <ResponsiveTableField label="Commission">
                  {(product.commissionRate * 100).toFixed(1)}%
                </ResponsiveTableField>
                <ResponsiveTableField label="Margin">
                  {(product.margin * 100).toFixed(1)}%
                </ResponsiveTableField>
                <ResponsiveTableField label="Status">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={product.active !== false}
                      onCheckedChange={() => handleToggleActive(product.id, product.active !== false)}
                    />
                    <Badge variant={product.active !== false ? "default" : "secondary"}>
                      {product.active !== false ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </ResponsiveTableField>
                <ResponsiveTableField label="Actions">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(product)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </ResponsiveTableField>
              </ResponsiveTableCard>
            ))}
          </ResponsiveTableMobile>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProducts;