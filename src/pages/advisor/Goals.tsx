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
import { useGoalStore } from '@/lib/stores';
import { monthsBack, formatMonthForDisplay } from '@/lib/timeSeries';

// Import mock data
import goalsData from '@/mocks/seed/goals.json';

const Goals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { goals, updateGoal, addMilestone } = useGoalStore();
  
  const [currentTarget, setCurrentTarget] = useState('');
  const [newMilestone, setNewMilestone] = useState({ note: '', date: '' });
  const [isEditing, setIsEditing] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7);
  
  // Get advisor data from new structure
  const advisorGoalsData = goalsData.advisors.find(a => a.email === user?.email);
  const isManager = user?.role === 'manager';
  const goalsSource = isManager ? goalsData.manager : advisorGoalsData;
  
  // Current goal calculation
  const currentGoal = goals.find(g => g.advisorId === user?.id && g.month === currentMonth) || {
    id: `goal-${currentMonth}`,
    advisorId: user?.id || '',
    month: currentMonth,
    target: goalsSource?.monthlyTarget || 50000,
    achieved: goalsSource?.history?.find(h => h.month === currentMonth)?.achieved || 0,
    progress: 0,
    type: 'Monthly APE',
    milestones: []
  };
  
  // Calculate progress
  currentGoal.progress = currentGoal.target > 0 ? currentGoal.achieved / currentGoal.target : 0;

  // Get historical data for line chart (last 6 months)
  const getHistoricalData = () => {
    const last6Months = monthsBack(6);
    
    return last6Months.map(monthStr => {
      const historyItem = goalsSource?.history?.find(h => h.month === monthStr);
      const target = goalsSource?.monthlyTarget || 0;
      const achieved = historyItem?.achieved || 0;
      
      return {
        month: formatMonthForDisplay(monthStr),
        target,
        achieved,
        progress: target > 0 ? achieved / target : 0
      };
    });
  };

  const lineChartData = getHistoricalData();

  const handleUpdateTarget = () => {
    const newTarget = parseFloat(currentTarget);
    if (!newTarget || newTarget <= 0) {
      toast({ title: "Error", description: "Please enter a valid target amount", variant: "destructive" });
      return;
    }

    const updatedGoal = {
      ...currentGoal,
      target: newTarget,
      progress: currentGoal.achieved / newTarget
    };

    updateGoal(updatedGoal);
    setCurrentTarget('');
    setIsEditing(false);
    toast({ title: "Success", description: "Goal target updated successfully" });
  };

  const handleAddMilestone = () => {
    if (!newMilestone.note || !newMilestone.date) {
      toast({ title: "Error", description: "Please fill in all milestone fields", variant: "destructive" });
      return;
    }

    addMilestone(currentGoal.id, {
      note: newMilestone.note,
      date: newMilestone.date,
      completed: false
    });

    setNewMilestone({ note: '', date: '' });
    toast({ title: "Success", description: "Milestone added successfully" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Goals & Targets</h1>
        <p className="text-muted-foreground">Track your monthly targets and performance goals</p>
      </div>

      {/* Current Goal Card */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {new Date(currentGoal.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Target
              </CardTitle>
              <CardDescription>{currentGoal.type}</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsEditing(!isEditing);
                setCurrentTarget(currentGoal.target.toString());
              }}
            >
              {isEditing ? 'Cancel' : 'Edit Target'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="target">New Target (£)</Label>
                <Input
                  id="target"
                  type="number"
                  value={currentTarget}
                  onChange={(e) => setCurrentTarget(e.target.value)}
                  placeholder="50000"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleUpdateTarget}>Update</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">£{currentGoal.target.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Target</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">£{currentGoal.achieved.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Achieved</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{(currentGoal.progress * 100).toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">Progress</p>
                </div>
              </div>
              
              <Progress value={Math.min(currentGoal.progress * 100, 100)} className="h-2" />
              
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>£0</span>
                <span>£{currentGoal.target.toLocaleString()}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Line Chart */}
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Target vs Achieved (6 Months)
            </CardTitle>
            <CardDescription>Performance trend analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `£${value.toLocaleString()}`, 
                      name === 'target' ? 'Target' : 'Achieved'
                    ]}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="#0A3D62" 
                    strokeWidth={2}
                    dot={{ fill: '#0A3D62', strokeWidth: 2, r: 4 }}
                    name="Target"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="achieved" 
                    stroke="#60A3D9" 
                    strokeWidth={2}
                    dot={{ fill: '#60A3D9', strokeWidth: 2, r: 4 }}
                    name="Achieved"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Milestones
            </CardTitle>
            <CardDescription>Track important dates and achievements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Milestone Form */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Milestone note"
                  value={newMilestone.note}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, note: e.target.value }))}
                  className="flex-1"
                />
                <Input
                  type="date"
                  value={newMilestone.date}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, date: e.target.value }))}
                  className="w-40"
                />
                <Button size="sm" onClick={handleAddMilestone}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Milestones List */}
            <div className="space-y-2">
              {((currentGoal as any).milestones || []).map((milestone: any) => (
                <div key={milestone.id} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                  <div>
                    <p className="text-sm font-medium">{milestone.note}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(milestone.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${milestone.completed ? 'bg-green-500' : 'bg-muted'}`} />
                </div>
              ))}
              {(!(currentGoal as any).milestones || (currentGoal as any).milestones.length === 0) && (
                <p className="text-center text-muted-foreground py-4">
                  No milestones added yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Goals;