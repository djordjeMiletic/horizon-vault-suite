import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Target, Plus, TrendingUp, Calendar } from 'lucide-react';
import { useSession } from '@/state/SessionContext';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { getGoals } from '@/services/goals';
import type { GoalDto } from '@/types/api';

const Goals = () => {
  const { user } = useSession();
  const { toast } = useToast();
  const [goalsData, setGoalsData] = useState<GoalDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTarget, setCurrentTarget] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const isManager = user?.role === 'Manager';

  // Load goals data
  useEffect(() => {
    const loadGoals = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const subjectType = isManager ? 'Manager' : 'Advisor';
        const ref = isManager ? 'team' : user.email;
        
        const data = await getGoals(subjectType, ref);
        setGoalsData(data);
        setCurrentTarget(data.monthlyTarget.toString());
      } catch (error) {
        console.error('Failed to load goals:', error);
        toast({
          title: 'Error',
          description: 'Failed to load goals data',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadGoals();
  }, [user, isManager, toast]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Goals</h1>
            <p className="text-muted-foreground">Track your performance targets and milestones</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Loading goals data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!goalsData) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Goals</h1>
            <p className="text-muted-foreground">Track your performance targets and milestones</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">No goals data available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentGoal = {
    month: currentMonth,
    target: goalsData.monthlyTarget,
    achieved: goalsData.history.find(h => h.month === currentMonth)?.achieved || 0
  };

  // Prepare chart data from history
  const chartData = goalsData.history.slice(-6).map(item => ({
    month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    target: goalsData.monthlyTarget,
    achieved: item.achieved
  }));

  const progressPercentage = (currentGoal.achieved / currentGoal.target) * 100;

  const handleUpdateTarget = () => {
    const newTarget = parseFloat(currentTarget);
    if (newTarget && newTarget > 0) {
      // In a real app, this would call an API to update the goal
      toast({
        title: 'Target Updated',
        description: `Monthly target set to £${newTarget.toLocaleString()}`
      });
      setIsEditing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Goals</h1>
          <p className="text-muted-foreground">
            {isManager ? 'Team performance targets and milestones' : 'Track your performance targets and milestones'}
          </p>
        </div>
      </div>

      {/* Current Goal Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {isManager ? 'Team Monthly Target' : 'Monthly APE Target'}
              </CardTitle>
              <CardDescription>
                Current month progress - {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit Target'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progressPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={Math.min(progressPercentage, 100)} className="h-3" />
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-bold">£{currentGoal.achieved.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Achieved</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">£{currentGoal.target.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Target</p>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="border-t pt-4 space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="target">Monthly Target (£)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    id="target"
                    value={currentTarget}
                    onChange={(e) => setCurrentTarget(e.target.value)}
                    placeholder="Enter target amount"
                  />
                  <Button onClick={handleUpdateTarget}>Update</Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance History
          </CardTitle>
          <CardDescription>Last 6 months target vs achievement</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  className="text-sm fill-muted-foreground"
                />
                <YAxis 
                  className="text-sm fill-muted-foreground"
                  tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    `£${Number(value).toLocaleString()}`, 
                    name === 'target' ? 'Target' : 'Achieved'
                  ]}
                  labelStyle={{ color: 'var(--foreground)' }}
                  contentStyle={{ 
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#94a3b8" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#94a3b8', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="achieved" 
                  stroke="#0A3D62" 
                  strokeWidth={2}
                  dot={{ fill: '#0A3D62', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Goal Insights */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Achievement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {chartData.length > 0 
                ? `£${Math.round(chartData.reduce((sum, month) => sum + month.achieved, 0) / chartData.length).toLocaleString()}`
                : '£0'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly average (6 months)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {chartData.length > 0 
                ? `${Math.round((chartData.filter(month => month.achieved >= month.target).length / chartData.length) * 100)}%`
                : '0%'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Months target achieved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {chartData.length > 0 
                ? `£${Math.max(...chartData.map(m => m.achieved)).toLocaleString()}`
                : '£0'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Highest monthly achievement
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Goals;