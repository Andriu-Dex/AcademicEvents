import { useMemo, type ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useAppTheme, type ThemeTokens } from "../shared";

export function formatNumber(value: unknown) {
    const num = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(num)) return "0";
    return new Intl.NumberFormat("es-EC").format(num);
}

export function formatCurrency(value: unknown) {
    const num = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(num)) return "$0.00";
    return new Intl.NumberFormat("es-EC", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format(num);
}

export function formatPercent(value: unknown) {
    const num = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(num)) return "0%";
    const normalized = num <= 1 ? num * 100 : num;
    return `${normalized.toFixed(1)}%`;
}

function useReportStyles() {
    const { tokens } = useAppTheme();
    return useMemo(() => createStyles(tokens), [tokens]);
}

export function MetricCard({ label, value }: Readonly<{ label: string; value: string }>) {
    const styles = useReportStyles();
    return (
        <View style={styles.metricCard}>
            <Text style={styles.metricLabel} numberOfLines={2}>
                {label}
            </Text>
            <Text style={styles.metricValue} numberOfLines={1}>
                {value}
            </Text>
        </View>
    );
}

export function SectionCard({ title, children }: Readonly<{ title: string; children: ReactNode }>) {
    const styles = useReportStyles();
    return (
        <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {children}
        </View>
    );
}

export function ProgressBar({
    label,
    value,
    accentColor,
    helperText,
}: Readonly<{
    label: string;
    value: number;
    accentColor?: string;
    helperText?: string;
}>) {
    const { tokens } = useAppTheme();
    const styles = useReportStyles();
    const color = accentColor ?? tokens.colors.primary;
    const normalizedValue = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));

    return (
        <View style={styles.progressWrap}>
            <View style={styles.progressHeader}>
                <Text style={styles.progressLabel} numberOfLines={2}>
                    {label}
                </Text>
                <Text style={[styles.progressValue, { color }]}>{`${normalizedValue.toFixed(0)}%`}</Text>
            </View>
            {helperText ? <Text style={styles.progressHelper}>{helperText}</Text> : null}
            <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${normalizedValue}%`, backgroundColor: color }]} />
            </View>
        </View>
    );
}

export function DataList({
    rows,
    emptyText,
}: Readonly<{
    rows: Array<{ title: string; subtitle?: string; right?: string }>;
    emptyText?: string;
}>) {
    const styles = useReportStyles();
    if (rows.length === 0) {
        return <Text style={styles.emptyText}>{emptyText ?? "Sin datos disponibles."}</Text>;
    }

    return (
        <View style={styles.listWrap}>
            {rows.map((row, index) => (
                <View key={`${row.title}-${index}`} style={styles.listItem}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.itemTitle}>{row.title}</Text>
                        {row.subtitle ? <Text style={styles.itemSubtitle}>{row.subtitle}</Text> : null}
                    </View>
                    {row.right ? <Text style={styles.itemRight}>{row.right}</Text> : null}
                </View>
            ))}
        </View>
    );
}

export function JsonPreview({ value }: Readonly<{ value: unknown }>) {
    const styles = useReportStyles();
    const text = (() => {
        try {
            return JSON.stringify(value, null, 2);
        } catch {
            return String(value);
        }
    })();

    return (
        <ScrollView horizontal style={styles.jsonWrap} showsHorizontalScrollIndicator={false}>
            <Text style={styles.jsonText}>{text}</Text>
        </ScrollView>
    );
}

function createStyles(theme: ThemeTokens) {
    return StyleSheet.create({
        sectionCard: {
            backgroundColor: theme.colors.bgCard,
            borderRadius: theme.radius.lg,
            borderWidth: 1,
            borderColor: theme.colors.borderPrimary,
            padding: theme.spacing.md,
            gap: theme.spacing.sm,
            ...theme.shadow.sm,
        },
        sectionTitle: { fontWeight: "900", color: theme.colors.textPrimary, fontSize: 15 },
        metricCard: {
            minWidth: 130,
            flexGrow: 1,
            backgroundColor: theme.colors.bgCard,
            borderWidth: 1,
            borderColor: theme.colors.borderPrimary,
            borderRadius: theme.radius.md,
            paddingVertical: 12,
            paddingHorizontal: 12,
            gap: 6,
        },
        metricLabel: { color: theme.colors.textSecondary, fontWeight: "700", fontSize: 12 },
        metricValue: { color: theme.colors.textPrimary, fontWeight: "900", fontSize: 18 },
        listWrap: { gap: 8 },
        listItem: {
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            backgroundColor: theme.colors.bgSecondary,
            borderRadius: theme.radius.md,
            borderWidth: 1,
            borderColor: theme.colors.borderPrimary,
            paddingHorizontal: 12,
            paddingVertical: 10,
        },
        itemTitle: { color: theme.colors.textPrimary, fontWeight: "800", fontSize: 13 },
        itemSubtitle: { color: theme.colors.textTertiary, marginTop: 2, fontWeight: "600", fontSize: 11 },
        itemRight: { color: theme.colors.primary, fontWeight: "900", fontSize: 12, maxWidth: 120, textAlign: "right" },
        emptyText: { color: theme.colors.textTertiary, fontWeight: "700" },
        progressWrap: {
            gap: 6,
            backgroundColor: theme.colors.bgSecondary,
            borderRadius: theme.radius.md,
            borderWidth: 1,
            borderColor: theme.colors.borderPrimary,
            paddingHorizontal: 12,
            paddingVertical: 10,
        },
        progressHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
        progressLabel: { flex: 1, color: theme.colors.textPrimary, fontWeight: "800", fontSize: 12 },
        progressValue: { fontWeight: "900", fontSize: 12 },
        progressHelper: { color: theme.colors.textTertiary, fontWeight: "700", fontSize: 11 },
        progressTrack: {
            height: 10,
            borderRadius: theme.radius.full,
            backgroundColor: theme.colors.borderPrimary,
            overflow: "hidden",
        },
        progressFill: {
            height: "100%",
            borderRadius: theme.radius.full,
        },
        jsonWrap: {
            backgroundColor: theme.colors.bgSecondary,
            borderWidth: 1,
            borderColor: theme.colors.borderPrimary,
            borderRadius: theme.radius.md,
            paddingHorizontal: 10,
            paddingVertical: 8,
            maxHeight: 260,
        },
        jsonText: {
            color: theme.colors.textSecondary,
            fontSize: 11,
            lineHeight: 16,
            fontFamily: "monospace",
            fontWeight: "700",
        },
    });
}
