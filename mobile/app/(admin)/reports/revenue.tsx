import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "../../../src/components/AppHeader";
import { DataList, JsonPreview, MetricCard, SectionCard, formatCurrency, formatNumber, formatPercent } from "../../../src/components/AdminReportWidgets";
import {
    fetchRevenueByType,
    fetchRevenueGeneralMetrics,
    fetchRevenuePeriodTrends,
    fetchRevenueProfitableEvents,
    fetchRevenueRejectedReceipts,
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
const PAYMENT_STATES = [
    { value: "todos", label: "Todos los estados" },
    { value: "CONFIRMED", label: "Confirmado" },
    { value: "PENDING", label: "Pendiente" },
    { value: "REJECTED", label: "Rechazado" },
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

export default function AdminReportRevenueScreen() {
    const [rangeDays, setRangeDays] = useState(30);
    const [eventType, setEventType] = useState("todos");
    const [paymentState, setPaymentState] = useState("todos");
    const [loadingPdf, setLoadingPdf] = useState(false);

    const params = useMemo(() => {
        const now = new Date();
        const start = new Date(now);
        start.setDate(now.getDate() - rangeDays);
        return {
            fechaDesde: formatDateParam(start),
            fechaHasta: formatDateParam(now),
            tipoEvento: eventType,
            estadoPago: paymentState,
        };
    }, [rangeDays, eventType, paymentState]);

    const metricsQuery = useQuery({
        queryKey: ["admin-report-revenue-metrics", params],
        queryFn: () => fetchRevenueGeneralMetrics(params),
        staleTime: 30000,
        refetchInterval: 30000,
    });
    const byTypeQuery = useQuery({
        queryKey: ["admin-report-revenue-by-type", params],
        queryFn: () => fetchRevenueByType(params),
        staleTime: 30000,
        refetchInterval: 30000,
    });
    const profitableQuery = useQuery({
        queryKey: ["admin-report-revenue-profitable", params],
        queryFn: () => fetchRevenueProfitableEvents(params),
        staleTime: 30000,
        refetchInterval: 30000,
    });
    const trendsQuery = useQuery({
        queryKey: ["admin-report-revenue-trends", params],
        queryFn: () => fetchRevenuePeriodTrends(params),
        staleTime: 30000,
        refetchInterval: 30000,
    });
    const rejectedQuery = useQuery({
        queryKey: ["admin-report-revenue-rejected", params],
        queryFn: () => fetchRevenueRejectedReceipts({
            fechaDesde: params.fechaDesde,
            fechaHasta: params.fechaHasta,
            tipoEvento: params.tipoEvento,
        }),
        staleTime: 30000,
        refetchInterval: 30000,
    });

    const byTypeRows = useMemo(() => {
        const list = Array.isArray(byTypeQuery.data) ? (byTypeQuery.data as Array<Record<string, unknown>>) : [];
        return list.map((item) => ({
            title: pickReportText(item.tipoEvento, "Tipo"),
            subtitle: joinReportText([`${formatNumber(item.cantidadEventos)} eventos`, `${formatNumber(item.inscripcionesTotales)} inscripciones`]),
            right: formatCurrency(item.revenueTotal),
        }));
    }, [byTypeQuery.data]);

    const profitableRows = useMemo(() => {
        const list = Array.isArray(profitableQuery.data)
            ? (profitableQuery.data as Array<Record<string, unknown>>)
            : [];
        return list.map((item) => ({
            title: pickReportText(item.nombreEvento, "Evento"),
            subtitle: joinReportText([pickReportText(item.tipoEvento, ""), `Conversión ${formatPercent(item.tasaConversion)}`]),
            right: formatCurrency(item.revenueTotal),
        }));
    }, [profitableQuery.data]);

    const trendRows = useMemo(() => {
        const list = Array.isArray(trendsQuery.data) ? (trendsQuery.data as Array<Record<string, unknown>>) : [];
        return list.map((item) => ({
            title: pickReportText(item.periodo, "Periodo"),
            subtitle: joinReportText([`${formatNumber(item.cantidadEventos)} eventos`, `${formatNumber(item.inscripcionesTotales)} inscripciones`]),
            right: formatCurrency(item.revenueTotal),
        }));
    }, [trendsQuery.data]);

    const rejectedRows = useMemo(() => {
        const list = Array.isArray(rejectedQuery.data) ? (rejectedQuery.data as Array<Record<string, unknown>>) : [];
        return list.map((item) => ({
            title: pickReportText(item.fechaPeriodo, "Periodo"),
            subtitle: `Rechazados: ${formatNumber(item.totalRechazados)}`,
            right: formatCurrency(item.impactoRevenue),
        }));
    }, [rejectedQuery.data]);

    const handleDownloadPdf = async () => {
        if (!params.fechaDesde || !params.fechaHasta) return;

        try {
            setLoadingPdf(true);
            await downloadReportPdf({
                endpoint: "/api/admin/reportes-ingresos/pdf",
                method: "post",
                data: {
                    ...params,
                    fechaDesde: params.fechaDesde,
                    fechaHasta: params.fechaHasta,
                },
                fileName: `Reporte_Ingresos_${params.fechaDesde}_al_${params.fechaHasta}.pdf`,
            });
        } finally {
            setLoadingPdf(false);
        }
    };

    const isLoading =
        metricsQuery.isLoading || byTypeQuery.isLoading || profitableQuery.isLoading || trendsQuery.isLoading || rejectedQuery.isLoading;

    return (
        <View style={styles.container}>
            <AppHeader title="Reportes de ingresos" showBack backHref="/(admin)/dashboard" showNotifications />

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
                                metricsQuery.isRefetching ||
                                byTypeQuery.isRefetching ||
                                profitableQuery.isRefetching ||
                                trendsQuery.isRefetching ||
                                rejectedQuery.isRefetching
                            }
                            onRefresh={() => {
                                void metricsQuery.refetch();
                                void byTypeQuery.refetch();
                                void profitableQuery.refetch();
                                void trendsQuery.refetch();
                                void rejectedQuery.refetch();
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

                        <Text style={[styles.filterLabel, { marginTop: 8 }]}>Tipo evento</Text>
                        <View style={styles.chipsWrap}>
                            {EVENT_TYPES.map((type) => {
                                const selected = eventType === type.value;
                                return (
                                    <Pressable
                                        key={type.value}
                                        style={[styles.chip, selected && styles.chipSelected]}
                                        onPress={() => setEventType(type.value)}
                                    >
                                        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{type.label}</Text>
                                    </Pressable>
                                );
                            })}
                        </View>

                        <Text style={[styles.filterLabel, { marginTop: 8 }]}>Estado pago</Text>
                        <View style={styles.chipsWrap}>
                            {PAYMENT_STATES.map((state) => {
                                const selected = paymentState === state.value;
                                return (
                                    <Pressable
                                        key={state.value}
                                        style={[styles.chip, selected && styles.chipSelected]}
                                        onPress={() => setPaymentState(state.value)}
                                    >
                                        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{state.label}</Text>
                                    </Pressable>
                                );
                            })}
                        </View>

                        <Pressable
                            style={[styles.actionButton, (loadingPdf || isLoading || !params.fechaDesde || !params.fechaHasta) && styles.actionButtonDisabled]}
                            onPress={() => void handleDownloadPdf()}
                            disabled={loadingPdf || isLoading || !params.fechaDesde || !params.fechaHasta}
                        >
                            <Ionicons name="download-outline" size={18} color={theme.colors.textInverse} />
                            <Text style={styles.actionButtonText}>{loadingPdf ? "Generando PDF..." : "Descargar Reporte PDF"}</Text>
                        </Pressable>
                    </SectionCard>

                    <SectionCard title="Métricas generales">
                        <View style={styles.metricsWrap}>
                            <MetricCard label="Ingreso total" value={formatCurrency(metricsQuery.data?.revenueTotal)} />
                            <MetricCard label="Confirmados" value={formatCurrency(metricsQuery.data?.pagosConfirmados)} />
                            <MetricCard label="Pendientes" value={formatCurrency(metricsQuery.data?.pagosPendientes)} />
                            <MetricCard label="Inscripciones" value={formatNumber(metricsQuery.data?.totalInscripciones)} />
                            <MetricCard label="Rechazados" value={formatNumber(metricsQuery.data?.comprobantesRechazados)} />
                            <MetricCard label="Conversión" value={formatPercent(metricsQuery.data?.tasaConversion)} />
                        </View>
                    </SectionCard>

                    <SectionCard title="Ingresos por tipo">
                        <DataList rows={byTypeRows} />
                    </SectionCard>

                    <SectionCard title="Eventos más rentables">
                        <DataList rows={profitableRows} />
                    </SectionCard>

                    <SectionCard title="Tendencias por periodo">
                        <DataList rows={trendRows} />
                    </SectionCard>

                    <SectionCard title="Comprobantes rechazados">
                        <DataList rows={rejectedRows} />
                    </SectionCard>

                    {(metricsQuery.isError || byTypeQuery.isError || profitableQuery.isError || trendsQuery.isError || rejectedQuery.isError) ? (
                        <SectionCard title="Diagnóstico">
                            <JsonPreview
                                value={{
                                    metricsError: metricsQuery.error,
                                    byTypeError: byTypeQuery.error,
                                    profitableError: profitableQuery.error,
                                    trendsError: trendsQuery.error,
                                    rejectedError: rejectedQuery.error,
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
});
