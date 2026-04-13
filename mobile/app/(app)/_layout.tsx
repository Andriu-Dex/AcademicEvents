import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { theme } from "../../src/shared/theme";
import { useAuthStore } from "../../src/store/authStore";
import { isAdminRole } from "../../src/utils/roles";

export default function AppLayout() {
    const router = useRouter();
    const token = useAuthStore((s) => s.accessToken);
    const role = useAuthStore((s) => s.user?.role);

    useEffect(() => {
        if (!token) {
            router.replace("/home");
            return;
        }

        if (isAdminRole(role ?? null)) {
            router.replace("/(admin)");
        }
    }, [token, role, router]);

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textTertiary,
                tabBarStyle: {
                    backgroundColor: theme.colors.bgPrimary,
                    borderTopColor: theme.colors.borderPrimary,
                    justifyContent: "space-around",
                },
                tabBarItemStyle: {
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "800",
                    paddingBottom: 2,
                    textAlign: "center",
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
                    title: "Inscripciones",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="clipboard-outline" color={color} size={size} />
                    ),
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    title: "Perfil",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" color={color} size={size} />
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
        </Tabs>
    );
}
