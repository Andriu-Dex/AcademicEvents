import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "../../../src/components/AppHeader";
import {
    DataList,
    JsonPreview,
    MetricCard,
    ProgressBar,
    SectionCard,
    formatNumber,
    formatPercent,
} from "../../../src/components/AdminReportWidgets";
import {
    fetchAttendanceComparativeReport,
    fetchAttendanceEventReport,
    fetchAttendanceNoShowsReport,
    fetchReportEventsForSelector,
} from "../../../src/api/adminReports";
import { downloadReportPdf } from "../../../src/utils/reportDownload";
import { joinReportText, pickReportText } from "../../../src/utils/reportText";
import { theme } from "../../../src/shared/theme";

const EVENT_TYPES = [
    { value: "todos", label: "Todos los tipos" },
    { value: "COURSE", label: "Curso" },
    { value: "CONGRESS", label: "Congreso" },
    { value: "WEBINAR", label: "Webinar" },
    { value: "TALK", label: "Charla" },
    { value: "SOCIALIZATION", label: "Socialización" },
];

function toPercentValue(value: unknown) {
    const numericValue = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(numericValue)) return 0;
    return numericValue <= 1 ? numericValue * 100 : numericValue;
}

function getErrorMessage(error: unknown) {
    if (!error) return undefined;
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    try {
        return JSON.stringify(error);
    } catch {
        return "Error desconocido";
    }
}

function getAttendanceAccent(value: number) {
    if (value >= 80) return theme.colors.success;
    if (value >= 50) return theme.colors.warning;
    return theme.colors.error;
}

function composeReportLabel(title: string, subtitle: string) {
    return subtitle ? [title, subtitle].join(" · ") : title;
}

export default function AdminReportAttendanceScreen() {
    const [selectedEventId, setSelectedEventId] = useState("");
    const [selectedType, setSelectedType] = useState("todos");
    const [loadingPdf, setLoadingPdf] = useState(false);

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
            title: pickReportText(item.nombreEvento, "Evento"),
            subtitle: joinReportText([pickReportText(item.tipoEvento, ""), `${formatNumber(item.totalInscritos)} inscritos`]),
            right: formatPercent(item.porcentajeAsistencia),
        }));
    }, [comparativeQuery.data]);

    const noShowRows = useMemo(() => {
        const list = Array.isArray(noShowsQuery.data) ? (noShowsQuery.data as Array<Record<string, unknown>>) : [];
        return list.map((item) => ({
            title: pickReportText(item.tipoEvento, "Tipo"),
            subtitle: joinReportText([`${formatNumber(item.cantidadEventos)} eventos`, `${formatNumber(item.totalInscritos)} inscritos`]),
            right: formatPercent(item.porcentajeNoShows),
        }));
    }, [noShowsQuery.data]);

    const comparativeItems = useMemo(() => {
        const list = Array.isArray(comparativeQuery.data)
            ? (comparativeQuery.data as Array<Record<string, unknown>>)
            : [];

        return list.map((item) => ({
            title: pickReportText(item.nombreEvento, "Evento"),
            subtitle: pickReportText(item.tipoEvento, ""),
            value: toPercentValue(item.porcentajeAsistencia),
            helper: `${formatNumber(item.totalInscritos)} inscritos`,
        }));
    }, [comparativeQuery.data]);

    const noShowItems = useMemo(() => {
        const list = Array.isArray(noShowsQuery.data) ? (noShowsQuery.data as Array<Record<string, unknown>>) : [];

        return list.map((item) => ({
            title: pickReportText(item.tipoEvento, "Tipo"),
            subtitle: `${formatNumber(item.cantidadEventos)} eventos`,
            value: toPercentValue(item.porcentajeNoShows),
            helper: `${formatNumber(item.totalInscritos)} inscritos`,
        }));
    }, [noShowsQuery.data]);

    const eventPayload = (eventQuery.data ?? {}) as Record<string, unknown>;
    const detailRows = Array.isArray(eventPayload.detalles)
        ? (eventPayload.detalles as Array<Record<string, unknown>>).map((item) => ({
            title: pickReportText(item.usuario, "Estudiante"),
            subtitle: `Estado: ${pickReportText(item.estado, "-")}`,
            right: formatPercent(item.porcentajeAsistencia),
        }))
        : [];

    const handleDownloadPdf = async () => {
        try {
            setLoadingPdf(true);

            const payload = selectedEventId ? { evento: selectedEventId } : { tipo: selectedType };
            let fileSuffix = selectedEventId;
            if (!fileSuffix) {
                fileSuffix = selectedType === "todos" ? "General" : selectedType;
            }
            const fileName = `Reporte_Asistencia_${fileSuffix}.pdf`;

            await downloadReportPdf({
                endpoint: "/api/admin/reports/attendance/pdf",
                method: "post",
                data: payload,
                fileName,
            });
        } finally {
            setLoadingPdf(false);
        }
    };

    const isLoading =
        eventsQuery.isLoading || comparativeQuery.isLoading || noShowsQuery.isLoading || (selectedEventId && eventQuery.isLoading);

    return (
        <View style={styles.container}>
            <AppHeader title="Reportes de asistencia" showBack backHref="/(admin)/dashboard" showNotifications />

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
                                const selected = selectedType === type.value;
                                return (
                                    <Pressable
                                        key={type.value}
                                        style={[styles.chip, selected && styles.chipSelected]}
                                        onPress={() => setSelectedType(type.value)}
                                    >
                                        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{type.label}</Text>
                                    </Pressable>
                                );
                            })}
                        </ScrollView>

                        <Pressable
                            style={[styles.actionButton, loadingPdf && styles.actionButtonDisabled]}
                            onPress={() => void handleDownloadPdf()}
                            disabled={loadingPdf}
                        >
                            <Ionicons name="download-outline" size={18} color={theme.colors.textInverse} />
                            <Text style={styles.actionButtonText}>{loadingPdf ? "Generando PDF..." : "Descargar Reporte PDF"}</Text>
                        </Pressable>
                    </SectionCard>

                    {selectedEventId && eventQuery.data ? (
                        <SectionCard title="Asistencia del evento seleccionado">
                            <View style={styles.metricsWrap}>
                                <MetricCard label="Inscritos" value={formatNumber(eventPayload.totalInscritos)} />
                                <MetricCard label="Asistieron" value={formatNumber(eventPayload.totalAsistencias)} />
                                <MetricCard label="No asistieron" value={formatNumber(eventPayload.totalNoAsistieron)} />
                                <MetricCard label="% Asistencia" value={formatPercent(eventPayload.porcentajeAsistencia)} />
                            </View>
                            <ProgressBar
                                label="Asistencia del evento"
                                value={toPercentValue(eventPayload.porcentajeAsistencia)}
                                accentColor={theme.colors.success}
                                helperText={`${formatNumber(eventPayload.totalAsistencias)} asistencias de ${formatNumber(eventPayload.totalInscritos)} inscritos`}
                            />
                            <DataList rows={detailRows} />
                        </SectionCard>
                    ) : null}

                    <SectionCard title="Comparativa de eventos">
                        <DataList rows={comparativeRows} />
                        <View style={styles.progressStack}>
                            {comparativeItems.map((item, index) => {
                                const accentColor = getAttendanceAccent(item.value);
                                const label = composeReportLabel(item.title, item.subtitle);
                                return (
                                    <ProgressBar
                                        key={`${item.title}-${item.subtitle}-${index}`}
                                        label={label}
                                        value={item.value}
                                        accentColor={accentColor}
                                        helperText={item.helper}
                                    />
                                );
                            })}
                        </View>
                    </SectionCard>

                    <SectionCard title="Análisis de no-shows">
                        <DataList rows={noShowRows} />
                        <View style={styles.progressStack}>
                            {noShowItems.map((item, index) => (
                                <ProgressBar
                                    key={`${item.title}-${item.subtitle}-${index}`}
                                    label={composeReportLabel(item.title, item.subtitle)}
                                    value={item.value}
                                    accentColor={theme.colors.error}
                                    helperText={item.helper}
                                />
                            ))}
                        </View>
                    </SectionCard>

                    {(comparativeQuery.isError || noShowsQuery.isError || eventQuery.isError || eventsQuery.isError) ? (
                        <SectionCard title="Diagnóstico">
                            <JsonPreview
                                value={{
                                    comparativeError: getErrorMessage(comparativeQuery.error),
                                    noShowsError: getErrorMessage(noShowsQuery.error),
                                    eventError: getErrorMessage(eventQuery.error),
                                    selectorError: getErrorMessage(eventsQuery.error),
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
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginTop: theme.spacing.sm,
        borderRadius: theme.radius.full,
        paddingVertical: 13,
        backgroundColor: theme.colors.primary,
    },
    actionButtonDisabled: { opacity: 0.65 },
    actionButtonText: { color: theme.colors.textInverse, fontWeight: "900", fontSize: 13 },
    progressStack: { gap: 10, marginTop: 2 },
});
