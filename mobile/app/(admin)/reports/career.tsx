import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "../../../src/components/AppHeader";
import { DataList, JsonPreview, MetricCard, SectionCard, formatNumber, formatPercent } from "../../../src/components/AdminReportWidgets";
import { fetchAllCareers } from "../../../src/api/adminCareers";
import { fetchCareerReportEvents, fetchCareerReportStatistics } from "../../../src/api/adminReports";
import { theme } from "../../../src/shared/theme";

export default function AdminReportCareerScreen() {
    const [selectedCareerId, setSelectedCareerId] = useState("");

    const careersQuery = useQuery({
        queryKey: ["admin-careers-report-pick"],
        queryFn: fetchAllCareers,
        staleTime: 60000,
        refetchInterval: 45000,
    });

    useEffect(() => {
        if (selectedCareerId || !careersQuery.data?.length) return;
        setSelectedCareerId(careersQuery.data[0].id);
    }, [careersQuery.data, selectedCareerId]);

    const statsQuery = useQuery({
        queryKey: ["admin-report-career-stats", selectedCareerId],
        queryFn: () => fetchCareerReportStatistics(selectedCareerId),
        enabled: Boolean(selectedCareerId),
        staleTime: 60000,
        refetchInterval: 30000,
    });

    const eventsQuery = useQuery({
        queryKey: ["admin-report-career-events", selectedCareerId],
        queryFn: () => fetchCareerReportEvents(selectedCareerId),
        enabled: Boolean(selectedCareerId),
        staleTime: 60000,
        refetchInterval: 30000,
    });

    const stats = (statsQuery.data ?? {}) as Record<string, unknown>;
    const comparisonRows = useMemo(() => {
        const list = Array.isArray(stats.comparativaCarreras) ? (stats.comparativaCarreras as Array<Record<string, unknown>>) : [];
        return list.map((item) => ({
            title: String(item.nom_car ?? "Carrera"),
            subtitle: `${formatNumber(item.totalInscripciones)} inscripciones · ${formatNumber(item.totalEstudiantes)} estudiantes`,
            right: formatPercent(item.porcentajeParticipacion),
        }));
    }, [stats.comparativaCarreras]);

    const eventRows = useMemo(() => {
        const list = Array.isArray(eventsQuery.data) ? (eventsQuery.data as Array<Record<string, unknown>>) : [];
        return list.map((item) => ({
            title: String(item.nom_eve ?? item.nombreEvento ?? "Evento"),
            subtitle: `${String(item.tip_eve ?? item.tipoEvento ?? "")} · Asistencia ${formatPercent(item.porcentajeAsistencia)}`,
            right: `${formatNumber(item.totalInscritos)} insc.`,
        }));
    }, [eventsQuery.data]);

    const isLoading = careersQuery.isLoading || statsQuery.isLoading || eventsQuery.isLoading;

    return (
        <View style={styles.container}>
            <AppHeader title="Reportes por carrera" showNotifications />

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.content}
                    refreshControl={
                        <RefreshControl
                            refreshing={careersQuery.isRefetching || statsQuery.isRefetching || eventsQuery.isRefetching}
                            onRefresh={() => {
                                void careersQuery.refetch();
                                void statsQuery.refetch();
                                void eventsQuery.refetch();
                            }}
                            tintColor={theme.colors.primary}
                        />
                    }
                >
                    <SectionCard title="Seleccionar carrera">
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                            {(careersQuery.data ?? []).map((career) => {
                                const selected = selectedCareerId === career.id;
                                return (
                                    <Pressable
                                        key={career.id}
                                        style={[styles.chip, selected && styles.chipSelected]}
                                        onPress={() => setSelectedCareerId(career.id)}
                                    >
                                        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{career.name}</Text>
                                    </Pressable>
                                );
                            })}
                        </ScrollView>
                    </SectionCard>

                    <SectionCard title="Resumen de participacion">
                        <View style={styles.metricsWrap}>
                            <MetricCard label="Estudiantes" value={formatNumber(stats.totalEstudiantes)} />
                            <MetricCard label="Inscripciones" value={formatNumber(stats.totalInscripciones)} />
                            <MetricCard label="Eventos" value={formatNumber(stats.eventosParticipados)} />
                            <MetricCard label="Participacion" value={formatPercent(stats.porcentajeParticipacion)} />
                        </View>
                    </SectionCard>

                    <SectionCard title="Comparativa con otras carreras">
                        <DataList rows={comparisonRows} />
                    </SectionCard>

                    <SectionCard title="Eventos mas populares">
                        <DataList rows={eventRows} />
                    </SectionCard>

                    {(statsQuery.isError || eventsQuery.isError) ? (
                        <SectionCard title="Diagnostico">
                            <JsonPreview value={{ statsError: statsQuery.error, eventsError: eventsQuery.error }} />
                        </SectionCard>
                    ) : null}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bgSecondary },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    content: { padding: theme.spacing.md, gap: theme.spacing.md, paddingBottom: theme.spacing.xl },
    chipsRow: { gap: 8 },
    chip: {
        borderRadius: theme.radius.full,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        backgroundColor: theme.colors.bgSecondary,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    chipSelected: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    chipText: { color: theme.colors.textSecondary, fontWeight: "700", fontSize: 12 },
    chipTextSelected: { color: theme.colors.textInverse },
    metricsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
