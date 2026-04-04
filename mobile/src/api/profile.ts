import { apiClient } from "./client";

export type ProfileCareer = {
    id: string;
    name: string;
};

export type ProfileData = {
    userId: string;
    accountId: string;
    idNumber: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    role: string;
    profileImageUrl: string | null;
    documentUrl: string | null;
    createdAt: string;
    career: ProfileCareer | null;
    inscriptions: unknown[];
};

type BackendProfile = {
    id_usu: string;
    id_cue: string;
    ced_usu: string;
    nom_usu: string;
    ape_usu: string;
    cel_usu: string;
    cor_usu: string;
    rol_usu: string;
    img_per_usu?: string | null;
    com_usu?: string | null;
    fec_cre_usu: string;
    carrera?: { id_car: string; nom_car: string } | null;
    inscripciones?: unknown[];
};

export async function fetchMyProfile(): Promise<ProfileData> {
    const response = await apiClient.get<BackendProfile>("/api/perfil");
    const data = response.data;

    return {
        userId: data.id_usu,
        accountId: data.id_cue,
        idNumber: data.ced_usu,
        firstName: data.nom_usu,
        lastName: data.ape_usu,
        phone: data.cel_usu,
        email: data.cor_usu,
        role: data.rol_usu,
        profileImageUrl: data.img_per_usu ?? null,
        documentUrl: data.com_usu ?? null,
        createdAt: data.fec_cre_usu,
        career: data.carrera ? { id: data.carrera.id_car, name: data.carrera.nom_car } : null,
        inscriptions: data.inscripciones ?? [],
    };
}

export async function uploadProfileImage(file: {
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

    const response = await apiClient.put<{ imagenUrl?: string; profileImageUrl?: string }>("/api/perfil/imagen", form, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    const imageUrl = response.data.profileImageUrl ?? response.data.imagenUrl;
    if (!imageUrl) throw new Error("No se pudo actualizar la imagen de perfil");
    return { imageUrl };
}

export async function uploadDocuments(files: {
    cedula?: { uri: string; name: string; mimeType: string };
    papeleta?: { uri: string; name: string; mimeType: string };
    matricula?: { uri: string; name: string; mimeType: string };
}): Promise<void> {
    const form = new FormData();

    if (files.cedula) {
        form.append("cedula", {
            uri: files.cedula.uri,
            name: files.cedula.name,
            type: files.cedula.mimeType,
        } as never);
    }

    if (files.papeleta) {
        form.append("papeleta", {
            uri: files.papeleta.uri,
            name: files.papeleta.name,
            type: files.papeleta.mimeType,
        } as never);
    }

    if (files.matricula) {
        form.append("matricula", {
            uri: files.matricula.uri,
            name: files.matricula.name,
            type: files.matricula.mimeType,
        } as never);
    }

    await apiClient.put("/api/perfil/documentos", form, {
        headers: { "Content-Type": "multipart/form-data" },
    });
}
