import { View, Text, FlatList, Pressable, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useDressingRoomStore } from '@/store/dressingRoomStore';
import { useStores } from '@/hooks/useStores';
import { colors, typography, spacing, radius, shadows } from '@/constants/theme';
import type { Store } from '@/types';
import { MOCK_GARMENTS } from '@/lib/mockData';
import { isMockMode } from '@/lib/config';

interface StoreCardProps {
  store: Store | null; // null = Favourites
  onPress: () => void;
}

function StoreCard({ store, onPress }: StoreCardProps) {
  const { t } = useTranslation();

  // Favourites card
  if (store === null) {
    return (
      <Pressable style={[styles.card, styles.favouritesCard]} onPress={onPress}>
        <View style={styles.favouritesIcon}>
          <Ionicons name="heart" size={28} color={colors.accent} />
        </View>
        <Text style={styles.storeName}>{t('dressingRoom.favourites')}</Text>
        <Text style={styles.storeLocation}>{t('dressingRoom.fromLikedOutfits')}</Text>
      </Pressable>
    );
  }

  // Calculate garment count for this store (mock mode only for now)
  const garmentCount = isMockMode()
    ? MOCK_GARMENTS.filter(g => g.store_id === store.id).length
    : 0;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {store.logo_url ? (
        <Image source={{ uri: store.logo_url }} style={styles.logo} />
      ) : (
        <View style={[styles.logo, styles.logoPlaceholder]}>
          <Ionicons name="storefront-outline" size={24} color={colors.textTertiary} />
        </View>
      )}
      <Text style={styles.storeName} numberOfLines={1}>
        {store.name}
      </Text>
      <Text style={styles.storeLocation} numberOfLines={1}>
        {store.location}
      </Text>
      <Text style={styles.garmentCount}>
        {t('dressingRoom.itemsCount', { count: garmentCount })}
      </Text>
      {store.is_verified && (
        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark-circle" size={14} color={colors.secondary} />
        </View>
      )}
    </Pressable>
  );
}

export default function StoreSelector() {
  const { t } = useTranslation();
  const { selectStore } = useDressingRoomStore();
  const { stores, loading, error, refresh } = useStores();

  if (loading && stores.length === 0) {
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

  // Prepend Favourites as first item (null represents Favourites)
  const dataWithFavourites: (Store | null)[] = [null, ...stores];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t('dressingRoom.selectStore')}</Text>
      <FlatList
        horizontal
        data={dataWithFavourites}
        keyExtractor={(item) => item?.id ?? 'favourites'}
        renderItem={({ item }) => (
          <StoreCard store={item} onPress={() => selectStore(item)} />
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.labelLarge,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  card: {
    width: 140,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.sm,
    ...shadows.sm,
  },
  favouritesCard: {
    backgroundColor: colors.accentLight,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  favouritesIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
  },
  logoPlaceholder: {
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeName: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  storeLocation: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  garmentCount: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  verifiedBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
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
});
