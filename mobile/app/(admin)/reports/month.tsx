import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "../../../src/components/AppHeader";
import { DataList, JsonPreview, MetricCard, SectionCard, formatCurrency, formatNumber } from "../../../src/components/AdminReportWidgets";
import { fetchMonthlyReport } from "../../../src/api/adminReports";
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
                title: `${index + 1}. ${String(item.nom_eve ?? item.name ?? "Evento")}`,
                subtitle: `${String(item.tip_eve ?? item.type ?? "")} · Inscritos: ${formatNumber(item.can_ins)} · Creador: ${String(item.nom_cre ?? "")} ${String(item.ape_cre ?? "")}`,
                right: formatCurrency(item.tot_eve ?? item.totalRevenue),
            })),
        [events]
    );

    return (
        <View style={styles.container}>
            <AppHeader title="Reportes por mes" showNotifications />

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
                    <SectionCard title="Seleccion de periodo">
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

                        <Text style={[styles.filterLabel, { marginTop: 8 }]}>Anio</Text>
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
                        <SectionCard title="Diagnostico">
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
});
