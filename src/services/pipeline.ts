import { api } from "@/lib/api";

export interface Deal {
  id: string;
  title: string;
  company: string;
  client: string;
  value: number;
  owner: string;
  stage: "New" | "Qualified" | "Proposal" | "Won" | "Lost";
  priority: "High" | "Medium" | "Low";
  probability: number;
  expectedCloseDate: string;
  nextAction: string;
  createdAt: string;
}

export interface CreateDealPayload {
  title: string;
  company: string;
  client: string;
  value: number;
  owner: string;
  priority: "High" | "Medium" | "Low";
  expectedCloseDate: string;
  nextAction: string;
}

export async function getDeals(): Promise<Deal[]> {
  const { data } = await api.get("/pipeline");
  return Array.isArray(data) ? data : data?.items ?? [];
}

export async function createDeal(payload: CreateDealPayload): Promise<Deal> {
  const { data } = await api.post("/pipeline", payload);
  return data;
}

export async function updateDeal(id: string, payload: Partial<Deal>): Promise<Deal> {
  const { data } = await api.put(`/pipeline/${id}`, payload);
  return data;
}

export async function deleteDeal(id: string): Promise<void> {
  await api.delete(`/pipeline/${id}`);
}

export async function moveDeal(id: string, stage: Deal['stage']): Promise<Deal> {
  const { data } = await api.patch(`/pipeline/${id}/move`, { stage });
  return data;
}