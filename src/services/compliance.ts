import { api } from "@/lib/api";

export interface ComplianceDocument {
  id: string;
  title: string;
  owner: string;
  category: string;
  status: "Draft" | "Review" | "Approved" | "Rejected";
  updatedAt: string;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export async function getComplianceDocuments(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
}): Promise<Paginated<ComplianceDocument>> {
  const { data } = await api.get("/compliance", { params });
  return data;
}

export async function createComplianceDocument(payload: {
  title: string;
  category: string;
  owner?: string;
}): Promise<ComplianceDocument> {
  const { data } = await api.post("/compliance", payload);
  return data;
}

export async function updateComplianceDocument(
  id: string,
  payload: Partial<ComplianceDocument>
): Promise<ComplianceDocument> {
  const { data } = await api.put(`/compliance/${id}`, payload);
  return data;
}

export async function deleteComplianceDocument(id: string): Promise<void> {
  await api.delete(`/compliance/${id}`);
}