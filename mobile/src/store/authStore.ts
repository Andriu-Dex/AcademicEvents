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
        await SecureStore.setItemAsync(TOKEN_KEY, token);
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
        set({ accessToken: token, user });
    },
    updateUser: async (patch) => {
        set((state) => {
            const current = state.user;
            if (!current) return state;
            const next = { ...current, ...patch };
            void SecureStore.setItemAsync(USER_KEY, JSON.stringify(next));
            return { ...state, user: next };
        });
    },
    clearSession: async () => {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
        set({ accessToken: null, user: null });
    },
    hydrate: async () => {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        const userRaw = await SecureStore.getItemAsync(USER_KEY);
        const user = userRaw ? (JSON.parse(userRaw) as AuthUser) : null;
        set({ accessToken: token, user, isHydrated: true });
    },
}));
