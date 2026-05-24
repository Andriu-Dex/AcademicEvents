import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Linking,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect } from "@react-navigation/native";
import { AppHeader } from "../../src/components/AppHeader";
import {
    fetchMyRegistrations,
    generateCertificateForRegistration,
    sendCertificateByEmail,
    type RegistrationItem,
} from "../../src/api/registrations";
import { toAbsoluteUrl } from "../../src/api/client";
import { useAppTheme, useThemedStyles, type ThemeTokens } from "../../src/shared";

function formatDate(raw: string) {
    if (!raw) return "";
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return raw;
    return date.toLocaleDateString("es-EC", { year: "numeric", month: "short", day: "2-digit" });
}

function statusColor(status: string, colors: ThemeTokens["colors"]) {
    const normalized = status.trim().toUpperCase();
    if (normalized.includes("APROB") || normalized.includes("APPROVED")) return colors.success;
    if (normalized.includes("REPROB") || normalized.includes("REJECT")) return colors.error;
    if (normalized.includes("PEND")) return colors.warning;
    return colors.primary;
}

function statusLabel(status: string) {
    const normalized = status.trim().toUpperCase();
    if (normalized.includes("APROB") || normalized.includes("APPROVED")) return "Aprobado";
    if (normalized.includes("REPROB") || normalized.includes("REJECT")) return "Rechazado";
    if (normalized.includes("PEND")) return "Pendiente";
    if (normalized.includes("ACCEPT")) return "Aceptado";
    return status || "Sin estado";
}

function statusIcon(status: string): keyof typeof Ionicons.glyphMap {
    const normalized = status.trim().toUpperCase();
    if (normalized.includes("APROB") || normalized.includes("APPROVED")) return "checkmark-circle";
    if (normalized.includes("REPROB") || normalized.includes("REJECT")) return "close-circle";
    if (normalized.includes("PEND")) return "time";
    return "ellipse";
}

function isCertificateEligible(status: string) {
    const normalized = status.trim().toUpperCase();
    return normalized.includes("APROB") || normalized.includes("APPROVED");
}

function getCertificatePublicPath(rawPath: string | null | undefined): string | null {
    if (!rawPath) return null;

    const trimmed = rawPath.trim();
    if (!trimmed) return null;
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) return trimmed;

    const normalized = trimmed.replaceAll("\\", "/");
    if (normalized.startsWith("/")) return normalized;
    if (normalized.toLowerCase().startsWith("uploads/")) return `/${normalized}`;

    const marker = "/uploads/";
    const index = normalized.toLowerCase().lastIndexOf(marker);
    if (index !== -1) return normalized.slice(index);

    if (normalized.toLowerCase().includes("certificados/")) {
        const withoutLeadingSlash = normalized.replace(/^\/+/, "");
        return `/uploads/${withoutLeadingSlash}`;
    }

    if (!normalized.includes("/")) {
        return `/uploads/certificados/${normalized}`;
    }

    return null;
}

function isImageProof(url: string) {
    const lower = url.toLowerCase();
    if (lower.includes("imgur.com")) return true;
    return /(\.jpg|\.jpeg|\.png|\.webp|\.gif)(\?|$)/i.test(lower);
}

function filterColor(key: string, colors: ThemeTokens["colors"]) {
    if (key === "PEND") return colors.warning;
    if (key === "APROB") return colors.success;
    if (key === "REPROB") return colors.error;
    return colors.primary;
}

function filterLabel(key: string) {
    if (key === "PEND") return "Pendientes";
    if (key === "APROB") return "Aprobados";
    if (key === "REPROB") return "Rechazados";
    return "Todos";
}

const FILTER_KEYS = ["TODOS", "PEND", "APROB", "REPROB"];

function FilterChip({
    label,
    selected,
    color,
    onPress,
}: Readonly<{ label: string; selected: boolean; color: string; onPress: () => void }>) {
    const { tokens } = useAppTheme();
    const styles = useThemedStyles(createStyles);
    return (
        <Pressable
            onPress={onPress}
            style={[
                styles.chip,
                { borderColor: color },
                selected ? { backgroundColor: color } : { backgroundColor: `${color}15` },
            ]}
        >
            <Text
                style={[
                    styles.chipText,
                    { color: selected ? tokens.colors.onPrimary : color },
                ]}
            >
                {label}
            </Text>
        </Pressable>
    );
}

function RegistrationCard({
    item,
    onDownloadCertificate,
    onOpenProof,
}: Readonly<{
    item: RegistrationItem;
    onDownloadCertificate: (item: RegistrationItem) => void;
    onOpenProof: (url: string) => void;
}>) {
    const { tokens } = useAppTheme();
    const styles = useThemedStyles(createStyles);
    const event = item.event;
    const color = statusColor(item.status, tokens.colors);
    const label = statusLabel(item.status);
    const icon = statusIcon(item.status);
    const canDownloadCertificate = isCertificateEligible(item.status);

    return (
        <View style={styles.card}>
            <View style={[styles.cardAccent, { backgroundColor: color }]} />

            <View style={styles.cardBody}>
                <View style={styles.rowTop}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                        {event?.title ?? "Evento sin titulo"}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: `${color}18`, borderColor: `${color}40` }]}>
                        <Ionicons name={icon} size={12} color={color} />
                        <Text style={[styles.statusBadgeText, { color }]}>{label}</Text>
                    </View>
                </View>

                <View style={styles.metaRow}>
                    <Ionicons name="calendar-outline" size={13} color={tokens.colors.textTertiary} />
                    <Text style={styles.metaText}>
                        Inscrito el {formatDate(item.createdAt) || "fecha no disponible"}
                    </Text>
                </View>

                {item.paymentProofUrl ? (
                    <Pressable style={styles.proofBtn} onPress={() => onOpenProof(item.paymentProofUrl ?? "")}>
                        <Ionicons name="document-text-outline" size={15} color={tokens.colors.primary} />
                        <Text style={styles.proofBtnText}>Ver comprobante de pago</Text>
                        <Ionicons name="eye-outline" size={14} color={tokens.colors.primary} />
                    </Pressable>
                ) : null}

                {canDownloadCertificate ? (
                    <Pressable style={styles.certificateBtn} onPress={() => onDownloadCertificate(item)}>
                        <Ionicons name="ribbon-outline" size={15} color={tokens.colors.success} />
                        <Text style={styles.certificateBtnText}>Descargar certificado</Text>
                        <Ionicons name="download-outline" size={14} color={tokens.colors.success} />
                    </Pressable>
                ) : null}
            </View>
        </View>
    );
}

export default function RegistrationsScreen() {
    const { tokens } = useAppTheme();
    const styles = useThemedStyles(createStyles);
    const [statusFilter, setStatusFilter] = useState<string>("TODOS");
    const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);
    const [manualRefreshing, setManualRefreshing] = useState(false);

    const query = useQuery({
        queryKey: ["my-registrations"],
        queryFn: fetchMyRegistrations,
        staleTime: 10000,
        refetchOnWindowFocus: false,
    });

    useFocusEffect(
        useCallback(() => {
            void query.refetch();
        }, [query])
    );

    const items = useMemo(() => {
        const list = query.data ?? [];
        if (statusFilter === "TODOS") return list;
        if (statusFilter === "PEND") {
            return list.filter((r) => r.status.trim().toUpperCase().includes("PEND"));
        }
        if (statusFilter === "APROB") {
            return list.filter((r) => {
                const status = r.status.trim().toUpperCase();
                return status.includes("APROB") || status.includes("APPROVED");
            });
        }
        if (statusFilter === "REPROB") {
            return list.filter((r) => {
                const status = r.status.trim().toUpperCase();
                return status.includes("REPROB") || status.includes("REJECT");
            });
        }
        return list;
    }, [query.data, statusFilter]);

    const totalCount = (query.data ?? []).length;

    const onOpenProof = (rawUrl: string) => {
        const absolute = toAbsoluteUrl(rawUrl ?? "");
        if (!absolute) {
            Alert.alert("Comprobante no disponible", "No se encontro la URL del comprobante.");
            return;
        }

        if (isImageProof(absolute)) {
            setProofPreviewUrl(absolute);
            return;
        }

        void Linking.openURL(absolute).catch(() => {
            Alert.alert("No se pudo abrir el comprobante", "Intenta de nuevo desde la app o en navegador.");
        });
    };

    const onDownloadCertificate = async (item: RegistrationItem) => {
        try {
            const existingPath = getCertificatePublicPath(item.certificate?.fileUrl);
            if (existingPath) {
                const existingUrl = toAbsoluteUrl(existingPath);
                if (!existingUrl) {
                    throw new Error("URL de certificado vacia");
                }
                const canOpen = await Linking.canOpenURL(existingUrl);
                if (!canOpen) {
                    throw new Error("No se puede abrir URL de certificado");
                }
                await Linking.openURL(existingUrl);
                return;
            }

            await generateCertificateForRegistration(item.id);
            const refreshed = await query.refetch();
            const updated = (refreshed.data ?? []).find((entry) => entry.id === item.id);
            const generatedPath = getCertificatePublicPath(updated?.certificate?.fileUrl);

            if (generatedPath) {
                const generatedUrl = toAbsoluteUrl(generatedPath);
                if (!generatedUrl) {
                    throw new Error("URL de certificado generada vacia");
                }
                const canOpen = await Linking.canOpenURL(generatedUrl);
                if (!canOpen) {
                    throw new Error("No se puede abrir URL de certificado generado");
                }
                await Linking.openURL(generatedUrl);
                return;
            }

            Alert.alert(
                "Certificado generado",
                "Se genero el certificado, pero no fue posible abrirlo automaticamente. Deseas enviarlo a tu correo?",
                [
                    { text: "Cancelar", style: "cancel" },
                    {
                        text: "Enviar por correo",
                        onPress: () => {
                            void sendCertificateByEmail(item.id)
                                .then(() => Alert.alert("Listo", "Tu certificado fue enviado al correo registrado."))
                                .catch(() =>
                                    Alert.alert(
                                        "No se pudo enviar",
                                        "Intenta nuevamente en unos segundos."
                                    )
                                );
                        },
                    },
                ]
            );
        } catch {
            Alert.alert(
                "No se pudo descargar el certificado",
                "Verifica tu conexion e intentalo de nuevo."
            );
        }
    };

    const onManualRefresh = async () => {
        setManualRefreshing(true);
        try {
            await query.refetch();
        } finally {
            setManualRefreshing(false);
        }
    };

    const counts = useMemo(() => {
        const all = query.data ?? [];
        return {
            TODOS: all.length,
            PEND: all.filter((r) => r.status.trim().toUpperCase().includes("PEND")).length,
            APROB: all.filter((r) => {
                const s = r.status.trim().toUpperCase();
                return s.includes("APROB") || s.includes("APPROVED");
            }).length,
            REPROB: all.filter((r) => {
                const s = r.status.trim().toUpperCase();
                return s.includes("REPROB") || s.includes("REJECT");
            }).length,
        };
    }, [query.data]);

    let body: ReactNode;
    if (query.isLoading) {
        body = (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={tokens.colors.primary} />
                <Text style={styles.loadingText}>Cargando inscripciones...</Text>
            </View>
        );
    } else if (query.isError) {
        body = (
            <View style={styles.center}>
                <Ionicons name="alert-circle-outline" size={48} color={tokens.colors.error} />
                <Text style={styles.errorText}>No se pudieron cargar tus inscripciones.</Text>
            </View>
        );
    } else {
        body = (
            <FlatList
                data={items}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={manualRefreshing}
                        onRefresh={() => void onManualRefresh()}
                        tintColor={tokens.colors.primary}
                    />
                }
                renderItem={({ item }) => (
                    <RegistrationCard
                        item={item}
                        onDownloadCertificate={onDownloadCertificate}
                        onOpenProof={onOpenProof}
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="clipboard-outline" size={52} color={tokens.colors.textTertiary} />
                        <Text style={styles.emptyTitle}>Sin inscripciones</Text>
                        <Text style={styles.emptySubtitle}>
                            {statusFilter === "TODOS"
                                ? "Aun no tienes inscripciones en ningun evento."
                                : `No tienes inscripciones con estado "${filterLabel(statusFilter)}".`}
                        </Text>
                    </View>
                }
            />
        );
    }

    return (
        <View style={styles.container}>
            <AppHeader title="Mis Inscripciones" showNotifications />

            <View style={styles.filtersWrap}>
                <View style={styles.filtersHeader}>
                    <Text style={styles.filtersTitle}>Filtrar por estado</Text>
                    <Text style={styles.totalCount}>{totalCount} total</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                    {FILTER_KEYS.map((key) => (
                        <FilterChip
                            key={key}
                            label={`${filterLabel(key)} (${counts[key as keyof typeof counts]})`}
                            selected={statusFilter === key}
                            color={filterColor(key, tokens.colors)}
                            onPress={() => setStatusFilter(key)}
                        />
                    ))}
                </ScrollView>
            </View>

            {body}

            <Modal visible={Boolean(proofPreviewUrl)} transparent animationType="fade" onRequestClose={() => setProofPreviewUrl(null)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        {proofPreviewUrl ? <Image source={{ uri: proofPreviewUrl }} style={styles.proofImage} resizeMode="contain" /> : null}
                        <View style={styles.modalActions}>
                            <Pressable style={[styles.modalBtn, styles.modalPrimaryBtn]} onPress={() => setProofPreviewUrl(null)}>
                                <Text style={[styles.modalBtnText, styles.modalPrimaryText]}>Cerrar</Text>
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
    filtersWrap: {
        backgroundColor: theme.colors.bgPrimary,
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
        ...theme.shadow.xs,
    },
    filtersHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    filtersTitle: { fontSize: 14, fontWeight: "800", color: theme.colors.textPrimary },
    totalCount: { fontSize: 12, fontWeight: "700", color: theme.colors.textTertiary },
    chipsRow: { gap: 8, paddingBottom: 4 },
    chip: {
        paddingVertical: 7,
        paddingHorizontal: 14,
        borderRadius: theme.radius.full,
        borderWidth: 1.5,
    },
    chipText: { fontSize: 12, fontWeight: "800" },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: theme.spacing.lg, gap: 10 },
    loadingText: { color: theme.colors.textSecondary, fontWeight: "700" },
    errorText: { color: theme.colors.error, fontWeight: "700", textAlign: "center" },
    list: { padding: theme.spacing.md, gap: 12, paddingBottom: theme.spacing.xl },
    card: {
        backgroundColor: theme.colors.bgCard,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        flexDirection: "row",
        overflow: "hidden",
        ...theme.shadow.sm,
    },
    cardAccent: { width: 5 },
    cardBody: { flex: 1, padding: theme.spacing.md },
    rowTop: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 10,
    },
    cardTitle: { flex: 1, fontWeight: "800", fontSize: 15, color: theme.colors.textPrimary, lineHeight: 21 },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderRadius: theme.radius.full,
        borderWidth: 1,
    },
    statusBadgeText: { fontSize: 11, fontWeight: "800" },
    metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
    metaText: { color: theme.colors.textTertiary, fontWeight: "600", fontSize: 12 },
    proofBtn: {
        marginTop: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: theme.radius.sm,
        backgroundColor: theme.colors.primaryLighter,
        borderWidth: 1,
        borderColor: theme.colors.primaryLight,
    },
    proofBtnText: { flex: 1, color: theme.colors.primary, fontWeight: "700", fontSize: 13 },
    certificateBtn: {
        marginTop: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: theme.radius.sm,
        backgroundColor: theme.colors.successLight,
        borderWidth: 1,
        borderColor: theme.colors.successBorder,
    },
    certificateBtnText: { flex: 1, color: theme.colors.success, fontWeight: "800", fontSize: 13 },
    emptyState: { alignItems: "center", paddingVertical: theme.spacing.xxl, gap: 12 },
    emptyTitle: { fontSize: 16, fontWeight: "800", color: theme.colors.textSecondary },
    emptySubtitle: { color: theme.colors.textTertiary, textAlign: "center", lineHeight: 20, paddingHorizontal: theme.spacing.lg },
    modalOverlay: {
        flex: 1,
        backgroundColor: theme.colors.overlayBlack65,
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
    },
    modalCard: {
        width: "100%",
        maxWidth: 440,
        backgroundColor: theme.colors.bgPrimary,
        borderRadius: theme.radius.lg,
        padding: 12,
        gap: 12,
    },
    proofImage: { width: "100%", height: 320, backgroundColor: theme.colors.bgSecondary, borderRadius: 12 },
    modalActions: { flexDirection: "row", gap: 8 },
    modalBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        borderRadius: theme.radius.sm,
        paddingVertical: 10,
        alignItems: "center",
    },
    modalPrimaryBtn: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    modalBtnText: { color: theme.colors.textPrimary, fontWeight: "700" },
    modalPrimaryText: { color: theme.colors.onPrimary },
    };
}
