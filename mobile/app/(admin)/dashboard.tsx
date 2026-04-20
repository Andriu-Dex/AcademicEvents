import { useMemo, useState, type ReactNode } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
    color: string;
};

const REPORT_CARDS: ReportCard[] = [
    {
        key: "career",
        title: "Por Carrera",
        subtitle: "Participación por carrera académica",
        icon: "school-outline",
        href: "/(admin)/reports/career",
        color: "#6366f1",
    },
    {
        key: "enrollments",
        title: "Inscripciones",
        subtitle: "Estado y tendencias de inscripciones",
        icon: "clipboard-outline",
        href: "/(admin)/reports/enrollments",
        color: "#0ea5e9",
    },
    {
        key: "attendance",
        title: "Asistencia",
        subtitle: "Asistencia vs inscripciones",
        icon: "checkmark-done-outline",
        href: "/(admin)/reports/attendance",
        color: "#10b981",
    },
    {
        key: "certificates",
        title: "Certificados",
        subtitle: "Emisión y descarga de certificados",
        icon: "ribbon-outline",
        href: "/(admin)/reports/certificates",
        color: "#f59e0b",
    },
    {
        key: "revenue",
        title: "Ingresos",
        subtitle: "Análisis de ingresos y pagos",
        icon: "cash-outline",
        href: "/(admin)/reports/revenue",
        color: "#10b981",
    },
    {
        key: "month",
        title: "Por Mes",
        subtitle: "Datos agrupados por mes",
        icon: "calendar-outline",
        href: "/(admin)/reports/month",
        color: "#8a1538",
    },
];

function ReportGridCard({ card }: Readonly<{ card: ReportCard }>) {
    const router = useRouter();

    return (
        <Pressable
            style={styles.reportCard}
            onPress={() => router.push(card.href)}
        >
            <LinearGradient
                colors={[`${card.color}18`, `${card.color}08`]}
                style={styles.reportCardGradient}
            >
                <View style={[styles.reportIconWrap, { backgroundColor: `${card.color}20` }]}>
                    <Ionicons name={card.icon} size={22} color={card.color} />
                </View>
                <Text style={styles.reportTitle} numberOfLines={1}>{card.title}</Text>
                <Text style={styles.reportSubtitle} numberOfLines={2}>{card.subtitle}</Text>
                <View style={[styles.reportArrow, { backgroundColor: card.color }]}>
                    <Ionicons name="arrow-forward" size={12} color="#fff" />
                </View>
            </LinearGradient>
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
                {/* Título del panel */}
                <LinearGradient
                    colors={theme.gradients.header}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.dashboardBanner}
                >
                    <View>
                        <Text style={styles.bannerLabel}>Panel de</Text>
                        <Text style={styles.bannerTitle}>Administración</Text>
                    </View>
                    <View style={styles.bannerIcon}>
                        <Ionicons name="settings-outline" size={32} color="rgba(255,255,255,0.3)" />
                    </View>
                </LinearGradient>

                {/* Grid de reportes */}
                <View style={styles.sectionBlock}>
                    <View style={styles.sectionTitleRow}>
                        <Ionicons name="bar-chart-outline" size={16} color={theme.colors.primary} />
                        <Text style={styles.blockTitle}>Reportes disponibles</Text>
                    </View>
                    <View style={styles.reportGrid}>
                        {REPORT_CARDS.map((card) => (
                            <ReportGridCard key={card.key} card={card} />
                        ))}
                    </View>
                </View>

                {/* Administración global */}
                {isGlobal ? (
                    <View style={styles.sectionBlock}>
                        <View style={styles.sectionTitleRow}>
                            <Ionicons name="shield-outline" size={16} color={theme.colors.primary} />
                            <Text style={styles.blockTitle}>Administración Global</Text>
                        </View>
                        <Pressable
                            style={styles.globalBtn}
                            onPress={() => router.push("/(admin)/global-users")}
                        >
                            <View style={styles.globalBtnIcon}>
                                <Ionicons name="people-outline" size={18} color={theme.colors.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.globalBtnText}>Gestionar usuarios</Text>
                                <Text style={styles.globalBtnSubtext}>Ver y administrar todos los usuarios</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
                        </Pressable>
                        <Pressable
                            style={styles.globalBtn}
                            onPress={() => router.push("/(admin)/university")}
                        >
                            <View style={styles.globalBtnIcon}>
                                <Ionicons name="business-outline" size={18} color={theme.colors.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.globalBtnText}>Información de la universidad</Text>
                                <Text style={styles.globalBtnSubtext}>Datos, redes sociales y contacto</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
                        </Pressable>
                    </View>
                ) : null}

                {/* Título sección eventos recientes */}
                <View style={styles.sectionTitleRow}>
                    <Ionicons name="time-outline" size={16} color={theme.colors.primary} />
                    <Text style={[styles.blockTitle, { marginLeft: 0 }]}>Eventos Recientes</Text>
                </View>
            </View>
        );
    }, [router, isGlobal]);

    let body: ReactNode;
    if (eventsQuery.isLoading) {
        body = (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Cargando datos...</Text>
            </View>
        );
    } else if (eventsQuery.isError) {
        body = (
            <View style={styles.center}>
                <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
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
                showsVerticalScrollIndicator={false}
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
                            <View style={styles.eventFooter}>
                                <Text style={styles.eventSeeMore}>Ver reporte</Text>
                                <Ionicons name="arrow-forward-outline" size={13} color={theme.colors.primary} />
                            </View>
                        </View>
                    </Pressable>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="document-outline" size={40} color={theme.colors.textTertiary} />
                        <Text style={styles.emptyText}>No hay eventos recientes.</Text>
                    </View>
                }
                ListFooterComponent={
                    recentEvents.length > 0 ? (
                        <View style={styles.pagination}>
                            <Pressable
                                style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
                                disabled={page <= 1}
                                onPress={() => setPage((p) => Math.max(1, p - 1))}
                            >
                                <Ionicons name="chevron-back" size={16} color={theme.colors.textInverse} />
                                <Text style={styles.pageBtnText}>Anterior</Text>
                            </Pressable>
                            <View style={styles.pageInfoWrap}>
                                <Text style={styles.pageInfo}>
                                    {pagination?.currentPage ?? page} / {pagination?.totalPages ?? 1}
                                </Text>
                            </View>
                            <Pressable
                                style={[
                                    styles.pageBtn,
                                    !(pagination?.hasNextPage ?? false) && styles.pageBtnDisabled,
                                ]}
                                disabled={!(pagination?.hasNextPage ?? false)}
                                onPress={() => setPage((p) => p + 1)}
                            >
                                <Text style={styles.pageBtnText}>Siguiente</Text>
                                <Ionicons name="chevron-forward" size={16} color={theme.colors.textInverse} />
                            </Pressable>
                        </View>
                    ) : null
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
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: theme.spacing.lg, gap: 10 },
    loadingText: { color: theme.colors.textSecondary, fontWeight: "700" },
    errorText: { color: theme.colors.error, fontWeight: "700", textAlign: "center" },
    list: { padding: theme.spacing.md, gap: theme.spacing.md, paddingBottom: theme.spacing.xl },

    headerWrap: { gap: theme.spacing.md },

    // Banner superior
    dashboardBanner: {
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        overflow: "hidden",
    },
    bannerLabel: { color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: "600" },
    bannerTitle: { color: theme.colors.textInverse, fontSize: 22, fontWeight: "900", letterSpacing: 0.2 },
    bannerIcon: { opacity: 0.6 },

    // Sección blocks
    sectionBlock: {
        backgroundColor: theme.colors.bgPrimary,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        gap: 12,
        ...theme.shadow.sm,
    },
    sectionTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 4,
    },
    blockTitle: { fontWeight: "800", color: theme.colors.textPrimary, fontSize: 15 },

    // Grid reportes
    reportGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    reportCard: {
        width: "47%",
        borderRadius: theme.radius.md,
        overflow: "hidden",
        ...theme.shadow.xs,
    },
    reportCardGradient: {
        padding: 14,
        gap: 6,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
    },
    reportIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 2,
    },
    reportTitle: { fontWeight: "800", color: theme.colors.textPrimary, fontSize: 13 },
    reportSubtitle: { color: theme.colors.textSecondary, fontWeight: "600", fontSize: 11, lineHeight: 16 },
    reportArrow: {
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "flex-end",
        marginTop: 4,
    },

    // Global buttons
    globalBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.bgSecondary,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
    },
    globalBtnIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: theme.colors.primaryLight,
        alignItems: "center",
        justifyContent: "center",
    },
    globalBtnText: { color: theme.colors.textPrimary, fontWeight: "800", fontSize: 14 },
    globalBtnSubtext: { color: theme.colors.textTertiary, fontWeight: "600", fontSize: 11, marginTop: 1 },

    // Tarjetas de eventos
    eventCard: {
        backgroundColor: theme.colors.bgPrimary,
        borderRadius: theme.radius.lg,
        overflow: "hidden",
        ...theme.shadow.sm,
    },
    eventCover: { width: "100%", height: 100, backgroundColor: theme.colors.bgTertiary },
    eventBody: {
        padding: theme.spacing.md,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },
    eventTitle: { flex: 1, fontWeight: "800", color: theme.colors.textPrimary, lineHeight: 20 },
    eventFooter: { flexDirection: "row", alignItems: "center", gap: 4 },
    eventSeeMore: { color: theme.colors.primary, fontWeight: "700", fontSize: 12 },

    // Paginación
    pagination: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: theme.spacing.md,
        gap: 10,
    },
    pageInfoWrap: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: theme.radius.sm,
        backgroundColor: theme.colors.bgPrimary,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
    },
    pageInfo: { color: theme.colors.textSecondary, fontWeight: "800", fontSize: 13 },
    pageBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 14,
        height: 42,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.primary,
    },
    pageBtnDisabled: { backgroundColor: theme.colors.borderSecondary },
    pageBtnText: { color: theme.colors.textInverse, fontWeight: "800", fontSize: 13 },

    // Estado vacío
    emptyState: { alignItems: "center", paddingVertical: theme.spacing.xl, gap: 10 },
    emptyText: { color: theme.colors.textTertiary, fontWeight: "700" },
});
