import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, MapPin, Phone, Mail, Clock, Calendar, MessageCircle, Video, Copy } from 'lucide-react';

const Offices = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const offices = [
    {
      id: 'london',
      name: 'London Office',
      address: '123 Canary Wharf, London E14 5AB',
      phone: '+44 20 7946 0958',
      email: 'london@eventhorizon.com',
      hours: 'Mon-Fri: 9:00 AM - 6:00 PM',
      description: 'Our flagship office in the heart of London\'s financial district.'
    },
    {
      id: 'dublin',
      name: 'Dublin Office', 
      address: '45 Trinity Street, Dublin 2, Ireland',
      phone: '+353 1 234 5678',
      email: 'dublin@eventhorizon.com',
      hours: 'Mon-Fri: 9:00 AM - 5:30 PM',
      description: 'Serving clients across Ireland with comprehensive financial solutions.'
    },
    {
      id: 'frankfurt',
      name: 'Frankfurt Office',
      address: '67 Banking Quarter, 60329 Frankfurt, Germany', 
      phone: '+49 69 1234 5678',
      email: 'frankfurt@eventhorizon.com',
      hours: 'Mon-Fri: 8:30 AM - 5:30 PM',
      description: 'Central European operations hub with multilingual support.'
    },
    {
      id: 'belgrade',
      name: 'Belgrade Office',
      address: '89 Knez Mihailova, 11000 Belgrade, Serbia',
      phone: '+381 11 123 4567', 
      email: 'belgrade@eventhorizon.com',
      hours: 'Mon-Fri: 9:00 AM - 6:00 PM',
      description: 'Expanding operations in Southeast Europe with local expertise.'
    }
  ];

  const handleAppointmentSubmit = async (e: React.FormEvent, officeId: string) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: 'Appointment Requested',
      description: 'Your appointment request has been submitted (demo). Our team will contact you shortly.'
    });
    
    setIsSubmitting(false);
  };

  const handleConsultationSubmit = async (e: React.FormEvent, officeId: string) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: 'Consultation Requested',
      description: 'Your consultation request has been submitted (demo). Expect a response within 24 hours.'
    });
    
    setIsSubmitting(false);
  };

  const handleVirtualMeeting = (officeId: string) => {
    const meetingId = Math.random().toString(36).substring(2, 15);
    const meetingLink = `https://meet.demo/${meetingId}`;
    
    navigator.clipboard.writeText(meetingLink).then(() => {
      toast({
        title: 'Virtual Meeting Link Generated',
        description: 'Meeting link copied to clipboard!'
      });
    });
    
    // Show dialog with meeting link
    const dialog = document.createElement('div');
    dialog.innerHTML = `
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
          <h3 class="font-semibold mb-4">Virtual Meeting Ready</h3>
          <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded flex items-center justify-between mb-4">
            <span class="text-sm font-mono">${meetingLink}</span>
            <button class="text-blue-600 hover:text-blue-800">
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path>
              </svg>
            </button>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Share this link with participants. The meeting is ready to start!
          </p>
          <button onclick="this.parentElement.parentElement.remove()" class="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Close
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(dialog);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Navigation */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-accent rounded-lg flex items-center justify-center">
                <span className="text-background font-bold text-sm">EH</span>
              </div>
              <span className="font-semibold text-lg">Event Horizon</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-muted-foreground hover:text-foreground">About</Link>
              <Link to="/products" className="text-muted-foreground hover:text-foreground">Products</Link>
              <Link to="/offices" className="text-primary font-medium">Offices</Link>
              <Link to="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link>
            </nav>

            <Link to="/login">
              <Button variant="default">Portal Access</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-2 mb-6">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground">Offices</span>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Our Offices</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect with our expert advisors at any of our European locations or schedule a virtual consultation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {offices.map((office) => (
              <Card key={office.id} className="bg-card/80 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span>{office.name}</span>
                    <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                  </CardTitle>
                  <CardDescription>{office.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span>{office.address}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{office.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{office.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{office.hours}</span>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 pt-4">
                    {/* Schedule Appointment */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="default" className="w-full">
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Appointment
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Schedule Appointment - {office.name}</DialogTitle>
                          <DialogDescription>
                            Book an in-person meeting with our advisors
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={(e) => handleAppointmentSubmit(e, office.id)} className="space-y-4">
                          <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" placeholder="Enter your full name" required />
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="Enter your email" required />
                          </div>
                          <div>
                            <Label htmlFor="date">Preferred Date</Label>
                            <Input id="date" type="date" required />
                          </div>
                          <div>
                            <Label htmlFor="time">Preferred Time</Label>
                            <Select required>
                              <SelectTrigger>
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="09:00">9:00 AM</SelectItem>
                                <SelectItem value="10:00">10:00 AM</SelectItem>
                                <SelectItem value="11:00">11:00 AM</SelectItem>
                                <SelectItem value="14:00">2:00 PM</SelectItem>
                                <SelectItem value="15:00">3:00 PM</SelectItem>
                                <SelectItem value="16:00">4:00 PM</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button type="submit" disabled={isSubmitting} className="w-full">
                            {isSubmitting ? 'Submitting...' : 'Submit Request'}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>

                    {/* Book Consultation */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Book Consultation
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Book Consultation - {office.name}</DialogTitle>
                          <DialogDescription>
                            Schedule a detailed consultation about your financial needs
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={(e) => handleConsultationSubmit(e, office.id)} className="space-y-4">
                          <div>
                            <Label htmlFor="topic">Consultation Topic</Label>
                            <Select required>
                              <SelectTrigger>
                                <SelectValue placeholder="Select topic" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="life-insurance">Life Insurance</SelectItem>
                                <SelectItem value="investment-planning">Investment Planning</SelectItem>
                                <SelectItem value="retirement-planning">Retirement Planning</SelectItem>
                                <SelectItem value="business-protection">Business Protection</SelectItem>
                                <SelectItem value="estate-planning">Estate Planning</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="Enter your email" required />
                          </div>
                          <div>
                            <Label htmlFor="message">Additional Details</Label>
                            <Textarea 
                              id="message" 
                              placeholder="Tell us about your specific needs or questions..."
                              className="min-h-[80px]"
                            />
                          </div>
                          <Button type="submit" disabled={isSubmitting} className="w-full">
                            {isSubmitting ? 'Submitting...' : 'Submit Request'}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>

                    {/* Virtual Meeting */}
                    <Button 
                      variant="secondary" 
                      className="w-full"
                      onClick={() => handleVirtualMeeting(office.id)}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Virtual Meeting
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Offices;