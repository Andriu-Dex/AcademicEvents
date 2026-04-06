import { useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
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
import { apiClient, getCurrentApiBaseUrl, getLastApiProbeLog, toAbsoluteUrl } from "../src/api/client";
import { useFeaturedEvents } from "../src/features/events/useFeaturedEvents";
import { useAuthStore } from "../src/store/authStore";
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
        name: pickString(item.nombre, item.name, item.nombres, item.fullName, "Autoridad"),
        role: pickString(item.cargo, item.role, item.rol, item.puesto, "Cargo"),
        email: pickString(item.email, item.correo, item.mail, ""),
        image: pickString(item.imagen, item.image, item.foto, item.avatar, ""),
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
    const user = useAuthStore((s) => s.user);
    const scrollRef = useRef<ScrollView | null>(null);
    const [authorityIndex, setAuthorityIndex] = useState(0);
    const authorityScrollX = useRef(new Animated.Value(0)).current;
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

    return (
        <LinearGradient colors={["#f8eff2", "#ffffff"]} style={styles.container}>
            <View style={styles.topNavbar}>
                <View style={styles.navbarRow}>
                    <Pressable style={styles.brandWrap} onPress={() => scrollToSection("inicio")}>
                        {faculty?.logo ? (
                            <Image
                                source={{ uri: toAbsoluteUrl(faculty.logo) }}
                                style={styles.brandLogo}
                                resizeMode="contain"
                            />
                        ) : (
                            <View style={styles.brandLogoFallback} />
                        )}
                    </Pressable>

                    {showAuthCtas ? (
                        <View style={styles.navCtas}>
                            <Pressable style={styles.navCtaPrimary} onPress={() => router.push("/(auth)/login")}>
                                <Text style={styles.navCtaPrimaryText}>Iniciar sesión</Text>
                            </Pressable>
                            <Pressable style={styles.navCtaSecondary} onPress={() => router.push("/(auth)/register")}>
                                <Text style={styles.navCtaSecondaryText}>Registrarse</Text>
                            </Pressable>
                        </View>
                    ) : user ? (
                        <Pressable style={styles.navUserChip} onPress={() => router.push("/profile")}>
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
                    ) : null}
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navTabs}>
                    <Pressable style={styles.navTab} onPress={() => scrollToSection("inicio")}>
                        <Text style={styles.navTabText}>Inicio</Text>
                    </Pressable>
                    <Pressable style={styles.navTab} onPress={() => router.push(eventsRoute)}>
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
            </View>

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
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Eventos Destacados</Text>
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
                        <Ionicons name="calendar-clear-outline" size={26} color={theme.colors.textTertiary} />
                        <Text style={styles.emptyText}>Aún no hay eventos destacados disponibles.</Text>
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
                                <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
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
                            <Text style={styles.footerBrandName}>{faculty?.acronym ?? "FISEI"}</Text>
                            <Text style={styles.footerBrandSub}>{faculty?.title ?? "Facultad"}</Text>
                            <Text style={styles.footerBrandSubMuted}>{footerUniversity.name}</Text>
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
        paddingBottom: 12,
        backgroundColor: "rgba(138, 21, 56, 0.96)",
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
    navUserChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 12,
        height: 42,
        borderRadius: 999,
        backgroundColor: theme.colors.primary,
        ...theme.shadow.sm,
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
        fontSize: 12,
        color: theme.colors.textInverse,
        fontWeight: "700",
    },
    content: {
        paddingHorizontal: theme.spacing.md,
        paddingTop: 156,
        paddingBottom: theme.spacing.xl,
        gap: theme.spacing.md,
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
    heroBadgeText: {
        color: theme.colors.textInverse,
        fontSize: 11,
        fontWeight: "800",
    },
    heroTitle: {
        color: theme.colors.textInverse,
        fontSize: 23,
        lineHeight: 30,
        fontWeight: "800",
    },
    heroSubtitle: {
        color: "rgba(255,255,255,0.95)",
        fontSize: 14,
        fontWeight: "700",
    },
    heroDescription: {
        color: "rgba(255,255,255,0.90)",
        fontSize: 13,
        lineHeight: 20,
    },
    heroActions: {
        marginTop: 6,
        flexDirection: "row",
        gap: 10,
    },
    primaryAction: {
        flex: 1,
        minHeight: 44,
        borderRadius: theme.radius.sm,
        backgroundColor: "rgba(255,255,255,0.2)",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
        paddingHorizontal: 8,
    },
    primaryActionText: {
        color: theme.colors.textInverse,
        fontSize: 12,
        fontWeight: "700",
        textAlign: "center",
    },
    secondaryAction: {
        flex: 1,
        minHeight: 44,
        borderRadius: theme.radius.sm,
        backgroundColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
        paddingHorizontal: 8,
    },
    secondaryActionText: {
        color: theme.colors.primary,
        fontSize: 12,
        fontWeight: "700",
        textAlign: "center",
    },
    statsGrid: {
        marginTop: 4,
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    statCard: {
        width: "48.5%",
        borderRadius: theme.radius.sm,
        padding: 10,
        backgroundColor: "rgba(255,255,255,0.14)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
    },
    statValue: {
        color: theme.colors.utaAccent,
        fontSize: 18,
        fontWeight: "800",
    },
    statLabel: {
        color: theme.colors.textInverse,
        fontSize: 11,
        marginTop: 2,
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
        fontSize: 13,
        color: theme.colors.textSecondary,
        textAlign: "center",
    },
    sectionSubtitleLong: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        textAlign: "center",
        lineHeight: 20,
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
    contactActions: {
        flexDirection: "row",
        gap: 8,
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
        marginTop: 10,
        backgroundColor: "#000000",
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
    footerBrandSub: {
        fontSize: 12,
        color: "rgba(255,255,255,0.82)",
        marginTop: 1,
    },
    footerBrandSubMuted: {
        fontSize: 12,
        color: "rgba(255,255,255,0.62)",
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
        color: "rgba(255,255,255,0.82)",
        fontSize: 12,
        fontWeight: "600",
    },
    footerContactText: {
        color: "rgba(255,255,255,0.70)",
        fontSize: 12,
        lineHeight: 18,
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
