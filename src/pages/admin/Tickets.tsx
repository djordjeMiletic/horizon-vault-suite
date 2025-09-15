import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ticketsService } from "@/services/tickets";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, MessageCircle, Clock, User, AlertTriangle } from "lucide-react";

const Tickets = () => {
  const queryClient = useQueryClient();
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    priority: 'medium',
    clientEmail: '',
    assignee: '',
    description: ''
  });
  const { toast } = useToast();

  // Fetch tickets from API
  const { data: ticketsData, isLoading } = useQuery({
    queryKey: ['admin-tickets'],
    queryFn: () => ticketsService.getAll()
  });

  const tickets = ticketsData?.items || [];

  const filteredTickets = tickets.filter((ticket: any) => {
    const priorityMatch = selectedPriority === "all" || ticket.priority === selectedPriority;
    const statusMatch = selectedStatus === "all" || ticket.status === selectedStatus;
    return priorityMatch && statusMatch;
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: string; status: string }) => 
      ticketsService.updateTicketStatus(ticketId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      toast({
        title: "Status Updated",
        description: "Ticket status has been updated",
      });
    }
  });

  const createTicketMutation = useMutation({
    mutationFn: (ticket: { subject: string; message: string }) => 
      ticketsService.createTicket(ticket),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      setIsDialogOpen(false);
      setNewTicket({ subject: '', priority: 'medium', clientEmail: '', assignee: '', description: '' });
      toast({
        title: "Success",
        description: "Ticket created successfully",
      });
    }
  });

  const handleStatusUpdate = (ticketId: string, status: string) => {
    updateStatusMutation.mutate({ ticketId, status });
  };

  const handleCreateTicket = () => {
    if (!newTicket.subject || !newTicket.description) {
      toast({ 
        title: "Error", 
        description: "Please fill in all required fields", 
        variant: "destructive" 
      });
      return;
    }

    createTicketMutation.mutate({
      subject: newTicket.subject,
      message: newTicket.description
    });
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      "high": "destructive",
      "medium": "outline", 
      "low": "secondary"
    } as const;
    
    return <Badge variant={variants[priority as keyof typeof variants]}>{priority}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      "open": "outline",
      "in_progress": "default",
      "closed": "secondary"
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants] || "outline"}>{status}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Support Tickets</h1>
          <p className="text-muted-foreground">Manage customer support requests</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Ticket</DialogTitle>
              <DialogDescription>Create a support ticket on behalf of a client</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input 
                    id="subject" 
                    placeholder="Issue description"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newTicket.priority} onValueChange={(value) => setNewTicket({...newTicket, priority: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client">Client Email</Label>
                  <Input 
                    id="client" 
                    type="email" 
                    placeholder="client@example.com"
                    value={newTicket.clientEmail}
                    onChange={(e) => setNewTicket({...newTicket, clientEmail: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="assignee">Assign To</Label>
                  <Select value={newTicket.assignee} onValueChange={(value) => setNewTicket({...newTicket, assignee: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">John Smith</SelectItem>
                      <SelectItem value="2">Jane Doe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Detailed description of the issue..."
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateTicket} disabled={createTicketMutation.isPending}>
                {createTicketMutation.isPending ? "Creating..." : "Create Ticket"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 items-center">
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
          <CardDescription>{filteredTickets.length} tickets found</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="text-muted-foreground">Loading tickets...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket: any) => (
                <Sheet key={ticket.id}>
                  <SheetTrigger asChild>
                    <TableRow className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-mono">{ticket.id}</TableCell>
                      <TableCell className="font-medium">{ticket.subject}</TableCell>
                      <TableCell>{ticket.createdBy || 'N/A'}</TableCell>
                      <TableCell>{getPriorityBadge(ticket.priority || 'medium')}</TableCell>
                      <TableCell>{getStatusBadge(ticket.status || 'open')}</TableCell>
                      <TableCell>
                        {ticket.assigneeName ? (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {ticket.assigneeName}
                          </div>
                        ) : (
                          <Badge variant="outline">Unassigned</Badge>
                        )}
                      </TableCell>
                      <TableCell>{new Date(ticket.updatedAt || ticket.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1">
                          <Select onValueChange={(value) => handleStatusUpdate(ticket.id, value)}>
                            <SelectTrigger className="w-24 h-8">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Open">Open</SelectItem>
                              <SelectItem value="InProgress">In Progress</SelectItem>
                              <SelectItem value="Resolved">Resolved</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  </SheetTrigger>
                    <SheetContent className="w-[600px] sm:max-w-[600px]">
                      <SheetHeader>
                        <SheetTitle>Ticket #{ticket.id}</SheetTitle>
                        <SheetDescription>{ticket.subject}</SheetDescription>
                      </SheetHeader>
                      <div className="mt-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm text-muted-foreground">From</Label>
                            <p className="font-medium">{ticket.createdBy || 'N/A'}</p>
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">Priority</Label>
                            <div className="mt-1">{getPriorityBadge(ticket.priority || 'medium')}</div>
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">Status</Label>
                            <div className="mt-1">{getStatusBadge(ticket.status || 'open')}</div>
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">Created</Label>
                            <p className="font-medium">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm text-muted-foreground">Description</Label>
                          <p className="mt-1 text-sm">{ticket.messages?.[0]?.text || 'No description available'}</p>
                        </div>

                        <div>
                          <Label className="text-sm text-muted-foreground">Conversation</Label>
                          <div className="mt-2 space-y-3 max-h-60 overflow-y-auto">
                            {ticket.messages?.map((message: any) => (
                              <div key={message.id} className="border-l-2 border-muted pl-4">
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="font-medium">{message.createdBy}</span>
                                  <span className="text-muted-foreground">
                                    {new Date(message.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm mt-1">{message.text}</p>
                              </div>
                            )) || (
                              <p className="text-sm text-muted-foreground">No messages yet.</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="reply">Reply</Label>
                          <Textarea id="reply" placeholder="Type your reply..." className="mt-1" />
                          <Button className="mt-2" size="sm">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Send Reply
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                </Sheet>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Tickets;