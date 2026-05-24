import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    ActivityIndicator,
    Animated,
    Image,
    ImageBackground,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { registerStudent } from "../../src/api/auth";
import { getCurrentApiBaseUrl } from "../../src/api/client";
import { useCareers } from "../../src/features/careers/useCareers";
import { useFacultyInfo } from "../../src/features/faculty/useFacultyInfo";
import { useAppTheme } from "../../src/shared";

function validarCedulaEcuatoriana(cedulaRaw: string) {
    const cedula = String(cedulaRaw ?? "").trim();
    if (!/^\d{10}$/.test(cedula)) return false;

    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    const verificador = Number.parseInt(cedula.substring(9, 10), 10);
    const provincia = Number.parseInt(cedula.substring(0, 2), 10);

    if (provincia < 1 || provincia > 24) return false;
    if (Number.parseInt(cedula.charAt(2), 10) > 6) return false;

    let suma = 0;
    for (let index = 0; index < 9; index += 1) {
        const valor = Number.parseInt(cedula.charAt(index), 10) * coeficientes[index];
        suma += valor >= 10 ? valor - 9 : valor;
    }

    const digitoVerificador = 10 - (suma % 10);
    const resultadoMod = digitoVerificador === 10 ? 0 : digitoVerificador;
    return resultadoMod === verificador;
}

function soloLetras(textoRaw: string) {
    const texto = String(textoRaw ?? "").trim();
    return /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/.test(texto);
}

function validarCelularEcuatoriano(celularRaw: string) {
    const celular = String(celularRaw ?? "").trim();
    return /^09\d{8}$/.test(celular);
}

function validarPasswordSegura(passwordRaw: string) {
    const password = String(passwordRaw ?? "");
    const errores: string[] = [];

    if (password.length < 8) errores.push("Debe tener al menos 8 caracteres");
    if (!/[a-z]/.test(password)) errores.push("Debe contener una letra minúscula");
    if (!/[A-Z]/.test(password)) errores.push("Debe contener una letra mayúscula");
    if (!/\d/.test(password)) errores.push("Debe contener un número");
    if (!/[^A-Za-z0-9]/.test(password)) errores.push("Debe contener un carácter especial");
    if (/\s/.test(password)) errores.push("No debe contener espacios");

    return { esValida: errores.length === 0, errores };
}

const registerSchema = z
    .object({
        firstName: z
            .string()
            .trim()
            .min(1, "Nombre obligatorio")
            .refine((value) => soloLetras(value), "Los nombres solo deben contener letras"),
        lastName: z
            .string()
            .trim()
            .min(1, "Apellido obligatorio")
            .refine((value) => soloLetras(value), "Los apellidos solo deben contener letras"),
        idNumber: z
            .string()
            .trim()
            .refine((value) => validarCedulaEcuatoriana(value),
                "La cédula ingresada no es válida. Debe ser una cédula ecuatoriana de 10 dígitos."),
        phone: z
            .string()
            .trim()
            .refine((value) => validarCelularEcuatoriano(value),
                "El número de celular debe empezar con 09 y tener 10 dígitos"),
        email: z
            .string()
            .trim()
            .transform((value) => value.toLowerCase())
            .pipe(z.email("Correo inválido")),
        password: z
            .string()
            .superRefine((value, ctx) => {
                const validacion = validarPasswordSegura(value);
                if (!validacion.esValida) {
                    ctx.addIssue({
                        code: "custom",
                        message: `Contraseña no segura: ${validacion.errores.join(". ")}`,
                    });
                }
            }),
        careerId: z.string().optional(),
    })
    .refine(
        (data) => {
            const institutional = data.email.toLowerCase().endsWith("@uta.edu.ec");
            if (!institutional) {
                return true;
            }
            return Boolean(data.careerId && data.careerId.length > 0);
        },
        {
            message: "Selecciona una carrera",
            path: ["careerId"],
        }
    );

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
    const router = useRouter();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { data: careers, isLoading: careersLoading } = useCareers();
    const { data: faculty } = useFacultyInfo();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(16)).current;

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
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            idNumber: "",
            phone: "",
            email: "",
            password: "",
            careerId: "",
        },
    });

    const { tokens, mode, toggleTheme } = useAppTheme();
    const styles = createStyles(tokens);

    const email = watch("email");
    const isInstitutional = useMemo(
        () => email.toLowerCase().endsWith("@uta.edu.ec"),
        [email]
    );

    const passwordValue = watch("password");
    const passwordStrength = useMemo(() => {
        const checks = [
            passwordValue.length >= 8,
            /[A-Z]/.test(passwordValue),
            /[a-z]/.test(passwordValue),
            /\d/.test(passwordValue),
            /[^A-Za-z0-9]/.test(passwordValue),
        ];
        const score = checks.filter(Boolean).length;
        const labels = ["Muy debil", "Debil", "Moderada", "Fuerte", "Muy fuerte"];
        return { score, label: labels[Math.max(0, score - 1)] };
    }, [passwordValue]);

    const onSubmit = async (values: RegisterForm) => {
        setSubmitError(null);
        if (confirmPassword !== values.password) {
            setSubmitError("Las contraseñas no coinciden");
            return;
        }
        try {
            await registerStudent(values);
            router.replace("/(auth)/login");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Error al registrar";
            const apiHint = __DEV__ ? `\nAPI: ${getCurrentApiBaseUrl()}` : "";
            setSubmitError(`${message}${apiHint}`);
        }
    };

    return (
        <ImageBackground
            source={{ uri: "https://i.imgur.com/5Nc5FBj.jpeg" }}
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
            <ScrollView contentContainerStyle={styles.container}>
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
                    <Text style={styles.title}>Registro de Usuario</Text>
                    <Text style={styles.subtitle}>Registro como usuario general</Text>

                    <Text style={styles.label}>Cédula</Text>
                    <Controller
                        control={control}
                        name="idNumber"
                        render={({ field: { onChange, value } }) => (
                            <View style={styles.inputGroup}>
                                <View style={styles.inputIconWrap}>
                                    <Ionicons name="person-outline" size={16} color={tokens.colors.textInverse} />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    value={value}
                                    onChangeText={(text) => onChange(text.replaceAll(/\D/g, "").slice(0, 10))}
                                    keyboardType="numeric"
                                    maxLength={10}
                                    placeholder="0102030405"
                                    placeholderTextColor={tokens.colors.textTertiary}
                                />
                            </View>
                        )}
                    />
                    {errors.idNumber && (
                        <Text style={styles.error}>{errors.idNumber.message}</Text>
                    )}

                    <Text style={styles.label}>Nombre</Text>
                    <Controller
                        control={control}
                        name="firstName"
                        render={({ field: { onChange, value } }) => (
                            <View style={styles.inputGroup}>
                                <View style={styles.inputIconWrap}>
                                    <Ionicons name="person-outline" size={16} color={tokens.colors.textInverse} />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    value={value}
                                    onChangeText={(text) =>
                                        onChange(text.replaceAll(/[^A-Za-zÁÉÍÓÚÑáéíóúñ\s]/g, ""))
                                    }
                                    autoCapitalize="words"
                                    placeholder="Nombre"
                                    placeholderTextColor={tokens.colors.textTertiary}
                                />
                            </View>
                        )}
                    />
                    {errors.firstName && (
                        <Text style={styles.error}>{errors.firstName.message}</Text>
                    )}

                    <Text style={styles.label}>Apellido</Text>
                    <Controller
                        control={control}
                        name="lastName"
                        render={({ field: { onChange, value } }) => (
                            <View style={styles.inputGroup}>
                                <View style={styles.inputIconWrap}>
                                    <Ionicons name="person-outline" size={16} color={tokens.colors.textInverse} />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    value={value}
                                    onChangeText={(text) =>
                                        onChange(text.replaceAll(/[^A-Za-zÁÉÍÓÚÑáéíóúñ\s]/g, ""))
                                    }
                                    autoCapitalize="words"
                                    placeholder="Apellido"
                                    placeholderTextColor={tokens.colors.textTertiary}
                                />
                            </View>
                        )}
                    />
                    {errors.lastName && (
                        <Text style={styles.error}>{errors.lastName.message}</Text>
                    )}

                    <Text style={styles.label}>Celular</Text>
                    <Controller
                        control={control}
                        name="phone"
                        render={({ field: { onChange, value } }) => (
                            <View style={styles.inputGroup}>
                                <View style={styles.inputIconWrap}>
                                    <Ionicons name="call-outline" size={16} color={tokens.colors.textInverse} />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    value={value}
                                    onChangeText={(text) => onChange(text.replaceAll(/\D/g, "").slice(0, 10))}
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                    placeholder="0999999999"
                                    placeholderTextColor={tokens.colors.textTertiary}
                                />
                            </View>
                        )}
                    />
                    {errors.phone && (
                        <Text style={styles.error}>{errors.phone.message}</Text>
                    )}

                    <Text style={styles.label}>Correo</Text>
                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, value } }) => (
                            <View style={styles.inputGroup}>
                                <View style={styles.inputIconWrap}>
                                    <Ionicons name="mail-outline" size={16} color={tokens.colors.textInverse} />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    value={value}
                                    onChangeText={(text) => {
                                        onChange(text.trim());
                                        if (!text.toLowerCase().endsWith("@uta.edu.ec")) {
                                            setValue("careerId", "");
                                        }
                                    }}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    placeholder="correo@uta.edu.ec"
                                    placeholderTextColor={tokens.colors.textTertiary}
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
                                    <Ionicons name="lock-closed-outline" size={16} color={tokens.colors.textInverse} />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    value={value}
                                    onChangeText={onChange}
                                    secureTextEntry={!showPassword}
                                    placeholder="Usa una contraseña segura"
                                    placeholderTextColor={tokens.colors.textTertiary}
                                />
                                <Pressable
                                    style={styles.eyeButton}
                                    onPress={() => setShowPassword((prev) => !prev)}
                                >
                                    {showPassword ? (
                                        <Ionicons name="eye-off-outline" size={18} color={tokens.colors.textSecondary} />
                                    ) : (
                                        <Ionicons name="eye-outline" size={18} color={tokens.colors.textSecondary} />
                                    )}
                                </Pressable>
                            </View>
                        )}
                    />
                    {errors.password && (
                        <Text style={styles.error}>{errors.password.message}</Text>
                    )}

                    {passwordValue.length > 0 && (
                        <View style={styles.strengthWrap}>
                            <View style={styles.strengthHeader}>
                                <Text style={styles.strengthLabel}>Fortaleza de contraseña</Text>
                                <Text style={styles.strengthLevel}>{passwordStrength.label}</Text>
                            </View>
                            <View style={styles.strengthTrack}>
                                <View
                                    style={[
                                        styles.strengthBar,
                                        { width: `${(passwordStrength.score / 5) * 100}%` },
                                    ]}
                                />
                            </View>
                        </View>
                    )}

                    <Text style={styles.label}>Confirmar contraseña</Text>
                    <View style={styles.inputGroup}>
                        <View style={styles.inputIconWrap}>
                            <Ionicons name="lock-closed-outline" size={16} color={tokens.colors.textInverse} />
                        </View>
                        <TextInput
                            style={styles.input}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                            placeholder="Repite tu contraseña"
                            placeholderTextColor={tokens.colors.textTertiary}
                        />
                        <Pressable
                            style={styles.eyeButton}
                            onPress={() => setShowConfirmPassword((prev) => !prev)}
                        >
                            {showConfirmPassword ? (
                                <Ionicons name="eye-off-outline" size={18} color={tokens.colors.textSecondary} />
                            ) : (
                                <Ionicons name="eye-outline" size={18} color={tokens.colors.textSecondary} />
                            )}
                        </Pressable>
                    </View>

                    {isInstitutional && (
                        <View style={styles.pickerBlock}>
                            <Text style={styles.label}>Carrera</Text>
                            {careersLoading ? (
                                <ActivityIndicator style={{ marginTop: 8 }} />
                            ) : (
                                <View style={styles.pickerWrapper}>
                                    <View style={styles.inputIconWrap}>
                                        <Ionicons name="book-outline" size={16} color={tokens.colors.textInverse} />
                                    </View>
                                    <Picker
                                        style={styles.picker}
                                        selectedValue={watch("careerId")}
                                        onValueChange={(value) => setValue("careerId", value)}
                                    >
                                        <Picker.Item label="Selecciona una carrera" value="" />
                                        {careers?.map((career) => (
                                            <Picker.Item
                                                key={career.id}
                                                label={career.nombre}
                                                value={career.id}
                                            />
                                        ))}
                                    </Picker>
                                </View>
                            )}
                            {errors.careerId && (
                                <Text style={styles.error}>{errors.careerId.message}</Text>
                            )}
                        </View>
                    )}

                    {submitError && <Text style={styles.error}>{submitError}</Text>}

                    <Pressable
                        style={[styles.button, isSubmitting && styles.buttonDisabled]}
                        onPress={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color={tokens.colors.textInverse} />
                        ) : (
                            <Text style={styles.buttonText}>Registrarse</Text>
                        )}
                    </Pressable>

                    <Pressable
                        style={styles.secondaryButton}
                        onPress={() => router.replace("/(auth)/login")}
                    >
                        <Text style={styles.secondaryButtonText}>Ya tengo una cuenta</Text>
                    </Pressable>
                </Animated.View>
            </ScrollView>
        </ImageBackground>
    );
}

function createStyles(tokens: typeof import("../../src/shared").theme) {
    return StyleSheet.create({
        heroBackground: {
            flex: 1,
            padding: tokens.spacing.lg,
        },
        overlay: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: tokens.colors.overlayBlack18,
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
        container: {
            flexGrow: 1,
            paddingBottom: tokens.spacing.xl,
        },
        card: {
            marginTop: tokens.spacing.lg,
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
            backgroundColor: tokens.colors.primaryLight,
            borderWidth: 1,
            borderColor: tokens.colors.borderPrimary,
        },
        facultyLogoPlaceholderText: {
            color: tokens.colors.primary,
            fontWeight: "900",
            letterSpacing: 1,
        },
        facultyTitle: {
            marginTop: 10,
            textAlign: "center",
            fontSize: 12,
            color: tokens.colors.textSecondary,
            fontWeight: "600",
            lineHeight: 16,
        },
        title: {
            fontSize: 28,
            fontWeight: "700",
            marginBottom: 4,
            textAlign: "center",
            color: tokens.colors.textPrimary,
        },
        subtitle: {
            textAlign: "center",
            color: tokens.colors.textSecondary,
            marginBottom: tokens.spacing.sm,
        },
        label: {
            fontSize: 13,
            fontWeight: "600",
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
        pickerBlock: {
            marginTop: tokens.spacing.sm,
        },
        pickerWrapper: {
            marginTop: 6,
            borderWidth: 1,
            borderColor: tokens.colors.borderPrimary,
            borderRadius: tokens.radius.sm,
            overflow: "hidden",
            backgroundColor: tokens.colors.bgPrimary,
            flexDirection: "row",
            alignItems: "center",
        },
        picker: {
            flex: 1,
            color: tokens.colors.textPrimary,
            backgroundColor: tokens.colors.bgPrimary,
        },
        strengthWrap: {
            marginTop: 8,
        },
        strengthHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 4,
        },
        strengthLabel: {
            fontSize: 12,
            color: tokens.colors.textSecondary,
        },
        strengthLevel: {
            fontSize: 12,
            color: tokens.colors.primary,
            fontWeight: "700",
        },
        strengthTrack: {
            height: 5,
            backgroundColor: tokens.colors.borderPrimary,
            borderRadius: 4,
            overflow: "hidden",
        },
        strengthBar: {
            height: "100%",
            backgroundColor: tokens.colors.success,
        },
        button: {
            backgroundColor: tokens.colors.primary,
            paddingVertical: 12,
            borderRadius: tokens.radius.sm,
            marginTop: tokens.spacing.md,
            alignItems: "center",
        },
        buttonDisabled: {
            opacity: 0.7,
        },
        buttonText: {
            color: tokens.colors.textInverse,
            fontWeight: "700",
        },
        secondaryButton: {
            borderWidth: 1,
            borderColor: tokens.colors.borderSecondary,
            paddingVertical: 12,
            borderRadius: tokens.radius.sm,
            marginTop: 10,
            alignItems: "center",
            backgroundColor: tokens.colors.bgPrimary,
        },
        secondaryButtonText: {
            color: tokens.colors.textPrimary,
            fontWeight: "600",
        },
        error: {
            color: tokens.colors.error,
            marginTop: 6,
        },
        link: {
            marginTop: tokens.spacing.md,
            textAlign: "center",
            color: tokens.colors.primary,
            fontWeight: "600",
        },
    });

}
