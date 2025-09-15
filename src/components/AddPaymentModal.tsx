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
import { useAuth } from '@/lib/auth';
import { useAuditStore } from '@/lib/auditStore';
import { computeCommission, getProductName, type Payment, type Policy } from '@/lib/commission';
import { usePaymentDataStore } from '@/lib/stores';

import policiesData from '@/mocks/seed/policies.json';

interface AddPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentAdded?: () => void;
}

const AddPaymentModal = ({ open, onOpenChange, onPaymentAdded }: AddPaymentModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { payments, setPayments } = usePaymentDataStore();
  const { addAuditEntry } = useAuditStore();
  
  const isManager = user?.role === 'manager';
  
  const [paymentForm, setPaymentForm] = useState({
    date: new Date().toISOString().split('T')[0],
    productId: '',
    provider: '',
    ape: '',
    receipts: '',
    advisor: user?.role === 'advisor' ? user.email : '',
    notes: ''
  });

  const [commissionPreview, setCommissionPreview] = useState<any>(null);

  const advisors = [
    { email: 'advisor@advisor.com', name: 'Sarah Johnson', displayName: 'Sarah Johnson — sarah.johnson@event-horizon.test' },
    { email: 'advisor2@advisor.com', name: 'Michael Carter', displayName: 'Michael Carter — michael.carter@event-horizon.test' }
  ];

  const providers = [
    'Royal London',
    'MetLife', 
    'Guardian',
    'Aviva',
    'Aegon'
  ];

  // Calculate commission preview when inputs change
  useEffect(() => {
    if (paymentForm.productId && (paymentForm.ape || paymentForm.receipts)) {
      const policy = (policiesData as Policy[]).find(p => p.productId === paymentForm.productId);
      if (policy) {
        const payment: Payment = {
          id: 'preview',
          productId: paymentForm.productId,
          provider: paymentForm.provider,
          date: paymentForm.date,
          ape: parseFloat(paymentForm.ape) || 0,
          receipts: parseFloat(paymentForm.receipts) || 0,
          status: 'Pending'
        };
        
        const result = computeCommission(payment, policy);
        setCommissionPreview(result);
      }
    } else {
      setCommissionPreview(null);
    }
  }, [paymentForm.productId, paymentForm.ape, paymentForm.receipts]);

  const handleSubmit = () => {
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

    // Create new payment
    const newPayment = {
      id: `P-${Date.now()}`,
      date: paymentForm.date,
      advisorEmail: paymentForm.advisor || user?.email || '',
      productId: paymentForm.productId,
      provider: paymentForm.provider,
      ape: parseFloat(paymentForm.ape) || 0,
      receipts: parseFloat(paymentForm.receipts) || 0,
      status: 'Pending',
      notes: paymentForm.notes
    };

    // Add to store
    setPayments([...payments, newPayment]);

    // Add audit entry
    const policy = (policiesData as Policy[]).find(p => p.productId === paymentForm.productId);
    if (policy) {
      const commissionResult = computeCommission(newPayment as Payment, policy);
      
      addAuditEntry({
        actor: {
          id: user?.id || '',
          name: user?.name || '',
          email: user?.email || '',
          role: user?.role || ''
        },
        action: 'Payment Created',
        entity: {
          type: 'payment',
          id: newPayment.id,
          name: `Payment - ${getProductName(paymentForm.productId)}`
        },
        details: `Created commission payment of £${commissionResult.poolAmount.toFixed(2)} for ${getProductName(paymentForm.productId)}`,
        metadata: {
          methodUsed: commissionResult.methodUsed,
          commissionBase: commissionResult.commissionBase,
          marginPct: commissionResult.marginPct,
          poolAmount: commissionResult.poolAmount,
          ape: newPayment.ape,
          receipts: newPayment.receipts,
          productId: newPayment.productId,
          provider: newPayment.provider
        }
      });
    }

    toast({ 
      title: "Success", 
      description: "Payment added successfully." 
    });

    // Reset form
    setPaymentForm({
      date: new Date().toISOString().split('T')[0],
      productId: '',
      provider: '',
      ape: '',
      receipts: '',
      advisor: user?.role === 'advisor' ? user?.email || '' : '',
      notes: ''
    });

    onPaymentAdded?.();
    onOpenChange(false);
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
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {(policiesData as Policy[]).map((policy) => (
                    <SelectItem key={policy.productId} value={policy.productId}>
                      {getProductName(policy.productId)}
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
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
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
                  <SelectTrigger>
                    <SelectValue placeholder="Select advisor" />
                  </SelectTrigger>
                  <SelectContent>
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
                          <Badge variant={commissionPreview.methodUsed === 'APE' ? 'default' : 'secondary'}>
                            {commissionPreview.methodUsed}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Product Rate:</span>
                        <div className="font-medium">{commissionPreview.productRatePct}%</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Margin:</span>
                        <div className="font-medium">{commissionPreview.marginPct}%</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Commission Base:</span>
                        <div className="font-medium">£{commissionPreview.commissionBase.toFixed(2)}</div>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium">Pool Amount:</span>
                        <span className="text-lg font-bold">£{commissionPreview.poolAmount.toFixed(2)}</span>
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
                              £{commissionPreview.split.Advisor.toFixed(2)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Introducer</TableCell>
                            <TableCell className="text-right">
                              £{commissionPreview.split.Introducer.toFixed(2)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Manager</TableCell>
                            <TableCell className="text-right">
                              £{commissionPreview.split.Manager.toFixed(2)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Exec Sales Manager</TableCell>
                            <TableCell className="text-right">
                              £{commissionPreview.split.ExecSalesManager.toFixed(2)}
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
        <Button onClick={handleSubmit}>
          Add Payment
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddPaymentModal;