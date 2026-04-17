import { apiClient } from "./client";
import type { PublicEvent } from "./publicEvents";

type FeaturedEventsEnvelope = {
    eventosDestacados?: Array<Record<string, unknown>>;
    data?: Array<Record<string, unknown>>;
    eventos?: Array<Record<string, unknown>>;
    total?: number;
    ok?: boolean;
};

function pickString(...values: unknown[]) {
    for (const value of values) {
        if (typeof value === "string") return value;
        if (typeof value === "number") return String(value);
    }
    return "";
}

function toBoolean(value: unknown): boolean {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value > 0;
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (!normalized) return false;
        if (["true", "1", "si", "sí", "yes", "s", "y"].includes(normalized)) return true;
        if (["false", "0", "no"].includes(normalized)) return false;
    }
    return false;
}

function normalizeFeatured(item: Record<string, unknown>): PublicEvent {
    return {
        id: pickString(item.id_eve, item.id),
        title: pickString(item.nom_eve, item.nombre, item.name, "Evento sin nombre"),
        date: pickString(item.fec_ini_eve, item.fecha_inicio, item.startDate, ""),
        location: pickString(item.lug_eve, item.lugar, item.location, "Lugar por confirmar"),
        description: pickString(item.des_eve, item.descripcion, item.description, ""),
        status: pickString(item.est_eve, item.status, ""),
    };
}

function isEventFeatured(item: Record<string, unknown>) {
    return toBoolean(
        item.isFeatured ??
            item.eve_des ??
            item.featured ??
            item.destacado ??
            item.esDestacado ??
            item.es_destacado
    );
}

export async function fetchFeaturedEvents(): Promise<PublicEvent[]> {
    // Backend soporta ambos paths: /events/featured y /events-featured
    const candidates = ["/api/events/featured", "/api/events-featured", "/api/eventos-destacados"];
    const allEventsCandidates = ["/api/events", "/api/eventos"];
    let lastError: unknown = null;

    for (const path of candidates) {
        try {
            const response = await apiClient.get<FeaturedEventsEnvelope | Array<Record<string, unknown>>>(path);
            const payload = Array.isArray(response.data)
                ? response.data
                : response.data?.eventosDestacados ?? response.data?.data ?? response.data?.eventos ?? [];

            if (!Array.isArray(payload)) continue;
            const direct = payload
                .map((item) => normalizeFeatured(item))
                .filter((event) => typeof event.id === "string" && event.id.length > 0);
            if (direct.length > 0) return direct;
        } catch (error) {
            lastError = error;
        }
    }

    // Fallback principal: obtener todos los eventos desde base y filtrar destacados.
    for (const allPath of allEventsCandidates) {
        try {
            const allResponse = await apiClient.get<Record<string, unknown> | Array<Record<string, unknown>>>(allPath);
            const allData = allResponse.data;
            const allEvents = Array.isArray(allData)
                ? allData
                : Array.isArray((allData as Record<string, unknown>)?.eventos)
                    ? (((allData as Record<string, unknown>).eventos as unknown) as Array<Record<string, unknown>>)
                    : Array.isArray((allData as Record<string, unknown>)?.data)
                        ? (((allData as Record<string, unknown>).data as unknown) as Array<Record<string, unknown>>)
                        : [];

            const featured = allEvents
                .filter((evt) => isEventFeatured(evt as Record<string, unknown>))
                .sort((a, b) => {
                    const aDate = new Date(pickString(a.startDate, a.fec_ini_eve, "0")).getTime();
                    const bDate = new Date(pickString(b.startDate, b.fec_ini_eve, "0")).getTime();
                    return aDate - bDate;
                })
                .slice(0, 8)
                .map((item) => normalizeFeatured(item))
                .filter((event) => typeof event.id === "string" && event.id.length > 0);

            if (featured.length > 0) {
                return featured;
            }
        } catch (fallbackError) {
            lastError = fallbackError;
        }
    }

    // No rompemos la pantalla de inicio por fallo de backend en destacados.
    if (__DEV__ && lastError) {
        console.warn("[featured-events] fallback exhausted:", lastError);
    }
    return [];
}
