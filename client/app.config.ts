import type { ConfigContext, ExpoConfig } from "expo/config";
export default function appConfig({ config }: ConfigContext): ExpoConfig {
  if (
    process.env.EAS_BUILD_PROFILE === "production" ||
    process.env.EAS_BUILD_PROFILE === "preview"
  ) {
    const api = process.env.EXPO_PUBLIC_API_URL;
    let valid = false;
    try {
      const parsed = new URL(api || "");
      valid =
        parsed.protocol === "https:" &&
        !parsed.username &&
        !parsed.password &&
        !parsed.hash;
    } catch {
      valid = false;
    }
    if (!valid)
      throw new Error(
        "Mobile release builds require EXPO_PUBLIC_API_URL pointing to the production HTTPS API",
      );
  }
  return {
    ...config,
    name: config.name || "Sheria Check",
    slug: config.slug || "sheria-check",
  };
}
