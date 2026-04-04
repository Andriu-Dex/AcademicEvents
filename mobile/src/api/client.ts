import axios, { AxiosHeaders } from "axios";
import { env } from "../config/env";
import { useAuthStore } from "../store/authStore";

export const apiClient = axios.create({
    baseURL: env.apiUrl,
    timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
        if (!config.headers) {
            config.headers = new AxiosHeaders();
        }

        if (config.headers instanceof AxiosHeaders) {
            config.headers.set("Authorization", `Bearer ${token}`);
        } else {
            (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
        }
    }
    return config;
});
