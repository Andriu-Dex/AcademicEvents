import { StyleSheet, Text, TextInput, View } from "react-native";
import { theme } from "../shared/theme";

type Props = {
    label: string;
    valueISO: string;
    onChangeISO: (value: string) => void;
    normalize?: "start" | "end" | "none";
};

export function DatePickerField({ label, valueISO, onChangeISO }: Readonly<Props>) {
    return (
        <View style={styles.wrapper}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={styles.input}
                value={valueISO}
                onChangeText={onChangeISO}
                placeholder="YYYY-MM-DDTHH:mm:ss.sssZ"
                placeholderTextColor={theme.colors.textTertiary}
                autoCapitalize="none"
            />
            <Text style={styles.helper}>En web usa formato ISO. En móvil se muestra el calendario.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: { gap: 6 },
    label: { color: theme.colors.textSecondary, fontWeight: "900", fontSize: 12 },
    input: {
        height: 44,
        borderRadius: theme.radius.sm,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        paddingHorizontal: 12,
        backgroundColor: theme.colors.bgSecondary,
        color: theme.colors.textPrimary,
        fontWeight: "700",
    },
    helper: { color: theme.colors.textTertiary, fontWeight: "700", fontSize: 11 },
});
