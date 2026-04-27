import { Stack } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { usePushTokenSync } from "../src/features/notifications/usePushTokenSync";
import { useRealtimeSync } from "../src/features/realtime/useRealtimeSync";
import { queryClient } from "../src/shared/queryClient";
import { useAuthStore } from "../src/store/authStore";

export default function RootLayout() {
    const hydrate = useAuthStore((state) => state.hydrate);
    const isHydrated = useAuthStore((state) => state.isHydrated);
    const accessToken = useAuthStore((state) => state.accessToken);
    const userId = useAuthStore((state) => state.user?.id ?? null);
    const role = useAuthStore((state) => state.user?.role ?? null);

    useEffect(() => {
        hydrate();
    }, [hydrate]);

    usePushTokenSync(accessToken);
    useRealtimeSync({ accessToken, userId, role, isHydrated });

    if (!isHydrated) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <QueryClientProvider client={queryClient}>
            <Stack screenOptions={{ headerShown: false }} />
        </QueryClientProvider>
    );
}
