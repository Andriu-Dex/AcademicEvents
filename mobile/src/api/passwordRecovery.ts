import { AxiosError } from "axios";
import { apiClient } from "./client";

type ApiResponse = {
    success: boolean;
    message: string;
    reason?: string;
    userName?: string;
    email?: string;
};

function getApiErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof AxiosError) {
        const message = (error.response?.data as { message?: string } | undefined)?.message;
        if (message) return message;
    }

    if (error instanceof Error && error.message) return error.message;
    return fallback;
}

export async function requestPasswordRecovery(email: string): Promise<ApiResponse> {
    try {
        const response = await apiClient.post<ApiResponse>("/api/password-recovery/request", { email });
        return response.data;
    } catch (error) {
        throw new Error(getApiErrorMessage(error, "Error al solicitar recuperación de contraseña"));
    }
}

export async function validateRecoveryToken(token: string): Promise<ApiResponse> {
    try {
        const response = await apiClient.get<ApiResponse>(`/api/password-recovery/validate/${token}`);
        return response.data;
    } catch (error) {
        throw new Error(getApiErrorMessage(error, "Token inválido o expirado"));
    }
}

export async function resetPasswordWithToken(
    token: string,
    newPassword: string,
    confirmPassword: string
): Promise<ApiResponse> {
    try {
        const response = await apiClient.post<ApiResponse>("/api/password-recovery/reset", {
            token,
            newPassword,
            confirmPassword,
        });
        return response.data;
    } catch (error) {
        throw new Error(getApiErrorMessage(error, "Error al restablecer la contraseña"));
    }
}
