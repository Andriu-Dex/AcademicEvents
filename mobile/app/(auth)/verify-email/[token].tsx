import { useEffect, useRef, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { verifyEmailToken } from "../../../src/api/verification";
import { useAuthStore } from "../../../src/store/authStore";
import { useAppTheme } from "../../../src/shared";

export default function VerifyEmailTokenScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const token = String(params.token ?? "");
    const hasRun = useRef(false);
    const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
    const [message, setMessage] = useState("");
    const setSession = useAuthStore((s) => s.setSession);
    const { tokens } = useAppTheme();
    const styles = createStyles(tokens);

    useEffect(() => {
        const run = async () => {
            if (!token || hasRun.current) return;
            hasRun.current = true;
            try {
                const res = await verifyEmailToken(token);
                if (!res.success) {
                    setStatus("error");
                    setMessage(res.message ?? "Error al verificar el correo");
                    return;
                }

                if (res.authToken && res.user) {
                    await setSession(res.authToken, res.user);
                    setStatus("success");
                    setMessage("Correo verificado. Iniciando sesión...");
                    setTimeout(() => router.replace("/(app)"), 1200);
                    return;
                }

                setStatus("success");
                setMessage(res.message ?? "Correo verificado");
            } catch (e) {
                setStatus("error");
                setMessage(e instanceof Error ? e.message : "Error en verificación");
            }
        };

        run();
    }, [setSession, token, router]);

    let statusText = "";
    if (status === "verifying") statusText = "Verificando...";
    else if (status === "success") statusText = "Listo";
    else statusText = "Error";

    return (
        <ImageBackground source={{ uri: "https://i.imgur.com/5Nc5FBj.jpeg" }} style={styles.heroBackground}>
            <View style={styles.overlay} />
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.card}>
                    <View style={styles.header}>
                        <Ionicons name="checkmark-done-circle-outline" size={40} color={tokens.colors.primary} />
                        <Text style={styles.title}>{statusText}</Text>
                    </View>

                    <Text style={styles.message}>{message}</Text>

                    <Pressable style={styles.button} onPress={() => router.replace("/(auth)/login")}>
                        <Text style={styles.buttonText}>Ir al inicio</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </ImageBackground>
    );
}

function createStyles(tokens: typeof import("../../../src/shared").theme) {
    return StyleSheet.create({
        heroBackground: { flex: 1, padding: tokens.spacing.lg },
        overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: tokens.colors.overlayBlack18 },
        container: { flexGrow: 1, justifyContent: "center", paddingVertical: tokens.spacing.xl },
        card: { backgroundColor: tokens.colors.surface, borderRadius: tokens.radius.lg, padding: tokens.spacing.lg, borderWidth: 1, borderColor: tokens.colors.border, alignItems: "center" },
        header: { alignItems: "center", gap: 8 },
        title: { fontSize: tokens.fontSize.lg, fontWeight: "800", color: tokens.colors.text, marginTop: 8 },
        message: { marginTop: 12, color: tokens.colors.textSecondary, textAlign: "center" },
        button: { marginTop: 18, backgroundColor: tokens.colors.primary, paddingHorizontal: 18, paddingVertical: 12, borderRadius: tokens.radius.md },
        buttonText: { color: tokens.colors.textInverse, fontWeight: "800" },
    });
}
