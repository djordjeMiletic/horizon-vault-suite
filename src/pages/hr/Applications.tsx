import { useState } from 'react';
import { useApplicantStore, useJobStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Search, Users, Eye, FileText, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Applications = () => {
  const { applicants, updateApplicant, addTimelineEntry } = useApplicantStore();
  const { jobs } = useJobStore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [jobFilter, setJobFilter] = useState('All');

  const handleStatusUpdate = (applicantId: string, newStatus: string) => {
    const applicant = applicants.find(a => a.id === applicantId);
    if (!applicant) return;

    updateApplicant(applicantId, { status: newStatus as any });
    
    addTimelineEntry(applicantId, {
      at: new Date().toISOString(),
      action: `Status Updated to ${newStatus}`,
      by: 'HR Team',
      details: `Application status changed from ${applicant.status} to ${newStatus}`
    });

    toast({
      title: 'Status Updated',
      description: `Applicant status changed to ${newStatus}`
    });
  };

  const handleAddNote = (applicantId: string, note: string) => {
    if (!note.trim()) return;

    const applicant = applicants.find(a => a.id === applicantId);
    if (!applicant) return;

    updateApplicant(applicantId, {
      notes: applicant.notes ? `${applicant.notes}\n\n${note}` : note
    });

    addTimelineEntry(applicantId, {
      at: new Date().toISOString(),
      action: 'Note Added',
      by: 'HR Team',
      details: note
    });

    toast({
      title: 'Note Added',
      description: 'Note has been added to applicant profile'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Screening': return 'bg-yellow-100 text-yellow-800';
      case 'Interview': return 'bg-purple-100 text-purple-800';
      case 'Offer': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredApplicants = applicants.filter(applicant => {
    const matchesSearch = 
      applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || applicant.status === statusFilter;
    const matchesJob = jobFilter === 'All' || applicant.appliedFor === jobFilter;
    
    return matchesSearch && matchesStatus && matchesJob;
  });

  if (applicants.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Applications</h1>
            <p className="text-muted-foreground">Manage job applications and candidate progress</p>
          </div>
        </div>
        
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <Users className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-medium">No applications yet</h3>
            <p className="text-muted-foreground">Applications will appear here when candidates apply for jobs</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Applications</h1>
          <p className="text-muted-foreground">Manage job applications and candidate progress</p>
        </div>
      </div>

      <Card>
        <div className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or job title..."
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
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Screening">Screening</SelectItem>
                <SelectItem value="Interview">Interview</SelectItem>
                <SelectItem value="Offer">Offer</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={jobFilter} onValueChange={setJobFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Jobs</SelectItem>
                {jobs.map(job => (
                  <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Applied For</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplicants.map((applicant) => (
                <TableRow key={applicant.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{applicant.name}</TableCell>
                  <TableCell>{applicant.email}</TableCell>
                  <TableCell>{applicant.jobTitle}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(applicant.status)}>
                      {applicant.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(applicant.appliedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </SheetTrigger>
                      <ApplicantDetailsSheet
                        applicant={applicant}
                        onStatusUpdate={handleStatusUpdate}
                        onAddNote={handleAddNote}
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

const ApplicantDetailsSheet = ({ applicant, onStatusUpdate, onAddNote }) => {
  const [newNote, setNewNote] = useState('');

  const handleAddNote = () => {
    onAddNote(applicant.id, newNote);
    setNewNote('');
  };

  return (
    <SheetContent className="w-[500px] sm:w-[700px] overflow-y-auto">
      <SheetHeader>
        <SheetTitle>{applicant.name}</SheetTitle>
      </SheetHeader>
      <div className="space-y-6 py-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Email</Label>
            <p className="mt-1">{applicant.email}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
            <p className="mt-1">{applicant.phone}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Applied For</Label>
            <p className="mt-1">{applicant.jobTitle}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Current Status</Label>
            <div className="mt-1 flex items-center gap-2">
              <Badge className={getStatusColor(applicant.status)}>
                {applicant.status}
              </Badge>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Applied Date</Label>
            <p className="mt-1">{new Date(applicant.appliedAt).toLocaleDateString()}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">CV</Label>
            <div className="mt-1">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                View CV (Mock)
              </Button>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-muted-foreground">Update Status</Label>
          <div className="mt-1">
            <Select value={applicant.status} onValueChange={(value) => onStatusUpdate(applicant.id, value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Screening">Screening</SelectItem>
                <SelectItem value="Interview">Interview</SelectItem>
                <SelectItem value="Offer">Offer</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
          <div className="mt-1 space-y-2">
            {applicant.notes && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm whitespace-pre-wrap">{applicant.notes}</p>
              </div>
            )}
            <Textarea
              placeholder="Add a note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
            />
            <Button onClick={handleAddNote} disabled={!newNote.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-muted-foreground">Timeline</Label>
          <div className="mt-1 space-y-3">
            {applicant.timeline.map((entry) => (
              <div key={entry.id} className="flex gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{entry.action}</span>
                    <span className="text-xs text-muted-foreground">by {entry.by}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{entry.details}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SheetContent>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'New': return 'bg-blue-100 text-blue-800';
    case 'Screening': return 'bg-yellow-100 text-yellow-800';
    case 'Interview': return 'bg-purple-100 text-purple-800';
    case 'Offer': return 'bg-green-100 text-green-800';
    case 'Rejected': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default Applications;