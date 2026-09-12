import { apiClient } from "./apiClient";

import type { AppNotification, UnreadNotificationCount } from "../types/models";

export async function getNotifications(): Promise<AppNotification[]> {
  const response = await apiClient.get<AppNotification[]>("/notifications");

  return response.data;
}

export async function getUnreadNotificationCount(): Promise<number> {
  const response = await apiClient.get<UnreadNotificationCount>(
    "/notifications/unread-count",
  );

  return response.data.unreadCount;
}

export async function markNotificationAsRead(
  notificationId: string,
): Promise<AppNotification> {
  const response = await apiClient.patch<AppNotification>(
    `/notifications/${notificationId}/read`,
  );

  return response.data;
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await apiClient.patch("/notifications/read-all");
}

export async function clearNotifications(): Promise<void> {
  await apiClient.delete("/notifications");
}
