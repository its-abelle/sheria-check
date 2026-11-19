import { z } from "zod";
const id = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9][a-z0-9._-]*$/);
const text = z.string().trim().min(1);
export const officialUrl = z
  .string()
  .url()
  .refine((value: string): boolean => {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port &&
      [
        "new.kenyalaw.org",
        "kenyalaw.org",
        "www.kenyalaw.org",
        "judiciary.go.ke",
        "www.judiciary.go.ke",
      ].includes(url.hostname)
    );
  }, "Use an HTTPS Kenya Law or Judiciary source URL");
const verifiedAt = z
  .string()
  .datetime()
  .refine(
    (value: string): boolean => Date.parse(value) <= Date.now(),
    "Verification date cannot be in the future",
  )
  .nullable()
  .default(null);
export const instrumentSchema = z
  .object({
    id,
    title: text.max(300),
    source_url: officialUrl,
    version: text.max(100),
    retrieved_at: z.string().datetime(),
    verified_at: verifiedAt,
    rights_basis: z.string().trim().max(2000).default(""),
  })
  .strict();
export const provisionSchema = z
  .object({
    id,
    instrument_id: id,
    number: text.max(100),
    position: z.number().int().min(0).default(0),
    heading: text.max(500),
    text: text.max(200000),
    topics: z
      .array(z.enum(["arrest", "detention", "bail", "fair-trial", "legal-aid"]))
      .default([]),
    source_url: officialUrl,
    verified_at: verifiedAt,
  })
  .strict();
export const offenseSchema = z
  .object({
    id,
    name: text.max(300),
    aliases: z.array(text.max(100)).max(50).default([]),
    category: id.max(80),
    defining_provision_id: id,
    penalty_provision_id: id,
    verified_at: verifiedAt,
  })
  .strict();
export const judgmentSchema = z
  .object({
    id,
    citation: text.max(500),
    court: text.max(200),
    decision_date: z.string().date(),
    source_url: officialUrl,
    verified_at: verifiedAt,
  })
  .strict();
export const bundleSchema = z
  .object({
    instruments: z.array(instrumentSchema).max(50).default([]),
    provisions: z.array(provisionSchema).max(2000).default([]),
    offenses: z.array(offenseSchema).max(500).default([]),
    judgments: z.array(judgmentSchema).max(500).default([]),
    links: z
      .array(z.object({ offense_id: id, judgment_id: id }).strict())
      .max(1000)
      .default([]),
  })
  .strict();
export type ContentBundle = z.infer<typeof bundleSchema>;
export const contentKind = z.enum([
  "instruments",
  "provisions",
  "offenses",
  "judgments",
]);
export const contentTables: Record<z.infer<typeof contentKind>, string> = {
  instruments: "legal_instruments",
  provisions: "legal_provisions",
  offenses: "offenses",
  judgments: "judgment_references",
};
