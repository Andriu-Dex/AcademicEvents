import { useEffect, useMemo, useRef, useState } from "react";
import { Image, Animated } from "react-native";
import { Link, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
        email: z.string().email("Correo invalido"),
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
        try {
            await registerStudent(values, selectedFile);
            router.replace("/(auth)/login");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Error al registrar";
            setSubmitError(message);
        }
    };

    return (
        <LinearGradient colors={theme.gradients.hero} style={styles.heroBackground}>
            <ScrollView contentContainerStyle={styles.container}>
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
                            <Text style={styles.brandSubtitle}>Registro de estudiantes</Text>
                        </View>
                    </View>

                    <Text style={styles.title}>Crear cuenta</Text>

                    <Text style={styles.label}>Nombre</Text>
                    <Controller
                        control={control}
                        name="firstName"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                style={styles.input}
                                value={value}
                                onChangeText={onChange}
                                placeholder="Ingresa tu nombre"
                                placeholderTextColor={theme.colors.textTertiary}
                            />
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
                            <TextInput
                                style={styles.input}
                                value={value}
                                onChangeText={onChange}
                                placeholder="Ingresa tu apellido"
                                placeholderTextColor={theme.colors.textTertiary}
                            />
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
                            <TextInput
                                style={styles.input}
                                value={value}
                                onChangeText={onChange}
                                keyboardType="numeric"
                                placeholder="0102030405"
                                placeholderTextColor={theme.colors.textTertiary}
                            />
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
                            <TextInput
                                style={styles.input}
                                value={value}
                                onChangeText={onChange}
                                keyboardType="phone-pad"
                                placeholder="0999999999"
                                placeholderTextColor={theme.colors.textTertiary}
                            />
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
                                placeholder="Minimo 6 caracteres"
                                placeholderTextColor={theme.colors.textTertiary}
                            />
                        )}
                    />
                    {errors.password && (
                        <Text style={styles.error}>{errors.password.message}</Text>
                    )}

                    {isInstitutional && (
                        <View style={styles.pickerBlock}>
                            <Text style={styles.label}>Carrera</Text>
                            {careersLoading ? (
                                <ActivityIndicator style={{ marginTop: 8 }} />
                            ) : (
                                <View style={styles.pickerWrapper}>
                                    <Picker
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
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    heroBackground: {
        flex: 1,
        padding: theme.spacing.lg,
    },
    container: {
        flexGrow: 1,
        paddingBottom: theme.spacing.xl,
    },
    card: {
        marginTop: theme.spacing.lg,
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
    pickerBlock: {
        marginTop: theme.spacing.sm,
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        borderRadius: theme.radius.sm,
        marginTop: 6,
        overflow: "hidden",
        backgroundColor: theme.colors.bgTertiary,
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
