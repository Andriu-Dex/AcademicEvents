import { apiClient } from "./client";
import type { AuthUser } from "../store/authStore";

type ResendVerificationResponse = {
    success: boolean;
    message?: string;
    tiempoRestante?: number;
};

type CorrectEmailResponse = {
    success: boolean;
    message?: string;
    email?: string;
    tipoCorreo?: string;
};

type VerifyEmailResponse = {
    success: boolean;
    message?: string;
    motivo?: string;
    authToken?: string;
    usuario?: {
        id: string;
        correo: string;
        rol_usu: string;
        nom_usu: string;
        ape_usu: string;
    };
};

export async function resendVerification(email: string) {
    const response = await apiClient.post<ResendVerificationResponse>("/api/verificacion/reenviar", {
        correo: email,
    });

    return {
        success: Boolean(response.data?.success),
        message: response.data?.message ?? "Solicitud procesada",
        tiempoRestante: response.data?.tiempoRestante,
    };
}

export async function correctEmail(params: {
    correoAnterior: string;
    correoNuevo: string;
    carreraNueva?: string | null;
}) {
    const response = await apiClient.put<CorrectEmailResponse>("/api/cuenta/corregir-correo", {
        correoAnterior: params.correoAnterior,
        correoNuevo: params.correoNuevo,
        carreraNueva: params.carreraNueva ?? null,
    });

    return {
        success: Boolean(response.data?.success),
        message: response.data?.message ?? "Solicitud procesada",
        email: response.data?.email,
        tipoCorreo: response.data?.tipoCorreo,
    };
}

export async function verifyEmailToken(token: string) {
    const response = await apiClient.get<VerifyEmailResponse>(`/api/verificacion/${token}`);

    const authToken = response.data?.authToken;
    const rawUser = response.data?.usuario;

    const user: AuthUser | null = rawUser
        ? {
              id: rawUser.id,
              email: rawUser.correo,
              role: rawUser.rol_usu,
              firstName: rawUser.nom_usu,
              lastName: rawUser.ape_usu,
              profileImageUrl: null,
          }
        : null;

    return {
        success: Boolean(response.data?.success),
        message: response.data?.message ?? "Solicitud procesada",
        motivo: response.data?.motivo,
        authToken,
        user,
    };
}
