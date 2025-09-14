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
import { useTicketStore } from "@/lib/stores";
import { useToast } from "@/hooks/use-toast";
import { Plus, MessageCircle, Clock, User, AlertTriangle } from "lucide-react";

// Extended ticket interface for admin view
interface ExtendedTicket {
  id: string;
  subject: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'closed';
  created: string;
  description?: string;
  clientEmail: string;
  assigneeName?: string;
  updatedAt: string;
  messages?: Array<{
    id: string;
    from: string;
    timestamp: string;
    content: string;
  }>;
}

// Mock extended tickets data
const extendedTickets: ExtendedTicket[] = [
  {
    id: "T-001",
    subject: "Login Issues",
    priority: "high",
    status: "open",
    created: "2025-09-10T09:00:00Z",
    updatedAt: "2025-09-12T14:30:00Z",
    clientEmail: "client1@example.com",
    assigneeName: "John Smith",
    description: "Client unable to access their dashboard",
    messages: [
      {
        id: "m1",
        from: "client1@example.com",
        timestamp: "2025-09-10T09:00:00Z",
        content: "I can't log into my account. Getting an error message."
      },
      {
        id: "m2", 
        from: "support@company.com",
        timestamp: "2025-09-10T10:15:00Z",
        content: "We're looking into this issue. Can you try clearing your browser cache?"
      }
    ]
  },
  {
    id: "T-002",
    subject: "Document Upload Failed",
    priority: "medium", 
    status: "in_progress",
    created: "2025-09-11T14:20:00Z",
    updatedAt: "2025-09-12T11:00:00Z",
    clientEmail: "client2@example.com",
    description: "Cannot upload policy documents",
    messages: []
  },
  {
    id: "T-003",
    subject: "Commission Query",
    priority: "low",
    status: "closed",
    created: "2025-09-08T16:45:00Z", 
    updatedAt: "2025-09-09T10:30:00Z",
    clientEmail: "client3@example.com",
    assigneeName: "Jane Doe",
    description: "Question about commission calculation",
    messages: []
  }
];

const Tickets = () => {
  const { updateTicketStatus } = useTicketStore();
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredTickets = extendedTickets.filter(ticket => {
    const priorityMatch = selectedPriority === "all" || ticket.priority === selectedPriority;
    const statusMatch = selectedStatus === "all" || ticket.status === selectedStatus;
    return priorityMatch && statusMatch;
  });

  const handleStatusUpdate = (ticketId: string, status: string) => {
    updateTicketStatus(ticketId, status as 'open' | 'in_progress' | 'closed');
    toast({
      title: "Status Updated",
      description: `Ticket ${ticketId} status changed to ${status}`,
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
                  <Input id="subject" placeholder="Issue description" />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select>
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
                  <Input id="client" type="email" placeholder="client@example.com" />
                </div>
                <div>
                  <Label htmlFor="assignee">Assign To</Label>
                  <Select>
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
                <Textarea id="description" placeholder="Detailed description of the issue..." />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsDialogOpen(false)}>Create Ticket</Button>
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
              {filteredTickets.map((ticket) => (
                <Sheet key={ticket.id}>
                  <SheetTrigger asChild>
                    <TableRow className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-mono">{ticket.id}</TableCell>
                      <TableCell className="font-medium">{ticket.subject}</TableCell>
                      <TableCell>{ticket.clientEmail}</TableCell>
                      <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
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
                      <TableCell>{new Date(ticket.updatedAt).toLocaleDateString()}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1">
                          <Select onValueChange={(value) => handleStatusUpdate(ticket.id, value)}>
                            <SelectTrigger className="w-24 h-8">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
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
                          <p className="font-medium">{ticket.clientEmail}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Priority</Label>
                          <div className="mt-1">{getPriorityBadge(ticket.priority)}</div>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Status</Label>
                          <div className="mt-1">{getStatusBadge(ticket.status)}</div>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Created</Label>
                          <p className="font-medium">{new Date(ticket.created).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm text-muted-foreground">Description</Label>
                        <p className="mt-1 text-sm">{ticket.description}</p>
                      </div>

                      <div>
                        <Label className="text-sm text-muted-foreground">Conversation</Label>
                        <div className="mt-2 space-y-3 max-h-60 overflow-y-auto">
                          {ticket.messages?.map((message) => (
                            <div key={message.id} className="border-l-2 border-muted pl-4">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium">{message.from}</span>
                                <span className="text-muted-foreground">
                                  {new Date(message.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm mt-1">{message.content}</p>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Tickets;