import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "../../../src/components/AppHeader";
import { DataList, JsonPreview, MetricCard, SectionCard, formatNumber } from "../../../src/components/AdminReportWidgets";
import {
    fetchEnrollmentsReportStatistics,
    fetchEnrollmentsReportTrends,
    fetchEnrollmentsReportValidations,
} from "../../../src/api/adminReports";
import { downloadReportPdf } from "../../../src/utils/reportDownload";
import { joinReportText, pickReportText } from "../../../src/utils/reportText";
import { useAppTheme, useThemedStyles, type ThemeTokens } from "../../../src/shared";

const STATUS_OPTIONS = [
    { value: "todos", label: "Todos" },
    { value: "PENDIENTE", label: "Pendiente" },
    { value: "ACEPTADA", label: "Aceptada" },
    { value: "APROBADO", label: "Aprobada" },
    { value: "RECHAZADA", label: "Rechazada" },
    { value: "REPROBADO_ASISTENCIA", label: "Reprobada por asistencia" },
    { value: "REPROBADO_NOTA", label: "Reprobada por nota" },
    { value: "REPROBADO_TOTAL", label: "Reprobada total" },
];

const DATE_RANGES = [
    { key: "30", label: "Últimos 30 días", days: 30 },
    { key: "90", label: "Últimos 90 días", days: 90 },
    { key: "180", label: "Últimos 180 días", days: 180 },
];

function formatDateParam(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export default function AdminReportEnrollmentsScreen() {
    const { tokens } = useAppTheme();
    const styles = useThemedStyles(createStyles);

    const [status, setStatus] = useState("todos");
    const [rangeDays, setRangeDays] = useState(30);
    const [loadingPdf, setLoadingPdf] = useState(false);

    const rangeStart = useMemo(() => {
        const now = new Date();
        const start = new Date(now);
        start.setDate(now.getDate() - rangeDays);
        return formatDateParam(start);
    }, [rangeDays]);

    const rangeEnd = useMemo(() => formatDateParam(new Date()), []);

    const statsQuery = useQuery({
        queryKey: ["admin-report-enrollments-stats", rangeStart, rangeEnd, status],
        queryFn: () => fetchEnrollmentsReportStatistics({ fechaInicio: rangeStart, fechaFin: rangeEnd, estado: status }),
        staleTime: 30000,
        refetchInterval: 30000,
    });
    const trendsQuery = useQuery({
        queryKey: ["admin-report-enrollments-trends", rangeStart, rangeEnd],
        queryFn: () => fetchEnrollmentsReportTrends({ fechaInicio: rangeStart, fechaFin: rangeEnd }),
        staleTime: 30000,
        refetchInterval: 30000,
    });
    const validationsQuery = useQuery({
        queryKey: ["admin-report-enrollments-validations", rangeStart, rangeEnd],
        queryFn: () => fetchEnrollmentsReportValidations({ fechaInicio: rangeStart, fechaFin: rangeEnd }),
        staleTime: 30000,
        refetchInterval: 30000,
    });

    const stats = (statsQuery.data ?? {}) as Record<string, unknown>;

    const trendRows = useMemo(() => {
        const list = Array.isArray(trendsQuery.data) ? (trendsQuery.data as Array<Record<string, unknown>>) : [];
        return list.map((item) => ({
            title: pickReportText(item.periodo, "Periodo"),
            subtitle: joinReportText([
                `Pendientes: ${formatNumber(item.pendientes)}`,
                `Aceptadas: ${formatNumber(item.aceptadas)}`,
                `Reprobadas: ${formatNumber(item.reprobadas)}`,
            ]),
            right: `${formatNumber(item.total)} total`,
        }));
    }, [trendsQuery.data]);

    const validationRows = useMemo(() => {
        const list = Array.isArray(validationsQuery.data)
            ? (validationsQuery.data as Array<Record<string, unknown>>)
            : [];
        return list.map((item) => ({
            title: pickReportText(item.responsable, "Validador"),
            subtitle: joinReportText([
                `Aceptadas: ${formatNumber(item.aceptadas)}`,
                `Aprobadas: ${formatNumber(item.aprobadas)}`,
                `Rechazadas: ${formatNumber(item.rechazadas)}`,
                `Reprobadas: ${formatNumber(item.reprobadas)}`,
            ]),
            right: `${formatNumber(item.totalValidadas)} val.`,
        }));
    }, [validationsQuery.data]);

    const handleDownloadPdf = async () => {
        if (!rangeStart || !rangeEnd) return;

        try {
            setLoadingPdf(true);
            await downloadReportPdf({
                endpoint: "/api/admin/reports/enrollments/pdf",
                method: "post",
                data: {
                    fechaInicio: rangeStart,
                    fechaFin: rangeEnd,
                    estado: status,
                },
                fileName: `Reporte_Inscripciones_${rangeStart}_al_${rangeEnd}.pdf`,
            });
        } finally {
            setLoadingPdf(false);
        }
    };

    const isLoading = statsQuery.isLoading || trendsQuery.isLoading || validationsQuery.isLoading;

    return (
        <View style={styles.container}>
            <AppHeader title="Reportes de inscripciones" showBack backHref="/(admin)/dashboard" showNotifications />

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={tokens.colors.primary} />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.content}
                    refreshControl={
                        <RefreshControl
                            refreshing={statsQuery.isRefetching || trendsQuery.isRefetching || validationsQuery.isRefetching}
                            onRefresh={() => {
                                void statsQuery.refetch();
                                void trendsQuery.refetch();
                                void validationsQuery.refetch();
                            }}
                            tintColor={tokens.colors.primary}
                        />
                    }
                >
                    <SectionCard title="Filtros">
                        <Text style={styles.filterLabel}>Rango</Text>
                        <View style={styles.chipsWrap}>
                            {DATE_RANGES.map((range) => {
                                const selected = rangeDays === range.days;
                                return (
                                    <Pressable
                                        key={range.key}
                                        style={[styles.chip, selected && styles.chipSelected]}
                                        onPress={() => setRangeDays(range.days)}
                                    >
                                        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{range.label}</Text>
                                    </Pressable>
                                );
                            })}
                        </View>

                        <Text style={[styles.filterLabel, { marginTop: 8 }]}>Estado</Text>
                        <View style={styles.chipsWrap}>
                            {STATUS_OPTIONS.map((option) => {
                                const selected = status === option.value;
                                return (
                                    <Pressable
                                        key={option.value}
                                        style={[styles.chip, selected && styles.chipSelected]}
                                        onPress={() => setStatus(option.value)}
                                    >
                                        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option.label}</Text>
                                    </Pressable>
                                );
                            })}
                        </View>

                        <Pressable
                            style={[styles.actionButton, (loadingPdf || !rangeStart || !rangeEnd) && styles.actionButtonDisabled]}
                            onPress={() => void handleDownloadPdf()}
                            disabled={loadingPdf || !rangeStart || !rangeEnd}
                        >
                            <Ionicons name="download-outline" size={18} color={tokens.colors.onPrimary} />
                            <Text style={styles.actionButtonText}>{loadingPdf ? "Generando PDF..." : "Descargar Reporte PDF"}</Text>
                        </Pressable>
                    </SectionCard>

                    <SectionCard title="Estado de inscripciones">
                        <View style={styles.metricsWrap}>
                            <MetricCard label="Total" value={formatNumber(stats.total)} />
                            <MetricCard label="Pendientes" value={formatNumber(stats.pendientes)} />
                            <MetricCard label="Aceptadas" value={formatNumber(stats.aceptadas)} />
                            <MetricCard label="Aprobadas" value={formatNumber(stats.aprobadas)} />
                            <MetricCard label="Rechazadas" value={formatNumber(stats.rechazadas)} />
                            <MetricCard label="Reprobadas" value={formatNumber(stats.reprobadas)} />
                        </View>
                    </SectionCard>

                    <SectionCard title="Tendencias por periodo">
                        <DataList rows={trendRows} />
                    </SectionCard>

                    <SectionCard title="Análisis de validaciones">
                        <DataList rows={validationRows} />
                    </SectionCard>

                    {(statsQuery.isError || trendsQuery.isError || validationsQuery.isError) ? (
                        <SectionCard title="Diagnóstico">
                            <JsonPreview
                                value={{
                                    statsError: statsQuery.error,
                                    trendsError: trendsQuery.error,
                                    validationsError: validationsQuery.error,
                                }}
                            />
                        </SectionCard>
                    ) : null}
                </ScrollView>
            )}
        </View>
    );
}

function createStyles(theme: ThemeTokens) {
    return {
    container: { flex: 1, backgroundColor: theme.colors.bgSecondary },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    content: { padding: theme.spacing.md, gap: theme.spacing.md, paddingBottom: theme.spacing.xl },
    metricsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    filterLabel: { color: theme.colors.textPrimary, fontWeight: "800", fontSize: 13 },
    chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: {
        borderRadius: theme.radius.full,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        backgroundColor: theme.colors.bgCard,
        paddingHorizontal: 12,
        paddingVertical: 7,
    },
    chipSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    chipText: { color: theme.colors.textSecondary, fontWeight: "700", fontSize: 12 },
    chipTextSelected: { color: theme.colors.onPrimary },
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
    actionButtonText: { color: theme.colors.onPrimary, fontWeight: "900", fontSize: 13 },
    };
}
