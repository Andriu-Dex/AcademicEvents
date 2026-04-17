import { useMemo, useState, type ReactNode } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Linking,
    Pressable,
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
    if (normalized.includes("REPROB") || normalized.includes("REJECT")) return "Reprobado";
    if (normalized.includes("PEND")) return "Pendiente";
    return status || "Sin estado";
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
    if (key === "REPROB") return "Reprobados";
    return "Todos";
}

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
                selected ? { backgroundColor: color } : styles.chipUnselected,
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
    return (
        <View style={styles.card}>
            <View style={styles.cardBody}>
                <View style={styles.rowTop}>
                    <Text style={styles.title} numberOfLines={2}>
                        {event?.title ?? "Curso"}
                    </Text>
                    <View style={[styles.badge, { backgroundColor: statusColor(item.status) }]}>
                        <Text style={styles.badgeText} numberOfLines={1}>
                            {statusLabel(item.status)}
                        </Text>
                    </View>
                </View>

                <View style={styles.metaRow}>
                    <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.metaText}>{formatDate(item.createdAt) || "Fecha por confirmar"}</Text>
                </View>

                {item.paymentProofUrl ? (
                    <Pressable
                        style={styles.linkBtn}
                        onPress={() =>
                            Linking.openURL(toAbsoluteUrl(item.paymentProofUrl ?? "")).catch(() => {
                                Alert.alert(
                                    "No se pudo abrir el comprobante",
                                    "Intenta de nuevo o abre el enlace desde un navegador."
                                );
                            })
                        }
                    >
                        <Ionicons name="document-text-outline" size={16} color={theme.colors.primary} />
                        <Text style={styles.linkText}>Ver comprobante</Text>
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
    const filteredCount = items.length;
    const countLabel = `${filterLabel(statusFilter)} · ${filteredCount} resultados`;

    let body: ReactNode;
    if (query.isLoading) {
        body = (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    } else if (query.isError) {
        body = (
            <View style={styles.center}>
                <Text style={styles.errorText}>No se pudieron cargar tus inscripciones.</Text>
            </View>
        );
    } else {
        body = (
            <FlatList
                data={items}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => <RegistrationCard item={item} />}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No tienes inscripciones todavía.</Text>
                }
            />
        );
    }

    return (
        <View style={styles.container}>
            <AppHeader title="Mis inscripciones" showNotifications />

            <View style={styles.filters}>
                <Text style={styles.filtersTitle}>Filtrar por estado</Text>
                <View style={styles.filtersMetaRow}>
                    <Text style={styles.filtersSubtitle}>Vista general</Text>
                    <Text style={styles.filtersCount}>
                        {statusFilter === "TODOS" ? `Todos · ${totalCount} resultados` : countLabel}
                    </Text>
                </View>

                <View style={styles.pillsRow}>
                    <FilterChip
                        label="Todos"
                        selected={statusFilter === "TODOS"}
                        color={filterColor("TODOS")}
                        onPress={() => setStatusFilter("TODOS")}
                    />
                    <FilterChip
                        label="Pendientes"
                        selected={statusFilter === "PEND"}
                        color={filterColor("PEND")}
                        onPress={() => setStatusFilter("PEND")}
                    />
                    <FilterChip
                        label="Aprobados"
                        selected={statusFilter === "APROB"}
                        color={filterColor("APROB")}
                        onPress={() => setStatusFilter("APROB")}
                    />
                    <FilterChip
                        label="Reprobados"
                        selected={statusFilter === "REPROB"}
                        color={filterColor("REPROB")}
                        onPress={() => setStatusFilter("REPROB")}
                    />
                </View>
            </View>

            {body}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bgSecondary },
    filters: {
        padding: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderPrimary,
        backgroundColor: theme.colors.bgPrimary,
        gap: 10,
    },
    filtersTitle: { fontSize: 14, fontWeight: "900", color: theme.colors.textPrimary },
    filtersMetaRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 12 },
    filtersSubtitle: { color: theme.colors.textSecondary, fontWeight: "800" },
    filtersCount: { color: theme.colors.textSecondary, fontWeight: "800" },
    pillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 4 },
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 999,
        borderWidth: 1,
    },
    chipUnselected: { backgroundColor: theme.colors.bgPrimary },
    chipText: { fontSize: 12, fontWeight: "900" },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: theme.spacing.lg },
    errorText: { color: theme.colors.error, fontWeight: "900" },
    list: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: theme.spacing.xl },
    emptyText: { color: theme.colors.textSecondary, fontWeight: "800", textAlign: "center", marginTop: theme.spacing.lg },
    card: {
        backgroundColor: theme.colors.bgPrimary,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        overflow: "hidden",
        ...theme.shadow.sm,
    },
    cardBody: { padding: theme.spacing.md },
    rowTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
    title: { flex: 1, fontWeight: "900", fontSize: 15, color: theme.colors.textPrimary },
    badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
    badgeText: { color: theme.colors.textInverse, fontWeight: "900", fontSize: 12, maxWidth: 130 },
    metaRow: { marginTop: 8, flexDirection: "row", alignItems: "center", gap: 8 },
    metaText: { color: theme.colors.textSecondary, fontWeight: "700", flex: 1 },
    linkBtn: {
        marginTop: 10,
        height: 44,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        backgroundColor: theme.colors.bgPrimary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    linkText: { color: theme.colors.primary, fontWeight: "900" },
});
