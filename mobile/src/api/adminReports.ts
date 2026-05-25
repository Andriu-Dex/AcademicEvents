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

export type RevenueGeneralMetrics = {
    revenueTotal: number;
    pagosConfirmados: number;
    pagosPendientes: number;
    totalInscripciones: number;
    comprobantesRechazados: number;
    tasaConversion: number;
};

export type ReportDateParams = {
    fechaInicio?: string;
    fechaFin?: string;
};

function pickString(obj: Record<string, unknown>, ...keys: string[]): string {
    for (const key of keys) {
        const value = obj[key];
        if (typeof value === "string") return value;
        if (typeof value === "number" && Number.isFinite(value)) return String(value);
    }
    return "";
}

function unwrapPayload<T>(raw: unknown): T {
    const payload = raw as Record<string, unknown>;
    if (payload && typeof payload === "object" && payload.data && typeof payload.data === "object") {
        return payload.data as T;
    }
    return raw as T;
}

function normalizeEventSummary(raw: Record<string, unknown>, index = 0): AdminReportEventSummary {
    return {
        id: pickString(raw, "id", "id_eve") || `evento-${index}`,
        name: pickString(raw, "name", "title", "nom_eve", "titulo") || `Evento ${index + 1}`,
        coverImageUrl:
            pickString(raw, "coverImageUrl", "img_por_eve", "coverImage", "imageUrl") ||
            "https://via.placeholder.com/320x90?text=Sin+Imagen",
    };
}

export async function fetchReportEventsPaginated(
    page: number,
    limit: number,
    q?: string
): Promise<PaginatedResponse<AdminReportEventSummary>> {
    try {
        const response = await apiClient.get<unknown>("/api/admin/reports/events-paginated", {
            params: q ? { page, limit, q } : { page, limit },
        });

        const payload = unwrapPayload<Record<string, unknown>>(response.data);
        if (!payload || typeof payload !== "object" || !Array.isArray(payload.data) || !payload.pagination) {
            throw new Error("Respuesta invalida de eventos de reportes");
        }

        const rawItems = payload.data as Array<Record<string, unknown>>;
        const pagination = payload.pagination as Record<string, unknown>;

        return {
            data: rawItems.map((r, i) => normalizeEventSummary(r, i)),
            pagination: {
                currentPage: Number(pagination.currentPage ?? page) || page,
                totalPages: Number(pagination.totalPages ?? 1) || 1,
                totalItems: Number(pagination.totalItems ?? rawItems.length) || rawItems.length,
                itemsPerPage: Number(pagination.itemsPerPage ?? limit) || limit,
                hasNextPage: Boolean(pagination.hasNextPage),
                hasPrevPage: Boolean(pagination.hasPrevPage),
            },
        };
    } catch {
        const fallbackList = await fetchReportEventsForSelector();
        const safeLimit = Math.max(1, limit);
        const totalItems = fallbackList.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit));
        const currentPage = Math.min(Math.max(1, page), totalPages);
        const start = (currentPage - 1) * safeLimit;
        const data = fallbackList.slice(start, start + safeLimit);

        return {
            data,
            pagination: {
                currentPage,
                totalPages,
                totalItems,
                itemsPerPage: safeLimit,
                hasNextPage: currentPage < totalPages,
                hasPrevPage: currentPage > 1,
            },
        };
    }
}

export async function fetchReportEventsForSelector(): Promise<AdminReportEventSummary[]> {
    const response = await apiClient.get<unknown>("/api/admin/reports/events");
    const payload = unwrapPayload<Record<string, unknown>>(response.data);
    let list: Array<Record<string, unknown>> = [];
    if (Array.isArray(payload.eve)) list = payload.eve as Array<Record<string, unknown>>;
    else if (Array.isArray(payload.data)) list = payload.data as Array<Record<string, unknown>>;

    return list.map((r, i) => normalizeEventSummary(r, i)).filter((item) => item.id.length > 0);
}

export async function fetchEventReportById(eventId: string): Promise<unknown> {
    const response = await apiClient.get<unknown>(`/api/admin/reports/event/${eventId}`);
    return unwrapPayload<unknown>(response.data);
}

export async function fetchMonthlyReport(year: number, month: number): Promise<unknown> {
    const response = await apiClient.post<unknown>("/api/admin/reports/month", {
        anio: year,
        mes: month,
    });
    return unwrapPayload<unknown>(response.data);
}

export async function fetchCareerReportStatistics(careerId: string): Promise<unknown> {
    const response = await apiClient.get<unknown>(`/api/admin/reports/career/statistics/${careerId}`);
    return unwrapPayload<unknown>(response.data);
}

export async function fetchCareerReportEvents(careerId: string): Promise<unknown> {
    const response = await apiClient.get<unknown>(`/api/admin/reports/career/events/${careerId}`);
    return unwrapPayload<unknown>(response.data);
}

export async function fetchEnrollmentsReportStatistics(params?: {
    fechaInicio?: string;
    fechaFin?: string;
    estado?: string;
}): Promise<unknown> {
    const response = await apiClient.get<unknown>("/api/admin/reports/enrollments/statistics", {
        params,
    });
    return unwrapPayload<unknown>(response.data);
}

export async function fetchEnrollmentsReportTrends(params?: ReportDateParams): Promise<unknown> {
    const response = await apiClient.get<unknown>("/api/admin/reports/enrollments/trends", {
        params,
    });
    return unwrapPayload<unknown>(response.data);
}

export async function fetchEnrollmentsReportValidations(params?: ReportDateParams): Promise<unknown> {
    const response = await apiClient.get<unknown>("/api/admin/reports/enrollments/validations", {
        params,
    });
    return unwrapPayload<unknown>(response.data);
}

export async function fetchAttendanceEventReport(eventId: string): Promise<unknown> {
    if (!eventId) return {};
    const response = await apiClient.get<unknown>(`/api/admin/reports/attendance/event/${eventId}`);
    return unwrapPayload<unknown>(response.data);
}

export async function fetchAttendanceComparativeReport(tipo?: string): Promise<unknown> {
    const response = await apiClient.get<unknown>("/api/admin/reports/attendance/comparative", {
        params: tipo ? { tipo } : undefined,
    });
    return unwrapPayload<unknown>(response.data);
}

export async function fetchAttendanceNoShowsReport(tipo?: string): Promise<unknown> {
    const response = await apiClient.get<unknown>("/api/admin/reports/attendance/no-shows", {
        params: tipo ? { tipo } : undefined,
    });
    return unwrapPayload<unknown>(response.data);
}

export async function fetchCertificatesSummaryReport(params?: ReportDateParams): Promise<unknown> {
    const response = await apiClient.get<unknown>("/api/admin/reports/certificates/summary", {
        params,
    });
    return unwrapPayload<unknown>(response.data);
}

export async function fetchCertificatesDownloadsReport(params?: ReportDateParams): Promise<unknown> {
    const response = await apiClient.get<unknown>("/api/admin/reports/certificates/downloads", {
        params,
    });
    return unwrapPayload<unknown>(response.data);
}

export async function fetchCertificatesEventsReport(params?: ReportDateParams): Promise<unknown> {
    const response = await apiClient.get<unknown>("/api/admin/reports/certificates/events", {
        params,
    });
    return unwrapPayload<unknown>(response.data);
}

export async function fetchRevenueGeneralMetrics(params?: {
    fechaDesde?: string;
    fechaHasta?: string;
    tipoEvento?: string;
    estadoPago?: string;
}): Promise<RevenueGeneralMetrics> {
    const response = await apiClient.get<unknown>("/api/admin/reports/revenue/general-metrics", {
        params,
    });
    const payload = unwrapPayload<Record<string, unknown>>(response.data);

    return {
        revenueTotal: Number(payload.revenueTotal ?? 0) || 0,
        pagosConfirmados: Number(payload.pagosConfirmados ?? 0) || 0,
        pagosPendientes: Number(payload.pagosPendientes ?? 0) || 0,
        totalInscripciones: Number(payload.totalInscripciones ?? 0) || 0,
        comprobantesRechazados: Number(payload.comprobantesRechazados ?? 0) || 0,
        tasaConversion: Number(payload.tasaConversion ?? 0) || 0,
    };
}

export async function fetchRevenueByType(params?: {
    fechaDesde?: string;
    fechaHasta?: string;
    tipoEvento?: string;
    estadoPago?: string;
}): Promise<unknown> {
    const response = await apiClient.get<unknown>("/api/admin/reports/revenue/revenue-by-type", {
        params,
    });
    return unwrapPayload<unknown>(response.data);
}

export async function fetchRevenueProfitableEvents(params?: {
    fechaDesde?: string;
    fechaHasta?: string;
    tipoEvento?: string;
    estadoPago?: string;
}): Promise<unknown> {
    const response = await apiClient.get<unknown>("/api/admin/reports/revenue/profitable-events", {
        params,
    });
    return unwrapPayload<unknown>(response.data);
}

export async function fetchRevenuePeriodTrends(params?: {
    fechaDesde?: string;
    fechaHasta?: string;
    tipoEvento?: string;
    estadoPago?: string;
}): Promise<unknown> {
    const response = await apiClient.get<unknown>("/api/admin/reports/revenue/period-trends", {
        params,
    });
    return unwrapPayload<unknown>(response.data);
}

export async function fetchRevenueRejectedReceipts(params?: {
    fechaDesde?: string;
    fechaHasta?: string;
    tipoEvento?: string;
}): Promise<unknown> {
    const response = await apiClient.get<unknown>("/api/admin/reports/revenue/rejected-receipts", {
        params,
    });
    return unwrapPayload<unknown>(response.data);
}
