import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, StyleSheet, Platform } from "react-native";
import { theme } from "../../src/shared";
import { useAuthStore } from "../../src/store/authStore";
import { isAdminRole } from "../../src/utils/roles";

const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 96 : 84;

function TabIcon({ name, color, size, focused }: Readonly<{ name: keyof typeof Ionicons.glyphMap; color: string; size: number; focused: boolean }>) {
    return (
        <View style={[iconStyles.wrap, focused && iconStyles.wrapActive]}>
            <Ionicons name={name} color={color} size={size} />
        </View>
    );
}

const iconStyles = StyleSheet.create({
    wrap: {
        width: 42,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    wrapActive: {
        backgroundColor: theme.colors.primaryLight,
    },
});

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
                    borderTopWidth: 0,
                    height: TAB_BAR_HEIGHT,
                    paddingBottom: Platform.OS === "ios" ? 26 : 14,
                    paddingTop: 10,
                    ...theme.shadow.tab,
                },
                tabBarItemStyle: {
                    alignItems: "center",
                    justifyContent: "center",
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "700",
                    marginTop: 3,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Inicio",
                    tabBarIcon: ({ color, size, focused }) => (
                        <TabIcon name="home-outline" color={color} size={size} focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="events"
                options={{
                    title: "Eventos",
                    tabBarIcon: ({ color, size, focused }) => (
                        <TabIcon name="calendar-outline" color={color} size={size} focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="registrations"
                options={{
                    title: "Inscripciones",
                    tabBarIcon: ({ color, size, focused }) => (
                        <TabIcon name="clipboard-outline" color={color} size={size} focused={focused} />
                    ),
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    title: "Perfil",
                    tabBarIcon: ({ color, size, focused }) => (
                        <TabIcon name="person-outline" color={color} size={size} focused={focused} />
                    ),
                }}
            />

            <Tabs.Screen
                name="notifications"
                options={{
                    title: "Notificaciones",
                    href: null,
                }}
            />
            <Tabs.Screen
                name="event-registration"
                options={{
                    title: "Inscripción evento",
                    href: null,
                }}
            />
        </Tabs>
    );
}
