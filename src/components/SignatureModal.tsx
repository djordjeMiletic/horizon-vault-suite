import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Pen } from 'lucide-react';

interface SignatureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentName: string;
  onSign: () => void;
}

const SignatureModal = ({ open, onOpenChange, documentName, onSign }: SignatureModalProps) => {
  const [signature, setSignature] = useState('');
  const { toast } = useToast();

  const handleSign = () => {
    if (!signature.trim()) {
      toast({
        title: "Signature required",
        description: "Please enter your signature before proceeding.",
        variant: "destructive"
      });
      return;
    }

    onSign();
    setSignature('');
    onOpenChange(false);
    
    toast({
      title: "Document signed successfully",
      description: `${documentName} has been digitally signed.`,
    });
  };

  const handleCancel = () => {
    setSignature('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Pen className="h-5 w-5 mr-2" />
            Sign Document
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              You are about to digitally sign: <strong>{documentName}</strong>
            </p>
            
            <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 text-center bg-muted/5">
              <Pen className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
              <Label htmlFor="signature" className="text-sm font-medium">
                Type your full name as your digital signature
              </Label>
              <input
                id="signature"
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Enter your full name here"
                className="w-full mt-2 px-3 py-2 text-center text-lg font-signature border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                style={{ fontFamily: 'cursive' }}
              />
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded">
            <p>
              By signing this document, you acknowledge that you have read and agree to its contents. 
              This digital signature has the same legal effect as a handwritten signature.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSign} className="flex-1">
              Sign Document
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignatureModal;