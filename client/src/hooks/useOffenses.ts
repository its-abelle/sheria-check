import { useResource, type Resource } from "./useResource";
import type { OffenseCategory, ApiStatus, Offense } from "../types";
export function useCategories(): Resource<OffenseCategory[]> & {
  categories: OffenseCategory[];
} {
  const resource = useResource<OffenseCategory[]>("/offenses/categories");
  return { ...resource, categories: resource.data ?? [] };
}
export function useOffensesByCategory(
  categoryId: string,
): Resource<Offense[]> & { offenses: Offense[] } {
  const resource = useResource<Offense[]>(
    `/offenses?category=${encodeURIComponent(categoryId)}`,
  );
  return { ...resource, offenses: resource.data ?? [] };
}
export function useOffenseDetail(
  id: string,
): Resource<Offense> & { offense: Offense | undefined } {
  const resource = useResource<Offense>(`/offenses/${encodeURIComponent(id)}`);
  return { ...resource, offense: resource.data };
}
export function useApiStatus(): ApiStatus | null {
  return useResource<ApiStatus>("/status").data ?? null;
}
