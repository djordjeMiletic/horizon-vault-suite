export interface Payment {
  id: string;
  productId: string;
  provider: string;
  date: string;
  ape: number;
  receipts: number;
  status: 'Paid' | 'Pending' | 'Processing';
  advisorId?: string;
  policyNumber: string;
  clientId: string;
}

export interface Policy {
  productId: string;
  productRatePct: number;
  marginPct: number;
  thresholdMultiplier: number;
  split: {
    Advisor: number;
    Introducer: number;
    Manager: number;
    ExecSalesManager: number;
  };
}

export interface CommissionResult {
  methodUsed: 'APE' | 'Receipts';
  commissionBase: number;
  poolAmount: number;
  split: {
    Advisor: number;
    Introducer: number;
    Manager: number;
    ExecSalesManager: number;
  };
}

export function computeBase(payment: Payment, policy: Policy): { methodUsed: 'APE' | 'Receipts'; commissionBase: number } {
  const threshold = payment.ape * policy.thresholdMultiplier;
  
  if (payment.receipts <= threshold) {
    return {
      methodUsed: 'APE',
      commissionBase: payment.ape * (policy.productRatePct / 100)
    };
  } else {
    return {
      methodUsed: 'Receipts', 
      commissionBase: payment.receipts * (policy.productRatePct / 100)
    };
  }
}

export function applyMargin(base: number, marginPct: number): number {
  return base * (1 - marginPct / 100);
}

export function splitPool(pool: number, split: Policy['split']): Policy['split'] {
  return {
    Advisor: pool * split.Advisor,
    Introducer: pool * split.Introducer,
    Manager: pool * split.Manager,
    ExecSalesManager: pool * split.ExecSalesManager
  };
}

export function computeCommission(payment: Payment, policy: Policy): CommissionResult {
  const { methodUsed, commissionBase } = computeBase(payment, policy);
  const poolAmount = applyMargin(commissionBase, policy.marginPct);
  const split = splitPool(poolAmount, policy.split);
  
  return {
    methodUsed,
    commissionBase,
    poolAmount,
    split
  };
}

// Role-based access helper
export function canExportCSV(role: string): boolean {
  return ['advisor', 'manager', 'admin'].includes(role?.toLowerCase());
}

// Action normalizer for audit logs
export function normalizeAction(action: string): string {
  return action
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}