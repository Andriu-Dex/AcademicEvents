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

export async function fetchMvaInfo(): Promise<MvaInfo> {
    const response = await apiClient.get<Record<string, unknown>>("/api/mva");
    const raw = response.data?.autoridades;

    let autoridades: MvaAuthority[] = [];
    if (typeof raw === "string") {
        try {
            const parsed = JSON.parse(raw) as Array<Record<string, unknown>>;
            if (Array.isArray(parsed)) {
                autoridades = parsed.map((item) => ({
                    nombre: pickString(item.nombre ?? item.name ?? item.nombres, "Autoridad"),
                    cargo: pickString(item.cargo ?? item.rol ?? item.role, "Cargo"),
                    email: pickString(item.email ?? item.correo ?? item.mail, ""),
                    imagen: pickString(item.imagen ?? item.image ?? item.avatar ?? item.foto, ""),
                }));
            }
        } catch {
            autoridades = [];
        }
    } else if (Array.isArray(raw)) {
        autoridades = (raw as Array<Record<string, unknown>>).map((item) => ({
            nombre: pickString(item.nombre ?? item.name ?? item.nombres, "Autoridad"),
            cargo: pickString(item.cargo ?? item.rol ?? item.role, "Cargo"),
            email: pickString(item.email ?? item.correo ?? item.mail, ""),
            imagen: pickString(item.imagen ?? item.image ?? item.avatar ?? item.foto, ""),
        }));
    } else if (raw && typeof raw === "object") {
        const maybeList = (raw as Record<string, unknown>).items;
        if (Array.isArray(maybeList)) {
            autoridades = (maybeList as Array<Record<string, unknown>>).map((item) => ({
                nombre: pickString(item.nombre ?? item.name ?? item.nombres, "Autoridad"),
                cargo: pickString(item.cargo ?? item.rol ?? item.role, "Cargo"),
                email: pickString(item.email ?? item.correo ?? item.mail, ""),
                imagen: pickString(item.imagen ?? item.image ?? item.avatar ?? item.foto, ""),
            }));
        }
    }

    return {
        mision: pickString(response.data?.mision),
        vision: pickString(response.data?.vision),
        autoridades,
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
        autoridades: payload.autoridades ?? [],
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
