import { Platform, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "./ThemeProvider";

type ThemeToggleButtonProps = {
    bottom?: number;
    right?: number;
};

/** Floating theme switch (login/register style), bottom-right. */
export function ThemeToggleButton({ bottom = 28, right = 18 }: Readonly<ThemeToggleButtonProps>) {
    const { mode, tokens, toggleTheme } = useAppTheme();
    const styles = createStyles(tokens, mode, bottom, right);

    return (
        <Pressable
            style={styles.toggle}
            onPress={() => toggleTheme()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={mode === "dark" ? "Activar modo claro" : "Activar modo oscuro"}
        >
            <Ionicons
                name={mode === "dark" ? "sunny" : "moon"}
                size={22}
                color={mode === "dark" ? tokens.colors.utaAccent : tokens.colors.primary}
            />
        </Pressable>
    );
}

function createStyles(tokens: typeof import("./theme").theme, mode: "light" | "dark", bottom: number, right: number) {
    const size = Math.max(44, tokens.sizes.iconBtn ?? 44);
    const radius = Math.round(size / 2);

    return StyleSheet.create({
        toggle: {
            position: "absolute",
            right,
            bottom: Platform.OS === "ios" ? bottom + 4 : bottom,
            zIndex: 9999,
            width: size,
            height: size,
            borderRadius: radius,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: mode === "dark" ? tokens.colors.navbarControlBg : tokens.colors.overlayWhite90,
            borderWidth: 1,
            borderColor: mode === "dark" ? tokens.colors.overlayWhite20 : tokens.colors.primaryOpaque85,
            elevation: mode === "dark" ? 8 : 0,
        },
    });
}
