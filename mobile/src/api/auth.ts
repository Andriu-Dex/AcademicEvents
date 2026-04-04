import { apiClient } from "./client";
import type { AuthUser } from "../store/authStore";

type LoginResponse = {
    token: string;
    usuario: {
        id: string;
        correo: string;
        rol_usu: string;
        nom_usu: string;
        ape_usu: string;
        img_per_usu?: string | null;
    };
};

type RegisterPayload = {
    firstName: string;
    lastName: string;
    idNumber: string;
    phone: string;
    email: string;
    password: string;
    careerId?: string;
};

export async function login(email: string, password: string) {
    const response = await apiClient.post<LoginResponse>("/api/auth/login", {
        email,
        password,
    });

    const user: AuthUser = {
        id: response.data.usuario.id,
        email: response.data.usuario.correo,
        role: response.data.usuario.rol_usu,
        firstName: response.data.usuario.nom_usu,
        lastName: response.data.usuario.ape_usu,
        profileImageUrl: response.data.usuario.img_per_usu ?? null,
    };

    return { token: response.data.token, user };
}

export async function registerStudent(payload: RegisterPayload) {
    const formData = new FormData();
    formData.append("firstName", payload.firstName);
    formData.append("lastName", payload.lastName);
    formData.append("idNumber", payload.idNumber);
    formData.append("phone", payload.phone);
    formData.append("email", payload.email);
    formData.append("password", payload.password);
    if (payload.careerId) {
        formData.append("careerId", payload.careerId);
    }

    await apiClient.post("/api/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
}
