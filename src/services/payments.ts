import { api } from "@/lib/api";
import type { Paginated, PaymentDto, PaymentWithCommissionDto, CommissionDetailsRowDto } from "@/types/api";

export async function addPayment(payload: {
  date: string; 
  productId: string; 
  provider: string;
  ape: number; 
  receipts: number; 
  notes?: string; 
  advisorEmail: string;
}): Promise<PaymentWithCommissionDto> {
  const { data } = await api.post("/payments", payload);
  return data;
}

export async function getPayments(params: {
  from?: string; 
  to?: string; 
  advisorEmail?: string; 
  page?: number; 
  pageSize?: number;
}): Promise<Paginated<PaymentDto>> {
  const { data } = await api.get("/payments", { params });
  return data;
}

export async function getCommissionDetails(params: {
  from?: string; 
  to?: string; 
  advisorEmail?: string; 
  page?: number; 
  pageSize?: number;
}): Promise<Paginated<CommissionDetailsRowDto>> {
  const { data } = await api.get("/reports/commission-details", { params });
  return data;
}