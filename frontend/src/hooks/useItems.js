import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchItems } from '../api';

export function useItems({ minMargin, minRoi, search, pollInterval = 30000 }) {
  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchItems({ minMargin, minRoi, search });
      setItems(data);
      setTotalCount(data.length);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [minMargin, minRoi, search]);

  useEffect(() => {
    setLoading(true);
    load();
    intervalRef.current = setInterval(load, pollInterval);
    return () => clearInterval(intervalRef.current);
  }, [load, pollInterval]);

  return { items, totalCount, loading, error, lastUpdated };
}
