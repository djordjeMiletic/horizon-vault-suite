import { api } from "@/lib/api";
import type { PaymentDto } from "@/types/api";

export interface PaymentCycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "Draft" | "Active" | "Closed";
  totalAmount: number;
  approvedAmount: number;
  pendingAmount: number;
  items: PaymentCycleItem[];
}

export interface PaymentCycleItem {
  id: string;
  paymentId: string;
  advisorEmail: string;
  amount: number;
  status: "Pending" | "Approved" | "Rejected";
  notes?: string;
  payment?: PaymentDto;
}

export interface CreatePaymentCyclePayload {
  name: string;
  startDate: string;
  endDate: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

// Note: These endpoints don't exist in the backend yet
// They will need to be implemented server-side
export async function getPaymentCycles(params?: {
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<Paginated<PaymentCycle>> {
  const { data } = await api.get("/payment-cycles", { params });
  return data;
}

export async function createPaymentCycle(payload: CreatePaymentCyclePayload): Promise<PaymentCycle> {
  const { data } = await api.post("/payment-cycles", payload);
  return data;
}

export async function getPaymentCycle(id: string): Promise<PaymentCycle> {
  const { data } = await api.get(`/payment-cycles/${id}`);
  return data;
}

export async function updatePaymentCycleItem(
  cycleId: string,
  itemId: string,
  payload: { status: string; notes?: string }
): Promise<PaymentCycleItem> {
  const { data } = await api.put(`/payment-cycles/${cycleId}/items/${itemId}`, payload);
  return data;
}

export async function closePaymentCycle(id: string): Promise<PaymentCycle> {
  const { data } = await api.put(`/payment-cycles/${id}/close`);
  return data;
}

export const paymentCyclesService = {
  getPaymentCycles,
  createPaymentCycle,
  getPaymentCycle,
  updatePaymentCycleItem,
  closePaymentCycle,
  getAll: () => getPaymentCycles(),
  get: getPaymentCycle,
  getCycles: getPaymentCycles,
  updateItem: updatePaymentCycleItem,
  createCycle: createPaymentCycle
};