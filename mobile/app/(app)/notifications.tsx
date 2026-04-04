import { useMemo, type ReactNode } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "../../src/components/AppHeader";
import {
    fetchNotificationHistory,
    markAllNotificationsAsRead,
    type NotificationItem,
} from "../../src/api/notifications";
import { queryClient } from "../../src/shared/queryClient";
import { theme } from "../../src/shared/theme";

function formatDateTime(raw: string) {
    if (!raw) return "";
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return raw;
    return date.toLocaleString("es-EC", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function NotificationCard({ item }: Readonly<{ item: NotificationItem }>) {
    const isRead = Boolean(item.readAt);
    return (
        <View style={[styles.card, !isRead && styles.cardUnread]}>
            <View style={styles.cardTop}>
                <Text style={styles.title} numberOfLines={1}>
                    {item.title}
                </Text>
                {isRead ? null : <View style={styles.dot} />}
            </View>
            <Text style={styles.body} numberOfLines={3}>
                {item.body}
            </Text>
            <Text style={styles.meta}>{formatDateTime(item.createdAt)}</Text>
        </View>
    );
}

export default function NotificationsScreen() {
    const query = useQuery({
        queryKey: ["notifications-history"],
        queryFn: () => fetchNotificationHistory(80, 0),
        staleTime: 30000,
    });

    const items = useMemo(() => query.data ?? [], [query.data]);

    const onReadAll = async () => {
        await markAllNotificationsAsRead();
        await queryClient.invalidateQueries({ queryKey: ["notifications-history"] });
    };

    let body: ReactNode;
    if (query.isLoading) {
        body = (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    } else if (query.isError) {
        body = (
            <View style={styles.center}>
                <Text style={styles.errorText}>No se pudieron cargar notificaciones.</Text>
            </View>
        );
    } else {
        body = (
            <FlatList
                data={items}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => <NotificationCard item={item} />}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No tienes notificaciones todavía.</Text>
                }
            />
        );
    }

    return (
        <View style={styles.container}>
            <AppHeader title="Notificaciones" showBack />

            <View style={styles.actions}>
                <Pressable style={styles.actionBtn} onPress={onReadAll}>
                    <Ionicons name="checkmark-done-outline" size={18} color={theme.colors.primary} />
                    <Text style={styles.actionText}>Marcar todo como leído</Text>
                </Pressable>
            </View>

            {body}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bgSecondary },
    actions: {
        padding: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderPrimary,
        backgroundColor: theme.colors.bgPrimary,
    },
    actionBtn: {
        height: 44,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        backgroundColor: theme.colors.bgPrimary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    actionText: { color: theme.colors.primary, fontWeight: "900" },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: theme.spacing.lg },
    errorText: { color: theme.colors.error, fontWeight: "900" },
    list: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: theme.spacing.xl },
    emptyText: { color: theme.colors.textSecondary, fontWeight: "800", textAlign: "center", marginTop: theme.spacing.lg },
    card: {
        backgroundColor: theme.colors.bgPrimary,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.borderPrimary,
        padding: theme.spacing.md,
        ...theme.shadow.sm,
    },
    cardUnread: { borderColor: theme.colors.primary },
    cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
    title: { flex: 1, fontWeight: "900", color: theme.colors.textPrimary },
    dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primary },
    body: { marginTop: 8, color: theme.colors.textSecondary, lineHeight: 18 },
    meta: { marginTop: 8, color: theme.colors.textTertiary, fontWeight: "700" },
});
