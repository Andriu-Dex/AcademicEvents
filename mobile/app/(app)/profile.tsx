import { useMemo, useState, type ReactNode } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "../../src/components/AppHeader";
import { toAbsoluteUrl } from "../../src/api/client";
import { fetchMyProfile, uploadDocuments, uploadProfileImage } from "../../src/api/profile";
import { fetchMyRegistrations, type RegistrationItem } from "../../src/api/registrations";
import { queryClient } from "../../src/shared/queryClient";
import { useAuthStore } from "../../src/store/authStore";
import { theme } from "../../src/shared/theme";
import { formatRoleLabel } from "../../src/utils/roles";

type PickedFile = { uri: string; name: string; mimeType: string };

function formatDate(raw: string) {
    if (!raw) return "";
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return raw;
    return date.toLocaleDateString("es-EC", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function fileLabel(url: string | null) {
    if (!url) return "";
    try {
        const parsed = new URL(url);
        const parts = parsed.pathname.split("/").filter(Boolean);
        return parts.at(-1) ?? url;
    } catch {
        const parts = url.split("/").filter(Boolean);
        return parts.at(-1) ?? url;
    }
}

async function pickFile(options: DocumentPicker.DocumentPickerOptions): Promise<PickedFile | null> {
    const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        ...options,
    });

    if (result.canceled) return null;
    const asset = result.assets?.[0];
    if (!asset?.uri) return null;

    return {
        uri: asset.uri,
        name: asset.name ?? "archivo",
        mimeType: asset.mimeType ?? "application/octet-stream",
    };
}

function FieldRow({
    label,
    value,
    icon,
}: Readonly<{ label: string; value: string; icon: keyof typeof Ionicons.glyphMap }>) {
    return (
        <View style={styles.fieldRow}>
            <View style={styles.fieldIconWrap}>
                <Ionicons name={icon} size={16} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>{label}</Text>
                <Text style={styles.fieldValue} numberOfLines={2}>
                    {value}
                </Text>
            </View>
        </View>
    );
}

function ProfileHeader({
    profileImageUrl,
    fullName,
    role,
}: Readonly<{ profileImageUrl: string | null; fullName: string; role: string }>) {
    return (
        <LinearGradient
            colors={theme.gradients.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileHero}
        >
            <View style={styles.avatarContainer}>
                {profileImageUrl ? (
                    <Image source={{ uri: toAbsoluteUrl(profileImageUrl) }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarFallback}>
                        <Ionicons name="person" size={34} color={theme.colors.primary} />
                    </View>
                )}
            </View>
            <Text style={styles.heroName} numberOfLines={2}>
                {fullName}
            </Text>
            <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{formatRoleLabel(role)}</Text>
            </View>
        </LinearGradient>
    );
}

function registrationStatusLabel(status: string) {
    const key = (status ?? "").trim().toUpperCase();
    if (key === "PENDING") return "Pendiente";
    if (key === "ACCEPTED") return "Aceptada";
    if (key === "REJECTED") return "Rechazada";
    if (key === "APPROVED") return "Aprobada";
    return status || "-";
}

function registrationStatusColor(status: string) {
    const key = (status ?? "").trim().toUpperCase();
    if (key === "ACCEPTED" || key === "APPROVED") return theme.colors.success;
    if (key === "REJECTED") return theme.colors.error;
    return theme.colors.warning;
}

function RecentRegistrationsSection({
    registrations,
}: Readonly<{
    registrations: RegistrationItem[];
}>) {
    const recent = [...registrations]
        .sort((a, b) => {
            const ta = new Date(a.createdAt).getTime();
            const tb = new Date(b.createdAt).getTime();
            return tb - ta;
        })
        .slice(0, 4);

    return (
        <View style={styles.sectionCard}>
            <SectionTitle icon="clipboard-outline" title="Mis Inscripciones Recientes" />
            {recent.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="clipboard-outline" size={28} color={theme.colors.textTertiary} />
                    <Text style={styles.emptyText}>Aún no tienes inscripciones recientes.</Text>
                </View>
            ) : (
                recent.map((item) => (
                    <View key={item.id} style={styles.recentItem}>
                        <View style={[styles.recentStatusBar, { backgroundColor: registrationStatusColor(item.status) }]} />
                        <View style={styles.recentContent}>
                            <Text style={styles.recentTitle} numberOfLines={2}>
                                {item.event?.title ?? "Evento"}
                            </Text>
                            <View style={styles.recentMeta}>
                                <View style={[styles.statusPill, { backgroundColor: `${registrationStatusColor(item.status)}1a` }]}>
                                    <Text style={[styles.statusPillText, { color: registrationStatusColor(item.status) }]}>
                                        {registrationStatusLabel(item.status)}
                                    </Text>
                                </View>
                                <Text style={styles.recentDate}>{formatDate(item.createdAt) || "Sin fecha"}</Text>
                            </View>
                        </View>
                    </View>
                ))
            )}
        </View>
    );
}

function SectionTitle({ title, icon }: Readonly<{ title: string; icon?: keyof typeof Ionicons.glyphMap }>) {
    return (
        <View style={styles.sectionTitleRow}>
            {icon ? <Ionicons name={icon} size={16} color={theme.colors.primary} /> : null}
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
    );
}

function PhotoSection({
    pickedImage,
    isSaving,
    onPickImage,
    onUploadImage,
}: Readonly<{
    pickedImage: PickedFile | null;
    isSaving: boolean;
    onPickImage: () => Promise<void>;
    onUploadImage: () => Promise<void>;
}>) {
    return (
        <View style={styles.subSection}>
            <SectionTitle icon="camera-outline" title="Foto de perfil" />
            <Pressable style={styles.secondaryBtn} onPress={onPickImage} disabled={isSaving}>
                <Ionicons name="image-outline" size={18} color={theme.colors.primary} />
                <Text style={styles.secondaryBtnText} numberOfLines={1}>
                    {pickedImage ? pickedImage.name : "Seleccionar imagen"}
                </Text>
            </Pressable>
            <Pressable
                style={[styles.primaryBtn, (!pickedImage || isSaving) && styles.btnDisabled]}
                onPress={onUploadImage}
                disabled={!pickedImage || isSaving}
            >
                <Text style={styles.primaryBtnText}>{isSaving ? "Guardando…" : "Actualizar foto"}</Text>
            </Pressable>
        </View>
    );
}

function DocumentsSection({
    isUtaEmail,
    docs,
    isSaving,
    canUploadDocs,
    profileDocumentUrl,
    onPickDoc,
    onUploadDocs,
}: Readonly<{
    isUtaEmail: boolean;
    docs: { cedula: PickedFile | null; papeleta: PickedFile | null; matricula: PickedFile | null };
    isSaving: boolean;
    canUploadDocs: boolean;
    profileDocumentUrl: string | null;
    onPickDoc: (key: "cedula" | "papeleta" | "matricula") => Promise<void>;
    onUploadDocs: () => Promise<void>;
}>) {
    return (
        <View style={styles.subSection}>
            <SectionTitle icon="document-text-outline" title="Documentos" />

            <Pressable style={styles.secondaryBtn} onPress={() => onPickDoc("cedula")} disabled={isSaving}>
                <Ionicons name="document-outline" size={18} color={theme.colors.primary} />
                <Text style={styles.secondaryBtnText} numberOfLines={1}>
                    {docs.cedula ? `Cédula: ${docs.cedula.name}` : "Seleccionar cédula"}
                </Text>
            </Pressable>

            <Pressable style={styles.secondaryBtn} onPress={() => onPickDoc("papeleta")} disabled={isSaving}>
                <Ionicons name="document-outline" size={18} color={theme.colors.primary} />
                <Text style={styles.secondaryBtnText} numberOfLines={1}>
                    {docs.papeleta ? `Papeleta: ${docs.papeleta.name}` : "Seleccionar papeleta"}
                </Text>
            </Pressable>

            {isUtaEmail ? (
                <Pressable
                    style={styles.secondaryBtn}
                    onPress={() => onPickDoc("matricula")}
                    disabled={isSaving}
                >
                    <Ionicons name="document-outline" size={18} color={theme.colors.primary} />
                    <Text style={styles.secondaryBtnText} numberOfLines={1}>
                        {docs.matricula ? `Matrícula: ${docs.matricula.name}` : "Seleccionar matrícula"}
                    </Text>
                </Pressable>
            ) : null}

            {profileDocumentUrl ? (
                <Pressable
                    style={styles.linkBtn}
                    onPress={() =>
                        Linking.openURL(toAbsoluteUrl(profileDocumentUrl)).catch(() => {
                            Alert.alert(
                                "No se pudo abrir el documento",
                                "Intenta de nuevo o abre el documento desde un navegador."
                            );
                        })
                    }
                >
                    <Ionicons name="open-outline" size={18} color={theme.colors.primary} />
                    <Text style={styles.linkText} numberOfLines={1}>
                        Ver documento actual ({fileLabel(profileDocumentUrl)})
                    </Text>
                </Pressable>
            ) : null}

            <Pressable
                style={[styles.primaryBtn, (!canUploadDocs || isSaving) && styles.btnDisabled]}
                onPress={onUploadDocs}
                disabled={!canUploadDocs || isSaving}
            >
                <Text style={styles.primaryBtnText}>{isSaving ? "Subiendo…" : "Subir documentos"}</Text>
            </Pressable>

            <View style={styles.hintBox}>
                <Ionicons name="information-circle-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={styles.hintText}>
                    {isUtaEmail
                        ? "Requerido: cédula, papeleta y matrícula."
                        : "Requerido: cédula y papeleta."}
                </Text>
            </View>
        </View>
    );
}

function useProfileUploadActions(isUtaEmail: boolean) {
    const updateUser = useAuthStore((s) => s.updateUser);
    const [pickedImage, setPickedImage] = useState<PickedFile | null>(null);
    const [docs, setDocs] = useState<{ cedula: PickedFile | null; papeleta: PickedFile | null; matricula: PickedFile | null }>({
        cedula: null,
        papeleta: null,
        matricula: null,
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const canUploadDocs = useMemo(() => {
        const anyDoc = Boolean(docs.cedula || docs.papeleta || docs.matricula);
        if (!anyDoc) return false;
        if (!isUtaEmail) return Boolean(docs.cedula || docs.papeleta);
        return true;
    }, [docs, isUtaEmail]);

    const onPickImage = async () => {
        setSaveError(null);
        const file = await pickFile({ type: ["image/*"] });
        setPickedImage(file);
    };

    const onUploadImage = async () => {
        if (!pickedImage) return;
        setSaveError(null);
        setIsSaving(true);
        try {
            const result = await uploadProfileImage(pickedImage);
            await updateUser({ profileImageUrl: result.imageUrl });
            setPickedImage(null);
            await queryClient.invalidateQueries({ queryKey: ["profile"] });
        } catch (e) {
            setSaveError(e instanceof Error ? e.message : "No se pudo actualizar la foto");
        } finally {
            setIsSaving(false);
        }
    };

    const onPickDoc = async (key: "cedula" | "papeleta" | "matricula") => {
        setSaveError(null);
        const file = await pickFile({ type: ["application/pdf", "image/*"] });
        if (!file) return;
        setDocs((prev) => ({ ...prev, [key]: file }));
    };

    const onUploadDocs = async () => {
        if (!canUploadDocs) return;
        setSaveError(null);
        setIsSaving(true);
        try {
            await uploadDocuments({
                cedula: docs.cedula ?? undefined,
                papeleta: docs.papeleta ?? undefined,
                matricula: isUtaEmail ? docs.matricula ?? undefined : undefined,
            });
            setDocs({ cedula: null, papeleta: null, matricula: null });
            await queryClient.invalidateQueries({ queryKey: ["profile"] });
        } catch (e) {
            setSaveError(e instanceof Error ? e.message : "No se pudieron subir los documentos");
        } finally {
            setIsSaving(false);
        }
    };

    return {
        pickedImage,
        docs,
        isSaving,
        saveError,
        canUploadDocs,
        onPickImage,
        onUploadImage,
        onPickDoc,
        onUploadDocs,
    };
}

export default function ProfileScreen() {
    const user = useAuthStore((s) => s.user);
    const isUtaEmail = Boolean(user?.email?.toLowerCase().endsWith("@uta.edu.ec"));
    const uploads = useProfileUploadActions(isUtaEmail);

    const profileQuery = useQuery({
        queryKey: ["profile"],
        queryFn: fetchMyProfile,
        staleTime: 30000,
        enabled: Boolean(user),
    });

    const registrationsQuery = useQuery({
        queryKey: ["my-registrations"],
        queryFn: fetchMyRegistrations,
        staleTime: 30000,
        enabled: Boolean(user),
    });

    const profile = profileQuery.data;

    let body: ReactNode;
    if (profileQuery.isLoading) {
        body = (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Cargando perfil...</Text>
            </View>
        );
    } else if (profileQuery.isError) {
        body = (
            <View style={styles.center}>
                <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
                <Text style={styles.errorText}>No se pudo cargar tu perfil.</Text>
            </View>
        );
    } else if (profile == null) {
        body = (
            <View style={styles.center}>
                <Text style={styles.errorText}>Perfil no disponible.</Text>
            </View>
        );
    } else {
        const fullName = `${profile.firstName} ${profile.lastName}`.trim();
        body = (
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <ProfileHeader
                    profileImageUrl={profile.profileImageUrl}
                    fullName={fullName}
                    role={profile.role}
                />

                <View style={styles.sectionCard}>
                    <SectionTitle icon="person-outline" title="Información Personal" />
                    <FieldRow label="Correo electrónico" value={profile.email} icon="mail-outline" />
                    <FieldRow label="Cédula de identidad" value={profile.idNumber} icon="card-outline" />
                    <FieldRow label="Teléfono" value={profile.phone} icon="call-outline" />
                    <FieldRow
                        label="Fecha de registro"
                        value={formatDate(profile.createdAt) || "No disponible"}
                        icon="calendar-outline"
                    />
                    <FieldRow
                        label="Carrera"
                        value={profile.career?.name ?? "No aplica"}
                        icon="school-outline"
                    />
                </View>

                <View style={styles.sectionCard}>
                    <PhotoSection
                        pickedImage={uploads.pickedImage}
                        isSaving={uploads.isSaving}
                        onPickImage={uploads.onPickImage}
                        onUploadImage={uploads.onUploadImage}
                    />
                    <View style={styles.subDivider} />
                    <DocumentsSection
                        isUtaEmail={isUtaEmail}
                        docs={uploads.docs}
                        isSaving={uploads.isSaving}
                        canUploadDocs={uploads.canUploadDocs}
                        profileDocumentUrl={profile.documentUrl}
                        onPickDoc={uploads.onPickDoc}
                        onUploadDocs={uploads.onUploadDocs}
                    />

                    {uploads.saveError ? (
                        <View style={styles.errorBox}>
                            <Ionicons name="warning-outline" size={16} color={theme.colors.error} />
                            <Text style={styles.errorBoxText}>{uploads.saveError}</Text>
                        </View>
                    ) : null}
                </View>

                <RecentRegistrationsSection registrations={registrationsQuery.data ?? []} />
            </ScrollView>
        );
    }

    return (
        <View style={styles.container}>
            <AppHeader title="Mi Perfil" showBack />
            {body}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bgSecondary },
    content: { paddingBottom: theme.spacing.xl },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: theme.spacing.lg,
        gap: 12,
    },
    loadingText: { color: theme.colors.textSecondary, fontWeight: "700" },
    errorText: { color: theme.colors.error, fontWeight: "700", textAlign: "center" },

    // Hero profile header
    profileHero: {
        alignItems: "center",
        paddingTop: theme.spacing.xl,
        paddingBottom: theme.spacing.lg,
        paddingHorizontal: theme.spacing.lg,
    },
    avatarContainer: {
        width: 88,
        height: 88,
        borderRadius: 44,
        borderWidth: 3,
        borderColor: theme.colors.overlayWhite50,
        overflow: "hidden",
        marginBottom: 12,
        ...theme.shadow.md,
    },
    avatar: { width: "100%", height: "100%", backgroundColor: theme.colors.bgTertiary },
    avatarFallback: {
        width: "100%",
        height: "100%",
        backgroundColor: theme.colors.bgSecondary,
        alignItems: "center",
        justifyContent: "center",
    },
    heroName: {
        fontSize: 20,
        fontWeight: "800",
        color: theme.colors.textInverse,
        textAlign: "center",
        letterSpacing: 0.2,
    },
    roleBadge: {
        marginTop: 8,
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.overlayWhite20,
        borderWidth: 1,
        borderColor: theme.colors.overlayWhite30,
    },
    roleText: {
        color: theme.colors.textInverse,
        fontSize: 12,
        fontWeight: "700",
    },

    // Cards
    sectionCard: {
        margin: theme.spacing.md,
        marginTop: theme.spacing.md,
        backgroundColor: theme.colors.bgPrimary,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        ...theme.shadow.sm,
    },
    sectionTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: theme.spacing.sm,
        paddingBottom: theme.spacing.xs,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    sectionTitle: { fontSize: 15, fontWeight: "800", color: theme.colors.textPrimary },

    // Field rows
    fieldRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        paddingVertical: 9,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    fieldIconWrap: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: theme.colors.primaryLight,
        alignItems: "center",
        justifyContent: "center",
    },
    fieldLabel: { color: theme.colors.textTertiary, fontWeight: "700", fontSize: 11, marginBottom: 2 },
    fieldValue: { color: theme.colors.textPrimary, fontWeight: "700", fontSize: 14 },

    subSection: { gap: 10 },
    subDivider: { height: 1, backgroundColor: theme.colors.borderLight, marginVertical: theme.spacing.md },

    primaryBtn: {
        height: 48,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.md,
        alignItems: "center",
        justifyContent: "center",
    },
    primaryBtnText: { color: theme.colors.textInverse, fontWeight: "800", fontSize: 14 },
    secondaryBtn: {
        height: 48,
        backgroundColor: theme.colors.bgSecondary,
        borderRadius: theme.radius.md,
        borderWidth: 1.5,
        borderColor: theme.colors.borderPrimary,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 14,
    },
    secondaryBtnText: { flex: 1, color: theme.colors.primary, fontWeight: "700", fontSize: 13 },
    linkBtn: {
        height: 46,
        borderRadius: theme.radius.md,
        borderWidth: 1.5,
        borderColor: theme.colors.primaryLight,
        backgroundColor: theme.colors.primaryLighter,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 14,
    },
    linkText: { flex: 1, color: theme.colors.primary, fontWeight: "700", fontSize: 13 },
    btnDisabled: { opacity: 0.5 },
    hintBox: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 6,
        backgroundColor: theme.colors.bgSecondary,
        borderRadius: theme.radius.sm,
        padding: 10,
    },
    hintText: { flex: 1, color: theme.colors.textSecondary, fontWeight: "600", lineHeight: 18, fontSize: 12 },
    errorBox: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
        backgroundColor: theme.colors.errorLight,
        borderRadius: theme.radius.sm,
        padding: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.error20,
    },
    errorBoxText: { flex: 1, color: theme.colors.error, fontWeight: "600", lineHeight: 18, fontSize: 12 },

    // Recent registrations
    emptyState: { alignItems: "center", gap: 8, paddingVertical: theme.spacing.md },
    emptyText: { color: theme.colors.textTertiary, fontWeight: "600", textAlign: "center", fontSize: 13 },
    recentItem: {
        flexDirection: "row",
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.bgSecondary,
        overflow: "hidden",
        marginBottom: 8,
    },
    recentStatusBar: { width: 4, borderRadius: 2 },
    recentContent: { flex: 1, padding: 12 },
    recentTitle: { color: theme.colors.textPrimary, fontWeight: "800", fontSize: 14 },
    recentMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 6,
    },
    statusPill: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: theme.radius.full,
    },
    statusPillText: { fontSize: 11, fontWeight: "800" },
    recentDate: { color: theme.colors.textTertiary, fontSize: 11, fontWeight: "600" },
});
