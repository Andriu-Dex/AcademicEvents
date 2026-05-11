import React from "react";
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { theme } from "../../src/shared/theme";
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

function HomeTabIcon({ color, size, focused }: Readonly<{ color: string; size: number; focused: boolean }>) {
    return <TabIcon name="home-outline" color={color} size={size} focused={focused} />;
}

function DashboardTabIcon({ color, size, focused }: Readonly<{ color: string; size: number; focused: boolean }>) {
    return <TabIcon name="settings-outline" color={color} size={size} focused={focused} />;
}

function EventsTabIcon({ color, size, focused }: Readonly<{ color: string; size: number; focused: boolean }>) {
    return <TabIcon name="document-text-outline" color={color} size={size} focused={focused} />;
}

function CareersTabIcon({ color, size, focused }: Readonly<{ color: string; size: number; focused: boolean }>) {
    return <TabIcon name="school-outline" color={color} size={size} focused={focused} />;
}

function ValidationsTabIcon({ color, size, focused }: Readonly<{ color: string; size: number; focused: boolean }>) {
    return <TabIcon name="checkmark-done-outline" color={color} size={size} focused={focused} />;
}

function ProfileTabIcon({ color, size, focused }: Readonly<{ color: string; size: number; focused: boolean }>) {
    return <TabIcon name="person-outline" color={color} size={size} focused={focused} />;
}

type TabOptions = { title: string; tabBarIcon: (props: { color: string; size: number; focused: boolean }) => React.ReactNode };

const homeOptions: TabOptions = { title: "Inicio", tabBarIcon: HomeTabIcon };
const dashboardOptions: TabOptions = { title: "Dashboard", tabBarIcon: DashboardTabIcon };
const eventsOptions: TabOptions = { title: "Eventos", tabBarIcon: EventsTabIcon };
const careersOptions: TabOptions = { title: "Carreras", tabBarIcon: CareersTabIcon };
const registrationsOptions: TabOptions = { title: "Validar", tabBarIcon: ValidationsTabIcon };
const profileOptions: TabOptions = { title: "Perfil", tabBarIcon: ProfileTabIcon };

export default function AdminLayout() {
    const router = useRouter();
    const token = useAuthStore((s) => s.accessToken);
    const role = useAuthStore((s) => s.user?.role);

    useEffect(() => {
        if (!token) {
            router.replace("/home");
            return;
        }

        if (!isAdminRole(role ?? null)) {
            router.replace("/(app)");
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
                    flex: 1,
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
            <Tabs.Screen name="index" options={homeOptions} />
            <Tabs.Screen name="dashboard" options={dashboardOptions} />
            <Tabs.Screen name="events" options={eventsOptions} />
            <Tabs.Screen name="careers" options={careersOptions} />
            <Tabs.Screen name="registrations" options={registrationsOptions} />
            <Tabs.Screen name="profile" options={profileOptions} />

            <Tabs.Screen name="event-form" options={{ href: null }} />
            <Tabs.Screen name="career-form" options={{ href: null }} />
            <Tabs.Screen name="global-users" options={{ href: null }} />
            <Tabs.Screen name="university" options={{ href: null }} />
            <Tabs.Screen name="reports/attendance" options={{ href: null }} />
            <Tabs.Screen name="reports/career" options={{ href: null }} />
            <Tabs.Screen name="reports/certificates" options={{ href: null }} />
            <Tabs.Screen name="reports/enrollments" options={{ href: null }} />
            <Tabs.Screen name="reports/month" options={{ href: null }} />
            <Tabs.Screen name="reports/revenue" options={{ href: null }} />
            <Tabs.Screen name="reports/event/[id]" options={{ href: null }} />
        </Tabs>
    );
}
