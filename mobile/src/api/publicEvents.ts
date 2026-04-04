import { apiClient } from "./client";

type PublicEventApiItem = {
    id_eve?: string | number;
    id?: string | number;
    nom_eve?: string;
    nombre?: string;
    name?: string;
    fec_ini_eve?: string;
    fecha_inicio?: string;
    startDate?: string;
    endDate?: string;
    lug_eve?: string;
    lugar?: string;
    location?: string;
    des_eve?: string;
    descripcion?: string;
    description?: string;
    est_eve?: string;
    status?: string;
    isFeatured?: boolean;
    eve_des?: boolean;
};

type PublicEventsEnvelope = {
    success?: boolean;
    data?: PublicEventApiItem[];
};

export type PublicEvent = {
    id: string;
    title: string;
    date: string;
    location: string;
    description: string;
    status: string;
};

function normalizeEvent(item: PublicEventApiItem): PublicEvent {
    return {
        id: String(item.id_eve ?? item.id ?? ""),
        title: item.nom_eve ?? item.nombre ?? item.name ?? "Evento sin nombre",
        date: item.fec_ini_eve ?? item.fecha_inicio ?? item.startDate ?? "",
        location: item.lug_eve ?? item.lugar ?? item.location ?? "Lugar por confirmar",
        description: item.des_eve ?? item.descripcion ?? item.description ?? "",
        status: item.est_eve ?? item.status ?? "",
    };
}

export async function fetchPublicEvents(): Promise<PublicEvent[]> {
    const candidates = ["/api/public-events", "/api/eventos-publicos", "/api/eventos"];
    let lastError: unknown = null;

    for (const path of candidates) {
        try {
            const response = await apiClient.get<PublicEventsEnvelope | PublicEventApiItem[]>(path);
            const payload = Array.isArray(response.data)
                ? response.data
                : response.data?.data ?? [];

            if (Array.isArray(payload)) {
                return payload.map(normalizeEvent).filter((event) => event.id.length > 0);
            }
        } catch (error) {
            lastError = error;
            // Try next endpoint.
        }
    }

    throw lastError instanceof Error
        ? lastError
        : new Error("No se pudo cargar eventos públicos (sin conexión al backend)");
}
