import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useOffensesByCategory } from "../hooks/useOffenses";
import { OffenseCard } from "../components/OffenseCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { DEFAULT_CATEGORIES } from "../data/categories";

export function CategoryBrowse() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { offenses, loading, error } = useOffensesByCategory(categoryId || "");
  const category = DEFAULT_CATEGORIES.find((c) => c.id === categoryId);

  if (!category) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-gray-500">Category not found.</p>
        <Link to="/" className="mt-2 inline-block text-sm text-primary-500 hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-500"
      >
        <ArrowLeft className="h-4 w-4" /> Back to all categories
      </Link>

      <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
      <p className="mt-1 text-gray-500">{category.description}</p>

      {loading && <LoadingSpinner />}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {!loading && !error && (
        <div className="mt-6 space-y-3">
          {offenses.length === 0 && (
            <p className="text-sm text-gray-400">
              No offenses in this category yet. Data is being compiled.
            </p>
          )}
          {offenses.map((offense) => (
            <OffenseCard key={offense.id} offense={offense} />
          ))}
        </div>
      )}
    </div>
  );
}
