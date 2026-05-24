import { useMemo, useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
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
    return parsed.toLocaleString("es-EC", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function DatePickerField({ label, valueISO, onChangeISO }: Readonly<Props>) {
    const { tokens } = useAppTheme();
    const styles = useMemo(() => createStyles(tokens), [tokens]);
    const [open, setOpen] = useState(false);
    const [selectedDay, setSelectedDay] = useState(valueISO ? valueISO.slice(0, 10) : "");
    const [hour, setHour] = useState("08");
    const [minute, setMinute] = useState("00");

    useEffect(() => {
        if (!valueISO) {
            setSelectedDay("");
            return;
        }
        const parsed = new Date(valueISO);
        if (Number.isNaN(parsed.getTime())) return;
        setSelectedDay(valueISO.slice(0, 10));
        setHour(String(parsed.getHours()).padStart(2, "0"));
        setMinute(String(parsed.getMinutes()).padStart(2, "0"));
    }, [valueISO]);

    const applySelection = () => {
        if (!selectedDay) return;
        const hourValue = Math.max(0, Math.min(23, Number(hour) || 0));
        const minuteValue = Math.max(0, Math.min(59, Number(minute) || 0));
        const iso = new Date(`${selectedDay}T${String(hourValue).padStart(2, "0")}:${String(minuteValue).padStart(2, "0")}:00.000Z`).toISOString();

        onChangeISO(iso);

        setOpen(false);
    };

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
                        <View style={styles.pickerCard}>
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
                            <View style={styles.timeRow}>
                                <View style={styles.timeField}>
                                    <Text style={styles.timeLabel}>Hora</Text>
                                    <TextInput
                                        value={hour}
                                        onChangeText={setHour}
                                        keyboardType="numeric"
                                        maxLength={2}
                                        style={styles.timeInput}
                                    />
                                </View>
                                <View style={styles.timeField}>
                                    <Text style={styles.timeLabel}>Min</Text>
                                    <TextInput
                                        value={minute}
                                        onChangeText={setMinute}
                                        keyboardType="numeric"
                                        maxLength={2}
                                        style={styles.timeInput}
                                    />
                                </View>
                            </View>
                            <Text style={styles.timeHint}>La hora se guarda junto a la fecha en formato ISO.</Text>
                            <Pressable style={styles.applyBtn} onPress={applySelection}>
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
            gap: 12,
        },
        timeRow: { flexDirection: "row", gap: 12 },
        timeField: { flex: 1, gap: 6 },
        timeLabel: { color: theme.colors.textSecondary, fontWeight: "900", fontSize: 12 },
        timeInput: {
            height: 44,
            borderRadius: theme.radius.sm,
            borderWidth: 1,
            borderColor: theme.colors.borderPrimary,
            paddingHorizontal: 12,
            backgroundColor: theme.colors.bgTertiary,
            color: theme.colors.textPrimary,
            fontWeight: "800",
        },
        timeHint: { color: theme.colors.textTertiary, fontWeight: "700", fontSize: 11 },
        applyBtn: {
            alignSelf: "stretch",
            alignItems: "center",
            justifyContent: "center",
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
