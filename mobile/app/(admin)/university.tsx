import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
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
import { AppHeader } from "../../src/components/AppHeader";
import { toAbsoluteUrl } from "../../src/api/client";
import {
    createUniversitySocialLink,
    deleteUniversitySocialLink,
    fetchMainUniversity,
    fetchUniversitySocialLinks,
    updateUniversity,
    updateUniversitySocialLink,
    type University,
    type UniversitySocialLink,
} from "../../src/api/university";
import {
    fetchFacultyBasicInfo,
    fetchMvaInfo,
    updateFacultyBasicInfo,
    updateMva,
    uploadMvaImage,
    type MvaAuthority,
} from "../../src/api/mva";
import { theme } from "../../src/shared/theme";

type EditableSocialLink = UniversitySocialLink & {
    localId: string;
    isNew?: boolean;
    platformKey: string;
    iconKey: string;
    isActive: boolean;
    opensInNewTab: boolean;
};

const MAX_AUTHORITIES = 5;

const SOCIAL_PLATFORM_OPTIONS = [
    { value: "website", label: "Pagina web oficial", defaultIconKey: "globe" },
    { value: "facebook", label: "Facebook", defaultIconKey: "facebook" },
    { value: "instagram", label: "Instagram", defaultIconKey: "instagram" },
    { value: "youtube", label: "YouTube", defaultIconKey: "youtube" },
    { value: "telegram", label: "Telegram", defaultIconKey: "send" },
    { value: "linkedin", label: "LinkedIn", defaultIconKey: "linkedin" },
    { value: "tiktok", label: "TikTok", defaultIconKey: "music2" },
    { value: "x", label: "X", defaultIconKey: "twitter" },
    { value: "custom", label: "Personalizado", defaultIconKey: "link" },
];

const SOCIAL_ICON_OPTIONS = [
    { value: "globe", label: "Globo" },
    { value: "facebook", label: "Facebook" },
    { value: "instagram", label: "Instagram" },
    { value: "youtube", label: "YouTube" },
    { value: "send", label: "Telegram" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "music2", label: "TikTok" },
    { value: "twitter", label: "X" },
    { value: "link", label: "Enlace" },
];

const HOME_STATS_OPTIONS = [
    { id: "careers", label: "Carreras" },
    { id: "activeEvents", label: "Eventos activos" },
    { id: "registeredUsers", label: "Usuarios registrados" },
    { id: "participationRate", label: "Participacion" },
];

function buildSocialLink(link: UniversitySocialLink, index: number): EditableSocialLink {
    const platformKey = link.platformKey ?? "custom";
    const defaultIcon = SOCIAL_PLATFORM_OPTIONS.find((opt) => opt.value === platformKey)?.defaultIconKey ?? "link";

    return {
        ...link,
        localId: link.id || `link-${index}`,
        platformKey,
        iconKey: link.iconKey ?? defaultIcon,
        isActive: link.isActive ?? true,
        opensInNewTab: link.opensInNewTab ?? true,
    };
}

function formatApiError(error: unknown, fallback: string) {
    if (!error || typeof error !== "object") return fallback;
    const response = (error as { response?: { data?: Record<string, unknown> } }).response;
    const data = response?.data;
    if (!data) return fallback;
    const message = (data.msg ?? data.message ?? data.error ?? data.mensaje) as unknown;
    if (typeof message === "string" && message.trim()) return message;
    return fallback;
}

export default function AdminUniversityScreen() {
    const queryClient = useQueryClient();

    const universityQuery = useQuery({
        queryKey: ["admin-university"],
        queryFn: fetchMainUniversity,
        staleTime: 60000,
    });

    const facultyQuery = useQuery({
        queryKey: ["admin-faculty"],
        queryFn: fetchFacultyBasicInfo,
        staleTime: 60000,
    });

    const mvaQuery = useQuery({
        queryKey: ["admin-mva"],
        queryFn: fetchMvaInfo,
        staleTime: 60000,
    });

    const socialLinksQuery = useQuery({
        queryKey: ["admin-university-social"],
        queryFn: async () => {
            if (!universityQuery.data?.id) return [] as UniversitySocialLink[];
            return fetchUniversitySocialLinks(universityQuery.data.id);
        },
        enabled: Boolean(universityQuery.data?.id),
        placeholderData: keepPreviousData,
        staleTime: 60000,
    });

    const [universityForm, setUniversityForm] = useState<University | null>(null);
    const [facultyForm, setFacultyForm] = useState({ nombre: "", acronimo: "", logo: "" });
    const [mision, setMision] = useState("");
    const [vision, setVision] = useState("");
    const [autoridades, setAutoridades] = useState<MvaAuthority[]>([]);
    const [socialLinks, setSocialLinks] = useState<EditableSocialLink[]>([]);
    const [statsSelection, setStatsSelection] = useState<string[]>(
        HOME_STATS_OPTIONS.map((stat) => stat.id)
    );

    const [universityError, setUniversityError] = useState<string | null>(null);
    const [facultyError, setFacultyError] = useState<string | null>(null);
    const [mvaError, setMvaError] = useState<string | null>(null);
    const [socialError, setSocialError] = useState<string | null>(null);

    useEffect(() => {
        if (universityQuery.data) {
            setUniversityForm(universityQuery.data);
        }
    }, [universityQuery.data]);

    useEffect(() => {
        if (facultyQuery.data) {
            setFacultyForm({
                nombre: facultyQuery.data.nombre,
                acronimo: facultyQuery.data.acronimo,
                logo: facultyQuery.data.logo,
            });
        }
    }, [facultyQuery.data]);

    useEffect(() => {
        if (mvaQuery.data) {
            setMision(mvaQuery.data.mision);
            setVision(mvaQuery.data.vision);
            setAutoridades(mvaQuery.data.autoridades ?? []);
        }
    }, [mvaQuery.data]);

    useEffect(() => {
        const raw = socialLinksQuery.data ?? [];
        setSocialLinks(raw.map(buildSocialLink));
    }, [socialLinksQuery.data]);

    const universityMutation = useMutation({
        mutationFn: async () => {
            if (!universityForm) throw new Error("missing");
            setUniversityError(null);
            if (!universityForm.name.trim()) {
                throw new Error("validation:El nombre de la universidad es obligatorio");
            }
            if (!universityForm.address.trim()) {
                throw new Error("validation:La direccion es obligatoria");
            }

            return updateUniversity(universityForm.id, {
                name: universityForm.name.trim(),
                acronym: universityForm.acronym.trim(),
                address: universityForm.address.trim(),
                phone: universityForm.phone.trim(),
                email: universityForm.email.trim(),
                logoUrl: universityForm.logoUrl,
            });
        },
        onSuccess: async (data) => {
            setUniversityForm(data);
            await queryClient.invalidateQueries({ queryKey: ["admin-university"] });
        },
        onError: (error) => {
            if (error instanceof Error && error.message.startsWith("validation:")) {
                setUniversityError(error.message.replace("validation:", ""));
                return;
            }
            setUniversityError(formatApiError(error, "No se pudo guardar la universidad."));
        },
    });

    const facultyMutation = useMutation({
        mutationFn: async () => {
            setFacultyError(null);
            if (!facultyForm.nombre.trim()) {
                throw new Error("validation:El nombre de la facultad es obligatorio");
            }
            return updateFacultyBasicInfo({
                nombre: facultyForm.nombre.trim(),
                acronimo: facultyForm.acronimo.trim(),
                logo: facultyForm.logo,
            });
        },
        onSuccess: async (data) => {
            setFacultyForm({
                nombre: data.nombre,
                acronimo: data.acronimo,
                logo: data.logo,
            });
            await queryClient.invalidateQueries({ queryKey: ["admin-faculty"] });
        },
        onError: (error) => {
            if (error instanceof Error && error.message.startsWith("validation:")) {
                setFacultyError(error.message.replace("validation:", ""));
                return;
            }
            setFacultyError(formatApiError(error, "No se pudo guardar la facultad."));
        },
    });

    const mvaMutation = useMutation({
        mutationFn: async () => {
            setMvaError(null);
            if (!mision.trim()) throw new Error("validation:La mision es obligatoria");
            if (!vision.trim()) throw new Error("validation:La vision es obligatoria");

            const trimmedAuthorities = autoridades
                .map((a) => ({
                    nombre: a.nombre.trim(),
                    cargo: a.cargo.trim(),
                    email: (a.email ?? "").trim(),
                    imagen: (a.imagen ?? "").trim(),
                }))
                .filter((a) => a.nombre || a.cargo);

            if (trimmedAuthorities.length > MAX_AUTHORITIES) {
                throw new Error("validation:Solo se permiten hasta 5 autoridades");
            }

            return updateMva({
                mision: mision.trim(),
                vision: vision.trim(),
                autoridades: trimmedAuthorities,
            });
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["admin-mva"] });
        },
        onError: (error) => {
            if (error instanceof Error && error.message.startsWith("validation:")) {
                setMvaError(error.message.replace("validation:", ""));
                return;
            }
            setMvaError(formatApiError(error, "No se pudo guardar MVA."));
        },
    });

    const socialMutation = useMutation({
        mutationFn: async (link: EditableSocialLink) => {
            setSocialError(null);
            if (!universityForm?.id) throw new Error("missing");
            if (!link.label.trim()) throw new Error("validation:La etiqueta es obligatoria");
            if (!link.url.trim()) throw new Error("validation:La URL es obligatoria");

            if (link.isNew || !link.id) {
                return createUniversitySocialLink(universityForm.id, {
                    label: link.label.trim(),
                    url: link.url.trim(),
                    iconKey: link.iconKey,
                    platformKey: link.platformKey,
                    displayOrder: link.order,
                    isActive: link.isActive,
                    opensInNewTab: link.opensInNewTab,
                });
            }

            return updateUniversitySocialLink(universityForm.id, link.id, {
                label: link.label.trim(),
                url: link.url.trim(),
                iconKey: link.iconKey,
                platformKey: link.platformKey,
                order: link.order,
                isActive: link.isActive,
                opensInNewTab: link.opensInNewTab,
            });
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["admin-university-social"] });
        },
        onError: (error) => {
            if (error instanceof Error && error.message.startsWith("validation:")) {
                setSocialError(error.message.replace("validation:", ""));
                return;
            }
            setSocialError(formatApiError(error, "No se pudo guardar el enlace."));
        },
    });

    const deleteSocialMutation = useMutation({
        mutationFn: async (linkId: string) => {
            if (!universityForm?.id) throw new Error("missing");
            return deleteUniversitySocialLink(universityForm.id, linkId);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["admin-university-social"] });
        },
        onError: (error) => {
            setSocialError(formatApiError(error, "No se pudo eliminar el enlace."));
        },
    });

    const handlePickImage = async (onUploaded: (url: string) => void) => {
        const result = await DocumentPicker.getDocumentAsync({
            type: ["image/*"],
            copyToCacheDirectory: true,
            multiple: false,
        });

        if (result.canceled) return;
        const asset = result.assets?.[0];
        if (!asset?.uri) return;

        const mimeType = asset.mimeType ?? "image/jpeg";
        const name = asset.name ?? "imagen.jpg";
        try {
            const { imageUrl } = await uploadMvaImage({ uri: asset.uri, name, mimeType });
            onUploaded(imageUrl);
        } catch (error) {
            setUniversityError(formatApiError(error, "No se pudo subir la imagen."));
        }
    };

    const remainingAuthorities = MAX_AUTHORITIES - autoridades.length;
    const statsText = "Configuración de Estadisticas del Home";

    const selectedStats = useMemo(() => new Set(statsSelection), [statsSelection]);

    return (
        <View style={styles.container}>
            <AppHeader title="MVA y universidad" showBack backHref="/(admin)/dashboard" showNotifications />
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.sectionCard}>
                    <View style={styles.sectionTitleRow}>
                        <Ionicons name="business-outline" size={18} color={theme.colors.primary} />
                        <Text style={styles.sectionTitle}>Datos Universidad</Text>
                    </View>
                    {universityQuery.isLoading || !universityForm ? (
                        <View style={styles.centerBlock}>
                            <ActivityIndicator color={theme.colors.primary} />
                            <Text style={styles.mutedText}>Cargando universidad...</Text>
                        </View>
                    ) : (
                        <View style={styles.infoBlock}>
                            <View style={styles.logoRow}>
                                <Image
                                    source={{ uri: toAbsoluteUrl(universityForm.logoUrl || "") }}
                                    style={styles.logo}
                                    resizeMode="cover"
                                />
                                <Pressable
                                    style={styles.secondaryButton}
                                    onPress={() => handlePickImage((url) => setUniversityForm({ ...universityForm, logoUrl: url }))}
                                >
                                    <Text style={styles.secondaryButtonText}>Cambiar imagen</Text>
                                </Pressable>
                            </View>
                            <View style={styles.formField}>
                                <Text style={styles.label}>Nombre</Text>
                                <TextInput
                                    style={styles.input}
                                    value={universityForm.name}
                                    onChangeText={(text) => setUniversityForm({ ...universityForm, name: text })}
                                />
                            </View>
                            <View style={styles.formField}>
                                <Text style={styles.label}>Acronimo</Text>
                                <TextInput
                                    style={styles.input}
                                    value={universityForm.acronym}
                                    onChangeText={(text) => setUniversityForm({ ...universityForm, acronym: text })}
                                />
                            </View>
                            <View style={styles.formField}>
                                <Text style={styles.label}>Direccion</Text>
                                <TextInput
                                    style={styles.input}
                                    value={universityForm.address}
                                    onChangeText={(text) => setUniversityForm({ ...universityForm, address: text })}
                                />
                            </View>
                            <View style={styles.formField}>
                                <Text style={styles.label}>Telefono</Text>
                                <TextInput
                                    style={styles.input}
                                    value={universityForm.phone}
                                    onChangeText={(text) => setUniversityForm({ ...universityForm, phone: text })}
                                    keyboardType="phone-pad"
                                />
                            </View>
                            <View style={styles.formField}>
                                <Text style={styles.label}>Correo</Text>
                                <TextInput
                                    style={styles.input}
                                    value={universityForm.email}
                                    onChangeText={(text) => setUniversityForm({ ...universityForm, email: text })}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                            {universityError ? <Text style={styles.errorText}>{universityError}</Text> : null}
                            <Pressable
                                style={[styles.primaryButton, universityMutation.isPending && styles.buttonDisabled]}
                                onPress={() => universityMutation.mutate()}
                                disabled={universityMutation.isPending}
                            >
                                {universityMutation.isPending ? (
                                    <ActivityIndicator color={theme.colors.textInverse} />
                                ) : (
                                    <Text style={styles.primaryButtonText}>Guardar universidad</Text>
                                )}
                            </Pressable>
                        </View>
                    )}
                </View>

                <View style={styles.sectionCard}>
                    <View style={styles.sectionTitleRow}>
                        <Ionicons name="link-outline" size={18} color={theme.colors.primary} />
                        <Text style={styles.sectionTitle}>Enlaces institucionales</Text>
                    </View>
                    {socialLinksQuery.isLoading ? (
                        <View style={styles.centerBlock}>
                            <ActivityIndicator color={theme.colors.primary} />
                            <Text style={styles.mutedText}>Cargando enlaces...</Text>
                        </View>
                    ) : (
                        <View style={styles.infoBlock}>
                            {socialLinks.map((link, index) => (
                                <View key={link.localId} style={styles.linkCard}>
                                    <View style={styles.formField}>
                                        <Text style={styles.label}>Plataforma</Text>
                                        <View style={styles.optionRow}>
                                            {SOCIAL_PLATFORM_OPTIONS.map((option) => (
                                                <Pressable
                                                    key={option.value}
                                                    style={[
                                                        styles.optionChip,
                                                        link.platformKey === option.value && styles.optionChipActive,
                                                    ]}
                                                    onPress={() => {
                                                        const next = [...socialLinks];
                                                        next[index] = {
                                                            ...next[index],
                                                            platformKey: option.value,
                                                            iconKey: option.defaultIconKey,
                                                        };
                                                        setSocialLinks(next);
                                                    }}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.optionChipText,
                                                            link.platformKey === option.value && styles.optionChipTextActive,
                                                        ]}
                                                    >
                                                        {option.label}
                                                    </Text>
                                                </Pressable>
                                            ))}
                                        </View>
                                    </View>
                                    <View style={styles.formField}>
                                        <Text style={styles.label}>Icono</Text>
                                        <View style={styles.optionRow}>
                                            {SOCIAL_ICON_OPTIONS.map((option) => (
                                                <Pressable
                                                    key={option.value}
                                                    style={[
                                                        styles.optionChip,
                                                        link.iconKey === option.value && styles.optionChipActive,
                                                    ]}
                                                    onPress={() => {
                                                        const next = [...socialLinks];
                                                        next[index] = { ...next[index], iconKey: option.value };
                                                        setSocialLinks(next);
                                                    }}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.optionChipText,
                                                            link.iconKey === option.value && styles.optionChipTextActive,
                                                        ]}
                                                    >
                                                        {option.label}
                                                    </Text>
                                                </Pressable>
                                            ))}
                                        </View>
                                    </View>
                                    <View style={styles.formField}>
                                        <Text style={styles.label}>Etiqueta</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={link.label}
                                            onChangeText={(text) => {
                                                const next = [...socialLinks];
                                                next[index] = { ...next[index], label: text };
                                                setSocialLinks(next);
                                            }}
                                        />
                                    </View>
                                    <View style={styles.formField}>
                                        <Text style={styles.label}>URL</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={link.url}
                                            onChangeText={(text) => {
                                                const next = [...socialLinks];
                                                next[index] = { ...next[index], url: text };
                                                setSocialLinks(next);
                                            }}
                                            autoCapitalize="none"
                                        />
                                    </View>
                                    <View style={styles.linkActions}>
                                        <Pressable
                                            style={styles.secondaryButton}
                                            onPress={() => socialMutation.mutate({ ...link, order: index })}
                                        >
                                            <Text style={styles.secondaryButtonText}>Guardar enlace</Text>
                                        </Pressable>
                                        {!link.isNew && link.id ? (
                                            <Pressable
                                                style={styles.dangerButton}
                                                onPress={() => deleteSocialMutation.mutate(link.id)}
                                            >
                                                <Text style={styles.dangerButtonText}>Eliminar</Text>
                                            </Pressable>
                                        ) : null}
                                    </View>
                                </View>
                            ))}
                            <Pressable
                                style={styles.secondaryButton}
                                onPress={() => {
                                    const next = [...socialLinks];
                                    next.push({
                                        id: "",
                                        label: "",
                                        url: "",
                                        order: next.length,
                                        localId: `new-${Date.now()}`,
                                        isNew: true,
                                        platformKey: "custom",
                                        iconKey: "link",
                                        isActive: true,
                                        opensInNewTab: true,
                                    });
                                    setSocialLinks(next);
                                }}
                            >
                                <Text style={styles.secondaryButtonText}>Agregar enlace</Text>
                            </Pressable>
                            {socialError ? <Text style={styles.errorText}>{socialError}</Text> : null}
                        </View>
                    )}
                </View>

                <View style={styles.sectionCard}>
                    <View style={styles.sectionTitleRow}>
                        <Ionicons name="school-outline" size={18} color={theme.colors.primary} />
                        <Text style={styles.sectionTitle}>Datos de la Facultad</Text>
                    </View>
                    {facultyQuery.isLoading ? (
                        <View style={styles.centerBlock}>
                            <ActivityIndicator color={theme.colors.primary} />
                            <Text style={styles.mutedText}>Cargando facultad...</Text>
                        </View>
                    ) : (
                        <View style={styles.infoBlock}>
                            <View style={styles.logoRow}>
                                <Image
                                    source={{ uri: toAbsoluteUrl(facultyForm.logo || "") }}
                                    style={styles.logo}
                                    resizeMode="cover"
                                />
                                <Pressable
                                    style={styles.secondaryButton}
                                    onPress={() => handlePickImage((url) => setFacultyForm({ ...facultyForm, logo: url }))}
                                >
                                    <Text style={styles.secondaryButtonText}>Cambiar logo</Text>
                                </Pressable>
                            </View>
                            <View style={styles.formField}>
                                <Text style={styles.label}>Nombre</Text>
                                <TextInput
                                    style={styles.input}
                                    value={facultyForm.nombre}
                                    onChangeText={(text) => setFacultyForm({ ...facultyForm, nombre: text })}
                                />
                            </View>
                            <View style={styles.formField}>
                                <Text style={styles.label}>Acronimo</Text>
                                <TextInput
                                    style={styles.input}
                                    value={facultyForm.acronimo}
                                    onChangeText={(text) => setFacultyForm({ ...facultyForm, acronimo: text })}
                                />
                            </View>
                            {facultyError ? <Text style={styles.errorText}>{facultyError}</Text> : null}
                            <Pressable
                                style={[styles.primaryButton, facultyMutation.isPending && styles.buttonDisabled]}
                                onPress={() => facultyMutation.mutate()}
                                disabled={facultyMutation.isPending}
                            >
                                {facultyMutation.isPending ? (
                                    <ActivityIndicator color={theme.colors.textInverse} />
                                ) : (
                                    <Text style={styles.primaryButtonText}>Guardar facultad</Text>
                                )}
                            </Pressable>
                        </View>
                    )}
                </View>

                <View style={styles.sectionCard}>
                    <View style={styles.sectionTitleRow}>
                        <Ionicons name="document-text-outline" size={18} color={theme.colors.primary} />
                        <Text style={styles.sectionTitle}>Mision, Vision y Autoridades</Text>
                    </View>
                    {mvaQuery.isLoading ? (
                        <View style={styles.centerBlock}>
                            <ActivityIndicator color={theme.colors.primary} />
                            <Text style={styles.mutedText}>Cargando MVA...</Text>
                        </View>
                    ) : (
                        <View style={styles.infoBlock}>
                            <View style={styles.formField}>
                                <Text style={styles.label}>Mision</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={mision}
                                    onChangeText={setMision}
                                    multiline
                                />
                            </View>
                            <View style={styles.formField}>
                                <Text style={styles.label}>Vision</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={vision}
                                    onChangeText={setVision}
                                    multiline
                                />
                            </View>
                            <Text style={styles.label}>Autoridades (max 5)</Text>
                            {autoridades.map((authority, index) => (
                                <View key={`${authority.nombre}-${index}`} style={styles.authorityCard}>
                                    <View style={styles.logoRow}>
                                        <Image
                                            source={{ uri: toAbsoluteUrl(authority.imagen || "") }}
                                            style={styles.authorityAvatar}
                                        />
                                        <Pressable
                                            style={styles.secondaryButton}
                                            onPress={() =>
                                                handlePickImage((url) => {
                                                    const next = [...autoridades];
                                                    next[index] = { ...next[index], imagen: url };
                                                    setAutoridades(next);
                                                })
                                            }
                                        >
                                            <Text style={styles.secondaryButtonText}>Cambiar imagen</Text>
                                        </Pressable>
                                        <Pressable
                                            style={styles.dangerButton}
                                            onPress={() => {
                                                const next = autoridades.filter((_, idx) => idx !== index);
                                                setAutoridades(next);
                                            }}
                                        >
                                            <Text style={styles.dangerButtonText}>Eliminar</Text>
                                        </Pressable>
                                    </View>
                                    <View style={styles.formField}>
                                        <Text style={styles.label}>Nombre</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={authority.nombre}
                                            onChangeText={(text) => {
                                                const next = [...autoridades];
                                                next[index] = { ...next[index], nombre: text };
                                                setAutoridades(next);
                                            }}
                                        />
                                    </View>
                                    <View style={styles.formField}>
                                        <Text style={styles.label}>Cargo</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={authority.cargo}
                                            onChangeText={(text) => {
                                                const next = [...autoridades];
                                                next[index] = { ...next[index], cargo: text };
                                                setAutoridades(next);
                                            }}
                                        />
                                    </View>
                                    <View style={styles.formField}>
                                        <Text style={styles.label}>Correo</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={authority.email ?? ""}
                                            onChangeText={(text) => {
                                                const next = [...autoridades];
                                                next[index] = { ...next[index], email: text };
                                                setAutoridades(next);
                                            }}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                    </View>
                                </View>
                            ))}
                            <Pressable
                                style={[styles.secondaryButton, remainingAuthorities <= 0 && styles.buttonDisabled]}
                                onPress={() => {
                                    if (remainingAuthorities <= 0) return;
                                    setAutoridades([
                                        ...autoridades,
                                        { nombre: "", cargo: "", email: "", imagen: "" },
                                    ]);
                                }}
                                disabled={remainingAuthorities <= 0}
                            >
                                <Text style={styles.secondaryButtonText}>
                                    Agregar autoridad ({remainingAuthorities} disponibles)
                                </Text>
                            </Pressable>
                            {mvaError ? <Text style={styles.errorText}>{mvaError}</Text> : null}
                            <Pressable
                                style={[styles.primaryButton, mvaMutation.isPending && styles.buttonDisabled]}
                                onPress={() => mvaMutation.mutate()}
                                disabled={mvaMutation.isPending}
                            >
                                {mvaMutation.isPending ? (
                                    <ActivityIndicator color={theme.colors.textInverse} />
                                ) : (
                                    <Text style={styles.primaryButtonText}>Guardar MVA</Text>
                                )}
                            </Pressable>
                        </View>
                    )}
                </View>

                <View style={styles.sectionCard}>
                    <View style={styles.sectionTitleRow}>
                        <Ionicons name="bar-chart-outline" size={18} color={theme.colors.primary} />
                        <Text style={styles.sectionTitle}>Estadisticas del Home</Text>
                    </View>
                    <Text style={styles.sectionSubtitle}>{statsText}</Text>
                    <Text style={styles.sectionSubtitle}>
                        Selecciona hasta 4 estadisticas para mostrar en la pagina principal.
                    </Text>
                    <View style={styles.optionRow}>
                        {HOME_STATS_OPTIONS.map((stat) => {
                            const active = selectedStats.has(stat.id);
                            return (
                                <Pressable
                                    key={stat.id}
                                    style={[styles.optionChip, active && styles.optionChipActive]}
                                    onPress={() => {
                                        const next = new Set(selectedStats);
                                        if (active) {
                                            next.delete(stat.id);
                                        } else if (next.size < 4) {
                                            next.add(stat.id);
                                        }
                                        setStatsSelection(Array.from(next));
                                    }}
                                >
                                    <Text style={[styles.optionChipText, active && styles.optionChipTextActive]}>
                                        {stat.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                    <Text style={styles.mutedText}>Configuracion guardada localmente en esta sesion.</Text>
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
    sectionTitle: { fontWeight: "800", fontSize: 15, color: theme.colors.textPrimary },
    sectionSubtitle: { color: theme.colors.textSecondary, fontWeight: "600" },

    centerBlock: { alignItems: "center", gap: 6, paddingVertical: 8 },
    mutedText: { color: theme.colors.textTertiary, fontWeight: "600" },
    errorText: { color: theme.colors.error, fontWeight: "700", fontSize: 12 },

    infoBlock: { gap: 10 },
    logoRow: { flexDirection: "row", alignItems: "center", gap: 12, flexWrap: "wrap" },
    logo: { width: 72, height: 72, borderRadius: 14, backgroundColor: theme.colors.bgSecondary },

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
    textArea: { minHeight: 88, textAlignVertical: "top" },

    primaryButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.md,
        paddingVertical: 12,
        alignItems: "center",
    },
    primaryButtonText: { color: theme.colors.textInverse, fontWeight: "800" },
    secondaryButton: {
        borderWidth: 1,
        borderColor: theme.colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.primaryLight,
    },
    secondaryButtonText: { color: theme.colors.primary, fontWeight: "700" },
    dangerButton: {
        borderWidth: 1,
        borderColor: theme.colors.error,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: theme.radius.md,
        backgroundColor: "rgba(239,68,68,0.08)",
    },
    dangerButtonText: { color: theme.colors.error, fontWeight: "700" },
    buttonDisabled: { opacity: 0.5 },

    optionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    optionChip: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        backgroundColor: theme.colors.bgSecondary,
    },
    optionChipActive: { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary },
    optionChipText: { fontSize: 12, fontWeight: "700", color: theme.colors.textSecondary },
    optionChipTextActive: { color: theme.colors.primary },

    linkCard: {
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        borderRadius: theme.radius.md,
        padding: 12,
        gap: 10,
        backgroundColor: theme.colors.bgSecondary,
    },
    linkActions: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },

    authorityCard: {
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        borderRadius: theme.radius.md,
        padding: 12,
        gap: 10,
        backgroundColor: theme.colors.bgSecondary,
    },
    authorityAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: theme.colors.bgSecondary },
});
