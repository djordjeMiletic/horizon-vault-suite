import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, DollarSign, Calendar, User, Building } from "lucide-react";

// Mock pipeline data - in real app this would come from a store
const pipelineData = [
  {
    id: "deal-001",
    title: "Corporate Insurance Package",
    company: "Tech Solutions Ltd",
    client: "sarah.johnson@techsolutions.co.uk", 
    value: 25000,
    owner: "John Smith",
    stage: "Qualified",
    priority: "High",
    probability: 75,
    expectedCloseDate: "2024-03-30",
    nextAction: "Follow up call scheduled",
    createdAt: "2024-01-15"
  },
  {
    id: "deal-002", 
    title: "Life Insurance Policy",
    company: "Green Energy Corp",
    client: "michael.brown@greenenergy.com",
    value: 12000,
    owner: "Jane Doe",
    stage: "Proposal",
    priority: "Medium",
    probability: 60,
    expectedCloseDate: "2024-04-15",
    nextAction: "Send proposal document",
    createdAt: "2024-02-01"
  },
  {
    id: "deal-003",
    title: "Health Insurance Plan",
    company: "Creative Agency",
    client: "alex.wilson@creative.co.uk",
    value: 8500,
    owner: "John Smith", 
    stage: "New",
    priority: "Low",
    probability: 25,
    expectedCloseDate: "2024-05-01",
    nextAction: "Initial discovery call",
    createdAt: "2024-02-15"
  },
  {
    id: "deal-004",
    title: "Travel Insurance",
    company: "Global Consulting",
    client: "emma.davis@globalconsult.com",
    value: 15000,
    owner: "Jane Doe",
    stage: "Won", 
    priority: "High",
    probability: 100,
    expectedCloseDate: "2024-02-28",
    nextAction: "Policy setup",
    createdAt: "2024-01-20"
  },
  {
    id: "deal-005",
    title: "Property Insurance",
    company: "Real Estate Partners", 
    client: "james.taylor@realestate.co.uk",
    value: 30000,
    owner: "John Smith",
    stage: "Lost",
    priority: "Medium",
    probability: 0,
    expectedCloseDate: "2024-03-15",
    nextAction: "Post-mortem review",
    createdAt: "2024-01-10"
  }
];

const stages = ["New", "Qualified", "Proposal", "Won", "Lost"];

const Pipeline = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
    return pipelineData.filter(deal => deal.stage === stage);
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
                  <Input id="title" placeholder="Corporate Insurance Package" />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" placeholder="Company name" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client">Client Email</Label>
                  <Input id="client" type="email" placeholder="client@company.com" />
                </div>
                <div>
                  <Label htmlFor="value">Deal Value</Label>
                  <Input id="value" type="number" placeholder="25000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="owner">Deal Owner</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select owner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="john">John Smith</SelectItem>
                      <SelectItem value="jane">Jane Doe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select>
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
                <Textarea id="nextAction" placeholder="Next steps..." />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsDialogOpen(false)}>Create Deal</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
    </div>
  );
};

export default Pipeline;