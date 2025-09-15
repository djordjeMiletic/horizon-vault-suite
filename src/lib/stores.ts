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
  synced?: boolean;
}

// HR Interfaces
interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  description: string;
  requirements: string[];
  status: 'Open' | 'Closed';
  postedAt: string;
  createdBy: string;
  applicantCount: number;
}

interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  appliedFor: string;
  jobTitle: string;
  status: 'New' | 'Screening' | 'Interview' | 'Offer' | 'Rejected';
  appliedAt: string;
  cv: string;
  notes: string;
  timeline: Array<{
    id: string;
    at: string;
    action: string;
    by: string;
    details: string;
  }>;
}

interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  interviewerId: string;
  interviewerName: string;
  scheduledAt: string;
  duration: number;
  type: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  location: string;
  notes: string;
  interviewQuestions: string[];
  feedback?: string;
}

interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  category: 'HR Documentation' | 'Regulatory' | 'Training' | 'IT Setup' | 'Orientation';
  status: 'Pending' | 'In Progress' | 'Completed';
  assignedTo?: string;
  completedAt?: string;
  completedBy?: string;
  dueDate: string;
}

interface OnboardingRecord {
  id: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  startDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  progress: number;
  assignedHR: string;
  tasks: OnboardingTask[];
  notes: string;
  createdAt: string;
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
  updateDocument: (document: ClientDocument) => void;
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

// HR Store interfaces
interface JobStore {
  jobs: Job[];
  addJob: (job: Omit<Job, 'id' | 'postedAt' | 'applicantCount'>) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  toggleJobStatus: (id: string) => void;
}

interface ApplicantStore {
  applicants: Applicant[];
  addApplicant: (applicant: Omit<Applicant, 'id' | 'appliedAt' | 'timeline'>) => void;
  updateApplicant: (id: string, updates: Partial<Applicant>) => void;
  addTimelineEntry: (applicantId: string, entry: Omit<Applicant['timeline'][0], 'id'>) => void;
}

interface InterviewStore {
  interviews: Interview[];
  addInterview: (interview: Omit<Interview, 'id'>) => void;
  updateInterview: (id: string, updates: Partial<Interview>) => void;
}

interface OnboardingStore {
  onboarding: OnboardingRecord[];
  addOnboarding: (record: Omit<OnboardingRecord, 'id' | 'createdAt' | 'progress'>) => void;
  updateOnboarding: (id: string, updates: Partial<OnboardingRecord>) => void;
  updateTask: (recordId: string, taskId: string, updates: Partial<OnboardingTask>) => void;
  completeTask: (recordId: string, taskId: string, completedBy: string) => void;
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
  updateDocument: (document) =>
    set((state) => ({
      documents: state.documents.map((d) => (d.id === document.id ? document : d)),
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

// HR Store implementations
export const useJobStore = create<JobStore>((set) => ({
  jobs: [],
  addJob: (job) =>
    set((state) => ({
      jobs: [
        ...state.jobs,
        {
          ...job,
          id: `JOB-${Date.now()}`,
          postedAt: new Date().toISOString(),
          applicantCount: 0,
        },
      ],
    })),
  updateJob: (id, updates) =>
    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === id ? { ...j, ...updates } : j
      ),
    })),
  toggleJobStatus: (id) =>
    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === id ? { ...j, status: j.status === 'Open' ? 'Closed' : 'Open' } : j
      ),
    })),
}));

export const useApplicantStore = create<ApplicantStore>((set) => ({
  applicants: [],
  addApplicant: (applicant) =>
    set((state) => ({
      applicants: [
        ...state.applicants,
        {
          ...applicant,
          id: `APP-${Date.now()}`,
          appliedAt: new Date().toISOString(),
          timeline: [{
            id: `TL-${Date.now()}`,
            at: new Date().toISOString(),
            action: 'Application Received',
            by: 'System',
            details: 'Application submitted via website'
          }]
        },
      ],
    })),
  updateApplicant: (id, updates) =>
    set((state) => ({
      applicants: state.applicants.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    })),
  addTimelineEntry: (applicantId, entry) =>
    set((state) => ({
      applicants: state.applicants.map((a) =>
        a.id === applicantId
          ? {
              ...a,
              timeline: [...a.timeline, { ...entry, id: `TL-${Date.now()}` }]
            }
          : a
      ),
    })),
}));

export const useInterviewStore = create<InterviewStore>((set) => ({
  interviews: [],
  addInterview: (interview) =>
    set((state) => ({
      interviews: [
        ...state.interviews,
        {
          ...interview,
          id: `INT-${Date.now()}`,
        },
      ],
    })),
  updateInterview: (id, updates) =>
    set((state) => ({
      interviews: state.interviews.map((i) =>
        i.id === id ? { ...i, ...updates } : i
      ),
    })),
}));

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  onboarding: [],
  addOnboarding: (record) =>
    set((state) => ({
      onboarding: [
        ...state.onboarding,
        {
          ...record,
          id: `ONB-${Date.now()}`,
          createdAt: new Date().toISOString(),
          progress: Math.round((record.tasks.filter(t => t.status === 'Completed').length / record.tasks.length) * 100),
        },
      ],
    })),
  updateOnboarding: (id, updates) =>
    set((state) => ({
      onboarding: state.onboarding.map((o) =>
        o.id === id ? { ...o, ...updates } : o
      ),
    })),
  updateTask: (recordId, taskId, updates) =>
    set((state) => ({
      onboarding: state.onboarding.map((o) =>
        o.id === recordId
          ? {
              ...o,
              tasks: o.tasks.map((t) =>
                t.id === taskId ? { ...t, ...updates } : t
              ),
              progress: Math.round(
                (o.tasks.filter(t => t.id === taskId ? updates.status === 'Completed' : t.status === 'Completed').length / o.tasks.length) * 100
              ),
            }
          : o
      ),
    })),
  completeTask: (recordId, taskId, completedBy) =>
    set((state) => ({
      onboarding: state.onboarding.map((o) =>
        o.id === recordId
          ? {
              ...o,
              tasks: o.tasks.map((t) =>
                t.id === taskId
                  ? {
                      ...t,
                      status: 'Completed' as const,
                      completedAt: new Date().toISOString(),
                      completedBy,
                    }
                  : t
              ),
              progress: Math.round(
                (o.tasks.filter(t => t.id === taskId || t.status === 'Completed').length / o.tasks.length) * 100
              ),
            }
          : o
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

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  addProduct: (product) =>
    set((state) => ({
      products: [
        ...state.products,
        {
          ...product,
          id: `prod-${Date.now()}`,
          active: true,
        },
      ],
    })),
  updateProduct: (product) =>
    set((state) => ({
      products: state.products.map((p) => (p.id === product.id ? product : p)),
    })),
  toggleActive: (id) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, active: !p.active } : p
      ),
    })),
}));

export const useCommissionStore = create<CommissionStore>((set) => ({
  commissions: [],
  addCommission: (commission) =>
    set((state) => ({
      commissions: [
        ...state.commissions,
        {
          ...commission,
          id: `comm-${Date.now()}`,
        },
      ],
    })),
  updateCommission: (commission) =>
    set((state) => ({
      commissions: state.commissions.map((c) =>
        c.id === commission.id ? commission : c
      ),
    })),
}));

// Missing interfaces for new stores
export interface ProductStore {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  toggleActive: (id: string) => void;
}

export interface CommissionStore {
  commissions: Commission[];
  addCommission: (commission: Omit<Commission, 'id'>) => void;
  updateCommission: (commission: Commission) => void;
}

export interface Product {
  id: string;
  name: string;
  provider: string;
  type: string;
  commissionRate: number;
  margin: number;
  description: string;
  features: string[];
  commissionExample: {
    ape: number;
    rate: string;
    commission: number;
    note: string;
  };
  bands: Array<{
    threshold: number;
    rateAdjustment: number;
  }>;
  active?: boolean;
}

export interface Commission {
  id: string;
  advisorId: string;
  productId: string;
  clientId: string;
  policyNumber: string;
  ape: number;
  actualReceipts: number;
  paymentType: string;
  commissionAmount: number;
  paymentDate: string;
  status: string;
  month: string;
  distributionRoles: {
    advisor: number;
    introducer: number;
    manager: number;
    executiveSalesManager: number;
  };
}