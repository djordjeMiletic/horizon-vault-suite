import { api } from "@/lib/api";

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  description: string;
  requirements: string[];
  status: "Open" | "Closed";
  applicantCount: number;
  postedAt: string;
  createdBy: string;
}

export interface CreateJobPayload {
  title: string;
  department: string;
  location: string;
  description: string;
  requirements: string[];
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export async function getJobs(params?: {
  status?: "Open" | "Closed";
  page?: number;
  pageSize?: number;
}): Promise<Paginated<Job>> {
  const { data } = await api.get("/jobs", { params });
  return data;
}

export async function getPublicJobs(): Promise<Job[]> {
  const { data } = await api.get("/jobs/public");
  return Array.isArray(data) ? data : data?.items ?? [];
}

export async function createJob(payload: CreateJobPayload): Promise<Job> {
  const { data } = await api.post("/jobs", payload);
  return data;
}

export async function updateJob(id: string, payload: Partial<Job>): Promise<Job> {
  const { data } = await api.put(`/jobs/${id}`, payload);
  return data;
}

export async function updateJobStatus(
  id: string,
  status: "Open" | "Closed"
): Promise<Job> {
  const { data } = await api.patch(`/jobs/${id}/status`, { status });
  return data;
}

export async function deleteJob(id: string): Promise<void> {
  await api.delete(`/jobs/${id}`);
}

export const jobsService = {
  getJobs,
  getPublicJobs,
  createJob,
  updateJob,
  updateJobStatus,
  deleteJob,
  getAll: () => getJobs(),
  create: createJob,
  update: updateJob
};