import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react-native';
import { fetchStore } from '@/lib/api';
import { useGarments } from '@/hooks/useGarments';
import GarmentCard from '@/components/GarmentCard';
import { colors, typography, spacing, radius } from '@/constants/theme';
import type { Store, Garment, GarmentCategory } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = spacing.sm;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.md * 2 - CARD_GAP) / 2;

const CATEGORIES: (GarmentCategory | 'all')[] = [
  'all', 'tops', 'bottoms', 'dresses', 'outerwear', 'activewear', 'traditional',
];

export default function StoreScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const [store, setStore] = useState<Store | null>(null);
  const [activeCategory, setActiveCategory] = useState<GarmentCategory | 'all'>('all');

  const { garments, loading, refresh, loadMore } = useGarments({
    storeId: id,
    ...(activeCategory !== 'all' ? { category: activeCategory } : {}),
  });

  useEffect(() => {
    if (!id) return;
    (async () => {
      const result = await fetchStore(id);
      if (result.data) setStore(result.data);
    })();
  }, [id]);

  useEffect(() => {
    refresh();
  }, [activeCategory]);

  const renderGarment = useCallback(
    ({ item }: { item: Garment }) => (
      <GarmentCard garment={item} variant="vertical" style={{ width: CARD_WIDTH }} />
    ),
    []
  );

  const ListHeader = useCallback(
    () => (
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={20} color={colors.primary} />
        </Pressable>

        {store?.banner_url && (
          <Image source={{ uri: store.banner_url }} style={styles.banner} />
        )}

        <View style={styles.storeInfo}>
          {store?.logo_url && (
            <Image source={{ uri: store.logo_url }} style={styles.logo} />
          )}
          <Text style={styles.storeName}>{store?.name}</Text>
          {store?.is_verified && (
            <Text style={styles.verified}>{t('store.verified')}</Text>
          )}
          <Text style={styles.description}>{store?.description}</Text>
        </View>

        {/* Category filters */}
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item: cat }) => (
            <Pressable
              style={[
                styles.categoryPill,
                activeCategory === cat && styles.categoryPillActive,
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === cat && styles.categoryTextActive,
                ]}
              >
                {cat === 'all' ? t('store.allGarments') : t(`dressingRoom.categories.${cat}`)}
              </Text>
            </Pressable>
          )}
        />
      </View>
    ),
    [store, activeCategory, router, t]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={garments}
        renderItem={renderGarment}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        ListHeaderComponent={ListHeader}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          loading ? <ActivityIndicator style={styles.footer} color={colors.primary} /> : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    marginBottom: spacing.md,
  },
  backButton: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.md,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  banner: {
    width: SCREEN_WIDTH,
    height: 160,
    backgroundColor: colors.backgroundSecondary,
  },
  storeInfo: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
  },
  storeName: {
    ...typography.headingLarge,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  verified: {
    ...typography.labelSmall,
    color: colors.secondary,
    marginTop: spacing.xs,
  },
  description: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  categoryList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  categoryPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    ...typography.labelMedium,
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: colors.textInverse,
  },
  grid: {
    paddingHorizontal: spacing.md,
  },
  row: {
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },
  footer: {
    paddingVertical: spacing.lg,
  },
});
