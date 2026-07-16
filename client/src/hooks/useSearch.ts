import { useState, useCallback, useRef } from "react";
import { searchOffenses } from "../services/api";
import { searchOffensesLocal, cacheOffenses } from "../utils/offlineDb";
import type { Offense } from "../types";

function isOffline(): boolean {
  return !navigator.onLine;
}

export function useSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Offense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const cursorRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastQueryRef = useRef("");

  const search = useCallback((q: string) => {
    setQuery(q);
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!q.trim()) {
      setResults([]);
      setHasMore(false);
      setTotal(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    cursorRef.current = 0;
    lastQueryRef.current = q;

    timerRef.current = setTimeout(async () => {
      try {
        if (isOffline()) {
          const local = await searchOffensesLocal(q);
          if (lastQueryRef.current !== q) return;
          setResults(local);
          setHasMore(false);
          setTotal(local.length);
          if (local.length === 0) {
            setError("You are offline. Only previously viewed offenses are searchable.");
          }
        } else {
          const res = await searchOffenses(q, 0, 20);
          if (lastQueryRef.current !== q) return;
          setResults(res.data);
          setHasMore(res.pagination.has_more);
          setTotal(res.pagination.total);
          cursorRef.current = res.pagination.cursor;
          cacheOffenses(res.data).catch(() => {});
        }
      } catch (e) {
        if (lastQueryRef.current !== q) return;
        const local = await searchOffensesLocal(q);
        if (lastQueryRef.current !== q) return;
        if (local.length > 0) {
          setResults(local);
          setHasMore(false);
          setTotal(local.length);
          setError("Showing cached results. Connect to the internet for latest data.");
        } else {
          setError(e instanceof Error ? e.message : "Search failed. Check your connection.");
        }
      } finally {
        if (lastQueryRef.current === q) setLoading(false);
      }
    }, 300);
  }, []);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !query.trim() || isOffline()) return;

    setLoading(true);
    try {
      const res = await searchOffenses(query, cursorRef.current, 20);
      setResults((prev) => [...prev, ...res.data]);
      setHasMore(res.pagination.has_more);
      cursorRef.current = res.pagination.cursor;
      cacheOffenses(res.data).catch(() => {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load more results.");
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, query]);

  return { query, setQuery: search, results, loading, error, hasMore, total, loadMore };
}
