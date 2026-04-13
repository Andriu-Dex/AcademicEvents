import { useMemo, useState, type ReactNode } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { AppHeader } from "../../src/components/AppHeader";
import { toAbsoluteUrl } from "../../src/api/client";
import { fetchReportEventsPaginated } from "../../src/api/adminReports";
import { theme } from "../../src/shared/theme";
import { useAuthStore } from "../../src/store/authStore";
import { isGlobalAdminRole } from "../../src/utils/roles";

type ReportCard = {
    key: string;
    title: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    href: string;
};

const REPORT_CARDS: ReportCard[] = [
    {
        key: "career",
        title: "Reportes por Carrera",
        subtitle: "Estadísticas de participación por carrera académica",
        icon: "school-outline",
        href: "/(admin)/reports/career",
    },
    {
        key: "enrollments",
        title: "Reportes de Inscripciones",
        subtitle: "Estado y tendencias de inscripciones en eventos",
        icon: "clipboard-outline",
        href: "/(admin)/reports/enrollments",
    },
    {
        key: "attendance",
        title: "Reportes de Asistencia",
        subtitle: "Análisis de asistencia vs inscripciones",
        icon: "checkmark-done-outline",
        href: "/(admin)/reports/attendance",
    },
    {
        key: "certificates",
        title: "Reportes de Certificados",
        subtitle: "Estadísticas de emisión y descarga de certificados",
        icon: "ribbon-outline",
        href: "/(admin)/reports/certificates",
    },
    {
        key: "revenue",
        title: "Reportes de Ingresos y Pagos",
        subtitle: "Análisis de ingresos, pagos y eventos rentables",
        icon: "cash-outline",
        href: "/(admin)/reports/revenue",
    },
    {
        key: "month",
        title: "Reportes por Mes",
        subtitle: "Estadísticas y datos agrupados por mes",
        icon: "calendar-outline",
        href: "/(admin)/reports/month",
    },
];

function ReportOption({ card }: Readonly<{ card: ReportCard }>) {
    const router = useRouter();

    return (
        <Pressable style={styles.reportCard} onPress={() => router.push(card.href)}>
            <View style={styles.reportIconWrap}>
                <Ionicons name={card.icon} size={22} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.reportTitle}>{card.title}</Text>
                <Text style={styles.reportSubtitle} numberOfLines={2}>
                    {card.subtitle}
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
        </Pressable>
    );
}

export default function AdminDashboardScreen() {
    const router = useRouter();
    const role = useAuthStore((s) => s.user?.role);
    const isGlobal = isGlobalAdminRole(role ?? null);

    const [page, setPage] = useState(1);
    const limit = 10;

    const eventsQuery = useQuery({
        queryKey: ["admin-dashboard-events", page, limit],
        queryFn: () => fetchReportEventsPaginated(page, limit),
        staleTime: 60000,
    });

    const recentEvents = eventsQuery.data?.data ?? [];
    const pagination = eventsQuery.data?.pagination;

    const header = useMemo(() => {
        return (
            <View style={styles.headerWrap}>
                <Text style={styles.sectionTitle}>Panel de Administración</Text>

                <View style={styles.sectionBlock}>
                    <Text style={styles.blockTitle}>Seleccione un tipo de reporte</Text>
                    <View style={styles.reportList}>
                        {REPORT_CARDS.map((card) => (
                            <ReportOption key={card.key} card={card} />
                        ))}
                    </View>
                </View>

                {isGlobal ? (
                    <View style={styles.sectionBlock}>
                        <Text style={styles.blockTitle}>Administración Global</Text>
                        <Pressable
                            style={styles.globalBtn}
                            onPress={() => router.push("/(admin)/global-users")}
                        >
                            <Ionicons name="people-outline" size={18} color={theme.colors.primary} />
                            <Text style={styles.globalBtnText}>Gestionar usuarios</Text>
                        </Pressable>
                        <Pressable
                            style={styles.globalBtn}
                            onPress={() => router.push("/(admin)/university")}
                        >
                            <Ionicons name="business-outline" size={18} color={theme.colors.primary} />
                            <Text style={styles.globalBtnText}>Información de la universidad</Text>
                        </Pressable>
                    </View>
                ) : null}

                <Text style={[styles.sectionTitle, { marginTop: theme.spacing.md }]}>Eventos Recientes</Text>
            </View>
        );
    }, [router, isGlobal]);

    let body: ReactNode;
    if (eventsQuery.isLoading) {
        body = (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    } else if (eventsQuery.isError) {
        body = (
            <View style={styles.center}>
                <Text style={styles.errorText}>No se pudieron cargar eventos recientes.</Text>
            </View>
        );
    } else {
        body = (
            <FlatList
                data={recentEvents}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={header}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <Pressable
                        style={styles.eventCard}
                        onPress={() => router.push({ pathname: "/(admin)/reports/event/[id]", params: { id: item.id } })}
                    >
                        <Image
                            source={{ uri: toAbsoluteUrl(item.coverImageUrl) }}
                            style={styles.eventCover}
                            resizeMode="cover"
                        />
                        <View style={styles.eventBody}>
                            <Text style={styles.eventTitle} numberOfLines={2}>
                                {item.name}
                            </Text>
                        </View>
                    </Pressable>
                )}
                ListFooterComponent={
                    <View style={styles.pagination}>
                        <Pressable
                            style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
                            disabled={page <= 1}
                            onPress={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            <Text style={styles.pageBtnText}>Anterior</Text>
                        </Pressable>
                        <Text style={styles.pageInfo}>
                            Página {pagination?.currentPage ?? page} / {pagination?.totalPages ?? 1}
                        </Text>
                        <Pressable
                            style={[
                                styles.pageBtn,
                                !(pagination?.hasNextPage ?? false) && styles.pageBtnDisabled,
                            ]}
                            disabled={!(pagination?.hasNextPage ?? false)}
                            onPress={() => setPage((p) => p + 1)}
                        >
                            <Text style={styles.pageBtnText}>Siguiente</Text>
                        </Pressable>
                    </View>
                }
            />
        );
    }

    return (
        <View style={styles.container}>
            <AppHeader title="Dashboard" showNotifications />
            {body}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bgSecondary },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: theme.spacing.lg },
    errorText: { color: theme.colors.error, fontWeight: "900" },
    list: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: theme.spacing.xl },

    headerWrap: { gap: theme.spacing.md },
    sectionTitle: { fontSize: 18, fontWeight: "900", color: theme.colors.textPrimary },
    sectionBlock: {
        backgroundColor: theme.colors.bgPrimary,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        padding: theme.spacing.md,
        gap: 10,
        ...theme.shadow.sm,
    },
    blockTitle: { fontWeight: "900", color: theme.colors.textPrimary },

    reportList: { gap: 10 },
    reportCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 12,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        backgroundColor: theme.colors.bgPrimary,
    },
    reportIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.primaryLight,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
    },
    reportTitle: { fontWeight: "900", color: theme.colors.textPrimary },
    reportSubtitle: { marginTop: 2, color: theme.colors.textSecondary, fontWeight: "700", lineHeight: 18 },

    globalBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        height: 44,
        paddingHorizontal: 12,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        backgroundColor: theme.colors.bgSecondary,
    },
    globalBtnText: { color: theme.colors.textPrimary, fontWeight: "900" },

    eventCard: {
        backgroundColor: theme.colors.bgPrimary,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        overflow: "hidden",
        ...theme.shadow.sm,
    },
    eventCover: { width: "100%", height: 96, backgroundColor: theme.colors.bgTertiary },
    eventBody: { padding: theme.spacing.md },
    eventTitle: { fontWeight: "900", color: theme.colors.textPrimary, lineHeight: 20 },

    pagination: {
        paddingVertical: theme.spacing.md,
        alignItems: "center",
        justifyContent: "center",
        gap: theme.spacing.sm,
    },
    pageInfo: { color: theme.colors.textSecondary, fontWeight: "800" },
    pageBtn: {
        minWidth: 120,
        height: 44,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    pageBtnDisabled: { backgroundColor: theme.colors.borderSecondary },
    pageBtnText: { color: theme.colors.textInverse, fontWeight: "900" },
});
