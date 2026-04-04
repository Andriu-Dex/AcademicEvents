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
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "../../src/components/AppHeader";
import { toAbsoluteUrl } from "../../src/api/client";
import { fetchMyProfile, uploadDocuments, uploadProfileImage } from "../../src/api/profile";
import { queryClient } from "../../src/shared/queryClient";
import { useAuthStore } from "../../src/store/authStore";
import { theme } from "../../src/shared/theme";

type PickedFile = { uri: string; name: string; mimeType: string };

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
            <Ionicons name={icon} size={18} color={theme.colors.primary} />
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
        <View style={styles.avatarRow}>
            {profileImageUrl ? (
                <Image source={{ uri: toAbsoluteUrl(profileImageUrl) }} style={styles.avatar} />
            ) : (
                <View style={styles.avatarFallback} />
            )}
            <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={2}>
                    {fullName}
                </Text>
                <Text style={styles.role} numberOfLines={1}>
                    {role}
                </Text>
            </View>
        </View>
    );
}

function SectionTitle({ title }: Readonly<{ title: string }>) {
    return <Text style={styles.sectionTitle}>{title}</Text>;
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
        <View style={styles.section}>
            <SectionTitle title="Foto de perfil" />
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
        <View style={styles.section}>
            <SectionTitle title="Documentos" />

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

            <Text style={styles.hint}>
                {isUtaEmail
                    ? "Requerido: cédula, papeleta y matrícula."
                    : "Requerido: cédula y papeleta."}
            </Text>
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

    const profile = profileQuery.data;

    let body: ReactNode;
    if (profileQuery.isLoading) {
        body = (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    } else if (profileQuery.isError) {
        body = (
            <View style={styles.center}>
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
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <ProfileHeader
                        profileImageUrl={profile.profileImageUrl}
                        fullName={fullName}
                        role={profile.role}
                    />

                    <View style={styles.section}>
                        <SectionTitle title="Datos" />
                        <FieldRow label="Correo" value={profile.email} icon="mail-outline" />
                        <FieldRow label="Cédula" value={profile.idNumber} icon="card-outline" />
                        <FieldRow label="Teléfono" value={profile.phone} icon="call-outline" />
                        <FieldRow
                            label="Carrera"
                            value={profile.career?.name ?? "No aplica"}
                            icon="school-outline"
                        />
                    </View>

                    <PhotoSection
                        pickedImage={uploads.pickedImage}
                        isSaving={uploads.isSaving}
                        onPickImage={uploads.onPickImage}
                        onUploadImage={uploads.onUploadImage}
                    />

                    <DocumentsSection
                        isUtaEmail={isUtaEmail}
                        docs={uploads.docs}
                        isSaving={uploads.isSaving}
                        canUploadDocs={uploads.canUploadDocs}
                        profileDocumentUrl={profile.documentUrl}
                        onPickDoc={uploads.onPickDoc}
                        onUploadDocs={uploads.onUploadDocs}
                    />

                    {uploads.saveError ? <Text style={styles.errorInline}>{uploads.saveError}</Text> : null}
                </View>
            </ScrollView>
        );
    }

    return (
        <View style={styles.container}>
            <AppHeader title="Perfil" showBack />
            {body}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bgSecondary },
    content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xl },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: theme.spacing.lg },
    errorText: { color: theme.colors.error, fontWeight: "900" },
    card: {
        backgroundColor: theme.colors.bgPrimary,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        padding: theme.spacing.lg,
        ...theme.shadow.sm,
    },
    avatarRow: { flexDirection: "row", alignItems: "center", gap: 14 },
    avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: theme.colors.bgTertiary },
    avatarFallback: { width: 72, height: 72, borderRadius: 36, backgroundColor: theme.colors.bgTertiary },
    name: { fontSize: 18, fontWeight: "900", color: theme.colors.textPrimary },
    role: { marginTop: 4, color: theme.colors.textSecondary, fontWeight: "800" },
    section: { marginTop: theme.spacing.lg, gap: 10 },
    sectionTitle: { fontSize: 16, fontWeight: "900", color: theme.colors.textPrimary },
    fieldRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
    fieldLabel: { color: theme.colors.textTertiary, fontWeight: "800", fontSize: 12 },
    fieldValue: { color: theme.colors.textPrimary, fontWeight: "800" },
    primaryBtn: {
        height: 46,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.md,
        alignItems: "center",
        justifyContent: "center",
    },
    primaryBtnText: { color: theme.colors.textInverse, fontWeight: "900" },
    secondaryBtn: {
        height: 46,
        backgroundColor: theme.colors.bgPrimary,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        paddingHorizontal: 12,
    },
    secondaryBtnText: { flex: 1, color: theme.colors.primary, fontWeight: "900" },
    linkBtn: {
        height: 46,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        backgroundColor: theme.colors.bgPrimary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        paddingHorizontal: 12,
    },
    linkText: { flex: 1, color: theme.colors.primary, fontWeight: "900" },
    btnDisabled: { opacity: 0.6 },
    hint: { color: theme.colors.textSecondary, fontWeight: "700", lineHeight: 18 },
    errorInline: { marginTop: theme.spacing.md, color: theme.colors.error, fontWeight: "900" },
});
