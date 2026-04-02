import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    ActivityIndicator,
    Animated,
    ImageBackground,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { Picker } from "@react-native-picker/picker";
import { registerStudent } from "../../src/api/auth";
import { useCareers } from "../../src/features/careers/useCareers";
import { theme } from "../../src/shared/theme";

const registerSchema = z
    .object({
        firstName: z.string().min(1, "Nombre obligatorio"),
        lastName: z.string().min(1, "Apellido obligatorio"),
        idNumber: z.string().min(10, "Cedula invalida"),
        phone: z.string().regex(/^\d{10}$/, "Celular invalido"),
        email: z.email("Correo invalido"),
        password: z.string().min(6, "Minimo 6 caracteres"),
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

type PickedFile = {
    uri: string;
    name: string;
    type: string;
} | null;

export default function RegisterScreen() {
    const router = useRouter();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<PickedFile>(null);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { data: careers, isLoading: careersLoading } = useCareers();
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

    const handlePickFile = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: ["image/*", "application/pdf"],
            copyToCacheDirectory: true,
            multiple: false,
        });

        if (!result.canceled && result.assets?.length) {
            const asset = result.assets[0];
            setSelectedFile({
                uri: asset.uri,
                name: asset.name ?? "documento",
                type: asset.mimeType ?? "application/octet-stream",
            });
        }
    };

    const onSubmit = async (values: RegisterForm) => {
        setSubmitError(null);
        if (confirmPassword !== values.password) {
            setSubmitError("Las contrasenas no coinciden");
            return;
        }
        try {
            await registerStudent(values, selectedFile);
            router.replace("/(auth)/login");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Error al registrar";
            setSubmitError(message);
        }
    };

    return (
        <ImageBackground
            source={{ uri: "https://i.imgur.com/5Nc5FBj.jpeg" }}
            style={styles.heroBackground}
            resizeMode="cover"
        >
            <View style={styles.overlay} />
            <Pressable style={styles.homeButton} onPress={() => router.replace("/")}>
                <Ionicons name="home-outline" color={theme.colors.textInverse} size={20} />
            </Pressable>
            <ScrollView contentContainerStyle={styles.container}>
                <Animated.View
                    style={[
                        styles.card,
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                    ]}
                >
                    <Text style={styles.title}>Registro de Usuario</Text>

                    <Text style={styles.label}>Nombre</Text>
                    <Controller
                        control={control}
                        name="firstName"
                        render={({ field: { onChange, value } }) => (
                            <View style={styles.inputGroup}>
                                <View style={styles.inputIconWrap}>
                                    <Ionicons name="person-outline" size={16} color={theme.colors.textInverse} />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    value={value}
                                    onChangeText={onChange}
                                    placeholder="Nombre"
                                    placeholderTextColor={theme.colors.textTertiary}
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
                                    <Ionicons name="person-outline" size={16} color={theme.colors.textInverse} />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    value={value}
                                    onChangeText={onChange}
                                    placeholder="Apellido"
                                    placeholderTextColor={theme.colors.textTertiary}
                                />
                            </View>
                        )}
                    />
                    {errors.lastName && (
                        <Text style={styles.error}>{errors.lastName.message}</Text>
                    )}

                    <Text style={styles.label}>Cedula</Text>
                    <Controller
                        control={control}
                        name="idNumber"
                        render={({ field: { onChange, value } }) => (
                            <View style={styles.inputGroup}>
                                <View style={styles.inputIconWrap}>
                                    <Ionicons name="person-outline" size={16} color={theme.colors.textInverse} />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    value={value}
                                    onChangeText={onChange}
                                    keyboardType="numeric"
                                    placeholder="0102030405"
                                    placeholderTextColor={theme.colors.textTertiary}
                                />
                            </View>
                        )}
                    />
                    {errors.idNumber && (
                        <Text style={styles.error}>{errors.idNumber.message}</Text>
                    )}

                    <Text style={styles.label}>Celular</Text>
                    <Controller
                        control={control}
                        name="phone"
                        render={({ field: { onChange, value } }) => (
                            <View style={styles.inputGroup}>
                                <View style={styles.inputIconWrap}>
                                    <Ionicons name="call-outline" size={16} color={theme.colors.textInverse} />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    value={value}
                                    onChangeText={onChange}
                                    keyboardType="phone-pad"
                                    placeholder="0999999999"
                                    placeholderTextColor={theme.colors.textTertiary}
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
                                    <Ionicons name="mail-outline" size={16} color={theme.colors.textInverse} />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    value={value}
                                    onChangeText={(text) => {
                                        onChange(text);
                                        if (!text.toLowerCase().endsWith("@uta.edu.ec")) {
                                            setValue("careerId", "");
                                        }
                                    }}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    placeholder="correo@uta.edu.ec"
                                    placeholderTextColor={theme.colors.textTertiary}
                                />
                            </View>
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
                            <View style={styles.inputGroup}>
                                <View style={styles.inputIconWrap}>
                                    <Ionicons name="lock-closed-outline" size={16} color={theme.colors.textInverse} />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    value={value}
                                    onChangeText={onChange}
                                    secureTextEntry={!showPassword}
                                    placeholder="Minimo 6 caracteres"
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

                    {passwordValue.length > 0 && (
                        <View style={styles.strengthWrap}>
                            <View style={styles.strengthHeader}>
                                <Text style={styles.strengthLabel}>Fortaleza de contrasena</Text>
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

                    <Text style={styles.label}>Confirmar contrasena</Text>
                    <View style={styles.inputGroup}>
                        <View style={styles.inputIconWrap}>
                            <Ionicons name="lock-closed-outline" size={16} color={theme.colors.textInverse} />
                        </View>
                        <TextInput
                            style={styles.input}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                            placeholder="Repite tu contrasena"
                            placeholderTextColor={theme.colors.textTertiary}
                        />
                        <Pressable
                            style={styles.eyeButton}
                            onPress={() => setShowConfirmPassword((prev) => !prev)}
                        >
                            {showConfirmPassword ? (
                                <Ionicons name="eye-off-outline" size={18} color={theme.colors.textSecondary} />
                            ) : (
                                <Ionicons name="eye-outline" size={18} color={theme.colors.textSecondary} />
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
                                        <Ionicons name="book-outline" size={16} color={theme.colors.textInverse} />
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

                    <Pressable style={styles.fileButton} onPress={handlePickFile}>
                        <Text style={styles.fileButtonText}>
                            {selectedFile
                                ? `Archivo: ${selectedFile.name}`
                                : "Adjuntar documento (opcional)"}
                        </Text>
                    </Pressable>

                    <View style={styles.noteBox}>
                        <Text style={styles.noteText}>
                            Nota: luego del registro deberas subir documentos en tu perfil para
                            inscribirte en eventos.
                        </Text>
                    </View>

                    {submitError && <Text style={styles.error}>{submitError}</Text>}

                    <Pressable
                        style={[styles.button, isSubmitting && styles.buttonDisabled]}
                        onPress={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text style={styles.buttonText}>Crear cuenta</Text>
                        )}
                    </Pressable>

                    <Link href="/(auth)/login" style={styles.link}>
                        Ya tienes cuenta? Inicia sesion
                    </Link>
                </Animated.View>
            </ScrollView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    heroBackground: {
        flex: 1,
        padding: theme.spacing.lg,
    },
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.18)",
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
    container: {
        flexGrow: 1,
        paddingBottom: theme.spacing.xl,
    },
    card: {
        marginTop: theme.spacing.lg,
        backgroundColor: theme.colors.bgPrimary,
        borderTopWidth: 6,
        borderTopColor: theme.colors.primary,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        ...theme.shadow.md,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        marginBottom: theme.spacing.md,
        textAlign: "center",
        color: theme.colors.textPrimary,
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
    pickerBlock: {
        marginTop: theme.spacing.sm,
    },
    pickerWrapper: {
        marginTop: 6,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        borderRadius: theme.radius.sm,
        overflow: "hidden",
        backgroundColor: theme.colors.bgPrimary,
        flexDirection: "row",
        alignItems: "center",
    },
    picker: {
        flex: 1,
        color: theme.colors.textPrimary,
        backgroundColor: theme.colors.bgPrimary,
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
        color: theme.colors.textSecondary,
    },
    strengthLevel: {
        fontSize: 12,
        color: theme.colors.primary,
        fontWeight: "700",
    },
    strengthTrack: {
        height: 5,
        backgroundColor: theme.colors.borderPrimary,
        borderRadius: 4,
        overflow: "hidden",
    },
    strengthBar: {
        height: "100%",
        backgroundColor: theme.colors.success,
    },
    fileButton: {
        borderWidth: 1,
        borderColor: theme.colors.primary,
        borderRadius: theme.radius.sm,
        paddingVertical: 12,
        paddingHorizontal: 12,
        marginTop: theme.spacing.md,
        backgroundColor: theme.colors.primaryLight,
    },
    fileButtonText: {
        color: theme.colors.primary,
        fontWeight: "600",
        textAlign: "center",
    },
    noteBox: {
        marginTop: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        backgroundColor: "#eef6ff",
        borderRadius: theme.radius.sm,
        padding: 10,
    },
    noteText: {
        color: theme.colors.textSecondary,
        fontSize: 12,
        lineHeight: 18,
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
