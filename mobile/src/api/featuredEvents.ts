import { apiClient } from "./client";
import type { PublicEvent } from "./publicEvents";

type FeaturedEventsEnvelope = {
    eventosDestacados?: Array<Record<string, unknown>>;
    data?: Array<Record<string, unknown>> | Record<string, unknown>;
    eventos?: Array<Record<string, unknown>>;
    results?: Array<Record<string, unknown>>;
    rows?: Array<Record<string, unknown>>;
    total?: number;
    ok?: boolean;
};

function pickString(...values: unknown[]) {
    for (const value of values) {
        if (typeof value === "string") return value;
        if (typeof value === "number" && Number.isFinite(value)) return String(value);
    }
    return "";
}

function translateModality(value: string) {
    const normalized = value.trim().toLowerCase();
    const compact = normalized.replaceAll(" ", "").replaceAll("_", "").replaceAll("-", "");

    if (compact === "virtual" || compact === "online" || compact === "elearning") return "Virtual";
    if (compact === "inperson" || compact === "presential" || compact === "presencial") return "Presencial";
    if (compact === "hybrid" || compact === "semipresencial" || compact === "mixta" || compact === "hibrida") {
        return "Semipresencial";
    }
    if (compact === "distance" || compact === "distancia") return "Distancia";
    return value.trim();
}

function translateStatus(value: string) {
    const normalized = value.trim().toUpperCase();
    const map: Record<string, string> = {
        ACTIVE: "Activo",
        ACTIVO: "Activo",
        INACTIVE: "Inactivo",
        INACTIVO: "Inactivo",
        FINISHED: "Finalizado",
        FINALIZADO: "Finalizado",
        CANCELLED: "Cancelado",
        CANCELADO: "Cancelado",
        SUSPENDED: "Suspendido",
        SUSPENDIDO: "Suspendido",
    };

    return map[normalized] ?? value.trim();
}

function toBoolean(value: unknown): boolean {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value > 0;
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        return normalized === "true" || normalized === "1" || normalized === "si" || normalized === "sí";
    }
    return false;
}

function toTimestamp(item: Record<string, unknown>) {
    const raw = pickString(item.startDate, item.fec_ini_eve, item.fecha_inicio, item.createdAt, item.fec_cre_eve);
    const timestamp = new Date(raw).getTime();
    return Number.isFinite(timestamp) ? timestamp : 0;
}

function normalizeFeatured(item: Record<string, unknown>): PublicEvent {
    const modality = translateModality(pickString(item.modality, item.modalidad, item.mod_eve));
    const status = translateStatus(pickString(item.est_eve, item.status, ""));

    return {
        id: pickString(item.id_eve, item.id),
        title: pickString(item.nom_eve, item.nombre, item.name, "Evento sin nombre"),
        date: pickString(item.fec_ini_eve, item.fecha_inicio, item.startDate, ""),
        location: pickString(item.lug_eve, item.lugar, item.location, "Lugar por confirmar"),
        description: pickString(item.des_eve, item.descripcion, item.description, ""),
        status,
        coverImageUrl: pickString(item.coverImageUrl, item.cover_image_url, item.img_por_eve, item.imageUrl, item.image),
        modality,
        price: Number(pickString(item.price, item.val_eve) || "0") || 0,
    };
}

function isFeaturedEvent(item: Record<string, unknown>) {
    return toBoolean(item.isFeatured ?? item.eve_des);
}

function extractEventsFromEnvelope(
    data: FeaturedEventsEnvelope | Array<Record<string, unknown>> | Record<string, unknown> | null | undefined
) {
    if (Array.isArray(data)) return data;
    if (!data || typeof data !== "object") return [];
    if (Array.isArray(data?.eventosDestacados)) return data.eventosDestacados;
    if (Array.isArray(data?.eventos)) return data.eventos;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.rows)) return data.rows;
    if (data.data && typeof data.data === "object") {
        return extractEventsFromEnvelope(data.data as Record<string, unknown>);
    }
    return [];
}

function normalizeAndLimit(items: Array<Record<string, unknown>>) {
    const normalized = [...items]
        .sort((a, b) => toTimestamp(b) - toTimestamp(a))
        .map((item) => normalizeFeatured(item))
        .filter((event) => event.id.length > 0);

    const deduped = normalized.filter((event, index, array) => {
        return (
            array.findIndex((candidate) => {
                if (candidate.id.length > 0 && candidate.id === event.id) return true;
                return (
                    candidate.title === event.title &&
                    candidate.date === event.date &&
                    candidate.location === event.location
                );
            }) === index
        );
    });

    return deduped.slice(0, 4);
}

export async function fetchFeaturedEvents(): Promise<PublicEvent[]> {
    const featuredCandidates = ["/api/events/featured", "/api/eventos-destacados", "/api/events-featured"];
    const successfulEventPayloads: Array<Record<string, unknown>> = [];
    let lastError: unknown = null;

    for (const path of featuredCandidates) {
        try {
            const response = await apiClient.get<FeaturedEventsEnvelope | Array<Record<string, unknown>>>(path);
            const direct = extractEventsFromEnvelope(response.data);
            if (direct.length > 0) {
                return normalizeAndLimit(direct);
            }
        } catch (error) {
            lastError = error;
        }
    }

    const allCandidates = ["/api/public-events", "/api/eventos-publicos", "/api/events", "/api/eventos"];

    for (const path of allCandidates) {
        try {
            const response = await apiClient.get<FeaturedEventsEnvelope | Array<Record<string, unknown>>>(path);
            const allEvents = extractEventsFromEnvelope(response.data);
            if (allEvents.length > 0) {
                successfulEventPayloads.push(...allEvents);
            }
            const featured = allEvents.filter((item) => isFeaturedEvent(item));
            if (featured.length > 0) {
                return normalizeAndLimit(featured);
            }
        } catch (error) {
            lastError = error;
        }
    }

    const fallbackNearestEvents = successfulEventPayloads.filter((item) => {
        const status = pickString(item.est_eve, item.status).trim().toUpperCase();
        return status.length === 0 || status === "ACTIVE" || status === "ACTIVO";
    });

    if (fallbackNearestEvents.length > 0) {
        return normalizeAndLimit(fallbackNearestEvents);
    }

    if (__DEV__ && lastError) {
        console.warn("[featured-events] no se pudieron cargar:", lastError);
    }

    return [];
}
