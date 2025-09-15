import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Phone, Mail, User } from "lucide-react";
import { getLeads, assignLead, updateLeadStatus, createLead, type Lead } from "@/services/leads";

const Leads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredLeads = selectedStatus === "all" 
    ? leads 
    : leads.filter(lead => lead.status === selectedStatus);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const data = await getLeads();
        setLeads(data.items);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch leads",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [toast]);

  const handleAssignLead = async (leadId: string, assignee: string, assigneeName: string) => {
    try {
      const updatedLead = await assignLead(leadId, assignee, assigneeName);
      setLeads(prev => prev.map(l => l.id === leadId ? updatedLead : l));
      toast({
        title: "Lead Assigned",
        description: `Lead assigned to ${assigneeName}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign lead",
        variant: "destructive",
      });
    }
  };

  const handleStatusUpdate = async (leadId: string, status: string) => {
    try {
      const updatedLead = await updateLeadStatus(leadId, status as Lead['status']);
      setLeads(prev => prev.map(l => l.id === leadId ? updatedLead : l));
      toast({
        title: "Status Updated",
        description: `Lead status changed to ${status}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      "New": "outline",
      "Contacted": "secondary", 
      "Qualified": "default",
      "Converted": "secondary",
      "Lost": "destructive"
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants] || "outline"}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      "High": "text-red-700 bg-red-50",
      "Medium": "text-yellow-700 bg-yellow-50", 
      "Low": "text-green-700 bg-green-50"
    };
    
    return <Badge className={colors[priority as keyof typeof colors]}>{priority}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Leads Management</h1>
          <p className="text-muted-foreground">Track and manage sales leads</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Lead</DialogTitle>
              <DialogDescription>Create a new lead entry</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Lead name" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="lead@example.com" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="+44 20 1234 5678" />
                </div>
                <div>
                  <Label htmlFor="source">Source</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Website">Website</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                      <SelectItem value="Social Media">Social Media</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Additional notes..." />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsDialogOpen(false)}>Create Lead</Button>
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
            <SelectItem value="New">New</SelectItem>
            <SelectItem value="Contacted">Contacted</SelectItem>
            <SelectItem value="Qualified">Qualified</SelectItem>
            <SelectItem value="Converted">Converted</SelectItem>
            <SelectItem value="Lost">Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leads Overview</CardTitle>
          <CardDescription>{filteredLeads.length} leads found</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <ResponsiveTableDesktop>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {lead.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {lead.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{lead.source}</TableCell>
                    <TableCell>{getStatusBadge(lead.status)}</TableCell>
                    <TableCell>{getPriorityBadge(lead.priority)}</TableCell>
                    <TableCell>
                      {lead.assigneeName ? (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {lead.assigneeName}
                        </div>
                      ) : (
                        <Badge variant="outline">Unassigned</Badge>
                      )}
                    </TableCell>
                    <TableCell>£{lead.estimatedValue.toLocaleString()}</TableCell>
                    <TableCell>{new Date(lead.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Select onValueChange={(value) => handleStatusUpdate(lead.id, value)}>
                          <SelectTrigger className="w-28">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="Contacted">Contacted</SelectItem>
                            <SelectItem value="Qualified">Qualified</SelectItem>
                            <SelectItem value="Converted">Converted</SelectItem>
                            <SelectItem value="Lost">Lost</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select onValueChange={(value) => handleAssignLead(lead.id, value, "John Doe")}>
                          <SelectTrigger className="w-28">
                            <SelectValue placeholder="Assign" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">John Doe</SelectItem>
                            <SelectItem value="2">Jane Smith</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ResponsiveTableDesktop>

          {/* Mobile Cards */}
          <ResponsiveTableMobile>
            {filteredLeads.map((lead) => (
              <ResponsiveTableCard key={lead.id}>
                <ResponsiveTableField label="Name">
                  <span className="font-medium">{lead.name}</span>
                </ResponsiveTableField>
                <ResponsiveTableField label="Email">
                  <div className="flex items-center gap-1 text-sm">
                    <Mail className="h-3 w-3" />
                    {lead.email}
                  </div>
                </ResponsiveTableField>
                <ResponsiveTableField label="Phone">
                  <div className="flex items-center gap-1 text-sm">
                    <Phone className="h-3 w-3" />
                    {lead.phone}
                  </div>
                </ResponsiveTableField>
                <ResponsiveTableField label="Source">
                  {lead.source}
                </ResponsiveTableField>
                <ResponsiveTableField label="Status">
                  {getStatusBadge(lead.status)}
                </ResponsiveTableField>
                <ResponsiveTableField label="Priority">
                  {getPriorityBadge(lead.priority)}
                </ResponsiveTableField>
                <ResponsiveTableField label="Assigned To">
                  {lead.assigneeName ? (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {lead.assigneeName}
                    </div>
                  ) : (
                    <Badge variant="outline">Unassigned</Badge>
                  )}
                </ResponsiveTableField>
                <ResponsiveTableField label="Value">
                  £{lead.estimatedValue.toLocaleString()}
                </ResponsiveTableField>
                <ResponsiveTableField label="Created">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </ResponsiveTableField>
                <div className="pt-2 space-y-2">
                  <Select onValueChange={(value) => handleStatusUpdate(lead.id, value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Contacted">Contacted</SelectItem>
                      <SelectItem value="Qualified">Qualified</SelectItem>
                      <SelectItem value="Converted">Converted</SelectItem>
                      <SelectItem value="Lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select onValueChange={(value) => handleAssignLead(lead.id, value, "John Doe")}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Assign Lead" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">John Doe</SelectItem>
                      <SelectItem value="2">Jane Smith</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </ResponsiveTableCard>
            ))}
          </ResponsiveTableMobile>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Leads;