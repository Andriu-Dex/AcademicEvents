import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { useAppTheme } from "./ThemeProvider";
import type { theme as LightTheme } from "./theme";

export type ThemeTokens = typeof LightTheme;

export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
    factory: (tokens: ThemeTokens) => T
): T {
    const { tokens } = useAppTheme();
    return useMemo(() => StyleSheet.create(factory(tokens)), [tokens]);
}
