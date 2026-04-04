import Constants from "expo-constants";
import { Platform } from "react-native";

function guessDevHost(): string | null {
    const hostUri =
        Constants.expoConfig?.hostUri ??
        // expoGoConfig.debuggerHost suele existir en Expo Go
        (Constants.expoGoConfig as { debuggerHost?: string } | null)?.debuggerHost ??
        null;

    if (!hostUri || typeof hostUri !== "string") return null;

    const sanitized = hostUri.replace(/^https?:\/\//, "");
    const host = sanitized.split(":")[0];
    if (!host) return null;

    if (host === "localhost" && Platform.OS === "android") {
        // Android emulator -> host machine
        return "10.0.2.2";
    }

    return host;
}

function computeDefaultApiUrl() {
    const host = guessDevHost();
    if (host) return `http://${host}:3000`;
    if (Platform.OS === "android") return "http://10.0.2.2:3000";
    return "http://localhost:3000";
}

const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? computeDefaultApiUrl();

export const env = {
    apiUrl,
};
