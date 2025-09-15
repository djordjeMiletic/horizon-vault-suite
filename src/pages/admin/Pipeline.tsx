import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, DollarSign, Calendar, User, Building, Loader2 } from "lucide-react";
import { getDeals, createDeal, moveDeal, type Deal, type CreateDealPayload } from "@/services/pipeline";
import { useToast } from "@/hooks/use-toast";


const stages = ["New", "Qualified", "Proposal", "Won", "Lost"];

const Pipeline = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDeal, setNewDeal] = useState<Partial<CreateDealPayload>>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const data = await getDeals();
        setDeals(data);
      } catch (error) {
        console.error('Failed to fetch deals:', error);
        toast({
          title: "Error",
          description: "Failed to load deals",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, [toast]);

  const handleCreateDeal = async () => {
    if (!newDeal.title || !newDeal.company || !newDeal.client || !newDeal.value) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const dealData: CreateDealPayload = {
        title: newDeal.title,
        company: newDeal.company,
        client: newDeal.client,
        value: newDeal.value,
        owner: newDeal.owner || "Current User",
        priority: newDeal.priority || "Medium",
        expectedCloseDate: newDeal.expectedCloseDate || new Date().toISOString().split('T')[0],
        nextAction: newDeal.nextAction || "Initial contact"
      };

      const deal = await createDeal(dealData);
      setDeals(prev => [...prev, deal]);
      setNewDeal({});
      setIsDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Deal created successfully"
      });
    } catch (error) {
      console.error('Failed to create deal:', error);
      toast({
        title: "Error",
        description: "Failed to create deal",
        variant: "destructive"
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "text-red-700 bg-red-50";
      case "Medium": return "text-yellow-700 bg-yellow-50"; 
      case "Low": return "text-green-700 bg-green-50";
      default: return "text-muted-foreground";
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "New": return "outline";
      case "Qualified": return "secondary";
      case "Proposal": return "default";
      case "Won": return "secondary";
      case "Lost": return "destructive";
      default: return "outline";
    }
  };

  const getDealsInStage = (stage: string) => {
    return deals.filter(deal => deal.stage === stage);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sales Pipeline</h1>
          <p className="text-muted-foreground">Track deals through the sales process</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Deal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Deal</DialogTitle>
              <DialogDescription>Add a new deal to the pipeline</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Deal Title</Label>
                  <Input 
                    id="title" 
                    placeholder="Corporate Insurance Package"
                    value={newDeal.title || ''}
                    onChange={(e) => setNewDeal({...newDeal, title: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input 
                    id="company" 
                    placeholder="Company name"
                    value={newDeal.company || ''}
                    onChange={(e) => setNewDeal({...newDeal, company: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client">Client Email</Label>
                  <Input 
                    id="client" 
                    type="email" 
                    placeholder="client@company.com"
                    value={newDeal.client || ''}
                    onChange={(e) => setNewDeal({...newDeal, client: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="value">Deal Value</Label>
                  <Input 
                    id="value" 
                    type="number" 
                    placeholder="25000"
                    value={newDeal.value || ''}
                    onChange={(e) => setNewDeal({...newDeal, value: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="owner">Deal Owner</Label>
                  <Select value={newDeal.owner || ''} onValueChange={(value) => setNewDeal({...newDeal, owner: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select owner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="John Smith">John Smith</SelectItem>
                      <SelectItem value="Jane Doe">Jane Doe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newDeal.priority || ''} onValueChange={(value) => setNewDeal({...newDeal, priority: value as any})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="nextAction">Next Action</Label>
                <Textarea 
                  id="nextAction" 
                  placeholder="Next steps..."
                  value={newDeal.nextAction || ''}
                  onChange={(e) => setNewDeal({...newDeal, nextAction: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateDeal}>Create Deal</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading pipeline...
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stages.map((stage) => {
          const deals = getDealsInStage(stage);
          const stageValue = deals.reduce((sum, deal) => sum + deal.value, 0);
          
          return (
            <div key={stage} className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="font-semibold text-lg">{stage}</h3>
                <p className="text-sm text-muted-foreground">
                  {deals.length} deals • £{stageValue.toLocaleString()}
                </p>
              </div>
              
              <div className="space-y-3">
                {deals.map((deal) => (
                  <Card key={deal.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{deal.title}</CardTitle>
                      <CardDescription className="text-xs">{deal.company}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          £{deal.value.toLocaleString()}
                        </div>
                        <Badge className={getPriorityColor(deal.priority)}>{deal.priority}</Badge>
                      </div>
                      
                      <div className="space-y-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {deal.owner}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(deal.expectedCloseDate).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="text-xs">
                        <span className="font-medium">Next: </span>
                        <span className="text-muted-foreground">{deal.nextAction}</span>
                      </div>
                      
                      <div className="text-xs">
                        <div className="flex justify-between mb-1">
                          <span>Probability</span>
                          <span>{deal.probability}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1">
                          <div 
                            className="bg-primary h-1 rounded-full" 
                            style={{ width: `${deal.probability}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};

export default Pipeline;