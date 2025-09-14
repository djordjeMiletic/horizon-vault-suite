import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Goals = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Goals & Targets</h1>
        <p className="text-muted-foreground">Monthly targets and performance tracking</p>
      </div>
      
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>Goals management will be available shortly</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Set and track your monthly commission targets and performance goals.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Goals;