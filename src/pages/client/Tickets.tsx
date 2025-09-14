import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTicketStore } from '@/lib/stores';
import { useToast } from '@/hooks/use-toast';
import { Plus, MessageSquare, Clock, AlertTriangle, Search, Send } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const Tickets = () => {
  const { tickets, addTicket, updateTicketStatus } = useTicketStore();
  const [filter, setFilter] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [newReply, setNewReply] = useState('');
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    priority: 'Medium',
    message: ''
  });
  const { toast } = useToast();

  // Filter tickets for client (created by client)
  const clientTickets = tickets.filter(ticket => ticket.id.includes('T-'));
  
  const filteredTickets = clientTickets.filter(ticket =>
    ticket.subject.toLowerCase().includes(filter.toLowerCase()) ||
    ticket.id.toLowerCase().includes(filter.toLowerCase())
  );

  const selectedTicketData = tickets.find(t => t.id === selectedTicket);

  const handleCreateTicket = () => {
    if (!ticketForm.subject.trim() || !ticketForm.message.trim()) {
      toast({
        title: "Please fill all fields",
        description: "Subject and message are required.",
        variant: "destructive"
      });
      return;
    }

    const newTicket = {
      subject: ticketForm.subject,
      priority: ticketForm.priority.toLowerCase() as 'low' | 'medium' | 'high',
      description: ticketForm.message
    };

    addTicket(newTicket);
    setIsCreateOpen(false);
    setTicketForm({ subject: '', priority: 'Medium', message: '' });

    toast({
      title: "Ticket created",
      description: "Your support ticket has been created. We'll get back to you soon!",
    });
  };

  const handleSendReply = () => {
    if (!newReply.trim() || !selectedTicket) return;

    // For demo purposes, just show a toast
    setNewReply('');

    toast({
      title: "Reply sent",
      description: "Your message has been added to the ticket.",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'destructive';
      case 'Medium': return 'secondary';
      case 'Low': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'destructive';
      case 'In Progress': return 'secondary';
      case 'Resolved': return 'default';
      case 'Closed': return 'outline';
      default: return 'secondary';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High': return <AlertTriangle className="h-4 w-4" />;
      case 'Medium': return <Clock className="h-4 w-4" />;
      case 'Low': return <MessageSquare className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  if (!clientTickets.length) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Support Tickets</h1>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No support tickets</h3>
            <p className="text-muted-foreground text-center mb-6">
              Create a support ticket if you need help with your account or have questions.
            </p>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create Support Ticket</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Brief description of your issue..."
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={ticketForm.priority} onValueChange={(value) => setTicketForm({...ticketForm, priority: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Please describe your issue in detail..."
                      value={ticketForm.message}
                      onChange={(e) => setTicketForm({...ticketForm, message: e.target.value})}
                      className="min-h-[120px]"
                    />
                  </div>

                  <Button onClick={handleCreateTicket} className="w-full">
                    Create Ticket
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
        <h1 className="text-2xl font-bold">Support Tickets</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue..."
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={ticketForm.priority} onValueChange={(value) => setTicketForm({...ticketForm, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Please describe your issue in detail..."
                  value={ticketForm.message}
                  onChange={(e) => setTicketForm({...ticketForm, message: e.target.value})}
                  className="min-h-[120px]"
                />
              </div>

              <Button onClick={handleCreateTicket} className="w-full">
                Create Ticket
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Tickets</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets
                .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
                .map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-mono text-sm">{ticket.id}</TableCell>
                    <TableCell className="font-medium">{ticket.subject}</TableCell>
                    <TableCell>
                      <Badge variant={getPriorityColor(ticket.priority)} className="gap-1">
                        {getPriorityIcon(ticket.priority)}
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(ticket.created), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{formatDistanceToNow(new Date(ticket.created), { addSuffix: true })}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTicket(ticket.id)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Ticket Detail Drawer */}
      <Drawer open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader>
            <DrawerTitle className="flex items-center justify-between">
              <span>Ticket {selectedTicketData?.id}</span>
              <div className="flex items-center space-x-2">
                <Badge variant={getPriorityColor(selectedTicketData?.priority || '')}>
                  {selectedTicketData?.priority}
                </Badge>
                <Badge variant={getStatusColor(selectedTicketData?.status || '')}>
                  {selectedTicketData?.status}
                </Badge>
              </div>
            </DrawerTitle>
          </DrawerHeader>
          
          {selectedTicketData && (
            <div className="px-4 pb-4">
              <div className="mb-4">
                <h3 className="font-medium mb-2">{selectedTicketData.subject}</h3>
                <p className="text-sm text-muted-foreground">
                  Created {format(new Date(selectedTicketData.created), 'PPp')}
                </p>
                {selectedTicketData.description && (
                  <div className="mt-3 p-3 bg-muted rounded-lg">
                    <p className="text-sm">{selectedTicketData.description}</p>
                  </div>
                )}
              </div>

              {selectedTicketData.status !== 'closed' && (
                <div className="flex space-x-2">
                  <Textarea
                    placeholder="Type your reply..."
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleSendReply} disabled={!newReply.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Tickets;