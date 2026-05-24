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
    fetchCertificatesDownloadsReport,
    fetchCertificatesEventsReport,
    fetchCertificatesSummaryReport,
} from "../../../src/api/adminReports";
import { downloadReportPdf } from "../../../src/utils/reportDownload";
import { joinReportText, pickReportText } from "../../../src/utils/reportText";
import { theme } from "../../../src/shared";

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

export default function AdminReportCertificatesScreen() {
    const [rangeDays, setRangeDays] = useState(30);
    const [loadingPdf, setLoadingPdf] = useState(false);

    const params = useMemo(() => {
        const now = new Date();
        const start = new Date(now);
        start.setDate(now.getDate() - rangeDays);
        return { fechaInicio: formatDateParam(start), fechaFin: formatDateParam(now) };
    }, [rangeDays]);

    const summaryQuery = useQuery({
        queryKey: ["admin-report-certificates-summary", params],
        queryFn: () => fetchCertificatesSummaryReport(params),
        staleTime: 30000,
        refetchInterval: 30000,
    });
    const downloadsQuery = useQuery({
        queryKey: ["admin-report-certificates-downloads", params],
        queryFn: () => fetchCertificatesDownloadsReport(params),
        staleTime: 30000,
        refetchInterval: 30000,
    });
    const eventsQuery = useQuery({
        queryKey: ["admin-report-certificates-events", params],
        queryFn: () => fetchCertificatesEventsReport(params),
        staleTime: 30000,
        refetchInterval: 30000,
    });

    const summary = (summaryQuery.data ?? {}) as Record<string, unknown>;

    const downloadsRows = useMemo(() => {
        const list = Array.isArray(downloadsQuery.data) ? (downloadsQuery.data as Array<Record<string, unknown>>) : [];
        return list.map((item) => ({
            title: pickReportText(item.periodo, "Periodo"),
            subtitle: joinReportText([`Emitidos: ${formatNumber(item.certificadosEmitidos)}`, `Descargados: ${formatNumber(item.certificadosDescargados)}`]),
            right: formatPercent(item.porcentajeDescarga),
        }));
    }, [downloadsQuery.data]);

    const eventRows = useMemo(() => {
        const list = Array.isArray(eventsQuery.data) ? (eventsQuery.data as Array<Record<string, unknown>>) : [];
        return list.map((item) => ({
            title: pickReportText(item.nombreEvento, "Evento"),
            subtitle: joinReportText([pickReportText(item.tipoEvento, ""), `${formatNumber(item.certificadosDescargados)} descargados`]),
            right: `${formatNumber(item.certificadosEmitidos)} emitidos`,
        }));
    }, [eventsQuery.data]);

    const downloadItems = useMemo(() => {
        const list = Array.isArray(downloadsQuery.data) ? (downloadsQuery.data as Array<Record<string, unknown>>) : [];
        return list.map((item) => ({
            title: pickReportText(item.periodo, "Periodo"),
            value: Math.max(0, Math.min(100, Number(item.porcentajeDescarga ?? 0) <= 1 ? Number(item.porcentajeDescarga ?? 0) * 100 : Number(item.porcentajeDescarga ?? 0))),
            helper: `${formatNumber(item.certificadosDescargados)} descargados de ${formatNumber(item.certificadosEmitidos)} emitidos`,
        }));
    }, [downloadsQuery.data]);

    const handleDownloadPdf = async () => {
        const fechaInicioStr = params.fechaInicio;
        const fechaFinStr = params.fechaFin;

        try {
            setLoadingPdf(true);
            await downloadReportPdf({
                endpoint: "/api/admin/reports/certificates/pdf",
                method: "post",
                data: { fechaInicio: fechaInicioStr, fechaFin: fechaFinStr },
                fileName: `Reporte_Certificados_${fechaInicioStr}_al_${fechaFinStr}.pdf`,
            });
        } finally {
            setLoadingPdf(false);
        }
    };

    const isLoading = summaryQuery.isLoading || downloadsQuery.isLoading || eventsQuery.isLoading;

    return (
        <View style={styles.container}>
            <AppHeader title="Reportes de certificados" showBack backHref="/(admin)/dashboard" showNotifications />

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.content}
                    refreshControl={
                        <RefreshControl
                            refreshing={summaryQuery.isRefetching || downloadsQuery.isRefetching || eventsQuery.isRefetching}
                            onRefresh={() => {
                                void summaryQuery.refetch();
                                void downloadsQuery.refetch();
                                void eventsQuery.refetch();
                            }}
                            tintColor={theme.colors.primary}
                        />
                    }
                >
                    <SectionCard title="Filtro de periodo">
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

                            <Pressable
                                style={[styles.actionButton, loadingPdf && styles.actionButtonDisabled]}
                                onPress={() => void handleDownloadPdf()}
                                disabled={loadingPdf}
                            >
                                <Ionicons name="download-outline" size={18} color={theme.colors.textInverse} />
                                <Text style={styles.actionButtonText}>{loadingPdf ? "Generando PDF..." : "Descargar Reporte PDF"}</Text>
                            </Pressable>
                        </View>
                    </SectionCard>

                    <SectionCard title="Resumen">
                        <View style={styles.metricsWrap}>
                            <MetricCard label="Total certificados" value={formatNumber(summary.totalCertificados)} />
                            <MetricCard label="Descargados" value={formatNumber(summary.certificadosDescargados)} />
                            <MetricCard label="Eventos" value={formatNumber(summary.eventosConCertificados)} />
                            <MetricCard label="Prom. por evento" value={formatNumber(summary.promedioCertificadosPorEvento)} />
                        </View>
                    </SectionCard>

                    <SectionCard title="Descargas por periodo">
                        <DataList rows={downloadsRows} />
                        <View style={styles.progressStack}>
                            {downloadItems.map((item) => (
                                <ProgressBar
                                    key={item.title}
                                    label={item.title}
                                    value={item.value}
                                    accentColor={theme.colors.success}
                                    helperText={item.helper}
                                />
                            ))}
                        </View>
                    </SectionCard>

                    <SectionCard title="Eventos con mayor emisión">
                        <DataList rows={eventRows} />
                    </SectionCard>

                    {(summaryQuery.isError || downloadsQuery.isError || eventsQuery.isError) ? (
                        <SectionCard title="Diagnóstico">
                            <JsonPreview
                                value={{
                                    summaryError: summaryQuery.error,
                                    downloadsError: downloadsQuery.error,
                                    eventsError: eventsQuery.error,
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
    progressStack: { gap: 10, marginTop: 2 },
});
