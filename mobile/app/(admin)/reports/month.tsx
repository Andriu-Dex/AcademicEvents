import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "../../../src/components/AppHeader";
import { DataList, JsonPreview, MetricCard, SectionCard, formatCurrency, formatNumber } from "../../../src/components/AdminReportWidgets";
import { fetchMonthlyReport } from "../../../src/api/adminReports";
import { downloadReportPdf } from "../../../src/utils/reportDownload";
import { joinReportText, pickReportText } from "../../../src/utils/reportText";
import { theme } from "../../../src/shared/theme";

const MONTHS = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
];

function getYears() {
    const current = new Date().getFullYear();
    const years: number[] = [];
    for (let y = current - 3; y <= current + 2; y += 1) years.push(y);
    return years;
}

export default function AdminReportMonthScreen() {
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [loadingPdf, setLoadingPdf] = useState(false);

    const years = useMemo(() => getYears(), []);

    const query = useQuery({
        queryKey: ["admin-report-month", year, month],
        queryFn: () => fetchMonthlyReport(year, month),
        staleTime: 30000,
        refetchInterval: 30000,
    });

    const payload = (query.data ?? {}) as Record<string, unknown>;
    const events = Array.isArray(payload.eve) ? (payload.eve as Array<Record<string, unknown>>) : [];

    const eventRows = useMemo(
        () =>
            events.map((item, index) => ({
                title: `${index + 1}. ${pickReportText(item.nom_eve ?? item.name, "Evento")}`,
                subtitle: joinReportText([
                    pickReportText(item.tip_eve ?? item.type, ""),
                    `Inscritos: ${formatNumber(item.can_ins)}`,
                    `Creador: ${joinReportText([pickReportText(item.nom_cre, ""), pickReportText(item.ape_cre, "")], " ")}`,
                ]),
                right: formatCurrency(item.tot_eve ?? item.totalRevenue),
            })),
        [events]
    );

    const handleDownloadMonthlyPdf = async () => {
        try {
            setLoadingPdf(true);
            await downloadReportPdf({
                endpoint: "/api/admin/reports/month/pdf",
                method: "post",
                data: { anio: year, mes: month },
                fileName: `Reporte_Mensual_${MONTHS[month - 1]}_${year}.pdf`,
            });
        } finally {
            setLoadingPdf(false);
        }
    };

    return (
        <View style={styles.container}>
            <AppHeader title="Reportes por mes" showBack backHref="/(admin)/dashboard" showNotifications />

            {query.isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.content}
                    refreshControl={
                        <RefreshControl
                            refreshing={query.isRefetching && !query.isLoading}
                            onRefresh={() => void query.refetch()}
                            tintColor={theme.colors.primary}
                        />
                    }
                >
                    <SectionCard title="Selección de periodo">
                        <Text style={styles.filterLabel}>Mes</Text>
                        <View style={styles.chipsWrap}>
                            {MONTHS.map((label, index) => {
                                const value = index + 1;
                                const selected = month === value;
                                return (
                                    <Pressable
                                        key={label}
                                        style={[styles.chip, selected && styles.chipSelected]}
                                        onPress={() => setMonth(value)}
                                    >
                                        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
                                    </Pressable>
                                );
                            })}
                        </View>

                        <Text style={[styles.filterLabel, { marginTop: 8 }]}>Año</Text>
                        <View style={styles.chipsWrap}>
                            {years.map((optionYear) => {
                                const selected = year === optionYear;
                                return (
                                    <Pressable
                                        key={optionYear}
                                        style={[styles.chip, selected && styles.chipSelected]}
                                        onPress={() => setYear(optionYear)}
                                    >
                                        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{optionYear}</Text>
                                    </Pressable>
                                );
                            })}
                        </View>

                        <Pressable
                            style={[styles.actionButton, loadingPdf && styles.actionButtonDisabled]}
                            onPress={() => void handleDownloadMonthlyPdf()}
                            disabled={loadingPdf}
                        >
                            <Text style={styles.actionButtonText}>{loadingPdf ? "Generando PDF..." : "Descargar Reporte PDF"}</Text>
                        </Pressable>
                    </SectionCard>

                    <SectionCard title="Resumen mensual">
                        <View style={styles.metricsWrap}>
                            <MetricCard label="Eventos" value={formatNumber(events.length)} />
                            <MetricCard label="Total del mes" value={formatCurrency(payload.tot_tod_eve)} />
                        </View>
                    </SectionCard>

                    <SectionCard title="Detalle por evento">
                        <DataList rows={eventRows} />
                    </SectionCard>

                    {query.isError ? (
                        <SectionCard title="Diagnóstico">
                            <JsonPreview value={{ error: query.error, year, month }} />
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
        marginTop: theme.spacing.sm,
        borderRadius: theme.radius.full,
        paddingVertical: 13,
        backgroundColor: theme.colors.primary,
        alignItems: "center",
    },
    actionButtonDisabled: { opacity: 0.65 },
    actionButtonText: { color: theme.colors.textInverse, fontWeight: "900", fontSize: 13 },
});
