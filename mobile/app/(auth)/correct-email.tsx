import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
    ActivityIndicator,
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
import { correctEmail } from "../../src/api/verification";
import { getCurrentApiBaseUrl } from "../../src/api/client";
import { useCareers } from "../../src/features/careers/useCareers";
import { useAppTheme } from "../../src/shared";

const PENDING_EMAIL_KEY = "academicevents.verificationPendingEmail";
const PENDING_CAREER_KEY = "academicevents.verificationPendingCareerId";

function readParam(value: string | string[] | undefined) {
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value[0];
    return undefined;
}

export default function CorrectEmailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { data: careers, isLoading: careersLoading } = useCareers();
    const { tokens } = useAppTheme();
    const styles = createStyles(tokens);

    const incomingEmail = useMemo(() => readParam(params.email as any), [params.email]);
    const [currentEmail, setCurrentEmail] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [careerId, setCareerId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        let cancelled = false;

        const hydrate = async () => {
            const storedEmail = (incomingEmail ?? (await SecureStore.getItemAsync(PENDING_EMAIL_KEY)) ?? "")
                .trim()
                .toLowerCase();
            const storedCareer = (await SecureStore.getItemAsync(PENDING_CAREER_KEY)) ?? "";

            if (!storedEmail) {
                router.replace("/(auth)/verification-pending");
                return;
            }

            if (!cancelled) {
                setCurrentEmail(storedEmail);
                setNewEmail(storedEmail);
                setCareerId(storedCareer);
            }
        };

        hydrate().catch(() => router.replace("/(auth)/verification-pending"));

        return () => {
            cancelled = true;
        };
    }, [incomingEmail, router]);

    const institutional = useMemo(() => newEmail.trim().toLowerCase().endsWith("@uta.edu.ec"), [newEmail]);

    const onSubmit = async () => {
        const normalizedNewEmail = newEmail.trim().toLowerCase();
        const normalizedCurrentEmail = currentEmail.trim().toLowerCase();
        if (!normalizedNewEmail) {
            setError("El nuevo correo es obligatorio");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedNewEmail)) {
            setError("El formato del nuevo correo no es valido");
            return;
        }

        if (institutional && !careerId) {
            setError("Selecciona una carrera para correo institucional");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await correctEmail({
                correoAnterior: normalizedCurrentEmail,
                correoNuevo: normalizedNewEmail,
                carreraNueva: institutional ? careerId : null,
            });

            if (!result.success) {
                setError(result.message ?? "No se pudo actualizar el correo");
                return;
            }

            await SecureStore.setItemAsync(PENDING_EMAIL_KEY, normalizedNewEmail);
            if (institutional && careerId) {
                await SecureStore.setItemAsync(PENDING_CAREER_KEY, careerId);
            }

            router.replace({
                pathname: "/(auth)/verification-pending",
                params: { email: normalizedNewEmail, careerId },
            });
        } catch (e) {
            const message = e instanceof Error ? e.message : "No se pudo actualizar el correo";
            const apiHint = __DEV__ ? `\nAPI: ${getCurrentApiBaseUrl()}` : "";
            setError(`${message}${apiHint}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ImageBackground
            source={{ uri: "https://i.imgur.com/5Nc5FBj.jpeg" }}
            style={styles.heroBackground}
            resizeMode="cover"
        >
            <View style={styles.overlay} />

            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <View style={styles.card}>
                    <View style={styles.headerRow}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="create-outline" size={20} color={tokens.colors.textInverse} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.title}>Corregir correo</Text>
                            <Text style={styles.subtitle}>
                                Actualiza el correo incorrecto y reenviamos la verificacion.
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.label}>Correo actual</Text>
                    <Text style={styles.readonlyBox}>{currentEmail || "..."}</Text>

                    <Text style={styles.label}>Nuevo correo</Text>
                    <View style={styles.inputGroup}>
                        <Ionicons name="mail-outline" size={18} color={tokens.colors.textSecondary} />
                        <TextInput
                            value={newEmail}
                            onChangeText={(text) => setNewEmail(text.trim())}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            placeholder="correo@uta.edu.ec"
                            placeholderTextColor={tokens.colors.textTertiary}
                            style={styles.input}
                        />
                    </View>

                    {institutional ? (
                        <>
                            <Text style={styles.label}>Carrera</Text>
                            {careersLoading ? (
                                <ActivityIndicator style={{ marginTop: 8 }} />
                            ) : (
                                <View style={styles.pickerBlock}>
                                    <Picker selectedValue={careerId} onValueChange={(value) => setCareerId(String(value))}>
                                        <Picker.Item label="Selecciona una carrera" value="" />
                                        {careers?.map((career) => (
                                            <Picker.Item key={career.id} label={career.nombre} value={career.id} />
                                        ))}
                                    </Picker>
                                </View>
                            )}
                        </>
                    ) : null}

                    {error ? <Text style={styles.error}>{error}</Text> : null}

                    <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={onSubmit} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color={tokens.colors.textInverse} />
                        ) : (
                            <Text style={styles.buttonText}>Actualizar y enviar verificacion</Text>
                        )}
                    </Pressable>

                    <Pressable style={styles.secondaryButton} onPress={() => router.replace("/(auth)/verification-pending")}>
                        <Text style={styles.secondaryButtonText}>Volver</Text>
                    </Pressable>
                </View>
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
        container: {
            flexGrow: 1,
            justifyContent: "center",
            paddingVertical: tokens.spacing.xl,
        },
        card: {
            backgroundColor: tokens.colors.surface,
            borderRadius: tokens.radius.lg,
            padding: tokens.spacing.lg,
            borderWidth: 1,
            borderColor: tokens.colors.border,
        },
        headerRow: {
            flexDirection: "row",
            gap: tokens.spacing.md,
            alignItems: "flex-start",
        },
        iconCircle: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: tokens.colors.primary,
            alignItems: "center",
            justifyContent: "center",
        },
        title: {
            fontSize: tokens.fontSize.lg,
            fontWeight: "800",
            color: tokens.colors.text,
        },
        subtitle: {
            marginTop: 6,
            fontSize: tokens.fontSize.sm,
            color: tokens.colors.textSecondary,
            lineHeight: 18,
        },
        label: {
            marginTop: tokens.spacing.lg,
            marginBottom: 6,
            fontSize: tokens.fontSize.sm,
            fontWeight: "700",
            color: tokens.colors.text,
        },
        readonlyBox: {
            paddingVertical: 12,
            paddingHorizontal: 14,
            borderRadius: tokens.radius.md,
            backgroundColor: tokens.colors.surfaceAlt,
            borderWidth: 1,
            borderColor: tokens.colors.border,
            color: tokens.colors.text,
            fontWeight: "700",
        },
        inputGroup: {
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingHorizontal: 14,
            borderRadius: tokens.radius.md,
            backgroundColor: tokens.colors.surfaceAlt,
            borderWidth: 1,
            borderColor: tokens.colors.border,
        },
        input: {
            flex: 1,
            minHeight: 48,
            color: tokens.colors.text,
        },
        pickerBlock: {
            borderRadius: tokens.radius.md,
            overflow: "hidden",
            backgroundColor: tokens.colors.surfaceAlt,
            borderWidth: 1,
            borderColor: tokens.colors.border,
        },
        error: {
            marginTop: tokens.spacing.md,
            color: tokens.colors.error,
            fontSize: tokens.fontSize.sm,
        },
        button: {
            marginTop: tokens.spacing.lg,
            height: 48,
            borderRadius: tokens.radius.md,
            backgroundColor: tokens.colors.primary,
            alignItems: "center",
            justifyContent: "center",
        },
        buttonDisabled: {
            opacity: 0.7,
        },
        buttonText: {
            color: tokens.colors.textInverse,
            fontWeight: "800",
            fontSize: tokens.fontSize.md,
        },
        secondaryButton: {
            marginTop: tokens.spacing.md,
            height: 44,
            borderRadius: tokens.radius.md,
            backgroundColor: tokens.colors.surfaceAlt,
            borderWidth: 1,
            borderColor: tokens.colors.border,
            alignItems: "center",
            justifyContent: "center",
        },
        secondaryButtonText: {
            color: tokens.colors.text,
            fontWeight: "700",
        },
    });
}
