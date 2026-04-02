import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>AcademicEvents Mobile</Text>
            <Text style={styles.subtitle}>Base creada con Expo + TypeScript</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        backgroundColor: "#ffffff",
    },
    title: {
        fontSize: 22,
        fontWeight: "600",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: "#444444",
        textAlign: "center",
    },
});
