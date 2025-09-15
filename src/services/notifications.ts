import { api } from "@/lib/api";
import type { NotificationDto, Paginated } from "@/types/api";

export async function getNotifications(scope: "current" | "admin" | "client" = "current") {
  const { data } = await api.get("/notifications", { params: { scope } });
  return Array.isArray(data) ? data as NotificationDto[] : (data as Paginated<NotificationDto>).items;
}

export async function markAllRead(scope: "current" | "admin" | "client" = "current") {
  await api.post("/notifications/read-all", { scope });
}

export async function markAsRead(notificationId: string) {
  await api.post(`/notifications/${notificationId}/read`);
}

export const notificationsService = {
  getNotifications,
  markAllRead,
  markAsRead,
  getByRecipient: (email: string) => getNotifications("current")
};