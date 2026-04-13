import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AppHeader } from "../../src/components/AppHeader";
import { toAbsoluteUrl } from "../../src/api/client";
import { fetchAllCareers } from "../../src/api/adminCareers";
import {
    createEvent,
    fetchEventById,
    updateEvent,
    type AdminEventUpsertInput,
    type ImageAsset,
} from "../../src/api/adminEvents";
import { theme } from "../../src/shared/theme";

type Params = { mode?: "create" | "edit"; id?: string };

type SelectOption = { label: string; value: string };

const EVENT_TYPE_OPTIONS: SelectOption[] = [
    { label: "Curso", value: "CURSO" },
    { label: "Conferencia", value: "CONFERENCIA" },
    { label: "Seminario", value: "SEMINARIO" },
    { label: "Taller", value: "TALLER" },
];

const EVENT_STATUS_OPTIONS: SelectOption[] = [
    { label: "Activo", value: "ACTIVE" },
    { label: "Inactivo", value: "INACTIVE" },
    { label: "Finalizado", value: "FINISHED" },
    { label: "Cancelado", value: "CANCELLED" },
    { label: "Suspendido", value: "SUSPENDED" },
];

const MODALITY_OPTIONS: SelectOption[] = [
    { label: "Presencial", value: "IN_PERSON" },
    { label: "Virtual", value: "VIRTUAL" },
    { label: "Semipresencial", value: "HYBRID" },
];

function CheckboxRow({
    label,
    checked,
    onPress,
    disabled,
}: Readonly<{ label: string; checked: boolean; onPress: () => void; disabled?: boolean }>) {
    return (
        <Pressable
            style={[styles.checkboxRow, disabled && styles.rowDisabled]}
            onPress={disabled ? undefined : onPress}
        >
            <View style={[styles.checkbox, checked && styles.checkboxChecked, disabled && styles.checkboxDisabled]}>
                {checked ? <Ionicons name="checkmark" size={16} color={theme.colors.textInverse} /> : null}
            </View>
            <Text style={[styles.checkboxLabel, disabled && styles.textDisabled]} numberOfLines={2}>
                {label}
            </Text>
        </Pressable>
    );
}

function toNumber(value: string, fallback: number) {
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : fallback;
}

export default function AdminEventFormScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const params = useLocalSearchParams<Params>();

    const mode = params.mode ?? "create";
    const eventId = params.id ?? "";

    const [typeOpen, setTypeOpen] = useState(false);
    const [statusOpen, setStatusOpen] = useState(false);
    const [modalityOpen, setModalityOpen] = useState(false);

    const careersQuery = useQuery({
        queryKey: ["admin-careers-all"],
        queryFn: fetchAllCareers,
        staleTime: 120000,
        placeholderData: keepPreviousData,
    });

    const eventQuery = useQuery({
        queryKey: ["admin-event", eventId],
        queryFn: () => fetchEventById(eventId),
        enabled: mode === "edit" && Boolean(eventId),
        staleTime: 20000,
    });

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [type, setType] = useState("CURSO");
    const [status, setStatus] = useState("ACTIVE");
    const [modality, setModality] = useState("IN_PERSON");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [durationHours, setDurationHours] = useState("2");
    const [maxCapacity, setMaxCapacity] = useState("30");
    const [minAttendancePercent, setMinAttendancePercent] = useState("80");
    const [minGrade, setMinGrade] = useState("70");
    const [price, setPrice] = useState("0");

    const [isGeneral, setIsGeneral] = useState(false);
    const [careerIds, setCareerIds] = useState<string[]>([]);

    const [image, setImage] = useState<ImageAsset | null>(null);

    useEffect(() => {
        if (mode !== "edit") return;
        if (!eventQuery.data) return;

        const evt = eventQuery.data;
        setName(evt.name ?? "");
        setDescription(evt.description ?? "");
        setLocation(evt.location ?? "");
        setType(evt.type || "CURSO");
        setStatus(evt.status || "ACTIVE");
        setModality(evt.modality || "IN_PERSON");
        setStartDate(evt.startDate || "");
        setEndDate(evt.endDate || "");
        setDurationHours(String(evt.durationHours ?? 0));
        setMaxCapacity(String(evt.maxCapacity ?? 0));
        setMinAttendancePercent(String(evt.minAttendancePercent ?? 80));
        setMinGrade(evt.minGrade == null ? "" : String(evt.minGrade));
        setPrice(String(evt.price ?? 0));
        setIsGeneral(Boolean(evt.isGeneral));
        setCareerIds(evt.careerIds ?? []);
    }, [mode, eventQuery.data]);

    const selectedTypeLabel = EVENT_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
    const selectedStatusLabel = EVENT_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
    const selectedModalityLabel = MODALITY_OPTIONS.find((o) => o.value === modality)?.label ?? modality;

    const coverPreviewUrl = useMemo(() => {
        if (image?.uri) return image.uri;
        if (mode === "edit" && eventQuery.data?.coverImageUrl) return toAbsoluteUrl(eventQuery.data.coverImageUrl);
        return "";
    }, [image?.uri, mode, eventQuery.data?.coverImageUrl]);

    const mutation = useMutation({
        mutationFn: async () => {
            const payload: AdminEventUpsertInput = {
                name: name.trim(),
                description: description.trim(),
                location: location.trim(),
                type,
                status,
                modality,
                startDate: startDate.trim(),
                endDate: endDate.trim(),
                durationHours: toNumber(durationHours, 0),
                maxCapacity: toNumber(maxCapacity, 0),
                minAttendancePercent: toNumber(minAttendancePercent, 80),
                minGrade: minGrade.trim() ? toNumber(minGrade, 70) : null,
                price: toNumber(price, 0),
                isGeneral,
                careerIds: isGeneral ? [] : careerIds,
            };

            if (!payload.name) throw new Error("El nombre del evento es obligatorio");
            if (!payload.startDate) throw new Error("La fecha de inicio es obligatoria (ISO)");
            if (!payload.endDate) throw new Error("La fecha de fin es obligatoria (ISO)");

            if (mode === "edit") {
                return updateEvent(eventId, payload, image ?? undefined);
            }

            return createEvent(payload, image ?? undefined);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["admin-events-paged"] });
            router.back();
        },
    });

    const pickImage = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: ["image/*"],
            copyToCacheDirectory: true,
            multiple: false,
        });

        if (result.canceled) return;

        const asset = result.assets?.[0];
        if (!asset) return;

        setImage({
            uri: asset.uri,
            name: asset.name || "evento.jpg",
            type: asset.mimeType || "image/jpeg",
        });
    };

    const toggleCareer = (id: string) => {
        setCareerIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    if (mode === "edit" && eventQuery.isLoading) {
        return (
            <View style={styles.container}>
                <AppHeader title="Editar evento" showBack />
                <View style={styles.center}>
                    <ActivityIndicator color={theme.colors.primary} />
                    <Text style={styles.helperText}>Cargando evento…</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <AppHeader title={mode === "edit" ? "Editar evento" : "Crear evento"} showBack />

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Portada</Text>
                    {coverPreviewUrl ? (
                        <Image source={{ uri: coverPreviewUrl }} style={styles.cover} resizeMode="cover" />
                    ) : (
                        <View style={styles.coverFallback} />
                    )}

                    <View style={styles.row2}>
                        <Pressable style={styles.ghostBtn} onPress={pickImage}>
                            <Ionicons name="image-outline" size={18} color={theme.colors.textPrimary} />
                            <Text style={styles.ghostBtnText}>Seleccionar imagen</Text>
                        </Pressable>
                        {image ? (
                            <Pressable style={styles.ghostBtn} onPress={() => setImage(null)}>
                                <Ionicons name="close" size={18} color={theme.colors.textPrimary} />
                                <Text style={styles.ghostBtnText}>Quitar</Text>
                            </Pressable>
                        ) : null}
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Datos básicos</Text>

                    <Text style={styles.label}>Nombre</Text>
                    <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nombre del evento" />

                    <Text style={styles.label}>Descripción</Text>
                    <TextInput
                        style={[styles.input, styles.multiline]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Descripción"
                        multiline
                    />

                    <Text style={styles.label}>Lugar</Text>
                    <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Lugar" />
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Tipo / Estado / Modalidad</Text>

                    <Pressable style={styles.selectBtn} onPress={() => setTypeOpen((v) => !v)}>
                        <Text style={styles.selectBtnText}>Tipo: {selectedTypeLabel}</Text>
                        <Ionicons name={typeOpen ? "chevron-up" : "chevron-down"} size={18} color={theme.colors.textSecondary} />
                    </Pressable>
                    {typeOpen ? (
                        <View style={styles.selectMenu}>
                            {EVENT_TYPE_OPTIONS.map((opt) => (
                                <Pressable
                                    key={opt.value}
                                    style={styles.selectItem}
                                    onPress={() => {
                                        setType(opt.value);
                                        setTypeOpen(false);
                                    }}
                                >
                                    <Text style={styles.selectItemText}>{opt.label}</Text>
                                </Pressable>
                            ))}
                        </View>
                    ) : null}

                    <Pressable style={styles.selectBtn} onPress={() => setStatusOpen((v) => !v)}>
                        <Text style={styles.selectBtnText}>Estado: {selectedStatusLabel}</Text>
                        <Ionicons
                            name={statusOpen ? "chevron-up" : "chevron-down"}
                            size={18}
                            color={theme.colors.textSecondary}
                        />
                    </Pressable>
                    {statusOpen ? (
                        <View style={styles.selectMenu}>
                            {EVENT_STATUS_OPTIONS.map((opt) => (
                                <Pressable
                                    key={opt.value}
                                    style={styles.selectItem}
                                    onPress={() => {
                                        setStatus(opt.value);
                                        setStatusOpen(false);
                                    }}
                                >
                                    <Text style={styles.selectItemText}>{opt.label}</Text>
                                </Pressable>
                            ))}
                        </View>
                    ) : null}

                    <Pressable style={styles.selectBtn} onPress={() => setModalityOpen((v) => !v)}>
                        <Text style={styles.selectBtnText}>Modalidad: {selectedModalityLabel}</Text>
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
                                    key={opt.value}
                                    style={styles.selectItem}
                                    onPress={() => {
                                        setModality(opt.value);
                                        setModalityOpen(false);
                                    }}
                                >
                                    <Text style={styles.selectItemText}>{opt.label}</Text>
                                </Pressable>
                            ))}
                        </View>
                    ) : null}
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Fechas (ISO)</Text>
                    <Text style={styles.hint}>Ejemplo: 2026-06-01T14:00:00.000Z</Text>

                    <Text style={styles.label}>Inicio</Text>
                    <TextInput
                        style={styles.input}
                        value={startDate}
                        onChangeText={setStartDate}
                        placeholder="2026-06-01T14:00:00.000Z"
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>Fin</Text>
                    <TextInput
                        style={styles.input}
                        value={endDate}
                        onChangeText={setEndDate}
                        placeholder="2026-06-01T16:00:00.000Z"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Reglas / Cupos / Precio</Text>

                    <View style={styles.row2}>
                        <View style={styles.col}>
                            <Text style={styles.label}>Duración (h)</Text>
                            <TextInput style={styles.input} value={durationHours} onChangeText={setDurationHours} keyboardType="numeric" />
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.label}>Cupos máx</Text>
                            <TextInput style={styles.input} value={maxCapacity} onChangeText={setMaxCapacity} keyboardType="numeric" />
                        </View>
                    </View>

                    <View style={styles.row2}>
                        <View style={styles.col}>
                            <Text style={styles.label}>Asistencia mín (%)</Text>
                            <TextInput
                                style={styles.input}
                                value={minAttendancePercent}
                                onChangeText={setMinAttendancePercent}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.label}>Nota mín (curso)</Text>
                            <TextInput style={styles.input} value={minGrade} onChangeText={setMinGrade} keyboardType="numeric" />
                        </View>
                    </View>

                    <Text style={styles.label}>Precio</Text>
                    <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" />
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Carreras</Text>

                    <CheckboxRow
                        label="Evento general (sin carreras)"
                        checked={isGeneral}
                        onPress={() => {
                            setIsGeneral((v) => !v);
                            if (!isGeneral) {
                                setCareerIds([]);
                            }
                        }}
                    />

                    {careersQuery.isLoading ? (
                        <Text style={styles.hint}>Cargando carreras…</Text>
                    ) : careersQuery.isError ? (
                        <Text style={styles.errorText}>No se pudieron cargar las carreras.</Text>
                    ) : (
                        <View style={styles.careerList}>
                            {(careersQuery.data ?? []).map((c) => (
                                <CheckboxRow
                                    key={c.id}
                                    label={c.name}
                                    checked={careerIds.includes(c.id)}
                                    disabled={isGeneral}
                                    onPress={() => toggleCareer(c.id)}
                                />
                            ))}
                        </View>
                    )}
                </View>

                {mutation.isError ? (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>Error: {(mutation.error as Error)?.message ?? "No se pudo guardar"}</Text>
                    </View>
                ) : null}

                <Pressable
                    style={[styles.primaryBtn, mutation.isPending && styles.btnDisabled]}
                    onPress={() => {
                        if (mutation.isPending) return;
                        mutation.mutate();
                    }}
                >
                    {mutation.isPending ? (
                        <ActivityIndicator color={theme.colors.textInverse} />
                    ) : (
                        <Ionicons name="save-outline" size={18} color={theme.colors.textInverse} />
                    )}
                    <Text style={styles.primaryBtnText}>{mode === "edit" ? "Guardar cambios" : "Crear evento"}</Text>
                </Pressable>

                <Pressable
                    style={styles.ghostBtnWide}
                    onPress={() => {
                        if (mutation.isPending) {
                            Alert.alert("Guardando…", "Espera a que termine la operación.");
                            return;
                        }
                        router.back();
                    }}
                >
                    <Ionicons name="arrow-back" size={18} color={theme.colors.textPrimary} />
                    <Text style={styles.ghostBtnText}>Volver</Text>
                </Pressable>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bgSecondary },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: theme.spacing.lg, gap: 10 },
    helperText: { color: theme.colors.textSecondary, fontWeight: "800" },

    content: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: theme.spacing.xl },

    card: {
        backgroundColor: theme.colors.bgPrimary,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        gap: 10,
        ...theme.shadow.sm,
    },
    cardTitle: { fontWeight: "900", color: theme.colors.textPrimary, fontSize: 14 },
    label: { fontWeight: "900", color: theme.colors.textSecondary, marginTop: 4 },
    hint: { color: theme.colors.textTertiary, fontWeight: "700" },

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
    multiline: { height: 110, textAlignVertical: "top", paddingTop: 12 },

    row2: { flexDirection: "row", gap: 10 },
    col: { flex: 1, gap: 6 },

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

    cover: { height: 140, width: "100%", borderRadius: theme.radius.md, backgroundColor: theme.colors.bgTertiary },
    coverFallback: { height: 140, width: "100%", borderRadius: theme.radius.md, backgroundColor: theme.colors.bgTertiary },

    ghostBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        height: 44,
        borderRadius: 999,
        backgroundColor: theme.colors.bgSecondary,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
    },
    ghostBtnWide: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        height: 48,
        borderRadius: 999,
        backgroundColor: theme.colors.bgPrimary,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        marginTop: 4,
    },
    ghostBtnText: { color: theme.colors.textPrimary, fontWeight: "900" },

    primaryBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        height: 52,
        borderRadius: 999,
        backgroundColor: theme.colors.primary,
        ...theme.shadow.primary,
    },
    primaryBtnText: { color: theme.colors.textInverse, fontWeight: "900" },
    btnDisabled: { opacity: 0.7 },

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
    checkboxDisabled: { opacity: 0.55 },
    checkboxLabel: { flex: 1, color: theme.colors.textSecondary, fontWeight: "800" },
    careerList: { marginTop: 4 },

    rowDisabled: { opacity: 0.7 },
    textDisabled: { color: theme.colors.textTertiary },

    errorBox: {
        padding: theme.spacing.md,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.error,
        backgroundColor: theme.colors.bgPrimary,
    },
    errorText: { color: theme.colors.error, fontWeight: "900" },
});
