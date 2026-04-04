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
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { login } from "../../src/api/auth";
import { getCurrentApiBaseUrl } from "../../src/api/client";
import { useAuthStore } from "../../src/store/authStore";
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
    const slideAnim = useRef(new Animated.Value(18)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 450,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 450,
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
            router.replace("/(app)");
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
                <Ionicons name="home-outline" color={theme.colors.textInverse} size={20} />
            </Pressable>
            <Animated.View
                style={[
                    styles.card,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                ]}
            >
                <View style={styles.logoWrap}>
                    {faculty?.logo ? (
                        <Image
                            source={{ uri: faculty.logo }}
                            style={styles.facultyLogo}
                            resizeMode="contain"
                        />
                    ) : (
                        <View style={styles.facultyLogoPlaceholder}>
                            <Text style={styles.facultyLogoPlaceholderText}>FISEI</Text>
                        </View>
                    )}
                    <Text style={styles.facultyTitle} numberOfLines={2}>
                        {faculty?.title ?? "Facultad de Ingeniería en Sistemas, Electrónica e Industrial"}
                    </Text>
                </View>
                <Text style={styles.title}>Iniciar Sesión</Text>

                <Text style={styles.label}>Correo</Text>
                <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, value } }) => (
                        <View style={styles.inputGroup}>
                            <View style={styles.inputIconWrap}>
                                <Ionicons name="at-outline" size={16} color={theme.colors.textInverse} />
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
                    <Text style={styles.error}>{errors.email.message}</Text>
                )}

                <Text style={styles.label}>Contraseña</Text>
                <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, value } }) => (
                        <View style={styles.inputGroup}>
                            <View style={styles.inputIconWrap}>
                                <Ionicons name="lock-closed-outline" size={16} color={theme.colors.textInverse} />
                            </View>
                            <TextInput
                                style={styles.input}
                                value={value}
                                onChangeText={onChange}
                                secureTextEntry={!showPassword}
                                placeholder="********"
                                placeholderTextColor={theme.colors.textTertiary}
                            />
                            <Pressable
                                style={styles.eyeButton}
                                onPress={() => setShowPassword((prev) => !prev)}
                            >
                                {showPassword ? (
                                    <Ionicons name="eye-off-outline" size={18} color={theme.colors.textSecondary} />
                                ) : (
                                    <Ionicons name="eye-outline" size={18} color={theme.colors.textSecondary} />
                                )}
                            </Pressable>
                        </View>
                    )}
                />
                {errors.password && (
                    <Text style={styles.error}>{errors.password.message}</Text>
                )}

                {submitError && <Text style={styles.error}>{submitError}</Text>}

                <Pressable style={styles.forgotWrap}>
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
                        <Text style={styles.buttonPrimaryText}>Iniciar sesión</Text>
                    )}
                </Pressable>

                <View style={styles.registerRow}>
                    <Text style={styles.registerText}>¿No tienes cuenta? </Text>
                    <Link href="/(auth)/register" style={styles.link}>
                        Regístrate
                    </Link>
                </View>
                <Text style={styles.copyright}>Universidad Técnica de Ambato © 2026</Text>
            </Animated.View>
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
    facultyLogo: {
        width: 92,
        height: 92,
    },
    facultyLogoPlaceholder: {
        width: 92,
        height: 92,
        borderRadius: 46,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.primaryLight,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
    },
    facultyLogoPlaceholderText: {
        color: theme.colors.primary,
        fontWeight: "900",
        letterSpacing: 1,
    },
    facultyTitle: {
        marginTop: 10,
        textAlign: "center",
        fontSize: 12,
        color: theme.colors.textSecondary,
        fontWeight: "600",
        lineHeight: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        marginBottom: theme.spacing.md,
        textAlign: "center",
        color: theme.colors.primary,
    },
    label: {
        fontSize: 13,
        fontWeight: "600",
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
    forgotWrap: {
        marginTop: 10,
        alignItems: "flex-end",
    },
    forgotText: {
        color: theme.colors.primary,
        fontSize: 13,
        fontWeight: "500",
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
    error: {
        color: theme.colors.error,
        marginTop: 6,
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
        fontWeight: "600",
    },
    copyright: {
        marginTop: 10,
        textAlign: "center",
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
});
