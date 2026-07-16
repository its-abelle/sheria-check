import { useState, useEffect } from "react";
import {
  getOffensesByCategory as apiGetByCategory,
  getOffenseById as apiGetById,
  getCategories as apiGetCategories,
  getStatus,
} from "../services/api";
import {
  cacheOffenses,
  getOffenseById as localGetById,
  getOffensesByCategory as localGetByCategory,
} from "../utils/offlineDb";
import type { Offense, OffenseCategory, ApiStatus } from "../types";

function isOffline(): boolean {
  return !navigator.onLine;
}

export function useOffensesByCategory(category: string) {
  const [offenses, setOffenses] = useState<Offense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!category) return;
    let cancelled = false;
    setLoading(true);

    if (isOffline()) {
      localGetByCategory(category)
        .then((data) => {
          if (!cancelled) {
            setOffenses(data);
            setLoading(false);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setError("You are offline. Connect to the internet to load offenses.");
            setLoading(false);
          }
        });
      return () => { cancelled = true; };
    }

    apiGetByCategory(category)
      .then((data) => {
        if (!cancelled) {
          setOffenses(data);
          cacheOffenses(data).catch(() => {});
        }
      })
      .catch((e) => {
        if (!cancelled) {
          localGetByCategory(category)
            .then((cached) => {
              if (!cancelled) {
                setOffenses(cached);
                setError(cached.length > 0 ? null : e.message || "Failed to load offenses");
              }
            })
            .catch(() => {
              if (!cancelled) setError(e.message || "Failed to load offenses");
            });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [category]);

  return { offenses, loading, error };
}

export function useOffenseDetail(id: string) {
  const [offense, setOffense] = useState<Offense | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);

    if (isOffline()) {
      localGetById(id)
        .then((data) => {
          if (!cancelled) {
            setOffense(data);
            if (!data) setError("Offense not available offline.");
            setLoading(false);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setError("You are offline.");
            setLoading(false);
          }
        });
      return () => { cancelled = true; };
    }

    apiGetById(id)
      .then((data) => {
        if (!cancelled) {
          setOffense(data);
          cacheOffenses([data]).catch(() => {});
        }
      })
      .catch((e) => {
        if (!cancelled) {
          localGetById(id)
            .then((cached) => {
              if (!cancelled) {
                setOffense(cached);
                setError(cached ? null : e.message || "Failed to load offense details");
              }
            })
            .catch(() => {
              if (!cancelled) setError(e.message || "Failed to load offense details");
            });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  return { offense, loading, error };
}

export function useCategories() {
  const [categories, setCategories] = useState<OffenseCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiGetCategories()
      .then((data) => {
        if (!cancelled) setCategories(data);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return { categories, loading };
}

export function useApiStatus() {
  const [status, setStatus] = useState<ApiStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    getStatus()
      .then((data) => {
        if (!cancelled) setStatus(data);
      })
      .catch(() => {
        if (!cancelled) setStatus(null);
      });

    return () => { cancelled = true; };
  }, []);

  return status;
}
