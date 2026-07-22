import { useCallback } from "react";
import { Share, Platform } from "react-native";

interface SharePayload {
  title: string;
  message: string;
  url?: string;
}

export function useShare() {
  const share = useCallback(async (payload: SharePayload): Promise<"shared" | "copied" | null> => {
    try {
      const result = await Share.share({
        title: payload.title,
        message: payload.url
          ? `${payload.message}\n\n${payload.url}`
          : payload.message,
        ...(Platform.OS === "ios" ? { url: payload.url } : {}),
      });

      if (result.action === Share.sharedAction) {
        return "shared";
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  return { share, canShare: true };
}
