import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

export function OfflineNotice() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    function handleOnline() { setOffline(false); }
    function handleOffline() { setOffline(true); }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      className="sticky top-14 z-30 flex items-center justify-center gap-2 bg-caution-500 px-4 py-2 text-sm font-medium text-white"
      role="alert"
    >
      <WifiOff className="h-4 w-4" aria-hidden="true" />
      <span>You are offline. Some features may be unavailable.</span>
    </div>
  );
}
