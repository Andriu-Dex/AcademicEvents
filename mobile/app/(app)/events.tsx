import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { AppHeader } from "../../src/components/AppHeader";
import { toAbsoluteUrl } from "../../src/api/client";
import { fetchMyProfile } from "../../src/api/profile";
import { fetchMyRegistrations } from "../../src/api/registrations";
import { fetchUserEventsPaginated, type UserEventsFilters } from "../../src/api/userEvents";
import type { PublicEventExtended } from "../../src/api/publicEvents";
import { useAuthStore } from "../../src/store/authStore";
import { theme } from "../../src/shared/theme";

type ClientOnlyFilters = {
    soloCarrera: boolean;
};

type ModalityOption = { label: string; value: "" | "IN_PERSON" | "VIRTUAL" | "HYBRID" };

const MODALITY_OPTIONS: ModalityOption[] = [
    { label: "Todas", value: "" },
    { label: "Presencial", value: "IN_PERSON" },
    { label: "Virtual", value: "VIRTUAL" },
    { label: "Semipresencial", value: "HYBRID" },
];

function useDebouncedValue<T>(value: T, delayMs: number) {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delayMs);
        return () => clearTimeout(timer);
    }, [value, delayMs]);

    return debounced;
}

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
    return end ? `${start} – ${end}` : start;
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

function translateEventType(raw: string) {
    const normalized = raw.trim().toUpperCase();
    if (!normalized) return "";
    if (normalized === "COURSE") return "Curso";
    if (normalized === "CONGRESS") return "Congreso";
    if (normalized === "WEBINAR") return "Seminario web";
    if (normalized === "TALK") return "Charla";
    if (normalized === "SOCIALIZATION") return "Socialización";
    return raw.trim();
}

function modalityIcon(modality: string): keyof typeof Ionicons.glyphMap {
    const m = modality.toLowerCase();
    if (m.includes("virtual")) return "videocam-outline";
    if (m.includes("presencial")) return "location-outline";
    return "layers-outline";
}

function CheckboxRow({
    label,
    checked,
    onPress,
}: Readonly<{ label: string; checked: boolean; onPress: () => void }>) {
    return (
        <Pressable style={styles.checkboxRow} onPress={onPress}>
            <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                {checked ? <Ionicons name="checkmark" size={14} color={theme.colors.textInverse} /> : null}
            </View>
            <Text style={styles.checkboxLabel} numberOfLines={2}>
                {label}
            </Text>
        </Pressable>
    );
}

function EventCard({
    event,
    onOpenRegister,
    isRegistering,
    isAlreadyRegistered,
}: Readonly<{
    event: PublicEventExtended;
    onOpenRegister: (event: PublicEventExtended) => void;
    isRegistering: boolean;
    isAlreadyRegistered: boolean;
}>) {
    const isFree = (event.price ?? 0) <= 0;
    const modality = translateEventModality(event.modality);
    const eventType = translateEventType(event.type);

    const capacityLabel = useMemo(() => {
        if (typeof event.availableSpots === "number") {
            return event.availableSpots > 0 ? `${event.availableSpots} cupos` : "Sin cupos";
        }
        if (typeof event.maxCapacity === "number") return `${event.maxCapacity} cupos`;
        return "Cupos por confirmar";
    }, [event.availableSpots, event.maxCapacity]);

    const hasNoSpots = typeof event.availableSpots === "number" && event.availableSpots <= 0;

    return (
        <View style={styles.card}>
            {/* Imagen de portada */}
            {event.coverImageUrl ? (
                <Image source={{ uri: toAbsoluteUrl(event.coverImageUrl) }} style={styles.cover} resizeMode="cover" />
            ) : (
                <View style={styles.coverFallback}>
                    <Ionicons name="calendar-outline" size={32} color={theme.colors.textTertiary} />
                </View>
            )}

            <View style={styles.cardBody}>
                {/* Badges superiores */}
                <View style={styles.badgeRow}>
                    {eventType ? (
                        <View style={styles.typeBadge}>
                            <Text style={styles.typeBadgeText}>{eventType}</Text>
                        </View>
                    ) : null}
                    <View style={[styles.priceBadge, isFree ? styles.priceFree : styles.pricePaid]}>
                        <Text style={styles.priceBadgeText}>
                            {isFree ? "✓ Gratis" : `$${(event.price ?? 0).toFixed(2)}`}
                        </Text>
                    </View>
                </View>

                {/* Título */}
                <Text style={styles.cardTitle} numberOfLines={2}>
                    {event.title}
                </Text>

                {/* Descripción */}
                {event.description ? (
                    <Text style={styles.cardDesc} numberOfLines={2}>
                        {event.description}
                    </Text>
                ) : null}

                {/* Meta datos */}
                <View style={styles.metaGrid}>
                    <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={14} color={theme.colors.primary} />
                        <Text style={styles.metaText} numberOfLines={1}>
                            {formatDateRange(event.startDate, event.endDate)}
                        </Text>
                    </View>

                    {event.durationHours ? (
                        <View style={styles.metaItem}>
                            <Ionicons name="hourglass-outline" size={14} color={theme.colors.primary} />
                            <Text style={styles.metaText}>{event.durationHours} horas</Text>
                        </View>
                    ) : null}

                    <View style={styles.metaItem}>
                        <Ionicons name="people-outline" size={14} color={theme.colors.primary} />
                        <Text style={[styles.metaText, hasNoSpots && { color: theme.colors.error }]}>
                            {capacityLabel}
                        </Text>
                    </View>

                    {modality ? (
                        <View style={styles.metaItem}>
                            <Ionicons name={modalityIcon(modality)} size={14} color={theme.colors.primary} />
                            <Text style={styles.metaText}>{modality}</Text>
                        </View>
                    ) : null}
                </View>

                {/* Botón inscribirse */}
                <Pressable
                    style={[
                        styles.registerBtn,
                        isAlreadyRegistered && styles.registerBtnDone,
                        (isRegistering || hasNoSpots) && !isAlreadyRegistered && styles.registerBtnDisabled,
                    ]}
                    onPress={() => onOpenRegister(event)}
                    disabled={isRegistering || isAlreadyRegistered || hasNoSpots}
                >
                    <Ionicons
                        name={isAlreadyRegistered ? "checkmark-circle" : "add-circle-outline"}
                        size={18}
                        color={theme.colors.textInverse}
                    />
                    <Text style={styles.registerBtnText}>
                        {isAlreadyRegistered ? "Ya estás inscrito" : isRegistering ? "Inscribiendo..." : hasNoSpots ? "Sin cupos" : "Inscribirme"}
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

export default function EventsScreen() {
    const router = useRouter();
    const user = useAuthStore((s) => s.user);

    const [page, setPage] = useState(1);
    const limit = 10;

    const [filtersOpen, setFiltersOpen] = useState(false);
    const [modalityOpen, setModalityOpen] = useState(false);

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

    const debouncedFilters = useDebouncedValue(filters, 250);

    const resetToFirstPage = () => {
        setPage((p) => (p === 1 ? p : 1));
    };

    const profileQuery = useQuery({
        queryKey: ["profile"],
        queryFn: fetchMyProfile,
        staleTime: 60000,
        enabled: Boolean(user) && isUtaEmail,
    });

    const careerId = profileQuery.data?.career?.id ?? "";

    const queryKey = useMemo(
        () => ["user-events-paged", page, limit, debouncedFilters, isUtaEmail, careerId, clientOnly.soloCarrera],
        [page, limit, debouncedFilters, isUtaEmail, careerId, clientOnly.soloCarrera]
    );

    const eventsQuery = useQuery({
        queryKey,
        queryFn: () =>
            fetchUserEventsPaginated(page, limit, {
                ...debouncedFilters,
                carrera: debouncedFilters.carrera ?? "",
            }),
        staleTime: 60000,
        placeholderData: keepPreviousData,
        enabled: Boolean(user),
    });
    const myRegistrationsQuery = useQuery({
        queryKey: ["my-registrations"],
        queryFn: fetchMyRegistrations,
        staleTime: 30000,
        enabled: Boolean(user),
    });

    const events = useMemo(() => {
        const items = eventsQuery.data?.data ?? [];
        if (!isUtaEmail || !careerId || !clientOnly.soloCarrera) return items;
        return items.filter((evt) => evt.careerIds.includes(careerId));
    }, [eventsQuery.data?.data, isUtaEmail, careerId, clientOnly.soloCarrera]);

    const pagination = eventsQuery.data?.pagination;
    const registeredEventIds = useMemo(
        () => new Set((myRegistrationsQuery.data ?? []).map((item) => item.event?.id).filter(Boolean) as string[]),
        [myRegistrationsQuery.data]
    );

    const applySearch = () => {
        resetToFirstPage();
        setFilters((prev) => ({ ...prev, search: searchInput.trim() }));
    };

    const clearFilters = () => {
        resetToFirstPage();
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
        setModalityOpen(false);
    };

    const setPriceFilter = (mode: "gratuito" | "pagado") => {
        resetToFirstPage();
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

    const setModalidad = (value: ModalityOption["value"]) => {
        resetToFirstPage();
        setFilters((prev) => ({ ...prev, modalidad: value }));
        setModalityOpen(false);
    };

    const toggleFilter = (
        key: keyof Pick<UserEventsFilters, "completo" | "finalizado" | "cancelado" | "suspendido">
    ) => {
        resetToFirstPage();
        setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const currentModalityLabel =
        MODALITY_OPTIONS.find((m) => m.value === (filters.modalidad as ModalityOption["value"]))?.label ??
        "Todas";

    const hasActiveFilters = filters.gratuito || filters.pagado || filters.completo ||
        filters.finalizado || filters.cancelado || filters.suspendido || filters.modalidad !== "" || filters.search !== "";

    let body: ReactNode;
    if (eventsQuery.isLoading) {
        body = (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Cargando eventos...</Text>
            </View>
        );
    } else if (eventsQuery.isError) {
        body = (
            <View style={styles.center}>
                <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
                <Text style={styles.errorText}>No se pudieron cargar los eventos.</Text>
            </View>
        );
    } else {
        body = (
            <FlatList
                data={events}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <EventCard
                        event={item}
                        onOpenRegister={(event) =>
                            router.push({
                                pathname: "/(app)/event-registration",
                                params: {
                                    eventId: event.id,
                                    title: event.title,
                                    price: String(event.price ?? 0),
                                },
                            })
                        }
                        isRegistering={false}
                        isAlreadyRegistered={registeredEventIds.has(item.id)}
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="calendar-outline" size={52} color={theme.colors.textTertiary} />
                        <Text style={styles.emptyTitle}>Sin eventos</Text>
                        <Text style={styles.emptySubtitle}>
                            No se encontraron eventos con los filtros actuales.
                        </Text>
                        {hasActiveFilters && (
                            <Pressable style={styles.clearBtnLarge} onPress={clearFilters}>
                                <Text style={styles.clearBtnLargeText}>Limpiar filtros</Text>
                            </Pressable>
                        )}
                    </View>
                }
                ListFooterComponent={
                    events.length > 0 ? (
                        <View style={styles.pagination}>
                            <Pressable
                                style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
                                disabled={page <= 1}
                                onPress={() => setPage((p) => Math.max(1, p - 1))}
                            >
                                <Ionicons name="chevron-back" size={18} color={theme.colors.textInverse} />
                                <Text style={styles.pageBtnText}>Anterior</Text>
                            </Pressable>
                            <View style={styles.pageInfoWrap}>
                                <Text style={styles.pageInfo}>
                                    {pagination?.currentPage ?? page} / {pagination?.totalPages ?? 1}
                                </Text>
                            </View>
                            <Pressable
                                style={[styles.pageBtn, !(pagination?.hasNextPage ?? false) && styles.pageBtnDisabled]}
                                disabled={!(pagination?.hasNextPage ?? false)}
                                onPress={() => setPage((p) => p + 1)}
                            >
                                <Text style={styles.pageBtnText}>Siguiente</Text>
                                <Ionicons name="chevron-forward" size={18} color={theme.colors.textInverse} />
                            </Pressable>
                        </View>
                    ) : null
                }
            />
        );
    }

    return (
        <View style={styles.container}>
            <AppHeader title="Eventos disponibles" showNotifications />

            {/* Barra de búsqueda y filtros */}
            <View style={styles.filtersShell}>
                {isUtaEmail ? (
                    <View style={styles.careerRow}>
                        <View style={styles.careerInfo}>
                            <Ionicons name="school-outline" size={15} color={theme.colors.primary} />
                            <Text style={styles.careerText} numberOfLines={1}>
                                {profileQuery.isLoading
                                    ? "Cargando carrera…"
                                    : profileQuery.data?.career?.name ?? "Sin carrera asignada"}
                            </Text>
                        </View>
                        <CheckboxRow
                            label="Solo mi carrera"
                            checked={clientOnly.soloCarrera}
                            onPress={() => {
                                resetToFirstPage();
                                setClientOnly((p) => ({ ...p, soloCarrera: !p.soloCarrera }));
                            }}
                        />
                    </View>
                ) : null}

                <View style={styles.searchRow}>
                    <View style={styles.searchInputWrap}>
                        <Ionicons name="search-outline" size={18} color={theme.colors.textSecondary} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar eventos..."
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
                </View>

                <View style={styles.filterHeaderRow}>
                    <Pressable
                        style={[styles.filterToggle, filtersOpen && styles.filterToggleActive]}
                        onPress={() => setFiltersOpen((v) => !v)}
                    >
                        <Ionicons
                            name="funnel-outline"
                            size={16}
                            color={filtersOpen ? theme.colors.textInverse : theme.colors.primary}
                        />
                        <Text style={[styles.filterToggleText, filtersOpen && styles.filterToggleTextActive]}>
                            Filtros{hasActiveFilters ? " •" : ""}
                        </Text>
                        <Ionicons
                            name={filtersOpen ? "chevron-up" : "chevron-down"}
                            size={16}
                            color={filtersOpen ? theme.colors.textInverse : theme.colors.primary}
                        />
                    </Pressable>

                    {hasActiveFilters && (
                        <Pressable style={styles.clearBtn} onPress={clearFilters}>
                            <Ionicons name="refresh-outline" size={14} color={theme.colors.textSecondary} />
                            <Text style={styles.clearBtnText}>Limpiar</Text>
                        </Pressable>
                    )}
                </View>

                {filtersOpen ? (
                    <ScrollView style={styles.filtersPanel} showsVerticalScrollIndicator={false}>
                        <View style={styles.filterRow}>
                            {/* Por precio */}
                            <View style={styles.filterCard}>
                                <Text style={styles.filterCardTitle}>Precio</Text>
                                <CheckboxRow
                                    label="Gratuitos"
                                    checked={Boolean(filters.gratuito)}
                                    onPress={() => setPriceFilter("gratuito")}
                                />
                                <CheckboxRow
                                    label="De pago"
                                    checked={Boolean(filters.pagado)}
                                    onPress={() => setPriceFilter("pagado")}
                                />
                            </View>

                            {/* Por disponibilidad */}
                            <View style={styles.filterCard}>
                                <Text style={styles.filterCardTitle}>Disponibilidad</Text>
                                <CheckboxRow
                                    label="Sin cupos"
                                    checked={Boolean(filters.completo)}
                                    onPress={() => toggleFilter("completo")}
                                />
                                <CheckboxRow
                                    label="Finalizados"
                                    checked={Boolean(filters.finalizado)}
                                    onPress={() => toggleFilter("finalizado")}
                                />
                                <CheckboxRow
                                    label="Cancelados"
                                    checked={Boolean(filters.cancelado)}
                                    onPress={() => toggleFilter("cancelado")}
                                />
                                <CheckboxRow
                                    label="Suspendidos"
                                    checked={Boolean(filters.suspendido)}
                                    onPress={() => toggleFilter("suspendido")}
                                />
                            </View>
                        </View>

                        {/* Modalidad */}
                        <View style={styles.filterCardFull}>
                            <Text style={styles.filterCardTitle}>Modalidad</Text>
                            <View style={styles.modalityRow}>
                                {MODALITY_OPTIONS.map((opt) => (
                                    <Pressable
                                        key={opt.value || "all"}
                                        style={[
                                            styles.modalityChip,
                                            filters.modalidad === opt.value && styles.modalityChipActive,
                                        ]}
                                        onPress={() => setModalidad(opt.value)}
                                    >
                                        <Text style={[
                                            styles.modalityChipText,
                                            filters.modalidad === opt.value && styles.modalityChipTextActive,
                                        ]}>
                                            {opt.label}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    </ScrollView>
                ) : null}
            </View>

            {body}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bgSecondary },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: theme.spacing.lg, gap: 10 },
    loadingText: { color: theme.colors.textSecondary, fontWeight: "700" },
    errorText: { color: theme.colors.error, fontWeight: "700", textAlign: "center" },

    // Filtros
    filtersShell: {
        backgroundColor: theme.colors.bgPrimary,
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.spacing.md,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
        ...theme.shadow.xs,
    },
    careerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    careerInfo: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
    careerText: { fontWeight: "700", color: theme.colors.textPrimary, fontSize: 13, flexShrink: 1 },

    searchRow: { marginBottom: 10 },
    searchInputWrap: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: theme.colors.bgSecondary,
        borderWidth: 1.5,
        borderColor: theme.colors.borderPrimary,
        borderRadius: theme.radius.full,
        paddingHorizontal: 14,
        height: 46,
    },
    searchInput: { flex: 1, color: theme.colors.textPrimary, fontWeight: "600", fontSize: 14 },

    filterHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    filterToggle: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 16,
        height: 38,
        borderRadius: theme.radius.full,
        borderWidth: 1.5,
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.bgPrimary,
    },
    filterToggleActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    filterToggleText: { color: theme.colors.primary, fontWeight: "800", fontSize: 13 },
    filterToggleTextActive: { color: theme.colors.textInverse },
    clearBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        height: 38,
        paddingHorizontal: 12,
        borderRadius: theme.radius.full,
        borderWidth: 1.5,
        borderColor: theme.colors.borderSecondary,
        backgroundColor: theme.colors.bgSecondary,
    },
    clearBtnText: { color: theme.colors.textSecondary, fontWeight: "700", fontSize: 13 },

    filtersPanel: { marginTop: 10, maxHeight: 280 },
    filterRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
    filterCard: {
        flex: 1,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        backgroundColor: theme.colors.bgSecondary,
        padding: 12,
        gap: 8,
    },
    filterCardFull: {
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        backgroundColor: theme.colors.bgSecondary,
        padding: 12,
        gap: 10,
        marginBottom: 10,
    },
    filterCardTitle: { fontWeight: "800", color: theme.colors.textPrimary, fontSize: 13, marginBottom: 2 },

    modalityRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    modalityChip: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: theme.radius.full,
        borderWidth: 1.5,
        borderColor: theme.colors.borderSecondary,
        backgroundColor: theme.colors.bgPrimary,
    },
    modalityChipActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    modalityChipText: { color: theme.colors.textSecondary, fontWeight: "700", fontSize: 13 },
    modalityChipTextActive: { color: theme.colors.textInverse },

    checkboxRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: theme.colors.borderSecondary,
        backgroundColor: theme.colors.bgPrimary,
        alignItems: "center",
        justifyContent: "center",
    },
    checkboxChecked: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    checkboxLabel: { flex: 1, color: theme.colors.textSecondary, fontWeight: "600", lineHeight: 18, fontSize: 13 },

    // Lista
    list: { padding: theme.spacing.md, gap: theme.spacing.md, paddingBottom: theme.spacing.xl },

    // Tarjeta de evento
    card: {
        backgroundColor: theme.colors.bgPrimary,
        borderRadius: theme.radius.lg,
        overflow: "hidden",
        ...theme.shadow.sm,
    },
    cover: { width: "100%", height: 170, backgroundColor: theme.colors.bgTertiary },
    coverFallback: {
        width: "100%",
        height: 170,
        backgroundColor: theme.colors.bgTertiary,
        alignItems: "center",
        justifyContent: "center",
    },
    cardBody: { padding: theme.spacing.md },
    badgeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
    typeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.primaryLight,
    },
    typeBadgeText: { color: theme.colors.primary, fontWeight: "800", fontSize: 11 },
    priceBadge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: theme.radius.full,
    },
    priceFree: { backgroundColor: theme.colors.successLight },
    pricePaid: { backgroundColor: theme.colors.primaryLight },
    priceBadgeText: { fontWeight: "800", fontSize: 12, color: theme.colors.textPrimary },

    cardTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: theme.colors.textPrimary,
        lineHeight: 22,
        marginBottom: 6,
    },
    cardDesc: { color: theme.colors.textSecondary, lineHeight: 19, fontSize: 13, marginBottom: 10 },

    metaGrid: { gap: 6, marginBottom: theme.spacing.sm },
    metaItem: { flexDirection: "row", alignItems: "center", gap: 8 },
    metaText: { flex: 1, color: theme.colors.textSecondary, fontWeight: "600", fontSize: 12, lineHeight: 17 },

    registerBtn: {
        height: 48,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.primary,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
        ...theme.shadow.primary,
    },
    registerBtnDone: {
        backgroundColor: theme.colors.success,
        shadowColor: theme.colors.success,
    },
    registerBtnDisabled: { opacity: 0.45, shadowOpacity: 0 },
    registerBtnText: {
        color: theme.colors.textInverse,
        fontWeight: "800",
        fontSize: 14,
    },

    // Paginación
    pagination: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: theme.spacing.md,
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
        paddingHorizontal: 16,
        height: 42,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.primary,
    },
    pageBtnDisabled: { backgroundColor: theme.colors.borderSecondary },
    pageBtnText: { color: theme.colors.textInverse, fontWeight: "800", fontSize: 13 },

    // Estado vacío
    emptyState: { alignItems: "center", paddingVertical: theme.spacing.xxl, gap: 10 },
    emptyTitle: { fontSize: 16, fontWeight: "800", color: theme.colors.textSecondary },
    emptySubtitle: {
        color: theme.colors.textTertiary,
        textAlign: "center",
        lineHeight: 20,
        paddingHorizontal: theme.spacing.lg,
    },
    clearBtnLarge: {
        marginTop: 8,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.primary,
    },
    clearBtnLargeText: { color: theme.colors.textInverse, fontWeight: "800" },
});
