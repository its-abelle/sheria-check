import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-7xl font-bold text-gray-200">404</h1>
      <p className="mt-4 text-gray-500">Page not found</p>
      <p className="mt-1 text-sm text-gray-400">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
      >
        <Home className="h-4 w-4" aria-hidden="true" /> Go Home
      </Link>
    </div>
  );
}
