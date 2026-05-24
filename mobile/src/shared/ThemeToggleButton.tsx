import { Platform, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "./ThemeProvider";

type ThemeToggleButtonProps = {
    bottom?: number;
    right?: number;
};

/** Floating theme switch (login/register style), bottom-right. */
export function ThemeToggleButton({ bottom = 28, right = 18 }: ThemeToggleButtonProps) {
    const { mode, tokens, toggleTheme } = useAppTheme();
    const styles = createStyles(tokens, bottom, right);

    return (
        <Pressable
            style={styles.toggle}
            onPress={() => toggleTheme()}
            accessibilityRole="button"
            accessibilityLabel={mode === "dark" ? "Activar modo claro" : "Activar modo oscuro"}
        >
            <Ionicons
                name={mode === "dark" ? "sunny" : "moon"}
                size={18}
                color={mode === "dark" ? tokens.colors.utaAccent : tokens.colors.onPrimary}
            />
        </Pressable>
    );
}

function createStyles(tokens: typeof import("./theme").theme, bottom: number, right: number) {
    return StyleSheet.create({
        toggle: {
            position: "absolute",
            right,
            bottom: Platform.OS === "ios" ? bottom + 4 : bottom,
            zIndex: 9999,
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: tokens.colors.navbarControlBg,
            borderWidth: 1,
            borderColor: tokens.colors.overlayWhite20,
            elevation: 8,
        },
    });
}
