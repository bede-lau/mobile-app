import { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useUserStore } from '@/store/userStore';
import { useAvatarStore } from '@/store/avatarStore';
import { supabase } from '@/lib/supabase';
import { colors, typography, spacing, radius, shadows } from '@/constants/theme';
import type { Order } from '@/types';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signOut } = useAuth();
  const { user } = useUserStore();
  const { measurements } = useAvatarStore();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (data) setOrders(data as Order[]);
    })();
  }, [user?.id]);

  const handleLogout = useCallback(async () => {
    Alert.alert(t('auth.logout'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('auth.logout'),
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }, [signOut, router, t]);

  const statusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'delivered':
        return colors.secondary;
      case 'shipped':
        return colors.info;
      case 'cancelled':
      case 'refunded':
        return colors.error;
      default:
        return colors.warning;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          {user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>
                {user?.full_name?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
          )}
          <Text style={styles.name}>{user?.full_name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.memberSince}>
            {t('profile.memberSince', {
              date: user?.created_at
                ? new Date(user.created_at).toLocaleDateString()
                : '',
            })}
          </Text>
        </View>

        {/* Sections */}
        <View style={styles.sectionGroup}>
          <Text style={styles.sectionHeader}>{t('profile.account')}</Text>
          <Pressable style={styles.menuItem}>
            <Text style={styles.menuText}>{t('profile.editProfile')}</Text>
            <Text style={styles.menuArrow}>→</Text>
          </Pressable>
        </View>

        <View style={styles.sectionGroup}>
          <Text style={styles.sectionHeader}>{t('profile.bodyMeasurements')}</Text>
          {measurements ? (
            <View style={styles.measurementsGrid}>
              {Object.entries(measurements).map(([key, value]) => (
                <View key={key} style={styles.measurementItem}>
                  <Text style={styles.measurementLabel}>
                    {key.replace('_cm', '').replace('_', ' ')}
                  </Text>
                  <Text style={styles.measurementValue}>{value}cm</Text>
                </View>
              ))}
            </View>
          ) : (
            <Pressable
              style={styles.menuItem}
              onPress={() => router.push('/(tabs)/scanner')}
            >
              <Text style={styles.menuText}>{t('size.scanNow')}</Text>
              <Text style={styles.menuArrow}>→</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.sectionGroup}>
          <Text style={styles.sectionHeader}>{t('profile.preferences')}</Text>
          <Pressable style={styles.menuItem}>
            <Text style={styles.menuText}>{t('profile.language')}</Text>
            <Text style={styles.menuValue}>{user?.preferred_language?.toUpperCase()}</Text>
          </Pressable>
          {user?.style_preferences && user.style_preferences.length > 0 && (
            <View style={styles.styleChips}>
              {user.style_preferences.map((style) => (
                <View key={style} style={styles.chip}>
                  <Text style={styles.chipText}>{style}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.sectionGroup}>
          <Text style={styles.sectionHeader}>{t('profile.orderHistory')}</Text>
          {orders.length === 0 ? (
            <Text style={styles.emptyText}>{t('profile.noOrders')}</Text>
          ) : (
            orders.map((order) => (
              <View key={order.id} style={styles.orderItem}>
                <View>
                  <Text style={styles.orderId}>#{order.id.slice(0, 8)}</Text>
                  <Text style={styles.orderDate}>
                    {new Date(order.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.orderRight}>
                  <Text style={styles.orderTotal}>RM {order.total_myr.toFixed(2)}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusColor(order.status) + '20' },
                    ]}
                  >
                    <Text
                      style={[styles.statusText, { color: statusColor(order.status) }]}
                    >
                      {order.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.sectionGroup}>
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>{t('auth.logout')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: spacing.md,
  },
  avatarPlaceholder: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    ...typography.displaySmall,
    color: colors.textInverse,
  },
  name: {
    ...typography.headingLarge,
    color: colors.textPrimary,
  },
  email: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  memberSince: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  sectionGroup: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    ...typography.labelLarge,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  menuText: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
  },
  menuValue: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  menuArrow: {
    fontSize: 16,
    color: colors.textTertiary,
  },
  measurementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  measurementItem: {
    width: '47%',
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: radius.sm,
    ...shadows.sm,
  },
  measurementLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  measurementValue: {
    ...typography.headingSmall,
    color: colors.textPrimary,
    marginTop: 2,
  },
  styleChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  chip: {
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.xs,
  },
  chipText: {
    ...typography.labelSmall,
    color: colors.textSecondary,
  },
  emptyText: {
    ...typography.bodyMedium,
    color: colors.textTertiary,
    paddingVertical: spacing.md,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  orderId: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  orderDate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  orderRight: {
    alignItems: 'flex-end',
  },
  orderTotal: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.xs,
    marginTop: spacing.xs,
  },
  statusText: {
    ...typography.labelSmall,
    textTransform: 'capitalize',
  },
  logoutButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  logoutText: {
    ...typography.bodyLarge,
    color: colors.error,
    fontWeight: '600',
  },
});
