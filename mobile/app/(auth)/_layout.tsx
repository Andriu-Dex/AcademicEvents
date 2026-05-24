import { Stack } from "expo-router";
import { ThemeProvider } from "../../src/shared";

export default function AuthLayout() {
    return (
        <ThemeProvider>
            <Stack screenOptions={{ headerShown: false }} />
        </ThemeProvider>
    );
}
