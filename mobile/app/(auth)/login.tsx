import { useEffect, useRef, useState } from "react";
import { Link, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    ActivityIndicator,
    Animated,
    Image,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { login } from "../../src/api/auth";
import { getCurrentApiBaseUrl } from "../../src/api/client";
import { useAuthStore } from "../../src/store/authStore";
import { isAdminRole } from "../../src/utils/roles";
import { useFacultyInfo } from "../../src/features/faculty/useFacultyInfo";
import { theme } from "../../src/shared/theme";

const loginSchema = z.object({
    email: z.email("Correo inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
    const router = useRouter();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const setSession = useAuthStore((state) => state.setSession);
    const { data: faculty } = useFacultyInfo();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(24)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, slideAnim]);

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: LoginForm) => {
        setSubmitError(null);
        try {
            const result = await login(values.email, values.password);
            await setSession(result.token, result.user);
            router.replace(isAdminRole(result.user.role) ? "/(admin)" : "/(app)");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Error al iniciar sesión";
            const apiHint = __DEV__ ? `\nAPI: ${getCurrentApiBaseUrl()}` : "";
            setSubmitError(`${message}${apiHint}`);
        }
    };

    return (
        <ImageBackground
            source={{ uri: "https://i.imgur.com/eMavQXu.png" }}
            style={styles.heroBackground}
            resizeMode="cover"
        >
            <View style={styles.overlay} />
            <Pressable style={styles.homeButton} onPress={() => router.replace("/home")}>
                <Ionicons name="home" color={theme.colors.textInverse} size={18} />
            </Pressable>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <Animated.View
                        style={[
                            styles.card,
                            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                        ]}
                    >
                        {/* Logo y nombre facultad */}
                        <View style={styles.logoWrap}>
                            <View style={styles.logoCircle}>
                                {faculty?.logo ? (
                                    <Image
                                        source={{ uri: faculty.logo }}
                                        style={styles.facultyLogo}
                                        resizeMode="contain"
                                    />
                                ) : (
                                    <Text style={styles.facultyLogoPlaceholderText}>FISEI</Text>
                                )}
                            </View>
                            <Text style={styles.facultyTitle} numberOfLines={2}>
                                {faculty?.title ?? "Facultad de Ingeniería en Sistemas, Electrónica e Industrial"}
                            </Text>
                        </View>

                        <Text style={styles.title}>Iniciar Sesión</Text>
                        <Text style={styles.subtitle}>Accede a tu cuenta institucional</Text>

                        {/* Campo correo */}
                        <Text style={styles.label}>Correo electrónico</Text>
                        <Controller
                            control={control}
                            name="email"
                            render={({ field: { onChange, value } }) => (
                                <View style={[styles.inputGroup, errors.email && styles.inputGroupError]}>
                                    <View style={styles.inputIconWrap}>
                                        <Ionicons name="at-outline" size={18} color={theme.colors.primary} />
                                    </View>
                                    <TextInput
                                        style={styles.input}
                                        value={value}
                                        onChangeText={onChange}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        placeholder="usuario@uta.edu.ec"
                                        placeholderTextColor={theme.colors.textTertiary}
                                    />
                                </View>
                            )}
                        />
                        {errors.email && (
                            <View style={styles.errorRow}>
                                <Ionicons name="alert-circle-outline" size={13} color={theme.colors.error} />
                                <Text style={styles.error}>{errors.email.message}</Text>
                            </View>
                        )}

                        {/* Campo contraseña */}
                        <Text style={styles.label}>Contraseña</Text>
                        <Controller
                            control={control}
                            name="password"
                            render={({ field: { onChange, value } }) => (
                                <View style={[styles.inputGroup, errors.password && styles.inputGroupError]}>
                                    <View style={styles.inputIconWrap}>
                                        <Ionicons name="lock-closed-outline" size={18} color={theme.colors.primary} />
                                    </View>
                                    <TextInput
                                        style={styles.input}
                                        value={value}
                                        onChangeText={onChange}
                                        secureTextEntry={!showPassword}
                                        placeholder="••••••••"
                                        placeholderTextColor={theme.colors.textTertiary}
                                    />
                                    <Pressable
                                        style={styles.eyeButton}
                                        onPress={() => setShowPassword((prev) => !prev)}
                                    >
                                        <Ionicons
                                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                                            size={18}
                                            color={theme.colors.textSecondary}
                                        />
                                    </Pressable>
                                </View>
                            )}
                        />
                        {errors.password && (
                            <View style={styles.errorRow}>
                                <Ionicons name="alert-circle-outline" size={13} color={theme.colors.error} />
                                <Text style={styles.error}>{errors.password.message}</Text>
                            </View>
                        )}

                        {submitError && (
                            <View style={styles.errorBox}>
                                <Ionicons name="warning-outline" size={16} color={theme.colors.error} />
                                <Text style={styles.errorBoxText}>{submitError}</Text>
                            </View>
                        )}

                        <Pressable style={styles.forgotWrap} onPress={() => router.push("/(auth)/forgot-password")}>
                            <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
                        </Pressable>

                        <Pressable
                            style={[styles.buttonPrimary, isSubmitting && styles.buttonDisabled]}
                            onPress={handleSubmit(onSubmit)}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#ffffff" />
                            ) : (
                                <>
                                    <Ionicons name="log-in-outline" size={18} color={theme.colors.textInverse} />
                                    <Text style={styles.buttonPrimaryText}>Iniciar sesión</Text>
                                </>
                            )}
                        </Pressable>

                        <View style={styles.dividerRow}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>o</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <Pressable
                            style={styles.buttonSecondary}
                            onPress={() => router.push("/(auth)/register")}
                        >
                            <Text style={styles.buttonSecondaryText}>Crear una cuenta nueva</Text>
                        </Pressable>

                        <Text style={styles.copyright}>Universidad Técnica de Ambato © 2026</Text>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    heroBackground: {
        flex: 1,
    },
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(10,5,15,0.45)",
    },
    homeButton: {
        position: "absolute",
        right: 18,
        top: Platform.OS === "ios" ? 56 : 36,
        zIndex: 3,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(138, 21, 56, 0.85)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: theme.spacing.lg,
        paddingTop: 70,
        paddingBottom: theme.spacing.xl,
    },
    card: {
        backgroundColor: theme.colors.bgPrimary,
        borderRadius: theme.radius.xl,
        padding: theme.spacing.lg,
        ...theme.shadow.lg,
    },
    logoWrap: {
        alignItems: "center",
        marginBottom: theme.spacing.md,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.bgSecondary,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 3,
        borderColor: theme.colors.primaryLight,
        overflow: "hidden",
    },
    facultyLogo: {
        width: 76,
        height: 76,
    },
    facultyLogoPlaceholderText: {
        color: theme.colors.primary,
        fontWeight: "900",
        fontSize: 16,
        letterSpacing: 1,
    },
    facultyTitle: {
        marginTop: 10,
        textAlign: "center",
        fontSize: 12,
        color: theme.colors.textSecondary,
        fontWeight: "600",
        lineHeight: 17,
        paddingHorizontal: theme.spacing.sm,
    },
    title: {
        fontSize: 26,
        fontWeight: "800",
        textAlign: "center",
        color: theme.colors.textPrimary,
        letterSpacing: 0.1,
    },
    subtitle: {
        textAlign: "center",
        color: theme.colors.textSecondary,
        fontSize: 13,
        marginTop: 4,
        marginBottom: theme.spacing.md,
    },
    label: {
        fontSize: 13,
        fontWeight: "700",
        marginTop: theme.spacing.sm,
        marginBottom: 6,
        color: theme.colors.textPrimary,
    },
    inputGroup: {
        height: 52,
        borderWidth: 1.5,
        borderColor: theme.colors.borderPrimary,
        borderRadius: theme.radius.sm,
        flexDirection: "row",
        alignItems: "center",
        overflow: "hidden",
        backgroundColor: theme.colors.bgSecondary,
    },
    inputGroupError: {
        borderColor: theme.colors.error,
        backgroundColor: theme.colors.errorLight,
    },
    inputIconWrap: {
        width: 46,
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        borderRightWidth: 1,
        borderRightColor: theme.colors.borderLight,
        backgroundColor: "transparent",
    },
    input: {
        flex: 1,
        paddingHorizontal: 12,
        color: theme.colors.textPrimary,
        fontSize: 15,
        fontWeight: "500",
    },
    eyeButton: {
        paddingHorizontal: 14,
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    errorRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginTop: 5,
    },
    error: {
        color: theme.colors.error,
        fontSize: 12,
        fontWeight: "600",
    },
    errorBox: {
        marginTop: theme.spacing.sm,
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
        backgroundColor: theme.colors.errorLight,
        borderRadius: theme.radius.sm,
        padding: theme.spacing.sm,
        borderWidth: 1,
        borderColor: "rgba(239,68,68,0.2)",
    },
    errorBoxText: {
        flex: 1,
        color: theme.colors.error,
        fontSize: 12,
        fontWeight: "600",
        lineHeight: 18,
    },
    forgotWrap: {
        marginTop: theme.spacing.sm,
        alignItems: "flex-end",
        marginBottom: theme.spacing.sm,
    },
    forgotText: {
        color: theme.colors.primary,
        fontSize: 13,
        fontWeight: "600",
    },
    buttonPrimary: {
        backgroundColor: theme.colors.utaPrimary,
        height: 52,
        borderRadius: theme.radius.sm,
        marginTop: 4,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
        ...theme.shadow.primary,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonPrimaryText: {
        color: theme.colors.textInverse,
        fontWeight: "800",
        fontSize: 15,
        letterSpacing: 0.3,
    },
    dividerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginVertical: theme.spacing.md,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: theme.colors.borderPrimary,
    },
    dividerText: {
        color: theme.colors.textTertiary,
        fontWeight: "600",
        fontSize: 13,
    },
    buttonSecondary: {
        height: 50,
        borderRadius: theme.radius.sm,
        borderWidth: 1.5,
        borderColor: theme.colors.borderSecondary,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.bgPrimary,
    },
    buttonSecondaryText: {
        color: theme.colors.textPrimary,
        fontWeight: "700",
        fontSize: 14,
    },
    registerRow: {
        marginTop: theme.spacing.md,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    registerText: {
        color: theme.colors.textSecondary,
    },
    link: {
        color: theme.colors.primary,
        fontWeight: "700",
    },
    copyright: {
        marginTop: theme.spacing.md,
        textAlign: "center",
        fontSize: 11,
        color: theme.colors.textTertiary,
    },
});
