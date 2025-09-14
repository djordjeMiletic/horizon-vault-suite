import { useState } from 'react';
import { useOnboardingStore } from '@/lib/stores';
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
  const { onboarding, updateTask, completeTask } = useOnboardingStore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const handleTaskComplete = (recordId: string, taskId: string, completed: boolean) => {
    if (completed) {
      completeTask(recordId, taskId, 'HR Team');
      toast({
        title: 'Task Completed',
        description: 'Task has been marked as completed'
      });
    } else {
      updateTask(recordId, taskId, { 
        status: 'Pending',
        completedAt: undefined,
        completedBy: undefined
      });
      toast({
        title: 'Task Updated',
        description: 'Task has been marked as pending'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Not Started': return 'bg-gray-100 text-gray-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-gray-100 text-gray-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOnboarding = onboarding.filter(record =>
    record.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.assignedHR.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (onboarding.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Onboarding</h1>
            <p className="text-muted-foreground">Manage new hire onboarding process</p>
          </div>
        </div>
        
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <Users className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-medium">No onboarding candidates</h3>
            <p className="text-muted-foreground">New hire onboarding records will appear here</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Onboarding</h1>
          <p className="text-muted-foreground">Manage new hire onboarding process</p>
        </div>
      </div>

      <Card>
        <div className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, job title, or HR representative..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>HR Assigned</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOnboarding.map((record) => (
                <TableRow key={record.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{record.candidateName}</TableCell>
                  <TableCell>{record.jobTitle}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(record.startDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={record.progress} className="w-16" />
                      <span className="text-sm text-muted-foreground">{record.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(record.status)}>
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{record.assignedHR}</TableCell>
                  <TableCell>
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </SheetTrigger>
                      <OnboardingDetailsSheet
                        record={record}
                        onTaskComplete={handleTaskComplete}
                      />
                    </Sheet>
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

const OnboardingDetailsSheet = ({ record, onTaskComplete }) => {
  const groupedTasks = record.tasks.reduce((groups, task) => {
    if (!groups[task.category]) {
      groups[task.category] = [];
    }
    groups[task.category].push(task);
    return groups;
  }, {} as Record<string, typeof record.tasks>);

  const categoryIcons = {
    'HR Documentation': Users,
    'Regulatory': CheckCircle,
    'Training': Clock,
    'IT Setup': Users,
    'Orientation': Calendar
  };

  return (
    <SheetContent className="w-[600px] sm:w-[800px] overflow-y-auto">
      <SheetHeader>
        <SheetTitle>{record.candidateName} - Onboarding</SheetTitle>
      </SheetHeader>
      <div className="space-y-6 py-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Candidate</Label>
            <p className="mt-1 font-medium">{record.candidateName}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Job Title</Label>
            <p className="mt-1">{record.jobTitle}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Start Date</Label>
            <p className="mt-1">{new Date(record.startDate).toLocaleDateString()}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">HR Assigned</Label>
            <p className="mt-1">{record.assignedHR}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Overall Progress</Label>
            <div className="mt-1 flex items-center gap-2">
              <Progress value={record.progress} className="flex-1" />
              <span className="text-sm font-medium">{record.progress}%</span>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Status</Label>
            <div className="mt-1">
              <Badge className={getStatusColor(record.status)}>
                {record.status}
              </Badge>
            </div>
          </div>
        </div>

        {record.notes && (
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
            <p className="mt-1 text-sm p-3 bg-muted rounded-md">{record.notes}</p>
          </div>
        )}

        <div>
          <Label className="text-sm font-medium text-muted-foreground">Onboarding Tasks</Label>
          <div className="mt-2 space-y-4">
            {Object.entries(groupedTasks).map(([category, tasks]) => {
              const IconComponent = categoryIcons[category] || Users;
              const completedTasks = tasks.filter(t => t.status === 'Completed').length;
              const progress = Math.round((completedTasks / tasks.length) * 100);

              return (
                <Card key={category} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5" />
                      <h4 className="font-medium">{category}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={progress} className="w-20" />
                      <span className="text-sm text-muted-foreground">
                        {completedTasks}/{tasks.length}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div key={task.id} className="flex items-start gap-3 p-3 border rounded-md">
                        <Checkbox
                          checked={task.status === 'Completed'}
                          onCheckedChange={(checked) => 
                            onTaskComplete(record.id, task.id, checked as boolean)
                          }
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium text-sm">{task.title}</h5>
                            <Badge className={getTaskStatusColor(task.status)} variant="outline">
                              {task.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {task.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                            {task.assignedTo && (
                              <div>Assigned to: {task.assignedTo}</div>
                            )}
                            {task.completedAt && (
                              <div>
                                Completed: {new Date(task.completedAt).toLocaleDateString()} 
                                by {task.completedBy}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </SheetContent>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Not Started': return 'bg-gray-100 text-gray-800';
    case 'In Progress': return 'bg-blue-100 text-blue-800';
    case 'Completed': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getTaskStatusColor = (status: string) => {
  switch (status) {
    case 'Pending': return 'bg-gray-100 text-gray-800';
    case 'In Progress': return 'bg-yellow-100 text-yellow-800';
    case 'Completed': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default Onboarding;