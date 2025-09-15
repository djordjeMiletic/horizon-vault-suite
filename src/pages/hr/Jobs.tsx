import { useState } from 'react';
import { jobsService } from '@/services/jobs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Jobs = () => {
  const queryClient = useQueryClient();
  const { data: jobsData = { items: [] } } = useQuery({
    queryKey: ['jobs'],
    queryFn: jobsService.getAll
  });

  const jobs = Array.isArray(jobsData) ? jobsData : jobsData.items || [];

  const createJobMutation = useMutation({
    mutationFn: jobsService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] })
  });

  const updateJobMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => jobsService.update(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] })
  });

  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const [newJob, setNewJob] = useState({
    title: '',
    department: 'Sales',
    location: 'London',
    employmentType: 'Full-time',
    salaryMin: '',
    salaryMax: '',
    description: '',
    requirements: ''
  });

  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const filteredJobs = jobs.filter((job: any) =>
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateJob = () => {
    if (!newJob.title || !newJob.description) {
      toast({
        title: "Missing required fields",
        description: "Please fill in title and description",
        variant: "destructive"
      });
      return;
    }

    const jobData = {
      title: newJob.title,
      department: newJob.department,
      location: newJob.location,
      description: newJob.description,
      requirements: newJob.requirements ? newJob.requirements.split(',').map(r => r.trim()) : []
    };

    createJobMutation.mutate(jobData, {
      onSuccess: () => {
        setNewJob({
          title: '',
          department: 'Sales',
          location: 'London', 
          employmentType: 'Full-time',
          salaryMin: '',
          salaryMax: '',
          description: '',
          requirements: ''
        });
        setIsCreateDialogOpen(false);

        toast({
          title: "Job created",
          description: "New job posting has been created successfully.",
        });
      }
    });
  };

  const handleToggleStatus = (job: any) => {
    const newStatus = job.status === 'Open' ? 'Closed' : 'Open';
    updateJobMutation.mutate({ id: job.id, updates: { status: newStatus } });
    
    toast({
      title: `Job ${newStatus.toLowerCase()}`,
      description: `${job.title} has been ${newStatus.toLowerCase()}.`,
    });
  };

  const handleViewJob = (job: any) => {
    setSelectedJob(job);
    setIsViewDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'default';
      case 'Closed': return 'secondary';
      case 'Draft': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6 p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Job Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Job Posting</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={newJob.title}
                  onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                  placeholder="e.g. Senior Financial Advisor"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select value={newJob.department} onValueChange={(value) => setNewJob({...newJob, department: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Select value={newJob.location} onValueChange={(value) => setNewJob({...newJob, location: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="London">London</SelectItem>
                      <SelectItem value="Dublin">Dublin</SelectItem>
                      <SelectItem value="Frankfurt">Frankfurt</SelectItem>
                      <SelectItem value="Belgrade">Belgrade</SelectItem>
                      <SelectItem value="Remote">Remote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  value={newJob.description}
                  onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                  placeholder="Describe the role, responsibilities, and company culture..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="requirements">Requirements (comma-separated)</Label>
                <Textarea
                  id="requirements"
                  value={newJob.requirements}
                  onChange={(e) => setNewJob({...newJob, requirements: e.target.value})}
                  placeholder="List required skills, experience, and qualifications..."
                  rows={4}
                />
              </div>

              <Button onClick={handleCreateJob} className="w-full">
                Create Job Posting
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Postings</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
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
                  <TableHead>Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applications</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job: any) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>{job.department}</TableCell>
                    <TableCell>{job.location}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={job.status === 'Open'}
                          onCheckedChange={() => handleToggleStatus(job)}
                        />
                        <Badge variant={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{job.applicantCount || 0}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewJob(job)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ResponsiveTableDesktop>

          {/* Mobile Cards */}
          <ResponsiveTableMobile>
            {filteredJobs.map((job: any) => (
              <ResponsiveTableCard key={job.id}>
                <ResponsiveTableField label="Title">
                  <span className="font-medium">{job.title}</span>
                </ResponsiveTableField>
                <ResponsiveTableField label="Department">
                  {job.department}
                </ResponsiveTableField>
                <ResponsiveTableField label="Location">
                  {job.location}
                </ResponsiveTableField>
                <ResponsiveTableField label="Status">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={job.status === 'Open'}
                      onCheckedChange={() => handleToggleStatus(job)}
                    />
                    <Badge variant={getStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                  </div>
                </ResponsiveTableField>
                <ResponsiveTableField label="Applications">
                  {job.applicantCount || 0}
                </ResponsiveTableField>
                <ResponsiveTableField label="Actions">
                  <Button
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleViewJob(job)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </ResponsiveTableField>
              </ResponsiveTableCard>
            ))}
          </ResponsiveTableMobile>
        </CardContent>
      </Card>

      {/* Job Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedJob?.title}</DialogTitle>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Department</Label>
                  <p className="text-sm font-medium">{selectedJob.department}</p>
                </div>
                <div>
                  <Label>Location</Label>
                  <p className="text-sm font-medium">{selectedJob.location}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge variant={getStatusColor(selectedJob.status)}>
                    {selectedJob.status}
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <p className="text-sm mt-1">{selectedJob.description}</p>
              </div>

              {selectedJob.requirements && (
                <div>
                  <Label>Requirements</Label>
                  <ul className="text-sm mt-1 list-disc list-inside">
                    {Array.isArray(selectedJob.requirements) 
                      ? selectedJob.requirements.map((req: string, index: number) => (
                          <li key={index}>{req}</li>
                        ))
                      : <li>{selectedJob.requirements}</li>
                    }
                  </ul>
                </div>
              )}

              <div>
                <Label>Posted</Label>
                <p className="text-sm font-medium">
                  {new Date(selectedJob.postedAt || selectedJob.createdAt || Date.now()).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Jobs;