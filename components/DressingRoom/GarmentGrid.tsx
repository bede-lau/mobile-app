import { useCallback, useEffect, useRef } from 'react';
import { View, Text, FlatList, Pressable, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Shirt } from 'lucide-react-native';
import { useDressingRoomStore } from '@/store/dressingRoomStore';
import { useGarments } from '@/hooks/useGarments';
import { useFavourites } from '@/hooks/useFavourites';
import { colors, typography, spacing, radius, shadows, fontFamily } from '@/constants/theme';
import type { Garment } from '@/types';

interface GarmentGridProps {
  selectedGarmentIds: string[];
  onToggleGarment: (garment: Garment) => void;
}

interface GarmentCardProps {
  item: Garment;
  isSelected: boolean;
  onToggle: () => void;
  onDoubleTap: () => void;
}

function GarmentCard({ item, isSelected, onToggle, onDoubleTap }: GarmentCardProps) {
  const lastTapRef = useRef<number>(0);

  function handlePress() {
    // Selected card: single tap always deselects — no double-tap ambiguity
    if (isSelected) {
      lastTapRef.current = 0;
      onToggle();
      return;
    }
    // Unselected card: single tap selects, rapid second tap navigates to detail
    const now = Date.now();
    if (now - lastTapRef.current <= 200) {
      lastTapRef.current = 0;
      onDoubleTap();
    } else {
      lastTapRef.current = now;
      onToggle();
    }
  }

  return (
    <Pressable
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={handlePress}
    >
      {item.thumbnail_url ? (
        <Image source={{ uri: item.thumbnail_url }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Shirt size={32} color={colors.textTertiary} />
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

  const handleGarmentToggle = useCallback(
    (garment: Garment) => {
      onToggleGarment(garment);
    },
    [onToggleGarment]
  );

  const handleGarmentDoubleTap = useCallback(
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
          onToggle={() => handleGarmentToggle(item)}
          onDoubleTap={() => handleGarmentDoubleTap(item.id)}
        />
      )}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      extraData={selectedGarmentIds}
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
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.sm,
  },
  cardSelected: {
    borderColor: colors.primary,
  },
  image: {
    width: '100%',
    height: 114,
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
    fontFamily: fontFamily.serifMedium,
    color: colors.textPrimary,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
  },
  price: {
    ...typography.caption,
    fontFamily: fontFamily.sansMedium,
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
    fontFamily: fontFamily.sansBold,
    fontSize: 8,
    color: colors.textInverse,
    letterSpacing: 1,
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
    fontFamily: fontFamily.sansBold,
    fontSize: 8,
    color: colors.textInverse,
    letterSpacing: 1,
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
    fontFamily: fontFamily.serifMedium,
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
