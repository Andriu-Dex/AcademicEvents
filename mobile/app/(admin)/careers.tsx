import { useMemo, useState, type ReactNode } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { AppHeader } from "../../src/components/AppHeader";
import {
    activateCareer,
    deactivateCareer,
    deleteCareerPermanently,
    fetchAllCareers,
    fetchCoordinators,
    fetchFaculties,
    type Career,
} from "../../src/api/adminCareers";
import { theme } from "../../src/shared/theme";

function fullName(firstName: string, lastName: string) {
    return `${firstName} ${lastName}`.trim();
}

function CareerCard({
    career,
    onEdit,
    onToggle,
    onDeletePermanent,
}: Readonly<{
    career: Career;
    onEdit: () => void;
    onToggle: () => void;
    onDeletePermanent: () => void;
}>) {
    return (
        <View style={styles.itemCard}>
            <View style={styles.itemHeaderRow}>
                <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.itemTitle} numberOfLines={2}>
                        {career.name}
                    </Text>
                    <Text style={styles.itemSubtitle} numberOfLines={2}>
                        {career.facultyName ? `Facultad: ${career.facultyName}` : "Facultad: -"}
                    </Text>
                    <Text style={styles.itemSubtitle} numberOfLines={2}>
                        {career.coordinatorName ? `Coordinador: ${career.coordinatorName}` : "Coordinador: -"}
                    </Text>
                </View>

                <View style={[styles.badge, career.isActive ? styles.badgeSuccess : styles.badgeMuted]}>
                    <Text style={[styles.badgeText, !career.isActive && styles.badgeTextMuted]}>
                        {career.isActive ? "Activa" : "Inactiva"}
                    </Text>
                </View>
            </View>

            {career.description ? (
                <Text style={styles.itemDesc} numberOfLines={3}>
                    {career.description}
                </Text>
            ) : null}

            <View style={styles.itemMetaRow}>
                <Text style={styles.itemMetaText}>Semestres: {career.semesters || "-"}</Text>
                <Text style={styles.itemMetaText}>Modalidad: {career.modality || "-"}</Text>
            </View>

            <View style={styles.actionRow}>
                <Pressable style={[styles.actionBtn, styles.actionBtnPrimary]} onPress={onEdit}>
                    <Ionicons name="create-outline" size={16} color={theme.colors.textInverse} />
                    <Text style={styles.actionBtnTextPrimary}>Editar</Text>
                </Pressable>

                <Pressable style={[styles.actionBtn, styles.actionBtnGhost]} onPress={onToggle}>
                    <Ionicons
                        name={career.isActive ? "pause-outline" : "play-outline"}
                        size={16}
                        color={theme.colors.textPrimary}
                    />
                    <Text style={styles.actionBtnTextGhost}>{career.isActive ? "Desactivar" : "Activar"}</Text>
                </Pressable>

                <Pressable style={[styles.actionBtn, styles.actionBtnDanger]} onPress={onDeletePermanent}>
                    <Ionicons name="trash-outline" size={16} color={theme.colors.textInverse} />
                    <Text style={styles.actionBtnTextPrimary}>Eliminar</Text>
                </Pressable>
            </View>
        </View>
    );
}

export default function AdminCareersScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");

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

    const toggleMutation = useMutation({
        mutationFn: async (career: Career) => {
            if (career.isActive) {
                await deactivateCareer(career.id);
            } else {
                await activateCareer(career.id);
            }
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["admin-careers-all"] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCareerPermanently,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["admin-careers-all"] });
        },
    });

    const enrichedCareers = useMemo(() => {
        const items = careersQuery.data ?? [];
        const facultyById = new Map((facultiesQuery.data ?? []).map((f) => [f.id, f.name]));
        const coordinatorById = new Map(
            (coordinatorsQuery.data ?? []).map((c) => [c.id, fullName(c.firstName, c.lastName)])
        );

        return items.map((career) => {
            const fallbackFacultyName = career.facultyId ? facultyById.get(career.facultyId) : undefined;
            const fallbackCoordinatorName = career.coordinatorId ? coordinatorById.get(career.coordinatorId) : undefined;

            return {
                ...career,
                facultyName: career.facultyName || fallbackFacultyName,
                coordinatorName: career.coordinatorName || fallbackCoordinatorName,
            };
        });
    }, [careersQuery.data, facultiesQuery.data, coordinatorsQuery.data]);

    const filtered = useMemo(() => {
        const items = enrichedCareers;
        const q = search.trim().toLowerCase();
        if (!q) return items;

        return items.filter((c) => {
            const text = `${c.name} ${c.description} ${c.facultyName ?? ""} ${c.coordinatorName ?? ""}`.toLowerCase();
            return text.includes(q);
        });
    }, [enrichedCareers, search]);

    let listEmptyComponent: ReactNode;
    if (careersQuery.isLoading) {
        listEmptyComponent = (
            <View style={styles.center}>
                <ActivityIndicator color={theme.colors.primary} />
                <Text style={styles.helperText}>Cargando carreras...</Text>
            </View>
        );
    } else if (careersQuery.isError) {
        listEmptyComponent = (
            <View style={styles.center}>
                <Text style={styles.errorText}>No se pudieron cargar las carreras.</Text>
            </View>
        );
    } else {
        listEmptyComponent = (
            <View style={styles.center}>
                <Text style={styles.helperText}>No hay carreras para mostrar.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <AppHeader title="Gestionar carreras" showNotifications />

            <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                ListHeaderComponent={
                    <View style={styles.headerArea}>
                        <View style={styles.searchWrap}>
                            <Ionicons name="search" size={18} color={theme.colors.textSecondary} />
                            <TextInput
                                placeholder="Buscar carrera..."
                                placeholderTextColor={theme.colors.textTertiary}
                                value={search}
                                onChangeText={setSearch}
                                style={styles.searchInput}
                            />
                            {search.length > 0 ? (
                                <Pressable style={styles.clearIconBtn} onPress={() => setSearch("")}>
                                    <Ionicons name="close" size={16} color={theme.colors.textSecondary} />
                                </Pressable>
                            ) : null}
                        </View>

                        <Pressable
                            style={styles.createBtn}
                            onPress={() => router.push("/(admin)/career-form")}
                        >
                            <Ionicons name="add" size={18} color={theme.colors.textInverse} />
                            <Text style={styles.createBtnText}>Nueva carrera</Text>
                        </Pressable>
                    </View>
                }
                renderItem={({ item }) => (
                    <CareerCard
                        career={item}
                        onEdit={() => router.push({ pathname: "/(admin)/career-form", params: { id: item.id } })}
                        onToggle={() => {
                            Alert.alert(
                                item.isActive ? "Desactivar carrera" : "Activar carrera",
                                `¿Deseas ${item.isActive ? "desactivar" : "activar"} "${item.name}"?`,
                                [
                                    { text: "Cancelar", style: "cancel" },
                                    {
                                        text: item.isActive ? "Desactivar" : "Activar",
                                        style: item.isActive ? "destructive" : "default",
                                        onPress: () => toggleMutation.mutate(item),
                                    },
                                ]
                            );
                        }}
                        onDeletePermanent={() => {
                            Alert.alert(
                                "Eliminar permanentemente",
                                `Esto intentará eliminar "${item.name}" de forma permanente. Si tiene dependencias, el backend puede rechazar la operación.`,
                                [
                                    { text: "Cancelar", style: "cancel" },
                                    {
                                        text: "Eliminar",
                                        style: "destructive",
                                        onPress: () => deleteMutation.mutate(item.id),
                                    },
                                ]
                            );
                        }}
                    />
                )}
                ListEmptyComponent={listEmptyComponent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bgSecondary },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: theme.spacing.lg, gap: 10 },
    helperText: { color: theme.colors.textSecondary, fontWeight: "800" },
    errorText: { color: theme.colors.error, fontWeight: "900" },

    list: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: theme.spacing.xl },
    headerArea: { gap: theme.spacing.md, marginBottom: theme.spacing.md },
    searchWrap: {
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

    createBtn: {
        height: 46,
        borderRadius: 999,
        backgroundColor: theme.colors.primary,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 10,
        ...theme.shadow.primary,
    },
    createBtnText: { color: theme.colors.textInverse, fontWeight: "900" },

    itemCard: {
        backgroundColor: theme.colors.bgPrimary,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        padding: theme.spacing.md,
        gap: 10,
        ...theme.shadow.md,
    },
    itemHeaderRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
    itemTitle: { fontSize: 16, fontWeight: "900", color: theme.colors.textPrimary },
    itemSubtitle: { color: theme.colors.textSecondary, fontWeight: "800" },
    itemDesc: { color: theme.colors.textSecondary, fontWeight: "700" },
    itemMetaRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
    itemMetaText: { color: theme.colors.textTertiary, fontWeight: "800" },

    badge: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
    badgeSuccess: { backgroundColor: theme.colors.success },
    badgeMuted: { backgroundColor: theme.colors.bgSecondary, borderWidth: 1, borderColor: theme.colors.borderPrimary },
    badgeText: { color: theme.colors.textInverse, fontWeight: "900", fontSize: 12 },
    badgeTextMuted: { color: theme.colors.textSecondary },

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
    actionBtnGhost: { backgroundColor: theme.colors.bgSecondary, borderWidth: 1, borderColor: theme.colors.borderPrimary },
    actionBtnDanger: { backgroundColor: theme.colors.error },
    actionBtnTextPrimary: { color: theme.colors.textInverse, fontWeight: "900" },
    actionBtnTextGhost: { color: theme.colors.textPrimary, fontWeight: "900" },
});
