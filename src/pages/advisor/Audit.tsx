import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Audit = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Log</h1>
        <p className="text-muted-foreground">Activity tracking and compliance monitoring</p>
      </div>
      
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>Audit log functionality will be available shortly</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This section will display detailed audit trails and compliance monitoring.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Audit;