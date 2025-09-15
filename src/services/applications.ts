import { api } from "@/lib/api";

export interface TimelineEntry {
  id: string;
  at: string;
  action: string;
  by: string;
  details: string;
}

export interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  appliedFor: string;
  jobTitle: string;
  status: "New" | "Screening" | "Interview" | "Offer" | "Rejected";
  appliedAt: string;
  cv?: string;
  notes?: string;
  timeline: TimelineEntry[];
}

export interface CreateApplicationPayload {
  name: string;
  email: string;
  phone?: string;
  jobId: string;
  cv?: File;
  coverLetter?: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export async function getApplications(params?: {
  jobId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<Paginated<Applicant>> {
  const { data } = await api.get("/applications", { params });
  return data;
}

export async function createApplication(payload: CreateApplicationPayload): Promise<Applicant> {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("email", payload.email);
  if (payload.phone) formData.append("phone", payload.phone);
  formData.append("jobId", payload.jobId);
  if (payload.cv) formData.append("cv", payload.cv);
  if (payload.coverLetter) formData.append("coverLetter", payload.coverLetter);

  const { data } = await api.post("/applications", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
}

export async function updateApplicationStatus(
  id: string,
  status: Applicant['status']
): Promise<Applicant> {
  const { data } = await api.patch(`/applications/${id}/status`, { status });
  return data;
}

export async function addApplicationNote(
  id: string,
  note: string
): Promise<Applicant> {
  const { data } = await api.post(`/applications/${id}/notes`, { note });
  return data;
}

export async function getApplication(id: string): Promise<Applicant> {
  const { data } = await api.get(`/applications/${id}`);
  return data;
}