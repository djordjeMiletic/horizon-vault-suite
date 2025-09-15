import { api } from "@/lib/api";

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: "New" | "Contacted" | "Qualified" | "Closed";
  createdAt: string;
  assignedTo?: string;
  notes?: string;
}

export interface CreateInquiryPayload {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export async function getInquiries(params?: {
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<Paginated<Inquiry>> {
  const { data } = await api.get("/inquiries", { params });
  return data;
}

export async function createInquiry(payload: CreateInquiryPayload): Promise<Inquiry> {
  const { data } = await api.post("/inquiries", payload);
  return data;
}

export async function updateInquiry(
  id: string,
  payload: Partial<Inquiry>
): Promise<Inquiry> {
  const { data } = await api.put(`/inquiries/${id}`, payload);
  return data;
}

export async function updateInquiryStatus(
  id: string,
  status: Inquiry['status']
): Promise<Inquiry> {
  const { data } = await api.patch(`/inquiries/${id}/status`, { status });
  return data;
}

export async function deleteInquiry(id: string): Promise<void> {
  await api.delete(`/inquiries/${id}`);
}

export const inquiriesService = {
  getInquiries,
  createInquiry,
  updateInquiry,
  updateInquiryStatus,
  deleteInquiry,
  create: createInquiry
};