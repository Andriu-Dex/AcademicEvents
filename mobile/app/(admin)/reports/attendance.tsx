import { StyleSheet, Text, View } from "react-native";
import { AppHeader } from "../../../src/components/AppHeader";
import { theme } from "../../../src/shared/theme";

export default function AdminReportAttendanceScreen() {
    return (
        <View style={styles.container}>
            <AppHeader title="Reportes de asistencia" showNotifications />
            <View style={styles.center}>
                <Text style={styles.text}>Implementando reporte de asistencia…</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bgSecondary },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: theme.spacing.lg },
    text: { color: theme.colors.textSecondary, fontWeight: "800" },
});
