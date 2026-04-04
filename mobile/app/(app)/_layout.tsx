import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { theme } from "../../src/shared/theme";
import { useAuthStore } from "../../src/store/authStore";

export default function AppLayout() {
    const router = useRouter();
    const token = useAuthStore((s) => s.accessToken);

    useEffect(() => {
        if (!token) {
            router.replace("/home");
        }
    }, [token, router]);

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textTertiary,
                tabBarStyle: {
                    backgroundColor: theme.colors.bgPrimary,
                    borderTopColor: theme.colors.borderPrimary,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Inicio",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="events"
                options={{
                    title: "Eventos",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="calendar-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="registrations"
                options={{
                    title: "Mis inscripciones",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="clipboard-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="notifications"
                options={{
                    title: "Notificaciones",
                    tabBarButton: () => null,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Perfil",
                    tabBarButton: () => null,
                }}
            />
        </Tabs>
    );
}
