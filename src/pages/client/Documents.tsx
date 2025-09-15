import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useClientDocumentStore, useCaseStore } from '@/lib/stores';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, FileText, Search, Pen } from 'lucide-react';
import { format } from 'date-fns';
import SignatureModal from '@/components/SignatureModal';

const Documents = () => {
  const { documents, addDocument, updateDocument } = useClientDocumentStore();
  const { cases, updateCase } = useCaseStore();
  const [filter, setFilter] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({ name: '', caseId: '', type: 'Identity' });
  const [signatureModal, setSignatureModal] = useState<{ open: boolean; document: any }>({ open: false, document: null });
  const { toast } = useToast();

  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(filter.toLowerCase()) ||
    doc.caseId.toLowerCase().includes(filter.toLowerCase())
  );

  const handleUpload = () => {
    if (!uploadForm.name || !uploadForm.caseId) return;
    
    setIsUploading(true);
    
    setTimeout(() => {
      const newDoc = {
        caseId: uploadForm.caseId,
        name: uploadForm.name,
        version: 1,
        uploadedBy: 'Jennifer Lee',
        uploadedById: '5',
        sizeKb: Math.floor(Math.random() * 1000) + 100,
        type: uploadForm.type as 'Identity' | 'Medical' | 'Financial' | 'Travel',
        status: 'Pending' as const
      };
      
      addDocument(newDoc);
      setIsUploading(false);
      setUploadForm({ name: '', caseId: '', type: 'Identity' });
      
      toast({
        title: "Document uploaded",
        description: "Your document has been uploaded and is being processed.",
      });
    }, 1500);
  };

  const requiresSignature = (doc: any) => {
    return ['Medical', 'Financial'].includes(doc.type) && doc.status === 'Processed' && !doc.signedAt;
  };

  const handleSignDocument = () => {
    if (!signatureModal.document) return;

    const updatedDoc = {
      ...signatureModal.document,
      signedAt: new Date().toISOString(),
      signedBy: 'client@client.com',
      status: 'Signed' as const
    };

    // Update document in store
    updateDocument(updatedDoc);
    
    // Add to case timeline if case exists
    const relatedCase = cases.find(c => c.id === signatureModal.document.caseId);
    if (relatedCase) {
      const updatedCase = {
        ...relatedCase,
        timeline: [
          ...relatedCase.timeline,
          {
            id: `timeline-${Date.now()}`,
            at: new Date().toISOString(),
            by: 'Jennifer Lee',
            event: 'Document Signed',
            details: `${signatureModal.document.name} digitally signed by client`
          }
        ]
      };
      updateCase(updatedCase);
    }

    setSignatureModal({ open: false, document: null });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processed': return 'default';
      case 'Signed': return 'default';
      case 'Pending': return 'secondary';
      case 'Superseded': return 'outline';
      default: return 'secondary';
    }
  };

  if (!documents.length) {
    return (
      <div className="space-y-6 p-3 sm:p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Documents</h1>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No documents yet</h3>
            <p className="text-muted-foreground text-center mb-6">
              Upload your documents to get started with your cases.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Document</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="docName">Document Name</Label>
                    <Input
                      id="docName"
                      value={uploadForm.name}
                      onChange={(e) => setUploadForm({...uploadForm, name: e.target.value})}
                      placeholder="e.g. Proof of Identity"
                    />
                  </div>
                  <div>
                    <Label htmlFor="caseId">Case ID</Label>
                    <Input
                      id="caseId"
                      value={uploadForm.caseId}
                      onChange={(e) => setUploadForm({...uploadForm, caseId: e.target.value})}
                      placeholder="e.g. C-301"
                    />
                  </div>
                  <div>
                    <Label htmlFor="docType">Document Type</Label>
                    <Select value={uploadForm.type} onValueChange={(value) => setUploadForm({...uploadForm, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Identity">Identity</SelectItem>
                        <SelectItem value="Medical">Medical</SelectItem>
                        <SelectItem value="Financial">Financial</SelectItem>
                        <SelectItem value="Travel">Travel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleUpload} disabled={isUploading} className="w-full">
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">My Documents</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="docName">Document Name</Label>
                <Input
                  id="docName"
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm({...uploadForm, name: e.target.value})}
                  placeholder="e.g. Proof of Identity"
                />
              </div>
              <div>
                <Label htmlFor="caseId">Case ID</Label>
                <Input
                  id="caseId"
                  value={uploadForm.caseId}
                  onChange={(e) => setUploadForm({...uploadForm, caseId: e.target.value})}
                  placeholder="e.g. C-301"
                />
              </div>
              <div>
                <Label htmlFor="docType">Document Type</Label>
                <Select value={uploadForm.type} onValueChange={(value) => setUploadForm({...uploadForm, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Identity">Identity</SelectItem>
                    <SelectItem value="Medical">Medical</SelectItem>
                    <SelectItem value="Financial">Financial</SelectItem>
                    <SelectItem value="Travel">Travel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleUpload} disabled={isUploading} className="w-full">
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full sm:max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <ResponsiveTableDesktop>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Case</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Sign</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.name}</TableCell>
                    <TableCell>{doc.caseId}</TableCell>
                    <TableCell>{doc.type}</TableCell>
                    <TableCell>v{doc.version}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(doc.status)}>
                        {doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(doc.uploadedAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{doc.sizeKb} KB</TableCell>
                    <TableCell>
                      {requiresSignature(doc) ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSignatureModal({ open: true, document: doc })}
                        >
                          <Pen className="h-4 w-4 mr-1" />
                          Sign
                        </Button>
                      ) : doc.signedAt ? (
                        <Badge variant="default">Signed</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ResponsiveTableDesktop>

          {/* Mobile Cards */}
          <ResponsiveTableMobile>
            {filteredDocuments.map((doc) => (
              <ResponsiveTableCard key={doc.id}>
                <ResponsiveTableField label="Name">
                  <span className="font-medium">{doc.name}</span>
                </ResponsiveTableField>
                <ResponsiveTableField label="Case">
                  {doc.caseId}
                </ResponsiveTableField>
                <ResponsiveTableField label="Type">
                  {doc.type}
                </ResponsiveTableField>
                <ResponsiveTableField label="Version">
                  v{doc.version}
                </ResponsiveTableField>
                <ResponsiveTableField label="Status">
                  <Badge variant={getStatusColor(doc.status)}>
                    {doc.status}
                  </Badge>
                </ResponsiveTableField>
                <ResponsiveTableField label="Uploaded">
                  {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
                </ResponsiveTableField>
                <ResponsiveTableField label="Size">
                  {doc.sizeKb} KB
                </ResponsiveTableField>
                <ResponsiveTableField label="Sign">
                  {requiresSignature(doc) ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSignatureModal({ open: true, document: doc })}
                    >
                      <Pen className="h-4 w-4 mr-1" />
                      Sign
                    </Button>
                  ) : doc.signedAt ? (
                    <Badge variant="default">Signed</Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">N/A</span>
                  )}
                </ResponsiveTableField>
                <ResponsiveTableField label="Actions">
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </ResponsiveTableField>
              </ResponsiveTableCard>
            ))}
          </ResponsiveTableMobile>
        </CardContent>
      </Card>

      <SignatureModal
        open={signatureModal.open}
        onOpenChange={(open) => setSignatureModal({ open, document: signatureModal.document })}
        documentName={signatureModal.document?.name || ''}
        onSign={handleSignDocument}
      />
    </div>
  );
};

export default Documents;