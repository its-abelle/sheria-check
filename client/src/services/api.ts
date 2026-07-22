import type { Offense, OffenseCategory, ReportPayload, ApiStatus } from "../types";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000/api/v1";

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

export async function searchOffenses(
  query: string,
  cursor?: string,
  limit = 20
): Promise<{ data: Offense[]; nextCursor: string | null; total: number }> {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  if (cursor) params.set("cursor", cursor);
  const res = await fetchJSON<unknown>(`/offenses/search?${params}`);
  if (hasDataField<{ items: Offense[]; nextCursor: string | null; total: number }>(res)) {
    return {
      data: res.data.items,
      nextCursor: res.data.nextCursor,
      total: res.data.total,
    };
  }
  return { data: [], nextCursor: null, total: 0 };
}

export async function getCategories(): Promise<OffenseCategory[]> {
  const res = await fetchJSON<unknown>("/offenses/categories");
  if (hasDataField<OffenseCategory[]>(res)) return res.data;
  if (Array.isArray(res)) return res as OffenseCategory[];
  return [];
}

export async function getOffensesByCategory(category: string): Promise<Offense[]> {
  const res = await fetchJSON<unknown>(`/offenses?category=${encodeURIComponent(category)}`);
  if (hasDataField<Offense[]>(res)) return res.data;
  if (Array.isArray(res)) return res as Offense[];
  return [];
}

export async function getOffenseById(id: string): Promise<Offense | null> {
  if (!id) return null;
  try {
    const res = await fetchJSON<unknown>(`/offenses/${encodeURIComponent(id)}`);
    if (hasDataField<Offense>(res)) return res.data;
    if (typeof res === "object" && res !== null && "id" in res) return res as Offense;
    return null;
  } catch {
    return null;
  }
}

export async function submitReport(payload: ReportPayload): Promise<boolean> {
  const res = await fetchJSON<{ ok?: boolean; error?: string }>("/reports", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (res.ok === true) return true;
  throw new Error(res.error || "Report submission failed");
}

export async function getStatus(): Promise<ApiStatus | null> {
  try {
    const res = await fetchJSON<unknown>("/status");
    if (hasDataField<ApiStatus>(res)) return res.data;
    if (typeof res === "object" && res !== null && "data_version" in res) return res as ApiStatus;
    return null;
  } catch {
    return null;
  }
}
