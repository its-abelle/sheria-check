import Fuse, { type IFuseOptions } from "fuse.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Offense, OffenseCategory } from "../types";
import * as api from "../services/api";
import { DEFAULT_CATEGORIES } from "../data/categories";

const STORAGE_KEY = "offenses_cache";
const DATA_VERSION_KEY = "offenses_data_version";

const FUSE_OPTIONS: IFuseOptions<Offense> = {
  keys: [
    { name: "name", weight: 0.4 },
    { name: "aliases", weight: 0.25 },
    { name: "act", weight: 0.15 },
    { name: "section", weight: 0.1 },
    { name: "category", weight: 0.1 },
  ],
  threshold: 0.3,
  distance: 100,
  ignoreLocation: true,
  includeScore: true,
};

class OffenseRepository {
  private fuseInstance: Fuse<Offense> | null = null;
  private currentData: Offense[] = [];
  private hydrated = false;

  /**
   * Load offenses from AsyncStorage cache, falling back to the bundled snapshot
   * when the cache key is missing or its JSON is malformed.
   * A valid cached empty array is used as-is and does NOT trigger a fallback.
   */
  async hydrate(): Promise<void> {
    if (this.hydrated) return;
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEY);
      if (cached) {
        this.currentData = JSON.parse(cached) as Offense[];
        this.buildIndex(this.currentData);
        this.hydrated = true;
        return;
      }
    } catch {
      // Fall through to bundled snapshot
    }

    // No valid cache — load bundled snapshot
    try {
      const snapshot = require("../../../assets/offenses.json") as Offense[];
      this.currentData = snapshot;
      this.buildIndex(snapshot);
    } catch {
      this.currentData = [];
    }
    this.hydrated = true;
  }

  private buildIndex(data: Offense[]): void {
    this.fuseInstance = new Fuse(data, FUSE_OPTIONS);
  }

  private ensureIndex(): void {
    if (!this.fuseInstance) {
      this.buildIndex(this.currentData);
    }
  }

  /** Perform a fuzzy search across all loaded offenses using fuse.js. */
  search(query: string): Offense[] {
    this.ensureIndex();
    if (!query.trim()) return this.currentData;
    if (!this.fuseInstance) return [];
    const results = this.fuseInstance.search(query);
    return results.map((r) => r.item);
  }

  /** Return every loaded offense without filtering. */
  getAll(): Offense[] {
    return this.currentData;
  }

  /** Find a single offense by its unique ID. */
  getById(id: string): Offense | undefined {
    return this.currentData.find((o) => o.id === id);
  }

  /** Return all offenses matching the given category slug. */
  getByCategory(categoryId: string): Offense[] {
    return this.currentData.filter((o) => o.category === categoryId);
  }

  /** Compute category counts from loaded offenses, returning only categories with at least one offense. */
  getCategories(): OffenseCategory[] {
    const counts = new Map<string, number>();
    for (const o of this.currentData) {
      counts.set(o.category, (counts.get(o.category) || 0) + 1);
    }
    return DEFAULT_CATEGORIES.map((c) => ({
      ...c,
      count: counts.get(c.id) || 0,
    })).filter((c) => c.count > 0);
  }

  /** Fetch the latest offenses from the API if the data version has changed, then cache them in AsyncStorage. */
  async refreshFromServer(): Promise<boolean> {
    try {
      const status = await api.getStatus();
      if (!status) return false;

      const cachedVersion = await AsyncStorage.getItem(DATA_VERSION_KEY);
      if (cachedVersion === status.data_version) return false;

      const all: Offense[] = [];
      let cursor: string | undefined;
      do {
        const result = await api.searchOffenses("*", cursor, 100);
        if (result.data.length === 0 && !cursor) {
          while (true) {
            const batch = await api.searchOffenses("", cursor, 100);
            if (batch.data.length === 0) break;
            all.push(...batch.data);
            if (batch.nextCursor === null) break;
            cursor = batch.nextCursor;
          }
          break;
        }
        all.push(...result.data);
        cursor = result.nextCursor ?? undefined;
      } while (cursor);

      if (all.length > 0) {
        this.currentData = all;
        this.buildIndex(all);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        await AsyncStorage.setItem(DATA_VERSION_KEY, status.data_version);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}

export const offenseRepository = new OffenseRepository();
