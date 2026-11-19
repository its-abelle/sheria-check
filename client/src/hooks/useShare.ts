import { useCallback, useEffect, useRef, useState } from "react";
import { Share, Platform } from "react-native";
interface SharePayload {
  title: string;
  message: string;
  url?: string;
}
interface ShareState {
  message: string | null;
  share: (payload: SharePayload) => Promise<void>;
}
/** Native share sheet, browser sharing, and a real clipboard fallback. */
export function useShare(): ShareState {
  const [message, setMessage] = useState<string | null>(null);
  const mounted = useRef(true);
  useEffect((): (() => void) => {
    mounted.current = true;
    return (): void => {
      mounted.current = false;
    };
  }, []);
  const share = useCallback(async (payload: SharePayload): Promise<void> => {
    const text = `${payload.message}${payload.url ? `\n\n${payload.url}` : ""}`;
    try {
      if (Platform.OS === "web") {
        if (typeof navigator !== "undefined" && navigator.share)
          await navigator.share({ title: payload.title, text });
        else if (
          typeof navigator !== "undefined" &&
          navigator.clipboard?.writeText
        ) {
          await navigator.clipboard.writeText(text);
          if (mounted.current) setMessage("Reference copied to clipboard.");
        } else if (mounted.current)
          setMessage(
            "Sharing is unavailable in this browser. Use the official source link.",
          );
      } else {
        await Share.share({ title: payload.title, message: text });
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      if (mounted.current)
        setMessage("Unable to share. Please use the official source link.");
    }
  }, []);
  return { share, message };
}
