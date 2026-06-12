import { useEffect, useMemo, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { ActivityIndicator, Alert, ImageBackground, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { resendVerification, verifyEmailCode } from "../../src/api/verification";
import { useAppTheme } from "../../src/shared";
import { useAuthStore } from "../../src/store/authStore";

const PENDING_EMAIL_KEY = "academicevents.verificationPendingEmail";
const PENDING_CAREER_KEY = "academicevents.verificationPendingCareerId";
const OTP_LENGTH = 6;

async function persistPendingVerification(email: string, careerId: string | null) {
    await SecureStore.setItemAsync(PENDING_EMAIL_KEY, email);
    if (careerId) {
        await SecureStore.setItemAsync(PENDING_CAREER_KEY, careerId);
    }
}

export default function VerificationPendingScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { tokens } = useAppTheme();
    const styles = createStyles(tokens as any);
    const setSession = useAuthStore((s) => s.setSession);

    const incomingEmail = useMemo(() => {
        const val = params.email;
        if (!val) return null;
        return Array.isArray(val) ? val[0] : val;
    }, [params.email]);

    const [email, setEmail] = useState<string | null>(null);
    const [careerId, setCareerId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [codeError, setCodeError] = useState("");

    // OTP state
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const inputRefs = useRef<(TextInput | null)[]>([]);

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
                    if (storedEmail) {
                        await persistPendingVerification(storedEmail, storedCareer || null);
                    }
                }
            } catch {
                if (mounted) router.replace("/(auth)/login");
            }
        })();
        return () => {
            mounted = false;
        };
    }, [incomingEmail, router]);

    const handleOtpChange = (index: number, value: string) => {
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setCodeError("");

        // Auto-advance to next input
        if (value && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all digits filled
        if (newOtp.every((d) => d !== "")) {
            handleVerifyCode(newOtp.join(""));
        }
    };

    const handleOtpKeyPress = (index: number, key: string) => {
        if (key === "Backspace" && !otp[index] && index > 0) {
            const newOtp = [...otp];
            newOtp[index - 1] = "";
            setOtp(newOtp);
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyCode = async (code: string) => {
        if (!email || code.length !== OTP_LENGTH) return;

        setVerifying(true);
        setCodeError("");

        try {
            const res = await verifyEmailCode(email, code);

            if (res.success) {
                // Auto-login
                if (res.authToken && res.user) {
                    await setSession(res.authToken, res.user);
                    await SecureStore.deleteItemAsync(PENDING_EMAIL_KEY);
                    await SecureStore.deleteItemAsync(PENDING_CAREER_KEY);
                    Alert.alert("¡Verificado!", "Tu correo ha sido verificado exitosamente.", [
                        { text: "Continuar", onPress: () => router.replace("/(tabs)") },
                    ]);
                } else {
                    Alert.alert("¡Verificado!", res.message ?? "Correo verificado.", [
                        { text: "Ir al login", onPress: () => router.replace("/(auth)/login") },
                    ]);
                }
            } else {
                setCodeError(res.message ?? "Código inválido");
                // Reset OTP on error
                setOtp(Array(OTP_LENGTH).fill(""));
                inputRefs.current[0]?.focus();
            }
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Error al verificar";
            setCodeError(msg);
            setOtp(Array(OTP_LENGTH).fill(""));
            inputRefs.current[0]?.focus();
        } finally {
            setVerifying(false);
        }
    };

    const handleResend = async () => {
        if (!email) return;
        setLoading(true);
        setCodeError("");
        try {
            const res = await resendVerification(email);
            Alert.alert(res.success ? "Listo" : "Error", res.message ?? "Solicitud procesada");
            if (res.success) {
                // Reset OTP inputs
                setOtp(Array(OTP_LENGTH).fill(""));
                inputRefs.current[0]?.focus();
            }
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
                            <Ionicons name="shield-checkmark-outline" size={22} color={tokens.colors.textInverse} />
                        </View>
                        <Text style={styles.title}>Verificar tu correo</Text>
                    </View>

                    <Text style={styles.message}>Ingresa el código de 6 dígitos enviado a:</Text>
                    <Text style={styles.email}>{email ?? "..."}</Text>

                    {/* OTP Inputs */}
                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                style={[
                                    styles.otpInput,
                                    digit ? styles.otpInputFilled : null,
                                    codeError ? styles.otpInputError : null,
                                ]}
                                value={digit}
                                onChangeText={(val) => handleOtpChange(index, val)}
                                onKeyPress={({ nativeEvent }) => handleOtpKeyPress(index, nativeEvent.key)}
                                keyboardType="number-pad"
                                maxLength={1}
                                selectTextOnFocus
                                editable={!verifying}
                            />
                        ))}
                    </View>

                    {/* Error message */}
                    {codeError ? (
                        <Text style={styles.errorText}>{codeError}</Text>
                    ) : null}

                    {/* Verifying indicator */}
                    {verifying ? (
                        <View style={styles.verifyingRow}>
                            <ActivityIndicator size="small" color={tokens.colors.primary} />
                            <Text style={styles.verifyingText}>Verificando código...</Text>
                        </View>
                    ) : null}

                    <Text style={styles.expiryText}>⏱️ El código caduca en 15 minutos</Text>

                    <Pressable style={styles.button} onPress={handleResend} disabled={loading || verifying}>
                        {loading ? <ActivityIndicator color={tokens.colors.textInverse} /> : <Text style={styles.buttonText}>Reenviar código</Text>}
                    </Pressable>

                    <Pressable
                        style={styles.secondaryButton}
                        onPress={() =>
                            router.push({
                                pathname: "/(auth)/correct-email",
                                params: {
                                    email: email ?? undefined,
                                    careerId: careerId ?? undefined,
                                },
                            })
                        }
                    >
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
        message: { marginTop: 12, color: tokens.colors.textSecondary, textAlign: "center" },
        email: { marginTop: 8, fontSize: tokens.fontSize.md, color: tokens.colors.text, fontWeight: "700" },
        // OTP styles
        otpContainer: { flexDirection: "row", gap: 8, marginTop: 20, marginBottom: 8 },
        otpInput: {
            width: 46,
            height: 56,
            borderWidth: 2,
            borderColor: tokens.colors.border,
            borderRadius: tokens.radius.md,
            textAlign: "center",
            fontSize: 22,
            fontWeight: "700",
            fontFamily: "monospace",
            color: tokens.colors.text,
            backgroundColor: tokens.colors.surface,
        },
        otpInputFilled: { borderColor: tokens.colors.primary, backgroundColor: `${tokens.colors.primary}10` },
        otpInputError: { borderColor: "#dc3545" },
        errorText: { color: "#dc3545", fontWeight: "600", marginTop: 6, textAlign: "center", fontSize: 13 },
        verifyingRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
        verifyingText: { color: tokens.colors.primary, fontWeight: "600" },
        expiryText: { marginTop: 12, color: tokens.colors.textSecondary, fontSize: 13 },
        button: { marginTop: 18, backgroundColor: tokens.colors.primary, paddingHorizontal: 18, paddingVertical: 12, borderRadius: tokens.radius.md, alignItems: "center", width: "100%" },
        buttonText: { color: tokens.colors.textInverse, fontWeight: "800" },
        secondaryButton: { marginTop: 12, height: 44, borderRadius: tokens.radius.md, backgroundColor: tokens.colors.surfaceAlt, borderWidth: 1, borderColor: tokens.colors.border, alignItems: "center", justifyContent: "center", paddingHorizontal: 12, width: "100%" },
        secondaryButtonText: { color: tokens.colors.text, fontWeight: "700" },
        link: { marginTop: 12 },
        linkText: { color: tokens.colors.primary, fontWeight: "700" },
    });
}
