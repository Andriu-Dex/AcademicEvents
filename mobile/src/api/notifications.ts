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

export type PushPlatform = "ANDROID" | "IOS";

export type PushTokenStatus = {
    hasActiveTokens: boolean;
    activeTokenCount: number;
    latestToken: {
        platform: string;
        updatedAt: string;
    } | null;
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

    const payload = response.data as Record<string, unknown>;
    const data =
        payload && typeof payload === "object" && payload.data && typeof payload.data === "object"
            ? (payload.data as Record<string, unknown>)
            : payload;

    if (Array.isArray(response.data)) {
        return (response.data as Array<Record<string, unknown>>)
            .map(normalizeNotification)
            .filter((n) => n.id.length > 0);
    }

    const list = Array.isArray(data.notifications) ? (data.notifications as Array<Record<string, unknown>>) : [];
    return list.map(normalizeNotification).filter((n) => n.id.length > 0);
}

export async function markAllNotificationsAsRead(): Promise<void> {
    await apiClient.patch("/api/notifications/read-all");
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
    await apiClient.patch(`/api/notifications/${notificationId}/read`);
}

export async function registerPushToken(input: {
    token: string;
    platform: PushPlatform;
    deviceInfo?: string;
}): Promise<void> {
    await apiClient.post("/api/push-token", {
        token: input.token,
        platform: input.platform,
        deviceInfo: input.deviceInfo,
    });
}

export async function fetchPushTokenStatus(): Promise<PushTokenStatus | null> {
    const response = await apiClient.get<unknown>("/api/push-token/status");
    const payload = response.data as Record<string, unknown>;
    const data =
        payload && typeof payload === "object" && payload.data && typeof payload.data === "object"
            ? (payload.data as Record<string, unknown>)
            : payload;

    if (!data || typeof data !== "object") return null;

    const latestTokenRaw =
        data.latestToken && typeof data.latestToken === "object" ? (data.latestToken as Record<string, unknown>) : null;

    return {
        hasActiveTokens: Boolean(data.hasActiveTokens),
        activeTokenCount: Number(data.activeTokenCount ?? 0) || 0,
        latestToken: latestTokenRaw
            ? {
                platform: pickString(latestTokenRaw, "platform"),
                updatedAt: pickString(latestTokenRaw, "updatedAt"),
            }
            : null,
    };
}
