import { apiClient } from "./client";

export type Faculty = {
    id: string;
    name: string;
};

export type Coordinator = {
    id: string;
    firstName: string;
    lastName: string;
};

export type Career = {
    id: string;
    name: string;
    description: string;
    semesters: number;
    modality: string;
    icon: string;
    isActive: boolean;
    facultyId: string;
    coordinatorId: string;
    facultyName?: string;
    coordinatorName?: string;
};

export type CareerUpsertInput = {
    name: string;
    description: string;
    semesters: number;
    modality: string;
    icon: string;
    facultyId: string;
    coordinatorId: string;
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

function normalizeCareerModalityLabel(value: string): string {
    const raw = (value ?? "").trim();
    const compact = raw.toLowerCase().replaceAll("_", "").replaceAll("-", "").replaceAll(" ", "");

    if (compact === "inperson" || compact === "presencial") return "Presencial";
    if (compact === "virtual" || compact === "online") return "Virtual";
    if (compact === "hybrid" || compact === "semipresencial" || compact === "hibrida" || compact === "mixta") {
        return "Semipresencial";
    }

    if (raw.toUpperCase() === "PRESENCIAL") return "Presencial";
    if (raw.toUpperCase() === "VIRTUAL") return "Virtual";
    if (raw.toUpperCase() === "SEMIPRESENCIAL") return "Semipresencial";

    return raw;
}

function normalizeCareerModalityBackend(value: string): string {
    const raw = (value ?? "").trim();
    const compact = raw.toLowerCase().replaceAll("_", "").replaceAll("-", "").replaceAll(" ", "");

    if (compact === "inperson" || compact === "presencial") return "PRESENCIAL";
    if (compact === "virtual" || compact === "online") return "VIRTUAL";
    if (compact === "hybrid" || compact === "semipresencial" || compact === "hibrida" || compact === "mixta") {
        return "SEMIPRESENCIAL";
    }

    return raw;
}

function normalizeCareer(item: Record<string, unknown>): Career {
    const faculty = item.facultad && typeof item.facultad === "object" ? (item.facultad as Record<string, unknown>) : null;
    const coordinator =
        item.coordinador && typeof item.coordinador === "object" ? (item.coordinador as Record<string, unknown>) : null;

    const coordinatorUser =
        coordinator?.usuario && typeof coordinator.usuario === "object" ? (coordinator.usuario as Record<string, unknown>) : null;

    const coordinatorFirstName = pickString(
        coordinatorUser ?? coordinator ?? {},
        "nom_usu",
        "firstName",
        "nombres",
        "nom_coo"
    );
    const coordinatorLastName = pickString(
        coordinatorUser ?? coordinator ?? {},
        "ape_usu",
        "lastName",
        "apellidos",
        "ape_coo"
    );
    const fallbackCoordinatorName = coordinator ? pickString(coordinator, "nombre") : undefined;
    const coordinatorName =
        coordinatorFirstName || coordinatorLastName
            ? `${coordinatorFirstName} ${coordinatorLastName}`.trim()
            : fallbackCoordinatorName;

    return {
        id: pickString(item, "id", "id_car"),
        name: pickString(item, "name", "nom_car"),
        description: pickString(item, "description", "des_car"),
        semesters: toFiniteNumber(item.semesters ?? item.dur_sem_car, 0),
        modality: normalizeCareerModalityLabel(pickString(item, "modality", "mod_car")),
        icon: pickString(item, "icon", "ico_car"),
        isActive: Boolean(item.isActive ?? item.est_car ?? true),
        facultyId: pickString(item, "facultyId", "id_fac_per"),
        coordinatorId: pickString(item, "coordinatorId", "id_coo_per"),
        facultyName: faculty ? pickString(faculty, "name", "nom_fac", "facultad") : undefined,
        coordinatorName,
    };
}

export async function fetchAllCareers(): Promise<Career[]> {
    const response = await apiClient.get<unknown>("/api/carreras/todas");
    const payload = response.data;
    const list = Array.isArray(payload) ? payload : (payload as Record<string, unknown>)?.data;

    if (!Array.isArray(list)) {
        throw new TypeError("Respuesta inválida de carreras");
    }

    return (list as Array<Record<string, unknown>>).map(normalizeCareer).filter((c) => c.id.length > 0);
}

export async function fetchFaculties(): Promise<Faculty[]> {
    const response = await apiClient.get<unknown>("/api/facultades");
    const payload = response.data;
    const list = Array.isArray(payload) ? payload : (payload as Record<string, unknown>)?.data;

    if (!Array.isArray(list)) {
        throw new TypeError("Respuesta inválida de facultades");
    }

    return (list as Array<Record<string, unknown>>)
        .map((f) => ({
            id: pickString(f, "id", "id_fac"),
            name: pickString(f, "name", "nom_fac"),
        }))
        .filter((f) => f.id.length > 0);
}

export async function fetchCoordinators(): Promise<Coordinator[]> {
    const response = await apiClient.get<unknown>("/api/coordinadores");
    const payload = response.data;
    const list = Array.isArray(payload) ? payload : (payload as Record<string, unknown>)?.data;

    if (!Array.isArray(list)) {
        throw new TypeError("Respuesta inválida de coordinadores");
    }

    return (list as Array<Record<string, unknown>>)
        .map((c) => {
            const usuario = c.usuario && typeof c.usuario === "object" ? (c.usuario as Record<string, unknown>) : null;
            const firstName = pickString(usuario ?? c, "nom_usu", "firstName", "nombres");
            const lastName = pickString(usuario ?? c, "ape_usu", "lastName", "apellidos");
            return {
                id: pickString(c, "id", "id_coo"),
                firstName,
                lastName,
            };
        })
        .filter((c) => c.id.length > 0);
}

export async function createCareer(input: CareerUpsertInput): Promise<Career> {
    const response = await apiClient.post<unknown>("/api/carreras", {
        nom_car: input.name,
        des_car: input.description,
        dur_sem_car: input.semesters,
        mod_car: normalizeCareerModalityBackend(input.modality),
        ico_car: input.icon,
        id_fac_per: input.facultyId,
        id_coo_per: input.coordinatorId,
    });

    return normalizeCareer(response.data as Record<string, unknown>);
}

export async function updateCareer(careerId: string, input: CareerUpsertInput): Promise<Career> {
    const response = await apiClient.put<unknown>(`/api/carreras/${careerId}`, {
        nom_car: input.name,
        des_car: input.description,
        dur_sem_car: input.semesters,
        mod_car: normalizeCareerModalityBackend(input.modality),
        ico_car: input.icon,
        id_fac_per: input.facultyId,
        id_coo_per: input.coordinatorId,
    });

    return normalizeCareer(response.data as Record<string, unknown>);
}

export async function activateCareer(careerId: string): Promise<void> {
    await apiClient.put(`/api/carreras/${careerId}/activar`);
}

export async function deactivateCareer(careerId: string): Promise<void> {
    await apiClient.delete(`/api/carreras/${careerId}`);
}

export async function deleteCareerPermanently(careerId: string): Promise<void> {
    await apiClient.delete(`/api/carreras/${careerId}/permanente`);
}
