import { create } from 'zustand';

// Keep only essential interfaces that are still needed for non-API functionality
interface Payment {
  id: string;
  policyNumber: string;
  amount: number;
  type: 'APE' | 'Receipts';
  date: string;
  product: string;
  status: 'pending' | 'approved' | 'paid';
}

interface Ticket {
  id: string;
  subject: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'closed';
  created: string;
  description?: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  uploaded: string;
  size: number;
}

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'normal' | 'high';
}

interface Goal {
  id: string;
  advisorId: string;
  month: string;
  target: number;
  achieved: number;
  progress: number;
  type: string;
  milestones?: Array<{
    id: string;
    note: string;
    date: string;
    completed: boolean;
  }>;
}

// Keep only essential stores that aren't replaced by API calls yet
interface PaymentStore {
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePaymentStatus: (id: string, status: Payment['status']) => void;
}

interface TicketStore {
  tickets: Ticket[];
  addTicket: (ticket: Omit<Ticket, 'id' | 'created' | 'status'>) => void;
  updateTicketStatus: (id: string, status: Ticket['status']) => void;
}

interface DocumentStore {
  documents: Document[];
  addDocument: (document: Omit<Document, 'id' | 'uploaded'>) => void;
}

interface NotificationStore {
  notifications: Notification[];
  markAsRead: (id: string) => void;
  markAllAsRead: (userId: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
}

interface GoalStore {
  goals: Goal[];
  updateGoal: (goal: Goal) => void;
  addMilestone: (goalId: string, milestone: Omit<Goal['milestones'][0], 'id'>) => void;
}

// Store implementations for remaining functionality
export const usePaymentStore = create<PaymentStore>((set) => ({
  payments: [],
  addPayment: (payment) =>
    set((state) => ({
      payments: [
        ...state.payments,
        { ...payment, id: `PAY-${Date.now()}` },
      ],
    })),
  updatePaymentStatus: (id, status) =>
    set((state) => ({
      payments: state.payments.map((p) =>
        p.id === id ? { ...p, status } : p
      ),
    })),
}));

export const useTicketStore = create<TicketStore>((set) => ({
  tickets: [],
  addTicket: (ticket) =>
    set((state) => ({
      tickets: [
        ...state.tickets,
        {
          ...ticket,
          id: `TKT-${Date.now()}`,
          created: new Date().toISOString(),
          status: 'open' as const,
        },
      ],
    })),
  updateTicketStatus: (id, status) =>
    set((state) => ({
      tickets: state.tickets.map((t) => (t.id === id ? { ...t, status } : t)),
    })),
}));

export const useDocumentStore = create<DocumentStore>((set) => ({
  documents: [],
  addDocument: (document) =>
    set((state) => ({
      documents: [
        ...state.documents,
        {
          ...document,
          id: `DOC-${Date.now()}`,
          uploaded: new Date().toISOString(),
        },
      ],
    })),
}));

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  markAllAsRead: (userId) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.userId === userId ? { ...n, read: true } : n
      ),
    })),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          ...notification,
          id: `NOT-${Date.now()}`,
          timestamp: new Date().toISOString(),
        },
      ],
    })),
}));

export const useGoalStore = create<GoalStore>((set) => ({
  goals: [],
  updateGoal: (goal) =>
    set((state) => ({
      goals: state.goals.map((g) => (g.id === goal.id ? goal : g)),
    })),
  addMilestone: (goalId, milestone) =>
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              milestones: [
                ...(g.milestones || []),
                { ...milestone, id: `MS-${Date.now()}` },
              ],
            }
          : g
      ),
    })),
}));
