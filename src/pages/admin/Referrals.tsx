import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { Star, MapPin, Phone, Mail, TrendingUp, Users, DollarSign, Plus } from "lucide-react";

// Mock data - in real app this would come from a store
const referralPartners = [
  {
    id: "R-001",
    name: "Bright Partners",
    company: "Bright Partners LLP", 
    email: "contact@brightpartners.co.uk",
    phone: "+44 20 7890 1234",
    region: "London",
    activeDeals: 3,
    rating: 4.5,
    status: "Active",
    totalLeads: 15,
    conversionRate: 60,
    totalValue: 125000,
    lastActivity: "2025-09-10T14:30:00Z",
    notes: "Excellent conversion rate, specializes in corporate clients"
  },
  {
    id: "R-002", 
    name: "Northern Finance",
    company: "Northern Finance Solutions",
    email: "partnerships@northfin.com",
    phone: "+44 161 555 7890",
    region: "Manchester",
    activeDeals: 1,
    rating: 3.8,
    status: "Active",
    totalLeads: 8,
    conversionRate: 45,
    totalValue: 68000,
    lastActivity: "2025-09-08T11:15:00Z", 
    notes: "Good for SME clients in the North West region"
  },
  {
    id: "R-003",
    name: "Coastal Advisors", 
    company: "Coastal Financial Advisors",
    email: "info@coastaladvisors.co.uk",
    phone: "+44 1273 555 4567",
    region: "Brighton",
    activeDeals: 0,
    rating: 2.9,
    status: "Inactive",
    totalLeads: 12,
    conversionRate: 25,
    totalValue: 42000,
    lastActivity: "2025-08-15T09:45:00Z",
    notes: "Performance has declined, needs review meeting"
  },
  {
    id: "R-004",
    name: "Premium Connect",
    company: "Premium Connect Ltd", 
    email: "hello@premiumconnect.com",
    phone: "+44 131 555 2468",
    region: "Edinburgh",
    activeDeals: 2,
    rating: 4.2,
    status: "Active",
    totalLeads: 10,
    conversionRate: 70,
    totalValue: 89000,
    lastActivity: "2025-09-11T16:20:00Z",
    notes: "High-value referrals, strong relationship"
  }
];

const Referrals = () => {
  const [selectedPartner, setSelectedPartner] = useState<typeof referralPartners[0] | null>(null);

  const getStatusBadge = (status: string) => {
    return status === "Active" 
      ? <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
      : <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>;
  };

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">{rating}</span>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Referral Partners</h1>
          <p className="text-muted-foreground">Manage referral partnerships and performance</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Partner
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {referralPartners.map((partner) => (
          <Card key={partner.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{partner.name}</CardTitle>
                  <CardDescription>{partner.company}</CardDescription>
                </div>
                {getStatusBadge(partner.status)}
              </div>
              {getRatingStars(partner.rating)}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {partner.region}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {partner.totalLeads} leads
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    {partner.conversionRate}% conversion
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <DollarSign className="h-3 w-3" />
                    £{partner.totalValue.toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Conversion Rate</span>
                  <span>{partner.conversionRate}%</span>
                </div>
                <Progress value={partner.conversionRate} className="h-2" />
              </div>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>{partner.name}</SheetTitle>
                    <SheetDescription>{partner.company}</SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    <div>
                      <h4 className="font-medium mb-2">Contact Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {partner.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {partner.phone}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {partner.region}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Performance Metrics</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Total Leads</span>
                          <p className="font-medium">{partner.totalLeads}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Active Deals</span>
                          <p className="font-medium">{partner.activeDeals}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total Value</span>
                          <p className="font-medium">£{partner.totalValue.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Conversion Rate</span>
                          <p className="font-medium">{partner.conversionRate}%</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Notes</h4>
                      <p className="text-sm text-muted-foreground">{partner.notes}</p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Last Activity</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(partner.lastActivity).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant={partner.status === "Active" ? "destructive" : "default"}
                        className="flex-1"
                      >
                        {partner.status === "Active" ? "Deactivate" : "Activate"}
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Send Invite
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Referrals;