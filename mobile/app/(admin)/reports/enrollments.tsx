import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "../../../src/components/AppHeader";
import { DataList, JsonPreview, MetricCard, SectionCard, formatNumber } from "../../../src/components/AdminReportWidgets";
import {
    fetchEnrollmentsReportStatistics,
    fetchEnrollmentsReportTrends,
    fetchEnrollmentsReportValidations,
} from "../../../src/api/adminReports";
import { theme } from "../../../src/shared/theme";

const STATUS_OPTIONS = [
    "todos",
    "PENDIENTE",
    "ACEPTADA",
    "APROBADO",
    "RECHAZADA",
    "REPROBADO_ASISTENCIA",
    "REPROBADO_NOTA",
    "REPROBADO_TOTAL",
];

const DATE_RANGES = [
    { key: "30", label: "Ultimos 30 dias", days: 30 },
    { key: "90", label: "Ultimos 90 dias", days: 90 },
    { key: "180", label: "Ultimos 180 dias", days: 180 },
];

function formatDateParam(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export default function AdminReportEnrollmentsScreen() {
    const [status, setStatus] = useState("todos");
    const [rangeDays, setRangeDays] = useState(30);

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
            title: String(item.periodo ?? "Periodo"),
            subtitle: `Pendientes: ${formatNumber(item.pendientes)} · Aceptadas: ${formatNumber(item.aceptadas)} · Reprobadas: ${formatNumber(item.reprobadas)}`,
            right: `${formatNumber(item.total)} total`,
        }));
    }, [trendsQuery.data]);

    const validationRows = useMemo(() => {
        const list = Array.isArray(validationsQuery.data)
            ? (validationsQuery.data as Array<Record<string, unknown>>)
            : [];
        return list.map((item) => ({
            title: String(item.responsable ?? "Validador"),
            subtitle: `Aceptadas: ${formatNumber(item.aceptadas)} · Aprobadas: ${formatNumber(item.aprobadas)} · Rechazadas: ${formatNumber(item.rechazadas)} · Reprobadas: ${formatNumber(item.reprobadas)}`,
            right: `${formatNumber(item.totalValidadas)} val.`,
        }));
    }, [validationsQuery.data]);

    const isLoading = statsQuery.isLoading || trendsQuery.isLoading || validationsQuery.isLoading;

    return (
        <View style={styles.container}>
            <AppHeader title="Reportes de inscripciones" showNotifications />

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
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
                            tintColor={theme.colors.primary}
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
                                const selected = status === option;
                                return (
                                    <Pressable
                                        key={option}
                                        style={[styles.chip, selected && styles.chipSelected]}
                                        onPress={() => setStatus(option)}
                                    >
                                        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option}</Text>
                                    </Pressable>
                                );
                            })}
                        </View>
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

                    <SectionCard title="Analisis de validaciones">
                        <DataList rows={validationRows} />
                    </SectionCard>

                    {(statsQuery.isError || trendsQuery.isError || validationsQuery.isError) ? (
                        <SectionCard title="Diagnostico">
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

const styles = StyleSheet.create({
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
        backgroundColor: theme.colors.bgSecondary,
        paddingHorizontal: 12,
        paddingVertical: 7,
    },
    chipSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    chipText: { color: theme.colors.textSecondary, fontWeight: "700", fontSize: 12 },
    chipTextSelected: { color: theme.colors.textInverse },
});
