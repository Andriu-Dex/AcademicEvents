import { useEffect } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { getCurrentApiBaseUrl } from "../../api/client";
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
            socket.off("cupos-change-hm", handleCuposChange);
            socket.off("carrera-change-hm", handleCareerChange);
            socket.off("system-notification-hm", handleNotifications);
            socket.off("admin-notification", handleNotifications);
            socket.disconnect();
        };
    }, [session.accessToken, session.isHydrated, session.role, session.userId]);
}
