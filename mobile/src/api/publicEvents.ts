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

export type PublicEventExtended = {
    id: string;
    title: string;
    description: string;
    location: string;
    startDate: string;
    endDate: string;
    status: string;
    modality: string;
    price: number;
    maxCapacity: number | null;
    availableSpots: number | null;
    careers: string[];
};

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

export type PublicEventsFilters = {
    search?: string;
    software?: boolean;
    industrial?: boolean;
    publico?: boolean;
    gratuito?: boolean;
    pagado?: boolean;
    modalidad?: string;
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

function normalizeEventExtended(item: Record<string, unknown>): PublicEventExtended {
    const id = pickStringOrNumber(item, "id", "id_eve");
    const title = pickStringOrNumber(item, "name", "nom_eve", "nombre") || "Evento sin nombre";
    const startDate = pickStringOrNumber(item, "startDate", "fec_ini_eve", "fecha_inicio") || "";
    const endDate = pickStringOrNumber(item, "endDate") || "";
    const location = pickStringOrNumber(item, "location", "lug_eve", "lugar") || "Lugar por confirmar";
    const description = pickStringOrNumber(item, "description", "des_eve", "descripcion") || "";
    const status = pickStringOrNumber(item, "status", "est_eve") || "";
    const modality = pickStringOrNumber(item, "modality", "modalidad") || "";

    const price = toFiniteNumberOrNull(item.price ?? item.val_eve) ?? 0;
    const maxCapacity = toFiniteNumberOrNull(item.maxCapacity ?? item.cup_max_eve);
    const availableSpots = toFiniteNumberOrNull(item.availableSpots ?? item.cup_dis_eve);

    const careers: string[] = [];
    if (Array.isArray(item.eventCareers)) {
        for (const ec of item.eventCareers) {
            if (!ec || typeof ec !== "object") continue;
            const career = (ec as Record<string, unknown>).career;
            if (!career || typeof career !== "object") continue;
            const name = (career as Record<string, unknown>).name;
            if (typeof name === "string" && name.length > 0) {
                careers.push(name);
            }
        }
    }

    return {
        id,
        title,
        description,
        location,
        startDate,
        endDate,
        status,
        modality,
        price,
        maxCapacity,
        availableSpots,
        careers,
    };
}

function pickStringOrNumber(obj: Record<string, unknown>, ...keys: string[]): string {
    for (const key of keys) {
        const value = obj[key];
        if (typeof value === "string") return value;
        if (typeof value === "number" && Number.isFinite(value)) return String(value);
    }
    return "";
}

function toFiniteNumberOrNull(value: unknown): number | null {
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : null;
    }
    if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed) return null;
        const parsed = Number(trimmed);
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
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

function buildPaginationFallback(page: number, limit: number, totalItems: number): PaginationMeta {
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const currentPage = Math.min(Math.max(1, page), totalPages);
    return {
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
    };
}

function parsePaginatedPayload(
    data: unknown,
    page: number,
    limit: number
): PaginatedResponse<PublicEventExtended> | null {
    if (!data || typeof data !== "object") return null;
    const payload = data as Record<string, unknown>;

    if (Array.isArray(payload.data) && payload.pagination && typeof payload.pagination === "object") {
        const rawItems = payload.data as Array<Record<string, unknown>>;
        const paginationRaw = payload.pagination as Record<string, unknown>;

        return {
            data: rawItems.map(normalizeEventExtended).filter((event) => event.id.length > 0),
            pagination: {
                currentPage: Number(paginationRaw.currentPage ?? page) || page,
                totalPages: Number(paginationRaw.totalPages ?? 1) || 1,
                totalItems: Number(paginationRaw.totalItems ?? rawItems.length) || rawItems.length,
                itemsPerPage: Number(paginationRaw.itemsPerPage ?? limit) || limit,
                hasNextPage: Boolean(paginationRaw.hasNextPage),
                hasPrevPage: Boolean(paginationRaw.hasPrevPage),
            },
        };
    }

    if (Array.isArray(payload.data)) {
        const raw = payload.data as Array<Record<string, unknown>>;
        const pagination = buildPaginationFallback(page, limit, raw.length);
        const start = (pagination.currentPage - 1) * limit;
        return {
            data: raw.slice(start, start + limit).map(normalizeEventExtended).filter((e) => e.id.length > 0),
            pagination,
        };
    }

    return null;
}

function parseArrayPayload(
    data: unknown,
    page: number,
    limit: number
): PaginatedResponse<PublicEventExtended> | null {
    if (!Array.isArray(data)) return null;
    const raw = data as Array<Record<string, unknown>>;
    const pagination = buildPaginationFallback(page, limit, raw.length);
    const start = (pagination.currentPage - 1) * limit;
    return {
        data: raw.slice(start, start + limit).map(normalizeEventExtended).filter((e) => e.id.length > 0),
        pagination,
    };
}

function buildPublicEventsParams(page: number, limit: number, filters: PublicEventsFilters): Record<string, string | number> {
    const params: Record<string, string | number> = { page, limit };

    const search = filters.search?.trim();
    if (search) params.search = search;

    if (filters.software) params.software = "true";
    if (filters.industrial) params.industrial = "true";
    if (filters.publico) params.publico = "true";

    // Precio: si ambos están activos, se neutraliza (sin filtro)
    if (filters.gratuito && !filters.pagado) params.gratuito = "true";
    if (filters.pagado && !filters.gratuito) params.pagado = "true";

    if (filters.modalidad && filters.modalidad.trim().length > 0) {
        params.modalidad = filters.modalidad.trim();
    }

    return params;
}

function getPublicEventsPaginatedCandidates() {
    return ["/api/eventos-publicos", "/api/public-events", "/api/public-events/paginated"];
}

export async function fetchPublicEventsPaginated(
    page: number,
    limit: number,
    filters: PublicEventsFilters = {}
): Promise<PaginatedResponse<PublicEventExtended>> {
    const params = buildPublicEventsParams(page, limit, filters);
    const candidates = getPublicEventsPaginatedCandidates();
    let lastError: unknown = null;

    for (const path of candidates) {
        try {
            const response = await apiClient.get<unknown>(path, { params });
            const parsed =
                parsePaginatedPayload(response.data, page, limit) ??
                parseArrayPayload(response.data, page, limit);

            if (parsed) return parsed;
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError instanceof Error
        ? lastError
        : new Error("No se pudo cargar eventos públicos (sin conexión al backend)");
}
