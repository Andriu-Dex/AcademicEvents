import { StyleSheet, Text, View } from "react-native";
import { AppHeader } from "../../src/components/AppHeader";
import { theme } from "../../src/shared/theme";

export default function AdminGlobalUsersScreen() {
    return (
        <View style={styles.container}>
            <AppHeader title="Gestión de usuarios" showNotifications />
            <View style={styles.center}>
                <Text style={styles.text}>Implementando gestión de usuarios (ADMIN_GLOBAL)…</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bgSecondary },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: theme.spacing.lg },
    text: { color: theme.colors.textSecondary, fontWeight: "800" },
});
