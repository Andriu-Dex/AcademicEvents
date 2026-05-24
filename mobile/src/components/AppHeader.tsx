import { useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useSegments } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import { apiClient, toAbsoluteUrl } from "../api/client";
import { useAuthStore } from "../store/authStore";
import { theme } from "../shared";

const STATUS_BAR_HEIGHT = Platform.OS === "ios" ? 50 : 28;

export function AppHeader({
    title,
    showBack,
    backHref,
    showNotifications,
    showBrandLogo,
}: Readonly<{ title: string; showBack?: boolean; backHref?: string; showNotifications?: boolean; showBrandLogo?: boolean }>) {
    const router = useRouter();
    const segments = useSegments();
    const user = useAuthStore((s) => s.user);
    const clearSession = useAuthStore((s) => s.clearSession);
    const isAdminArea = segments.includes("(admin)");
    const isProfileScreen = segments.includes("profile");
    const shouldShowBrandLogo = showBrandLogo ?? true;

    const { data: facultyData } = useQuery({
        queryKey: ["header-faculty"],
        staleTime: 300000,
        queryFn: async () => {
            const response = await apiClient.get<Record<string, unknown>>("/api/facultad-principal");
            const pickString = (...values: unknown[]) => {
                for (const value of values) {
                    if (typeof value === "string") return value;
                }
                return "";
            };

            return {
                acronym: pickString(response.data?.acronimo, response.data?.acr_fac, "FISEI"),
                title: pickString(
                    response.data?.nombre,
                    response.data?.nom_fac,
                    "Facultad de Ingenieria en Sistemas, Electronica e Industrial"
                ),
                logo: pickString(response.data?.logo, response.data?.url_log_fac),
            };
        },
    });

    const displayName = useMemo(() => {
        if (!user) return "";
        const firstName = (user.firstName ?? "").trim();
        return firstName || user.email;
    }, [user]);

    const brandLogoNode = facultyData?.logo ? (
        <Image source={{ uri: toAbsoluteUrl(facultyData.logo) }} style={styles.brandLogo} />
    ) : (
        <View style={styles.brandLogoFallback} />
    );

    const onLogout = async () => {
        await clearSession();
        router.replace("/home");
    };

    const onOpenProfile = () => {
        if (isAdminArea) {
            router.push("/(admin)");
            return;
        }
        router.push("/profile");
    };

    return (
        <LinearGradient
            colors={theme.gradients.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.wrap}
        >
            <View style={styles.content}>
                <View style={showBack ? styles.left : {}}>
                    {showBack ? (
                        <Pressable style={styles.iconBtn} onPress={() => (backHref ? router.replace(backHref) : router.back())}>
                            <Ionicons name="arrow-back" size={20} color={theme.colors.textInverse} />
                        </Pressable>
                    ) : null}
                </View>

                <View style={styles.titleWrap}>
                    {shouldShowBrandLogo ? (
                        brandLogoNode
                    ) : null}
                    <View style={styles.titleTextWrap}>
                        <Text style={styles.title} numberOfLines={1}>
                            {title}
                        </Text>
                        <Text style={styles.facultyText} numberOfLines={1}>
                            {facultyData?.acronym ?? "FISEI"} · {facultyData?.title ?? "Facultad de Ingenieria en Sistemas"}
                        </Text>
                    </View>
                </View>

                <View style={styles.right}>
                    {showNotifications ? (
                        <Pressable style={styles.iconBtn} onPress={() => router.push("/notifications")}>
                            <Ionicons name="notifications-outline" size={21} color={theme.colors.textInverse} />
                        </Pressable>
                    ) : null}

                    {user ? (
                        <View style={styles.userArea}>
                            {isProfileScreen ? (
                                <Pressable style={styles.logoutButton} onPress={onLogout}>
                                    <Ionicons name="log-out-outline" size={18} color={theme.colors.textInverse} />
                                    <Text style={styles.logoutText}>Cerrar sesión</Text>
                                </Pressable>
                            ) : (
                                <Pressable style={styles.userButton} onPress={onOpenProfile}>
                                    {user.profileImageUrl ? (
                                        <Image source={{ uri: toAbsoluteUrl(user.profileImageUrl) }} style={styles.avatar} />
                                    ) : (
                                        <View style={styles.avatarFallback}>
                                            <Ionicons name="person" size={14} color={theme.colors.primary} />
                                        </View>
                                    )}
                                    <Text style={styles.userName} numberOfLines={1}>
                                        {displayName}
                                    </Text>
                                    <Ionicons name="chevron-forward" size={14} color={theme.colors.overlayWhite90} />
                                </Pressable>
                            )}
                        </View>
                    ) : (
                        <View style={styles.iconSpacer} />
                    )}
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    wrap: {
        paddingTop: STATUS_BAR_HEIGHT,
        zIndex: 50,
        elevation: 8,
        shadowColor: theme.colors.primary,
        shadowOpacity: 0.25,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: theme.spacing.md,
        paddingBottom: 14,
        paddingTop: 6,
    },
    left: { width: 44 },
    right: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 8,
        minWidth: 44,
    },
    titleWrap: {
        flex: 1,
        marginHorizontal: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 8,
    },
    titleTextWrap: {
        flex: 1,
    },
    brandLogo: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.overlayWhite20,
    },
    brandLogoFallback: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.overlayWhite32,
    },
    title: {
        color: theme.colors.textInverse,
        fontSize: 15,
        fontWeight: "800",
        flexShrink: 1,
        letterSpacing: 0.2,
    },
    facultyText: {
        color: theme.colors.overlayWhite88,
        fontSize: 11,
        marginTop: 1,
        fontWeight: "600",
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.overlayWhite15,
        alignItems: "center",
        justifyContent: "center",
    },
    iconSpacer: { width: 44 },
    userArea: { position: "relative", zIndex: 60 },
    userButton: {
        maxWidth: 190,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.overlayWhite15,
        borderWidth: 1,
        borderColor: theme.colors.overlayWhite20,
    },
    avatar: {
        width: 26,
        height: 26,
        borderRadius: 13,
        borderWidth: 1.5,
        borderColor: theme.colors.overlayWhite50,
    },
    avatarFallback: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: theme.colors.overlayWhite90,
        alignItems: "center",
        justifyContent: "center",
    },
    userName: { color: theme.colors.textInverse, fontWeight: "700", fontSize: 12, flexShrink: 1 },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 9,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.overlayWhite18,
        borderWidth: 1,
        borderColor: theme.colors.overlayWhite24,
    },
    logoutText: {
        color: theme.colors.textInverse,
        fontWeight: "700",
        fontSize: 12,
    },
});
