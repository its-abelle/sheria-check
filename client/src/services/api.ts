import { Platform } from "react-native";
import type {
  Offense,
  OffenseCategory,
  ApiStatus,
  ApiResponse,
} from "../types";

const configured = process.env.EXPO_PUBLIC_API_URL;
const BASE_URL =
  configured ||
  (Platform.OS === "web" ? "/api/v1" : "http://localhost:4000/api/v1");
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
/** Abort on unmount and after 15 seconds. Never persist queries or responses. */
export async function fetchJSON<T>(
  path: string,
  signal?: AbortSignal,
): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const abort = (): void => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener("abort", abort);
  const timeout = setTimeout(abort, 15000);
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      signal: controller.signal,
      credentials: "omit",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok)
      throw new ApiError(
        response.status === 404
          ? "This published record could not be found."
          : response.status === 400
            ? "Check your search terms and try again."
            : response.status === 429
              ? "Too many requests. Please wait a minute and try again."
              : "The service is temporarily unavailable. Please try again.",
        response.status,
      );
    const body: unknown = await response.json();
    if (!body || typeof body !== "object" || !("data" in body))
      throw new ApiError("The service returned an unexpected response.", 502);
    return body as ApiResponse<T>;
  } catch (error) {
    if (signal?.aborted) throw error;
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      "Unable to connect. Check your internet connection and try again.",
      0,
    );
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
  }
}
export async function searchOffenses(
  query: string,
  cursor?: string,
  limit = 20,
  signal?: AbortSignal,
): Promise<{ data: Offense[]; nextCursor: string | null; total: number }> {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  if (cursor) params.set("cursor", cursor);
  const result = await fetchJSON<Offense[]>(
    `/offenses/search?${params}`,
    signal,
  );
  if (!Array.isArray(result.data) || !result.pagination)
    throw new ApiError("The service returned an unexpected response.", 502);
  return {
    data: result.data,
    nextCursor: result.pagination.has_more
      ? String(result.pagination.cursor)
      : null,
    total: result.pagination.total ?? 0,
  };
}
export async function getCategories(
  signal?: AbortSignal,
): Promise<OffenseCategory[]> {
  return (await fetchJSON<OffenseCategory[]>("/offenses/categories", signal))
    .data;
}
export async function getOffensesByCategory(
  category: string,
  signal?: AbortSignal,
): Promise<Offense[]> {
  return (
    await fetchJSON<Offense[]>(
      `/offenses?category=${encodeURIComponent(category)}`,
      signal,
    )
  ).data;
}
export async function getOffenseById(
  id: string,
  signal?: AbortSignal,
): Promise<Offense> {
  return (
    await fetchJSON<Offense>(`/offenses/${encodeURIComponent(id)}`, signal)
  ).data;
}
export async function getStatus(signal?: AbortSignal): Promise<ApiStatus> {
  return (await fetchJSON<ApiStatus>("/status", signal)).data;
}
