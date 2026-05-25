import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { ActivityIndicator, Alert, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { resendVerification } from "../../src/api/verification";
import { useAppTheme } from "../../src/shared";

const PENDING_EMAIL_KEY = "academicevents.verificationPendingEmail";
const PENDING_CAREER_KEY = "academicevents.verificationPendingCareerId";

export default function VerificationPendingScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { tokens } = useAppTheme();
    const styles = createStyles(tokens as any);

    const incomingEmail = useMemo(() => {
        const val = params.email as string | string[] | undefined;
        if (!val) return null;
        return Array.isArray(val) ? val[0] : val;
    }, [params.email]);

    const [email, setEmail] = useState<string | null>(null);
    const [careerId, setCareerId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const storedEmail = (incomingEmail ?? (await SecureStore.getItemAsync(PENDING_EMAIL_KEY)) ?? "").trim();
                const storedCareer = (await SecureStore.getItemAsync(PENDING_CAREER_KEY)) ?? "";
                if (!storedEmail && mounted) {
                    router.replace("/(auth)/login");
                    return;
                }
                if (mounted) {
                    setEmail(storedEmail || null);
                    setCareerId(storedCareer || null);
                }
            } catch {
                if (mounted) router.replace("/(auth)/login");
            }
        })();
        return () => {
            mounted = false;
        };
    }, [incomingEmail, router]);

    const handleResend = async () => {
        if (!email) return;
        setLoading(true);
        try {
            const res = await resendVerification(email);
            Alert.alert(res.success ? "Listo" : "Error", res.message ?? "Solicitud procesada");
        } catch (e) {
            Alert.alert("Error", e instanceof Error ? e.message : "Error al reenviar");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ImageBackground source={{ uri: "https://i.imgur.com/5Nc5FBj.jpeg" }} style={styles.heroBackground}>
            <View style={styles.overlay} />
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.card}>
                    <View style={styles.header}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="mail-open-outline" size={22} color={tokens.colors.textInverse} />
                        </View>
                        <Text style={styles.title}>Verificación requerida</Text>
                    </View>

                    <Text style={styles.message}>Se ha enviado un correo a:</Text>
                    <Text style={styles.email}>{email ?? "..."}</Text>

                    <Pressable style={styles.button} onPress={handleResend} disabled={loading}>
                        {loading ? <ActivityIndicator color={tokens.colors.textInverse} /> : <Text style={styles.buttonText}>Reenviar verificación</Text>}
                    </Pressable>

                    <Pressable style={styles.secondaryButton} onPress={() => router.push("/(auth)/correct-email")}> 
                        <Text style={styles.secondaryButtonText}>Corregir correo</Text>
                    </Pressable>

                    <Pressable style={styles.link} onPress={() => router.replace("/(auth)/login")}>
                        <Text style={styles.linkText}>Ir al inicio</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </ImageBackground>
    );
}

function createStyles(tokens: typeof import("../../src/shared").theme) {
    return StyleSheet.create({
        heroBackground: { flex: 1, padding: tokens.spacing.lg },
        overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: tokens.colors.overlayBlack18 },
        container: { flexGrow: 1, justifyContent: "center", paddingVertical: tokens.spacing.xl },
        card: { backgroundColor: tokens.colors.surface, borderRadius: tokens.radius.lg, padding: tokens.spacing.lg, borderWidth: 1, borderColor: tokens.colors.border, alignItems: "center" },
        header: { alignItems: "center", gap: 8 },
        iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: tokens.colors.primary, alignItems: "center", justifyContent: "center" },
        title: { fontSize: tokens.fontSize.lg, fontWeight: "800", color: tokens.colors.text, marginTop: 8 },
        message: { marginTop: 12, color: tokens.colors.textSecondary },
        email: { marginTop: 8, fontSize: tokens.fontSize.md, color: tokens.colors.text, fontWeight: "700" },
        button: { marginTop: 18, backgroundColor: tokens.colors.primary, paddingHorizontal: 18, paddingVertical: 12, borderRadius: tokens.radius.md, alignItems: "center" },
        buttonText: { color: tokens.colors.textInverse, fontWeight: "800" },
        secondaryButton: { marginTop: 12, height: 44, borderRadius: tokens.radius.md, backgroundColor: tokens.colors.surfaceAlt, borderWidth: 1, borderColor: tokens.colors.border, alignItems: "center", justifyContent: "center", paddingHorizontal: 12 },
        secondaryButtonText: { color: tokens.colors.text, fontWeight: "700" },
        link: { marginTop: 12 },
        linkText: { color: tokens.colors.primary, fontWeight: "700" },
    });
}
