import { useState, useEffect, useRef, useCallback } from "react";
import { searchOffenses } from "../services/api";
import type { Offense } from "../types";
interface SearchState {
  results: Offense[];
  loading: boolean;
  error: string | null;
  total: number;
  next: string | null;
}
export interface SearchResult extends SearchState {
  query: string;
  setQuery: (value: string) => void;
  hasMore: boolean;
  loadMore: () => void;
  retry: () => void;
}
export function useSearch(): SearchResult {
  const [query, updateQuery] = useState("");
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<SearchState>({
    results: [],
    loading: true,
    error: null,
    total: 0,
    next: null,
  });
  const controller = useRef<AbortController | null>(null);
  const busy = useRef(false);
  const activeQuery = useRef("");
  const run = useCallback(async (q: string, cursor?: string): Promise<void> => {
    if (q !== activeQuery.current.trim()) return;
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    busy.current = true;
    setState((old: SearchState): SearchState => ({
      ...(cursor ? old : { results: [], total: 0, next: null }),
      loading: true,
      error: null,
    }));
    try {
      const result = await searchOffenses(q, cursor, 20, request.signal);
      if (!request.signal.aborted)
        setState((old: SearchState): SearchState => ({
          results: cursor ? [...old.results, ...result.data] : result.data,
          total: result.total,
          next: result.nextCursor,
          loading: false,
          error: null,
        }));
    } catch (error) {
      if (!request.signal.aborted)
        setState((old: SearchState): SearchState => ({
          ...old,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Search failed. Please try again.",
        }));
    } finally {
      if (controller.current === request) busy.current = false;
    }
  }, []);
  useEffect((): (() => void) => {
    const timer = setTimeout((): void => {
      void run(query.trim());
    }, 250);
    return (): void => {
      clearTimeout(timer);
      controller.current?.abort();
    };
  }, [query, revision, run]);
  const setQuery = useCallback((value: string): void => {
    if (value === activeQuery.current) return;
    activeQuery.current = value;
    controller.current?.abort();
    busy.current = false;
    setState({ results: [], loading: true, error: null, total: 0, next: null });
    updateQuery(value);
  }, []);
  const loadMore = (): void => {
    if (state.next && !busy.current) void run(query.trim(), state.next);
  };
  return {
    ...state,
    query,
    setQuery,
    hasMore: state.next !== null,
    loadMore,
    retry: (): void => setRevision((old: number): number => old + 1),
  };
}
