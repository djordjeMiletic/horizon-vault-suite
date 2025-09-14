import { create } from 'zustand';

// Types
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

// Stores
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

// Additional interfaces for Admin and Client portals
interface ComplianceDocument {
  id: string;
  title: string;
  owner: string;
  ownerId: string;
  status: 'Draft' | 'Review' | 'Approved' | 'Rejected';
  category: string;
  description: string;
  updatedAt: string;
  createdAt: string;
  history: Array<{
    id: string;
    at: string;
    by: string;
    action: string;
    comment: string;
  }>;
}

interface PaymentCycle {
  id: string;
  cycle: string;
  status: 'Processing' | 'Completed' | 'Draft';
  totals: {
    payments: number;
    approved: number;
    pending: number;
    rejected: number;
    exceptions: number;
  };
  updatedAt: string;
  createdAt: string;
  items: Array<{
    id: string;
    date: string;
    provider: string;
    product: string;
    type: 'APE' | 'Receipts';
    amount: number;
    methodUsed: string;
    commission: number;
    status: 'Approved' | 'Pending' | 'Rejected' | 'Exception';
    policyNumber: string;
    advisor: string;
    exceptionReason?: string;
  }>;
}

interface Lead {
  id: string;
  createdAt: string;
  source: string;
  name: string;
  email: string;
  phone: string;
  status: 'New' | 'Qualified' | 'Contacted';
  assignee: string | null;
  assigneeName: string | null;
  priority: 'Low' | 'Medium' | 'High';
  estimatedValue: number;
  notes: string;
  history: Array<{
    id: string;
    at: string;
    by: string;
    action: string;
    details: string;
  }>;
}

interface Case {
  id: string;
  product: string;
  productId: string;
  status: 'New' | 'Processing' | 'Approved' | 'Rejected';
  advisor: string;
  advisorId: string;
  clientId: string;
  clientName: string;
  policyNumber: string | null;
  applicationDate: string;
  updatedAt: string;
  coverageAmount: number;
  premium: number;
  timeline: Array<{
    id: string;
    at: string;
    event: string;
    details: string;
    by: string;
  }>;
}

interface ClientDocument {
  id: string;
  caseId: string;
  name: string;
  version: number;
  uploadedAt: string;
  uploadedBy: string;
  uploadedById: string;
  sizeKb: number;
  type: string;
  status: 'Pending' | 'Processed' | 'Superseded';
}

interface MessageThread {
  threadId: string;
  caseId: string | null;
  subject: string;
  participants: string[];
  participantNames: string[];
  lastActivity: string;
  unreadCount: number;
  messages: Array<{
    id: string;
    at: string;
    from: string;
    fromName: string;
    text: string;
    read: boolean;
  }>;
}

interface Appointment {
  id: string;
  type: 'Virtual' | 'Office' | 'Phone';
  with: string;
  withId: string;
  clientId: string;
  clientName: string;
  date: string;
  duration: number;
  status: 'Requested' | 'Scheduled' | 'Completed' | 'Cancelled';
  notes: string;
  meetingLink?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

// Store interfaces
interface ComplianceStore {
  documents: ComplianceDocument[];
  updateDocument: (document: ComplianceDocument) => void;
  addDocument: (document: Omit<ComplianceDocument, 'id' | 'createdAt' | 'updatedAt' | 'history'>) => void;
  addHistoryEntry: (documentId: string, entry: Omit<ComplianceDocument['history'][0], 'id'>) => void;
}

interface PaymentCycleStore {
  cycles: PaymentCycle[];
  updateCycle: (cycle: PaymentCycle) => void;
  addCycle: (cycle: Omit<PaymentCycle, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePaymentItem: (cycleId: string, itemId: string, updates: Partial<PaymentCycle['items'][0]>) => void;
}

interface LeadStore {
  leads: Lead[];
  updateLead: (lead: Lead) => void;
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'history'>) => void;
  addLeadHistory: (leadId: string, entry: Omit<Lead['history'][0], 'id'>) => void;
}

interface CaseStore {
  cases: Case[];
  updateCase: (caseItem: Case) => void;
  addCase: (caseItem: Omit<Case, 'id' | 'updatedAt'>) => void;
  addTimelineEntry: (caseId: string, entry: Omit<Case['timeline'][0], 'id'>) => void;
}

interface ClientDocumentStore {
  documents: ClientDocument[];
  addDocument: (document: Omit<ClientDocument, 'id' | 'uploadedAt'>) => void;
  updateDocument: (id: string, updates: Partial<ClientDocument>) => void;
}

interface MessageStore {
  threads: MessageThread[];
  addThread: (thread: MessageThread) => void;
  updateThread: (threadId: string, updates: Partial<MessageThread>) => void;
  addMessage: (threadId: string, message: Omit<MessageThread['messages'][0], 'id'>) => void;
  markAsRead: (threadId: string) => void;
}

interface AppointmentStore {
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
}

// Store implementations
export const useComplianceStore = create<ComplianceStore>((set) => ({
  documents: [],
  updateDocument: (document) =>
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === document.id ? { ...document, updatedAt: new Date().toISOString() } : d
      ),
    })),
  addDocument: (document) =>
    set((state) => ({
      documents: [
        ...state.documents,
        {
          ...document,
          id: `CMP-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          history: [{
            id: `h-${Date.now()}`,
            at: new Date().toISOString(),
            by: document.owner,
            action: 'Created',
            comment: 'Document created'
          }]
        },
      ],
    })),
  addHistoryEntry: (documentId, entry) =>
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === documentId
          ? {
              ...d,
              history: [...d.history, { ...entry, id: `h-${Date.now()}` }],
              updatedAt: new Date().toISOString()
            }
          : d
      ),
    })),
}));

export const usePaymentCycleStore = create<PaymentCycleStore>((set) => ({
  cycles: [],
  updateCycle: (cycle) =>
    set((state) => ({
      cycles: state.cycles.map((c) =>
        c.id === cycle.id ? { ...cycle, updatedAt: new Date().toISOString() } : c
      ),
    })),
  addCycle: (cycle) =>
    set((state) => ({
      cycles: [
        ...state.cycles,
        {
          ...cycle,
          id: `cycle-${cycle.cycle}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })),
  updatePaymentItem: (cycleId, itemId, updates) =>
    set((state) => ({
      cycles: state.cycles.map((c) =>
        c.id === cycleId
          ? {
              ...c,
              items: c.items.map((item) =>
                item.id === itemId ? { ...item, ...updates } : item
              ),
              updatedAt: new Date().toISOString()
            }
          : c
      ),
    })),
}));

export const useLeadStore = create<LeadStore>((set) => ({
  leads: [],
  updateLead: (lead) =>
    set((state) => ({
      leads: state.leads.map((l) => (l.id === lead.id ? lead : l)),
    })),
  addLead: (lead) =>
    set((state) => ({
      leads: [
        ...state.leads,
        {
          ...lead,
          id: `L-${Date.now()}`,
          createdAt: new Date().toISOString(),
          history: [{
            id: `h-${Date.now()}`,
            at: new Date().toISOString(),
            by: 'System',
            action: 'Lead Created',
            details: 'New lead created'
          }]
        },
      ],
    })),
  addLeadHistory: (leadId, entry) =>
    set((state) => ({
      leads: state.leads.map((l) =>
        l.id === leadId
          ? {
              ...l,
              history: [...l.history, { ...entry, id: `h-${Date.now()}` }]
            }
          : l
      ),
    })),
}));

export const useCaseStore = create<CaseStore>((set) => ({
  cases: [],
  updateCase: (caseItem) =>
    set((state) => ({
      cases: state.cases.map((c) =>
        c.id === caseItem.id ? { ...caseItem, updatedAt: new Date().toISOString() } : c
      ),
    })),
  addCase: (caseItem) =>
    set((state) => ({
      cases: [
        ...state.cases,
        {
          ...caseItem,
          id: `C-${Date.now()}`,
          updatedAt: new Date().toISOString(),
        },
      ],
    })),
  addTimelineEntry: (caseId, entry) =>
    set((state) => ({
      cases: state.cases.map((c) =>
        c.id === caseId
          ? {
              ...c,
              timeline: [...c.timeline, { ...entry, id: `t-${Date.now()}` }],
              updatedAt: new Date().toISOString()
            }
          : c
      ),
    })),
}));

export const useClientDocumentStore = create<ClientDocumentStore>((set) => ({
  documents: [],
  addDocument: (document) =>
    set((state) => ({
      documents: [
        ...state.documents,
        {
          ...document,
          id: `DOC-${Date.now()}`,
          uploadedAt: new Date().toISOString(),
        },
      ],
    })),
  updateDocument: (id, updates) =>
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
    })),
}));

export const useMessageStore = create<MessageStore>((set) => ({
  threads: [],
  addThread: (thread) =>
    set((state) => ({
      threads: [...state.threads, thread],
    })),
  updateThread: (threadId, updates) =>
    set((state) => ({
      threads: state.threads.map((t) =>
        t.threadId === threadId ? { ...t, ...updates } : t
      ),
    })),
  addMessage: (threadId, message) =>
    set((state) => ({
      threads: state.threads.map((t) =>
        t.threadId === threadId
          ? {
              ...t,
              messages: [...t.messages, { ...message, id: `msg-${Date.now()}` }],
              lastActivity: new Date().toISOString(),
              unreadCount: message.from !== 'current-user' ? t.unreadCount + 1 : t.unreadCount
            }
          : t
      ),
    })),
  markAsRead: (threadId) =>
    set((state) => ({
      threads: state.threads.map((t) =>
        t.threadId === threadId
          ? {
              ...t,
              unreadCount: 0,
              messages: t.messages.map((m) => ({ ...m, read: true }))
            }
          : t
      ),
    })),
}));

export const useAppointmentStore = create<AppointmentStore>((set) => ({
  appointments: [],
  addAppointment: (appointment) =>
    set((state) => ({
      appointments: [
        ...state.appointments,
        {
          ...appointment,
          id: `A-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })),
  updateAppointment: (id, updates) =>
    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
      ),
    })),
}));

export const usePaymentStore = create<PaymentStore>((set) => ({
  payments: [],
  addPayment: (payment) =>
    set((state) => ({
      payments: [
        ...state.payments,
        {
          ...payment,
          id: `PAY-${Date.now()}`,
        },
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
          id: `TICKET-${Date.now()}`,
          created: new Date().toISOString(),
          status: 'open',
        },
      ],
    })),
  updateTicketStatus: (id, status) =>
    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === id ? { ...t, status } : t
      ),
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
          id: `NOTIF-${Date.now()}`,
          timestamp: new Date().toISOString(),
        },
      ],
    })),
}));

export const useGoalStore = create<GoalStore>((set) => ({
  goals: [],
  updateGoal: (goal) =>
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === goal.id ? goal : g
      ),
    })),
  addMilestone: (goalId, milestone) =>
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              milestones: [
                ...(g.milestones || []),
                {
                  ...milestone,
                  id: `MILESTONE-${Date.now()}`,
                },
              ],
            }
          : g
      ),
    })),
}));