import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator, Image, RefreshControl, ScrollView, Text, View } from "react-native";
import { AppHeader } from "../../../../src/components/AppHeader";
import { DataList, JsonPreview, SectionCard, formatNumber } from "../../../../src/components/AdminReportWidgets";
import { fetchEventReportById } from "../../../../src/api/adminReports";
import { toAbsoluteUrl } from "../../../../src/api/client";
import { useAppTheme, useThemedStyles, type ThemeTokens } from "../../../../src/shared";

const DEFAULT_EVENT_IMAGE = "https://via.placeholder.com/320x90?text=Sin+Imagen";

function formatDate(raw: unknown) {
    if (typeof raw !== "string" || !raw) return "-";
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return raw;
    return date.toLocaleDateString("es-EC", { year: "numeric", month: "short", day: "2-digit" });
}

export default function AdminEventReportScreen() {
    const { tokens } = useAppTheme();
    const styles = useThemedStyles(createStyles);

    const params = useLocalSearchParams<{ id?: string }>();
    const eventId = params.id ?? "";

    const query = useQuery({
        queryKey: ["admin-report-event", eventId],
        queryFn: () => fetchEventReportById(eventId),
        enabled: Boolean(eventId),
        staleTime: 20000,
        refetchInterval: 25000,
    });

    const payload = (query.data ?? {}) as Record<string, unknown>;
    const header = (payload.cab_eve && typeof payload.cab_eve === "object"
        ? (payload.cab_eve as Record<string, unknown>)
        : {}) as Record<string, unknown>;
    const creator = (header.cre_eve && typeof header.cre_eve === "object"
        ? (header.cre_eve as Record<string, unknown>)
        : {}) as Record<string, unknown>;

    const enrollments = Array.isArray(payload.det_ins) ? (payload.det_ins as Array<Record<string, unknown>>) : [];
    const detailsRows = enrollments.map((ins, index) => {
        const fullName = `${String(ins.nom_usu ?? ins.firstName ?? "")} ${String(ins.ape_usu ?? ins.lastName ?? "")}`.trim();
        const attendance = formatNumber(ins.por_asi_fin_usu ?? ins.finalAttendancePercent ?? 0);
        const gradeRaw = ins.not_fin_usu ?? ins.finalGrade;
        const gradeSuffix = gradeRaw === null || gradeRaw === undefined ? "" : ` · Nota: ${String(gradeRaw)}`;
        return {
            title: `${index + 1}. ${fullName || "Participante"}`,
            subtitle: `Cedula: ${String(ins.ced_usu ?? ins.idNumber ?? "-")} · Asistencia: ${attendance}%${gradeSuffix}`,
            right: String(ins.est_ins ?? ins.status ?? "-"),
        };
    });

    if (query.isLoading) {
        return (
            <View style={styles.container}>
                <AppHeader title="Reporte de evento" showNotifications />
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={tokens.colors.primary} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <AppHeader title="Reporte de evento" showNotifications />

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={query.isRefetching && !query.isLoading}
                        onRefresh={() => void query.refetch()}
                        tintColor={tokens.colors.primary}
                    />
                }
            >
                <SectionCard title={String(header.nom_eve ?? header.name ?? "Evento")}>
                    <Image
                        source={{ uri: toAbsoluteUrl(String(header.img_por_eve ?? header.coverImageUrl ?? DEFAULT_EVENT_IMAGE)) }}
                        style={styles.cover}
                        resizeMode="cover"
                    />
                    <View style={styles.infoRow}>
                        <Text style={styles.infoText}>
                            Creador: {String(creator.nom_usu ?? "-")} {String(creator.ape_usu ?? "")}
                        </Text>
                        <Text style={styles.infoText}>Tipo: {String(header.tip_eve ?? header.type ?? "-")}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoText}>Inicio: {formatDate(header.fec_ini_eve ?? header.startDate)}</Text>
                        <Text style={styles.infoText}>Fin: {formatDate(header.fec_fin_eve ?? header.endDate)}</Text>
                    </View>
                    <Text style={styles.infoText}>Duracion: {formatNumber(header.dur_hor_eve ?? header.durationHours)} h</Text>
                </SectionCard>

                <SectionCard title="Detalle de inscritos">
                    <DataList rows={detailsRows} />
                </SectionCard>

                {query.isError ? (
                    <SectionCard title="Diagnostico">
                        <JsonPreview value={{ error: query.error }} />
                    </SectionCard>
                ) : null}
            </ScrollView>
        </View>
    );
}

function createStyles(theme: ThemeTokens) {
    return {
    container: { flex: 1, backgroundColor: theme.colors.bgSecondary },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: theme.spacing.lg },
    content: { padding: theme.spacing.md, gap: theme.spacing.md, paddingBottom: theme.spacing.xl },
    cover: { width: "100%", height: 140, borderRadius: 12, backgroundColor: theme.colors.bgTertiary },
    infoRow: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
    infoText: { color: theme.colors.textSecondary, fontWeight: "700", fontSize: 12 },
    };
}
