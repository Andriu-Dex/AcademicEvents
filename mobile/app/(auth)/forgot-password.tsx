import { useState } from "react";
import { useRouter } from "expo-router";
import {
    ActivityIndicator,
    Image,
    ImageBackground,
    Linking,
    Pressable,

    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { requestPasswordRecovery } from "../../src/api/passwordRecovery";
import { useAppTheme } from "../../src/shared";

function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function openGmailOrMail() {
    const gmailUrl = "googlegmail://";
    const canOpenGmail = await Linking.canOpenURL(gmailUrl);

    if (canOpenGmail) {
        await Linking.openURL(gmailUrl);
        return;
    }

    await Linking.openURL("mailto:");
}

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const { tokens, mode, toggleTheme } = useAppTheme();
    const styles = createStyles(tokens);

    const submit = async () => {
        setError(null);
        setSuccessMessage(null);

        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail) {
            setError("Por favor, ingrese su correo electrónico");
            return;
        }

        if (!isValidEmail(normalizedEmail)) {
            setError("Por favor, ingrese un correo electrónico válido");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await requestPasswordRecovery(normalizedEmail);
            setSuccessMessage(response.message || "Instrucciones enviadas correctamente");
        } catch (requestError) {
            const message = requestError instanceof Error ? requestError.message : "No se pudo enviar el correo";
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const instructionVisible = Boolean(successMessage);

    return (
        <ImageBackground
            source={{ uri: "https://i.imgur.com/eMavQXu.png" }}
            style={styles.heroBackground}
            resizeMode="cover"
        >
            <View style={styles.overlay} />
            <Pressable style={styles.homeButton} onPress={() => router.replace("/home")}>
                <Ionicons name="home-outline" color={tokens.colors.textInverse} size={20} />
            </Pressable>

            <Pressable style={styles.themeToggle} onPress={() => toggleTheme()}>
                <Ionicons name={mode === "dark" ? "moon" : "sunny"} size={16} color={tokens.colors.textInverse} />
            </Pressable>

            <View style={styles.card}>
                <View style={styles.logoWrap}>
                    <Image source={require("../../assets/brand/logo.png")} style={styles.logo} resizeMode="contain" />
                    <Text style={styles.title}>Recuperación de Contraseña</Text>
                    <Text style={styles.subtitle}>
                        Ingrese su correo para recibir el enlace de recuperación.
                    </Text>
                </View>

                <Text style={styles.label}>Correo electrónico</Text>
                <View style={styles.inputGroup}>
                    <View style={styles.inputIconWrap}>
                        <Ionicons name="mail-outline" size={16} color={tokens.colors.textInverse} />
                    </View>
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        placeholder="usuario@uta.edu.ec"
                        placeholderTextColor={tokens.colors.textTertiary}
                        style={styles.input}
                    />
                </View>

                {error ? <Text style={styles.error}>{error}</Text> : null}
                {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}

                <Pressable
                    style={[styles.buttonPrimary, isSubmitting && styles.buttonDisabled]}
                    onPress={submit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color={tokens.colors.textInverse} />
                    ) : (
                        <Text style={styles.buttonPrimaryText}>Enviar instrucciones</Text>
                    )}
                </Pressable>

                {instructionVisible ? (
                    <View style={styles.instructionsCard}>
                        <Text style={styles.instructionsTitle}>Revise su correo electrónico</Text>
                        <Text style={styles.instructionsText}>Hemos enviado instrucciones para restablecer su contraseña a:</Text>
                        <Text style={styles.emailHighlight}>{email.trim().toLowerCase()}</Text>

                        <Text style={styles.sectionTitle}>Próximos pasos:</Text>
                        <Text style={styles.instructionsText}>1. Revise su bandeja de entrada y carpeta de spam</Text>
                        <Text style={styles.instructionsText}>2. Haga clic en el enlace del correo</Text>
                        <Text style={styles.instructionsText}>3. Cree una nueva contraseña segura</Text>

                        <Text style={styles.sectionTitle}>Importante:</Text>
                        <Text style={styles.instructionsText}>
                            El enlace enviado será válido durante 2 horas. Si no lo utiliza en este tiempo, deberá solicitar uno nuevo.
                        </Text>

                        <Pressable style={styles.mailButton} onPress={openGmailOrMail}>
                            <Ionicons name="mail-open-outline" size={16} color={tokens.colors.primary} />
                            <Text style={styles.mailButtonText}>Abrir Gmail / correo</Text>
                        </Pressable>
                    </View>
                ) : null}

                <View style={styles.loginRow}>
                    <Link href="/(auth)/login" style={styles.loginLink}>
                        Volver al inicio de sesión
                    </Link>
                </View>
            </View>
        </ImageBackground>
    );
}

function createStyles(tokens: typeof import("../../src/shared").theme) {
    return StyleSheet.create({
        heroBackground: {
            flex: 1,
            justifyContent: "center",
            padding: tokens.spacing.lg,
        },
        overlay: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: tokens.colors.overlayBlack22,
        },
        homeButton: {
            position: "absolute",
            right: 20,
            top: 56,
            zIndex: 3,
            width: 42,
            height: 42,
            borderRadius: 21,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: tokens.colors.primary,
        },
        themeToggle: {
            position: "absolute",
            right: 68,
            top: 56,
            zIndex: 3,
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: tokens.colors.navbarControlBg,
            borderWidth: 1,
            borderColor: tokens.colors.overlayWhite20,
        },
        card: {
            backgroundColor: tokens.colors.bgPrimary,
            borderTopWidth: 6,
            borderTopColor: tokens.colors.primary,
            borderRadius: tokens.radius.lg,
            padding: tokens.spacing.lg,
            ...tokens.shadow.md,
        },
        logoWrap: {
            alignItems: "center",
            marginBottom: 8,
        },
        logo: {
            width: 86,
            height: 86,
            marginBottom: 8,
        },
        title: {
            fontSize: 24,
            fontWeight: "700",
            textAlign: "center",
            color: tokens.colors.primary,
        },
        subtitle: {
            marginTop: 8,
            textAlign: "center",
            color: tokens.colors.textSecondary,
            lineHeight: 18,
        },
        label: {
            fontSize: 13,
            fontWeight: "700",
            marginTop: tokens.spacing.sm,
            color: tokens.colors.textSecondary,
        },
        inputGroup: {
            marginTop: 6,
            borderWidth: 1,
            borderColor: tokens.colors.borderSecondary,
            borderRadius: tokens.radius.sm,
            flexDirection: "row",
            alignItems: "center",
            overflow: "hidden",
            backgroundColor: tokens.colors.bgPrimary,
        },
        inputIconWrap: {
            width: 44,
            height: 44,
            backgroundColor: tokens.colors.primary,
            alignItems: "center",
            justifyContent: "center",
        },
        input: {
            flex: 1,
            paddingHorizontal: 12,
            paddingVertical: 10,
            color: tokens.colors.textPrimary,
        },
        error: {
            color: tokens.colors.error,
            marginTop: 8,
            fontWeight: "700",
        },
        success: {
            color: tokens.colors.success,
            marginTop: 8,
            fontWeight: "700",
        },
        buttonPrimary: {
            backgroundColor: tokens.colors.utaPrimary,
            paddingVertical: 12,
            borderRadius: tokens.radius.sm,
            marginTop: tokens.spacing.md,
            alignItems: "center",
        },
        buttonDisabled: {
            opacity: 0.7,
        },
        buttonPrimaryText: {
            color: tokens.colors.textInverse,
            fontWeight: "800",
        },
        instructionsCard: {
            marginTop: tokens.spacing.md,
            padding: tokens.spacing.md,
            borderRadius: tokens.radius.md,
            borderWidth: 1,
            borderColor: tokens.colors.borderPrimary,
            backgroundColor: tokens.colors.bgSecondary,
            gap: 6,
        },
        instructionsTitle: {
            color: tokens.colors.textPrimary,
            fontWeight: "900",
        },
        instructionsText: {
            color: tokens.colors.textSecondary,
            fontWeight: "700",
        },
        emailHighlight: {
            color: tokens.colors.primary,
            fontWeight: "900",
        },
        sectionTitle: {
            marginTop: 4,
            color: tokens.colors.textPrimary,
            fontWeight: "900",
        },
        mailButton: {
            marginTop: 6,
            height: 40,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: tokens.colors.primary,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            backgroundColor: tokens.colors.bgPrimary,
        },
        mailButtonText: {
            color: tokens.colors.primary,
            fontWeight: "900",
        },
        loginRow: {
            marginTop: tokens.spacing.md,
            alignItems: "center",
        },
        loginLink: {
            color: tokens.colors.primary,
            fontWeight: "800",
        },
    });
}
