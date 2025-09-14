import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { useAuth } from '@/lib/auth';

import commissionsData from '@/mocks/seed/commissions.json';
import productsData from '@/mocks/seed/products.json';

const Analytics = () => {
  const { user } = useAuth();
  const [chartType, setChartType] = useState('monthly');

  // Filter commissions for current user
  const userCommissions = commissionsData.filter(c => c.advisorId === user?.id);

  // Monthly commissions data
  const getMonthlyData = () => {
    const monthlyData: Record<string, number> = {};
    
    userCommissions.forEach(commission => {
      const month = commission.month;
      if (!monthlyData[month]) {
        monthlyData[month] = 0;
      }
      monthlyData[month] += commission.commissionAmount;
    });

    return Object.entries(monthlyData)
      .map(([month, amount]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        amount: Number(amount.toFixed(2))
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  };

  // Product mix data
  const getProductMixData = () => {
    const productData: Record<string, number> = {};
    
    userCommissions.forEach(commission => {
      const product = productsData.find(p => p.id === commission.productId);
      const productName = product?.name || commission.productId;
      
      if (!productData[productName]) {
        productData[productName] = 0;
      }
      productData[productName] += commission.commissionAmount;
    });

    return Object.entries(productData).map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2))
    }));
  };

  const monthlyData = getMonthlyData();
  const productMixData = getProductMixData();

  // Colors for charts
  const COLORS = ['#C6A15B', '#8B1E3F', '#1A2A3A', '#F3E9D2', '#0B1B2B'];

  // Calculate summary statistics
  const totalCommissions = userCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);
  const averageMonthly = monthlyData.length > 0 
    ? monthlyData.reduce((sum, d) => sum + d.amount, 0) / monthlyData.length 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Performance insights and trends</p>
        </div>
        <Select value={chartType} onValueChange={setChartType}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly View</SelectItem>
            <SelectItem value="quarterly">Quarterly View</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Commissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{totalCommissions.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{averageMonthly.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Commissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#C6A15B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Product Mix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productMixData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {productMixData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;