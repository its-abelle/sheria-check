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
    setLoading(true);
    getOffensesByCategory(category)
      .then(setOffenses)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [category]);

  return { offenses, loading, error };
}

export function useOffenseDetail(id: string) {
  const [offense, setOffense] = useState<Offense | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getOffenseById(id)
      .then(setOffense)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { offense, loading, error };
}

export function useCategories() {
  const [categories, setCategories] = useState<OffenseCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}

export function useApiStatus() {
  const [status, setStatus] = useState<ApiStatus | null>(null);

  useEffect(() => {
    getStatus()
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  return status;
}
