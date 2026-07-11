import { useCallback } from "react";

interface SharePayload {
  title: string;
  text: string;
  url: string;
}

export function useShare() {
  const share = useCallback(async (payload: SharePayload) => {
    if (!navigator.share) {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`${payload.title}\n${payload.text}\n${payload.url}`);
        return "copied";
      } catch {
        return null;
      }
    }

    try {
      await navigator.share(payload);
      return "shared";
    } catch (err: any) {
      if (err.name === "AbortError") return null; // User cancelled
      return null;
    }
  }, []);

  const canShare = typeof navigator !== "undefined" && !!navigator.share;
  const canCopy = typeof navigator !== "undefined" && !!navigator.clipboard;

  return { share, canShare, canCopy };
}
