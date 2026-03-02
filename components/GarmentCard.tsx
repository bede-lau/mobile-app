import { Pressable, View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, radius, shadows } from '@/constants/theme';
import { formatMYR } from '@/constants/sizeCharts';
import type { Garment } from '@/types';

interface GarmentCardProps {
  garment: Garment;
  variant?: 'vertical' | 'horizontal';
  style?: ViewStyle;
}

export default function GarmentCard({
  garment,
  variant = 'vertical',
  style,
}: GarmentCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/garment/${garment.id}`);
  };

  if (variant === 'horizontal') {
    return (
      <Pressable style={[styles.horizontalContainer, style]} onPress={handlePress}>
        <Image
          source={{ uri: garment.thumbnail_url || undefined }}
          style={styles.horizontalImage}
        />
        <View style={styles.horizontalContent}>
          <Text style={styles.name} numberOfLines={2}>
            {garment.name}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {formatMYR(garment.sale_price_myr ?? garment.price_myr)}
            </Text>
            {garment.sale_price_myr != null && (
              <Text style={styles.originalPrice}>{formatMYR(garment.price_myr)}</Text>
            )}
          </View>
          {garment.is_new && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable style={[styles.verticalContainer, style]} onPress={handlePress}>
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: garment.thumbnail_url || undefined }}
          style={styles.verticalImage}
        />
        {garment.is_new && (
          <View style={styles.newBadgeOverlay}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
        {garment.sale_price_myr != null && (
          <View style={styles.saleBadge}>
            <Text style={styles.saleBadgeText}>SALE</Text>
          </View>
        )}
      </View>
      <View style={styles.verticalContent}>
        <Text style={styles.name} numberOfLines={2}>
          {garment.name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            {formatMYR(garment.sale_price_myr ?? garment.price_myr)}
          </Text>
          {garment.sale_price_myr != null && (
            <Text style={styles.originalPrice}>{formatMYR(garment.price_myr)}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  verticalContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    overflow: 'hidden',
    ...shadows.sm,
  },
  imageWrapper: {
    position: 'relative',
  },
  verticalImage: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: colors.backgroundSecondary,
  },
  verticalContent: {
    padding: spacing.sm,
  },
  name: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  price: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  originalPrice: {
    ...typography.caption,
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  newBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.xs,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  newBadgeOverlay: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  newBadgeText: {
    ...typography.labelSmall,
    color: colors.textInverse,
  },
  saleBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  saleBadgeText: {
    ...typography.labelSmall,
    color: colors.textInverse,
  },
  horizontalContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    overflow: 'hidden',
    ...shadows.sm,
  },
  horizontalImage: {
    width: 100,
    height: 100,
    backgroundColor: colors.backgroundSecondary,
  },
  horizontalContent: {
    flex: 1,
    padding: spacing.sm,
    justifyContent: 'center',
  },
});
