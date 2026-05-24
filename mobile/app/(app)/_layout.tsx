import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { useAppTheme } from "../../src/shared";
import { useAuthStore } from "../../src/store/authStore";
import { isAdminRole } from "../../src/utils/roles";

const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 96 : 84;

function TabIcon({ name, color, size, focused }: Readonly<{ name: keyof typeof Ionicons.glyphMap; color: string; size: number; focused: boolean }>) {
    const { tokens } = useAppTheme();
    return (
        <View style={[iconStyles.wrap, focused && { backgroundColor: tokens.colors.primaryLight }]}>
            <Ionicons name={name} color={color} size={size} />
        </View>
    );
}

function HomeTabIcon({ color, size, focused }: Readonly<{ color: string; size: number; focused: boolean }>) {
    return <TabIcon name="home-outline" color={color} size={size} focused={focused} />;
}

function EventsTabIcon({ color, size, focused }: Readonly<{ color: string; size: number; focused: boolean }>) {
    return <TabIcon name="calendar-outline" color={color} size={size} focused={focused} />;
}

function RegistrationsTabIcon({ color, size, focused }: Readonly<{ color: string; size: number; focused: boolean }>) {
    return <TabIcon name="clipboard-outline" color={color} size={size} focused={focused} />;
}

function ProfileTabIcon({ color, size, focused }: Readonly<{ color: string; size: number; focused: boolean }>) {
    return <TabIcon name="person-outline" color={color} size={size} focused={focused} />;
}

const iconStyles = StyleSheet.create({
    wrap: {
        width: 42,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
});

export default function AppLayout() {
    const router = useRouter();
    const token = useAuthStore((s) => s.accessToken);
    const role = useAuthStore((s) => s.user?.role);
    const { tokens } = useAppTheme();

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
                tabBarActiveTintColor: tokens.colors.primary,
                tabBarInactiveTintColor: tokens.colors.textTertiary,
                tabBarStyle: {
                    backgroundColor: tokens.colors.bgPrimary,
                    borderTopWidth: 0,
                    height: TAB_BAR_HEIGHT,
                    paddingBottom: Platform.OS === "ios" ? 26 : 14,
                    paddingTop: 10,
                    ...tokens.shadow.tab,
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
                    tabBarIcon: HomeTabIcon,
                }}
            />
            <Tabs.Screen
                name="events"
                options={{
                    title: "Eventos",
                    tabBarIcon: EventsTabIcon,
                }}
            />
            <Tabs.Screen
                name="registrations"
                options={{
                    title: "Inscripciones",
                    tabBarIcon: RegistrationsTabIcon,
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    title: "Perfil",
                    tabBarIcon: ProfileTabIcon,
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
