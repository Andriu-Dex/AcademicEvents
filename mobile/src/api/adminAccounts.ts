import { apiClient } from "./client";
import type { PaginatedResponse } from "./publicEvents";

export type AccountRole = "ADMIN_GLOBAL" | "ADMIN_GENERAL" | "ESTUDIANTE" | "GENERAL" | string;

export type ManagedAccount = {
    id: string;
    email: string;
    role: AccountRole;
    isEmailVerified: boolean;
    isBlocked: boolean;
    blockedReason: string | null;
    createdAt: string;
    user: {
        id: string;
        idNumber: string;
        firstName: string;
        lastName: string;
        phone: string;
        profileImageUrl?: string;
    } | null;
};

export type AccountUpdateInput = {
    cedula?: string;
    nombres?: string;
    apellidos?: string;
    celular?: string;
    correo?: string;
    rol?: AccountRole;
    est_ver_cor?: boolean;
};

function pickString(obj: Record<string, unknown>, ...keys: string[]): string {
    for (const key of keys) {
        const value = obj[key];
        if (typeof value === "string") return value;
        if (typeof value === "number" && Number.isFinite(value)) return String(value);
    }
    return "";
}

function normalizeAccount(item: Record<string, unknown>): ManagedAccount {
    const userObj = item.usuario && typeof item.usuario === "object" ? (item.usuario as Record<string, unknown>) : null;

    return {
        id: pickString(item, "id", "id_cue"),
        email: pickString(item, "email", "cor_usu"),
        role: pickString(item, "rol_usu", "role"),
        isEmailVerified: Boolean(item.est_ver_cor ?? item.isEmailVerified),
        isBlocked: Boolean(item.est_bloqueado ?? item.isBlocked),
        blockedReason: pickString(item, "razon_bloqueo") || null,
        createdAt: pickString(item, "fec_cre_cue", "createdAt"),
        user: userObj
            ? {
                id: pickString(userObj, "id", "id_usu"),
                idNumber: pickString(userObj, "ced_usu", "idNumber"),
                firstName: pickString(userObj, "nom_usu", "firstName"),
                lastName: pickString(userObj, "ape_usu", "lastName"),
                phone: pickString(userObj, "cel_usu", "phone"),
                profileImageUrl: pickString(userObj, "img_per_usu", "profileImageUrl") || undefined,
            }
            : null,
    };
}

type PaginationEnvelope = { data: unknown[]; pagination: Record<string, unknown> };

function normalizeEnvelope(payload: Record<string, unknown>, page: number, limit: number): PaginatedResponse<ManagedAccount> {
    const envelope = payload as unknown as PaginationEnvelope;
    if (!Array.isArray(envelope.data) || !envelope.pagination) {
        throw new Error("Respuesta inválida de cuentas paginadas");
    }

    return {
        data: (envelope.data as Array<Record<string, unknown>>).map(normalizeAccount).filter((a) => a.id.length > 0),
        pagination: {
            currentPage: Number(envelope.pagination.currentPage ?? page) || page,
            totalPages: Number(envelope.pagination.totalPages ?? 1) || 1,
            totalItems: Number(envelope.pagination.totalItems ?? envelope.data.length) || envelope.data.length,
            itemsPerPage: Number(envelope.pagination.itemsPerPage ?? limit) || limit,
            hasNextPage: Boolean(envelope.pagination.hasNextPage),
            hasPrevPage: Boolean(envelope.pagination.hasPrevPage),
        },
    };
}

export async function fetchAdminsPaginated(
    page: number,
    limit: number,
    search?: string,
    rol?: "ADMIN_GLOBAL" | "ADMIN_GENERAL" | ""
): Promise<PaginatedResponse<ManagedAccount>> {
    const params: Record<string, string | number> = { page, limit };
    const trimmed = (search ?? "").trim();
    if (trimmed) params.search = trimmed;
    if (rol) params.rol = rol;

    const response = await apiClient.get<unknown>("/api/admin/list-admins-paginados", { params });
    return normalizeEnvelope(response.data as Record<string, unknown>, page, limit);
}

export async function fetchUsersPaginated(
    page: number,
    limit: number,
    search?: string,
    rol?: "ESTUDIANTE" | "GENERAL" | ""
): Promise<PaginatedResponse<ManagedAccount>> {
    const params: Record<string, string | number> = { page, limit };
    const trimmed = (search ?? "").trim();
    if (trimmed) params.search = trimmed;
    if (rol) params.rol = rol;

    const response = await apiClient.get<unknown>("/api/admin/list-users-paginados", { params });
    return normalizeEnvelope(response.data as Record<string, unknown>, page, limit);
}

export async function updateAccount(accountId: string, input: AccountUpdateInput): Promise<ManagedAccount> {
    const response = await apiClient.put<unknown>(`/api/admin/accounts/${accountId}`, input);
    const payload = response.data as Record<string, unknown>;

    if (payload && typeof payload === "object" && payload.cuenta && typeof payload.cuenta === "object") {
        return normalizeAccount(payload.cuenta as Record<string, unknown>);
    }

    return normalizeAccount(payload);
}

export async function blockAccount(accountId: string, motivo: string): Promise<void> {
    await apiClient.patch(`/api/admin/accounts/${accountId}/block`, { motivo });
}

export async function unblockAccount(accountId: string, motivo: string): Promise<void> {
    await apiClient.patch(`/api/admin/accounts/${accountId}/unblock`, { motivo });
}

export async function deleteAccount(accountId: string): Promise<void> {
    await apiClient.delete(`/api/admin/accounts/${accountId}`);
}
