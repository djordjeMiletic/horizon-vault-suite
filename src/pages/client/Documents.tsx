import { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, FileText, Search, Pen } from 'lucide-react';
import { format } from 'date-fns';
import SignatureModal from '@/components/SignatureModal';
import { useSession } from '@/state/SessionContext';
import { uploadDocument, listDocuments, createSignatureRequest, completeSignatureRequest } from '@/services/documents';
import type { DocumentDto, Paginated, SignatureRequestDto } from '@/types/api';

const Documents = () => {
  const { user } = useSession();
  const [documents, setDocuments] = useState<Paginated<DocumentDto>>({
    items: [],
    page: 1,
    pageSize: 10,
    totalCount: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({ name: '', caseId: '', type: 'Identity' });
  const [signatureModal, setSignatureModal] = useState<{ open: boolean; document: DocumentDto | null }>({ open: false, document: null });
  const { toast } = useToast();

  // Load documents
  useEffect(() => {
    const loadDocuments = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const data = await listDocuments({ ownerEmail: user.email, page: 1, pageSize: 50 });
        setDocuments(data);
      } catch (error) {
        console.error('Failed to load documents:', error);
        toast({
          title: 'Error',
          description: 'Failed to load documents',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDocuments();
  }, [user, toast]);

  const filteredDocuments = documents.items.filter(doc => 
    doc.fileName.toLowerCase().includes(filter.toLowerCase()) ||
    (doc.caseId && doc.caseId.toLowerCase().includes(filter.toLowerCase()))
  );

  const handleUpload = async (file: File) => {
    if (!uploadForm.name || !user) return;
    
    setIsUploading(true);
    
    try {
      const uploadedDoc = await uploadDocument(file, {
        ownerEmail: user.email,
        caseId: uploadForm.caseId || undefined,
        tags: uploadForm.type
      });

      // Reload documents
      const data = await listDocuments({ ownerEmail: user.email, page: 1, pageSize: 50 });
      setDocuments(data);
      
      setUploadForm({ name: '', caseId: '', type: 'Identity' });
      
      toast({
        title: "Document uploaded",
        description: "Your document has been uploaded successfully.",
      });
    } catch (error) {
      console.error('Failed to upload document:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const requiresSignature = (doc: DocumentDto) => {
    return !doc.signedAt && doc.tags && ['Medical', 'Financial'].includes(doc.tags);
  };

  const handleSignDocument = async () => {
    if (!signatureModal.document || !user) return;

    try {
      // Create signature request
      const signatureRequest = await createSignatureRequest(signatureModal.document.id, user.email);
      
      // Complete signature (in real app, this would be after user signs)
      await completeSignatureRequest(signatureRequest.id, 'Signed');
      
      // Reload documents to show updated status
      const data = await listDocuments({ ownerEmail: user.email, page: 1, pageSize: 50 });
      setDocuments(data);

      toast({
        title: "Document signed",
        description: "Document has been digitally signed successfully.",
      });

      setSignatureModal({ open: false, document: null });
    } catch (error) {
      console.error('Failed to sign document:', error);
      toast({
        title: "Signing failed",
        description: "Failed to sign document. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDownload = (doc: DocumentDto) => {
    // In a real app, this would use the downloadUrl
    window.open(doc.downloadUrl, '_blank');
  };

  const getStatusColor = (doc: DocumentDto) => {
    if (doc.signedAt) return 'default';
    if (requiresSignature(doc)) return 'secondary';
    return 'outline';
  };

  const getStatusText = (doc: DocumentDto) => {
    if (doc.signedAt) return 'Signed';
    if (requiresSignature(doc)) return 'Requires Signature';
    return 'Uploaded';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-3 sm:p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Documents</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Loading documents...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (documents.items.length === 0 && !isLoading) {
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
                    <Label htmlFor="caseId">Case ID (Optional)</Label>
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
                  <div>
                    <Label htmlFor="file">File</Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleUpload(file);
                        }
                      }}
                      disabled={isUploading}
                    />
                  </div>
                  {isUploading && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Uploading...</p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-3 sm:p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">My Documents</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="hover-scale">
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
                <Label htmlFor="caseId">Case ID (Optional)</Label>
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
              <div>
                <Label htmlFor="file">File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleUpload(file);
                    }
                  }}
                  disabled={isUploading}
                />
              </div>
              {isUploading && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documents ({documents.totalCount})</CardTitle>
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
                  <TableHead>Status</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Sign</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id} className="animate-fade-in">
                    <TableCell className="font-medium">{doc.originalName}</TableCell>
                    <TableCell>{doc.caseId || 'N/A'}</TableCell>
                    <TableCell>{doc.tags || 'General'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(doc)}>
                        {getStatusText(doc)}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(doc.createdAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{formatFileSize(doc.sizeBytes)}</TableCell>
                    <TableCell>
                      {requiresSignature(doc) ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSignatureModal({ open: true, document: doc })}
                          className="hover-scale"
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
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDownload(doc)}
                        className="hover-scale"
                      >
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
            {filteredDocuments.map((doc, index) => (
              <ResponsiveTableCard key={doc.id} className="animate-fade-in">
                <ResponsiveTableField label="Name">
                  <span className="font-medium">{doc.originalName}</span>
                </ResponsiveTableField>
                <ResponsiveTableField label="Case">
                  {doc.caseId || 'N/A'}
                </ResponsiveTableField>
                <ResponsiveTableField label="Type">
                  {doc.tags || 'General'}
                </ResponsiveTableField>
                <ResponsiveTableField label="Status">
                  <Badge variant={getStatusColor(doc)}>
                    {getStatusText(doc)}
                  </Badge>
                </ResponsiveTableField>
                <ResponsiveTableField label="Uploaded">
                  {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                </ResponsiveTableField>
                <ResponsiveTableField label="Size">
                  {formatFileSize(doc.sizeBytes)}
                </ResponsiveTableField>
                <ResponsiveTableField label="Sign">
                  {requiresSignature(doc) ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSignatureModal({ open: true, document: doc })}
                      className="hover-scale"
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
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDownload(doc)}
                    className="hover-scale"
                  >
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
        documentName={signatureModal.document?.originalName || ''}
        onSign={handleSignDocument}
      />
    </div>
  );
};

export default Documents;