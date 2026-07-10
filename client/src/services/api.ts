import type { Offense, OffenseCategory, ReportPayload, ApiStatus } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export function searchOffenses(query: string): Promise<Offense[]> {
  return fetchJSON<Offense[]>(`/offenses/search?q=${encodeURIComponent(query)}`);
}

export function getOffenseById(id: string): Promise<Offense> {
  return fetchJSON<Offense>(`/offenses/${id}`);
}

export function getOffensesByCategory(category: string): Promise<Offense[]> {
  return fetchJSON<Offense[]>(`/offenses?category=${encodeURIComponent(category)}`);
}

export function getCategories(): Promise<OffenseCategory[]> {
  return fetchJSON<OffenseCategory[]>("/offenses/categories");
}

export function getStatus(): Promise<ApiStatus> {
  return fetchJSON<ApiStatus>("/status");
}

export function submitReport(payload: ReportPayload): Promise<{ ok: boolean }> {
  return fetchJSON<{ ok: boolean }>("/reports", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
