import { apiClient } from "./client";
import type { PublicEvent } from "./publicEvents";

type FeaturedEventsEnvelope = {
    eventosDestacados?: Array<Record<string, unknown>>;
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

export async function fetchFeaturedEvents(): Promise<PublicEvent[]> {
    // Backend soporta ambos paths: /events/featured y /events-featured
    const candidates = ["/api/events/featured", "/api/events-featured", "/api/eventos-destacados"];
    let lastError: unknown = null;

    for (const path of candidates) {
        try {
            const response = await apiClient.get<FeaturedEventsEnvelope | Array<Record<string, unknown>>>(path);
            const payload = Array.isArray(response.data)
                ? response.data
                : response.data?.eventosDestacados ?? [];

            if (Array.isArray(payload)) {
                const direct = payload
                    .map((item) => normalizeFeatured(item))
                    .filter((event) => typeof event.id === "string" && event.id.length > 0);

                if (direct.length > 0) return direct;

                // Fallback: pedir todos los eventos y filtrar destacados
                const allResponse = await apiClient.get<Record<string, unknown> | Array<Record<string, unknown>>>(
                    "/api/events"
                );
                const allData = allResponse.data;
                const allEvents = Array.isArray(allData)
                    ? allData
                    : Array.isArray((allData as Record<string, unknown>)?.eventos)
                        ? (((allData as Record<string, unknown>).eventos as unknown) as Array<Record<string, unknown>>)
                        : Array.isArray((allData as Record<string, unknown>)?.data)
                            ? (((allData as Record<string, unknown>).data as unknown) as Array<Record<string, unknown>>)
                            : [];

                const featured = allEvents
                    .filter((evt) => Boolean((evt as Record<string, unknown>)?.isFeatured ?? (evt as Record<string, unknown>)?.eve_des))
                    .sort((a, b) => {
                        const aDate = new Date(
                            pickString(a.startDate, a.fec_ini_eve, "0")
                        ).getTime();
                        const bDate = new Date(
                            pickString(b.startDate, b.fec_ini_eve, "0")
                        ).getTime();
                        return aDate - bDate;
                    })
                    .slice(0, 8)
                    .map((item) => normalizeFeatured(item))
                    .filter((event) => typeof event.id === "string" && event.id.length > 0);

                return featured;
            }
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError instanceof Error
        ? lastError
        : new Error("No se pudo cargar eventos destacados (sin conexión al backend)");
}
