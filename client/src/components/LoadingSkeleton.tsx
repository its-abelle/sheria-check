interface LoadingSkeletonProps {
  count?: number;
  height?: string;
  className?: string;
}

export function LoadingSkeleton({ count = 3, height = "h-24", className = "" }: LoadingSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`} role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse rounded-xl bg-gray-100 ${height}`}
        >
          <div className="flex h-full items-center gap-4 p-4">
            <div className="h-10 w-10 rounded-lg bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-3 w-1/2 rounded bg-gray-200" />
            </div>
            <div className="h-8 w-20 rounded-lg bg-gray-200" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading content...</span>
    </div>
  );
}

export function SearchSkeleton() {
  return <LoadingSkeleton count={5} height="h-24" />;
}

export function CategorySkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2" role="status" aria-label="Loading categories">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-gray-100 bg-white p-4"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-3 w-1/2 rounded bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
      <span className="sr-only">Loading categories...</span>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6" role="status" aria-label="Loading offense details">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-20 rounded bg-gray-200" />
        <div className="h-8 w-3/4 rounded bg-gray-200" />
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-20 rounded-lg bg-gray-100" />
          <div className="h-20 rounded-lg bg-gray-100" />
        </div>
        <div className="h-32 rounded-lg bg-gray-100" />
      </div>
      <span className="sr-only">Loading offense details...</span>
    </div>
  );
}
