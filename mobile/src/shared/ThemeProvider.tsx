import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { theme as lightTheme } from "./theme";
import { darkTheme } from "./darkTheme";

const STORAGE_KEY = "app_theme_mode";

type Mode = "light" | "dark";

type ThemeContextValue = {
    mode: Mode;
    tokens: typeof lightTheme;
    toggleTheme: () => Promise<void>;
    setMode: (m: Mode) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [mode, setModeState] = useState<Mode>("light");

    useEffect(() => {
        (async () => {
            try {
                const stored = await SecureStore.getItemAsync(STORAGE_KEY);
                if (stored === "dark" || stored === "light") setModeState(stored);
            } catch (e) {
                // ignore
            }
        })();
    }, []);

    const setMode = async (m: Mode) => {
        try {
            await SecureStore.setItemAsync(STORAGE_KEY, m);
        } catch { }
        setModeState(m);
    };

    const toggleTheme = async () => {
        await setMode(mode === "dark" ? "light" : "dark");
    };

    const tokens = useMemo(() => (mode === "dark" ? darkTheme : lightTheme), [mode]);

    const value: ThemeContextValue = { mode, tokens, toggleTheme, setMode };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        // Fallback to light theme when not wrapped by provider
        return { mode: "light" as Mode, tokens: lightTheme, toggleTheme: async () => { }, setMode: async () => { } };
    }
    return ctx;
}
