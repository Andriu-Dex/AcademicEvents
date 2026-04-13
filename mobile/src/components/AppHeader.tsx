import { useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useSegments } from "expo-router";
import { toAbsoluteUrl } from "../api/client";
import { useAuthStore } from "../store/authStore";
import { theme } from "../shared/theme";

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
        <View style={styles.wrap}>
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
                        <Ionicons name="notifications-outline" size={20} color={theme.colors.textInverse} />
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
                                <View style={styles.avatarFallback} />
                            )}
                            <Text style={styles.userName} numberOfLines={1}>
                                {displayName}
                            </Text>
                            <Ionicons name={menuOpen ? "chevron-up" : "chevron-down"} size={16} color={theme.colors.textInverse} />
                        </Pressable>

                        {menuOpen ? (
                            <View style={styles.menu}>
                                <Pressable style={styles.menuItem} onPress={onLogout}>
                                    <Ionicons name="log-out-outline" size={18} color={theme.colors.textPrimary} />
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
    );
}

const styles = StyleSheet.create({
    wrap: {
        backgroundColor: theme.colors.primary,
        paddingTop: 54,
        paddingBottom: 12,
        paddingHorizontal: theme.spacing.md,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 50,
        elevation: 6,
    },
    left: { width: 40 },
    right: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 10,
        minWidth: 40,
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
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: theme.colors.bgSecondary,
    },
    title: {
        color: theme.colors.textInverse,
        fontSize: 16,
        fontWeight: "800",
        flexShrink: 1,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.primaryDark,
        alignItems: "center",
        justifyContent: "center",
    },
    iconSpacer: { width: 40, height: 40 },
    userArea: { position: "relative", zIndex: 60 },
    userButton: {
        maxWidth: 220,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: theme.colors.primaryDark,
    },
    avatar: { width: 26, height: 26, borderRadius: 13, backgroundColor: theme.colors.bgSecondary },
    avatarFallback: { width: 26, height: 26, borderRadius: 13, backgroundColor: theme.colors.bgSecondary },
    userName: { color: theme.colors.textInverse, fontWeight: "800", fontSize: 12, flexShrink: 1 },
    menu: {
        position: "absolute",
        right: 0,
        top: 44,
        backgroundColor: theme.colors.bgElevated,
        borderRadius: theme.radius.sm,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        overflow: "hidden",
        minWidth: 180,
        zIndex: 999,
        elevation: 12,
        ...theme.shadow.sm,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    menuText: { color: theme.colors.textPrimary, fontWeight: "700" },
});
