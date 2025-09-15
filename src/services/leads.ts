import { api } from "@/lib/api";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: "New" | "Qualified" | "Contacted" | "Converted" | "Lost";
  assignee?: string;
  assigneeName?: string;
  priority: "Low" | "Medium" | "High";
  estimatedValue: number;
  notes: string;
  createdAt: string;
}

export interface CreateLeadPayload {
  name: string;
  email: string;
  phone: string;
  source: string;
  priority: "Low" | "Medium" | "High";
  estimatedValue: number;
  notes?: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export async function getLeads(params?: {
  status?: string;
  assignee?: string;
  page?: number;
  pageSize?: number;
}): Promise<Paginated<Lead>> {
  const { data } = await api.get("/leads", { params });
  return data;
}

export async function createLead(payload: CreateLeadPayload): Promise<Lead> {
  const { data } = await api.post("/leads", payload);
  return data;
}

export async function updateLead(id: string, payload: Partial<Lead>): Promise<Lead> {
  const { data } = await api.put(`/leads/${id}`, payload);
  return data;
}

export async function assignLead(
  id: string,
  assignee: string,
  assigneeName: string
): Promise<Lead> {
  const { data } = await api.patch(`/leads/${id}/assign`, { assignee, assigneeName });
  return data;
}

export async function updateLeadStatus(
  id: string,
  status: Lead['status']
): Promise<Lead> {
  const { data } = await api.patch(`/leads/${id}/status`, { status });
  return data;
}

export async function deleteLead(id: string): Promise<void> {
  await api.delete(`/leads/${id}`);
}