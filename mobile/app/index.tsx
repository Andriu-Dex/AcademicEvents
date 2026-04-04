import { useEffect } from "react";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";
import { theme } from "../src/shared/theme";

export default function IndexScreen() {
    const router = useRouter();

    useEffect(() => {
        const id = setTimeout(() => {
            router.replace("/home");
        }, 900);

        return () => clearTimeout(id);
    }, [router]);

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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.bgPrimary,
        padding: theme.spacing.lg,
    },
    logo: {
        width: 220,
        height: 220,
    },
    title: {
        marginTop: 12,
        fontSize: 22,
        fontWeight: "900",
        color: theme.colors.primary,
    },
    subtitle: {
        marginTop: 6,
        fontSize: 13,
        color: theme.colors.textSecondary,
        fontWeight: "600",
    },
});
