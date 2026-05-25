import { apiClient } from "./client";
import type { PaginationMeta, PaginatedResponse } from "./publicEvents";

export type AdminRegistration = {
    id: string;
    status: string;
    registeredAt: string;
    validatedAt: string | null;
    observation: string | null;
    finalAttendancePercent: number | null;
    finalGrade: number | null;
    event: {
        id: string;
        name: string;
        type: string;
        status: string;
    };
    account: {
        id: string;
        email: string;
        user: {
            firstName: string;
            lastName: string;
            idNumber?: string;
            phone?: string;
            profileImageUrl?: string;
            documentUrl?: string;
            careerName?: string;
        };
    };
    paymentReceipts: Array<{ id: string; fileUrl: string; status?: string }>;
    motivationLetters: Array<{ id: string; content: string; status?: string }>;
    legacy?: {
        paymentReceipt?: string | null;
        motivation?: string | null;
    };
};

export type RegistrationsValidationInput = {
    status: string;
    finalAttendancePercent?: number;
    finalGrade?: number;
    observacion?: string;
};

function pickString(obj: Record<string, unknown>, ...keys: string[]): string {
    for (const key of keys) {
        const value = obj[key];
        if (typeof value === "string") return value;
        if (typeof value === "number" && Number.isFinite(value)) return String(value);
    }
    return "";
}

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

function pickObject(source: Record<string, unknown>, key: string): Record<string, unknown> | null {
    const value = source[key];
    return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function firstObject(...candidates: Array<Record<string, unknown> | null>): Record<string, unknown> {
    for (const candidate of candidates) {
        if (candidate) return candidate;
    }
    return {};
}

function normalizePaymentReceipts(item: Record<string, unknown>, legacyPaymentReceipt: string | null) {
    const paymentReceiptsRaw = Array.isArray(item.paymentReceipts)
        ? (item.paymentReceipts as Array<Record<string, unknown>>)
        : [];

    const normalized = paymentReceiptsRaw
        .map((r) => ({
            id: pickString(r, "id", "id_com_pag") || pickString(r, "id_com_pag"),
            fileUrl: pickString(r, "fileUrl", "url", "url_com_pag", "documentUrl") || "",
            status: pickString(r, "status", "est_com_pag") || undefined,
        }))
        .filter((r) => r.id && r.fileUrl);

    if (normalized.length > 0) return normalized;
    if (!legacyPaymentReceipt) return [];
    return [{ id: "legacy-payment-receipt", fileUrl: legacyPaymentReceipt }];
}

function normalizeMotivationLetters(item: Record<string, unknown>, legacyMotivation: string | null) {
    const motivationLettersRaw = Array.isArray(item.motivationLetters)
        ? (item.motivationLetters as Array<Record<string, unknown>>)
        : [];

    const normalized = motivationLettersRaw
        .map((m) => ({
            id: pickString(m, "id", "id_car_mot"),
            content: pickString(m, "content", "contenido", "con_car_mot") || "",
            status: pickString(m, "status", "est_car_mot") || undefined,
        }))
        .filter((m) => m.id && m.content);

    if (normalized.length > 0) return normalized;
    if (!legacyMotivation) return [];
    return [{ id: "legacy-motivation", content: legacyMotivation }];
}

function normalizeRegistration(item: Record<string, unknown>): AdminRegistration {
    const eventObjSource = firstObject(pickObject(item, "event"), pickObject(item, "evento"));

    const accountObj = firstObject(pickObject(item, "account"), pickObject(item, "cuenta"));

    const userObj = firstObject(pickObject(accountObj, "user"), pickObject(accountObj, "usuario"), pickObject(item, "usuario"));

    const careerObj = pickObject(userObj, "career");

    const legacyPaymentReceipt = pickString(item, "paymentReceipt", "comprobante") || null;
    const legacyMotivation = pickString(item, "motivation", "carta_motivacion") || null;

    const paymentReceipts = normalizePaymentReceipts(item, legacyPaymentReceipt);
    const motivationLetters = normalizeMotivationLetters(item, legacyMotivation);

    return {
        id: pickString(item, "id", "id_ins"),
        status: pickString(item, "status", "est_ins"),
        registeredAt: pickString(item, "registeredAt", "fec_ins"),
        validatedAt: pickString(item, "validatedAt") || null,
        observation: pickString(item, "observation", "observacion") || null,
        finalAttendancePercent: toFiniteNumberOrNull(
            item.finalAttendancePercent ??
            item.final_attendance_percent ??
            item.finalAttendance ??
            item.porcentaje_asistencia_final ??
            item.porcentajeFinalAsistencia ??
            item.asistencia_final
        ),
        finalGrade: toFiniteNumberOrNull(
            item.finalGrade ?? item.final_grade ?? item.nota_final ?? item.notaFinal ?? item.final_score
        ),
        event: {
            id: pickString(eventObjSource, "id", "id_eve"),
            name: pickString(eventObjSource, "name", "nom_eve") || "Evento",
            type: pickString(eventObjSource, "type", "tip_eve") || "",
            status: pickString(eventObjSource, "status", "est_eve") || "",
        },
        account: {
            id: pickString(accountObj, "id", "id_cue"),
            email: pickString(accountObj, "email", "cor_usu"),
            user: {
                firstName: pickString(userObj, "firstName", "nom_usu"),
                lastName: pickString(userObj, "lastName", "ape_usu"),
                idNumber: pickString(userObj, "idNumber", "ced_usu") || undefined,
                phone: pickString(userObj, "phone", "cel_usu") || undefined,
                profileImageUrl: pickString(userObj, "profileImageUrl", "img_per_usu") || undefined,
                documentUrl: pickString(userObj, "documentUrl", "com_usu") || undefined,
                careerName: careerObj ? pickString(careerObj, "name", "nom_car") || undefined : undefined,
            },
        },
        paymentReceipts,
        motivationLetters,
        legacy: {
            paymentReceipt: legacyPaymentReceipt,
            motivation: legacyMotivation,
        },
    };
}

function normalizePaginated(payload: Record<string, unknown>, page: number, limit: number): PaginatedResponse<AdminRegistration> {
    if (!Array.isArray(payload.data) || !payload.pagination) {
        throw new Error("Respuesta inválida de inscripciones paginadas");
    }

    const rawItems = payload.data as Array<Record<string, unknown>>;
    const pagination = payload.pagination as Record<string, unknown>;

    const meta: PaginationMeta = {
        currentPage: Number(pagination.currentPage ?? page) || page,
        totalPages: Number(pagination.totalPages ?? 1) || 1,
        totalItems: Number(pagination.totalItems ?? rawItems.length) || rawItems.length,
        itemsPerPage: Number(pagination.itemsPerPage ?? limit) || limit,
        hasNextPage: Boolean(pagination.hasNextPage),
        hasPrevPage: Boolean(pagination.hasPrevPage),
    };

    return {
        data: rawItems.map(normalizeRegistration).filter((r) => r.id.length > 0),
        pagination: meta,
    };
}

export async function fetchRegistrationsPaginated(page: number, limit: number, search?: string): Promise<PaginatedResponse<AdminRegistration>> {
    const params: Record<string, string | number> = { page, limit };
    const trimmed = (search ?? "").trim();
    if (trimmed) params.search = trimmed;

    const response = await apiClient.get<unknown>("/api/admin/inscripciones-paginadas", { params });
    const payload = response.data as Record<string, unknown>;
    return normalizePaginated(payload, page, limit);
}

export async function fetchRegistrationsByEventPaginated(
    eventId: string,
    page: number,
    limit: number,
    search?: string
): Promise<PaginatedResponse<AdminRegistration>> {
    const params: Record<string, string | number> = { page, limit };
    const trimmed = (search ?? "").trim();
    if (trimmed) params.search = trimmed;

    const response = await apiClient.get<unknown>(`/api/admin/inscripciones-paginadas/evento/${eventId}`, { params });
    const payload = response.data as Record<string, unknown>;
    return normalizePaginated(payload, page, limit);
}

export async function validateRegistration(registrationId: string, input: RegistrationsValidationInput): Promise<AdminRegistration> {
    const response = await apiClient.put<unknown>(`/api/admin/inscripciones/validar/${registrationId}`, input);
    const payload = response.data as Record<string, unknown>;

    // El backend puede devolver { msg, inscripcion } o directo.
    if (payload && typeof payload === "object" && payload.inscripcion && typeof payload.inscripcion === "object") {
        return normalizeRegistration(payload.inscripcion as Record<string, unknown>);
    }

    return normalizeRegistration(payload);
}
