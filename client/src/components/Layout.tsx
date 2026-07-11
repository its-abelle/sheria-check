import { Link, Outlet, useLocation } from "react-router-dom";
import { Scale } from "lucide-react";
import { cn } from "../utils/cn";
import { SkipToContent } from "./SkipToContent";
import { OfflineNotice } from "./OfflineNotice";

export function Layout() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col">
      <SkipToContent />
      <header
        className={cn(
          "sticky top-0 z-40 border-b bg-white/80 backdrop-blur",
          !isHome && "shadow-sm"
        )}
      >
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold text-primary-500">
            <Scale className="h-5 w-5" aria-hidden="true" />
            <span className="text-lg">Sheria Check</span>
          </Link>
          <nav className="ml-auto flex items-center gap-4 text-sm text-gray-500" aria-label="Main navigation">
            <Link to="/" className="hover:text-primary-500 transition-colors">
              Home
            </Link>
            <Link to="/disclaimer" className="hover:text-primary-500 transition-colors">
              Disclaimer
            </Link>
          </nav>
        </div>
      </header>

      <OfflineNotice />

      <main id="main-content" className="flex-1" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="border-t bg-white py-6 text-center text-xs text-gray-400">
        <div className="mx-auto max-w-3xl px-4">
          <p>
            Sheria Check is an informational tool based on publicly available legal texts.
            It does not constitute legal advice.
          </p>
          <p className="mt-1">
            &copy; {new Date().getFullYear()} Sheria Check. Data sourced from Traffic Act Cap 403.
          </p>
        </div>
      </footer>
    </div>
  );
}
