import { apiClient } from "./client";

export type RegistrationEventSummary = {
    id: string;
    title: string;
    description: string;
    coverImageUrl: string;
    startDate: string;
    endDate: string;
    modality: string;
    location: string;
};

export type RegistrationItem = {
    id: string;
    status: string;
    createdAt: string;
    paymentProofUrl: string | null;
    event: RegistrationEventSummary | null;
};

function pickString(obj: Record<string, unknown>, ...keys: string[]): string {
    for (const key of keys) {
        const value = obj[key];
        if (typeof value === "string") return value;
        if (typeof value === "number" && Number.isFinite(value)) return String(value);
    }
    return "";
}

function normalizeEvent(raw: Record<string, unknown>): RegistrationEventSummary {
    return {
        id: pickString(raw, "id", "id_eve"),
        title: pickString(raw, "name", "nom_eve", "nombre") || "Evento",
        description: pickString(raw, "description", "des_eve") || "",
        coverImageUrl: pickString(raw, "coverImageUrl", "img_por_eve", "imageUrl") || "",
        startDate: pickString(raw, "startDate", "fec_ini_eve") || "",
        endDate: pickString(raw, "endDate", "fec_fin_eve") || "",
        modality: pickString(raw, "modality", "modalidad") || "",
        location: pickString(raw, "location", "lug_eve", "lugar") || "",
    };
}

function normalizeRegistration(raw: Record<string, unknown>): RegistrationItem {
    const event = raw.evento && typeof raw.evento === "object" ? normalizeEvent(raw.evento as Record<string, unknown>) : null;

    return {
        id: pickString(raw, "id_ins", "id", "registrationId"),
        status: pickString(raw, "est_ins", "status") || "",
        createdAt: pickString(raw, "fec_ins", "createdAt") || "",
        paymentProofUrl: pickString(raw, "comprobante", "com_ins", "paymentProofUrl") || null,
        event,
    };
}

export async function fetchMyRegistrations(): Promise<RegistrationItem[]> {
    const response = await apiClient.get<unknown>("/api/inscripciones/propias");

    if (!Array.isArray(response.data)) {
        throw new Error("Respuesta inválida de inscripciones");
    }

    return (response.data as Array<Record<string, unknown>>)
        .map(normalizeRegistration)
        .filter((r) => r.id.length > 0);
}
