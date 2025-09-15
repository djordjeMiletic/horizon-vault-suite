import { useState } from 'react';
import { useInterviewStore, useApplicantStore, useJobStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar, Plus, Search, Eye, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Interviews = () => {
  const { interviews, addInterview, updateInterview } = useInterviewStore();
  const { applicants } = useApplicantStore();
  const { jobs } = useJobStore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const [newInterview, setNewInterview] = useState({
    candidateId: '',
    candidateName: '',
    jobId: '',
    jobTitle: '',
    interviewerId: '1',
    interviewerName: 'John Smith',
    scheduledAt: '',
    duration: 60,
    type: 'Initial Interview',
    location: '',
    notes: '',
    interviewQuestions: ['']
  });

  const handleCreateInterview = () => {
    if (!newInterview.candidateId || !newInterview.scheduledAt || !newInterview.location) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    const filteredQuestions = newInterview.interviewQuestions.filter(q => q.trim() !== '');

    addInterview({
      ...newInterview,
      status: 'Scheduled',
      interviewQuestions: filteredQuestions
    });

    toast({
      title: 'Success',
      description: 'Interview scheduled successfully'
    });

    setNewInterview({
      candidateId: '',
      candidateName: '',
      jobId: '',
      jobTitle: '',
      interviewerId: '1',
      interviewerName: 'John Smith',
      scheduledAt: '',
      duration: 60,
      type: 'Initial Interview',
      location: '',
      notes: '',
      interviewQuestions: ['']
    });
    setIsCreateDialogOpen(false);
  };

  const handleStatusUpdate = (interviewId: string, newStatus: string, feedback?: string) => {
    const updates: any = { status: newStatus };
    if (feedback) {
      updates.feedback = feedback;
    }

    updateInterview(interviewId, updates);
    
    toast({
      title: 'Interview Updated',
      description: `Interview status changed to ${newStatus}`
    });
  };

  const handleCandidateSelect = (candidateId: string) => {
    const candidate = applicants.find(a => a.id === candidateId);
    if (candidate) {
      const job = jobs.find(j => j.id === candidate.appliedFor);
      setNewInterview(prev => ({
        ...prev,
        candidateId,
        candidateName: candidate.name,
        jobId: candidate.appliedFor,
        jobTitle: job?.title || candidate.jobTitle
      }));
    }
  };

  const addQuestion = () => {
    setNewInterview(prev => ({
      ...prev,
      interviewQuestions: [...prev.interviewQuestions, '']
    }));
  };

  const updateQuestion = (index: number, value: string) => {
    setNewInterview(prev => ({
      ...prev,
      interviewQuestions: prev.interviewQuestions.map((q, i) => i === index ? value : q)
    }));
  };

  const removeQuestion = (index: number) => {
    setNewInterview(prev => ({
      ...prev,
      interviewQuestions: prev.interviewQuestions.filter((_, i) => i !== index)
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = 
      interview.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.interviewerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || interview.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (interviews.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Interviews</h1>
            <p className="text-muted-foreground">Schedule and manage candidate interviews</p>
          </div>
        </div>
        
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-medium">No interviews scheduled</h3>
            <p className="text-muted-foreground">Schedule your first interview to get started</p>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Interview
                </Button>
              </DialogTrigger>
              <InterviewCreateDialog
                newInterview={newInterview}
                setNewInterview={setNewInterview}
                applicants={applicants}
                onCandidateSelect={handleCandidateSelect}
                addQuestion={addQuestion}
                updateQuestion={updateQuestion}
                removeQuestion={removeQuestion}
                handleCreateInterview={handleCreateInterview}
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
          <h1 className="text-3xl font-bold text-foreground">Interviews</h1>
          <p className="text-muted-foreground">Schedule and manage candidate interviews</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Interview
            </Button>
          </DialogTrigger>
          <InterviewCreateDialog
            newInterview={newInterview}
            setNewInterview={setNewInterview}
            applicants={applicants}
            onCandidateSelect={handleCandidateSelect}
            addQuestion={addQuestion}
            updateQuestion={updateQuestion}
            removeQuestion={removeQuestion}
            handleCreateInterview={handleCreateInterview}
          />
        </Dialog>
      </div>

      <Card>
        <div className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by candidate, job, or interviewer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Interviewer</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInterviews.map((interview) => (
                <TableRow key={interview.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{interview.candidateName}</TableCell>
                  <TableCell>{interview.jobTitle}</TableCell>
                  <TableCell>{interview.interviewerName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(interview.scheduledAt).toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {interview.duration} min
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(interview.status)}>
                      {interview.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </SheetTrigger>
                      <InterviewDetailsSheet
                        interview={interview}
                        onStatusUpdate={handleStatusUpdate}
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

const InterviewCreateDialog = ({ 
  newInterview, 
  setNewInterview, 
  applicants, 
  onCandidateSelect, 
  addQuestion, 
  updateQuestion, 
  removeQuestion, 
  handleCreateInterview 
}) => (
  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Schedule New Interview</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="candidate">Candidate *</Label>
        <Select value={newInterview.candidateId} onValueChange={onCandidateSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Select candidate" />
          </SelectTrigger>
          <SelectContent>
            {applicants
              .filter(a => 
                ['Screening', 'Interview'].includes(a.status) && 
                a.id && 
                typeof a.id === 'string' && 
                a.id.trim() !== '' &&
                a.name &&
                a.jobTitle
              )
              .map(candidate => (
              <SelectItem key={candidate.id} value={candidate.id}>
                {candidate.name} - {candidate.jobTitle}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="scheduledAt">Date & Time *</Label>
          <Input
            id="scheduledAt"
            type="datetime-local"
            value={newInterview.scheduledAt}
            onChange={(e) => setNewInterview(prev => ({ ...prev, scheduledAt: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Select
            value={newInterview.duration.toString()}
            onValueChange={(value) => setNewInterview(prev => ({ ...prev, duration: parseInt(value) }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="45">45 minutes</SelectItem>
              <SelectItem value="60">60 minutes</SelectItem>
              <SelectItem value="90">90 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Interview Type</Label>
          <Select
            value={newInterview.type}
            onValueChange={(value) => setNewInterview(prev => ({ ...prev, type: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Initial Interview">Initial Interview</SelectItem>
              <SelectItem value="Technical Interview">Technical Interview</SelectItem>
              <SelectItem value="Final Interview">Final Interview</SelectItem>
              <SelectItem value="Screening Interview">Screening Interview</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="interviewer">Interviewer</Label>
          <Select
            value={newInterview.interviewerId}
            onValueChange={(value) => {
              const interviewerName = value === '1' ? 'John Smith' : value === '2' ? 'Sarah Johnson' : 'Michael Brown';
              setNewInterview(prev => ({ ...prev, interviewerId: value, interviewerName }));
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">John Smith</SelectItem>
              <SelectItem value="2">Sarah Johnson</SelectItem>
              <SelectItem value="3">Michael Brown</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location *</Label>
        <Input
          id="location"
          value={newInterview.location}
          onChange={(e) => setNewInterview(prev => ({ ...prev, location: e.target.value }))}
          placeholder="e.g., Conference Room A, Phone Interview, Video Call"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={newInterview.notes}
          onChange={(e) => setNewInterview(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Additional notes for the interview"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Interview Questions</Label>
          <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
            Add Question
          </Button>
        </div>
        {newInterview.interviewQuestions.map((question, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={question}
              onChange={(e) => updateQuestion(index, e.target.value)}
              placeholder="Enter interview question"
            />
            {newInterview.interviewQuestions.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeQuestion(index)}
              >
                Remove
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline">Cancel</Button>
        <Button type="button" onClick={handleCreateInterview}>Schedule Interview</Button>
      </div>
    </div>
  </DialogContent>
);

const InterviewDetailsSheet = ({ interview, onStatusUpdate }) => {
  const [feedback, setFeedback] = useState(interview.feedback || '');

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === 'Completed' && feedback.trim()) {
      onStatusUpdate(interview.id, newStatus, feedback);
    } else {
      onStatusUpdate(interview.id, newStatus);
    }
  };

  return (
    <SheetContent className="w-[500px] sm:w-[700px] overflow-y-auto">
      <SheetHeader>
        <SheetTitle>Interview Details</SheetTitle>
      </SheetHeader>
      <div className="space-y-6 py-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Candidate</Label>
            <p className="mt-1 font-medium">{interview.candidateName}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Job</Label>
            <p className="mt-1">{interview.jobTitle}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Interviewer</Label>
            <p className="mt-1">{interview.interviewerName}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Type</Label>
            <p className="mt-1">{interview.type}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Date & Time</Label>
            <p className="mt-1">{new Date(interview.scheduledAt).toLocaleString()}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
            <p className="mt-1">{interview.duration} minutes</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Location</Label>
            <p className="mt-1">{interview.location}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Status</Label>
            <div className="mt-1">
              <Badge className={getStatusColor(interview.status)}>
                {interview.status}
              </Badge>
            </div>
          </div>
        </div>

        {interview.notes && (
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
            <p className="mt-1 text-sm p-3 bg-muted rounded-md">{interview.notes}</p>
          </div>
        )}

        <div>
          <Label className="text-sm font-medium text-muted-foreground">Interview Questions</Label>
          <ul className="mt-1 space-y-2">
            {(interview.interviewQuestions || []).map((question, index) => (
              <li key={index} className="text-sm flex items-start gap-2">
                <span className="text-muted-foreground font-medium">{index + 1}.</span>
                {question}
              </li>
            ))}
          </ul>
        </div>

        {interview.status !== 'Cancelled' && (
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Update Status</Label>
            <div className="mt-1 space-y-3">
              <Select 
                value={interview.status && interview.status.trim() !== '' ? interview.status : 'Scheduled'} 
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              {interview.status === 'Scheduled' && (
                <div>
                  <Label htmlFor="feedback" className="text-sm font-medium text-muted-foreground">
                    Feedback (for completion)
                  </Label>
                  <Textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Enter interview feedback..."
                    rows={4}
                    className="mt-1"
                  />
                </div>
              )}

              {interview.feedback && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Previous Feedback</Label>
                  <p className="mt-1 text-sm p-3 bg-muted rounded-md">{interview.feedback}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SheetContent>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Scheduled': return 'bg-blue-100 text-blue-800';
    case 'Completed': return 'bg-green-100 text-green-800';
    case 'Cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default Interviews;