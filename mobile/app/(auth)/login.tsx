import { useEffect, useRef, useState } from "react";
import { Image, Animated } from "react-native";
import { Link, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { login } from "../../src/api/auth";
import { useAuthStore } from "../../src/store/authStore";
import { theme } from "../../src/shared/theme";

const loginSchema = z.object({
    email: z.string().email("Correo invalido"),
    password: z.string().min(6, "Minimo 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
    const router = useRouter();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const setSession = useAuthStore((state) => state.setSession);
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
            const message = error instanceof Error ? error.message : "Error al iniciar sesion";
            setSubmitError(message);
        }
    };

    return (
        <LinearGradient colors={theme.gradients.hero} style={styles.heroBackground}>
            <View style={styles.heroGlow} />
            <Animated.View
                style={[
                    styles.card,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                ]}
            >
                <View style={styles.brandRow}>
                    <Image
                        source={require("../../assets/brand/logo.png")}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <View>
                        <Text style={styles.brandTitle}>AcademicEvents</Text>
                        <Text style={styles.brandSubtitle}>Acceso estudiantil</Text>
                    </View>
                </View>

                <Text style={styles.title}>Iniciar sesion</Text>

                <Text style={styles.label}>Correo</Text>
                <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            style={styles.input}
                            value={value}
                            onChangeText={onChange}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            placeholder="correo@uta.edu.ec"
                            placeholderTextColor={theme.colors.textTertiary}
                        />
                    )}
                />
                {errors.email && (
                    <Text style={styles.error}>{errors.email.message}</Text>
                )}

                <Text style={styles.label}>Contrasena</Text>
                <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            style={styles.input}
                            value={value}
                            onChangeText={onChange}
                            secureTextEntry
                            placeholder="********"
                            placeholderTextColor={theme.colors.textTertiary}
                        />
                    )}
                />
                {errors.password && (
                    <Text style={styles.error}>{errors.password.message}</Text>
                )}

                {submitError && <Text style={styles.error}>{submitError}</Text>}

                <Pressable
                    style={[styles.button, isSubmitting && styles.buttonDisabled]}
                    onPress={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.buttonText}>Ingresar</Text>
                    )}
                </Pressable>

                <Link href="/(auth)/register" style={styles.link}>
                    No tienes cuenta? Registrate
                </Link>
            </Animated.View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    heroBackground: {
        flex: 1,
        justifyContent: "center",
        padding: theme.spacing.lg,
    },
    heroGlow: {
        position: "absolute",
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: theme.colors.utaAccent,
        opacity: 0.15,
        top: -40,
        right: -30,
    },
    card: {
        backgroundColor: theme.colors.bgPrimary,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        ...theme.shadow.primary,
    },
    brandRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.md,
    },
    logo: {
        width: 46,
        height: 46,
    },
    brandTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: theme.colors.primary,
    },
    brandSubtitle: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: theme.spacing.md,
        color: theme.colors.textPrimary,
    },
    label: {
        fontSize: 13,
        fontWeight: "600",
        marginTop: theme.spacing.sm,
        color: theme.colors.textSecondary,
    },
    input: {
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        borderRadius: theme.radius.sm,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginTop: 6,
        backgroundColor: theme.colors.bgTertiary,
        color: theme.colors.textPrimary,
    },
    button: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 12,
        borderRadius: theme.radius.sm,
        marginTop: theme.spacing.md,
        alignItems: "center",
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: theme.colors.textInverse,
        fontWeight: "700",
    },
    error: {
        color: theme.colors.error,
        marginTop: 6,
    },
    link: {
        marginTop: theme.spacing.md,
        textAlign: "center",
        color: theme.colors.primary,
        fontWeight: "600",
    },
});
