import { apiClient } from "./client";

export type University = {
    id: string;
    name: string;
    acronym: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    logoUrl: string;
};

export type UniversitySocialLink = {
    id: string;
    label: string;
    url: string;
    order: number;
    iconKey?: string;
    platformKey?: string;
    isActive?: boolean;
    opensInNewTab?: boolean;
};

function pickString(obj: Record<string, unknown>, ...keys: string[]): string {
    for (const key of keys) {
        const value = obj[key];
        if (typeof value === "string") return value;
        if (typeof value === "number" && Number.isFinite(value)) return String(value);
    }
    return "";
}

function toFiniteNumber(value: unknown, fallback = 0): number {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }
    return fallback;
}

export async function fetchMainUniversity(): Promise<University> {
    const response = await apiClient.get<unknown>("/api/universidad-principal");
    const payload = response.data as Record<string, unknown>;

    return {
        id: pickString(payload, "id", "id_uni"),
        name: pickString(payload, "name", "nom_uni"),
        acronym: pickString(payload, "acronym", "acr_uni"),
        address: pickString(payload, "address", "dir_uni"),
        phone: pickString(payload, "phone", "tel_uni"),
        email: pickString(payload, "email", "cor_uni"),
        website: pickString(payload, "website", "web_uni"),
        logoUrl: pickString(payload, "logoUrl", "url_log_uni", "log_uni"),
    };
}

export async function updateUniversity(universityId: string, patch: Partial<University>): Promise<University> {
    const response = await apiClient.put<unknown>(`/api/universidad/${universityId}`, {
        nom_uni: patch.name,
        acr_uni: patch.acronym,
        url_log_uni: patch.logoUrl,
        dir_uni: patch.address,
        tel_uni: patch.phone,
        cor_uni: patch.email,
    });

    const payload = response.data as Record<string, unknown>;
    const uni = payload.universidad && typeof payload.universidad === "object" ? (payload.universidad as Record<string, unknown>) : payload;

    return {
        id: pickString(uni, "id", "id_uni", "id_uni_per") || universityId,
        name: pickString(uni, "name", "nom_uni") || patch.name || "",
        acronym: pickString(uni, "acronym", "acr_uni") || patch.acronym || "",
        address: pickString(uni, "address", "dir_uni") || patch.address || "",
        phone: pickString(uni, "phone", "tel_uni") || patch.phone || "",
        email: pickString(uni, "email", "cor_uni") || patch.email || "",
        website: pickString(uni, "website", "web_uni") || patch.website || "",
        logoUrl: pickString(uni, "logoUrl", "log_uni") || patch.logoUrl || "",
    };
}

export async function fetchUniversitySocialLinks(universityId: string): Promise<UniversitySocialLink[]> {
    const response = await apiClient.get<unknown>(`/api/universidad/${universityId}/social-links`);
    const payload = response.data as Record<string, unknown> | Array<Record<string, unknown>>;
    const rawLinks = Array.isArray(payload) ? payload : (payload?.socialLinks as Array<Record<string, unknown>>);
    if (!Array.isArray(rawLinks)) {
        throw new Error("Respuesta inválida de enlaces sociales");
    }

    return rawLinks
        .map((l) => ({
            id: pickString(l, "id"),
            label: pickString(l, "label", "nombre") || "Enlace",
            url: pickString(l, "url"),
            order: toFiniteNumber(l.order ?? l.orden, 0),
            iconKey: pickString(l, "iconKey", "icon_key") || undefined,
            platformKey: pickString(l, "platformKey", "platform_key") || undefined,
            isActive: l.isActive !== undefined ? Boolean(l.isActive) : undefined,
            opensInNewTab: l.opensInNewTab !== undefined ? Boolean(l.opensInNewTab) : undefined,
        }))
        .filter((l) => l.id.length > 0);
}

export async function createUniversitySocialLink(
    universityId: string,
    input: {
        label: string;
        url: string;
        iconKey?: string;
        platformKey?: string;
        displayOrder?: number;
        isActive?: boolean;
        opensInNewTab?: boolean;
    }
): Promise<UniversitySocialLink> {
    const response = await apiClient.post<unknown>(`/api/universidad/${universityId}/social-links`, {
        label: input.label,
        url: input.url,
        iconKey: input.iconKey,
        platformKey: input.platformKey,
        displayOrder: input.displayOrder,
        isActive: input.isActive,
        opensInNewTab: input.opensInNewTab,
    });

    const payload = response.data as Record<string, unknown>;
    return {
        id: pickString(payload, "id"),
        label: pickString(payload, "label"),
        url: pickString(payload, "url"),
        order: toFiniteNumber(payload.order, 0),
        iconKey: pickString(payload, "iconKey") || input.iconKey,
        platformKey: pickString(payload, "platformKey") || input.platformKey,
        isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : input.isActive,
        opensInNewTab: payload.opensInNewTab !== undefined ? Boolean(payload.opensInNewTab) : input.opensInNewTab,
    };
}

export async function updateUniversitySocialLink(
    universityId: string,
    linkId: string,
    patch: Partial<{
        label: string;
        url: string;
        order: number;
        iconKey: string;
        platformKey: string;
        isActive: boolean;
        opensInNewTab: boolean;
    }>
): Promise<UniversitySocialLink> {
    const response = await apiClient.put<unknown>(`/api/universidad/${universityId}/social-links/${linkId}`, patch);
    const payload = response.data as Record<string, unknown>;

    return {
        id: pickString(payload, "id") || linkId,
        label: pickString(payload, "label") || patch.label || "",
        url: pickString(payload, "url") || patch.url || "",
        order: toFiniteNumber(payload.order ?? patch.order, 0),
        iconKey: pickString(payload, "iconKey") || patch.iconKey,
        platformKey: pickString(payload, "platformKey") || patch.platformKey,
        isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : patch.isActive,
        opensInNewTab: payload.opensInNewTab !== undefined ? Boolean(payload.opensInNewTab) : patch.opensInNewTab,
    };
}

export async function deleteUniversitySocialLink(universityId: string, linkId: string): Promise<void> {
    await apiClient.delete(`/api/universidad/${universityId}/social-links/${linkId}`);
}

export async function reorderUniversitySocialLinks(universityId: string, orderedIds: string[]): Promise<void> {
    await apiClient.patch(`/api/universidad/${universityId}/social-links/reorder`, {
        orderedIds,
    });
}
