import { z } from "zod";

const schema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z
    .string()
    .url()
    .refine(
      (value: string): boolean => /^postgres(?:ql)?:/.test(value),
      "Use a PostgreSQL connection URL",
    )
    .default("postgres://sheria:sheria_dev@localhost:5432/sheria_check"),
  PG_POOL_SIZE: z.coerce.number().int().min(1).max(100).default(20),
  ADMIN_PASSWORD: z.string().min(1).default("admin123"),
  CORS_ORIGIN: z.string().default("*"),
  TRUST_PROXY: z.coerce.number().int().min(0).max(5).default(0),
});
export const config = schema.parse(process.env);
if (config.NODE_ENV === "production") {
  if (new URL(config.DATABASE_URL).pathname.endsWith("_demo")) {
    throw new Error("Production cannot use a fictional demo database");
  }
  if (
    !process.env.DATABASE_URL ||
    config.ADMIN_PASSWORD === "admin123" ||
    config.ADMIN_PASSWORD.length < 24
  ) {
    throw new Error(
      "Production requires DATABASE_URL and ADMIN_PASSWORD of at least 24 characters",
    );
  }
  if (
    config.CORS_ORIGIN === "*" ||
    !config.CORS_ORIGIN.split(",").every((origin: string): boolean => {
      try {
        const parsed = new URL(origin.trim());
        return parsed.protocol === "https:" && parsed.origin === origin.trim();
      } catch {
        return false;
      }
    })
  ) {
    throw new Error("Production requires explicit HTTPS CORS origins");
  }
}
