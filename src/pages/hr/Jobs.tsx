import { useState } from 'react';
import { useJobStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Users, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Jobs = () => {
  const { jobs, addJob, updateJob, toggleJobStatus } = useJobStore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const [newJob, setNewJob] = useState({
    title: '',
    department: '',
    location: '',
    description: '',
    requirements: ['']
  });

  const handleCreateJob = () => {
    const filteredRequirements = newJob.requirements.filter(req => req.trim() !== '');
    
    if (!newJob.title || !newJob.department || !newJob.location || !newJob.description) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    addJob({
      ...newJob,
      requirements: filteredRequirements,
      createdBy: 'HR Team',
      status: 'Open'
    });

    toast({
      title: 'Success',
      description: 'Job posting created successfully'
    });

    setNewJob({
      title: '',
      department: '',
      location: '',
      description: '',
      requirements: ['']
    });
    setIsCreateDialogOpen(false);
  };

  const handleToggleStatus = (jobId: string) => {
    toggleJobStatus(jobId);
    toast({
      title: 'Job Updated',
      description: 'Job status has been updated'
    });
  };

  const addRequirement = () => {
    setNewJob(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    setNewJob(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === index ? value : req)
    }));
  };

  const removeRequirement = (index: number) => {
    setNewJob(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (jobs.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Job Postings</h1>
            <p className="text-muted-foreground">Manage recruitment positions</p>
          </div>
        </div>
        
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <Users className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-medium">No job postings yet</h3>
            <p className="text-muted-foreground">Create your first job posting to start recruiting</p>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Job Posting
                </Button>
              </DialogTrigger>
              <JobCreateDialog
                newJob={newJob}
                setNewJob={setNewJob}
                addRequirement={addRequirement}
                updateRequirement={updateRequirement}
                removeRequirement={removeRequirement}
                handleCreateJob={handleCreateJob}
              />
            </Dialog>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Job Postings</h1>
          <p className="text-muted-foreground">Manage recruitment positions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Job Posting
            </Button>
          </DialogTrigger>
          <JobCreateDialog
            newJob={newJob}
            setNewJob={setNewJob}
            addRequirement={addRequirement}
            updateRequirement={updateRequirement}
            removeRequirement={removeRequirement}
            handleCreateJob={handleCreateJob}
          />
        </Dialog>
      </div>

      <Card>
        <div className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs by title, department, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Desktop Table */}
          <ResponsiveTableDesktop>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applicants</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => (
                  <TableRow key={job.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>{job.department}</TableCell>
                    <TableCell>{job.location}</TableCell>
                    <TableCell>
                      <Badge variant={job.status === 'Open' ? 'default' : 'secondary'}>
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {job.applicantCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(job.postedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </SheetTrigger>
                          <JobDetailsSheet job={job} onToggleStatus={handleToggleStatus} />
                        </Sheet>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ResponsiveTableDesktop>

          {/* Mobile Cards */}
          <ResponsiveTableMobile>
            {filteredJobs.map((job) => (
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
                  <Badge variant={job.status === 'Open' ? 'default' : 'secondary'}>
                    {job.status}
                  </Badge>
                </ResponsiveTableField>
                <ResponsiveTableField label="Applicants">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {job.applicantCount}
                  </div>
                </ResponsiveTableField>
                <ResponsiveTableField label="Posted">
                  {new Date(job.postedAt).toLocaleDateString()}
                </ResponsiveTableField>
                <ResponsiveTableField label="Actions">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <JobDetailsSheet job={job} onToggleStatus={handleToggleStatus} />
                  </Sheet>
                </ResponsiveTableField>
              </ResponsiveTableCard>
            ))}
          </ResponsiveTableMobile>
        </div>
      </Card>
    </div>
  );
};

const JobCreateDialog = ({ newJob, setNewJob, addRequirement, updateRequirement, removeRequirement, handleCreateJob }) => (
  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
    <DialogHeader>
      <DialogTitle>Create New Job Posting</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Job Title *</Label>
          <Input
            id="title"
            value={newJob.title}
            onChange={(e) => setNewJob(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter job title"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">Department *</Label>
          <Select
            value={newJob.department}
            onValueChange={(value) => setNewJob(prev => ({ ...prev, department: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Sales">Sales</SelectItem>
              <SelectItem value="Advisory">Advisory</SelectItem>
              <SelectItem value="Compliance">Compliance</SelectItem>
              <SelectItem value="IT">IT</SelectItem>
              <SelectItem value="HR">HR</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location *</Label>
        <Select
          value={newJob.location}
          onValueChange={(value) => setNewJob(prev => ({ ...prev, location: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="London Office">London Office</SelectItem>
            <SelectItem value="Dublin Office">Dublin Office</SelectItem>
            <SelectItem value="Frankfurt Office">Frankfurt Office</SelectItem>
            <SelectItem value="Belgrade Office">Belgrade Office</SelectItem>
            <SelectItem value="Remote">Remote</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Job Description *</Label>
        <Textarea
          id="description"
          value={newJob.description}
          onChange={(e) => setNewJob(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter detailed job description"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Requirements</Label>
          <Button type="button" variant="outline" size="sm" onClick={addRequirement}>
            Add Requirement
          </Button>
        </div>
        {newJob.requirements.map((req, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={req}
              onChange={(e) => updateRequirement(index, e.target.value)}
              placeholder="Enter requirement"
            />
            {newJob.requirements.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeRequirement(index)}
              >
                Remove
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline">Cancel</Button>
        <Button type="button" onClick={handleCreateJob}>Create Job</Button>
      </div>
    </div>
  </DialogContent>
);

const JobDetailsSheet = ({ job, onToggleStatus }) => (
  <SheetContent className="w-full sm:w-[500px] lg:w-[600px]">
    <SheetHeader>
      <SheetTitle>{job.title}</SheetTitle>
    </SheetHeader>
    <div className="space-y-6 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Department</Label>
          <p className="mt-1">{job.department}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Location</Label>
          <p className="mt-1">{job.location}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Status</Label>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant={job.status === 'Open' ? 'default' : 'secondary'}>
              {job.status}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleStatus(job.id)}
            >
              {job.status === 'Open' ? 'Close' : 'Reopen'}
            </Button>
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Applicants</Label>
          <p className="mt-1">{job.applicantCount}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Posted</Label>
          <p className="mt-1">{new Date(job.postedAt).toLocaleDateString()}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Created By</Label>
          <p className="mt-1">{job.createdBy}</p>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-muted-foreground">Description</Label>
        <p className="mt-1 text-sm leading-relaxed">{job.description}</p>
      </div>

      <div>
        <Label className="text-sm font-medium text-muted-foreground">Requirements</Label>
        <ul className="mt-1 space-y-1">
          {job.requirements.map((req, index) => (
            <li key={index} className="text-sm flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              {req}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </SheetContent>
);

export default Jobs;