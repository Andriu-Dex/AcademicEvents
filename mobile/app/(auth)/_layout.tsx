import { Stack } from "expo-router";
import { View } from "react-native";
import { ThemeToggleButton } from "../../src/shared";

export default function AuthLayout() {
    return (
        <View style={{ flex: 1 }} pointerEvents="box-none">
            <Stack screenOptions={{ headerShown: false }} />
            <ThemeToggleButton bottom={28} right={18} />
        </View>
    );
}
