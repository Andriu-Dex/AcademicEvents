import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../src/store/authStore";
import { theme } from "../../src/shared/theme";

export default function HomeScreen() {
    const user = useAuthStore((state) => state.user);
    const clearSession = useAuthStore((state) => state.clearSession);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(14)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, slideAnim]);

    return (
        <LinearGradient colors={["#f4f6fb", "#e3e8f0"]} style={styles.container}>
            <Animated.View
                style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Bienvenido</Text>
                        <Text style={styles.subtitle}>{user?.firstName ?? ""}</Text>
                    </View>
                    <Pressable style={styles.logout} onPress={clearSession}>
                        <Ionicons name="log-out-outline" size={20} color={theme.colors.primary} />
                    </Pressable>
                </View>

                <View style={styles.heroCard}>
                    <Text style={styles.heroTitle}>Tu panel esta listo</Text>
                    <Text style={styles.heroText}>
                        Aqui veras eventos, inscripciones y certificados. Vamos
                        habilitando funciones paso a paso.
                    </Text>
                </View>

                <View style={styles.grid}>
                    {[
                        { icon: "calendar-outline", label: "Eventos" },
                        { icon: "book-outline", label: "Inscripciones" },
                        { icon: "document-text-outline", label: "Certificados" },
                        { icon: "notifications-outline", label: "Notificaciones" },
                    ].map((item) => (
                        <View key={item.label} style={styles.card}>
                            <Ionicons name={item.icon as never} size={22} color={theme.colors.primary} />
                            <Text style={styles.cardText}>{item.label}</Text>
                            <Text style={styles.cardMeta}>En construccion</Text>
                        </View>
                    ))}
                </View>
            </Animated.View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: theme.spacing.lg,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: theme.spacing.lg,
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: theme.colors.textPrimary,
    },
    subtitle: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    logout: {
        borderWidth: 1,
        borderColor: theme.colors.borderSecondary,
        padding: 10,
        borderRadius: 12,
        backgroundColor: theme.colors.bgPrimary,
        ...theme.shadow.sm,
    },
    heroCard: {
        backgroundColor: theme.colors.bgPrimary,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
        ...theme.shadow.md,
    },
    heroTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: theme.colors.primary,
        marginBottom: 8,
    },
    heroText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        lineHeight: 20,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: theme.spacing.sm,
    },
    card: {
        width: "48%",
        backgroundColor: theme.colors.bgPrimary,
        padding: theme.spacing.md,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        ...theme.shadow.sm,
    },
    cardText: {
        marginTop: 8,
        fontWeight: "600",
        color: theme.colors.textPrimary,
    },
    cardMeta: {
        marginTop: 4,
        fontSize: 12,
        color: theme.colors.textTertiary,
    },
});
