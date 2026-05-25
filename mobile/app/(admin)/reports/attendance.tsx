/* eslint-disable complexity */
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View, TextInput } from "react-native";
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
    fetchReportEventsPaginated,
    type PaginatedResponse,
    type AdminReportEventSummary,
} from "../../../src/api/adminReports";
import { downloadReportPdf } from "../../../src/utils/reportDownload";
import { pickReportText } from "../../../src/utils/reportText";
import { useAppTheme, useThemedStyles, type ThemeTokens } from "../../../src/shared";

const EVENT_TYPES = [
    { value: "todos", label: "Todos los tipos" },
    { value: "COURSE", label: "Curso" },
    { value: "CONGRESS", label: "Congreso" },
    { value: "WEBINAR", label: "Webinar" },
    { value: "TALK", label: "Charla" },
    { value: "SOCIALIZATION", label: "Socialización" },
];

function EventFilters({
    styles,
    tokens,
    selectedEventId,
    setSelectedEventId,
    eventSearch,
    setEventSearch,
    eventsQuery,
    setEventsPage,
    selectedType,
    setSelectedType,
    loadingPdf,
    handleDownloadPdf,
}: any) {
    return (
        <SectionCard title="Filtros">
            <Text style={styles.filterLabel}>Evento</Text>
            <View style={{ marginTop: 8, marginBottom: 8 }}>
                <TextInput
                    style={{
                        backgroundColor: tokens.colors.bgCard,
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        color: tokens.colors.textPrimary,
                    }}
                    placeholder="Buscar evento por nombre..."
                    placeholderTextColor={tokens.colors.textTertiary}
                    value={eventSearch}
                    onChangeText={(t: string) => {
                        setEventSearch(t);
                        setEventsPage(1);
                    }}
                />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                <Pressable
                    style={[styles.chip, !selectedEventId && styles.chipSelected]}
                    onPress={() => {
                        setSelectedEventId("");
                        setEventSearch("");
                    }}
                >
                    <Text style={[styles.chipText, !selectedEventId && styles.chipTextSelected]}>Todos</Text>
                </Pressable>
                {(Array.isArray(eventsQuery.data?.data) ? eventsQuery.data.data : []).map((event: any) => {
                    const selected = selectedEventId === event.id;
                    return (
                        <Pressable
                            key={event.id}
                            style={[styles.chip, selected && styles.chipSelected]}
                            onPress={() => {
                                setSelectedEventId(event.id);
                                setEventSearch(event.name);
                            }}
                        >
                            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{event.name}</Text>
                        </Pressable>
                    );
                })}
                {eventsQuery.isFetching ? (
                    <View style={[styles.chip, { justifyContent: "center" }]}>
                        <ActivityIndicator color={tokens.colors.primary} />
                    </View>
                ) : null}
            </ScrollView>
            {eventsQuery.data?.pagination?.hasNextPage ? (
                <Pressable
                    style={[styles.actionButton, { marginTop: 8 }]}
                    onPress={() => setEventsPage((p: number) => p + 1)}
                >
                    <Text style={[styles.actionButtonText]}>Cargar más eventos</Text>
                </Pressable>
            ) : null}

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
                onPress={handleDownloadPdf}
                disabled={loadingPdf}
            >
                <Ionicons name="download-outline" size={18} color={tokens.colors.onPrimary} />
                <Text style={styles.actionButtonText}>{loadingPdf ? "Generando PDF..." : "Descargar Reporte PDF"}</Text>
            </Pressable>
        </SectionCard>
    );
}

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

function getAttendanceAccent(value: number, colors: ThemeTokens["colors"]) {
    if (value >= 80) return colors.success;
    if (value >= 50) return colors.warning;
    return colors.error;
}

function composeReportLabel(title: string, subtitle: string) {
    return subtitle ? [title, subtitle].join(" · ") : title;
}

function formatDateShort(dateRaw: unknown) {
    if (!dateRaw) return "";
    if (dateRaw instanceof Date) {
        return dateRaw.toLocaleDateString("es-EC", { day: "2-digit", month: "2-digit", year: "numeric" });
    }
    if (typeof dateRaw === "string" || typeof dateRaw === "number") {
        const s = String(dateRaw).trim();
        if (!s) return "";
        const d = new Date(s);
        if (!Number.isFinite(d.getTime())) return s;
        return d.toLocaleDateString("es-EC", { day: "2-digit", month: "2-digit", year: "numeric" });
    }
    return "";
}

function normalizeTipoKey(raw: unknown) {
    if (raw === null || raw === undefined) return "otro";
    let candidate = "";
    if (typeof raw === "string" || typeof raw === "number") {
        candidate = String(raw);
    } else if (typeof raw === "object" && raw !== null) {
        const o = raw as Record<string, unknown>;
        const candidates = ["tipoEvento", "tipo", "name", "nombre", "tipo_evento"];
        for (const k of candidates) {
            const v = o[k];
            if (typeof v === "string" || typeof v === "number") {
                candidate = String(v);
                break;
            }
        }
    }

    let s = candidate.normalize("NFKC").trim();
    if (!s) return "otro";
    // remove diacritics
    s = s.normalize("NFD").replace(/\p{M}/gu, "");
    // replace non letters/numbers with space
    s = s.replace(/[^\p{L}\p{N}\s]+/gu, " ");
    // collapse repeated words: "course course" -> "course"
    s = s.replace(/\b(\w+)\b(?:\s+\1\b)+/giu, "$1");
    // collapse spaces and lowercase
    s = s.replace(/\s+/g, " ").trim().toLowerCase();
    return s || "otro";
}

function humanizeTipoKey(key: string) {
    if (!key) return "Otro";
    return key
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

export default function AdminReportAttendanceScreen() {
    const { tokens } = useAppTheme();
    const styles: any = useThemedStyles(createStyles as any);

    const [selectedEventId, setSelectedEventId] = useState("");
    const [eventSearch, setEventSearch] = useState("");
    const [debouncedEventSearch, setDebouncedEventSearch] = useState("");
    const [eventsPage, setEventsPage] = useState(1);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedEventSearch(eventSearch.trim()), 400);
        return () => clearTimeout(t);
    }, [eventSearch]);
    const [selectedType, setSelectedType] = useState("todos");
    const [loadingPdf, setLoadingPdf] = useState(false);

    // Paginated server-side events search for selector (autocomplete)
    const eventsQuery = useQuery<PaginatedResponse<AdminReportEventSummary> | undefined>({
        queryKey: ["admin-report-events-paginated", eventsPage, debouncedEventSearch],
        queryFn: () => fetchReportEventsPaginated(eventsPage, 20, debouncedEventSearch),
        staleTime: 30000,
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

    /* comparativeRows removed — using progress bars only */

    /* noShowRows removed — show only ProgressBar entries in the UI to avoid duplicates */

    const comparativeItems = useMemo(() => {
        const list = Array.isArray(comparativeQuery.data)
            ? (comparativeQuery.data as Array<Record<string, unknown>>)
            : [];

        return list.map((item) => {
            const title = pickReportText(item.nombreEvento, "Evento");
            const tipo = pickReportText(item.tipoEvento, "");
            const fecha = formatDateShort(item.fechaEvento ?? item.fecha ?? item.startDate ?? item.fec_ini_eve);
            const inscritos = Number(item.totalInscritos ?? item.total_inscritos ?? item.inscritos ?? item.totalInscripcion ?? 0) || 0;
            const asistencias = Number(item.totalAsistencias ?? item.total_asistencias ?? item.asistencias ?? item.totalAsist ?? 0) || 0;
            const pct = inscritos > 0 ? asistencias / inscritos : toPercentValue(item.porcentajeAsistencia ?? 0) / 100;

            return {
                label: [title, tipo, fecha].filter(Boolean).join(" · "),
                value: toPercentValue(pct * 100) || toPercentValue(item.porcentajeAsistencia),
                helper: `${formatNumber(inscritos)} inscritos · ${formatNumber(asistencias)} asist.`,
                raw: item,
            };
        });
    }, [comparativeQuery.data]);

    const noShowItems = useMemo(() => {
        const list = Array.isArray(noShowsQuery.data) ? (noShowsQuery.data as Array<Record<string, unknown>>) : [];
        const map = new Map<string, { displayName: string; cantidadEventos: number; totalInscritos: number; totalNoShows: number }>();
        for (const item of list) {
            const tipoRaw = pickReportText(item.tipoEvento, "Tipo") || "Otro";
            const tipoKey = normalizeTipoKey(tipoRaw);
            // display will be derived from normalized key to ensure consistency
            const cantidadEventos = Number(item.cantidadEventos ?? 0) || 0;
            const totalInscritos = Number(item.totalInscritos ?? 0) || 0;
            const totalNoShows = Number(item.totalNoShows ?? 0) || 0;
            const existing = map.get(tipoKey);
            if (existing) {
                existing.cantidadEventos += cantidadEventos;
                existing.totalInscritos += totalInscritos;
                existing.totalNoShows += totalNoShows;
            } else {
                map.set(tipoKey, { displayName: humanizeTipoKey(tipoKey), cantidadEventos, totalInscritos, totalNoShows });
            }
        }

        return Array.from(map.entries()).map(([_, agg]) => ({
            title: agg.displayName || "Otro",
            subtitle: `${formatNumber(agg.cantidadEventos)} eventos`,
            value: toPercentValue(agg.totalInscritos > 0 ? agg.totalNoShows / agg.totalInscritos : 0),
            helper: `${formatNumber(agg.cantidadEventos)} eventos · ${formatNumber(agg.totalInscritos)} inscritos · ${formatNumber(agg.totalNoShows)} no-shows`,
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
                    <ActivityIndicator size="large" color={tokens.colors.primary} />
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
                            tintColor={tokens.colors.primary}
                        />
                    }
                >
                    <EventFilters
                        styles={styles}
                        tokens={tokens}
                        selectedEventId={selectedEventId}
                        setSelectedEventId={setSelectedEventId}
                        eventSearch={eventSearch}
                        setEventSearch={setEventSearch}
                        eventsQuery={eventsQuery}
                        setEventsPage={setEventsPage}
                        selectedType={selectedType}
                        setSelectedType={setSelectedType}
                        loadingPdf={loadingPdf}
                        handleDownloadPdf={handleDownloadPdf}
                    />

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
                                accentColor={tokens.colors.success}
                                helperText={`${formatNumber(eventPayload.totalAsistencias)} asistencias de ${formatNumber(eventPayload.totalInscritos)} inscritos`}
                            />
                            <DataList rows={detailRows} />
                        </SectionCard>
                    ) : null}

                    <SectionCard title="Comparativa de eventos">
                        <View style={styles.progressStack}>
                            {comparativeItems.map((item, index) => {
                                const accentColor = getAttendanceAccent(item.value, tokens.colors);
                                return (
                                    <ProgressBar
                                        key={`${item.label}-${index}`}
                                        label={item.label}
                                        value={item.value}
                                        accentColor={accentColor}
                                        helperText={item.helper}
                                    />
                                );
                            })}
                        </View>
                    </SectionCard>

                    <SectionCard title="Análisis de no-shows">
                        <View style={styles.progressStack}>
                            {noShowItems.map((item, index) => (
                                <ProgressBar
                                    key={`${item.title}-${item.subtitle}-${index}`}
                                    label={composeReportLabel(item.title, item.subtitle)}
                                    value={item.value}
                                    accentColor={tokens.colors.error}
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

function createStyles(theme: ThemeTokens) {
    return {
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
        progressStack: { gap: 10, marginTop: 2 },
    };
}
