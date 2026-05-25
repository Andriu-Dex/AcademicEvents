import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

const TOKEN_KEY = "academicevents.accessToken";
const USER_KEY = "academicevents.user";

export type AuthUser = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    profileImageUrl?: string | null;
};

type AuthState = {
    accessToken: string | null;
    user: AuthUser | null;
    isHydrated: boolean;
    setSession: (token: string, user: AuthUser) => Promise<void>;
    updateUser: (patch: Partial<AuthUser>) => Promise<void>;
    clearSession: () => Promise<void>;
    hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
    accessToken: null,
    user: null,
    isHydrated: false,
    setSession: async (token, user) => {
        try {
            await SecureStore.setItemAsync(TOKEN_KEY, token);
            await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
        } catch {
            // ignore storage errors
        }
        set({ accessToken: token, user, isHydrated: true });
    },
    updateUser: async (patch) => {
        set((state) => {
            const current = state.user;
            if (!current) return state;
            const next = { ...current, ...patch };
            try {
                SecureStore.setItemAsync(USER_KEY, JSON.stringify(next)).catch(() => {});
            } catch {
                // ignore
            }
            return { ...state, user: next };
        });
    },
    clearSession: async () => {
        try {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            await SecureStore.deleteItemAsync(USER_KEY);
        } catch {
            // ignore
        }
        set({ accessToken: null, user: null, isHydrated: true });
    },
    hydrate: async () => {
        try {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            const rawUser = await SecureStore.getItemAsync(USER_KEY);
            const user = rawUser ? JSON.parse(rawUser) : null;
            set({ accessToken: token ?? null, user: user ?? null, isHydrated: true });
        } catch {
            set({ accessToken: null, user: null, isHydrated: true });
        }
    },
}));
