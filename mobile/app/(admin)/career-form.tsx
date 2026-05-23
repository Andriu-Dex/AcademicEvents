/* eslint-disable sonarjs/cognitive-complexity */
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AppHeader } from "../../src/components/AppHeader";
import {
    createCareer,
    fetchAllCareers,
    fetchCoordinators,
    fetchFaculties,
    updateCareer,
    type CareerUpsertInput,
} from "../../src/api/adminCareers";
import { theme } from "../../src/shared/theme";

type SelectOption = { label: string; value: string; icon?: string };

const MODALITY_OPTIONS: SelectOption[] = [
    { label: "Presencial", value: "IN_PERSON" },
    { label: "Virtual", value: "VIRTUAL" },
    { label: "Semipresencial", value: "HYBRID" },
];

const ICON_OPTIONS: SelectOption[] = [
    { label: "Escuela", value: "school-outline" },
    { label: "Negocios", value: "business-outline" },
    { label: "Código", value: "code-slash-outline" },
    { label: "Ciencia", value: "flask-outline" },
    { label: "Diseño", value: "color-palette-outline" },
    { label: "Salud", value: "medkit-outline" },
    { label: "Construcción", value: "construct-outline" },
    { label: "Tecnología", value: "laptop-outline" },
    { label: "Deporte", value: "fitness-outline" },
    { label: "Música", value: "musical-notes-outline" },
];

function normalizeModalitySelection(value: string) {
    const raw = (value ?? "").trim().toLowerCase();
    if (raw === "in_person" || raw === "presencial" || raw === "inperson") return "IN_PERSON";
    if (raw === "virtual") return "VIRTUAL";
    if (raw === "hybrid" || raw === "semipresencial" || raw === "hibrida" || raw === "mixta") return "HYBRID";
    return value || "IN_PERSON";
}

function IconPreview({ iconName }: Readonly<{ iconName: string }>) {
    return <Ionicons name={iconName as never} size={18} color={theme.colors.primary} />;
}

function getCoordinatorLabel(coordinators: Array<{ id: string; firstName: string; lastName: string }>, coordinatorId: string) {
    for (const coordinator of coordinators) {
        if (coordinator.id === coordinatorId) {
            return `${coordinator.firstName} ${coordinator.lastName}`.trim();
        }
    }

    return "Selecciona coordinador";
}

function toNumber(value: string, fallback: number) {
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : fallback;
}

export default function CareerFormScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const params = useLocalSearchParams<{ id?: string }>();
    const careerId = (params.id ?? "").trim();
    const isEdit = careerId.length > 0;

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [semesters, setSemesters] = useState("8");
    const [modality, setModality] = useState("Presencial");
    const [icon, setIcon] = useState("school-outline");
    const [facultyId, setFacultyId] = useState("");
    const [coordinatorId, setCoordinatorId] = useState("");
    const [facultyOpen, setFacultyOpen] = useState(false);
    const [coordinatorOpen, setCoordinatorOpen] = useState(false);
    const [modalityOpen, setModalityOpen] = useState(false);
    const [iconOpen, setIconOpen] = useState(false);

    const careersQuery = useQuery({
        queryKey: ["admin-careers-all"],
        queryFn: fetchAllCareers,
        staleTime: 60000,
    });

    const facultiesQuery = useQuery({
        queryKey: ["faculties"],
        queryFn: fetchFaculties,
        staleTime: 60000,
    });

    const coordinatorsQuery = useQuery({
        queryKey: ["coordinators"],
        queryFn: fetchCoordinators,
        staleTime: 60000,
    });

    const currentCareer = useMemo(
        () => (careersQuery.data ?? []).find((c) => c.id === careerId),
        [careersQuery.data, careerId]
    );

    useEffect(() => {
        if (!isEdit || !currentCareer) return;

        setName(currentCareer.name ?? "");
        setDescription(currentCareer.description ?? "");
        setSemesters(String(currentCareer.semesters ?? 0));
        setModality(normalizeModalitySelection(currentCareer.modality ?? ""));
        setIcon(currentCareer.icon ?? "school-outline");
        setFacultyId(currentCareer.facultyId ?? "");
        setCoordinatorId(currentCareer.coordinatorId ?? "");
    }, [isEdit, currentCareer]);

    const upsertMutation = useMutation({
        mutationFn: async () => {
            const payload: CareerUpsertInput = {
                name: name.trim(),
                description: description.trim(),
                semesters: toNumber(semesters, 0),
                modality: modality.trim() || "IN_PERSON",
                icon: icon.trim(),
                facultyId: facultyId.trim(),
                coordinatorId: coordinatorId.trim(),
            };

            if (!payload.name) throw new Error("El nombre es obligatorio");
            if (!payload.facultyId) throw new Error("Selecciona una facultad");
            if (!payload.coordinatorId) throw new Error("Selecciona un coordinador");

            if (isEdit) {
                return updateCareer(careerId, payload);
            }

            return createCareer(payload);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["admin-careers-all"] });
            router.back();
        },
    });

    const faculties = facultiesQuery.data ?? [];
    const coordinators = coordinatorsQuery.data ?? [];
    const selectedModalityLabel = MODALITY_OPTIONS.find((option) => option.value === modality)?.label ?? "Selecciona modalidad";
    const selectedIconLabel = ICON_OPTIONS.find((option) => option.value === icon)?.label ?? "Selecciona icono";
    const currentCoordinatorLabel = getCoordinatorLabel(coordinators, coordinatorId);

    const currentFacultyLabel = faculties.find((f) => f.id === facultyId)?.name ?? "Selecciona facultad";
    const loadingEdit = isEdit && careersQuery.isLoading;

    return (
        <View style={styles.container}>
            <AppHeader title={isEdit ? "Editar carrera" : "Nueva carrera"} showBack />

            {loadingEdit ? (
                <View style={styles.center}>
                    <ActivityIndicator color={theme.colors.primary} />
                    <Text style={styles.helperText}>Cargando carrera...</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.formCard}>
                        <Text style={styles.label}>Nombre</Text>
                        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nombre" />

                        <Text style={styles.label}>Descripcion</Text>
                        <TextInput
                            style={[styles.input, styles.multiline]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Descripcion"
                            multiline
                        />

                        <View style={styles.row2}>
                            <View style={styles.col}>
                                <Text style={styles.label}>Semestres</Text>
                                <TextInput
                                    style={styles.input}
                                    value={semesters}
                                    onChangeText={setSemesters}
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={styles.col}>
                                <Text style={styles.label}>Modalidad</Text>
                                <Pressable style={styles.selectBtn} onPress={() => setModalityOpen((v) => !v)}>
                                    <Text style={styles.selectBtnText}>{selectedModalityLabel}</Text>
                                    <Ionicons
                                        name={modalityOpen ? "chevron-up" : "chevron-down"}
                                        size={18}
                                        color={theme.colors.textSecondary}
                                    />
                                </Pressable>
                                {modalityOpen ? (
                                    <View style={styles.selectMenu}>
                                        {MODALITY_OPTIONS.map((option) => (
                                            <Pressable
                                                key={option.value}
                                                style={styles.selectItem}
                                                onPress={() => {
                                                    setModality(option.value);
                                                    setModalityOpen(false);
                                                }}
                                            >
                                                <Text style={styles.selectItemText}>{option.label}</Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                ) : null}
                            </View>
                        </View>

                        <Text style={styles.label}>Icono</Text>
                        <Pressable style={styles.selectBtn} onPress={() => setIconOpen((v) => !v)}>
                            <View style={styles.iconSelectLabelRow}>
                                <IconPreview iconName={icon || "school-outline"} />
                                <Text style={styles.selectBtnText}>{selectedIconLabel}</Text>
                            </View>
                            <Ionicons name={iconOpen ? "chevron-up" : "chevron-down"} size={18} color={theme.colors.textSecondary} />
                        </Pressable>
                        {iconOpen ? (
                            <View style={styles.selectMenu}>
                                {ICON_OPTIONS.map((option) => (
                                    <Pressable
                                        key={option.value}
                                        style={styles.iconOptionRow}
                                        onPress={() => {
                                            setIcon(option.value);
                                            setIconOpen(false);
                                        }}
                                    >
                                        <IconPreview iconName={option.value} />
                                        <Text style={styles.selectItemText}>{option.label}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        ) : null}

                        <Text style={styles.label}>Facultad</Text>
                        <Pressable style={styles.selectBtn} onPress={() => setFacultyOpen((v) => !v)}>
                            <Text style={styles.selectBtnText}>{currentFacultyLabel}</Text>
                            <Ionicons
                                name={facultyOpen ? "chevron-up" : "chevron-down"}
                                size={18}
                                color={theme.colors.textSecondary}
                            />
                        </Pressable>
                        {facultyOpen ? (
                            <View style={styles.selectMenu}>
                                {faculties.map((f) => (
                                    <Pressable
                                        key={f.id}
                                        style={styles.selectItem}
                                        onPress={() => {
                                            setFacultyId(f.id);
                                            setFacultyOpen(false);
                                        }}
                                    >
                                        <Text style={styles.selectItemText}>{f.name}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        ) : null}

                        <Text style={styles.label}>Coordinador</Text>
                        <Pressable style={styles.selectBtn} onPress={() => setCoordinatorOpen((v) => !v)}>
                            <Text style={styles.selectBtnText}>{currentCoordinatorLabel}</Text>
                            <Ionicons
                                name={coordinatorOpen ? "chevron-up" : "chevron-down"}
                                size={18}
                                color={theme.colors.textSecondary}
                            />
                        </Pressable>
                        {coordinatorOpen ? (
                            <View style={styles.selectMenu}>
                                {coordinators.map((c) => (
                                    <Pressable
                                        key={c.id}
                                        style={styles.selectItem}
                                        onPress={() => {
                                            setCoordinatorId(c.id);
                                            setCoordinatorOpen(false);
                                        }}
                                    >
                                        <Text style={styles.selectItemText}>{`${c.firstName} ${c.lastName}`.trim()}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        ) : null}

                        {upsertMutation.isError ? (
                            <Text style={styles.errorText}>
                                Error: {upsertMutation.error?.message ?? "No se pudo guardar"}
                            </Text>
                        ) : null}

                        <Pressable
                            style={[styles.primaryBtn, upsertMutation.isPending && styles.btnDisabled]}
                            onPress={() => upsertMutation.mutate()}
                        >
                            {upsertMutation.isPending ? (
                                <ActivityIndicator color={theme.colors.textInverse} />
                            ) : (
                                <Ionicons name="save-outline" size={18} color={theme.colors.textInverse} />
                            )}
                            <Text style={styles.primaryBtnText}>{isEdit ? "Guardar" : "Crear"}</Text>
                        </Pressable>
                    </View>
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bgSecondary },
    content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xl },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: theme.spacing.lg, gap: 10 },
    helperText: { color: theme.colors.textSecondary, fontWeight: "800" },
    errorText: { color: theme.colors.error, fontWeight: "900" },

    formCard: {
        backgroundColor: theme.colors.bgPrimary,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        gap: 10,
        ...theme.shadow.sm,
    },
    label: { fontWeight: "900", color: theme.colors.textSecondary, marginTop: 2 },
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
    multiline: { height: 90, textAlignVertical: "top", paddingTop: 12 },
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

    primaryBtn: {
        marginTop: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        height: 48,
        borderRadius: 999,
        backgroundColor: theme.colors.primary,
        ...theme.shadow.primary,
    },
    primaryBtnText: { color: theme.colors.textInverse, fontWeight: "900" },
    btnDisabled: { opacity: 0.7 },
});
