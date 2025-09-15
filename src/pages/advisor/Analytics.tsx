import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { rollupMonthly, getDateRange, formatMonthForDisplay } from '@/lib/timeSeries';

import commissionsData from '@/mocks/seed/commissions.json';
import productsData from '@/mocks/seed/products.json';
import paymentsData from '@/mocks/seed/payments.json';

const Analytics = () => {
  const { user } = useAuth();
  const [chartType, setChartType] = useState('last6Months');
  const [dateRange, setDateRange] = useState('last6Months');

  // Get user payments and calculate with rolling data
  const userPayments = paymentsData.filter(p => p.advisorEmail === user?.email);

  // Get date range based on selection  
  const { from, to } = getDateRange(dateRange as any);

  // Monthly commissions data using new utility
  const getMonthlyData = () => {
    const rollups = rollupMonthly(userPayments, { from, to });
    return rollups.map(rollup => ({
      month: formatMonthForDisplay(rollup.month),
      amount: Number(rollup.totalCommission.toFixed(2))
    }));
  };

  // YTD data calculation
  const getYTDData = () => {
    const monthlyData = getMonthlyData();
    let cumulative = 0;
    
    return monthlyData.map(item => {
      cumulative += item.amount;
      return {
        ...item,
        amount: cumulative
      };
    });
  };

  // Product mix data using filtered payments
  const getProductMixData = () => {
    const productData: Record<string, number> = {};
    const filteredPayments = userPayments.filter(payment => {
      const paymentMonth = payment.date.slice(0, 7);
      return paymentMonth >= from && paymentMonth <= to;
    });
    
    const totalAmount = filteredPayments.reduce((sum, p) => {
      // Simple commission calculation
      return sum + (p.ape * 0.03); // 3% commission rate
    }, 0);
    
    filteredPayments.forEach(payment => {
      const product = productsData.find(p => p.id === payment.productId);
      const productName = product?.name || payment.productId;
      
      if (!productData[productName]) {
        productData[productName] = 0;
      }
      productData[productName] += payment.ape * 0.03; // Commission calculation
    });

    return Object.entries(productData).map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2)),
      percentage: totalAmount > 0 ? ((value / totalAmount) * 100).toFixed(1) : '0.0'
    }));
  };

  const monthlyData = getMonthlyData();
  const ytdData = getYTDData();
  const productMixData = getProductMixData();
  const chartData = chartType === 'monthly' ? monthlyData : ytdData;

  // Colors for charts - using new palette
  const COLORS = ['#0A3D62', '#60A3D9', '#D4AF37', '#F4F6F8', '#0A3D62CC'];

  // Calculate summary statistics
  const totalCommissions = chartData.reduce((sum, d) => sum + d.amount, 0);
  const averageMonthly = chartData.length > 0 
    ? (chartType === 'monthly' ? chartData.reduce((sum, d) => sum + d.amount, 0) / chartData.length : totalCommissions)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Performance insights and trends</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="last3Months">Last 3 Months</SelectItem>
              <SelectItem value="last6Months">Last 6 Months</SelectItem>
              <SelectItem value="ytd">YTD</SelectItem>
            </SelectContent>
          </Select>
          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="ytd">YTD</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
              {chartType === 'monthly' ? 'Monthly Average' : 'YTD Total'}
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
              <TrendingUp className="h-5 w-5" />
              {chartType === 'monthly' ? 'Monthly Commissions' : 'YTD Commissions'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60A3D9" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#60A3D9" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#0A3D62"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#0A3D62"
                    fontSize={12}
                    tickFormatter={(value) => `£${value.toLocaleString()}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`£${value.toLocaleString()}`, 'Commission']}
                    labelStyle={{ color: '#0A3D62' }}
                    contentStyle={{ 
                      backgroundColor: '#F4F6F8', 
                      border: '1px solid #60A3D9',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#60A3D9" 
                    strokeWidth={2}
                    fill="url(#colorAmount)" 
                    dot={{ fill: '#60A3D9', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#60A3D9', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Product Mix
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-64 overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productMixData}
                    cx="50%"
                    cy="50%"
                    innerRadius="55%"
                    outerRadius="80%"
                    fill="#8884d8"
                    dataKey="value"
                    label={({ percentage }) => parseFloat(percentage) > 5 ? `${percentage}%` : ''}
                    labelLine={false}
                  >
                    {productMixData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`£${value.toLocaleString()}`, 'Commission']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 px-2">
              {productMixData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-muted-foreground truncate">
                    {entry.name} ({entry.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;