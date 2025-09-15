import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Target, Plus, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { useGoalStore, useGoalsDataStore } from '@/lib/stores';
import { monthsBack, formatMonthForDisplay } from '@/lib/timeSeries';

const Goals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { goals, updateGoal, addMilestone } = useGoalStore();
  const { getAdvisorGoals, getManagerGoals } = useGoalsDataStore();
  
  const isManager = user?.role === 'manager';
  
  const [currentTarget, setCurrentTarget] = useState('');
  const [newMilestone, setNewMilestone] = useState({ note: '', date: '' });
  const [isEditing, setIsEditing] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7);
  
  // Get data based on role
  const goalsData = isManager ? getManagerGoals() : getAdvisorGoals(user?.email || '');
  
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
    
  const currentGoal = {
    advisorId: user?.id,
    month: currentMonth,
    target: goalsData.monthlyTarget,
    achieved: goalsData.history?.find(h => h.month === currentMonth)?.achieved || 0,
    progress: goalsData.monthlyTarget > 0 
      ? (goalsData.history?.find(h => h.month === currentMonth)?.achieved || 0) / goalsData.monthlyTarget 
      : 0,
    type: isManager ? 'Team Monthly Target' : 'Monthly APE'
  };

  // Prepare chart data - last 6 months
  const last6Months = monthsBack(6);
  const chartData = last6Months.map(month => {
    const monthData = goalsData.history?.find(h => h.month === month);
    return {
      month: formatMonthForDisplay(month),
      target: goalsData.monthlyTarget,
      achieved: monthData?.achieved || 0
    };
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Goals</h1>
          <p className="text-muted-foreground">Track your performance targets and milestones</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Current Goal
            </CardTitle>
            <CardDescription>{currentGoal.type}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Target</span>
                <span className="text-lg font-semibold">£{currentGoal.target?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Achieved</span>
                <span className="text-lg font-semibold text-primary">£{currentGoal.achieved?.toLocaleString()}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Progress</span>
                  <span className="text-sm font-medium">{Math.round(currentGoal.progress * 100)}%</span>
                </div>
                <Progress value={currentGoal.progress * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Trend
            </CardTitle>
            <CardDescription>Target vs Achieved - Last 6 Months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`£${Number(value).toLocaleString()}`, '']} />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeDasharray="5 5"
                  name="Target"
                />
                <Line 
                  type="monotone" 
                  dataKey="achieved" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Achieved"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Goals;
