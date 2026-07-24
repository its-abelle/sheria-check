import { Request, Response } from "express";
import { z } from "zod";
import { query } from "../db/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const offenseSchema = z.object({
  id: z.string().min(1).max(50),
  name: z.string().min(1).max(300),
  aliases: z.array(z.string()).default([]),
  description: z.string().min(1).max(1000),
  category: z.string().min(1),
  severity: z.enum(["minor", "serious", "felony"]),
  citation: z.string().min(1),
  act: z.string().min(1),
  section: z.string().min(1),
  min_fine: z.number().int().min(0),
  max_fine: z.number().int().min(0),
  max_imprisonment: z.string().nullable().default(null),
  course_of_action: z.string().min(1),
  law_version: z.string().default("2024"),
});

/** Upsert a single offense record (admin-only endpoint, requires Bearer auth). */
export const createOffense = asyncHandler(async (req: Request, res: Response) => {
  const parsed = offenseSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid offense data", details: parsed.error.flatten() });
    return;
  }

  const o = parsed.data;
  await query(
    `INSERT INTO offenses (id, name, aliases, description, category, severity, citation, act, section, min_fine, max_fine, max_imprisonment, course_of_action, law_version)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     ON CONFLICT (id) DO UPDATE SET
       name = EXCLUDED.name,
       aliases = EXCLUDED.aliases,
       description = EXCLUDED.description,
       category = EXCLUDED.category,
       severity = EXCLUDED.severity,
       citation = EXCLUDED.citation,
       act = EXCLUDED.act,
       section = EXCLUDED.section,
       min_fine = EXCLUDED.min_fine,
       max_fine = EXCLUDED.max_fine,
       max_imprisonment = EXCLUDED.max_imprisonment,
       course_of_action = EXCLUDED.course_of_action,
       law_version = EXCLUDED.law_version,
       updated_at = NOW()`,
    [o.id, o.name, o.aliases, o.description, o.category, o.severity, o.citation, o.act, o.section, o.min_fine, o.max_fine, o.max_imprisonment, o.course_of_action, o.law_version]
  );

  await updateStatusCount();
  res.status(201).json({ ok: true });
});

/** Delete an offense by its ID and update the status count (admin-only endpoint). */
export const deleteOffense = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await query("DELETE FROM offenses WHERE id = $1", [id]);
  await updateStatusCount();
  res.json({ ok: true });
});

async function updateStatusCount() {
  const { rows } = await query("SELECT COUNT(*)::int AS count FROM offenses");
  await query("UPDATE status SET total_offenses = $1, last_updated = NOW() WHERE id = 1", [rows[0].count]);
}

/** Upsert an array of offenses in bulk, then update the status count (admin-only endpoint). */
export const bulkUpload = asyncHandler(async (req: Request, res: Response) => {
  const offenses = z.array(offenseSchema).safeParse(req.body);
  if (!offenses.success) {
    res.status(400).json({ error: "Invalid offenses array", details: offenses.error.flatten() });
    return;
  }

  for (const o of offenses.data) {
    await query(
      `INSERT INTO offenses (id, name, aliases, description, category, severity, citation, act, section, min_fine, max_fine, max_imprisonment, course_of_action, law_version)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name, aliases = EXCLUDED.aliases, description = EXCLUDED.description,
         category = EXCLUDED.category, severity = EXCLUDED.severity, citation = EXCLUDED.citation,
         act = EXCLUDED.act, section = EXCLUDED.section, min_fine = EXCLUDED.min_fine,
         max_fine = EXCLUDED.max_fine, max_imprisonment = EXCLUDED.max_imprisonment,
         course_of_action = EXCLUDED.course_of_action, law_version = EXCLUDED.law_version,
         updated_at = NOW()`,
      [o.id, o.name, o.aliases, o.description, o.category, o.severity, o.citation, o.act, o.section, o.min_fine, o.max_fine, o.max_imprisonment, o.course_of_action, o.law_version]
    );
  }

  await updateStatusCount();
  res.json({ ok: true, count: offenses.data.length });
});
