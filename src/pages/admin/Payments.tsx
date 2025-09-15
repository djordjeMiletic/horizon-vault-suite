import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { usePaymentCycleStore } from "@/lib/stores";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { Download, Plus, Check, X, AlertTriangle, FileText, Activity, Flag, CheckSquare, MessageSquare } from "lucide-react";

const Payments = () => {
  const { cycles, updatePaymentItem } = usePaymentCycleStore();
  const [selectedCycle, setSelectedCycle] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("summary");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [proposedStatus, setProposedStatus] = useState("");
  const [managerNote, setManagerNote] = useState("");
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const isManager = user?.role === 'manager';
  const isAdmin = user?.role === 'admin';

  const handleStatusUpdate = (cycleId: string, itemId: string, newStatus: string, statusType: 'proposed' | 'final') => {
    const updateField = statusType === 'proposed' ? 'proposedStatus' : 'finalStatus';
    updatePaymentItem(cycleId, itemId, { [updateField]: newStatus });
    
    // Add audit entry
    const auditEntry = {
      timestamp: new Date().toISOString(),
      actor: user?.name || 'Unknown',
      action: statusType === 'proposed' ? 'Status Proposed' : 'Payment Finalized',
      entity: itemId,
      details: { from: '', to: newStatus }
    };

    toast({
      title: "Status Updated", 
      description: `Payment ${itemId} ${statusType} status changed to ${newStatus}`,
    });
  };

  const handleBulkAction = (action: string) => {
    if (selectedItems.length === 0) {
      toast({ title: "No items selected", variant: "destructive" });
      return;
    }
    
    selectedItems.forEach(itemId => {
      if (currentCycle) {
        handleStatusUpdate(currentCycle.id, itemId, action, isManager ? 'proposed' : 'final');
      }
    });
    
    setSelectedItems([]);
    toast({
      title: "Bulk Action Completed",
      description: `${selectedItems.length} items updated to ${action}`,
    });
  };

  const handleCloseCycle = () => {
    if (!currentCycle || !isAdmin) return;
    
    const allFinalized = currentCycle.items.every(item => (item as any).finalStatus);
    if (!allFinalized) {
      toast({
        title: "Cannot close cycle",
        description: "All items must have final status before closing",
        variant: "destructive"
      });
      return;
    }
    
    // Add audit entry for cycle closure
    toast({ title: "Cycle Closed", description: `Payment cycle ${currentCycle.cycle} has been closed` });
  };

  const handleAddNote = () => {
    if (!currentItem || !managerNote.trim()) return;
    
    // In real implementation, this would update the item with the note
    toast({ title: "Note Added", description: "Manager note has been saved" });
    setManagerNote("");
    setNoteDialogOpen(false);
    setCurrentItem(null);
  };

  const handleItemSelect = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    }
  };

  const getStatusBadge = (status: string, type: 'current' | 'proposed' | 'final' = 'current') => {
    const baseClasses = "flex items-center gap-1";
    
    switch (status) {
      case "Approved":
        return <Badge variant="secondary" className={`${baseClasses} bg-green-100 text-green-800`}>
          <Check className="h-3 w-3" />{status}
        </Badge>;
      case "Pending":
        return <Badge variant="outline" className={`${baseClasses} border-yellow-500 text-yellow-700`}>
          <AlertTriangle className="h-3 w-3" />{status}
        </Badge>;
      case "Rejected":
        return <Badge variant="destructive" className={baseClasses}>
          <X className="h-3 w-3" />{status}
        </Badge>;
      case "Exception":
        return <Badge variant="destructive" className={`${baseClasses} bg-orange-100 text-orange-800`}>
          <AlertTriangle className="h-3 w-3" />{status}
        </Badge>;
      case "Proposed Approve":
        return <Badge variant="outline" className={`${baseClasses} border-green-500 text-green-700`}>
          <Check className="h-3 w-3" />Proposed Approve
        </Badge>;
      case "Proposed Reject":
        return <Badge variant="outline" className={`${baseClasses} border-red-500 text-red-700`}>
          <X className="h-3 w-3" />Proposed Reject
        </Badge>;
      case "Flag Exception":
        return <Badge variant="outline" className={`${baseClasses} border-orange-500 text-orange-700`}>
          <Flag className="h-3 w-3" />Flagged
        </Badge>;
      default:
        return <Badge variant="outline" className={baseClasses}>{status || "Not Set"}</Badge>;
    }
  };

  const currentCycle = selectedCycle ? cycles.find(c => c.id === selectedCycle) : null;
  
  // Calculate counts for proposed vs final statuses
  const proposedCounts = currentCycle?.items.reduce((acc, item: any) => {
    const status = item.proposedStatus || 'Not Set';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const finalCounts = currentCycle?.items.reduce((acc, item: any) => {
    const status = item.finalStatus || 'Not Set';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const exceptionsCount = currentCycle?.items.filter(item => 
    (item as any).proposedStatus === 'Flag Exception' || item.status === 'Exception'
  ).length || 0;

  const pendingReviewCount = currentCycle?.items.filter(item => 
    (item as any).proposedStatus && !(item as any).finalStatus
  ).length || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payment Cycles</h1>
          <p className="text-muted-foreground">Manage commission payments and approvals</p>
        </div>
        {!selectedCycle && (
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            New Cycle
          </Button>
        )}
      </div>

      {!selectedCycle ? (
        <div className="grid gap-4">
          {cycles.map((cycle) => (
            <Card key={cycle.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedCycle(cycle.id)}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Payment Cycle {cycle.cycle}</CardTitle>
                    <CardDescription>
                      {cycle.totals.payments} payments • Updated {new Date(cycle.updatedAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant={cycle.status === "Completed" ? "secondary" : "outline"}>
                    {cycle.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-green-600">{cycle.totals.approved}</span>
                    <p className="text-muted-foreground">Approved</p>
                  </div>
                  <div>
                    <span className="font-medium text-yellow-600">{cycle.totals.pending}</span>
                    <p className="text-muted-foreground">Pending</p>
                  </div>
                  <div>
                    <span className="font-medium text-red-600">{cycle.totals.rejected}</span>
                    <p className="text-muted-foreground">Rejected</p>
                  </div>
                  <div>
                    <span className="font-medium text-orange-600">{cycle.totals.exceptions}</span>
                    <p className="text-muted-foreground">Exceptions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div>
          <Button variant="outline" onClick={() => setSelectedCycle(null)} className="mb-4">
            ← Back to Cycles
          </Button>
          
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Cycle {currentCycle?.cycle} Details</CardTitle>
                  <CardDescription>{currentCycle?.totals.payments} payment items</CardDescription>
                </div>
                <div className="flex gap-2">
                  {isAdmin && (
                    <Button onClick={handleCloseCycle} variant="default">
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Close Cycle
                    </Button>
                  )}
                  {isAdmin && (
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="summary">
                    <FileText className="h-4 w-4 mr-2" />
                    Summary
                  </TabsTrigger>
                  <TabsTrigger value="items">
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Items
                  </TabsTrigger>
                  <TabsTrigger value="exceptions">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Exceptions ({exceptionsCount})
                  </TabsTrigger>
                  <TabsTrigger value="activity">
                    <Activity className="h-4 w-4 mr-2" />
                    Activity
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-4">
                  {/* Status Banner */}
                  <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="pt-6">
                      {isManager && (
                        <div className="flex items-center gap-2 text-blue-800">
                          <AlertTriangle className="h-5 w-5" />
                          <span className="font-medium">Manager View:</span>
                          <span>Waiting for Admin approval on {pendingReviewCount} items</span>
                        </div>
                      )}
                      {isAdmin && (
                        <div className="flex items-center gap-2 text-blue-800">
                          <CheckSquare className="h-5 w-5" />
                          <span className="font-medium">Admin Review:</span>
                          <span>There are {pendingReviewCount} proposed items to review</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Counts Grid */}
                  <div className="grid grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Proposed Status</CardTitle>
                        <CardDescription>Manager proposals pending admin review</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {Object.entries(proposedCounts).map(([status, count]) => (
                          <div key={status} className="flex justify-between items-center">
                            <span className="text-sm">{status}</span>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Final Status</CardTitle>
                        <CardDescription>Admin finalized decisions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {Object.entries(finalCounts).map(([status, count]) => (
                          <div key={status} className="flex justify-between items-center">
                            <span className="text-sm">{status}</span>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="items" className="space-y-4">
                  {/* Bulk Actions */}
                  {(isManager || isAdmin) && (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium">
                            {selectedItems.length} items selected
                          </span>
                          {isManager && (
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleBulkAction("Proposed Approve")}>
                                Bulk Propose Approve
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleBulkAction("Proposed Reject")}>
                                Bulk Propose Reject
                              </Button>
                            </div>
                          )}
                          {isAdmin && (
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleBulkAction("Approved")}>
                                Bulk Approve
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleBulkAction("Rejected")}>
                                Bulk Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Items Table */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {(isManager || isAdmin) && <TableHead className="w-10"></TableHead>}
                        <TableHead>Date</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Commission</TableHead>
                        <TableHead>Current Status</TableHead>
                        {isManager && <TableHead>Proposed Status</TableHead>}
                        {isAdmin && <TableHead>Proposed Status</TableHead>}
                        {isAdmin && <TableHead>Final Status</TableHead>}
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentCycle?.items.map((item) => (
                        <TableRow key={item.id}>
                          {(isManager || isAdmin) && (
                            <TableCell>
                              <Checkbox 
                                checked={selectedItems.includes(item.id)}
                                onCheckedChange={(checked) => handleItemSelect(item.id, !!checked)}
                              />
                            </TableCell>
                          )}
                          <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                          <TableCell>{item.provider}</TableCell>
                          <TableCell>{item.product}</TableCell>
                          <TableCell>{item.type}</TableCell>
                          <TableCell>£{item.amount.toFixed(2)}</TableCell>
                          <TableCell>£{item.commission.toFixed(2)}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          {(isManager || isAdmin) && (
                            <TableCell>
                              {getStatusBadge((item as any).proposedStatus, 'proposed')}
                            </TableCell>
                          )}
                          {isAdmin && (
                            <TableCell>
                              {getStatusBadge((item as any).finalStatus, 'final')}
                            </TableCell>
                          )}
                          <TableCell>
                            <div className="flex gap-2">
                              {isManager && !(item as any).finalStatus && (
                                <Select onValueChange={(value) => handleStatusUpdate(currentCycle.id, item.id, value, 'proposed')}>
                                  <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Propose" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Proposed Approve">Propose Approve</SelectItem>
                                    <SelectItem value="Proposed Reject">Propose Reject</SelectItem>
                                    <SelectItem value="Flag Exception">Flag Exception</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                              {isAdmin && (
                                <Select onValueChange={(value) => handleStatusUpdate(currentCycle.id, item.id, value, 'final')}>
                                  <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Finalize" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Approved">Approve</SelectItem>
                                    <SelectItem value="Rejected">Reject</SelectItem>
                                    <SelectItem value="Exception">Resolve Exception</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                              {isManager && (
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => {
                                    setCurrentItem(item.id);
                                    setNoteDialogOpen(true);
                                  }}
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="exceptions" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Exception Items</CardTitle>
                      <CardDescription>Items flagged for manual review</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item ID</TableHead>
                            <TableHead>Provider</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Exception Reason</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentCycle?.items
                            .filter(item => (item as any).proposedStatus === 'Flag Exception' || item.status === 'Exception')
                            .map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.id}</TableCell>
                              <TableCell>{item.provider}</TableCell>
                              <TableCell>£{item.amount.toFixed(2)}</TableCell>
                              <TableCell>{item.exceptionReason || 'Manual review required'}</TableCell>
                              <TableCell>{getStatusBadge((item as any).finalStatus || item.status)}</TableCell>
                              <TableCell>
                                {isAdmin && (
                                  <Select onValueChange={(value) => handleStatusUpdate(currentCycle.id, item.id, value, 'final')}>
                                    <SelectTrigger className="w-32">
                                      <SelectValue placeholder="Resolve" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Approved">Approve</SelectItem>
                                      <SelectItem value="Rejected">Reject</SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Activity Timeline</CardTitle>
                      <CardDescription>Status changes and audit trail</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 p-3 bg-muted/20 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Cycle Created</p>
                            <p className="text-xs text-muted-foreground">
                              {currentCycle?.createdAt ? new Date(currentCycle.createdAt).toLocaleString() : 'Unknown'} • System
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 p-3 bg-muted/20 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Payments Loaded</p>
                            <p className="text-xs text-muted-foreground">
                              {currentCycle?.updatedAt ? new Date(currentCycle.updatedAt).toLocaleString() : 'Unknown'} • System
                            </p>
                          </div>
                        </div>
                        {/* More audit entries would be added here in real implementation */}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Manager Notes Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Manager Note</DialogTitle>
            <DialogDescription>
              Add a note for item {currentItem}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                placeholder="Enter your note here..."
                value={managerNote}
                onChange={(e) => setManagerNote(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddNote}>
                Add Note
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Payments;