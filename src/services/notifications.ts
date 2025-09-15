import { api } from "@/lib/api";
import type { NotificationDto, Paginated } from "@/types/api";

export async function getNotifications(scope: "current" | "admin" | "client" = "current") {
  const { data } = await api.get("/Notifications", { params: { scope } });
  return Array.isArray(data) ? data as NotificationDto[] : (data as Paginated<NotificationDto>).items;
}

export async function markAllRead(scope: "current" | "admin" | "client" = "current") {
  // Try query param first (preferred), fallback to body if needed
  try {
    await api.post("/Notifications/read-all", {}, { params: { scope } });
  } catch (error) {
    // Fallback to body if query params not supported
    await api.post("/Notifications/read-all", { scope });
  }
}

export async function markAsRead(notificationId: string) {
  await api.post(`/Notifications/${notificationId}/read`);
}

export const notificationsService = {
  getNotifications,
  markAllRead,
  markAsRead,
  getByRecipient: (email: string) => getNotifications("current")
};