import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { useSession } from '@/state/SessionContext';
import { getSeries, getProductMix } from '@/services/analytics';
import type { SeriesPoint, ProductMixItem } from '@/types/api';

const Analytics = () => {
  const { user } = useSession();
  const [dateRange, setDateRange] = useState<'last3' | 'last6' | 'ytd'>('last3');
  const [selectedAdvisor, setSelectedAdvisor] = useState('all');
  const [seriesData, setSeriesData] = useState<SeriesPoint[]>([]);
  const [productMixData, setProductMixData] = useState<ProductMixItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const advisors = [
    { email: 'sarah.johnson@event-horizon.test', name: 'Sarah Johnson' },
    { email: 'michael.carter@event-horizon.test', name: 'Michael Carter' }
  ];

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      try {
        let advisorEmail: string | undefined;
        
        if (user?.role === 'Advisor') {
          advisorEmail = user.email;
        } else if (user?.role === 'Manager' && selectedAdvisor !== 'all') {
          advisorEmail = selectedAdvisor;
        }

        const [series, productMix] = await Promise.all([
          getSeries(dateRange, advisorEmail),
          getProductMix(dateRange, advisorEmail)
        ]);

        setSeriesData(series);
        setProductMixData(productMix);
      } catch (error) {
        console.error('Failed to load analytics:', error);
        // Set fallback data on error
        setSeriesData([]);
        setProductMixData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [dateRange, selectedAdvisor, user]);

  // Calculate summary statistics
  const totalCommissions = seriesData.reduce((sum, d) => sum + d.value, 0);
  const averageMonthly = seriesData.length > 0 
    ? totalCommissions / seriesData.length 
    : 0;
  const growth = seriesData.length >= 2 
    ? ((seriesData[seriesData.length - 1].value - seriesData[0].value) / seriesData[0].value) * 100 
    : 0;

  // Colors for charts
  const COLORS = ['#0A3D62', '#60A3D9', '#D4AF37', '#F4F6F8', '#0A3D62CC'];

  // Format product mix data for pie chart
  const pieChartData = productMixData.map((item, index) => ({
    name: item.product,
    value: item.amount,
    fill: COLORS[index % COLORS.length]
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Performance insights and commission analytics
          </p>
        </div>
        
        <div className="flex gap-2">
          {user?.role === 'Manager' && (
            <Select value={selectedAdvisor} onValueChange={setSelectedAdvisor}>
              <SelectTrigger className="w-[180px]">
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
          )}
          
          <Select value={dateRange} onValueChange={(value: 'last3' | 'last6' | 'ytd') => setDateRange(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last3">Last 3 Months</SelectItem>
              <SelectItem value="last6">Last 6 Months</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : `£${totalCommissions.toLocaleString()}`}
            </div>
            <p className="text-xs text-muted-foreground">
              {dateRange === 'last3' ? 'Last 3 months' : dateRange === 'last6' ? 'Last 6 months' : 'Year to date'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Average</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : `£${averageMonthly.toLocaleString()}`}
            </div>
            <p className="text-xs text-muted-foreground">
              Per month average
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              Period over period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Commission Trend</CardTitle>
            <CardDescription>Monthly commission performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: '300px' }}>
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Loading chart data...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={seriesData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="month" 
                      className="text-sm fill-muted-foreground"
                    />
                    <YAxis 
                      className="text-sm fill-muted-foreground"
                      tickFormatter={(value) => `£${value}`}
                    />
                    <Tooltip 
                      formatter={(value) => [`£${value}`, 'Commission']}
                      labelStyle={{ color: 'var(--foreground)' }}
                      contentStyle={{ 
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#0A3D62" 
                      strokeWidth={2}
                      dot={{ fill: '#0A3D62', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Mix</CardTitle>
            <CardDescription>Commission breakdown by product</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: '300px' }}>
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Loading chart data...</p>
                </div>
              ) : productMixData.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No product data available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: £${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`£${value}`, 'Commission']}
                      contentStyle={{ 
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Performance Table */}
      {!isLoading && productMixData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Product Performance</CardTitle>
            <CardDescription>Detailed breakdown by product</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productMixData.map((product, index) => (
                <div key={product.product} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium">{product.product}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">£{product.amount.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      {((product.amount / totalCommissions) * 100).toFixed(1)}%
                    </div>
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

export default Analytics;