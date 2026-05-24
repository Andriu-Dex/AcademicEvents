/* eslint-disable sonarjs/cognitive-complexity */
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
    Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AppHeader } from "../../src/components/AppHeader";
import { toAbsoluteUrl } from "../../src/api/client";
import { fetchAllCareers } from "../../src/api/adminCareers";
import {
    deleteEvent,
    fetchAdminEventsPaginated,
    type AdminEvent,
    type AdminEventsFilters,
} from "../../src/api/adminEvents";
import { useAppTheme, useThemedStyles, type ThemeTokens } from "../../src/shared";

type SelectOption = { label: string; value: string };

const EVENT_TYPE_OPTIONS: SelectOption[] = [
    { label: "Todos", value: "" },
    { label: "Curso", value: "COURSE" },
    { label: "Congreso", value: "CONGRESS" },
    { label: "Webinar", value: "WEBINAR" },
    { label: "Charla", value: "TALK" },
    { label: "Socialización", value: "SOCIALIZATION" },
];

const EVENT_STATUS_OPTIONS: SelectOption[] = [
    { label: "Todos", value: "" },
    { label: "Activo", value: "ACTIVE" },
    { label: "Inactivo", value: "INACTIVE" },
    { label: "Finalizado", value: "FINISHED" },
    { label: "Cancelado", value: "CANCELLED" },
    { label: "Suspendido", value: "SUSPENDED" },
];

const MODALITY_OPTIONS: SelectOption[] = [
    { label: "Todas", value: "" },
    { label: "Presencial", value: "IN_PERSON" },
    { label: "Virtual", value: "VIRTUAL" },
    { label: "Semipresencial", value: "HYBRID" },
];

const SORT_BY_OPTIONS: SelectOption[] = [
    { label: "Recientes", value: "createdAt" },
    { label: "Nombre", value: "name" },
    { label: "Inicio", value: "startDate" },
    { label: "Precio", value: "price" },
    { label: "Cupos", value: "maxCapacity" },
    { label: "Disponibles", value: "availableSpots" },
];

function translateEventStatus(status: string) {
    const key = (status ?? "").trim().toUpperCase();
    if (key === "ACTIVE") return "Activo";
    if (key === "INACTIVE") return "Inactivo";
    if (key === "FINISHED") return "Finalizado";
    if (key === "CANCELLED") return "Cancelado";
    if (key === "SUSPENDED") return "Suspendido";
    return status || "Estado";
}

function translateEventType(raw: string) {
    const normalized = raw.trim().toUpperCase();
    if (!normalized) return "";
    if (normalized === "COURSE") return "Curso";
    if (normalized === "CONGRESS") return "Congreso";
    if (normalized === "WEBINAR") return "Webinar";
    if (normalized === "TALK") return "Charla";
    if (normalized === "SOCIALIZATION") return "Socialización";
    return raw.trim();
}

function translateModality(raw: string) {
    const normalized = raw.trim().toUpperCase();
    if (normalized === "IN_PERSON") return "Presencial";
    if (normalized === "VIRTUAL") return "Virtual";
    if (normalized === "HYBRID") return "Semipresencial";
    return raw.trim();
}

function useDebouncedValue<T>(value: T, delayMs: number) {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delayMs);
        return () => clearTimeout(timer);
    }, [value, delayMs]);

    return debounced;
}

function toOptionalFiniteNumber(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return "";
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : "";
}

function CheckboxRow({
    label,
    checked,
    onPress,
}: Readonly<{ label: string; checked: boolean; onPress: () => void }>) {
    const { tokens } = useAppTheme();
    const styles = useThemedStyles(createStyles);
    return (
        <Pressable style={styles.checkboxRow} onPress={onPress}>
            <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                {checked ? <Ionicons name="checkmark" size={16} color={tokens.colors.onPrimary} /> : null}
            </View>
            <Text style={styles.checkboxLabel} numberOfLines={2}>
                {label}
            </Text>
        </Pressable>
    );
}

function formatDateTime(dateISO: string) {
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

function EventAdminCard({
    event,
    onViewDetails,
}: Readonly<{
    event: AdminEvent;
    onViewDetails: () => void;
}>) {
    const { tokens } = useAppTheme();
    const styles = useThemedStyles(createStyles);
    const isFree = (event.price ?? 0) <= 0;

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
                            <Text style={styles.badgeSoftText}>{translateEventType(event.type)}</Text>
                        </View>
                    ) : null}
                    <View style={[styles.badge, isFree ? styles.badgeSuccess : styles.badgePrimary]}>
                        <Text style={styles.badgeText}>{isFree ? "Gratis" : `$${(event.price ?? 0).toFixed(2)}`}</Text>
                    </View>
                </View>

                <Text style={styles.cardTitle} numberOfLines={2}>
                    {event.name}
                </Text>

                <View style={styles.actionRow}>
                    <Pressable style={[styles.actionBtn, styles.actionBtnGhost, { flex: 1 }]} onPress={onViewDetails}>
                        <Text style={[styles.actionBtnTextGhost, { textAlign: "center" }]}>Ver detalles</Text>
                        <Ionicons name="arrow-forward" size={16} color={tokens.colors.textPrimary} />
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

export default function AdminEventsScreen() {
    const { tokens } = useAppTheme();
    const styles = useThemedStyles(createStyles);
    const router = useRouter();
    const queryClient = useQueryClient();
    const params = useLocalSearchParams<{ eventId?: string }>();

    const [page, setPage] = useState(1);
    const limit = 10;

    const [filtersOpen, setFiltersOpen] = useState(false);
    const [tipoOpen, setTipoOpen] = useState(false);
    const [estadoOpen, setEstadoOpen] = useState(false);
    const [modalidadOpen, setModalidadOpen] = useState(false);
    const [carreraOpen, setCarreraOpen] = useState(false);
    const [sortOpen, setSortOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<AdminEvent | null>(null);

    const [searchInput, setSearchInput] = useState("");
    const [filters, setFilters] = useState<AdminEventsFilters>({
        search: "",
        tipoEvento: "",
        estado: "",
        carrera: "",
        modalidad: "",
        capacidadMin: "",
        capacidadMax: "",
        valorMin: "",
        valorMax: "",
        asistenciaMin: "",
        esGratuito: false,
        esPago: false,
        eventosLlenos: false,
        sortBy: "createdAt",
        sortOrder: "desc",
    });

    useEffect(() => {
        // Permite deep-link simple desde otras pantallas.
        if (params.eventId) {
            setFiltersOpen(true);
        }
    }, [params.eventId]);

    const careersQuery = useQuery({
        queryKey: ["admin-careers-all"],
        queryFn: fetchAllCareers,
        staleTime: 120000,
    });

    const careerOptions = useMemo(() => {
        const list = careersQuery.data ?? [];
        return [
            { label: "Todas las carreras", value: "" },
            { label: "Eventos generales", value: "GENERAL" },
            ...list.map((c) => ({ label: c.name, value: c.id })),
        ];
    }, [careersQuery.data]);

    const eventsQueryKey = useMemo(
        () => ["admin-events-paged", page, limit, filters],
        [page, limit, filters]
    );

    const eventsQuery = useQuery({
        queryKey: eventsQueryKey,
        queryFn: () => fetchAdminEventsPaginated(page, limit, filters),
        staleTime: 15000,
        placeholderData: keepPreviousData,
    });

    const events = eventsQuery.data?.data ?? [];
    const pagination = eventsQuery.data?.pagination;

    const deleteMutation = useMutation({
        mutationFn: deleteEvent,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["admin-events-paged"] });
        },
    });

    const applySearch = () => {
        setPage(1);
        setFilters((prev) => ({ ...prev, search: searchInput.trim() }));
    };

    const clearFilters = () => {
        setPage(1);
        setSearchInput("");
        setFilters({
            search: "",
            tipoEvento: "",
            estado: "",
            carrera: "",
            modalidad: "",
            capacidadMin: "",
            capacidadMax: "",
            valorMin: "",
            valorMax: "",
            asistenciaMin: "",
            esGratuito: false,
            esPago: false,
            eventosLlenos: false,
            sortBy: "createdAt",
            sortOrder: "desc",
        });
    };

    const currentTipoLabel =
        EVENT_TYPE_OPTIONS.find((o) => o.value === (filters.tipoEvento ?? ""))?.label ?? "Todos";
    const currentEstadoLabel =
        EVENT_STATUS_OPTIONS.find((o) => o.value === (filters.estado ?? ""))?.label ?? "Todos";
    const currentModalidadLabel =
        MODALITY_OPTIONS.find((o) => o.value === (filters.modalidad ?? ""))?.label ?? "Todas";
    const currentCareerLabel =
        careerOptions.find((o) => o.value === (filters.carrera ?? ""))?.label ?? "Todas las carreras";
    const currentSortLabel = SORT_BY_OPTIONS.find((o) => o.value === (filters.sortBy ?? "createdAt"))?.label ?? "Recientes";

    const rangeLabel = useMemo(() => {
        if (!pagination) return "";
        const total = pagination.totalItems;
        if (total <= 0) return "Sin eventos";
        const from = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
        const to = (pagination.currentPage - 1) * pagination.itemsPerPage + (events.length || 0);
        return `Mostrando ${from}-${to} de ${total}`;
    }, [pagination, events.length]);

    const body = useMemo(() => {
        if (eventsQuery.isLoading) {
            return (
                <View style={styles.center}>
                    <ActivityIndicator color={tokens.colors.primary} />
                    <Text style={styles.helperText}>Cargando eventos…</Text>
                </View>
            );
        }

        if (eventsQuery.isError) {
            return (
                <View style={styles.center}>
                    <Text style={styles.errorText}>No se pudieron cargar los eventos.</Text>
                    <Text style={styles.helperText}>Revisa tu conexión o vuelve a intentar.</Text>
                </View>
            );
        }

        if (events.length === 0) {
            return (
                <View style={styles.center}>
                    <Ionicons name="calendar-outline" size={40} color={tokens.colors.textTertiary} />
                    <Text style={styles.helperText}>No hay eventos con estos filtros.</Text>
                </View>
            );
        }

        return (
            <FlatList
                data={events}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <EventAdminCard
                        event={item}
                        onViewDetails={() => setSelectedEvent(item)}
                    />
                )}
                ListFooterComponent={
                    pagination ? (
                        <View style={styles.paginationRow}>
                            <Text style={styles.paginationText}>{rangeLabel}</Text>
                            <View style={styles.paginationBtns}>
                                <Pressable
                                    style={[styles.pageBtn, !pagination.hasPrevPage && styles.pageBtnDisabled]}
                                    onPress={() => pagination.hasPrevPage && setPage((p) => Math.max(1, p - 1))}
                                >
                                    <Ionicons name="chevron-back" size={18} color={tokens.colors.textPrimary} />
                                </Pressable>
                                <Text style={styles.pageIndicator}>Pág. {pagination.currentPage}</Text>
                                <Pressable
                                    style={[styles.pageBtn, !pagination.hasNextPage && styles.pageBtnDisabled]}
                                    onPress={() => pagination.hasNextPage && setPage((p) => p + 1)}
                                >
                                    <Ionicons name="chevron-forward" size={18} color={tokens.colors.textPrimary} />
                                </Pressable>
                            </View>
                        </View>
                    ) : null
                }
            />
        );
    }, [
        eventsQuery.isLoading,
        eventsQuery.isError,
        events,
        router,
        deleteMutation,
        pagination,
        rangeLabel,
    ]);

    return (
        <View style={styles.container}>
            <AppHeader title="Gestionar eventos" showNotifications />

            <View style={styles.filtersShell}>
                <View style={styles.searchRow}>
                    <View style={styles.searchInputWrap}>
                        <Ionicons name="search" size={18} color={tokens.colors.textSecondary} />
                        <TextInput
                            placeholder="Buscar por nombre, lugar…"
                            placeholderTextColor={tokens.colors.textTertiary}
                            style={styles.searchInput}
                            value={searchInput}
                            onChangeText={setSearchInput}
                            onSubmitEditing={applySearch}
                            returnKeyType="search"
                        />
                        {searchInput.length > 0 ? (
                            <Pressable onPress={() => setSearchInput("")}
                                style={styles.clearIconBtn}
                            >
                                <Ionicons name="close" size={16} color={tokens.colors.textSecondary} />
                            </Pressable>
                        ) : null}
                    </View>

                    <Pressable
                        style={styles.primaryPill}
                        onPress={() => router.push({ pathname: "/(admin)/event-form", params: { mode: "create" } })}
                    >
                        <Ionicons name="add" size={18} color={tokens.colors.onPrimary} />
                        <Text style={styles.primaryPillText}>Crear</Text>
                    </Pressable>
                </View>

                <View style={styles.filterHeaderRow}>
                    <Pressable style={styles.filterToggle} onPress={() => setFiltersOpen((v) => !v)}>
                        <Ionicons name="options-outline" size={18} color={tokens.colors.textPrimary} />
                        <Text style={styles.filterToggleText}>{filtersOpen ? "Ocultar filtros" : "Filtros avanzados"}</Text>
                        <Ionicons
                            name={filtersOpen ? "chevron-up" : "chevron-down"}
                            size={18}
                            color={tokens.colors.textSecondary}
                        />
                    </Pressable>

                    <Pressable style={styles.ghostPill} onPress={clearFilters}>
                        <Ionicons name="refresh" size={16} color={tokens.colors.textPrimary} />
                        <Text style={styles.ghostPillText}>Limpiar</Text>
                    </Pressable>
                </View>

                {filtersOpen ? (
                    <View style={styles.filtersGrid}>
                        <View style={styles.filterCard}>
                            <Text style={styles.filterCardTitle}>Tipo / Estado</Text>
                            <Pressable style={styles.selectBtn} onPress={() => setTipoOpen((v) => !v)}>
                                <Text style={styles.selectBtnText}>Tipo: {currentTipoLabel}</Text>
                                <Ionicons name={tipoOpen ? "chevron-up" : "chevron-down"} size={18} color={tokens.colors.textSecondary} />
                            </Pressable>
                            {tipoOpen ? (
                                <View style={styles.selectMenu}>
                                    {EVENT_TYPE_OPTIONS.map((opt) => (
                                        <Pressable
                                            key={opt.value || "all"}
                                            style={styles.selectItem}
                                            onPress={() => {
                                                setPage(1);
                                                setFilters((prev) => ({ ...prev, tipoEvento: opt.value }));
                                                setTipoOpen(false);
                                            }}
                                        >
                                            <Text style={styles.selectItemText}>{opt.label}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            ) : null}

                            <Pressable style={styles.selectBtn} onPress={() => setEstadoOpen((v) => !v)}>
                                <Text style={styles.selectBtnText}>Estado: {currentEstadoLabel}</Text>
                                <Ionicons
                                    name={estadoOpen ? "chevron-up" : "chevron-down"}
                                    size={18}
                                    color={tokens.colors.textSecondary}
                                />
                            </Pressable>
                            {estadoOpen ? (
                                <View style={styles.selectMenu}>
                                    {EVENT_STATUS_OPTIONS.map((opt) => (
                                        <Pressable
                                            key={opt.value || "all"}
                                            style={styles.selectItem}
                                            onPress={() => {
                                                setPage(1);
                                                setFilters((prev) => ({ ...prev, estado: opt.value }));
                                                setEstadoOpen(false);
                                            }}
                                        >
                                            <Text style={styles.selectItemText}>{opt.label}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            ) : null}
                        </View>

                        <View style={styles.filterCard}>
                            <Text style={styles.filterCardTitle}>Carrera / Modalidad</Text>
                            <Pressable style={styles.selectBtn} onPress={() => setCarreraOpen((v) => !v)}>
                                <Text style={styles.selectBtnText}>Carrera: {currentCareerLabel}</Text>
                                <Ionicons
                                    name={carreraOpen ? "chevron-up" : "chevron-down"}
                                    size={18}
                                    color={tokens.colors.textSecondary}
                                />
                            </Pressable>
                            {carreraOpen ? (
                                <View style={styles.selectMenu}>
                                    {careerOptions.map((opt) => (
                                        <Pressable
                                            key={opt.value || "all"}
                                            style={styles.selectItem}
                                            onPress={() => {
                                                setPage(1);
                                                setFilters((prev) => ({ ...prev, carrera: opt.value }));
                                                setCarreraOpen(false);
                                            }}
                                        >
                                            <Text style={styles.selectItemText}>{opt.label}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            ) : null}

                            <Pressable style={styles.selectBtn} onPress={() => setModalidadOpen((v) => !v)}>
                                <Text style={styles.selectBtnText}>Modalidad: {currentModalidadLabel}</Text>
                                <Ionicons
                                    name={modalidadOpen ? "chevron-up" : "chevron-down"}
                                    size={18}
                                    color={tokens.colors.textSecondary}
                                />
                            </Pressable>
                            {modalidadOpen ? (
                                <View style={styles.selectMenu}>
                                    {MODALITY_OPTIONS.map((opt) => (
                                        <Pressable
                                            key={opt.value || "all"}
                                            style={styles.selectItem}
                                            onPress={() => {
                                                setPage(1);
                                                setFilters((prev) => ({ ...prev, modalidad: opt.value }));
                                                setModalidadOpen(false);
                                            }}
                                        >
                                            <Text style={styles.selectItemText}>{opt.label}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            ) : null}
                        </View>

                        <View style={styles.filterCard}>
                            <Text style={styles.filterCardTitle}>Rangos</Text>
                            <View style={styles.row2}>
                                <TextInput
                                    placeholder="Cap. mín"
                                    placeholderTextColor={tokens.colors.textTertiary}
                                    keyboardType="numeric"
                                    style={styles.smallInput}
                                    value={filters.capacidadMin === "" ? "" : String(filters.capacidadMin)}
                                    onChangeText={(v) => {
                                        setPage(1);
                                        setFilters((prev) => ({ ...prev, capacidadMin: toOptionalFiniteNumber(v) }));
                                    }}
                                />
                                <TextInput
                                    placeholder="Cap. máx"
                                    placeholderTextColor={tokens.colors.textTertiary}
                                    keyboardType="numeric"
                                    style={styles.smallInput}
                                    value={filters.capacidadMax === "" ? "" : String(filters.capacidadMax)}
                                    onChangeText={(v) => {
                                        setPage(1);
                                        setFilters((prev) => ({ ...prev, capacidadMax: toOptionalFiniteNumber(v) }));
                                    }}
                                />
                            </View>
                            <View style={styles.row2}>
                                <TextInput
                                    placeholder="$ mín"
                                    placeholderTextColor={tokens.colors.textTertiary}
                                    keyboardType="numeric"
                                    style={styles.smallInput}
                                    value={filters.valorMin === "" ? "" : String(filters.valorMin)}
                                    onChangeText={(v) => {
                                        setPage(1);
                                        setFilters((prev) => ({ ...prev, valorMin: toOptionalFiniteNumber(v) }));
                                    }}
                                />
                                <TextInput
                                    placeholder="$ máx"
                                    placeholderTextColor={tokens.colors.textTertiary}
                                    keyboardType="numeric"
                                    style={styles.smallInput}
                                    value={filters.valorMax === "" ? "" : String(filters.valorMax)}
                                    onChangeText={(v) => {
                                        setPage(1);
                                        setFilters((prev) => ({ ...prev, valorMax: toOptionalFiniteNumber(v) }));
                                    }}
                                />
                            </View>
                            <TextInput
                                placeholder="Asistencia mínima (%)"
                                placeholderTextColor={tokens.colors.textTertiary}
                                keyboardType="numeric"
                                style={styles.input}
                                value={filters.asistenciaMin === "" ? "" : String(filters.asistenciaMin)}
                                onChangeText={(v) => {
                                    setPage(1);
                                    setFilters((prev) => ({ ...prev, asistenciaMin: toOptionalFiniteNumber(v) }));
                                }}
                            />
                        </View>

                        <View style={styles.filterCard}>
                            <Text style={styles.filterCardTitle}>Flags / Orden</Text>
                            <CheckboxRow
                                label="Solo gratuitos"
                                checked={Boolean(filters.esGratuito)}
                                onPress={() => {
                                    setPage(1);
                                    setFilters((prev) => ({ ...prev, esGratuito: !prev.esGratuito }));
                                }}
                            />
                            <CheckboxRow
                                label="Solo pagados"
                                checked={Boolean(filters.esPago)}
                                onPress={() => {
                                    setPage(1);
                                    setFilters((prev) => ({ ...prev, esPago: !prev.esPago }));
                                }}
                            />
                            <CheckboxRow
                                label="Solo eventos llenos"
                                checked={Boolean(filters.eventosLlenos)}
                                onPress={() => {
                                    setPage(1);
                                    setFilters((prev) => ({ ...prev, eventosLlenos: !prev.eventosLlenos }));
                                }}
                            />

                            <Pressable style={styles.selectBtn} onPress={() => setSortOpen((v) => !v)}>
                                <Text style={styles.selectBtnText}>Ordenar: {currentSortLabel}</Text>
                                <Ionicons name={sortOpen ? "chevron-up" : "chevron-down"} size={18} color={tokens.colors.textSecondary} />
                            </Pressable>
                            {sortOpen ? (
                                <View style={styles.selectMenu}>
                                    {SORT_BY_OPTIONS.map((opt) => (
                                        <Pressable
                                            key={opt.value}
                                            style={styles.selectItem}
                                            onPress={() => {
                                                setPage(1);
                                                setFilters((prev) => ({ ...prev, sortBy: opt.value }));
                                                setSortOpen(false);
                                            }}
                                        >
                                            <Text style={styles.selectItemText}>{opt.label}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            ) : null}

                            <View style={styles.row2}>
                                <Pressable
                                    style={[styles.smallPill, filters.sortOrder === "desc" && styles.smallPillActive]}
                                    onPress={() => {
                                        setPage(1);
                                        setFilters((prev) => ({ ...prev, sortOrder: "desc" }));
                                    }}
                                >
                                    <Text style={[styles.smallPillText, filters.sortOrder === "desc" && styles.smallPillTextActive]}>Desc</Text>
                                </Pressable>
                                <Pressable
                                    style={[styles.smallPill, filters.sortOrder === "asc" && styles.smallPillActive]}
                                    onPress={() => {
                                        setPage(1);
                                        setFilters((prev) => ({ ...prev, sortOrder: "asc" }));
                                    }}
                                >
                                    <Text style={[styles.smallPillText, filters.sortOrder === "asc" && styles.smallPillTextActive]}>Asc</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                ) : null}

            </View>

            {deleteMutation.isPending ? (
                <View style={styles.mutationBanner}>
                    <ActivityIndicator color={tokens.colors.onPrimary} />
                    <Text style={styles.mutationBannerText}>Eliminando evento…</Text>
                </View>
            ) : null}

            {body}

            <Modal visible={!!selectedEvent} animationType="slide" transparent onRequestClose={() => setSelectedEvent(null)}>
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
                            {selectedEvent?.coverImageUrl ? (
                                <Image source={{ uri: toAbsoluteUrl(selectedEvent.coverImageUrl) }} style={styles.modalImage} resizeMode="cover" />
                            ) : null}
                            <View style={styles.modalBody}>
                                <Text style={styles.modalTitle}>{selectedEvent?.name}</Text>

                                <View style={styles.modalMetaRow}>
                                    <View style={styles.modalBadgePrimary}>
                                        <Text style={styles.modalBadgeTextPrimary}>{(selectedEvent?.price ?? 0) <= 0 ? "Gratis" : `$${(selectedEvent?.price ?? 0).toFixed(2)}`}</Text>
                                    </View>
                                    {selectedEvent?.type ? (
                                        <View style={styles.modalBadgeSoft}>
                                            <Text style={styles.modalBadgeTextSoft}>{translateEventType(selectedEvent.type)}</Text>
                                        </View>
                                    ) : null}
                                </View>

                                {selectedEvent?.description ? (
                                    <Text style={styles.modalDescription}>{selectedEvent.description}</Text>
                                ) : null}

                                <View style={styles.modalSection}>
                                    <View style={styles.modalDetailRow}>
                                        <Ionicons name="calendar-outline" size={16} color={tokens.colors.primary} />
                                        <Text style={styles.modalDetailText}>{formatDateTime(selectedEvent?.startDate || "")} – {formatDateTime(selectedEvent?.endDate || "")}</Text>
                                    </View>
                                    <View style={styles.modalDetailRow}>
                                        <Ionicons name="time-outline" size={16} color={tokens.colors.primary} />
                                        <Text style={styles.modalDetailText}>Duración: {selectedEvent?.durationHours} horas</Text>
                                    </View>
                                    <View style={styles.modalDetailRow}>
                                        <Ionicons name="people-outline" size={16} color={tokens.colors.primary} />
                                        <Text style={styles.modalDetailText}>Cupos disponibles: {selectedEvent?.availableSpots} de {selectedEvent?.maxCapacity}</Text>
                                    </View>
                                    {selectedEvent?.minGrade !== null && selectedEvent?.minGrade !== undefined ? (
                                        <View style={styles.modalDetailRow}>
                                            <Ionicons name="star-outline" size={16} color={tokens.colors.primary} />
                                            <Text style={styles.modalDetailText}>Nota mínima: {selectedEvent.minGrade}</Text>
                                        </View>
                                    ) : null}
                                    {selectedEvent?.minAttendancePercent !== null && selectedEvent?.minAttendancePercent !== undefined ? (
                                        <View style={styles.modalDetailRow}>
                                            <Ionicons name="checkmark-circle-outline" size={16} color={tokens.colors.primary} />
                                            <Text style={styles.modalDetailText}>Asistencia mínima: {selectedEvent.minAttendancePercent}%</Text>
                                        </View>
                                    ) : null}
                                    <View style={styles.modalDetailRow}>
                                        <Ionicons name="book-outline" size={16} color={tokens.colors.primary} />
                                        <Text style={styles.modalDetailText}>Carreras: {selectedEvent?.isGeneral ? "General (Todas)" : selectedEvent?.careers.join(", ")}</Text>
                                    </View>
                                    <View style={styles.modalDetailRow}>
                                        <Ionicons name="flag-outline" size={16} color={tokens.colors.primary} />
                                        <Text style={styles.modalDetailText}>Estado: {translateEventStatus(selectedEvent?.status || "")}</Text>
                                    </View>
                                    <View style={styles.modalDetailRow}>
                                        <Ionicons name="layers-outline" size={16} color={tokens.colors.primary} />
                                        <Text style={styles.modalDetailText}>Modalidad: {translateModality(selectedEvent?.modality || "")}</Text>
                                    </View>
                                </View>
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <Pressable style={styles.modalActionBtnGhost} onPress={() => {
                                const id = selectedEvent?.id;
                                setSelectedEvent(null);
                                if (id) router.push({ pathname: "/(admin)/registrations", params: { eventId: id } });
                            }}>
                                <Ionicons name="people-outline" size={18} color={tokens.colors.textPrimary} />
                                <Text style={styles.modalActionBtnTextGhost}>Ver inscritos</Text>
                            </Pressable>

                            <View style={styles.modalFooterRow}>
                                <Pressable style={styles.modalActionBtnDanger} onPress={() => {
                                    const event = selectedEvent;
                                    Alert.alert(
                                        "Eliminar evento",
                                        `¿Seguro que deseas eliminar “${event?.name}”? Esta acción no se puede deshacer.`,
                                        [
                                            { text: "Cancelar", style: "cancel" },
                                            {
                                                text: "Eliminar",
                                                style: "destructive",
                                                onPress: () => {
                                                    if (event) deleteMutation.mutate(event.id);
                                                    setSelectedEvent(null);
                                                },
                                            },
                                        ]
                                    );
                                }}>
                                    <Ionicons name="trash-outline" size={16} color={tokens.colors.error} />
                                    <Text style={styles.modalActionBtnTextDanger}>Eliminar</Text>
                                </Pressable>

                                <Pressable style={styles.modalActionBtnPrimary} onPress={() => {
                                    const id = selectedEvent?.id;
                                    setSelectedEvent(null);
                                    if (id) router.push({ pathname: "/(admin)/event-form", params: { mode: "edit", id } });
                                }}>
                                    <Ionicons name="create-outline" size={16} color={tokens.colors.onPrimary} />
                                    <Text style={styles.modalActionBtnTextPrimary}>Editar</Text>
                                </Pressable>
                            </View>
                            <Pressable style={styles.modalCloseBtn} onPress={() => setSelectedEvent(null)}>
                                <Text style={styles.modalCloseBtnText}>Cerrar</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

function createStyles(theme: ThemeTokens) {
    return {
    container: { flex: 1, backgroundColor: theme.colors.bgSecondary },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: theme.spacing.lg, gap: 10 },
    errorText: { color: theme.colors.error, fontWeight: "900" },
    helperText: { color: theme.colors.textSecondary, fontWeight: "700", textAlign: "center" },
    list: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: theme.spacing.xl },

    filtersShell: {
        padding: theme.spacing.lg,
        paddingBottom: theme.spacing.md,
        backgroundColor: theme.colors.bgSecondary,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderPrimary,
        gap: theme.spacing.md,
    },
    searchRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    searchInputWrap: {
        flex: 1,
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
    clearIconBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },

    primaryPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 14,
        height: 48,
        borderRadius: 999,
        backgroundColor: theme.colors.primary,
        ...theme.shadow.primary,
    },
    primaryPillText: { color: theme.colors.onPrimary, fontWeight: "900" },

    filterHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
    filterToggle: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 14,
        height: 44,
        borderRadius: 999,
        backgroundColor: theme.colors.bgPrimary,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
    },
    filterToggleText: { color: theme.colors.textPrimary, fontWeight: "900", flex: 1 },

    ghostPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 14,
        height: 44,
        borderRadius: 999,
        backgroundColor: theme.colors.bgPrimary,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
    },
    ghostPillText: { color: theme.colors.textPrimary, fontWeight: "900" },

    filtersGrid: { gap: theme.spacing.md },
    filterCard: {
        backgroundColor: theme.colors.bgPrimary,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
        gap: 10,
    },
    filterCardTitle: { fontWeight: "900", color: theme.colors.textPrimary },

    input: {
        height: 44,
        borderRadius: theme.radius.sm,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        paddingHorizontal: 12,
        backgroundColor: theme.colors.bgSecondary,
        color: theme.colors.textPrimary,
        fontWeight: "700",
    },
    row2: { flexDirection: "row", gap: 10 },
    smallInput: {
        flex: 1,
        height: 44,
        borderRadius: theme.radius.sm,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        paddingHorizontal: 12,
        backgroundColor: theme.colors.bgSecondary,
        color: theme.colors.textPrimary,
        fontWeight: "700",
    },

    selectBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        borderRadius: theme.radius.sm,
        paddingHorizontal: 12,
        height: 44,
        backgroundColor: theme.colors.bgSecondary,
    },
    selectBtnText: { color: theme.colors.textPrimary, fontWeight: "800" },
    selectMenu: {
        marginTop: 6,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        borderRadius: theme.radius.sm,
        overflow: "hidden",
        backgroundColor: theme.colors.bgPrimary,
    },
    selectItem: { paddingHorizontal: 12, paddingVertical: 12 },
    selectItemText: { color: theme.colors.textPrimary, fontWeight: "700" },

    checkboxRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
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
    checkboxLabel: { flex: 1, color: theme.colors.textSecondary, fontWeight: "800" },

    smallPill: {
        flex: 1,
        height: 40,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        backgroundColor: theme.colors.bgSecondary,
        alignItems: "center",
        justifyContent: "center",
    },
    smallPillActive: { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary },
    smallPillText: { color: theme.colors.textSecondary, fontWeight: "900" },
    smallPillTextActive: { color: theme.colors.primary, fontWeight: "900" },

    card: {
        backgroundColor: theme.colors.bgCard,
        borderRadius: theme.radius.lg,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        ...theme.shadow.md,
    },
    cover: { height: 120, width: "100%" },
    coverFallback: { height: 120, width: "100%", backgroundColor: theme.colors.bgTertiary },
    cardBody: { padding: theme.spacing.md, gap: 8 },
    badgeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    badgeSoft: {
        backgroundColor: theme.colors.primaryLighter,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    badgeSoftText: { color: theme.colors.primary, fontWeight: "900", fontSize: 12 },
    badge: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
    badgePrimary: { backgroundColor: theme.colors.primary },
    badgeSuccess: { backgroundColor: theme.colors.success },
    badgeText: { color: theme.colors.onPrimary, fontWeight: "900", fontSize: 12 },
    cardTitle: { color: theme.colors.textPrimary, fontSize: 16, fontWeight: "900" },
    metaText: { color: theme.colors.textSecondary, fontWeight: "800" },
    metaSubText: { color: theme.colors.textTertiary, fontWeight: "800" },

    actionRow: { flexDirection: "row", gap: 10, marginTop: 6 },
    actionBtn: {
        flex: 1,
        height: 40,
        borderRadius: 999,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    actionBtnPrimary: { backgroundColor: theme.colors.primary },
    actionBtnGhost: {
        backgroundColor: theme.colors.bgSecondary,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
    },
    actionBtnDanger: { backgroundColor: theme.colors.error },
    actionBtnTextPrimary: { color: theme.colors.onPrimary, fontWeight: "900" },
    actionBtnTextGhost: { color: theme.colors.textPrimary, fontWeight: "900" },

    paginationRow: {
        marginTop: theme.spacing.md,
        paddingTop: theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderPrimary,
        alignItems: "center",
        gap: 10,
    },
    paginationText: { color: theme.colors.textSecondary, fontWeight: "800" },
    paginationBtns: { flexDirection: "row", alignItems: "center", gap: 12 },
    pageBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: theme.colors.bgPrimary,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        alignItems: "center",
        justifyContent: "center",
    },
    pageBtnDisabled: { opacity: 0.4 },
    pageIndicator: { color: theme.colors.textPrimary, fontWeight: "900" },

    mutationBanner: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm,
        backgroundColor: theme.colors.primary,
    },
    mutationBannerText: { color: theme.colors.onPrimary, fontWeight: "900" },

    // Modal Styles
    modalBackdrop: {
        flex: 1,
        backgroundColor: theme.colors.overlayBlack50,
        justifyContent: "flex-end",
    },
    modalCard: {
        backgroundColor: theme.colors.bgPrimary,
        borderTopLeftRadius: theme.radius.xl,
        borderTopRightRadius: theme.radius.xl,
        maxHeight: "90%",
        paddingBottom: 20,
    },
    modalContent: {
        paddingBottom: 20,
    },
    modalImage: {
        width: "100%",
        height: 200,
        borderTopLeftRadius: theme.radius.xl,
        borderTopRightRadius: theme.radius.xl,
    },
    modalBody: {
        padding: theme.spacing.lg,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "900",
        color: theme.colors.textPrimary,
        marginBottom: 10,
    },
    modalMetaRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 16,
    },
    modalBadgePrimary: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
    },
    modalBadgeTextPrimary: {
        color: theme.colors.onPrimary,
        fontSize: 12,
        fontWeight: "700",
        textTransform: "uppercase",
    },
    modalBadgeSoft: {
        backgroundColor: theme.colors.bgSecondary,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
    },
    modalBadgeTextSoft: {
        color: theme.colors.textPrimary,
        fontSize: 12,
        fontWeight: "700",
        textTransform: "uppercase",
    },
    modalDescription: {
        fontSize: 14,
        lineHeight: 22,
        color: theme.colors.textSecondary,
    },
    modalSection: {
        marginTop: 16,
        padding: theme.spacing.md,
        backgroundColor: theme.colors.bgSecondary,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
    },
    modalDetailRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    modalDetailText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        fontWeight: "600",
    },
    modalFooter: {
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.sm,
        gap: 12,
    },
    modalFooterRow: {
        flexDirection: "row",
        gap: 12,
    },
    modalActionBtnGhost: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.bgSecondary,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
    },
    modalActionBtnTextGhost: {
        color: theme.colors.textPrimary,
        fontWeight: "800",
        fontSize: 14,
    },
    modalActionBtnDanger: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.bgSecondary,
        borderWidth: 1,
        borderColor: theme.colors.error,
    },
    modalActionBtnTextDanger: {
        color: theme.colors.error,
        fontWeight: "900",
        fontSize: 14,
    },
    modalActionBtnPrimary: {
        flex: 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.primary,
    },
    modalActionBtnTextPrimary: {
        color: theme.colors.onPrimary,
        fontWeight: "900",
        fontSize: 14,
    },
    modalCloseBtn: {
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    modalCloseBtnText: {
        color: theme.colors.textSecondary,
        fontWeight: "800",
        fontSize: 14,
    },
    };
}
