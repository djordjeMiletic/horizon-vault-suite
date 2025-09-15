import { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { Plus, MessageSquare, Clock, AlertTriangle, Search, Send } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { getTickets, createTicket, replyTicket } from '@/services/tickets';
import type { TicketDto, Paginated } from '@/types/api';

const Tickets = () => {
  const [filter, setFilter] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [newReply, setNewReply] = useState('');
  const [ticketsData, setTicketsData] = useState<Paginated<TicketDto>>({
    items: [],
    page: 1,
    pageSize: 10,
    totalCount: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    priority: 'Medium',
    message: ''
  });
  const { toast } = useToast();

  // Load tickets
  useEffect(() => {
    const loadTickets = async () => {
      setIsLoading(true);
      try {
        const data = await getTickets({ mine: true, page: 1, pageSize: 10 });
        setTicketsData(data);
      } catch (error) {
        console.error('Failed to load tickets:', error);
        toast({
          title: 'Error',
          description: 'Failed to load support tickets',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTickets();
  }, [toast]);

  const filteredTickets = ticketsData.items.filter(ticket =>
    ticket.subject.toLowerCase().includes(filter.toLowerCase()) ||
    ticket.id.toString().includes(filter)
  );

  const selectedTicketData = ticketsData.items.find(t => t.id === selectedTicket);

  const handleCreateTicket = async () => {
    if (!ticketForm.subject.trim() || !ticketForm.message.trim()) {
      toast({
        title: "Please fill all fields",
        description: "Subject and message are required.",
        variant: "destructive"
      });
      return;
    }

    try {
      await createTicket({
        subject: ticketForm.subject,
        message: ticketForm.message
      });

      // Reload tickets
      const data = await getTickets({ mine: true, page: 1, pageSize: 10 });
      setTicketsData(data);

      setIsCreateOpen(false);
      setTicketForm({ subject: '', priority: 'Medium', message: '' });
      
      toast({
        title: "Support ticket created",
        description: "Your ticket has been submitted successfully.",
      });
    } catch (error) {
      console.error('Failed to create ticket:', error);
      toast({
        title: "Error",
        description: "Failed to create support ticket.",
        variant: "destructive"
      });
    }
  };

  const handleSendReply = async () => {
    if (!newReply.trim() || !selectedTicket) return;

    try {
      await replyTicket(selectedTicket, { text: newReply });
      setNewReply('');
      
      toast({
        title: "Reply sent",
        description: "Your reply has been added to the ticket.",
      });
    } catch (error) {
      console.error('Failed to send reply:', error);
      toast({
        title: "Error",
        description: "Failed to send reply.",
        variant: "destructive"
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'destructive';
      case 'pending': return 'secondary';
      case 'resolved': return 'default';
      case 'closed': return 'outline';
      default: return 'secondary';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <MessageSquare className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  if (ticketsData.items.length === 0 && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto" />
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">No support tickets</h3>
            <p className="text-muted-foreground max-w-sm">
              You haven't created any support tickets yet. Create your first ticket to get help from our support team.
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Ticket
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Support Ticket</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your issue"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={ticketForm.priority} onValueChange={(value) => setTicketForm(prev => ({ ...prev, priority: value }))}>
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
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Detailed description of your issue..."
                    rows={4}
                    value={ticketForm.message}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, message: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTicket}>
                    Create Ticket
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-muted-foreground">
            View and manage your support requests
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={ticketForm.priority} onValueChange={(value) => setTicketForm(prev => ({ ...prev, priority: value }))}>
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
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Detailed description of your issue..."
                  rows={4}
                  value={ticketForm.message}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, message: e.target.value }))}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTicket}>
                  Create Ticket
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Tickets</CardTitle>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading tickets...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-mono text-sm">{ticket.id}</TableCell>
                    <TableCell className="font-medium max-w-sm truncate">
                      {ticket.subject}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityColor(ticket.priority)} className="inline-flex items-center gap-1">
                        {getPriorityIcon(ticket.priority)}
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Drawer>
                        <Button variant="outline" size="sm" onClick={() => setSelectedTicket(ticket.id)}>
                          View Details
                        </Button>
                        <DrawerContent>
                          <DrawerHeader>
                            <DrawerTitle>Ticket Details</DrawerTitle>
                          </DrawerHeader>
                          <div className="p-4 space-y-4">
                            {selectedTicketData && (
                              <>
                                <div className="space-y-2">
                                  <h3 className="font-semibold text-lg">{selectedTicketData.subject}</h3>
                                  <div className="flex items-center gap-2">
                                    <Badge variant={getStatusColor(selectedTicketData.status)}>
                                      {selectedTicketData.status}
                                    </Badge>
                                    <Badge variant={getPriorityColor(selectedTicketData.priority)}>
                                      {selectedTicketData.priority}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                      Updated {formatDistanceToNow(new Date(selectedTicketData.updatedAt), { addSuffix: true })}
                                    </span>
                                  </div>
                                </div>

                                <ScrollArea className="h-64 w-full border rounded-md p-4">
                                  <div className="space-y-4">
                                    <div className="border-b pb-2">
                                      <div className="flex justify-between items-start">
                                        <span className="font-medium">You</span>
                                        <span className="text-sm text-muted-foreground">
                                          {formatDistanceToNow(new Date(selectedTicketData.updatedAt), { addSuffix: true })}
                                        </span>
                                      </div>
                                      <p className="mt-1 text-sm">Initial ticket created</p>
                                    </div>
                                  </div>
                                </ScrollArea>

                                <div className="space-y-2">
                                  <Label htmlFor="reply">Reply to ticket</Label>
                                  <div className="flex space-x-2">
                                    <Textarea
                                      id="reply"
                                      placeholder="Type your reply..."
                                      value={newReply}
                                      onChange={(e) => setNewReply(e.target.value)}
                                      rows={3}
                                      className="flex-1"
                                    />
                                    <Button onClick={handleSendReply} size="sm">
                                      <Send className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </DrawerContent>
                      </Drawer>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketsData.items.length}</div>
            <p className="text-xs text-muted-foreground">
              All tickets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ticketsData.items.filter(t => t.status.toLowerCase() === 'open').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ticketsData.items.filter(t => t.status.toLowerCase() === 'resolved').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ticketsData.items.filter(t => t.priority.toLowerCase() === 'high').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Urgent tickets
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Tickets;