import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, Clock, XCircle, FileText, Loader2 } from 'lucide-react';
import { getComplianceDocuments, type ComplianceDocument } from '@/services/compliance';
import { useToast } from '@/hooks/use-toast';

const Compliance = () => {
  const [documents, setDocuments] = useState<ComplianceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const data = await getComplianceDocuments();
        setDocuments(data.items || []);
      } catch (error) {
        console.error('Failed to fetch compliance documents:', error);
        toast({
          title: "Error",
          description: "Failed to load compliance documents",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [toast]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Approved': return 'default';
      case 'Review': return 'secondary';
      case 'Draft': return 'outline';
      case 'Rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="h-4 w-4" />;
      case 'Review': return <Clock className="h-4 w-4" />;
      case 'Draft': return <FileText className="h-4 w-4" />;
      case 'Rejected': return <XCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Compliance Management</h1>
        <p className="text-muted-foreground">Manage compliance documents and approvals</p>
      </div>

      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance Documents ({documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading compliance documents...</span>
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell className="font-mono text-sm">{document.id}</TableCell>
                  <TableCell className="font-medium">{document.title}</TableCell>
                  <TableCell>{document.owner}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{document.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(document.status)} className="gap-1">
                      {getStatusIcon(document.status)}
                      {document.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(document.updatedAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Compliance;