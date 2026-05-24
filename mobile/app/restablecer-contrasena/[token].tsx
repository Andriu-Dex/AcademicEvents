import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import {
    ActivityIndicator,
    Image,
    ImageBackground,
    Pressable,

    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { resetPasswordWithToken, validateRecoveryToken } from "../../src/api/passwordRecovery";
import { useAppTheme } from "../../src/shared";

type TokenState = {
    loading: boolean;
    isValid: boolean;
    userName: string;
    email: string;
    error: string | null;
};

const INITIAL_TOKEN_STATE: TokenState = {
    loading: true,
    isValid: false,
    userName: "",
    email: "",
    error: null,
};

function validatePasswordRules(password: string) {
    const errors: string[] = [];
    if (password.length < 8) errors.push("Mínimo 8 caracteres");
    if (!/[A-Z]/.test(password)) errors.push("Debe incluir al menos una mayúscula");
    if (!/[a-z]/.test(password)) errors.push("Debe incluir al menos una minúscula");
    if (!/\d/.test(password)) errors.push("Debe incluir al menos un número");
    if (!/[!@#$%^&*()_+=\-[\]{};':"\\|,.<>/?]/.test(password)) {
        errors.push("Debe incluir al menos un carácter especial");
    }
    if (/\s/.test(password)) errors.push("No debe contener espacios");
    return errors;
}

function createInvalidTokenState(message: string): TokenState {
    return {
        loading: false,
        isValid: false,
        userName: "",
        email: "",
        error: message,
    };
}

function createValidTokenState(userName?: string, email?: string): TokenState {
    return {
        loading: false,
        isValid: true,
        userName: userName ?? "Usuario",
        email: email ?? "",
        error: null,
    };
}

function renderLoadingState(tokens: any, styles: any) {
    return (
        <View style={styles.centerState}>
            <ActivityIndicator color={tokens.colors.primary} />
            <Text style={styles.stateText}>Verificando enlace...</Text>
        </View>
    );
}

function renderInvalidState(message: string, tokens: any, styles: any) {
    return (
        <View style={styles.centerState}>
            <Ionicons name="alert-circle-outline" size={26} color={tokens.colors.error} />
            <Text style={styles.errorCenterText}>{message}</Text>
            <Link href="/(auth)/forgot-password" style={styles.recoveryLink}>
                Solicitar nuevo enlace
            </Link>
        </View>
    );
}

function renderSuccessState(message: string, tokens: any, styles: any) {
    return (
        <View style={styles.centerState}>
            <Ionicons name="checkmark-circle-outline" size={26} color={tokens.colors.success} />
            <Text style={styles.successCenterText}>{message}</Text>
            <Text style={styles.stateText}>Redirigiendo al inicio de sesión...</Text>
        </View>
    );
}

export default function ResetPasswordWithTokenScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ token?: string }>();
    const token = (params.token ?? "").trim();

    const [tokenState, setTokenState] = useState<TokenState>(INITIAL_TOKEN_STATE);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

    const { tokens } = useAppTheme();
    const styles = createStyles(tokens);

    useEffect(() => {
        let mounted = true;

        const runValidation = async () => {
            if (!token) {
                if (mounted) {
                    setTokenState(createInvalidTokenState("Enlace inválido. Falta el token de recuperación."));
                }
                return;
            }

            try {
                const result = await validateRecoveryToken(token);
                if (!mounted) return;
                if (result.success) {
                    setTokenState(createValidTokenState(result.userName, result.email));
                    return;
                }

                setTokenState(createInvalidTokenState("Token inválido o expirado"));
            } catch (error) {
                const message = error instanceof Error ? error.message : "Token inválido o expirado";
                if (!mounted) return;
                setTokenState(createInvalidTokenState(message));
            }
        };

        runValidation();
        return () => {
            mounted = false;
        };
    }, [token]);

    const passwordErrors = useMemo(() => validatePasswordRules(newPassword), [newPassword]);

    const submit = async () => {
        setSubmitError(null);
        setSubmitSuccess(null);

        if (!tokenState.isValid || !token) {
            setSubmitError("El token no es válido.");
            return;
        }

        if (passwordErrors.length > 0) {
            setSubmitError("La contraseña no cumple con los requisitos de seguridad.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setSubmitError("Las contraseñas no coinciden.");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await resetPasswordWithToken(token, newPassword, confirmPassword);
            setSubmitSuccess(result.message || "Contraseña restablecida con éxito");
            setTimeout(() => {
                router.replace("/(auth)/login");
            }, 1800);
        } catch (error) {
            const message = error instanceof Error ? error.message : "No se pudo restablecer la contraseña";
            setSubmitError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderPage = (pageContent: ReactNode) => (
        <ImageBackground
            source={{ uri: "https://i.imgur.com/eMavQXu.png" }}
            style={styles.heroBackground}
            resizeMode="cover"
        >
            <View style={styles.overlay} />

            <Pressable style={styles.homeButton} onPress={() => router.replace("/home")}>
                <Ionicons name="home-outline" color={tokens.colors.textInverse} size={20} />
            </Pressable>



            <View style={styles.card}>
                <View style={styles.logoWrap}>
                    <Image source={require("../../assets/brand/logo.png")} style={styles.logo} resizeMode="contain" />
                    <Text style={styles.title}>Restablecer Contraseña</Text>
                </View>
                {pageContent}
            </View>
        </ImageBackground>
    );

    if (tokenState.loading) return renderPage(renderLoadingState(tokens, styles));
    if (!tokenState.isValid) return renderPage(renderInvalidState(tokenState.error ?? "Enlace inválido o expirado", tokens, styles));
    if (submitSuccess) return renderPage(renderSuccessState(submitSuccess, tokens, styles));

    return renderPage(
        <>
            <Text style={styles.subtitle}>
                Hola {tokenState.userName}, crea una nueva contraseña segura para {tokenState.email || "tu cuenta"}.
            </Text>

            <Text style={styles.label}>Nueva contraseña</Text>
            <View style={styles.inputGroup}>
                <View style={styles.inputIconWrap}>
                    <Ionicons name="lock-closed-outline" size={16} color={tokens.colors.textInverse} />
                </View>
                <TextInput
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showPassword}
                    placeholder="********"
                    placeholderTextColor={tokens.colors.textTertiary}
                    style={styles.input}
                />
                <Pressable style={styles.eyeButton} onPress={() => setShowPassword((v) => !v)}>
                    <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={18}
                        color={tokens.colors.textSecondary}
                    />
                </Pressable>
            </View>

            <Text style={styles.label}>Confirmar contraseña</Text>
            <View style={styles.inputGroup}>
                <View style={styles.inputIconWrap}>
                    <Ionicons name="lock-closed-outline" size={16} color={tokens.colors.textInverse} />
                </View>
                <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    placeholder="********"
                    placeholderTextColor={tokens.colors.textTertiary}
                    style={styles.input}
                />
                <Pressable style={styles.eyeButton} onPress={() => setShowConfirmPassword((v) => !v)}>
                    <Ionicons
                        name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                        size={18}
                        color={tokens.colors.textSecondary}
                    />
                </Pressable>
            </View>

            {passwordErrors.length > 0 ? (
                <View style={styles.passwordRulesBox}>
                    {passwordErrors.map((error) => (
                        <Text key={error} style={styles.passwordRuleText}>
                            • {error}
                        </Text>
                    ))}
                </View>
            ) : null}

            {submitError ? <Text style={styles.error}>{submitError}</Text> : null}

            <Pressable
                style={[styles.buttonPrimary, isSubmitting && styles.buttonDisabled]}
                onPress={submit}
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <ActivityIndicator color={tokens.colors.textInverse} />
                ) : (
                    <Text style={styles.buttonPrimaryText}>Restablecer contraseña</Text>
                )}
            </Pressable>
        </>
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
            marginBottom: tokens.spacing.sm,
            textAlign: "center",
            color: tokens.colors.textSecondary,
            lineHeight: 18,
        },
        centerState: {
            alignItems: "center",
            gap: 8,
            paddingVertical: tokens.spacing.md,
        },
        stateText: {
            color: tokens.colors.textSecondary,
            fontWeight: "700",
            textAlign: "center",
        },
        errorCenterText: {
            color: tokens.colors.error,
            fontWeight: "700",
            textAlign: "center",
        },
        successCenterText: {
            color: tokens.colors.success,
            fontWeight: "700",
            textAlign: "center",
        },
        recoveryLink: {
            color: tokens.colors.primary,
            fontWeight: "900",
            marginTop: 4,
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
        eyeButton: {
            paddingHorizontal: 12,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: tokens.colors.bgTertiary,
        },
        passwordRulesBox: {
            marginTop: 8,
            padding: 10,
            borderRadius: tokens.radius.sm,
            backgroundColor: tokens.colors.bgSecondary,
            borderWidth: 1,
            borderColor: tokens.colors.borderPrimary,
            gap: 4,
        },
        passwordRuleText: {
            color: tokens.colors.textSecondary,
            fontWeight: "700",
            fontSize: 12,
        },
        error: {
            color: tokens.colors.error,
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
    });
}
