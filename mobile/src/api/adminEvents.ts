import { apiClient } from "./client";
import type { PaginatedResponse } from "./publicEvents";

export type AdminEvent = {
    id: string;
    name: string;
    description: string;
    location: string;
    coverImageUrl: string;
    type: string;
    startDate: string;
    endDate: string;
    durationHours: number;
    status: string;
    modality: string;
    price: number;
    maxCapacity: number | null;
    availableSpots: number | null;
    minGrade: number | null;
    minAttendancePercent: number | null;
    isGeneral: boolean;
    careers: string[];
    careerIds: string[];
};

export type AdminEventsFilters = {
    search?: string;
    tipoEvento?: string;
    estado?: string;
    fechaInicio?: string;
    fechaFin?: string;
    carrera?: string;
    modalidad?: string;
    capacidadMin?: number | "";
    capacidadMax?: number | "";
    valorMin?: number | "";
    valorMax?: number | "";
    asistenciaMin?: number | "";
    esGratuito?: boolean;
    esPago?: boolean;
    eventosLlenos?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
};

export type AdminEventUpsertInput = {
    name: string;
    description: string;
    location: string;
    type: string;
    status: string;
    modality: string;
    startDate: string;
    endDate: string;
    durationHours: number;
    maxCapacity: number;
    minAttendancePercent: number;
    minGrade?: number | null;
    price: number;
    isGeneral: boolean;
    careerIds: string[];
};

export type ImageAsset = {
    uri: string;
    name: string;
    type: string;
};

function toFiniteNumberOrNull(value: unknown): number | null {
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed) return null;
        const parsed = Number(trimmed);
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
}

function appendNumericParam(params: Record<string, string | number>, key: string, value: unknown) {
    const parsed = toFiniteNumberOrNull(value);
    if (parsed === null) return;
    params[key] = parsed;
}

function appendTrimmedParam(params: Record<string, string | number>, key: string, value?: string) {
    const trimmed = value?.trim();
    if (!trimmed) return;
    params[key] = trimmed;
}

function appendBooleanParam(params: Record<string, string | number>, key: string, value?: boolean) {
    if (!value) return;
    params[key] = "true";
}

function normalizeEventCareers(eventCareers: Array<Record<string, unknown>>) {
    const careerIds: string[] = [];
    const careers: string[] = [];

    for (const ec of eventCareers) {
        const careerId = ec.careerId;
        if (typeof careerId === "string" && careerId.length > 0) careerIds.push(careerId);

        const career = ec.career;
        if (!career || typeof career !== "object") continue;

        const careerRec = career as Record<string, unknown>;
        const embeddedId = careerRec.id;
        if (typeof embeddedId === "string" && embeddedId.length > 0) careerIds.push(embeddedId);

        const name = careerRec.name;
        if (typeof name === "string" && name.length > 0) careers.push(name);
    }

    return {
        careerIds: Array.from(new Set(careerIds)),
        careers,
    };
}

function toFiniteNumber(value: unknown, fallback = 0): number {
    const parsed = toFiniteNumberOrNull(value);
    return typeof parsed === "number" ? parsed : fallback;
}

function pickString(obj: Record<string, unknown>, ...keys: string[]): string {
    for (const key of keys) {
        const value = obj[key];
        if (typeof value === "string") return value;
        if (typeof value === "number" && Number.isFinite(value)) return String(value);
    }
    return "";
}

function normalizeAdminEvent(item: Record<string, unknown>): AdminEvent {
    const eventCareers = Array.isArray(item.eventCareers) ? (item.eventCareers as Array<Record<string, unknown>>) : [];

    const { careerIds: normalizedCareerIds, careers } = normalizeEventCareers(eventCareers);
    const isGeneral = Boolean(item.esEventoGeneral ?? item.isGeneral) || normalizedCareerIds.length === 0;

    return {
        id: pickString(item, "id", "id_eve"),
        name: pickString(item, "name", "nom_eve") || "Evento sin nombre",
        description: pickString(item, "description", "des_eve") || "",
        location: pickString(item, "location", "lug_eve") || "",
        coverImageUrl: pickString(item, "coverImageUrl", "img_por_eve") || "",
        type: pickString(item, "type", "tip_eve") || "",
        startDate: pickString(item, "startDate", "fec_ini_eve") || "",
        endDate: pickString(item, "endDate", "fec_fin_eve") || "",
        durationHours: toFiniteNumber(item.durationHours ?? item.dur_hor_eve, 0),
        status: pickString(item, "status", "est_eve") || "",
        modality: pickString(item, "modality", "modalidad") || "",
        price: toFiniteNumber(item.price ?? item.val_eve, 0),
        maxCapacity: toFiniteNumberOrNull(item.maxCapacity ?? item.cup_max_eve),
        availableSpots: toFiniteNumberOrNull(item.availableSpots ?? item.cup_dis_eve),
        minGrade: toFiniteNumberOrNull(item.minGrade ?? item.not_min_eve),
        minAttendancePercent: toFiniteNumberOrNull(item.minAttendancePercent ?? item.por_min_asi_eve),
        isGeneral,
        careers,
        careerIds: normalizedCareerIds,
    };
}

export async function fetchAdminEventsPaginated(
    page: number,
    limit: number,
    filters: AdminEventsFilters
): Promise<PaginatedResponse<AdminEvent>> {
    const params: Record<string, string | number> = { page, limit };

    appendTrimmedParam(params, "search", filters.search);
    appendTrimmedParam(params, "tipoEvento", filters.tipoEvento);
    appendTrimmedParam(params, "estado", filters.estado);
    appendTrimmedParam(params, "fechaInicio", filters.fechaInicio);
    appendTrimmedParam(params, "fechaFin", filters.fechaFin);
    appendTrimmedParam(params, "carrera", filters.carrera);
    appendTrimmedParam(params, "modalidad", filters.modalidad);

    appendNumericParam(params, "capacidadMin", filters.capacidadMin);
    appendNumericParam(params, "capacidadMax", filters.capacidadMax);
    appendNumericParam(params, "valorMin", filters.valorMin);
    appendNumericParam(params, "valorMax", filters.valorMax);
    appendNumericParam(params, "asistenciaMin", filters.asistenciaMin);

    appendBooleanParam(params, "esGratuito", filters.esGratuito);
    appendBooleanParam(params, "esPago", filters.esPago);
    appendBooleanParam(params, "eventosLlenos", filters.eventosLlenos);

    appendTrimmedParam(params, "sortBy", filters.sortBy);
    if (filters.sortOrder) params.sortOrder = filters.sortOrder;

    const response = await apiClient.get<unknown>("/api/admin/events", { params });
    const payload = response.data as Record<string, unknown>;

    if (!payload || typeof payload !== "object" || !Array.isArray(payload.data) || !payload.pagination) {
        throw new Error("Respuesta inválida de eventos admin paginados");
    }

    const rawItems = payload.data as Array<Record<string, unknown>>;
    const pagination = payload.pagination as Record<string, unknown>;

    return {
        data: rawItems.map(normalizeAdminEvent).filter((e) => e.id.length > 0),
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

export async function fetchEventById(eventId: string): Promise<AdminEvent> {
    const response = await apiClient.get<unknown>(`/api/events/${eventId}`);
    const payload = response.data as Record<string, unknown>;
    return normalizeAdminEvent(payload);
}

function appendIfPresent(form: FormData, key: string, value: unknown) {
    if (value === undefined || value === null) return;
    if (typeof value === "string") {
        if (!value.trim()) return;
        form.append(key, value);
        return;
    }
    if (typeof value === "number") {
        if (!Number.isFinite(value)) return;
        form.append(key, String(value));
        return;
    }
    if (typeof value === "boolean") {
        form.append(key, value ? "true" : "false");
    }
}

export async function createEvent(input: AdminEventUpsertInput, image?: ImageAsset): Promise<AdminEvent> {
    const form = new FormData();

    appendIfPresent(form, "nom_eve", input.name);
    appendIfPresent(form, "des_eve", input.description);
    appendIfPresent(form, "lug_eve", input.location);
    appendIfPresent(form, "tip_eve", input.type);
    appendIfPresent(form, "est_eve", input.status);
    appendIfPresent(form, "modalidad", input.modality);
    appendIfPresent(form, "fec_ini_eve", input.startDate);
    appendIfPresent(form, "fec_fin_eve", input.endDate);
    appendIfPresent(form, "dur_hor_eve", input.durationHours);
    appendIfPresent(form, "cup_max_eve", input.maxCapacity);
    appendIfPresent(form, "por_min_asi_eve", input.minAttendancePercent);
    appendIfPresent(form, "not_min_eve", input.minGrade ?? "");
    appendIfPresent(form, "val_eve", input.price);

    form.append("esEventoGeneral", input.isGeneral ? "true" : "false");
    if (!input.isGeneral) {
        form.append("carrerasIds", JSON.stringify(input.careerIds));
    }

    if (image) {
        form.append("img_por_eve", {
            uri: image.uri,
            name: image.name,
            type: image.type,
        } as unknown as Blob);
    }

    const response = await apiClient.post<unknown>("/api/events", form, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return normalizeAdminEvent(response.data as Record<string, unknown>);
}

export async function updateEvent(eventId: string, input: AdminEventUpsertInput, image?: ImageAsset): Promise<AdminEvent> {
    const form = new FormData();

    appendIfPresent(form, "nom_eve", input.name);
    appendIfPresent(form, "des_eve", input.description);
    appendIfPresent(form, "lug_eve", input.location);
    appendIfPresent(form, "tip_eve", input.type);
    appendIfPresent(form, "est_eve", input.status);
    appendIfPresent(form, "modalidad", input.modality);
    appendIfPresent(form, "fec_ini_eve", input.startDate);
    appendIfPresent(form, "fec_fin_eve", input.endDate);
    appendIfPresent(form, "dur_hor_eve", input.durationHours);
    appendIfPresent(form, "cup_max_eve", input.maxCapacity);
    appendIfPresent(form, "por_min_asi_eve", input.minAttendancePercent);
    appendIfPresent(form, "not_min_eve", input.minGrade ?? "");
    appendIfPresent(form, "val_eve", input.price);

    form.append("esEventoGeneral", input.isGeneral ? "true" : "false");
    if (!input.isGeneral) {
        form.append("carrerasIds", JSON.stringify(input.careerIds));
    }

    if (image) {
        form.append("img_por_eve", {
            uri: image.uri,
            name: image.name,
            type: image.type,
        } as unknown as Blob);
    }

    const response = await apiClient.put<unknown>(`/api/events/${eventId}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return normalizeAdminEvent(response.data as Record<string, unknown>);
}

export async function deleteEvent(eventId: string): Promise<void> {
    await apiClient.delete(`/api/events/${eventId}`);
}
