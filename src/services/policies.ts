import { api } from "@/lib/api";
import type { PolicyDto } from "@/types/api";

export async function getPolicies(): Promise<PolicyDto[]> {
  const { data } = await api.get("/Policies");
  return Array.isArray(data) ? data : (data?.items ?? []);
}