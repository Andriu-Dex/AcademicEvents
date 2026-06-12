import { useMemo, useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme, type ThemeTokens } from "../shared";

type Props = {
    label: string;
    valueISO: string;
    onChangeISO: (value: string) => void;
    normalize?: "start" | "end" | "none";
};

function formatDateLabel(dateISO: string) {
    if (!dateISO) return "Seleccionar fecha";
    const parsed = new Date(dateISO);
    if (Number.isNaN(parsed.getTime())) return "Seleccionar fecha";

    // Mostrar siempre en UTC para que coincida con lo que el usuario seleccionó
    const day = String(parsed.getUTCDate()).padStart(2, "0");
    const month = String(parsed.getUTCMonth() + 1).padStart(2, "0");
    const year = parsed.getUTCFullYear();
    const hours = String(parsed.getUTCHours()).padStart(2, "0");
    const minutes = String(parsed.getUTCMinutes()).padStart(2, "0");

    return `${day}/${month}/${year}  ${hours}:${minutes}`;
}

/** Wrap-around clamp: 0–max inclusive */
function wrapClamp(value: number, max: number): number {
    if (value < 0) return max;
    if (value > max) return 0;
    return value;
}

export function DatePickerField({ label, valueISO, onChangeISO }: Readonly<Props>) {
    const { tokens } = useAppTheme();
    const styles = useMemo(() => createStyles(tokens), [tokens]);
    const [open, setOpen] = useState(false);
    const [selectedDay, setSelectedDay] = useState(valueISO ? valueISO.slice(0, 10) : "");
    const [hour, setHour] = useState(8);
    const [minute, setMinute] = useState(0);

    useEffect(() => {
        if (!valueISO) {
            setSelectedDay("");
            return;
        }
        const parsed = new Date(valueISO);
        if (Number.isNaN(parsed.getTime())) return;
        setSelectedDay(valueISO.slice(0, 10));
        // Usar getUTCHours/getUTCMinutes para que la hora mostrada coincida
        // con la que el usuario seleccionó originalmente (almacenada como UTC)
        setHour(parsed.getUTCHours());
        setMinute(parsed.getUTCMinutes());
    }, [valueISO]);

    const applySelection = () => {
        if (!selectedDay) return;
        const hh = String(Math.max(0, Math.min(23, hour))).padStart(2, "0");
        const mm = String(Math.max(0, Math.min(59, minute))).padStart(2, "0");
        // Construimos directamente la cadena ISO con Z para que la hora
        // que el usuario eligió se almacene tal cual en UTC.
        const iso = `${selectedDay}T${hh}:${mm}:00.000Z`;
        onChangeISO(iso);
        setOpen(false);
    };

    const adjustHour = (delta: number) => setHour((prev) => wrapClamp(prev + delta, 23));
    const adjustMinute = (delta: number) =>
        setMinute((prev) => {
            const next = prev + delta;
            if (next < 0) return 45;
            if (next >= 60) return 0;
            return next;
        });

    return (
        <View style={styles.wrapper}>
            <Text style={styles.label}>{label}</Text>
            <Pressable style={styles.button} onPress={() => setOpen(true)}>
                <View>
                    <Text style={styles.value}>{formatDateLabel(valueISO)}</Text>
                </View>
                <Ionicons name="calendar-outline" size={18} color={tokens.colors.primary} />
            </Pressable>

            {open ? (
                <Modal transparent animationType="fade" visible onRequestClose={() => setOpen(false)}>
                    <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
                        <View
                            style={styles.pickerCard}
                            onStartShouldSetResponder={() => true}
                            onTouchEnd={(e) => e.stopPropagation()}
                        >
                            <Calendar
                                initialDate={selectedDay || undefined}
                                markedDates={
                                    selectedDay
                                        ? {
                                              [selectedDay]: {
                                                  selected: true,
                                                  selectedColor: tokens.colors.primary,
                                              },
                                          }
                                        : undefined
                                }
                                onDayPress={(day) => setSelectedDay(day.dateString)}
                                theme={{
                                    calendarBackground: tokens.colors.bgCard,
                                    dayTextColor: tokens.colors.textPrimary,
                                    todayTextColor: tokens.colors.primary,
                                    selectedDayBackgroundColor: tokens.colors.primary,
                                    selectedDayTextColor: tokens.colors.onPrimary,
                                    arrowColor: tokens.colors.primary,
                                    monthTextColor: tokens.colors.textPrimary,
                                    textMonthFontWeight: "900",
                                    textDayFontWeight: "700",
                                    textDisabledColor: tokens.colors.textTertiary,
                                }}
                            />

                            {/* ── Time stepper ── */}
                            <View style={styles.timeSection}>
                                <Ionicons name="time-outline" size={16} color={tokens.colors.primary} />
                                <Text style={styles.timeSectionTitle}>Hora</Text>
                            </View>

                            <View style={styles.timeRow}>
                                {/* Hour stepper */}
                                <View style={styles.stepperGroup}>
                                    <Pressable style={styles.stepperBtn} onPress={() => adjustHour(1)}>
                                        <Ionicons name="chevron-up" size={22} color={tokens.colors.primary} />
                                    </Pressable>
                                    <View style={styles.stepperValueBox}>
                                        <Text style={styles.stepperValue}>{String(hour).padStart(2, "0")}</Text>
                                    </View>
                                    <Pressable style={styles.stepperBtn} onPress={() => adjustHour(-1)}>
                                        <Ionicons name="chevron-down" size={22} color={tokens.colors.primary} />
                                    </Pressable>
                                    <Text style={styles.stepperLabel}>Horas</Text>
                                </View>

                                <Text style={styles.timeSeparator}>:</Text>

                                {/* Minute stepper */}
                                <View style={styles.stepperGroup}>
                                    <Pressable style={styles.stepperBtn} onPress={() => adjustMinute(15)}>
                                        <Ionicons name="chevron-up" size={22} color={tokens.colors.primary} />
                                    </Pressable>
                                    <View style={styles.stepperValueBox}>
                                        <Text style={styles.stepperValue}>{String(minute).padStart(2, "0")}</Text>
                                    </View>
                                    <Pressable style={styles.stepperBtn} onPress={() => adjustMinute(-15)}>
                                        <Ionicons name="chevron-down" size={22} color={tokens.colors.primary} />
                                    </Pressable>
                                    <Text style={styles.stepperLabel}>Minutos</Text>
                                </View>
                            </View>

                            <Text style={styles.timeHint}>
                                Usa las flechas para ajustar. Minutos avanzan de 15 en 15.
                            </Text>

                            <Pressable style={styles.applyBtn} onPress={applySelection}>
                                <Ionicons name="checkmark-circle-outline" size={18} color={tokens.colors.onPrimary} />
                                <Text style={styles.applyText}>Aplicar</Text>
                            </Pressable>
                            <Pressable style={styles.closeBtn} onPress={() => setOpen(false)}>
                                <Text style={styles.closeText}>Cerrar</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Modal>
            ) : null}
        </View>
    );
}

function createStyles(theme: ThemeTokens) {
    return StyleSheet.create({
        wrapper: { gap: 6 },
        label: { color: theme.colors.textSecondary, fontWeight: "900", fontSize: 12 },
        button: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            borderWidth: 1,
            borderColor: theme.colors.borderPrimary,
            borderRadius: theme.radius.sm,
            paddingHorizontal: 12,
            paddingVertical: 12,
            backgroundColor: theme.colors.bgTertiary,
        },
        value: { color: theme.colors.textPrimary, fontWeight: "800" },
        backdrop: {
            flex: 1,
            backgroundColor: theme.colors.overlayBlack55,
            alignItems: "center",
            justifyContent: "center",
            padding: theme.spacing.lg,
        },
        pickerCard: {
            width: "100%",
            maxWidth: 420,
            backgroundColor: theme.colors.bgCard,
            borderRadius: theme.radius.lg,
            borderWidth: 1,
            borderColor: theme.colors.borderPrimary,
            padding: theme.spacing.md,
            gap: 10,
        },

        /* ── Time stepper ── */
        timeSection: {
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginTop: 4,
        },
        timeSectionTitle: {
            color: theme.colors.textPrimary,
            fontWeight: "900",
            fontSize: 14,
        },
        timeRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
        },
        stepperGroup: {
            alignItems: "center",
            gap: 2,
        },
        stepperBtn: {
            width: 52,
            height: 36,
            borderRadius: theme.radius.sm,
            borderWidth: 1,
            borderColor: theme.colors.borderPrimary,
            backgroundColor: theme.colors.bgSecondary,
            alignItems: "center",
            justifyContent: "center",
        },
        stepperValueBox: {
            width: 64,
            height: 52,
            borderRadius: theme.radius.md,
            borderWidth: 2,
            borderColor: theme.colors.primary,
            backgroundColor: theme.colors.bgPrimary,
            alignItems: "center",
            justifyContent: "center",
        },
        stepperValue: {
            fontSize: 26,
            fontWeight: "900",
            fontFamily: "monospace",
            color: theme.colors.textPrimary,
        },
        stepperLabel: {
            fontSize: 10,
            fontWeight: "800",
            color: theme.colors.textTertiary,
            marginTop: 2,
        },
        timeSeparator: {
            fontSize: 28,
            fontWeight: "900",
            color: theme.colors.textSecondary,
            marginHorizontal: 4,
            marginBottom: 18,
        },

        timeHint: { color: theme.colors.textTertiary, fontWeight: "700", fontSize: 11, textAlign: "center" },
        applyBtn: {
            alignSelf: "stretch",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            paddingVertical: 12,
            borderRadius: 999,
            backgroundColor: theme.colors.primary,
        },
        applyText: { color: theme.colors.onPrimary, fontWeight: "900" },
        closeBtn: {
            alignSelf: "flex-end",
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 999,
            backgroundColor: theme.colors.bgSecondary,
            borderWidth: 1,
            borderColor: theme.colors.borderPrimary,
        },
        closeText: { color: theme.colors.textPrimary, fontWeight: "900" },
    });
}
