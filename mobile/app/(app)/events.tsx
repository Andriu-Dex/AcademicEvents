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
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "../../src/components/AppHeader";
import { toAbsoluteUrl } from "../../src/api/client";
import { fetchMyProfile } from "../../src/api/profile";
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

function CheckboxRow({
    label,
    checked,
    onPress,
}: Readonly<{ label: string; checked: boolean; onPress: () => void }>) {
    return (
        <Pressable style={styles.checkboxRow} onPress={onPress}>
            <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                {checked ? <Ionicons name="checkmark" size={16} color={theme.colors.textInverse} /> : null}
            </View>
            <Text style={styles.checkboxLabel} numberOfLines={2}>
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
                <Image source={{ uri: toAbsoluteUrl(event.coverImageUrl) }} style={styles.cover} resizeMode="cover" />
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

    const profileQuery = useQuery({
        queryKey: ["profile"],
        queryFn: fetchMyProfile,
        staleTime: 60000,
        enabled: Boolean(user) && isUtaEmail,
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
        setModalityOpen(false);
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

    const setModalidad = (value: ModalityOption["value"]) => {
        setPage(1);
        setFilters((prev) => ({ ...prev, modalidad: value }));
        setModalityOpen(false);
    };

    const toggleFilter = (
        key: keyof Pick<UserEventsFilters, "completo" | "finalizado" | "cancelado" | "suspendido">
    ) => {
        setPage(1);
        setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const currentModalityLabel =
        MODALITY_OPTIONS.find((m) => m.value === (filters.modalidad as ModalityOption["value"]))?.label ??
        "Todas";

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
                            style={[styles.pageBtn, !(pagination?.hasNextPage ?? false) && styles.pageBtnDisabled]}
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
            <AppHeader title="Eventos disponibles" showNotifications />

            <View style={styles.filtersShell}>
                {isUtaEmail ? (
                    <View style={styles.careerRow}>
                        <Ionicons name="school-outline" size={16} color={theme.colors.primary} />
                        <Text style={styles.careerText} numberOfLines={1}>
                            {profileQuery.isLoading
                                ? "Cargando carrera…"
                                : profileQuery.data?.career?.name ?? "Carrera"}
                        </Text>
                        <CheckboxRow
                            label="Solo mi carrera"
                            checked={clientOnly.soloCarrera}
                            onPress={() => setClientOnly((p) => ({ ...p, soloCarrera: !p.soloCarrera }))}
                        />
                    </View>
                ) : null}

                <View style={styles.searchInputWrap}>
                    <Ionicons name="search-outline" size={18} color={theme.colors.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar por nombre del evento..."
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

                <View style={styles.filterHeaderRow}>
                    <Pressable
                        style={styles.filterToggle}
                        onPress={() => setFiltersOpen((v) => !v)}
                    >
                        <Ionicons name="funnel-outline" size={18} color={theme.colors.primary} />
                        <Text style={styles.filterToggleText}>Filtros</Text>
                        <Ionicons
                            name={filtersOpen ? "chevron-up" : "chevron-down"}
                            size={18}
                            color={theme.colors.primary}
                        />
                    </Pressable>

                    <Pressable style={styles.clearBtn} onPress={clearFilters}>
                        <Text style={styles.clearBtnText}>Limpiar</Text>
                    </Pressable>
                </View>

                {filtersOpen ? (
                    <View style={styles.filtersPanel}>
                        <View style={styles.filterCard}>
                            <Text style={styles.filterCardTitle}>Por Precio</Text>
                            <CheckboxRow
                                label="Eventos Gratuitos"
                                checked={Boolean(filters.gratuito)}
                                onPress={() => setPriceFilter("gratuito")}
                            />
                            <CheckboxRow
                                label="Eventos de Pago"
                                checked={Boolean(filters.pagado)}
                                onPress={() => setPriceFilter("pagado")}
                            />
                        </View>

                        <View style={styles.filterCard}>
                            <Text style={styles.filterCardTitle}>Por Disponibilidad</Text>
                            <CheckboxRow
                                label="Eventos Llenos (sin cupos)"
                                checked={Boolean(filters.completo)}
                                onPress={() => toggleFilter("completo")}
                            />
                        </View>

                        <View style={styles.filterCard}>
                            <Text style={styles.filterCardTitle}>Por Estado</Text>
                            <CheckboxRow
                                label="Eventos Finalizados"
                                checked={Boolean(filters.finalizado)}
                                onPress={() => toggleFilter("finalizado")}
                            />
                            <CheckboxRow
                                label="Eventos Cancelados"
                                checked={Boolean(filters.cancelado)}
                                onPress={() => toggleFilter("cancelado")}
                            />
                            <CheckboxRow
                                label="Eventos Suspendidos"
                                checked={Boolean(filters.suspendido)}
                                onPress={() => toggleFilter("suspendido")}
                            />
                        </View>

                        <View style={styles.filterCard}>
                            <Text style={styles.filterCardTitle}>Por Modalidad</Text>
                            <Pressable
                                style={styles.selectBtn}
                                onPress={() => setModalityOpen((v) => !v)}
                            >
                                <Text style={styles.selectBtnText}>{currentModalityLabel}</Text>
                                <Ionicons
                                    name={modalityOpen ? "chevron-up" : "chevron-down"}
                                    size={18}
                                    color={theme.colors.textSecondary}
                                />
                            </Pressable>
                            {modalityOpen ? (
                                <View style={styles.selectMenu}>
                                    {MODALITY_OPTIONS.map((opt) => (
                                        <Pressable
                                            key={opt.value || "all"}
                                            style={styles.selectItem}
                                            onPress={() => setModalidad(opt.value)}
                                        >
                                            <Text style={styles.selectItemText}>{opt.label}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            ) : null}
                        </View>
                    </View>
                ) : null}
            </View>

            {body}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bgSecondary },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: theme.spacing.lg },
    errorText: { color: theme.colors.error, fontWeight: "900" },
    list: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: theme.spacing.xl },

    filtersShell: {
        padding: theme.spacing.lg,
        paddingBottom: theme.spacing.md,
        backgroundColor: theme.colors.bgSecondary,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderPrimary,
    },
    careerRow: { marginBottom: theme.spacing.md, gap: 10 },
    careerText: { fontWeight: "900", color: theme.colors.textPrimary },

    searchInputWrap: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: theme.colors.bgPrimary,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        borderRadius: theme.radius.lg,
        paddingHorizontal: 12,
        height: 48,
    },
    searchInput: { flex: 1, color: theme.colors.textPrimary, fontWeight: "700" },

    filterHeaderRow: {
        marginTop: theme.spacing.md,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },
    filterToggle: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 14,
        height: 44,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.bgPrimary,
    },
    filterToggleText: { color: theme.colors.primary, fontWeight: "900" },
    clearBtn: {
        height: 44,
        paddingHorizontal: 14,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        backgroundColor: theme.colors.bgPrimary,
        alignItems: "center",
        justifyContent: "center",
    },
    clearBtnText: { color: theme.colors.textSecondary, fontWeight: "900" },

    filtersPanel: {
        marginTop: theme.spacing.md,
        backgroundColor: theme.colors.bgPrimary,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        padding: theme.spacing.md,
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        ...theme.shadow.sm,
    },
    filterCard: {
        width: "48%",
        minWidth: 160,
        flexGrow: 1,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        backgroundColor: theme.colors.bgPrimary,
        padding: theme.spacing.md,
        gap: 10,
    },
    filterCardTitle: { fontWeight: "900", color: theme.colors.textPrimary },

    checkboxRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: theme.colors.borderSecondary,
        backgroundColor: theme.colors.bgPrimary,
        alignItems: "center",
        justifyContent: "center",
    },
    checkboxChecked: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    checkboxLabel: { flex: 1, color: theme.colors.textSecondary, fontWeight: "700", lineHeight: 18 },

    selectBtn: {
        height: 44,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        backgroundColor: theme.colors.bgSecondary,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    selectBtnText: { color: theme.colors.textPrimary, fontWeight: "800" },
    selectMenu: {
        marginTop: 8,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        overflow: "hidden",
    },
    selectItem: { paddingHorizontal: 12, paddingVertical: 10, backgroundColor: theme.colors.bgPrimary },
    selectItemText: { color: theme.colors.textSecondary, fontWeight: "800" },

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
