import { apiClient } from "./client";

export type PaginationMeta = {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
};

export type PaginatedResponse<T> = {
    data: T[];
    pagination: PaginationMeta;
};

export type AdminReportEventSummary = {
    id: string;
    name: string;
    coverImageUrl: string;
};

function pickString(obj: Record<string, unknown>, ...keys: string[]): string {
    for (const key of keys) {
        const value = obj[key];
        if (typeof value === "string") return value;
        if (typeof value === "number" && Number.isFinite(value)) return String(value);
    }
    return "";
}

function normalizeEventSummary(raw: Record<string, unknown>, index = 0): AdminReportEventSummary {
    return {
        id: pickString(raw, "id", "id_eve") || `evento-${index}`,
        name: pickString(raw, "name", "nom_eve") || `Evento ${index + 1}`,
        coverImageUrl:
            pickString(raw, "coverImageUrl", "img_por_eve", "coverImage") ||
            "https://via.placeholder.com/320x90?text=Sin+Imagen",
    };
}

export async function fetchReportEventsPaginated(
    page: number,
    limit: number
): Promise<PaginatedResponse<AdminReportEventSummary>> {
    const response = await apiClient.get<unknown>("/api/admin/reports/events-paginated", {
        params: { page, limit },
    });

    const payload = response.data as Record<string, unknown>;
    if (!payload || typeof payload !== "object" || !Array.isArray(payload.data) || !payload.pagination) {
        throw new Error("Respuesta inválida de eventos de reportes");
    }

    const rawItems = payload.data as Array<Record<string, unknown>>;
    const pagination = payload.pagination as Record<string, unknown>;

    return {
        data: rawItems.map(normalizeEventSummary),
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

export async function fetchEventReportById(eventId: string): Promise<unknown> {
    const response = await apiClient.get<unknown>(`/api/admin/reports/event/${eventId}`);
    return response.data;
}
