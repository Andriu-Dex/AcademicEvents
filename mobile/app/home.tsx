import { useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    Image,
    LayoutChangeEvent,
    Linking,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useRouter, useSegments } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { apiClient, getCurrentApiBaseUrl, getLastApiProbeLog, toAbsoluteUrl } from "../src/api/client";
import { useFeaturedEvents } from "../src/features/events/useFeaturedEvents";
import { useAuthStore } from "../src/store/authStore";
import { theme } from "../src/shared/theme";
import type { PublicEvent } from "../src/api/publicEvents";
import { fetchMyRegistrations } from "../src/api/registrations";

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

type HomeFaculty = {
    title: string;
    acronym: string;
    description: string;
    logo: string;
};

type HomeStats = {
    careers: number;
    activeEvents: number;
    registeredUsers: number;
    participationRate: string;
};

type UniversitySocialLink = {
    id: string;
    label: string;
    url: string;
    iconKey: string;
    platformKey: string;
    displayOrder: number;
    isActive: boolean;
};

type UniversityInfo = {
    name: string;
    address: string;
    email: string;
    phone: string;
    socialLinks: UniversitySocialLink[];
};

type SectionKey = "inicio" | "eventos" | "autoridades" | "carreras" | "misionvision" | "contacto";

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
        role: "Coordinador",
        name: "Ing. Mg. Marco Guachimboza",
        image: "https://i.imgur.com/XDFrTBI.png",
        email: "marcovguachimboza@uta.edu.ec",
    },
];

const FALLBACK_UNIVERSITY: UniversityInfo = {
    name: "Universidad Técnica de Ambato",
    address: "Av. Los Chasquis y Rio Payamino",
    email: "utarectorado@uta.edu.ec",
    phone: "03-3700090",
    socialLinks: [],
};

function pickString(...values: unknown[]) {
    for (const value of values) {
        if (typeof value === "string") {
            return value;
        }
        if (typeof value === "number") {
            return String(value);
        }
    }
    return "";
}

function pickNumber(...values: unknown[]) {
    for (const value of values) {
        if (typeof value === "number" && Number.isFinite(value)) {
            return value;
        }
        if (typeof value === "string") {
            const parsed = Number(value);
            if (!Number.isNaN(parsed)) {
                return parsed;
            }
        }
    }
    return 0;
}

function formatSemesters(raw: string) {
    const cleaned = raw.trim();
    if (!cleaned) return "";

    const numeric = Number.parseInt(cleaned, 10);
    if (!Number.isNaN(numeric) && Number.isFinite(numeric)) {
        return numeric === 1 ? "1 semestre" : `${numeric} semestres`;
    }

    return cleaned;
}

function translateModality(raw: string) {
    const value = raw.trim();
    if (!value) return "";

    const normalized = value.toLowerCase();
    const compact = normalized.replaceAll(" ", "").replaceAll("_", "").replaceAll("-", "");

    // Valores típicos del backend (enum) o textos simples
    if (compact === "virtual" || compact === "online" || compact === "elearning") {
        return "Virtual";
    }
    if (compact === "inperson" || compact === "presential" || compact === "presencial") return "Presencial";
    if (compact === "hybrid" || compact === "semipresencial" || compact === "mixta" || compact === "hibrida") {
        return "Semipresencial";
    }
    if (compact === "distance" || compact === "distancia") return "Distancia";

    // Enum en mayúsculas
    if (normalized === "in_person") return "Presencial";
    if (normalized === "virtual") return "Virtual";
    if (normalized === "hybrid") return "Semipresencial";

    // Si ya viene en español u otro valor, lo respetamos.
    return value;
}

async function fetchHomeCareers(): Promise<HomeCareer[]> {
    const response = await apiClient.get<Array<Record<string, unknown>>>("/api/carreras");

    return response.data.map((item) => ({
        id: pickString(item.id_car, item.id),
        name: pickString(item.nom_car, item.nombre, "Carrera"),
        description: pickString(item.des_car, item.descripcion),
        duration: formatSemesters(
            pickString(item.dur_sem_car, item.duracion, item.duration, item.durationSemesters, item.semesters)
        ),
        modality: translateModality(
            pickString(item.mod_car, item.modalidad, item.modality, item.modalidad_car, "No especificada")
        ),
    }));
}

async function fetchHomeIdentity(): Promise<{ mision: string; vision: string; autoridades: HomeAuthority[] }> {
    const response = await apiClient.get<Record<string, unknown>>("/api/mva");
    const rawAutoridades = response.data?.autoridades;

    let parsedAutoridades: HomeAuthority[] = [];
    const normalizeAuthority = (item: Record<string, unknown>): HomeAuthority => ({
        name:
            `${pickString(item.firstName, item.nombre, item.name, item.nombres, "")} ${pickString(
                item.lastName,
                item.apellidos,
                item.last,
                item.surname,
                ""
            )}`.trim() || pickString(item.nombre, item.name, item.nombres, item.fullName, "Autoridad"),
        role: pickString(item.title, item.titulo, item.cargo, item.role, item.rol, item.puesto, "Cargo"),
        email: pickString(item.email, item.correo, item.mail, ""),
        image: pickString(item.imageUrl, item.imagen, item.image, item.foto, item.avatar, ""),
    });

    if (typeof rawAutoridades === "string") {
        try {
            const authorities = JSON.parse(rawAutoridades) as Array<Record<string, unknown>>;
            if (Array.isArray(authorities)) {
                parsedAutoridades = authorities.map(normalizeAuthority);
            }
        } catch {
            parsedAutoridades = [];
        }
    } else if (Array.isArray(rawAutoridades)) {
        parsedAutoridades = (rawAutoridades as Array<Record<string, unknown>>).map(normalizeAuthority);
    } else if (rawAutoridades && typeof rawAutoridades === "object") {
        const maybeList = (rawAutoridades as Record<string, unknown>).items;
        if (Array.isArray(maybeList)) {
            parsedAutoridades = (maybeList as Array<Record<string, unknown>>).map(normalizeAuthority);
        }
    }

    return {
        mision: pickString(response.data?.mision),
        vision: pickString(response.data?.vision),
        autoridades: parsedAutoridades,
    };
}

async function fetchFacultyInfo(): Promise<HomeFaculty> {
    const response = await apiClient.get<Record<string, unknown>>("/api/facultad-principal");

    return {
        title: pickString(
            response.data?.nombre,
            response.data?.nom_fac,
            "Facultad de Ingenieria en Sistemas, Electronica e Industrial"
        ),
        acronym: pickString(response.data?.acronimo, response.data?.acr_fac, "FISEI"),
        description: pickString(response.data?.descripcion, response.data?.des_fac),
        logo: pickString(response.data?.logo, response.data?.url_log_fac),
    };
}

async function fetchHomeStats(): Promise<HomeStats> {
    const response = await apiClient.get<Record<string, unknown>>("/api/estadisticas/home");

    return {
        careers: pickNumber(response.data?.carreras),
        activeEvents: pickNumber(response.data?.eventosActivos),
        registeredUsers: pickNumber(response.data?.usuariosRegistrados),
        participationRate: pickString(response.data?.tasaParticipacion, "0%"),
    };
}

async function fetchUniversityInfo(): Promise<UniversityInfo> {
    const response = await apiClient.get<Record<string, unknown>>("/api/universidad-principal");
    let socialRaw: Array<Record<string, unknown>> = [];
    if (Array.isArray(response.data?.socialLinks)) {
        socialRaw = response.data.socialLinks as Array<Record<string, unknown>>;
    } else if (Array.isArray(response.data?.social_links)) {
        socialRaw = response.data.social_links as Array<Record<string, unknown>>;
    }

    return {
        name: pickString(response.data?.name, response.data?.nom_uni, FALLBACK_UNIVERSITY.name),
        address: pickString(response.data?.address, response.data?.dir_uni, FALLBACK_UNIVERSITY.address),
        email: pickString(response.data?.email, response.data?.cor_uni, FALLBACK_UNIVERSITY.email),
        phone: pickString(response.data?.phone, response.data?.tel_uni, FALLBACK_UNIVERSITY.phone),
        socialLinks: socialRaw.map((item, index) => ({
            id: pickString(item.id, `${index}`),
            label: pickString(item.label, "Enlace"),
            url: pickString(item.url),
            iconKey: pickString(item.iconKey, "link"),
            platformKey: pickString(item.platformKey, "custom"),
            displayOrder: pickNumber(item.displayOrder, index),
            isActive: item.isActive !== false,
        })),
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

function resolveSocialIcon(platformKey: string, iconKey: string) {
    const normalized = `${platformKey}-${iconKey}`.toLowerCase();

    if (normalized.includes("facebook")) return "logo-facebook";
    if (normalized.includes("instagram")) return "logo-instagram";
    if (normalized.includes("youtube")) return "logo-youtube";
    if (normalized.includes("web") || normalized.includes("globe") || normalized.includes("sitio")) {
        return "globe-outline";
    }
    return "link-outline";
}

export default function PublicHomeScreen() {
    return <HomeContent />;
}

export function HomeContent(
    {
        showAuthCtas = true,
        eventsRoute = "/public-events",
    }: Readonly<{ showAuthCtas?: boolean; eventsRoute?: string }> = { showAuthCtas: true, eventsRoute: "/public-events" }
) {
    const router = useRouter();
    const segments = useSegments();
    const user = useAuthStore((s) => s.user);
    const isAdminArea = segments.includes("(admin)");
    const scrollRef = useRef<ScrollView | null>(null);
    const [authorityIndex, setAuthorityIndex] = useState(0);
    const authorityScrollX = useRef(new Animated.Value(0)).current;
    const [featuredIndex, setFeaturedIndex] = useState(0);
    const featuredScrollX = useRef(new Animated.Value(0)).current;
    const [selectedEvent, setSelectedEvent] = useState<PublicEvent | null>(null);
    const [sectionOffsets, setSectionOffsets] = useState<Record<SectionKey, number>>({
        inicio: 0,
        eventos: 0,
        autoridades: 0,
        carreras: 0,
        misionvision: 0,
        contacto: 0,
    });

    const { data: events, isLoading, isError, refetch } = useFeaturedEvents();
    const {
        data: careers,
        isLoading: loadingCareers,
        isError: careersError,
        error: careersErrorObj,
        refetch: refetchCareers,
    } = useQuery({
        queryKey: ["home-careers"],
        queryFn: fetchHomeCareers,
        staleTime: 300000,
    });
    const {
        data: identity,
        isLoading: loadingIdentity,
        isError: identityError,
        error: identityErrorObj,
        refetch: refetchIdentity,
    } = useQuery({
        queryKey: ["home-identity"],
        queryFn: fetchHomeIdentity,
        staleTime: 300000,
    });
    const { data: faculty } = useQuery({
        queryKey: ["home-faculty"],
        queryFn: fetchFacultyInfo,
        staleTime: 300000,
    });
    const { data: stats } = useQuery({
        queryKey: ["home-stats"],
        queryFn: fetchHomeStats,
        staleTime: 120000,
    });
    const { data: university } = useQuery({
        queryKey: ["home-university"],
        queryFn: fetchUniversityInfo,
        staleTime: 300000,
    });
    const { data: myRegistrations } = useQuery({
        queryKey: ["my-registrations"],
        queryFn: fetchMyRegistrations,
        staleTime: 60000,
        enabled: !!user,
    });

    const isSelectedEventRegistered = useMemo(() => {
        if (!myRegistrations || !selectedEvent) return false;
        return myRegistrations.some((r) => String(r.event?.id) === String(selectedEvent.id));
    }, [myRegistrations, selectedEvent]);

    const highlightedEvents = useMemo(() => (events ?? []).slice(0, 4), [events]);
    const visibleCareers = useMemo(() => (careers ?? []).slice(0, 6), [careers]);
    const autoridades = useMemo(() => {
        const fromApi = identity?.autoridades ?? [];
        return fromApi.length > 0 ? fromApi : FALLBACK_AUTORIDADES;
    }, [identity]);
    const footerUniversity = university ?? FALLBACK_UNIVERSITY;

    const socialLinks = useMemo(
        () =>
            footerUniversity.socialLinks
                .filter((item) => item.isActive && item.url.length > 0)
                .sort((a, b) => a.displayOrder - b.displayOrder),
        [footerUniversity.socialLinks]
    );
    const handleSectionLayout = (key: SectionKey) => (event: LayoutChangeEvent) => {
        const y = event.nativeEvent.layout.y;
        setSectionOffsets((prev) => ({ ...prev, [key]: y }));
    };

    const scrollToSection = (key: SectionKey) => {
        const y = sectionOffsets[key] > 0 ? sectionOffsets[key] - 108 : 0;
        scrollRef.current?.scrollTo({ y, animated: true });
    };

    const openUrl = (url: string) => {
        Linking.openURL(url).catch(() => {
            // Ignore link failures in environments without browser handlers.
        });
    };

    const callUniversity = () => {
        const phone = footerUniversity.phone.replaceAll(" ", "");
        openUrl(`tel:${phone}`);
    };

    const screenWidth = Dimensions.get("window").width;
    const authorityCardWidth = Math.min(screenWidth * 0.82, 360);
    const authoritySidePadding = Math.max(0, (screenWidth - authorityCardWidth) / 2);
    const featuredCardWidth = Math.min(screenWidth * 0.86, 370);
    const featuredSidePadding = Math.max(0, (screenWidth - featuredCardWidth) / 2);

    return (
        <LinearGradient colors={["#f8eff2", "#ffffff"]} style={styles.container}>
            <LinearGradient colors={theme.gradients.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.topNavbar}>
                <View style={styles.navbarRow}>
                    <Pressable style={styles.brandGroup} onPress={() => scrollToSection("inicio")}>
                        <View style={styles.brandWrap}>
                            {faculty?.logo ? (
                                <Image
                                    source={{ uri: toAbsoluteUrl(faculty.logo) }}
                                    style={styles.brandLogo}
                                    resizeMode="contain"
                                />
                            ) : (
                                <View style={styles.brandLogoFallback} />
                            )}
                        </View>
                        <Text style={styles.brandLabel}>{faculty?.acronym ?? "FISEI"}</Text>
                    </Pressable>

                    {user ? (
                        <View style={styles.navCtas}>
                            <Pressable style={styles.iconBtnHeader} onPress={() => router.push("/notifications")}>
                                <Ionicons name="notifications-outline" size={22} color={theme.colors.textInverse} />
                            </Pressable>
                            <Pressable style={styles.navUserChip} onPress={() => router.push(isAdminArea ? "/(admin)/profile" : "/profile")}>
                                {user.profileImageUrl ? (
                                    <Image source={{ uri: toAbsoluteUrl(user.profileImageUrl) }} style={styles.navUserAvatar} />
                                ) : (
                                    <View style={styles.navUserAvatarFallback} />
                                )}
                                <Text style={styles.navUserName} numberOfLines={1}>
                                    {(user.firstName ?? "").trim() || user.email}
                                </Text>
                                <Ionicons name="chevron-forward" size={16} color={theme.colors.textInverse} />
                            </Pressable>
                        </View>
                    ) : showAuthCtas ? (
                        <View style={styles.navCtas}>
                            <Pressable style={styles.navCtaPrimary} onPress={() => router.push("/(auth)/login")}>
                                <Text style={styles.navCtaPrimaryText}>Iniciar sesión</Text>
                            </Pressable>
                            <Pressable style={styles.navCtaSecondary} onPress={() => router.push("/(auth)/register")}>
                                <Text style={styles.navCtaSecondaryText}>Registrarse</Text>
                            </Pressable>
                        </View>
                    ) : null}
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navTabs}>
                    <Pressable style={styles.navTab} onPress={() => scrollToSection("inicio")}>
                        <Text style={styles.navTabText}>Inicio</Text>
                    </Pressable>
                    <Pressable style={styles.navTab} onPress={() => scrollToSection("eventos")}>
                        <Text style={styles.navTabText}>Eventos</Text>
                    </Pressable>
                    <Pressable style={styles.navTabGhost} onPress={() => scrollToSection("autoridades")}>
                        <Text style={styles.navTabText}>Autoridades</Text>
                    </Pressable>
                    <Pressable style={styles.navTabGhost} onPress={() => scrollToSection("carreras")}>
                        <Text style={styles.navTabText}>Carreras</Text>
                    </Pressable>
                    <Pressable style={styles.navTabGhost} onPress={() => scrollToSection("misionvision")}>
                        <Text style={styles.navTabText}>Misión y Visión</Text>
                    </Pressable>
                    <Pressable style={styles.navTabGhost} onPress={() => scrollToSection("contacto")}>
                        <Text style={styles.navTabText}>Contacto</Text>
                    </Pressable>
                </ScrollView>
            </LinearGradient>

            <ScrollView ref={scrollRef} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View onLayout={handleSectionLayout("inicio")} style={styles.heroCard}>
                    <View style={styles.heroBadge}>
                        <Ionicons name="school-outline" size={16} color={theme.colors.textInverse} />
                        <Text style={styles.heroBadgeText}>{faculty?.acronym ?? "FISEI"}</Text>
                    </View>

                    <Text style={styles.heroTitle}>Sistema de Gestión de Eventos Académicos - {faculty?.acronym ?? "FISEI"}</Text>
                    <Text style={styles.heroSubtitle}>
                        {faculty?.title ?? "Facultad de Ingenieria en Sistemas, Electronica e Industrial"}
                    </Text>
                    <Text style={styles.heroDescription}>
                        {faculty?.description ||
                            "Conoce eventos, participa en actividades y accede al ecosistema academico desde tu movil."}
                    </Text>

                    <View style={styles.heroActions}>
                        <Pressable style={styles.primaryAction} onPress={() => router.push(eventsRoute)}>
                            <Ionicons name="calendar-outline" size={16} color={theme.colors.textInverse} />
                            <Text style={styles.primaryActionText}>Explorar eventos públicos</Text>
                        </Pressable>
                        <Pressable style={styles.secondaryAction} onPress={() => scrollToSection("carreras")}>
                            <Ionicons name="school-outline" size={16} color={theme.colors.primary} />
                            <Text style={styles.secondaryActionText}>Ver carreras</Text>
                        </Pressable>
                    </View>

                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{stats?.careers ?? 0}</Text>
                            <Text style={styles.statLabel}>Carreras</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{stats?.activeEvents ?? 0}</Text>
                            <Text style={styles.statLabel}>Eventos Activos</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{stats?.registeredUsers ?? 0}</Text>
                            <Text style={styles.statLabel}>Usuarios Registrados</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{stats?.participationRate ?? "0%"}</Text>
                            <Text style={styles.statLabel}>Participación de Usuarios</Text>
                        </View>
                    </View>
                </View>

                <View onLayout={handleSectionLayout("eventos")}>
                    <View style={styles.sectionHeaderCentered}>
                        <Text style={styles.sectionTitleBrand}>Eventos Destacados</Text>
                        <Text style={styles.sectionSubtitle}>Descubre las actividades mas relevantes del momento</Text>
                    </View>
                </View>

                {isLoading ? (
                    <View style={styles.loadingCard}>
                        <ActivityIndicator color={theme.colors.primary} />
                        <Text style={styles.loadingText}>Cargando eventos destacados...</Text>
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
                        <Text style={styles.emptyText}>No hay eventos destacados disponibles por el momento.</Text>
                    </View>
                ) : null}

                {!isLoading && !isError && highlightedEvents.length > 0 ? (
                    <View style={styles.featuredCarouselWrap}>
                        <Animated.FlatList
                            data={highlightedEvents}
                            keyExtractor={(item, index) => `featured-${item.id || item.title}-${index}`}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            snapToInterval={featuredCardWidth}
                            snapToAlignment="start"
                            decelerationRate="fast"
                            contentContainerStyle={{ paddingHorizontal: featuredSidePadding }}
                            onScroll={Animated.event(
                                [{ nativeEvent: { contentOffset: { x: featuredScrollX } } }],
                                {
                                    useNativeDriver: true,
                                    listener: (event) => {
                                        const x = (event as any).nativeEvent.contentOffset.x as number;
                                        const next = Math.round(x / featuredCardWidth);
                                        if (Number.isFinite(next) && next !== featuredIndex) {
                                            setFeaturedIndex(next);
                                        }
                                    },
                                }
                            )}
                            scrollEventThrottle={16}
                            renderItem={({ item, index }) => {
                                const inputRange = [
                                    (index - 1) * featuredCardWidth,
                                    index * featuredCardWidth,
                                    (index + 1) * featuredCardWidth,
                                ];

                                const scale = featuredScrollX.interpolate({
                                    inputRange,
                                    outputRange: [0.96, 1, 0.96],
                                    extrapolate: "clamp",
                                });

                                const opacity = featuredScrollX.interpolate({
                                    inputRange,
                                    outputRange: [0.78, 1, 0.78],
                                    extrapolate: "clamp",
                                });

                                return (
                                    <Animated.View
                                        style={[
                                            styles.featuredSlide,
                                            { width: featuredCardWidth, transform: [{ scale }], opacity },
                                        ]}
                                    >
                                        <View style={styles.featuredCard}>
                                            <View style={styles.featuredImageWrap}>
                                                {item.coverImageUrl ? (
                                                    <Image
                                                        source={{ uri: toAbsoluteUrl(item.coverImageUrl) }}
                                                        style={styles.featuredImage}
                                                        resizeMode="cover"
                                                    />
                                                ) : (
                                                    <View style={styles.featuredImageFallback}>
                                                        <Ionicons name="image-outline" size={28} color={theme.colors.primary} />
                                                    </View>
                                                )}
                                                <LinearGradient
                                                    colors={["transparent", "rgba(26,31,46,0.78)"]}
                                                    style={styles.featuredImageOverlay}
                                                />
                                                <View style={styles.featuredBadge}>
                                                    <Ionicons name="star" size={12} color={theme.colors.utaAccent} />
                                                    <Text style={styles.featuredBadgeText}>Destacado</Text>
                                                </View>
                                            </View>

                                            <View style={styles.featuredBody}>
                                                <View style={styles.eventHeader}>
                                                    <Text style={styles.eventTitle} numberOfLines={2}>
                                                        {item.title}
                                                    </Text>
                                                    <View style={styles.datePill}>
                                                        <Text style={styles.datePillText}>{formatEventDate(item.date)}</Text>
                                                    </View>
                                                </View>

                                                <View style={styles.featuredMetaRow}>
                                                    {item.modality ? (
                                                        <View style={styles.featuredMetaPill}>
                                                            <Ionicons name="desktop-outline" size={12} color={theme.colors.primary} />
                                                            <Text style={styles.featuredMetaText}>{item.modality}</Text>
                                                        </View>
                                                    ) : null}
                                                    <View style={styles.featuredMetaPill}>
                                                        <Ionicons name="pricetag-outline" size={12} color={theme.colors.primary} />
                                                        <Text style={styles.featuredMetaText}>
                                                            {(item.price ?? 0) > 0 ? `$${(item.price ?? 0).toFixed(2)}` : "Gratuito"}
                                                        </Text>
                                                    </View>
                                                    {item.status ? (
                                                        <View style={styles.featuredMetaPill}>
                                                            <Ionicons name="checkmark-circle-outline" size={12} color={theme.colors.primary} />
                                                            <Text style={styles.featuredMetaText}>{item.status}</Text>
                                                        </View>
                                                    ) : null}
                                                </View>

                                                {item.description ? (
                                                    <Text numberOfLines={3} style={styles.eventDescription}>
                                                        {item.description}
                                                    </Text>
                                                ) : null}
                                                <Pressable
                                                    style={styles.featuredDetailBtn}
                                                    onPress={() => setSelectedEvent(item)}
                                                >
                                                    <Text style={styles.featuredDetailBtnText}>Ver detalles</Text>
                                                    <Ionicons name="arrow-forward" size={14} color={theme.colors.textInverse} />
                                                </Pressable>
                                            </View>
                                        </View>
                                    </Animated.View>
                                );
                            }}
                        />
                        <View style={styles.carouselDots}>
                            {highlightedEvents.map((item, idx) => (
                                <View
                                    key={`featured-dot-${item.id || item.title}-${idx}`}
                                    style={[styles.carouselDot, idx === featuredIndex ? styles.carouselDotActive : null]}
                                />
                            ))}
                        </View>
                    </View>
                ) : null}

                <View onLayout={handleSectionLayout("autoridades")}>
                    <View style={styles.sectionHeaderCentered}>
                        <Text style={styles.sectionTitleBrand}>Autoridades de la Facultad</Text>
                        <Text style={styles.sectionSubtitle}>Conoce a nuestro equipo directivo</Text>
                    </View>
                </View>

                {loadingIdentity ? (
                    <View style={styles.loadingCard}>
                        <ActivityIndicator color={theme.colors.primary} />
                        <Text style={styles.loadingText}>Cargando autoridades...</Text>
                    </View>
                ) : null}

                {identityError ? (
                    <View style={styles.errorCard}>
                        <Text style={styles.errorTitle}>No pudimos cargar autoridades</Text>
                        <Text style={styles.errorSubtitle}>
                            {identityErrorObj instanceof Error
                                ? identityErrorObj.message
                                : "Sin conexión al backend"}
                        </Text>
                        {__DEV__ ? (
                            <Text style={styles.errorSubtitle}>
                                API: {getCurrentApiBaseUrl()}\n{getLastApiProbeLog().join(" | ")}
                            </Text>
                        ) : null}
                        <Pressable style={styles.retryButton} onPress={() => refetchIdentity()}>
                            <Text style={styles.retryButtonText}>Reintentar</Text>
                        </Pressable>
                    </View>
                ) : null}

                <View style={styles.authorityCarouselWrap}>
                    <Animated.FlatList
                        data={autoridades}
                        keyExtractor={(item) => `${item.name}-${item.email}`}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={authorityCardWidth}
                        snapToAlignment="start"
                        decelerationRate="fast"
                        contentContainerStyle={{ paddingHorizontal: authoritySidePadding }}
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { x: authorityScrollX } } }],
                            {
                                useNativeDriver: true,
                                listener: (event) => {
                                    const x = (event as any).nativeEvent.contentOffset.x as number;
                                    const next = Math.round(x / authorityCardWidth);
                                    if (Number.isFinite(next) && next !== authorityIndex) {
                                        setAuthorityIndex(next);
                                    }
                                },
                            }
                        )}
                        scrollEventThrottle={16}
                        renderItem={({ item, index }) => {
                            const inputRange = [
                                (index - 1) * authorityCardWidth,
                                index * authorityCardWidth,
                                (index + 1) * authorityCardWidth,
                            ];

                            const scale = authorityScrollX.interpolate({
                                inputRange,
                                outputRange: [0.96, 1, 0.96],
                                extrapolate: "clamp",
                            });

                            const opacity = authorityScrollX.interpolate({
                                inputRange,
                                outputRange: [0.75, 1, 0.75],
                                extrapolate: "clamp",
                            });

                            return (
                                <Animated.View
                                    style={[
                                        styles.authoritySlide,
                                        { width: authorityCardWidth, transform: [{ scale }], opacity },
                                    ]}
                                >
                                    <View style={styles.authorityCardWide}>
                                        <View style={styles.authorityAvatarLarge}>
                                            {item.image ? (
                                                <Image source={{ uri: item.image }} style={styles.authorityAvatarImageLarge} />
                                            ) : (
                                                <Ionicons name="person-outline" size={26} color={theme.colors.primary} />
                                            )}
                                        </View>
                                        <View style={styles.authorityBodyWide}>
                                            <Text style={styles.authorityRole}>{item.role}</Text>
                                            <Text style={styles.authorityName}>{item.name}</Text>
                                            {item.email ? <Text style={styles.authorityEmail}>{item.email}</Text> : null}
                                            {item.email ? (
                                                <Pressable
                                                    style={styles.authorityContactBtnWide}
                                                    onPress={() => openUrl(`mailto:${item.email}`)}
                                                >
                                                    <Text style={styles.authorityContactTextWide}>Contactar</Text>
                                                </Pressable>
                                            ) : null}
                                        </View>
                                    </View>
                                </Animated.View>
                            );
                        }}
                    />
                    <View style={styles.carouselDots}>
                        {autoridades.map((item, idx) => (
                            <View
                                key={`dot-${item.name}-${item.email || idx}`}
                                style={[styles.carouselDot, idx === authorityIndex ? styles.carouselDotActive : null]}
                            />
                        ))}
                    </View>
                </View>

                <View onLayout={handleSectionLayout("carreras")}>
                    <View style={styles.sectionHeaderCentered}>
                        <Text style={styles.sectionTitleBrand}>Nuestras Carreras</Text>
                        <Text style={styles.sectionSubtitle}>Descubre las opciones académicas que tenemos para ti</Text>
                    </View>
                </View>

                {loadingCareers ? (
                    <View style={styles.loadingCard}>
                        <ActivityIndicator color={theme.colors.primary} />
                        <Text style={styles.loadingText}>Cargando carreras...</Text>
                    </View>
                ) : null}

                {careersError ? (
                    <View style={styles.errorCard}>
                        <Text style={styles.errorTitle}>No pudimos cargar carreras</Text>
                        <Text style={styles.errorSubtitle}>
                            {careersErrorObj instanceof Error
                                ? careersErrorObj.message
                                : "Sin conexión al backend"}
                        </Text>
                        {__DEV__ ? (
                            <Text style={styles.errorSubtitle}>
                                API: {getCurrentApiBaseUrl()}\n{getLastApiProbeLog().join(" | ")}
                            </Text>
                        ) : null}
                        <Pressable style={styles.retryButton} onPress={() => refetchCareers()}>
                            <Text style={styles.retryButtonText}>Reintentar</Text>
                        </Pressable>
                    </View>
                ) : null}

                <View style={styles.grid}>
                    {visibleCareers.map((career) => (
                        <View key={career.id} style={styles.gridCard}>
                            <View style={styles.gridIconWrap}>
                                <Ionicons name="school-outline" size={18} color={theme.colors.primary} />
                            </View>
                            <Text style={styles.gridTitle}>{career.name}</Text>
                            <Text style={styles.gridText} numberOfLines={3}>
                                {career.description}
                            </Text>
                            <View style={styles.badgesRow}>
                                <Text style={styles.badge}>{career.duration || "Duración por definir"}</Text>
                                <Text style={styles.badge}>{career.modality}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View onLayout={handleSectionLayout("misionvision")}>
                    <View style={styles.sectionHeaderCentered}>
                        <Text style={styles.sectionTitleBrand}>Nuestra Identidad</Text>
                        <Text style={styles.sectionSubtitle}>Los principios que nos guían</Text>
                    </View>
                </View>

                <View style={styles.identityCard}>
                    <View style={styles.identityIconWrap}>
                        <Ionicons name="compass-outline" size={20} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.identityTitle}>Misión</Text>
                    <Text style={styles.identityText}>{identity?.mision || FALLBACK_MISION}</Text>
                </View>

                <View style={styles.identityCard}>
                    <View style={styles.identityIconWrap}>
                        <Ionicons name="telescope-outline" size={20} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.identityTitle}>Visión</Text>
                    <Text style={styles.identityText}>{identity?.vision || FALLBACK_VISION}</Text>
                </View>

                <View onLayout={handleSectionLayout("contacto")}>
                    <View style={styles.sectionHeaderCentered}>
                        <Text style={styles.sectionTitleBrand}>¿Necesitas información adicional?</Text>
                        <Text style={styles.sectionSubtitleLong}>
                            Nuestro equipo de atención está disponible para resolver todas tus dudas sobre inscripciones, carreras y procesos académicos.
                        </Text>
                    </View>
                </View>

                <View style={styles.contactCard}>
                    <View style={styles.contactActions}>
                        <Pressable
                            style={styles.contactPrimaryBtn}
                            onPress={() =>
                                openUrl("https://fisei.uta.edu.ec/v4.0/index.php/facultad/historia-facultad")
                            }
                        >
                            <Text style={styles.contactPrimaryBtnText}>Contáctanos</Text>
                        </Pressable>
                        <Pressable style={styles.contactSecondaryBtn} onPress={callUniversity}>
                            <Text style={styles.contactSecondaryBtnText}>Llamar</Text>
                        </Pressable>
                    </View>
                </View>

                <View style={styles.footer}>
                    <View style={styles.footerBrandRow}>
                        <Image
                            source={{ uri: faculty?.logo || "https://imgur.com/fch1iy6.png" }}
                            style={styles.footerLogo}
                        />
                        <View>
                            <Text style={styles.footerBrandAcronymFixed}>{faculty?.acronym ?? "FISEI"}</Text>
                            <Text style={styles.footerBrandName}>{faculty?.title ?? "Facultad"}</Text>
                            <Text style={styles.footerBrandSub}>{footerUniversity.name}</Text>
                            <Text style={styles.footerBrandSubMuted}>{footerUniversity.address}</Text>
                        </View>
                    </View>

                    <View style={styles.footerDivider} />

                    <View style={styles.footerColumns}>
                        <View style={styles.footerColumn}>
                            <Text style={styles.footerColumnTitle}>Académico</Text>
                            <Text style={styles.footerLink} onPress={() => scrollToSection("inicio")}>Facultad</Text>
                        </View>
                        <View style={styles.footerColumn}>
                            <Text style={styles.footerColumnTitle}>Información</Text>
                            <Text style={styles.footerLink} onPress={() => scrollToSection("autoridades")}>Autoridades</Text>
                            <Text style={styles.footerLink} onPress={() => scrollToSection("carreras")}>Carreras</Text>
                            <Text style={styles.footerLink} onPress={() => scrollToSection("misionvision")}>Misión y Visión</Text>
                        </View>
                        <View style={styles.footerColumn}>
                            <Text style={styles.footerColumnTitle}>Auditoría</Text>
                            <Text
                                style={styles.footerLink}
                                onPress={() => openUrl("https://auditoria-academic-events.netlify.app/auditoria.html")}
                            >
                                Consulta
                            </Text>
                        </View>
                        <View style={styles.footerColumn}>
                            <Text style={styles.footerColumnTitle}>Contacto</Text>
                            <Text style={styles.footerContactText}>{footerUniversity.address}</Text>
                            <Text style={styles.footerContactText}>{footerUniversity.email}</Text>
                            <Text style={styles.footerContactText}>{footerUniversity.phone}</Text>
                        </View>
                    </View>

                    {socialLinks.length > 0 ? (
                        <View style={styles.socialRow}>
                            {socialLinks.map((item) => (
                                <Pressable
                                    key={item.id}
                                    style={styles.socialBtn}
                                    onPress={() => openUrl(item.url)}
                                >
                                    <Ionicons
                                        name={resolveSocialIcon(item.platformKey, item.iconKey) as never}
                                        size={18}
                                        color={theme.colors.textInverse}
                                    />
                                </Pressable>
                            ))}
                        </View>
                    ) : null}
                </View>
            </ScrollView>

            <Modal visible={!!selectedEvent} animationType="slide" transparent onRequestClose={() => setSelectedEvent(null)}>
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
                            {selectedEvent?.coverImageUrl ? (
                                <Image source={{ uri: toAbsoluteUrl(selectedEvent.coverImageUrl) }} style={styles.modalImage} resizeMode="cover" />
                            ) : null}
                            <View style={styles.modalBody}>
                                <Text style={styles.modalTitle}>{selectedEvent?.title}</Text>

                                <View style={styles.modalMetaRow}>
                                    <View style={styles.modalBadge}>
                                        <Text style={styles.modalBadgeText}>{selectedEvent?.status || "Activo"}</Text>
                                    </View>
                                    {selectedEvent?.modality ? (
                                        <View style={[styles.modalBadge, { backgroundColor: theme.colors.utaAccent }]}>
                                            <Text style={styles.modalBadgeText}>{selectedEvent.modality}</Text>
                                        </View>
                                    ) : null}
                                </View>

                                <View style={styles.modalSection}>
                                    <Text style={styles.modalSectionTitle}>Información del Evento</Text>
                                    <View style={styles.modalDetailRow}>
                                        <Ionicons name="calendar-outline" size={16} color={theme.colors.primary} />
                                        <Text style={styles.modalDetailText}>Fecha: {selectedEvent?.date ? formatEventDate(selectedEvent.date) : "Por definir"}</Text>
                                    </View>
                                    <View style={styles.modalDetailRow}>
                                        <Ionicons name="location-outline" size={16} color={theme.colors.primary} />
                                        <Text style={styles.modalDetailText}>Lugar: {selectedEvent?.location}</Text>
                                    </View>
                                    <View style={styles.modalDetailRow}>
                                        <Ionicons name="cash-outline" size={16} color={theme.colors.primary} />
                                        <Text style={styles.modalDetailText}>Costo: {selectedEvent?.price && selectedEvent.price > 0 ? `$${selectedEvent.price.toFixed(2)}` : "Gratuito"}</Text>
                                    </View>
                                </View>

                                {selectedEvent?.description ? (
                                    <View style={styles.modalSection}>
                                        <Text style={styles.modalSectionTitle}>Descripción del Evento</Text>
                                        <Text style={styles.modalDescription}>{selectedEvent.description}</Text>
                                    </View>
                                ) : (
                                    <View style={styles.modalSection}>
                                        <Text style={styles.modalSectionTitle}>Descripción del Evento</Text>
                                        <Text style={styles.modalDescription}>No hay descripción disponible.</Text>
                                    </View>
                                )}
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <Pressable style={styles.modalCancelBtn} onPress={() => setSelectedEvent(null)}>
                                <Text style={styles.modalCancelBtnText}>Cerrar</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.modalPrimaryBtn, isSelectedEventRegistered && { backgroundColor: theme.colors.textTertiary }]}
                                disabled={isSelectedEventRegistered}
                                onPress={() => {
                                    const event = selectedEvent;
                                    setSelectedEvent(null);
                                    if (event) {
                                        if (user) {
                                            router.push({
                                                pathname: "/(app)/event-registration",
                                                params: {
                                                    eventId: event.id,
                                                    title: event.title,
                                                    price: String(event.price ?? 0),
                                                },
                                            });
                                        } else {
                                            router.push("/(auth)/login");
                                        }
                                    }
                                }}
                            >
                                <Text style={styles.modalPrimaryBtnText}>{isSelectedEventRegistered ? "Ya estás inscrito" : "Inscribirme ahora"}</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
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
        paddingTop: 48,
        paddingBottom: 14,
        borderBottomColor: "rgba(255,255,255,0.18)",
        borderBottomWidth: 1,
    },
    navbarRow: {
        paddingHorizontal: theme.spacing.md,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 10,
    },
    brandWrap: {
        width: 54,
        height: 54,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.10)",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    brandGroup: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    brandLabel: {
        color: theme.colors.textInverse,
        fontWeight: "900",
        fontSize: 15,
        letterSpacing: 0.6,
    },
    brandLogo: {
        width: 46,
        height: 46,
    },
    brandLogoFallback: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: "rgba(255,255,255,0.18)",
    },
    navCtas: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    iconBtnHeader: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: "rgba(255,255,255,0.18)",
        alignItems: "center",
        justifyContent: "center",
    },
    navUserChip: {
        maxWidth: 190,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.15)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
    },
    navUserAvatar: { width: 26, height: 26, borderRadius: 13, backgroundColor: theme.colors.bgSecondary },
    navUserAvatarFallback: { width: 26, height: 26, borderRadius: 13, backgroundColor: theme.colors.bgSecondary },
    navUserName: { maxWidth: 140, color: theme.colors.textInverse, fontWeight: "900", fontSize: 12 },
    navCtaPrimary: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: theme.colors.utaPrimary,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.55)",
    },
    navCtaPrimaryText: {
        color: theme.colors.textInverse,
        fontWeight: "800",
        fontSize: 12,
    },
    navCtaSecondary: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.85)",
    },
    navCtaSecondaryText: {
        color: theme.colors.utaPrimary,
        fontWeight: "800",
        fontSize: 12,
    },
    navTabs: {
        paddingHorizontal: theme.spacing.md,
        gap: 8,
    },
    navTab: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.18)",
    },
    navTabGhost: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.10)",
    },
    navTabText: {
        fontSize: 13,
        color: theme.colors.textInverse,
        fontWeight: "700",
    },
    content: {
        width: "100%",
        maxWidth: 920,
        alignSelf: "center",
        paddingHorizontal: theme.spacing.md,
        paddingTop: 156,
        paddingBottom: theme.spacing.xl,
        gap: theme.spacing.lg,
    },
    heroCard: {
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.primary,
        ...theme.shadow.primary,
        gap: 10,
    },
    heroBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        alignSelf: "flex-start",
        backgroundColor: "rgba(255,255,255,0.18)",
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    footerContactText: {
        color: theme.colors.textSecondary,
        fontSize: 13,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalCard: {
        backgroundColor: theme.colors.bgPrimary,
        borderTopLeftRadius: theme.radius.xl,
        borderTopRightRadius: theme.radius.xl,
        maxHeight: "90%",
        paddingBottom: 20,
    },
    modalContent: {
        paddingBottom: 20,
    },
    modalImage: {
        width: "100%",
        height: 200,
        borderTopLeftRadius: theme.radius.xl,
        borderTopRightRadius: theme.radius.xl,
    },
    modalBody: {
        padding: theme.spacing.lg,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "900",
        color: theme.colors.textPrimary,
        marginBottom: 10,
    },
    modalMetaRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 16,
    },
    modalBadge: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
    },
    modalBadgeText: {
        color: theme.colors.textInverse,
        fontSize: 12,
        fontWeight: "700",
        textTransform: "uppercase",
    },
    modalSection: {
        marginTop: 16,
        padding: theme.spacing.md,
        backgroundColor: theme.colors.bgSecondary,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
    },
    modalSectionTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: theme.colors.textPrimary,
        marginBottom: 12,
    },
    modalDetailRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    modalDetailText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        fontWeight: "600",
    },
    modalDescription: {
        fontSize: 14,
        lineHeight: 22,
        color: theme.colors.textSecondary,
    },
    modalFooter: {
        flexDirection: "row",
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.sm,
        gap: 12,
    },
    modalCancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.bgSecondary,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
    },
    modalCancelBtnText: {
        color: theme.colors.textPrimary,
        fontWeight: "800",
        fontSize: 14,
    },
    modalPrimaryBtn: {
        flex: 2,
        paddingVertical: 14,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    modalPrimaryBtnText: {
        color: theme.colors.textInverse,
        fontWeight: "900",
        fontSize: 14,
    },
    heroBadgeText: {
        color: theme.colors.textInverse,
        fontSize: 11,
        fontWeight: "800",
    },
    heroTitle: {
        color: theme.colors.textInverse,
        fontSize: 24,
        lineHeight: 32,
        fontWeight: "800",
    },
    heroSubtitle: {
        color: "rgba(255,255,255,0.95)",
        fontSize: 14,
        fontWeight: "700",
    },
    heroDescription: {
        color: "rgba(255,255,255,0.96)",
        fontSize: 14,
        lineHeight: 22,
    },
    heroActions: {
        marginTop: 8,
        flexDirection: "row",
        gap: 10,
    },
    primaryAction: {
        flex: 1,
        minHeight: 48,
        borderRadius: theme.radius.md,
        backgroundColor: "rgba(255,255,255,0.22)",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
    },
    primaryActionText: {
        color: theme.colors.textInverse,
        fontSize: 13,
        fontWeight: "800",
        textAlign: "center",
    },
    secondaryAction: {
        flex: 1,
        minHeight: 48,
        borderRadius: theme.radius.md,
        backgroundColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
        paddingHorizontal: 10,
    },
    secondaryActionText: {
        color: theme.colors.primary,
        fontSize: 13,
        fontWeight: "800",
        textAlign: "center",
    },
    statsGrid: {
        marginTop: 8,
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    statCard: {
        width: "48.5%",
        borderRadius: theme.radius.md,
        padding: 12,
        backgroundColor: "rgba(255,255,255,0.15)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.22)",
    },
    statValue: {
        color: theme.colors.utaAccent,
        fontSize: 22,
        fontWeight: "900",
        letterSpacing: 0.2,
    },
    statLabel: {
        color: "rgba(255,255,255,0.92)",
        fontSize: 12,
        marginTop: 3,
        fontWeight: "600",
    },
    sectionHeader: {
        marginTop: 6,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: theme.colors.textPrimary,
    },
    sectionHeaderCentered: {
        marginTop: 8,
        alignItems: "center",
        gap: 4,
    },
    sectionTitleBrand: {
        fontSize: 22,
        fontWeight: "800",
        color: theme.colors.primary,
        textAlign: "center",
    },
    sectionSubtitle: {
        fontSize: 14,
        color: theme.colors.textPrimary,
        opacity: 0.8,
        textAlign: "center",
    },
    sectionSubtitleLong: {
        fontSize: 14,
        color: theme.colors.textPrimary,
        opacity: 0.82,
        textAlign: "center",
        lineHeight: 22,
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
    errorSubtitle: {
        fontSize: 12,
        color: "rgba(185, 28, 28, 0.85)",
        textAlign: "center",
        lineHeight: 18,
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
    featuredCarouselWrap: {
        gap: 10,
    },
    featuredSlide: {
        paddingVertical: 2,
    },
    featuredCard: {
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.bgPrimary,
        overflow: "hidden",
        ...theme.shadow.md,
    },
    featuredImageWrap: {
        height: 190,
        backgroundColor: theme.colors.primaryLight,
        position: "relative",
    },
    featuredImage: {
        width: "100%",
        height: "100%",
    },
    featuredImageFallback: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.primaryLight,
    },
    featuredImageOverlay: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 90,
    },
    featuredBadge: {
        position: "absolute",
        top: 12,
        left: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "rgba(26,31,46,0.78)",
        borderRadius: theme.radius.full,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    featuredBadgeText: {
        color: theme.colors.textInverse,
        fontSize: 11,
        fontWeight: "800",
    },
    featuredBody: {
        padding: theme.spacing.md,
        gap: 8,
    },
    featuredMetaRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    featuredMetaPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.primaryLight,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    featuredMetaText: {
        color: theme.colors.primary,
        fontSize: 11,
        fontWeight: "700",
    },
    eventCard: {
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.bgPrimary,
        flexDirection: "row",
        overflow: "hidden",
        ...theme.shadow.sm,
    },
    eventCardAccent: {
        width: 4,
        backgroundColor: theme.colors.primary,
    },
    eventCardInner: {
        flex: 1,
        padding: theme.spacing.md,
        gap: 6,
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
        fontWeight: "800",
        color: theme.colors.textPrimary,
        lineHeight: 21,
    },
    datePill: {
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.primaryLight,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: "rgba(138,21,56,0.15)",
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
        fontWeight: "600",
    },
    eventDescription: {
        fontSize: 13,
        lineHeight: 20,
        color: theme.colors.textSecondary,
    },
    featuredDetailBtn: {
        marginTop: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        backgroundColor: theme.colors.primary,
        paddingVertical: 10,
        borderRadius: theme.radius.md,
    },
    featuredDetailBtnText: {
        color: theme.colors.textInverse,
        fontWeight: "800",
        fontSize: 13,
    },
    authorityCarouselWrap: {
        gap: 10,
    },
    authoritySlide: {
        paddingVertical: 2,
    },
    authorityCardWide: {
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
    authorityAvatarLarge: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: theme.colors.primaryLight,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    authorityAvatarImageLarge: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    authorityBodyWide: {
        flex: 1,
        gap: 2,
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
        marginTop: 2,
    },
    authorityEmail: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    authorityContactBtnWide: {
        alignSelf: "flex-start",
        marginTop: 8,
        borderRadius: theme.radius.sm,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: theme.colors.primary,
    },
    authorityContactTextWide: {
        color: theme.colors.textInverse,
        fontSize: 12,
        fontWeight: "800",
    },
    carouselDots: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 6,
    },
    carouselDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: "rgba(138, 21, 56, 0.22)",
    },
    carouselDotActive: {
        width: 18,
        backgroundColor: theme.colors.primary,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    gridCard: {
        width: "48.5%",
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.bgPrimary,
        borderWidth: 0,
        padding: theme.spacing.md,
        ...theme.shadow.sm,
    },
    gridIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.primaryLight,
    },
    gridTitle: {
        marginTop: 10,
        fontSize: 14,
        fontWeight: "800",
        color: theme.colors.textPrimary,
        lineHeight: 20,
    },
    gridText: {
        marginTop: 4,
        fontSize: 12,
        lineHeight: 18,
        color: theme.colors.textSecondary,
    },
    badgesRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 4,
        marginTop: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.primaryLight,
        color: theme.colors.primary,
        fontSize: 11,
        fontWeight: "700",
    },
    identityCard: {
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.bgPrimary,
        padding: theme.spacing.md,
        ...theme.shadow.sm,
    },
    identityIconWrap: {
        width: 38,
        height: 38,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.primaryLight,
    },
    identityTitle: {
        marginTop: 10,
        fontSize: 17,
        fontWeight: "800",
        color: theme.colors.textPrimary,
    },
    identityText: {
        marginTop: 8,
        fontSize: 14,
        lineHeight: 22,
        color: theme.colors.textSecondary,
    },
    contactCard: {
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.bgPrimary,
        padding: theme.spacing.md,
        gap: 12,
        ...theme.shadow.sm,
    },
    contactActions: {
        flexDirection: "row",
        gap: 10,
    },
    contactPrimaryBtn: {
        flex: 1,
        minHeight: 48,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.primary,
        alignItems: "center",
        justifyContent: "center",
        ...theme.shadow.primary,
    },
    contactPrimaryBtnText: {
        color: theme.colors.textInverse,
        fontWeight: "800",
        fontSize: 13,
    },
    contactSecondaryBtn: {
        flex: 1,
        minHeight: 48,
        borderRadius: theme.radius.md,
        borderWidth: 1.5,
        borderColor: theme.colors.primary,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.primaryLighter,
    },
    contactSecondaryBtnText: {
        color: theme.colors.primary,
        fontWeight: "800",
        fontSize: 13,
    },
    footer: {
        marginTop: 10,
        backgroundColor: "#111827",
        borderRadius: theme.radius.md,
        padding: theme.spacing.lg,
        gap: 14,
    },
    footerBrandRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
    },
    footerLogo: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: "rgba(255,255,255,0.08)",
    },
    footerBrandName: {
        fontSize: 17,
        color: "#ffffff",
        fontWeight: "800",
        marginTop: 1,
    },
    footerBrandAcronymFixed: {
        fontSize: 12,
        color: "rgba(255,255,255,0.86)",
        fontWeight: "800",
        letterSpacing: 1.2,
        textTransform: "uppercase",
    },
    footerBrandSub: {
        fontSize: 13,
        color: "rgba(255,255,255,0.88)",
        marginTop: 1,
    },
    footerBrandSubMuted: {
        fontSize: 13,
        color: "rgba(255,255,255,0.76)",
        marginTop: 1,
    },
    footerDivider: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.14)",
    },
    footerColumns: {
        flexDirection: "column",
        gap: 12,
    },
    footerColumn: {
        width: "100%",
        gap: 4,
    },
    footerColumnTitle: {
        color: "#ffffff",
        fontSize: 13,
        fontWeight: "800",
        marginBottom: 2,
    },
    footerLink: {
        color: "rgba(255,255,255,0.9)",
        fontSize: 13,
        fontWeight: "600",
    },
    footerContactText: {
        color: "rgba(255,255,255,0.82)",
        fontSize: 13,
        lineHeight: 19,
    },
    socialRow: {
        flexDirection: "row",
        gap: 8,
        justifyContent: "flex-start",
        marginTop: 4,
    },
    socialBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.16)",
    },
});

