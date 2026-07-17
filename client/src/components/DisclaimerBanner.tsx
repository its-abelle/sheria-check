import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";

export function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem("disclaimer_dismissed") === "true"
  );

  if (dismissed) return null;

  function handleDismiss() {
    sessionStorage.setItem("disclaimer_dismissed", "true");
    setDismissed(true);
  }

  return (
    <div className="bg-caution-50 border-b border-caution-200 px-4 py-3">
      <div className="mx-auto flex max-w-3xl items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-caution-500" />
        <p className="text-xs text-caution-700 flex-1">
          This tool is for informational purposes only. Laws may change. Always verify with a
          qualified legal professional or the relevant court. Do not pay any fine on the spot
          without verifying.
        </p>
        <button
          onClick={handleDismiss}
          className="shrink-0 rounded p-1 text-caution-500 hover:bg-caution-100 transition-colors"
          aria-label="Dismiss disclaimer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
