import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

export function PageTransitionBar() {
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const handleLoad = useCallback(() => {
    setLoading(true);
    const id = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    handleLoad();
  }, [location.pathname, handleLoad]);

  if (!loading) return null;

  return (
    <div
      className="fixed top-0 left-0 z-50 h-0.5 bg-primary-400 transition-all duration-300"
      style={{ width: loading ? "90%" : "0%" }}
      role="progressbar"
      aria-label="Page loading"
    />
  );
}
