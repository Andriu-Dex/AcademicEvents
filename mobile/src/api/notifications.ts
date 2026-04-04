import { apiClient } from "./client";

export type NotificationItem = {
    id: string;
    title: string;
    body: string;
    createdAt: string;
    readAt: string | null;
    type: string;
    data: Record<string, unknown>;
};

function pickString(obj: Record<string, unknown>, key: string) {
    const value = obj[key];
    return typeof value === "string" ? value : "";
}

function normalizeNotification(raw: Record<string, unknown>): NotificationItem {
    return {
        id: pickString(raw, "id") || pickString(raw, "notificationId"),
        title: pickString(raw, "title") || pickString(raw, "titulo") || "Notificación",
        body: pickString(raw, "body") || pickString(raw, "mensaje") || "",
        createdAt: pickString(raw, "createdAt") || pickString(raw, "sentAt") || "",
        readAt: (typeof raw.readAt === "string" ? raw.readAt : null) ?? null,
        type: pickString(raw, "type") || pickString(raw, "tipo") || "",
        data: (raw.data && typeof raw.data === "object" ? (raw.data as Record<string, unknown>) : {}),
    };
}

export async function fetchNotificationHistory(limit = 50, offset = 0): Promise<NotificationItem[]> {
    const response = await apiClient.get<unknown>("/api/notifications/history", {
        params: { limit, offset },
    });

    if (Array.isArray(response.data)) {
        return (response.data as Array<Record<string, unknown>>)
            .map(normalizeNotification)
            .filter((n) => n.id.length > 0);
    }

    const payload = response.data as Record<string, unknown>;
    const list = Array.isArray(payload.notifications) ? (payload.notifications as Array<Record<string, unknown>>) : [];
    return list.map(normalizeNotification).filter((n) => n.id.length > 0);
}

export async function markAllNotificationsAsRead(): Promise<void> {
    await apiClient.patch("/api/notifications/read-all");
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
    await apiClient.patch(`/api/notifications/${notificationId}/read`);
}
