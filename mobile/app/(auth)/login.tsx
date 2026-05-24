import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
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
import { useAuthStore } from "../../src/store/authStore";
import { isAdminRole } from "../../src/utils/roles";
import { useFacultyInfo } from "../../src/features/faculty/useFacultyInfo";
import { useAppTheme } from "../../src/shared";

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

    const { tokens } = useAppTheme();
    const styles = createStyles(tokens);

    const onSubmit = async (values: LoginForm) => {
        setSubmitError(null);
        try {
            const result = await login(values.email, values.password);
            await setSession(result.token, result.user);
            router.replace(isAdminRole(result.user.role) ? "/(admin)" : "/(app)");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Error al iniciar sesión";
            const normalized = message.toLowerCase();
            const finalMessage =
                normalized.includes("contrase") || normalized.includes("password") || normalized.includes("credencial")
                    ? "Contraseña incorrecta"
                    : "No se pudo iniciar sesión";
            setSubmitError(finalMessage);
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
                <Ionicons name="home" color={tokens.colors.textInverse} size={18} />
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
                                        <Ionicons name="at-outline" size={18} color={tokens.colors.primary} />
                                    </View>
                                    <TextInput
                                        style={styles.input}
                                        value={value}
                                        onChangeText={onChange}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        placeholder="usuario@uta.edu.ec"
                                        placeholderTextColor={tokens.colors.textTertiary}
                                    />
                                </View>
                            )}
                        />
                        {errors.email && (
                            <View style={styles.errorRow}>
                                <Ionicons name="alert-circle-outline" size={13} color={tokens.colors.error} />
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
                                        <Ionicons name="lock-closed-outline" size={18} color={tokens.colors.primary} />
                                    </View>
                                    <TextInput
                                        style={styles.input}
                                        value={value}
                                        onChangeText={onChange}
                                        secureTextEntry={!showPassword}
                                        placeholder="••••••••"
                                        placeholderTextColor={tokens.colors.textTertiary}
                                    />
                                    <Pressable
                                        style={styles.eyeButton}
                                        onPress={() => setShowPassword((prev) => !prev)}
                                    >
                                        <Ionicons
                                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                                            size={18}
                                            color={tokens.colors.textSecondary}
                                        />
                                    </Pressable>
                                </View>
                            )}
                        />
                        {errors.password && (
                            <View style={styles.errorRow}>
                                <Ionicons name="alert-circle-outline" size={13} color={tokens.colors.error} />
                                <Text style={styles.error}>{errors.password.message}</Text>
                            </View>
                        )}

                        {submitError && (
                            <View style={styles.errorBox}>
                                <Ionicons name="warning-outline" size={16} color={tokens.colors.error} />
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
                                <ActivityIndicator color={tokens.colors.textInverse} />
                            ) : (
                                <>
                                    <Ionicons name="log-in-outline" size={18} color={tokens.colors.textInverse} />
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

function createStyles(tokens: typeof import("../../src/shared").theme) {
    return StyleSheet.create({
        heroBackground: {
            flex: 1,
        },
        overlay: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: tokens.colors.overlayBlack45,
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
            backgroundColor: tokens.colors.primaryOpaque85,
            borderWidth: 1,
            borderColor: tokens.colors.overlayWhite20,
        },
        themeToggle: {
            position: "absolute",
            right: 68,
            top: Platform.OS === "ios" ? 56 : 36,
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
        scrollContent: {
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: tokens.spacing.lg,
            paddingTop: 70,
            paddingBottom: tokens.spacing.xl,
        },
        card: {
            backgroundColor: tokens.colors.bgPrimary,
            borderRadius: tokens.radius.xl,
            padding: tokens.spacing.lg,
            ...tokens.shadow.lg,
        },
        logoWrap: {
            alignItems: "center",
            marginBottom: tokens.spacing.md,
        },
        logoCircle: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: tokens.colors.bgSecondary,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 3,
            borderColor: tokens.colors.primaryLight,
            overflow: "hidden",
        },
        facultyLogo: {
            width: 76,
            height: 76,
        },
        facultyLogoPlaceholderText: {
            color: tokens.colors.primary,
            fontWeight: "900",
            fontSize: 16,
            letterSpacing: 1,
        },
        facultyTitle: {
            marginTop: 10,
            textAlign: "center",
            fontSize: 12,
            color: tokens.colors.textSecondary,
            fontWeight: "600",
            lineHeight: 17,
            paddingHorizontal: tokens.spacing.sm,
        },
        title: {
            fontSize: 26,
            fontWeight: "800",
            textAlign: "center",
            color: tokens.colors.textPrimary,
            letterSpacing: 0.1,
        },
        subtitle: {
            textAlign: "center",
            color: tokens.colors.textSecondary,
            fontSize: 13,
            marginTop: 4,
            marginBottom: tokens.spacing.md,
        },
        label: {
            fontSize: 13,
            fontWeight: "700",
            marginTop: tokens.spacing.sm,
            marginBottom: 6,
            color: tokens.colors.textPrimary,
        },
        inputGroup: {
            height: 52,
            borderWidth: 1.5,
            borderColor: tokens.colors.borderPrimary,
            borderRadius: tokens.radius.sm,
            flexDirection: "row",
            alignItems: "center",
            overflow: "hidden",
            backgroundColor: tokens.colors.bgSecondary,
        },
        inputGroupError: {
            borderColor: tokens.colors.error,
            backgroundColor: tokens.colors.errorLight,
        },
        inputIconWrap: {
            width: 46,
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            borderRightWidth: 1,
            borderRightColor: tokens.colors.borderLight,
            backgroundColor: "transparent",
        },
        input: {
            flex: 1,
            paddingHorizontal: 12,
            color: tokens.colors.textPrimary,
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
            color: tokens.colors.error,
            fontSize: 12,
            fontWeight: "600",
        },
        errorBox: {
            marginTop: tokens.spacing.sm,
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 8,
            backgroundColor: tokens.colors.errorLight,
            borderRadius: tokens.radius.sm,
            padding: tokens.spacing.sm,
            borderWidth: 1,
            borderColor: tokens.colors.error20,
        },
        errorBoxText: {
            flex: 1,
            color: tokens.colors.error,
            fontSize: 12,
            fontWeight: "600",
            lineHeight: 18,
        },
        forgotWrap: {
            marginTop: tokens.spacing.sm,
            alignItems: "flex-end",
            marginBottom: tokens.spacing.sm,
        },
        forgotText: {
            color: tokens.colors.primary,
            fontSize: 13,
            fontWeight: "600",
        },
        buttonPrimary: {
            backgroundColor: tokens.colors.utaPrimary,
            height: 52,
            borderRadius: tokens.radius.sm,
            marginTop: 4,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 8,
            ...tokens.shadow.primary,
        },
        buttonDisabled: {
            opacity: 0.7,
        },
        buttonPrimaryText: {
            color: tokens.colors.textInverse,
            fontWeight: "800",
            fontSize: 15,
            letterSpacing: 0.3,
        },
        dividerRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginVertical: tokens.spacing.md,
        },
        dividerLine: {
            flex: 1,
            height: 1,
            backgroundColor: tokens.colors.borderPrimary,
        },
        dividerText: {
            color: tokens.colors.textTertiary,
            fontWeight: "600",
            fontSize: 13,
        },
        buttonSecondary: {
            height: 50,
            borderRadius: tokens.radius.sm,
            borderWidth: 1.5,
            borderColor: tokens.colors.borderSecondary,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: tokens.colors.bgPrimary,
        },
        buttonSecondaryText: {
            color: tokens.colors.textPrimary,
            fontWeight: "700",
            fontSize: 14,
        },
        registerRow: {
            marginTop: tokens.spacing.md,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
        },
        registerText: {
            color: tokens.colors.textSecondary,
        },
        link: {
            color: tokens.colors.primary,
            fontWeight: "700",
        },
        copyright: {
            marginTop: tokens.spacing.md,
            textAlign: "center",
            fontSize: 11,
            color: tokens.colors.textTertiary,
        },
    });
}
