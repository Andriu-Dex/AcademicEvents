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
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppHeader } from "../../src/components/AppHeader";
import {
    blockAccount,
    createAdmin,
    deleteAccount,
    fetchAdminsPaginated,
    fetchUsersPaginated,
    type AdminCreateInput,
    type ManagedAccount,
    unblockAccount,
    updateAccount,
} from "../../src/api/adminAccounts";
import { theme } from "../../src/shared/theme";

type FieldErrors = Partial<Record<keyof AdminCreateInput | "confirmar", string>>;

const ADMIN_ROLE_OPTIONS = [
    { label: "Administrador general", value: "ADMIN_GENERAL" as const },
    { label: "Administrador global", value: "ADMIN_GLOBAL" as const },
];

const USER_ROLE_OPTIONS = [
    { label: "Todos", value: "" },
    { label: "Estudiantes", value: "ESTUDIANTE" },
    { label: "Generales", value: "GENERAL" },
];

const ADMIN_ROLE_FILTERS = [
    { label: "Todos", value: "" },
    { label: "Global", value: "ADMIN_GLOBAL" },
    { label: "General", value: "ADMIN_GENERAL" },
];

const ADMIN_EDIT_ROLE_OPTIONS = [
    { label: "Administrador global", value: "ADMIN_GLOBAL" },
    { label: "Administrador general", value: "ADMIN_GENERAL" },
];

const USER_EDIT_ROLE_OPTIONS = [
    { label: "Estudiante", value: "ESTUDIANTE" },
    { label: "General", value: "GENERAL" },
];

function useDebouncedValue<T>(value: T, delayMs: number) {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delayMs);
        return () => clearTimeout(timer);
    }, [value, delayMs]);

    return debounced;
}

function formatRole(role?: string | null) {
    const normalized = (role ?? "").trim().toUpperCase();
    if (normalized === "ADMIN_GLOBAL" || normalized === "GLOBAL_ADMIN") return "Administrador global";
    if (normalized === "ADMIN_GENERAL" || normalized === "GENERAL_ADMIN") return "Administrador general";
    if (normalized === "ESTUDIANTE") return "Estudiante";
    if (normalized === "GENERAL") return "General";
    return role ?? "-";
}

function getAccountName(account: ManagedAccount) {
    const first = account.user?.firstName ?? "";
    const last = account.user?.lastName ?? "";
    const full = `${first} ${last}`.trim();
    return full || account.email || "Cuenta";
}

function getApiErrorMessage(error: unknown) {
    const fallback = "No se pudo crear el administrador.";
    if (!error || typeof error !== "object") return fallback;
    const maybeResponse = (error as { response?: { data?: Record<string, unknown> } }).response;
    const data = maybeResponse?.data;
    if (!data || typeof data !== "object") return fallback;
    const message = (data.msg ?? data.error ?? data.message ?? data.mensaje) as unknown;
    if (typeof message === "string" && message.trim()) return message;
    return fallback;
}

function isValidCedula(value: string) {
    return /^\d{10}$/.test(value.trim());
}

function isValidPhone(value: string) {
    return /^09\d{8}$/.test(value.trim());
}

function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function AdminGlobalUsersScreen() {
    const queryClient = useQueryClient();

    const [apiError, setApiError] = useState<string | null>(null);

    const [form, setForm] = useState<AdminCreateInput>({
        cedula: "",
        nombres: "",
        apellidos: "",
        celular: "",
        correo: "",
        contrasena: "",
        rol: "ADMIN_GENERAL",
    });
    const [confirmar, setConfirmar] = useState("");
    const [errors, setErrors] = useState<FieldErrors>({});
    const [roleOpen, setRoleOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [expandedAccountId, setExpandedAccountId] = useState<string | null>(null);
    const [editAccountId, setEditAccountId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({
        cedula: "",
        nombres: "",
        apellidos: "",
        celular: "",
        correo: "",
        rol: "",
        est_ver_cor: false,
    });
    const [editErrors, setEditErrors] = useState<FieldErrors>({});
    const [actionTarget, setActionTarget] = useState<{ id: string; action: "block" | "unblock" | "delete" } | null>(
        null
    );
    const [actionReason, setActionReason] = useState("");
    const [actionError, setActionError] = useState<string | null>(null);

    const [adminsPage, setAdminsPage] = useState(1);
    const [usersPage, setUsersPage] = useState(1);
    const [adminsSearch, setAdminsSearch] = useState("");
    const [usersSearch, setUsersSearch] = useState("");
    const [adminRoleFilter, setAdminRoleFilter] = useState<"ADMIN_GLOBAL" | "ADMIN_GENERAL" | "">("");
    const [userRoleFilter, setUserRoleFilter] = useState<"ESTUDIANTE" | "GENERAL" | "">("");

    const debouncedAdminsSearch = useDebouncedValue(adminsSearch, 350);
    const debouncedUsersSearch = useDebouncedValue(usersSearch, 350);

    const adminsQuery = useQuery({
        queryKey: ["admin-global-admins", adminsPage, debouncedAdminsSearch, adminRoleFilter],
        queryFn: () => fetchAdminsPaginated(adminsPage, 8, debouncedAdminsSearch, adminRoleFilter),
        placeholderData: keepPreviousData,
        staleTime: 30000,
    });

    const usersQuery = useQuery({
        queryKey: ["admin-global-users", usersPage, debouncedUsersSearch, userRoleFilter],
        queryFn: () => fetchUsersPaginated(usersPage, 8, debouncedUsersSearch, userRoleFilter),
        placeholderData: keepPreviousData,
        staleTime: 30000,
    });

    const createMutation = useMutation({
        mutationFn: async () => {
            setApiError(null);
            const validation: FieldErrors = {};
            if (!form.cedula.trim()) {
                validation.cedula = "La cedula es obligatoria";
            } else if (!isValidCedula(form.cedula)) {
                validation.cedula = "La cedula debe tener 10 digitos";
            }
            if (!form.nombres.trim()) validation.nombres = "Los nombres son obligatorios";
            if (!form.apellidos.trim()) validation.apellidos = "Los apellidos son obligatorios";
            if (!form.celular.trim()) validation.celular = "El celular es obligatorio";
            if (form.celular && !isValidPhone(form.celular)) {
                validation.celular = "El celular debe iniciar con 09 y tener 10 digitos";
            }
            if (!form.correo.trim()) {
                validation.correo = "El correo es obligatorio";
            } else if (!isValidEmail(form.correo)) {
                validation.correo = "El correo no es valido";
            }
            if (!form.contrasena.trim()) validation.contrasena = "La contrasena es obligatoria";
            if (form.contrasena.trim().length > 0 && form.contrasena.trim().length < 8) {
                validation.contrasena = "La contrasena debe tener al menos 8 caracteres";
            }
            if (form.contrasena !== confirmar) validation.confirmar = "Las contrasenas no coinciden";

            setErrors(validation);
            if (Object.keys(validation).length > 0) {
                throw new Error("validation");
            }

            return createAdmin({
                ...form,
                cedula: form.cedula.trim(),
                nombres: form.nombres.trim(),
                apellidos: form.apellidos.trim(),
                celular: form.celular.trim(),
                correo: form.correo.trim(),
                contrasena: form.contrasena.trim(),
            });
        },
        onSuccess: async () => {
            setForm({
                cedula: "",
                nombres: "",
                apellidos: "",
                celular: "",
                correo: "",
                contrasena: "",
                rol: "ADMIN_GENERAL",
            });
            setConfirmar("");
            setErrors({});
            setRoleOpen(false);
            await queryClient.invalidateQueries({ queryKey: ["admin-global-admins"] });
        },
        onError: (error) => {
            if (error instanceof Error && error.message === "validation") return;
            const message = getApiErrorMessage(error);
            setApiError(message);
        },
    });

    const createErrorText = useMemo(() => {
        if (apiError) return apiError;
        if (createMutation.isError && (createMutation.error as Error)?.message !== "validation") {
            return "No se pudo crear el administrador.";
        }
        return null;
    }, [apiError, createMutation.isError, createMutation.error]);

    const admins = adminsQuery.data?.data ?? [];
    const adminsPagination = adminsQuery.data?.pagination;
    const users = usersQuery.data?.data ?? [];
    const usersPagination = usersQuery.data?.pagination;

    const updateMutation = useMutation({
        mutationFn: async () => {
            setActionError(null);
            if (!editAccountId) throw new Error("missing");
            const validation: FieldErrors = {};

            if (!editForm.cedula.trim()) {
                validation.cedula = "La cedula es obligatoria";
            } else if (!isValidCedula(editForm.cedula)) {
                validation.cedula = "La cedula debe tener 10 digitos";
            }

            if (!editForm.nombres.trim()) validation.nombres = "Los nombres son obligatorios";
            if (!editForm.apellidos.trim()) validation.apellidos = "Los apellidos son obligatorios";
            if (!editForm.celular.trim()) validation.celular = "El celular es obligatorio";
            if (!isValidPhone(editForm.celular)) {
                validation.celular = "El celular debe iniciar con 09 y tener 10 digitos";
            }
            if (!editForm.correo.trim()) {
                validation.correo = "El correo es obligatorio";
            } else if (!isValidEmail(editForm.correo)) {
                validation.correo = "El correo no es valido";
            }

            setEditErrors(validation);
            if (Object.keys(validation).length > 0) {
                throw new Error("validation");
            }

            return updateAccount(editAccountId, {
                cedula: editForm.cedula.trim(),
                nombres: editForm.nombres.trim(),
                apellidos: editForm.apellidos.trim(),
                celular: editForm.celular.trim(),
                correo: editForm.correo.trim(),
                rol: editForm.rol,
                est_ver_cor: editForm.est_ver_cor,
            });
        },
        onSuccess: async () => {
            setEditAccountId(null);
            setEditErrors({});
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["admin-global-admins"] }),
                queryClient.invalidateQueries({ queryKey: ["admin-global-users"] }),
            ]);
        },
        onError: (error) => {
            if (error instanceof Error && error.message === "validation") return;
            setActionError(getApiErrorMessage(error));
        },
    });

    const blockMutation = useMutation({
        mutationFn: async (accountId: string) => {
            if (!actionReason.trim()) throw new Error("validation:El motivo es obligatorio");
            return blockAccount(accountId, actionReason.trim());
        },
        onSuccess: async () => {
            setActionTarget(null);
            setActionReason("");
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["admin-global-admins"] }),
                queryClient.invalidateQueries({ queryKey: ["admin-global-users"] }),
            ]);
        },
        onError: (error) => {
            if (error instanceof Error && error.message.startsWith("validation:")) {
                setActionError(error.message.replace("validation:", ""));
                return;
            }
            setActionError(getApiErrorMessage(error));
        },
    });

    const unblockMutation = useMutation({
        mutationFn: async (accountId: string) => {
            if (!actionReason.trim()) throw new Error("validation:El motivo es obligatorio");
            return unblockAccount(accountId, actionReason.trim());
        },
        onSuccess: async () => {
            setActionTarget(null);
            setActionReason("");
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["admin-global-admins"] }),
                queryClient.invalidateQueries({ queryKey: ["admin-global-users"] }),
            ]);
        },
        onError: (error) => {
            if (error instanceof Error && error.message.startsWith("validation:")) {
                setActionError(error.message.replace("validation:", ""));
                return;
            }
            setActionError(getApiErrorMessage(error));
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (accountId: string) => deleteAccount(accountId),
        onSuccess: async () => {
            setActionTarget(null);
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["admin-global-admins"] }),
                queryClient.invalidateQueries({ queryKey: ["admin-global-users"] }),
            ]);
        },
        onError: (error) => {
            setActionError(getApiErrorMessage(error));
        },
    });

    return (
        <View style={styles.container}>
            <AppHeader title="Gestion de usuarios" showBack backHref="/(admin)/dashboard" showNotifications />
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="shield-outline" size={18} color={theme.colors.primary} />
                        <Text style={styles.sectionTitle}>Gestion de usuarios</Text>
                    </View>
                    <Text style={styles.sectionSubtitle}>
                        Crea nuevos administradores y revisa las cuentas existentes.
                    </Text>
                </View>

                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="person-add-outline" size={18} color={theme.colors.primary} />
                        <Text style={styles.sectionTitle}>Crear nuevo administrador</Text>
                    </View>

                    <View style={styles.formGrid}>
                        <View style={styles.formField}>
                            <Text style={styles.label}>Cedula</Text>
                            <TextInput
                                style={styles.input}
                                value={form.cedula}
                                onChangeText={(text) => setForm((prev) => ({ ...prev, cedula: text }))}
                                placeholder="Ej: 0102030405"
                                placeholderTextColor={theme.colors.textTertiary}
                            />
                            {errors.cedula ? <Text style={styles.errorText}>{errors.cedula}</Text> : null}
                        </View>
                        <View style={styles.formField}>
                            <Text style={styles.label}>Nombres</Text>
                            <TextInput
                                style={styles.input}
                                value={form.nombres}
                                onChangeText={(text) => setForm((prev) => ({ ...prev, nombres: text }))}
                                placeholder="Nombres"
                                placeholderTextColor={theme.colors.textTertiary}
                            />
                            {errors.nombres ? <Text style={styles.errorText}>{errors.nombres}</Text> : null}
                        </View>
                        <View style={styles.formField}>
                            <Text style={styles.label}>Apellidos</Text>
                            <TextInput
                                style={styles.input}
                                value={form.apellidos}
                                onChangeText={(text) => setForm((prev) => ({ ...prev, apellidos: text }))}
                                placeholder="Apellidos"
                                placeholderTextColor={theme.colors.textTertiary}
                            />
                            {errors.apellidos ? <Text style={styles.errorText}>{errors.apellidos}</Text> : null}
                        </View>
                        <View style={styles.formField}>
                            <Text style={styles.label}>Celular</Text>
                            <TextInput
                                style={styles.input}
                                value={form.celular}
                                onChangeText={(text) => setForm((prev) => ({ ...prev, celular: text }))}
                                placeholder="09xxxxxxxx"
                                placeholderTextColor={theme.colors.textTertiary}
                                keyboardType="phone-pad"
                            />
                            {errors.celular ? <Text style={styles.errorText}>{errors.celular}</Text> : null}
                        </View>
                        <View style={styles.formField}>
                            <Text style={styles.label}>Correo</Text>
                            <TextInput
                                style={styles.input}
                                value={form.correo}
                                onChangeText={(text) => setForm((prev) => ({ ...prev, correo: text }))}
                                placeholder="correo@dominio.com"
                                placeholderTextColor={theme.colors.textTertiary}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            {errors.correo ? <Text style={styles.errorText}>{errors.correo}</Text> : null}
                        </View>
                        <View style={styles.formField}>
                            <Text style={styles.label}>Contrasena</Text>
                            <View style={styles.inputRow}>
                                <TextInput
                                    style={[styles.input, styles.inputFlex]}
                                    value={form.contrasena}
                                    onChangeText={(text) => setForm((prev) => ({ ...prev, contrasena: text }))}
                                    placeholder="********"
                                    placeholderTextColor={theme.colors.textTertiary}
                                    secureTextEntry={!showPassword}
                                />
                                <Pressable
                                    style={styles.iconButton}
                                    onPress={() => setShowPassword((prev) => !prev)}
                                >
                                    <Ionicons
                                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                                        size={18}
                                        color={theme.colors.textSecondary}
                                    />
                                </Pressable>
                            </View>
                            {errors.contrasena ? <Text style={styles.errorText}>{errors.contrasena}</Text> : null}
                        </View>
                        <View style={styles.formField}>
                            <Text style={styles.label}>Confirmar contrasena</Text>
                            <TextInput
                                style={styles.input}
                                value={confirmar}
                                onChangeText={setConfirmar}
                                placeholder="********"
                                placeholderTextColor={theme.colors.textTertiary}
                                secureTextEntry
                            />
                            {errors.confirmar ? <Text style={styles.errorText}>{errors.confirmar}</Text> : null}
                        </View>
                        <View style={styles.formField}>
                            <Text style={styles.label}>Rol</Text>
                            <Pressable
                                style={styles.selectButton}
                                onPress={() => setRoleOpen((prev) => !prev)}
                            >
                                <Text style={styles.selectText}>
                                    {ADMIN_ROLE_OPTIONS.find((o) => o.value === form.rol)?.label ?? "Seleccionar"}
                                </Text>
                                <Ionicons
                                    name={roleOpen ? "chevron-up" : "chevron-down"}
                                    size={16}
                                    color={theme.colors.textSecondary}
                                />
                            </Pressable>
                            {roleOpen ? (
                                <View style={styles.selectMenu}>
                                    {ADMIN_ROLE_OPTIONS.map((option) => (
                                        <Pressable
                                            key={option.value}
                                            style={styles.selectOption}
                                            onPress={() => {
                                                setForm((prev) => ({ ...prev, rol: option.value }));
                                                setRoleOpen(false);
                                            }}
                                        >
                                            <Text style={styles.selectOptionText}>{option.label}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            ) : null}
                        </View>
                    </View>

                    <Pressable
                        style={[styles.primaryButton, createMutation.isPending && styles.buttonDisabled]}
                        onPress={() => createMutation.mutate()}
                        disabled={createMutation.isPending}
                    >
                        {createMutation.isPending ? (
                            <ActivityIndicator color={theme.colors.textInverse} />
                        ) : (
                            <Text style={styles.primaryButtonText}>Crear administrador</Text>
                        )}
                    </Pressable>
                    {createErrorText ? <Text style={styles.errorText}>{createErrorText}</Text> : null}
                </View>

                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="people-outline" size={18} color={theme.colors.primary} />
                        <Text style={styles.sectionTitle}>Administradores existentes</Text>
                    </View>
                    <TextInput
                        style={styles.searchInput}
                        value={adminsSearch}
                        onChangeText={setAdminsSearch}
                        placeholder="Buscar por nombre o correo"
                        placeholderTextColor={theme.colors.textTertiary}
                    />
                    <View style={styles.filterRow}>
                        {ADMIN_ROLE_FILTERS.map((opt) => (
                            <Pressable
                                key={opt.value}
                                style={[styles.filterChip, adminRoleFilter === opt.value && styles.filterChipActive]}
                                onPress={() => {
                                    setAdminRoleFilter(opt.value as "ADMIN_GLOBAL" | "ADMIN_GENERAL" | "");
                                    setAdminsPage(1);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        adminRoleFilter === opt.value && styles.filterChipTextActive,
                                    ]}
                                >
                                    {opt.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    {adminsQuery.isLoading ? (
                        <View style={styles.centerBlock}>
                            <ActivityIndicator color={theme.colors.primary} />
                            <Text style={styles.mutedText}>Cargando administradores...</Text>
                        </View>
                    ) : admins.length === 0 ? (
                        <Text style={styles.mutedText}>No hay administradores para mostrar.</Text>
                    ) : (
                        admins.map((account) => (
                            <View key={account.id} style={styles.accountCard}>
                                <View style={styles.accountHeader}>
                                    <Text style={styles.accountName}>{getAccountName(account)}</Text>
                                    <View style={styles.roleBadge}>
                                        <Text style={styles.roleBadgeText}>{formatRole(account.role)}</Text>
                                    </View>
                                </View>
                                <Text style={styles.accountMeta}>{account.email}</Text>
                                <Text style={styles.accountMeta}>Cedula: {account.user?.idNumber || "-"}</Text>
                                <View style={styles.accountStatusRow}>
                                    <Text style={styles.statusText}>
                                        {account.isEmailVerified ? "Correo verificado" : "Correo sin verificar"}
                                    </Text>
                                    {account.isBlocked ? (
                                        <Text style={[styles.statusText, styles.statusDanger]}>Bloqueado</Text>
                                    ) : (
                                        <Text style={styles.statusText}>Activo</Text>
                                    )}
                                </View>
                                <View style={styles.actionRow}>
                                    <Pressable
                                        style={styles.actionButton}
                                        onPress={() =>
                                            setExpandedAccountId((prev) => (prev === account.id ? null : account.id))
                                        }
                                    >
                                        <Text style={styles.actionButtonText}>Ver detalle</Text>
                                    </Pressable>
                                    <Pressable
                                        style={styles.actionButton}
                                        onPress={() => {
                                            setEditAccountId(account.id);
                                            setEditErrors({});
                                            setEditForm({
                                                cedula: account.user?.idNumber ?? "",
                                                nombres: account.user?.firstName ?? "",
                                                apellidos: account.user?.lastName ?? "",
                                                celular: account.user?.phone ?? "",
                                                correo: account.email ?? "",
                                                rol: account.role ?? "ADMIN_GENERAL",
                                                est_ver_cor: Boolean(account.isEmailVerified),
                                            });
                                        }}
                                    >
                                        <Text style={styles.actionButtonText}>Editar</Text>
                                    </Pressable>
                                    <Pressable
                                        style={[styles.actionButton, styles.actionDanger]}
                                        onPress={() => {
                                            setActionTarget({
                                                id: account.id,
                                                action: account.isBlocked ? "unblock" : "block",
                                            });
                                            setActionReason("");
                                            setActionError(null);
                                        }}
                                    >
                                        <Text style={styles.actionButtonText}>
                                            {account.isBlocked ? "Desbloquear" : "Bloquear"}
                                        </Text>
                                    </Pressable>
                                    <Pressable
                                        style={[styles.actionButton, styles.actionDanger]}
                                        onPress={() => {
                                            setActionTarget({ id: account.id, action: "delete" });
                                            setActionError(null);
                                        }}
                                    >
                                        <Text style={styles.actionButtonText}>Eliminar</Text>
                                    </Pressable>
                                </View>
                                {expandedAccountId === account.id ? (
                                    <View style={styles.detailBlock}>
                                        <Text style={styles.detailText}>
                                            Telefono: {account.user?.phone || "-"}
                                        </Text>
                                        <Text style={styles.detailText}>
                                            Rol actual: {formatRole(account.role)}
                                        </Text>
                                        <Text style={styles.detailText}>ID cuenta: {account.id}</Text>
                                    </View>
                                ) : null}
                                {editAccountId === account.id ? (
                                    <View style={styles.editBlock}>
                                        <View style={styles.formField}>
                                            <Text style={styles.label}>Cedula</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={editForm.cedula}
                                                onChangeText={(text) => setEditForm({ ...editForm, cedula: text })}
                                            />
                                            {editErrors.cedula ? <Text style={styles.errorText}>{editErrors.cedula}</Text> : null}
                                        </View>
                                        <View style={styles.formField}>
                                            <Text style={styles.label}>Nombres</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={editForm.nombres}
                                                onChangeText={(text) => setEditForm({ ...editForm, nombres: text })}
                                            />
                                            {editErrors.nombres ? <Text style={styles.errorText}>{editErrors.nombres}</Text> : null}
                                        </View>
                                        <View style={styles.formField}>
                                            <Text style={styles.label}>Apellidos</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={editForm.apellidos}
                                                onChangeText={(text) => setEditForm({ ...editForm, apellidos: text })}
                                            />
                                            {editErrors.apellidos ? <Text style={styles.errorText}>{editErrors.apellidos}</Text> : null}
                                        </View>
                                        <View style={styles.formField}>
                                            <Text style={styles.label}>Celular</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={editForm.celular}
                                                onChangeText={(text) => setEditForm({ ...editForm, celular: text })}
                                                keyboardType="phone-pad"
                                            />
                                            {editErrors.celular ? <Text style={styles.errorText}>{editErrors.celular}</Text> : null}
                                        </View>
                                        <View style={styles.formField}>
                                            <Text style={styles.label}>Correo</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={editForm.correo}
                                                onChangeText={(text) => setEditForm({ ...editForm, correo: text })}
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                            />
                                            {editErrors.correo ? <Text style={styles.errorText}>{editErrors.correo}</Text> : null}
                                        </View>
                                        <Text style={styles.label}>Rol</Text>
                                        <View style={styles.filterRow}>
                                            {ADMIN_EDIT_ROLE_OPTIONS.map((opt) => (
                                                <Pressable
                                                    key={opt.value}
                                                    style={[styles.filterChip, editForm.rol === opt.value && styles.filterChipActive]}
                                                    onPress={() => setEditForm({ ...editForm, rol: opt.value })}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.filterChipText,
                                                            editForm.rol === opt.value && styles.filterChipTextActive,
                                                        ]}
                                                    >
                                                        {opt.label}
                                                    </Text>
                                                </Pressable>
                                            ))}
                                        </View>
                                        <Pressable
                                            style={styles.toggleRow}
                                            onPress={() => setEditForm({ ...editForm, est_ver_cor: !editForm.est_ver_cor })}
                                        >
                                            <View style={[styles.checkbox, editForm.est_ver_cor && styles.checkboxChecked]}>
                                                {editForm.est_ver_cor ? (
                                                    <Ionicons name="checkmark" size={14} color={theme.colors.textInverse} />
                                                ) : null}
                                            </View>
                                            <Text style={styles.toggleLabel}>Correo verificado</Text>
                                        </Pressable>
                                        <View style={styles.editActions}>
                                            <Pressable
                                                style={[styles.primaryButton, updateMutation.isPending && styles.buttonDisabled]}
                                                onPress={() => updateMutation.mutate()}
                                                disabled={updateMutation.isPending}
                                            >
                                                {updateMutation.isPending ? (
                                                    <ActivityIndicator color={theme.colors.textInverse} />
                                                ) : (
                                                    <Text style={styles.primaryButtonText}>Guardar cambios</Text>
                                                )}
                                            </Pressable>
                                            <Pressable
                                                style={styles.secondaryButton}
                                                onPress={() => setEditAccountId(null)}
                                            >
                                                <Text style={styles.secondaryButtonText}>Cancelar</Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                ) : null}
                                {actionTarget?.id === account.id ? (
                                    <View style={styles.actionPanel}>
                                        {actionTarget.action === "delete" ? (
                                            <Text style={styles.detailText}>Confirma eliminar esta cuenta.</Text>
                                        ) : (
                                            <TextInput
                                                style={styles.input}
                                                value={actionReason}
                                                onChangeText={setActionReason}
                                                placeholder="Motivo"
                                                placeholderTextColor={theme.colors.textTertiary}
                                            />
                                        )}
                                        {actionError ? <Text style={styles.errorText}>{actionError}</Text> : null}
                                        <View style={styles.editActions}>
                                            {actionTarget.action === "delete" ? (
                                                <Pressable
                                                    style={[styles.primaryButton, deleteMutation.isPending && styles.buttonDisabled]}
                                                    onPress={() => deleteMutation.mutate(account.id)}
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    <Text style={styles.primaryButtonText}>Eliminar cuenta</Text>
                                                </Pressable>
                                            ) : (
                                                <Pressable
                                                    style={[styles.primaryButton, (blockMutation.isPending || unblockMutation.isPending) && styles.buttonDisabled]}
                                                    onPress={() =>
                                                        account.isBlocked
                                                            ? unblockMutation.mutate(account.id)
                                                            : blockMutation.mutate(account.id)
                                                    }
                                                    disabled={blockMutation.isPending || unblockMutation.isPending}
                                                >
                                                    <Text style={styles.primaryButtonText}>Confirmar</Text>
                                                </Pressable>
                                            )}
                                            <Pressable
                                                style={styles.secondaryButton}
                                                onPress={() => setActionTarget(null)}
                                            >
                                                <Text style={styles.secondaryButtonText}>Cancelar</Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                ) : null}
                            </View>
                        ))
                    )}

                    <View style={styles.paginationRow}>
                        <Pressable
                            style={[styles.pageButton, adminsPage <= 1 && styles.buttonDisabled]}
                            onPress={() => setAdminsPage((p) => Math.max(1, p - 1))}
                            disabled={adminsPage <= 1}
                        >
                            <Ionicons name="chevron-back" size={16} color={theme.colors.textInverse} />
                        </Pressable>
                        <Text style={styles.pageInfo}>
                            {adminsPagination?.currentPage ?? adminsPage} / {adminsPagination?.totalPages ?? 1}
                        </Text>
                        <Pressable
                            style={[
                                styles.pageButton,
                                !(adminsPagination?.hasNextPage ?? false) && styles.buttonDisabled,
                            ]}
                            onPress={() => setAdminsPage((p) => p + 1)}
                            disabled={!(adminsPagination?.hasNextPage ?? false)}
                        >
                            <Ionicons name="chevron-forward" size={16} color={theme.colors.textInverse} />
                        </Pressable>
                    </View>
                </View>

                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="people-circle-outline" size={18} color={theme.colors.primary} />
                        <Text style={styles.sectionTitle}>Usuarios existentes</Text>
                    </View>
                    <TextInput
                        style={styles.searchInput}
                        value={usersSearch}
                        onChangeText={setUsersSearch}
                        placeholder="Buscar por nombre o correo"
                        placeholderTextColor={theme.colors.textTertiary}
                    />
                    <View style={styles.filterRow}>
                        {USER_ROLE_OPTIONS.map((opt) => (
                            <Pressable
                                key={opt.value}
                                style={[styles.filterChip, userRoleFilter === opt.value && styles.filterChipActive]}
                                onPress={() => {
                                    setUserRoleFilter(opt.value as "ESTUDIANTE" | "GENERAL" | "");
                                    setUsersPage(1);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        userRoleFilter === opt.value && styles.filterChipTextActive,
                                    ]}
                                >
                                    {opt.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    {usersQuery.isLoading ? (
                        <View style={styles.centerBlock}>
                            <ActivityIndicator color={theme.colors.primary} />
                            <Text style={styles.mutedText}>Cargando usuarios...</Text>
                        </View>
                    ) : users.length === 0 ? (
                        <Text style={styles.mutedText}>No hay usuarios para mostrar.</Text>
                    ) : (
                        users.map((account) => (
                            <View key={account.id} style={styles.accountCard}>
                                <View style={styles.accountHeader}>
                                    <Text style={styles.accountName}>{getAccountName(account)}</Text>
                                    <View style={styles.roleBadgeSoft}>
                                        <Text style={styles.roleBadgeText}>{formatRole(account.role)}</Text>
                                    </View>
                                </View>
                                <Text style={styles.accountMeta}>{account.email}</Text>
                                <Text style={styles.accountMeta}>Cedula: {account.user?.idNumber || "-"}</Text>
                                <View style={styles.accountStatusRow}>
                                    <Text style={styles.statusText}>
                                        {account.isEmailVerified ? "Correo verificado" : "Correo sin verificar"}
                                    </Text>
                                    {account.isBlocked ? (
                                        <Text style={[styles.statusText, styles.statusDanger]}>Bloqueado</Text>
                                    ) : (
                                        <Text style={styles.statusText}>Activo</Text>
                                    )}
                                </View>
                                <View style={styles.actionRow}>
                                    <Pressable
                                        style={styles.actionButton}
                                        onPress={() =>
                                            setExpandedAccountId((prev) => (prev === account.id ? null : account.id))
                                        }
                                    >
                                        <Text style={styles.actionButtonText}>Ver detalle</Text>
                                    </Pressable>
                                    <Pressable
                                        style={styles.actionButton}
                                        onPress={() => {
                                            setEditAccountId(account.id);
                                            setEditErrors({});
                                            setEditForm({
                                                cedula: account.user?.idNumber ?? "",
                                                nombres: account.user?.firstName ?? "",
                                                apellidos: account.user?.lastName ?? "",
                                                celular: account.user?.phone ?? "",
                                                correo: account.email ?? "",
                                                rol: account.role ?? "GENERAL",
                                                est_ver_cor: Boolean(account.isEmailVerified),
                                            });
                                        }}
                                    >
                                        <Text style={styles.actionButtonText}>Editar</Text>
                                    </Pressable>
                                    <Pressable
                                        style={[styles.actionButton, styles.actionDanger]}
                                        onPress={() => {
                                            setActionTarget({
                                                id: account.id,
                                                action: account.isBlocked ? "unblock" : "block",
                                            });
                                            setActionReason("");
                                            setActionError(null);
                                        }}
                                    >
                                        <Text style={styles.actionButtonText}>
                                            {account.isBlocked ? "Desbloquear" : "Bloquear"}
                                        </Text>
                                    </Pressable>
                                    <Pressable
                                        style={[styles.actionButton, styles.actionDanger]}
                                        onPress={() => {
                                            setActionTarget({ id: account.id, action: "delete" });
                                            setActionError(null);
                                        }}
                                    >
                                        <Text style={styles.actionButtonText}>Eliminar</Text>
                                    </Pressable>
                                </View>
                                {expandedAccountId === account.id ? (
                                    <View style={styles.detailBlock}>
                                        <Text style={styles.detailText}>
                                            Telefono: {account.user?.phone || "-"}
                                        </Text>
                                        <Text style={styles.detailText}>
                                            Rol actual: {formatRole(account.role)}
                                        </Text>
                                        <Text style={styles.detailText}>ID cuenta: {account.id}</Text>
                                    </View>
                                ) : null}
                                {editAccountId === account.id ? (
                                    <View style={styles.editBlock}>
                                        <View style={styles.formField}>
                                            <Text style={styles.label}>Cedula</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={editForm.cedula}
                                                onChangeText={(text) => setEditForm({ ...editForm, cedula: text })}
                                            />
                                            {editErrors.cedula ? <Text style={styles.errorText}>{editErrors.cedula}</Text> : null}
                                        </View>
                                        <View style={styles.formField}>
                                            <Text style={styles.label}>Nombres</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={editForm.nombres}
                                                onChangeText={(text) => setEditForm({ ...editForm, nombres: text })}
                                            />
                                            {editErrors.nombres ? <Text style={styles.errorText}>{editErrors.nombres}</Text> : null}
                                        </View>
                                        <View style={styles.formField}>
                                            <Text style={styles.label}>Apellidos</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={editForm.apellidos}
                                                onChangeText={(text) => setEditForm({ ...editForm, apellidos: text })}
                                            />
                                            {editErrors.apellidos ? <Text style={styles.errorText}>{editErrors.apellidos}</Text> : null}
                                        </View>
                                        <View style={styles.formField}>
                                            <Text style={styles.label}>Celular</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={editForm.celular}
                                                onChangeText={(text) => setEditForm({ ...editForm, celular: text })}
                                                keyboardType="phone-pad"
                                            />
                                            {editErrors.celular ? <Text style={styles.errorText}>{editErrors.celular}</Text> : null}
                                        </View>
                                        <View style={styles.formField}>
                                            <Text style={styles.label}>Correo</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={editForm.correo}
                                                onChangeText={(text) => setEditForm({ ...editForm, correo: text })}
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                            />
                                            {editErrors.correo ? <Text style={styles.errorText}>{editErrors.correo}</Text> : null}
                                        </View>
                                        <Text style={styles.label}>Rol</Text>
                                        <View style={styles.filterRow}>
                                            {USER_EDIT_ROLE_OPTIONS.map((opt) => (
                                                <Pressable
                                                    key={opt.value}
                                                    style={[styles.filterChip, editForm.rol === opt.value && styles.filterChipActive]}
                                                    onPress={() => setEditForm({ ...editForm, rol: opt.value })}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.filterChipText,
                                                            editForm.rol === opt.value && styles.filterChipTextActive,
                                                        ]}
                                                    >
                                                        {opt.label}
                                                    </Text>
                                                </Pressable>
                                            ))}
                                        </View>
                                        <Pressable
                                            style={styles.toggleRow}
                                            onPress={() => setEditForm({ ...editForm, est_ver_cor: !editForm.est_ver_cor })}
                                        >
                                            <View style={[styles.checkbox, editForm.est_ver_cor && styles.checkboxChecked]}>
                                                {editForm.est_ver_cor ? (
                                                    <Ionicons name="checkmark" size={14} color={theme.colors.textInverse} />
                                                ) : null}
                                            </View>
                                            <Text style={styles.toggleLabel}>Correo verificado</Text>
                                        </Pressable>
                                        <View style={styles.editActions}>
                                            <Pressable
                                                style={[styles.primaryButton, updateMutation.isPending && styles.buttonDisabled]}
                                                onPress={() => updateMutation.mutate()}
                                                disabled={updateMutation.isPending}
                                            >
                                                {updateMutation.isPending ? (
                                                    <ActivityIndicator color={theme.colors.textInverse} />
                                                ) : (
                                                    <Text style={styles.primaryButtonText}>Guardar cambios</Text>
                                                )}
                                            </Pressable>
                                            <Pressable
                                                style={styles.secondaryButton}
                                                onPress={() => setEditAccountId(null)}
                                            >
                                                <Text style={styles.secondaryButtonText}>Cancelar</Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                ) : null}
                                {actionTarget?.id === account.id ? (
                                    <View style={styles.actionPanel}>
                                        {actionTarget.action === "delete" ? (
                                            <Text style={styles.detailText}>Confirma eliminar esta cuenta.</Text>
                                        ) : (
                                            <TextInput
                                                style={styles.input}
                                                value={actionReason}
                                                onChangeText={setActionReason}
                                                placeholder="Motivo"
                                                placeholderTextColor={theme.colors.textTertiary}
                                            />
                                        )}
                                        {actionError ? <Text style={styles.errorText}>{actionError}</Text> : null}
                                        <View style={styles.editActions}>
                                            {actionTarget.action === "delete" ? (
                                                <Pressable
                                                    style={[styles.primaryButton, deleteMutation.isPending && styles.buttonDisabled]}
                                                    onPress={() => deleteMutation.mutate(account.id)}
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    <Text style={styles.primaryButtonText}>Eliminar cuenta</Text>
                                                </Pressable>
                                            ) : (
                                                <Pressable
                                                    style={[styles.primaryButton, (blockMutation.isPending || unblockMutation.isPending) && styles.buttonDisabled]}
                                                    onPress={() =>
                                                        account.isBlocked
                                                            ? unblockMutation.mutate(account.id)
                                                            : blockMutation.mutate(account.id)
                                                    }
                                                    disabled={blockMutation.isPending || unblockMutation.isPending}
                                                >
                                                    <Text style={styles.primaryButtonText}>Confirmar</Text>
                                                </Pressable>
                                            )}
                                            <Pressable
                                                style={styles.secondaryButton}
                                                onPress={() => setActionTarget(null)}
                                            >
                                                <Text style={styles.secondaryButtonText}>Cancelar</Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                ) : null}
                            </View>
                        ))
                    )}

                    <View style={styles.paginationRow}>
                        <Pressable
                            style={[styles.pageButton, usersPage <= 1 && styles.buttonDisabled]}
                            onPress={() => setUsersPage((p) => Math.max(1, p - 1))}
                            disabled={usersPage <= 1}
                        >
                            <Ionicons name="chevron-back" size={16} color={theme.colors.textInverse} />
                        </Pressable>
                        <Text style={styles.pageInfo}>
                            {usersPagination?.currentPage ?? usersPage} / {usersPagination?.totalPages ?? 1}
                        </Text>
                        <Pressable
                            style={[styles.pageButton, !(usersPagination?.hasNextPage ?? false) && styles.buttonDisabled]}
                            onPress={() => setUsersPage((p) => p + 1)}
                            disabled={!(usersPagination?.hasNextPage ?? false)}
                        >
                            <Ionicons name="chevron-forward" size={16} color={theme.colors.textInverse} />
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bgSecondary },
    content: { padding: theme.spacing.md, gap: theme.spacing.md, paddingBottom: theme.spacing.xl },

    sectionCard: {
        backgroundColor: theme.colors.bgPrimary,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        gap: 12,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        ...theme.shadow.sm,
    },
    sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    sectionTitle: { fontWeight: "800", fontSize: 15, color: theme.colors.textPrimary },
    sectionSubtitle: { color: theme.colors.textSecondary, fontWeight: "600" },

    formGrid: { gap: 12 },
    formField: { gap: 6 },
    label: { color: theme.colors.textSecondary, fontWeight: "700", fontSize: 12 },
    input: {
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        borderRadius: theme.radius.md,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: theme.colors.textPrimary,
        backgroundColor: theme.colors.bgSecondary,
        fontWeight: "600",
    },
    inputRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    inputFlex: { flex: 1 },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.bgSecondary,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
    },
    selectButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        borderRadius: theme.radius.md,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: theme.colors.bgSecondary,
    },
    selectText: { color: theme.colors.textPrimary, fontWeight: "700" },
    selectMenu: {
        marginTop: 8,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        borderRadius: theme.radius.md,
        overflow: "hidden",
        backgroundColor: theme.colors.bgPrimary,
    },
    selectOption: { paddingVertical: 10, paddingHorizontal: 12 },
    selectOptionText: { color: theme.colors.textPrimary, fontWeight: "600" },

    primaryButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.md,
        paddingVertical: 12,
        alignItems: "center",
    },
    primaryButtonText: { color: theme.colors.textInverse, fontWeight: "800" },

    searchInput: {
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        borderRadius: theme.radius.md,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: theme.colors.textPrimary,
        backgroundColor: theme.colors.bgSecondary,
        fontWeight: "600",
    },
    filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    filterChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        backgroundColor: theme.colors.bgSecondary,
    },
    filterChipActive: { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary },
    filterChipText: { fontSize: 12, fontWeight: "700", color: theme.colors.textSecondary },
    filterChipTextActive: { color: theme.colors.primary },

    accountCard: {
        padding: 12,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        backgroundColor: theme.colors.bgSecondary,
        gap: 6,
    },
    accountHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
    accountName: { fontWeight: "800", color: theme.colors.textPrimary, flex: 1 },
    accountMeta: { color: theme.colors.textSecondary, fontWeight: "600" },
    accountStatusRow: { flexDirection: "row", gap: 12, marginTop: 4 },
    statusText: { fontSize: 11, fontWeight: "700", color: theme.colors.textTertiary },
    statusDanger: { color: theme.colors.error },
    roleBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: theme.colors.primaryLight,
    },
    roleBadgeSoft: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: theme.colors.bgTertiary,
    },
    roleBadgeText: { fontSize: 10, fontWeight: "800", color: theme.colors.primary },

    actionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
    actionButton: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        backgroundColor: theme.colors.bgPrimary,
    },
    actionDanger: { borderColor: theme.colors.error },
    actionButtonText: { fontSize: 11, fontWeight: "700", color: theme.colors.textSecondary },

    detailBlock: {
        marginTop: 8,
        padding: 10,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        backgroundColor: theme.colors.bgPrimary,
        gap: 4,
    },
    detailText: { color: theme.colors.textSecondary, fontWeight: "600", fontSize: 12 },
    editBlock: {
        marginTop: 10,
        gap: 10,
        paddingTop: 6,
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderLight,
    },
    editActions: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
    toggleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    toggleLabel: { color: theme.colors.textSecondary, fontWeight: "600" },
    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.bgSecondary,
    },
    checkboxChecked: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    actionPanel: { gap: 8, marginTop: 8 },

    paginationRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    pageButton: {
        width: 40,
        height: 36,
        borderRadius: theme.radius.md,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.primary,
    },
    pageInfo: { fontWeight: "800", color: theme.colors.textSecondary },
    buttonDisabled: { opacity: 0.5 },

    centerBlock: { alignItems: "center", gap: 6, paddingVertical: 8 },
    mutedText: { color: theme.colors.textTertiary, fontWeight: "600" },
    errorText: { color: theme.colors.error, fontWeight: "700", fontSize: 12 },
});
