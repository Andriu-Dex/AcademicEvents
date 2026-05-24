import { useMemo, useState } from "react";
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
import { useRouter } from "expo-router";
import {
    fetchPublicEventsPaginated,
    PublicEventExtended,
    PublicEventsFilters,
} from "../src/api/publicEvents";
import { toAbsoluteUrl } from "../src/api/client";
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

function formatEventType(raw: string) {
    const value = raw.trim().toUpperCase();
    if (!value) return "";
    // backend enum: COURSE, CONGRESS, WEBINAR, TALK, SOCIALIZATION
    return value;
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
        publico: true,
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
            publico: true,
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
        const typeLabel = formatEventType(item.type);
        const dateRange = formatDateRange(item.startDate, item.endDate);

        return (
            <View style={styles.eventCard}>
                {item.coverImageUrl ? (
                    <Image source={{ uri: toAbsoluteUrl(item.coverImageUrl) }} style={styles.coverImage} resizeMode="cover" />
                ) : (
                    <View style={styles.coverImageFallback} />
                )}

                <View style={styles.body}>
                    <Text style={styles.eventTitle} numberOfLines={2}>
                        {item.title}
                    </Text>

                    {typeLabel ? <Text style={styles.eventType}>{typeLabel}</Text> : null}

                    <Text style={styles.priceText}>Precio: {priceLabel}</Text>

                    {item.description ? (
                        <Text style={styles.eventDescription} numberOfLines={3}>
                            {item.description}
                        </Text>
                    ) : null}

                    <Text style={styles.metaLine}>Fecha: {dateRange}</Text>
                    {item.durationHours > 0 ? (
                        <Text style={styles.metaLine}>Duración: {item.durationHours} horas</Text>
                    ) : null}

                    <View style={styles.badgesRow}>
                        {typeof item.availableSpots === "number" ? (
                            <View style={styles.badgePrimary}>
                                <Text style={styles.badgePrimaryText}>Cupos disponibles: {item.availableSpots}</Text>
                            </View>
                        ) : null}
                        {modalityLabel ? (
                            <View style={styles.badgeSuccess}>
                                <Ionicons name="desktop-outline" size={14} color={theme.colors.success} />
                                <Text style={styles.badgeSuccessText}>Modalidad: {modalityLabel}</Text>
                            </View>
                        ) : null}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <LinearGradient colors={theme.gradients.home} style={styles.container}>
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
        backgroundColor: theme.colors.overlayWhite18,
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
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        overflow: "hidden",
    },
    coverImage: {
        width: "100%",
        height: 150,
        backgroundColor: theme.colors.bgSecondary,
    },
    coverImageFallback: {
        width: "100%",
        height: 150,
        backgroundColor: theme.colors.bgSecondary,
    },
    body: {
        padding: theme.spacing.md,
        gap: 8,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: theme.colors.textPrimary,
    },
    eventType: {
        color: theme.colors.primary,
        fontWeight: "900",
        letterSpacing: 1.1,
        fontSize: 12,
    },
    priceText: {
        color: theme.colors.textSecondary,
        fontWeight: "700",
        fontSize: 13,
    },
    metaLine: {
        color: theme.colors.textSecondary,
        fontWeight: "600",
        fontSize: 13,
        lineHeight: 18,
    },
    badgesRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginTop: 4,
    },
    badgePrimary: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: theme.radius.sm,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        backgroundColor: theme.colors.bgSecondary,
    },
    badgePrimaryText: {
        color: theme.colors.primary,
        fontWeight: "800",
        fontSize: 12,
    },
    badgeSuccess: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        backgroundColor: theme.colors.bgSecondary,
    },
    badgeSuccessText: {
        color: theme.colors.success,
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
