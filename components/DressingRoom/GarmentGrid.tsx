import { useCallback, useEffect } from 'react';
import { View, Text, FlatList, Pressable, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useDressingRoomStore } from '@/store/dressingRoomStore';
import { useGarments } from '@/hooks/useGarments';
import { useFavourites } from '@/hooks/useFavourites';
import { colors, typography, spacing, radius, shadows } from '@/constants/theme';
import type { Garment } from '@/types';

interface GarmentGridProps {
  selectedGarmentIds: string[];
  onToggleGarment: (id: string) => void;
}

interface GarmentCardProps {
  item: Garment;
  isSelected: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

function GarmentCard({ item, isSelected, onPress, onLongPress }: GarmentCardProps) {
  return (
    <Pressable
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      {item.thumbnail_url ? (
        <Image source={{ uri: item.thumbnail_url }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderText}>👕</Text>
        </View>
      )}
      <Text style={styles.name} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.price}>
        RM {(item.sale_price_myr ?? item.price_myr).toFixed(2)}
      </Text>
      {item.is_new && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>NEW</Text>
        </View>
      )}
      {item.sale_price_myr && (
        <View style={styles.saleBadge}>
          <Text style={styles.saleBadgeText}>SALE</Text>
        </View>
      )}
      {isSelected && <View style={styles.selectedBadge} />}
    </Pressable>
  );
}

function EmptyState({ isFavourites }: { isFavourites: boolean }) {
  const { t } = useTranslation();

  return (
    <View style={styles.empty}>
      <Ionicons
        name={isFavourites ? 'heart-outline' : 'shirt-outline'}
        size={48}
        color={colors.textTertiary}
      />
      <Text style={styles.emptyTitle}>
        {isFavourites ? t('dressingRoom.noFavourites') : t('dressingRoom.emptyTitle')}
      </Text>
      <Text style={styles.emptySubtitle}>
        {isFavourites
          ? t('dressingRoom.noFavouritesSubtitle')
          : t('dressingRoom.emptySubtitle')}
      </Text>
    </View>
  );
}

export default function GarmentGrid({ selectedGarmentIds, onToggleGarment }: GarmentGridProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedStore, selectedCategory } = useDressingRoomStore();

  const isFavourites = selectedStore === null;

  // Use different hooks based on whether we're in favourites mode
  const garmentsHook = useGarments(
    isFavourites ? undefined : {
      storeId: selectedStore?.id,
      category: selectedCategory ?? undefined,
    }
  );

  const favouritesHook = useFavourites();

  const { garments, loading, error, refresh, loadMore } = isFavourites
    ? { ...favouritesHook, loadMore: () => {} }
    : garmentsHook;

  // Load garments on mount and when store/category changes
  useEffect(() => {
    if (!isFavourites) {
      refresh();
    }
  }, [selectedStore?.id, selectedCategory, isFavourites]);

  const handleGarmentPress = useCallback(
    (id: string) => {
      onToggleGarment(id);
    },
    [onToggleGarment]
  );

  const handleGarmentLongPress = useCallback(
    (id: string) => {
      router.push(`/garment/${id}`);
    },
    [router]
  );

  if (loading && garments.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryText}>{t('common.retry')}</Text>
        </Pressable>
      </View>
    );
  }

  if (garments.length === 0) {
    return <EmptyState isFavourites={isFavourites} />;
  }

  return (
    <FlatList
      horizontal
      data={garments}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <GarmentCard
          item={item}
          isSelected={selectedGarmentIds.includes(item.id)}
          onPress={() => handleGarmentPress(item.id)}
          onLongPress={() => handleGarmentLongPress(item.id)}
        />
      )}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      onEndReached={isFavourites ? undefined : loadMore}
      onEndReachedThreshold={0.5}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  card: {
    width: 130,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    overflow: 'hidden',
    ...shadows.sm,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  image: {
    width: '100%',
    height: 130,
    backgroundColor: colors.backgroundSecondary,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  name: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: colors.textPrimary,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
  },
  price: {
    ...typography.caption,
    color: colors.textSecondary,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  newBadge: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  newBadgeText: {
    ...typography.smallCaps,
    fontSize: 8,
    color: colors.textInverse,
  },
  saleBadge: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  saleBadgeText: {
    ...typography.smallCaps,
    fontSize: 8,
    color: colors.textInverse,
  },
  selectedBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    ...typography.bodyMedium,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
  },
  retryText: {
    ...typography.labelMedium,
    color: colors.textInverse,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyTitle: {
    ...typography.headingMedium,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.bodyMedium,
    color: colors.textTertiary,
    marginTop: spacing.xs,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});
