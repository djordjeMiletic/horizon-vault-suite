import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePaymentCycleStore } from "@/lib/stores";
import { useToast } from "@/hooks/use-toast";
import { Download, Plus, Check, X, AlertTriangle } from "lucide-react";

const Payments = () => {
  const { cycles, updatePaymentItem } = usePaymentCycleStore();
  const [selectedCycle, setSelectedCycle] = useState<string | null>(null);
  const { toast } = useToast();

  const handleStatusUpdate = (cycleId: string, itemId: string, newStatus: string) => {
    updatePaymentItem(cycleId, itemId, { status: newStatus as "Approved" | "Pending" | "Rejected" | "Exception" });
    toast({
      title: "Status Updated",
      description: `Payment ${itemId} status changed to ${newStatus}`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><Check className="h-3 w-3 mr-1" />{status}</Badge>;
      case "Pending":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700"><AlertTriangle className="h-3 w-3 mr-1" />{status}</Badge>;
      case "Rejected":
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />{status}</Badge>;
      case "Exception":
        return <Badge variant="destructive" className="bg-orange-100 text-orange-800"><AlertTriangle className="h-3 w-3 mr-1" />{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const currentCycle = selectedCycle ? cycles.find(c => c.id === selectedCycle) : null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payment Cycles</h1>
          <p className="text-muted-foreground">Manage commission payments and approvals</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Cycle
        </Button>
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
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentCycle?.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                      <TableCell>{item.provider}</TableCell>
                      <TableCell>{item.product}</TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>£{item.amount.toFixed(2)}</TableCell>
                      <TableCell>£{item.commission.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <Select onValueChange={(value) => handleStatusUpdate(currentCycle.id, item.id, value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Update" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Approved">Approve</SelectItem>
                            <SelectItem value="Rejected">Reject</SelectItem>
                            <SelectItem value="Exception">Flag Exception</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Payments;