import { useEffect } from "react";
import { useRouter } from "expo-router";
import { Image, Text, View } from "react-native";
import { useThemedStyles, type ThemeTokens } from "../src/shared";
import { useAuthStore } from "../src/store/authStore";
import { isAdminRole } from "../src/utils/roles";

export default function IndexScreen() {
    const router = useRouter();
    const styles = useThemedStyles<any>(createStyles as any);
    const token = useAuthStore((s) => s.accessToken);
    const role = useAuthStore((s) => s.user?.role);

    useEffect(() => {
        const id = setTimeout(() => {
            if (!token) {
                router.replace("/home");
                return;
            }

            if (isAdminRole(role ?? null)) {
                router.replace("/(admin)");
                return;
            }

            router.replace("/(app)");
        }, 900);

        return () => clearTimeout(id);
    }, [router, token, role]);

    return (
        <View style={styles.container}>
            <Image
                source={require("../assets/brand/logo.png")}
                style={styles.logo}
                resizeMode="contain"
            />
            <Text style={styles.title}>Academic Events</Text>
            <Text style={styles.subtitle}>Cargando…</Text>
        </View>
    );
}

function createStyles(tokens: ThemeTokens) {
    return {
        container: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: tokens.colors.bgPrimary,
            padding: tokens.spacing.lg,
        },
        logo: {
            width: 220,
            height: 220,
        },
        title: {
            marginTop: 12,
            fontSize: 22,
            fontWeight: "900",
            color: tokens.colors.primary,
        },
        subtitle: {
            marginTop: 6,
            fontSize: 13,
            color: tokens.colors.textSecondary,
            fontWeight: "600",
        },
    };
}
