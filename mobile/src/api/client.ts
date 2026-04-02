import axios from "axios";
import { env } from "../config/env";
import { useAuthStore } from "../store/authStore";

export const apiClient = axios.create({
    baseURL: env.apiUrl,
    timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
        config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
        };
    }
    return config;
});
