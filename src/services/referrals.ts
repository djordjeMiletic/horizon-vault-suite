import { api } from "@/lib/api";

export interface ReferralPartner {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  region: string;
  activeDeals: number;
  rating: number;
  status: "Active" | "Inactive";
  totalLeads: number;
  conversionRate: number;
  totalValue: number;
  lastActivity: string;
  notes?: string;
}

export interface CreateReferralPartnerPayload {
  name: string;
  company: string;
  email: string;
  phone: string;
  region: string;
  notes?: string;
}

export async function getReferralPartners(): Promise<ReferralPartner[]> {
  const { data } = await api.get("/referrals");
  return Array.isArray(data) ? data : data?.items ?? [];
}

export async function createReferralPartner(payload: CreateReferralPartnerPayload): Promise<ReferralPartner> {
  const { data } = await api.post("/referrals", payload);
  return data;
}

export async function updateReferralPartner(
  id: string,
  payload: Partial<ReferralPartner>
): Promise<ReferralPartner> {
  const { data } = await api.put(`/referrals/${id}`, payload);
  return data;
}

export async function updateReferralPartnerStatus(
  id: string,
  status: "Active" | "Inactive"
): Promise<ReferralPartner> {
  const { data } = await api.patch(`/referrals/${id}/status`, { status });
  return data;
}

export async function deleteReferralPartner(id: string): Promise<void> {
  await api.delete(`/referrals/${id}`);
}