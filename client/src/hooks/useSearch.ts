import { useState, useCallback, useRef, useEffect } from "react";
import { searchOffenses as apiSearch } from "../services/api";
import { offenseRepository } from "../repositories/OffenseRepository";
import type { Offense } from "../types";

/** Hook that manages local fuzzy search state with debounced input and pagination. */
export function useSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Offense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const nextCursorRef = useRef<string | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

  const doLocalSearch = useCallback((q: string) => {
    const repoResults = offenseRepository.search(q);
    setResults(repoResults);
    setTotal(repoResults.length);
    setHasMore(false);
    setError(null);
  }, []);

  const search = useCallback(
    (value: string) => {
      setQuery(value);
      if (searchTimer.current) clearTimeout(searchTimer.current);

      if (!value.trim()) {
        setResults([]);
        setTotal(0);
        setHasMore(false);
        nextCursorRef.current = null;
        return;
      }

      searchTimer.current = setTimeout(() => {
        doLocalSearch(value.trim());
      }, 200);
    },
    [doLocalSearch]
  );

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !nextCursorRef.current) return;
    setLoading(true);
    try {
      const result = await apiSearch(query, nextCursorRef.current);
      setResults((prev) => [...prev, ...result.data]);
      nextCursorRef.current = result.nextCursor;
      setHasMore(result.nextCursor !== null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load more results.");
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, query]);

  return { query, setQuery: search, results, loading, error, hasMore, total, loadMore };
}
