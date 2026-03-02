import { useState, useCallback, useEffect, useRef } from 'react';
import { fetchFavouriteGarments } from '@/lib/api';
import { useUserStore } from '@/store/userStore';
import type { Garment } from '@/types';

export function useFavourites() {
  const { user } = useUserStore();
  const [garments, setGarments] = useState<Garment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  const load = useCallback(async () => {
    if (loadingRef.current) return;
    if (!user?.id) {
      setGarments([]);
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFavouriteGarments(user.id);

      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setGarments(result.data);
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [user?.id]);

  const refresh = useCallback(() => load(), [load]);

  useEffect(() => {
    load();
  }, [load]);

  return { garments, loading, error, refresh };
}
