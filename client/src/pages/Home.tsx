import { useState } from "react";
import { Scale } from "lucide-react";
import { SearchBar } from "../components/SearchBar";
import { CategoryCard } from "../components/CategoryCard";
import { DisclaimerBanner } from "../components/DisclaimerBanner";
import { useSearch } from "../hooks/useSearch";
import { useCategories } from "../hooks/useOffenses";
import { useApiStatus } from "../hooks/useOffenses";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { OffenseCard } from "../components/OffenseCard";

export function Home() {
  const { query, setQuery, results, loading, error } = useSearch();
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
      <section className="bg-gradient-to-b from-primary-500 to-primary-700 px-4 py-16 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 flex justify-center">
            <Scale className="h-12 w-12" />
          </div>
          <h1 className="text-3xl font-bold sm:text-4xl">Know Your Fine. Stand Your Ground.</h1>
          <p className="mt-3 text-primary-100">
            Look up traffic offense fines under Kenyan law. Don't let anyone overcharge you.
          </p>
          <div className="mt-8">
            <SearchBar value={query} onChange={handleSearch} />
          </div>
        </div>
      </section>

      {/* Search Results */}
      {showResults && (
        <section className="border-b bg-white px-4 py-6">
          <div className="mx-auto max-w-3xl">
            {loading && <LoadingSpinner text="Searching offenses..." />}
            {error && <p className="text-sm text-red-500">{error}</p>}
            {!loading && !error && results.length === 0 && query.trim() && (
              <p className="text-center text-sm text-gray-400">
                No offenses found for "{query}". Try a different search term.
              </p>
            )}
            {!loading && !error && results.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">
                  {results.length} offense{results.length !== 1 ? "s" : ""} found
                </p>
                {results.map((offense) => (
                  <OffenseCard key={offense.id} offense={offense} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl font-semibold text-gray-900">Browse by Category</h2>
          <p className="mt-1 text-sm text-gray-500">
            Select a category to see all related offenses
          </p>

          {catLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {categories.map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Data freshness */}
      {status && (
        <section className="border-t bg-gray-50 px-4 py-4">
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
