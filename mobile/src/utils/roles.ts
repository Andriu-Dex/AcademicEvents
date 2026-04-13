export function normalizeRole(role?: string | null) {
    return (role ?? "").trim().toUpperCase();
}

export function formatRoleLabel(role?: string | null) {
    const r = normalizeRole(role);

    if (["ADMIN_GLOBAL", "ADMIN_GENERAL", "GLOBAL_ADMIN", "GENERAL_ADMIN"].includes(r)) {
        return "Administrador";
    }

    if (["STUDENT", "ESTUDIANTE"].includes(r)) {
        return "Estudiante";
    }

    if (["GENERAL"].includes(r)) {
        return "General";
    }

    return role ?? "";
}

export function isAdminRole(role?: string | null) {
    const r = normalizeRole(role);
    return ["ADMIN_GLOBAL", "ADMIN_GENERAL", "GLOBAL_ADMIN", "GENERAL_ADMIN"].includes(r);
}

export function isGlobalAdminRole(role?: string | null) {
    const r = normalizeRole(role);
    return ["ADMIN_GLOBAL", "GLOBAL_ADMIN"].includes(r);
}
