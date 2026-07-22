import { useState, useEffect } from "react";
import {
  getCategories as apiGetCategories,
  getStatus,
} from "../services/api";
import type { OffenseCategory, ApiStatus } from "../types";
import { offenseRepository } from "../repositories/OffenseRepository";

export function useCategories() {
  const [categories, setCategories] = useState<OffenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        await offenseRepository.hydrate();
        if (cancelled) return;
        setCategories(offenseRepository.getCategories());
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load categories.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { categories, loading, error };
}

export function useOffensesByCategory(categoryId: string) {
  const [offenses, setOffenses] = useState<import("../types").Offense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        await offenseRepository.hydrate();
        const results = offenseRepository.getByCategory(categoryId);
        if (!cancelled) setOffenses(results);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load offenses.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (categoryId) load();
    return () => { cancelled = true; };
  }, [categoryId]);

  return { offenses, loading, error };
}

export function useOffenseDetail(id: string) {
  const [offense, setOffense] = useState<import("../types").Offense | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        await offenseRepository.hydrate();
        const found = offenseRepository.getById(id);
        if (!cancelled) {
          if (found) {
            setOffense(found);
          } else {
            setError("Offense not found.");
          }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load offense.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (id) load();
    return () => { cancelled = true; };
  }, [id]);

  return { offense, loading, error };
}

export function useApiStatus() {
  const [status, setStatus] = useState<ApiStatus | null>(null);

  useEffect(() => {
    let cancelled = false;

    getStatus().then((s) => {
      if (!cancelled) setStatus(s);
    });

    return () => { cancelled = true; };
  }, []);

  return status;
}
