import { useState } from "react";
import { SearchBar } from "../components/SearchBar";
import { CategoryCard } from "../components/CategoryCard";
import { DisclaimerBanner } from "../components/DisclaimerBanner";
import { BalanceScale } from "../components/BalanceScale";
import { useSearch } from "../hooks/useSearch";
import { useCategories } from "../hooks/useOffenses";
import { useApiStatus } from "../hooks/useOffenses";
import { SearchSkeleton, CategorySkeleton } from "../components/LoadingSkeleton";
import { OffenseCard } from "../components/OffenseCard";
import { EmptyState } from "../components/EmptyState";

export function Home() {
  const { query, setQuery, results, loading, error, hasMore, total, loadMore } = useSearch();
  const { categories, loading: catLoading } = useCategories();
  const status = useApiStatus();
  const [showResults, setShowResults] = useState(false);

  function handleSearch(value: string) {
    setQuery(value);
    if (value.trim()) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }

  return (
    <div>
      <DisclaimerBanner />

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary-500 to-primary-700 px-4 py-10 sm:py-16 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 flex justify-center">
            <BalanceScale className="h-16 w-16 sm:h-24 sm:w-24" />
          </div>
          <h1 className="text-2xl font-bold sm:text-4xl">Know Your Fine. Stand Your Ground.</h1>
          <p className="mt-3 text-sm sm:text-base text-primary-100">
            Look up traffic offense fines under Kenyan law. Don't let anyone overcharge you.
          </p>
          <div className="mt-8">
            <SearchBar value={query} onChange={handleSearch} />
          </div>
        </div>
      </section>

      {/* Search Results */}
      {showResults && (
        <section className="border-b bg-white px-4 py-6" aria-label="Search results">
          <div className="mx-auto max-w-3xl">
            {loading && results.length === 0 && <SearchSkeleton />}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600" role="alert">
                {error}
              </div>
            )}
            {!loading && !error && results.length === 0 && query.trim() && (
              <EmptyState variant="no-results" query={query} />
            )}
            {!loading && !error && results.length > 0 && (
              <div>
                <p className="text-sm text-gray-500" aria-live="polite">
                  {total} offense{total !== 1 ? "s" : ""} found
                </p>
                <div className="mt-3 space-y-3">
                  {results.map((offense) => (
                    <OffenseCard key={offense.id} offense={offense} />
                  ))}
                </div>
                {hasMore && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className="w-full sm:w-auto rounded-lg border border-gray-200 px-6 py-2.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {loading ? "Loading..." : `Load more (${results.length} of ${total})`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="px-4 py-10" aria-label="Browse by category">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl font-semibold text-gray-900">Browse by Category</h2>
          <p className="mt-1 text-sm text-gray-500">
            Not sure what to search? Pick a category to see all related offenses
          </p>

          {catLoading ? (
            <CategorySkeleton />
          ) : (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {categories.length === 0 && (
                <p className="col-span-2 text-sm text-gray-400">
                  No categories available yet. Data is being compiled.
                </p>
              )}
              {categories.map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Data freshness */}
      {status && (
        <section className="border-t bg-gray-50 px-4 py-4" aria-label="Data information">
          <div className="mx-auto max-w-3xl text-center text-xs text-gray-400">
            <p>
              Data version: {status.data_version} &middot; Last updated:{" "}
              {new Date(status.last_updated).toLocaleDateString("en-KE")} &middot;{" "}
              {status.total_offenses} offenses indexed
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
