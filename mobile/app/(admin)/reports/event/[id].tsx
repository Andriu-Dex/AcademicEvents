import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { AppHeader } from "../../../../src/components/AppHeader";
import { fetchEventReportById } from "../../../../src/api/adminReports";
import { theme } from "../../../../src/shared/theme";

function PrettyJson({ value }: Readonly<{ value: unknown }>) {
    const text = (() => {
        try {
            return JSON.stringify(value, null, 2);
        } catch {
            return String(value);
        }
    })();

    return <Text style={styles.json}>{text}</Text>;
}

export default function AdminEventReportScreen() {
    const params = useLocalSearchParams<{ id?: string }>();
    const eventId = params.id ?? "";

    const query = useQuery({
        queryKey: ["admin-report-event", eventId],
        queryFn: () => fetchEventReportById(eventId),
        enabled: Boolean(eventId),
        staleTime: 60000,
    });

    return (
        <View style={styles.container}>
            <AppHeader title="Reporte de evento" showNotifications />
            {query.isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" />
                </View>
            ) : query.isError ? (
                <View style={styles.center}>
                    <Text style={styles.errorText}>No se pudo cargar el reporte.</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.title}>Detalle</Text>
                    <View style={styles.card}>
                        <PrettyJson value={query.data} />
                    </View>
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bgSecondary },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: theme.spacing.lg },
    errorText: { color: theme.colors.error, fontWeight: "900" },
    content: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: theme.spacing.xl },
    title: { fontSize: 16, fontWeight: "900", color: theme.colors.textPrimary },
    card: {
        backgroundColor: theme.colors.bgPrimary,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        padding: theme.spacing.md,
        ...theme.shadow.sm,
    },
    json: { color: theme.colors.textSecondary, fontWeight: "700", fontFamily: "monospace" },
});
