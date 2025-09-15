import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ResponsiveTableDesktop,
  ResponsiveTableMobile,
  ResponsiveTableCard,
  ResponsiveTableField,
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/responsive-table';
import { Badge } from '@/components/ui/badge';

const Cases = () => {
  return (
    <div className="space-y-6 p-3 sm:p-6">
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
          {/* Desktop Table */}
          <ResponsiveTableDesktop>
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
          </ResponsiveTableDesktop>

          {/* Mobile Cards */}
          <ResponsiveTableMobile>
            <ResponsiveTableCard>
              <ResponsiveTableField label="Case ID">
                <span className="font-mono">C-301</span>
              </ResponsiveTableField>
              <ResponsiveTableField label="Product">
                Royal Protect Life
              </ResponsiveTableField>
              <ResponsiveTableField label="Status">
                <Badge variant="secondary">Processing</Badge>
              </ResponsiveTableField>
              <ResponsiveTableField label="Advisor">
                John Smith
              </ResponsiveTableField>
              <ResponsiveTableField label="Updated">
                {new Date().toLocaleDateString()}
              </ResponsiveTableField>
            </ResponsiveTableCard>

            <ResponsiveTableCard>
              <ResponsiveTableField label="Case ID">
                <span className="font-mono">C-302</span>
              </ResponsiveTableField>
              <ResponsiveTableField label="Product">
                Metro Shield Health
              </ResponsiveTableField>
              <ResponsiveTableField label="Status">
                <Badge variant="default">Approved</Badge>
              </ResponsiveTableField>
              <ResponsiveTableField label="Advisor">
                John Smith
              </ResponsiveTableField>
              <ResponsiveTableField label="Updated">
                {new Date().toLocaleDateString()}
              </ResponsiveTableField>
            </ResponsiveTableCard>
          </ResponsiveTableMobile>
        </CardContent>
      </Card>
    </div>
  );
};

export default Cases;