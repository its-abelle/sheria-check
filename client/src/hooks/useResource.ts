import { useCallback, useEffect, useState } from "react";
import { fetchJSON } from "../services/api";
import type { Pagination, ApiResponse } from "../types";
export interface Resource<T> {
  data: T | undefined;
  pagination: Pagination | undefined;
  loading: boolean;
  error: string | null;
  retry: () => void;
}
export function useResource<T>(path: string | null): Resource<T> {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{
    path: string | null;
    data?: T;
    pagination?: Pagination;
    loading: boolean;
    error: string | null;
  }>({ path, loading: Boolean(path), error: null });
  const retry = useCallback(
    (): void => setRevision((value: number): number => value + 1),
    [],
  );
  useEffect((): (() => void) => {
    const controller = new AbortController();
    if (!path) {
      setState({ path, loading: false, error: null });
      return (): void => controller.abort();
    }
    setState({ path, loading: true, error: null });
    void fetchJSON<T>(path, controller.signal)
      .then((result: ApiResponse<T>): void => {
        if (!controller.signal.aborted)
          setState({
            path,
            data: result.data,
            pagination: result.pagination,
            loading: false,
            error: null,
          });
      })
      .catch((error: unknown): void => {
        if (!controller.signal.aborted)
          setState({
            path,
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "Unable to load this information.",
          });
      });
    return (): void => controller.abort();
  }, [path, revision]);
  // Do not flash the previous route's record while the next effect starts.
  return state.path === path
    ? { ...state, data: state.data, pagination: state.pagination, retry }
    : {
        data: undefined,
        pagination: undefined,
        loading: Boolean(path),
        error: null,
        retry,
      };
}
