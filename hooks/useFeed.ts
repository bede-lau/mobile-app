import { useState, useCallback, useRef } from 'react';
import { fetchFeedItems, toggleLike } from '@/lib/api';
import { useUserStore } from '@/store/userStore';
import type { OutfitFeedItem } from '@/types';

const BATCH_SIZE = 5;
const PREFETCH_THRESHOLD = 2;

export function useFeed() {
  const { user } = useUserStore();
  const [items, setItems] = useState<OutfitFeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState(() => new Set<string>());
  const cursorRef = useRef<{ relevance_score: number; id: string } | undefined>(undefined);

  const loadItems = useCallback(async (refresh = false) => {
    if (loading) return;
    if (!refresh && !hasMore) return;

    if (refresh) {
      setRefreshing(true);
      cursorRef.current = undefined;
    } else {
      setLoading(true);
    }
    setError(null);

    const cursor = refresh ? undefined : cursorRef.current;
    const result = await fetchFeedItems(cursor, BATCH_SIZE);

    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      const newItems = result.data;
      if (newItems.length < BATCH_SIZE) setHasMore(false);

      if (newItems.length > 0) {
        const last = newItems[newItems.length - 1];
        cursorRef.current = { relevance_score: last.relevance_score, id: last.id };
      }

      setItems((prev) => (refresh ? newItems : [...prev, ...newItems]));
    }

    setLoading(false);
    setRefreshing(false);
  }, [loading, hasMore]);

  const refresh = useCallback(() => loadItems(true), [loadItems]);
  const loadMore = useCallback(() => loadItems(false), [loadItems]);

  const handleLike = useCallback(async (feedItemId: string) => {
    if (!user?.id) return;
    const isLiked = likedIds.has(feedItemId);

    // Optimistic update
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (isLiked) next.delete(feedItemId);
      else next.add(feedItemId);
      return next;
    });

    setItems((prev) =>
      prev.map((item) =>
        item.id === feedItemId
          ? { ...item, likes_count: item.likes_count + (isLiked ? -1 : 1) }
          : item
      )
    );

    await toggleLike(user.id, feedItemId, isLiked);
  }, [user, likedIds]);

  const shouldPrefetch = useCallback((currentIndex: number) => {
    return currentIndex >= items.length - PREFETCH_THRESHOLD;
  }, [items.length]);

  return {
    items,
    loading,
    refreshing,
    hasMore,
    error,
    likedIds,
    loadMore,
    refresh,
    handleLike,
    shouldPrefetch,
  };
}
