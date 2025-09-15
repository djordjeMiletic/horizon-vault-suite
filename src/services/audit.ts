import { api } from "@/lib/api";

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  action: string;
  entity: {
    type: string;
    id: string;
    name: string;
  };
  details: string;
  metadata?: Record<string, any>;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export async function getAuditEntries(params?: {
  actorId?: string;
  entityType?: string;
  action?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<Paginated<AuditEntry>> {
  const { data } = await api.get("/audit", { params });
  return data;
}

export async function getAuditEntry(id: string): Promise<AuditEntry> {
  const { data } = await api.get(`/audit/${id}`);
  return data;
}