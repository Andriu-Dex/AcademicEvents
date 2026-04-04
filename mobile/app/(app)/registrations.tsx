import { useMemo, useState, type ReactNode } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
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
import { theme } from "../../src/shared/theme";

function formatDate(raw: string) {
    if (!raw) return "";
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return raw;
    return date.toLocaleDateString("es-EC", { year: "numeric", month: "short", day: "2-digit" });
}

function statusColor(status: string) {
    const normalized = status.trim().toUpperCase();
    if (normalized.includes("ACEPT")) return theme.colors.success;
    if (normalized.includes("APROB")) return theme.colors.success;
    if (normalized.includes("RECH")) return theme.colors.error;
    if (normalized.includes("PEND")) return theme.colors.warning;
    return theme.colors.primary;
}

function FilterChip({
    label,
    selected,
    onPress,
}: Readonly<{ label: string; selected: boolean; onPress: () => void }>) {
    return (
        <Pressable
            onPress={onPress}
            style={[styles.chip, selected ? styles.chipSelected : styles.chipUnselected]}
        >
            <Text style={[styles.chipText, selected ? styles.chipTextSelected : styles.chipTextUnselected]}>
                {label}
            </Text>
        </Pressable>
    );
}

function RegistrationCard({ item }: Readonly<{ item: RegistrationItem }>) {
    const event = item.event;
    return (
        <View style={styles.card}>
            {event?.coverImageUrl ? (
                <Image source={{ uri: event.coverImageUrl }} style={styles.cover} resizeMode="cover" />
            ) : (
                <View style={styles.coverFallback} />
            )}

            <View style={styles.cardBody}>
                <View style={styles.rowTop}>
                    <Text style={styles.title} numberOfLines={2}>
                        {event?.title ?? "Inscripción"}
                    </Text>
                    <View style={[styles.badge, { backgroundColor: statusColor(item.status) }]}>
                        <Text style={styles.badgeText} numberOfLines={1}>
                            {item.status || "Estado"}
                        </Text>
                    </View>
                </View>

                <View style={styles.metaRow}>
                    <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.metaText}>{formatDate(item.createdAt) || "Fecha por confirmar"}</Text>
                </View>

                {event?.modality ? (
                    <View style={styles.metaRow}>
                        <Ionicons name="laptop-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.metaText}>{event.modality}</Text>
                    </View>
                ) : null}

                {item.paymentProofUrl ? (
                    <Pressable
                        style={styles.linkBtn}
                        onPress={() => Linking.openURL(item.paymentProofUrl ?? "")}
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
        const normalized = statusFilter.trim().toUpperCase();
        return list.filter((r) => r.status.trim().toUpperCase().includes(normalized));
    }, [query.data, statusFilter]);

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
                <FilterChip label="Todos" selected={statusFilter === "TODOS"} onPress={() => setStatusFilter("TODOS")} />
                <FilterChip label="Pendiente" selected={statusFilter === "PEND"} onPress={() => setStatusFilter("PEND")} />
                <FilterChip label="Aceptada" selected={statusFilter === "ACEPT"} onPress={() => setStatusFilter("ACEPT")} />
                <FilterChip label="Rechazada" selected={statusFilter === "RECH"} onPress={() => setStatusFilter("RECH")} />
            </View>

            {body}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bgSecondary },
    filters: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        padding: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderPrimary,
        backgroundColor: theme.colors.bgPrimary,
    },
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 999,
        borderWidth: 1,
    },
    chipSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    chipUnselected: { backgroundColor: theme.colors.bgPrimary, borderColor: theme.colors.borderPrimary },
    chipText: { fontSize: 12, fontWeight: "900" },
    chipTextSelected: { color: theme.colors.textInverse },
    chipTextUnselected: { color: theme.colors.textPrimary },
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
    cover: { width: "100%", height: 150, backgroundColor: theme.colors.bgTertiary },
    coverFallback: { width: "100%", height: 150, backgroundColor: theme.colors.bgTertiary },
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
