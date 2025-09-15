import { api } from "@/lib/api";
import type { CommissionDetailsRowDto, Paginated } from "@/types/api";

export async function getCommissionDetails(params?: {
  from?: string;
  to?: string;
  advisorEmail?: string;
  page?: number;
  pageSize?: number;
}): Promise<Paginated<CommissionDetailsRowDto>> {
  const { data } = await api.get("/Reports/commission-details", { params });
  return data;
}

export const reportsService = {
  getCommissionDetails
};