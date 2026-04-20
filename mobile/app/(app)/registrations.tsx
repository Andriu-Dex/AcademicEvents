import { useMemo, useState, type ReactNode } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "../../src/components/AppHeader";
import { fetchMyRegistrations, type RegistrationItem } from "../../src/api/registrations";
import { toAbsoluteUrl } from "../../src/api/client";
import { theme } from "../../src/shared/theme";

function formatDate(raw: string) {
    if (!raw) return "";
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return raw;
    return date.toLocaleDateString("es-EC", { year: "numeric", month: "short", day: "2-digit" });
}

function statusColor(status: string) {
    const normalized = status.trim().toUpperCase();
    if (normalized.includes("APROB") || normalized.includes("ACCEPT")) return theme.colors.success;
    if (normalized.includes("REPROB") || normalized.includes("REJECT")) return theme.colors.error;
    if (normalized.includes("PEND")) return theme.colors.warning;
    return theme.colors.primary;
}

function statusLabel(status: string) {
    const normalized = status.trim().toUpperCase();
    if (normalized.includes("APROB") || normalized.includes("ACCEPT")) return "Aprobado";
    if (normalized.includes("REPROB") || normalized.includes("REJECT")) return "Rechazado";
    if (normalized.includes("PEND")) return "Pendiente";
    return status || "Sin estado";
}

function statusIcon(status: string): keyof typeof Ionicons.glyphMap {
    const normalized = status.trim().toUpperCase();
    if (normalized.includes("APROB") || normalized.includes("ACCEPT")) return "checkmark-circle";
    if (normalized.includes("REPROB") || normalized.includes("REJECT")) return "close-circle";
    if (normalized.includes("PEND")) return "time";
    return "ellipse";
}

function filterColor(key: string) {
    if (key === "PEND") return theme.colors.warning;
    if (key === "APROB") return theme.colors.success;
    if (key === "REPROB") return theme.colors.error;
    return theme.colors.primary;
}

function filterLabel(key: string) {
    if (key === "PEND") return "Pendientes";
    if (key === "APROB") return "Aprobados";
    if (key === "REPROB") return "Rechazados";
    return "Todos";
}

const FILTER_KEYS = ["TODOS", "PEND", "APROB", "REPROB"];

function FilterChip({
    label,
    selected,
    color,
    onPress,
}: Readonly<{ label: string; selected: boolean; color: string; onPress: () => void }>) {
    return (
        <Pressable
            onPress={onPress}
            style={[
                styles.chip,
                { borderColor: color },
                selected ? { backgroundColor: color } : { backgroundColor: `${color}15` },
            ]}
        >
            <Text
                style={[
                    styles.chipText,
                    { color: selected ? theme.colors.textInverse : color },
                ]}
            >
                {label}
            </Text>
        </Pressable>
    );
}

function RegistrationCard({ item }: Readonly<{ item: RegistrationItem }>) {
    const event = item.event;
    const color = statusColor(item.status);
    const label = statusLabel(item.status);
    const icon = statusIcon(item.status);

    return (
        <View style={styles.card}>
            {/* Borde de color lateral */}
            <View style={[styles.cardAccent, { backgroundColor: color }]} />

            <View style={styles.cardBody}>
                {/* Encabezado con título y badge */}
                <View style={styles.rowTop}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                        {event?.title ?? "Evento sin título"}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: `${color}18`, borderColor: `${color}40` }]}>
                        <Ionicons name={icon} size={12} color={color} />
                        <Text style={[styles.statusBadgeText, { color }]}>{label}</Text>
                    </View>
                </View>

                {/* Fecha de inscripción */}
                <View style={styles.metaRow}>
                    <Ionicons name="calendar-outline" size={13} color={theme.colors.textTertiary} />
                    <Text style={styles.metaText}>
                        Inscrito el {formatDate(item.createdAt) || "fecha no disponible"}
                    </Text>
                </View>

                {/* Botón comprobante */}
                {item.paymentProofUrl ? (
                    <Pressable
                        style={styles.proofBtn}
                        onPress={() =>
                            Linking.openURL(toAbsoluteUrl(item.paymentProofUrl ?? "")).catch(() => {
                                Alert.alert(
                                    "No se pudo abrir el comprobante",
                                    "Intenta de nuevo o abre el enlace desde un navegador."
                                );
                            })
                        }
                    >
                        <Ionicons name="document-text-outline" size={15} color={theme.colors.primary} />
                        <Text style={styles.proofBtnText}>Ver comprobante de pago</Text>
                        <Ionicons name="open-outline" size={14} color={theme.colors.primary} />
                    </Pressable>
                ) : null}
            </View>
        </View>
    );
}

export default function RegistrationsScreen() {
    const [statusFilter, setStatusFilter] = useState<string>("TODOS");

    const query = useQuery({
        queryKey: ["my-registrations"],
        queryFn: fetchMyRegistrations,
        staleTime: 30000,
    });

    const items = useMemo(() => {
        const list = query.data ?? [];
        if (statusFilter === "TODOS") return list;
        if (statusFilter === "PEND") {
            return list.filter((r) => r.status.trim().toUpperCase().includes("PEND"));
        }
        if (statusFilter === "APROB") {
            return list.filter((r) => {
                const status = r.status.trim().toUpperCase();
                return status.includes("APROB") || status.includes("ACCEPT");
            });
        }
        if (statusFilter === "REPROB") {
            return list.filter((r) => {
                const status = r.status.trim().toUpperCase();
                return status.includes("REPROB") || status.includes("REJECT");
            });
        }
        return list;
    }, [query.data, statusFilter]);

    const totalCount = (query.data ?? []).length;

    // Conteos por estado para las chips
    const counts = useMemo(() => {
        const all = query.data ?? [];
        return {
            TODOS: all.length,
            PEND: all.filter((r) => r.status.trim().toUpperCase().includes("PEND")).length,
            APROB: all.filter((r) => {
                const s = r.status.trim().toUpperCase();
                return s.includes("APROB") || s.includes("ACCEPT");
            }).length,
            REPROB: all.filter((r) => {
                const s = r.status.trim().toUpperCase();
                return s.includes("REPROB") || s.includes("REJECT");
            }).length,
        };
    }, [query.data]);

    let body: ReactNode;
    if (query.isLoading) {
        body = (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Cargando inscripciones...</Text>
            </View>
        );
    } else if (query.isError) {
        body = (
            <View style={styles.center}>
                <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
                <Text style={styles.errorText}>No se pudieron cargar tus inscripciones.</Text>
            </View>
        );
    } else {
        body = (
            <FlatList
                data={items}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => <RegistrationCard item={item} />}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="clipboard-outline" size={52} color={theme.colors.textTertiary} />
                        <Text style={styles.emptyTitle}>Sin inscripciones</Text>
                        <Text style={styles.emptySubtitle}>
                            {statusFilter === "TODOS"
                                ? "Aún no tienes inscripciones en ningún evento."
                                : `No tienes inscripciones con estado "${filterLabel(statusFilter)}".`
                            }
                        </Text>
                    </View>
                }
            />
        );
    }

    return (
        <View style={styles.container}>
            <AppHeader title="Mis Inscripciones" showNotifications />

            {/* Filtros */}
            <View style={styles.filtersWrap}>
                <View style={styles.filtersHeader}>
                    <Text style={styles.filtersTitle}>Filtrar por estado</Text>
                    <Text style={styles.totalCount}>{totalCount} total</Text>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipsRow}
                >
                    {FILTER_KEYS.map((key) => (
                        <FilterChip
                            key={key}
                            label={`${filterLabel(key)} (${counts[key as keyof typeof counts]})`}
                            selected={statusFilter === key}
                            color={filterColor(key)}
                            onPress={() => setStatusFilter(key)}
                        />
                    ))}
                </ScrollView>
            </View>

            {body}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bgSecondary },

    // Filtros
    filtersWrap: {
        backgroundColor: theme.colors.bgPrimary,
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
        ...theme.shadow.xs,
    },
    filtersHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    filtersTitle: { fontSize: 14, fontWeight: "800", color: theme.colors.textPrimary },
    totalCount: { fontSize: 12, fontWeight: "700", color: theme.colors.textTertiary },
    chipsRow: { gap: 8, paddingBottom: 4 },
    chip: {
        paddingVertical: 7,
        paddingHorizontal: 14,
        borderRadius: theme.radius.full,
        borderWidth: 1.5,
    },
    chipText: { fontSize: 12, fontWeight: "800" },

    // Lista
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: theme.spacing.lg, gap: 10 },
    loadingText: { color: theme.colors.textSecondary, fontWeight: "700" },
    errorText: { color: theme.colors.error, fontWeight: "700", textAlign: "center" },
    list: { padding: theme.spacing.md, gap: 12, paddingBottom: theme.spacing.xl },

    // Tarjetas
    card: {
        backgroundColor: theme.colors.bgPrimary,
        borderRadius: theme.radius.lg,
        flexDirection: "row",
        overflow: "hidden",
        ...theme.shadow.sm,
    },
    cardAccent: { width: 5 },
    cardBody: { flex: 1, padding: theme.spacing.md },
    rowTop: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 10,
    },
    cardTitle: { flex: 1, fontWeight: "800", fontSize: 15, color: theme.colors.textPrimary, lineHeight: 21 },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderRadius: theme.radius.full,
        borderWidth: 1,
    },
    statusBadgeText: { fontSize: 11, fontWeight: "800" },
    metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
    metaText: { color: theme.colors.textTertiary, fontWeight: "600", fontSize: 12 },
    proofBtn: {
        marginTop: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: theme.radius.sm,
        backgroundColor: theme.colors.primaryLighter,
        borderWidth: 1,
        borderColor: theme.colors.primaryLight,
    },
    proofBtnText: { flex: 1, color: theme.colors.primary, fontWeight: "700", fontSize: 13 },

    // Estado vacío
    emptyState: { alignItems: "center", paddingVertical: theme.spacing.xxl, gap: 12 },
    emptyTitle: { fontSize: 16, fontWeight: "800", color: theme.colors.textSecondary },
    emptySubtitle: { color: theme.colors.textTertiary, textAlign: "center", lineHeight: 20, paddingHorizontal: theme.spacing.lg },
});
