import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "../../../src/components/AppHeader";
import { DataList, JsonPreview, MetricCard, SectionCard, formatNumber, formatPercent } from "../../../src/components/AdminReportWidgets";
import {
    fetchAttendanceComparativeReport,
    fetchAttendanceEventReport,
    fetchAttendanceNoShowsReport,
    fetchReportEventsForSelector,
} from "../../../src/api/adminReports";
import { theme } from "../../../src/shared/theme";

const EVENT_TYPES = ["todos", "COURSE", "CONGRESS", "WEBINAR", "TALK", "SOCIALIZATION"];

export default function AdminReportAttendanceScreen() {
    const [selectedEventId, setSelectedEventId] = useState("");
    const [selectedType, setSelectedType] = useState("todos");

    const eventsQuery = useQuery({
        queryKey: ["admin-report-events-selector"],
        queryFn: fetchReportEventsForSelector,
        staleTime: 60000,
        refetchInterval: 45000,
    });

    const eventQuery = useQuery({
        queryKey: ["admin-report-attendance-event", selectedEventId],
        queryFn: () => fetchAttendanceEventReport(selectedEventId),
        enabled: Boolean(selectedEventId),
        staleTime: 30000,
        refetchInterval: 20000,
    });

    const comparativeQuery = useQuery({
        queryKey: ["admin-report-attendance-comparative", selectedType],
        queryFn: () => fetchAttendanceComparativeReport(selectedType),
        staleTime: 30000,
        refetchInterval: 30000,
    });

    const noShowsQuery = useQuery({
        queryKey: ["admin-report-attendance-no-shows", selectedType],
        queryFn: () => fetchAttendanceNoShowsReport(selectedType),
        staleTime: 30000,
        refetchInterval: 30000,
    });

    const comparativeRows = useMemo(() => {
        const list = Array.isArray(comparativeQuery.data)
            ? (comparativeQuery.data as Array<Record<string, unknown>>)
            : [];
        return list.map((item) => ({
            title: String(item.nombreEvento ?? "Evento"),
            subtitle: `${String(item.tipoEvento ?? "")} · ${formatNumber(item.totalInscritos)} inscritos`,
            right: formatPercent(item.porcentajeAsistencia),
        }));
    }, [comparativeQuery.data]);

    const noShowRows = useMemo(() => {
        const list = Array.isArray(noShowsQuery.data) ? (noShowsQuery.data as Array<Record<string, unknown>>) : [];
        return list.map((item) => ({
            title: String(item.tipoEvento ?? "Tipo"),
            subtitle: `${formatNumber(item.cantidadEventos)} eventos · ${formatNumber(item.totalInscritos)} inscritos`,
            right: formatPercent(item.porcentajeNoShows),
        }));
    }, [noShowsQuery.data]);

    const eventPayload = (eventQuery.data ?? {}) as Record<string, unknown>;
    const detailRows = Array.isArray(eventPayload.detalles)
        ? (eventPayload.detalles as Array<Record<string, unknown>>).map((item) => ({
            title: String(item.usuario ?? "Estudiante"),
            subtitle: `Estado: ${String(item.estado ?? "-")}`,
            right: formatPercent(item.porcentajeAsistencia),
        }))
        : [];

    const isLoading =
        eventsQuery.isLoading || comparativeQuery.isLoading || noShowsQuery.isLoading || (selectedEventId && eventQuery.isLoading);

    return (
        <View style={styles.container}>
            <AppHeader title="Reportes de asistencia" showNotifications />

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.content}
                    refreshControl={
                        <RefreshControl
                            refreshing={
                                comparativeQuery.isRefetching ||
                                noShowsQuery.isRefetching ||
                                eventQuery.isRefetching ||
                                eventsQuery.isRefetching
                            }
                            onRefresh={() => {
                                void comparativeQuery.refetch();
                                void noShowsQuery.refetch();
                                void eventQuery.refetch();
                                void eventsQuery.refetch();
                            }}
                            tintColor={theme.colors.primary}
                        />
                    }
                >
                    <SectionCard title="Filtros">
                        <Text style={styles.filterLabel}>Evento</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                            <Pressable
                                style={[styles.chip, !selectedEventId && styles.chipSelected]}
                                onPress={() => setSelectedEventId("")}
                            >
                                <Text style={[styles.chipText, !selectedEventId && styles.chipTextSelected]}>Todos</Text>
                            </Pressable>
                            {(eventsQuery.data ?? []).slice(0, 30).map((event) => {
                                const selected = selectedEventId === event.id;
                                return (
                                    <Pressable
                                        key={event.id}
                                        style={[styles.chip, selected && styles.chipSelected]}
                                        onPress={() => setSelectedEventId(event.id)}
                                    >
                                        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{event.name}</Text>
                                    </Pressable>
                                );
                            })}
                        </ScrollView>

                        <Text style={[styles.filterLabel, { marginTop: 10 }]}>Tipo</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                            {EVENT_TYPES.map((type) => {
                                const selected = selectedType === type;
                                return (
                                    <Pressable
                                        key={type}
                                        style={[styles.chip, selected && styles.chipSelected]}
                                        onPress={() => setSelectedType(type)}
                                    >
                                        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{type}</Text>
                                    </Pressable>
                                );
                            })}
                        </ScrollView>
                    </SectionCard>

                    {selectedEventId && eventQuery.data ? (
                        <SectionCard title="Asistencia del evento seleccionado">
                            <View style={styles.metricsWrap}>
                                <MetricCard label="Inscritos" value={formatNumber(eventPayload.totalInscritos)} />
                                <MetricCard label="Asistieron" value={formatNumber(eventPayload.totalAsistencias)} />
                                <MetricCard label="No asistieron" value={formatNumber(eventPayload.totalNoAsistieron)} />
                                <MetricCard label="% Asistencia" value={formatPercent(eventPayload.porcentajeAsistencia)} />
                            </View>
                            <DataList rows={detailRows} />
                        </SectionCard>
                    ) : null}

                    <SectionCard title="Comparativa de eventos">
                        <DataList rows={comparativeRows} />
                    </SectionCard>

                    <SectionCard title="Analisis de no-shows">
                        <DataList rows={noShowRows} />
                    </SectionCard>

                    {(comparativeQuery.isError || noShowsQuery.isError || eventQuery.isError || eventsQuery.isError) ? (
                        <SectionCard title="Diagnostico">
                            <JsonPreview
                                value={{
                                    comparativeError: comparativeQuery.error,
                                    noShowsError: noShowsQuery.error,
                                    eventError: eventQuery.error,
                                    selectorError: eventsQuery.error,
                                }}
                            />
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
    metricsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    filterLabel: { color: theme.colors.textPrimary, fontWeight: "800", fontSize: 13 },
    chipsRow: { gap: 8 },
    chip: {
        borderRadius: theme.radius.full,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        backgroundColor: theme.colors.bgSecondary,
        paddingHorizontal: 12,
        paddingVertical: 7,
    },
    chipSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    chipText: { color: theme.colors.textSecondary, fontWeight: "700", fontSize: 12 },
    chipTextSelected: { color: theme.colors.textInverse },
});
