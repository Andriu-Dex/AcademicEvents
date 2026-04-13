import { Tabs, type BottomTabNavigationOptions, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { theme } from "../../src/shared/theme";
import { useAuthStore } from "../../src/store/authStore";
import { isAdminRole } from "../../src/utils/roles";

function HomeTabIcon({ color, size }: Readonly<{ color: string; size: number }>) {
    return <Ionicons name="home-outline" color={color} size={size} />;
}

function DashboardTabIcon({ color, size }: Readonly<{ color: string; size: number }>) {
    return <Ionicons name="settings-outline" color={color} size={size} />;
}

function EventsTabIcon({ color, size }: Readonly<{ color: string; size: number }>) {
    return <Ionicons name="document-text-outline" color={color} size={size} />;
}

function CareersTabIcon({ color, size }: Readonly<{ color: string; size: number }>) {
    return <Ionicons name="school-outline" color={color} size={size} />;
}

function ValidationsTabIcon({ color, size }: Readonly<{ color: string; size: number }>) {
    return <Ionicons name="checkmark-done-outline" color={color} size={size} />;
}

function ProfileTabIcon({ color, size }: Readonly<{ color: string; size: number }>) {
    return <Ionicons name="person-outline" color={color} size={size} />;
}

const homeOptions: BottomTabNavigationOptions = { title: "Inicio", tabBarIcon: HomeTabIcon };
const dashboardOptions: BottomTabNavigationOptions = { title: "Dashboard", tabBarIcon: DashboardTabIcon };
const eventsOptions: BottomTabNavigationOptions = { title: "Eventos", tabBarIcon: EventsTabIcon };
const careersOptions: BottomTabNavigationOptions = { title: "Carreras", tabBarIcon: CareersTabIcon };
const registrationsOptions: BottomTabNavigationOptions = { title: "Validar", tabBarIcon: ValidationsTabIcon };
const profileOptions: BottomTabNavigationOptions = { title: "Perfil", tabBarIcon: ProfileTabIcon };

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
                options={homeOptions}
            />
            <Tabs.Screen
                name="dashboard"
                options={dashboardOptions}
            />
            <Tabs.Screen
                name="events"
                options={eventsOptions}
            />
            <Tabs.Screen
                name="careers"
                options={careersOptions}
            />
            <Tabs.Screen
                name="registrations"
                options={registrationsOptions}
            />
            <Tabs.Screen
                name="profile"
                options={profileOptions}
            />

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
