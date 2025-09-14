import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Cases = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Cases</h1>
        <p className="text-muted-foreground">Track your insurance cases and applications</p>
      </div>
      
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>Case management will be available shortly</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">View and manage your insurance applications and policy cases.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Cases;