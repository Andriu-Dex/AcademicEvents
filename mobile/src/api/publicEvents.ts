import { apiClient } from "./client";

type PublicEventApiItem = {
    id_eve?: string | number;
    id?: string | number;
    nom_eve?: string;
    nombre?: string;
    fec_ini_eve?: string;
    fecha_inicio?: string;
    lug_eve?: string;
    lugar?: string;
    des_eve?: string;
    descripcion?: string;
    est_eve?: string;
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
        title: item.nom_eve ?? item.nombre ?? "Evento sin nombre",
        date: item.fec_ini_eve ?? item.fecha_inicio ?? "",
        location: item.lug_eve ?? item.lugar ?? "Lugar por confirmar",
        description: item.des_eve ?? item.descripcion ?? "",
        status: item.est_eve ?? "",
    };
}

export async function fetchPublicEvents(): Promise<PublicEvent[]> {
    const candidates = ["/api/public-events", "/api/eventos-publicos", "/api/eventos"];

    for (const path of candidates) {
        try {
            const response = await apiClient.get<PublicEventsEnvelope | PublicEventApiItem[]>(path);
            const payload = Array.isArray(response.data)
                ? response.data
                : response.data?.data ?? [];

            if (Array.isArray(payload)) {
                return payload.map(normalizeEvent).filter((event) => event.id.length > 0);
            }
        } catch {
            // Try next endpoint.
        }
    }

    return [];
}
