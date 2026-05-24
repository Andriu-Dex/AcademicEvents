import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
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
    hasLocalThemeToggle: boolean;
    registerLocalThemeToggle: () => () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [mode, setModeState] = useState<Mode>("light");
    const [localToggleCount, setLocalToggleCount] = useState(0);

    useEffect(() => {
        (async () => {
            try {
                const stored = await SecureStore.getItemAsync(STORAGE_KEY);
                if (stored === "dark" || stored === "light") setModeState(stored);
            } catch {
                // ignore
            }
        })();
    }, []);

    const setMode = async (m: Mode) => {
        try {
            await SecureStore.setItemAsync(STORAGE_KEY, m);
        } catch {
            // ignore
        }
        setModeState(m);
    };

    const toggleTheme = async () => {
        await setMode(mode === "dark" ? "light" : "dark");
    };

    const registerLocalThemeToggle = useCallback(() => {
        setLocalToggleCount((count) => count + 1);
        return () => setLocalToggleCount((count) => Math.max(0, count - 1));
    }, []);

    const tokens = useMemo(() => (mode === "dark" ? darkTheme : lightTheme), [mode]);

    const value: ThemeContextValue = {
        mode,
        tokens,
        toggleTheme,
        setMode,
        hasLocalThemeToggle: localToggleCount > 0,
        registerLocalThemeToggle,
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        return {
            mode: "light" as Mode,
            tokens: lightTheme,
            toggleTheme: async () => {},
            setMode: async () => {},
            hasLocalThemeToggle: false,
            registerLocalThemeToggle: () => () => {},
        };
    }
    return ctx;
}

/** Call from screens that render their own ThemeToggleButton (e.g. home). */
export function useThemeToggleHost() {
    const { registerLocalThemeToggle } = useAppTheme();
    useEffect(() => registerLocalThemeToggle(), [registerLocalThemeToggle]);
}
