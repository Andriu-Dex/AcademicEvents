import { useMemo, useState, type ReactNode } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "../../src/components/AppHeader";
import { fetchMyProfile } from "../../src/api/profile";
import { fetchUserEventsPaginated, type UserEventsFilters } from "../../src/api/userEvents";
import type { PublicEventExtended } from "../../src/api/publicEvents";
import { useAuthStore } from "../../src/store/authStore";
import { theme } from "../../src/shared/theme";

type ClientOnlyFilters = {
    soloCarrera: boolean;
};

function formatEventDateTime(dateISO: string) {
    if (!dateISO) return "Fecha por confirmar";

    const date = new Date(dateISO);
    if (Number.isNaN(date.getTime())) return "Fecha por confirmar";

    return date.toLocaleString("es-EC", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatDateRange(startISO: string, endISO: string) {
    const start = formatEventDateTime(startISO);
    const end = endISO ? formatEventDateTime(endISO) : "";
    return end ? `${start} a ${end}` : start;
}

function translateEventModality(raw: string) {
    const normalized = raw.trim().toUpperCase();
    if (!normalized) return "";

    if (normalized === "IN_PERSON") return "Presencial";
    if (normalized === "VIRTUAL") return "Virtual";
    if (normalized === "HYBRID") return "Semipresencial";

    const lower = raw.trim().toLowerCase();
    if (lower === "presencial") return "Presencial";
    if (lower === "virtual") return "Virtual";
    if (lower === "hibrida" || lower === "híbrida" || lower === "semipresencial") return "Semipresencial";

    return raw.trim();
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

function EventCard({ event }: Readonly<{ event: PublicEventExtended }>) {
    const isFree = (event.price ?? 0) <= 0;
    const modality = translateEventModality(event.modality);

    const capacityLabel = useMemo(() => {
        if (typeof event.availableSpots === "number") {
            return event.availableSpots > 0 ? `${event.availableSpots} cupos` : "Sin cupos";
        }
        if (typeof event.maxCapacity === "number") return `${event.maxCapacity} cupos`;
        return "Cupos por confirmar";
    }, [event.availableSpots, event.maxCapacity]);

    return (
        <View style={styles.card}>
            {event.coverImageUrl ? (
                <Image source={{ uri: event.coverImageUrl }} style={styles.cover} resizeMode="cover" />
            ) : (
                <View style={styles.coverFallback} />
            )}

            <View style={styles.cardBody}>
                <View style={styles.badgeRow}>
                    {event.type ? (
                        <View style={styles.badgeSoft}>
                            <Text style={styles.badgeSoftText}>{event.type}</Text>
                        </View>
                    ) : null}
                    <View style={[styles.badge, isFree ? styles.badgeSuccess : styles.badgePrimary]}>
                        <Text style={styles.badgeText}>{isFree ? "Gratis" : `$${(event.price ?? 0).toFixed(2)}`}</Text>
                    </View>
                </View>

                <Text style={styles.cardTitle} numberOfLines={2}>
                    {event.title}
                </Text>

                {event.description ? (
                    <Text style={styles.cardDesc} numberOfLines={3}>
                        {event.description}
                    </Text>
                ) : null}

                <View style={styles.metaRow}>
                    <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.metaText} numberOfLines={2}>
                        {formatDateRange(event.startDate, event.endDate)}
                    </Text>
                </View>

                <View style={styles.metaRow}>
                    <Ionicons name="hourglass-outline" size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.metaText}>
                        {event.durationHours ? `${event.durationHours} h` : "Duración por confirmar"}
                    </Text>
                </View>

                <View style={styles.metaRow}>
                    <Ionicons name="people-outline" size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.metaText}>{capacityLabel}</Text>
                </View>

                {modality ? (
                    <View style={styles.metaRow}>
                        <Ionicons name="laptop-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.metaText}>{modality}</Text>
                    </View>
                ) : null}
            </View>
        </View>
    );
}

export default function EventsScreen() {
    const user = useAuthStore((s) => s.user);

    const cardGradient: [string, string] = [
        theme.gradients.card[0] ?? theme.colors.bgSecondary,
        theme.gradients.card[1] ?? theme.colors.bgTertiary,
    ];

    const [page, setPage] = useState(1);
    const limit = 10;

    const [searchInput, setSearchInput] = useState("");
    const [filters, setFilters] = useState<UserEventsFilters>({
        search: "",
        gratuito: false,
        pagado: false,
        completo: false,
        finalizado: false,
        cancelado: false,
        suspendido: false,
        modalidad: "",
    });

    const [clientOnly, setClientOnly] = useState<ClientOnlyFilters>({ soloCarrera: true });

    const isUtaEmail = Boolean(user?.email?.toLowerCase().endsWith("@uta.edu.ec"));

    const profileQuery = useQuery({
        queryKey: ["profile"],
        queryFn: fetchMyProfile,
        staleTime: 60000,
        enabled: Boolean(user),
    });

    const careerId = profileQuery.data?.career?.id ?? "";

    const queryKey = useMemo(
        () => ["user-events-paged", page, limit, filters, isUtaEmail, careerId, clientOnly.soloCarrera],
        [page, limit, filters, isUtaEmail, careerId, clientOnly.soloCarrera]
    );

    const eventsQuery = useQuery({
        queryKey,
        queryFn: () =>
            fetchUserEventsPaginated(page, limit, {
                ...filters,
                carrera: filters.carrera ?? "",
            }),
        staleTime: 60000,
        enabled: Boolean(user),
    });

    const events = useMemo(() => {
        const items = eventsQuery.data?.data ?? [];
        if (!isUtaEmail || !careerId || !clientOnly.soloCarrera) return items;

        return items.filter((evt) => evt.careerIds.includes(careerId));
    }, [eventsQuery.data?.data, isUtaEmail, careerId, clientOnly.soloCarrera]);

    const pagination = eventsQuery.data?.pagination;

    const applySearch = () => {
        setPage(1);
        setFilters((prev) => ({ ...prev, search: searchInput.trim() }));
    };

    const clearFilters = () => {
        setPage(1);
        setSearchInput("");
        setFilters({
            search: "",
            gratuito: false,
            pagado: false,
            completo: false,
            finalizado: false,
            cancelado: false,
            suspendido: false,
            modalidad: "",
        });
        setClientOnly({ soloCarrera: true });
    };

    const setPriceFilter = (mode: "gratuito" | "pagado") => {
        setPage(1);
        setFilters((prev) => {
            const next = { ...prev };
            if (mode === "gratuito") {
                next.gratuito = !prev.gratuito;
                if (next.gratuito) next.pagado = false;
            } else {
                next.pagado = !prev.pagado;
                if (next.pagado) next.gratuito = false;
            }
            return next;
        });
    };

    const setModalidad = (value: string) => {
        setPage(1);
        setFilters((prev) => ({ ...prev, modalidad: value }));
    };

    const toggleFilter = (key: keyof Pick<UserEventsFilters, "completo" | "finalizado" | "cancelado" | "suspendido">) => {
        setPage(1);
        setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
    };

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
                <Text style={styles.errorText}>No se pudieron cargar eventos.</Text>
            </View>
        );
    } else {
        body = (
            <FlatList
                data={events}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => <EventCard event={item} />}
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
            <AppHeader title="Eventos" showNotifications />

            <LinearGradient colors={cardGradient} style={styles.filtersWrap}>
                {isUtaEmail ? (
                    <View style={styles.careerRow}>
                        <Ionicons name="school-outline" size={16} color={theme.colors.primary} />
                        <Text style={styles.careerText} numberOfLines={1}>
                            {profileQuery.isLoading ? "Cargando carrera…" : profileQuery.data?.career?.name ?? "Carrera"}
                        </Text>
                        <FilterChip
                            label="Solo mi carrera"
                            selected={clientOnly.soloCarrera}
                            onPress={() => setClientOnly((p) => ({ ...p, soloCarrera: !p.soloCarrera }))}
                        />
                    </View>
                ) : null}

                <View style={styles.searchRow}>
                    <View style={styles.searchInputWrap}>
                        <Ionicons name="search-outline" size={18} color={theme.colors.textSecondary} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar…"
                            placeholderTextColor={theme.colors.textTertiary}
                            value={searchInput}
                            onChangeText={setSearchInput}
                            onSubmitEditing={applySearch}
                            returnKeyType="search"
                        />
                        {searchInput.length > 0 ? (
                            <Pressable onPress={() => setSearchInput("")}>
                                <Ionicons name="close-circle" size={18} color={theme.colors.textTertiary} />
                            </Pressable>
                        ) : null}
                    </View>
                    <Pressable style={styles.searchBtn} onPress={applySearch}>
                        <Text style={styles.searchBtnText}>Buscar</Text>
                    </Pressable>
                </View>

                <View style={styles.chipsRow}>
                    <FilterChip label="Gratis" selected={Boolean(filters.gratuito)} onPress={() => setPriceFilter("gratuito")} />
                    <FilterChip label="Pagado" selected={Boolean(filters.pagado)} onPress={() => setPriceFilter("pagado")} />
                    <FilterChip label="Completos" selected={Boolean(filters.completo)} onPress={() => toggleFilter("completo")} />
                </View>

                <View style={styles.chipsRow}>
                    <FilterChip label="Finalizados" selected={Boolean(filters.finalizado)} onPress={() => toggleFilter("finalizado")} />
                    <FilterChip label="Cancelados" selected={Boolean(filters.cancelado)} onPress={() => toggleFilter("cancelado")} />
                    <FilterChip label="Suspendidos" selected={Boolean(filters.suspendido)} onPress={() => toggleFilter("suspendido")} />
                </View>

                <View style={styles.chipsRow}>
                    <FilterChip label="Presencial" selected={filters.modalidad === "IN_PERSON"} onPress={() => setModalidad(filters.modalidad === "IN_PERSON" ? "" : "IN_PERSON")} />
                    <FilterChip label="Virtual" selected={filters.modalidad === "VIRTUAL"} onPress={() => setModalidad(filters.modalidad === "VIRTUAL" ? "" : "VIRTUAL")} />
                    <FilterChip label="Semipresencial" selected={filters.modalidad === "HYBRID"} onPress={() => setModalidad(filters.modalidad === "HYBRID" ? "" : "HYBRID")} />
                </View>

                <Pressable style={styles.clearBtn} onPress={clearFilters}>
                    <Ionicons name="refresh" size={18} color={theme.colors.primary} />
                    <Text style={styles.clearBtnText}>Limpiar filtros</Text>
                </Pressable>
            </LinearGradient>

            {body}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bgSecondary },
    filtersWrap: {
        padding: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderPrimary,
    },
    careerRow: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
    careerText: { flex: 1, minWidth: 120, fontWeight: "900", color: theme.colors.textPrimary },
    searchRow: { flexDirection: "row", gap: theme.spacing.sm, marginTop: theme.spacing.sm },
    searchInputWrap: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: theme.colors.bgPrimary,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        borderRadius: theme.radius.md,
        paddingHorizontal: 12,
        height: 44,
    },
    searchInput: { flex: 1, color: theme.colors.textPrimary, fontWeight: "700" },
    searchBtn: {
        width: 92,
        height: 44,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    searchBtnText: { color: theme.colors.textInverse, fontWeight: "900" },
    chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: theme.spacing.sm },
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
    clearBtn: {
        marginTop: theme.spacing.sm,
        height: 44,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        backgroundColor: theme.colors.bgPrimary,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 10,
    },
    clearBtnText: { color: theme.colors.primary, fontWeight: "900" },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: theme.spacing.lg },
    errorText: { color: theme.colors.error, fontWeight: "900" },
    list: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: theme.spacing.xl },
    card: {
        backgroundColor: theme.colors.bgPrimary,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        overflow: "hidden",
        ...theme.shadow.sm,
    },
    cover: { width: "100%", height: 160, backgroundColor: theme.colors.bgTertiary },
    coverFallback: { width: "100%", height: 160, backgroundColor: theme.colors.bgTertiary },
    cardBody: { padding: theme.spacing.md },
    badgeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    badgeSoft: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: theme.colors.primaryLight,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
    },
    badgeSoftText: { color: theme.colors.primary, fontWeight: "900", fontSize: 12 },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
    },
    badgePrimary: { backgroundColor: theme.colors.primary },
    badgeSuccess: { backgroundColor: theme.colors.success },
    badgeText: { color: theme.colors.textInverse, fontWeight: "900", fontSize: 12 },
    cardTitle: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: "900",
        color: theme.colors.textPrimary,
    },
    cardDesc: { marginTop: 6, color: theme.colors.textSecondary, lineHeight: 18 },
    metaRow: { marginTop: 8, flexDirection: "row", gap: 8, alignItems: "flex-start" },
    metaText: { flex: 1, color: theme.colors.textSecondary, fontWeight: "700", lineHeight: 18 },
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
