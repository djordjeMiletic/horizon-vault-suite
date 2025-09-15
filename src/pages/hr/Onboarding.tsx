import { useState } from 'react';
import { onboardingService } from '@/services/onboarding';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search, Users, Eye, CheckCircle, Clock, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Onboarding = () => {
  const queryClient = useQueryClient();
  const { data: tasks = [] } = useQuery({
    queryKey: ['onboardingTasks'],
    queryFn: onboardingService.getTasks
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      onboardingService.updateTask(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['onboardingTasks'] })
  });

  const completeTaskMutation = useMutation({
    mutationFn: onboardingService.completeTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['onboardingTasks'] })
  });

  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  const employees = [...new Set(tasks.map((task: any) => task.assignee))];
  
  const filteredTasks = tasks.filter((task: any) =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.assignee.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleComplete = (taskId: string, completed: boolean) => {
    if (completed) {
      completeTaskMutation.mutate(taskId);
    } else {
      updateTaskMutation.mutate({ 
        id: taskId, 
        updates: { status: 'In Progress', completedDate: null } 
      });
    }
    
    toast({
      title: completed ? "Task completed" : "Task reopened",
      description: `Task has been ${completed ? 'marked as complete' : 'reopened'}.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'default';
      case 'In Progress': return 'secondary';
      case 'Overdue': return 'destructive';
      case 'Not Started': return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'destructive';
      case 'Medium': return 'secondary';
      case 'Low': return 'outline';
      default: return 'outline';
    }
  };

  const getEmployeeProgress = (employee: string) => {
    const employeeTasks = tasks.filter((task: any) => task.assignee === employee);
    const completedTasks = employeeTasks.filter((task: any) => task.status === 'Completed');
    return employeeTasks.length > 0 ? (completedTasks.length / employeeTasks.length) * 100 : 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Onboarding Management</h1>
      </div>

      {/* Employee Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {employees.map((employee: string) => {
          const employeeTasks = tasks.filter((task: any) => task.assignee === employee);
          const completedTasks = employeeTasks.filter((task: any) => task.status === 'Completed');
          const progress = getEmployeeProgress(employee);
          
          return (
            <Card key={employee} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{employee}</h3>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedEmployee(employee)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-[400px] sm:w-[540px]">
                    <SheetHeader>
                      <SheetTitle>{employee} - Onboarding Tasks</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-4 mt-6">
                      {employeeTasks.map((task: any) => (
                        <div key={task.id} className="border rounded p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{task.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {task.description}
                              </p>
                            </div>
                            <Checkbox
                              checked={task.status === 'Completed'}
                              onCheckedChange={(checked) => 
                                handleToggleComplete(task.id, !!checked)
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <Badge variant={getStatusColor(task.status)}>
                              {task.status}
                            </Badge>
                            <Badge variant={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{completedTasks.length} of {employeeTasks.length} completed</span>
                  <span>{progress.toFixed(0)}%</span>
                </div>
                <Progress value={progress} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Tasks Table */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">All Tasks</h2>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Complete</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task: any) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <Checkbox
                      checked={task.status === 'Completed'}
                      onCheckedChange={(checked) => 
                        handleToggleComplete(task.id, !!checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{task.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {task.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{task.assignee}</TableCell>
                  <TableCell>{task.category}</TableCell>
                  <TableCell>
                    <Badge variant={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(task.dueDate).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default Onboarding;