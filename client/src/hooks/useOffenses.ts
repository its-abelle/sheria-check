import { useState, useEffect } from "react";
import {
  getOffensesByCategory,
  getOffenseById,
  getCategories,
  getStatus,
} from "../services/api";
import type { Offense, OffenseCategory, ApiStatus } from "../types";

export function useOffensesByCategory(category: string) {
  const [offenses, setOffenses] = useState<Offense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!category) return;
    let cancelled = false;
    setLoading(true);

    getOffensesByCategory(category)
      .then((data) => {
        if (!cancelled) setOffenses(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || "Failed to load offenses");
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

    getOffenseById(id)
      .then((data) => {
        if (!cancelled) setOffense(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || "Failed to load offense details");
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
    getCategories()
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
