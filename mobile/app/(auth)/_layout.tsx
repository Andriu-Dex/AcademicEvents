import { Stack } from "expo-router";
import { ThemeProvider, useAppTheme } from "../../src/shared";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AuthLayout() {
    return (
        <ThemeProvider>
            <AuthStackWithToggle />
        </ThemeProvider>
    );
}

function AuthStackWithToggle() {
    const { tokens, mode, toggleTheme } = useAppTheme();
    const styles = makeStyles(tokens);

    return (
        <View style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }} />
            <Pressable style={styles.floatingToggle} onPress={() => toggleTheme()}>
                <Ionicons
                    name={mode === "dark" ? "sunny" : "moon"}
                    size={18}
                    color={mode === "dark" ? tokens.colors.overlayWhite90 : tokens.colors.textPrimary}
                />
            </Pressable>
        </View>
    );
}

function makeStyles(tokens: any) {
    return StyleSheet.create({
        floatingToggle: {
            position: "absolute",
            right: 18,
            bottom: 28,
            width: 52,
            height: 52,
            borderRadius: 26,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: tokens.colors.primaryOpaque85,
            borderWidth: 1,
            borderColor: tokens.colors.overlayWhite12,
            zIndex: 99,
        },
    });
}
