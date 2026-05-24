import { useEffect } from "react";
import { AppState, Platform } from "react-native";
import Constants from "expo-constants";
import { registerPushToken } from "../../api/notifications";

type NotificationsModule = typeof import("expo-notifications");

let notificationHandlerConfigured = false;
let expoGoWarningShown = false;
let notificationsModulePromise: Promise<NotificationsModule | null> | null = null;

function isExpoGo() {
    return Constants.appOwnership === "expo";
}

async function loadNotificationsModule(): Promise<NotificationsModule | null> {
    if (Platform.OS === "web") {
        return null;
    }

    if (isExpoGo()) {
        if (__DEV__ && !expoGoWarningShown) {
            console.warn("[PUSH] Expo Go no soporta push remoto en Android desde SDK 53. Usa un development build.");
            expoGoWarningShown = true;
        }
        return null;
    }

    if (!notificationsModulePromise) {
        notificationsModulePromise = import("expo-notifications")
            .then((module) => module)
            .catch((error) => {
                notificationsModulePromise = null;
                throw error;
            });
    }

    return notificationsModulePromise;
}

function ensureNotificationHandler(Notifications: NotificationsModule) {
    if (notificationHandlerConfigured) return;
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });
    notificationHandlerConfigured = true;
}

async function syncPushToken() {
    const Notifications = await loadNotificationsModule();
    if (!Notifications) return;

    ensureNotificationHandler(Notifications);

    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: theme.colors.primary,
        });
    }

    const permission = await Notifications.getPermissionsAsync();
    let finalStatus = permission.status;

    if (finalStatus !== "granted") {
        const requested = await Notifications.requestPermissionsAsync();
        finalStatus = requested.status;
    }

    if (finalStatus !== "granted") {
        return;
    }

    let token = "";

    try {
        const nativeToken = await Notifications.getDevicePushTokenAsync();
        token = typeof nativeToken.data === "string" ? nativeToken.data : String(nativeToken.data ?? "");
    } catch {
        // Silencio intencional: algunos dispositivos/simuladores no retornan token nativo.
    }

    if (!token) {
        try {
            const expoToken = await Notifications.getExpoPushTokenAsync();
            token = expoToken.data;
        } catch {
            return;
        }
    }

    if (!token) return;

    await registerPushToken({
        token,
        platform: Platform.OS === "ios" ? "IOS" : "ANDROID",
        deviceInfo: `${Platform.OS}-${String(Platform.Version)}`,
    });
}

export async function syncPushTokenNow() {
    await syncPushToken();
}

export function usePushTokenSync(accessToken: string | null) {
    useEffect(() => {
        if (!accessToken) return;

        void syncPushToken().catch((error) => {
            if (__DEV__) {
                console.warn("[PUSH] No se pudo sincronizar token:", error);
            }
        });

        const sub = AppState.addEventListener("change", (state) => {
            if (state !== "active") return;
            void syncPushToken().catch((error) => {
                if (__DEV__) {
                    console.warn("[PUSH] Error al resincronizar token:", error);
                }
            });
        });

        return () => sub.remove();
    }, [accessToken]);
}
