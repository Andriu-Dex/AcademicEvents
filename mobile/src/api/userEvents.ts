import { apiClient } from "./client";
import type { PaginatedResponse, PublicEventExtended } from "./publicEvents";

export type UserEventsFilters = {
    search?: string;
    gratuito?: boolean;
    pagado?: boolean;
    completo?: boolean;
    finalizado?: boolean;
    cancelado?: boolean;
    suspendido?: boolean;
    modalidad?: string;
    carrera?: string;
};

function toFiniteNumber(value: unknown): number {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
}

function pickString(obj: Record<string, unknown>, ...keys: string[]): string {
    for (const key of keys) {
        const value = obj[key];
        if (typeof value === "string") return value;
        if (typeof value === "number" && Number.isFinite(value)) return String(value);
    }
    return "";
}

function normalizeEvent(item: Record<string, unknown>): PublicEventExtended {
    const eventCareers = Array.isArray(item.eventCareers) ? (item.eventCareers as Array<Record<string, unknown>>) : [];

    const careerIds: string[] = [];
    const careers: string[] = [];
    for (const ec of eventCareers) {
        const careerId = ec.careerId;
        if (typeof careerId === "string" && careerId.length > 0) careerIds.push(careerId);

        const career = ec.career;
        if (career && typeof career === "object") {
            const careerRec = career as Record<string, unknown>;
            const embeddedId = careerRec.id;
            if (typeof embeddedId === "string" && embeddedId.length > 0) careerIds.push(embeddedId);
            const name = careerRec.name;
            if (typeof name === "string" && name.length > 0) careers.push(name);
        }
    }

    return {
        id: pickString(item, "id", "id_eve"),
        title: pickString(item, "name", "nom_eve", "nombre") || "Evento sin nombre",
        description: pickString(item, "description", "des_eve", "descripcion") || "",
        location: pickString(item, "location", "lug_eve", "lugar") || "Lugar por confirmar",
        coverImageUrl: pickString(item, "coverImageUrl", "img_por_eve", "imageUrl") || "",
        type: pickString(item, "type", "tip_eve") || "",
        startDate: pickString(item, "startDate", "fec_ini_eve") || "",
        endDate: pickString(item, "endDate", "fec_fin_eve") || "",
        durationHours: toFiniteNumber(item.durationHours ?? item.dur_hor_eve ?? item.duration),
        status: pickString(item, "status", "est_eve") || "",
        modality: pickString(item, "modality", "modalidad") || "",
        price: toFiniteNumber(item.price ?? item.val_eve),
        maxCapacity: typeof item.maxCapacity === "number" ? item.maxCapacity : null,
        availableSpots: typeof item.availableSpots === "number" ? item.availableSpots : null,
        careers,
        careerIds: Array.from(new Set(careerIds)),
    };
}

export async function fetchUserEventsPaginated(
    page: number,
    limit: number,
    filters: UserEventsFilters
): Promise<PaginatedResponse<PublicEventExtended>> {
    const params: Record<string, string | number> = { page, limit };

    const search = filters.search?.trim();
    if (search) params.search = search;

    if (filters.gratuito && !filters.pagado) params.gratuito = "true";
    if (filters.pagado && !filters.gratuito) params.pagado = "true";

    if (filters.completo) params.completo = "true";
    if (filters.finalizado) params.finalizado = "true";
    if (filters.cancelado) params.cancelado = "true";
    if (filters.suspendido) params.suspendido = "true";

    if (filters.modalidad && filters.modalidad.trim()) params.modalidad = filters.modalidad.trim();
    if (filters.carrera && filters.carrera.trim()) params.carrera = filters.carrera.trim();

    const response = await apiClient.get<unknown>("/api/events-paginated", { params });
    const payload = response.data as Record<string, unknown>;

    if (!payload || typeof payload !== "object" || !Array.isArray(payload.data) || !payload.pagination) {
        throw new Error("Respuesta inválida de eventos paginados");
    }

    const rawItems = payload.data as Array<Record<string, unknown>>;
    const pagination = payload.pagination as Record<string, unknown>;

    return {
        data: rawItems.map(normalizeEvent).filter((e) => e.id.length > 0),
        pagination: {
            currentPage: Number(pagination.currentPage ?? page) || page,
            totalPages: Number(pagination.totalPages ?? 1) || 1,
            totalItems: Number(pagination.totalItems ?? rawItems.length) || rawItems.length,
            itemsPerPage: Number(pagination.itemsPerPage ?? limit) || limit,
            hasNextPage: Boolean(pagination.hasNextPage),
            hasPrevPage: Boolean(pagination.hasPrevPage),
        },
    };
}
