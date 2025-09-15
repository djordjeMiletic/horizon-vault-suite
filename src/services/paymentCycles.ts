import { api } from '@/lib/api';

export interface PaymentCycleItem {
  id: string;
  advisorEmail: string;
  advisorName: string;
  policyNumber: string;
  amount: number;
  type: 'APE' | 'Receipts';
  product: string;
  provider: string;
  date: string;
  commission: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Exception';
  proposedStatus?: string;
  finalStatus?: string;
  notes?: string;
  exceptionReason?: string;
}

export interface PaymentCycle {
  id: string;
  cycle: string; // YYYY-MM format
  status: 'Draft' | 'Processing' | 'Review' | 'Completed' | 'Closed';
  totals: {
    payments: number;
    approved: number;
    pending: number;
    rejected: number;
    exceptions: number;
  };
  items: PaymentCycleItem[];
  createdAt: string;
  updatedAt: string;
}

export const paymentCyclesService = {
  async getCycles(): Promise<PaymentCycle[]> {
    return api.get('/payment-cycles');
  },

  async getCycle(id: string): Promise<PaymentCycle> {
    return api.get(`/payment-cycles/${id}`);
  },

  async createCycle(cycle: Omit<PaymentCycle, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentCycle> {
    return api.post('/payment-cycles', cycle);
  },

  async updateCycle(id: string, updates: Partial<PaymentCycle>): Promise<PaymentCycle> {
    return api.put(`/payment-cycles/${id}`, updates);
  },

  async updateItem(cycleId: string, itemId: string, updates: Partial<PaymentCycleItem>): Promise<PaymentCycleItem> {
    return api.put(`/payment-cycles/${cycleId}/items/${itemId}`, updates);
  },

  async closeCycle(id: string): Promise<PaymentCycle> {
    return api.put(`/payment-cycles/${id}/close`);
  }
};