import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Linking,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { AppHeader } from "../../src/components/AppHeader";
import { toAbsoluteUrl } from "../../src/api/client";
import { fetchReportEventsPaginated } from "../../src/api/adminReports";
import {
    fetchRegistrationsByEventPaginated,
    fetchRegistrationsPaginated,
    type AdminRegistration,
    type RegistrationsValidationInput,
    validateRegistration,
} from "../../src/api/adminRegistrations";
import { theme } from "../../src/shared/theme";

type SelectOption = { label: string; value: string };

const STATUS_LABELS: Record<string, string> = {
    PENDING: "Pendiente",
    ACCEPTED: "Aceptada",
    REJECTED: "Rechazada",
    APPROVED: "Aprobado",
    FAILED_GRADE: "Reprobado (nota)",
    FAILED_ATTENDANCE: "Reprobado (asistencia)",
    FAILED_TOTAL: "Reprobado (total)",
    PENDIENTE: "Pendiente",
    ACEPTADA: "Aceptada",
    RECHAZADA: "Rechazada",
    APROBADO: "Aprobado",
    REPROBADO_NOTA: "Reprobado (nota)",
    REPROBADO_ASISTENCIA: "Reprobado (asistencia)",
    REPROBADO_TOTAL: "Reprobado (total)",
};

const EVENT_PICK_LIMIT = 120;

function useDebouncedValue<T>(value: T, delayMs: number) {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delayMs);
        return () => clearTimeout(timer);
    }, [value, delayMs]);

    return debounced;
}

function formatDateTime(dateISO: string) {
    if (!dateISO) return "—";
    const date = new Date(dateISO);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString("es-EC", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function normalizeStatus(statusRaw: string) {
    return (statusRaw ?? "").trim().toUpperCase();
}

function getStatusLabel(statusRaw: string) {
    const key = normalizeStatus(statusRaw);
    return STATUS_LABELS[key] ?? (key || "—");
}

function getEventStatusLabel(statusRaw: string) {
    const key = normalizeStatus(statusRaw);
    if (key === "ACTIVE" || key === "ACTIVO") return "Activo";
    if (key === "INACTIVE" || key === "INACTIVO") return "Inactivo";
    if (key === "FINISHED" || key === "FINALIZADO") return "Finalizado";
    if (key === "CANCELLED" || key === "CANCELADO") return "Cancelado";
    if (key === "SUSPENDED" || key === "SUSPENDIDO") return "Suspendido";
    return statusRaw || "-";
}

function isCourseEventType(typeRaw: string) {
    const key = (typeRaw ?? "").trim().toUpperCase();
    return key.includes("CURSO") || key.includes("COURSE");
}

function statusBadgeStyle(statusRaw: string) {
    const key = normalizeStatus(statusRaw);
    if (key === "REJECTED" || key === "RECHAZADA") return styles.badgeDanger;
    if (key === "ACCEPTED" || key === "ACEPTADA") return styles.badgeSuccess;
    if (key === "APPROVED" || key === "APROBADO") return styles.badgeSuccess;
    if (key.startsWith("FAILED") || key.startsWith("REPROBADO")) return styles.badgeWarning;
    return styles.badgeSoft;
}

function isAcceptedRegistration(statusRaw: string) {
    const key = normalizeStatus(statusRaw);
    return key === "ACCEPTED" || key === "ACEPTADA";
}

function pickUserName(reg: AdminRegistration) {
    const first = reg.account?.user?.firstName ?? "";
    const last = reg.account?.user?.lastName ?? "";
    const full = `${first} ${last}`.trim();
    return full || reg.account?.email || "Usuario";
}

function safeOpenUrl(urlOrPath: string) {
    const abs = toAbsoluteUrl(urlOrPath);
    if (!abs) return;
    Linking.openURL(abs).catch(() => {
        Alert.alert("No se pudo abrir", "Verifica tu conexión o el enlace del documento.");
    });
}

function parseNumberOrNull(text: string) {
    const trimmed = (text ?? "").trim();
    if (!trimmed) return null;
    const num = Number(trimmed);
    return Number.isFinite(num) ? num : null;
}

function getErrorMessage(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
}

function renderEventSelectorContent({
    isLoading,
    isError,
    error,
    events,
    selectedEventId,
    onSelect,
}: Readonly<{
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    events: Array<{ id: string; name: string }>;
    selectedEventId: string;
    onSelect: (id: string) => void;
}>) {
    if (isLoading) {
        return (
            <View style={styles.selectLoading}>
                <ActivityIndicator color={theme.colors.primary} />
                <Text style={styles.loadingText}>Cargando eventos…</Text>
            </View>
        );
    }

    if (isError) {
        return <Text style={styles.errorText}>Error: {getErrorMessage(error, "No se pudieron cargar")}</Text>;
    }

    return events.map((e) => (
        <Pressable
            key={e.id}
            style={[styles.selectItem, selectedEventId === e.id && styles.selectItemActive]}
            onPress={() => onSelect(e.id)}
        >
            <Text style={styles.selectItemText} numberOfLines={2}>
                {e.name}
            </Text>
        </Pressable>
    ));
}

function RegistrationDocumentsSection({
    item,
    paymentCount,
    letterCount,
    docUrl,
    isLetterExpanded,
    onPreviewReceipt,
    onToggleLetter,
}: Readonly<{
    item: AdminRegistration;
    paymentCount: number;
    letterCount: number;
    docUrl: string;
    isLetterExpanded: boolean;
    onPreviewReceipt: (url: string) => void;
    onToggleLetter: (id: string) => void;
}>) {
    return (
        <View style={styles.docsSection}>
            <Text style={styles.detailLabel}>Documentación</Text>

            <View style={styles.docRowColumn}>
                <Text style={styles.docLabel}>Comprobante:</Text>
                {paymentCount > 0 ? (
                    <Pressable
                        style={styles.docBtn}
                        onPress={() => {
                            const first = item.paymentReceipts[0]?.fileUrl;
                            if (first) onPreviewReceipt(first);
                        }}
                    >
                        <Ionicons name="cash-outline" size={16} color={theme.colors.textPrimary} />
                        <Text style={styles.docBtnText}>Ver comprobante</Text>
                    </Pressable>
                ) : (
                    <Text style={styles.docMissing}>No adjuntado</Text>
                )}
            </View>

            <View style={styles.docRowColumn}>
                <Text style={styles.docLabel}>Documentos personales:</Text>
                {docUrl ? (
                    <Pressable style={styles.docBtn} onPress={() => safeOpenUrl(docUrl)}>
                        <Ionicons name="document-text-outline" size={16} color={theme.colors.textPrimary} />
                        <Text style={styles.docBtnText}>Ver documentos</Text>
                    </Pressable>
                ) : (
                    <Text style={styles.docMissing}>No adjuntado</Text>
                )}
            </View>

            <View style={styles.docRowColumn}>
                <Text style={styles.docLabel}>Carta de motivación:</Text>
                {letterCount > 0 ? (
                    <Pressable style={styles.letterToggleBtn} onPress={() => onToggleLetter(item.id)}>
                        <View style={styles.docInlineRow}>
                            <Ionicons name="mail-outline" size={16} color={theme.colors.primary} />
                            <Text style={styles.docBtnText}>{isLetterExpanded ? "Ocultar carta" : "Ver carta"}</Text>
                        </View>
                        <Text style={styles.docPillText}>({letterCount})</Text>
                    </Pressable>
                ) : (
                    <Text style={styles.docMissing}>No adjuntada</Text>
                )}
            </View>

            {isLetterExpanded && letterCount > 0 ? (
                <View style={styles.letterBox}>
                    <Text style={styles.letterText}>{item.motivationLetters[0]?.content ?? ""}</Text>
                </View>
            ) : null}
        </View>
    );
}

function RegistrationDetailsSection({
    item,
    observation,
    attendance,
    grade,
    isPendingAction,
    validateErrorMessage,
    onSetObs,
    onSetAttendance,
    onSetGrade,
    onAccept,
    onReject,
    onFinalize,
}: Readonly<{
    item: AdminRegistration;
    observation: string;
    attendance: string;
    grade: string;
    isPendingAction: boolean;
    validateErrorMessage: string | null;
    onSetObs: (id: string, value: string) => void;
    onSetAttendance: (id: string, value: string) => void;
    onSetGrade: (id: string, value: string) => void;
    onAccept: (reg: AdminRegistration) => void;
    onReject: (reg: AdminRegistration) => void;
    onFinalize: (reg: AdminRegistration) => void;
}>) {
    const isCourse = isCourseEventType(item.event?.type ?? "");
    const canGrade = isAcceptedRegistration(item.status);

    return (
        <View style={styles.detailsBox}>
            <Text style={styles.detailLabel}>Calificaciones</Text>
            {canGrade ? null : <Text style={styles.hintText}>Valide primero la inscripción para ingresar calificaciones.</Text>}

            <Text style={styles.detailLabel}>Observación:</Text>
            <TextInput
                style={[styles.input, styles.multiline]}
                value={observation}
                onChangeText={(v) => onSetObs(item.id, v)}
                placeholder="Escriba una observación sobre esta inscripción..."
                placeholderTextColor={theme.colors.textTertiary}
                multiline
            />

            {canGrade ? (
                <>
                    <Text style={styles.detailLabel}>Finalizar (resultado final)</Text>
                    <View style={styles.row2}>
                        <View style={styles.col}>
                            <Text style={styles.labelSmall}>Asistencia %</Text>
                            <TextInput
                                style={styles.input}
                                value={attendance}
                                onChangeText={(v) => onSetAttendance(item.id, v)}
                                placeholder="0 - 100"
                                placeholderTextColor={theme.colors.textTertiary}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.labelSmall}>Nota {isCourse ? "(curso)" : ""}</Text>
                            <TextInput
                                style={[styles.input, !isCourse && styles.inputDisabled]}
                                value={grade}
                                onChangeText={(v) => onSetGrade(item.id, v)}
                                placeholder={isCourse ? "0 - 10" : "N/A"}
                                placeholderTextColor={theme.colors.textTertiary}
                                keyboardType="numeric"
                                editable={isCourse}
                            />
                        </View>
                    </View>
                </>
            ) : null}


            <View style={styles.actionRow}>
                <Pressable
                    style={[styles.actionBtn, styles.btnSuccess, isPendingAction && styles.btnDisabled]}
                    onPress={() => onAccept(item)}
                    disabled={isPendingAction}
                >
                    {isPendingAction ? (
                        <ActivityIndicator color={theme.colors.textInverse} />
                    ) : (
                        <Ionicons name="checkmark" size={18} color={theme.colors.textInverse} />
                    )}
                    <Text style={styles.actionBtnText}>Aceptar</Text>
                </Pressable>

                <Pressable
                    style={[styles.actionBtn, styles.btnDanger, isPendingAction && styles.btnDisabled]}
                    onPress={() => onReject(item)}
                    disabled={isPendingAction}
                >
                    <Ionicons name="close" size={18} color={theme.colors.textInverse} />
                    <Text style={styles.actionBtnText}>Rechazar</Text>
                </Pressable>
                {canGrade ? (
                    <Pressable
                        style={[styles.actionBtn, styles.btnPrimary, isPendingAction && styles.btnDisabled]}
                        onPress={() => onFinalize(item)}
                        disabled={isPendingAction}
                    >
                        <Ionicons name="ribbon-outline" size={18} color={theme.colors.textInverse} />
                        <Text style={styles.actionBtnText}>Finalizar</Text>
                    </Pressable>
                ) : (
                    <View style={[styles.actionBtn, styles.actionHintBtn]}>
                        <Ionicons name="lock-closed-outline" size={18} color={theme.colors.textPrimary} />
                        <Text style={styles.actionBtnHintText}>Valide primero para calificar</Text>
                    </View>
                )}
            </View>

            {validateErrorMessage ? <Text style={styles.errorText}>Error: {validateErrorMessage}</Text> : null}
        </View>
    );
}

function RegistrationCard({
    item,
    expanded,
    isLetterExpanded,
    selectedEventId,
    observation,
    attendance,
    grade,
    isPendingAction,
    validateErrorMessage,
    onToggleExpanded,
    onToggleLetter,
    onPreviewReceipt,
    onSetObs,
    onSetAttendance,
    onSetGrade,
    onAccept,
    onReject,
    onFinalize,
}: Readonly<{
    item: AdminRegistration;
    expanded: boolean;
    selectedEventId: string;
    observation: string;
    attendance: string;
    grade: string;
    isLetterExpanded: boolean;
    isPendingAction: boolean;
    validateErrorMessage: string | null;
    onToggleExpanded: (id: string) => void;
    onToggleLetter: (id: string) => void;
    onPreviewReceipt: (url: string) => void;
    onSetObs: (id: string, value: string) => void;
    onSetAttendance: (id: string, value: string) => void;
    onSetGrade: (id: string, value: string) => void;
    onAccept: (reg: AdminRegistration) => void;
    onReject: (reg: AdminRegistration) => void;
    onFinalize: (reg: AdminRegistration) => void;
}>) {
    const statusLabel = getStatusLabel(item.status);
    const userName = pickUserName(item);

    const paymentCount = item.paymentReceipts?.length ?? 0;
    const letterCount = item.motivationLetters?.length ?? 0;
    const docUrl = item.account?.user?.documentUrl ?? "";
    const eventName = item.event?.name ?? "Evento";
    const eventStatus = getEventStatusLabel(item.event?.status ?? "");

    return (
        <View style={styles.card}>
            <LinearGradient colors={theme.gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardAccent} />

            <View style={styles.cardHeaderRow}>
                <View style={[styles.badgeSoft, statusBadgeStyle(item.status)]}>
                    <Text style={styles.badgeText}>{statusLabel}</Text>
                </View>
                <Text style={styles.cardDate}>{formatDateTime(item.registeredAt)}</Text>
            </View>

            <Text style={styles.cardTitle} numberOfLines={2}>
                {userName}
            </Text>

            <Text style={styles.metaText} numberOfLines={2}>
                {eventName}
            </Text>

            <Text style={styles.metaText} numberOfLines={1}>
                {eventStatus}
            </Text>

            <Text style={styles.cardSub} numberOfLines={2}>
                {item.account?.email ?? item.account?.user?.idNumber ?? ""}
            </Text>

            <RegistrationDocumentsSection
                item={item}
                paymentCount={paymentCount}
                letterCount={letterCount}
                docUrl={docUrl}
                isLetterExpanded={isLetterExpanded}
                onPreviewReceipt={onPreviewReceipt}
                onToggleLetter={onToggleLetter}
            />

            <Pressable style={styles.expandRow} onPress={() => onToggleExpanded(item.id)}>
                <Text style={styles.expandText}>{expanded ? "Ocultar detalles" : "Ver detalles"}</Text>
                <Ionicons
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={theme.colors.textSecondary}
                />
            </Pressable>

            {expanded ? (
                <RegistrationDetailsSection
                    item={item}
                    observation={observation}
                    attendance={attendance}
                    grade={grade}
                    isPendingAction={isPendingAction}
                    validateErrorMessage={validateErrorMessage}
                    onSetObs={onSetObs}
                    onSetAttendance={onSetAttendance}
                    onSetGrade={onSetGrade}
                    onAccept={onAccept}
                    onReject={onReject}
                    onFinalize={onFinalize}
                />
            ) : null}
        </View>
    );
}

export default function AdminRegistrationsScreen() {
    const queryClient = useQueryClient();
    const params = useLocalSearchParams<{ eventId?: string }>();

    const initialEventId = (params.eventId ?? "").trim();

    const [page, setPage] = useState(1);
    const limit = 10;

    const [eventOpen, setEventOpen] = useState(false);
    const [eventSearch, setEventSearch] = useState("");
    const debouncedEventSearch = useDebouncedValue(eventSearch, 250);

    const [selectedEventId, setSelectedEventId] = useState<string>(initialEventId);
    const [searchInput, setSearchInput] = useState("");
    const debouncedSearch = useDebouncedValue(searchInput, 250);

    const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
    const [expandedLetterIds, setExpandedLetterIds] = useState<Record<string, boolean>>({});
    const [observationById, setObservationById] = useState<Record<string, string>>({});
    const [attendanceById, setAttendanceById] = useState<Record<string, string>>({});
    const [gradeById, setGradeById] = useState<Record<string, string>>({});
    const [receiptPreviewUrl, setReceiptPreviewUrl] = useState("");

    useEffect(() => {
        // Si llega por deep-link desde eventos, fijamos el filtro.
        if (initialEventId) {
            setSelectedEventId(initialEventId);
        }
    }, [initialEventId]);

    useEffect(() => {
        setPage(1);
    }, [selectedEventId, debouncedSearch]);

    const eventsQuery = useQuery({
        queryKey: ["admin-report-events-pick", { q: debouncedEventSearch }],
        queryFn: async () => {
            // El endpoint es paginado, pero para selector tomamos un lote.
            const res = await fetchReportEventsPaginated(1, EVENT_PICK_LIMIT);
            const q = (debouncedEventSearch ?? "").trim().toLowerCase();
            if (!q) return res.data;
            return res.data.filter((e) => (e.name ?? "").toLowerCase().includes(q));
        },
        staleTime: 60_000,
    });

    const selectedEventLabel = useMemo(() => {
        if (!selectedEventId) return "Todos los eventos";
        const match = eventsQuery.data?.find((e) => e.id === selectedEventId);
        return match?.name ? match.name : `Evento: ${selectedEventId.slice(0, 8)}…`;
    }, [eventsQuery.data, selectedEventId]);

    const registrationsQuery = useQuery({
        queryKey: ["admin-registrations", { page, limit, eventId: selectedEventId, search: debouncedSearch }],
        queryFn: () =>
            selectedEventId
                ? fetchRegistrationsByEventPaginated(selectedEventId, page, limit, debouncedSearch)
                : fetchRegistrationsPaginated(page, limit, debouncedSearch),
        placeholderData: keepPreviousData,
    });

    const validateMutation = useMutation({
        mutationFn: async (vars: { registrationId: string; input: RegistrationsValidationInput }) => {
            return validateRegistration(vars.registrationId, vars.input);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-registrations"] });
        },
    });

    function toggleExpanded(id: string) {
        setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
    }

    function toggleLetterExpanded(id: string) {
        setExpandedLetterIds((prev) => ({ ...prev, [id]: !prev[id] }));
    }

    function setObs(id: string, value: string) {
        setObservationById((prev) => ({ ...prev, [id]: value }));
    }

    function setAttendance(id: string, value: string) {
        setAttendanceById((prev) => ({ ...prev, [id]: value }));
    }

    function setGrade(id: string, value: string) {
        setGradeById((prev) => ({ ...prev, [id]: value }));
    }

    function previewReceipt(url: string) {
        setReceiptPreviewUrl(toAbsoluteUrl(url));
    }

    function runAccept(reg: AdminRegistration) {
        const obs = (observationById[reg.id] ?? "").trim();
        const input: RegistrationsValidationInput = { status: "ACCEPTED" };
        if (obs) input.observacion = obs;
        validateMutation.mutate({ registrationId: reg.id, input });
    }

    function runReject(reg: AdminRegistration) {
        const obs = (observationById[reg.id] ?? "").trim();
        Alert.alert(
            "Rechazar inscripción",
            obs ? "Se enviará la observación junto al rechazo." : "Puedes escribir una observación antes de rechazar.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Rechazar",
                    style: "destructive",
                    onPress: () => {
                        const input: RegistrationsValidationInput = { status: "REJECTED" };
                        if (obs) input.observacion = obs;
                        validateMutation.mutate({ registrationId: reg.id, input });
                    },
                },
            ]
        );
    }

    function runFinalize(reg: AdminRegistration) {
        const isCourse = isCourseEventType(reg.event?.type ?? "");
        const attendance = parseNumberOrNull(attendanceById[reg.id] ?? "");
        const grade = parseNumberOrNull(gradeById[reg.id] ?? "");
        const obs = (observationById[reg.id] ?? "").trim();

        if (attendance === null) {
            Alert.alert("Falta asistencia", "Ingresa el % de asistencia (0–100) para finalizar.");
            return;
        }
        if (attendance < 0 || attendance > 100) {
            Alert.alert("Asistencia inválida", "La asistencia debe estar entre 0 y 100.");
            return;
        }
        if (isCourse) {
            if (grade === null) {
                Alert.alert("Falta nota", "Para cursos, ingresa la nota final (0–10).");
                return;
            }
            if (grade < 0 || grade > 10) {
                Alert.alert("Nota inválida", "La nota debe estar entre 0 y 10.");
                return;
            }
        }

        const input: RegistrationsValidationInput = {
            status: "APPROVED",
            finalAttendancePercent: attendance,
        };
        if (isCourse && grade !== null) input.finalGrade = grade;
        if (obs) input.observacion = obs;

        Alert.alert("Finalizar inscripción", "Se calculará el resultado final (aprobado/reprobado) según asistencia y nota.", [
            { text: "Cancelar", style: "cancel" },
            { text: "Finalizar", onPress: () => validateMutation.mutate({ registrationId: reg.id, input }) },
        ]);
    }

    const pagination = registrationsQuery.data?.pagination;
    const validateErrorMessage = validateMutation.isError
        ? getErrorMessage(validateMutation.error, "No se pudo validar")
        : null;
    const registrationsErrorMessage = registrationsQuery.isError
        ? getErrorMessage(registrationsQuery.error, "No se pudieron cargar")
        : null;

    return (
        <View style={styles.container}>
            <AppHeader title="Validar inscripciones" showNotifications />

            <FlatList
                data={registrationsQuery.data?.data ?? []}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <View style={styles.filtersCard}>
                        <Text style={styles.filtersTitle}>Búsqueda y filtros</Text>

                        <Text style={styles.label}>Evento</Text>
                        <Pressable style={styles.selectBtn} onPress={() => setEventOpen((v) => !v)}>
                            <Text style={styles.selectBtnText} numberOfLines={2}>
                                {selectedEventLabel}
                            </Text>
                            <Ionicons
                                name={eventOpen ? "chevron-up" : "chevron-down"}
                                size={18}
                                color={theme.colors.textSecondary}
                            />
                        </Pressable>
                        {eventOpen ? (
                            <View style={styles.selectMenu}>
                                <View style={styles.searchRow}>
                                    <Ionicons name="search" size={16} color={theme.colors.textSecondary} />
                                    <TextInput
                                        style={styles.searchInput}
                                        value={eventSearch}
                                        onChangeText={setEventSearch}
                                        placeholder="Buscar evento…"
                                        placeholderTextColor={theme.colors.textTertiary}
                                    />
                                    {eventSearch ? (
                                        <Pressable style={styles.clearIconBtn} onPress={() => setEventSearch("")}>
                                            <Ionicons name="close" size={16} color={theme.colors.textSecondary} />
                                        </Pressable>
                                    ) : null}
                                </View>

                                <Pressable
                                    style={[styles.selectItem, !selectedEventId && styles.selectItemActive]}
                                    onPress={() => {
                                        setSelectedEventId("");
                                        setEventOpen(false);
                                    }}
                                >
                                    <Text style={styles.selectItemText}>Todos los eventos</Text>
                                </Pressable>

                                {renderEventSelectorContent({
                                    isLoading: eventsQuery.isLoading,
                                    isError: eventsQuery.isError,
                                    error: eventsQuery.error,
                                    events: eventsQuery.data ?? [],
                                    selectedEventId,
                                    onSelect: (id) => {
                                        setSelectedEventId(id);
                                        setEventOpen(false);
                                    },
                                })}
                            </View>
                        ) : null}

                        <Text style={styles.label}>Buscar (usuario/correo/evento)</Text>
                        <View style={styles.searchRow}>
                            <Ionicons name="search" size={16} color={theme.colors.textSecondary} />
                            <TextInput
                                style={styles.searchInput}
                                value={searchInput}
                                onChangeText={setSearchInput}
                                placeholder="Buscar por nombre, correo o evento..."
                                placeholderTextColor={theme.colors.textTertiary}
                            />
                            {searchInput ? (
                                <Pressable style={styles.clearIconBtn} onPress={() => setSearchInput("")}>
                                    <Ionicons name="close" size={16} color={theme.colors.textSecondary} />
                                </Pressable>
                            ) : null}
                        </View>

                        <View style={styles.paginationRow}>
                            <Pressable
                                style={[styles.ghostBtn, !(pagination?.hasPrevPage) && styles.btnDisabled]}
                                onPress={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={!pagination?.hasPrevPage}
                            >
                                <Ionicons name="chevron-back" size={18} color={theme.colors.textPrimary} />
                                <Text style={styles.ghostBtnText}>Anterior</Text>
                            </Pressable>
                            <Text style={styles.pageText}>
                                Página {pagination?.currentPage ?? page} / {pagination?.totalPages ?? 1}
                            </Text>
                            <Pressable
                                style={[styles.ghostBtn, !(pagination?.hasNextPage) && styles.btnDisabled]}
                                onPress={() => setPage((p) => p + 1)}
                                disabled={!pagination?.hasNextPage}
                            >
                                <Text style={styles.ghostBtnText}>Siguiente</Text>
                                <Ionicons name="chevron-forward" size={18} color={theme.colors.textPrimary} />
                            </Pressable>
                        </View>

                        {registrationsQuery.isFetching ? (
                            <View style={styles.inlineLoading}>
                                <ActivityIndicator color={theme.colors.primary} />
                                <Text style={styles.loadingText}>Actualizando…</Text>
                            </View>
                        ) : null}

                        {registrationsErrorMessage ? <Text style={styles.errorText}>Error: {registrationsErrorMessage}</Text> : null}
                    </View>
                }
                ListEmptyComponent={
                    registrationsQuery.isLoading ? (
                        <View style={styles.center}>
                            <ActivityIndicator color={theme.colors.primary} />
                            <Text style={styles.loadingText}>Cargando inscripciones…</Text>
                        </View>
                    ) : (
                        <View style={styles.center}>
                            <Text style={styles.emptyText}>No hay inscripciones para mostrar.</Text>
                        </View>
                    )
                }
                renderItem={({ item }) => (
                    <RegistrationCard
                        item={item}
                        expanded={Boolean(expandedIds[item.id])}
                        selectedEventId={selectedEventId}
                        observation={observationById[item.id] ?? ""}
                        attendance={attendanceById[item.id] ?? ""}
                        grade={gradeById[item.id] ?? ""}
                        isLetterExpanded={Boolean(expandedLetterIds[item.id])}
                        isPendingAction={validateMutation.isPending}
                        validateErrorMessage={validateErrorMessage}
                        onToggleExpanded={toggleExpanded}
                        onToggleLetter={toggleLetterExpanded}
                        onPreviewReceipt={previewReceipt}
                        onSetObs={setObs}
                        onSetAttendance={setAttendance}
                        onSetGrade={setGrade}
                        onAccept={runAccept}
                        onReject={runReject}
                        onFinalize={runFinalize}
                    />
                )}
            />
            <Modal visible={Boolean(receiptPreviewUrl)} transparent animationType="fade" onRequestClose={() => setReceiptPreviewUrl("")}>
                <View style={styles.previewBackdrop}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setReceiptPreviewUrl("")} />
                    <View style={styles.previewModal}>
                        <View style={styles.previewHeader}>
                            <Text style={styles.previewTitle}>Comprobante</Text>
                            <Pressable style={styles.previewCloseBtn} onPress={() => setReceiptPreviewUrl("")}>
                                <Ionicons name="close" size={18} color={theme.colors.textPrimary} />
                            </Pressable>
                        </View>
                        {receiptPreviewUrl ? <Image source={{ uri: receiptPreviewUrl }} style={styles.previewImage} resizeMode="contain" /> : null}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bgSecondary },
    listContent: { padding: theme.spacing.md, paddingBottom: theme.spacing.xl },

    filtersCard: {
        backgroundColor: theme.colors.bgElevated,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        ...theme.shadow.sm,
        marginBottom: theme.spacing.md,
    },
    filtersTitle: { color: theme.colors.textPrimary, fontWeight: "900", fontSize: 16, marginBottom: theme.spacing.sm },

    label: { color: theme.colors.textSecondary, fontWeight: "800", marginBottom: 6, marginTop: 10 },
    labelSmall: { color: theme.colors.textSecondary, fontWeight: "800", marginBottom: 6, fontSize: 12 },

    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: theme.colors.bgTertiary,
        borderRadius: theme.radius.md,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
    },
    searchInput: { flex: 1, color: theme.colors.textPrimary, fontWeight: "700" },
    clearIconBtn: { padding: 4 },

    selectBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 12,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        backgroundColor: theme.colors.bgTertiary,
    },
    selectBtnText: { color: theme.colors.textPrimary, fontWeight: "800", flex: 1, paddingRight: 10 },
    selectMenu: {
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        backgroundColor: theme.colors.bgPrimary,
        padding: theme.spacing.sm,
        marginTop: 8,
        gap: 8,
    },
    selectItem: {
        paddingVertical: 10,
        paddingHorizontal: theme.spacing.sm,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.bgTertiary,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
    },
    selectItemActive: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primaryLighter,
    },
    selectItemText: { color: theme.colors.textPrimary, fontWeight: "800" },
    selectLoading: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },

    paginationRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: theme.spacing.md,
        gap: 10,
    },
    pageText: { color: theme.colors.textSecondary, fontWeight: "800" },
    ghostBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 10,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.bgTertiary,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
    },
    ghostBtnText: { color: theme.colors.textPrimary, fontWeight: "900" },
    btnDisabled: { opacity: 0.5 },

    inlineLoading: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12 },
    loadingText: { color: theme.colors.textSecondary, fontWeight: "800" },
    errorText: { color: theme.colors.error, fontWeight: "800", marginTop: 10 },

    center: { alignItems: "center", justifyContent: "center", padding: theme.spacing.lg, gap: 12 },
    emptyText: { color: theme.colors.textSecondary, fontWeight: "800" },

    card: {
        backgroundColor: theme.colors.bgElevated,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        ...theme.shadow.sm,
        marginBottom: theme.spacing.md,
    },
    cardHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
    cardDate: { color: theme.colors.textTertiary, fontWeight: "800" },

    badgeSoft: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 999,
        backgroundColor: theme.colors.bgTertiary,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
    },
    badgeText: { color: theme.colors.textPrimary, fontWeight: "900" },
    badgeSuccess: { backgroundColor: theme.colors.bgTertiary, borderColor: theme.colors.success },
    badgeDanger: { backgroundColor: theme.colors.bgTertiary, borderColor: theme.colors.error },
    badgeWarning: { backgroundColor: theme.colors.bgTertiary, borderColor: theme.colors.warning },

    cardTitle: { color: theme.colors.textPrimary, fontWeight: "900", fontSize: 16, marginTop: 10 },
    cardSub: { color: theme.colors.textSecondary, fontWeight: "800", marginTop: 4 },
    metaText: { color: theme.colors.textSecondary, fontWeight: "800", marginTop: 8 },
    hintText: { color: theme.colors.textSecondary, fontWeight: "700", lineHeight: 18 },

    docsSection: {
        marginTop: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        borderRadius: theme.radius.md,
        padding: theme.spacing.sm,
        gap: 10,
        backgroundColor: theme.colors.bgTertiary,
    },
    docRowColumn: { gap: 6 },
    docLabel: { color: theme.colors.textPrimary, fontWeight: "900" },
    docMissing: { color: theme.colors.textTertiary, fontWeight: "700" },
    docInlineRow: { flexDirection: "row", alignItems: "center", gap: 8 },

    docRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: theme.spacing.sm },
    docBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 10,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        backgroundColor: theme.colors.bgTertiary,
    },
    docBtnText: { color: theme.colors.textPrimary, fontWeight: "900" },
    docPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 10,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        backgroundColor: theme.colors.bgTertiary,
    },
    docPillText: { color: theme.colors.textPrimary, fontWeight: "900" },

    expandRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: theme.spacing.sm,
    },
    expandText: { color: theme.colors.primary, fontWeight: "900" },

    detailsBox: { marginTop: theme.spacing.sm, gap: 10 },
    detailLabel: { color: theme.colors.textPrimary, fontWeight: "900" },
    input: {
        backgroundColor: theme.colors.bgTertiary,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 10,
        color: theme.colors.textPrimary,
        fontWeight: "700",
    },
    inputDisabled: { opacity: 0.6 },
    multiline: { minHeight: 80, textAlignVertical: "top" },
    row2: { flexDirection: "row", gap: 10 },
    col: { flex: 1 },

    letterBox: {
        backgroundColor: theme.colors.bgTertiary,
        borderRadius: theme.radius.md,
        padding: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        gap: 8,
    },
    letterText: { color: theme.colors.textSecondary, fontWeight: "700", lineHeight: 18 },

    actionRow: { flexDirection: "row", gap: 10, marginTop: 6 },
    actionBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 12,
        borderRadius: theme.radius.md,
    },
    actionBtnText: { color: theme.colors.textInverse, fontWeight: "900" },
    btnPrimary: { backgroundColor: theme.colors.primary },
    btnSuccess: { backgroundColor: theme.colors.success },
    btnDanger: { backgroundColor: theme.colors.error },
    letterToggleBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        borderRadius: theme.radius.md,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 10,
        backgroundColor: theme.colors.bgSecondary,
    },
    actionHintBtn: {
        backgroundColor: theme.colors.bgSecondary,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
    },
    actionBtnHintText: { color: theme.colors.textSecondary, fontWeight: "800" },
    cardAccent: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 6,
        borderTopLeftRadius: theme.radius.lg,
        borderTopRightRadius: theme.radius.lg,
    },
    previewBackdrop: {
        flex: 1,
        backgroundColor: theme.colors.overlayBlack68,
        justifyContent: "center",
        padding: theme.spacing.lg,
    },
    previewModal: {
        backgroundColor: theme.colors.bgPrimary,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        overflow: "hidden",
        maxHeight: "90%",
    },
    previewHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderPrimary,
    },
    previewTitle: { color: theme.colors.textPrimary, fontWeight: "900", fontSize: 16 },
    previewCloseBtn: {
        width: 36,
        height: 36,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.bgSecondary,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
    },
    previewImage: { width: "100%", height: 420, backgroundColor: theme.colors.bgSecondary },
});
