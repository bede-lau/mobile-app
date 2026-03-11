import { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import * as Haptics from '@/lib/haptics';
import { useCartStore } from '@/store/cartStore';
import Button from '@/components/ui/Button';
import { colors, typography, spacing, radius, shadows } from '@/constants/theme';
import { formatMYR } from '@/constants/sizeCharts';
import type { CartItem } from '@/types';

export default function CartScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { items, getTotal, getItemCount, updateQuantity, removeItem } = useCartStore();

  const total = getTotal();
  const count = getItemCount();

  const renderSwipeDelete = useCallback(
    (garmentId: string, size: string) => () => (
      <Pressable
        style={styles.deleteAction}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          removeItem(garmentId, size as any);
        }}
      >
        <Text style={styles.deleteText}>{t('cart.remove')}</Text>
      </Pressable>
    ),
    [removeItem, t]
  );

  const renderItem = useCallback(
    ({ item }: { item: CartItem }) => (
      <Swipeable renderRightActions={renderSwipeDelete(item.garment_id, item.size)}>
        <View style={styles.cartItem}>
          {item.thumbnail_url ? (
            <Image source={{ uri: item.thumbnail_url }} style={styles.thumbnail} />
          ) : (
            <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
              <Text style={styles.placeholderEmoji}>👕</Text>
            </View>
          )}
          <View style={styles.itemInfo}>
            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.itemSize}>Size: {item.size}</Text>
            <Text style={styles.itemPrice}>{formatMYR(item.unit_price_myr)}</Text>
          </View>
          <View style={styles.quantityControls}>
            <Pressable
              style={styles.qtyButton}
              onPress={() => updateQuantity(item.garment_id, item.size, item.quantity - 1)}
            >
              <Text style={styles.qtyButtonText}>−</Text>
            </Pressable>
            <Text style={styles.qtyText}>{item.quantity}</Text>
            <Pressable
              style={styles.qtyButton}
              onPress={() => updateQuantity(item.garment_id, item.size, item.quantity + 1)}
            >
              <Text style={styles.qtyButtonText}>+</Text>
            </Pressable>
          </View>
        </View>
      </Swipeable>
    ),
    [updateQuantity, renderSwipeDelete]
  );

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>{t('cart.empty')}</Text>
        <Text style={styles.emptySubtitle}>{t('cart.emptySubtitle')}</Text>
        <Button
          title={t('feed.shopNow')}
          onPress={() => router.replace('/(tabs)/feed')}
          variant="secondary"
        />
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <Text style={styles.title}>{t('cart.title')} ({count})</Text>
          <View style={{ width: 40 }} />
        </View>

        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.garment_id}-${item.size}`}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.bottomBar}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t('cart.total')}</Text>
            <Text style={styles.totalValue}>{formatMYR(total)}</Text>
          </View>
          <Button
            title={t('cart.checkout')}
            onPress={() => router.push('/checkout')}
            fullWidth
          />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    ...typography.headingLarge,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backText: {
    fontSize: 20,
    color: colors.primary,
    width: 40,
  },
  title: {
    ...typography.headingSmall,
    color: colors.textPrimary,
  },
  list: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.sm,
    gap: spacing.sm,
    ...shadows.sm,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: radius.sm,
    backgroundColor: colors.backgroundSecondary,
  },
  thumbnailPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 24,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    ...typography.bodyMedium,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  itemSize: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemPrice: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  qtyText: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.textPrimary,
    minWidth: 24,
    textAlign: 'center',
  },
  deleteAction: {
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: radius.sm,
    marginLeft: spacing.sm,
  },
  deleteText: {
    ...typography.labelMedium,
    color: colors.textInverse,
  },
  bottomBar: {
    padding: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    ...typography.headingSmall,
    color: colors.textPrimary,
  },
  totalValue: {
    ...typography.headingSmall,
    color: colors.textPrimary,
  },
});
