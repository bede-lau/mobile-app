import { useState, useCallback, useRef } from 'react';
import { fetchGarments } from '@/lib/api';
import type { Garment, GarmentCategory, GarmentGender } from '@/types';

const PAGE_SIZE = 20;

interface UseGarmentsParams {
  storeId?: string;
  category?: GarmentCategory;
  gender?: GarmentGender;
}

export function useGarments(params?: UseGarmentsParams) {
  const [garments, setGarments] = useState<Garment[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cursorRef = useRef<string | undefined>(undefined);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);

  const load = useCallback(async (refresh = false) => {
    if (loadingRef.current) return;
    if (!refresh && !hasMoreRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    if (refresh) {
      cursorRef.current = undefined;
      hasMoreRef.current = true;
      setHasMore(true);
    }

    try {
      const result = await fetchGarments({
        storeId: params?.storeId,
        category: params?.category,
        gender: params?.gender,
        cursor: refresh ? undefined : cursorRef.current,
        limit: PAGE_SIZE,
      });

      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        const newItems = result.data;
        if (newItems.length < PAGE_SIZE) {
          hasMoreRef.current = false;
          setHasMore(false);
        }

        if (newItems.length > 0) {
          cursorRef.current = newItems[newItems.length - 1].created_at;
        }

        setGarments((prev) => (refresh ? newItems : [...prev, ...newItems]));
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [params?.storeId, params?.category, params?.gender]);

  const refresh = useCallback(() => load(true), [load]);
  const loadMore = useCallback(() => load(false), [load]);

  return { garments, loading, hasMore, error, refresh, loadMore };
}
