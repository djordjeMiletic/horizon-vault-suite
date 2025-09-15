import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Calendar, Users, Briefcase, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { getPublicJobs, type Job } from '@/services/jobs';
import { createApplication } from '@/services/applications';

const PublicJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [applicationForm, setApplicationForm] = useState({
    name: '',
    email: '',
    phone: '',
    cv: null as File | null,
    coverLetter: ''
  });
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await getPublicJobs();
        setJobs(data.filter(job => job.status === 'Open'));
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
        toast({
          title: "Error",
          description: "Failed to load job listings",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [toast]);

  const handleApply = async () => {
    if (!applicationForm.name || !applicationForm.email || !selectedJob) return;

    try {
      await createApplication({
        name: applicationForm.name,
        email: applicationForm.email,
        phone: applicationForm.phone,
        jobId: selectedJob.id,
        cv: applicationForm.cv || undefined,
        coverLetter: applicationForm.coverLetter
      });

      setApplicationForm({ 
        name: '', 
        email: '', 
        phone: '', 
        cv: null, 
        coverLetter: '' 
      });
      setSelectedJob(null);

      toast({
        title: "Application submitted!",
        description: "Thank you for your interest. We'll be in touch soon.",
      });
    } catch (error) {
      console.error('Failed to submit application:', error);
      toast({
        title: "Error",
        description: "Failed to submit application",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Join Our Team</h1>
          <p className="text-xl opacity-90">
            Discover exciting career opportunities and grow with us
          </p>
        </div>
      </div>

      {/* Jobs Section */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading job listings...
          </div>
        ) : jobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No open positions</h3>
              <p className="text-muted-foreground text-center">
                We don't have any open positions at the moment. Please check back later.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <Badge variant="default">Open</Badge>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-2" />
                      {job.department}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Posted {format(new Date(job.postedAt), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      {job.applicantCount} applicants
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {job.description}
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full" 
                        onClick={() => setSelectedJob(job)}
                      >
                        Apply Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Apply for {job.title}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            value={applicationForm.name}
                            onChange={(e) => setApplicationForm({...applicationForm, name: e.target.value})}
                            placeholder="Your full name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={applicationForm.email}
                            onChange={(e) => setApplicationForm({...applicationForm, email: e.target.value})}
                            placeholder="your.email@example.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={applicationForm.phone}
                            onChange={(e) => setApplicationForm({...applicationForm, phone: e.target.value})}
                            placeholder="Your phone number"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cv">CV/Resume</Label>
                          <Input
                            id="cv"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setApplicationForm({...applicationForm, cv: file});
                            }}
                          />
                        </div>
                        <div>
                          <Label htmlFor="coverLetter">Cover Letter</Label>
                          <Textarea
                            id="coverLetter"
                            value={applicationForm.coverLetter}
                            onChange={(e) => setApplicationForm({...applicationForm, coverLetter: e.target.value})}
                            placeholder="Tell us why you're interested..."
                            rows={3}
                          />
                        </div>
                        <Button 
                          onClick={handleApply} 
                          className="w-full"
                          disabled={!applicationForm.name || !applicationForm.email}
                        >
                          Submit Application
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicJobs;