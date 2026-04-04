import axios, { AxiosHeaders } from "axios";
import { env, getCandidateApiUrls } from "../config/env";
import { useAuthStore } from "../store/authStore";

export const apiClient = axios.create({
    baseURL: env.apiUrl,
    timeout: 15000,
});

if (__DEV__) {
    // Útil para confirmar desde consola del Metro cuál URL está usando el móvil.
    console.log(
        `[API] initialBaseURL=${env.apiUrl} tenant=${env.tenantSlug} candidates=${getCandidateApiUrls().join(
            ","
        )}`
    );
}

let resolvedBaseUrl: string | null = null;
let resolvingBaseUrl: Promise<string> | null = null;
let lastProbeLog: string[] = [];

export function getCurrentApiBaseUrl() {
    return resolvedBaseUrl ?? env.apiUrl;
}

export function getLastApiProbeLog() {
    return lastProbeLog;
}

function joinUrl(base: string, path: string) {
    const normalizedBase = base.replace(/\/+$/, "");
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${normalizedBase}${normalizedPath}`;
}

async function canReach(baseUrl: string): Promise<boolean> {
    try {
        await axios.get(joinUrl(baseUrl, "/health"), {
            timeout: 2500,
            headers: {
                // /health también pasa por tenantMiddleware
                "X-Tenant-ID": env.tenantSlug,
            },
        });
        if (__DEV__) {
            lastProbeLog.push(`OK ${baseUrl}`);
            lastProbeLog = lastProbeLog.slice(-8);
        }
        return true;
    } catch {
        if (__DEV__) {
            lastProbeLog.push(`FAIL ${baseUrl}`);
            lastProbeLog = lastProbeLog.slice(-8);
        }
        return false;
    }
}

async function getResolvedBaseUrl(): Promise<string> {
    if (resolvedBaseUrl) return resolvedBaseUrl;
    if (resolvingBaseUrl) return resolvingBaseUrl;

    const candidates = getCandidateApiUrls();
    if (__DEV__) {
        lastProbeLog = [`candidates: ${candidates.join(",")}`];
        // Si el initialBaseURL viene de .env (p.ej. localhost), esto ayuda a ver si fue sobrescrito.
        lastProbeLog.push(`initial: ${env.apiUrl}`);
    }

    resolvingBaseUrl = (async () => {
        for (const candidate of candidates) {
            // Si la candidate es localhost en Android físico, normalmente fallará; igual la probamos.
            const ok = await canReach(candidate);
            if (ok) {
                resolvedBaseUrl = candidate;
                if (__DEV__) {
                    console.log(`[API] resolvedBaseURL=${candidate}`);
                }
                return candidate;
            }
        }

        // Si nada respondió, regresamos la inicial (y el UI mostrará error en fetches),
        // PERO no cacheamos el fallo para permitir que el siguiente request vuelva a intentar.
        resolvedBaseUrl = null;
        if (__DEV__) {
            console.log(`[API] resolvedBaseURL(fallback)=${env.apiUrl}`);
        }
        return env.apiUrl;
    })().finally(() => {
        resolvingBaseUrl = null;
    });

    return resolvingBaseUrl;
}

apiClient.interceptors.request.use(async (config) => {
    // Asegura un baseURL alcanzable (LAN/emulador) antes de cualquier request.
    config.baseURL = await getResolvedBaseUrl();

    const token = useAuthStore.getState().accessToken;

    // Multi-tenant (backend/src/middlewares/tenant.js)
    if (!config.headers) {
        config.headers = new AxiosHeaders();
    }

    if (config.headers instanceof AxiosHeaders) {
        config.headers.set("X-Tenant-ID", env.tenantSlug);
    } else {
        (config.headers as Record<string, string>)["X-Tenant-ID"] = env.tenantSlug;
    }

    if (token) {
        if (config.headers instanceof AxiosHeaders) {
            config.headers.set("Authorization", `Bearer ${token}`);
        } else {
            (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
        }
    }
    return config;
});
