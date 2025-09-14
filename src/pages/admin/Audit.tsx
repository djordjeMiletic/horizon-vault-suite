import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, User, FileText, Activity, Shield, Download } from "lucide-react";

// Mock audit data - in real app this would come from a store
const auditLogs = [
  {
    id: "audit-001",
    timestamp: "2024-03-15T10:30:00Z",
    actor: "john.smith@company.com",
    action: "Payment Created", 
    entity: "Payment PAY-2024-001",
    details: "Created new commission payment for policy RP-2024-001",
    metadata: {
      paymentId: "PAY-2024-001",
      amount: 1250.00,
      policyNumber: "RP-2024-001"
    }
  },
  {
    id: "audit-002",
    timestamp: "2024-03-15T11:45:00Z", 
    actor: "jane.doe@company.com",
    action: "Payment Approved",
    entity: "Payment PAY-2024-001",
    details: "Approved commission payment after compliance review",
    metadata: {
      paymentId: "PAY-2024-001", 
      approver: "jane.doe@company.com",
      previousStatus: "Pending"
    }
  },
  {
    id: "audit-003",
    timestamp: "2024-03-15T14:20:00Z",
    actor: "system@company.com",
    action: "Document Uploaded",
    entity: "Document DOC-2024-005",
    details: "Policy document uploaded for case CASE-001",
    metadata: {
      documentId: "DOC-2024-005",
      caseId: "CASE-001", 
      fileType: "PDF"
    }
  },
  {
    id: "audit-004",
    timestamp: "2024-03-15T15:10:00Z",
    actor: "admin@company.com", 
    action: "Case Status Changed",
    entity: "Case CASE-001",
    details: "Case status updated from 'In Progress' to 'Resolved'",
    metadata: {
      caseId: "CASE-001",
      previousStatus: "In Progress",
      newStatus: "Resolved"
    }
  },
  {
    id: "audit-005", 
    timestamp: "2024-03-15T16:30:00Z",
    actor: "john.smith@company.com",
    action: "Ticket Created",
    entity: "Ticket TICK-2024-001",
    details: "New support ticket created for client technical issue",
    metadata: {
      ticketId: "TICK-2024-001",
      priority: "High",
      clientId: "1"
    }
  },
  {
    id: "audit-006",
    timestamp: "2024-03-15T17:15:00Z",
    actor: "jane.doe@company.com",
    action: "Ticket Closed", 
    entity: "Ticket TICK-2024-001",
    details: "Support ticket resolved and closed",
    metadata: {
      ticketId: "TICK-2024-001",
      resolution: "Technical issue resolved via phone support"
    }
  }
];

const Audit = () => {
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const [selectedActor, setSelectedActor] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const filteredLogs = auditLogs.filter(log => {
    const actionMatch = selectedAction === "all" || log.action === selectedAction;
    const actorMatch = selectedActor === "all" || log.actor === selectedActor;
    const dateFromMatch = !dateFrom || new Date(log.timestamp) >= new Date(dateFrom);
    const dateToMatch = !dateTo || new Date(log.timestamp) <= new Date(dateTo);
    
    return actionMatch && actorMatch && dateFromMatch && dateToMatch;
  });

  const getActionBadge = (action: string) => {
    const actionTypes = {
      "Payment Created": "default",
      "Payment Approved": "secondary", 
      "Document Uploaded": "outline",
      "Case Status Changed": "secondary",
      "Ticket Created": "outline",
      "Ticket Closed": "secondary"
    } as const;
    
    return <Badge variant={actionTypes[action as keyof typeof actionTypes] || "outline"}>{action}</Badge>;
  };

  const getEntityIcon = (entity: string) => {
    if (entity.startsWith("Payment")) return <FileText className="h-4 w-4" />;
    if (entity.startsWith("Document")) return <FileText className="h-4 w-4" />;
    if (entity.startsWith("Case")) return <Shield className="h-4 w-4" />;
    if (entity.startsWith("Ticket")) return <Activity className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const uniqueActions = Array.from(new Set(auditLogs.map(log => log.action)));
  const uniqueActors = Array.from(new Set(auditLogs.map(log => log.actor)));

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Audit Trail</h1>
          <p className="text-muted-foreground">System activity and user action logs</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter audit logs by date, action, or user</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="dateFrom">From Date</Label>
              <Input 
                id="dateFrom" 
                type="date" 
                value={dateFrom} 
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">To Date</Label>
              <Input 
                id="dateTo" 
                type="date" 
                value={dateTo} 
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div>
              <Label>Action Type</Label>
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {uniqueActions.map(action => (
                    <SelectItem key={action} value={action}>{action}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>User</Label>
              <Select value={selectedActor} onValueChange={setSelectedActor}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {uniqueActors.map(actor => (
                    <SelectItem key={actor} value={actor}>{actor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedAction("all");
                  setSelectedActor("all");
                  setDateFrom("");
                  setDateTo("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
          <CardDescription>{filteredLogs.length} entries found</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <Sheet key={log.id}>
                  <SheetTrigger asChild>
                    <TableRow className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-mono text-sm">
                              {new Date(log.timestamp).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{log.actor}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getEntityIcon(log.entity)}
                          <span className="font-mono text-sm">{log.entity}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md truncate">{log.details}</TableCell>
                    </TableRow>
                  </SheetTrigger>
                  <SheetContent className="w-[600px] sm:max-w-[600px]">
                    <SheetHeader>
                      <SheetTitle>Audit Log Details</SheetTitle>
                      <SheetDescription>{log.id}</SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-muted-foreground">Timestamp</Label>
                          <p className="font-medium">{new Date(log.timestamp).toLocaleString()}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Actor</Label>
                          <p className="font-medium">{log.actor}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Action</Label>
                          <div className="mt-1">{getActionBadge(log.action)}</div>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Entity</Label>
                          <p className="font-medium font-mono">{log.entity}</p>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm text-muted-foreground">Description</Label>
                        <p className="mt-1">{log.details}</p>
                      </div>

                      <div>
                        <Label className="text-sm text-muted-foreground">Metadata</Label>
                        <div className="mt-2 bg-muted rounded-lg p-4">
                          <pre className="text-sm font-mono overflow-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </div>
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

export default Audit;