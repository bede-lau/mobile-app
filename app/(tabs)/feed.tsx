import { useEffect, useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, RefreshControl, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useFeed } from '@/hooks/useFeed';
import FeedItem from '@/components/FeedItem';
import { colors, typography, spacing } from '@/constants/theme';
import { useTranslation } from 'react-i18next';
import type { OutfitFeedItem } from '@/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function FeedScreen() {
  const { t } = useTranslation();
  const {
    items,
    loading,
    refreshing,
    error,
    likedIds,
    loadMore,
    refresh,
    handleLike,
    shouldPrefetch,
  } = useFeed();

  const [activeIndex, setActiveIndex] = useState(0);

  // Load initial data
  useEffect(() => {
    loadMore();
  }, []);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        const idx = viewableItems[0].index;
        setActiveIndex(idx);
        if (shouldPrefetch(idx)) {
          loadMore();
        }
      }
    },
    [shouldPrefetch, loadMore]
  );

  const viewabilityConfigRef = useRef({
    itemVisiblePercentThreshold: 50,
  });

  const renderItem = useCallback(
    ({ item, index }: { item: OutfitFeedItem; index: number }) => (
      <FeedItem
        item={item}
        isActive={index === activeIndex}
        isLiked={likedIds.has(item.id)}
        onLike={handleLike}
      />
    ),
    [activeIndex, likedIds, handleLike]
  );

  if (error && items.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{t('common.error')}</Text>
        <Text style={styles.retryText} onPress={refresh}>
          {t('common.retry')}
        </Text>
      </View>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>{t('feed.emptyTitle')}</Text>
        <Text style={styles.emptySubtitle}>{t('feed.emptySubtitle')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlashList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        snapToInterval={SCREEN_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfigRef.current}
        removeClippedSubviews
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.textInverse} />
        }
        ListFooterComponent={
          loading ? (
            <View style={styles.footer}>
              <ActivityIndicator color={colors.textInverse} />
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
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
    marginTop: spacing.sm,
  },
  errorText: {
    ...typography.bodyLarge,
    color: colors.error,
    textAlign: 'center',
  },
  retryText: {
    ...typography.labelLarge,
    color: colors.primary,
    marginTop: spacing.md,
  },
  footer: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
