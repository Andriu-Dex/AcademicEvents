import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "../../src/components/AppHeader";
import { createMyRegistration, type RegistrationReceiptFile } from "../../src/api/registrations";
import { theme } from "../../src/shared/theme";

function parsePrice(input: string | string[] | undefined): number {
    const raw = Array.isArray(input) ? input[0] : input;
    const parsed = Number(raw ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
}

function pickString(input: string | string[] | undefined, fallback: string): string {
    const value = Array.isArray(input) ? input[0] : input;
    const trimmed = (value ?? "").trim();
    return trimmed || fallback;
}

export default function EventRegistrationScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        eventId?: string | string[];
        title?: string | string[];
        price?: string | string[];
    }>();
    const queryClient = useQueryClient();

    const eventId = pickString(params.eventId, "");
    const eventTitle = pickString(params.title, "Evento");
    const eventPrice = parsePrice(params.price);
    const isPaidEvent = eventPrice > 0;

    const [motivation, setMotivation] = useState("");
    const [receiptFile, setReceiptFile] = useState<RegistrationReceiptFile | null>(null);

    const mutation = useMutation({
        mutationFn: () =>
            createMyRegistration({
                eventId,
                motivation,
                receiptFile,
            }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["my-registrations"] });
            Alert.alert("Inscripción exitosa", "Tu inscripción se registró correctamente.", [
                { text: "Aceptar", onPress: () => router.replace("/(app)/registrations") },
            ]);
        },
        onError: (error: unknown) => {
            const message = error instanceof Error ? error.message : "No se pudo registrar la inscripción.";
            Alert.alert("No se pudo inscribir", message);
        },
    });

    const canSubmit = useMemo(() => {
        if (!eventId) return false;
        if (!motivation.trim()) return false;
        if (isPaidEvent && !receiptFile) return false;
        return true;
    }, [eventId, motivation, isPaidEvent, receiptFile]);

    const pickReceipt = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            copyToCacheDirectory: true,
            type: ["image/*", "application/pdf"],
        });
        if (result.canceled) return;
        const asset = result.assets?.[0];
        if (!asset?.uri) return;
        setReceiptFile({
            uri: asset.uri,
            name: asset.name ?? "comprobante",
            mimeType: asset.mimeType ?? "application/octet-stream",
        });
    };

    return (
        <View style={styles.container}>
            <AppHeader title="Inscribirse al evento" showBack />
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.title}>{eventTitle}</Text>
                    <Text style={styles.meta}>
                        {isPaidEvent ? `Evento de pago: $${eventPrice.toFixed(2)}` : "Evento gratuito"}
                    </Text>

                    <Text style={styles.label}>Carta de motivación</Text>
                    <TextInput
                        style={styles.textarea}
                        multiline
                        numberOfLines={6}
                        value={motivation}
                        onChangeText={setMotivation}
                        placeholder="Ejemplo: Deseo participar para fortalecer mis conocimientos y aplicarlos en mi formación académica."
                        placeholderTextColor={theme.colors.textTertiary}
                        textAlignVertical="top"
                    />

                    {isPaidEvent ? (
                        <>
                            <Text style={styles.label}>Comprobante de pago</Text>
                            <Pressable style={styles.secondaryBtn} onPress={pickReceipt} disabled={mutation.isPending}>
                                <Ionicons name="document-attach-outline" size={18} color={theme.colors.primary} />
                                <Text style={styles.secondaryBtnText} numberOfLines={1}>
                                    {receiptFile ? receiptFile.name : "Seleccionar comprobante (PDF o imagen)"}
                                </Text>
                            </Pressable>
                            <Text style={styles.hint}>Para eventos pagados es obligatorio adjuntar comprobante.</Text>
                        </>
                    ) : null}

                    <Pressable
                        style={[styles.primaryBtn, (!canSubmit || mutation.isPending) && styles.btnDisabled]}
                        disabled={!canSubmit || mutation.isPending}
                        onPress={() => mutation.mutate()}
                    >
                        <Text style={styles.primaryBtnText}>
                            {mutation.isPending ? "Enviando inscripción..." : "Confirmar inscripción"}
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bgSecondary },
    content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xl },
    card: {
        backgroundColor: theme.colors.bgPrimary,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        padding: theme.spacing.lg,
        gap: 12,
        ...theme.shadow.sm,
    },
    title: { color: theme.colors.textPrimary, fontSize: 18, fontWeight: "900" },
    meta: { color: theme.colors.textSecondary, fontWeight: "700" },
    label: { marginTop: 4, color: theme.colors.textPrimary, fontWeight: "900" },
    textarea: {
        minHeight: 130,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        backgroundColor: theme.colors.bgSecondary,
        color: theme.colors.textPrimary,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontWeight: "600",
    },
    secondaryBtn: {
        height: 46,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        backgroundColor: theme.colors.bgPrimary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        paddingHorizontal: 12,
    },
    secondaryBtnText: { flex: 1, color: theme.colors.primary, fontWeight: "800" },
    hint: { color: theme.colors.textSecondary, fontWeight: "700", fontSize: 12 },
    primaryBtn: {
        marginTop: 10,
        height: 48,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    primaryBtnText: { color: theme.colors.textInverse, fontWeight: "900", fontSize: 14 },
    btnDisabled: { opacity: 0.55 },
});
