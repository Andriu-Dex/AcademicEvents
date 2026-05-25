import { apiClient } from "./client";
import { isAxiosError } from "axios";
import type { AuthUser } from "../store/authStore";

export class RequireVerificationError extends Error {
    readonly email: string;

    constructor(email: string, message?: string) {
        super(message ?? "Debes verificar tu correo antes de iniciar sesión");
        this.name = "RequireVerificationError";
        this.email = email;
    }
}

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

type RegisterResponse = {
    msg: string;
    requireVerification?: boolean;
    email?: string;
};

export async function login(email: string, password: string) {
    let response;
    try {
        response = await apiClient.post<LoginResponse>("/api/auth/login", {
            email,
            password,
        });
    } catch (error) {
        if (isAxiosError(error)) {
            const data = error.response?.data as { requireVerification?: boolean; email?: string; msg?: string };
            if (data?.requireVerification && typeof data.email === "string" && data.email.trim().length > 0) {
                throw new RequireVerificationError(data.email, data.msg);
            }
        }
        throw error;
    }

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

    const response = await apiClient.post<RegisterResponse>("/api/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return {
        requireVerification: Boolean(response.data?.requireVerification),
        email: response.data?.email ?? payload.email,
        message: response.data?.msg ?? "Registro completado",
    };
}
