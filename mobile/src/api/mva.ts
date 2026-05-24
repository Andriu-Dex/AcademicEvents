import { apiClient } from "./client";

export type MvaAuthority = {
    nombre: string;
    cargo: string;
    email?: string;
    imagen?: string;
};

export type MvaInfo = {
    mision: string;
    vision: string;
    autoridades: MvaAuthority[];
};

export type FacultyBasicInfo = {
    nombre: string;
    acronimo: string;
    logo: string;
};

function pickString(value: unknown, fallback = "") {
    if (typeof value === "string") return value;
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
    return fallback;
}

function parseAuthorityItem(item: Record<string, unknown>): MvaAuthority {
    const firstName = pickString(item.firstName ?? item.nombre ?? item.name ?? item.nombres, "");
    const lastName = pickString(item.lastName ?? item.apellidos ?? item.last ?? item.surname, "");
    const fullName = `${firstName} ${lastName}`.trim();

    return {
        nombre: fullName || pickString(item.nombre ?? item.name ?? item.nombres ?? item.fullName, "Autoridad"),
        cargo: pickString(item.title ?? item.titulo ?? item.cargo ?? item.rol ?? item.role ?? item.position, "Cargo"),
        email: pickString(item.email ?? item.correo ?? item.mail, ""),
        imagen: pickString(item.imageUrl ?? item.imagen ?? item.image ?? item.avatar ?? item.foto, ""),
    };
}

function parseAuthorities(raw: unknown): MvaAuthority[] {
    if (typeof raw === "string") {
        try {
            const parsed = JSON.parse(raw) as Array<Record<string, unknown>>;
            return Array.isArray(parsed) ? parsed.map(parseAuthorityItem) : [];
        } catch {
            return [];
        }
    }

    if (Array.isArray(raw)) {
        return (raw as Array<Record<string, unknown>>).map(parseAuthorityItem);
    }

    if (raw && typeof raw === "object") {
        const maybeList = (raw as Record<string, unknown>).items;
        if (Array.isArray(maybeList)) {
            return (maybeList as Array<Record<string, unknown>>).map(parseAuthorityItem);
        }
    }

    return [];
}

export async function fetchMvaInfo(): Promise<MvaInfo> {
    const response = await apiClient.get<Record<string, unknown>>("/api/mva");

    return {
        mision: pickString(response.data?.mision),
        vision: pickString(response.data?.vision),
        autoridades: parseAuthorities(response.data?.autoridades),
    };
}

export async function updateMva(payload: Partial<MvaInfo>): Promise<MvaInfo> {
    const response = await apiClient.put<Record<string, unknown>>("/api/mva", {
        mision: payload.mision,
        vision: payload.vision,
        autoridades: payload.autoridades ? JSON.stringify(payload.autoridades) : undefined,
    });

    return {
        mision: pickString(response.data?.mision),
        vision: pickString(response.data?.vision),
        autoridades: parseAuthorities(response.data?.autoridades).length > 0
            ? parseAuthorities(response.data?.autoridades)
            : payload.autoridades ?? [],
    };
}

export async function fetchFacultyBasicInfo(): Promise<FacultyBasicInfo> {
    const response = await apiClient.get<Record<string, unknown>>("/api/mva/facultad");
    return {
        nombre: pickString(response.data?.nombre),
        acronimo: pickString(response.data?.acronimo),
        logo: pickString(response.data?.logo),
    };
}

export async function updateFacultyBasicInfo(payload: Partial<FacultyBasicInfo>): Promise<FacultyBasicInfo> {
    const response = await apiClient.put<Record<string, unknown>>("/api/mva/facultad", {
        nombre: payload.nombre,
        acronimo: payload.acronimo,
        logo: payload.logo,
    });

    return {
        nombre: pickString(response.data?.nombre),
        acronimo: pickString(response.data?.acronimo),
        logo: pickString(response.data?.logo),
    };
}

export async function uploadMvaImage(file: {
    uri: string;
    name: string;
    mimeType: string;
}): Promise<{ imageUrl: string }> {
    const form = new FormData();
    form.append("imagen", {
        uri: file.uri,
        name: file.name,
        type: file.mimeType,
    } as never);

    const response = await apiClient.post<{ imagenUrl?: string }>("/api/upload/imagen", form, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    const imageUrl = response.data.imagenUrl;
    if (!imageUrl) throw new Error("No se pudo subir la imagen");
    return { imageUrl };
}
