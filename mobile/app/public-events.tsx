import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
    fetchPublicEventsPaginated,
    PublicEventExtended,
    PublicEventsFilters,
} from "../src/api/publicEvents";
import { theme } from "../src/shared/theme";

type ClientOnlyFilters = {
    completo: boolean;
    finalizado: boolean;
    cancelado: boolean;
    suspendido: boolean;
};

function formatEventDate(dateISO: string) {
    if (!dateISO) return "Fecha por confirmar";

    const date = new Date(dateISO);
    if (Number.isNaN(date.getTime())) return "Fecha por confirmar";

    return date.toLocaleDateString("es-EC", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function translateEventModality(raw: string) {
    const normalized = raw.trim().toUpperCase();
    if (!normalized) return "";

    if (normalized === "IN_PERSON") return "Presencial";
    if (normalized === "VIRTUAL") return "Virtual";
    if (normalized === "HYBRID") return "Semipresencial";

    // Si llega ya traducido o en otro formato
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
}: Readonly<{
    label: string;
    selected: boolean;
    onPress: () => void;
}>) {
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

export default function PublicEventsScreen() {
    const router = useRouter();

    const [page, setPage] = useState(1);
    const limit = 12;

    const [searchInput, setSearchInput] = useState("");
    const [filters, setFilters] = useState<PublicEventsFilters>({
        search: "",
        software: false,
        industrial: false,
        publico: false,
        gratuito: false,
        pagado: false,
        modalidad: "",
    });

    const [clientOnly, setClientOnly] = useState<ClientOnlyFilters>({
        completo: false,
        finalizado: false,
        cancelado: false,
        suspendido: false,
    });

    const queryKey = useMemo(
        () => ["public-events-paged", page, limit, filters],
        [page, limit, filters]
    );

    const {
        data,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey,
        queryFn: () => fetchPublicEventsPaginated(page, limit, filters),
        staleTime: 60000,
    });

    const events = useMemo(() => {
        const items = data?.data ?? [];
        return items.filter((event) => {
            if (clientOnly.completo) {
                if (typeof event.availableSpots === "number") {
                    return event.availableSpots <= 0;
                }
                return false;
            }

            const status = event.status.trim().toUpperCase();
            const wantsAnyStatus = clientOnly.finalizado || clientOnly.cancelado || clientOnly.suspendido;
            if (!wantsAnyStatus) return true;

            if (clientOnly.finalizado && status === "FINISHED") return true;
            if (clientOnly.cancelado && status === "CANCELLED") return true;
            if (clientOnly.suspendido && status === "SUSPENDED") return true;
            return false;
        });
    }, [data?.data, clientOnly]);

    const applySearch = () => {
        setPage(1);
        setFilters((prev) => ({ ...prev, search: searchInput.trim() }));
    };

    const clearFilters = () => {
        setPage(1);
        setSearchInput("");
        setFilters({
            search: "",
            software: false,
            industrial: false,
            publico: false,
            gratuito: false,
            pagado: false,
            modalidad: "",
        });
        setClientOnly({
            completo: false,
            finalizado: false,
            cancelado: false,
            suspendido: false,
        });
    };

    const toggleBoolean = (key: "software" | "industrial" | "publico") => {
        setPage(1);
        setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleClient = (key: keyof ClientOnlyFilters) => {
        setPage(1);
        setClientOnly((prev) => ({ ...prev, [key]: !prev[key] }));
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

    const pagination = data?.pagination;

    const emptyComponent = useMemo(() => {
        if (isLoading) {
            return (
                <View style={styles.stateCard}>
                    <ActivityIndicator color={theme.colors.primary} />
                    <Text style={styles.stateText}>Cargando eventos…</Text>
                </View>
            );
        }

        if (isError) {
            return (
                <View style={styles.stateCard}>
                    <Text style={styles.stateText}>
                        {error instanceof Error ? error.message : "No se pudo cargar eventos"}
                    </Text>
                    <Pressable style={styles.retryButton} onPress={() => refetch()}>
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                    </Pressable>
                </View>
            );
        }

        return (
            <View style={styles.stateCard}>
                <Ionicons name="calendar-clear-outline" size={26} color={theme.colors.textTertiary} />
                <Text style={styles.stateText}>No hay eventos con los filtros seleccionados.</Text>
            </View>
        );
    }, [error, isError, isLoading, refetch]);

    const renderItem = ({ item }: { item: PublicEventExtended }) => {
        const modalityLabel = translateEventModality(item.modality);
        const priceLabel = item.price > 0 ? `$${item.price.toFixed(2)}` : "Gratis";

        return (
            <View style={styles.eventCard}>
                <View style={styles.eventHeader}>
                    <Text style={styles.eventTitle} numberOfLines={2}>
                        {item.title}
                    </Text>
                    <View style={styles.datePill}>
                        <Text style={styles.datePillText}>{formatEventDate(item.startDate)}</Text>
                    </View>
                </View>

                <View style={styles.metaRow}>
                    <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.metaText} numberOfLines={1}>
                        {item.location}
                    </Text>
                </View>

                <View style={styles.badgesRow}>
                    {modalityLabel ? (
                        <View style={styles.badge}>
                            <Ionicons name="laptop-outline" size={14} color={theme.colors.primary} />
                            <Text style={styles.badgeText}>{modalityLabel}</Text>
                        </View>
                    ) : null}
                    <View style={styles.badge}>
                        <Ionicons name="cash-outline" size={14} color={theme.colors.primary} />
                        <Text style={styles.badgeText}>{priceLabel}</Text>
                    </View>
                    {typeof item.availableSpots === "number" ? (
                        <View style={styles.badge}>
                            <Ionicons name="people-outline" size={14} color={theme.colors.primary} />
                            <Text style={styles.badgeText}>{item.availableSpots} cupos</Text>
                        </View>
                    ) : null}
                </View>

                {item.description ? (
                    <Text style={styles.eventDescription} numberOfLines={3}>
                        {item.description}
                    </Text>
                ) : null}
            </View>
        );
    };

    return (
        <LinearGradient colors={["#f8eff2", "#ffffff"]} style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.headerButton}>
                    <Ionicons name="arrow-back" size={20} color={theme.colors.textInverse} />
                </Pressable>
                <Text style={styles.headerTitle}>Eventos públicos</Text>
                <Pressable onPress={() => refetch()} style={styles.headerButton}>
                    <Ionicons name="refresh" size={20} color={theme.colors.textInverse} />
                </Pressable>
            </View>

            <FlatList
                data={events}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <View style={styles.filtersCard}>
                        <Text style={styles.filtersTitle}>Filtros</Text>

                        <View style={styles.searchRow}>
                            <View style={styles.searchInputWrap}>
                                <Ionicons name="search-outline" size={16} color={theme.colors.textSecondary} />
                                <TextInput
                                    style={styles.searchInput}
                                    value={searchInput}
                                    onChangeText={setSearchInput}
                                    placeholder="Buscar por nombre o descripción"
                                    placeholderTextColor={theme.colors.textTertiary}
                                    returnKeyType="search"
                                    onSubmitEditing={applySearch}
                                />
                            </View>
                            <Pressable style={styles.searchButton} onPress={applySearch}>
                                <Text style={styles.searchButtonText}>Buscar</Text>
                            </Pressable>
                        </View>

                        <View style={styles.chipsRow}>
                            <FilterChip
                                label="Software"
                                selected={Boolean(filters.software)}
                                onPress={() => toggleBoolean("software")}
                            />
                            <FilterChip
                                label="Industrial"
                                selected={Boolean(filters.industrial)}
                                onPress={() => toggleBoolean("industrial")}
                            />
                            <FilterChip
                                label="Público"
                                selected={Boolean(filters.publico)}
                                onPress={() => toggleBoolean("publico")}
                            />
                            <FilterChip
                                label="Gratis"
                                selected={Boolean(filters.gratuito)}
                                onPress={() => setPriceFilter("gratuito")}
                            />
                            <FilterChip
                                label="Pagado"
                                selected={Boolean(filters.pagado)}
                                onPress={() => setPriceFilter("pagado")}
                            />
                        </View>

                        <Text style={styles.subTitle}>Modalidad</Text>
                        <View style={styles.chipsRow}>
                            <FilterChip
                                label="Todas"
                                selected={!filters.modalidad}
                                onPress={() => setModalidad("")}
                            />
                            <FilterChip
                                label="Presencial"
                                selected={filters.modalidad === "IN_PERSON"}
                                onPress={() => setModalidad("IN_PERSON")}
                            />
                            <FilterChip
                                label="Virtual"
                                selected={filters.modalidad === "VIRTUAL"}
                                onPress={() => setModalidad("VIRTUAL")}
                            />
                            <FilterChip
                                label="Semipresencial"
                                selected={filters.modalidad === "HYBRID"}
                                onPress={() => setModalidad("HYBRID")}
                            />
                        </View>

                        <Text style={styles.subTitle}>Otros</Text>
                        <View style={styles.chipsRow}>
                            <FilterChip
                                label="Completo"
                                selected={clientOnly.completo}
                                onPress={() => toggleClient("completo")}
                            />
                            <FilterChip
                                label="Finalizado"
                                selected={clientOnly.finalizado}
                                onPress={() => toggleClient("finalizado")}
                            />
                            <FilterChip
                                label="Cancelado"
                                selected={clientOnly.cancelado}
                                onPress={() => toggleClient("cancelado")}
                            />
                            <FilterChip
                                label="Suspendido"
                                selected={clientOnly.suspendido}
                                onPress={() => toggleClient("suspendido")}
                            />
                        </View>

                        <View style={styles.actionsRow}>
                            <Pressable style={styles.clearButton} onPress={clearFilters}>
                                <Text style={styles.clearButtonText}>Limpiar filtros</Text>
                            </Pressable>

                            {isFetching ? (
                                <View style={styles.fetchingRow}>
                                    <ActivityIndicator size="small" color={theme.colors.primary} />
                                    <Text style={styles.fetchingText}>Actualizando…</Text>
                                </View>
                            ) : null}
                        </View>
                    </View>
                }
                ListEmptyComponent={emptyComponent}
                ListFooterComponent={
                    pagination ? (
                        <View style={styles.paginationCard}>
                            <Pressable
                                onPress={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={!pagination.hasPrevPage}
                                style={[styles.pageButton, !pagination.hasPrevPage && styles.pageButtonDisabled]}
                            >
                                <Text style={styles.pageButtonText}>Anterior</Text>
                            </Pressable>

                            <Text style={styles.pageInfo}>
                                Página {pagination.currentPage} de {pagination.totalPages}
                            </Text>

                            <Pressable
                                onPress={() => setPage((p) => p + 1)}
                                disabled={!pagination.hasNextPage}
                                style={[styles.pageButton, !pagination.hasNextPage && styles.pageButtonDisabled]}
                            >
                                <Text style={styles.pageButtonText}>Siguiente</Text>
                            </Pressable>
                        </View>
                    ) : null
                }
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        backgroundColor: theme.colors.primary,
        paddingTop: 54,
        paddingBottom: 14,
        paddingHorizontal: theme.spacing.md,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerTitle: {
        color: theme.colors.textInverse,
        fontSize: 18,
        fontWeight: "700",
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.18)",
        alignItems: "center",
        justifyContent: "center",
    },
    listContent: {
        padding: theme.spacing.md,
        paddingBottom: 40,
        gap: theme.spacing.md,
    },
    filtersCard: {
        backgroundColor: theme.colors.bgElevated,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        gap: theme.spacing.sm,
    },
    filtersTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: theme.colors.textPrimary,
    },
    subTitle: {
        marginTop: 6,
        fontSize: 13,
        fontWeight: "700",
        color: theme.colors.textSecondary,
    },
    searchRow: {
        flexDirection: "row",
        gap: theme.spacing.sm,
        alignItems: "center",
    },
    searchInputWrap: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: theme.colors.bgSecondary,
        borderRadius: theme.radius.sm,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
    },
    searchInput: {
        flex: 1,
        color: theme.colors.textPrimary,
    },
    searchButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.sm,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    searchButtonText: {
        color: theme.colors.textInverse,
        fontWeight: "700",
        fontSize: 13,
    },
    chipsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
    },
    chipSelected: {
        backgroundColor: theme.colors.primaryLight,
        borderColor: theme.colors.primary,
    },
    chipUnselected: {
        backgroundColor: theme.colors.bgSecondary,
        borderColor: theme.colors.borderPrimary,
    },
    chipText: {
        fontSize: 12,
        fontWeight: "700",
    },
    chipTextSelected: {
        color: theme.colors.primary,
    },
    chipTextUnselected: {
        color: theme.colors.textSecondary,
    },
    actionsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 4,
    },
    clearButton: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: theme.radius.sm,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        backgroundColor: theme.colors.bgSecondary,
    },
    clearButtonText: {
        color: theme.colors.textSecondary,
        fontWeight: "700",
        fontSize: 12,
    },
    fetchingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    fetchingText: {
        color: theme.colors.textSecondary,
        fontSize: 12,
        fontWeight: "600",
    },
    eventCard: {
        backgroundColor: theme.colors.bgElevated,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        gap: 10,
    },
    eventHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 10,
    },
    eventTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: "800",
        color: theme.colors.textPrimary,
    },
    datePill: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
    },
    datePillText: {
        color: theme.colors.textInverse,
        fontWeight: "700",
        fontSize: 12,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    metaText: {
        flex: 1,
        color: theme.colors.textSecondary,
        fontSize: 13,
        fontWeight: "600",
    },
    badgesRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    badge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 999,
        backgroundColor: theme.colors.primaryLighter,
        borderWidth: 1,
        borderColor: theme.colors.primaryLight,
    },
    badgeText: {
        color: theme.colors.primary,
        fontWeight: "800",
        fontSize: 12,
    },
    eventDescription: {
        color: theme.colors.textSecondary,
        fontSize: 13,
        fontWeight: "500",
        lineHeight: 18,
    },
    stateCard: {
        backgroundColor: theme.colors.bgElevated,
        borderRadius: theme.radius.md,
        padding: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    stateText: {
        textAlign: "center",
        color: theme.colors.textSecondary,
        fontSize: 13,
        fontWeight: "600",
    },
    retryButton: {
        marginTop: 6,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.sm,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    retryButtonText: {
        color: theme.colors.textInverse,
        fontWeight: "800",
        fontSize: 13,
    },
    paginationCard: {
        marginTop: 4,
        backgroundColor: theme.colors.bgElevated,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },
    pageButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.sm,
        paddingHorizontal: 14,
        paddingVertical: 10,
        minWidth: 96,
        alignItems: "center",
    },
    pageButtonDisabled: {
        opacity: 0.45,
    },
    pageButtonText: {
        color: theme.colors.textInverse,
        fontWeight: "800",
        fontSize: 13,
    },
    pageInfo: {
        flex: 1,
        textAlign: "center",
        color: theme.colors.textSecondary,
        fontSize: 13,
        fontWeight: "700",
    },
});
