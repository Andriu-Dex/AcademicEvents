import { useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useSegments } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { toAbsoluteUrl } from "../api/client";
import { useAuthStore } from "../store/authStore";
import { theme } from "../shared/theme";

const STATUS_BAR_HEIGHT = Platform.OS === "ios" ? 50 : 28;

export function AppHeader({
    title,
    showBack,
    showNotifications,
    showBrandLogo,
}: Readonly<{ title: string; showBack?: boolean; showNotifications?: boolean; showBrandLogo?: boolean }>) {
    const router = useRouter();
    const segments = useSegments();
    const user = useAuthStore((s) => s.user);
    const clearSession = useAuthStore((s) => s.clearSession);
    const [menuOpen, setMenuOpen] = useState(false);
    const isAdminArea = segments.includes("(admin)");
    const shouldShowBrandLogo = showBrandLogo ?? !isAdminArea;

    const displayName = useMemo(() => {
        if (!user) return "";
        const firstName = (user.firstName ?? "").trim();
        return firstName || user.email;
    }, [user]);

    const onLogout = async () => {
        setMenuOpen(false);
        await clearSession();
        router.replace("/home");
    };

    return (
        <LinearGradient
            colors={theme.gradients.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.wrap}
        >
            <View style={styles.content}>
                <View style={styles.left}>
                    {showBack ? (
                        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={20} color={theme.colors.textInverse} />
                        </Pressable>
                    ) : (
                        <View style={styles.iconSpacer} />
                    )}
                </View>

                <View style={styles.titleWrap}>
                    {shouldShowBrandLogo ? (
                        <Image source={require("../../assets/brand/logo.png")} style={styles.brandLogo} />
                    ) : null}
                    <Text style={styles.title} numberOfLines={1}>
                        {title}
                    </Text>
                </View>

                <View style={styles.right}>
                    {showNotifications ? (
                        <Pressable style={styles.iconBtn} onPress={() => router.push("/notifications")}>
                            <Ionicons name="notifications-outline" size={21} color={theme.colors.textInverse} />
                        </Pressable>
                    ) : null}

                    {user ? (
                        <View style={styles.userArea}>
                            <Pressable
                                style={styles.userButton}
                                onPress={() => setMenuOpen((v) => !v)}
                            >
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
                                <Ionicons name={menuOpen ? "chevron-up" : "chevron-down"} size={14} color="rgba(255,255,255,0.8)" />
                            </Pressable>

                            {menuOpen ? (
                                <View style={styles.menu}>
                                    <Pressable style={styles.menuItem} onPress={onLogout}>
                                        <View style={styles.menuIconWrap}>
                                            <Ionicons name="log-out-outline" size={18} color={theme.colors.error} />
                                        </View>
                                        <Text style={styles.menuText}>Cerrar sesión</Text>
                                    </Pressable>
                                </View>
                            ) : null}
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
        shadowColor: "#8a1538",
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
        justifyContent: "center",
        gap: 8,
    },
    brandLogo: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.2)",
    },
    title: {
        color: theme.colors.textInverse,
        fontSize: 17,
        fontWeight: "800",
        flexShrink: 1,
        letterSpacing: 0.2,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.15)",
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
        backgroundColor: "rgba(255,255,255,0.15)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
    },
    avatar: {
        width: 26,
        height: 26,
        borderRadius: 13,
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.5)",
    },
    avatarFallback: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: "rgba(255,255,255,0.9)",
        alignItems: "center",
        justifyContent: "center",
    },
    userName: { color: theme.colors.textInverse, fontWeight: "700", fontSize: 12, flexShrink: 1 },
    menu: {
        position: "absolute",
        right: 0,
        top: 48,
        backgroundColor: theme.colors.bgElevated,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        overflow: "hidden",
        minWidth: 186,
        zIndex: 999,
        ...theme.shadow.md,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 14,
        paddingVertical: 14,
    },
    menuIconWrap: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: theme.colors.errorLight,
        alignItems: "center",
        justifyContent: "center",
    },
    menuText: { color: theme.colors.textPrimary, fontWeight: "700", fontSize: 14 },
});
