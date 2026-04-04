import Constants from "expo-constants";
import { NativeModules, Platform } from "react-native";

function tryParseHost(value: string | null | undefined): string | null {
    if (!value || typeof value !== "string") return null;

    // Quita cualquier esquema (http://, https://, exp://, exps://, etc.)
    const sanitized = value.replace(/^[a-z]+:\/\//i, "");
    const host = sanitized.split("/")[0]?.split(":")[0];
    return host || null;
}

function guessHostFromBundleUrl(): string | null {
    // En dev, RN expone la URL del bundle (Metro), p.ej:
    // http://192.168.1.50:8081/index.bundle?platform=android...
    const scriptURL = (NativeModules as { SourceCode?: { scriptURL?: string } })
        .SourceCode?.scriptURL;
    return tryParseHost(scriptURL);
}

function guessDevHost(): string | null {
    // 1) Lo más confiable en dev: URL del bundle
    const bundleHost = guessHostFromBundleUrl();
    if (bundleHost) return bundleHost;

    // 2) Expo config (puede variar por SDK)
    const hostUri =
        Constants.expoConfig?.hostUri ??
        // expoGoConfig.debuggerHost suele existir en Expo Go
        (Constants.expoGoConfig as { debuggerHost?: string } | null)?.debuggerHost ??
        null;

    const host = tryParseHost(hostUri);
    if (!host) return null;

    if ((host === "localhost" || host === "127.0.0.1") && Platform.OS === "android") {
        // Android emulator -> host machine (ojo: NO sirve en dispositivo físico)
        return "10.0.2.2";
    }

    return host;
}

function computeDefaultApiUrl() {
    const host = guessDevHost();
    if (host) return `http://${host}:3000`;

    // Fallback: si no pudimos resolver host.
    // En Android esto SOLO funciona si es emulador.
    if (Platform.OS === "android") return "http://10.0.2.2:3000";
    return "http://localhost:3000";
}

const explicitApiUrlRaw =
    typeof process.env.EXPO_PUBLIC_API_URL === "string" ? process.env.EXPO_PUBLIC_API_URL.trim() : "";
const explicitApiUrl = /^auto$/i.test(explicitApiUrlRaw) ? "" : explicitApiUrlRaw;
const apiUrl = explicitApiUrl.length > 0 ? explicitApiUrl : computeDefaultApiUrl();

// Multi-tenant: en local el backend cae a "uta", pero en builds/prod puede requerir header.
const tenantSlug = (process.env.EXPO_PUBLIC_TENANT_SLUG ?? "uta").trim().toLowerCase();

export const env = {
    apiUrl,
    tenantSlug,
};

export function getCandidateApiUrls(): string[] {
    const candidates: string[] = [];

    const explicitRaw = process.env.EXPO_PUBLIC_API_URL;
    const explicit =
        explicitRaw && typeof explicitRaw === "string" ? explicitRaw.trim().replace(/\/+$/, "") : null;

    // Modo auto: no se agrega como candidato (se infiere por Metro/Expo)
    const explicitEffective = explicit && /^auto$/i.test(explicit) ? null : explicit;
    const explicitHost = tryParseHost(explicitEffective);

    // Si el usuario configura explícitamente el API URL, lo intentamos primero.
    // PERO si es loopback (localhost/127.0.0.1) en un dispositivo físico, fallará.
    // Por eso NO hacemos return temprano: seguimos agregando candidatos inferidos.
    if (explicitEffective && explicitEffective.length > 0) {
        candidates.push(explicitEffective);
    }

    const host = guessDevHost();
    if (host) {
        candidates.push(`http://${host}:3000`);
    }

    if (Platform.OS === "android") {
        // Emulador Android
        candidates.push("http://10.0.2.2:3000");
    }

    // Fallbacks locales
    candidates.push("http://localhost:3000", "http://127.0.0.1:3000");

    // Si el explicit era loopback, al menos intentamos emulador Android también.
    if (
        Platform.OS === "android" &&
        explicitHost &&
        (explicitHost === "localhost" || explicitHost === "127.0.0.1")
    ) {
        candidates.push("http://10.0.2.2:3000");
    }

    // Normaliza duplicados y trailing slash
    return Array.from(new Set(candidates.map((url) => url.replace(/\/+$/, ""))));
}
