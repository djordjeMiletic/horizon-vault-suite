export type Paginated<T> = { 
  items: T[]; 
  page: number; 
  pageSize: number; 
  totalCount: number; 
};

export type UserSession = { 
  email: string; 
  role: "Advisor" | "Manager" | "ReferralPartner" | "Administrator" | "Client"; 
  displayName?: string; 
};

export type PolicyDto = {
  id: string; 
  productCode: string; 
  productName: string;
  productRatePct: number; 
  marginPct: number; 
  thresholdMultiplier: number;
  splitAdvisor: number; 
  splitIntroducer: number; 
  splitManager: number; 
  splitExec: number;
};

export type PaymentDto = {
  id: string;
  date: string;                // ISO
  advisorEmail: string;
  productId: string;
  provider: string;
  ape: number;
  receipts: number;
  status: "Pending" | "Approved" | "Rejected";
  notes?: string;
};

export type CommissionResult = {
  methodUsed: "APE" | "Receipts";
  productRatePct: number;
  marginPct: number;
  commissionBase: number;
  poolAmount: number;
  advisorShare: number;
  introducerShare: number;
  managerShare: number;
  execSalesManagerShare: number;
};

export type PaymentWithCommissionDto = {
  payment?: PaymentDto;              // optional depending on backend
  commissionResult: CommissionResult;
};

export type CommissionDetailsRowDto = {
  id: string;
  date: string;
  provider: string;
  product: string;
  methodUsed: "APE" | "Receipts";
  productRatePct: number;
  marginPct: number;
  commissionBase: number;
  poolAmount: number;
  advisorShare: number;
  introducerShare: number;
  managerShare: number;
  execShare: number;                  // map from execSalesManagerShare if needed
  advisorEmail: string;
};

export type SeriesPoint = { month: string; value: number };
export type ProductMixItem = { product: string; amount: number };

export type GoalDto = {
  subjectType: "Advisor" | "Manager";
  subjectRef: string;                // email or "team"
  monthlyTarget: number;
  history: { month: string; achieved: number }[];
};

export type NotificationDto = {
  id: string;
  recipientEmail?: string | null;
  title: string;
  type: string;                      // e.g. "info"|"warning"|"success"
  createdAt: string;                 // ISO
  read: boolean;
};

export type TicketDto = {
  id: string;
  subject: string;
  fromEmail: string;
  status: "Open" | "Pending" | "Resolved" | "Closed";
  priority: "Low" | "Medium" | "High";
  updatedAt: string;
};

export type DocumentDto = {
  id: string; 
  ownerEmail: string; 
  caseId?: string | null;
  fileName: string; 
  originalName: string; 
  contentType: string; 
  sizeBytes: number;
  storagePath: string; 
  createdAt: string; 
  signedAt?: string | null; 
  tags?: string | null;
  downloadUrl: string;               // /files/{id}
};

export type SignatureRequestDto = {
  id: string; 
  documentId: string; 
  signerEmail: string;
  status: "Pending" | "Signed" | "Declined";
  createdAt: string; 
  completedAt?: string | null;
  signingUrl: string;                // /sign/{token}
};