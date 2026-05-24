import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect } from "@react-navigation/native";
import { AppHeader } from "../../src/components/AppHeader";
import {
    fetchNotificationHistory,
    fetchPushTokenStatus,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    type NotificationItem,
} from "../../src/api/notifications";
import { syncPushTokenNow } from "../../src/features/notifications/usePushTokenSync";
import { queryClient } from "../../src/shared/queryClient";
import { useAppTheme, useThemedStyles, type ThemeTokens } from "../../src/shared";

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

function NotificationCard({
    item,
    onPress,
}: Readonly<{ item: NotificationItem; onPress: (item: NotificationItem) => void }>) {
    const styles = useThemedStyles(createStyles);
    const isRead = Boolean(item.readAt);
    return (
        <Pressable style={[styles.card, !isRead && styles.cardUnread]} onPress={() => onPress(item)}>
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
        </Pressable>
    );
}

export default function NotificationsScreen() {
    const { tokens } = useAppTheme();
    const styles = useThemedStyles(createStyles);
    const [manualRefreshing, setManualRefreshing] = useState(false);

    const query = useQuery({
        queryKey: ["notifications-history"],
        queryFn: () => fetchNotificationHistory(80, 0),
        staleTime: 10000,
        refetchOnWindowFocus: false,
    });
    const pushStatusQuery = useQuery({
        queryKey: ["push-token-status"],
        queryFn: fetchPushTokenStatus,
        staleTime: 10000,
        refetchOnWindowFocus: false,
    });

    useFocusEffect(
        useCallback(() => {
            void query.refetch();
            void pushStatusQuery.refetch();
        }, [query, pushStatusQuery])
    );

    const items = useMemo(() => query.data ?? [], [query.data]);

    const onReadAll = async () => {
        await markAllNotificationsAsRead();
        await queryClient.invalidateQueries({ queryKey: ["notifications-history"] });
    };

    const onOpenNotification = async (item: NotificationItem) => {
        if (item.readAt) return;
        await markNotificationAsRead(item.id);
        await queryClient.invalidateQueries({ queryKey: ["notifications-history"] });
    };

    const onRetryPushSync = async () => {
        await syncPushTokenNow();
        await pushStatusQuery.refetch();
    };

    const onManualRefresh = async () => {
        setManualRefreshing(true);
        try {
            await query.refetch();
            await pushStatusQuery.refetch();
        } finally {
            setManualRefreshing(false);
        }
    };

    let body: ReactNode;
    if (query.isLoading) {
        body = (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={tokens.colors.primary} />
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
                refreshControl={
                    <RefreshControl
                        refreshing={manualRefreshing}
                        onRefresh={() => void onManualRefresh()}
                        tintColor={tokens.colors.primary}
                    />
                }
                renderItem={({ item }) => <NotificationCard item={item} onPress={onOpenNotification} />}
                ListEmptyComponent={<Text style={styles.emptyText}>No tienes notificaciones todavia.</Text>}
            />
        );
    }

    return (
        <View style={styles.container}>
            <AppHeader title="Notificaciones" showBack />

            <View style={styles.actions}>
                <Pressable style={styles.actionBtn} onPress={onReadAll}>
                    <Ionicons name="checkmark-done-outline" size={18} color={tokens.colors.primary} />
                    <Text style={styles.actionText}>Marcar todo como leido</Text>
                </Pressable>

                <View style={styles.pushStatusRow}>
                    <Text style={styles.pushStatusText}>
                        {pushStatusQuery.data?.hasActiveTokens
                            ? `Push activo en ${pushStatusQuery.data.activeTokenCount} dispositivo(s)`
                            : "Push no activo en este dispositivo"}
                    </Text>
                    <Pressable style={styles.syncBtn} onPress={() => void onRetryPushSync()}>
                        <Ionicons name="refresh" size={14} color={tokens.colors.primary} />
                        <Text style={styles.syncText}>Reintentar</Text>
                    </Pressable>
                </View>
            </View>

            {body}
        </View>
    );
}

function createStyles(theme: ThemeTokens) {
    return {
        container: { flex: 1, backgroundColor: theme.colors.bgSecondary },
        actions: {
            padding: theme.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.borderPrimary,
            backgroundColor: theme.colors.bgCard,
        },
        actionBtn: {
            height: 44,
            borderRadius: theme.radius.md,
            borderWidth: 1,
            borderColor: theme.colors.borderPrimary,
            backgroundColor: theme.colors.bgSecondary,
            flexDirection: "row" as const,
            alignItems: "center" as const,
            justifyContent: "center" as const,
            gap: 10,
        },
        actionText: { color: theme.colors.primary, fontWeight: "900" as const },
        pushStatusRow: {
            marginTop: 8,
            flexDirection: "row" as const,
            alignItems: "center" as const,
            justifyContent: "space-between" as const,
            gap: 8,
        },
        pushStatusText: { flex: 1, color: theme.colors.textTertiary, fontWeight: "700" as const, fontSize: 12 },
        syncBtn: {
            flexDirection: "row" as const,
            alignItems: "center" as const,
            gap: 4,
            borderRadius: theme.radius.full,
            borderWidth: 1,
            borderColor: theme.colors.primaryLight,
            paddingHorizontal: 10,
            paddingVertical: 6,
            backgroundColor: theme.colors.primaryLighter,
        },
        syncText: { color: theme.colors.primary, fontWeight: "800" as const, fontSize: 12 },
        center: { flex: 1, alignItems: "center" as const, justifyContent: "center" as const, padding: theme.spacing.lg },
        errorText: { color: theme.colors.error, fontWeight: "900" as const },
        list: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: theme.spacing.xl },
        emptyText: {
            color: theme.colors.textSecondary,
            fontWeight: "800" as const,
            textAlign: "center" as const,
            marginTop: theme.spacing.lg,
        },
        card: {
            backgroundColor: theme.colors.bgCard,
            borderRadius: theme.radius.lg,
            borderWidth: 1,
            borderColor: theme.colors.borderPrimary,
            padding: theme.spacing.md,
            ...theme.shadow.sm,
        },
        cardUnread: { borderColor: theme.colors.primary },
        cardTop: {
            flexDirection: "row" as const,
            alignItems: "center" as const,
            justifyContent: "space-between" as const,
            gap: 10,
        },
        title: { flex: 1, fontWeight: "900" as const, color: theme.colors.textPrimary },
        dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primary },
        body: { marginTop: 8, color: theme.colors.textSecondary, lineHeight: 18 },
        meta: { marginTop: 8, color: theme.colors.textTertiary, fontWeight: "700" as const },
    };
}
