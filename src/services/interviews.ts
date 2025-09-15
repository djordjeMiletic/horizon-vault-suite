import { api } from "@/lib/api";

export interface Interview {
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
  status: "Scheduled" | "Completed" | "Cancelled";
  location: string;
  notes?: string;
  interviewQuestions: string[];
  feedback?: string;
}

export interface CreateInterviewPayload {
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  interviewerId: string;
  interviewerName: string;
  scheduledAt: string;
  duration: number;
  type: string;
  location: string;
  notes?: string;
  interviewQuestions: string[];
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export async function getInterviews(params?: {
  status?: string;
  candidateId?: string;
  interviewerId?: string;
  page?: number;
  pageSize?: number;
}): Promise<Paginated<Interview>> {
  const { data } = await api.get("/interviews", { params });
  return data;
}

export async function createInterview(payload: CreateInterviewPayload): Promise<Interview> {
  const { data } = await api.post("/interviews", payload);
  return data;
}

export async function updateInterview(id: string, payload: Partial<Interview>): Promise<Interview> {
  const { data } = await api.put(`/interviews/${id}`, payload);
  return data;
}

export async function updateInterviewStatus(
  id: string,
  status: Interview['status'],
  feedback?: string
): Promise<Interview> {
  const payload: any = { status };
  if (feedback) payload.feedback = feedback;
  const { data } = await api.patch(`/interviews/${id}/status`, payload);
  return data;
}

export async function deleteInterview(id: string): Promise<void> {
  await api.delete(`/interviews/${id}`);
}