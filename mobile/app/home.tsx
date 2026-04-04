import { useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Image,
    LayoutChangeEvent,
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../src/api/client";
import { usePublicEvents } from "../src/features/events/usePublicEvents";
import { theme } from "../src/shared/theme";

type HomeCareer = {
    id: string;
    name: string;
    description: string;
    duration: string;
    modality: string;
};

type HomeAuthority = {
    name: string;
    role: string;
    email: string;
    image: string;
};

type SectionKey = "eventos" | "autoridades" | "carreras" | "misionvision" | "contacto";

const FALLBACK_MISION =
    "Formar profesionales lideres competentes, con vision humanista y pensamiento critico, a traves de docencia, investigacion y vinculacion.";
const FALLBACK_VISION =
    "Consolidarse como referente nacional e internacional en formacion tecnologica, innovacion y transferencia de conocimiento.";

const FALLBACK_AUTORIDADES: HomeAuthority[] = [
    {
        role: "Decano",
        name: "Dr. Franklin Mayorga Mogollon",
        image: "https://i.imgur.com/hYBsxIf.png",
        email: "fmayorga@uta.edu.ec",
    },
    {
        role: "Subdecano",
        name: "Dr. Javier Sanchez Torres",
        image: "https://i.imgur.com/JIQy6Fa.png",
        email: "j.sanchez@uta.edu.ec",
    },
    {
        role: "Coordinador de Software y TI",
        name: "Ing. Mg. Marco Guachimboza",
        image: "https://i.imgur.com/XDFrTBI.png",
        email: "marcovguachimboza@uta.edu.ec",
    },
];

async function fetchHomeCareers(): Promise<HomeCareer[]> {
    const response = await apiClient.get<Array<Record<string, unknown>>>("/api/carreras");

    return response.data.map((item) => ({
        id: String(item.id_car ?? item.id ?? ""),
        name: String(item.nom_car ?? item.nombre ?? "Carrera"),
        description: String(item.des_car ?? item.descripcion ?? ""),
        duration: String(item.dur_sem_car ?? item.duracion ?? ""),
        modality: String(item.mod_car ?? item.modalidad ?? "No especificada"),
    }));
}

async function fetchHomeIdentity(): Promise<{ mision: string; vision: string; autoridades: HomeAuthority[] }> {
    const response = await apiClient.get<Record<string, unknown>>("/api/mva");
    const rawAutoridades = response.data?.autoridades;

    let parsedAutoridades: HomeAuthority[] = [];
    if (typeof rawAutoridades === "string") {
        try {
            const authorities = JSON.parse(rawAutoridades) as Array<Record<string, string>>;
            parsedAutoridades = authorities.map((item) => ({
                name: item.nombre ?? "Autoridad",
                role: item.cargo ?? "Cargo",
                email: item.email ?? "",
                image: item.imagen ?? "",
            }));
        } catch {
            parsedAutoridades = [];
        }
    }

    return {
        mision: String(response.data?.mision ?? ""),
        vision: String(response.data?.vision ?? ""),
        autoridades: parsedAutoridades,
    };
}

async function fetchFacultyInfo(): Promise<{ title: string; description: string }> {
    const response = await apiClient.get<Record<string, unknown>>("/api/facultad-principal");

    return {
        title: String(
            response.data?.nombre ??
            "Facultad de Ingenieria en Sistemas, Electronica e Industrial"
        ),
        description: String(response.data?.descripcion ?? ""),
    };
}

function formatEventDate(dateISO: string) {
    if (!dateISO) return "Fecha por confirmar";

    const date = new Date(dateISO);
    if (Number.isNaN(date.getTime())) {
        return "Fecha por confirmar";
    }

    return date.toLocaleDateString("es-EC", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export default function PublicHomeScreen() {
    const router = useRouter();
    const scrollRef = useRef<ScrollView | null>(null);
    const [sectionOffsets, setSectionOffsets] = useState<Record<SectionKey, number>>({
        eventos: 0,
        autoridades: 0,
        carreras: 0,
        misionvision: 0,
        contacto: 0,
    });

    const { data: events, isLoading, isError, refetch } = usePublicEvents();
    const { data: careers, isLoading: loadingCareers } = useQuery({
        queryKey: ["home-careers"],
        queryFn: fetchHomeCareers,
        staleTime: 300000,
    });
    const { data: identity, isLoading: loadingIdentity } = useQuery({
        queryKey: ["home-identity"],
        queryFn: fetchHomeIdentity,
        staleTime: 300000,
    });
    const { data: faculty } = useQuery({
        queryKey: ["home-faculty"],
        queryFn: fetchFacultyInfo,
        staleTime: 300000,
    });

    const highlightedEvents = useMemo(() => (events ?? []).slice(0, 4), [events]);
    const visibleCareers = useMemo(() => (careers ?? []).slice(0, 6), [careers]);
    const autoridades = useMemo(() => {
        const fromApi = identity?.autoridades ?? [];
        return fromApi.length > 0 ? fromApi : FALLBACK_AUTORIDADES;
    }, [identity]);

    const handleSectionLayout = (key: SectionKey) => (event: LayoutChangeEvent) => {
        const y = event.nativeEvent.layout.y;
        setSectionOffsets((prev) => ({ ...prev, [key]: y }));
    };

    const scrollToSection = (key: SectionKey) => {
        const y = sectionOffsets[key] > 0 ? sectionOffsets[key] - 104 : 0;
        scrollRef.current?.scrollTo({ y, animated: true });
    };

    const openUrl = (url: string) => {
        Linking.openURL(url).catch(() => {
            // Ignore external link failures in mobile environments without browser support.
        });
    };

    return (
        <LinearGradient colors={["#f6f0f2", "#ffffff"]} style={styles.container}>
            <View style={styles.topNavbar}>
                <View style={styles.topRow}>
                    <View>
                        <Text style={styles.brandTitle}>Academic Events</Text>
                        <Text style={styles.brandSub}>UTA - FISEI</Text>
                    </View>
                    <Pressable style={styles.loginMiniBtn} onPress={() => router.push("/(auth)/login")}>
                        <Ionicons name="log-in-outline" size={16} color={theme.colors.textInverse} />
                    </Pressable>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navTabs}>
                    <Pressable style={styles.navTab} onPress={() => scrollToSection("eventos")}>
                        <Text style={styles.navTabText}>Eventos</Text>
                    </Pressable>
                    <Pressable style={styles.navTab} onPress={() => scrollToSection("autoridades")}>
                        <Text style={styles.navTabText}>Autoridades</Text>
                    </Pressable>
                    <Pressable style={styles.navTab} onPress={() => scrollToSection("carreras")}>
                        <Text style={styles.navTabText}>Carreras</Text>
                    </Pressable>
                    <Pressable style={styles.navTab} onPress={() => scrollToSection("misionvision")}>
                        <Text style={styles.navTabText}>Mision/Vision</Text>
                    </Pressable>
                    <Pressable style={styles.navTab} onPress={() => scrollToSection("contacto")}>
                        <Text style={styles.navTabText}>Contacto</Text>
                    </Pressable>
                </ScrollView>
            </View>

            <ScrollView
                ref={scrollRef}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.heroCard}>
                    <View style={styles.heroTopRow}>
                        <View style={styles.brandBadge}>
                            <Ionicons name="school-outline" size={16} color={theme.colors.textInverse} />
                            <Text style={styles.brandBadgeText}>UTA - FISEI</Text>
                        </View>
                        <View style={styles.onlineDot} />
                    </View>

                    <Text style={styles.heroTitle}>{faculty?.title ?? "Sistema de Gestion de Eventos Academicos"}</Text>
                    <Text style={styles.heroSubtitle}>
                        {faculty?.description ||
                            "Conoce eventos, participa en actividades y accede al ecosistema academico desde tu movil."}
                    </Text>

                    <View style={styles.heroActions}>
                        <Pressable style={styles.primaryAction} onPress={() => router.push("/(auth)/login")}>
                            <Ionicons name="log-in-outline" size={16} color={theme.colors.textInverse} />
                            <Text style={styles.primaryActionText}>Iniciar sesión</Text>
                        </Pressable>
                        <Pressable
                            style={styles.secondaryAction}
                            onPress={() => router.push("/(auth)/register")}
                        >
                            <Ionicons name="person-add-outline" size={16} color={theme.colors.primary} />
                            <Text style={styles.secondaryActionText}>Registrarme</Text>
                        </Pressable>
                    </View>
                </View>

                <View onLayout={handleSectionLayout("eventos")}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Eventos Destacados</Text>
                        <Pressable onPress={() => router.push("/(auth)/login")}>
                            <Text style={styles.sectionLink}>Ver todos</Text>
                        </Pressable>
                    </View>
                </View>

                {isLoading ? (
                    <View style={styles.loadingCard}>
                        <ActivityIndicator color={theme.colors.primary} />
                        <Text style={styles.loadingText}>Cargando eventos...</Text>
                    </View>
                ) : null}

                {isError ? (
                    <View style={styles.errorCard}>
                        <Text style={styles.errorTitle}>No pudimos cargar eventos</Text>
                        <Pressable style={styles.retryButton} onPress={() => refetch()}>
                            <Text style={styles.retryButtonText}>Reintentar</Text>
                        </Pressable>
                    </View>
                ) : null}

                {!isLoading && !isError && highlightedEvents.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Ionicons name="calendar-clear-outline" size={26} color={theme.colors.textTertiary} />
                        <Text style={styles.emptyText}>Aún no hay eventos públicos disponibles.</Text>
                    </View>
                ) : null}

                {!isLoading && !isError
                    ? highlightedEvents.map((event) => (
                        <View key={event.id} style={styles.eventCard}>
                            <View style={styles.eventHeader}>
                                <Text style={styles.eventTitle}>{event.title}</Text>
                                <View style={styles.datePill}>
                                    <Text style={styles.datePillText}>{formatEventDate(event.date)}</Text>
                                </View>
                            </View>
                            <View style={styles.locationRow}>
                                <Ionicons
                                    name="location-outline"
                                    size={14}
                                    color={theme.colors.textSecondary}
                                />
                                <Text style={styles.locationText}>{event.location}</Text>
                            </View>
                            {event.description ? (
                                <Text numberOfLines={2} style={styles.eventDescription}>
                                    {event.description}
                                </Text>
                            ) : null}
                        </View>
                    ))
                    : null}

                <View onLayout={handleSectionLayout("autoridades")}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Autoridades</Text>
                        <Text style={styles.sectionHint}>Equipo directivo FISEI</Text>
                    </View>
                </View>

                {loadingIdentity ? (
                    <View style={styles.loadingCard}>
                        <ActivityIndicator color={theme.colors.primary} />
                        <Text style={styles.loadingText}>Cargando autoridades...</Text>
                    </View>
                ) : null}

                {autoridades.map((item) => (
                    <View key={`${item.name}-${item.email}`} style={styles.authorityCard}>
                        <View style={styles.authorityAvatar}>
                            {item.image ? (
                                <Image source={{ uri: item.image }} style={styles.authorityAvatarImage} />
                            ) : (
                                <Ionicons name="person-outline" size={20} color={theme.colors.primary} />
                            )}
                        </View>
                        <View style={styles.authorityBody}>
                            <Text style={styles.authorityRole}>{item.role}</Text>
                            <Text style={styles.authorityName}>{item.name}</Text>
                            {item.email ? <Text style={styles.authorityEmail}>{item.email}</Text> : null}
                        </View>
                    </View>
                ))}

                <View onLayout={handleSectionLayout("carreras")}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Carreras</Text>
                        <Text style={styles.sectionHint}>Oferta academica</Text>
                    </View>
                </View>

                {loadingCareers ? (
                    <View style={styles.loadingCard}>
                        <ActivityIndicator color={theme.colors.primary} />
                        <Text style={styles.loadingText}>Cargando carreras...</Text>
                    </View>
                ) : null}

                <View style={styles.grid}>
                    {visibleCareers.map((career) => (
                        <View key={career.id} style={styles.gridCard}>
                            <View style={styles.gridIconWrap}>
                                <Ionicons name="school-outline" size={18} color={theme.colors.primary} />
                            </View>
                            <Text style={styles.gridTitle}>{career.name}</Text>
                            <Text style={styles.gridText} numberOfLines={3}>{career.description}</Text>
                            <View style={styles.badgesRow}>
                                <Text style={styles.badge}>{career.duration || "Duracion por definir"}</Text>
                                <Text style={styles.badge}>{career.modality}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View onLayout={handleSectionLayout("misionvision")}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Mision y Vision</Text>
                        <Text style={styles.sectionHint}>Nuestra identidad</Text>
                    </View>
                </View>

                <View style={styles.identityCard}>
                    <View style={styles.identityIconWrap}>
                        <Ionicons name="compass-outline" size={20} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.identityTitle}>Mision</Text>
                    <Text style={styles.identityText}>{identity?.mision || FALLBACK_MISION}</Text>
                </View>

                <View style={styles.identityCard}>
                    <View style={styles.identityIconWrap}>
                        <Ionicons name="telescope-outline" size={20} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.identityTitle}>Vision</Text>
                    <Text style={styles.identityText}>{identity?.vision || FALLBACK_VISION}</Text>
                </View>

                <View onLayout={handleSectionLayout("contacto")}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Contactos</Text>
                        <Text style={styles.sectionHint}>Soporte academico</Text>
                    </View>
                </View>

                <View style={styles.contactCard}>
                    <View style={styles.contactRow}>
                        <Ionicons name="mail-outline" size={16} color={theme.colors.primary} />
                        <Text style={styles.contactText}>eventos.academicos@uta.edu.ec</Text>
                    </View>
                    <View style={styles.contactRow}>
                        <Ionicons name="call-outline" size={16} color={theme.colors.primary} />
                        <Text style={styles.contactText}>+593 03 3700090</Text>
                    </View>
                    <View style={styles.contactActions}>
                        <Pressable
                            style={styles.contactPrimaryBtn}
                            onPress={() =>
                                openUrl("https://fisei.uta.edu.ec/v4.0/index.php/facultad/historia-facultad")
                            }
                        >
                            <Text style={styles.contactPrimaryBtnText}>Contactanos</Text>
                        </Pressable>
                        <Pressable
                            style={styles.contactSecondaryBtn}
                            onPress={() =>
                                openUrl(
                                    "https://fisei.uta.edu.ec/v4.0/index.php/facultad/directorio-telefonico"
                                )
                            }
                        >
                            <Text style={styles.contactSecondaryBtnText}>Directorio</Text>
                        </Pressable>
                    </View>
                </View>

                <View style={styles.footer}>
                    <View style={styles.footerLinks}>
                        <Pressable onPress={() => scrollToSection("eventos")}>
                            <Text style={styles.footerLinkText}>Eventos</Text>
                        </Pressable>
                        <Pressable onPress={() => scrollToSection("carreras")}>
                            <Text style={styles.footerLinkText}>Carreras</Text>
                        </Pressable>
                        <Pressable onPress={() => scrollToSection("contacto")}>
                            <Text style={styles.footerLinkText}>Contacto</Text>
                        </Pressable>
                    </View>
                    <View style={styles.footerCtaRow}>
                        <Pressable style={styles.footerBtn} onPress={() => router.push("/(auth)/login")}>
                            <Text style={styles.footerBtnText}>Iniciar sesion</Text>
                        </Pressable>
                        <Pressable style={styles.footerBtnOutline} onPress={() => router.push("/(auth)/register")}>
                            <Text style={styles.footerBtnOutlineText}>Registrarme</Text>
                        </Pressable>
                    </View>
                    <Text style={styles.footerCopy}>Universidad Tecnica de Ambato - Academic Events</Text>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topNavbar: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        paddingTop: 44,
        paddingHorizontal: theme.spacing.md,
        paddingBottom: 10,
        backgroundColor: "rgba(138, 21, 56, 0.95)",
        borderBottomColor: "rgba(255,255,255,0.15)",
        borderBottomWidth: 1,
    },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    brandTitle: {
        fontSize: 16,
        color: theme.colors.textInverse,
        fontWeight: "800",
        letterSpacing: 0.3,
    },
    brandSub: {
        fontSize: 11,
        color: "rgba(255,255,255,0.8)",
        marginTop: 2,
    },
    loginMiniBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.22)",
    },
    navTabs: {
        gap: 8,
        paddingRight: 20,
    },
    navTab: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.16)",
    },
    navTabText: {
        fontSize: 12,
        color: theme.colors.textInverse,
        fontWeight: "700",
    },
    content: {
        paddingHorizontal: theme.spacing.md,
        paddingTop: 140,
        paddingBottom: theme.spacing.xl,
        gap: theme.spacing.md,
    },
    heroCard: {
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.primary,
        ...theme.shadow.primary,
    },
    heroTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    brandBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "rgba(255,255,255,0.18)",
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    brandBadgeText: {
        fontSize: 11,
        fontWeight: "700",
        color: theme.colors.textInverse,
        letterSpacing: 0.4,
    },
    onlineDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: theme.colors.utaAccent,
    },
    heroTitle: {
        fontSize: 24,
        lineHeight: 30,
        fontWeight: "800",
        color: theme.colors.textInverse,
    },
    heroSubtitle: {
        marginTop: 10,
        fontSize: 14,
        lineHeight: 20,
        color: "rgba(255,255,255,0.9)",
    },
    heroActions: {
        marginTop: theme.spacing.md,
        flexDirection: "row",
        gap: 10,
    },
    primaryAction: {
        flex: 1,
        borderRadius: theme.radius.sm,
        backgroundColor: "#ffffff",
        minHeight: 44,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
    },
    primaryActionText: {
        color: theme.colors.primary,
        fontSize: 14,
        fontWeight: "700",
    },
    secondaryAction: {
        flex: 1,
        borderRadius: theme.radius.sm,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.4)",
        minHeight: 44,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
        backgroundColor: "rgba(255,255,255,0.12)",
    },
    secondaryActionText: {
        color: theme.colors.textInverse,
        fontSize: 14,
        fontWeight: "700",
    },
    sectionHeader: {
        marginTop: 6,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: theme.colors.textPrimary,
    },
    sectionHint: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    sectionLink: {
        fontSize: 13,
        fontWeight: "700",
        color: theme.colors.primary,
    },
    authorityCard: {
        flexDirection: "row",
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.bgPrimary,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        padding: theme.spacing.md,
        alignItems: "center",
        gap: 12,
        ...theme.shadow.sm,
    },
    authorityAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.primaryLight,
        alignItems: "center",
        justifyContent: "center",
    },
    authorityAvatarImage: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    authorityBody: {
        flex: 1,
    },
    authorityRole: {
        fontSize: 11,
        color: theme.colors.primary,
        fontWeight: "700",
        textTransform: "uppercase",
    },
    authorityName: {
        fontSize: 14,
        color: theme.colors.textPrimary,
        fontWeight: "700",
        marginTop: 3,
    },
    authorityEmail: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    gridCard: {
        width: "48.5%",
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.bgPrimary,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        padding: theme.spacing.md,
        ...theme.shadow.sm,
    },
    gridIconWrap: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.primaryLight,
    },
    gridTitle: {
        marginTop: 10,
        fontSize: 14,
        fontWeight: "700",
        color: theme.colors.textPrimary,
    },
    gridText: {
        marginTop: 6,
        fontSize: 12,
        lineHeight: 18,
        color: theme.colors.textSecondary,
    },
    badgesRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
        marginTop: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: theme.colors.primaryLight,
        color: theme.colors.primary,
        fontSize: 11,
        fontWeight: "700",
    },
    loadingCard: {
        borderRadius: theme.radius.md,
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.bgPrimary,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        alignItems: "center",
        gap: 10,
    },
    loadingText: {
        fontSize: 13,
        color: theme.colors.textSecondary,
    },
    errorCard: {
        borderRadius: theme.radius.md,
        padding: theme.spacing.lg,
        backgroundColor: "#fff6f6",
        borderWidth: 1,
        borderColor: "#fecaca",
        alignItems: "center",
        gap: 10,
    },
    errorTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: "#b91c1c",
    },
    retryButton: {
        borderRadius: theme.radius.sm,
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    retryButtonText: {
        color: theme.colors.textInverse,
        fontWeight: "700",
        fontSize: 12,
    },
    emptyCard: {
        borderRadius: theme.radius.md,
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.bgPrimary,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        alignItems: "center",
        gap: 10,
    },
    emptyText: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        textAlign: "center",
    },
    eventCard: {
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
        backgroundColor: theme.colors.bgPrimary,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        ...theme.shadow.sm,
        gap: 8,
    },
    eventHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 10,
    },
    eventTitle: {
        flex: 1,
        fontSize: 15,
        fontWeight: "700",
        color: theme.colors.textPrimary,
    },
    datePill: {
        borderRadius: 999,
        backgroundColor: theme.colors.primaryLight,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    datePillText: {
        fontSize: 11,
        fontWeight: "700",
        color: theme.colors.primary,
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    locationText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    eventDescription: {
        fontSize: 12,
        lineHeight: 18,
        color: theme.colors.textSecondary,
    },
    identityCard: {
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.bgPrimary,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        padding: theme.spacing.md,
        ...theme.shadow.sm,
    },
    identityIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.primaryLight,
    },
    identityTitle: {
        marginTop: 8,
        fontSize: 16,
        fontWeight: "800",
        color: theme.colors.textPrimary,
    },
    identityText: {
        marginTop: 6,
        fontSize: 13,
        lineHeight: 20,
        color: theme.colors.textSecondary,
        textAlign: "justify",
    },
    contactCard: {
        borderRadius: theme.radius.md,
        backgroundColor: "#fff7f9",
        borderWidth: 1,
        borderColor: "#f8c7d5",
        padding: theme.spacing.md,
        gap: 10,
    },
    contactRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    contactText: {
        color: theme.colors.textPrimary,
        fontSize: 13,
        fontWeight: "600",
    },
    contactActions: {
        flexDirection: "row",
        gap: 8,
        marginTop: 4,
    },
    contactPrimaryBtn: {
        flex: 1,
        minHeight: 42,
        borderRadius: theme.radius.sm,
        backgroundColor: theme.colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    contactPrimaryBtnText: {
        color: theme.colors.textInverse,
        fontWeight: "700",
        fontSize: 13,
    },
    contactSecondaryBtn: {
        flex: 1,
        minHeight: 42,
        borderRadius: theme.radius.sm,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.bgPrimary,
    },
    contactSecondaryBtnText: {
        color: theme.colors.primary,
        fontWeight: "700",
        fontSize: 13,
    },
    footer: {
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderPrimary,
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.md,
        gap: 12,
    },
    footerLinks: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    footerLinkText: {
        fontSize: 13,
        color: theme.colors.primary,
        fontWeight: "700",
    },
    footerCtaRow: {
        flexDirection: "row",
        gap: 8,
    },
    footerBtn: {
        flex: 1,
        minHeight: 40,
        borderRadius: theme.radius.sm,
        backgroundColor: theme.colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    footerBtnText: {
        color: theme.colors.textInverse,
        fontWeight: "700",
    },
    footerBtnOutline: {
        flex: 1,
        minHeight: 40,
        borderRadius: theme.radius.sm,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    footerBtnOutlineText: {
        color: theme.colors.primary,
        fontWeight: "700",
    },
    footerCopy: {
        textAlign: "center",
        color: theme.colors.textSecondary,
        fontSize: 11,
    },
});
