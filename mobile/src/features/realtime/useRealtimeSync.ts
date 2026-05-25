import { useEffect } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { getCurrentApiBaseUrl } from "../../api/client";
import { type NotificationItem } from "../../api/notifications";
import { queryClient } from "../../shared/queryClient";

type SessionLike = {
    accessToken: string | null;
    userId: string | null;
    role: string | null;
    isHydrated: boolean;
};

type RealtimeSocket = {
    connected: boolean;
    connect: () => void;
    disconnect: () => void;
    emit: (event: string, payload?: unknown) => void;
    on: (event: string, listener: (...args: any[]) => void) => void;
    off: (event: string, listener?: (...args: any[]) => void) => void;
};

function createSocketClient(url: string): RealtimeSocket {
    const socketIoClient = require("../../vendor/socket.io-client.js") as ((
        uri: string,
        opts?: Record<string, unknown>
    ) => RealtimeSocket) & { io?: (uri: string, opts?: Record<string, unknown>) => RealtimeSocket };

    const factory = socketIoClient.io ?? socketIoClient;

    return factory(url, {
        withCredentials: true,
        transports: ["websocket", "polling"],
        timeout: 10000,
        forceNew: true,
        autoConnect: true,
    });
}

function invalidateAdminReportQueries() {
    return queryClient.invalidateQueries({
        predicate: (query) => {
            const head = query.queryKey[0];
            return typeof head === "string" && head.startsWith("admin-report");
        },
    });
}

function invalidateDashboardQueries() {
    return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["featured-events"] }),
        queryClient.invalidateQueries({ queryKey: ["public-events"] }),
        queryClient.invalidateQueries({ queryKey: ["user-events-paged"] }),
        queryClient.invalidateQueries({ queryKey: ["home-stats"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-dashboard-events"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-events-paged"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-event"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-report-events-selector"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-report-events-pick"] }),
        invalidateAdminReportQueries(),
    ]);
}

function invalidateRegistrationQueries() {
    return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["my-registrations"] }),
        queryClient.invalidateQueries({ queryKey: ["notifications-history"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-registrations"] }),
        invalidateAdminReportQueries(),
    ]);
}

function invalidateCareerQueries() {
    return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["careers"] }),
        queryClient.invalidateQueries({ queryKey: ["home-careers"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-careers-all"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-careers-report-pick"] }),
        queryClient.invalidateQueries({ queryKey: ["coordinators"] }),
        queryClient.invalidateQueries({ queryKey: ["faculties"] }),
        queryClient.invalidateQueries({ queryKey: ["home-stats"] }),
    ]);
}

function authenticateSocket(socket: RealtimeSocket, session: SessionLike) {
    if (!session.accessToken || !session.userId || !session.role) return;

    socket.emit("authenticate", {
        userId: session.userId,
        role: session.role,
        token: session.accessToken,
    });
}

function pickString(input: Record<string, unknown> | undefined, ...keys: string[]) {
    if (!input) return "";

    for (const key of keys) {
        const value = input[key];
        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
    }

    return "";
}

function normalizeStatus(statusRaw: unknown) {
    return typeof statusRaw === "string" ? statusRaw.trim().toUpperCase() : "";
}

function buildInscriptionNotification(payload: Record<string, unknown>): NotificationItem | null {
    const rawData = (payload.data && typeof payload.data === "object" ? payload.data : payload) as Record<string, unknown>;
    const status = normalizeStatus(rawData.estadoNuevo ?? rawData.status ?? rawData.est_ins);
    const eventData = (rawData.event && typeof rawData.event === "object" ? rawData.event : rawData.evento) as
        | Record<string, unknown>
        | undefined;
    const eventName = pickString(eventData, "name", "nom_eve", "title", "nombre") || "el evento";
    const registrationId = pickString(rawData, "id", "registrationId", "id_ins") || `${Date.now()}`;

    if (status === "ACCEPTED" || status === "ACEPTADA" || status === "APPROVED" || status === "APROBADO") {
        const title = status === "APPROVED" || status === "APROBADO" ? "Inscripción aprobada" : "Inscripción aceptada";
        const body =
            status === "APPROVED" || status === "APROBADO"
                ? `Tu inscripción para "${eventName}" fue aprobada.`
                : `Tu inscripción para "${eventName}" fue aceptada.`;

        return {
            id: `socket-registration-${registrationId}-${status}-${Date.now()}`,
            title,
            body,
            createdAt: new Date().toISOString(),
            readAt: null,
            type: "REGISTRATION_APPROVED",
            data: {
                type: "REGISTRATION_APPROVED",
                status,
                link: "/(app)/registrations",
                source: "socket",
                registrationId,
                eventName,
            },
        };
    }

    if (status === "REJECTED" || status === "RECHAZADA") {
        return {
            id: `socket-registration-${registrationId}-${status}-${Date.now()}`,
            title: "Inscripción rechazada",
            body: `Tu inscripción para "${eventName}" fue rechazada.`,
            createdAt: new Date().toISOString(),
            readAt: null,
            type: "REGISTRATION_REJECTED",
            data: {
                type: "REGISTRATION_REJECTED",
                status,
                link: "/(app)/registrations",
                source: "socket",
                registrationId,
                eventName,
            },
        };
    }

    return null;
}

function upsertLiveNotification(notification: NotificationItem) {
    queryClient.setQueryData<NotificationItem[]>(["notifications-live"], (current) => {
        const list = Array.isArray(current) ? current : [];
        const alreadyExists = list.some(
            (item) =>
                item.data?.source === "socket" &&
                item.data?.registrationId === notification.data.registrationId &&
                item.type === notification.type &&
                item.data?.status === notification.data.status
        );

        if (alreadyExists) return list;

        return [notification, ...list];
    });
}

export function useRealtimeSync(session: SessionLike) {
    useEffect(() => {
        if (!session.isHydrated) return;

        const socket = createSocketClient(getCurrentApiBaseUrl());

        const handleConnect = () => {
            authenticateSocket(socket, session);
        };

        const handleEventChange = () => {
            void invalidateDashboardQueries();
        };

        const handleRegistrationChange = () => {
            void invalidateRegistrationQueries();
            void invalidateDashboardQueries();
        };

        const handleUserInscriptionUpdate = (payload: Record<string, unknown>) => {
            const notification = buildInscriptionNotification(payload);
            if (notification) {
                upsertLiveNotification(notification);
            }
            void invalidateRegistrationQueries();
        };

        const handleCuposChange = () => {
            void Promise.all([
                queryClient.invalidateQueries({ queryKey: ["public-events"] }),
                queryClient.invalidateQueries({ queryKey: ["user-events-paged"] }),
                queryClient.invalidateQueries({ queryKey: ["featured-events"] }),
                queryClient.invalidateQueries({ queryKey: ["home-stats"] }),
            ]);
        };

        const handleCareerChange = () => {
            void invalidateCareerQueries();
        };

        const handleNotifications = () => {
            void queryClient.invalidateQueries({ queryKey: ["notifications-history"] });
        };

        const handleAppStateChange = (state: AppStateStatus) => {
            if (state !== "active") return;
            authenticateSocket(socket, session);
            if (!socket.connected) {
                socket.connect();
            }
        };

        socket.on("connect", handleConnect);
        socket.on("evento-change-hm", handleEventChange);
        socket.on("inscripcion-change-hm", handleRegistrationChange);
        socket.on("user-inscription-update", handleRegistrationChange);
        socket.on("user-inscription-update", handleUserInscriptionUpdate);
        socket.on("cupos-change-hm", handleCuposChange);
        socket.on("carrera-change-hm", handleCareerChange);
        socket.on("system-notification-hm", handleNotifications);
        socket.on("admin-notification", handleNotifications);

        const appStateSubscription = AppState.addEventListener("change", handleAppStateChange);

        return () => {
            appStateSubscription.remove();
            socket.off("connect", handleConnect);
            socket.off("evento-change-hm", handleEventChange);
            socket.off("inscripcion-change-hm", handleRegistrationChange);
            socket.off("user-inscription-update", handleRegistrationChange);
            socket.off("user-inscription-update", handleUserInscriptionUpdate);
            socket.off("cupos-change-hm", handleCuposChange);
            socket.off("carrera-change-hm", handleCareerChange);
            socket.off("system-notification-hm", handleNotifications);
            socket.off("admin-notification", handleNotifications);
            socket.disconnect();
        };
    }, [session.accessToken, session.isHydrated, session.role, session.userId]);
}
