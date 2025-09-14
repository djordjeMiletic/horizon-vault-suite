import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Download, Eye } from 'lucide-react';

const Compliance = () => {
  const complianceDocs = [
    {
      id: 1,
      title: 'Privacy Policy',
      description: 'How we handle and protect your personal data',
      category: 'Privacy',
      lastUpdated: '2024-01-15',
      mandatory: true
    },
    {
      id: 2,
      title: 'Terms of Service', 
      description: 'Terms and conditions for using our services',
      category: 'Legal',
      lastUpdated: '2024-01-10',
      mandatory: true
    },
    {
      id: 3,
      title: 'Data Processing Agreement',
      description: 'Agreement for processing of personal data',
      category: 'Privacy',
      lastUpdated: '2024-01-05',
      mandatory: false
    },
    {
      id: 4,
      title: 'Cookie Policy',
      description: 'Information about cookies used on our platform',
      category: 'Privacy', 
      lastUpdated: '2024-01-01',
      mandatory: false
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Compliance & Privacy</h1>
        <p className="text-muted-foreground">Access compliance documents and privacy information</p>
      </div>

      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance Documents
          </CardTitle>
          <CardDescription>
            Important legal and compliance documents for your records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complianceDocs.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{doc.title}</h4>
                    {doc.mandatory && (
                      <Badge variant="destructive" className="text-xs">Required</Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">{doc.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{doc.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Last updated: {new Date(doc.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle>Your Privacy Rights</CardTitle>
          <CardDescription>Information about your data protection rights</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium mb-2">Right to Access</h4>
              <p className="text-sm text-muted-foreground">
                Request a copy of the personal data we hold about you.
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium mb-2">Right to Rectification</h4>
              <p className="text-sm text-muted-foreground">
                Request correction of inaccurate or incomplete data.
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium mb-2">Right to Erasure</h4>
              <p className="text-sm text-muted-foreground">
                Request deletion of your personal data under certain conditions.
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium mb-2">Right to Portability</h4>
              <p className="text-sm text-muted-foreground">
                Request transfer of your data to another service provider.
              </p>
            </div>
          </div>
          <div className="text-center pt-4">
            <Button>Exercise Your Rights</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Compliance;