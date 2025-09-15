import { api } from "@/lib/api";
import type { Paginated, TicketDto } from "@/types/api";

export async function getTickets(params?: { mine?: boolean; page?: number; pageSize?: number }) {
  const { data } = await api.get("/Tickets", { params });
  return Array.isArray(data) ? { items: data, page: 1, pageSize: data.length, totalCount: data.length } : data;
}

export async function createTicket(payload: { subject: string; message: string }) {
  const { data } = await api.post("/Tickets", { 
    subject: payload.subject, 
    initialMessage: payload.message 
  });
  return data;
}

export async function replyTicket(id: string, payload: { text: string }) {
  const { data } = await api.post(`/Tickets/${id}/reply`, payload);
  return data;
}

export async function updateTicketStatus(id: string, status: string) {
  const { data } = await api.patch(`/Tickets/${id}`, { status });
  return data;
}

export const ticketsService = {
  getTickets,
  createTicket, 
  replyTicket,
  updateTicketStatus,
  getAll: () => getTickets({}),
  getMine: () => getTickets({ mine: true })
};