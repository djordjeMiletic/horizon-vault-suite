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
          <CardTitle>My Cases</CardTitle>
          <CardDescription>Track your insurance applications and policies</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Advisor</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono">C-301</TableCell>
                <TableCell>Royal Protect Life</TableCell>
                <TableCell><Badge variant="secondary">Processing</Badge></TableCell>
                <TableCell>John Smith</TableCell>
                <TableCell>{new Date().toLocaleDateString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono">C-302</TableCell>
                <TableCell>Metro Shield Health</TableCell>
                <TableCell><Badge variant="default">Approved</Badge></TableCell>
                <TableCell>John Smith</TableCell>
                <TableCell>{new Date().toLocaleDateString()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Cases;