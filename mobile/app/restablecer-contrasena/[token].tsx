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
import { theme } from "../../src/shared/theme";

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

function renderLoadingState() {
    return (
        <View style={styles.centerState}>
            <ActivityIndicator color={theme.colors.primary} />
            <Text style={styles.stateText}>Verificando enlace...</Text>
        </View>
    );
}

function renderInvalidState(message: string) {
    return (
        <View style={styles.centerState}>
            <Ionicons name="alert-circle-outline" size={26} color={theme.colors.error} />
            <Text style={styles.errorCenterText}>{message}</Text>
            <Link href="/(auth)/forgot-password" style={styles.recoveryLink}>
                Solicitar nuevo enlace
            </Link>
        </View>
    );
}

function renderSuccessState(message: string) {
    return (
        <View style={styles.centerState}>
            <Ionicons name="checkmark-circle-outline" size={26} color={theme.colors.success} />
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

    let content: ReactNode;
    if (tokenState.loading) {
        content = renderLoadingState();
    } else if (!tokenState.isValid) {
        content = renderInvalidState(tokenState.error ?? "Enlace inválido o expirado");
    } else if (submitSuccess) {
        content = renderSuccessState(submitSuccess);
    } else {
        content = (
            <>
                <Text style={styles.subtitle}>
                    Hola {tokenState.userName}, crea una nueva contraseña segura para {tokenState.email || "tu cuenta"}.
                </Text>

                <Text style={styles.label}>Nueva contraseña</Text>
                <View style={styles.inputGroup}>
                    <View style={styles.inputIconWrap}>
                        <Ionicons name="lock-closed-outline" size={16} color={theme.colors.textInverse} />
                    </View>
                    <TextInput
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry={!showPassword}
                        placeholder="********"
                        placeholderTextColor={theme.colors.textTertiary}
                        style={styles.input}
                    />
                    <Pressable style={styles.eyeButton} onPress={() => setShowPassword((v) => !v)}>
                        <Ionicons
                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                            size={18}
                            color={theme.colors.textSecondary}
                        />
                    </Pressable>
                </View>

                <Text style={styles.label}>Confirmar contraseña</Text>
                <View style={styles.inputGroup}>
                    <View style={styles.inputIconWrap}>
                        <Ionicons name="lock-closed-outline" size={16} color={theme.colors.textInverse} />
                    </View>
                    <TextInput
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        placeholder="********"
                        placeholderTextColor={theme.colors.textTertiary}
                        style={styles.input}
                    />
                    <Pressable style={styles.eyeButton} onPress={() => setShowConfirmPassword((v) => !v)}>
                        <Ionicons
                            name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                            size={18}
                            color={theme.colors.textSecondary}
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
                        <ActivityIndicator color={theme.colors.textInverse} />
                    ) : (
                        <Text style={styles.buttonPrimaryText}>Restablecer contraseña</Text>
                    )}
                </Pressable>
            </>
        );
    }

    return (
        <ImageBackground
            source={{ uri: "https://i.imgur.com/eMavQXu.png" }}
            style={styles.heroBackground}
            resizeMode="cover"
        >
            <View style={styles.overlay} />

            <Pressable style={styles.homeButton} onPress={() => router.replace("/home")}>
                <Ionicons name="home-outline" color={theme.colors.textInverse} size={20} />
            </Pressable>

            <View style={styles.card}>
                <View style={styles.logoWrap}>
                    <Image source={require("../../assets/brand/logo.png")} style={styles.logo} resizeMode="contain" />
                    <Text style={styles.title}>Restablecer Contraseña</Text>
                </View>
                {content}
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    heroBackground: {
        flex: 1,
        justifyContent: "center",
        padding: theme.spacing.lg,
    },
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.22)",
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
        backgroundColor: theme.colors.primary,
    },
    card: {
        backgroundColor: theme.colors.bgPrimary,
        borderTopWidth: 6,
        borderTopColor: theme.colors.primary,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        ...theme.shadow.md,
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
        color: theme.colors.primary,
    },
    subtitle: {
        marginTop: 8,
        marginBottom: theme.spacing.sm,
        textAlign: "center",
        color: theme.colors.textSecondary,
        lineHeight: 18,
    },
    centerState: {
        alignItems: "center",
        gap: 8,
        paddingVertical: theme.spacing.md,
    },
    stateText: {
        color: theme.colors.textSecondary,
        fontWeight: "700",
        textAlign: "center",
    },
    errorCenterText: {
        color: theme.colors.error,
        fontWeight: "700",
        textAlign: "center",
    },
    successCenterText: {
        color: theme.colors.success,
        fontWeight: "700",
        textAlign: "center",
    },
    recoveryLink: {
        color: theme.colors.primary,
        fontWeight: "900",
        marginTop: 4,
    },
    label: {
        fontSize: 13,
        fontWeight: "700",
        marginTop: theme.spacing.sm,
        color: theme.colors.textSecondary,
    },
    inputGroup: {
        marginTop: 6,
        borderWidth: 1,
        borderColor: theme.colors.borderSecondary,
        borderRadius: theme.radius.sm,
        flexDirection: "row",
        alignItems: "center",
        overflow: "hidden",
        backgroundColor: theme.colors.bgPrimary,
    },
    inputIconWrap: {
        width: 44,
        height: 44,
        backgroundColor: theme.colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    input: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: theme.colors.textPrimary,
    },
    eyeButton: {
        paddingHorizontal: 12,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.bgTertiary,
    },
    passwordRulesBox: {
        marginTop: 8,
        padding: 10,
        borderRadius: theme.radius.sm,
        backgroundColor: theme.colors.bgSecondary,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        gap: 4,
    },
    passwordRuleText: {
        color: theme.colors.textSecondary,
        fontWeight: "700",
        fontSize: 12,
    },
    error: {
        color: theme.colors.error,
        marginTop: 8,
        fontWeight: "700",
    },
    buttonPrimary: {
        backgroundColor: theme.colors.utaPrimary,
        paddingVertical: 12,
        borderRadius: theme.radius.sm,
        marginTop: theme.spacing.md,
        alignItems: "center",
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonPrimaryText: {
        color: theme.colors.textInverse,
        fontWeight: "800",
    },
});
