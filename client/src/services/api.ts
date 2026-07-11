import type { Offense, OffenseCategory, ReportPayload, ApiStatus } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Request failed (${res.status})`);
  }
  return res.json();
}

function hasDataField<T>(response: unknown): response is { data: T } {
  return typeof response === "object" && response !== null && "data" in response;
}

function extractData<T>(response: unknown): T {
  if (hasDataField<T>(response)) return response.data;
  return response as T;
}

export async function searchOffenses(
  query: string,
  cursor = 0,
  limit = 20
): Promise<{ data: Offense[]; pagination: { cursor: number; limit: number; has_more: boolean; total: number } }> {
  const res = await fetchJSON<{ data: Offense[]; pagination: any }>(
    `/offenses/search?q=${encodeURIComponent(query)}&cursor=${cursor}&limit=${limit}`
  );
  return res;
}

export async function getOffenseById(id: string): Promise<Offense> {
  const res = await fetchJSON<any>(`/offenses/${id}`);
  return extractData<Offense>(res);
}

export async function getOffensesByCategory(category: string): Promise<Offense[]> {
  const res = await fetchJSON<any>(`/offenses?category=${encodeURIComponent(category)}`);
  return extractData<Offense[]>(res);
}

export async function getCategories(): Promise<OffenseCategory[]> {
  const res = await fetchJSON<any>("/offenses/categories");
  return extractData<OffenseCategory[]>(res);
}

export async function getStatus(): Promise<ApiStatus> {
  return fetchJSON<ApiStatus>("/status");
}

export async function submitReport(payload: ReportPayload): Promise<{ ok: boolean }> {
  return fetchJSON<{ ok: boolean }>("/reports", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
