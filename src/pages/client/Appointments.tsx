import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAppointmentStore } from '@/lib/stores';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Clock, Video, Phone, MapPin, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const Appointments = () => {
  const { appointments, addAppointment, updateAppointment } = useAppointmentStore();
  const [filter, setFilter] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({
    type: 'Virtual',
    with: 'John Smith',
    withId: '1',
    date: undefined as Date | undefined,
    time: '10:00',
    duration: 60,
    notes: ''
  });
  const { toast } = useToast();

  // Filter appointments for client (clientId "2" matches Sarah Johnson, but we'll show client's appointments)
  const clientAppointments = appointments.filter(apt => apt.clientId === '2');
  
  const filteredAppointments = clientAppointments.filter(apt =>
    apt.with.toLowerCase().includes(filter.toLowerCase()) ||
    apt.notes?.toLowerCase().includes(filter.toLowerCase())
  );

  const handleRequestAppointment = () => {
    if (!appointmentForm.date) {
      toast({
        title: "Please select a date",
        description: "You need to choose a date for your appointment.",
        variant: "destructive"
      });
      return;
    }

    const appointmentDate = new Date(appointmentForm.date);
    const [hours, minutes] = appointmentForm.time.split(':');
    appointmentDate.setHours(parseInt(hours), parseInt(minutes));

    const newAppointment = {
      id: `A-${Date.now()}`,
      type: appointmentForm.type as 'Virtual' | 'Phone' | 'Office',
      with: appointmentForm.with,
      withId: appointmentForm.withId,
      clientId: '2',
      clientName: 'Sarah Johnson',
      date: appointmentDate.toISOString(),
      duration: appointmentForm.duration,
      status: 'Requested' as const,
      notes: appointmentForm.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...(appointmentForm.type === 'Virtual' && { meetingLink: `https://meet.example.com/${Date.now()}` }),
      ...(appointmentForm.type === 'Office' && { location: 'London Office, Meeting Room 1' })
    };

    addAppointment(newAppointment);
    setIsOpen(false);
    setAppointmentForm({
      type: 'Virtual',
      with: 'John Smith',
      withId: '1',
      date: undefined,
      time: '10:00',
      duration: 60,
      notes: ''
    });

    toast({
      title: "Appointment requested",
      description: "Your appointment request has been sent. You'll be notified once it's confirmed.",
    });
  };

  const handleCancelAppointment = (appointmentId: string) => {
    updateAppointment(appointmentId, { status: 'Cancelled' });
    toast({
      title: "Appointment cancelled",
      description: "Your appointment has been cancelled.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'default';
      case 'Requested': return 'secondary';
      case 'Completed': return 'outline';
      case 'Cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Virtual': return <Video className="h-4 w-4" />;
      case 'Phone': return <Phone className="h-4 w-4" />;
      case 'Office': return <MapPin className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (!clientAppointments.length) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Appointments</h1>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No appointments scheduled</h3>
            <p className="text-muted-foreground text-center mb-6">
              Request an appointment with your advisor to get started.
            </p>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Request Appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Request Appointment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="type">Meeting Type</Label>
                    <Select value={appointmentForm.type} onValueChange={(value) => setAppointmentForm({...appointmentForm, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Virtual">Virtual Meeting</SelectItem>
                        <SelectItem value="Phone">Phone Call</SelectItem>
                        <SelectItem value="Office">Office Visit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="advisor">Advisor</Label>
                    <Select value={appointmentForm.with} onValueChange={(value) => setAppointmentForm({...appointmentForm, with: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="John Smith">John Smith</SelectItem>
                        <SelectItem value="Emma Wilson">Emma Wilson</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !appointmentForm.date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {appointmentForm.date ? format(appointmentForm.date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={appointmentForm.date}
                          onSelect={(date) => setAppointmentForm({...appointmentForm, date})}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="time">Preferred Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={appointmentForm.time}
                      onChange={(e) => setAppointmentForm({...appointmentForm, time: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Select value={appointmentForm.duration.toString()} onValueChange={(value) => setAppointmentForm({...appointmentForm, duration: parseInt(value)})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Agenda or special requirements..."
                      value={appointmentForm.notes}
                      onChange={(e) => setAppointmentForm({...appointmentForm, notes: e.target.value})}
                    />
                  </div>

                  <Button onClick={handleRequestAppointment} className="w-full">
                    Request Appointment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Appointments</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Request Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Request Appointment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="type">Meeting Type</Label>
                <Select value={appointmentForm.type} onValueChange={(value) => setAppointmentForm({...appointmentForm, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Virtual">Virtual Meeting</SelectItem>
                    <SelectItem value="Phone">Phone Call</SelectItem>
                    <SelectItem value="Office">Office Visit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="advisor">Advisor</Label>
                <Select value={appointmentForm.with} onValueChange={(value) => setAppointmentForm({...appointmentForm, with: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="John Smith">John Smith</SelectItem>
                    <SelectItem value="Emma Wilson">Emma Wilson</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !appointmentForm.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {appointmentForm.date ? format(appointmentForm.date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={appointmentForm.date}
                      onSelect={(date) => setAppointmentForm({...appointmentForm, date})}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="time">Preferred Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={appointmentForm.time}
                  onChange={(e) => setAppointmentForm({...appointmentForm, time: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Select value={appointmentForm.duration.toString()} onValueChange={(value) => setAppointmentForm({...appointmentForm, duration: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Agenda or special requirements..."
                  value={appointmentForm.notes}
                  onChange={(e) => setAppointmentForm({...appointmentForm, notes: e.target.value})}
                />
              </div>

              <Button onClick={handleRequestAppointment} className="w-full">
                Request Appointment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Appointments</CardTitle>
          <Input
            placeholder="Search appointments..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-sm"
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>With</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <div className="font-medium">
                        {format(new Date(appointment.date), 'MMM d, yyyy')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(appointment.date), 'h:mm a')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(appointment.type)}
                        <span>{appointment.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{appointment.with}</TableCell>
                    <TableCell>{appointment.duration} min</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {appointment.notes || '-'}
                    </TableCell>
                    <TableCell>
                      {appointment.status === 'Scheduled' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelAppointment(appointment.id)}
                        >
                          Cancel
                        </Button>
                      )}
                      {appointment.type === 'Virtual' && appointment.meetingLink && appointment.status === 'Scheduled' && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={appointment.meetingLink} target="_blank" rel="noopener noreferrer">
                            Join
                          </a>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Appointments;