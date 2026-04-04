import { useMemo } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFeaturedEvents } from "../../src/features/events/useFeaturedEvents";
import { AppHeader } from "../../src/components/AppHeader";
import { useAuthStore } from "../../src/store/authStore";
import { theme } from "../../src/shared/theme";

function formatDate(raw: string) {
    if (!raw) return "";
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return raw;
    return date.toLocaleDateString("es-EC", { year: "numeric", month: "short", day: "2-digit" });
}

export default function AppHomeScreen() {
    const router = useRouter();
    const user = useAuthStore((s) => s.user);
    const { data: featured, isLoading, error } = useFeaturedEvents();

    const greeting = useMemo(() => {
        const name = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
        return name || user?.email || "";
    }, [user]);

    return (
        <View style={styles.container}>
            <AppHeader title="Inicio" showNotifications />
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.hero}>
                    <Text style={styles.heroTitle}>Bienvenido</Text>
                    <Text style={styles.heroSubtitle}>{greeting}</Text>

                    <View style={styles.heroActions}>
                        <Pressable style={styles.primaryBtn} onPress={() => router.push("/events")}>
                            <Ionicons name="calendar-outline" size={18} color={theme.colors.textInverse} />
                            <Text style={styles.primaryBtnText}>Ver eventos</Text>
                        </Pressable>
                        <Pressable style={styles.secondaryBtn} onPress={() => router.push("/registrations")}>
                            <Ionicons name="clipboard-outline" size={18} color={theme.colors.primary} />
                            <Text style={styles.secondaryBtnText}>Mis inscripciones</Text>
                        </Pressable>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Eventos destacados</Text>
                {isLoading ? (
                    <ActivityIndicator />
                ) : error ? (
                    <Text style={styles.errorText}>No se pudieron cargar destacados.</Text>
                ) : featured && featured.length > 0 ? (
                    <View style={styles.list}>
                        {featured.slice(0, 6).map((evt) => (
                            <View key={evt.id} style={styles.eventCard}>
                                <View style={styles.eventRow}>
                                    <Ionicons name="star" size={16} color={theme.colors.utaAccent} />
                                    <Text style={styles.eventTitle} numberOfLines={2}>
                                        {evt.title}
                                    </Text>
                                </View>
                                <Text style={styles.eventMeta} numberOfLines={1}>
                                    {formatDate(evt.date)} · {evt.location}
                                </Text>
                                {evt.description ? (
                                    <Text style={styles.eventDesc} numberOfLines={2}>
                                        {evt.description}
                                    </Text>
                                ) : null}
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text style={styles.mutedText}>Sin eventos destacados por el momento.</Text>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bgSecondary },
    content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xl },
    hero: {
        backgroundColor: theme.colors.bgPrimary,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        ...theme.shadow.sm,
    },
    heroTitle: { fontSize: 18, fontWeight: "900", color: theme.colors.textPrimary },
    heroSubtitle: { marginTop: 4, color: theme.colors.textSecondary, fontWeight: "700" },
    heroActions: { marginTop: theme.spacing.md, gap: theme.spacing.sm },
    primaryBtn: {
        height: 46,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.md,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 10,
    },
    primaryBtnText: { color: theme.colors.textInverse, fontWeight: "900" },
    secondaryBtn: {
        height: 46,
        backgroundColor: theme.colors.bgPrimary,
        borderRadius: theme.radius.md,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 10,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
    },
    secondaryBtnText: { color: theme.colors.primary, fontWeight: "900" },
    sectionTitle: { marginTop: theme.spacing.lg, fontSize: 16, fontWeight: "900", color: theme.colors.textPrimary },
    list: { marginTop: theme.spacing.sm, gap: theme.spacing.sm },
    eventCard: {
        backgroundColor: theme.colors.bgPrimary,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        ...theme.shadow.sm,
    },
    eventRow: { flexDirection: "row", gap: 8, alignItems: "center" },
    eventTitle: { flex: 1, fontWeight: "900", color: theme.colors.textPrimary },
    eventMeta: { marginTop: 6, color: theme.colors.textSecondary, fontWeight: "700" },
    eventDesc: { marginTop: 6, color: theme.colors.textSecondary, lineHeight: 18 },
    mutedText: { marginTop: theme.spacing.sm, color: theme.colors.textSecondary, fontWeight: "700" },
    errorText: { marginTop: theme.spacing.sm, color: theme.colors.error, fontWeight: "800" },
});
