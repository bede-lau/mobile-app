import { useState, useCallback, useEffect } from 'react';
import { fetchStores } from '@/lib/api';
import type { Store } from '@/types';

export function useStores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    const result = await fetchStores();

    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setStores(result.data);
    }

    setLoading(false);
  }, [loading]);

  const refresh = useCallback(() => load(), [load]);

  useEffect(() => {
    load();
  }, []);

  return { stores, loading, error, refresh };
}
