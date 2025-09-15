import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter } from '@/components/ui/modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/state/SessionContext';
import { getPolicies } from '@/services/policies';
import { addPayment } from '@/services/payments';
import type { PolicyDto, PaymentWithCommissionDto } from '@/types/api';

interface AddPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentAdded?: () => void;
}

const AddPaymentModal = ({ open, onOpenChange, onPaymentAdded }: AddPaymentModalProps) => {
  const { user } = useSession();
  const { toast } = useToast();
  
  const isManager = user?.role === 'Manager';
  
  const [policies, setPolicies] = useState<PolicyDto[]>([]);
  const [paymentForm, setPaymentForm] = useState({
    date: new Date().toISOString().split('T')[0],
    productId: '',
    provider: '',
    ape: '',
    receipts: '',
    advisor: user?.role === 'Advisor' ? user.email : '',
    notes: ''
  });

  const [commissionPreview, setCommissionPreview] = useState<PaymentWithCommissionDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const advisors = [
    { email: 'sarah.johnson@event-horizon.test', name: 'Sarah Johnson', displayName: 'Sarah Johnson — sarah.johnson@event-horizon.test' },
    { email: 'michael.carter@event-horizon.test', name: 'Michael Carter', displayName: 'Michael Carter — michael.carter@event-horizon.test' }
  ];

  const providers = [
    'Royal London',
    'MetLife', 
    'Guardian',
    'Aviva',
    'Aegon'
  ];

  // Load policies on mount
  useEffect(() => {
    const loadPolicies = async () => {
      try {
        const data = await getPolicies();
        setPolicies(data);
      } catch (error) {
        console.error('Failed to load policies:', error);
        toast({
          title: 'Error',
          description: 'Failed to load product policies',
          variant: 'destructive'
        });
      }
    };
    
    if (open) {
      loadPolicies();
    }
  }, [open, toast]);

  // Calculate commission preview when inputs change
  useEffect(() => {
    const calculatePreview = async () => {
      if (paymentForm.productId && (paymentForm.ape || paymentForm.receipts)) {
        try {
          const previewPayload = {
            date: paymentForm.date,
            productId: paymentForm.productId,
            provider: paymentForm.provider || 'Preview',
            ape: parseFloat(paymentForm.ape) || 0,
            receipts: parseFloat(paymentForm.receipts) || 0,
            notes: paymentForm.notes,
            advisorEmail: paymentForm.advisor || user?.email || ''
          };
          
          // For preview, we'll simulate the commission calculation
          // In a real scenario, the backend might have a preview endpoint
          const policy = policies.find(p => p.id === paymentForm.productId);
          if (policy) {
            const ape = previewPayload.ape;
            const receipts = previewPayload.receipts;
            const threshold = ape * policy.thresholdMultiplier;
            
            const methodUsed = receipts <= threshold ? 'APE' : 'Receipts';
            const commissionBase = methodUsed === 'APE' 
              ? ape * (policy.productRatePct / 100)
              : receipts * (policy.productRatePct / 100);
            
            const poolAmount = commissionBase * (1 - policy.marginPct / 100);
            
            const commissionResult = {
              methodUsed: methodUsed as 'APE' | 'Receipts',
              productRatePct: policy.productRatePct,
              marginPct: policy.marginPct,
              commissionBase,
              poolAmount,
              advisorShare: poolAmount * policy.splitAdvisor,
              introducerShare: poolAmount * policy.splitIntroducer,
              managerShare: poolAmount * policy.splitManager,
              execSalesManagerShare: poolAmount * policy.splitExec
            };
            
            setCommissionPreview({ commissionResult });
          }
        } catch (error) {
          console.error('Preview calculation error:', error);
        }
      } else {
        setCommissionPreview(null);
      }
    };
    
    calculatePreview();
  }, [paymentForm.productId, paymentForm.ape, paymentForm.receipts, policies, paymentForm.advisor, paymentForm.date, paymentForm.provider, paymentForm.notes, user?.email]);

  const handleSubmit = async () => {
    // Validation
    if (!paymentForm.productId || !paymentForm.provider || (!paymentForm.ape && !paymentForm.receipts)) {
      toast({ 
        title: "Validation Error", 
        description: "Please fill in product, provider, and at least one of APE or Receipts.", 
        variant: "destructive" 
      });
      return;
    }

    if (parseFloat(paymentForm.ape) < 0 || parseFloat(paymentForm.receipts) < 0) {
      toast({ 
        title: "Validation Error", 
        description: "APE and Receipts must be >= 0.", 
        variant: "destructive" 
      });
      return;
    }

    if (isManager && !paymentForm.advisor) {
      toast({ 
        title: "Validation Error", 
        description: "Please select an advisor.", 
        variant: "destructive" 
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        date: paymentForm.date,
        productId: paymentForm.productId,
        provider: paymentForm.provider,
        ape: parseFloat(paymentForm.ape) || 0,
        receipts: parseFloat(paymentForm.receipts) || 0,
        notes: paymentForm.notes,
        advisorEmail: paymentForm.advisor || user?.email || ''
      };

      const result = await addPayment(payload);

      toast({ 
        title: "Success", 
        description: `Payment added successfully. Commission: £${result.commissionResult.poolAmount.toFixed(2)}` 
      });

      // Reset form
      setPaymentForm({
        date: new Date().toISOString().split('T')[0],
        productId: '',
        provider: '',
        ape: '',
        receipts: '',
        advisor: user?.role === 'Advisor' ? user?.email || '' : '',
        notes: ''
      });

      onPaymentAdded?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Payment submission error:', error);
      toast({
        title: 'Error',
        description: 'Failed to add payment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalHeader>
        <ModalTitle>Add Payment</ModalTitle>
        <ModalDescription>
          Create a new commission payment record with automatic calculation
        </ModalDescription>
      </ModalHeader>
      <ModalContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Form */}
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={paymentForm.date}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="product">Product *</Label>
              <Select 
                value={paymentForm.productId} 
                onValueChange={(value) => setPaymentForm(prev => ({ ...prev, productId: value }))}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent className="z-[200] bg-white border shadow-lg">
                  {policies.map((policy) => (
                    <SelectItem key={policy.id} value={policy.id}>
                      {policy.productName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="provider">Provider *</Label>
              <Select 
                value={paymentForm.provider} 
                onValueChange={(value) => setPaymentForm(prev => ({ ...prev, provider: value }))}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent className="z-[200] bg-white border shadow-lg">
                  {providers.map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      {provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="ape">APE (£)</Label>
                <Input
                  id="ape"
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentForm.ape}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, ape: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="receipts">Receipts (£)</Label>
                <Input
                  id="receipts"
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentForm.receipts}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, receipts: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            {isManager && (
              <div className="grid gap-2">
                <Label htmlFor="advisor">Advisor *</Label>
                <Select 
                  value={paymentForm.advisor} 
                  onValueChange={(value) => setPaymentForm(prev => ({ ...prev, advisor: value }))}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select advisor" />
                  </SelectTrigger>
                  <SelectContent className="z-[200] bg-white border shadow-lg">
                    {advisors.map((advisor) => (
                      <SelectItem key={advisor.email} value={advisor.email}>
                        {advisor.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
          </div>

          {/* Commission Preview */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Commission Preview</CardTitle>
                <CardDescription>
                  Live calculation based on current inputs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {commissionPreview ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Method Used:</span>
                        <div className="font-medium">
                          <Badge variant={commissionPreview.commissionResult.methodUsed === 'APE' ? 'default' : 'secondary'}>
                            {commissionPreview.commissionResult.methodUsed}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Product Rate:</span>
                        <div className="font-medium">{commissionPreview.commissionResult.productRatePct}%</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Margin:</span>
                        <div className="font-medium">{commissionPreview.commissionResult.marginPct}%</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Commission Base:</span>
                        <div className="font-medium">£{commissionPreview.commissionResult.commissionBase.toFixed(2)}</div>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium">Pool Amount:</span>
                        <span className="text-lg font-bold">£{commissionPreview.commissionResult.poolAmount.toFixed(2)}</span>
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>Advisor</TableCell>
                            <TableCell className="text-right font-medium">
                              £{commissionPreview.commissionResult.advisorShare.toFixed(2)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Introducer</TableCell>
                            <TableCell className="text-right">
                              £{commissionPreview.commissionResult.introducerShare.toFixed(2)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Manager</TableCell>
                            <TableCell className="text-right">
                              £{commissionPreview.commissionResult.managerShare.toFixed(2)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Exec Sales Manager</TableCell>
                            <TableCell className="text-right">
                              £{commissionPreview.commissionResult.execSalesManagerShare.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <p>Enter product and payment details to see commission calculation</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </ModalContent>
      <ModalFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add Payment'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddPaymentModal;